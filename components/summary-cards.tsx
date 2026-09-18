import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobSummary } from "@/lib/jobs";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  summary: JobSummary;
  isLoading: boolean;
}

// One accent per metric, and only where the number signals a problem.
const cards: { key: keyof JobSummary; label: string; valueClassName?: string }[] = [
  { key: "total", label: "Total Jobs" },
  { key: "delayed", label: "Delayed", valueClassName: "text-red-600" },
  { key: "dueSoon", label: "Due Soon", valueClassName: "text-amber-600" },
  { key: "completed", label: "Completed", valueClassName: "text-emerald-600" },
];

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key} size="sm">
          <CardHeader>
            <CardDescription className="text-xs font-medium tracking-wide uppercase">
              {card.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              <p
                className={cn(
                  "text-2xl font-semibold tabular-nums",
                  card.valueClassName
                )}
              >
                {summary[card.key]}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
