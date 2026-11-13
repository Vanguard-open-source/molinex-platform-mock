import { randomBytes } from 'node:crypto';
import { ProblemDetail } from './problem-detail.js';
import { RequestValidation } from './request-validation.js';

export class IdentityEndpoints {
    #database;
    #tokens = new Set();
    #roles = new Set(['administrator', 'operator', 'technician']);

    constructor(database) {
        this.#database = database;
    }

    hasToken(token) {
        return this.#tokens.has(token);
    }

    register(app) {
        app.post('/api/v1/users', (request, response) => this.#signUp(request, response));
        app.post('/api/v1/tokens', (request, response) => this.#signIn(request, response));
    }

    #signUp(request, response) {
        const body = request.body || {};
        if (!RequestValidation.email(body.email) || !RequestValidation.text(body.password)
            || !RequestValidation.text(body.fullName) || !Array.isArray(body.roles)
            || body.roles.length !== 1 || !this.#roles.has(body.roles[0])) {
            return ProblemDetail.send(response, 400, 'Valid email, password, fullName and one permitted role are required.');
        }
        const users = this.#database.get('users');
        const email = body.email.trim().toLowerCase();
        if (users.value().some(user => user.email.toLowerCase() === email)) {
            return ProblemDetail.send(response, 409, 'The email address is already registered.');
        }
        const user = {id: RequestValidation.nextId(users.value()), email, fullName: body.fullName.trim(),
            roles: [...body.roles], status: 'ACTIVE'};
        users.push({...user, password: body.password}).write();
        return response.status(201).json(user);
    }

    #signIn(request, response) {
        const body = request.body || {};
        const email = body.email ?? body.username;
        if (!RequestValidation.email(email) || !RequestValidation.text(body.password)) {
            return ProblemDetail.send(response, 400, 'Email and password are required.');
        }
        const user = this.#database.get('users').value().find(candidate =>
            candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === body.password);
        if (!user || user.status !== 'ACTIVE') {
            return ProblemDetail.send(response, 401, 'Invalid credentials.');
        }
        const token = randomBytes(32).toString('hex');
        this.#tokens.add(token);
        return response.status(201).json({id: user.id, email: user.email, role: user.roles[0], token});
    }
}
