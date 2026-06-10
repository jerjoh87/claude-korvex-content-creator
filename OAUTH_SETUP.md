# OAuth Setup

## Required environment variables

```bash
NEXT_PUBLIC_APP_URL=https://your-app.example.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SOCIAL_TOKEN_ENCRYPTION_KEY=long-random-secret-at-least-32-bytes
ENABLE_SOCIAL_AUTO_POSTING=false

META_CLIENT_ID=...
META_CLIENT_SECRET=...
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

For local demos without the existing auth stack wired into route handlers, optional headers or env values can identify the workspace:

```bash
DEMO_USER_ID=demo-user
DEMO_WORKSPACE_ID=demo-workspace
```

Production should pass authenticated user and workspace context from the existing backend/session layer.

## Callback URLs

Register these callback URLs in each provider dashboard:

- Meta Instagram: `${NEXT_PUBLIC_APP_URL}/api/social/oauth/instagram/callback`
- Meta Facebook: `${NEXT_PUBLIC_APP_URL}/api/social/oauth/facebook/callback`
- TikTok: `${NEXT_PUBLIC_APP_URL}/api/social/oauth/tiktok/callback`
- LinkedIn: `${NEXT_PUBLIC_APP_URL}/api/social/oauth/linkedin/callback`
- Google/YouTube: `${NEXT_PUBLIC_APP_URL}/api/social/oauth/youtube/callback`

## Platform scopes

### Instagram/Facebook via Meta

Demo connection uses basic profile/page readiness scopes. Publishing may require Meta permissions such as Instagram content publishing, page management, and app review approval before auto-posting can be enabled.

### TikTok

Demo connection uses basic user info plus upload-readiness scopes. Direct posting requires TikTok Content Posting API approval.

### LinkedIn

Demo connection uses OpenID profile scopes and `w_member_social` readiness. Posting may require approved LinkedIn permissions and product access.

### YouTube Shorts

Demo connection uses Google OAuth and YouTube upload readiness scope. Upload automation requires quota, consent-screen readiness, and Google policy compliance.

## Security checklist

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Keep `SOCIAL_TOKEN_ENCRYPTION_KEY` server-side only.
- Do not log OAuth token payloads.
- Do not expose encrypted token columns through browser APIs.
- Rotate credentials if a provider dashboard secret is exposed.
