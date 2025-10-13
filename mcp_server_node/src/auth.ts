import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';

const DEFAULT_USER_ID = 'demo-user';

export function ensureAuthorized(authInfo?: AuthInfo): string {
  if (!authInfo) {
    throw new Error('Unauthorized request to MCP server: No auth info provided');
  }

  return extractSubject(authInfo) ?? DEFAULT_USER_ID;
}

export function extractSubject(authInfo?: AuthInfo): string | undefined {
  if (!authInfo?.extra) return undefined;

  const extra = authInfo.extra as Record<string, unknown>;
  const subject = extra['subject'] ?? extra['sub'] ?? extra['userId'] ?? extra['user_id'];

  return typeof subject === 'string' && subject.length > 0 ? subject : undefined;
}