# Metabase Embed.js Sample (Node.js + Express)

A minimal sample demonstrating Metabase embedding using **embed.js** with Node.js and Express. This sample shows how easy it is to integrate Metabase dashboards into your application without any frontend framework.

## Features

- **Single file setup** - Just `server.js` with Express
- **Guest Embed** - Anonymous access using signed JWT tokens
- **SSO Embed** - Authenticated user sessions with JWT SSO
- **No framework required** - Pure HTML with embed.js web components

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for running with Metabase)
- A Metabase Enterprise license (for embedding features)

## Quick Start

### Running with Docker

1. Copy the environment file and add your Metabase license:

```bash
cp .env.docker.example .env.docker
# Edit .env.docker and add your PREMIUM_EMBEDDING_TOKEN
```

2. Start the containers:

```bash
npm run docker:up
```

3. Open http://localhost:4400 in your browser

### Running locally (development)

1. Copy the environment file:

```bash
cp .env.example .env
# Edit .env with your Metabase instance URL and JWT secret
```

2. Install dependencies and start the server:

```bash
npm install
npm start
```

3. Open http://localhost:3100 in your browser

## Project Structure

```
├── server.js              # Express server with all routes
├── package.json           # Dependencies
├── Dockerfile             # Container build
├── docker-compose.yml     # Docker orchestration
├── metabase/
│   └── config.yml         # Metabase initial configuration
└── e2e/                   # Cypress E2E tests
```

## How It Works

### Guest Embed (Signed JWT)

Guest embeds use signed JWT tokens to provide anonymous access to specific dashboards or questions. The server signs a token containing the resource ID and parameters, which is then passed to the `<metabase-dashboard>` component.

```javascript
// Server generates a signed token
const payload = {
  resource: { dashboard: 1 },
  params: {},
  exp: Math.round(Date.now() / 1000) + 10 * 60,
};
const token = jwt.sign(payload, METABASE_SECRET_KEY);
```

```html
<!-- Client uses the token -->
<metabase-dashboard
  dashboard-id="1"
  with-title="true"
></metabase-dashboard>

<script>
  defineMetabaseConfig({
    isGuest: true,
    instanceUrl: "http://localhost:4300",
    jwtProviderUri: "http://localhost:4400/auth/sso",
  });
</script>
```

### SSO Embed (JWT Authentication)

SSO embeds authenticate users via JWT, creating a full user session in Metabase. The server returns a JWT containing user information when the embed.js client requests authentication.

```javascript
// Server returns user JWT
const ssoPayload = {
  email: "user@example.com",
  first_name: "Demo",
  last_name: "User",
  groups: ["All Users"],
  exp: Math.round(Date.now() / 1000) + 10 * 60,
};
const ssoToken = jwt.sign(ssoPayload, METABASE_SECRET_KEY);
res.json({ jwt: ssoToken });
```

```html
<!-- Client uses SSO authentication -->
<metabase-dashboard
  dashboard-id="1"
  with-title="true"
></metabase-dashboard>

<script>
  defineMetabaseConfig({
    instanceUrl: "http://localhost:4300",
    jwtProviderUri: "http://localhost:4400/auth/sso",
  });
</script>
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3100` |
| `METABASE_INSTANCE_URL` | Metabase URL | `http://localhost:3000` |
| `METABASE_JWT_SHARED_SECRET` | JWT signing secret | - |
| `PREMIUM_EMBEDDING_TOKEN` | Metabase Enterprise license | - |

## Running E2E Tests

```bash
# Start Docker containers
npm run docker:up

# Run Cypress tests
cd e2e
npm install
npm run cypress:run
```

## License

MIT
