import { ScrapitoStore, ValueOrPointer } from '../types';
import { valueIdentifierGuard } from './guards';

/**
 * Extract value identifiers
 * @param identifier string with or without value identifiers
 * @returns input with values identifiers replaced by their values
 */
export function dereferencer(store: ScrapitoStore, identifier: ValueOrPointer): string {
  // TODO: handle this anywhere in a string
  if (valueIdentifierGuard(identifier).isOk()) {
    const [key, pipeName] = (identifier as string).split('@');
    const datas = store.get(`pipe::${pipeName}`) as Record<number, string>;

    return datas[parseInt(key)];
  }

  return identifier as string;
}
