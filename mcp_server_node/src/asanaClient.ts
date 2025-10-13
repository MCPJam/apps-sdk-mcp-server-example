import axios, { type AxiosInstance, AxiosHeaders } from 'axios';
import {
  type ListTasksDueTodayInput,
  type TaskDueToday,
  type TaskListResult,
  type WorkspaceListResult,
  type WorkspaceSummary,
} from '@asana-chatgpt-app/shared-types';
import { config } from './config.js';
import { tokenStore, type StoredTokenSet } from './tokenStore.js';

type OAuthTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  data?: unknown;
};

type AsanaTask = {
  gid: string;
  name: string;
  completed: boolean;
  permalink_url: string;
  due_on: string | null;
  due_at?: string | null;
  assignee?: {
    gid: string;
    name: string;
    email?: string | null;
    photo?: { image_60x60?: string | null } | null;
  } | null;
  memberships?: { project?: { name?: string } | null }[];
};

export class AsanaClient {
  private readonly http: AxiosInstance;

  constructor(private readonly userId: string) {
    console.log(`[AsanaClient] Creating client for userId: ${userId}`);

    this.http = axios.create({
      baseURL: config.ASANA_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.http.interceptors.request.use(async (request) => {
      const accessToken = await this.ensureValidAccessToken();
      const headers = AxiosHeaders.from(request.headers ?? {});
      headers.set('Authorization', `Bearer ${accessToken}`);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      request.headers = headers;
      return request;
    });
  }

  async listWorkspaces(): Promise<WorkspaceListResult> {
    const response = await this.http.get<{ data: { gid: string; name: string }[] }>(
      '/workspaces',
      { params: { opt_fields: 'gid,name' } }
    );

    const workspaces: WorkspaceSummary[] = response.data.data.map((workspace) => ({
      gid: workspace.gid,
      name: workspace.name,
    }));

    return { workspaces };
  }

  async listTasksDueToday(input: ListTasksDueTodayInput): Promise<TaskListResult> {
    const now = new Date();
    const dueDateIso = now.toISOString().slice(0, 10); // YYYY-MM-DD

    const requestParams = {
      assignee: 'me',
      workspace: input.workspaceGid,
      completed_since: input.includeCompleted ? undefined : now.toISOString(),
      due_on: dueDateIso,
      opt_fields:
        'gid,name,completed,due_on,due_at,permalink_url,assignee.gid,assignee.name,assignee.email,assignee.photo.image_60x60,memberships.project.name',
    };

    console.log('[AsanaClient] listTasksDueToday request params:', JSON.stringify(requestParams, null, 2));

    let response;
    try {
      response = await this.http.get<{ data: AsanaTask[] }>(
        `/tasks`,
        { params: requestParams }
      );
    } catch (error) {
      console.error('[AsanaClient] ❌ listTasksDueToday failed');
      if (axios.isAxiosError(error)) {
        console.error('[AsanaClient] Status:', error.response?.status);
        console.error('[AsanaClient] Response data:', JSON.stringify(error.response?.data, null, 2));
        console.error('[AsanaClient] Request URL:', error.config?.url);
        console.error('[AsanaClient] Request params:', JSON.stringify(error.config?.params, null, 2));
      }
      throw error;
    }

    console.log('[AsanaClient] ✓ listTasksDueToday succeeded, found', response.data.data.length, 'tasks');

    const tasks: TaskDueToday[] = response.data.data.map((task) => ({
      gid: task.gid,
      name: task.name,
      completed: task.completed,
      permalinkUrl: task.permalink_url,
      dueOn: task.due_on,
      dueAt: task.due_at,
      assignee: task.assignee
        ? {
            gid: task.assignee.gid,
            name: task.assignee.name,
            email: task.assignee.email ?? null,
            photoUrl: task.assignee.photo?.image_60x60 ?? null,
          }
        : null,
      projectNames: (task.memberships ?? [])
        .map((membership) => membership.project?.name)
        .filter((name): name is string => Boolean(name)),
    }));

    const workspace = await this.getWorkspaceSummary(input.workspaceGid);

    return {
      workspace,
      fetchedAtIso: new Date().toISOString(),
      tasks,
      taskCount: tasks.length,
    };
  }

  async exchangeCodeForTokens(code: string): Promise<void> {
    console.log(`[AsanaClient] Exchanging code for tokens for userId: ${this.userId}`);
    const response = await axios.post<OAuthTokenResponse>(
      config.ASANA_OAUTH_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.ASANA_CLIENT_ID,
        client_secret: config.ASANA_CLIENT_SECRET,
        redirect_uri: config.ASANA_REDIRECT_URI,
        code,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    console.log(`[AsanaClient] ✓ Successfully exchanged code for tokens`);
    await this.persistTokenResponse(response.data);
  }

  async refreshTokens(): Promise<void> {
    const stored = await tokenStore.get(this.userId);
    if (!stored?.refreshToken) {
      throw new Error('Missing refresh token for user');
    }

    const response = await axios.post<OAuthTokenResponse>(
      config.ASANA_OAUTH_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.ASANA_CLIENT_ID,
        client_secret: config.ASANA_CLIENT_SECRET,
        refresh_token: stored.refreshToken,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    await this.persistTokenResponse(response.data, stored.refreshToken);
  }

  private async ensureValidAccessToken(): Promise<string> {
    console.log(`[AsanaClient] ensureValidAccessToken for userId: ${this.userId}`);
    const stored = await tokenStore.get(this.userId);

    if (!stored) {
      console.error(`[AsanaClient] ❌ NO TOKENS FOUND for userId: ${this.userId}`);
      throw new Error(
        'Asana account not connected. Please visit http://localhost:3011/asana/authorize to connect your Asana account and enable these features.'
      );
    }

    console.log(`[AsanaClient] ✓ Found tokens for userId: ${this.userId}`);
    console.log(`[AsanaClient]   - Token expires: ${stored.expiresAtIso}`);
    console.log(`[AsanaClient]   - Token received: ${stored.receivedAtIso}`);

    const expiry = new Date(stored.expiresAtIso).getTime();
    const now = Date.now();

    if (now > expiry - 60_000) {
      console.log(`[AsanaClient] Token expired or expiring soon, refreshing...`);
      await this.refreshTokens();
      const refreshed = await tokenStore.get(this.userId);
      if (!refreshed) {
        throw new Error('Failed to refresh Asana access token');
      }
      console.log(`[AsanaClient] ✓ Token refreshed successfully`);
      return refreshed.accessToken;
    }

    console.log(`[AsanaClient] ✓ Using existing valid token`);
    return stored.accessToken;
  }

  private async getWorkspaceSummary(gid: string): Promise<WorkspaceSummary> {
    console.log('[AsanaClient] getWorkspaceSummary for gid:', gid);

    try {
      const response = await this.http.get<{ data: { gid: string; name: string } }>(
        `/workspaces/${gid}`,
        { params: { opt_fields: 'gid,name' } }
      );

      console.log('[AsanaClient] ✓ getWorkspaceSummary succeeded:', response.data.data.name);

      return {
        gid: response.data.data.gid,
        name: response.data.data.name,
      };
    } catch (error) {
      console.error('[AsanaClient] ❌ getWorkspaceSummary failed');
      if (axios.isAxiosError(error)) {
        console.error('[AsanaClient] Status:', error.response?.status);
        console.error('[AsanaClient] Response data:', JSON.stringify(error.response?.data, null, 2));
      }
      throw error;
    }
  }

  private async persistTokenResponse(
    tokenResponse: OAuthTokenResponse,
    fallbackRefreshToken?: string
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

    const tokenSet: StoredTokenSet = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token ?? fallbackRefreshToken ?? '',
      expiresAtIso: expiresAt.toISOString(),
      receivedAtIso: new Date().toISOString(),
    };

    console.log(`[AsanaClient] Persisting tokens for userId: ${this.userId}`);
    console.log(`[AsanaClient]   - Expires at: ${tokenSet.expiresAtIso}`);
    await tokenStore.set(this.userId, tokenSet);
    console.log(`[AsanaClient] ✓ Tokens persisted successfully`);
  }
}