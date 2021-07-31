import { templateGuard } from './guards';
import { Template } from '../types';
import { load } from 'js-yaml';

export async function loadTemplate(
  path: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<Template> {
  return parse(load((await import('fs')).readFileSync(path, { encoding })));
}

export function parse(template: unknown): Template {
  if (!(template instanceof Object)) {
    throw new Error('Bad template format');
  }

  templateGuard(template);

  return template as Template;
}
