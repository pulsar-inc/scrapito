import { templateGuard } from './guards';
import { Template } from '../types';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';

export function loadTemplate(path: string, encoding: BufferEncoding = 'utf-8'): Template {
  return parse(load(readFileSync(path, { encoding })));
}

export function parse(template: unknown): Template {
  if (!(template instanceof Object)) {
    throw new Error('Bad template format');
  }

  templateGuard(template);

  return template as Template;
}