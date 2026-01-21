import React from 'react';
import './SettingsPanel.css';
import { FaTimes, FaSun, FaMoon } from 'react-icons/fa';

const SettingsPanel = ({ isOpen, onClose, theme, onThemeChange }) => {
  if (!isOpen) return null;

  return (
    <div className="settings-panel-overlay" onClick={onClose}>
      <div className="settings-panel glass-card" onClick={(e) => e.stopPropagation()}> {/* Prevent click through */}
        <div className="panel-header">
          <h2>Settings</h2>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>
        
        <div className="setting-item">
          <h3>Theme</h3>
          <div className="theme-toggle-control">
            <button
              className={`theme-toggle-button ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => onThemeChange('dark')}
            >
              <FaMoon /> Dark
            </button>
            <button
              className={`theme-toggle-button ${theme === 'light' ? 'active' : ''}`}
              onClick={() => onThemeChange('light')}
            >
              <FaSun /> Light
            </button>
          </div>
        </div>

        {/* Add more settings options here in the future */}

      </div>
    </div>
  );
};

export default SettingsPanel;