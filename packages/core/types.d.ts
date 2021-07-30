export type PipeIdentifier = `pipe::${string}`
export type ValueIdentifier = `${string}@${string}`
export type ValueOrPointer = string | ValueIdentifier
export type PipeOrPointer = Pipeline | PipeIdentifier

export type RequesterCallback = (url: string) => unknown;
export type SelecterCallback = (selector: string[], markup: unknown) => unknown;
export type TransformerCallback = (transformer: string, data: unknown) => unknown;

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
  version: '1.0.0';
  timeout?: number;
  renderJS?: boolean;
  maxRetries?: number;
  maxThreads?: number;

  params?: Param[];

  start: PipeIdentifier;
  pipelines: Pipeline[];
}