import { motion } from 'framer-motion';
export default function TextReveal({ text, className = '', tag = 'span', delay = 0, staggerDelay = 0.03 }) {
  const Tag = tag;
  const words = text.split(' ');

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const wordVariant = {
    hidden: {
      opacity: 0,
      y: 40,
      rotateX: -60,
      filter: 'blur(12px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 24,
        stiffness: 140,
        mass: 0.8,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      style={{ perspective: '1000px', display: 'flex', flexWrap: 'wrap', gap: '0.3em' }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={wordVariant}
          style={{ display: 'inline-block', transformOrigin: 'bottom center' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
