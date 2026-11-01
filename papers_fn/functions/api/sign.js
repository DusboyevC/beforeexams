// Issues a short-lived signed link to a PDF for a signed-in user.
// Checks the Supabase access token (asymmetric keys via JWKS, or the legacy HS256 secret if SUPABASE_JWT_SECRET is set).
import { hmac } from "../_middleware.js";
const ALLOWED_ORIGINS = ["https://beforexams.netlify.app", "https://beforeexams.netlify.app", "http://localhost:8123"];
let jwksCache = null, jwksAt = 0;

export async function onRequest(ctx) {
  const origin = ctx.request.headers.get("Origin") || "";
  const cors = { "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0], "Access-Control-Allow-Headers": "Authorization, X-Access-Password", "Vary": "Origin" };
  if (ctx.request.method === "OPTIONS") return new Response(null, { headers: cors });
  const params = new URL(ctx.request.url).searchParams;
  const pass = ctx.request.headers.get("X-Access-Password") || "";
  const guest = Boolean(ctx.env.ACCESS_PASSWORD) && pass === ctx.env.ACCESS_PASSWORD;
  if (params.get("check")) return new Response(JSON.stringify({ ok: guest }), { status: guest ? 200 : 403, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  const token = (ctx.request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const user = guest || (token && await verify(token, ctx.env).catch(() => null));
  if (!user) return new Response(JSON.stringify({ error: "login" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  const path = params.get("path") || "";
  if (!path.startsWith("/") || !path.toLowerCase().endsWith(".pdf") || path.includes("..")) return new Response("bad path", { status: 400, headers: cors });
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const sig = await hmac(ctx.env.LINK_SECRET, path + "|" + exp);
  const base = new URL(ctx.request.url).origin;
  const signed = base + path.split("/").map(encodeURIComponent).join("/") + "?e=" + exp + "&s=" + sig;
  return new Response(JSON.stringify({ url: signed }), { headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

function b64urlToBytes(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); }
async function verify(token, env) {
  const [h, p, s] = token.split(".");
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h)));
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)));
  if (!payload.exp || payload.exp < Date.now() / 1000) return null;
  if (env.SUPABASE_URL && payload.iss && !payload.iss.startsWith(env.SUPABASE_URL)) return null;
  const data = new TextEncoder().encode(h + "." + p), sig = b64urlToBytes(s);
  let ok = false;
  if (header.alg === "HS256" && env.SUPABASE_JWT_SECRET) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.SUPABASE_JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    ok = await crypto.subtle.verify("HMAC", key, sig, data);
  } else if (header.alg === "ES256" || header.alg === "RS256") {
    if (!jwksCache || Date.now() - jwksAt > 3600e3) { jwksCache = await (await fetch(env.SUPABASE_URL + "/auth/v1/.well-known/jwks.json")).json(); jwksAt = Date.now(); }
    const jwk = (jwksCache.keys || []).find((k) => k.kid === header.kid);
    if (!jwk) return null;
    const alg = header.alg === "ES256" ? { name: "ECDSA", namedCurve: "P-256" } : { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
    const key = await crypto.subtle.importKey("jwk", jwk, alg, false, ["verify"]);
    ok = await crypto.subtle.verify(header.alg === "ES256" ? { name: "ECDSA", hash: "SHA-256" } : alg, key, sig, data);
  }
  return ok && payload.role === "authenticated" ? payload : null;
}
