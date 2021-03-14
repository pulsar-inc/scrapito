import { version, description } from './package.json';
import { Scrapito } from '@scrapito/core';
import { program } from '@caporal/core';
import { join } from 'path';

const currentPath = process.cwd();

program
  .version(version)
  .description(description);

program
  .argument('[[template] ...]', 'Template(s) to run')
  .action(({ logger, args }) => {
    const paths = args.template as [string];

    paths.forEach(templatePath => {
      logger.info('Loading %s template.', templatePath);

      const fullPath = join(currentPath, templatePath);

      const s = Scrapito.loadTemplate(fullPath);

      logger.info('Template %s (%s) loaded!', s.template.name, templatePath);

      logger.info('Init scrapping');

      s.scrap();
    });
  });

program.run();