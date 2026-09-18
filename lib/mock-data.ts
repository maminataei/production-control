// Believable demo data. Dates are generated relative to "today" so the
// overdue / due-today / due-soon cases still exist whenever a reviewer opens
// the app, instead of depending on the day this file was written.

import { toDateOnly } from "@/lib/jobs";
import type { Job, Machine, Note } from "@/lib/types";

function dueInDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateOnly(date);
}

function noteFromDaysAgo(days: number, text: string): Note {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(9, 30, 0, 0);
  return { createdAt: date.toISOString(), text };
}

export const machines: Machine[] = [
  { id: "M-01", name: "CNC Mill", status: "operational" },
  { id: "M-02", name: "Injection Molder", status: "operational" },
  { id: "M-03", name: "Hydraulic Press", status: "maintenance" },
  { id: "M-04", name: "CNC Lathe", status: "operational" },
  { id: "M-05", name: "Welding Robot", status: "down" },
  { id: "M-06", name: "Assembly Line", status: "operational" },
];

/**
 * Demo store. The API route reads and updates this array in server memory, so
 * a status change only lasts for the current server process. It is not
 * durable across restarts, cold starts, or redeploys.
 */
export const jobs: Job[] = [
  {
    id: "JOB-1042",
    productName: "Hydraulic Valve HV-220",
    customer: "Aria Industrial Systems",
    quantity: 320,
    dueDate: dueInDays(-5),
    status: "delayed",
    machineId: "M-03",
    notes: [
      noteFromDaysAgo(6, "Press M-03 started leaking hydraulic fluid during setup. Maintenance was called in."),
      noteFromDaysAgo(3, "Replacement seal kit arrived, but the press is still waiting on an inspection slot."),
      noteFromDaysAgo(1, "Customer asked for a new delivery date. No firm estimate yet."),
    ],
  },
  {
    id: "JOB-1043",
    productName: "Steel Bracket A4",
    customer: "Nordwind Maschinenbau",
    quantity: 1500,
    dueDate: dueInDays(-2),
    status: "delayed",
    machineId: "M-01",
    notes: [
      noteFromDaysAgo(4, "Incoming steel sheet failed the thickness check. Material has been re-ordered."),
    ],
  },
  {
    id: "JOB-1044",
    productName: "Aluminum Housing AL-12",
    customer: "Delta Precision Works",
    quantity: 640,
    dueDate: dueInDays(0),
    status: "in-progress",
    machineId: "M-02",
    notes: [],
  },
  {
    id: "JOB-1045",
    productName: "Gear Shaft GS-88",
    customer: "Aria Industrial Systems",
    quantity: 180,
    dueDate: dueInDays(0),
    status: "pending",
    machineId: "M-05",
    notes: [],
  },
  {
    id: "JOB-1046",
    productName: "Bearing Cap BC-40",
    customer: "Kaveh Metalworks",
    quantity: 2400,
    dueDate: dueInDays(1),
    status: "in-progress",
    machineId: "M-04",
    notes: [],
  },
  {
    id: "JOB-1047",
    productName: "Conveyor Roller CR-15",
    customer: "Nordwind Maschinenbau",
    quantity: 96,
    dueDate: dueInDays(2),
    status: "pending",
    machineId: "M-01",
    notes: [],
  },
  {
    id: "JOB-1048",
    productName: "Pump Casing PC-77",
    customer: "Delta Precision Works",
    quantity: 75,
    dueDate: dueInDays(3),
    status: "delayed",
    machineId: "M-06",
    notes: [
      noteFromDaysAgo(2, "Only 40 of 75 castings passed the pressure test. Rework is in progress."),
    ],
  },
  {
    id: "JOB-1049",
    productName: "Drive Flange DF-09",
    customer: "Kaveh Metalworks",
    quantity: 860,
    dueDate: dueInDays(6),
    status: "pending",
    machineId: "M-02",
    notes: [],
  },
  {
    id: "JOB-1050",
    productName: "Steel Bracket A4",
    customer: "Kaveh Metalworks",
    quantity: 3200,
    dueDate: dueInDays(9),
    status: "in-progress",
    machineId: "M-05",
    notes: [],
  },
  {
    id: "JOB-1051",
    productName: "Aluminum Housing AL-12",
    customer: "Aria Industrial Systems",
    quantity: 410,
    dueDate: dueInDays(14),
    status: "pending",
    machineId: "M-03",
    notes: [],
  },
  {
    id: "JOB-1052",
    productName: "Gear Shaft GS-88",
    customer: "Nordwind Maschinenbau",
    quantity: 240,
    dueDate: dueInDays(21),
    status: "in-progress",
    machineId: "M-04",
    notes: [],
  },
  {
    id: "JOB-1053",
    productName: "Hydraulic Valve HV-220",
    customer: "Delta Precision Works",
    quantity: 150,
    dueDate: dueInDays(-12),
    status: "completed",
    machineId: "M-03",
    notes: [],
  },
  {
    id: "JOB-1054",
    productName: "Bearing Cap BC-40",
    customer: "Kaveh Metalworks",
    quantity: 1200,
    dueDate: dueInDays(-3),
    status: "completed",
    machineId: "M-01",
    notes: [],
  },
  {
    // Finished ahead of schedule: a past or future due date alone never makes a
    // completed job "overdue".
    id: "JOB-1055",
    productName: "Conveyor Roller CR-15",
    customer: "Aria Industrial Systems",
    quantity: 520,
    dueDate: dueInDays(5),
    status: "completed",
    machineId: "M-06",
    notes: [],
  },
];
