export class MockApiServerConfig {
    #port;
    #dbPath;
    #requireToken;

    constructor({ port, dbPath, requireToken = false }) {
        this.#port = Number(port);
        this.#dbPath = dbPath;
        this.#requireToken = requireToken;
    }

    get port() {
        return this.#port;
    }

    get requireToken() {
        return this.#requireToken;
    }

    get dbPath() {
        return this.#dbPath;
    }
}