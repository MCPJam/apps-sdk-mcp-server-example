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
    const rawResponse = await getClient().idp.introspectTokenLocal(token);
    const { audience, scope, expires_at, ...rest } = rawResponse;

    console.log('========================================');
    console.log('STYTCH TOKEN INTROSPECTION RESPONSE:');
    console.log('Full response:', JSON.stringify(rawResponse, null, 2));
    console.log('Extra fields (rest):', JSON.stringify(rest, null, 2));
    console.log('Available user ID fields:');
    console.log('  - subject:', (rest as any).subject);
    console.log('  - sub:', (rest as any).sub);
    console.log('  - userId:', (rest as any).userId);
    console.log('  - user_id:', (rest as any).user_id);
    console.log('========================================');

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

export async function getUserTrustedMetadata(
  userId: string
): Promise<Record<string, unknown>> {
  console.time('stytch:getUserMetadata');
  try {
    const response = await getClient().users.get({ user_id: userId });
    console.timeEnd('stytch:getUserMetadata');
    return response.trusted_metadata || {};
  } catch (error) {
    console.timeEnd('stytch:getUserMetadata');
    console.error('Failed to get user trusted metadata', error);
    return {};
  }
}

export async function updateUserTrustedMetadata(
  userId: string,
  metadata: Record<string, unknown>
): Promise<void> {
  console.time('stytch:updateUserMetadata');
  try {
    await getClient().users.update({
      user_id: userId,
      trusted_metadata: metadata,
    });
    console.timeEnd('stytch:updateUserMetadata');
  } catch (error) {
    console.timeEnd('stytch:updateUserMetadata');
    console.error('Failed to update user trusted metadata', error);
    throw error;
  }
}
