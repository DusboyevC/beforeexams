// Locks every PDF on the papers host: a PDF is served only with a valid, unexpired signature
// issued by /api/sign to a signed-in BeforeExams user. Everything else passes through.
export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  if (ctx.env.LOCK !== "on" || !url.pathname.toLowerCase().endsWith(".pdf")) return ctx.next();
  const exp = Number(url.searchParams.get("e") || 0), sig = url.searchParams.get("s") || "";
  if (!exp || exp < Math.floor(Date.now() / 1000)) return deny("This link has expired. Open the paper again from BeforeExams.");
  const good = await hmac(ctx.env.LINK_SECRET, decodeURIComponent(url.pathname) + "|" + exp);
  if (!timingSafe(good, sig)) return deny("This link is not valid. Open the paper from BeforeExams.");
  const res = await ctx.next();
  const r = new Response(res.body, res);
  r.headers.set("Cache-Control", "private, max-age=600");
  r.headers.set("X-Robots-Tag", "noindex");
  return r;
}
function deny(msg) { return new Response(msg, { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } }); }
export async function hmac(secret, text) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const buf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function timingSafe(a, b) { if (a.length !== b.length) return false; let x = 0; for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i); return x === 0; }
