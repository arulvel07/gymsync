import React, { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { BarChart3 } from 'lucide-react';

export interface ChartContainerProps {
  title?: string;
  description?: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
  height?: string;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  loading = false,
  empty = false,
  emptyMessage = 'No chart data available for this period.',
  children,
  height = 'h-[280px]',
  className = '',
}) => {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={title || description ? 'pt-2' : ''}>
        {loading ? (
          <div className={`${height} w-full flex flex-col justify-end gap-2 p-2`}>
            <div className="flex items-end gap-3 h-full">
              <Skeleton className="flex-1 h-[40%]" />
              <Skeleton className="flex-1 h-[70%]" />
              <Skeleton className="flex-1 h-[55%]" />
              <Skeleton className="flex-1 h-[85%]" />
              <Skeleton className="flex-1 h-[45%]" />
            </div>
            <Skeleton height="14px" width="100%" />
          </div>
        ) : empty ? (
          <div className={`${height} w-full flex items-center justify-center`}>
            <EmptyState
              icon={<BarChart3 className="w-6 h-6 text-[#71717a]" />}
              title="No chart data"
              description={emptyMessage}
            />
          </div>
        ) : (
          <div className={`${height} w-full relative`}>{children}</div>
        )}
      </CardContent>
    </Card>
  );
};
