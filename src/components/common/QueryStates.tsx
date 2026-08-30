import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function LoadingBlock({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={className ?? "space-y-2 p-3"}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

export function EmptyBlock({ message = "No data available" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function ErrorBlock({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-sm text-negative">{message}</p>
      {onRetry ? (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
