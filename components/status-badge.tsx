import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type JobStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

// Colour only supports the label: the text always carries the meaning.
const statusStyles: Record<JobStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  "in-progress": "bg-blue-50 text-blue-700",
  delayed: "bg-red-50 text-red-700",
  completed: "bg-emerald-50 text-emerald-700",
};

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={cn("rounded-full", statusStyles[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
