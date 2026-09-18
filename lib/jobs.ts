// Pure helpers for the job list. No React here, so the business rules can be
// read and reasoned about on their own.

import type { Job, JobStatus } from "@/lib/types";

export type SortKey = "dueDate" | "quantity";
export type SortDir = "asc" | "desc";

export interface JobSummary {
  total: number;
  delayed: number;
  dueSoon: number;
  completed: number;
}

export type DueTone = "overdue" | "today" | "soon" | "normal";

export interface DueDescription {
  label: string | null; // relative urgency text, null when the plain date is enough
  tone: DueTone;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Today at local midnight, so every comparison stays on whole calendar days. */
export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Parse "2025-05-02" as a local date. Reading the parts by hand avoids the UTC
 * interpretation of new Date("2025-05-02"), which can shift the day.
 */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Local date as "YYYY-MM-DD" (never toISOString, which shifts by timezone). */
export function toDateOnly(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Whole days from today to a due date. Negative means the date has passed. */
export function daysUntil(dueDate: string, today: Date): number {
  const due = parseDateOnly(dueDate).getTime();
  return Math.round((due - today.getTime()) / MS_PER_DAY);
}

export function formatDate(dueDate: string): string {
  return parseDateOnly(dueDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** For note timestamps, which are real ISO datetimes. */
export function formatTimestamp(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function pluralDays(days: number): string {
  return days === 1 ? "day" : "days";
}

/** "3 days overdue" / "Due today" / "in 2 days"; null when the date speaks for itself. */
export function describeDueDate(
  dueDate: string,
  status: JobStatus,
  today: Date
): DueDescription {
  // Without a completion timestamp we cannot prove a finished job was late.
  if (status === "completed") {
    return { label: null, tone: "normal" };
  }

  const days = daysUntil(dueDate, today);

  if (days < 0) {
    const overdue = Math.abs(days);
    return { label: `${overdue} ${pluralDays(overdue)} overdue`, tone: "overdue" };
  }
  if (days === 0) {
    return { label: "Due today", tone: "today" };
  }
  if (days <= 3) {
    return { label: `in ${days} ${pluralDays(days)}`, tone: "soon" };
  }
  return { label: null, tone: "normal" };
}

/** Search is trimmed and case-insensitive across product, customer, and job ID. */
export function filterJobs(
  jobs: Job[],
  search: string,
  statusFilter: JobStatus | "all"
): Job[] {
  const term = search.trim().toLowerCase();

  return jobs.filter((job) => {
    if (statusFilter !== "all" && job.status !== statusFilter) {
      return false;
    }
    if (term === "") {
      return true;
    }
    return (
      job.productName.toLowerCase().includes(term) ||
      job.customer.toLowerCase().includes(term) ||
      job.id.toLowerCase().includes(term)
    );
  });
}

export function sortJobs(jobs: Job[], sortKey: SortKey, sortDir: SortDir): Job[] {
  const direction = sortDir === "asc" ? 1 : -1;

  // Copy first: the caller's state array must never be reordered in place.
  return [...jobs].sort((a, b) => {
    // "YYYY-MM-DD" strings compare correctly as text, so no date parsing here.
    const difference =
      sortKey === "quantity"
        ? a.quantity - b.quantity
        : a.dueDate.localeCompare(b.dueDate);

    if (difference !== 0) {
      return difference * direction;
    }
    return a.id.localeCompare(b.id); // predictable tie-breaker
  });
}

/** Metrics always describe the whole plant, not the filtered table. */
export function summarize(jobs: Job[], today: Date): JobSummary {
  const unfinished = jobs.filter((job) => job.status !== "completed");

  return {
    total: jobs.length,
    delayed: jobs.filter((job) => job.status === "delayed").length,
    completed: jobs.filter((job) => job.status === "completed").length,
    // Due soon = unfinished work due today through the next 3 calendar days.
    dueSoon: unfinished.filter((job) => {
      const days = daysUntil(job.dueDate, today);
      return days >= 0 && days <= 3;
    }).length,
  };
}
