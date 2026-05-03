import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import PremiumImage from './PremiumImage';

export default function DestinationCard({ destination, index = 0 }) {
  const {
    id,
    name,
    city,
    country,
    category,
    imageUrl,
    thumbnailUrl,
    averageCostPerDay,
    currency = 'USD',
    averageRating,
    reviewCount,
    tags,
  } = destination;

  const imageSource = thumbnailUrl || imageUrl || `https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&h=400&fit=crop`;

  const tagList = tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags) : [];

  return (
    <Link to={`/destinations/${id}`} className="destination-card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="destination-card-image">
        <PremiumImage 
          src={imageSource} 
          alt={name} 
          overlayText={name}
          fallbackSrc="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&h=400&fit=crop"
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        />
        <div className="destination-card-image-overlay" />
        <div className="destination-card-badge">
          <CategoryBadge category={category} />
        </div>
        <div className="destination-card-cost">
          ${averageCostPerDay}/{currency === 'USD' ? 'day' : `day ${currency}`}
        </div>
      </div>
      <div className="destination-card-body">
        <h3 className="destination-card-name">{name}</h3>
        <div className="destination-card-location">
          <MapPin size={14} />
          {city}, {country}
        </div>
        <div className="destination-card-footer">
          {averageRating > 0 ? (
            <div className="destination-card-rating">
              <Star size={14} fill="currentColor" style={{ color: 'var(--terra-400)' }} />
              {(averageRating || 0).toFixed(1)}
              <span style={{ fontWeight: 400, color: 'var(--ink-muted)' }}>({reviewCount || 0})</span>
            </div>
          ) : (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-light)' }}>No reviews yet</span>
          )}
          {tagList.length > 0 && (
            <div className="destination-card-tags">
              {tagList.slice(0, 2).map((tag) => (
                <span key={tag} className="destination-card-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
