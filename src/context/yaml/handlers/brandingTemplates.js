import fs from 'fs-extra';
import path from 'path';
import log from '../../../logger';
import { constants } from '../../../tools';

async function parse(context) {
  // Load the HTML file for each page

  const { branding } = context.assets;

  if (!branding || !branding.templates) return { branding: { ...branding, templates: undefined } };

  const templates = Object.keys(branding.templates).reduce((accumulated, key) => ({ ...accumulated, [key]: { template: context.loadFile(branding.templates[key].template) } }), {});

  return {
    branding: {
      ...branding,
      templates
    }
  };
}

async function dump(context) {
  const { branding } = context.assets || { branding: undefined };
  branding.templates = branding.templates || {};

  // Create Templates folder
  const templatesFolder = path.join(context.basePath, constants.BRANDING_TEMPLATES_YAML_DIRECTORY);
  fs.ensureDirSync(templatesFolder);

  branding.templates = Object.keys(branding.templates).reduce((accumulated, key) => {
    const templateFile = path.join(templatesFolder, `${key}.html`);
    log.info(`Writing ${branding.templates[key]}`);
    fs.writeFileSync(templateFile, branding.templates[key].template);
    return { ...accumulated, [key]: `./${constants.BRANDING_TEMPLATES_YAML_DIRECTORY}/${key}.html` };
  }, {});

  return { branding };
}

export default {
  parse,
  dump
};
