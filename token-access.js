import { ProblemDetail } from './problem-detail.js';

export class TokenAccess {
    #identity;
    #required;

    constructor(identity, required) {
        this.#identity = identity;
        this.#required = required;
    }

    middleware() {
        return (request, response, next) => {
            const publicPost = request.method === 'POST'
                && ['/api/v1/users', '/api/v1/tokens', '/api/v1/commercial-inquiries'].includes(request.path);
            const publicGet = request.method === 'GET' && ['/', '/api/v1/health'].includes(request.path);
            if (!this.#required || publicPost || publicGet) return next();
            const match = /^Bearer (\S+)$/.exec(request.get('Authorization') || '');
            if (!match || !this.#identity.hasToken(match[1])) {
                return ProblemDetail.send(response, 401, 'A valid demo bearer token is required.');
            }
            return next();
        };
    }
}
