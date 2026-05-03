import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrip, useRemoveTripDestination } from '../hooks/useTrips';
import { useTripBookings, useCreateBooking, useUpdateBookingStatus, useCancelBooking } from '../hooks/useBookings';
import { useTripItineraries, useGenerateItinerary, useDeleteItinerary } from '../hooks/useItineraries';
import {
  Calendar, DollarSign, Users, MapPin, Globe, Eye, EyeOff,
  Plus, Plane, Building, Compass as CompassIcon, Car, Package, Sparkles,
  ChevronDown, ChevronUp, Trash2, X, Clock,
} from 'lucide-react';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import Input from '../components/shared/Input';
import Textarea from '../components/shared/Textarea';
import Select from '../components/shared/Select';
import Skeleton from '../components/shared/Skeleton';
import EmptyState from '../components/shared/EmptyState';
import { formatDate, formatCurrency } from '../utils/formatters';

const BOOKING_TYPE_ICONS = {
  Flight: Plane, Hotel: Building, Tour: Globe, Activity: CompassIcon, Car: Car, Other: Package,
};

const ACTIVITY_TYPE_COLORS = {
  Sightseeing: { bg: '#E0F4FF', color: '#0077B6' },
  Food: { bg: '#FFF3E0', color: '#E65100' },
  Adventure: { bg: '#E8F5E9', color: '#2E7D32' },
  Cultural: { bg: '#F3E5F5', color: '#7B1FA2' },
  Rest: { bg: '#F5F5F5', color: '#616161' },
  Shopping: { bg: '#FCE4EC', color: '#C62828' },
  Transport: { bg: '#E0F7FA', color: '#00695C' },
};

