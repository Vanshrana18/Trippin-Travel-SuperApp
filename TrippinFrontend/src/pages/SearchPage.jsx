import { useState, useEffect } from 'react';
import { Search, Plane, Building, Train, Car, Calendar, Users, MapPin, ArrowRight, Star, ExternalLink, AlertCircle, Clock, ArrowLeftRight, Activity } from 'lucide-react';
import Button from '../components/shared/Button';
import ScrollReveal from '../components/animations/ScrollReveal';
import Skeleton from '../components/shared/Skeleton';
import StaggerContainer, { StaggerItem } from '../components/animations/StaggerContainer';
import { formatCurrency } from '../utils/formatters';
import { useSearch } from '../hooks/useSearch';
import { useCurrency } from '../contexts/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import Autocomplete from '../components/shared/Autocomplete';
import AddToTripModal from '../components/shared/AddToTripModal';
import CustomSelect from '../components/shared/CustomSelect';
import CustomDatePicker from '../components/shared/CustomDatePicker';
import { airports, stations } from '../data/autocompleteData';
// Helper to get dynamic dates
const getDates = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tmwStr = tomorrow.toISOString().split('T')[0];
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 4);
  const nwStr = nextWeek.toISOString().split('T')[0];
  
  return { tmwStr, nwStr };
};

