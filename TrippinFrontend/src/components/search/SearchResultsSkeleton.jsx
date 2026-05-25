import { motion } from 'framer-motion';
import Skeleton from '../shared/Skeleton';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const VARIANT_CONFIG = {
  flights: { count: 4, height: 108, listClass: 'search-results-list' },
  hotels: { count: 4, height: 132, listClass: 'search-results-list' },
  trains: { count: 4, height: 108, listClass: 'search-results-list' },
  taxis: { count: 6, height: 120, listClass: 'search-results-grid' },
};

export default function SearchResultsSkeleton({ variant = 'flights' }) {
  const reducedMotion = useReducedMotion();
  const { count, height, listClass } = VARIANT_CONFIG[variant] || VARIANT_CONFIG.flights;

  return (
    <div className="search-results-wrapper search-results-skeleton">
      <aside className="results-sidebar" aria-hidden>
        <Skeleton variant="card" height={280} />
      </aside>
      <div className="results-main">
        <div className="results-header-skeleton">
          <Skeleton variant="text" width="45%" height={28} />
          <Skeleton variant="text" width="120px" height={20} />
        </div>
        <div className={listClass}>
          {Array.from({ length: count }).map((_, i) => (
            <motion.div
              key={i}
              className="search-skeleton-card"
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : i * 0.07, duration: 0.35 }}
            >
              <Skeleton variant="card" height={height} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
