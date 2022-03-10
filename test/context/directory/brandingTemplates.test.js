import { expect } from 'chai';
import fs from 'fs-extra';
import path from 'path';
import Context from '../../../src/context/directory';
import handler from '../../../src/context/directory/handlers/brandingTemplates';
import { constants } from '../../../src/tools';
import {
  cleanThenMkdir, mockMgmtClient, testDataDir
} from '../../utils';

const html = '<html></html>';

describe('#directory context branding templates', () => {
  it('should process templates', async () => {
    const dir = path.join(testDataDir, 'directory', 'branding-templates-process');
    cleanThenMkdir(dir);
    const brandingDir = path.join(dir, constants.BRANDING_DIRECTORY, constants.BRANDING_TEMPLATES_DIRECTORY);
    cleanThenMkdir(brandingDir);
    fs.writeFileSync(path.join(brandingDir, constants.UNIVERSAL_LOGIN_TEMPLATE), html);

    const config = { AUTH0_INPUT_FILE: dir };
    const context = new Context(config, mockMgmtClient());
    await context.load();
    expect(context.assets.branding).to.be.an('object');
    expect(context.assets.branding.templates.universalLogin).to.be.an('object');
    expect(context.assets.branding.templates.universalLogin.template).to.deep.equal(html);
  });

  it('should dump templates', async () => {
    const repoDir = path.join(testDataDir, 'directory', 'branding-templates-dump');
    cleanThenMkdir(repoDir);
    const context = new Context({ AUTH0_INPUT_FILE: repoDir }, mockMgmtClient());

    context.assets.branding = {
      templates: {
        universalLogin: {
          body: html
        }
      }
    };

    await handler.dump(context);
    const brandingDir = path.join(repoDir, constants.BRANDING_DIRECTORY, constants.BRANDING_TEMPLATES_DIRECTORY);
    const template = fs.readFileSync(path.join(brandingDir, constants.UNIVERSAL_LOGIN_TEMPLATE)).toString();
    expect(template).to.equal(html);
  });
});
