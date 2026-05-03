import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarInput({ value, onChange, max = 5 }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-input" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= (hovered || value);
        const isHovered = hovered > 0 && starValue <= hovered;

        return (
          <button
            key={i}
            type="button"
            className={`star-btn ${isFilled ? 'filled' : ''} ${isHovered ? 'hovered' : ''}`}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star size={24} fill={isFilled ? 'currentColor' : 'none'} />
          </button>
        );
      })}
    </div>
  );
}
