import { AxiosEngine, PupperEngine } from './lib/engine';
import { parse, loadTemplate } from './lib/parser';
import { Template } from './types';

export class Scrapito {
  readonly template!: Template;
  readonly engine!: AxiosEngine | PupperEngine;

  constructor(template: Template) {
    this.template = template;

    if (!this.template.timeout) this.template.timeout = 10000;

    if (template?.renderJS) {
      this.engine = new PupperEngine(template);
    } else {
      this.engine = new AxiosEngine(template);
    }
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
   * Run scrapping on the current instance
   */
  public scrap(params?: Record<string, string>): Promise<Map<string | number, unknown>> {
    if (!this.template.params)
      this.template.params = [];

    if (params) {
      const data = Object.entries(params).map(([k,v]) => ({name: k, value: v}));
      this.template.params = this.template.params.concat(data);
    }

    return this.engine.startEngine();
  }
}
