import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomSelect({ value, onChange, options, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options?.find(opt => opt.value === value) || options?.[0] || { label: 'Select...' };

  const renderDropdown = () => {
    if (!isOpen) return null;

    if (isMobile) {
      const content = (
        <div className="mobile-drawer-portal">
          <motion.div 
            className="mobile-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
          <motion.div 
            className="mobile-drawer-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
          >
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-indicator" />
              <h3>{label || 'Select Option'}</h3>
            </div>
            <div className="mobile-drawer-options">
              {(options || []).map((option) => (
                <div
                  key={option.value}
                  className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      );
      return createPortal(content, document.body);
    }

    return (
      <motion.div
        className="custom-select-dropdown"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {(options || []).map((option) => (
          <div
            key={option.value}
            className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
          >
            {option.label}
          </div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="custom-select-container" ref={containerRef}>
      <div 
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="custom-select-value">{selectedOption.label}</span>
        <ChevronDown size={16} className={`custom-select-icon ${isOpen ? 'rotate' : ''}`} />
      </div>

      <AnimatePresence>
        {renderDropdown()}
      </AnimatePresence>
    </div>
  );
}
