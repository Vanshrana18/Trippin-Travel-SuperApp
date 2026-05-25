import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Motion wrapper for search result cards — layout animations + subtle hover lift.
 */
export default function AnimatedResultCard({
  children,
  layoutId,
  highlighted = false,
  className = '',
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      layout={!reducedMotion}
      layoutId={layoutId}
      className={`animated-result-card ${highlighted ? 'animated-result-card--highlight' : ''} ${className}`.trim()}
      whileHover={
        reducedMotion
          ? undefined
          : { y: -4, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
      }
      transition={{
        layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      {children}
    </motion.div>
  );
}
