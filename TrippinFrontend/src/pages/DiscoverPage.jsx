import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDestinations, useTrendingDestinations } from '../hooks/useDestinations';
import { Search, X, SlidersHorizontal, TrendingUp, Globe, Palmtree, Mountain, Building2, Landmark, Compass, Trees } from 'lucide-react';
import DestinationCard from '../components/shared/DestinationCard';
import Skeleton from '../components/shared/Skeleton';
import EmptyState from '../components/shared/EmptyState';
import Button from '../components/shared/Button';
import ScrollReveal from '../components/animations/ScrollReveal';
import StaggerContainer, { StaggerItem } from '../components/animations/StaggerContainer';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Globe },
  { id: 'beach', label: 'Beach', icon: Palmtree },
  { id: 'mountains', label: 'Mountains', icon: Mountain },
  { id: 'city', label: 'City', icon: Building2 },
  { id: 'cultural', label: 'Cultural', icon: Landmark },
  { id: 'adventure', label: 'Adventure', icon: Compass },
  { id: 'nature', label: 'Nature', icon: Trees }
];

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Main search query — only fires when user has a search or category filter
  const isFiltering = !!(debouncedSearch || category !== 'all');

  const { data, isLoading } = useDestinations({
    search: debouncedSearch || undefined,
    category: category !== 'all' ? category : undefined,
    sortBy,
    page,
    pageSize: 12,
  });

  // Trending query — fires when no filter is active to populate the default view
  const { data: trendingData, isLoading: trendingLoading } = useTrendingDestinations(12);

  const destinations = Array.isArray(data) ? data : data?.items || data?.data || data?.$values || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || destinations.length;

  const trendingList = Array.isArray(trendingData) ? trendingData : trendingData?.$values || [];

  // Decide what to show: if user is searching/filtering, show search results. Otherwise, show trending.
  const displayDestinations = isFiltering ? destinations : trendingList;
  const showLoading = isFiltering ? isLoading : trendingLoading;
  const showPagination = isFiltering && totalPages > 1;

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (cat === 'all') params.delete('category');
    else params.set('category', cat);
    setSearchParams(params);
  };

  const clearSearch = () => {
    setSearchInput('');
    setDebouncedSearch('');
  };

  return (
    <div className="discover-page">
      <div className="container">
        <ScrollReveal variant="blur">
          <div className="discover-header">
            <h1 className="discover-title">Discover Destinations</h1>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal variant="fadeUp" delay={0.1}>
          <div className="discover-filters">
            <div className="discover-search-premium">
              <div className="search-input-wrapper-modern">
                <Search className="search-icon-modern" size={20} />
                <input
                  className="search-input-modern"
                  type="text"
                  placeholder="Search any city, country, or landmark worldwide..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  id="destination-search"
                />
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="search-clear-btn-modern"
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="discover-categories">
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  className={`category-pill-premium ${category === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="cat-icon"><cat.icon size={16} /></span>
                  <span>{cat.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Sort Row */}
        <motion.div
          className="discover-sort-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="discover-count">
            {showLoading ? 'Searching...' : isFiltering ? (
              `${totalCount} destination${totalCount !== 1 ? 's' : ''} found`
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={14} style={{ color: 'var(--terra-400)' }} />
                Trending Now
              </span>
            )}
          </div>
          {isFiltering && (
            <div className="discover-sort">
              <SlidersHorizontal size={14} style={{ color: 'var(--ink-muted)' }} />
              <label htmlFor="sort-select">Sort by</label>
              <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Name</option>
                <option value="cost_asc">Cost: Low → High</option>
                <option value="cost_desc">Cost: High → Low</option>
                <option value="popularity">Popularity</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          )}
        </motion.div>

        {/* Results */}
        {showLoading ? (
          <div className="destinations-grid">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : displayDestinations.length === 0 ? (
          <ScrollReveal variant="scaleUp">
            <EmptyState
              icon={Search}
              title="No destinations found"
              description={isFiltering
                ? "No results in our database — try a different spelling or search for a city/country name."
                : "Something went wrong loading trending destinations."}
              action={
                <Button variant="secondary" onClick={() => { clearSearch(); setCategory('all'); }}>
                  Clear Filters
                </Button>
              }
            />
          </ScrollReveal>
        ) : (
          <>
            <StaggerContainer className="destinations-grid" staggerDelay={0.08}>
              {displayDestinations.map((dest, index) => (
                <StaggerItem key={dest.id}>
                  <motion.div whileHover={{ y: -4, scale: 1.01 }}>
                    <DestinationCard destination={dest} index={index} />
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {showPagination && (
              <motion.div
                className="pagination"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: 'var(--ink-faint)' }}>…</span>}
                      <motion.button
                        className={`pagination-btn ${p === page ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {p}
                      </motion.button>
                    </span>
                  ))}
                <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
