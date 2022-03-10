import { camelCase, snakeCase } from 'change-case';
import fs from 'fs-extra';
import path from 'path';
import { constants } from '../../../tools';
import { existsMustBeDir, getFiles } from '../../../utils';

function parse(context) {
  const brandingTemplatesFolder = path.join(context.filePath, constants.BRANDING_DIRECTORY, constants.BRANDING_TEMPLATES_DIRECTORY);

  if (!existsMustBeDir(brandingTemplatesFolder)) return { branding: context.branding };

  const templatesFiles = getFiles(brandingTemplatesFolder, [ '.html' ]);
  // convert snake_case file names to camelCase as object keys
  const templates = templatesFiles.reduce((accumulated, file) => {
    // take only the name, not the file extension
    const fileName = path.parse(file).name;
    const template = fs.readFileSync(path.join(file)).toString();
    return { ...accumulated, [camelCase(fileName)]: { template } };
  }, {});

  return {
    branding: {
      templates
    }
  };
}

async function dump(context) {
  const { branding } = context.assets;

  if (!branding || !branding.templates || !Object.keys(branding.templates).length) return; // Skip, nothing to dump

  const brandingTemplatesFolder = path.join(context.filePath, constants.BRANDING_DIRECTORY, constants.BRANDING_TEMPLATES_DIRECTORY);
  fs.ensureDirSync(brandingTemplatesFolder);

  Object.keys(branding.templates).forEach((key) => {
    // convert keys to snake_case file names
    fs.writeFileSync(path.join(brandingTemplatesFolder, `${snakeCase(key)}.html`), branding.templates[key].body);
  }, {});
}

export default {
  parse,
  dump
};
