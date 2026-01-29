import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT;

const METABASE_JWT_SHARED_SECRET = process.env.METABASE_JWT_SHARED_SECRET;
const METABASE_STATIC_EMBEDDING_SECRET =
  process.env.METABASE_STATIC_EMBEDDING_SECRET;

const METABASE_SITE_URL = process.env.METABASE_INSTANCE_URL;
const DASHBOARD_ID_TO_EMBED = process.env.DASHBOARD_ID_TO_EMBED || 1;

const JWT_PROVIDER_URI = `http://localhost:${port}/auth/sso`;

const getPageLayout = (config, component, currentPath) => {
  const navLink = (href, label) =>
    `<a href="${href}"${href === currentPath ? ' class="active"' : ""}>${label}</a>`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Embed.js Demo</title>
        <style>
          html, body { height: 100%; margin: 0; overflow: hidden; }
          body { display: flex; flex-direction: column; }
          nav { padding: 1rem; background: #f0f0f0; }
          nav a { margin-right: 1rem; }
          nav a.active { font-weight: bold; }
          main { flex: 1; }
          metabase-dashboard { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <script>
          window.defineMetabaseConfig = function(config) {
            window.metabaseConfig = config;
          };
          defineMetabaseConfig(${JSON.stringify(config)});
        </script>
        <script defer src="${METABASE_SITE_URL}/app/embed.js"></script>
        <nav>
          ${navLink("/", "Guest Embed")}
          ${navLink("/sso-embed", "SSO Embed")}
        </nav>
        <main>
          ${component}
        </main>
      </body>
    </html>
  `;
};

// SSO endpoint that returns JWT for authenticated users
app.get("/auth/sso", (req, res) => {
  // Usually, you would grab the user from the current session
  // Here it is hardcoded for demonstration purposes
  // Example:
  // const { user } = req.session;
  const user = {
    email: "rene@example.com",
    firstName: "Rene",
    lastName: "Descartes",
    group: "Customer",
  };

  const ssoPayload = {
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    groups: [user.group],
    exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minutes
  };

  const ssoToken = jwt.sign(ssoPayload, METABASE_JWT_SHARED_SECRET);
  const origin = req.headers.origin || "*";

  res.set({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
  });

  res.json({ jwt: ssoToken });
});

// Guest Embed - uses signed JWT tokens for anonymous access
app.get(["/", "/guest-embed"], (req, res) => {
  const payload = {
    resource: { dashboard: DASHBOARD_ID_TO_EMBED },
    params: {},
    exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minutes
  };
  const token = jwt.sign(payload, METABASE_STATIC_EMBEDDING_SECRET);

  res.send(
    getPageLayout(
      { isGuest: true, instanceUrl: METABASE_SITE_URL },
      `<metabase-dashboard token="${token}" with-title="true"></metabase-dashboard>`,
      "/",
    ),
  );
});

// SSO Embed - uses JWT SSO for authenticated user sessions
app.get("/sso-embed", (req, res) => {
  res.send(
    getPageLayout(
      {
        instanceUrl: METABASE_SITE_URL,
        jwtProviderUri: JWT_PROVIDER_URI,
        enableInternalNavigation: true,
      },
      `<metabase-dashboard dashboard-id="${DASHBOARD_ID_TO_EMBED}" with-title="true" with-downloads="false"></metabase-dashboard>`,
      "/sso-embed",
    ),
  );
});

app.listen(port, () => {
  console.log(`App is live at http://localhost:${port}`);
});
