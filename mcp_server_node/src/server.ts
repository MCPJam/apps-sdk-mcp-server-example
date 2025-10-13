
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  type ListTasksDueTodayInput,
  type TaskListResult,
  type WorkspaceListResult,
} from '@asana-chatgpt-app/shared-types';
import { config } from './config.js';
import { ensureAuthorized } from './auth.js';
import { AsanaClient } from './asanaClient.js';

const taskInputSchema = z.object({
  workspaceGid: z.string().min(1, 'workspaceGid is required'),
  includeCompleted: z.boolean().optional(),
}) satisfies z.ZodType<ListTasksDueTodayInput>;

const registerAuthCodeSchema = z.object({
  code: z.string().min(6),
});

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'asana-chatgpt-app',
    version: '0.1.0',
  });

  const widgetBaseUrl = config.FRONTEND_DOMAIN.replace(/\/$/, '');

  server.registerResource(
    'tasks-widget',
    'ui://widget/tasks.html',
    {},
    async () => {
      let widgetHtml: string;

      if (config.DEV_MODE) {
        // In dev mode, fetch the full HTML from Vite dev server
        try {
          const response = await fetch(`${widgetBaseUrl}/tasks/`);
          let html = await response.text();

          // Convert relative paths to absolute URLs
          html = html.replace(/src="\/(@vite|tasks)/g, `src="${widgetBaseUrl}/$1`);
          html = html.replace(/href="\/(@vite|tasks)/g, `href="${widgetBaseUrl}/$1`);

          widgetHtml = html;
        } catch (error) {
          console.error('Failed to fetch widget HTML from dev server:', error);
          widgetHtml = `<div>Error loading widget. Is the dev server running on ${widgetBaseUrl}?</div>`;
        }
      } else {
        // In production, use built files
        widgetHtml = `
          <div id="tasks-root"></div>
          <link rel="stylesheet" href="${widgetBaseUrl}/tasks.css">
          <script type="module" src="${widgetBaseUrl}/tasks.js"></script>
        `.trim();
      }

      return {
        contents: [
          {
            uri: 'ui://widget/tasks.html',
            mimeType: 'text/html+skybridge',
            text: widgetHtml,
            _meta: {
              'openai/widgetDescription':
                'Displays Asana tasks that are due today for the selected workspace.',
            },
          },
        ],
      };
    }
  );

  server.registerTool(
    'register-auth-code',
    {
      title: 'Store Asana OAuth code',
      description:
        'Exchanges an Asana OAuth authorization code for access tokens and stores them for the authenticated user.',
      inputSchema: {
        code: z
          .string()
          .min(6)
          .describe('Authorization code returned from Asana'),
      },
    },
    async (input, { authInfo }) => {
      const { code } = registerAuthCodeSchema.parse(input);
      const userId = ensureAuthorized(authInfo);
      const client = new AsanaClient(userId);
      await client.exchangeCodeForTokens(code);

      return {
        content: [
          {
            type: 'text',
            text: 'Asana account connected successfully.',
          },
        ],
      };
    }
  );

  server.registerTool(
    'get-workspaces',
    {
      title: 'List Asana workspaces',
      description: 'Fetches the list of Asana workspaces accessible to the user.',
      annotations: { readOnlyHint: true },
      inputSchema: {},
    },
    async (_input, { authInfo }) => {
      const userId = ensureAuthorized(authInfo);
      const client = new AsanaClient(userId);
      const result = await client.listWorkspaces();

      return {
        content: [
          {
            type: 'text',
            text: `Found ${result.workspaces.length} Asana workspaces.`,
          },
        ],
        structuredContent: result satisfies WorkspaceListResult,
      };
    }
  );

  server.registerTool(
    'list-tasks-due-today',
    {
      title: 'List tasks due today',
      description:
        'Returns tasks due today for the selected Asana workspace, optionally including completed tasks.',
      _meta: {
        'openai/outputTemplate': 'ui://widget/tasks.html',
        'openai/toolInvocation/invoking': 'Fetching tasks due today…',
        'openai/toolInvocation/invoked': 'Tasks loaded.',
        'openai/widgetAccessible': true,
      },
      inputSchema: {
        workspaceGid: z.string().min(1),
        includeCompleted: z.boolean().optional(),
      },
    },
    async (input, { authInfo }) => {
      const validatedInput = taskInputSchema.parse(input);
      const userId = ensureAuthorized(authInfo);
      const client = new AsanaClient(userId);
      const result = await client.listTasksDueToday(validatedInput);

      const summary =
        result.taskCount === 0
          ? 'No tasks due today.'
          : `Fetched ${result.taskCount} task${result.taskCount === 1 ? '' : 's'} due today.`;

      return {
        content: [{ type: 'text', text: summary }],
        structuredContent: result satisfies TaskListResult,
      };
    }
  );

  return server;
}