/**
 * Edge Relay - Universal HTTP Proxy
 *
 * Forwards requests to a target URL specified via headers.
 * Works on: Vercel Edge Functions, Cloudflare Workers, Deno Deploy, Netlify Functions
 *
 * Headers:
 *   x-relay-target: Target base URL (e.g., https://api.openai.com)
 *   x-relay-path:   Path to append (default: /)
 *
 * Example:
 *   POST https://your-relay.vercel.app/
 *   x-relay-target: https://api.openai.com
 *   x-relay-path: /v1/chat/completions
 *   => Forwards to https://api.openai.com/v1/chat/completions
 */

export default async function handler(req, env = {}, ctx = {}) {
  let target, relayPath, method, headers, body;

  if (req instanceof Request) {
    // Standard Fetch API (Vercel Edge, Cloudflare Workers, Deno Deploy)
    target = req.headers.get("x-relay-target");
    relayPath = req.headers.get("x-relay-path") || "/";
    method = req.method;
    headers = new Headers(req.headers);
    body = (method !== "GET" && method !== "HEAD") ? req.body : undefined;
  } else if (req && req.headers) {
    // Netlify Functions format
    const h = {};
    for (const [k, v] of Object.entries(req.headers || {})) h[k.toLowerCase()] = v;
    target = h["x-relay-target"];
    relayPath = h["x-relay-path"] || "/";
    method = req.httpMethod;
    headers = new Headers(req.headers);
    body = (method !== "GET" && method !== "HEAD") ? req.body : undefined;
  } else {
    return new Response(JSON.stringify({ error: "Unsupported request format" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  if (!target) {
    return new Response(JSON.stringify({ error: "Missing x-relay-target header" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const targetUrl = target.replace(/\/$/, "") + relayPath;

  const forwardHeaders = new Headers();
  for (const [k, v] of headers.entries()) {
    const lk = k.toLowerCase();
    if (lk !== "x-relay-target" && lk !== "x-relay-path" && lk !== "host") {
      forwardHeaders.set(k, v);
    }
  }

  try {
    const init = { method, headers: forwardHeaders };
    if (body !== undefined) {
      init.body = body;
      init.duplex = "half";
    }

    const response = await fetch(targetUrl, init);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Relay fetch failed" }), {
      status: 502,
      headers: { "content-type": "application/json" }
    });
  }
}

// Cloudflare Workers: also export as named `fetch` for Wrangler
export { handler as fetch };