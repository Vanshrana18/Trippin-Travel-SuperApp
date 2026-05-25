import { Link } from 'react-router-dom';
import { useBookings, useCancelBooking, useUpdateBookingStatus } from '../hooks/useBookings';
import { Plane, Building, Globe, Compass, Car, Package, CreditCard, Search } from 'lucide-react';
import Button from '../components/shared/Button';
import Skeleton from '../components/shared/Skeleton';
import EmptyState from '../components/shared/EmptyState';
import QueryErrorState from '../components/shared/QueryErrorState';
import BookingLedgerCard from '../components/bookings/BookingLedgerCard';
import { formatDate, formatCurrency } from '../utils/formatters';
import ScrollReveal from '../components/animations/ScrollReveal';
import StaggerContainer, { StaggerItem } from '../components/animations/StaggerContainer';
import { motion } from 'framer-motion';

const BOOKING_TYPE_ICONS = {
  Flight: Plane, Hotel: Building, Tour: Globe, Activity: Compass, Car: Car, Other: Package,
};

export default function BookingsPage() {
  const { data, isLoading, isError, error, refetch } = useBookings({ pageSize: 50 });
  const cancelBooking = useCancelBooking();
  const updateStatus = useUpdateBookingStatus();

  const bookings = Array.isArray(data) ? data : data?.items || data?.data || [];
  if (isError) {
    const message = error?.response?.data?.error || error?.message || 'Could not load your bookings.';
    return (
      <div className="bookings-page">
        <div className="container" style={{ paddingTop: '120px' }}>
          <QueryErrorState
            title="Failed to load bookings"
            message={message}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

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
          <div className="bookings-header tw-mb-2">
            <h1>My Bookings</h1>
            <p>All your travel bookings across every trip, in one place.</p>
          </div>
        </ScrollReveal>

        {bookings.length === 0 ? (
          <div style={{ position: 'relative', overflow: 'hidden', padding: '100px 0' }}>
            <motion.div
              animate={{ y: [0, 20, 0], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              style={{ position: 'absolute', top: '10%', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--ocean-500) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}
            />
            <motion.div
              animate={{ y: [0, -30, 0], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              style={{ position: 'absolute', bottom: '10%', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--terra-500) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <ScrollReveal variant="scaleUp">
                <EmptyState
                  icon={CreditCard}
                  title="No bookings yet"
                  description="Search for flights or hotels, then save them to a trip — they'll show up here."
                  action={
                    <Link to="/search">
                      <Button variant="primary">
                        <Search size={16} style={{ marginRight: 8 }} />
                        Search travel
                      </Button>
                    </Link>
                  }
                />
              </ScrollReveal>
            </div>
          </div>
        ) : (
          <StaggerContainer className="booking-cards tw-flex tw-flex-col tw-gap-4" staggerDelay={0.06} immediate>
            {bookings.map((booking) => {
              const TypeIcon = BOOKING_TYPE_ICONS[booking.type] || Package;
              const dateStr = [
                booking.checkInDate && formatDate(booking.checkInDate),
                booking.checkOutDate && formatDate(booking.checkOutDate),
              ].filter(Boolean).join(' — ');

              return (
                <StaggerItem key={booking.id}>
                  <BookingLedgerCard
                    booking={booking}
                    typeIcon={TypeIcon}
                    formattedPrice={formatCurrency(booking.totalPrice, booking.currency || 'USD')}
                    formattedDates={dateStr}
                    onConfirm={
                      booking.status === 'Pending'
                        ? () => updateStatus.mutate({ id: booking.id, status: 'Confirmed' })
                        : undefined
                    }
                    onCancel={
                      booking.status === 'Pending'
                        ? () => cancelBooking.mutate(booking.id)
                        : undefined
                    }
                  />
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
