import React, { useEffect, useRef, useMemo, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Component Imports
import Addon from './components/Addon';
import Dash from './components/dash';
import AiAgent from './components/AiAgent';
import Home from './components/Home';

gsap.registerPlugin(ScrollTrigger);

// --- CINEMATIC HOME SCROLL ENGINE REMOVED IN FAVOR OF NEW HOME DASHBOARD ---

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [items, setItems] = useState([]); // SHARED STATE FOR AI

  // UPDATED: MongoDB Sync logic included while preserving functionality
  const fetchGlobalItems = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/items');
      const data = await res.json();
      
      // SYNC: Map MongoDB's _id to React's id so Dash and AI Agent work perfectly
      const mappedItems = data.map(item => ({
        ...item,
        id: item.id || item._id
      }));
      
      setItems(mappedItems);
    } catch (err) { 
      console.error("Global Sync Error: Database unreachable"); 
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchGlobalItems();
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentView === 'home' || !isAuthenticated) {
      document.body.classList.add('hide-scrollbar');
    } else {
      document.body.classList.remove('hide-scrollbar');
      window.scrollTo(0, 0); 
    }
  }, [currentView, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={styles.authGate}>
        <div style={styles.videoWrapper}><video muted autoPlay loop style={styles.video}><source src="/assets/videos/video.mp4" type="video/mp4" /></video></div>
        <div style={styles.loginCard}>
          <h1 style={styles.authTitle}>FRESH<span style={{color: '#00ff88'}}>FLOW</span></h1>
          <button style={styles.bypassBtn} onClick={() => setIsAuthenticated(true)}>AUTHORIZE ACCESS</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh' }}>
      <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; overflow-y: scroll !important; }
          .capsule-btn { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 24px; border-radius: 50px; cursor: pointer; font-size: 0.7rem; font-weight: 800; transition: all 0.4s; letter-spacing: 1.5px; text-transform: uppercase; }
          .capsule-btn:hover { background: #00ff88; color: #000; border-color: #00ff88; transform: translateY(-2px); }
          .active-capsule { background: #00ff88; color: #000; border-color: #00ff88; }
      `}</style>
      
      <nav style={styles.nav}>
        <div style={{ ...styles.logo, cursor: 'pointer' }} onClick={() => setCurrentView('home')}>FRESH<span style={{ color: '#00ff88' }}>FLOW</span></div>
        <div style={styles.navButtons}>
          <button className={`capsule-btn ${currentView === 'home' ? 'active-capsule' : ''}`} onClick={() => setCurrentView('home')}>HOME</button>
          <button className={`capsule-btn ${currentView === 'addon' ? 'active-capsule' : ''}`} onClick={() => setCurrentView('addon')}>MANAGE INVENTORY</button>
          <button className={`capsule-btn ${currentView === 'dashboard' ? 'active-capsule' : ''}`} onClick={() => setCurrentView('dashboard')}>ANALYTICS</button>
          <button className={`capsule-btn ${currentView === 'ai' ? 'active-capsule' : ''}`} style={{borderColor: '#0ef', color: '#0ef'}} onClick={() => setCurrentView('ai')}>AI INSIGHTS</button>
        </div>
      </nav>

      {/* VIEW SWITCHER */}
      {currentView === 'home' && <Home items={items} setView={setCurrentView} />}
      
      {currentView === 'addon' && <div style={styles.fullPageContainer}><div style={styles.featureCard}><Addon onItemAdded={fetchGlobalItems} /></div></div>}
      
      {currentView === 'dashboard' && <div style={styles.fullPageContainer}><div style={styles.featureCard}><Dash inventory={items} /></div></div>}
      
      {currentView === 'ai' && <div style={styles.fullPageContainer}><div style={styles.featureCard}><AiAgent inventoryData={items} refreshData={fetchGlobalItems} /></div></div>}
    </div>
  );
}

const styles = {
  container: { position: 'relative', height: '850vh', width: '100%' },
  authGate: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', backgroundColor: '#000' },
  loginCard: { zIndex: 10, textAlign: 'center' },
  authTitle: { color: '#fff', fontSize: '3.5rem', fontWeight: '900', letterSpacing: '8px' },
  bypassBtn: { background: '#00ff88', border: 'none', color: '#000', fontWeight: '900', padding: '18px 45px', cursor: 'pointer', borderRadius: '50px' },
  nav: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '30px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)', boxSizing: 'border-box' },
  logo: { color: '#fff', fontSize: '1.4rem', fontWeight: '900', letterSpacing: '4px' },
  navButtons: { display: 'flex', gap: '15px' },
  videoWrapper: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1, backgroundColor: '#000' },
  video: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', filter: 'brightness(85%) contrast(120%)' },
  cinematicVignette: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.8) 100%)', zIndex: 2 },
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3, pointerEvents: 'none' },
  fullPageContainer: { paddingTop: '160px', width: '100%', display: 'flex', justifyContent: 'center', minHeight: '100vh', background: '#000', position: 'relative', zIndex: 50 },
  featureCard: { width: '92%', maxWidth: '950px', background: 'transparent' }
};