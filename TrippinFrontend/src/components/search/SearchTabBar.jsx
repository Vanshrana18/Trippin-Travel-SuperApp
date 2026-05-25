import { motion } from 'framer-motion';
import { Plane, Building, Train, Car } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const TABS = [
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'hotels', label: 'Hotels', icon: Building },
  { id: 'trains', label: 'Trains', icon: Train },
  { id: 'taxis', label: 'Taxis', icon: Car },
];

export default function SearchTabBar({ activeTab, onTabChange }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="mega-search-tabs search-tabs-motion" role="tablist">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`mega-tab ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {isActive && !reducedMotion && (
              <motion.span
                layoutId="searchTabPill"
                className="mega-tab-indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="mega-tab-content">
              <Icon size={18} aria-hidden />
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
