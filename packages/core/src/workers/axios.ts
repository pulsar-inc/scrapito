import { Pipeline, ScrapitoStore, WorkerResult } from '../../types';
import { parse, HTMLElement } from 'node-html-parser';
import { dereferencer } from '../utils';
import { expose } from 'threads/worker';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios').default;

let localStore = new Map<string | number, unknown>();

function stringifyHTML(value: unknown): string | string[] | any {
  if ((value as HTMLElement).outerHTML !== undefined) {
    return (value as HTMLElement).outerHTML;
  } else if (value instanceof Array) {
    return value.map((v) => {
      if ((v as HTMLElement).outerHTML !== undefined) return (v as HTMLElement).outerHTML;
      return v;
    }) as string[];
  }
  return value;
}

function parseStrHTML(value: unknown): string | string[] | any {
  if (value instanceof Array) {
    return value.map((v) => parse(v));
  } else if (typeof value === 'string') {
    return parse(value);
  }
  return value;
}

function setStore(key: string | number, value: unknown): void {
  const test = localStore.get(key);

  value = stringifyHTML(value);

  if (test instanceof Array) {
    localStore.set(key, test.concat(value));
  } else if (test) {
    localStore.set(key, [test, value]);
  } else {
    localStore.set(key, value);
  }
}

async function requester(pipe: Pipeline) {
  if (!pipe.url && pipe.parent) {
    return { pipe, data: parseStrHTML(localStore.get(pipe.parent)) };
  } else if (!pipe.url) {
    throw new Error('No URL or parent!');
  }

  console.log(dereferencer(localStore, pipe.url as string));

  const url: string = dereferencer(localStore, pipe.url as string);

  try {
    const { data } = await axios.get(url, { timeout: pipe.timeout });
    return { pipe, data: parse(data) };
  } catch (error: any) {
    console.error('ERROR ::', pipe.name, '::', error?.message ?? String(error));
  }
  return { pipe, data: parse('') };
}

function selecter({ pipe, data }: { pipe: Pipeline; data: HTMLElement | HTMLElement[] }) {
  const selector = dereferencer(localStore, pipe.selector);

  if (data instanceof Array) {
    return {
      pipe,
      data: data.map((x) => x.querySelectorAll(selector)).flat(),
    };
  }

  return { pipe, data: data.querySelectorAll(selector) };
}

function getter({ pipe, data }: { pipe: Pipeline; data: HTMLElement[] }) {
  if (!pipe.attribute) return { pipe, data };

  if (pipe.attribute === '$text') return { pipe, data: data.map((x) => x.text) };

  return {
    pipe,
    data: data.map((x) => x.getAttribute(pipe.attribute as string)),
  };
}

function transformer({ pipe, data }: { pipe: Pipeline; data: unknown[] }) {
  if (!pipe.transform) return { pipe, data };

  data = data.map((res) => new Function('res', 'return ' + pipe.transform)(res));
  return { pipe, data };
}

expose(async function processing(
  pipe: Pipeline,
  store: ScrapitoStore
): Promise<WorkerResult | any> {
  localStore = store;

  return requester(pipe)
    .then(selecter)
    .then(getter)
    .then(transformer)
    .then(({ pipe, data }) => {
      setStore(`pipe::${pipe.name}`, data);
      data = stringifyHTML(data);
      return { pipe, data, store: localStore };
    });
});
