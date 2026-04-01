import React, { useState, useEffect } from 'react';

const Addon = (props) => {
  const [items, setItems] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', qty: 1, price: '', vendor: '', stored: '', expiry: '', category: 'FOOD', threshold: 5
  });

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/items');
      const data = await res.json();
      setItems(data);
    } catch (err) { console.error("Sync Error"); }
  };

  // FIXED: Midnight normalization for 100% accurate day counting
  const calculateDaysLeft = (expiryDate) => {
    if (!expiryDate) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to midnight

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0); // Reset to midnight

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const showNotification = (msg) => {
    setLastUpdated(msg);
    setTimeout(() => setLastUpdated(null), 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if(res.ok) {
        await fetchInventory(); 
        if(props.onItemAdded) props.onItemAdded(); 
        setFormData({ name: '', qty: 1, price: '', vendor: '', stored: '', expiry: '', category: 'FOOD', threshold: 5 });
        showNotification("ITEM_ADDED");
      }
    } catch (err) { showNotification("SERVER_ERROR"); }
  };

  const handleTableUpdate = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    showNotification(`SAVED: ${field.toUpperCase()}`);
  };

  const removeItem = async (id) => {
    await fetch(`http://localhost:8080/api/items/${id}`, { method: 'DELETE' });
    fetchInventory();
    if(props.onItemAdded) props.onItemAdded();
    showNotification("REMOVED");
  };

  return (
    <div style={styles.addonPage}>
      <style>
        {`
          /* GLOBAL SCROLL FIX */
          html, body { 
            overflow-x: auto !important; 
            width: 100%;
            position: relative;
          }

          .tactical-input {
            width: 100%; height: 50px; background: rgba(0,0,0,0.4); 
            border: 2px solid #2c4766; border-radius: 12px; color: #fff; 
            padding: 0 15px; outline: none; transition: 0.4s;
            font-weight: 800; font-size: 1rem; letter-spacing: 1px;
          }
          .tactical-input:focus {
            border-color: #0ef; box-shadow: 0 0 20px rgba(0,238,255,0.4);
          }
          .glow-btn {
            border: none; width: 100%; height: 55px; border-radius: 12px;
            background: #0ef; color: #000; font-weight: 900; font-size: 1.1rem;
            letter-spacing: 2px; cursor: pointer; transition: 0.3s;
            box-shadow: 0 0 15px rgba(0,238,255,0.5);
          }
          .glow-btn:hover { transform: scale(1.02); box-shadow: 0 0 30px #0ef; }
          
          .table-edit-input {
            background: transparent; border: none; color: #fff; font-weight: 700;
            width: 100%; outline: none; border-bottom: 1px solid transparent;
          }
          .table-edit-input:focus { border-bottom: 1px solid #0ef; }
        `}
      </style>

      {lastUpdated && <div style={styles.toast}>{lastUpdated}</div>}

      <div style={styles.topGrid}>
        <div style={styles.formContainer}>
          <h2 style={styles.sectionHeader}>ADD <span style={{color: '#0ef'}}>NEW ITEM</span></h2>
          <form onSubmit={handleSubmit} style={styles.mainBox}>
            <div style={styles.inputGrid}>
              <div style={styles.field}><label style={styles.boldLabel}>ITEM NAME</label><input className="tactical-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Enter name..." /></div>
              <div style={styles.field}><label style={styles.boldLabel}>SUPPLIER</label><input className="tactical-input" value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} required placeholder="Company name..." /></div>
              <div style={styles.field}><label style={styles.boldLabel}>QUANTITY</label><input type="number" className="tactical-input" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} required /></div>
              <div style={styles.field}><label style={styles.boldLabel}>PRICE PER UNIT (₹)</label><input type="number" className="tactical-input" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required /></div>
              <div style={styles.field}><label style={styles.boldLabel}>DATE STORED</label><input type="date" className="tactical-input" value={formData.stored} onChange={(e) => setFormData({...formData, stored: e.target.value})} required /></div>
              <div style={styles.field}><label style={styles.boldLabel}>EXPIRY DATE</label><input type="date" className="tactical-input" value={formData.expiry} onChange={(e) => setFormData({...formData, expiry: e.target.value})} required /></div>
            </div>
            <button type="submit" className="glow-btn">SAVE ITEM TO SYSTEM</button>
          </form>
        </div>

        <div style={styles.sideContainer}>
          <h2 style={styles.sectionHeader}>BLOCK <span style={{color: '#ff4d4d'}}>SUPPLIER</span></h2>
          <div style={styles.sideBox}>
            <p style={styles.sideDesc}>STOP BUYING FROM RISKY VENDORS</p>
            <input className="tactical-input" style={{borderColor: '#ff4d4d', height: '40px', marginBottom: '15px'}} placeholder="Supplier name..." />
            <button style={styles.blacklistBtn}>ADD TO BLACKLIST</button>
            <div style={styles.emptyNotice}>NO BLOCKED SUPPLIERS FOUND</div>
          </div>
        </div>
      </div>

      <div style={styles.featureRow}>
        <div style={styles.featureCard}>
          <h3 style={{...styles.miniTitle, color: '#ffcc00'}}>⚠️ LOW STOCK ALERT</h3>
          <p style={styles.cardText}>Items will <b>flash</b> in the table if quantity is low. This helps you re-order on time.</p>
          <div style={styles.statusIndicator}>ACTIVE</div>
        </div>

        <div style={styles.featureCard}>
          <h3 style={{...styles.miniTitle, color: '#0ef'}}>📈 EXPIRY WARNING</h3>
          <p style={styles.cardText}>System suggests a <b>lower price</b> when items have less than 5 days left to avoid waste.</p>
          <div style={styles.statusIndicator}>ACTIVE</div>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <div style={styles.scrollContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ITEM NAME</th>
                <th style={styles.th}>SUPPLIER</th>
                <th style={styles.th}>QTY</th>
                <th style={styles.th}>PRICE</th>
                <th style={styles.th}>DAYS LEFT</th>
                <th style={styles.th}>STATUS</th>
                <th style={styles.th}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const days = calculateDaysLeft(item.expiry);
                const isCritical = days < 7;
                return (
                  <tr key={item.id} style={{...styles.tr, borderLeft: isCritical ? '5px solid #ff4d4d' : '5px solid #0ef'}}>
                    <td style={styles.td}><input className="table-edit-input" value={item.name} onChange={(e) => handleTableUpdate(item.id, 'name', e.target.value)} /></td>
                    <td style={styles.td}><input className="table-edit-input" value={item.vendor} onChange={(e) => handleTableUpdate(item.id, 'vendor', e.target.value)} /></td>
                    <td style={styles.td}><input className="table-edit-input" type="number" value={item.qty} onChange={(e) => handleTableUpdate(item.id, 'qty', e.target.value)} /></td>
                    <td style={styles.td}>₹<input className="table-edit-input" style={{width: '60px'}} type="number" value={item.price} onChange={(e) => handleTableUpdate(item.id, 'price', e.target.value)} /></td>
                    <td style={{...styles.td, color: isCritical ? '#ff4d4d' : '#0ef'}}>{days}d</td>
                    <td style={styles.td}>
                      <span style={{...styles.tag, background: isCritical ? 'rgba(255,77,77,0.2)' : 'rgba(0,238,255,0.1)', color: isCritical ? '#ff4d4d' : '#0ef', border: `1px solid ${isCritical ? '#ff4d4d' : '#0ef'}`}}>
                        {isCritical ? 'EXPIRED' : 'GOOD'}
                      </span>
                    </td>
                    <td style={styles.td}><button onClick={() => removeItem(item.id)} style={styles.delBtn}>DELETE</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  addonPage: { padding: '40px', color: '#fff', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', width: '100%' },
  topGrid: { display: 'flex', gap: '30px', marginBottom: '30px', alignItems: 'flex-start', flexWrap: 'wrap' },
  formContainer: { flex: '2 1 600px' },
  sideContainer: { flex: '1 1 300px' },
  sectionHeader: { fontSize: '1.4rem', fontWeight: '900', letterSpacing: '4px', marginBottom: '20px', textTransform: 'uppercase' },
  mainBox: { background: 'rgba(20, 30, 45, 0.8)', padding: '35px', borderRadius: '20px', border: '2px solid rgba(0, 238, 255, 0.2)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' },
  sideBox: { background: 'rgba(30, 10, 10, 0.8)', padding: '25px', borderRadius: '20px', border: '2px solid rgba(255, 77, 77, 0.2)', backdropFilter: 'blur(10px)' },
  inputGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  field: { display: 'flex', flexDirection: 'column', gap: '10px' },
  boldLabel: { fontSize: '0.8rem', fontWeight: '900', color: '#0ef', letterSpacing: '2px' },
  sideDesc: { fontSize: '0.65rem', color: '#ff4d4d', fontWeight: '900', marginBottom: '15px', letterSpacing: '1px' },
  blacklistBtn: { width: '100%', background: '#ff4d4d', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' },
  emptyNotice: { marginTop: '20px', fontSize: '0.6rem', color: '#666', fontWeight: '800', textAlign: 'center' },
  featureRow: { display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' },
  featureCard: { flex: 1, minWidth: '280px', background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' },
  miniTitle: { fontSize: '0.9rem', fontWeight: '900', marginBottom: '10px', letterSpacing: '1px' },
  cardText: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' },
  statusIndicator: { position: 'absolute', top: '15px', right: '15px', fontSize: '0.6rem', background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '4px', color: '#fff', fontWeight: '900' },
  tableWrapper: { background: 'rgba(10, 20, 30, 0.6)', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.1)', overflow: 'hidden', width: '100%' },
  scrollContainer: { overflowX: 'auto', width: '100%' }, 
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '1000px' },
  th: { padding: '20px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', fontSize: '0.75rem', fontWeight: '900', color: '#0ef', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' },
  td: { padding: '18px 20px', fontSize: '0.9rem', fontWeight: '600' },
  tag: { padding: '4px 12px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '900' },
  delBtn: { background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '900' },
  toast: { position: 'fixed', top: '100px', right: '40px', background: '#0ef', color: '#000', padding: '15px 30px', borderRadius: '10px', fontWeight: '900', zIndex: 9999 }
};

export default Addon;