import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ISai origins allowed to receive a VSC session token.
const ALLOWED_ISAI_ORIGINS = [
  process.env.ISAI_APP_URL || "http://localhost:5555",
];

/**
 * SSO authorize endpoint for the standalone ISai app.
 * ISai redirects the member here; if they aren't signed in we bounce them to
 * the VSC login and back. Once authenticated we hand a Supabase access token
 * to ISai via the URL fragment, which ISai validates against the same project.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUri = searchParams.get("redirect_uri");
  if (!redirectUri) {
    return NextResponse.json({ error: "Missing redirect_uri" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(redirectUri);
  } catch {
    return NextResponse.json({ error: "Invalid redirect_uri" }, { status: 400 });
  }
  if (!ALLOWED_ISAI_ORIGINS.includes(target.origin)) {
    return NextResponse.json({ error: "redirect_uri origin not allowed" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Not signed in → send to the VSC login, then return here to finish SSO.
    const next = `/sso/isai?redirect_uri=${encodeURIComponent(redirectUri)}`;
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }

  // Signed in → hand the access token back to ISai in the fragment so it never
  // lands in query strings, referrers, or server logs. ISai validates it.
  target.hash = `vsc_token=${session.access_token}`;
  return NextResponse.redirect(target.toString());
}
