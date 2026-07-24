import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { exchangeCodeForTokens, getUserEmail } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  const settingsUrl = new URL("/admin/calendar-settings", request.url);

  if (!code) {
    settingsUrl.searchParams.set("google_error", "1");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    const redirectUri = new URL("/api/google/callback", request.url).toString();
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    if (!tokens.refresh_token) {
      settingsUrl.searchParams.set("google_error", "no_refresh_token");
      return NextResponse.redirect(settingsUrl);
    }

    const email = await getUserEmail(tokens.access_token);

    const service = createServiceClient();
    await service.from("google_calendar_connection").upsert({
      id: true,
      refresh_token: tokens.refresh_token,
      connected_email: email,
      connected_at: new Date().toISOString(),
    });

    settingsUrl.searchParams.set("google_connected", "1");
    return NextResponse.redirect(settingsUrl);
  } catch {
    settingsUrl.searchParams.set("google_error", "1");
    return NextResponse.redirect(settingsUrl);
  }
}
