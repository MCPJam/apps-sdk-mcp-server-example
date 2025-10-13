import { getUserTrustedMetadata, updateUserTrustedMetadata } from './stytch.js';

export type StoredTokenSet = {
  accessToken: string;
  refreshToken: string;
  expiresAtIso: string;
  receivedAtIso: string;
};

class TokenStore {
  async get(userId: string): Promise<StoredTokenSet | null> {
    const metadata = await getUserTrustedMetadata(userId);
    const asanaTokens = metadata.asanaTokens as StoredTokenSet | undefined;
    return asanaTokens ?? null;
  }

  async set(userId: string, tokenSet: StoredTokenSet): Promise<void> {
    const metadata = await getUserTrustedMetadata(userId);
    await updateUserTrustedMetadata(userId, {
      ...metadata,
      asanaTokens: tokenSet,
    });
  }

  async delete(userId: string): Promise<void> {
    const metadata = await getUserTrustedMetadata(userId);
    const { asanaTokens, ...rest } = metadata;
    await updateUserTrustedMetadata(userId, rest);
  }
}

export const tokenStore = new TokenStore();