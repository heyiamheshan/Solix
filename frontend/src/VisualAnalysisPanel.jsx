import React from 'react';
import './VisualAnalysisPanel.css';

const VisualAnalysisPanel = ({ originalImage, annotatedImage, detectionCount }) => {
  // Only hide if we have absolutely nothing. 
  // If we have an original image but no annotation yet, we still show the panel.
  if (!originalImage && !annotatedImage) return null;

  return (
    <div className="visual-analysis-panel glass-card animate-fade-in">
      <h2 className="panel-title">Visual Analysis</h2>
      <p className="panel-subtitle">Rooftop detection & solar potential assessment</p>

      {/* --- SECTION 1: AI COMPARISON --- */}
      <div className="image-comparison-grid">
        
        {/* Left: Original */}
        <div className="image-card">
          <h3>Original Satellite View</h3>
          <div className="img-wrapper">
            {originalImage ? (
              <img src={originalImage} alt="Original Rooftop" />
            ) : (
              <div className="no-image">No Original Image</div>
            )}
          </div>
        </div>

        {/* Right: AI Result */}
        <div className="image-card">
          <h3>
            AI Detection 
            {detectionCount !== undefined && <span className="badge"> {detectionCount} Panels</span>}
          </h3>
          <div className="img-wrapper">
            {annotatedImage ? (
              <img src={`data:image/jpeg;base64,${annotatedImage}`} alt="AI Analyzed Rooftop" />
            ) : (
              <div className="no-image">Running Analysis...</div>
            )}
          </div>
        </div>
      </div>

      {/* --- SECTION 2: NATIONAL CONTEXT (SolarGIS) --- */}
      <div className="solargis-section" style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', display:'flex', alignItems:'center',justifyContent: 'center', gap:'10px' }}>
           Sri Lanka Solar Potential Zone
        </h3>
        
        <div className="solargis-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px', maxWidth: '800px', textAlign: 'center' }}>
            While our AI analyzes your specific roof, this map shows the general solar irradiance for your region. 
            Red/Orange zones (North/East/South) typically generate <strong>10-15% more power</strong> than Green zones (Central/West).
          </p>
          
          <img 
            src="https://solargis.com/file?url=download/Sri%20Lanka/Solar-resource-map-Photovoltaic-power-potential-Sri-Lanka-en.png" 
            alt="Sri Lanka Solar Potential Map" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '400px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          />
          
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '8px' }}>
            Source: © 2020 The World Bank, Global Solar Atlas 2.0, Solar resource data: Solargis.
          </p>
        </div>
      </div>

    </div>
  );
};

export default VisualAnalysisPanel;