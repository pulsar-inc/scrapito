export type PipelineIdentifier = `pipe::${string}`
export type ValueIdentifier = `${string}@${string}`
export type Selector = string | ValueIdentifier
export type Selectors = Selector | Selector[] | {[name: string]: Selector | Selector[]};

export interface Template {
  name: string;
  version: string;
  maxIter?: number;
  maxThreads?: number;

  start: PipelineIdentifier;
  pipelines: [Pipeline];
}

export interface Pipeline {
  name: string;
  selector: Selectors;
  url: string | ValueIdentifier;

  maxIter?: number;
  maxThreads?: number;
  transform?: string;

  waitFor?: [PipelineIdentifier];
  next?: [Pipeline | PipelineIdentifier];
}