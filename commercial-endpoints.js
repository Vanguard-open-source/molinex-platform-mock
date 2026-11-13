import { ProblemDetail } from './problem-detail.js';
import { RequestValidation } from './request-validation.js';

export class CommercialEndpoints {
    #database;

    constructor(database) {
        this.#database = database;
    }

    register(app) {
        app.post('/api/v1/commercial-inquiries', (request, response) => {
            const body = request.body || {};
            if (!['fullName', 'companyName', 'message'].every(field => RequestValidation.text(body[field]))
                || !RequestValidation.email(body.email)
                || (body.phoneNumber != null && typeof body.phoneNumber !== 'string')) {
                return ProblemDetail.send(response, 400, 'Full name, valid email, company name and message are required.');
            }
            const inquiries = this.#database.get('commercial-inquiries');
            const inquiry = {id: RequestValidation.nextId(inquiries.value()), fullName: body.fullName.trim(),
                email: body.email.trim().toLowerCase(), phoneNumber: body.phoneNumber?.trim() || null,
                companyName: body.companyName.trim(), message: body.message.trim(), submittedAt: new Date().toISOString()};
            inquiries.push(inquiry).write();
            return response.status(201).json(inquiry);
        });
    }
}
