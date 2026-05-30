import { Link } from 'react-router-dom';
import { usePopularDestinations } from '../hooks/useDestinations';
import { Sparkles, Map, CalendarCheck, Bot, Globe, ArrowRight, Plane, ChevronDown } from 'lucide-react';
import DestinationCard from '../components/shared/DestinationCard';
import Skeleton from '../components/shared/Skeleton';
import Button from '../components/shared/Button';
import ScrollReveal from '../components/animations/ScrollReveal';
import TextReveal from '../components/animations/TextReveal';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import ParallaxSection from '../components/animations/ParallaxSection';
import MagneticButton from '../components/animations/MagneticButton';
import Tilt3D from '../components/animations/Tilt3D';
import StaggerContainer, { StaggerItem } from '../components/animations/StaggerContainer';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { data: popularDestinations, isLoading } = usePopularDestinations(6);
  const destinations = Array.isArray(popularDestinations) ? popularDestinations : popularDestinations?.items || popularDestinations?.data || popularDestinations?.$values || [];

  return (
    <div className="home-page">
      {/* ═══ Hero Section ═══ */}
      <section className="hero">
        {/* Floating Orbs */}
        <div className="hero-floating-orb orb-1" />
        <div className="hero-floating-orb orb-2" />
        <div className="hero-floating-orb orb-3" />

        <div className="hero-content">
          <div className="hero-text">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Sparkles size={14} />
              AI-Powered Travel Planning
            </motion.div>

            <h1 className="hero-title" style={{ animation: 'none' }}>
              <TextReveal text="Plan Your Next" delay={0.2} staggerDelay={0.06} />
              <TextReveal
                text="Adventure"
                delay={0.5}
                staggerDelay={0.06}
                className="hero-title-gradient"
              />
              <TextReveal text="Effortlessly" delay={0.8} staggerDelay={0.06} />
            </h1>

            <motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
              transition={{ duration: 0.8, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ animation: 'none' }}
            >
              Discover curated destinations, build smart itineraries with AI, and manage every booking — all from one beautifully designed platform.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ animation: 'none' }}
            >
              <MagneticButton strength={0.15}>
                <Link to="/discover">
                  <Button variant="primary" size="lg">
                    <Globe size={18} />
                    Explore Destinations
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.15}>
                <Link to="/register">
                  <Button variant="secondary" size="lg">
                    Start Planning
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </MagneticButton>
            </motion.div>

            <motion.div
              className="hero-stats"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ animation: 'none' }}
            >
              <div>
                <div className="hero-stat-value">
                  <AnimatedCounter value={500} suffix="+" duration={2.5} />
                </div>
                <div className="hero-stat-label">Destinations</div>
              </div>
              <div>
                <div className="hero-stat-value">
                  <AnimatedCounter value={10} suffix="K+" duration={2} />
                </div>
                <div className="hero-stat-label">Trips Planned</div>
              </div>
              <div>
                <div className="hero-stat-value">
                  <AnimatedCounter value={4.9} duration={2} />
                </div>
                <div className="hero-stat-label">User Rating</div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 60, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: '1200px', animation: 'none' }}
          >
            <div className="hero-visual-grid">
              <Tilt3D intensity={10} scale={1.03} className="hero-visual-card">
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=560&fit=crop&q=75&auto=format,compress" alt="Tropical beach paradise" />
              </Tilt3D>
              <Tilt3D intensity={10} scale={1.03} className="hero-visual-card" style={{ marginTop: 'var(--space-8)' }}>
                <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&h=560&fit=crop&q=75&auto=format,compress" alt="Mountain lake adventure" />
              </Tilt3D>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-indicator-line" />
        </div>
      </section>

      {/* ═══ Popular Destinations ═══ */}
      <section className="section">
        <div className="container">
          <ScrollReveal variant="blur">
            <div className="section-header">
              <div className="section-subtitle">
                <Sparkles size={14} />
                Trending Now
              </div>
              <div className="section-divider" />
              <h2 className="section-title">Popular Destinations</h2>
              <p className="section-description">
                Explore our most loved destinations, handpicked by thousands of travelers worldwide.
              </p>
            </div>
          </ScrollReveal>

          {isLoading ? (
            <div className="destinations-grid">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} variant="card" />
              ))}
            </div>
          ) : (
            <StaggerContainer className="destinations-grid" staggerDelay={0.1}>
              {destinations.map((dest, index) => (
                <StaggerItem key={dest.id}>
                  <Tilt3D intensity={8} scale={1.02} glare={true} style={{ borderRadius: 'var(--radius-lg)' }}>
                    <DestinationCard destination={dest} index={index} />
                  </Tilt3D>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          <ScrollReveal variant="fadeUp" delay={0.3}>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
              <MagneticButton>
                <Link to="/discover">
                  <Button variant="secondary" size="lg">
                    View All Destinations
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section className="section features-section">
        <div className="container">
          <ScrollReveal variant="blur">
            <div className="section-header">
              <div className="section-subtitle">
                <Plane size={14} />
                Why Trippin
              </div>
              <div className="section-divider" />
              <h2 className="section-title">Everything You Need to Travel Smart</h2>
              <p className="section-description">
                From discovery to departure, Trippin handles every detail so you can focus on the experience.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="features-grid" staggerDelay={0.15}>
            <StaggerItem>
              <Link to="/trips" className="feature-card-link">
                <Tilt3D intensity={6} scale={1.02} className="feature-card">
                  <div className="feature-icon terra">
                    <Map size={24} />
                  </div>
                  <h3 className="feature-title">Smart Trip Builder</h3>
                  <p className="feature-description">
                    Create multi-destination trips with budget tracking, date management, and collaborative planning tools.
                  </p>
                </Tilt3D>
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link to="/trips" className="feature-card-link">
                <Tilt3D intensity={6} scale={1.02} className="feature-card">
                  <div className="feature-icon ocean">
                    <Bot size={24} />
                  </div>
                  <h3 className="feature-title">AI Itineraries</h3>
                  <p className="feature-description">
                    Generate personalized day-by-day plans powered by AI. Choose your travel style, budget, and let us handle the rest.
                  </p>
                </Tilt3D>
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link to="/bookings" className="feature-card-link">
                <Tilt3D intensity={6} scale={1.02} className="feature-card">
                  <div className="feature-icon sand">
                    <CalendarCheck size={24} />
                  </div>
                  <h3 className="feature-title">Unified Bookings</h3>
                  <p className="feature-description">
                    Manage flights, hotels, tours, and activities in one place. Track confirmations, status, and documents effortlessly.
                  </p>
                </Tilt3D>
              </Link>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ CTA Banner ═══ */}
      <section className="section">
        <div className="container">
          <ScrollReveal variant="scaleUp">
            <Tilt3D intensity={3} scale={1.005} glare={false} className="cta-banner">
              <div className="cta-banner-content">
                <motion.h2
                  className="cta-banner-title"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  Ready to Start Your Journey?
                </motion.h2>
                <p className="cta-banner-description">
                  Join thousands of travelers who plan smarter with Trippin. Your next adventure is just a click away.
                </p>
                <MagneticButton strength={0.2}>
                  <Link to="/register">
                    <Button variant="primary" size="lg">
                      <Plane size={18} />
                      Get Started — It's Free
                    </Button>
                  </Link>
                </MagneticButton>
              </div>
            </Tilt3D>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
