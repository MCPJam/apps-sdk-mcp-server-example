# Security Verification Guide: Multi-User Token Isolation

## CRITICAL: Preventing Token Leakage Between Users

This guide helps verify that Asana tokens are properly isolated per user and cannot leak between different users.

## What We're Verifying

The system must ensure that:
1. Each user's Stytch ID is correctly extracted from their bearer token
2. The Stytch user ID used during Asana OAuth matches the ID from token introspection
3. Each user's Asana tokens are stored and retrieved using their unique user ID
4. No user can access another user's Asana data

## Added Security Logging

Comprehensive logging has been added at every critical point in the auth flow:

### 1. Stytch Token Introspection (`mcp_server_node/src/stytch.ts`)
- Logs the full token introspection response from Stytch
- Shows which user ID fields are available: `subject`, `sub`, `userId`, `user_id`

### 2. User ID Extraction (`mcp_server_node/src/auth.ts`)
- Shows the extracted user ID for each MCP request
- **WARNING** if falling back to `DEFAULT_USER_ID = 'demo-user'`
- If you see this warning, it means user IDs are NOT being extracted - **CRITICAL BUG**

### 3. Asana Client Operations (`mcp_server_node/src/asanaClient.ts`)
- Shows which user ID the AsanaClient is created for
- Logs when tokens are loaded/saved for each user
- Shows token expiration times to verify correct tokens are used

### 4. OAuth Callback (`mcp_server_node/src/index.ts`)
- Shows the state parameter (should be Stytch user ID)
- Confirms which user ID is receiving the Asana tokens

### 5. Frontend Authorization Start (`app/src/AsanaAuthorize.tsx`)
- Shows the Stytch user object
- Logs which user ID is being sent as the state parameter

## How to Verify Token Isolation

### Step 1: Start the MCP Server
```bash
cd mcp_server_node
npm run dev
```

Watch the console output carefully.

### Step 2: Start the Frontend
```bash
cd app
npm run dev
```

### Step 3: Test with First User

1. Open browser (or incognito window #1)
2. Go to `http://localhost:3011`
3. Click "Connect Asana Account"
4. Login with Google (first user)
5. Authorize Asana

**Look for these logs in the MCP server console:**

```
ASANA AUTHORIZATION FLOW STARTING
🔑 CRITICAL: Using user.user_id as state parameter: user-live-xxxxx
```

```
ASANA OAUTH CALLBACK:
State parameter (userId): user-live-xxxxx
```

```
[AsanaClient] Persisting tokens for userId: user-live-xxxxx
```

**Record the user ID**: `user-live-xxxxx` (this is User A)

### Step 4: Test MCP Request as First User

Make an MCP request (e.g., via ChatGPT or MCP client) with User A's bearer token.

**Look for these logs:**

```
STYTCH TOKEN INTROSPECTION RESPONSE:
  - subject: user-live-xxxxx
  (or sub, userId, user_id)
```

```
USER ID EXTRACTION:
Extracted userId: user-live-xxxxx
✓ Successfully extracted user-specific ID
```

```
[AsanaClient] Creating client for userId: user-live-xxxxx
[AsanaClient] ✓ Found tokens for userId: user-live-xxxxx
```

### Step 5: Test with Second User

1. Open a NEW incognito window
2. Go to `http://localhost:3011`
3. Login with a DIFFERENT Google account (second user)
4. Connect Asana

**Record the new user ID**: `user-live-yyyyy` (this is User B)

### Step 6: Verify User Isolation

**Check the token store file:**
```bash
cat mcp_server_node/.data/asana-tokens.json
```

You should see TWO separate entries:
```json
{
  "user-live-xxxxx": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAtIso": "...",
    "receivedAtIso": "..."
  },
  "user-live-yyyyy": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAtIso": "...",
    "receivedAtIso": "..."
  }
}
```

### Step 7: Verify Correct Token Retrieval

Make an MCP request with User B's bearer token.

**The logs MUST show:**
```
Extracted userId: user-live-yyyyy
[AsanaClient] Creating client for userId: user-live-yyyyy
[AsanaClient] ✓ Found tokens for userId: user-live-yyyyy
```

**NOT User A's ID!**

## Critical Checks

### ✅ PASS Criteria

1. **Different user IDs**: Each user has a unique Stytch user ID
2. **Consistent IDs**: The same user ID appears in:
   - Frontend: `user.user_id`
   - OAuth callback: `state` parameter
   - Token introspection: one of `subject`/`sub`/`userId`/`user_id`
   - AsanaClient: `userId` passed to constructor
3. **Separate token storage**: Token file has one entry per user
4. **No DEFAULT_USER_ID warnings**: Never see "Using DEFAULT_USER_ID"
5. **Correct token loading**: Each MCP request loads tokens for the correct user

### ❌ FAIL Criteria (CRITICAL BUGS)

1. **DEFAULT_USER_ID warning appears**: User ID extraction is failing
2. **All users share same ID**: Token leakage - all users accessing same Asana account
3. **Mismatched IDs**: State parameter doesn't match token introspection ID
4. **Wrong tokens loaded**: User A's request loads User B's tokens

## Expected Stytch Token Fields

According to Stytch documentation, the token introspection should return one of:
- `sub` (standard JWT claim for subject/user ID)
- `subject`
- `user_id` (Stytch-specific)

**Verify which field your Stytch setup uses** by checking the first log output from `stytchVerifier`.

## If Verification Fails

### Problem: DEFAULT_USER_ID warning appears

**Cause**: Stytch token introspection doesn't return a user ID in expected fields.

**Fix**: Update `mcp_server_node/src/auth.ts` to extract the correct field:
```typescript
const subject = extra['ACTUAL_FIELD_NAME_HERE'];
```

### Problem: User IDs don't match between OAuth and MCP

**Cause**: Frontend sends different ID than what's in the token.

**Fix**: Ensure `user.user_id` from Stytch React SDK matches the ID in introspection.

### Problem: Tokens stored but not retrieved

**Cause**: User ID format mismatch (e.g., whitespace, case sensitivity).

**Fix**: Add normalization in `auth.ts`:
```typescript
return subject.trim().toLowerCase();
```

## Cleanup After Testing

To reset tokens between tests:
```bash
rm mcp_server_node/.data/asana-tokens.json
```

## Production Recommendations

Once verified:
1. **Keep critical logging**: Keep USER ID EXTRACTION warnings
2. **Remove verbose logs**: Can remove detailed token introspection logs
3. **Add monitoring**: Alert if DEFAULT_USER_ID is ever used
4. **Add audit logging**: Log which user accesses which Asana workspaces
5. **Test with multiple users regularly**: Verify isolation doesn't break
