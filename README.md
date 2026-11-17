# Edge Relay

Universal HTTP proxy that forwards requests to a target URL specified via headers. Works on **Vercel Edge Functions**, **Cloudflare Workers**, **Deno Deploy**, **Netlify Functions**, and any platform supporting standard Fetch API.

## How It Works

The relay reads two headers:
- `x-relay-target`: Target base URL (required)
- `x-relay-path`: Path to append (default: `/`)

All other headers and the request body are forwarded transparently.

## Quick Deploy

### Vercel (Edge)
```bash
npm i -g vercel
vercel --prod
```

### Cloudflare Workers
```bash
npm i -g wrangler
wrangler login
wrangler deploy
```

### Deno Deploy
```bash
# Push to GitHub, connect at https://dash.deno.com
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

## Usage

```bash
# Example: Forward to OpenAI
curl -X POST https://your-relay.vercel.app/ \
  -H "x-relay-target: https://api.openai.com" \
  -H "x-relay-path: /v1/chat/completions" \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Hi"}]}'
```

The request goes to: `https://api.openai.com/v1/chat/completions`

## With 9router / Polygate

In 9router dashboard → Proxy Pools → "Add Pool" → choose your platform → enter your API token → deploy.

Or manually add the relay URL to your 9router config:
```json
{
  "name": "my-vercel-relay",
  "proxyUrl": "https://your-relay.vercel.app",
  "type": "vercel",
  "strictProxy": true
}
```

## Local Development

```bash
# With Vercel CLI
vercel dev

# With Wrangler
wrangler dev

# With Netlify CLI
netlify dev
```

## Platform Compatibility

| Platform | Runtime | Status |
|----------|---------|--------|
| Vercel | Edge | ✅ |
| Cloudflare Workers | Workers | ✅ |
| Deno Deploy | Deno | ✅ |
| Netlify | Edge Functions | ✅ |
| AWS Lambda@Edge | Node.js | ✅* |

* Requires minor wrapper adjustment

## License

MIT