import React, { useState } from 'react';

const InputAnalysisPanel = ({ onAnalyze, loading }) => {
  // State for all inputs
  const [district, setDistrict] = useState("Colombo");
  const [bill, setBill] = useState("");
  const [phase, setPhase] = useState("Single"); // Default Single Phase
  const [lat, setLat] = useState("6.9271");
  const [lon, setLon] = useState("79.8612");
  const [selectedFile, setSelectedFile] = useState(null);

  const DISTRICTS = [
    "Colombo", "Gampaha", "Kalutara", "Galle", "Matara", "Hambantota",
    "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", 
    "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam",
    "Anuradhapura", "Polonnaruwa", "Matale", "Kandy", "Nuwara Eliya",
    "Kegalle", "Ratnapura", "Badulla", "Monaragala"
  ];

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLat(position.coords.latitude.toFixed(5));
        setLon(position.coords.longitude.toFixed(5));
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = () => {
    // Pass all data up to App.js
    onAnalyze({
      district,
      lat,
      lon,
      bill,
      connectionPhase: phase, // Send phase
      selectedFile
    });
  };

  return (
    <div className="input-panel glass-card">
      <h3>🚀 Project Setup</h3>
      
      <div className="grid-2">
        {/* District */}
        <div className="form-group">
          <label>District</label>
          <select value={district} onChange={(e) => setDistrict(e.target.value)}>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Connection Phase */}
        <div className="form-group">
          <label>Connection Phase</label>
          <select value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="Single">Single Phase (30A)</option>
            <option value="Three">Three Phase (30A/60A)</option>
          </select>
          <small>Single phase limited to 5kW</small>
        </div>
      </div>

      <div className="form-group">
        <label>Monthly Bill (LKR)</label>
        <input 
          type="number" 
          placeholder="e.g. 15000" 
          value={bill} 
          onChange={(e) => setBill(e.target.value)} 
        />
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>Latitude</label>
          <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Longitude</label>
          <input type="text" value={lon} onChange={(e) => setLon(e.target.value)} />
        </div>
      </div>

      <button className="btn-secondary" onClick={handleGetLocation}>
        📍 Use My Location
      </button>

      <div className="form-group">
        <label>Upload Roof Image (Optional)</label>
        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} accept="image/*" />
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <>
            <span className="loading-spinner"></span>
            Analyzing...
          </>
        ) : (
          "Analyze Project"
        )}
      </button>
    </div>
  );
};

export default InputAnalysisPanel;