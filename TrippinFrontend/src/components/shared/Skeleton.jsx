import { motion } from 'framer-motion';
/**
 * Skeleton loader component
 * @param {Object} props
 * @param {'text'|'rect'|'circle'|'card'} props.variant - The shape of the skeleton
 * @param {string} props.className - Additional utility classes
 * @param {string|number} props.width - Explicit width
 * @param {string|number} props.height - Explicit height
 */
export default function Skeleton({ variant = 'rect', className = '', width, height }) {
  let baseClasses = 'skeleton-base ';
  
  if (variant === 'text') baseClasses += 'skeleton-text ';
  if (variant === 'circle') baseClasses += 'skeleton-circle ';
  if (variant === 'card') baseClasses += 'skeleton-card ';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseClasses} ${className}`}
      style={{ width, height }}
    />
  );
}
