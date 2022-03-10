import fs from 'fs-extra';
import path from 'path';
import { expect } from 'chai';

import Context from '../../../src/context/yaml';
import handler from '../../../src/context/yaml/handlers/brandingTemplates';
import { cleanThenMkdir, testDataDir, mockMgmtClient } from '../../utils';

const html = '<html></html>';

describe('#YAML context branding templates', () => {
  it('should process branding templates', async () => {
    const dir = path.join(testDataDir, 'yaml', 'branding-templates-process');
    cleanThenMkdir(dir);

    const htmlFile = path.join(dir, 'universalLogin.html');
    fs.writeFileSync(htmlFile, html);

    const yaml = `
    branding:
      templates: {
        universalLogin: {
          template: ${htmlFile}
        }
      }
    `;
    const yamlFile = path.join(dir, 'config.yaml');
    fs.writeFileSync(yamlFile, yaml);

    const target = {
      universalLogin: {
        template: html
      }
    };

    const config = { AUTH0_INPUT_FILE: yamlFile };
    const context = new Context(config, mockMgmtClient());
    await context.load();
    expect(context.assets.branding).to.be.an('object');
    expect(context.assets.branding.templates).to.deep.equal(target);
  });

  it('should dump branding templates', async () => {
    const dir = path.join(testDataDir, 'yaml', 'branding-templates-dump');
    cleanThenMkdir(dir);
    const context = new Context({ AUTH0_INPUT_FILE: path.join(dir, 'tenant.yaml') }, mockMgmtClient());

    context.assets.branding = {
      templates: {
        universalLogin: {
          template: html
        }
      }
    };

    const dumped = await handler.dump(context);
    expect(dumped).to.deep.equal({
      branding: {
        templates: {
          universalLogin: './branding_templates/universalLogin.html'
        }
      }
    });

    const templatesFolder = path.join(dir, 'branding_templates');
    expect(fs.readFileSync(path.join(templatesFolder, 'universalLogin.html'), 'utf8')).to.deep.equal(html);
  });
});
