// Domain types and the small vocabulary helpers the UI shares.

export const JOB_STATUSES = [
  "pending",
  "in-progress",
  "delayed",
  "completed",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

// Keys stay stable in data; the UI always shows the human label.
export const STATUS_LABELS: Record<JobStatus, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  delayed: "Delayed",
  completed: "Completed",
};

export function isJobStatus(value: unknown): value is JobStatus {
  return JOB_STATUSES.includes(value as JobStatus);
}

export type MachineStatus = "operational" | "maintenance" | "down";

export const MACHINE_STATUS_LABELS: Record<MachineStatus, string> = {
  operational: "Operational",
  maintenance: "Maintenance",
  down: "Down",
};

export interface Note {
  createdAt: string; // ISO datetime
  text: string;
}

export interface Job {
  id: string; // "JOB-1042"
  productName: string;
  customer: string;
  quantity: number;
  dueDate: string; // "YYYY-MM-DD" — a calendar date, not a timestamp
  status: JobStatus;
  machineId: string; // "M-03"
  notes: Note[];
}

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
}
