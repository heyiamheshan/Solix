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
      <div className="result-card main-recommendation glass-card">
        <div className="card-header">
           <h3>
             <FaSolarPanel className="card-icon" />
             AI Recommendation
           </h3>
        </div>
        <div className="card-body">
           <div className="primary-stat">
             <span className="value">{financial_report.recommended_system_kw} kW</span>
             <span className="label">Recommended System Size</span>
           </div>
           
           <div className={`ai-note ${isWarning ? 'warning' : 'success'}`}>
             <strong>{isWarning ? "⚠️ Analysis Note:" : "✅ Analysis Note:"}</strong> {financial_report.note}
           </div>
        </div>
      </div>

      {/* --- GRID STATS --- */}
      <div className="result-grid">
        
        {/* 1. ROOF USABLE AREA (Fixed) */}
        <div className="stat-card glass-card">
          <div className="icon-box icon-teal">
            <FaRulerCombined />
          </div>
          <div className="stat-info">
            <label>Usable Roof Area</label>
            <p className="stat-value">{areaDisplay} m²</p>
            {isEstimated && (
              <small className="estimated-badge">
                (Estimated - Low Visibility)
              </small>
            )}
          </div>
        </div>

        {/* 2. ANNUAL ENERGY OUTPUT (Fixed) */}
        <div className="stat-card glass-card">
          <div className="icon-box icon-blue">
            <FaBolt />
          </div>
          <div className="stat-info">
            <label>Annual Energy Output</label>
            <p className="stat-value">{annualGen.toLocaleString()} kWh</p>
            <small className="stat-subtext">
              ({monthlyGen} kWh / month)
            </small>
          </div>
        </div>

        {/* 3. MONTHLY SAVINGS */}
        <div className="stat-card glass-card">
          <div className="icon-box icon-green">
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <label>Monthly Savings</label>
            <p className="stat-value">LKR {financial_report.normal_monthly_income.toLocaleString()}</p>
          </div>
        </div>

        {/* 4. PAYBACK PERIOD */}
        <div className="stat-card glass-card">
          <div className="icon-box icon-yellow">
            <FaClock />
          </div>
          <div className="stat-info">
            <label>Payback Period</label>
            <p className="stat-value">{financial_report.payback_period} Years</p>
          </div>
        </div>

      </div>

      {/* --- FINANCIAL SUMMARY FOOTER --- */}
      <div className="financial-summary glass-card">
         <h4>💰 Financial Projection</h4>
         
         <div className="financial-row">
            <span>Total Investment Required:</span>
            <strong>LKR {financial_report.total_investment_lkr.toLocaleString()}</strong>
         </div>
         
         <div className="financial-row">
            <span>Est. Bank Loan Installment:</span>
            <strong className="expense">- LKR {financial_report.loan_installment.toLocaleString()} / mo</strong>
         </div>
         
         <div className="financial-row financial-total">
            <span>Net Monthly Impact:</span>
            <strong className={financial_report.net_monthly_result > 0 ? 'profit' : 'expense'}>
               {financial_report.net_monthly_result > 0 ? "Profit: +" : "Cost: "} 
               LKR {financial_report.net_monthly_result.toLocaleString()}
            </strong>
         </div>
      </div>

    </div>
  );
};

export default InsightsResultsSection;