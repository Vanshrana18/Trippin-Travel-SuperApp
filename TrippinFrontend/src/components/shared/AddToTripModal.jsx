import { useState } from 'react';
import { useTrips, useAddTripDestination } from '../../hooks/useTrips';
import { useCreateBooking } from '../../hooks/useBookings';
import Modal from './Modal';
import Button from './Button';
import Select from './Select';
import { Plane, Building, MapPin, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * item: { id, name, type: 'destination' | 'flight' | 'hotel' | 'activity', data }
 */
export default function AddToTripModal({ open, onClose, item }) {
  const { data: tripsData, isLoading: tripsLoading } = useTrips();
  const addDestination = useAddTripDestination();
  const createBooking = useCreateBooking();
  
  const [selectedTripId, setSelectedTripId] = useState('');
  const [loading, setLoading] = useState(false);

  const trips = tripsData?.items || tripsData || [];

  const handleAdd = async () => {
    if (!selectedTripId) {
      toast.error('Please select a trip');
      return;
    }

    setLoading(true);
    try {
      if (item.type === 'destination') {
        await addDestination.mutateAsync({
          tripId: parseInt(selectedTripId),
          destinationId: item.id
        });
        toast.success(`Added ${item.name} to your trip!`);
      } else {
        // It's a booking (Flight, Hotel, etc.)
        await createBooking.mutateAsync({
          tripId: parseInt(selectedTripId),
          type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
          title: item.name,
          provider: item.data?.airline || item.data?.provider || '',
          totalPrice: item.data?.price || 0,
          currency: item.data?.currency || 'USD',
          bookingDate: new Date().toISOString().split('T')[0],
          checkInDate: item.data?.departureTime || item.data?.checkIn || null,
          checkOutDate: item.data?.arrivalTime || item.data?.checkOut || null,
          notes: `Added from search: ${item.name}`,
        });
        toast.success(`Saved ${item.type} booking to your trip!`);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add to Trip" size="md">
      <div className="modal-body">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', padding: '16px', background: 'var(--cream-light)', borderRadius: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--terra-100)', color: 'var(--terra-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {item.type === 'flight' ? <Plane size={24} /> : item.type === 'hotel' ? <Building size={24} /> : <MapPin size={24} />}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>{item.type}</div>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>{item.name}</div>
          </div>
        </div>

        {tripsLoading ? (
          <p>Loading your trips...</p>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: 'var(--ink-muted)', marginBottom: '16px' }}>You haven't created any trips yet.</p>
            <Button variant="secondary" onClick={() => window.location.href = '/trips'}>Create your first trip</Button>
          </div>
        ) : (
          <Select 
            label="Select Trip" 
            value={selectedTripId} 
            onChange={(e) => setSelectedTripId(e.target.value)}
          >
            <option value="">-- Choose a Trip --</option>
            {trips.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </Select>
        )}
      </div>
      <div className="modal-footer">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button 
          variant="primary" 
          onClick={handleAdd} 
          loading={loading}
          disabled={!selectedTripId || trips.length === 0}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
