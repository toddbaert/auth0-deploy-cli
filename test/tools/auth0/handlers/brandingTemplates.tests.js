const { expect } = require('chai');
const brandingTemplates = require('../../../../src/tools/auth0/handlers/brandingTemplates');

const html = '<html></html>';

describe('#brandingTemplates handler', () => {
  describe('#brandingTemplates process', () => {
    describe('#custom domain configured', () => {
      it('should get brandingTemplates', async () => {
        const auth0 = {
          customDomains: {
            getAll: () => [
              {} // mock one custom domain.
            ]
          },
          branding: {
            getUniversalLoginTemplate: () => ({
              body: html
            })
          }
        };

        const handler = new brandingTemplates.default({ client: auth0 });
        const data = await handler.getType();
        expect(data).to.deep.equal({
          universalLogin: {
            body: html
          }
        });
      });
    });

    describe('#custom domain not configured', () => {
      it('should not get brandingTemplates', async () => {
        const auth0 = {
          customDomains: {
            getAll: () => [] // no custom domains.
          },
          branding: {
            getUniversalLoginTemplate: () => ({
              body: html
            })
          }
        };

        const handler = new brandingTemplates.default({ client: auth0 });
        const data = await handler.getType();
        expect(data).to.deep.equal({});
      });
    });

    it('should update branding templates', (done) => {
      const auth0 = {
        branding: {
          setUniversalLoginTemplate: (params, data) => {
            expect(data).to.be.an('object');
            expect(data.template).to.equal(html);
            done();
          }
        }
      };

      const handler = new brandingTemplates.default({ client: auth0 });
      const stageFn = Object.getPrototypeOf(handler).processChanges;

      stageFn.apply(handler, [
        {
          branding: {
            templates: {
              universalLogin: {
                template: html
              }
            }
          }
        }
      ]);
    });
  });
});
