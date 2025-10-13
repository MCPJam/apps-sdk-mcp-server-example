import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  MCP_HTTP_PORT: z.coerce.number().int().positive().default(3000),
  ASANA_CLIENT_ID: z.string().min(1),
  ASANA_CLIENT_SECRET: z.string().min(1),
  ASANA_REDIRECT_URI: z.string().url(),
  ASANA_BASE_URL: z.string().url().default('https://app.asana.com/api/1.0'),
  ASANA_OAUTH_AUTHORIZE_URL: z
    .string()
    .url()
    .default('https://app.asana.com/-/oauth_authorize'),
  ASANA_OAUTH_TOKEN_URL: z
    .string()
    .url()
    .default('https://app.asana.com/-/oauth_token'),
  FRONTEND_DOMAIN: z.string().url(),
  SERVER_BASE_URL: z.string().url().optional(),
  STYTCH_PROJECT_ID: z.string().min(1),
  STYTCH_PROJECT_SECRET: z.string().min(1),
  STYTCH_DOMAIN: z.string().url(),
  STYTCH_ENVIRONMENT: z.enum(['test', 'live']).default('test'),
  DEV_MODE: z.coerce.boolean().default(false),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    'Invalid environment configuration for MCP server:',
    parsed.error.flatten().fieldErrors
  );
  process.exit(1);
}

const data = parsed.data;

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export const config = {
  ...data,
  STYTCH_DOMAIN: stripTrailingSlash(data.STYTCH_DOMAIN),
  FRONTEND_DOMAIN: stripTrailingSlash(data.FRONTEND_DOMAIN),
  SERVER_BASE_URL: data.SERVER_BASE_URL
    ? stripTrailingSlash(data.SERVER_BASE_URL)
    : undefined,
};