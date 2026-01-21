import React from 'react';
import { FaRulerCombined, FaSolarPanel, FaBolt, FaMoneyBillWave, FaClock } from 'react-icons/fa';

const InsightsResultsSection = ({ result }) => {
  const { financial_report, roof_analysis } = result;

  // 1. Get the Area (Handling the fallback)
  // If backend sends nothing, default to 0
const areaDisplay = roof_analysis.total_area_m2 || 0;
  const isEstimated = roof_analysis.is_estimated;

  // 2. Calculate Annual Energy (since backend gives Monthly)
  const monthlyGen = financial_report.monthly_generation_kwh;
  const annualGen = Math.round(monthlyGen * 12);
 

  // 3. Styling Logic for Warnings
  const isWarning = financial_report.note.includes("Warning");
  const noteColor = isWarning ? '#856404' : '#155724';
  const noteBg = isWarning ? '#fff3cd' : '#d4edda';
  const noteBorder = isWarning ? '#ffc107' : '#28a745';

  return (
    <div className="insights-container">
      
      {/* --- TOP CARD: AI RECOMMENDATION --- */}
      <div className="result-card main-recommendation">
        <div className="card-header">
           <h3><FaSolarPanel style={{marginRight: '8px'}}/> AI Recommendation</h3>
        </div>
        <div className="card-body">
           <div className="primary-stat">
             <span className="value">{financial_report.recommended_system_kw} kW</span>
             <span className="label">Recommended System Size</span>
           </div>
           
           <div className="ai-note" style={{
               backgroundColor: noteBg,
               color: noteColor,
               borderLeft: `4px solid ${noteBorder}`,
               padding: '12px',
               borderRadius: '4px',
               marginTop: '15px',
               fontSize: '0.95rem'
           }}>
             <strong>{isWarning ? "⚠️ Analysis Note:" : "✅ Analysis Note:"}</strong> {financial_report.note}
           </div>
        </div>
      </div>

      {/* --- GRID STATS --- */}
      <div className="result-grid">
        
        {/* 1. ROOF USABLE AREA (Fixed) */}
        <div className="stat-card">
          <div className="icon-box" style={{background: '#e8f6f3', color: '#1abc9c'}}>
            <FaRulerCombined />
          </div>
          <div className="stat-info">
            <label>Usable Roof Area</label>
            <p className="stat-value">{areaDisplay} m²</p>
            {isEstimated && (
              <small style={{color: '#d35400', fontWeight: 'bold', fontSize: '0.7rem'}}>
                (Estimated - Low Visibility)
              </small>
            )}
          </div>
        </div>

        {/* 2. ANNUAL ENERGY OUTPUT (Fixed) */}
        <div className="stat-card">
          <div className="icon-box" style={{background: '#eaf2f8', color: '#3498db'}}>
            <FaBolt />
          </div>
          <div className="stat-info">
            <label>Annual Energy Output</label>
            <p className="stat-value">{annualGen.toLocaleString()} kWh</p>
            <small style={{color: '#7f8c8d', fontSize: '0.7rem'}}>
              ({monthlyGen} kWh / month)
            </small>
          </div>
        </div>

        {/* 3. MONTHLY SAVINGS */}
        <div className="stat-card">
          <div className="icon-box" style={{background: '#eafaf1', color: '#27ae60'}}>
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <label>Monthly Savings</label>
            <p className="stat-value">LKR {financial_report.normal_monthly_income.toLocaleString()}</p>
          </div>
        </div>

        {/* 4. PAYBACK PERIOD */}
        <div className="stat-card">
          <div className="icon-box" style={{background: '#fef9e7', color: '#f1c40f'}}>
            <FaClock />
          </div>
          <div className="stat-info">
            <label>Payback Period</label>
            <p className="stat-value">{financial_report.payback_period} Years</p>
          </div>
        </div>

      </div>

      {/* --- FINANCIAL SUMMARY FOOTER --- */}
      <div className="financial-summary" style={{
          marginTop: '25px', 
          padding: '20px', 
          background: '#f8f9fa', 
          borderRadius: '10px',
          border: '1px solid #eee'
      }}>
         <h4 style={{margin: '0 0 15px 0', color: '#2c3e50'}}>💰 Financial Projection</h4>
         
         <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
            <span style={{color: '#7f8c8d'}}>Total Investment Required:</span>
            <strong>LKR {financial_report.total_investment_lkr.toLocaleString()}</strong>
         </div>
         
         <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
            <span style={{color: '#7f8c8d'}}>Est. Bank Loan Installment:</span>
            <strong style={{color: '#c0392b'}}>- LKR {financial_report.loan_installment.toLocaleString()} / mo</strong>
         </div>
         
         <div style={{
             marginTop: '15px', 
             paddingTop: '15px', 
             borderTop: '2px dashed #ddd', 
             display: 'flex', 
             justifyContent: 'space-between',
             fontSize: '1.1rem'
         }}>
            <span>Net Monthly Impact:</span>
            <strong style={{color: financial_report.net_monthly_result > 0 ? '#27ae60' : '#c0392b'}}>
               {financial_report.net_monthly_result > 0 ? "Profit: +" : "Cost: "} 
               LKR {financial_report.net_monthly_result.toLocaleString()}
            </strong>
         </div>
      </div>

    </div>
  );
};

export default InsightsResultsSection;