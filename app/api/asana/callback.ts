import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'stytch';

const ASANA_CLIENT_ID = '1211620390541079';
const ASANA_CLIENT_SECRET = process.env.ASANA_CLIENT_SECRET!;
const FRONTEND_DOMAIN = process.env.VITE_FRONTEND_DOMAIN || 'http://localhost:3011';

const stytchClient = new Client({
  project_id: process.env.STYTCH_PROJECT_ID!,
  secret: process.env.STYTCH_PROJECT_SECRET!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { code, state, error } = req.query;

    console.log('========================================');
    console.log('ASANA OAUTH CALLBACK (Vercel):');
    console.log('Query params:', { code: code ? '***exists***' : 'missing', state, error });

    if (error) {
      console.error('OAuth callback received error:', error);
      return res.redirect(`${FRONTEND_DOMAIN}/?error=${encodeURIComponent(error as string)}`);
    }

    if (!code || !state) {
      console.error('Missing code or state parameter');
      return res.redirect(
        `${FRONTEND_DOMAIN}/?error=${encodeURIComponent('Missing code or state parameter')}`
      );
    }

    // The state parameter contains the Stytch user ID
    const userId = state as string;

    console.log('🔑 State parameter (userId):', userId);
    console.log('   Exchanging code for tokens...');

    // Exchange code for tokens
    const tokenResponse = await fetch('https://app.asana.com/-/oauth_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: ASANA_CLIENT_ID,
        client_secret: ASANA_CLIENT_SECRET,
        redirect_uri: `${req.headers.host?.includes('localhost') ? 'http' : 'https'}://${req.headers.host}/api/asana/callback`,
        code: code as string,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return res.redirect(
        `${FRONTEND_DOMAIN}/?error=${encodeURIComponent('Failed to exchange authorization code')}`
      );
    }

    const tokens = await tokenResponse.json();
    console.log('✓ Tokens received from Asana');

    // Store tokens in Stytch user's trusted_metadata
    // Format must match what MCP server expects (see tokenStore.ts)
    try {
      const userResponse = await stytchClient.users.get({ user_id: userId });
      const existingMetadata = userResponse.trusted_metadata || {};

      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      await stytchClient.users.update({
        user_id: userId,
        trusted_metadata: {
          ...existingMetadata,
          asanaTokens: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAtIso: expiresAt.toISOString(),
            receivedAtIso: new Date().toISOString(),
          },
        },
      });
      console.log('✓ Tokens stored in Stytch user metadata');
    } catch (metadataError) {
      console.error('Failed to store tokens in Stytch:', metadataError);
      return res.redirect(
        `${FRONTEND_DOMAIN}/?error=${encodeURIComponent('Failed to store Asana credentials')}`
      );
    }

    console.log('✓ OAuth callback completed successfully');

    // Redirect back to frontend with success
    return res.redirect(`${FRONTEND_DOMAIN}/?asana_connected=true`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error during Asana authorization';
    return res.redirect(`${FRONTEND_DOMAIN}/?error=${encodeURIComponent(errorMessage)}`);
  }
}
