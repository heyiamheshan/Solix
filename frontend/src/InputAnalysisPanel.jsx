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
  
  // --- NEW VALIDATION STATES ---
  const [validationError, setValidationError] = useState("");
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false); // Tracks if user touched map

  const DISTRICTS = [
    "Colombo", "Gampaha", "Kalutara", "Galle", "Matara", "Hambantota",
    "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", 
    "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam",
    "Anuradhapura", "Polonnaruwa", "Matale", "Kandy", "Nuwara Eliya",
    "Kegalle", "Ratnapura", "Badulla", "Monaragala"
  ];

  // --- DISTRICT DETECTOR ---
  const detectDistrict = async (latitude, longitude) => {
    setIsAutoDetecting(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();

      if (data && data.address) {
        const addressValues = [
          data.address.state_district, data.address.county,         
          data.address.city, data.address.town,
          data.address.state, data.address.region
        ].filter(Boolean); 

        let found = null;
        for (let d of DISTRICTS) {
            const isMatch = addressValues.some(val => 
                val.toLowerCase().includes(d.toLowerCase())
            );
            if (isMatch) {
                found = d;
                break;
            }
        }
        if (found) setDistrict(found);
      }
    } catch (error) {
      console.error("Dist Detect Error:", error);
    }
    setIsAutoDetecting(false);
  };

  const handleLocationSelect = useCallback((newLat, newLon) => {
    setLat(newLat);
    setLon(newLon);
    detectDistrict(newLat, newLon);
    
    // ✅ Mark location as confirmed whenever user interacts with map
    setIsLocationConfirmed(true); 
    setValidationError(""); // Clear errors if any
  }, []);

  // --- SUBMIT HANDLER ---
  const handleSubmit = () => {
    setValidationError("");

    // 1. CHECK LOCATION FIRST
    if (!isLocationConfirmed) {
        setValidationError("⚠️ Please search or pin your exact location on the map.");
        // Scroll to top to show the error near the map
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // 2. CHECK BILL
    const cleanBill = bill.replace(/[^0-9.]/g, ''); 

    if (!cleanBill || parseFloat(cleanBill) <= 0) {
        setValidationError("⚠️ Please enter a valid monthly bill amount.");
        return;
    }
    
    if (parseFloat(cleanBill) < 500) {
        setValidationError("⚠️ Bill amount seems too low (LKR).");
        return;
    }

    onAnalyze({
      district,
      lat,
      lon,
      bill: cleanBill,
      connectionPhase: phase,
      selectedFile
    });
  };

  return (
    <div className="input-panel card" style={{ position: 'relative', zIndex: 1, paddingBottom: '30px' }}>
      <h3>🚀 Project Setup</h3>
      
      {/* GLOBAL ERROR MESSAGE (Top) */}
      {validationError && (
          <div style={{ 
              background: '#ffebee', color: '#c62828', padding: '10px', 
              borderRadius: '6px', marginBottom: '15px', border: '1px solid #ef9a9a',
              display: 'flex', alignItems: 'center', fontWeight: 'bold'
          }}>
             🛑 {validationError}
          </div>
      )}
      
      {/* MAP SECTION */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: '20px' }}>
        <LocationSelector 
            onLocationSelect={handleLocationSelect} 
            initialLat={lat} 
            initialLon={lon} 
        />
        {/* Helper text showing status */}
        <p style={{ fontSize: '0.8rem', marginTop: '5px', textAlign: 'right', color: isLocationConfirmed ? '#27ae60' : '#e67e22', fontWeight: 'bold' }}>
            {isLocationConfirmed ? "✅ Location Confirmed" : "Please confirm location above ☝️"}
        </p>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>District {isAutoDetecting && <span style={{color:'#27ae60'}}>✨ Detecting...</span>}</label>
          <select 
            value={district} 
            onChange={(e) => setDistrict(e.target.value)}
            disabled={isAutoDetecting}
          >
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Connection Phase</label>
          <select value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="Single">Single Phase (30A)</option>
            <option value="Three">Three Phase (30A/60A)</option>
          </select>
        </div>
      </div>

      {/* --- BILL INPUT --- */}
      <div style={{ 
          marginTop: '25px', padding: '15px', background: '#f8f9fa', 
          borderRadius: '8px', border: '1px solid #e9ecef', position: 'relative', zIndex: 999 
      }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ color: '#333', fontWeight: 'bold' }}>Monthly Bill (LKR) <span style={{color:'red'}}>*</span></label>
          <input 
            type="text"
            inputMode="numeric"
            placeholder="e.g. 15000" 
            value={bill} 
            onChange={(e) => {
                setBill(e.target.value);
                setValidationError(""); // Clear error on type
            }} 
            style={{
                width: '100%', padding: '12px', fontSize: '16px',
                color: '#000000', backgroundColor: '#ffffff',
                border: '2px solid #3498db', borderRadius: '6px', marginTop: '8px', pointerEvents: 'auto'
            }}
          />
        </div>
      </div>

      <div className="coordinates-display" style={{ 
          marginTop: '20px', background: '#f8f9fa', padding: '10px', borderRadius: '5px', 
          fontSize: '0.85rem', color: '#555', border: '1px dashed #ccc' 
      }}>
         <strong>Selected GPS:</strong> {lat}, {lon}
      </div>

      <div className="form-group" style={{ marginTop: '15px' }}>
        <label>Upload Roof Image (Optional)</label>
        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} accept="image/*" />
        <small style={{display:'block', color:'#888'}}>If skipped, we will fetch satellite image automatically.</small>
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: '20px' }}>
        {loading ? "Analyzing..." : "Analyze Project"}
      </button>
    </div>
  );
};

export default InputAnalysisPanel;