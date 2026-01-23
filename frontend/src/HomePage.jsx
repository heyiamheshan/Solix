import React from 'react';
import './HomePage.css';
import { FaSolarPanel, FaRobot, FaMapMarkedAlt, FaCheck, FaArrowRight, FaBolt } from 'react-icons/fa';


const HomePage = ({ onStartApp }) => {
  return (
    <div className="home-container">
      
      {/* --- NAVIGATION OVERLAY --- */}
      <nav className="navbar-overlay">
        <div className="logo-text">SOLIX <span style={{color:'#00e676'}}>.AI</span></div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#ai-agent">AI Agent</a>
          <a href="#news">Resources</a>
          <button onClick={onStartApp} style={{
            marginLeft: '30px', background: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.2)', color: 'white', 
            padding: '10px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600'
          }}>
            Launch App
          </button>
        </div>
      </nav>

      {/* 1️⃣ CINEMATIC HERO SECTION */}
      <header className="hero-section">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="hero-badge">⚡ Sri Lanka's #1 Solar AI</div>
          <h1>
            Empowering Smarter <br />
            <span style={{ color: '#00e676' }}>Solar Decisions.</span>
          </h1>
          <p>
            Harness the power of satellite intelligence and AI to instantly calculate your roof’s potential. 
            Save money, reduce carbon, and build a sustainable future.
          </p>
          <div className="hero-buttons">
            <button className="btn-neon" onClick={onStartApp}>
              Try Solix AI Agent <FaArrowRight />
            </button>
            <button className="btn-outline" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </button>
          </div>
        </div>
      </header>

      {/* 2️⃣ FEATURES (Glass Grid) */}
      <section id="features" className="section">
        <div className="section-header">
          <h2>Why Choose Solix?</h2>
          <p>Precision engineering meets Artificial Intelligence.</p>
        </div>
        
        <div className="feature-grid">
          <div className="feature-card">
            <div className="icon-box"><FaMapMarkedAlt /></div>
            <h3>Satellite Mapping</h3>
            <p>Pinpoint your exact roof location using our satellite integration to get accurate sunlight hours specific to your district.</p>
          </div>
          <div className="feature-card">
            <div className="icon-box"><FaRobot /></div>
            <h3>AI Financial Analyst</h3>
            <p>Our agent calculates ROI, loan payback periods, and net profit instantly based on the latest 2025 CEB tariffs.</p>
          </div>
          <div className="feature-card">
            <div className="icon-box"><FaBolt /></div>
            <h3>Hybrid Energy Logic</h3>
            <p>Smart recommendations for Battery Storage systems to keep your home powered during grid failures.</p>
          </div>
        </div>
      </section>

      {/* 3️⃣ AI SHOWCASE (Matches Your Image) */}
      <section id="ai-agent" className="section">
        <div className="ai-section">
          
          {/* Text Content */}
          <div className="ai-content">
            <h2>Meet the Intelligent<br/>Agent</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '1.1rem' }}>
              Stop guessing. Let our AI analyze your roof's geometry, local weather patterns, and current financial rates in seconds.
            </p>
            <ul className="ai-features" style={{ listStyle: 'none', padding: 0 }}>
              <li><div className="check-icon"><FaCheck /></div> Instant 20-Year Financial Forecast</li>
              <li><div className="check-icon"><FaCheck /></div> Visual Panel Placement Analysis</li>
              <li><div className="check-icon"><FaCheck /></div> Smart Battery Sizing for Night Use</li>
            </ul>
            <button className="btn-neon" onClick={onStartApp} style={{ marginTop: '30px' }}>
              Launch Analysis Tool
            </button>
          </div>

          {/* Visual Icon */}
          <div className="ai-visual" style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
            <FaSolarPanel size={250} color="#00e676" style={{ filter: 'drop-shadow(0 0 40px rgba(0, 230, 118, 0.4))' }} />
          </div>

        </div>
      </section>

      {/* 4️⃣ NEWS & INSIGHTS (Dark Mode Fixed) */}
      <section id="news" className="section">
        <div className="section-header">
          <h2>Solar Insights & News </h2>
          <p>Stay ahead with the latest renewable trends in Sri Lanka.</p>
        </div>
        
        <div className="news-grid">
          {/* Card 1 */}
          <div className="news-card">
            <div className="news-image"  style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEdcT51ca1pFUQy2wVLkeRy37_tPZaDJGaPw&s')" }}></div>
            <div className="news-body">
              <span className="news-tag" style={{background:'#00e676', color:'black', padding:'4px 8px', borderRadius:'4px', fontSize:'0.7rem', fontWeight:'bold'}}>Market Update</span>
              <h3>CEB Tariff Revision 2025</h3>
              <p>How the new export rates affect your payback period.</p>
              <a href="https://www.dropbox.com/scl/fi/7lv2ewhe8clxj70bq7bi0/Advertisement-Solar-PV-with-BESSTariff-2025-Rev-3.pdf?rlkey=tihkmp9bb8rfeg0qgzfc9gbel&e=1&st=k6m0j21j&dl=1" className="news-link">Read PDF <FaArrowRight size={12}/></a>
            </div>
          </div>

          {/* Card 2 */}
          <div className="news-card">
            <div className="news-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611365892117-00ac5ef43c90?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')" }}></div>
            <div className="news-body">
              <span className="news-tag" style={{background:'#00e676', color:'black', padding:'4px 8px', borderRadius:'4px', fontSize:'0.7rem', fontWeight:'bold'}}>Tech Guide</span>
              <h3>Hybrid vs Off-Grid?</h3>
              <p>Choosing the right battery system for power cuts.</p>
              <a href="https://eximiuspe.com/off-grid-vs-grid-tied-solar-systems-in-sri-lanka-which-one-is-right-for-you/" className="news-link">Read Guide <FaArrowRight size={12}/></a>
            </div>
          </div>

          {/* Card 3 */}
          <div className="news-card">
            <div className="news-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')" }}></div>
            <div className="news-body">
              <span className="news-tag" style={{background:'#00e676', color:'black', padding:'4px 8px', borderRadius:'4px', fontSize:'0.7rem', fontWeight:'bold'}}>Innovation</span>
              <h3>Future of Solar in SL</h3>
              <p>Floating solar parks and what they mean for the grid.</p>
              <a href="#" className="news-link">Read Article <FaArrowRight size={12}/></a>
            </div>
          </div>
        </div>
      </section>

      {/* 5️⃣ FOOTER */}
      
{/* 5️⃣ FOOTER */}
<footer style={{ borderTop: '1px solid #1e293b', padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', color: 'white', marginBottom: '20px' }}>SOLIX</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '40px' }}>
          {/* Privacy and Terms Links can remain dead links or be removed if unused */}
          
          {/* CONTACT LINK WITH POPUP */}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault(); // Prevents the page from scrolling to top
              alert("Mail - pramudithaheshan8@gmail.com\nContact no - 0710691571");
            }}
            style={{ color: '#94a3b8', textDecoration: 'none', cursor: 'pointer' }}
          >
            Contact
          </a>
        </div>

        <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
          © 2025 Solix Sri Lanka | Built for a Sustainable Future.
        </p>
        
        <i style={{ fontSize: '0.8rem', opacity: 0.7 }}>Developed By Group 14</i>
      </footer>

    </div>
  );
};

export default HomePage;