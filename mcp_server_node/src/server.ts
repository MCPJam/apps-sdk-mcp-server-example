
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  type GetTaskInput,
  type GetTaskResult,
  type ListTasksDueTodayInput,
  type SearchTasksInput,
  type SearchTasksResult,
  type TaskListResult,
  type UpdateTaskInput,
  type UpdateTaskResult,
  type WorkspaceListResult,
} from '@asana-chatgpt-app/shared-types';
import { config } from './config.js';
import { ensureAuthorized } from './auth.js';
import { AsanaClient } from './asanaClient.js';

const taskInputSchema = z.object({
  workspaceGid: z.string().min(1, 'workspaceGid is required'),
  includeCompleted: z.boolean().optional(),
}) satisfies z.ZodType<ListTasksDueTodayInput>;

const searchTasksInputSchema = z.object({
  workspaceGid: z.string().min(1, 'workspaceGid is required'),
  text: z.string().optional(),
  assigneeAny: z.array(z.string()).optional(),
  projectsAny: z.array(z.string()).optional(),
  sectionsAny: z.array(z.string()).optional(),
  tagsAny: z.array(z.string()).optional(),
  followersAny: z.array(z.string()).optional(),
  completed: z.boolean().optional(),
  limit: z.number().optional(),
}) satisfies z.ZodType<SearchTasksInput>;

const getTaskInputSchema = z.object({
  taskGid: z.string().min(1, 'taskGid is required'),
}) satisfies z.ZodType<GetTaskInput>;

const updateTaskInputSchema = z.object({
  taskGid: z.string().min(1, 'taskGid is required'),
  assignee: z.string().nullable().optional(),
  dueOn: z.string().nullable().optional(),
  dueAt: z.string().nullable().optional(),
  completed: z.boolean().optional(),
}) satisfies z.ZodType<UpdateTaskInput>;

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

          // Convert relative and absolute paths to absolute URLs
          html = html.replace(/src="\.\//g, `src="${widgetBaseUrl}/tasks/`);
          html = html.replace(/href="\.\//g, `href="${widgetBaseUrl}/tasks/`);
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

  server.registerTool(
    'search-tasks',
    {
      title: 'Search tasks',
      description:
        'Search for tasks in an Asana workspace using various filters like text, assignee, projects, sections, tags, and completion status.',
      _meta: {
        'openai/outputTemplate': 'ui://widget/tasks.html',
        'openai/toolInvocation/invoking': 'Searching tasks…',
        'openai/toolInvocation/invoked': 'Search results loaded.',
        'openai/widgetAccessible': true,
      },
      annotations: { readOnlyHint: true },
      inputSchema: {
        workspaceGid: z.string().min(1).describe('The workspace GID to search in'),
        text: z.string().optional().describe('Text to search for in task names and descriptions'),
        assigneeAny: z.array(z.string()).optional().describe('Filter by assignee GIDs'),
        projectsAny: z.array(z.string()).optional().describe('Filter by project GIDs'),
        sectionsAny: z.array(z.string()).optional().describe('Filter by section GIDs'),
        tagsAny: z.array(z.string()).optional().describe('Filter by tag GIDs'),
        followersAny: z.array(z.string()).optional().describe('Filter by follower GIDs'),
        completed: z.boolean().optional().describe('Filter by completion status'),
        limit: z.number().optional().describe('Maximum number of results (max 100)'),
      },
    },
    async (input, { authInfo }) => {
      const validatedInput = searchTasksInputSchema.parse(input);
      const userId = ensureAuthorized(authInfo);
      const client = new AsanaClient(userId);
      const result = await client.searchTasks(validatedInput);

      const summary =
        result.taskCount === 0
          ? 'No tasks found matching the search criteria.'
          : `Found ${result.taskCount} task${result.taskCount === 1 ? '' : 's'} matching the search criteria.`;

      return {
        content: [{ type: 'text', text: summary }],
        structuredContent: result satisfies SearchTasksResult,
      };
    }
  );

  server.registerTool(
    'get-task',
    {
      title: 'Get task details',
      description: 'Retrieves detailed information about a single Asana task including notes, tags, and timestamps.',
      annotations: { readOnlyHint: true },
      inputSchema: {
        taskGid: z.string().min(1).describe('The task GID to retrieve'),
      },
    },
    async (input, { authInfo }) => {
      const validatedInput = getTaskInputSchema.parse(input);
      const userId = ensureAuthorized(authInfo);
      const client = new AsanaClient(userId);
      const result = await client.getTask(validatedInput);

      return {
        content: [
          {
            type: 'text',
            text: `Retrieved task: ${result.task.name}`,
          },
        ],
        structuredContent: result satisfies GetTaskResult,
      };
    }
  );

  server.registerTool(
    'update-task',
    {
      title: 'Update task',
      description: 'Updates a task in Asana. Can modify assignee, due dates, and completion status.',
      _meta: {
        'openai/toolInvocation/invoking': 'Updating task…',
        'openai/toolInvocation/invoked': 'Task updated.',
        'openai/widgetAccessible': true,
      },
      inputSchema: {
        taskGid: z.string().min(1).describe('The task GID to update'),
        assignee: z.string().nullable().optional().describe('User GID to assign the task to, or null to unassign'),
        dueOn: z.string().nullable().optional().describe('Due date in YYYY-MM-DD format, or null to clear'),
        dueAt: z.string().nullable().optional().describe('Due date-time in ISO 8601 format, or null to clear'),
        completed: z.boolean().optional().describe('Mark task as completed (true) or incomplete (false)'),
      },
    },
    async (input, { authInfo }) => {
      try {
        console.log('[MCP Server] update-task called with input:', JSON.stringify(input, null, 2));
        const validatedInput = updateTaskInputSchema.parse(input);
        console.log('[MCP Server] Validated input:', JSON.stringify(validatedInput, null, 2));

        const userId = ensureAuthorized(authInfo);
        const client = new AsanaClient(userId);
        const result = await client.updateTask(validatedInput);

        const changes = [];
        if (validatedInput.assignee !== undefined) {
          changes.push(validatedInput.assignee ? 'assignee updated' : 'assignee removed');
        }
        if (validatedInput.dueOn !== undefined || validatedInput.dueAt !== undefined) {
          changes.push('due date updated');
        }
        if (validatedInput.completed !== undefined) {
          changes.push(validatedInput.completed ? 'marked complete' : 'marked incomplete');
        }

        const summary =
          changes.length > 0
            ? `Updated task "${result.task.name}": ${changes.join(', ')}.`
            : `Task "${result.task.name}" updated.`;

        // Return structured data in the text content so widgets can parse it
        const responseText = JSON.stringify(result);
        console.log('[MCP Server] Returning response text:', responseText);

        return {
          content: [{ type: 'text', text: responseText }],
          structuredContent: result satisfies UpdateTaskResult,
        };
      } catch (error) {
        console.error('[MCP Server] update-task failed with error:', error);
        if (error instanceof Error) {
          console.error('[MCP Server] Error message:', error.message);
          console.error('[MCP Server] Error stack:', error.stack);
        }
        throw error;
      }
    }
  );

  return server;
}