import { useState } from 'react';
import { Search, Plane, Building, Train, Car, Calendar, Users, MapPin, ArrowRight, Star, ExternalLink, AlertCircle, Clock } from 'lucide-react';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import ScrollReveal from '../components/animations/ScrollReveal';
import Skeleton from '../components/shared/Skeleton';
import StaggerContainer, { StaggerItem } from '../components/animations/StaggerContainer';
import { formatCurrency } from '../utils/formatters';
import { useSearch } from '../hooks/useSearch';
import { useCurrency } from '../contexts/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPage() {
  const { loading: isSearching, results, searchFlights, searchHotels, searchTrains, searchTaxis, error } = useSearch();
  const { currency } = useCurrency();
  const [activeTab, setActiveTab] = useState('flights');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Flight Form State
  const [flightForm, setFlightForm] = useState({ origin: 'DEL', destination: 'DXB', departDate: '2026-06-01', returnDate: '', passengers: 1 });

  // Hotel Form State
  const [hotelForm, setHotelForm] = useState({ location: '20079110', checkIn: '2026-06-01', checkOut: '2026-06-05', guests: 2 });

  // Train Form State
  const [trainForm, setTrainForm] = useState({ source: 'NDLS', destination: 'BCT', date: '2026-06-01' });

  // Taxi Form State
  const [taxiForm, setTaxiForm] = useState({ from: 'Paris Airport', to: 'Paris City Center', date: '2026-06-01 10:00:00' });

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
        cityCode: hotelForm.location.toUpperCase(),
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

  return (
    <div className="search-page">
      <div className="search-hero">
        {/* Animated Background Visuals */}
        <div className="hero-visuals">
          <motion.div 
            className="orb orb-1"
            animate={{ 
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="orb orb-2"
            animate={{ 
              y: [0, 40, 0],
              x: [0, -30, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <div className="hero-mesh" />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 5 }}>
          <ScrollReveal variant="blur">
            <h1 className="hero-title">Live Search Engine</h1>
            <p className="hero-subtitle">Compare flights, hotels, and taxis across hundreds of providers — find the best deals instantly.</p>
          </ScrollReveal>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <div className="search-widget-container">
          {/* Tabs */}
          <div className="search-tabs">
            <button 
              className={`search-tab ${activeTab === 'flights' ? 'active' : ''}`}
              onClick={() => { setActiveTab('flights'); setHasSearched(false); }}
            >
              <Plane size={18} /> Flights
            </button>
            <button 
              className={`search-tab ${activeTab === 'hotels' ? 'active' : ''}`}
              onClick={() => { setActiveTab('hotels'); setHasSearched(false); }}
            >
              <Building size={18} /> Hotels
            </button>
            <button 
              className={`search-tab ${activeTab === 'trains' ? 'active' : ''}`}
              onClick={() => { setActiveTab('trains'); setHasSearched(false); }}
            >
              <Train size={18} /> Trains
            </button>
            <button 
              className={`search-tab ${activeTab === 'taxis' ? 'active' : ''}`}
              onClick={() => { setActiveTab('taxis'); setHasSearched(false); }}
            >
              <Car size={18} /> Taxis
            </button>
          </div>

          {/* Forms */}
          <div className="search-form-wrapper">
              {activeTab === 'flights' ? (
                <motion.form 
                  key="flights"
                  className="search-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearch}
                >
                  <div className="search-form-grid">
                    <Input label="Origin" icon={MapPin} placeholder="City or Airport" required value={flightForm.origin} onChange={e => setFlightForm({...flightForm, origin: e.target.value})} />
                    <Input label="Destination" icon={MapPin} placeholder="City or Airport" required value={flightForm.destination} onChange={e => setFlightForm({...flightForm, destination: e.target.value})} />
                    <Input label="Depart" type="date" icon={Calendar} required value={flightForm.departDate} onChange={e => setFlightForm({...flightForm, departDate: e.target.value})} />
                    <Input label="Return" type="date" icon={Calendar} value={flightForm.returnDate} onChange={e => setFlightForm({...flightForm, returnDate: e.target.value})} />
                    <Input label="Passengers" type="number" min="1" icon={Users} value={flightForm.passengers} onChange={e => setFlightForm({...flightForm, passengers: e.target.value})} />
                  </div>
                  <div className="search-form-actions">
                    <Button variant="primary" size="lg" type="submit" loading={isSearching} style={{ width: '100%', maxWidth: '300px' }}>
                      <Search size={18} /> Search Flights
                    </Button>
                  </div>
                </motion.form>
              ) : activeTab === 'hotels' ? (
                <motion.form 
                  key="hotels"
                  className="search-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearch}
                >
                  <div className="search-form-grid hotel-grid">
                    <Input label="Destination" icon={MapPin} placeholder="City or Point of Interest" required value={hotelForm.location} onChange={e => setHotelForm({...hotelForm, location: e.target.value})} />
                    <Input label="Check In" type="date" icon={Calendar} required value={hotelForm.checkIn} onChange={e => setHotelForm({...hotelForm, checkIn: e.target.value})} />
                    <Input label="Check Out" type="date" icon={Calendar} required value={hotelForm.checkOut} onChange={e => setHotelForm({...hotelForm, checkOut: e.target.value})} />
                    <Input label="Guests" type="number" min="1" icon={Users} value={hotelForm.guests} onChange={e => setHotelForm({...hotelForm, guests: e.target.value})} />
                  </div>
                  <div className="search-form-actions">
                    <Button variant="primary" size="lg" type="submit" loading={isSearching} style={{ width: '100%', maxWidth: '300px' }}>
                      <Search size={18} /> Search Hotels
                    </Button>
                  </div>
                </motion.form>
              ) : activeTab === 'trains' ? (
                <motion.form 
                  key="trains"
                  className="search-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearch}
                >
                  <div className="search-form-grid hotel-grid">
                    <Input label="From Station" icon={MapPin} placeholder="Source Station" required value={trainForm.source} onChange={e => setTrainForm({...trainForm, source: e.target.value})} />
                    <Input label="To Station" icon={MapPin} placeholder="Destination Station" required value={trainForm.destination} onChange={e => setTrainForm({...trainForm, destination: e.target.value})} />
                    <Input label="Travel Date" type="date" icon={Calendar} required value={trainForm.date} onChange={e => setTrainForm({...trainForm, date: e.target.value})} />
                  </div>
                  <div className="search-form-actions">
                    <Button variant="primary" size="lg" type="submit" loading={isSearching} style={{ width: '100%', maxWidth: '300px' }}>
                      <Search size={18} /> Search Trains
                    </Button>
                  </div>
                </motion.form>
              ) : (
                <motion.form 
                  key="taxis"
                  className="search-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearch}
                >
                  <div className="search-form-grid hotel-grid">
                    <Input label="Pickup" icon={MapPin} placeholder="Pickup Location" required value={taxiForm.from} onChange={e => setTaxiForm({...taxiForm, from: e.target.value})} />
                    <Input label="Drop-off" icon={MapPin} placeholder="Drop-off Location" required value={taxiForm.to} onChange={e => setTaxiForm({...taxiForm, to: e.target.value})} />
                    <Input label="Pickup Time" type="datetime-local" icon={Calendar} required value={taxiForm.date} onChange={e => setTaxiForm({...taxiForm, date: e.target.value})} />
                  </div>
                  <div className="search-form-actions">
                    <Button variant="primary" size="lg" type="submit" loading={isSearching} style={{ width: '100%', maxWidth: '300px' }}>
                      <Search size={18} /> Search Taxis
                    </Button>
                  </div>
                </motion.form>
              )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container" style={{ marginTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
        {isSearching ? (
          <div className="search-results-grid">
            <Skeleton variant="card" height={160} />
            <Skeleton variant="card" height={160} />
            <Skeleton variant="card" height={160} />
          </div>
        ) : error ? (
          <div className="search-error-state">
            <AlertCircle size={48} color="var(--danger)" />
            <h3>Search Failed</h3>
            <p style={{ color: 'var(--danger)', fontWeight: 500 }}>{error}</p>
            <p className="text-sm mt-2">
              Tip: The API requires future dates (Today is May 2, 2026). <br/>
              Current search dates in your form might be in the past.
            </p>
          </div>
        ) : hasSearched ? (
          activeTab === 'flights' ? (
            <StaggerContainer className="search-results-list" staggerDelay={0.1}>
              <div className="results-header">
                <h2>Flight Results</h2>
                <p>Found {results.flights.length} flights from {flightForm.origin || 'Origin'} to {flightForm.destination || 'Destination'}.</p>
              </div>
              {results.flights.map((flight, idx) => (
                <StaggerItem key={idx}>
                  <div className="search-result-card flight-card">
                    <div className="flight-airline">
                      <div className="airline-logo"><Plane size={20} /></div>
                      <div>
                        <div className="airline-name">{flight.airline}</div>
                        <div className="flight-number">{flight.flightNumber}</div>
                      </div>
                    </div>
                    <div className="flight-route">
                      <div className="flight-time-col text-right">
                        <div className="flight-time">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="flight-airport">{flight.origin}</div>
                      </div>
                      <div className="flight-path">
                        <span className="flight-duration">{flight.duration.replace('PT', '').toLowerCase()}</span>
                        <div className="flight-line"><ArrowRight size={16} /></div>
                        <span className="flight-type">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}</span>
                      </div>
                      <div className="flight-time-col">
                        <div className="flight-time">{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="flight-airport">{flight.destination}</div>
                      </div>
                    </div>
                    <div className="flight-price-col">
                      <div className="flight-price">{formatCurrency(flight.price, flight.currency)}</div>
                      <Button variant="outline" size="sm" onClick={() => window.open(flight.bookingUrl, '_blank')}>
                        <ExternalLink size={14} /> Book
                      </Button>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : activeTab === 'hotels' ? (
            <StaggerContainer className="search-results-grid hotels-grid" staggerDelay={0.1}>
              <div className="results-header" style={{ gridColumn: '1 / -1' }}>
                <h2>Hotel Results</h2>
                <p>Found {results.hotels.length} hotels in {hotelForm.location || 'your destination'}.</p>
              </div>
              {results.hotels.map((hotel, idx) => (
                <StaggerItem key={idx}>
                  <div className="search-result-card hotel-card-vertical">
                    <div className="hotel-image">
                      <img 
                        src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'} 
                        alt={hotel.name} 
                        loading="lazy" 
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'; }}
                      />
                    </div>
                    <div className="hotel-info">
                      <h3 className="hotel-name">{hotel.name}</h3>
                      <div className="hotel-rating">
                        <Star size={14} fill="var(--warning)" color="var(--warning)" /> {hotel.rating || 4.0} <span className="rating-label">(Verified)</span>
                      </div>
                      <div className="hotel-amenities">
                        <span className="amenity-tag">Free WiFi</span>
                        <span className="amenity-tag">Air Conditioning</span>
                      </div>
                      <div className="hotel-bottom">
                        <div className="price-box">
                          <span className="hotel-price">{formatCurrency(hotel.pricePerNight, hotel.currency)}</span>
                          <span className="hotel-price-label">/ night</span>
                        </div>
                        <Button variant="primary" size="sm" onClick={() => window.open(hotel.bookingUrl, '_blank')}>
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : activeTab === 'trains' ? (
            <StaggerContainer className="search-results-list" staggerDelay={0.1}>
              <div className="results-header">
                <h2>Train Results</h2>
                <p>Found {results.trains.length} trains from {trainForm.source} to {trainForm.destination}.</p>
              </div>
              {results.trains.map((train, idx) => (
                <StaggerItem key={idx}>
                  <div className="search-result-card flight-card">
                    <div className="flight-airline">
                      <div className="airline-logo"><Train size={20} /></div>
                      <div>
                        <div className="airline-name">{train.trainName}</div>
                        <div className="flight-number">#{train.trainNumber}</div>
                      </div>
                    </div>
                    <div className="flight-route">
                      <div className="flight-time-col text-right">
                        <div className="flight-time">{train.departureTime}</div>
                        <div className="flight-airport">{train.departureStation}</div>
                      </div>
                      <div className="flight-path">
                        <span className="flight-duration">{train.duration}</span>
                        <div className="flight-line"><ArrowRight size={16} /></div>
                        <span className="flight-type">{train.class}</span>
                      </div>
                      <div className="flight-time-col">
                        <div className="flight-time">{train.arrivalTime}</div>
                        <div className="flight-airport">{train.arrivalStation}</div>
                      </div>
                    </div>
                    <div className="flight-price-col">
                      <div className="flight-price">{formatCurrency(train.price, train.currency)}</div>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <StaggerContainer className="search-results-grid" staggerDelay={0.1}>
              <div className="results-header" style={{ gridColumn: '1 / -1' }}>
                <h2>Taxi Results</h2>
                <p>Found {results.taxis.length} available taxis from {taxiForm.from} to {taxiForm.to}.</p>
              </div>
              {results.taxis.map((taxi, idx) => (
                <StaggerItem key={idx}>
                  <div className="search-result-card taxi-card-alt">
                    <div className="taxi-icon-box">
                      <Car size={32} />
                    </div>
                    <div className="taxi-details">
                      <div className="taxi-header">
                        <h3>{taxi.company}</h3>
                        <span className="taxi-type">{taxi.carType}</span>
                      </div>
                      <div className="taxi-meta">
                        <span><Clock size={14} /> {taxi.estimatedTime}</span>
                        <span className="taxi-price">{formatCurrency(taxi.price, taxi.currency)}</span>
                      </div>
                      <Button variant="primary" size="sm" style={{ marginTop: '12px', width: '100%' }}>
                        Book Now
                      </Button>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )
        ) : null}
      </div>
    </div>
  );
}
