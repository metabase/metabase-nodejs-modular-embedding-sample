import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT;

app.use(cors({ credentials: true, origin: true }));

const MB_JWT_SHARED_SECRET = process.env.MB_JWT_SHARED_SECRET;
const MB_EMBEDDING_SECRET_KEY = process.env.MB_EMBEDDING_SECRET_KEY;

const MB_SITE_URL = process.env.MB_INSTANCE_URL;
const MB_DASHBOARD_ID_TO_EMBED = process.env.MB_DASHBOARD_ID_TO_EMBED
  ? parseInt(process.env.MB_DASHBOARD_ID_TO_EMBED)
  : 1;

const MB_ADMIN_EMAIL = process.env.MB_ADMIN_EMAIL || "rene@example.com";
const MB_ADMIN_FIRST_NAME = process.env.MB_ADMIN_FIRST_NAME || "Rene";
const MB_ADMIN_LAST_NAME = process.env.MB_ADMIN_LAST_NAME || "Descartes";

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
        <script defer src="${MB_SITE_URL}/app/embed.js"></script>
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
    email: MB_ADMIN_EMAIL,
    firstName: MB_ADMIN_FIRST_NAME,
    lastName: MB_ADMIN_LAST_NAME,
    group: "Customer",
  };

  if (!user) {
    return res.status(401).json({
      status: "error",
      message: "Not authenticated",
    });
  }

  const ssoPayload = {
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    groups: [user.group],
    exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minutes
  };

  const ssoToken = jwt.sign(ssoPayload, MB_JWT_SHARED_SECRET);

  res.json({ jwt: ssoToken });
});

// Guest Embed - uses signed JWT tokens for anonymous access
app.get(["/", "/guest-embed"], (req, res) => {
  const payload = {
    resource: { dashboard: MB_DASHBOARD_ID_TO_EMBED },
    params: {},
    exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minutes
  };
  const token = jwt.sign(payload, MB_EMBEDDING_SECRET_KEY);

  res.send(
    getPageLayout(
      { isGuest: true, instanceUrl: MB_SITE_URL },
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
        instanceUrl: MB_SITE_URL,
        jwtProviderUri: JWT_PROVIDER_URI,
        enableInternalNavigation: true,
      },
      `<metabase-dashboard dashboard-id="${MB_DASHBOARD_ID_TO_EMBED}" with-title="true" with-downloads="false"></metabase-dashboard>`,
      "/sso-embed",
    ),
  );
});

app.listen(port, () => {
  console.log(`App is live at http://localhost:${port}`);
});
