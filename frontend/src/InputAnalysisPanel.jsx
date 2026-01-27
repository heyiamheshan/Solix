import React, { useState, useCallback } from 'react';
import LocationSelector from './LocationSelector';

const InputAnalysisPanel = ({ onAnalyze, loading }) => {
  const [district, setDistrict] = useState("Colombo");
  const [bill, setBill] = useState("");
  const [phase, setPhase] = useState("Single");
  const [lat, setLat] = useState("6.9271");
  const [lon, setLon] = useState("79.8612");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);

  const DISTRICTS = [
    "Colombo", "Gampaha", "Kalutara", "Galle", "Matara", "Hambantota",
    "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", 
    "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam",
    "Anuradhapura", "Polonnaruwa", "Matale", "Kandy", "Nuwara Eliya",
    "Kegalle", "Ratnapura", "Badulla", "Monaragala"
  ];

  const detectDistrict = async (latitude, longitude) => {
    setIsAutoDetecting(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      if (data && data.address) {
        const addressValues = [data.address.state_district, data.address.county, data.address.city, data.address.town].filter(Boolean);
        let found = DISTRICTS.find(d => addressValues.some(val => val.toLowerCase().includes(d.toLowerCase())));
        if (found) setDistrict(found);
      }
    } catch (error) { console.error(error); }
    setIsAutoDetecting(false);
  };

  const handleLocationSelect = useCallback((newLat, newLon) => {
    setLat(newLat);
    setLon(newLon);
    detectDistrict(newLat, newLon);
    setIsLocationConfirmed(true);
    setValidationError("");
  }, []);

  const handleSubmit = () => {
    setValidationError("");
    if (!isLocationConfirmed) {
        setValidationError("⚠️ Please confirm your location on the map.");
        return;
    }
    const cleanBill = bill.replace(/[^0-9.]/g, ''); 
    if (!cleanBill || parseFloat(cleanBill) <= 0) {
        setValidationError("⚠️ Please enter a valid monthly bill.");
        return;
    }
    onAnalyze({ district, lat, lon, bill: cleanBill, connectionPhase: phase, selectedFile });
  };

  return (
    <div className="input-panel card">
      <h3 style={{fontFamily:'Outfit', fontSize:'1.5rem', marginBottom:'20px', color:'white'}}>
      Setup Your Solar Profile
      </h3>
      
      {/* ERROR ALERT */}
      {validationError && (
          <div style={{ 
              background: 'rgba(220, 38, 38, 0.2)', color: '#fca5a5', padding: '12px', 
              borderRadius: '8px', marginBottom: '20px', border: '1px solid #ef4444', fontWeight: '500'
          }}>
             🛑 {validationError}
          </div>
      )}
      
      {/* MAP WRAPPER */}
      <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}>
        <LocationSelector onLocationSelect={handleLocationSelect} initialLat={lat} initialLon={lon} />
      </div>
      
      <div style={{ textAlign:'right', marginBottom:'20px' }}>
        <span style={{ 
            background: isLocationConfirmed ? 'rgba(0, 230, 118, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
            color: isLocationConfirmed ? '#00e676' : '#fbbf24',
            padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600'
        }}>
            {isLocationConfirmed ? "✅ Location Locked" : "📍 Pin Location Required"}
        </span>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>Target District {isAutoDetecting && <span className="text-neon">✨ Scanning...</span>}</label>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} disabled={isAutoDetecting}>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Connection Type</label>
          <select value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="Single">Single Phase (30A)</option>
            <option value="Three">Three Phase (60A)</option>
          </select>
        </div>
      </div>

      {/* BILL INPUT */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <label>Monthly Bill (LKR) <span className="text-neon">*</span></label>
        <input 
          type="text" inputMode="numeric" placeholder="e.g. 15000" 
          value={bill} onChange={(e) => { setBill(e.target.value); setValidationError(""); }} 
          style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
        />
      </div>

      <div className="coordinates-display" style={{ 
          marginBottom: '15px', padding: '10px', borderRadius: '5px', fontSize: '0.85rem' 
      }}>
         <strong>GPS:</strong> {lat}, {lon}
      </div>

      <div className="form-group">
        <label>Roof Image (Optional)</label>
        <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%' }}>
            <input 
                type="file" 
                onChange={(e) => setSelectedFile(e.target.files[0])} 
                accept="image/*"
                style={{ padding: '10px', background: 'rgba(255,255,255,0.05)' }} 
            />
        </div>
        <small style={{display:'block', color:'#9ca3af', marginTop:'5px'}}>No image? We'll fetch satellite data automatically.</small>
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: '10px' }}>
        {loading ? "⚙️ Processing AI Models..." : "Run Solar Analysis"}
      </button>
    </div>
  );
};

export default InputAnalysisPanel;