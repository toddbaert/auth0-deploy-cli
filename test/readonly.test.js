import { expect } from 'chai';

import cleanAssets from '../src/readonly';

describe('#readonly', function() {
  it('should clear databases of options.configuration', () => {
    const assets = {
      databases: [
        {
          name: 'db1',
          strategy: 'auth0',
          options: {
            configuration: {
              secret: 'i am actually a goose'
            },
            requires_username: true
          }
        }
      ]
    };
    const target = {
      name: 'db1',
      strategy: 'auth0',
      options: {
        requires_username: true
      }
    };
    const clear = cleanAssets(assets, {});
    expect(clear.databases).is.deep.equal([ target ]);
  });
});

describe('#cleanAssets', () => {
  it('should exclude appropriate properties', () => {
    const assets = {
      exclude: {
        rules: [],
        clients: [],
        databases: [],
        connections: [],
        resourceServers: [],
        defaults: []
      },
      connections: [
        {
          options: {
            domain: 'some-azure-domain.azure-us.net',
            client_id: 'foobarbaz1',
            use_wsfed: false,
            ext_groups: false,
            ext_profile: false,
            identity_api: 'microsoft-identity-platform-v2.0',
            basic_profile: false,
            client_secret: 'someclientsecretfoo',
            tenant_domain: 'some-azure-domain.azure-us.net',
            waad_protocol: 'openid-connect',
            api_enable_users: false,
            ext_nested_groups: false,
            useCommonEndpoint: false,
            should_trust_email_verified_connection: 'never_set_emails_as_verified'
          },
          strategy: 'waad',
          name: 'azure-ad-test',
          is_domain_connection: false,
          show_as_button: true,
          enabled_clients: [
            "Will's SPA"
          ]
        }
      ]
    };

    const propertiesToExclude = [ 'client_secret',
      'admin_access_token',
      'admin_access_token_expiresin',
      'cert',
      'signingCert' ];

    const EXCLUDED_PROPS = {
      connections: propertiesToExclude.map((prop) => `options.${prop}`)
    };

    const result = cleanAssets(assets, { EXCLUDED_PROPS });
    console.log({ result });
    const { connections } = result;
    expect(connections).to.have.lengthOf(1);

    propertiesToExclude.forEach((prop) => {
      expect(connections[0].options).to.not.haveOwnProperty(prop);
    });
    expect(connections[0].options).to.haveOwnProperty('domain');// Assert that there are non-excluded properties in the options object
  });
});
