# BRAINBLITZ — Development Notes

## Deployment

After every `git push`, manually deploy to Cloudflare Pages to ensure changes are live:

```bash
npx wrangler pages deploy . --project-name=brainblitz --branch=main --commit-dirty=true
```

The automatic GitHub → Cloudflare Pages pipeline may lag or miss commits. Always run this command after pushing to confirm the deployment.

## webOS Compatibility

The LG TV browser runs an older JS engine. Do NOT use:
- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- Spread syntax (`[...arr]`) — use `[].slice.call(arr)`
- `inset: 0` CSS shorthand — use explicit `top/left/right/bottom: 0`

## Project Structure

Single HTML file (`index.html`) with all CSS + JS inline. Cloudflare Pages Functions in `functions/api/` for KV persistence and TTS proxy.

## Admin Panel

PIN code: `1945` — accessed via ADMIN button on title screen (bottom-right).
