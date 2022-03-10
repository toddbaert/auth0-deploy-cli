import DefaultHandler from './default';

export const schema = { type: 'object' };

export default class BrandingHandler extends DefaultHandler {
  constructor(options) {
    super({
      ...options,
      type: 'branding'
    });
  }

  async getType() {
    // in case client version does not support branding
    if (!this.client.branding || typeof this.client.branding.getSettings !== 'function') {
      return {};
    }

    try {
      return await this.client.branding.getSettings();
    } catch (err) {
      if (err.statusCode === 404) return {};
      if (err.statusCode === 501) return {};
      throw err;
    }
  }

  async processChanges(assets) {
    const { branding } = assets;

    // remove templates, they exist on the the branding object in context.assets but cannot be added to the settings API call.
    const brandingWithoutTemplates = { ...branding };
    delete brandingWithoutTemplates.templates;
    // Do nothing if not set
    if (!brandingWithoutTemplates || !Object.keys(brandingWithoutTemplates).length) return;

    await this.client.branding.updateSettings({}, brandingWithoutTemplates);
    this.updated += 1;
    this.didUpdate(brandingWithoutTemplates);
  }
}
