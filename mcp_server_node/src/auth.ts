import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';

const DEFAULT_USER_ID = 'demo-user';

export function ensureAuthorized(authInfo?: AuthInfo): string {
  if (!authInfo) {
    throw new Error('Unauthorized request to MCP server: No auth info provided');
  }

  const userId = extractSubject(authInfo) ?? DEFAULT_USER_ID;

  console.log('========================================');
  console.log('USER ID EXTRACTION:');
  console.log('Extracted userId:', userId);
  if (userId === DEFAULT_USER_ID) {
    console.warn('⚠️  WARNING: Using DEFAULT_USER_ID - this means user ID was not found in token!');
    console.warn('⚠️  This could cause token leakage between users!');
    console.warn('AuthInfo.extra:', JSON.stringify(authInfo.extra, null, 2));
  } else {
    console.log('✓ Successfully extracted user-specific ID');
  }
  console.log('========================================');

  return userId;
}

export function extractSubject(authInfo?: AuthInfo): string | undefined {
  if (!authInfo?.extra) return undefined;

  const extra = authInfo.extra as Record<string, unknown>;
  const subject = extra['subject'] ?? extra['sub'] ?? extra['userId'] ?? extra['user_id'];

  return typeof subject === 'string' && subject.length > 0 ? subject : undefined;
}