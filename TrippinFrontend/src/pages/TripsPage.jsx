import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTrips, useCreateTrip } from '../hooks/useTrips';
import { Map, Plus, Calendar, DollarSign, Users, Plane, Globe } from 'lucide-react';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import Input from '../components/shared/Input';
import Textarea from '../components/shared/Textarea';
import Select from '../components/shared/Select';
import StatCard from '../components/shared/StatCard';
import Skeleton from '../components/shared/Skeleton';
import EmptyState from '../components/shared/EmptyState';
import { formatDate, formatCurrency } from '../utils/formatters';
import ScrollReveal from '../components/animations/ScrollReveal';
import Tilt3D from '../components/animations/Tilt3D';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import MagneticButton from '../components/animations/MagneticButton';
import StaggerContainer, { StaggerItem } from '../components/animations/StaggerContainer';
import { motion } from 'framer-motion';

const STATUS_FILTERS = ['all', 'Planning', 'Active', 'Completed', 'Cancelled'];

export default function TripsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '', description: '', startDate: '', endDate: '',
    budget: '', currency: 'USD', travelersCount: 1, isPublic: false,
  });
  const [createError, setCreateError] = useState('');
  const navigate = useNavigate();

  const { data, isLoading } = useTrips({ status: statusFilter !== 'all' ? statusFilter : undefined });
  const createTrip = useCreateTrip();

  const trips = Array.isArray(data) ? data : data?.items || data?.data || [];
  const totalTrips = trips.length;
  const activeTrips = trips.filter(t => t.status === 'Active').length;
  const totalBudget = trips.reduce((sum, t) => sum + (t.budget || 0), 0);
  const destinations = new Set(trips.flatMap(t => (t.tripDestinations || t.destinations || []).map(d => d.destinationId || d.id))).size;

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!createForm.title || !createForm.startDate || !createForm.endDate || !createForm.budget) {
      setCreateError('Please fill in all required fields'); return;
    }
    try {
      const result = await createTrip.mutateAsync({
        ...createForm, budget: parseFloat(createForm.budget), travelersCount: parseInt(createForm.travelersCount),
      });
      setShowCreateModal(false);
      setCreateForm({ title: '', description: '', startDate: '', endDate: '', budget: '', currency: 'USD', travelersCount: 1, isPublic: false });
      navigate(`/trips/${result.id}`);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create trip');
    }
  };


  return (
    <div className="trips-page">
      <div className="container">
        {/* Header */}
        <ScrollReveal variant="blur">
          <div className="trips-header">
            <div className="trips-header-left">
              <h1>My Trips</h1>
              <p>Plan, organize, and manage all your adventures.</p>
            </div>
            <MagneticButton>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <Plus size={16} /> New Trip
              </Button>
            </MagneticButton>
          </div>
        </ScrollReveal>

        {/* Stats */}
        <StaggerContainer className="trips-stats" staggerDelay={0.1}>
          <StaggerItem>
            <Tilt3D intensity={5} scale={1.02}>
              <StatCard icon={Map} label="Total Trips" value={<AnimatedCounter value={totalTrips} />} color="terra" />
            </Tilt3D>
          </StaggerItem>
          <StaggerItem>
            <Tilt3D intensity={5} scale={1.02}>
              <StatCard icon={Plane} label="Active" value={<AnimatedCounter value={activeTrips} />} color="ocean" />
            </Tilt3D>
          </StaggerItem>
          <StaggerItem>
            <Tilt3D intensity={5} scale={1.02}>
              <StatCard icon={DollarSign} label="Total Budget" value={<AnimatedCounter value={totalBudget} prefix="$" />} color="sand" />
            </Tilt3D>
          </StaggerItem>
          <StaggerItem>
            <Tilt3D intensity={5} scale={1.02}>
              <StatCard icon={Globe} label="Destinations" value={<AnimatedCounter value={destinations} />} color="success" />
            </Tilt3D>
          </StaggerItem>
        </StaggerContainer>

        {/* Status Filters */}
        <ScrollReveal variant="fadeUp" delay={0.2}>
          <div className="trips-filters">
            {STATUS_FILTERS.map((status) => (
              <motion.button
                key={status}
                className={`category-pill ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {status === 'all' ? 'All Trips' : status}
              </motion.button>
            ))}
          </div>
        </ScrollReveal>

        {/* Trips Grid */}
        {isLoading ? (
          <div className="trips-grid">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <ScrollReveal variant="scaleUp">
            <EmptyState icon={Map} title="No trips yet" description="Create your first trip and start planning your next adventure."
              action={<Button variant="primary" onClick={() => setShowCreateModal(true)}><Plus size={16} /> Create Your First Trip</Button>} />
          </ScrollReveal>
        ) : (
          <StaggerContainer className="trips-grid" staggerDelay={0.08}>
            {trips.map((trip) => (
              <StaggerItem key={trip.id}>
                <Tilt3D intensity={6} scale={1.02} glare style={{ borderRadius: 'var(--radius-lg)' }}>
                  <Link to={`/trips/${trip.id}`} className="trip-card">
                    {trip.coverImageUrl ? (
                      <div className="trip-card-image">
                        <img src={trip.coverImageUrl} alt={trip.title} loading="lazy" />
                        <span className={`trip-card-status ${trip.status?.toLowerCase()}`}>{trip.status}</span>
                      </div>
                    ) : (
                      <div className="trip-card-image-placeholder">
                        <Map size={36} />
                        <span className={`trip-card-status ${trip.status?.toLowerCase()}`} style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)' }}>{trip.status}</span>
                      </div>
                    )}
                    <div className="trip-card-body">
                      <h3 className="trip-card-title">{trip.title}</h3>
                      <div className="trip-card-dates"><Calendar size={14} /> {formatDate(trip.startDate)} — {formatDate(trip.endDate)}</div>
                      <div className="trip-card-meta">
                        <span className="trip-card-budget">{formatCurrency(trip.budget, trip.currency)}</span>
                        <span className="trip-card-travelers"><Users size={14} /> {trip.travelersCount} traveler{trip.travelersCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </Link>
                </Tilt3D>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Create Trip Modal */}
        <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Trip" size="lg">
          <form onSubmit={handleCreateTrip}>
            <div className="modal-body">
              {createError && <div className="auth-error" style={{ marginBottom: 'var(--space-4)' }}>{createError}</div>}
              <Input label="Trip Title *" placeholder="e.g., European Adventure 2026" value={createForm.title} onChange={(e) => setCreateForm(f => ({ ...f, title: e.target.value }))} />
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Textarea label="Description" placeholder="What's this trip about?" value={createForm.description} onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              </div>
              <div className="form-row" style={{ marginTop: 'var(--space-4)' }}>
                <Input label="Start Date *" type="date" value={createForm.startDate} onChange={(e) => setCreateForm(f => ({ ...f, startDate: e.target.value }))} />
                <Input label="End Date *" type="date" value={createForm.endDate} onChange={(e) => setCreateForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
              <div className="form-row" style={{ marginTop: 'var(--space-4)' }}>
                <Input label="Budget *" type="number" placeholder="5000" icon={DollarSign} value={createForm.budget} onChange={(e) => setCreateForm(f => ({ ...f, budget: e.target.value }))} />
                <Select label="Currency" value={createForm.currency} onChange={(e) => setCreateForm(f => ({ ...f, currency: e.target.value }))}>
                  <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
                  <option value="INR">INR</option><option value="JPY">JPY</option><option value="AUD">AUD</option>
                </Select>
              </div>
              <div className="form-row" style={{ marginTop: 'var(--space-4)' }}>
                <Input label="Travelers" type="number" min="1" value={createForm.travelersCount} onChange={(e) => setCreateForm(f => ({ ...f, travelersCount: e.target.value }))} />
                <div className="form-group">
                  <label className="form-label">Visibility</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', marginTop: 'var(--space-2)' }}>
                    <input type="checkbox" checked={createForm.isPublic} onChange={(e) => setCreateForm(f => ({ ...f, isPublic: e.target.checked }))} style={{ width: 18, height: 18, accentColor: 'var(--terra-400)' }} />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>Make this trip public</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={createTrip.isPending}><Plus size={16} /> Create Trip</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
