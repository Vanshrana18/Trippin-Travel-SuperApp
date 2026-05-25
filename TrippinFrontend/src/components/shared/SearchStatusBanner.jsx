import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function SearchStatusBanner({ type = 'error', message, onRetry }) {
  const isWarning = type === 'warning' || type === 'empty';
  const Icon = isWarning ? AlertTriangle : AlertCircle;

  return (
    <motion.div
      className={`search-status-banner ${isWarning ? 'search-status-banner--warning' : 'search-status-banner--error'}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
    >
      <Icon size={22} aria-hidden />
      <div className="search-status-banner__content">
        <p>{message}</p>
      </div>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} style={{ flexShrink: 0 }}>
          <RefreshCw size={14} style={{ marginRight: 6 }} />
          Try again
        </Button>
      )}
    </motion.div>
  );
}
