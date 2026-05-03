import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">
            <span className="footer-brand-icon">✦</span> Trippin
          </div>
          <p className="footer-tagline">
            No Stress. Just Trips. Plan your dream travel itinerary, discover destinations, and manage bookings — all in one beautiful platform.
          </p>
        </div>

        <div>
          <h4 className="footer-heading">Explore</h4>
          <div className="footer-links">
            <Link to="/discover" className="footer-link">Discover</Link>
            <Link to="/discover?category=beach" className="footer-link">Beaches</Link>
            <Link to="/discover?category=mountains" className="footer-link">Mountains</Link>
            <Link to="/discover?category=city" className="footer-link">Cities</Link>
          </div>
        </div>

        <div>
          <h4 className="footer-heading">Plan</h4>
          <div className="footer-links">
            <Link to="/trips" className="footer-link">My Trips</Link>
            <Link to="/bookings" className="footer-link">Bookings</Link>
            <Link to="/profile" className="footer-link">Profile</Link>
          </div>
        </div>

        <div>
          <h4 className="footer-heading">Company</h4>
          <div className="footer-links">
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Trippin. All rights reserved.</span>
        <span>Made with ♥ for travelers</span>
      </div>
    </footer>
  );
}
