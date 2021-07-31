import { version, description } from './package.json';
import { Scrapito } from '@scrapito/core';
import { program } from '@caporal/core';
import { writeFileSync } from 'fs';
import { Logger } from 'types';
import { join } from 'path';

const currentPath = process.cwd();

function replacer(key: string, value: any) {
  if (value?.parentNode && value?.childNodes) {
    return value.rawTagName ? `<${value.rawTagName}>` : '<HTMLElement>';
  }
  return value;
}

function dump(s: Scrapito, data: Map<string | number, unknown>, logger: Logger) {
  const outFile = s.template.name + '-' + new Date().getTime() + '.json';
  const j = JSON.stringify(Object.fromEntries(data), replacer, 4);

  writeFileSync(outFile, j.replace(/"pipe::/g, '"'));

  logger.info(`Data dumped into ${outFile} ✅`);
}

program.version(version).description(description);

program.argument('[[template] ...]', 'Template(s) to run').action(({ logger, args }) => {
  const paths = args.template as [string];

  paths.forEach(async (templatePath) => {
    logger.info('Loading %s template.', templatePath);

    const fullPath = join(currentPath, templatePath);
    const s = await Scrapito.loadTemplate(fullPath);

    logger.info('Template %s (%s) loaded!', s.template.name, templatePath);
    logger.info('Init scrapping');

    s.scrap()
      .then((data) => {
        logger.info('Processing done ✅');
        dump(s, data, logger);
      })
      .catch(console.error);
  });
});

program.run();
