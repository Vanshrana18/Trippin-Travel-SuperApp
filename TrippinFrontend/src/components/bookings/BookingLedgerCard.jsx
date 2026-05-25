import { motion } from 'framer-motion';
import { Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { UiButton } from '../ui/button';
import { cn } from '../../lib/cn';

const STATUS_VARIANT = {
  Pending: 'warning',
  Confirmed: 'success',
  Cancelled: 'danger',
  Completed: 'ocean',
};

/**
 * Modern booking row card — Tailwind island for BookingsPage / TripDetail.
 */
export default function BookingLedgerCard({
  booking,
  typeIcon: TypeIcon,
  formattedPrice,
  formattedDates,
  onConfirm,
  onCancel,
  showTrip = true,
  className,
}) {
  const statusVariant = STATUS_VARIANT[booking.status] || 'default';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('tw-group', className)}
    >
      <Card className="tw-overflow-hidden tw-transition-all hover:tw-border-terra-400/25 hover:tw-shadow-xl">
        <CardContent className="tw-flex tw-flex-col tw-gap-4 tw-p-4 sm:tw-flex-row sm:tw-items-center sm:tw-gap-6 sm:tw-p-5">
          <div
            className={cn(
              'tw-flex tw-h-12 tw-w-12 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl tw-border tw-border-surface-border',
              `booking-type-icon ${booking.type?.toLowerCase()}`
            )}
          >
            {TypeIcon && <TypeIcon size={22} />}
          </div>

          <div className="tw-min-w-0 tw-flex-1">
            <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
              <h3 className="tw-truncate tw-font-display tw-text-base tw-font-semibold tw-text-ink">
                {booking.title}
              </h3>
              <Badge variant={statusVariant}>{booking.status}</Badge>
            </div>
            {booking.provider && (
              <p className="tw-mt-0.5 tw-text-sm tw-text-ink-muted">{booking.provider}</p>
            )}
            <div className="tw-mt-2 tw-flex tw-flex-wrap tw-items-center tw-gap-x-3 tw-gap-y-1 tw-text-xs tw-text-ink-muted">
              {formattedDates && (
                <span className="tw-inline-flex tw-items-center tw-gap-1">
                  <Calendar size={12} />
                  {formattedDates}
                </span>
              )}
              {booking.confirmationNumber && (
                <span className="tw-font-mono tw-text-ocean-400">#{booking.confirmationNumber}</span>
              )}
              {showTrip && booking.tripTitle && (
                <span className="tw-text-ocean-400">Trip: {booking.tripTitle}</span>
              )}
            </div>
          </div>

          <div className="tw-flex tw-flex-col tw-items-stretch tw-gap-2 sm:tw-items-end">
            <div className="tw-font-display tw-text-lg tw-font-bold tw-text-ink">{formattedPrice}</div>
            {booking.status === 'Pending' && (onConfirm || onCancel) && (
              <div className="tw-flex tw-gap-2">
                {onConfirm && (
                  <UiButton variant="outline" size="sm" onClick={onConfirm}>
                    Confirm
                  </UiButton>
                )}
                {onCancel && (
                  <UiButton variant="ghost" size="sm" onClick={onCancel} className="tw-text-danger hover:tw-text-danger">
                    Cancel
                  </UiButton>
                )}
              </div>
            )}
            <ChevronRight
              size={16}
              className="tw-hidden tw-text-ink-muted tw-opacity-0 tw-transition-opacity group-hover:tw-opacity-100 sm:tw-block"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
