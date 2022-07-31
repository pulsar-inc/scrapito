import { Template, Pipeline, PipeOrPointer, PipeIdentifier, WorkerResult } from '../types';
import { PoolEvent } from 'threads/dist/master/pool';
import { spawn, Pool, Worker } from 'threads';
import { EventEmitter } from 'events';
import set from 'lodash.set';
import get from 'lodash.get';

function isPipeline(ukn: PipeOrPointer): ukn is Pipeline {
  return (<Pipeline>ukn).name !== undefined;
}

export class ScrapitoEngine {
  protected resolve: any;
  protected pool: Pool<any>;
  protected running: number[] = [];

  readonly template!: Template;
  readonly store = new Map<string | number, unknown>();
  readonly results = new Map<string | number, unknown>();
  readonly mappings = new Map<string, string>();
  readonly waitList = new Map<string | number, Pipeline[]>();
  readonly notifier = new EventEmitter();

  constructor(template: Template) {
    this.template = template;
    this.setSubFields(template.pipelines);

    // Spawn workers
    if (template?.renderJS && process.env.IS_NODE_ENV) {
      this.pool = Pool(
        () =>
          spawn(
            new Worker(process.env.__puppeteerWorker__ || './workers/puppeteer.js', {
              type: 'module',
            })
          ),
        this.template.maxThreads
      );
    } else {
      this.pool = Pool(
        () =>
          spawn(
            new Worker(process.env.__axiosWorker__ || './workers/axios.js', { type: 'module' })
          ),
        this.template.maxThreads
      );
    }
  }

  /**
   * Set parent property to all childs of the given pipelines
   * @param pipelines
   * @param parent value to set in childs parent property
   * @returns same pipeline array as input
   */
  private setSubFields(pipelines: PipeOrPointer[], parent?: PipeIdentifier): unknown {
    return pipelines.map((pipe: PipeOrPointer) => {
      if (isPipeline(pipe)) {
        if (pipe.attribute && pipe.next)
          throw Error('Pipeline "' + pipe.name + '" cannot have `next` AND `attribute` property.');
        if (parent) pipe.parent = parent;
        if (pipe.timeout === undefined) pipe.timeout = this.template.timeout;
        if (pipe.next) return this.setSubFields(pipe.next, `pipe::${pipe.name}`);
        // If field is a mapping on url, set map element as waiter
        if (typeof pipe.url === 'string' && pipe.url?.startsWith('map@')) {
          if (pipe.wait) pipe.wait.push(`pipe::${pipe.url.slice(4)}`);
          else pipe.wait = [`pipe::${pipe.url.slice(4)}`];
        }
      }
      return pipe;
    });
  }

  /**
   * Set or append to store.
   * @param key
   * @param value
   */
  protected setStore(key: string | number, value: unknown): void {
    const test = this.store.get(key);
    if (test instanceof Array) {
      this.store.set(key, test.concat(value));
    } else if (test) {
      this.store.set(key, [test, value]);
    } else {
      this.store.set(key, value);
    }
  }

  /**
   * Add the given pipeline in the wait list of each dependencies
   * @param pipe
   */
  private addToWaitList(pipe: Pipeline) {
    // List all dependencies of the pipeline
    const deps = ((pipe.wait as [string]) || []).concat(pipe.parent ? [pipe.parent as string] : []);
    // For each dependencies append the pipeline as dependent
    deps.map((dep) => {
      const items = (this.waitList.get(dep) || []).concat([pipe]);
      this.waitList.set(dep, items);
    });
  }

  /**
   * Remove given job from waitList and run free jobs
   * @param finishedPipeName
   */
  private updateWaitList(finishedPipeName: string) {
    // Get all jobs blocked by `finishedJob`
    const pendingJobs = this.waitList.get(`pipe::${finishedPipeName}`) || [];
    this.waitList.delete(`pipe::${finishedPipeName}`);
    const stillDependent = Array.from(this.waitList.values()).flat();

    // Exclude still dependant jobs and process the others
    const deps = pendingJobs.filter((v) => !stillDependent.includes(v));
    deps.forEach((dep) => this.processPipeline(dep));
  }

  /**
   * Push a new pipeline to the pool
   * Also push it's childs into the wait list
   * Use template values or default ones
   * @param pipe The pipeline to be processed
   * @returns The job created
   */
  private processPipeline(pipe: Pipeline): any {
    // Push each child to wait list
    pipe.next?.forEach((child: PipeOrPointer) => {
      if (child instanceof String) return;
      this.addToWaitList(child as Pipeline);
    });

    if (pipe.url instanceof Array) {
      return this.pushManyAndWait(
        pipe.url.map((url, idx) => ({ ...pipe, url, name: `${pipe.name}-${idx}` }))
      );
      // id: `${job.id}-${i}`
    } else if (pipe.url?.startsWith('map@')) {
      const urls = this.store.get(`pipe::${pipe.url.slice(4)}`) as string[];
      return this.pushManyAndWait(
        urls.map((url, idx) => ({ ...pipe, url, name: `${pipe.name}-${idx}`, wait: undefined }))
      );
    }

    return this.pool.queue((processing) => processing(pipe, this.store) as Promise<WorkerResult>);
  }