export default function SearchPage() {
  const { loading: isSearching, results, searchFlights, searchHotels, searchTrains, searchTaxis, error } = useSearch();
  const { currency } = useCurrency();
  const [activeTab, setActiveTab] = useState('flights');
  const [hasSearched, setHasSearched] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const { tmwStr, nwStr } = getDates();
  
  const handleSaveItem = (type, name, data) => {
    setSelectedItem({ type, name, data });
    setShowAddModal(true);
  };

  // Dynamic Initial States
  const [tripType, setTripType] = useState('round'); // 'one' or 'round'
  const [flightForm, setFlightForm] = useState({ origin: 'DEL', destination: 'JFK', departDate: tmwStr, returnDate: nwStr, passengers: 1 });
  const [hotelForm, setHotelForm] = useState({ location: 'Paris', checkIn: tmwStr, checkOut: nwStr, guests: 2 });
  const [trainForm, setTrainForm] = useState({ source: 'NDLS', destination: 'BCT', date: tmwStr });
  const [taxiForm, setTaxiForm] = useState({ from: 'Paris Airport', to: 'Paris City Center', date: `${tmwStr}T10:00` });

  // Filters State
  const [filters, setFilters] = useState({
    stops: ['0', '1', '2+'],
    maxPrice: 200000 // Increased default for INR/USD compatibility
  });

  const toggleStopFilter = (stopValue) => {
    setFilters(prev => ({
      ...prev,
      stops: prev.stops.includes(stopValue) 
        ? prev.stops.filter(s => s !== stopValue) 
        : [...prev.stops, stopValue]
    }));
  };

  // Filtered Results
  const filteredFlights = (results?.flights || []).filter(flight => {
    const stopMatch = (flight.stops === 0 && filters.stops.includes('0')) ||
                      (flight.stops === 1 && filters.stops.includes('1')) ||
                      (flight.stops >= 2 && filters.stops.includes('2+'));
    const priceMatch = (flight.price || 0) <= filters.maxPrice;
    return stopMatch && priceMatch;
  });

  const swapFlightDestinations = () => {
    setFlightForm(prev => ({ ...prev, origin: prev.destination, destination: prev.origin }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setHasSearched(true);
    
    if (activeTab === 'flights') {
      await searchFlights({
        origin: flightForm.origin.toUpperCase(),
        destination: flightForm.destination.toUpperCase(),
        date: flightForm.departDate,
        adults: flightForm.passengers,
        currency: currency
      });
    } else if (activeTab === 'hotels') {
      await searchHotels({
        cityCode: hotelForm.location,
        checkIn: hotelForm.checkIn,
        checkOut: hotelForm.checkOut,
        adults: hotelForm.guests,
        currency: currency
      });
    } else if (activeTab === 'trains') {
      await searchTrains({
        source: trainForm.source.toUpperCase(),
        destination: trainForm.destination.toUpperCase(),
        date: trainForm.date,
        currency: currency
      });
    } else if (activeTab === 'taxis') {
      await searchTaxis({
        fromLocation: taxiForm.from,
        toLocation: taxiForm.to,
        pickupTime: taxiForm.date,
        currency: currency
      });
    }
  };

  const renderLoader = () => (
    <motion.div 
      className="mega-search-loader"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="loader-radar">
        <Activity size={48} className="radar-icon" color="var(--primary)" />
        <motion.div 
          className="radar-sweep"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <h3>Scanning Global Providers...</h3>
      <p>Comparing prices across hundreds of airlines and partners for the best rates.</p>
    </motion.div>
  );

  return (
    <div className="search-page">
      <div className="search-hero mega-hero">
        <div className="hero-visuals" style={{ overflow: 'hidden', position: 'absolute', inset: 0 }}>
          <div className="hero-mesh" style={{ opacity: 0.8 }} />
          <motion.div
            animate={{ 
              x: [0, 100, -50, 0], 
              y: [0, -50, 100, 0],
              scale: [1, 1.2, 0.8, 1] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(0, 188, 212, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
              borderRadius: '50%'
            }}
          />
          <motion.div
            animate={{ 
              x: [0, -100, 50, 0], 
              y: [0, 50, -100, 0],
              scale: [1, 0.8, 1.2, 1] 
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              bottom: '10%',
              right: '20%',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(255, 90, 31, 0.15) 0%, transparent 70%)',
              filter: 'blur(60px)',
              borderRadius: '50%'
            }}
          />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 5, paddingTop: '100px' }}>
          <ScrollReveal variant="blur">
            <h1 className="hero-title" style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '8px' }}>Global Travel Engine</h1>
            <p className="hero-subtitle" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px auto' }}>
              Compare real-time prices across flights, hotels, and transit globally.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
        <div className="mega-search-widget">
          {/* Tabs */}
          <div className="mega-search-tabs">
            <button className={`mega-tab ${activeTab === 'flights' ? 'active' : ''}`} onClick={() => { setActiveTab('flights'); setHasSearched(false); }}>
              <Plane size={18} /> Flights
            </button>
            <button className={`mega-tab ${activeTab === 'hotels' ? 'active' : ''}`} onClick={() => { setActiveTab('hotels'); setHasSearched(false); }}>
              <Building size={18} /> Hotels
            </button>
            <button className={`mega-tab ${activeTab === 'trains' ? 'active' : ''}`} onClick={() => { setActiveTab('trains'); setHasSearched(false); }}>
              <Train size={18} /> Trains
            </button>
            <button className={`mega-tab ${activeTab === 'taxis' ? 'active' : ''}`} onClick={() => { setActiveTab('taxis'); setHasSearched(false); }}>
              <Car size={18} /> Taxis
            </button>
          </div>

          {/* Forms */}
          <div className="mega-search-body">
              {activeTab === 'flights' && (
                <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
                  <label className={`trip-type-label ${tripType === 'round' ? 'active' : ''}`} onClick={() => setTripType('round')}>
                    <input type="radio" checked={tripType === 'round'} readOnly style={{ display: 'none' }} /> Round-trip
                  </label>
                  <label className={`trip-type-label ${tripType === 'one' ? 'active' : ''}`} onClick={() => setTripType('one')}>
                    <input type="radio" checked={tripType === 'one'} readOnly style={{ display: 'none' }} /> One-way
                  </label>
                </div>
              )}
              {activeTab === 'flights' && (
                <form className="mega-search-bar" onSubmit={handleSearch}>
                  <div className="mega-input-group flight-route-group">
                    <div className="mega-input-cell">
                      <label>From</label>
                      <Autocomplete
                        value={flightForm.origin}
                        onChange={(val) => setFlightForm({ ...flightForm, origin: val.toUpperCase() })}
                        placeholder="e.g. New York or JFK"
                        data={airports}
                        searchKeys={['iata', 'name', 'city']}
                        displayFormat={(item) => `${item.city} (${item.iata})`}
                        valueFormat={(item) => item.iata}
                      />
                    </div>
                    <button type="button" className="mega-swap-btn" onClick={swapFlightDestinations}>
                      <ArrowLeftRight size={16} />
                    </button>
                    <div className="mega-input-cell">
                      <label>To</label>
                      <Autocomplete
                        value={flightForm.destination}
                        onChange={(val) => setFlightForm({ ...flightForm, destination: val.toUpperCase() })}
                        placeholder="e.g. London or LHR"
                        data={airports}
                        searchKeys={['iata', 'name', 'city']}
                        displayFormat={(item) => `${item.city} (${item.iata})`}
                        valueFormat={(item) => item.iata}
                      />
                    </div>
                  </div>
                  <div className="mega-input-divider" />
                  <div className="mega-input-cell">
                    <label>Depart</label>
                    <CustomDatePicker 
                      value={flightForm.departDate} 
                      onChange={(val) => setFlightForm({ ...flightForm, departDate: val })}
                    />
                  </div>
                  <div className="mega-input-divider" />
                  <div className={`mega-input-cell ${tripType === 'one' ? 'disabled-cell' : ''}`}>
                    <label>Return</label>
                    {tripType === 'one' ? (
                      <div className="disabled-placeholder">One-way only</div>
                    ) : (
                      <CustomDatePicker 
                        value={flightForm.returnDate} 
                        onChange={(val) => setFlightForm({ ...flightForm, returnDate: val })}
                      />
                    )}
                  </div>
                  <div className="mega-input-divider" />
                  <div className="mega-input-cell">
                    <label>Travellers</label>
                    <CustomSelect 
                      value={flightForm.passengers} 
                      onChange={(val) => setFlightForm({ ...flightForm, passengers: val })}
                      options={[
                        { value: 1, label: '1 Adult, Economy' },
                        { value: 2, label: '2 Adults, Economy' },
                        { value: 3, label: '3 Adults, Economy' },
                        { value: 4, label: '4 Adults, Economy' },
                      ]}
                    />
                  </div>
                  <button type="submit" className="mega-submit-btn" disabled={isSearching}>
                    {isSearching ? <span className="loader-spin" /> : 'Search'}
                  </button>
                </form>
              )}

              {activeTab === 'hotels' && (
                <form className="mega-search-bar" onSubmit={handleSearch}>
                  <div className="mega-input-cell flex-2">
                    <label>Where to?</label>
                    <input type="text" placeholder="City or Property Name (e.g. Paris)" value={hotelForm.location} onChange={e => setHotelForm({...hotelForm, location: e.target.value})} required />
                  </div>
                  <div className="mega-input-divider" />
                  <div className="mega-input-cell">
                    <label>Check In</label>
                    <CustomDatePicker 
                      value={hotelForm.checkIn} 
                      onChange={(val) => setHotelForm({ ...hotelForm, checkIn: val })}
                    />
                  </div>
                  <div className="mega-input-divider" />
                  <div className="mega-input-cell">
                    <label>Check Out</label>
                    <CustomDatePicker 
                      value={hotelForm.checkOut} 
                      onChange={(val) => setHotelForm({ ...hotelForm, checkOut: val })}
                    />
                  </div>
                  <div className="mega-input-divider" />
                  <div className="mega-input-cell">
                    <label>Guests</label>
                    <CustomSelect 
                      value={hotelForm.guests} 
                      onChange={(val) => setHotelForm({ ...hotelForm, guests: val })}
                      options={[
                        { value: 1, label: '1 Guest, 1 Room' },
                        { value: 2, label: '2 Guests, 1 Room' },
                        { value: 3, label: '3 Guests, 2 Rooms' },
                        { value: 4, label: '4 Guests, 2 Rooms' },
                        { value: 5, label: '5 Guests, 3 Rooms' },
                        { value: 6, label: '6 Guests, 3 Rooms' },
                      ]}
                    />
                  </div>
                  <button type="submit" className="mega-submit-btn" disabled={isSearching}>
                    {isSearching ? <span className="loader-spin" /> : 'Search'}
                  </button>
                </form>
              )}

              {activeTab === 'trains' && (
                <form className="mega-search-bar" onSubmit={handleSearch}>
                  <div className="mega-input-group flight-route-group">
                    <div className="mega-input-cell">
                      <label>From (Station)</label>
                      <Autocomplete
                        value={trainForm.source}
                        onChange={(val) => setTrainForm({ ...trainForm, source: val.toUpperCase() })}
                        placeholder="e.g. Delhi or NDLS"
                        data={stations}
                        searchKeys={['code', 'name', 'city']}
                        displayFormat={(item) => `${item.name} (${item.code})`}
                        valueFormat={(item) => item.code}
                      />
                    </div>
                    <div className="mega-input-divider" />
                    <div className="mega-input-cell">
                      <label>To (Station)</label>
                      <Autocomplete
                        value={trainForm.destination}
                        onChange={(val) => setTrainForm({ ...trainForm, destination: val.toUpperCase() })}
                        placeholder="e.g. Mumbai or BCT"
                        data={stations}
                        searchKeys={['code', 'name', 'city']}
                        displayFormat={(item) => `${item.name} (${item.code})`}
                        valueFormat={(item) => item.code}
                      />
                    </div>
                  </div>
                  <div className="mega-input-divider" />
                  <div className="mega-input-cell flex-2">
                    <label>Travel Date</label>
                    <CustomDatePicker 
                      value={trainForm.date} 
                      onChange={(val) => setTrainForm({ ...trainForm, date: val })}
                    />
                  </div>
                  <button type="submit" className="mega-submit-btn" disabled={isSearching}>
                    {isSearching ? <span className="loader-spin" /> : 'Search'}
                  </button>
                </form>
              )}

              {activeTab === 'taxis' && (
                <form className="mega-search-bar" onSubmit={handleSearch}>
                  <div className="mega-input-group flight-route-group">
                    <div className="mega-input-cell">
                      <label>Pickup Location</label>
                      <input type="text" placeholder="e.g. Airport" value={taxiForm.from} onChange={e => setTaxiForm({...taxiForm, from: e.target.value})} required />
                    </div>
                    <div className="mega-input-divider" />
                    <div className="mega-input-cell">
                      <label>Drop-off Location</label>
                      <input type="text" placeholder="e.g. City Center" value={taxiForm.to} onChange={e => setTaxiForm({...taxiForm, to: e.target.value})} required />
                    </div>
                  </div>
                  <div className="mega-input-divider" />
                  <div className="mega-input-cell flex-2">
                    <label>Pickup Date & Time</label>
                    <input type="datetime-local" value={taxiForm.date} onChange={e => setTaxiForm({...taxiForm, date: e.target.value})} required />
                  </div>
                  <button type="submit" className="mega-submit-btn" disabled={isSearching}>
                    {isSearching ? <span className="loader-spin" /> : 'Search'}
                  </button>
                </form>
              )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container" style={{ marginTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div key="loader" className="search-results-wrapper">
              {renderLoader()}
            </motion.div>
          ) : error ? (
            <motion.div key="error" className="search-error-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AlertCircle size={48} color="var(--danger)" />
              <h3>Search Encountered an Error</h3>
              <p style={{ color: 'var(--danger)', fontWeight: 500 }}>{error}</p>
              <p className="text-sm mt-2">
                Ensure you are using valid IATA codes for flights (e.g., JFK) or Station Codes for trains.
              </p>
            </motion.div>
          ) : hasSearched ? (
            <motion.div 
              className="search-results-container"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error && (
                <div className="search-error-alert">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="results-sidebar">
                <div className="filter-card">
                  <h3>Filters</h3>
                  
                  {/* Flight Specific Filters */}
                  {activeTab === 'flights' && (
                    <div className="filter-group">
                      <h4>Stops</h4>
                      <label>
                        <input type="checkbox" checked={filters.stops.includes('0')} onChange={() => toggleStopFilter('0')} /> Non-stop
                      </label>
                      <label>
                        <input type="checkbox" checked={filters.stops.includes('1')} onChange={() => toggleStopFilter('1')} /> 1 Stop
                      </label>
                      <label>
                        <input type="checkbox" checked={filters.stops.includes('2+')} onChange={() => toggleStopFilter('2+')} /> 2+ Stops
                      </label>
                    </div>
                  )}

                  {/* Hotel Specific Filters */}
                  {activeTab === 'hotels' && (
                    <div className="filter-group">
                      <h4>Star Rating</h4>
                      {[5, 4, 3, 2].map(star => (
                        <label key={star}>
                          <input type="checkbox" defaultChecked /> {star} Stars
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Train Specific Filters */}
                  {activeTab === 'trains' && (
                    <div className="filter-group">
                      <h4>Coach Class</h4>
                      {['1AC', '2AC', '3AC', 'SL'].map(c => (
                        <label key={c}>
                          <input type="checkbox" defaultChecked /> {c}
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="filter-group">
                    <h4>Max Price: {formatCurrency(filters.maxPrice, currency)}</h4>
                    <input 
                      type="range" 
                      min="0" 
                      max="1000000" 
                      step="5000"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                      className="modern-range-slider"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
                      <span>0</span><span>{formatCurrency(1000000, currency)}+</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFilters({ stops: ['0', '1', '2+'], maxPrice: 1000000 })} style={{ width: '100%', marginTop: '16px' }}>
                    Reset Filters
                  </Button>
                </div>
              </div>

              <div className="results-main">
                {activeTab === 'flights' && (
                  <>
                    <div className="results-header-modern">
                      <h2>{filteredFlights.length} Flights Found</h2>
                      <div className="sort-by">Sort by: <strong>Cheapest First</strong></div>
                    </div>
                    {filteredFlights.length === 0 ? (
                      <div className="empty-results-state">
                        <Plane size={48} opacity={0.5} />
                        <h3>No flights found</h3>
                        <p>We couldn't find any flights matching your filters.</p>
                      </div>
                    ) : (
                      <StaggerContainer className="search-results-list" staggerDelay={0.05}>
                        {(filteredFlights || []).map((flight, idx) => (
                          <StaggerItem key={idx}>
                            <div className="search-result-card flight-card-modern">
                              <div className="flight-airline-box">
                                <img src={`https://pics.avs.io/80/40/${flight.airline.substring(0, 2).toUpperCase()}.png`} alt={flight.airline} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} className="airline-logo-img" />
                                <Plane size={24} className="airline-logo-fallback" style={{ display: 'none', color: 'var(--ocean-400)' }} />
                                <div className="airline-details">
                                  <span className="airline-name">{flight.airline}</span>
                                  <span className="flight-number">{flight.flightNumber}</span>
                                </div>
                              </div>
                              <div className="flight-timeline-box">
                                <div className="time-point text-right">
                                  <strong>{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                                  <span>{flight.origin}</span>
                                </div>
                                <div className="flight-path-viz">
                                  <span className="duration-label">{flight.duration}</span>
                                  <div className="path-line">
                                    {flight.stops > 0 && <span className="stop-dot"></span>}
                                  </div>
                                  <span className="stops-label">{flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}</span>
                                </div>
                                <div className="time-point">
                                  <strong>{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                                  <span>{flight.destination}</span>
                                </div>
                              </div>
                              <div className="flight-action-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div className="flight-price-huge">{formatCurrency(flight.price, flight.currency)}</div>
                                <Button variant="primary" size="lg" onClick={() => window.open(flight.bookingUrl || '#', '_blank')}>Book</Button>
                                <Button variant="ghost" size="sm" onClick={() => handleSaveItem('flight', `${flight.airline} ${flight.origin}→${flight.destination}`, flight)}>
                                  <Sparkles size={14} style={{ marginRight: '6px' }} /> Save to Trip
                                </Button>
                              </div>
                            </div>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    )}
                  </>
                )}

                {activeTab === 'hotels' && (
                  <>
                    <div className="results-header-modern">
                      <h2>{(results?.hotels || []).length} Properties in {hotelForm.location}</h2>
                      <div className="sort-by">Sort by: <strong>Recommended</strong></div>
                    </div>
                    {results.hotels.length === 0 ? (
                      <div className="empty-results-state">
                        <Building size={48} opacity={0.5} />
                        <h3>No hotels found</h3>
                        <p>Try adjusting your search criteria or dates.</p>
                      </div>
                    ) : (
                      <StaggerContainer className="search-results-list" staggerDelay={0.05}>
                        {(results?.hotels || []).map((hotel, idx) => (
                          <StaggerItem key={idx}>
                            <div className="search-result-card hotel-card-modern">
                              <div className="hotel-card-image" style={{ backgroundImage: `url(${hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'})` }}>
                                {hotel.rating && <div className="floating-rating"><Star size={12} fill="#fff" /> {hotel.rating}</div>}
                              </div>
                              <div className="hotel-card-content">
                                <div className="hotel-main-info">
                                  <h3>{hotel.name}</h3>
                                  <p className="hotel-address"><MapPin size={12} /> {hotel.address || hotelForm.location}</p>
                                  <div className="hotel-stars">
                                    {[...Array(hotel.starRating || 4)].map((_, i) => <Star key={i} size={14} fill="var(--warning)" color="var(--warning)" />)}
                                  </div>
                                </div>
                                <div className="hotel-card-price-action" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                  <div className="price-block">
                                    <span className="price-val">{formatCurrency(hotel.pricePerNight, hotel.currency)}</span>
                                    <span className="price-lbl">/ night</span>
                                  </div>
                                  <Button variant="primary" onClick={() => window.open(hotel.bookingUrl || '#', '_blank')}>View Rooms</Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleSaveItem('hotel', hotel.name, { ...hotel, price: hotel.pricePerNight })}>
                                    <Sparkles size={14} style={{ marginRight: '6px' }} /> Save to Trip
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    )}
                  </>
                )}

                {activeTab === 'trains' && (
                  <>
                    <div className="results-header-modern">
                      <h2>{(results?.trains || []).length} Trains Found</h2>
                    </div>
                    {results.trains.length === 0 ? (
                      <div className="empty-results-state">
                        <Train size={48} opacity={0.5} />
                        <h3>No trains found</h3>
                        <p>Check the station codes (e.g., NDLS) and try again.</p>
                      </div>
                    ) : (
                      <StaggerContainer className="search-results-list" staggerDelay={0.05}>
                        {(results?.trains || []).map((train, idx) => (
                          <StaggerItem key={idx}>
                            <div className="search-result-card flight-card-modern">
                              <div className="flight-airline-box">
                                <Train size={32} color="var(--ocean-400)" />
                                <div className="airline-details">
                                  <span className="airline-name">{train.trainName}</span>
                                  <span className="flight-number">#{train.trainNumber}</span>
                                </div>
                              </div>
                              <div className="flight-timeline-box">
                                <div className="time-point text-right">
                                  <strong>{train.departureTime}</strong>
                                  <span>{train.departureStation}</span>
                                </div>
                                <div className="flight-path-viz">
                                  <span className="duration-label">{train.duration}</span>
                                  <div className="path-line"></div>
                                  <span className="stops-label">Class: {train.class}</span>
                                </div>
                                <div className="time-point">
                                  <strong>{train.arrivalTime}</strong>
                                  <span>{train.arrivalStation}</span>
                                </div>
                              </div>
                              <div className="flight-action-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div className="flight-price-huge">{formatCurrency(train.price, train.currency)}</div>
                                <Button variant="primary" size="lg">Book</Button>
                                <Button variant="ghost" size="sm" onClick={() => handleSaveItem('train', `${train.trainName} (${train.trainNumber})`, train)}>
                                  <Sparkles size={14} style={{ marginRight: '6px' }} /> Save to Trip
                                </Button>
                              </div>
                            </div>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    )}
                  </>
                )}

                {activeTab === 'taxis' && (
                  <>
                    <div className="results-header-modern">
                      <h2>{(results?.taxis || []).length} Taxis Available</h2>
                    </div>
                    {results.taxis.length === 0 ? (
                      <div className="empty-results-state">
                        <Car size={48} opacity={0.5} />
                        <h3>No taxis found</h3>
                        <p>We couldn't locate any available rides for this route.</p>
                      </div>
                    ) : (
                      <StaggerContainer className="search-results-grid" staggerDelay={0.05}>
                        {(results?.taxis || []).map((taxi, idx) => (
                          <StaggerItem key={idx}>
                            <div className="search-result-card taxi-card-modern">
                              <div className="taxi-img-wrapper">
                                <Car size={40} color="var(--primary)" />
                              </div>
                              <div className="taxi-meta">
                                <h3>{taxi.company}</h3>
                                <span className="car-type">{taxi.carType}</span>
                                <div className="taxi-time"><Clock size={14} /> Est: {taxi.estimatedTime}</div>
                              </div>
                              <div className="taxi-action" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                <div className="taxi-price">{formatCurrency(taxi.price, taxi.currency)}</div>
                                <Button variant="primary">Reserve</Button>
                                <Button variant="ghost" size="sm" onClick={() => handleSaveItem('car', `${taxi.company} - ${taxi.carType}`, taxi)}>
                                  <Sparkles size={14} style={{ marginRight: '6px' }} /> Save to Trip
                                </Button>
                              </div>
                            </div>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    )}
                  </>
                )}
              </div>

            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {selectedItem && (
        <AddToTripModal 
          open={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          item={selectedItem} 
        />
      )}
    </div>
  );
}
