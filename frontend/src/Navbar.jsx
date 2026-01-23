import React from 'react';
import './Navbar.css';
import { FaHome, FaSun } from 'react-icons/fa'; // Added Home Icon

const Navbar = ({ onHomeClick }) => {
  return (
    <nav className="navbar glass-card" style={styles.nav}>
      
      {/* BRANDING (Updated to Neon Theme) */}
      <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span className="solix-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>
            <FaSun style={{ color: '#00e676' }} /> 
            SOLIX <span style={{ color: '#00e676' }}>.AI</span>
        </span>
        <span className="navbar-tagline" style={{ color: '#9ca3af', fontSize: '0.9rem', borderLeft: '1px solid #333', paddingLeft: '15px', marginLeft: '5px' }}>
            Intelligent Agent Dashboard
        </span>
      </div>

      {/* RIGHT SIDE: HOME BUTTON */}
      <div className="navbar-icons">
        <button 
            onClick={onHomeClick} 
            title="Back to Home Page"
            style={styles.homeBtn}
        >
            <FaHome style={{ fontSize: '1.1rem' }} />
            <span>Home</span>
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    marginBottom: '20px',
    background: 'var(--card-bg)', // Uses your global dark theme
    borderBottom: '1px solid var(--glass-border)',
  },
  homeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  }
};

export default Navbar;