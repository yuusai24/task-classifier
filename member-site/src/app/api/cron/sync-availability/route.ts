import { NextResponse, type NextRequest } from "next/server";
import { syncAvailability } from "@/lib/sync-availability";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await syncAvailability();
  return NextResponse.json(result);
}
