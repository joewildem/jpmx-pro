const encode = (bytes) => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');

async function sign(value, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return encode(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))));
}

const page = (origin, message) => new Response(`<!doctype html><meta charset="utf-8"><title>JPMX authorization</title><p>Authorization complete. This window can close.</p><script>const origin=${JSON.stringify(origin)};const message=${JSON.stringify(message).replaceAll('<','\\u003c')};addEventListener('message',event=>{if(event.origin===origin&&event.data==='authorizing:github')opener?.postMessage(message,origin)});opener?.postMessage('authorizing:github',origin);<\/script>`, {
  headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'" },
});

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') || '';
  const cookie = request.headers.get('Cookie')?.match(/(?:^|; )jpmx_oauth=([^;]+)/)?.[1] || '';
  const [storedState, signature] = cookie.split('.');
  const expected = storedState && env.OAUTH_COOKIE_SECRET ? await sign(storedState, env.OAUTH_COOKIE_SECRET) : '';
  if (!state || state !== storedState || signature !== expected) return page(url.origin, `authorization:github:error:${JSON.stringify({ message: 'Invalid OAuth state.' })}`);
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code: url.searchParams.get('code'), redirect_uri: `${url.origin}/api/callback` }),
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) return page(url.origin, `authorization:github:error:${JSON.stringify({ message: result.error_description || 'GitHub authorization failed.' })}`);
  return page(url.origin, `authorization:github:success:${JSON.stringify({ token: result.access_token, provider: 'github' })}`);
}
