import { TransferDescriptor } from 'threads';

export type PipeIdentifier = `pipe::${string}`;
export type ValueIdentifier = `${string}@${string}`;
export type ValueOrPointer = string | ValueIdentifier;
export type PipeOrPointer = Pipeline | PipeIdentifier;
export type ScrapitoStore = Map<string | number, unknown>;

export type RequesterCallback = (url: string) => unknown;
export type SelecterCallback = (selector: string[], markup: unknown) => unknown;
export type TransformerCallback = (transformer: string, data: unknown) => unknown;

export interface Pipeline {
  name: string;
  parent?: PipeIdentifier;
  selector: ValueOrPointer;

  url?: ValueOrPointer | ValueOrPointer[];

  // hideFromOutput?: boolean;
  maxRetries?: number;
  maxThreads?: number;
  attribute?: string;
  transform?: string;
  timeout?: number;

  wait?: PipeIdentifier[];
  next?: Pipeline[] | PipeIdentifier[];
}

export interface ProcessingPipeline extends Pipeline {
  scaffoldOnly?: boolean;
  valueIndex?: number;
  outputPath: string;
}

export interface Param {
  name: string;
  file?: string;
  value?: string | string[];
}

export interface Template {
  name: string;
  version: '1.0.0';
  timeout?: number;
  renderJS?: boolean;
  maxRetries?: number;
  maxThreads?: number;

  params?: Param[];

  start: PipeIdentifier;
  pipelines: Pipeline[];
}

export interface WorkerResult {
  pipe: Pipeline;
  data: unknown[];
  store: ScrapitoStore;
}

declare module 'worker-loader!*' {
  // You need to change `Worker`, if you specified a different value for the `workerType` option
  class WebpackWorker extends Worker {
    constructor();
  }

  // Uncomment this if you set the `esModule` option to `false`
  // export = WebpackWorker;
  export default WebpackWorker;
}
