"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, TriangleAlert } from "lucide-react";

import { JobDetailPanel } from "@/components/job-detail-panel";
import { JobsTable } from "@/components/jobs-table";
import { SummaryCards } from "@/components/summary-cards";
import { Toolbar } from "@/components/toolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  filterJobs,
  sortJobs,
  startOfToday,
  summarize,
  type SortDir,
  type SortKey,
} from "@/lib/jobs";
import { machines } from "@/lib/mock-data";
import type { Job, JobStatus, Machine } from "@/lib/types";

// Machines are static, so their lookup map is built once at module scope.
const machinesById: Record<string, Machine> = Object.fromEntries(
  machines.map((machine) => [machine.id, machine])
);

export function Dashboard() {
  // Server data and the one source of truth for the whole dashboard.
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table controls.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Selection and the in-flight status update.
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);

  // Bumped by Retry to run the load effect again.
  const [reloadCount, setReloadCount] = useState(0);

  // Initial load and Retry share this one request path. The cleanup flag stops
  // an older response from overwriting a newer one.
  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) {
          throw new Error("Request failed");
        }
        const data = (await response.json()) as { jobs: Job[] };
        if (!cancelled) {
          setJobs(data.jobs);
          setError(null);
        }
      } catch {
        // Nothing raw from the exception reaches the user.
        if (!cancelled) {
          setError("The server did not respond. Check the connection and try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setReloadCount((count) => count + 1);
  }

  const today = useMemo(() => startOfToday(), []);

  const visibleJobs = useMemo(
    () => sortJobs(filterJobs(jobs, search, statusFilter), sortKey, sortDir),
    [jobs, search, statusFilter, sortKey, sortDir]
  );

  // Metrics describe the whole plant, so they ignore the table filters.
  const summary = useMemo(() => summarize(jobs, today), [jobs, today]);

  const selectedJob = selectedJobId
    ? (jobs.find((job) => job.id === selectedJobId) ?? null)
    : null;

  function handleSortToggle(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  function handleClearFilters() {
    setSearch("");
    setStatusFilter("all"); // the sort preference is deliberately kept
  }

  /** Returns an error message for the panel, or null when the update worked. */
  async function handleStatusChange(
    jobId: string,
    status: JobStatus
  ): Promise<string | null> {
    setUpdatingJobId(jobId);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        return "The status change was rejected. Please try again.";
      }

      const data = (await response.json()) as { job: Job };
      // Replace the one job; the table and the summary recompute themselves.
      setJobs((previous) =>
        previous.map((job) => (job.id === data.job.id ? data.job : job))
      );
      return null;
    } catch {
      return "The server did not respond. The status was not changed.";
    } finally {
      setUpdatingJobId(null);
    }
  }

  const hasNoMatches = !isLoading && error === null && visibleJobs.length === 0;

  return (
    <main className="flex-1 bg-muted/30">
      <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <header>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Production Control
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor production jobs, machine status, and the issues that need
            attention.
          </p>
        </header>

        <SummaryCards summary={summary} isLoading={isLoading} />

        <Card className="gap-0 overflow-hidden py-0">
          <div className="border-b p-3 sm:p-4">
            <Toolbar
              search={search}
              statusFilter={statusFilter}
              sortKey={sortKey}
              sortDir={sortDir}
              resultCount={visibleJobs.length}
              totalCount={jobs.length}
              onSearchChange={setSearch}
              onStatusFilterChange={setStatusFilter}
              onSortChange={(key, dir) => {
                setSortKey(key);
                setSortDir(dir);
              }}
              onClearFilters={handleClearFilters}
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 px-4 py-14 text-center"
            >
              <TriangleAlert className="size-8 text-amber-600" />
              <div>
                <p className="font-medium">Jobs could not be loaded</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          ) : hasNoMatches ? (
            <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
              <Inbox className="size-8 text-muted-foreground" />
              <div>
                <p className="font-medium">No jobs match your filters</p>
                <p className="text-sm text-muted-foreground">
                  Try a different search term or status.
                </p>
              </div>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <JobsTable
              jobs={visibleJobs}
              machinesById={machinesById}
              today={today}
              sortKey={sortKey}
              sortDir={sortDir}
              selectedJobId={selectedJobId}
              isLoading={isLoading}
              onSort={handleSortToggle}
              onSelect={setSelectedJobId}
            />
          )}
        </Card>

        <JobDetailPanel
          job={selectedJob}
          machine={selectedJob ? machinesById[selectedJob.machineId] : undefined}
          isUpdating={selectedJob !== null && updatingJobId === selectedJob.id}
          onClose={() => setSelectedJobId(null)}
          onStatusChange={handleStatusChange}
        />
      </div>
    </main>
  );
}
