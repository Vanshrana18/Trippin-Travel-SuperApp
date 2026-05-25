import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTrips, useAddTripDestination } from '../../hooks/useTrips';
import { useCreateBooking } from '../../hooks/useBookings';
import Modal from './Modal';
import Button from './Button';
import Select from './Select';
import { Plane, Building, MapPin, Sparkles, CheckCircle2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const BOOKING_TYPE_MAP = {
  flight: 'Flight',
  hotel: 'Hotel',
  train: 'Other',
  taxi: 'Car',
  car: 'Car',
  activity: 'Activity',
  tour: 'Tour',
  destination: 'destination',
};

function toDateOnly(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

/**
 * item: { id, name, type: 'destination' | 'flight' | 'hotel' | ..., data }
 */
export default function AddToTripModal({ open, onClose, item }) {
  const { data: tripsData, isLoading: tripsLoading } = useTrips();
  const addDestination = useAddTripDestination();
  const createBooking = useCreateBooking();

  const [selectedTripId, setSelectedTripId] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('select');
  const [savedMeta, setSavedMeta] = useState(null);

  const trips = tripsData?.items || tripsData || [];

  useEffect(() => {
    if (!open) {
      setStep('select');
      setSelectedTripId('');
      setSavedMeta(null);
    }
  }, [open]);

  const handleClose = () => {
    setStep('select');
    setSelectedTripId('');
    setSavedMeta(null);
    onClose();
  };

  const handleAdd = async () => {
    if (!selectedTripId) {
      toast.error('Please select a trip');
      return;
    }

    const trip = trips.find((t) => String(t.id) === String(selectedTripId));
    setLoading(true);
    try {
      if (item.type === 'destination') {
        await addDestination.mutateAsync({
          tripId: parseInt(selectedTripId, 10),
          destinationId: item.id,
        });
        setSavedMeta({
          kind: 'destination',
          tripId: selectedTripId,
          tripTitle: trip?.title || 'Your trip',
          name: item.name,
        });
      } else {
        const mappedType = BOOKING_TYPE_MAP[item.type] || 'Other';
        await createBooking.mutateAsync({
          tripId: parseInt(selectedTripId, 10),
          type: mappedType,
          title: item.name,
          provider: item.data?.airline || item.data?.provider || item.data?.operator || '',
          totalPrice: item.data?.price || 0,
          currency: item.data?.currency || 'USD',
          bookingDate: new Date().toISOString().split('T')[0],
          checkInDate: toDateOnly(item.data?.departureTime || item.data?.checkIn),
          checkOutDate: toDateOnly(item.data?.arrivalTime || item.data?.checkOut),
          notes:
            item.type === 'train'
              ? `Train from search: ${item.name}`
              : `Added from search: ${item.name}`,
        });
        setSavedMeta({
          kind: 'booking',
          tripId: selectedTripId,
          tripTitle: trip?.title || 'Your trip',
          name: item.name,
          type: item.type,
        });
      }
      setStep('success');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to trip');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 'success' ? 'Saved to trip' : 'Add to Trip'}
      size="md"
    >
      {step === 'success' && savedMeta ? (
        <motion.div
          className="add-to-trip-success"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="add-to-trip-success__icon">
            <CheckCircle2 size={48} />
          </div>
          <h3 className="add-to-trip-success__title">
            {savedMeta.kind === 'destination' ? 'Destination added' : 'Booking saved'}
          </h3>
          <p className="add-to-trip-success__desc">
            <strong>{savedMeta.name}</strong> is now on <strong>{savedMeta.tripTitle}</strong>.
            {savedMeta.kind === 'booking' && (
              <span> Status is <em>Pending</em> — confirm it from My Bookings when your trip is finalized.</span>
            )}
          </p>
          <div className="add-to-trip-success__actions">
            <Link to={`/trips/${savedMeta.tripId}`}>
              <Button variant="primary">
                <Calendar size={16} style={{ marginRight: 8 }} />
                View trip
              </Button>
            </Link>
            <Link to="/bookings">
              <Button variant="secondary">My bookings</Button>
            </Link>
            <Button variant="ghost" onClick={handleClose}>Done</Button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="modal-body">
            <div
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                marginBottom: '24px',
                padding: '16px',
                background: 'var(--cream-light)',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: 'var(--terra-100)',
                  color: 'var(--terra-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.type === 'flight' ? (
                  <Plane size={24} />
                ) : item.type === 'hotel' ? (
                  <Building size={24} />
                ) : (
                  <MapPin size={24} />
                )}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                  {item.type}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{item.name}</div>
              </div>
            </div>

            {tripsLoading ? (
              <p>Loading your trips...</p>
            ) : trips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ color: 'var(--ink-muted)', marginBottom: '16px' }}>You haven&apos;t created any trips yet.</p>
                <Button variant="secondary" onClick={() => { window.location.href = '/trips'; }}>
                  Create your first trip
                </Button>
              </div>
            ) : (
              <Select label="Select Trip" value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)}>
                <option value="">-- Choose a Trip --</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
            )}
          </div>
          <div className="modal-footer">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAdd}
              loading={loading}
              disabled={!selectedTripId || trips.length === 0}
            >
              <Sparkles size={14} style={{ marginRight: 6 }} />
              Save to trip
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
