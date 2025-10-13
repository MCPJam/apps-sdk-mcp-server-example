import { promises as fs } from 'fs';
import path from 'path';
import { config } from './config.js';

export type StoredTokenSet = {
  accessToken: string;
  refreshToken: string;
  expiresAtIso: string;
  receivedAtIso: string;
};

class TokenStore {
  private readonly filePath: string;
  private cache = new Map<string, StoredTokenSet>();
  private isLoaded = false;

  constructor() {
    this.filePath =
      config.ASANA_TOKEN_STORE_PATH ??
      path.resolve(process.cwd(), '.data/asana-tokens.json');
  }

  async get(userId: string): Promise<StoredTokenSet | null> {
    await this.ensureLoaded();
    return this.cache.get(userId) ?? null;
  }

  async set(userId: string, tokenSet: StoredTokenSet): Promise<void> {
    await this.ensureLoaded();
    this.cache.set(userId, tokenSet);
    await this.persist();
  }

  async delete(userId: string): Promise<void> {
    await this.ensureLoaded();
    this.cache.delete(userId);
    await this.persist();
  }

  private async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as Record<string, StoredTokenSet>;
      this.cache = new Map(Object.entries(parsed));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
      this.cache = new Map();
    }

    this.isLoaded = true;
  }

  private async persist(): Promise<void> {
    const directory = path.dirname(this.filePath);
    await fs.mkdir(directory, { recursive: true });
    const serialized = Object.fromEntries(this.cache.entries());
    await fs.writeFile(this.filePath, JSON.stringify(serialized, null, 2), 'utf-8');
  }
}

export const tokenStore = new TokenStore();