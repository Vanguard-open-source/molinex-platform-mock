# Molinex mock API

Node.js 24 or later. Install the locked dependencies with `npm install` (or `npm ci`), then run `npm start`.
Default base URL: http://localhost:3000/api/v1. No database service is needed.

| Variable | Default | Purpose |
|---|---|---|
| PORT | 3000 | HTTP listening port |
| JSON_SERVER_DB_PATH | db.json beside server.js | Existing JSON database file; use a disposable copy for tests |
| MOCK_REQUIRE_TOKEN | false | Set exactly true to require an issued demo bearer token on non-public routes |

## Public contract

| Method and endpoint | Body / response |
|---|---|
| POST /api/v1/users | email, password, fullName, roles (exactly one administrator, operator or technician); 201 numeric id/email/fullName/roles/status; 400 invalid; 409 duplicate |
| POST /api/v1/tokens | email (or username), password; 201 id/email/role/token; 400 incomplete; 401 invalid/inactive |
| POST /api/v1/commercial-inquiries | fullName, email, optional phoneNumber, companyName, message; 201 complete numeric-id resource with submittedAt; 400 invalid |
| GET /api/v1/health | status: ok and ISO time |
| GET / | Public operational resource names |

No user list, role catalog or plan endpoint is published. Other methods on users always return 404, including encoded aliases, nested paths and private _embed/_expand joins. Password fields are omitted from JSON serialization as well. Unsupported token, inquiry, plan, role and database routes return 404 after optional token validation (401 first when token mode requires authentication).
JSON Server operational resources retain their existing flat-array CRUD behavior, with server-assigned numeric IDs.
Errors use application/problem+json and type/title/status/detail. CORS preflights remain public for browser access.

## Demonstration accounts

| Email | Role | Name |
|---|---|---|
| administrator@molinex.test | administrator | Jorge Salazar |
| technician@molinex.test | technician | Carlos Mendoza |
| operator@molinex.test | operator | Lucía Torres |

All three use the deliberately fake password `FAKE-demo-only-2026!`. These are synthetic demonstration credentials.
Passwords are stored in the local JSON file for simulation only and never returned through the API.
Do not use real credentials or treat this server as production authentication. Opaque random tokens live only in memory;
restarting the mock invalidates them. Token mode checks token presence, not backend JWT signatures or role authorization.
Historical principal references now match these numeric demo identities; anomaly code suffixes become numeric informational references.
There is no anomaly lifecycle lookup. To reset data, stop the server and restore db.json from the clean delivery archive.
