import { Star } from 'lucide-react';

export default function StarRating({ rating, max = 5, size = 'md' }) {
  return (
    <div className={`star-rating ${size}`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`star ${i < Math.round(rating) ? 'filled' : ''}`}
          fill={i < Math.round(rating) ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}
