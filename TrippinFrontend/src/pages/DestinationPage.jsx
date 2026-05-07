import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useScroll, useTransform } from 'framer-motion';
import { useDestination } from '../hooks/useDestinations';
import { useDestinationReviews, useCreateReview } from '../hooks/useReviews';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Calendar, DollarSign, Globe, Sparkles, Star, ChevronRight, Plane } from 'lucide-react';
import StarRating from '../components/shared/StarRating';
import StarInput from '../components/shared/StarInput';
import CategoryBadge from '../components/shared/CategoryBadge';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import Input from '../components/shared/Input';
import Textarea from '../components/shared/Textarea';
import PremiumImage from '../components/shared/PremiumImage';
import Skeleton from '../components/shared/Skeleton';
import EmptyState from '../components/shared/EmptyState';
import { formatCurrency } from '../utils/formatters';
import ScrollReveal from '../components/animations/ScrollReveal';
import Tilt3D from '../components/animations/Tilt3D';
import StaggerContainer, { StaggerItem } from '../components/animations/StaggerContainer';
import LocationMap from '../components/shared/LocationMap';
import WeatherWidget from '../components/shared/WeatherWidget';
import AddToTripModal from '../components/shared/AddToTripModal';
import { motion } from 'framer-motion';

export default function DestinationPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { data: destination, isLoading } = useDestination(id);
  const { data: reviewsData } = useDestinationReviews(id);
  const createReview = useCreateReview();
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.4]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', content: '' });
  const [reviewError, setReviewError] = useState('');

  const reviews = Array.isArray(reviewsData) ? reviewsData : reviewsData?.items || reviewsData?.data || [];

  if (isLoading) return (
    <div className="destination-page">
      <Skeleton variant="rect" width="100%" height={400} className="destination-hero" />
      <div className="container" style={{ marginTop: 'var(--space-8)' }}>
        <div className="destination-layout">
          <div className="destination-main">
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="90%" height={24} />
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="85%" height={24} />
          </div>
          <div className="destination-sidebar">
            <Skeleton variant="card" height={360} />
          </div>
        </div>
      </div>
    </div>
  );
  if (!destination) return <EmptyState icon={MapPin} title="Destination not found" description="This destination doesn't exist or has been removed." />;

  const highlights = destination.highlights
    ? (typeof destination.highlights === 'string' ? destination.highlights.split('|').filter(Boolean) : destination.highlights)
    : [];

  const tags = destination.tags
    ? (typeof destination.tags === 'string' ? destination.tags.split(',').map(t => t.trim()).filter(Boolean) : destination.tags)
    : [];

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (reviewForm.rating === 0) { setReviewError('Please select a rating'); return; }
    if (!reviewForm.title.trim() || !reviewForm.content.trim()) { setReviewError('Please fill in all fields'); return; }
    try {
      await createReview.mutateAsync({ ...reviewForm, destinationId: parseInt(id) });
      setShowReviewModal(false);
      setReviewForm({ rating: 0, title: '', content: '' });
    } catch (err) {
      setReviewError(err.response?.data?.message || 'You may have already reviewed this destination');
    }
  };

  return (
    <div className="destination-page">
      {/* Parallax Hero */}
      <motion.div className="destination-hero" style={{ overflow: 'hidden' }}>
        <motion.div style={{ scale: heroScale, opacity: heroOpacity, height: '100%', width: '100%' }}>
          <PremiumImage 
            src={destination.imageUrl} 
            alt={destination.name}
            overlayText={destination.name}
            fallbackSrc="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1400&h=600&fit=crop"
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>
        <div className="destination-hero-overlay" />
        <motion.div
          className="destination-hero-content container"
          initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <CategoryBadge category={destination.category} />
          <h1 className="destination-hero-title">{destination.name}</h1>
          <div className="destination-hero-location">
            <MapPin size={18} />
            {destination.city}, {destination.country}
          </div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="destination-layout">
        <div className="destination-main">
          {/* About */}
          <ScrollReveal variant="fadeUp">
            <div className="destination-card-section">
              <h2 className="destination-section-title">
                <Globe size={20} style={{ color: 'var(--ocean-400)' }} />
                About
              </h2>
              <p className="destination-description">{destination.description}</p>
              {tags.length > 0 && (
                <div className="destination-tags">
                  {tags.map((tag) => (
                    <motion.span key={tag} className="destination-tag" whileHover={{ scale: 1.1, y: -2 }}>
                      {tag}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Highlights */}
          {highlights.length > 0 && (
            <ScrollReveal variant="fadeLeft" delay={0.1}>
              <div className="destination-card-section">
                <h2 className="destination-section-title">
                  <Sparkles size={20} style={{ color: 'var(--terra-400)' }} />
                  Highlights
                </h2>
                <StaggerContainer className="destination-highlights" staggerDelay={0.1}>
                  {highlights.map((highlight, i) => (
                    <StaggerItem key={i}>
                      <div className="destination-highlight">
                        <ChevronRight size={16} className="destination-highlight-icon" />
                        <span>{highlight}</span>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </ScrollReveal>
          )}

          {/* Reviews */}
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <div className="destination-card-section">
              <div className="reviews-header">
                <div className="reviews-summary">
                  <motion.span
                    className="reviews-average"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
                  >
                    {destination.averageRating?.toFixed(1) || '—'}
                  </motion.span>
                  <div>
                    <StarRating rating={destination.averageRating || 0} size="md" />
                    <div className="reviews-count">{destination.reviewCount || 0} review{(destination.reviewCount || 0) !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                {isAuthenticated && (
                  <Button variant="primary" size="sm" onClick={() => setShowReviewModal(true)}>
                    <Star size={14} /> Write a Review
                  </Button>
                )}
              </div>

              {reviews.length === 0 ? (
                <EmptyState
                  icon={Star}
                  title="No reviews yet"
                  description="Be the first to share your experience."
                  action={
                    isAuthenticated
                      ? <Button variant="secondary" size="sm" onClick={() => setShowReviewModal(true)}>Write the first review</Button>
                      : <Link to="/login"><Button variant="secondary" size="sm">Sign in to review</Button></Link>
                  }
                />
              ) : (
                <StaggerContainer staggerDelay={0.1}>
                  {reviews.map((review) => (
                    <StaggerItem key={review.id}>
                      <div className="review-card">
                        <div className="review-header">
                          <div className="review-author">
                            <motion.div className="review-avatar" whileHover={{ scale: 1.1, rotate: 5 }}>
                              {review.authorName?.charAt(0) || review.userName?.charAt(0) || 'U'}
                            </motion.div>
                            <div>
                              <div className="review-author-name">{review.authorName || review.userName || 'Traveler'}</div>
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                          </div>
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="review-title">{review.title}</h4>
                        <p className="review-content">{review.content}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Sidebar */}
        <div className="destination-sidebar">
          <ScrollReveal variant="fadeRight" delay={0.2}>
            <Tilt3D intensity={5} scale={1.01} glare className="destination-info-card">
              <div className="destination-price">
                <div className="destination-price-label">Average Cost</div>
                <div className="destination-price-value">{formatCurrency(destination.averageCostPerDay, destination.currency || 'USD')}</div>
                <div className="destination-price-unit">per day</div>
              </div>

              <div className="destination-info-row">
                <span className="destination-info-label"><Calendar size={14} /> Best Time</span>
                <span className="destination-info-value">{destination.bestTimeToVisit}</span>
              </div>
              <div className="destination-info-row">
                <span className="destination-info-label"><Globe size={14} /> Country</span>
                <span className="destination-info-value">{destination.country}</span>
              </div>
              <div className="destination-info-row">
                <span className="destination-info-label"><MapPin size={14} /> City</span>
                <span className="destination-info-value">{destination.city}</span>
              </div>
              <div className="destination-info-row">
                <span className="destination-info-label"><DollarSign size={14} /> Currency</span>
                <span className="destination-info-value">{destination.currency || 'USD'}</span>
              </div>
              {destination.latitude && (
                <div className="destination-info-row">
                  <span className="destination-info-label"><MapPin size={14} /> GPS</span>
                  <span className="destination-info-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                    {destination.latitude?.toFixed(4)}, {destination.longitude?.toFixed(4)}
                  </span>
                </div>
              )}

              <div style={{ marginTop: 'var(--space-5)' }}>
                {isAuthenticated ? (
                  <Button variant="primary" size="lg" style={{ width: '100%' }} onClick={() => setShowAddModal(true)}>
                    <Plus size={16} /> Add to Trip
                  </Button>
                ) : (
                  <Link to="/register">
                    <Button variant="primary" size="lg" style={{ width: '100%' }}>
                      <Plane size={16} /> Plan a Trip Here
                    </Button>
                  </Link>
                )}
              </div>
            </Tilt3D>
          </ScrollReveal>

          {/* Interactive Map */}
          {destination.latitude && destination.longitude && (
            <ScrollReveal variant="fadeUp" delay={0.3}>
              <div style={{ marginTop: 'var(--space-5)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-muted)' }}>📍 Location</h3>
                <LocationMap
                  latitude={destination.latitude}
                  longitude={destination.longitude}
                  name={destination.name}
                  city={destination.city}
                  country={destination.country}
                />
              </div>
            </ScrollReveal>
          )}

          {/* Weather Widget */}
          {destination.latitude && destination.longitude && (
            <ScrollReveal variant="fadeUp" delay={0.4}>
              <div style={{ marginTop: 'var(--space-5)' }}>
                <WeatherWidget
                  latitude={destination.latitude}
                  longitude={destination.longitude}
                  name={destination.city || destination.name}
                />
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal open={showReviewModal} onClose={() => setShowReviewModal(false)} title="Write a Review" size="md">
        <form onSubmit={handleSubmitReview}>
          <div className="modal-body">
            {reviewError && <div className="auth-error" style={{ marginBottom: 'var(--space-4)' }}>{reviewError}</div>}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)', alignItems: 'center' }}>
              <label className="form-label">Your Rating</label>
              <StarInput value={reviewForm.rating} onChange={(r) => setReviewForm(f => ({ ...f, rating: r }))} />
            </div>
            <Input label="Review Title" placeholder="Sum up your experience" value={reviewForm.title} onChange={(e) => setReviewForm(f => ({ ...f, title: e.target.value }))} />
            <div style={{ marginTop: 'var(--space-4)' }}>
              <Textarea label="Your Review" placeholder="Tell others about your experience..." value={reviewForm.content} onChange={(e) => setReviewForm(f => ({ ...f, content: e.target.value }))} rows={4} />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setShowReviewModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={createReview.isPending}>Submit Review</Button>
          </div>
        </form>
      </Modal>

      {/* Add to Trip Modal */}
      <AddToTripModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        item={{
          id: parseInt(id),
          name: destination.name,
          type: 'destination'
        }}
      />
    </div>
  );
}
