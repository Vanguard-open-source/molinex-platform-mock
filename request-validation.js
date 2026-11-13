export class RequestValidation {
    static text(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }

    static email(value) {
        return this.text(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    static nextId(rows) {
        return rows.reduce((maximum, row) => Math.max(maximum, Number(row.id) || 0), 0) + 1;
    }
}
