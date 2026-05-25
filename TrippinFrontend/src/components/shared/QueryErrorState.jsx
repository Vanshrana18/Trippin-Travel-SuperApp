import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function QueryErrorState({
  title = 'Something went wrong',
  message = 'We could not load this data. Please try again.',
  onRetry,
}) {
  return (
    <motion.div
      className="query-error-state"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      role="alert"
    >
      <div className="query-error-state__icon">
        <AlertCircle size={40} />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          <RefreshCw size={16} style={{ marginRight: 8 }} />
          Retry
        </Button>
      )}
    </motion.div>
  );
}
