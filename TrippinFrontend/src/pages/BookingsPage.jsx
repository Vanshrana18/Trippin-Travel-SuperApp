import { useBookings, useCancelBooking, useUpdateBookingStatus } from '../hooks/useBookings';
import { Plane, Building, Globe, Compass, Car, Package, CreditCard } from 'lucide-react';
import Button from '../components/shared/Button';
import Skeleton from '../components/shared/Skeleton';
import EmptyState from '../components/shared/EmptyState';
import { formatDate, formatCurrency } from '../utils/formatters';
import ScrollReveal from '../components/animations/ScrollReveal';
import StaggerContainer, { StaggerItem } from '../components/animations/StaggerContainer';
import { motion } from 'framer-motion';

const BOOKING_TYPE_ICONS = {
  Flight: Plane, Hotel: Building, Tour: Globe, Activity: Compass, Car: Car, Other: Package,
};

export default function BookingsPage() {
  const { data, isLoading } = useBookings({ pageSize: 50 });
  const cancelBooking = useCancelBooking();
  const updateStatus = useUpdateBookingStatus();

  const bookings = Array.isArray(data) ? data : data?.items || data?.data || [];
  if (isLoading) return (
    <div className="container" style={{ paddingTop: '120px' }}>
      <Skeleton variant="text" width="40%" height={40} />
      <Skeleton variant="text" width="60%" height={24} style={{ marginBottom: '40px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton variant="card" height={80} />
        <Skeleton variant="card" height={80} />
        <Skeleton variant="card" height={80} />
      </div>
    </div>
  );

  return (
    <div className="bookings-page">
      <div className="container">
        <ScrollReveal variant="blur">
          <div className="bookings-header">
            <h1>My Bookings</h1>
            <p>All your travel bookings across every trip, in one place.</p>
          </div>
        </ScrollReveal>

        {bookings.length === 0 ? (
          <ScrollReveal variant="scaleUp">
            <EmptyState icon={CreditCard} title="No bookings yet" description="When you add bookings to your trips, they'll all appear here." />
          </ScrollReveal>
        ) : (
          <StaggerContainer className="booking-cards" staggerDelay={0.06}>
            {bookings.map((booking) => {
              const TypeIcon = BOOKING_TYPE_ICONS[booking.type] || Package;
              return (
                <StaggerItem key={booking.id}>
                  <motion.div className="booking-card" whileHover={{ x: 4, rotateY: 1 }}>
                    <div className={`booking-type-icon ${booking.type?.toLowerCase()}`}>
                      <TypeIcon size={20} />
                    </div>
                    <div className="booking-info">
                      <div className="booking-title">{booking.title}</div>
                      {booking.provider && <div className="booking-provider">{booking.provider}</div>}
                      <div className="booking-dates">
                        {booking.checkInDate && formatDate(booking.checkInDate)}
                        {booking.checkOutDate && ` — ${formatDate(booking.checkOutDate)}`}
                        {booking.confirmationNumber && <span style={{ fontFamily: 'var(--font-mono)', marginLeft: 'var(--space-2)' }}>#{booking.confirmationNumber}</span>}
                      </div>
                      {booking.tripTitle && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ocean-400)', marginTop: 'var(--space-1)' }}>Trip: {booking.tripTitle}</div>}
                    </div>
                    <div className="booking-right">
                      <div className="booking-price">{formatCurrency(booking.totalPrice, booking.currency || 'USD')}</div>
                      <span className={`booking-status ${booking.status?.toLowerCase()}`}>{booking.status}</span>
                      {booking.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-2)', justifyContent: 'flex-end' }}>
                          <Button variant="ghost" size="sm" onClick={() => updateStatus.mutate({ id: booking.id, status: 'Confirmed' })}>Confirm</Button>
                          <Button variant="ghost" size="sm" onClick={() => cancelBooking.mutate(booking.id)} style={{ color: 'var(--danger)' }}>Cancel</Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
