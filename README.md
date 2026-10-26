# Lurph AI Chrome Extension

## Frontend authentication integration

The sign-in and registration forms call the Express API. Google OAuth remains a UI placeholder and password reset is not included.

### Configure the API URL

Create `.env` from `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

For a deployed backend, set `VITE_API_BASE_URL` to its HTTPS base URL, without a trailing slash.

### Install and run

```bash
npm install
npm run dev
```

To build the extension:

```bash
npm run build
```

Load the generated `dist` directory at `chrome://extensions` with Developer mode enabled.

### Backend CORS

The backend must allow the exact origin of the loaded extension, for example:

```env
CORS_ORIGINS=http://localhost:5173,chrome-extension://YOUR_EXTENSION_ID
```

Reload the extension after changing its manifest or rebuilding it. Keep the MongoDB URI and `ACCESS_TOKEN_SECRET` only in the backend environment; never put backend secrets in frontend environment variables.

### Connected routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/refresh` (automatic when an access token expires)
- `POST /api/auth/logout`

Access and refresh tokens are saved through `chrome.storage.local` in the extension, with a `localStorage` fallback for local Vite development. Refresh tokens rotate through the backend's refresh endpoint. Google OAuth is intentionally not implemented in this phase.
