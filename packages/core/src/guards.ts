import {
  array,
  guard,
  string,
  number,
  lazy,
  dict,
  optional,
  boolean,
  regex,
  exact,
  either,
  either3,
  constant,
  Decoder,
} from 'decoders';
import { nonEmptyArray } from 'decoders/array';

export const pipelineIdentifierGuard = regex(/^pipe::\w+$/, 'Bad pipeline identifier');
export const valueIdentifierGuard = regex(/^\w+@\w+$/, 'Bad value identifier');
export const selectorGuard = either(string, valueIdentifierGuard);
export const selectorsGuard = either3(selectorGuard, array(selectorGuard), dict(selectorGuard));

export const pipeline: Decoder<unknown> = exact({
  name: string,
  selector: selectorsGuard,

  url: optional(either(selectorGuard, array(selectorGuard))),

  maxRetries: optional(number),
  maxThreads: optional(number),
  attribute: optional(string),
  transform: optional(string),
  timeout: optional(number),

  wait: optional(array(pipelineIdentifierGuard)),
  next: optional(
    array(
      either(
        lazy(() => pipeline),
        pipelineIdentifierGuard
      )
    )
  ),
});

export const param: Decoder<unknown> = exact({
  name: string,
  file: optional(string),
  value: optional(either(string, array(string))),
});

export const templateGuard = guard(
  exact({
    name: string,
    version: constant(1),
    maxRetries: optional(number),
    timeout: optional(number),
    maxThreads: optional(number),
    renderJS: optional(boolean),

    params: optional(param),

    start: optional(array(pipelineIdentifierGuard)),
    pipelines: nonEmptyArray(pipeline),
  })
);
