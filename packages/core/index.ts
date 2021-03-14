import { parse, loadTemplate } from './lib/parser';
import { Template } from './types';

export class Scrapito {
  readonly template!: Template;

  constructor(template: Template) {
    this.template = template;
  }

  /**
   * Take JSON like template and parse it
   * Return a new Scrapito instance
   */
  static parse(template: unknown): Scrapito {
    return new this(parse(template));
  }

  /**
   * Take a template path, open it, parse it
   * Return a new Scrapito instance
   */
   static loadTemplate(path: string, encoding: BufferEncoding = 'utf-8'): Scrapito {
    return new this(loadTemplate(path, encoding));
  }

  /**
   * Init scrapping on the current instance
   */
  public scrap(): void {
    console.log(this.template);
  }
}
