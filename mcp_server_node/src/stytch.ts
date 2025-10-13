import { Client } from 'stytch';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { config } from './config.js';
import undici from 'undici';

let client: Client | null = null;

function getClient(): Client {
  if (!client) {
    const dispatcher = new undici.Agent({
      keepAliveTimeout: 6e6, // 10 minutes in MS
      keepAliveMaxTimeout: 6e6, // 10 minutes in MS,
    });

    client = new Client({
      project_id: config.STYTCH_PROJECT_ID,
      secret: config.STYTCH_PROJECT_SECRET,
      custom_base_url: config.STYTCH_DOMAIN,
      dispatcher,
    });
  }
  return client;
}

export const stytchVerifier = async (token: string): Promise<AuthInfo> => {
  console.time('stytch:introspectTokenLocal');
  try {
    const { audience, scope, expires_at, ...rest } =
      await getClient().idp.introspectTokenLocal(token);
    console.timeEnd('stytch:introspectTokenLocal');
    return {
      token,
      clientId: audience as string,
      scopes: scope.split(' '),
      expiresAt: expires_at,
      extra: rest,
    } satisfies AuthInfo;
  } catch (error) {
    console.timeEnd('stytch:introspectTokenLocal');
    console.error('FAILED AUTH');
    console.error(error);
    throw error;
  }
};
