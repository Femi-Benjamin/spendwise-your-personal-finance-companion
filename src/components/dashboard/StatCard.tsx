import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn(
      'p-6 hover-lift cursor-default group transition-all duration-300 ease-out',
      'hover:border-primary/30',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground transition-all duration-300 group-hover:text-primary">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground transition-colors duration-300">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium transition-colors duration-300',
                  trend.isPositive ? 'text-primary' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary transition-all duration-300 ease-out group-hover:bg-primary/20 group-hover:scale-110">
          {icon}
        </div>
      </div>
    </Card>
  );
}
