import DefaultHandler from './default';

export const schema = {
  type: 'object',
  properties: {
    templates: {
      universalLogin: {
        type: 'object',
        properties: {
          template: { type: 'string' }
        }
      }
    }
  }
};

export default class BrandingTemplatesHandler extends DefaultHandler {
  constructor(options) {
    super({
      ...options,
      type: 'branding'
    });
  }

  async getType() {
    // in case client version does not support branding
    if (!this.client.branding || typeof this.client.branding.getUniversalLoginTemplate !== 'function') {
      return {};
    }

    // in case client version does not custom domains
    if (!this.client.customDomains || typeof this.client.customDomains.getAll !== 'function') {
      return {};
    }

    // if there's no custom domains, skip, feature requires custom domain.
    const customDomains = await this.client.customDomains.getAll();
    if (!customDomains || !customDomains.length) {
      return {};
    }

    try {
      return {
        universalLogin: await this.client.branding.getUniversalLoginTemplate()
      };
    } catch (err) {
      if (err.statusCode === 404) return {};
      if (err.statusCode === 501) return {};
      throw err;
    }
  }

  async processChanges(assets) {
    const { branding } = assets;

    // Do nothing if not set
    if (!branding || !branding.templates || !Object.keys(branding.templates).length) return;

    await this.client.branding.setUniversalLoginTemplate({}, branding.templates.universalLogin);
    this.updated += 1;
    this.didUpdate(branding.templates);
  }
}
