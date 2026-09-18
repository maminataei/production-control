import { NextResponse } from "next/server";

import { jobs } from "@/lib/mock-data";
import { isJobStatus } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/jobs/[id] with { status } -> 200 { job } | 400 | 404
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const index = jobs.findIndex((job) => job.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Unknown job" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const status = (body as { status?: unknown } | null)?.status;
  if (!isJobStatus(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Demo state only: this array lives in server memory for the current
  // process, so an update is not durable across refreshes or redeploys.
  const updated = { ...jobs[index], status };
  jobs[index] = updated;

  return NextResponse.json({ job: updated });
}
