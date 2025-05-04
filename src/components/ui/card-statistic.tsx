
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardStatisticProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
}

export function CardStatistic({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: CardStatisticProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="mt-1">
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "mt-1 flex items-center text-xs",
                  trend.isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                <span>
                  {trend.isPositive ? "↑" : "↓"} {trend.value}%
                </span>
                <span className="ml-1 text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
