"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  describeDueDate,
  formatDate,
  type DueTone,
  type SortDir,
  type SortKey,
} from "@/lib/jobs";
import type { Job, Machine } from "@/lib/types";

interface JobsTableProps {
  jobs: Job[];
  machinesById: Record<string, Machine>;
  today: Date;
  sortKey: SortKey;
  sortDir: SortDir;
  selectedJobId: string | null;
  isLoading: boolean;
  onSort: (key: SortKey) => void;
  onSelect: (jobId: string) => void;
}

const dueToneClasses: Record<DueTone, string> = {
  overdue: "text-red-600",
  today: "text-amber-600",
  soon: "text-amber-600/90",
  normal: "text-muted-foreground",
};

const SKELETON_ROWS = 5;

function DueDateCell({ job, today }: { job: Job; today: Date }) {
  const { label, tone } = describeDueDate(job.dueDate, job.status, today);

  return (
    <div className={dueToneClasses[tone]}>
      <div>{formatDate(job.dueDate)}</div>
      {label && <div className="text-xs">{label}</div>}
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  column: SortKey;
  align?: "left" | "right";
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

function SortableHeader({
  label,
  column,
  align = "left",
  sortKey,
  sortDir,
  onSort,
}: SortableHeaderProps) {
  const isActive = sortKey === column;
  const Icon = isActive ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead
      className={align === "right" ? "text-right" : undefined}
      aria-sort={
        isActive ? (sortDir === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <Button
        variant="ghost"
        size="sm"
        className={align === "right" ? "-mr-2" : "-ml-2"}
        onClick={() => onSort(column)}
      >
        {label}
        <Icon className={isActive ? undefined : "text-muted-foreground"} />
        {isActive && (
          <span className="sr-only">
            {sortDir === "asc" ? "(sorted ascending)" : "(sorted descending)"}
          </span>
        )}
      </Button>
    </TableHead>
  );
}

export function JobsTable({
  jobs,
  machinesById,
  today,
  sortKey,
  sortDir,
  selectedJobId,
  isLoading,
  onSort,
  onSelect,
}: JobsTableProps) {
  return (
    <Table>
      <TableCaption className="sr-only">
        Production jobs, sorted by {sortKey === "dueDate" ? "due date" : "quantity"}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Job ID</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Customer</TableHead>
          <SortableHeader
            label="Quantity"
            column="quantity"
            align="right"
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={onSort}
          />
          <SortableHeader
            label="Due Date"
            column="dueDate"
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={onSort}
          />
          <TableHead>Machine</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading
          ? Array.from({ length: SKELETON_ROWS }).map((_, row) => (
              <TableRow key={row}>
                {Array.from({ length: 7 }).map((__, cell) => (
                  <TableCell key={cell}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : jobs.map((job) => {
              const machine = machinesById[job.machineId];

              return (
                <TableRow
                  key={job.id}
                  data-state={job.id === selectedJobId ? "selected" : undefined}
                  className="cursor-pointer"
                  onClick={() => onSelect(job.id)}
                >
                  <TableCell>
                    {/* A real focusable control, so the row is not mouse-only. */}
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(job.id);
                      }}
                    >
                      {job.id}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{job.productName}</TableCell>
                  <TableCell>{job.customer}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {job.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DueDateCell job={job} today={today} />
                  </TableCell>
                  <TableCell>
                    <div>{machine ? machine.name : "Unassigned"}</div>
                    <div className="text-xs text-muted-foreground">
                      {job.machineId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>
                </TableRow>
              );
            })}
      </TableBody>
    </Table>
  );
}
