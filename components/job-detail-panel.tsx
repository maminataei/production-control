"use client";

import { useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDate, formatTimestamp } from "@/lib/jobs";
import {
  JOB_STATUSES,
  MACHINE_STATUS_LABELS,
  STATUS_LABELS,
  type Job,
  type JobStatus,
  type Machine,
} from "@/lib/types";

interface JobDetailPanelProps {
  job: Job | null;
  machine?: Machine;
  isUpdating: boolean;
  onClose: () => void;
  /** Resolves with an error message, or null when the update succeeded. */
  onStatusChange: (jobId: string, status: JobStatus) => Promise<string | null>;
}

const statusItems: Record<string, string> = { ...STATUS_LABELS };

const sectionHeading =
  "text-xs font-medium tracking-wide text-muted-foreground uppercase";

/** The pending status change, together with its inline error. */
interface StatusDraft {
  jobId: string;
  status: JobStatus;
  error: string | null;
}

export function JobDetailPanel({
  job,
  machine,
  isUpdating,
  onClose,
  onStatusChange,
}: JobDetailPanelProps) {
  const [draft, setDraft] = useState<StatusDraft | null>(null);

  // A draft belongs to exactly one job. Selecting another job stops matching,
  // so the selector starts again from that job's real status, and a successful
  // update needs no syncing because the confirmed status comes back from props.
  const activeDraft = job && draft?.jobId === job.id ? draft : null;
  const draftStatus = activeDraft?.status ?? job?.status ?? "pending";
  const updateError = activeDraft?.error ?? null;
  const hasChange = job !== null && draftStatus !== job.status;

  function handleStatusSelect(status: JobStatus) {
    if (job) {
      setDraft({ jobId: job.id, status, error: null });
    }
  }

  async function handleUpdate() {
    if (!job || !hasChange) return;
    setDraft({ jobId: job.id, status: draftStatus, error: null });
    const error = await onStatusChange(job.id, draftStatus);
    if (error) {
      setDraft({ jobId: job.id, status: draftStatus, error });
    }
  }

  return (
    <Sheet
      open={job !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <SheetContent className="gap-0 data-[side=right]:w-full sm:max-w-md">
        {job && (
          <>
            <SheetHeader className="border-b pr-12">
              <SheetTitle>{job.productName}</SheetTitle>
              <SheetDescription>
                {job.id} · {job.customer}
              </SheetDescription>
            </SheetHeader>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={job.status} />
                <span className="text-sm text-muted-foreground">
                  {job.quantity.toLocaleString()} units
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Job ID</dt>
                  <dd className="mt-0.5 font-medium">{job.id}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Due date</dt>
                  <dd className="mt-0.5 font-medium">{formatDate(job.dueDate)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Customer</dt>
                  <dd className="mt-0.5 font-medium">{job.customer}</dd>
                </div>
              </dl>

              <Separator />

              <section>
                <h3 className={sectionHeading}>Assigned machine</h3>
                <p className="mt-1.5 text-sm font-medium">
                  {machine ? machine.name : "Unknown machine"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {job.machineId}
                  {machine ? ` · ${MACHINE_STATUS_LABELS[machine.status]}` : ""}
                </p>
              </section>

              <Separator />

              <section>
                <h3 className={sectionHeading}>Notes / issues</h3>
                {job.notes.length === 0 ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    No notes recorded for this job.
                  </p>
                ) : (
                  <ul className="mt-1.5 space-y-2">
                    {job.notes.map((note, index) => (
                      <li key={index} className="rounded-lg border p-2.5">
                        <p>{note.text}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatTimestamp(note.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="space-y-3 border-t p-4">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="job-status" className="text-sm font-medium">
                  Update status
                </label>
                <Select
                  items={statusItems}
                  value={draftStatus}
                  onValueChange={(value) => {
                    if (value !== null) {
                      handleStatusSelect(value);
                    }
                  }}
                  disabled={isUpdating}
                >
                  <SelectTrigger id="job-status" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {updateError && (
                <p role="alert" className="text-sm text-red-600">
                  {updateError}
                </p>
              )}

              <Button
                className="w-full"
                disabled={!hasChange || isUpdating}
                onClick={handleUpdate}
              >
                {isUpdating ? "Updating…" : "Update status"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
