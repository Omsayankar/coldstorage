import React, { useEffect, useRef, useMemo, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Component Imports - Ensure these paths match your folder structure!
import Addon from './components/Addon';
import Dash from './components/dash';
import AiAgent from './components/AiAgent';

gsap.registerPlugin(ScrollTrigger);

// --- CINEMATIC HOME SCROLL ENGINE ---
function HomeScroll() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  
  const steps = useMemo(() => [
    { title: "SYSTEM START", desc: "Initializing FreshFlow eco-protocol for your warehouse logistics." },
    { title: "LOSS TRACKING", desc: "Monitor every rupee. Our system tracks potential financial loss before it happens." },
    { title: "LIVE SYNC", desc: "Change data anywhere. Your inventory updates across all devices instantly." },
    { title: "COLD STORAGE", desc: "Specialized climate monitoring for dairy, meat, and sensitive medical supplies." },
    { title: "LED ALERTS", desc: "Glowing neon indicators tell you exactly what needs to be sold first." },
    { title: "WASTE CONTROL", desc: "Smart algorithms suggest moving stock to prevent disposal and maximize profit." },
    { title: "USER REVIEWS", desc: "How would you rate your experience with FreshFlow today?", isRating: true },
    { title: "ABOUT US", desc: "We are building the future of zero-waste logistics. Connect with our team below:", isSocial: true }
  ], []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.onloadedmetadata = () => {
      gsap.to(video, {
        currentTime: video.duration,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        },
      });
    };
    gsap.to(video, {
      scale: 1.1,
      transformOrigin: "top center",
      ease: 'none',
      scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom bottom', scrub: 1.5 }
    });
    steps.forEach((_, i) => {
      const isEven = i % 2 === 0;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: `${(i * 100) / steps.length}% center`,
          end: `${((i + 1) * 100) / steps.length}% center`,
          scrub: 0.8,
          toggleActions: "play reverse play reverse"
        }
      });
      tl.fromTo(`.card-${i}`, 
        { opacity: 0, x: isEven ? -100 : 100, visibility: 'hidden' }, 
        { opacity: 1, x: 0, visibility: 'visible', duration: 0.5 }
      ).to(`.card-${i}`, { opacity: 0, scale: 0.8, duration: 0.5 }, "+=0.5");
    });
    ScrollTrigger.refresh();
  }, [steps]);

  return (
    <div ref={containerRef} style={styles.container}>
      <div style={styles.videoWrapper}>
        <video ref={videoRef} muted playsInline style={styles.video}>
          <source src="/assets/videos/video.mp4" type="video/mp4" />
        </video>
        <div style={styles.cinematicVignette}></div>
      </div>
      <div style={styles.overlay}>
        {steps.map((step, i) => (
          <div key={i} className={`card-${i}`} style={{
              ...styles.cardPositioner,
              justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end',
              paddingLeft: i % 2 === 0 ? '10%' : '5%',
              paddingRight: i % 2 === 0 ? '5%' : '10%',
            }}>
            <div style={styles.miniGlassCard}>
              <p style={styles.meta}>STEP_0{i + 1}</p>
              <h2 style={styles.title}>{step.title}</h2>
              <p style={styles.description}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('home');

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
          <button className={`capsule-btn ${currentView === 'addon' ? 'active-capsule' : ''}`} onClick={() => setCurrentView('addon')}>ADD ITEM +</button>
          <button className={`capsule-btn ${currentView === 'dashboard' ? 'active-capsule' : ''}`} onClick={() => setCurrentView('dashboard')}>DASHBOARD</button>
          <button className={`capsule-btn ${currentView === 'ai' ? 'active-capsule' : ''}`} style={{borderColor: '#0ef', color: '#0ef'}} onClick={() => setCurrentView('ai')}>AI AGENT</button>
        </div>
      </nav>

      {/* VIEW SWITCHER */}
      {currentView === 'home' && <HomeScroll />}
      {currentView === 'addon' && <div style={styles.fullPageContainer}><div style={styles.featureCard}><Addon /></div></div>}
      {currentView === 'dashboard' && <div style={styles.fullPageContainer}><div style={styles.featureCard}><Dash /></div></div>}
      {currentView === 'ai' && <div style={styles.fullPageContainer}><div style={styles.featureCard}><AiAgent /></div></div>}
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
  cardPositioner: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', visibility: 'hidden', boxSizing: 'border-box' },
  miniGlassCard: { width: '340px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(30px)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(255, 255, 255, 0.15)', pointerEvents: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' },
  meta: { color: '#00ff88', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '4px' },
  title: { color: '#fff', fontSize: '1.7rem', margin: '12px 0', fontWeight: '900', textTransform: 'uppercase' },
  description: { color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: '1.6' },
  fullPageContainer: { paddingTop: '160px', width: '100%', display: 'flex', justifyContent: 'center', minHeight: '100vh', background: '#000', position: 'relative', zIndex: 50 },
  featureCard: { width: '92%', maxWidth: '950px', background: 'transparent' }
};