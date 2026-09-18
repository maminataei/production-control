import { NextResponse } from "next/server";

import { jobs } from "@/lib/mock-data";

// GET /api/jobs -> 200 { jobs: Job[] }
export async function GET() {
  try {
    return NextResponse.json({ jobs });
  } catch {
    return NextResponse.json({ error: "Could not load jobs" }, { status: 500 });
  }
}
