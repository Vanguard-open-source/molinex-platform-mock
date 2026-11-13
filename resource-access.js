import { ProblemDetail } from './problem-detail.js';

export class ResourceAccess {
    #privateResources = new Set(['users', 'tokens', 'roles', 'plans', 'db', 'commercial-inquiries']);

    resources(database) {
        return Object.keys(database.getState()).filter(resource => !this.#privateResources.has(resource));
    }

    middleware(usersOnly = false) {
        return (request, response, next) => {
            let normalized;
            try {
                normalized = decodeURIComponent(request.path).replace(/\/+/g, '/').toLowerCase();
            } catch {
                return ProblemDetail.send(response, 400, 'The request path is not valid.');
            }
            const segments = normalized.replace(/^\/api\/v1\/?/, '/').split('/').filter(Boolean);
            const links = [].concat(request.query._expand || [], request.query._embed || []);
            const privateAliases = new Set(['user', 'users', 'role', 'roles', 'token', 'tokens', 'plan', 'plans', 'db', 'commercial-inquiry', 'commercial-inquiries']);
            const privateJoin = links.some(value => typeof value === 'string'
                && value.split(',').some(link => privateAliases.has(link.trim().toLowerCase())));
            const publicPost = request.method === 'POST'
                && ['/api/v1/users', '/api/v1/tokens', '/api/v1/commercial-inquiries'].includes(request.path);
            if (privateJoin || ((usersOnly ? segments.includes('users')
                : segments.some(resource => this.#privateResources.has(resource))) && !publicPost)) {
                return ProblemDetail.send(response, 404, 'The requested endpoint does not exist.');
            }
            return next();
        };
    }
}
