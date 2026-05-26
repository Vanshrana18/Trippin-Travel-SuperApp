import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import Button from './Button';

export default function SearchStatusBanner({ type = 'error', message, onRetry }) {
  const isDemo = type === 'demo';
  const isWarning = type === 'warning' || type === 'empty' || isDemo;
  
  let Icon = AlertCircle;
  if (isDemo) Icon = Sparkles;
  else if (isWarning) Icon = AlertTriangle;

  return (
    <motion.div
      className={`search-status-banner ${
        isDemo ? 'search-status-banner--demo animate-pulse-slow' : 
        isWarning ? 'search-status-banner--warning' : 
        'search-status-banner--error'
      }`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
    >
      <Icon size={22} aria-hidden className={isDemo ? 'text-terra-400' : ''} />
      <div className="search-status-banner__content">
        <p>{message}</p>
      </div>
      {onRetry && !isDemo && (
        <Button variant="ghost" size="sm" onClick={onRetry} style={{ flexShrink: 0 }}>
          <RefreshCw size={14} style={{ marginRight: 6 }} />
          Try again
        </Button>
      )}
    </motion.div>
  );
}
