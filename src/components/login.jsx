import React from 'react';
import { SignIn, ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';

// You will get this Key from the Clerk Dashboard (it's free)
const CLERK_PUBLISHABLE_KEY = "pk_test_Y2xlcmsuYWNjb3VudHMuZGV2JA"; 

const Login = () => {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <div style={styles.authWrapper}>
        
        {/* State: When user is NOT logged in */}
        <SignedOut>
          <div style={styles.glassFrame}>
            <p style={styles.status}>SYSTEM_LOCKED</p>
            <SignIn 
              appearance={{
                elements: {
                  card: { background: 'transparent', boxShadow: 'none' },
                  headerTitle: { color: '#fff', letterSpacing: '2px' },
                  headerSubtitle: { color: 'rgba(255,255,255,0.5)' },
                  socialButtonsBlockButton: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' },
                  formButtonPrimary: { background: '#00ff88', color: '#000' },
                  footer: { display: 'none' }
                }
              }}
            />
          </div>
        </SignedOut>

        {/* State: When user IS logged in */}
        <SignedIn>
          <div style={styles.successBox}>
            <div style={styles.pulse}></div>
            <p style={styles.successText}>OPERATOR_AUTHORIZED</p>
            <p style={styles.subText}>FreshFlow Session Active</p>
          </div>
        </SignedIn>

      </div>
    </ClerkProvider>
  );
};

const styles = {
  authWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  glassFrame: {
    width: '100%',
    textAlign: 'center',
  },
  status: {
    color: '#ff4d4d',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    letterSpacing: '4px',
    marginBottom: '10px'
  },
  successBox: {
    textAlign: 'center',
    padding: '20px',
  },
  successText: {
    color: '#00ff88',
    fontWeight: '900',
    letterSpacing: '3px',
    fontSize: '1rem',
  },
  subText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.8rem',
    marginTop: '5px'
  },
  pulse: {
    width: '12px',
    height: '12px',
    background: '#00ff88',
    borderRadius: '50%',
    margin: '0 auto 15px',
    boxShadow: '0 0 15px #00ff88',
    animation: 'pulse 2s infinite'
  }
};

export default Login;