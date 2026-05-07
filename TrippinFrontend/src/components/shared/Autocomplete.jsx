import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Autocomplete({ value, onChange, placeholder, data, searchKeys, displayFormat, valueFormat, icon: Icon, onSelect }) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Sync external value with local query
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredData = query 
    ? data.filter(item => 
        searchKeys.some(key => item[key]?.toLowerCase().includes(query.toLowerCase()))
      )
    : data;

  const handleSelect = (item) => {
    const newVal = valueFormat(item);
    setQuery(newVal);
    onChange(newVal);
    setIsOpen(false);
    if (onSelect) onSelect(item);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && <Icon size={16} color="var(--ink-faint)" style={{ position: 'absolute', left: '12px' }} />}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--ink)',
            fontSize: '18px',
            fontWeight: '600',
            outline: 'none',
            paddingLeft: Icon ? '36px' : '0'
          }}
        />
      </div>

      <AnimatePresence>
        {isOpen && filteredData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'var(--cream-dark)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '240px',
              overflowY: 'auto',
              zIndex: 100
            }}
          >
            {filteredData.slice(0, 10).map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelect(item)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: index < filteredData.length - 1 ? '1px solid var(--glass-border)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--ink)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <MapPin size={16} color="var(--ink-muted)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{displayFormat(item)}</span>
                  <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{item.city} {item.country ? `, ${item.country}` : ''}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
