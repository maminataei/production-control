"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortDir, SortKey } from "@/lib/jobs";
import { JOB_STATUSES, STATUS_LABELS, type JobStatus } from "@/lib/types";

interface ToolbarProps {
  search: string;
  statusFilter: JobStatus | "all";
  sortKey: SortKey;
  sortDir: SortDir;
  resultCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: JobStatus | "all") => void;
  onSortChange: (key: SortKey, dir: SortDir) => void;
  onClearFilters: () => void;
}

const statusItems: Record<string, string> = {
  all: "All statuses",
  ...STATUS_LABELS,
};

// The sort select packs the field and the direction into one value, and is
// looked up again on change so no value has to be cast by hand.
const SORT_OPTIONS: Record<string, { key: SortKey; dir: SortDir; label: string }> = {
  "dueDate-asc": { key: "dueDate", dir: "asc", label: "Due date ↑" },
  "dueDate-desc": { key: "dueDate", dir: "desc", label: "Due date ↓" },
  "quantity-asc": { key: "quantity", dir: "asc", label: "Quantity ↑" },
  "quantity-desc": { key: "quantity", dir: "desc", label: "Quantity ↓" },
};

const sortItems: Record<string, string> = Object.fromEntries(
  Object.entries(SORT_OPTIONS).map(([value, option]) => [value, option.label])
);

export function Toolbar({
  search,
  statusFilter,
  sortKey,
  sortDir,
  resultCount,
  totalCount,
  onSearchChange,
  onStatusFilterChange,
  onSortChange,
  onClearFilters,
}: ToolbarProps) {
  const hasFilters = search.trim() !== "" || statusFilter !== "all";

  function handleSortChange(value: string | null) {
    const option = value ? SORT_OPTIONS[value] : undefined;
    if (option) {
      onSortChange(option.key, option.dir);
    }
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search product, customer, or job ID"
            aria-label="Search jobs"
            className="pl-8"
          />
        </div>

        <Select
          items={statusItems}
          value={statusFilter}
          onValueChange={(value) => {
            if (value !== null) {
              onStatusFilterChange(value);
            }
          }}
        >
          <SelectTrigger aria-label="Filter by status" className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {JOB_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={sortItems}
          value={`${sortKey}-${sortDir}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger aria-label="Sort jobs" className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_OPTIONS).map(([value, option]) => (
              <SelectItem key={value} value={value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" onClick={onClearFilters} disabled={!hasFilters}>
          <X />
          Clear filters
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {resultCount} of {totalCount} jobs
      </p>
    </div>
  );
}
