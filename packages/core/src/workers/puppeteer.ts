import { Pipeline, WorkerResult } from '../../types';
import { expose } from 'threads/worker';

const localStore = new Map<string | number, unknown>();

expose(async function processing(pipe: Pipeline): Promise<WorkerResult> {
  return { pipe, data: [], store: localStore };
});
