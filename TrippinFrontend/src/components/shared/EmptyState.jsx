import { motion } from 'framer-motion';
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div 
      className="empty-state"
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="empty-state-bg-glow" />
      {Icon && (
        <motion.div 
          className="empty-state-icon-wrapper"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="empty-state-icon">
            <Icon size={40} />
          </div>
          <div className="empty-state-icon-shadow" />
        </motion.div>
      )}
      <div className="empty-state-content">
        <h3 className="empty-state-title">{title}</h3>
        {description && <p className="empty-state-description">{description}</p>}
      </div>
      {action && (
        <motion.div 
          className="empty-state-action"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
