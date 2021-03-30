export type PipeIdentifier = `pipe::${string}`
export type ValueIdentifier = `${string}@${string}`
export type ValueOrPointer = string | ValueIdentifier
export type PipeOrPointer = Pipeline | PipeIdentifier

export type RequesterCallback = (url: string) => any;
export type SelecterCallback = (selector: string[], markup: any) => any;
export type TransformerCallback = (transformer: string, data: any) => any;

export interface Pipeline {
  name: string;
  parent?: PipeIdentifier;
  selector: ValueOrPointer;

  url?: ValueOrPointer | ValueOrPointer[];

  maxRetries?: number;
  maxThreads?: number;
  attribute?: string;
  transform?: string;

  wait?: PipeIdentifier[];
  next?: Pipeline[] | PipeIdentifier[];
}

export interface Param {
  name: string;
  file?: string;
  value?: string | string[];
}

export interface Template {
  name: string;
  version: string;
  timeout?: number;
  maxRetries?: number;
  maxThreads?: number;
  renderJS?: boolean;

  params?: Param[];

  start: PipeIdentifier;
  pipelines: Pipeline[];
}