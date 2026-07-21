import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Menu, X } from 'lucide-react';

export default function LandingNavbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav style={styles.nav}>
      <div className="landing-nav-container">
        <div style={styles.logoGroup} onClick={() => { setIsOpen(false); navigate('/'); }}>
          <div style={styles.logoIcon}>
            <Sprout size={22} style={{ color: '#fff' }} />
          </div>
          <span style={styles.logoText}>Kilimo<span style={{ color: '#15803d' }}>Chain</span></span>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="landing-burger-btn"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation links & Actions container */}
        <div className={`landing-nav-links-wrapper ${isOpen ? 'open' : ''}`}>
          <div className="landing-nav-links">
            <a href="/#about" onClick={() => setIsOpen(false)} style={styles.navLink}>About</a>
            <a href="/#stakeholders" onClick={() => setIsOpen(false)} style={styles.navLink}>Stakeholders</a>
            <a href="/#prices" onClick={() => setIsOpen(false)} style={styles.navLink}>Market Prices</a>
          </div>

          <div className="landing-auth-group">
            <Link to="/login" onClick={() => setIsOpen(false)} style={styles.btnLogin}>Log In</Link>
            <Link to="/register" onClick={() => setIsOpen(false)} style={styles.btnRegister}>Register As Buyer</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  logoIcon: {
    backgroundColor: '#15803d',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: '#0f172a',
  },
  navLink: {
    color: '#475569',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.9rem',
    transition: 'color 0.2s',
  },
  btnLogin: {
    color: '#475569',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  btnRegister: {
    backgroundColor: '#15803d',
    color: '#fff',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s',
  },
};
