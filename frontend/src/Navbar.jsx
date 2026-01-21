import React from 'react';
import './Navbar.css';
import { FaChartBar, FaCog, FaUserCircle } from 'react-icons/fa'; // Minimal navigation icons

const Navbar = ({ onSettingsClick }) => {
  return (
    <nav className="navbar glass-card">
      <div className="navbar-brand">
        <span className="solix-logo">SOLIX</span>
        <span className="navbar-tagline">Intelligent insights for rooftop energy and climate-driven decisions.</span>
      </div>
      <div className="navbar-icons">
        <FaChartBar className="nav-icon" title="Dashboard" />
        <FaCog className="nav-icon" title="Settings" onClick={onSettingsClick} />
        <FaUserCircle className="nav-icon" title="Profile" />
      </div>
    </nav>
  );
};

export default Navbar;