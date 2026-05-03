import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Compass, Map, Plane, User, LogOut, Menu, X, CreditCard, Search, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../shared/Button';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { currency, changeCurrency } = useCurrency();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const navigate = useNavigate();
  const currencyRef = useRef(null);

  // Close currency dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">✦</span>
          Trippin
        </Link>

        <div className={`navbar-nav ${mobileOpen ? 'open' : ''}`}>
          <NavLink to="/discover" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            <Compass size={16} />
            Discover
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            <Search size={16} />
            Search
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/trips" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <Map size={16} />
                My Trips
              </NavLink>
              <NavLink to="/bookings" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <CreditCard size={16} />
                Bookings
              </NavLink>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {/* Elegant Custom Currency Selector */}
          <div className="currency-selector-wrapper" ref={currencyRef}>
            <button 
              className="currency-toggle"
              onClick={() => setCurrencyOpen(!currencyOpen)}
            >
              <Globe size={16} />
              <span>{currency}</span>
              <ChevronDown size={14} className={currencyOpen ? 'rotate-180' : ''} />
            </button>

            <AnimatePresence>
              {currencyOpen && (
                <motion.div 
                  className="currency-dropdown"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {[
                    { code: 'USD', symbol: '$', label: 'US Dollar' },
                    { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
                    { code: 'EUR', symbol: '€', label: 'Euro' },
                    { code: 'GBP', symbol: '£', label: 'British Pound' }
                  ].map((item) => (
                    <button
                      key={item.code}
                      className={`currency-option ${currency === item.code ? 'active' : ''}`}
                      onClick={() => {
                        changeCurrency(item.code);
                        setCurrencyOpen(false);
                      }}
                    >
                      <span className="currency-symbol">{item.symbol}</span>
                      <span className="currency-code">{item.code}</span>
                      <span className="currency-label">{item.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                <User size={16} />
                <span className="sr-only">Profile</span>
              </NavLink>
              <div 
                className="navbar-avatar" 
                onClick={handleLogout}
                title="Sign out"
                role="button"
                tabIndex={0}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name || 'Profile'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  (user?.name || user?.email || 'U').charAt(0).toUpperCase()
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  <Plane size={14} />
                  Get Started
                </Button>
              </Link>
            </>
          )}
          <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
