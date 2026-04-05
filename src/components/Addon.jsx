import React, { useState, useEffect } from 'react';

const Addon = (props) => {
  const [items, setItems] = useState([]);
  const [expiryThreats, setExpiryThreats] = useState([]);
  const [formData, setFormData] = useState({
    name: '', qty: 1, price: '', vendor: '', stored: '', expiry: '', 
    category: 'FOOD', threshold: 5, grade: 'A', quality: 'Excellent'
  });

  useEffect(() => { fetchInventory(); }, []);

  const fetchExpiryThreats = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/expiry-zones');
      const data = await res.json();
      setExpiryThreats(data.critical || []);
    } catch (err) { console.error("Expiry Threat Sync Error", err); }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/items');
      const data = await res.json();
      setItems(data);
      fetchExpiryThreats(); 
    } catch (err) { console.error("Sync Error", err); }
  };

  const handleTableUpdate = async (id, field, value) => {
    const updatedItems = items.map(item => item.id === id ? { ...item, [field]: value } : item);
    setItems(updatedItems);
    await fetch(`http://localhost:8080/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItems.find(it => it.id === id))
    });
    fetchInventory();
    if (props.onItemAdded) props.onItemAdded();
  };

  const calculateLifespan = (d1, d2) => {
    if(!d1 || !d2) return 0;
    const diff = new Date(d2) - new Date(d1);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8080/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if(res.ok) {
      setFormData({name: '', qty: 1, price: '', vendor: '', stored: '', expiry: '', category: 'FOOD', threshold: 5, grade: 'A', quality: 'Excellent'});
      fetchInventory();
      if (props.onItemAdded) props.onItemAdded();
    }
  };

  return (
    <div style={styles.addonPage}>
      <style>{`
          body { background: #000 !important; }
          .card { --background: linear-gradient(to left, #f7ba2b 0%, #ea5358 100%); width: 230px; height: 160px; padding: 3px; border-radius: 1rem; background: var(--background); margin-bottom: 20px;}
          .card-info { background: #080808; color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; border-radius: .9rem; padding: 10px; }
          .tactical-input { width: 100%; height: 45px; background: #080808; border: 1px solid #333; border-radius: 4px; color: #fff; padding: 0 12px; outline: none; font-weight: 900; }
          .table-edit-input { background: transparent; border: none; font-weight: 900; color: #fff; width: 100%; text-transform: uppercase; }
          .review-btn { background: #f7ba2b; color: #000; border: none; padding: 5px 10px; font-weight: 900; cursor: pointer; border-radius: 4px; margin-top: 8px; font-size: 0.7rem; }
          .quality-select { background: #111; color: #fff; border: 1px solid #444; font-size: 0.7rem; margin-top: 5px; }
      `}</style>

      <div style={styles.topGrid}>
        <div style={styles.formContainer}>
          <h2 style={styles.sectionHeader}>WAREHOUSE <span style={{color: '#0ef'}}>ENTRY</span></h2>
          <div style={styles.mainBox}>
            <form onSubmit={handleSubmit} style={styles.inputGrid}>
              <div style={styles.field}><label style={styles.boldLabel}>NOMENCLATURE</label><input className="tactical-input" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} required/></div>
              <div style={styles.field}><label style={styles.boldLabel}>VENDOR ID</label><input className="tactical-input" value={formData.vendor} onChange={(e)=>setFormData({...formData, vendor:e.target.value})} required/></div>
              <div style={styles.field}><label style={styles.boldLabel}>QTY</label><input type="number" className="tactical-input" value={formData.qty} onChange={(e)=>setFormData({...formData, qty:e.target.value})} required/></div>
              <div style={styles.field}><label style={styles.boldLabel}>VALUATION</label><input type="number" className="tactical-input" value={formData.price} onChange={(e)=>setFormData({...formData, price:e.target.value})} required/></div>
              <div style={styles.field}><label style={styles.boldLabel}>STORED</label><input type="date" className="tactical-input" value={formData.stored} onChange={(e)=>setFormData({...formData, stored:e.target.value})} required/></div>
              <div style={styles.field}><label style={styles.boldLabel}>EXPIRY</label><input type="date" className="tactical-input" value={formData.expiry} onChange={(e)=>setFormData({...formData, expiry:e.target.value})} required/></div>
              
              <div style={styles.field}>
                <label style={styles.boldLabel}>CATEGORY</label>
                <select className="tactical-input" value={formData.category} onChange={(e)=>setFormData({...formData, category:e.target.value})}>
                    <option value="FOOD">FOOD</option>
                    <option value="COSMETICS">COSMETICS</option>
                    <option value="PHARMACY">PHARMACY</option>
                    <option value="ELECTRONICS">ELECTRONICS</option>
                </select>
              </div>

              <button type="submit" style={styles.submitBtn}>EXECUTE BATCH LOG</button>
            </form>
          </div>
        </div>

        <div style={styles.sideContainer}>
          <h2 style={styles.sectionHeader}>EXPIRY <span style={{color: '#ff4d4d'}}>THREATS</span></h2>
          <div style={styles.sideBox}>
            {expiryThreats.length > 0 ? expiryThreats.map((item, idx) => (
              <div key={idx} style={styles.expiryRow}>
                <span style={{fontWeight: '900', color: '#fff'}}>{(item.name || 'UNKNOWN').toString().toUpperCase()}</span>
                <span style={{color: '#ff4d4d', fontWeight: '900'}}>{item.days_left}D LEFT</span>
              </div>
            )) : <p style={{color:'#444', textAlign:'center', marginTop:'50px'}}>NO ACTIVE THREATS</p>}
          </div>
        </div>
      </div>

      <h2 style={styles.sectionHeader}>SUPPLIER <span style={{color: '#f7ba2b'}}>INTELLIGENCE</span></h2>
      <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', paddingBottom: '30px'}}>
        {items.map(item => (
          <div key={item.id} className="card">
            <div className="card-info">
              <span style={{fontSize: '0.6rem', color: '#666', fontWeight: '900'}}>{item.vendor}</span>
              <span style={{fontWeight: '900', fontSize: '0.9rem'}}>{item.name}</span>
              <select className="quality-select" value={item.quality || 'Excellent'} onChange={(e) => handleTableUpdate(item.id, 'quality', e.target.value)}>
                {['Excellent', 'Good', 'Average', 'Poor'].map(q => <option key={q} value={q}>{q}</option>)}
              </select>
              <button className="review-btn" onClick={() => alert(`Reviewing ${item.vendor}...`)}>REVIEW LOG</button>
            </div>
          </div>
        ))}
      </div>

      <h2 style={styles.sectionHeader}>CORE <span style={{color: '#0ef'}}>DATABASE</span></h2>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>ITEM</th><th style={styles.th}>QTY</th><th style={styles.th}>PRICE</th><th style={styles.th}>LIFESPAN</th><th style={styles.th}>ACTION</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td style={styles.td}><input className="table-edit-input" value={item.name} onChange={(e) => handleTableUpdate(item.id, 'name', e.target.value)} /></td>
                <td style={styles.td}><input className="table-edit-input" type="number" value={item.qty} onChange={(e) => handleTableUpdate(item.id, 'qty', e.target.value)} /></td>
                <td style={styles.td}><input className="table-edit-input" style={{color: '#0ef'}} type="number" value={item.price} onChange={(e) => handleTableUpdate(item.id, 'price', e.target.value)} /></td>
                <td style={{...styles.td, color: '#0ef', fontWeight: '900'}}>{calculateLifespan(item.stored, item.expiry)}D</td>
                <td style={styles.td}><button style={{border: '1px solid #ff4d4d', color: '#ff4d4d', background: 'none', cursor: 'pointer', padding: '5px 10px'}} onClick={async () => { await fetch(`http://localhost:8080/api/items/${item.id}`, {method: 'DELETE'}); fetchInventory(); if (props.onItemAdded) props.onItemAdded(); }}>PURGE</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  addonPage: { padding: '40px', maxWidth: '1400px', margin: '0 auto' },
  topGrid: { display: 'flex', gap: '30px', marginBottom: '40px' },
  formContainer: { flex: 2 },
  sideContainer: { flex: 1 },
  sectionHeader: { fontSize: '1.3rem', fontWeight: '900', letterSpacing: '4px', marginBottom: '25px', color: '#fff' },
  mainBox: { background: '#080808', padding: '35px', borderRadius: '12px', border: '1px solid #1a1a1a' },
  sideBox: { background: '#0a0000', padding: '30px', borderRadius: '12px', border: '1px solid #ff4d4d33', height: '350px', overflowY: 'auto' },
  inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  boldLabel: { fontSize: '0.8rem', fontWeight: '900', color: '#444', marginBottom: '8px', display: 'block' },
  submitBtn: { gridColumn: 'span 2', background: 'transparent', border: '2px solid #0ef', color: '#0ef', height: '50px', fontWeight: '900', cursor: 'pointer' },
  expiryRow: { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #1a1a1a' },
  tableWrapper: { background: '#050505', borderRadius: '12px', border: '1px solid #1a1a1a' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '20px', textAlign: 'left', color: '#444', fontSize: '0.8rem', fontWeight: '900' },
  td: { padding: '15px 20px' }
};

export default Addon;