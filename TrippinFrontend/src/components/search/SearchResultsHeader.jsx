import { SlidersHorizontal } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/cn';

/**
 * 21st-style results header for search — Tailwind island (tw-* prefix).
 */
export default function SearchResultsHeader({
  title,
  count,
  sortLabel = 'Cheapest First',
  badge,
  className,
}) {
  return (
    <Card
      className={cn(
        'tw-mb-6 tw-flex tw-flex-col tw-gap-3 tw-border-white/10 tw-bg-gradient-to-r tw-from-surface-raised tw-to-surface tw-p-4 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between sm:tw-p-5',
        className
      )}
    >
      <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-3">
        <h2 className="tw-font-display tw-text-xl tw-font-semibold tw-text-ink sm:tw-text-2xl">
          {count != null ? (
            <>
              <span className="tw-text-terra-400">{count}</span> {title}
            </>
          ) : (
            title
          )}
        </h2>
        {badge && <Badge variant="ocean">{badge}</Badge>}
      </div>
      <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-ink-muted">
        <SlidersHorizontal size={14} className="tw-opacity-70" />
        <span>Sort:</span>
        <span className="tw-font-medium tw-text-ink">{sortLabel}</span>
      </div>
    </Card>
  );
}
