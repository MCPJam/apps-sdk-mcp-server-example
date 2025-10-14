import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { requireBearerAuth } from '@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js';
import express, { type Request, type Response } from 'express';
import { config } from './config.js';
import { createServer } from './server.js';
import { metadataHandler } from './metadata.js';
import { stytchVerifier } from './stytch.js';

type AuthenticatedRequest = Request & {
  auth?: AuthInfo;
  authInfo?: AuthInfo;
};

const app = express();
console.log('🚀 Express app created');

const authDomain = process.env.STYTCH_DOMAIN;
if (!authDomain) {
  throw new Error(
    'Missing auth domain. Ensure STYTCH_DOMAIN env variable is set.'
  );
}
app.use(express.json());
console.log('✓ JSON middleware added');

// Register .well-known handlers AFTER specific routes (fixed metadataHandler to remove wildcards)
app.use(
  '/.well-known/oauth-protected-resource',
  metadataHandler(async (req) => {
    const serverOrigin = resolveServerOrigin(req);
    return {
      resource: new URL(serverOrigin).href,
      authorization_servers: [authDomain],
      scopes_supported: ['openid', 'email', 'profile'],
    };
  })
);

app.use(
  '/.well-known/oauth-authorization-server',
  metadataHandler(async (_req) =>
    fetch(new URL('/.well-known/oauth-authorization-server', authDomain)).then(
      (res) => res.json()
    )
  )
);

const bearerAuthMiddleware = requireBearerAuth({
  verifier: {
    verifyAccessToken: stytchVerifier,
  },
  resourceMetadataUrl: `http://localhost:${config.MCP_HTTP_PORT}/.well-known/oauth-protected-resource`,
});

app.post(
  '/mcp',
  bearerAuthMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      res.on('close', () => {
        transport.close();
      });

      const server = createServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  }
);

console.log('📋 Registered routes:');
app._router.stack.forEach((middleware: any) => {
  if (middleware.route) {
    console.log(`  ${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler: any) => {
      if (handler.route) {
        console.log(`  ${Object.keys(handler.route.methods).join(',').toUpperCase()} ${handler.route.path}`);
      }
    });
  }
});

const server = app.listen(config.MCP_HTTP_PORT, '0.0.0.0', () => {
  console.log(
    `Asana MCP server listening on port ${config.MCP_HTTP_PORT} (widgets hosted at ${config.FRONTEND_DOMAIN})`
  );
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

function resolveServerOrigin(req: Request): string {
  if (config.SERVER_BASE_URL) {
    return stripTrailingSlash(config.SERVER_BASE_URL);
  }

  const forwardedProtoHeader = req.headers['x-forwarded-proto'];
  const protocol = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : forwardedProtoHeader ?? req.protocol;

  const forwardedHostHeader = req.headers['x-forwarded-host'];
  const hostHeader = (Array.isArray(forwardedHostHeader)
    ? forwardedHostHeader[0]
    : forwardedHostHeader) ?? req.get('host');

  const host = hostHeader ?? `localhost:${config.MCP_HTTP_PORT}`;
  return `${protocol}://${host}`;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}