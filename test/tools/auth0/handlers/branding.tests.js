const { expect } = require('chai');
const branding = require('../../../../src/tools/auth0/handlers/branding');

describe('#branding handler', () => {
  describe('#branding process', () => {
    it('should get branding', async () => {
      const auth0 = {
        branding: {
          getSettings: () => ({
            logo_url: 'https://example.com/logo.png'
          })
        }
      };

      const handler = new branding.default({ client: auth0 });
      const data = await handler.getType();
      expect(data).to.deep.equal({
        logo_url: 'https://example.com/logo.png'
      });
    });

    it('should update branding settings, removing template property', (done) => {
      const auth0 = {
        branding: {
          updateSettings: (params, data) => {
            expect(data).to.be.an('object');
            expect(data.templates).to.equal(undefined);
            expect(data.logo_url).to.equal('https://example.com/logo.png');
            done();
          }
        }
      };

      const handler = new branding.default({ client: auth0 });
      const stageFn = Object.getPrototypeOf(handler).processChanges;

      stageFn.apply(handler, [
        {
          branding: {
            logo_url: 'https://example.com/logo.png',
            templates: {
              universalLogin: '<html></html>'
            }
          }
        }
      ]);
    });
  });
});
