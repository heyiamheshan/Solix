import React from 'react';
import './InsightsResultsSection.css';
import { FaRulerCombined, FaSolarPanel, FaBolt, FaMoneyBillWave, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const InsightsResultsSection = ({ result }) => {
  if (!result) return null;

  const { financial_report, roof_analysis } = result;
  
  const areaDisplay = roof_analysis.total_area_m2 || 0;
  const isEstimated = roof_analysis.is_estimated;
  const estimationReason = roof_analysis.estimation_reason || "AI Estimation";
  
  const monthlyGen = financial_report.monthly_generation_kwh;
  const annualGen = Math.round(monthlyGen * 12);
  
  const isWarning = financial_report.note.includes("Warning");

  return (
    <div className="insights-container animate-fade-in">
      
      {/* --- TOP HUD: SYSTEM RECOMMENDATION --- */}
      <div className="hud-card main-recommendation">
        <div className="hud-icon-large">
            <FaSolarPanel />
        </div>
        <div className="hud-content">
           <h3 className="hud-title">AI System Recommendation</h3>
           <div className="hud-big-value">
              {financial_report.recommended_system_kw} <span className="unit">kW</span>
           </div>
           
           <div className={`hud-note ${isWarning ? 'warning' : 'success'}`}>
             {isWarning ? <FaExclamationTriangle /> : <FaCheckCircle />}
             <span>{financial_report.note}</span>
           </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="hud-grid">
        
        {/* 1. Usable Area */}
        <div className="stat-card">
          <div className="stat-icon"><FaRulerCombined /></div>
          <div className="stat-data">
            <label>Usable Roof Area</label>
            <div className="value">{areaDisplay} m²</div>
            {isEstimated && <small className="text-warning">⚠️ {estimationReason}</small>}
          </div>
        </div>

        {/* 2. Annual Output */}
        <div className="stat-card">
          <div className="stat-icon"><FaBolt /></div>
          <div className="stat-data">
            <label>Annual Generation</label>
            <div className="value">{annualGen.toLocaleString()} kWh</div>
            <small className="text-muted">~{monthlyGen} kWh/mo</small>
          </div>
        </div>

        {/* 3. Monthly Savings */}
        <div className="stat-card highlight-card">
          <div className="stat-icon"><FaMoneyBillWave /></div>
          <div className="stat-data">
            <label>Est. Monthly Savings</label>
            <div className="value">LKR {financial_report.normal_monthly_income.toLocaleString()}</div>
          </div>
        </div>

        {/* 4. Payback */}
        <div className="stat-card">
          <div className="stat-icon"><FaClock /></div>
          <div className="stat-data">
            <label>ROI Period</label>
            <div className="value">{financial_report.payback_period} Years</div>
          </div>
        </div>

      </div>

      {/* --- FINANCIAL FOOTER --- */}
      <div className="financial-footer">
         <h4>💰 Financial Projection</h4>
         
         <div className="fin-row">
            <span>Total Investment:</span>
            <span className="fin-val">LKR {financial_report.total_investment_lkr.toLocaleString()}</span>
         </div>
         
         <div className="fin-row">
            <span>Bank Loan (Est.):</span>
            <span className="fin-val text-red">- LKR {financial_report.loan_installment.toLocaleString()} / mo</span>
         </div>
         
         <div className="fin-row net-impact">
            <span>Net Monthly Impact:</span>
            <span className={`fin-val ${financial_report.net_monthly_result > 0 ? 'text-neon' : 'text-red'}`}>
               {financial_report.net_monthly_result > 0 ? "+ PROFIT" : "- COST"} LKR {financial_report.net_monthly_result.toLocaleString()}
            </span>
         </div>
      </div>

    </div>
  );
};

export default InsightsResultsSection;