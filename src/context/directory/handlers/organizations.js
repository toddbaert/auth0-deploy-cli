import fs from 'fs-extra';
import path from 'path';

import log from '../../../logger';
import {
  getFiles, existsMustBeDir, dumpJSON, loadJSON, sanitize
} from '../../../utils';

function parse(context) {
  const organizationsFolder = path.join(context.filePath, 'organizations');

  if (!existsMustBeDir(organizationsFolder)) return { organizations: undefined }; // Skip

  const files = getFiles(organizationsFolder, [ '.json' ]);

  const organizations = files.map((f) => {
    const org = { ...loadJSON(f, context.mappings) };
    return org;
  });

  return {
    organizations
  };
}

async function dump(context) {
  const { organizations } = context.assets;

  // API returns an empty object if no grants are present
  if (!organizations || organizations.constructor === Object) return; // Skip, nothing to dump

  const organizationsFolder = path.join(context.filePath, 'organizations');
  fs.ensureDirSync(organizationsFolder);

  organizations.forEach((organization) => {
    const organizationFile = path.join(organizationsFolder, sanitize(`${organization.name}.json`));
    log.info(`Writing ${organizationFile}`);

    if (organization.connections.length > 0) {
      organization.connections = organization.connections.map((c) => {
        // connection is a computed field
        const name = c.connection && c.connection.name;

        const conn = {
          name,
          ...c
        };

        delete conn.connection_id;
        delete conn.connection;

        return conn;
      });
    }

    dumpJSON(organizationFile, organization);
  });
}

export default {
  parse,
  dump
};
