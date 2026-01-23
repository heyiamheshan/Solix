import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Navbar from './Navbar';
import InputAnalysisPanel from './InputAnalysisPanel';
import InsightsResultsSection from './InsightsResultsSection';
import VisualAnalysisPanel from './VisualAnalysisPanel';
import ReportExportSection from './ReportExportSection';
import SettingsPanel from './SettingsPanel';
import ChatBot from './ChatBot'; // <--- Import

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('solix-theme');
    return savedTheme || 'dark';
  });

  // Apply theme
  useEffect(() => {
    document.body.className = theme + '-theme';
    localStorage.setItem('solix-theme', theme);
  }, [theme]);

  const handleAnalyze = async ({ district, lat, lon, bill, loanTerm, loanRate, selectedFile, connectionPhase }) => {
    setLoading(true);
    setError("");
    setResult(null);
    setIsAnalysisComplete(false);

    const formData = new FormData();
    formData.append('district', district);
    formData.append('lat', lat);
    formData.append('lon', lon);
    formData.append('bill', bill || 0); 
    formData.append('loan_years', loanTerm || 5);
    formData.append('loan_rate', loanRate || 11.5);
    formData.append('phase', connectionPhase || "Single");

    if (selectedFile) {
      formData.append('file', selectedFile);
      setOriginalImage(URL.createObjectURL(selectedFile));
    } else {
      setOriginalImage(null);
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/analyze/full', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      setIsAnalysisComplete(true);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Analysis failed. Is the backend server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Navbar onSettingsClick={() => setIsSettingsOpen(true)} />
      
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        theme={theme} 
        onThemeChange={(newTheme) => setTheme(newTheme)}
      />

      <div className="container">
        <div className="header">
          <h1>SOLIX</h1>
          <p>Intelligent insights for rooftop energy and climate-driven decisions.</p>
        </div>

        <InputAnalysisPanel onAnalyze={handleAnalyze} loading={loading} />
        
        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="results-dashboard">
            <InsightsResultsSection result={result} />
            <VisualAnalysisPanel 
              originalImage={originalImage} 
              annotatedImage={result.roof_analysis.annotated_image} 
              detectionCount={result.roof_analysis.detection_count}
            />
            <ReportExportSection
              isAnalysisComplete={isAnalysisComplete}
              pdfUrl={result.pdf_url}
              onExportReport={() => window.open(result.pdf_url, '_blank')}
            />
          </div>
        )}
      </div>

      {/* --- CHATBOT COMPONENT ADDED HERE --- */}
      <ChatBot />
      
    </div>
  );
}

export default App;