import React, { useMemo } from 'react';

const Home = ({ items, setView }) => {
  const metrics = useMemo(() => {
    let totalValue = 0;
    let criticalItems = 0;
    let estimatedLoss = 0;

    items.forEach(item => {
      let daysLeft = item.days_left ?? 0;
      if (item.expiry) {
        const expiryDate = new Date(item.expiry);
        if (!isNaN(expiryDate.getTime())) {
          const now = new Date();
          expiryDate.setHours(0, 0, 0, 0);
          now.setHours(0, 0, 0, 0);
          daysLeft = Math.round((expiryDate - now) / (1000 * 60 * 60 * 24));
        }
      }

      const val = (Number(item.price) || 0) * (Number(item.qty) || 1);
      totalValue += val;

      if (daysLeft <= 7) {
        criticalItems += 1;
        estimatedLoss += val;
      }
    });

    return {
      totalValue,
      criticalItems,
      estimatedLoss,
      activeStock: items.length
    };
  }, [items]);

  return (
    <div style={styles.homeContainer}>
      <style>{`
          @keyframes pulseGlow {
            0% { box-shadow: 0 0 15px rgba(0, 255, 136, 0.2); }
            50% { box-shadow: 0 0 30px rgba(0, 255, 136, 0.6); }
            100% { box-shadow: 0 0 15px rgba(0, 255, 136, 0.2); }
          }
          @keyframes pulseRedGlow {
            0% { box-shadow: 0 0 15px rgba(255, 77, 77, 0.2); }
            50% { box-shadow: 0 0 40px rgba(255, 77, 77, 0.6); }
            100% { box-shadow: 0 0 15px rgba(255, 77, 77, 0.2); }
          }
          .glass-panel {
            background: rgba(10, 10, 10, 0.65);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 30px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .glass-panel:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
          }
          .metric-card {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .hero-btn {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.2);
            color: #fff;
            padding: 16px 30px;
            border-radius: 50px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 800;
            transition: all 0.4s ease;
            letter-spacing: 2px;
            text-transform: uppercase;
            width: 100%;
          }
          .hero-btn:hover {
            background: #00ff88;
            color: #000;
            border-color: #00ff88;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
          }
          .hero-btn.btn-danger:hover {
            background: #ff4d4d;
            border-color: #ff4d4d;
            box-shadow: 0 0 20px rgba(255, 77, 77, 0.5);
          }
      `}</style>

      {/* Cinematic Video Background */}
      <div style={styles.videoWrapper}>
        <video muted autoPlay loop playsInline style={styles.video}>
          <source src="/assets/videos/video.mp4" type="video/mp4" />
        </video>
        <div style={styles.cinematicVignette}></div>
      </div>

      {/* Content Overlay */}
      <div style={styles.overlay}>
        <div style={styles.mainContent}>
          <div style={styles.headerArea}>
            <h1 style={styles.mainTitle}>SYSTEM <span style={{ color: '#00ff88' }}>OVERVIEW</span></h1>
            <p style={styles.subTitle}>REAL-TIME LOGISTICS & ASSET MONITORING // FRESHFLOW PROTOCOL</p>
          </div>

          <div style={styles.gridContainer}>
            {/* Asset Metric */}
            <div className="glass-panel metric-card" style={{ borderLeft: '6px solid #00ff88', animation: 'pulseGlow 4s infinite' }}>
              <span style={styles.metricLabel}>TOTAL SYSTEM ASSETS</span>
              <span style={{...styles.metricValue, color: '#00ff88'}}>₹{metrics.totalValue.toLocaleString()}</span>
              <p style={styles.metricDesc}>Cumulative valuation of all active inventory logged in the global database.</p>
            </div>

            {/* Loss / Alert Metric */}
            <div className="glass-panel metric-card" style={{ borderLeft: `6px solid ${metrics.criticalItems > 0 ? '#ff4d4d' : '#f7ba2b'}`, animation: metrics.criticalItems > 0 ? 'pulseRedGlow 3s infinite' : 'none' }}>
              <span style={{...styles.metricLabel, color: metrics.criticalItems > 0 ? '#ff4d4d' : '#a0a0a0'}}>7-DAY LOSS EXPOSURE</span>
              <span style={{...styles.metricValue, color: metrics.criticalItems > 0 ? '#ff4d4d' : '#fff'}}>₹{metrics.estimatedLoss.toLocaleString()}</span>
              <p style={styles.metricDesc}>Capital at risk due to {metrics.criticalItems} item(s) expiring within a 7-day window.</p>
            </div>

            {/* General Stock Metric */}
            <div className="glass-panel metric-card" style={{ borderLeft: '6px solid #0ef' }}>
              <span style={styles.metricLabel}>ACTIVE STOCK LINES</span>
              <span style={{...styles.metricValue, color: '#0ef'}}>{metrics.activeStock}</span>
              <p style={styles.metricDesc}>Distinct products and lots currently being tracked across all zones.</p>
            </div>
          </div>

          <div style={styles.actionGrid}>
            <button className="hero-btn" onClick={() => setView('dashboard')}>View Analytics</button>
            <button className="hero-btn" onClick={() => setView('addon')}>Manage Inventory</button>
            <button className="hero-btn btn-danger" style={{borderColor: '#0ef', color: '#0ef'}} onClick={() => setView('ai')}>Launch AI Insights</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  homeContainer: { height: '100vh', width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#000' },
  videoWrapper: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 },
  video: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(60%) contrast(120%) saturate(110%)' },
  cinematicVignette: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.95) 100%)', zIndex: 2 },
  overlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5%' },
  mainContent: { width: '100%', maxWidth: '1400px', display: 'flex', flexDirection: 'column', gap: '50px', marginTop: '60px' },
  headerArea: { textAlign: 'center' },
  mainTitle: { fontSize: '4rem', fontWeight: '900', color: '#fff', letterSpacing: '8px', margin: 0, textShadow: '0 10px 30px rgba(0,0,0,0.8)' },
  subTitle: { fontSize: '1rem', fontWeight: '900', color: '#a0a0a0', letterSpacing: '4px', marginTop: '15px' },
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' },
  metricLabel: { fontSize: '0.8rem', fontWeight: '900', color: '#a0a0a0', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' },
  metricValue: { fontSize: '3.5rem', fontWeight: '900', color: '#fff', letterSpacing: '2px', margin: '10px 0', textShadow: '0 5px 15px rgba(0,0,0,0.5)' },
  metricDesc: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', margin: 0, fontWeight: '600' },
  actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }
};

export default Home;