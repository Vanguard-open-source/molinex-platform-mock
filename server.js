import path from 'path';
import { fileURLToPath } from 'url';
import { MockApiServerConfig } from './mock-api-server-config.js';
import { MockApiServer } from './mock-api-server.js';

const directoryName = path.dirname(fileURLToPath(import.meta.url));

const config = new MockApiServerConfig({
    port: process.env.PORT || 3000,
    dbPath:
        process.env.JSON_SERVER_DB_PATH ||
        path.join(directoryName, 'db.json')
});

new MockApiServer(config).start();