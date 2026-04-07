import React, { useState, useEffect } from 'react';

const Addon = (props) => {
  const [items, setItems] = useState([]);
  const [alertList, setAlertList] = useState([]);
  const [newAlert, setNewAlert] = useState({ date: '', msg: '' });
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '', qty: 1, price: '', vendor: '', stored: '', expiry: '', 
    category: 'FOOD', quality: 'Excellent', rating: 0
  });

  useEffect(() => { 
    fetchInventory(); 
    fetchAlerts();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/items');
      const data = await res.json();
      setItems(data.map(item => ({
        ...item,
        id: item.id || item._id,
        quality: item.quality || 'Excellent',
        rating: item.rating || 0
      })));
    } catch (err) { console.error("Sync Error", err); }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/alerts');
      if (res.ok) setAlertList(await res.json());
    } catch (err) { console.error("Alert Sync Error", err); }
  };

  // ADD ALERT
  const handleAddAlert = async () => {
    if (!newAlert.date || !newAlert.msg.trim()) return;
    try {
      const res = await fetch('http://localhost:8080/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      });
      if (res.ok) {
        setNewAlert({ date: '', msg: '' });
        fetchAlerts();
      }
    } catch (err) { console.error("Add Alert Error", err); }
  };

  // DELETE ALERT FIX
  const handleDeleteAlert = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/alerts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAlerts();
    } catch (err) { console.error("Delete Alert Error", err); }
  };

  const handleFieldChange = (id, field, value) => {
    setPendingUpdates(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleUpdateItem = async (id) => {
    const changes = pendingUpdates[id];
    if (!changes) return;
    const item = items.find(it => it.id === id);
    const updatedItem = { ...item, ...changes };

    const payload = { ...updatedItem };
    delete payload.id;
    delete payload._id;
    delete payload.days_left;
    delete payload._computedDaysLeft;

    const res = await fetch(`http://localhost:8080/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      setPendingUpdates(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      fetchInventory();
      if (props.onItemAdded) props.onItemAdded();
    }
  };

  const handleInstantSync = async (id, field, value) => {
    const item = items.find(it => it.id === id);
    const updatedItem = { ...item, [field]: value };
    setItems(items.map(it => it.id === id ? updatedItem : it));

    const payload = { ...updatedItem };
    delete payload.id;
    delete payload._id;
    delete payload.days_left;
    delete payload._computedDaysLeft;

    await fetch(`http://localhost:8080/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (props.onItemAdded) props.onItemAdded();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8080/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if(res.ok) {
      setFormData({name: '', qty: 1, price: '', vendor: '', stored: '', expiry: '', category: 'FOOD', quality: 'Excellent', rating: 0});
      fetchInventory();
      if (props.onItemAdded) props.onItemAdded();
    }
  };

  const shadowColors = ['#0ef', '#f7ba2b', '#00ff88', '#ea5358'];

  return (
    <div style={styles.addonPage}>
      <style>{`
          .premium-card { background: #080808; border: 1px solid #333; border-radius: 12px; padding: 20px; transition: 0.3s; }
          .tactical-label { color: #FFFFFF; font-size: 1rem; font-weight: 900; display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
          .tactical-input { width: 100%; height: 45px; background: #111; border: 1px solid #333; border-radius: 6px; color: #fff; padding: 0 12px; font-weight: 800; outline: none; }
          .editable-cell { background: transparent; border: none; color: #fff; width: 100%; font-weight: 900; outline: none; font-size: 1rem; border-bottom: 1px solid transparent; }
          .editable-cell:focus { border-bottom: 1px solid #0ef; color: #0ef; }
          .star-btn { background: none; border: none; font-size: 1.4rem; cursor: pointer; padding: 0 3px; }
          .update-btn { background: #0ef; color: #000; border: none; padding: 8px 15px; font-weight: 900; cursor: pointer; border-radius: 4px; margin-right: 10px; }
          .update-btn:disabled { background: #222; color: #555; cursor: not-allowed; }
          .delete-btn { background: none; border: 1px solid #ff4d4d; color: #ff4d4d; padding: 8px 15px; font-weight: 900; cursor: pointer; border-radius: 4px; }
          .alert-item { background: #111; border-left: 4px solid #00ff88; padding: 10px; margin-bottom: 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;}
          .clear-alert-btn { background: #ff4d4d; color: #000; border: none; padding: 4px 10px; font-weight: 900; border-radius: 4px; cursor: pointer; font-size: 0.7rem;}
      `}</style>

      <div style={styles.topSection}>
        <div className="premium-card" style={{ flex: 1.8, borderLeft: '6px solid #0ef' }}>
          <h2 style={styles.sectionHeader}>WAREHOUSE <span style={{color: '#0ef'}}>ENTRY</span></h2>
          <form onSubmit={handleSubmit} style={styles.formGrid}>
            <div><label className="tactical-label">Nomenclature</label><input className="tactical-input" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} required/></div>
            <div><label className="tactical-label">Vendor ID</label><input className="tactical-input" value={formData.vendor} onChange={(e)=>setFormData({...formData, vendor:e.target.value})} required/></div>
            <div><label className="tactical-label">Qty</label><input type="number" className="tactical-input" value={formData.qty} onChange={(e)=>setFormData({...formData, qty:e.target.value})} required/></div>
            <div><label className="tactical-label">Valuation (₹)</label><input type="number" className="tactical-input" value={formData.price} onChange={(e)=>setFormData({...formData, price:e.target.value})} required/></div>
            <div><label className="tactical-label">Stored</label><input type="date" className="tactical-input" value={formData.stored} onChange={(e)=>setFormData({...formData, stored: e.target.value.substring(0,10)})} required/></div>
            <div><label className="tactical-label">Expiry</label><input type="date" className="tactical-input" value={formData.expiry} onChange={(e)=>setFormData({...formData, expiry: e.target.value.substring(0,10)})} required/></div>
            <div style={{gridColumn: 'span 2'}}><label className="tactical-label">Category</label>
              <select className="tactical-input" value={formData.category} onChange={(e)=>setFormData({...formData, category:e.target.value})}>
                <option value="FOOD">FOOD</option><option value="ELECTRONICS">ELECTRONICS</option><option value="COSMETICS">COSMETICS</option><option value="PHARMACY">PHARMACY</option>
              </select>
            </div>
            <button type="submit" style={styles.executeBtn}>EXECUTE BATCH LOG</button>
          </form>
        </div>

        <div className="premium-card" style={{ flex: 1.2, borderLeft: '6px solid #ff4d4d' }}>
          <h2 style={styles.sectionHeader}>SYSTEM <span style={{color: '#ff4d4d'}}>ALERTS</span></h2>
          
          <div style={{maxHeight: '260px', overflowY: 'auto', marginTop: '15px'}}>
            {items.map(item => {
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
              return { ...item, _computedDaysLeft: daysLeft };
            }).filter(item => item._computedDaysLeft <= 7).length === 0 ? (
               <p style={{color: '#00ff88', fontSize:'0.9rem', textAlign:'center', marginTop:'40px', fontWeight:'900'}}>ALL SYSTEMS NOMINAL. NO EXPIRING ITEMS.</p>
            ) : items.map(item => {
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
              return { ...item, _computedDaysLeft: daysLeft };
            }).filter(item => item._computedDaysLeft <= 7).map((item, i) => (
              <div key={item.id || i} className="alert-item" style={{borderLeftColor: item._computedDaysLeft < 0 ? '#ff0000' : '#ffcc00'}}>
                <div>
                  <b style={{color: item._computedDaysLeft < 0 ? '#ff0000' : '#ffcc00'}}>
                    {item._computedDaysLeft < 0 ? "EXPIRED" : `EXPIRING IN ${item._computedDaysLeft} DAYS`}
                  </b>
                  <p style={{color: '#fff', margin: '5px 0 0 0', fontSize: '0.8rem', fontWeight: '900'}}>{(item.name || "UNNAMED").toUpperCase()} - {item.qty} UNITS</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 style={styles.sectionHeader}>SUPPLIER <span style={{color: '#f7ba2b'}}>INTELLIGENCE</span></h2>
      <div style={styles.intelGrid}>
        {items.map((item, idx) => (
          <div key={item.id} className="premium-card" style={{ boxShadow: `0 0 25px ${shadowColors[idx % 4]}44`, borderColor: shadowColors[idx % 4] }}>
            <span style={{ fontSize: '1.2rem', color: shadowColors[idx % 4], fontWeight: '900' }}>{(item.vendor || "UNKNOWN").toUpperCase()}</span>
            <p style={{ color: '#FFF', fontWeight: '900', margin: '8px 0', fontSize: '1rem' }}>{(item.name || "UNNAMED").toUpperCase()}</p>
            <select className="tactical-input" style={{height: '35px', fontSize: '0.8rem'}} value={item.quality} onChange={(e) => handleInstantSync(item.id, 'quality', e.target.value)}>
              {['Excellent', 'Good', 'Average', 'Poor'].map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            <div style={{margin: '15px 0'}}>
              {[1,2,3,4,5].map(star => (
                <button key={star} className="star-btn" onClick={() => handleInstantSync(item.id, 'rating', star)}
                  style={{color: star <= (item.rating || 0) ? '#f7ba2b' : '#222'}}>★</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 style={styles.sectionHeader}>CORE <span style={{color: '#0ef'}}>DATABASE</span></h2>
      <input 
        type="text" 
        className="tactical-input" 
        style={{marginBottom: '20px', width: '300px', display: 'block'}} 
        placeholder="SEARCH BY NAME OR CATEGORY..." 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
      />
      <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: '#111' }}>
              <th style={styles.thVisible}>ITEM NOMENCLATURE</th>
              <th style={styles.thVisible}>QTY</th>
              <th style={styles.thVisible}>VALUATION (₹)</th>
              <th style={styles.thVisible}>STATUS</th>
              <th style={styles.thVisible}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {items
              .filter(item => {
                const term = searchQuery.toLowerCase();
                return item.name?.toLowerCase().includes(term) || item.category?.toLowerCase().includes(term);
              })
              .map((item) => {
              const pending = pendingUpdates[item.id] || {};
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
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={styles.td}><input className="editable-cell" value={pending.name ?? item.name} onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)} /></td>
                  <td style={styles.td}><input className="editable-cell" type="number" value={pending.qty ?? item.qty} onChange={(e) => handleFieldChange(item.id, 'qty', e.target.value)} /></td>
                  <td style={styles.td}><input className="editable-cell" style={{color: '#0ef'}} type="number" value={pending.price ?? item.price} onChange={(e) => handleFieldChange(item.id, 'price', e.target.value)} /></td>
                  <td style={styles.td}>
                    <div style={{display:'flex', flexDirection:'column', justifyContent: 'center'}}>
                       <span style={{color: daysLeft <= 7 ? '#ff4d4d' : '#00ff88', fontWeight: '900', fontSize: '1rem', letterSpacing: '1px'}}>
                           {daysLeft < 0 ? "EXPIRED" : `${daysLeft} Days`}
                       </span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <button className="update-btn" disabled={!pendingUpdates[item.id]} onClick={() => handleUpdateItem(item.id)}>UPDATE</button>
                    <button className="delete-btn" onClick={async () => {
                        if(window.confirm("DELETE?")) {
                          await fetch(`http://localhost:8080/api/items/${item.id}`, {method: 'DELETE'});
                          fetchInventory();
                        }
                    }}>DELETE</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  addonPage: { padding: '40px 60px', maxWidth: '1600px', margin: '0 auto' },
  topSection: { display: 'flex', gap: '40px', marginBottom: '50px' },
  sectionHeader: { fontSize: '1.5rem', fontWeight: '900', letterSpacing: '4px', marginBottom: '25px', color: '#fff', textTransform: 'uppercase' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
  executeBtn: { gridColumn: 'span 2', background: '#0ef', color: '#000', height: '50px', fontWeight: '900', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' },
  alertBtn: { background: '#00ff88', color: '#000', width: '100%', height: '45px', fontWeight: '900', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  intelGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', marginBottom: '40px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thVisible: { padding: '25px', textAlign: 'left', color: '#FFFFFF', fontSize: '0.85rem', letterSpacing: '2px', fontWeight: '900' },
  td: { padding: '20px 25px' }
};

export default Addon;