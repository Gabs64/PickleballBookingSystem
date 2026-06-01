import React, { useState, useEffect } from 'react';
import HeroSection from './HeroSection';
import BookingModal from './BookingModal';
import { useBooking } from '../context/BookingContext';
import { Sparkles, MessageCircle, Send, X, HelpCircle, Activity, Camera, BookOpen, Check, UserCheck, ShieldAlert, Mail } from 'lucide-react';

export default function CustomerPortal() {
  const { users, addUser, authenticateUser } = useBooking();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Auth states
  const [loggedCustomer, setLoggedCustomer] = useState(() => {
    const saved = sessionStorage.getItem('customer_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'verify'
  
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  
  // Sandbox Email Toast states
  const [sandboxEmailCode, setSandboxEmailCode] = useState('');
  const [showSandboxToast, setShowSandboxToast] = useState(false);

  // Chatbot widget states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: "Welcome to <brand name>! 🏓 How can I assist you with your court rentals today?" }
  ]);
  const [inputText, setInputText] = useState('');

  const startBooking = () => {
    const savedUser = sessionStorage.getItem('customer_user');
    if (!savedUser) {
      setAuthMode('login');
      setAuthError('Authentication required. Please create an account or sign in to book a court.');
      setIsAuthModalOpen(true);
      return;
    }
    setIsBookingOpen(true);
  };

  const handleNav = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    setLoggedCustomer(null);
    sessionStorage.removeItem('customer_logged_in');
    sessionStorage.removeItem('customer_user');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    // Check if email already exists
    const existing = users.find(u => u.email.toLowerCase() === authEmail.toLowerCase());
    if (existing) {
      setAuthError('An account with this email address already exists.');
      return;
    }

    // Generate random 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setEnteredCode('');

    // Retrieve custom SMTP settings from localStorage
    const savedSmtp = localStorage.getItem('pickleball_smtp_config');
    const smtpConfig = savedSmtp ? JSON.parse(savedSmtp) : null;

    // Static Test Run: If SMTP is unconfigured, run Sandbox Mode immediately (prevents failed fetch attempts)
    if (!smtpConfig || !smtpConfig.host || !smtpConfig.auth || !smtpConfig.auth.user) {
      setAuthMode('verify');
      setSandboxEmailCode(code);
      setShowSandboxToast(true);
      setAuthSuccess('Running in Sandbox Mode. Verification code displayed below.');
      return;
    }

    try {
      // Dispatches the code to our local Nodemailer server relay
      const response = await fetch('http://localhost:5000/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          name: authName,
          code: code,
          smtpConfig: smtpConfig
        })
      });

      const data = await response.json();
      
      setAuthMode('verify');
      
      if (data.success && data.mode === 'live') {
        // --- Live SMTP Mode ---
        // HIDE the code from the frontend system as requested. The customer must check their inbox!
        setShowSandboxToast(false);
        setAuthSuccess('A secure verification code has been sent directly to your email address!');
      } else {
        // --- Sandbox Fallback Mode ---
        // If SMTP is unconfigured or failed, show the fallback toast so they can copy it
        setSandboxEmailCode(code);
        setShowSandboxToast(true);
        if (!data.success) {
          setAuthSuccess(`SMTP failed (${data.message}). Sandbox Fallback activated.`);
        } else {
          setAuthSuccess('Running in Sandbox Mode. Verification code displayed below.');
        }
      }

    } catch (err) {
      console.error('Relay error:', err);
      // Network/Server error fallback
      setAuthMode('verify');
      setSandboxEmailCode(code);
      setShowSandboxToast(true);
      setAuthSuccess('Local Express relay server offline. Running in Sandbox Fallback Mode.');
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (enteredCode !== verificationCode) {
      setAuthError('Invalid verification code. Please try again.');
      return;
    }

    // Provision Customer Account (with verified: true)
    const userData = {
      name: authName,
      email: authEmail,
      phone: authPhone,
      password: authPassword,
      role: 'Customer',
      verified: true
    };

    const res = addUser(userData);
    if (res.success) {
      setLoggedCustomer(res.user);
      sessionStorage.setItem('customer_logged_in', 'true');
      sessionStorage.setItem('customer_user', JSON.stringify(res.user));
      setIsAuthModalOpen(false);
      setShowSandboxToast(false);
      
      // Reset fields
      setAuthName('');
      setAuthEmail('');
      setAuthPhone('');
      setAuthPassword('');
      setEnteredCode('');
    } else {
      setAuthError(res.message);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const res = authenticateUser(authEmail, authPassword, 'Customer');
    if (res.success) {
      setLoggedCustomer(res.user);
      sessionStorage.setItem('customer_logged_in', 'true');
      sessionStorage.setItem('customer_user', JSON.stringify(res.user));
      setIsAuthModalOpen(false);
    } else {
      setAuthError(res.message);
    }
  };

  // Chatbot questions handler
  const handleFaqClick = (question, answer) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'user', text: question },
      { id: Date.now() + 1, sender: 'bot', text: answer }
    ]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText('');
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);

    // Simulated quick response
    setTimeout(() => {
      let reply = "I'm a frontend AI mockup. To book a court, click the 'Book A Court Now' button! Operating hours are 6:00 AM - 10:00 PM.";
      if (userText.toLowerCase().includes('price') || userText.toLowerCase().includes('rate')) {
        reply = "All courts (Court 1, Court 2, and Court 3) are ₱450/hr flat rate.";
      } else if (userText.toLowerCase().includes('paddle') || userText.toLowerCase().includes('gear')) {
        reply = "Yes, we rent Carbon Pro paddles at ₱50.00/hr, can of 3 balls for ₱150.00, and ankle-protecting court shoes for ₱100.00 flat fee!";
      } else if (userText.toLowerCase().includes('cancel') || userText.toLowerCase().includes('refund')) {
        reply = "Please visit or contact our cashier terminal receptionist to manage, cancel, or refund your court bookings.";
      }
      setMessages(prev => [...prev, { id: Date.now() + 2, sender: 'bot', text: reply }]);
    }, 800);
  };

  return (
    <div style={styles.portalWrapper}>
      
      {/* PREMIUM STICKY HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerLogo} className="animate-gradient-text">{"<brand name>"}</span>
        </div>
        <nav style={styles.navMenu}>
          <a href="#home" onClick={(e) => handleNav(e, 'home')} style={styles.navLink}>Home</a>
          <a href="#gallery" onClick={(e) => handleNav(e, 'gallery')} style={styles.navLink}>Gallery</a>
          <a href="#about" onClick={(e) => handleNav(e, 'about')} style={styles.navLink}>About</a>
          {loggedCustomer ? (
            <div style={styles.headerProfileBadge} title="Authenticated Customer">
              <span style={styles.headerProfileName}>{loggedCustomer.name}</span>
              <button onClick={handleLogout} style={styles.headerLogoutBtn}>Log Out</button>
            </div>
          ) : (
            <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} style={styles.headerLoginBtn}>
              Sign In
            </button>
          )}
        </nav>
      </header>

      {/* HOME / HERO ANCHOR */}
      <div id="home">
        <HeroSection onStartBooking={startBooking} />
      </div>

      {/* PREMIUM GALLERY SHOWCASE SECTION */}
      <section id="gallery" style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionBadge}>
            <Camera size={12} color="var(--accent-neon)" style={{ marginRight: '4px' }} />
            <span>VISUAL PORTFOLIO</span>
          </div>
          <h2 style={styles.sectionTitle}>Our Premium Court Gallery</h2>
          <p style={styles.sectionSubtitle}>
            Explore our state-of-the-art facilities equipped with elite specifications, low-glare tournament illumination, and non-slip surfaces.
          </p>
        </div>

        <div style={styles.galleryGrid} className="grid-3">
          {/* Card 1 */}
          <div className="glass-card animate-dual-neon" style={styles.galleryCard}>
            <div style={styles.galleryImgPlaceholder}>
              <span style={{ fontSize: '2.5rem' }}>🏟️</span>
              <span style={styles.courtBadgeIndoor}>INDOOR CUSHION</span>
            </div>
            <div style={styles.galleryCardContent}>
              <h3 style={styles.galleryCardTitle}>Court 1</h3>
              <p style={styles.galleryCardDesc}>
                Professional dark blue cushion match-court. Optimized for shock absorption to minimize strain on player joints.
              </p>
              <ul style={styles.cardSpecs}>
                <li><Check size={12} color="var(--accent-neon)" style={{ marginRight: '4px' }} /> Low-glare LED nightlights</li>
                <li><Check size={12} color="var(--accent-neon)" style={{ marginRight: '4px' }} /> Shaded spectator benches</li>
                <li><Check size={12} color="var(--accent-neon)" style={{ marginRight: '4px' }} /> ₱450.00 flat hourly rate</li>
              </ul>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card animate-dual-neon" style={styles.galleryCard}>
            <div style={styles.galleryImgPlaceholder}>
              <span style={{ fontSize: '2.5rem' }}>🏓</span>
              <span style={styles.courtBadgeIndoor}>INDOOR CUSHION</span>
            </div>
            <div style={styles.galleryCardContent}>
              <h3 style={styles.galleryCardTitle}>Court 2</h3>
              <p style={styles.galleryCardDesc}>
                High-rebound cushion court surface designed to support fast-paced rallies and professional tournament actions.
              </p>
              <ul style={styles.cardSpecs}>
                <li><Check size={12} color="var(--accent-neon)" style={{ marginRight: '4px' }} /> Climate controlled building</li>
                <li><Check size={12} color="var(--accent-neon)" style={{ marginRight: '4px' }} /> Acoustic court dividers</li>
                <li><Check size={12} color="var(--accent-neon)" style={{ marginRight: '4px' }} /> ₱450.00 flat hourly rate</li>
              </ul>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card animate-dual-neon" style={styles.galleryCard}>
            <div style={styles.galleryImgPlaceholder}>
              <span style={{ fontSize: '2.5rem' }}>☀️</span>
              <span style={styles.courtBadgeOutdoor}>OUTDOOR PREMIUM</span>
            </div>
            <div style={styles.galleryCardContent}>
              <h3 style={styles.galleryCardTitle}>Court 3</h3>
              <p style={styles.galleryCardDesc}>
                Atmospheric open-air court featuring professional acrylic multi-layer texturing. Perfect for warm social double matches.
              </p>
              <ul style={styles.cardSpecs}>
                <li><Check size={12} color="var(--accent-neon)" style={{ marginRight: '4px' }} /> Windbreak sport fencing</li>
                <li><Check size={12} color="var(--accent-neon)" style={{ marginRight: '4px' }} /> High-power LED night floodlights</li>
                <li><Check size={12} color="var(--accent-neon)" style={{ marginRight: '4px' }} /> ₱450.00 flat hourly rate</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM ABOUT SECTION */}
      <section id="about" style={{ ...styles.sectionContainer, borderTop: '1px solid rgba(255, 255, 255, 0.03)' }}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionBadge}>
            <BookOpen size={12} color="var(--accent-neon)" style={{ marginRight: '4px' }} />
            <span>OUR VISION</span>
          </div>
          <h2 style={styles.sectionTitle}>About Our Academy & Club</h2>
          <p style={styles.sectionSubtitle}>
            Providing elite facilities and amenities to foster a thriving local pickleball community.
          </p>
        </div>

        <div style={styles.aboutRow}>
          <div className="glass-card" style={styles.aboutBlock}>
            <h3 style={styles.aboutBlockTitle}>The Premium Standard</h3>
            <p style={styles.aboutBlockDesc}>
              We are dedicated to bringing international tournament-grade standards to all local pickleball enthusiasts. From our custom-designed cushion flooring that protects player joints, to our selection of professional carbon composite rental paddles, every detail is refined to offer the ultimate playing experience.
            </p>
          </div>
          <div className="glass-card" style={styles.aboutBlock}>
            <h3 style={styles.aboutBlockTitle}>Club & Guest Amenities</h3>
            <p style={styles.aboutBlockDesc}>
              Beyond state-of-the-art courts, our facility supports full player comfort and hospitality. Guests have access to modern lounge areas, hydration counters with athletic beverages, premium shower facilities, secure lockers, and complete rental support at the reception.
            </p>
          </div>
        </div>
      </section>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      {/* AUTHENTICATION MODAL */}
      {isAuthModalOpen && (
        <div style={styles.modalBackdrop} onClick={() => setIsAuthModalOpen(false)}>
          <div 
            className="glass-card animate-modal-pop" 
            style={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {authMode === 'login' ? 'Welcome Back' : authMode === 'register' ? 'Create Account' : 'Verify Email'}
              </h3>
              <button onClick={() => setIsAuthModalOpen(false)} style={styles.closeBtn}>
                <X size={16} />
              </button>
            </div>

            {authError && (
              <div style={styles.errorAlert}>
                <span>⚠️ {authError}</span>
              </div>
            )}

            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} style={styles.authForm}>
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-email">Email Address</label>
                  <input
                    id="auth-email"
                    type="email"
                    className="form-control"
                    placeholder="jane.smith@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label className="form-label" htmlFor="auth-password">Password</label>
                  <input
                    id="auth-password"
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={styles.authBtn}>
                  Log In
                </button>
                <p style={styles.toggleText}>
                  Don't have an account?{' '}
                  <span onClick={() => { setAuthMode('register'); setAuthError(''); }} style={styles.toggleLink}>
                    Sign Up
                  </span>
                </p>
              </form>
            )}

            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} style={styles.authForm}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name">Full Name</label>
                  <input
                    id="reg-name"
                    type="text"
                    className="form-control"
                    placeholder="Jane Smith"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email">Email Address</label>
                  <input
                    id="reg-email"
                    type="email"
                    className="form-control"
                    placeholder="jane.smith@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-phone">Contact Number</label>
                  <input
                    id="reg-phone"
                    type="text"
                    className="form-control"
                    placeholder="0917-888-2938"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label className="form-label" htmlFor="reg-password">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={styles.authBtn}>
                  Register Account
                </button>
                <p style={styles.toggleText}>
                  Already have an account?{' '}
                  <span onClick={() => { setAuthMode('login'); setAuthError(''); }} style={styles.toggleLink}>
                    Log In
                  </span>
                </p>
              </form>
            )}

            {authMode === 'verify' && (
              <form onSubmit={handleVerifySubmit} style={styles.authForm}>
                <div style={styles.verifyPrompt}>
                  <Mail size={32} color="var(--accent-neon)" style={{ marginBottom: '0.75rem' }} />
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                    We have sent a verification code to <strong style={{ color: '#fff' }}>{authEmail}</strong>.
                  </p>
                  {authSuccess && (
                    <p style={{ color: 'var(--accent-neon)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600, padding: '0.35rem 0.65rem', background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.15)', borderRadius: '6px', width: '100%' }}>
                      ℹ️ {authSuccess}
                    </p>
                  )}
                  <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    Enter the 6-digit verification code below to verify your email.
                  </p>
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Code (e.g. 123456)"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    required
                    maxLength={6}
                    style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.1em', fontWeight: 700 }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={styles.authBtn}>
                  Verify & Log In
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SIMULATED EMAIL SANDBOX TOAST POPUP */}
      {showSandboxToast && (
        <div className="glass-card animate-slide-left-bounce" style={styles.sandboxToast}>
          <div style={styles.sandboxToastHeader}>
            <div style={styles.sandboxMailBadge}>
              <Mail size={12} color="#00f0ff" style={{ marginRight: '4px' }} />
              <span>SANDBOX EMAIL CLIENT</span>
            </div>
            <button onClick={() => setShowSandboxToast(false)} style={styles.sandboxCloseBtn}>
              <X size={12} />
            </button>
          </div>
          <div style={styles.sandboxToastContent}>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>FROM: <span style={{ color: '#00f0ff' }}>verification@netrally.com</span></p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>TO: <span style={{ color: '#cbd5e1' }}>{authEmail}</span></p>
            <div style={styles.sandboxCodeDivider}></div>
            <p style={styles.sandboxMailTitle}>🏓 Verify Your Pickleball Account</p>
            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem', lineHeight: 1.4 }}>
              Thanks for registering! Your email verification code is:
            </p>
            <div style={styles.sandboxCodeBox}>
              <span>{sandboxEmailCode}</span>
            </div>
            <p style={{ fontSize: '0.6rem', color: '#475569', textAlign: 'center', marginTop: '0.5rem' }}>
              Copy and paste this code in the registration verification box.
            </p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© 2026 {"<brand name>"}. All rights reserved.</p>
        <p style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.25rem' }}>Designed with premium Vanilla CSS & ReactJS components.</p>
      </footer>

      {/* HIGH-FIDELITY FLOATING FAQ WIDGET */}
      <div style={styles.chatWrapper}>
        {isChatOpen ? (
          <div className="glass-card animate-modal-pop" style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <div style={styles.chatHeaderLeft}>
                <div style={styles.chatAvatar}>🤖</div>
                <div>
                  <h4 style={styles.chatBotName}>SupportBot</h4>
                  <span style={styles.chatStatus}>{"<brand name>"} Support</span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} style={styles.chatCloseBtn}>
                <X size={14} />
              </button>
            </div>

            <div style={styles.chatMessages}>
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  style={{
                    ...styles.chatBubble,
                    ...(m.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleBot)
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>

            {/* Quick FAQs */}
            <div style={styles.faqList}>
              <button 
                onClick={() => handleFaqClick("What are the court prices?", "All of our professional courts are priced at a flat rate of ₱450 per hour.")} 
                style={styles.faqTag}
              >
                💰 Court Prices?
              </button>
              <button 
                onClick={() => handleFaqClick("Can I rent paddles?", "Absolutely! Carbon Pro paddles are available for ₱50.00/hr, cans of balls for ₱150.00 flat, and pro shoes for ₱100.00.")} 
                style={styles.faqTag}
              >
                🏓 Rent Paddles?
              </button>
              <button 
                onClick={() => handleFaqClick("What is your refund policy?", "To cancel or refund a booking, please coordinate with our receptionist at the cashier console terminal.")} 
                style={styles.faqTag}
              >
                🔄 Cancellation Policy?
              </button>
            </div>

            <form onSubmit={handleSendMessage} style={styles.chatInputRow}>
              <input
                type="text"
                placeholder="Ask something..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={styles.chatInput}
              />
              <button type="submit" style={styles.chatSendBtn}>
                <Send size={12} />
              </button>
            </form>
          </div>
        ) : (
          <button 
            onClick={() => setIsChatOpen(true)} 
            style={styles.chatFloatingBtn}
            className="animate-pulse-neon"
          >
            <MessageCircle size={22} color="var(--text-inverse)" />
            <span style={styles.chatFloatingLabel}>FAQ Chat</span>
          </button>
        )}
      </div>

    </div>
  );
}

const styles = {
  portalWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#07080c',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(9, 10, 15, 0.85)',
    backdropFilter: 'blur(16px)',
    padding: '0.8rem 3.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 999,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  headerLogo: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 800,
    fontSize: '1.25rem',
    letterSpacing: '-0.02em',
    color: '#fff',
  },
  navMenu: {
    display: 'flex',
    gap: '2.25rem',
  },
  navLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 650,
    fontFamily: "'Outfit', sans-serif",
    transition: 'color 0.2s',
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },
  sectionContainer: {
    padding: '5rem 3.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '3.5rem',
  },
  sectionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(204, 255, 0, 0.08)',
    border: '1px solid rgba(204, 255, 0, 0.15)',
    color: '#ccff00',
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '0.3rem 0.75rem',
    borderRadius: '30px',
    letterSpacing: '0.08em',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '2.25rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.02em',
    marginBottom: '0.75rem',
  },
  sectionSubtitle: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    maxWidth: '650px',
    margin: '0 auto',
    lineHeight: 1.5,
  },
  galleryGrid: {
    width: '100%',
  },
  galleryCard: {
    background: 'rgba(14, 18, 30, 0.55)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, border-color 0.3s ease',
  },
  galleryImgPlaceholder: {
    height: '180px',
    background: 'linear-gradient(135deg, #131929 0%, #1e263d 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  },
  courtBadgeIndoor: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    fontSize: '0.65rem',
    fontWeight: 750,
    background: 'rgba(0, 240, 255, 0.1)',
    color: '#00f0ff',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    border: '1px solid rgba(0, 240, 255, 0.2)',
  },
  courtBadgeOutdoor: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    fontSize: '0.65rem',
    fontWeight: 750,
    background: 'rgba(204, 255, 0, 0.1)',
    color: '#ccff00',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    border: '1px solid rgba(204, 255, 0, 0.2)',
  },
  galleryCardContent: {
    padding: '1.5rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  galleryCardTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.2rem',
    fontWeight: 750,
    color: '#fff',
    marginBottom: '0.5rem',
  },
  galleryCardDesc: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    lineHeight: 1.5,
    marginBottom: '1.25rem',
  },
  cardSpecs: {
    listStyle: 'none',
    padding: 0,
    margin: 'auto 0 0 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
  },
  cardSpecsItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: '#cbd5e1',
  },
  aboutRow: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  aboutBlock: {
    flex: 1,
    minWidth: '320px',
    background: 'rgba(14, 18, 30, 0.55)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '2rem',
  },
  aboutBlockTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.25rem',
    fontWeight: 750,
    color: '#fff',
    marginBottom: '0.85rem',
  },
  aboutBlockDesc: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    padding: '2.5rem 1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    background: '#07080c',
    fontSize: '0.75rem',
    color: '#64748b',
  },
  chatWrapper: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 998,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  chatFloatingBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--accent-neon)',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '30px',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(204, 255, 0, 0.3)',
    transition: 'transform 0.2s',
  },
  chatFloatingLabel: {
    fontSize: '0.8rem',
    fontWeight: 750,
    color: 'var(--text-inverse)',
    fontFamily: "'Outfit', sans-serif",
  },
  chatBox: {
    width: '320px',
    height: '420px',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
    background: 'rgba(15, 18, 30, 0.95)',
    borderRadius: '16px',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '0.75rem',
    marginBottom: '0.75rem',
  },
  chatHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  chatAvatar: {
    fontSize: '1.1rem',
  },
  chatBotName: {
    fontSize: '0.85rem',
    fontWeight: 700,
  },
  chatStatus: {
    display: 'block',
    fontSize: '0.6rem',
    color: '#10b981',
    fontWeight: 500,
  },
  chatCloseBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    paddingRight: '2px',
    marginBottom: '0.75rem',
  },
  chatBubble: {
    padding: '0.6rem 0.85rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    maxWidth: '85%',
    lineHeight: 1.4,
  },
  chatBubbleBot: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#cbd5e1',
    borderBottomLeftRadius: '2px',
    alignSelf: 'flex-start',
  },
  chatBubbleUser: {
    background: 'rgba(204, 255, 0, 0.1)',
    color: '#ccff00',
    borderBottomRightRadius: '2px',
    alignSelf: 'flex-end',
    border: '1px solid rgba(204, 255, 0, 0.15)',
  },
  faqList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    marginBottom: '0.65rem',
  },
  faqTag: {
    fontSize: '0.6rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '0.25rem 0.45rem',
    borderRadius: '4px',
    color: '#cbd5e1',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  chatInputRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  chatInput: {
    flex: 1,
    background: 'rgba(9,10,15,0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    padding: '0.45rem 0.65rem',
    fontSize: '0.75rem',
    outline: 'none',
  },
  chatSendBtn: {
    background: 'var(--accent-neon)',
    border: 'none',
    width: '30px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLoginBtn: {
    background: 'var(--accent-neon)',
    color: 'var(--text-inverse)',
    fontWeight: 750,
    fontSize: '0.8rem',
    fontFamily: "'Outfit', sans-serif",
    padding: '0.35rem 1rem',
    borderRadius: '30px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  headerProfileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '0.25rem 0.75rem',
    borderRadius: '30px',
  },
  headerProfileName: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#fff',
  },
  headerLogoutBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '0.75rem',
    color: '#f87171',
    cursor: 'pointer',
    fontWeight: 600,
    marginLeft: '4px',
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 6, 10, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '1.5rem',
  },
  modalContainer: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(15, 18, 30, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.75rem',
    borderRadius: '16px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '0.85rem',
    marginBottom: '1.25rem',
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: 750,
    fontFamily: "'Outfit', sans-serif",
  },
  closeBtn: {
    padding: '0.35rem',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#94a3b8',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorAlert: {
    background: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.25)',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    marginBottom: '1rem',
    fontSize: '0.75rem',
    color: '#f87171',
  },
  authForm: {
    display: 'flex',
    flexDirection: 'column',
  },
  authBtn: {
    width: '100%',
    padding: '0.75rem',
    background: 'var(--accent-neon)',
    color: 'var(--text-inverse)',
    fontWeight: 750,
    fontSize: '0.85rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(204, 255, 0, 0.2)',
  },
  toggleText: {
    marginTop: '1.25rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  toggleLink: {
    color: 'var(--accent-neon)',
    fontWeight: 650,
    cursor: 'pointer',
  },
  verifyPrompt: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sandboxToast: {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    width: '320px',
    background: 'rgba(11, 15, 26, 0.95)',
    border: '1px solid rgba(0, 240, 255, 0.25)',
    boxShadow: '0 12px 36px rgba(0, 240, 255, 0.15)',
    borderRadius: '12px',
    padding: '1.25rem',
    zIndex: 9999,
  },
  sandboxToastHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  sandboxMailBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(0, 240, 255, 0.05)',
    border: '1px solid rgba(0, 240, 255, 0.15)',
    borderRadius: '4px',
    padding: '0.2rem 0.5rem',
    fontSize: '0.6rem',
    fontWeight: 700,
    color: '#00f0ff',
    letterSpacing: '0.04em',
  },
  sandboxCloseBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
  },
  sandboxToastContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  sandboxCodeDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.06)',
    margin: '0.5rem 0',
  },
  sandboxMailTitle: {
    fontSize: '0.8rem',
    fontWeight: 800,
    color: '#fff',
  },
  sandboxCodeBox: {
    background: 'rgba(0, 240, 255, 0.08)',
    border: '1px solid rgba(0, 240, 255, 0.2)',
    borderRadius: '6px',
    padding: '0.5rem',
    marginTop: '0.75rem',
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#00f0ff',
    letterSpacing: '0.15em',
  }
};
