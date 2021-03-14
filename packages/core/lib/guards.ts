import { array, guard, string, number, lazy, dict, optional, regex, exact, either, either3, constant } from 'decoders';
import { nonEmptyArray } from 'decoders/array';

const pipelineIdentifierGuard = regex(/^pipe::[a-zA-Z0-9]+$/, 'Bad pipeline identifier');
const valueIdentifierGuard = regex(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+$/, 'Bad value identifier');
const selectorGuard = either(string, valueIdentifierGuard);
const selectorsGuard = either3(selectorGuard, array(selectorGuard), dict(selectorGuard));

const pipeline: any = exact({
  name: string,
  selector: selectorsGuard,
  url: either(string, valueIdentifierGuard),

  maxIter: optional(number),
  maxThreads: optional(number),
  transform: optional(string),

  waitFor: optional(array(pipelineIdentifierGuard)),
  next: optional(array(either(lazy(() => pipeline), pipelineIdentifierGuard))),
});

export const templateGuard = guard(exact({
  name: string,
  version: constant(1),
  maxIter: optional(number),
  maxThreads: optional(number),

  start: optional(array(pipelineIdentifierGuard)),
  pipelines: nonEmptyArray(pipeline),
}));