import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSocial = async (provider) => {
    setError('');
    const redirectUri = encodeURIComponent('http://localhost:5173/auth/callback');
    
    try {
      if (provider === 'google') {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const scope = encodeURIComponent('openid email profile');
        const state = 'google';
        const nonce = Math.random().toString(36).substring(2);
        // Use id_token for Google as backend expects it
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=${scope}&state=${state}&nonce=${nonce}`;
      } else if (provider === 'github') {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        const scope = encodeURIComponent('user:email');
        const state = 'github';
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
      } else if (provider === 'microsoft') {
        console.log('Microsoft login clicked');
      }
    } catch {
      setError(`${provider} login failed`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/trips');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* Left — Visual Panel */}
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=1600&fit=crop"
          alt="Tropical beach paradise"
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
            <Sparkles size={14} /> Trusted by 10,000+ travelers
          </div>
          <h2 className="auth-visual-title">Your next adventure starts here</h2>
          <p className="auth-visual-subtitle">
            Discover breathtaking destinations, plan unforgettable trips, and manage every detail — all in one place.
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
            <p className="auth-brand-tagline">Welcome back, traveler</p>
          </div>

          {error && (
            <motion.div className="auth-error" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input label="Email" type="email" placeholder="you@example.com" icon={Mail}
              value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} autoComplete="email" />
            <Input label="Password" type="password" placeholder="Enter your password" icon={Lock}
              value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} autoComplete="current-password" />
            <Button variant="primary" size="lg" type="submit" loading={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
              Sign In
            </Button>
          </form>

          <div className="auth-separator">
            <span className="auth-separator-text">or continue with</span>
          </div>

          <div className="auth-social-grid">
            <button className="auth-social-btn" onClick={() => handleSocial('google')} title="Google">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"/>
              </svg>
            </button>
            <button className="auth-social-btn" onClick={() => handleSocial('github')} title="GitHub">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
            <button className="auth-social-btn" onClick={() => handleSocial('microsoft')} title="Microsoft">
              <svg viewBox="0 0 23 23" width="20" height="20">
                <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
            </button>
          </div>

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
