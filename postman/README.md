Postman collection for University-Management-System API

Files

- `University-Management-System-API-collection.json` — Postman Collection v2.1 with requests and tests for:

  - GET {{baseUrl}}/api/hello/
  - POST {{baseUrl}}/core/register/ (creates user)
  - POST {{baseUrl}}/core/login/ (obtains JWT access & refresh)
  - POST {{baseUrl}}/core/token/refresh/ (refreshes access token)
  - GET {{baseUrl}}/core/user/ (requires Authorization: Bearer {{accessToken}})
    - Negative/edge-case requests also included:
      - `Register (password mismatch)` — expects 400
      - `Register (duplicate)` — expects 400 when creating an existing user
      - `Login (invalid credentials)` — expects 401/400
      - `Refresh (invalid token)` — expects 401
      - `Get Current User (no token)` — expects 401 (clear `accessToken` before running)
      - `Get Current User (invalid token)` — expects 401

- `University-Management-System-environment.postman_environment.json` — Postman environment with variables:
  - `baseUrl` (default: http://localhost:8000)
  - `accessToken`, `refreshToken`, `userId`, `username`

How to use

1. Start the Django server locally (default: `python manage.py runserver 8000` from the `backend` folder).
2. Import the collection file into Postman (File → Import → choose `University-Management-System-API-collection.json`).
3. Import the environment file into Postman (File → Import → choose `University-Management-System-environment.postman_environment.json`) and select the environment `UMS Local` in the top-right.
4. Run requests in this order to fully exercise the auth flow:
   - `Hello` (GET) — sanity check.
   - `Register (create user)` (POST) — creates a test user. Adjust request body if you need different values.
   - `Login (get JWT tokens)` (POST) — sends credentials; on success this test will store `accessToken` and `refreshToken` into the environment.
   - `Get Current User` (GET) — reads `Authorization: Bearer {{accessToken}}` from the environment and should return the user object.
   - `Refresh Token` (POST) — uses `{{refreshToken}}` (manually set if necessary) to obtain a new access token which will replace `{{accessToken}}`.

- Optional negative tests (run after you have a user):
  - `Register (password mismatch)` — verifies validation rejects mismatched passwords.
  - `Register (duplicate)` — verifies duplicate user creation is rejected.
  - `Login (invalid credentials)` — verifies bad credentials are rejected.
  - `Get Current User (no token)` — clear the `accessToken` environment variable and run to verify 401.
  - `Get Current User (invalid token)` — runs with an invalid Bearer token to verify 401.

Notes and tips

- The collection sets and reads tokens using small test scripts. If a login or refresh fails, check the response body in Postman and set variables manually if needed.
- If you changed the server port or host, update `baseUrl` in the environment or collection variables.
- The `Register` request may return 400 if the username/email already exist; in that case either change the username or delete the test user in the DB.
- To run the "no token" test: either clear the `accessToken` environment variable in Postman or run the `Get Current User (no token)` request which has no Authorization header. The collection-level pre-request script will automatically attach Authorization when `accessToken` exists.

If you'd like, I can also:

- Add example requests for Department CRUD (if endpoints are added) or any other app endpoints.
- Convert this into a Newman script to run CI tests.