export default function TripDetailPage() {
  const { id } = useParams();
  const { data: trip, isLoading } = useTrip(id);
  const { data: bookingsData } = useTripBookings(id);
  const { data: itinerariesData } = useTripItineraries(id);
  const createBooking = useCreateBooking();
  const updateBookingStatus = useUpdateBookingStatus();
  const cancelBooking = useCancelBooking();
  const generateItinerary = useGenerateItinerary();
  const deleteItinerary = useDeleteItinerary();
  const removeTripDestination = useRemoveTripDestination();

  const [activeTab, setActiveTab] = useState('overview');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});
  const [bookingForm, setBookingForm] = useState({
    type: 'Flight', title: '', provider: '', confirmationNumber: '',
    totalPrice: '', currency: 'USD', bookingDate: new Date().toISOString().split('T')[0],
    checkInDate: '', checkOutDate: '', notes: '',
  });
  const [itineraryForm, setItineraryForm] = useState({
    travelStyle: 'Moderate', budget: 'Mid', preferences: '',
  });
  const [formError, setFormError] = useState('');

  const bookings = Array.isArray(bookingsData) ? bookingsData : bookingsData?.items || bookingsData?.data || [];
  const itineraries = Array.isArray(itinerariesData) ? itinerariesData : itinerariesData?.items || itinerariesData?.data || [];
  const tripDestinations = trip?.destinations || trip?.tripDestinations || [];

  if (isLoading) return (
    <div className="container" style={{ paddingTop: '120px' }}>
      <Skeleton variant="text" width="60%" height={48} />
      <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
        <Skeleton variant="text" width={100} />
        <Skeleton variant="text" width={100} />
      </div>
      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <Skeleton variant="card" height={400} />
        <Skeleton variant="card" height={400} />
      </div>
    </div>
  );
  if (!trip) return <EmptyState icon={MapPin} title="Trip not found" />;

  const formatTime = (t) => {
    if (!t) return '';
    const parts = t.split(':');
    const h = parseInt(parts[0]);
    const m = parts[1];
    return `${h > 12 ? h - 12 : h || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const toggleDay = (dayNum) => {
    setExpandedDays(prev => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!bookingForm.title || !bookingForm.totalPrice) {
      setFormError('Title and total price are required');
      return;
    }
    try {
      await createBooking.mutateAsync({
        ...bookingForm,
        totalPrice: parseFloat(bookingForm.totalPrice),
        tripId: parseInt(id),
      });
      setShowBookingModal(false);
      setBookingForm({
        type: 'Flight', title: '', provider: '', confirmationNumber: '',
        totalPrice: '', currency: 'USD', bookingDate: new Date().toISOString().split('T')[0],
        checkInDate: '', checkOutDate: '', notes: '',
      });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleGenerateItinerary = async (e) => {
    e.preventDefault();
    setFormError('');
    const destIds = tripDestinations.map(td => td.destinationId || td.destination?.id || td.id);
    if (destIds.length === 0) {
      setFormError('Add at least one destination to generate an itinerary');
      return;
    }
    try {
      await generateItinerary.mutateAsync({
        tripId: parseInt(id),
        destinationIds: destIds,
        travelStyle: itineraryForm.travelStyle,
        budget: itineraryForm.budget,
        preferences: itineraryForm.preferences,
      });
      setShowItineraryModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to generate itinerary');
    }
  };

  const totalBookingSpend = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);

  return (
    <div className="trip-detail-page">
      <div className="container">
        {/* Header */}
        <div className="trip-detail-header animate-fade-in-up">
          <div>
            <h1 className="trip-detail-title">{trip.title}</h1>
            <div className="trip-detail-meta">
              <span className="trip-detail-meta-item"><Calendar size={14} /> {formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
              <span className="trip-detail-meta-item"><DollarSign size={14} /> {formatCurrency(trip.budget, trip.currency)}</span>
              <span className="trip-detail-meta-item"><Users size={14} /> {trip.travelersCount} traveler{trip.travelersCount !== 1 ? 's' : ''}</span>
              <span className="trip-detail-meta-item">{trip.isPublic ? <Eye size={14} /> : <EyeOff size={14} />} {trip.isPublic ? 'Public' : 'Private'}</span>
              <span className={`booking-status ${trip.status?.toLowerCase()}`}>{trip.status}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Bookings ({bookings.length})</button>
          <button className={`tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`} onClick={() => setActiveTab('itinerary')}>Itinerary</button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="trip-overview stagger-children">
            <div className="trip-overview-card">
              <h3 className="trip-overview-card-title"><MapPin size={18} style={{ color: 'var(--terra-400)' }} /> Destinations</h3>
              {tripDestinations.length === 0 ? (
                <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-sm)' }}>No destinations added yet. <Link to="/discover" style={{ color: 'var(--terra-400)' }}>Browse destinations</Link></p>
              ) : (
                tripDestinations.map((td, i) => (
                  <div key={td.id || i} className="trip-destination-item">
                    <div className="trip-destination-order">{td.order || i + 1}</div>
                    <div className="trip-destination-info">
                      <div className="trip-destination-name">{td.destination?.name || td.name || `Destination ${td.destinationId}`}</div>
                      <div className="trip-destination-days">{td.daysToSpend || 1} day{(td.daysToSpend || 1) !== 1 ? 's' : ''}</div>
                    </div>
                    <button
                      className="trip-destination-remove"
                      onClick={() => removeTripDestination.mutate({ tripId: parseInt(id), destinationId: td.destinationId || td.destination?.id })}
                      aria-label="Remove destination"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Link to="/discover"><Button variant="secondary" size="sm"><Plus size={14} /> Add Destination</Button></Link>
              </div>
            </div>

            <div className="trip-overview-card">
              <h3 className="trip-overview-card-title"><DollarSign size={18} style={{ color: 'var(--sand-400)' }} /> Budget Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div className="destination-info-row">
                  <span className="destination-info-label">Total Budget</span>
                  <span className="destination-info-value">{formatCurrency(trip.budget, trip.currency)}</span>
                </div>
                <div className="destination-info-row">
                  <span className="destination-info-label">Booked Spend</span>
                  <span className="destination-info-value">{formatCurrency(totalBookingSpend, trip.currency)}</span>
                </div>
                <div className="destination-info-row">
                  <span className="destination-info-label">Remaining</span>
                  <span className="destination-info-value" style={{ color: (trip.budget - totalBookingSpend) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {formatCurrency(trip.budget - totalBookingSpend, trip.currency)}
                  </span>
                </div>
              </div>
              {trip.description && (
                <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--cream-dark)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', lineHeight: 1.7 }}>{trip.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-5)' }}>
              <Button variant="primary" size="sm" onClick={() => setShowBookingModal(true)}>
                <Plus size={14} /> Add Booking
              </Button>
            </div>
            {bookings.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No bookings yet"
                description="Add flights, hotels, and activities to keep everything organized."
                action={<Button variant="primary" onClick={() => setShowBookingModal(true)}><Plus size={14} /> Add First Booking</Button>}
              />
            ) : (
              <div className="booking-cards">
                {bookings.map((booking) => {
                  const TypeIcon = BOOKING_TYPE_ICONS[booking.type] || Package;
                  return (
                    <div key={booking.id} className="booking-card">
                      <div className={`booking-type-icon ${booking.type?.toLowerCase()}`}>
                        <TypeIcon size={20} />
                      </div>
                      <div className="booking-info">
                        <div className="booking-title">{booking.title}</div>
                        {booking.provider && <div className="booking-provider">{booking.provider}</div>}
                        <div className="booking-dates">
                          {booking.checkInDate && formatDate(booking.checkInDate)}
                          {booking.checkOutDate && ` — ${formatDate(booking.checkOutDate)}`}
                          {booking.confirmationNumber && (
                            <span style={{ fontFamily: 'var(--font-mono)', marginLeft: 'var(--space-2)' }}>#{booking.confirmationNumber}</span>
                          )}
                        </div>
                      </div>
                      <div className="booking-right">
                        <div className="booking-price">{formatCurrency(booking.totalPrice, booking.currency || trip.currency)}</div>
                        <span className={`booking-status ${booking.status?.toLowerCase()}`}>{booking.status}</span>
                        {booking.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-2)', justifyContent: 'flex-end' }}>
                            <Button variant="ghost" size="sm" onClick={() => updateBookingStatus.mutate({ id: booking.id, status: 'Confirmed' })}>Confirm</Button>
                            <Button variant="ghost" size="sm" onClick={() => cancelBooking.mutate(booking.id)} style={{ color: 'var(--danger)' }}>Cancel</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-5)' }}>
              <Button variant="primary" size="sm" onClick={() => setShowItineraryModal(true)}>
                <Sparkles size={14} /> Generate AI Itinerary
              </Button>
            </div>
            {itineraries.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No itinerary yet"
                description="Generate an AI-powered day-by-day itinerary based on your destinations and preferences."
                action={
                  <Button variant="primary" onClick={() => setShowItineraryModal(true)}>
                    <Sparkles size={14} /> Generate Itinerary
                  </Button>
                }
              />
            ) : (
              itineraries.map((itinerary) => {
                const items = itinerary.items || itinerary.itineraryItems || [];
                const dayGroups = {};
                items.forEach(item => {
                  const day = item.dayNumber || 1;
                  if (!dayGroups[day]) dayGroups[day] = [];
                  dayGroups[day].push(item);
                });
                const days = Object.keys(dayGroups).sort((a, b) => a - b);

                return (
                  <div key={itinerary.id} style={{ marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>{itinerary.title}</h3>
                        {itinerary.isAiGenerated && (
                          <span className="ai-badge">
                            <Sparkles size={12} /> Powered by Gemini AI
                          </span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteItinerary.mutate(itinerary.id)} style={{ color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </Button>
                    </div>

                    {days.map(dayNum => {
                      const dayItems = dayGroups[dayNum].sort((a, b) => (a.order || 0) - (b.order || 0));
                      const dayCost = dayItems.reduce((s, i) => s + (i.estimatedCost || 0), 0);
                      const isExpanded = expandedDays[`${itinerary.id}-${dayNum}`] !== false;

                      return (
                        <div key={dayNum} className="itinerary-day">
                          <div className="itinerary-day-header" onClick={() => toggleDay(`${itinerary.id}-${dayNum}`)}>
                            <div className="itinerary-day-title">
                              <div className="itinerary-day-number">{dayNum}</div>
                              Day {dayNum}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                              <span className="itinerary-day-cost">{formatCurrency(dayCost, trip.currency)}</span>
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="itinerary-items">
                              {dayItems.map((item) => {
                                const typeStyle = ACTIVITY_TYPE_COLORS[item.activityType] || { bg: '#F5F5F5', color: '#616161' };
                                return (
                                  <div key={item.id} className="itinerary-item">
                                    <div className="itinerary-time">
                                      <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                      {formatTime(item.startTime)} – {formatTime(item.endTime)}
                                    </div>
                                    <div className="itinerary-item-content">
                                      <div className="itinerary-item-title">{item.title}</div>
                                      <div className="itinerary-item-description">{item.description}</div>
                                      <div className="itinerary-item-meta">
                                        <span className="itinerary-item-type" style={{ background: typeStyle.bg, color: typeStyle.color }}>
                                          {item.activityType}
                                        </span>
                                        {item.location && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}><MapPin size={10} /> {item.location}</span>}
                                        {item.estimatedCost > 0 && <span className="itinerary-item-cost">{formatCurrency(item.estimatedCost, trip.currency)}</span>}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Booking Modal */}
        <Modal open={showBookingModal} onClose={() => setShowBookingModal(false)} title="Add Booking" size="lg">
          <form onSubmit={handleCreateBooking}>
            <div className="modal-body">
              {formError && <div className="auth-error" style={{ marginBottom: 'var(--space-4)' }}>{formError}</div>}
              <div className="form-row">
                <Select label="Booking Type" value={bookingForm.type} onChange={(e) => setBookingForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="Flight">Flight</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Tour">Tour</option>
                  <option value="Activity">Activity</option>
                  <option value="Car">Car Rental</option>
                  <option value="Other">Other</option>
                </Select>
                <Input label="Title *" placeholder="e.g., Dubai → London" value={bookingForm.title} onChange={(e) => setBookingForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-row" style={{ marginTop: 'var(--space-4)' }}>
                <Input label="Provider" placeholder="e.g., Emirates" value={bookingForm.provider} onChange={(e) => setBookingForm(f => ({ ...f, provider: e.target.value }))} />
                <Input label="Confirmation #" placeholder="ABC123" value={bookingForm.confirmationNumber} onChange={(e) => setBookingForm(f => ({ ...f, confirmationNumber: e.target.value }))} />
              </div>
              <div className="form-row" style={{ marginTop: 'var(--space-4)' }}>
                <Input label="Total Price *" type="number" icon={DollarSign} placeholder="500" value={bookingForm.totalPrice} onChange={(e) => setBookingForm(f => ({ ...f, totalPrice: e.target.value }))} />
                <Input label="Booking Date" type="date" value={bookingForm.bookingDate} onChange={(e) => setBookingForm(f => ({ ...f, bookingDate: e.target.value }))} />
              </div>
              <div className="form-row" style={{ marginTop: 'var(--space-4)' }}>
                <Input label="Check-in / Start" type="date" value={bookingForm.checkInDate} onChange={(e) => setBookingForm(f => ({ ...f, checkInDate: e.target.value }))} />
                <Input label="Check-out / End" type="date" value={bookingForm.checkOutDate} onChange={(e) => setBookingForm(f => ({ ...f, checkOutDate: e.target.value }))} />
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Textarea label="Notes" placeholder="Additional details..." value={bookingForm.notes} onChange={(e) => setBookingForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setShowBookingModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={createBooking.isPending}><Plus size={14} /> Add Booking</Button>
            </div>
          </form>
        </Modal>

        {/* Itinerary Generation Modal */}
        <Modal open={showItineraryModal} onClose={() => setShowItineraryModal(false)} title="✨ AI Magic Itinerary" size="md">
          <form onSubmit={handleGenerateItinerary}>
            <div className="modal-body">
              {generateItinerary.isPending ? (
                <div className="ai-generating-overlay">
                  <div className="ai-badge" style={{ fontSize: 'var(--text-sm)', padding: '8px 20px', marginBottom: 'var(--space-6)' }}>
                    <Sparkles size={16} /> Gemini AI is crafting your perfect trip...
                  </div>
                  <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-4)' }}>
                    Analyzing destinations, local attractions, restaurants, and cultural highlights...
                  </p>
                  <div className="ai-generating-dots">
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </div>
                </div>
              ) : (
                <>
                  {formError && <div className="auth-error" style={{ marginBottom: 'var(--space-4)' }}>{formError}</div>}
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginBottom: 'var(--space-5)', lineHeight: 1.7 }}>
                    <strong style={{ color: 'var(--ink)' }}>Powered by Google Gemini AI.</strong> Our AI will research real places, restaurants, and landmarks to create a hyper-personalized day-by-day itinerary.
                  </p>
                  <Select label="Travel Style" value={itineraryForm.travelStyle} onChange={(e) => setItineraryForm(f => ({ ...f, travelStyle: e.target.value }))}>
                    <option value="Relaxed">😌 Relaxed (3 activities/day)</option>
                    <option value="Moderate">⚡ Moderate (4 activities/day)</option>
                    <option value="Packed">🔥 Packed (5 activities/day)</option>
                  </Select>
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <Select label="Budget Level" value={itineraryForm.budget} onChange={(e) => setItineraryForm(f => ({ ...f, budget: e.target.value }))}>
                      <option value="Budget">💰 Budget</option>
                      <option value="Mid">💳 Mid-range</option>
                      <option value="Luxury">✨ Luxury</option>
                    </Select>
                  </div>
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <Textarea label="Special Preferences (optional)" placeholder="e.g., I love street food, skip museums, include sunset spots, focus on photography locations..." value={itineraryForm.preferences} onChange={(e) => setItineraryForm(f => ({ ...f, preferences: e.target.value }))} rows={3} />
                  </div>
                </>
              )}
            </div>
            {!generateItinerary.isPending && (
              <div className="modal-footer">
                <Button variant="ghost" onClick={() => setShowItineraryModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={generateItinerary.isPending}>
                  <Sparkles size={14} /> Generate with AI
                </Button>
              </div>
            )}
          </form>
        </Modal>
      </div>
    </div>
  );
}
