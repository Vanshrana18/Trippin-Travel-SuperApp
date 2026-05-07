import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { User, Map, DollarSign, Globe, Save, MapPin } from 'lucide-react';
import Input from '../components/shared/Input';
import Textarea from '../components/shared/Textarea';
import Button from '../components/shared/Button';
import StatCard from '../components/shared/StatCard';
import Skeleton from '../components/shared/Skeleton';
import ScrollReveal from '../components/animations/ScrollReveal';
import Tilt3D from '../components/animations/Tilt3D';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import StaggerContainer, { StaggerItem } from '../components/animations/StaggerContainer';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', bio: '', country: '', avatarUrl: '' });
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (user) setForm({ name: user.name || '', bio: user.bio || '', country: user.country || '', avatarUrl: user.avatarUrl || '' });
  }, [user]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try { const { data } = await api.get('/users/me/dashboard'); setDashboard(data); } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMessage('');
    try {
      const { data } = await api.put('/users/me', form);
      updateUser(data);
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch { setSaveMessage('Failed to update profile'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="container" style={{ paddingTop: '120px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
        <Skeleton variant="circle" width={80} height={80} />
        <div>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="text" width={150} height={20} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '64px' }}>
        <Skeleton variant="card" height={120} />
        <Skeleton variant="card" height={120} />
        <Skeleton variant="card" height={120} />
        <Skeleton variant="card" height={120} />
      </div>
      <Skeleton variant="card" height={300} />
    </div>
  );

  return (
    <div className="profile-page">
      <div className="container">
        {/* Header */}
        <ScrollReveal variant="blur">
          <div className="profile-header">
            <motion.div
              className="profile-avatar-large"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </motion.div>
            <div className="profile-info">
              <h1>{user?.name || 'Traveler'}</h1>
              <p>{user?.email}</p>
              {user?.country && (
                <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginTop: 'var(--space-1)' }}>
                  <MapPin size={14} /> {user.country}
                </p>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Stats */}
        {dashboard && (
          <StaggerContainer className="trips-stats" style={{ marginBottom: 'var(--space-10)' }} staggerDelay={0.1}>
            <StaggerItem>
              <Link to="/trips" style={{ textDecoration: 'none' }}>
                <Tilt3D intensity={5} scale={1.02}>
                  <StatCard icon={Map} label="Total Trips" value={<AnimatedCounter value={dashboard.tripCount || 0} />} color="terra" />
                </Tilt3D>
              </Link>
            </StaggerItem>
            <StaggerItem>
              <Link to="/discover" style={{ textDecoration: 'none' }}>
                <Tilt3D intensity={5} scale={1.02}>
                  <StatCard icon={Globe} label="Destinations" value={<AnimatedCounter value={dashboard.destinationsVisited || 0} />} color="ocean" />
                </Tilt3D>
              </Link>
            </StaggerItem>
            <StaggerItem>
              <Tilt3D intensity={5} scale={1.02}>
                <StatCard icon={DollarSign} label="Total Spend" value={<AnimatedCounter value={dashboard.totalSpend || 0} prefix="$" />} color="sand" />
              </Tilt3D>
            </StaggerItem>
            <StaggerItem>
              <Link to="/bookings" style={{ textDecoration: 'none' }}>
                <Tilt3D intensity={5} scale={1.02}>
                  <StatCard icon={User} label="Bookings" value={<AnimatedCounter value={dashboard.bookingCount || 0} />} color="success" />
                </Tilt3D>
              </Link>
            </StaggerItem>
          </StaggerContainer>
        )}

        {/* Edit Form */}
        <ScrollReveal variant="fadeUp" delay={0.2}>
          <div className="profile-form-section">
            <h2 className="profile-form-title">Edit Profile</h2>
            <form onSubmit={handleSave}>
              <div className="profile-form-grid">
                <Input label="Full Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} icon={User} />
                <Input label="Country" value={form.country} onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))} placeholder="e.g., United States" icon={Globe} />
                <div className="profile-form-full">
                  <Input label="Avatar URL" value={form.avatarUrl} onChange={(e) => setForm(f => ({ ...f, avatarUrl: e.target.value }))} placeholder="https://example.com/avatar.jpg" />
                </div>
                <div className="profile-form-full">
                  <Textarea label="Bio" value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={4} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                <Button variant="primary" type="submit" loading={saving}><Save size={14} /> Save Changes</Button>
                {saveMessage && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ fontSize: 'var(--text-sm)', color: saveMessage.includes('success') ? 'var(--success)' : 'var(--danger)' }}
                  >
                    {saveMessage}
                  </motion.span>
                )}
              </div>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