  /**
   * Push many jobs to worker processing and wait for them to finish or fail
   */
  protected async pushManyAndWait(pipes: Pipeline[]): Promise<WorkerResult[]> {
    const allJobs = pipes.map((pipe) => this.processPipeline(pipe));
    return Promise.all(allJobs);
  }

  /**
   * Push all pipelines into the rpocessing queue
   */
  private async initPipelines(): Promise<void> {
    this.template.pipelines.map((pipe) => {
      // If pipeline is dependant push into pending
      if (pipe.wait) {
        this.addToWaitList(pipe);
      } else {
        this.processPipeline(pipe);
      }
    });

    const events = this.pool.events();
    events.subscribe(this.eventHandler.bind(this), (err) => console.warn('ERROR ::', err));
  }

  /**
   * Event handle of the processing pool
   * @param event Pool event
   */
  private eventHandler(event: PoolEvent<any>) {
    const { returnValue } = event as { returnValue: WorkerResult };

    switch (event.type) {
      case 'taskCompleted':
        if (returnValue.pipe.parent) {
          const parentMapping = this.mappings.get(returnValue.pipe.parent);
          // In this case this is for every line of parrent (TODO: find better detection)
          if (returnValue.pipe.name.match(/.*-\d+$/)) {
            const id = /-(\d+)$/.exec(returnValue.pipe.name)?.[1];
            const name = /(.*)(?:-\d+)$/.exec(returnValue.pipe.name)?.[1];
            if (parentMapping) {
              this.mappings.set(
                `pipe::${returnValue.pipe.name}`,
                `${parentMapping}[${id}].${name}`
              );
            } else {
              const parentMappingId = this.mappings.get(`${returnValue.pipe.parent}[${id}]`);
              this.mappings.set(`pipe::${returnValue.pipe.name}`, `${parentMappingId}.${name}`);
            }
          } else {
            const value = returnValue.store.get(`pipe::${returnValue.pipe.name}`);
            if (value instanceof Array) {
              value.forEach((_, index) => {
                this.mappings.set(
                  `pipe::${returnValue.pipe.name}[${index}]`,
                  `${parentMapping}[${index}].${returnValue.pipe.name}`
                );
              });
            } else {
              this.mappings.set(
                `pipe::${returnValue.pipe.name}`,
                `${parentMapping}.${returnValue.pipe.name}`
              );
            }
          }
        } else {
          this.mappings.set(`pipe::${returnValue.pipe.name}`, returnValue.pipe.name);
        }

        // Set each values from the worker store to the main store
        Array.from(returnValue.store.entries()).map(([key, value]) => {
          this.store.set(key, value);
        });
        this.updateWaitList(returnValue.pipe.name);
        this.running = this.running.filter((x) => x !== event.taskID);
        console.info('INFO ::', returnValue.pipe.name, '✅');
        break;

      case 'taskQueued':
        this.running.push(event.taskID);
        break;

      case 'taskQueueDrained':
        // Tell main instance that work is done
        if (!this.waitList.size && !this.running.length) this.notifier.emit('done');
        break;

      case 'taskFailed':
        console.warn('ERROR ::', event.taskID, '::', event.error);
        break;
    }
  }

  public async startEngine(): Promise<Map<string | number, unknown>> {
    await this.initPipelines();

    console.info('INFO :: Pool is ready, processing started!');

    return new Promise((resolve, reject) => {
      this.notifier.on('done', async () => {
        const store = new Map(this.store);
        await this.cleanEngine();

        console.log(this.mappings);

        const storeObj = Object.fromEntries(store);
        const resultObj = new Object();

        Array.from(this.mappings.entries()).map(([valuePath, resultPath]) => {
          // CRITICAL: to fix !!!!!!!!!
          if (valuePath === 'pipe::get_200_best_models') return;
          const value = get(storeObj, valuePath);
          set(resultObj, resultPath, value);
        });

        console.log(JSON.stringify(resultObj));

        resolve(store);
      });

      this.notifier.on('error', async (error) => {
        await this.cleanEngine();
        reject(error);
      });
    });
  }

  /**
   * Reset the whole class to process a new batch
   */
  public async cleanEngine(): Promise<void> {
    this.store.clear();
    this.running = [];
    await this.pool.terminate(true);
  }
}
