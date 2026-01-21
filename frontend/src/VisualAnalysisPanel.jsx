import React from 'react';
import './VisualAnalysisPanel.css';

const VisualAnalysisPanel = ({ originalImage, annotatedImage }) => {
  if (!originalImage && !annotatedImage) return null;

  return (
    <div className="visual-analysis-panel glass-card animate-fade-in">
      <h2 className="panel-title">Visual Analysis</h2>
      <p className="panel-subtitle">Rooftop detection & potential</p>

      <div className="image-comparison-grid">
        <div className="image-card">
          <h3>Original Rooftop Image</h3>
          {originalImage ? (
            <img src={originalImage} alt="Original Rooftop" />
          ) : (
            <div className="no-image">No Original Image Available</div>
          )}
        </div>
        <div className="image-card">
          <h3>AI-Generated Overlay</h3>
          {annotatedImage ? (
            <img src={`data:image/jpeg;base64,${annotatedImage}`} alt="AI Analyzed Rooftop" />
          ) : (
            <div className="no-image">Run Analysis for Overlay</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualAnalysisPanel;