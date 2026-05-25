import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { UiButton } from '../ui/button';
import { cn } from '../../lib/cn';

/**
 * Tailwind island sidebar for search filters (21st-style card).
 */
export default function SearchFilterPanel({
  activeTab,
  filters,
  onToggleStop,
  onMaxPriceChange,
  onReset,
  formatCurrency,
  currency,
  className,
}) {
  return (
    <aside className={cn('results-sidebar', className)}>
      <Card className="tw-sticky tw-top-24">
        <CardHeader className="tw-pb-2">
          <div className="tw-flex tw-items-center tw-justify-between">
            <CardTitle>Filters</CardTitle>
            <Badge variant="outline">Live</Badge>
          </div>
        </CardHeader>
        <CardContent className="tw-space-y-5">
          {activeTab === 'flights' && (
            <div className="filter-group">
              <h4 className="tw-mb-2 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-ink-muted">
                Stops
              </h4>
              <label className="tw-flex tw-cursor-pointer tw-items-center tw-gap-2 tw-text-sm tw-text-ink-muted">
                <input
                  type="checkbox"
                  checked={filters.stops.includes('0')}
                  onChange={() => onToggleStop('0')}
                  className="tw-accent-terra-400"
                />
                Non-stop
              </label>
              <label className="tw-flex tw-cursor-pointer tw-items-center tw-gap-2 tw-text-sm tw-text-ink-muted">
                <input
                  type="checkbox"
                  checked={filters.stops.includes('1')}
                  onChange={() => onToggleStop('1')}
                  className="tw-accent-terra-400"
                />
                1 Stop
              </label>
              <label className="tw-flex tw-cursor-pointer tw-items-center tw-gap-2 tw-text-sm tw-text-ink-muted">
                <input
                  type="checkbox"
                  checked={filters.stops.includes('2+')}
                  onChange={() => onToggleStop('2+')}
                  className="tw-accent-terra-400"
                />
                2+ Stops
              </label>
            </div>
          )}

          <div className="filter-group">
            <h4 className="tw-mb-2 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-ink-muted">
              Max price: {formatCurrency(filters.maxPrice, currency)}
            </h4>
            <input
              type="range"
              min="0"
              max="1000000"
              step="5000"
              value={filters.maxPrice}
              onChange={(e) => onMaxPriceChange(parseInt(e.target.value, 10))}
              className="modern-range-slider tw-w-full"
            />
          </div>

          <UiButton variant="ghost" size="sm" className="tw-w-full" onClick={onReset}>
            Reset filters
          </UiButton>
        </CardContent>
      </Card>
    </aside>
  );
}
