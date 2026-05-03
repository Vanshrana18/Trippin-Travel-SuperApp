import { Link } from 'react-router-dom';
import { Home, MapPin, ArrowLeft } from 'lucide-react';
import Button from '../components/shared/Button';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <motion.div
        className="not-found-content"
        initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="not-found-icon"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MapPin size={48} />
        </motion.div>

        <motion.h1
          className="not-found-code"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          404
        </motion.h1>

        <h2 className="not-found-title">Lost in paradise?</h2>
        <p className="not-found-description">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        <div className="not-found-actions">
          <Link to="/">
            <Button variant="primary" size="lg">
              <Home size={18} /> Back to Home
            </Button>
          </Link>
          <Link to="/discover">
            <Button variant="secondary" size="lg">
              <ArrowLeft size={18} /> Explore Destinations
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Decorative floating orbs */}
      <div className="not-found-orb orb-1" />
      <div className="not-found-orb orb-2" />
    </div>
  );
}
