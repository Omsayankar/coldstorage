import React, { useState, useEffect } from 'react';

const Dash = (props) => {
  const [liveStats, setLiveStats] = useState({
    totalValue: 0,
    estimatedLoss: 0,
    foodRatio: 0,
    cosmeticsRatio: 0,
    electronicsRatio: 0,
    medicalRatio: 0
  });

  useEffect(() => {
    const syncStats = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/stats');
        const data = await res.json();
        
        // FIX: Mapping lowercase keys from Java JDBI to React State
        setLiveStats({
          totalValue: data.totalvalue || 0,
          estimatedLoss: data.estimatedloss || 0,
          foodRatio: data.foodratio || 0,
          cosmeticsRatio: data.cosmeticsratio || 0,
          electronicsRatio: data.electronicsratio || 0,
          medicalRatio: data.medicalratio || 0
        });
      } catch (err) {
        console.error("Stats Sync Error:", err);
      }
    };
    syncStats();
  }, [props.inventory]);

  const getItemsByExpiry = () => {
    if (!props.inventory || props.inventory.length === 0) 
      return { critical: "EMPTY", stable: "EMPTY", secure: "EMPTY" };
    
    const sorted = [...props.inventory].sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
    
    return {
      critical: sorted[0]?.name || "NONE",
      stable: sorted[Math.floor(sorted.length / 2)]?.name || "NONE",
      secure: sorted[sorted.length - 1]?.name || "NONE"
    };
  };

  const expiryNames = getItemsByExpiry();

  const categories = [
    { name: 'FOOD', value: liveStats.foodRatio, color: '#00ff88' },
    { name: 'COSMETICS', value: liveStats.cosmeticsRatio, color: '#00d1ff' },
    { name: 'ELECTRONICS', value: liveStats.electronicsRatio, color: '#ffcc00' },
    { name: 'MEDICAL', value: liveStats.medicalRatio, color: '#ff4d4d' },
  ];

  return (
    <div style={styles.dashPage}>
      <style>
        {`
          @keyframes ledGlowPulse {
            0% { filter: brightness(1) drop-shadow(0 0 5px inherit); }
            50% { filter: brightness(1.6) drop-shadow(0 0 20px inherit); }
            100% { filter: brightness(1) drop-shadow(0 0 5px inherit); }
          }
          .liquid-fill {
            transition: height 1.2s cubic-bezier(0.4, 0, 0.2, 1);
            animation: ledGlowPulse 2.5s infinite ease-in-out;
          }
        `}
      </style>

      <div style={styles.header}>
        <h2 style={styles.mainTitle}>SYSTEM <span style={{color: '#00ff88'}}>DASHBOARD</span></h2>
        <p style={styles.subTitle}>ADAPTIVE MONITORING INTERFACE</p>
      </div>

      <div className="responsive-row" style={styles.statsRow}>
        <div className="stat-card" style={styles.statCard}>
          <label style={styles.miniLabel}>TOTAL INVENTORY VALUE</label>
          <div style={styles.statValue}>₹{Number(liveStats.totalValue).toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{...styles.statCard, borderLeft: '6px solid #ff4d4d'}}>
          <label style={{...styles.miniLabel, color: '#ff4d4d'}}>ESTIMATED LOSS</label>
          <div style={{...styles.statValue, color: '#ff4d4d'}}>₹{Number(liveStats.estimatedLoss).toLocaleString()}</div>
        </div>
      </div>

      <div className="tube-container" style={styles.liquidContainer}>
        {['critical', 'stable', 'secure'].map((level) => {
          const colors = {
            critical: { main: '#ff4d4d', dark: '#660000' },
            stable: { main: '#ffcc00', dark: '#664400' },
            secure: { main: '#00ff88', dark: '#004422' }
          };
          const fillPerc = level === 'critical' ? 90 : level === 'stable' ? 55 : 25;

          return (
            <div key={level} style={styles.tubeWrapper}>
              <div className="glass-tube" style={styles.glassTube}>
                <div 
                  className="liquid-fill" 
                  style={{
                    ...styles.liquidFill, 
                    height: `${fillPerc}%`, 
                    background: `linear-gradient(to top, ${colors[level].dark}, ${colors[level].main})`, 
                    boxShadow: `0 0 25px ${colors[level].main}`
                  }}
                />
              </div>
              <h4 style={{color: colors[level].main, ...styles.tubeLabel}}>{level.toUpperCase()}</h4>
              <p style={styles.expiryItemName}>{expiryNames[level]}</p>
            </div>
          );
        })}
      </div>

      <div className="chart-box" style={styles.chartContainer}>
        <div style={styles.chartInfo}>
          <h3 style={styles.chartTitle}>CATEGORY RATIO</h3>
          <div style={styles.legendGrid}>
            {categories.map(cat => (
              <div key={cat.name} style={styles.legendItem}>
                <span style={{...styles.dot, backgroundColor: cat.color}}></span>
                <span style={styles.legendText}>{cat.name}: {cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <svg viewBox="0 0 36 36" className="pie-svg" style={styles.svgPie}>
          <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#00ff88" strokeWidth="4" strokeDasharray={`${liveStats.foodRatio || 0} 100`} strokeDashoffset="25" />
          <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#00d1ff" strokeWidth="4" strokeDasharray={`${liveStats.cosmeticsRatio || 0} 100`} strokeDashoffset="85" />
          <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#ffcc00" strokeWidth="4" strokeDasharray={`${liveStats.electronicsRatio || 0} 100`} strokeDashoffset="60" />
          <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#ff4d4d" strokeWidth="4" strokeDasharray={`${liveStats.medicalRatio || 0} 100`} strokeDashoffset="40" />
        </svg>
      </div>
    </div>
  );
};

const styles = {
  dashPage: { color: '#fff', fontFamily: 'Inter, sans-serif', paddingBottom: '50px' },
  header: { marginBottom: '30px' },
  mainTitle: { fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: '900', letterSpacing: '5px', margin: 0 },
  subTitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '2px' },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '40px' },
  statCard: { flex: 1, background: 'rgba(255,255,255,0.05)', padding: '35px 25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' },
  miniLabel: { fontSize: '0.75rem', fontWeight: '900', color: '#00ff88', letterSpacing: '2px', display: 'block', marginBottom: '15px' },
  statValue: { fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '900', letterSpacing: '-1px' },
  liquidContainer: { display: 'flex', justifyContent: 'space-around', gap: '20px', marginBottom: '50px' },
  tubeWrapper: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  glassTube: { width: '65px', height: '180px', background: 'rgba(255, 255, 255, 0.02)', border: '3px solid rgba(255, 255, 255, 0.15)', borderRadius: '40px', position: 'relative', overflow: 'hidden' },
  liquidFill: { position: 'absolute', bottom: 0, left: 0, width: '100%', borderRadius: '40px 40px 0 0' },
  tubeLabel: { margin: '15px 0 5px 0', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px' },
  expiryItemName: { fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', textTransform: 'uppercase' },
  chartContainer: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' },
  chartInfo: { flex: 1 },
  chartTitle: { fontSize: '1.2rem', fontWeight: '900', marginBottom: '20px', letterSpacing: '2px' },
  legendGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  dot: { width: '10px', height: '10px', borderRadius: '50%' },
  legendText: { fontSize: '0.85rem', fontWeight: '600', color: '#aaa' },
  svgPie: { width: '220px', minWidth: '150px', transform: 'rotate(-90deg)' }
};

export default Dash;