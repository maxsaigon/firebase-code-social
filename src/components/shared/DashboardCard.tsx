import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function DashboardCard({ title, value, icon: Icon, trend }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center">
            <span
              className={cn(
                'flex items-center gap-1',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {trend.value}%
            </span>
            <span className="ml-1">from last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
