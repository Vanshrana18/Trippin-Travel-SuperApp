import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Please fill in all required fields'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/trips');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* Left — Visual Panel */}
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=1600&fit=crop"
          alt="Mountain lake adventure"
          className="auth-visual-image"
        />
        <div className="auth-visual-overlay" />
        <motion.div
          className="auth-visual-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="auth-visual-badge">
            <Sparkles size={14} /> Join a global community
          </div>
          <h2 className="auth-visual-title">Start planning your dream trips</h2>
          <p className="auth-visual-subtitle">
            Create your account in seconds and unlock smart itineraries, budget tracking, and booking management.
          </p>
        </motion.div>
      </div>

      {/* Right — Form Panel */}
      <div className="auth-form-panel">
        <motion.div
          className="auth-form-container"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-brand">
            <Link to="/" className="auth-brand-link">
              <h1 className="auth-brand-title">
                <motion.span
                  className="auth-brand-icon"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                >✦</motion.span> Trippin
              </h1>
            </Link>
            <p className="auth-brand-tagline">Start your journey today</p>
          </div>

          {error && (
            <motion.div className="auth-error" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input label="Full Name" type="text" placeholder="Your full name" icon={User}
              value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} autoComplete="name" />
            <Input label="Email" type="email" placeholder="you@example.com" icon={Mail}
              value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} autoComplete="email" />
            <Input label="Password" type="password" placeholder="At least 8 characters" icon={Lock}
              value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} hint="Minimum 8 characters" autoComplete="new-password" />
            <Input label="Confirm Password" type="password" placeholder="Repeat your password" icon={Lock}
              value={form.confirmPassword} onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))} autoComplete="new-password" />
            <Button variant="primary" size="lg" type="submit" loading={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
              Create Account
            </Button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
