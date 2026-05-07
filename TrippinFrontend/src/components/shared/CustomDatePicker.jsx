import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomDatePicker({ value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return isNaN(d) ? new Date() : d;
  });
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, '0');
    const dd = String(selected.getDate()).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const startDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

    // Padding for first week
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`pad-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
      const yyyy = selected.getFullYear();
      const mm = String(selected.getMonth() + 1).padStart(2, '0');
      const dd = String(selected.getDate()).padStart(2, '0');
      const formatted = `${yyyy}-${mm}-${dd}`;
      const isSelected = value === formatted;
      const isToday = new Date().toDateString() === selected.toDateString();
      
      days.push(
        <div 
          key={d} 
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => handleDateSelect(d)}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getDisplayValue = () => {
    if (!value) return 'Select Date';
    const d = new Date(value);
    if (isNaN(d)) return 'Select Date';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="custom-datepicker-container" ref={containerRef}>
      <div 
        className={`custom-datepicker-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="custom-datepicker-value">
          {getDisplayValue()}
        </span>
        <CalendarIcon size={16} className="custom-datepicker-icon" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="custom-datepicker-dropdown"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="calendar-header">
              <button type="button" onClick={handlePrevMonth}><ChevronLeft size={18} /></button>
              <div className="calendar-month-year">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </div>
              <button type="button" onClick={handleNextMonth}><ChevronRight size={18} /></button>
            </div>
            
            <div className="calendar-weekdays">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
            </div>
            
            <div className="calendar-grid">
              {renderDays()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
