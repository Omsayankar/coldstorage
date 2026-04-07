import React, { useState, useEffect } from 'react';

const Dash = (props) => {
  const [liveStats, setLiveStats] = useState({
    totalValue: 0, estimatedLoss: 0,
    foodRatio: 0, cosmeticsRatio: 0, electronicsRatio: 0, medicalRatio: 0
  });

  const syncStats = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/stats');
      const data = await res.json();
      setLiveStats({
        totalValue: data.totalValue ?? data.totalvalue ?? 0,
        estimatedLoss: data.estimatedLoss ?? data.estimatedloss ?? 0,
        foodRatio: data.foodRatio ?? data.foodratio ?? 0,
        cosmeticsRatio: data.cosmeticsRatio ?? data.cosmeticsratio ?? 0,
        electronicsRatio: data.electronicsRatio ?? data.electronicsratio ?? 0,
        medicalRatio: data.medicalRatio ?? data.medicalratio ?? 0
      });
    } catch (err) { console.error("Stats Sync Error:", err); }
  };

  useEffect(() => {
    syncStats();
    const interval = setInterval(syncStats, 2000);
    return () => clearInterval(interval);
  }, [props.inventory]);

  const calculatedLoss = React.useMemo(() => {
    if (!props.inventory || props.inventory.length === 0) return liveStats.estimatedLoss;
    return props.inventory.reduce((sum, item) => {
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
      if (daysLeft <= 7) {
         return sum + (Number(item.price) || 0) * (Number(item.qty) || 1);
      }
      return sum;
    }, 0);
  }, [props.inventory, liveStats.estimatedLoss]);

  const categories = [
    { name: 'FOOD', value: liveStats.foodRatio, color: '#00ff88' },
    { name: 'COSMETICS', value: liveStats.cosmeticsRatio, color: '#00d1ff' },
    { name: 'ELECTRONICS', value: liveStats.electronicsRatio, color: '#ffcc00' },
    { name: 'MEDICAL', value: liveStats.medicalRatio, color: '#ff4d4d' },
  ];

  // LIQUID LEVEL: Now scales based on the Percentage of Loss relative to Total Value
  const getLossLiquidHeight = () => {
    if (liveStats.totalValue === 0) return 15;
    const lossPerc = (calculatedLoss / liveStats.totalValue) * 100;
    return Math.min(95, lossPerc + 20); // Base 20% fill + loss intensity
  };

  return (
    <div style={styles.dashPage}>
      <style>{`
          @keyframes ledGlowPulse {
            0% { filter: brightness(1); box-shadow: 0 0 5px inherit; }
            50% { filter: brightness(1.8); box-shadow: 0 0 40px inherit; }
            100% { filter: brightness(1); box-shadow: 0 0 5px inherit; }
          }
          @keyframes criticalAlarm {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; transform: scale(1.02); }
          }
          .liquid-fill { transition: height 1.5s cubic-bezier(0.4, 0, 0.2, 1); }
          .glow-active { animation: ledGlowPulse 2s infinite ease-in-out; }
          .critical-alarm { animation: criticalAlarm 0.8s infinite; }
      `}</style>

      <div style={styles.header}>
        <h2 style={styles.mainTitle}>SYSTEM <span style={{color: '#00ff88'}}>DASHBOARD</span></h2>
        <p style={styles.subTitle}>INTELLIGENT LOSS MONITORING // SIR_EDITION</p>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <label style={styles.miniLabel}>TOTAL INVENTORY VALUE</label>
          <div style={styles.statValue}>₹{Number(liveStats.totalValue).toLocaleString()}</div>
        </div>
        <div style={{...styles.statCard, borderLeft: '6px solid #ff4d4d'}}>
          <label style={{...styles.miniLabel, color: '#ff4d4d'}}>ESTIMATED LOSS (7-DAY WINDOW)</label>
          <div style={{...styles.statValue, color: '#ff4d4d'}}>₹{Number(calculatedLoss).toLocaleString()}</div>
        </div>
      </div>

      <div style={styles.liquidContainer}>
        {['critical', 'stable', 'secure'].map((level) => {
          const isHighLoss = calculatedLoss > (liveStats.totalValue * 0.1);
          const colors = {
            critical: { main: '#ff4d4d', dark: '#660000' },
            stable: { main: '#ffcc00', dark: '#664400' },
            secure: { main: '#00ff88', dark: '#004422' }
          };

          return (
            <div key={level} style={styles.tubeWrapper}>
              <div className={`glass-tube ${level === 'critical' && isHighLoss ? 'critical-alarm' : ''}`} style={styles.glassTube}>
                <div 
                  className={`liquid-fill glow-active`} 
                  style={{
                    ...styles.liquidFill, 
                    height: level === 'critical' ? `${getLossLiquidHeight()}%` : '40%', 
                    background: `linear-gradient(to top, ${colors[level].dark}, ${colors[level].main})`, 
                    boxShadow: `0 0 25px ${colors[level].main}`
                  }}
                />
              </div>
              <h4 style={{color: colors[level].main, ...styles.tubeLabel}}>{level.toUpperCase()}</h4>
            </div>
          );
        })}
      </div>

      {/* Pie Chart and Legend remains same as previous stable version */}
      <div style={styles.chartContainer}>
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
        <svg viewBox="0 0 36 36" style={styles.svgPie}>
          <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          {/* FOOD */}
          <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#00ff88" strokeWidth="3" 
            strokeDasharray={`${(liveStats.foodRatio / 100) * 100} 100`} strokeDashoffset="25" strokeLinecap="round" />
          {/* COSMETICS */}
          <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#00d1ff" strokeWidth="3" 
            strokeDasharray={`${(liveStats.cosmeticsRatio / 100) * 100} 100`} strokeDashoffset={25 - (liveStats.foodRatio / 100) * 100} strokeLinecap="round" />
          {/* ELECTRONICS */}
          <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#ffcc00" strokeWidth="3" 
            strokeDasharray={`${(liveStats.electronicsRatio / 100) * 100} 100`} strokeDashoffset={25 - ((liveStats.foodRatio + liveStats.cosmeticsRatio) / 100) * 100} strokeLinecap="round" />
          {/* MEDICAL */}
          <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#ff4d4d" strokeWidth="3" 
            strokeDasharray={`${(liveStats.medicalRatio / 100) * 100} 100`} strokeDashoffset={25 - ((liveStats.foodRatio + liveStats.cosmeticsRatio + liveStats.electronicsRatio) / 100) * 100} strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

const styles = {
  dashPage: { color: '#fff', padding: '40px' },
  header: { marginBottom: '30px' },
  mainTitle: { fontSize: '2.2rem', fontWeight: '900', letterSpacing: '5px', textTransform: 'uppercase' },
  subTitle: { color: '#00ff88', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '40px' },
  statCard: { flex: 1, background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  miniLabel: { fontSize: '0.75rem', fontWeight: '900', color: '#00ff88', letterSpacing: '2px', display: 'block', marginBottom: '12px', textTransform: 'uppercase' },
  statValue: { fontSize: '2.5rem', fontWeight: '900', letterSpacing: '1px' },
  liquidContainer: { display: 'flex', justifyContent: 'space-around', marginBottom: '50px' },
  tubeWrapper: { textAlign: 'center' },
  glassTube: { width: '65px', height: '180px', background: 'rgba(255, 255, 255, 0.02)', border: '3px solid rgba(255, 255, 255, 0.15)', borderRadius: '40px', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
  liquidFill: { position: 'absolute', bottom: 0, width: '100%', borderRadius: '40px 40px 0 0' },
  tubeLabel: { margin: '15px 0', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' },
  chartContainer: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', gap: '40px' },
  chartInfo: { flex: 1 },
  chartTitle: { fontSize: '1.3rem', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' },
  legendGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  dot: { width: '12px', height: '12px', borderRadius: '50%', boxShadow: '0 0 12px currentColor' },
  legendText: { fontSize: '0.85rem', color: '#fff', fontWeight: '800' },
  svgPie: { width: '220px', minWidth: '220px', transform: 'rotate(-90deg)', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' }
};

export default Dash;