export class ProblemDetail {
    static #titles = {400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 409: 'Conflict', 500: 'Internal Server Error'};

    static #body(status, detail) {
        return {type: 'about:blank', title: this.#titles[status] || 'Request failed', status, detail};
    }

    static send(response, status, detail) {
        return response.status(status).type('application/problem+json').json(this.#body(status, detail));
    }

    static middleware() {
        return (_request, response, next) => {
            const originalSend = response.send.bind(response);
            // JSON Server has its own terminal error handler; normalize its errors without exposing stack traces.
            response.send = body => {
                if (response.statusCode >= 400
                    && !String(response.getHeader('Content-Type')).startsWith('application/problem+json')) {
                    response.type('application/problem+json');
                    const detail = response.statusCode === 404 ? 'The requested endpoint does not exist.'
                        : 'The mock could not process the request.';
                    return originalSend(JSON.stringify(ProblemDetail.#body(response.statusCode, detail)));
                }
                return originalSend(body);
            };
            next();
        };
    }
}
