import { Template, ValueOrPointer, Pipeline, PipeOrPointers } from '../types';
import { parse, HTMLElement } from 'node-html-parser';
import { valueIdentifierGuard } from './guards';
import * as Queue from 'bee-queue';
import axios from 'axios';

class SharedEngine {
  protected queue: Queue;
  protected resolve: any;
  readonly template!: Template;
  readonly store = new Map<string | number, any>();
  readonly pendingJobs = new Map<string | number, Pipeline[]>();

  constructor(template: Template) {
    this.setParents(template.pipelines);
    this.template = template;
    this.queue = new Queue('PeachEngine');
  }

  private setParents(pipelines: PipeOrPointers, parent?: string): any {
    return pipelines.map((pipe: any) => {
      if (parent && pipe.name) pipe.parent = parent;
      if (pipe.next) return this.setParents(pipe.next, `pipe::${pipe.name}`);
      return pipe;
    });
  }

  /**
   * resetEngine
   */
  public async resetEngine() {
    this.store.clear();
    await this.queue.destroy();
  }

  private pushToPending(data: Pipeline) {
    const deps = (data.waitFor as [string] || []).concat(data.parent ? [data.parent as string] : []);
    return deps.map(dep => {
      const items = (this.pendingJobs.get(dep) || []).concat([data]);
      this.pendingJobs.set(dep, items);
    });
  }

  /**
   * Push a new job in the queue
   * Also push it's childs into the pending queue
   * Use template values or default ones
   */
  private async pushJob(data: Pipeline) {
    // Pushing childs into pending queue
    data.next?.forEach((child: any) => {
      if (child instanceof String) return;
      this.pushToPending(child);
    });

    const job = this.queue.createJob(data);
    await job
      .setId(data.name)
      .timeout(this.template.timeout || 10000)
      .retries(this.template.maxRetries || 2)
      .save();
    return job;
  }

  private refreshQueue(finishedJob: Queue.Job<Pipeline>) {
    const pending = this.pendingJobs.get('pipe::' + finishedJob.data.name) || [];
    this.pendingJobs.delete('pipe::' + finishedJob.data.name);
    const allValues = Array.from(this.pendingJobs.values()).flat();

    // Exclude still dependant jobs
    const deps = pending.filter(v => !allValues.includes(v));
    deps.forEach(dep => this.pushJob(dep));

    // Processing is done
    if (!this.pendingJobs.size && !deps.length) {
      this.queue.checkHealth().then(h => {
        if (!h.active && !h.waiting && !h.delayed && !h.newestJob)
          this.queue.close(() => this.resolve(this.store));
      });
    }
  }

  /**
   * Push all pipes into the queue
   */
  async initPipelines() {
    this.template.pipelines.forEach(pipe => {
      // If pipeline is dependant push into pending
      if (pipe.waitFor) {
        this.pushToPending(pipe);
      } else {
        this.pushJob(pipe);
      }
    });

    // Once a job is finished we need to process its dependancies
    this.queue.on('succeeded', (j) => this.refreshQueue.bind(this)(j));
  }

  /**
   * Take ValueOrPointer
   * Check whether it's a pointer or string
   * Returns string based on what it is
   */
  dereferencer(identifier: ValueOrPointer): string {
    // TODO: handle this anywhere in a string
    if (valueIdentifierGuard(identifier).isOk()) {
      const [key, pipeName] = (identifier as string).split('@');
      const datas = this.store.get(`pipe::${pipeName}`);

      return datas[parseInt(key)];
    }

    return identifier as string;
  }
}

export class AxiosEngine extends SharedEngine {
  public async startEngine(): Promise<Map<string | number, unknown>> {
    await this.resetEngine();
    await this.initPipelines();

    return new Promise((resolve, reject) => {
      this.queue.ready().then(() => {
        console.info('Queue ready, staring processing!');
        this.queue.process(this.template.maxThreads || 1, this.processing.bind(this));
      });

      this.resolve = resolve;
      this.queue.on('error', reject);
    });
  }

  private async processing(job: Queue.Job<Pipeline>) {
    return this.requester(job.data)
      .then(this.selecter.bind(this))
      .then(this.getter.bind(this))
      .then(this.transformer.bind(this))
      .then(({ pipe, data }) => {
        this.store.set(`pipe::${pipe.name}`, data);
        return data.length;
      });
  }

  private async requester(pipe: Pipeline) {
    if (!pipe.url && pipe.parent) {
      return { pipe, data: this.store.get(pipe.parent) };
    } else if (!pipe.url) {
      throw new Error('No URL or parent!');
    }

    const url: string = this.dereferencer(pipe.url);
    const { data } = await axios.get(url);

    return { pipe, data: parse(data) };
  }

  private selecter({ pipe, data }: { pipe: Pipeline, data: HTMLElement | HTMLElement[] }) {
    const selector = this.dereferencer(pipe.selector);

    if (data instanceof Array) {
      return { pipe, data: data.map(x => x.querySelectorAll(selector)).flat() };
    }

    return { pipe, data: data.querySelectorAll(selector) };
  }

  private getter({ pipe, data }: { pipe: Pipeline, data: HTMLElement[] }) {
    if (!pipe.attribute)
      return { pipe, data };

    if (pipe.attribute === '$text')
      return { pipe, data: data.map(x => x.text) };

    return { pipe, data: data.map(x => x.getAttribute(pipe.attribute as string)) };
  }

  private transformer({ pipe, data }: { pipe: Pipeline, data: Array<unknown> }) {
    if (!pipe.transform)
      return { pipe, data };

    data = data.map(res => new Function('res', 'return ' + pipe.transform)(res));
    return { pipe, data };
  }
}

export class PupperEngine extends SharedEngine {
  /**
   * startEngine
   */
  public async startEngine(): Promise<Map<string | number, unknown>> {
    await this.resetEngine();
    await this.initPipelines();
    this.queue.process(this.template.maxThreads || 10, this.processing);
    return this.store;
  }

  private async processing() {
    return new Promise((c, v) => c(''));
  }
}