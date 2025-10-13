# Stytch Integration Plan for Asana ChatGPT App

This document captures the tasks required to introduce a Stytch OAuth bridge so MCP clients can rely on Dynamic Client Registration (DCR), while the server still acquires Asana tokens for downstream API calls.

---

## 1. Provision a New Stytch Project

1. Create a new Stytch Consumer project.  
2. Enable the following products:
   - OAuth (Connected Apps with Dynamic Client Registration support)
   - Sessions (to manage authenticated users)
3. Record credentials:
   - `STYTCH_PROJECT_ID`
   - `STYTCH_SECRET`
   - `STYTCH_ENVIRONMENT` (e.g., `test` or `live`)
   - `STYTCH_PUBLIC_TOKEN`
4. Configure OAuth settings:
   - Add redirect URI pointing to the marketing/OAuth app `app/` (e.g., `https://asana-chatgpt-app.vercel.app/oauth/callback`).
   - Enable dynamic client registration for connectors that require it.

---

## 2. Update MCP Metadata to Reference Stytch

1. Modify `metadataHandler` usage in `mcp_server_node/src/index.ts` to return Stytch endpoints:
   - `issuer`, `authorization_endpoint`, `token_endpoint`, and `registration_endpoint` from Stytch’s documentation.
2. Include `registration_endpoint` to satisfy MCP Inspector DCR requirements.
3. Add `scopes_supported` consistent with Stytch configuration (e.g., `openid`, `profile`, `email`).

---

## 3. Stytch Token Verification

1. Add a new utility (similar to Chatagotchi’s `stytch.ts`) for verifying Stytch access tokens.  
2. Replace the existing developer shared secret auth middleware with Stytch token verification.
3. Map Stytch authenticated subjects to internal user IDs (e.g., `authInfo.extra.subject`).

---

## 4. Asana OAuth Exchange via Stytch

1. After Stytch authentication, expose a tool (`register-auth-code`) that:
   - Calls Stytch to initiate an Asana Connected App authorization (Stytch obtains Asana authorization code).
   - Exchanges the code for Asana access/refresh tokens (using Stytch`s OAuth token exchange or direct Asana API call, depending on the setup).
2. Persist Asana tokens in the existing token store (keyed by Stytch user ID).
3. Ensure token refresh uses Stytch-managed credentials.

---

## 5. Environment Variables

Introduce new env vars for the MCP server:

| Variable | Description |
| --- | --- |
| `STYTCH_PROJECT_ID` | New Stytch project identifier. |
| `STYTCH_SECRET` | Secret key for API calls. |
| `STYTCH_ENVIRONMENT` | (optional) `test` or `live`. |
| `STYTCH_OAUTH_ISSUER` | Stytch issuer URL. |
| `STYTCH_OAUTH_AUTHORIZE_URL` | Stytch authorization endpoint. |
| `STYTCH_OAUTH_TOKEN_URL` | Stytch token endpoint. |
| `STYTCH_OAUTH_REGISTRATION_URL` | Dynamic client registration endpoint. |

---

## 6. Marketing App (`app/`) Updates

1. Configure Stytch SDK (similar to Chatagotchi) to handle Stytch login flows.  
2. Implement consent UI for linking Asana accounts, calling into the MCP server/tool.

---

## 7. Testing Checklist

- [ ] `curl` metadata endpoints (`/.well-known/oauth-authorization-server`) return JSON with registration endpoint.  
- [ ] MCP Inspector can connect using DCR.  
- [ ] Stytch login flow works locally (test tokens).  
- [ ] Asana authorization succeeds and tasks can be fetched.  
- [ ] README updated with Stytch setup steps.

---

## Next Actions

1. Update MCP config/schema to include Stytch env vars.  
2. Add Stytch token verification module.  
3. Replace developer auth in `index.ts` with Stytch-based middleware.  
4. Implement Asana + Stytch exchange logic in `register-auth-code`.  
5. Document setup in README.
