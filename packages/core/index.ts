import { ScrapitoEngine } from './src/engine';
import { parse, loadTemplate } from './src/parser';
import { Template } from './types';

export class Scrapito {
  readonly template!: Template;
  readonly engine!: ScrapitoEngine;

  constructor(template: Template) {
    this.template = template;

    if (!this.template.timeout) this.template.timeout = 3600 * 1000;

    this.engine = new ScrapitoEngine(template);
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
  static async loadTemplate(path: string, encoding: BufferEncoding = 'utf-8'): Promise<Scrapito> {
    return new this(await loadTemplate(path, encoding));
  }

  /**
   * Run scrapping on the current instance
   */
  public scrap(params?: Record<string, string>): Promise<Map<string | number, unknown>> {
    if (!this.template.params) this.template.params = [];

    if (params) {
      const data = Object.entries(params).map(([k, v]) => ({ name: k, value: v }));
      this.template.params = this.template.params.concat(data);
    }

    return this.engine.startEngine();
  }
}
