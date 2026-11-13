import jsonServer from 'json-server';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ResourceAccess } from './resource-access.js';
import { IdentityEndpoints } from './identity-endpoints.js';
import { ProblemDetail } from './problem-detail.js';

export class MockApiServer {
    #config;
    #app;

    constructor(config) {
        this.#config = config;
        if (!fs.existsSync(config.dbPath)) throw new Error('JSON_SERVER_DB_PATH must reference an existing JSON database.');
        this.#app = this.#buildApp();
    }

    start() {
        const server = this.#app.listen(this.#config.port, () => {
            console.log(`Molinex Mock API running on http://localhost:${server.address().port}`);
        });
        return server;
    }

    #buildApp() {
        const app = jsonServer.create();
        app.set('json replacer', (key, value) => key.toLowerCase() === 'password' ? undefined : value);
        const router = jsonServer.router(this.#config.dbPath);
        const identity = new IdentityEndpoints(router.db);
        const access = new ResourceAccess();
        app.use(ProblemDetail.middleware());
        const publicDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
        app.use(jsonServer.defaults({ static: publicDirectory }));
        app.use(jsonServer.bodyParser);
        // The explicit user-method 404 contract also applies before optional token validation.
        app.use(access.middleware(true));
        app.use(access.middleware());
        app.get('/', (_request, response) => response.json({resources: access.resources(router.db)}));
        app.get('/api/v1/health', (_request, response) => response.json({status: 'ok', time: new Date().toISOString()}));
        identity.register(app);
        app.use(jsonServer.rewriter({'/api/v1/*': '/$1', '/api/v1': '/'}));
        // The operational API assigns numeric IDs even when a frontend form sends id: 0.
        app.use((request, _response, next) => {
            if (request.method === 'POST' && request.body && typeof request.body === 'object') delete request.body.id;
            next();
        });
        router.render = (_request, response) => {
            if (response.statusCode >= 400) return ProblemDetail.send(response, response.statusCode, 'The requested resource does not exist.');
            return response.jsonp(response.locals.data);
        };
        app.use(router);
        app.use((error, _request, response, _next) => {
            const status = error instanceof SyntaxError ? 400 : 500;
            return ProblemDetail.send(response, status, status === 400 ? 'The request body is not valid JSON.' : 'The mock could not save the request.');
        });
        return app;
    }
}
