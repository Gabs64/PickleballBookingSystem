import React from 'react';
import { Play, Calendar, Trophy, Zap, ShieldCheck } from 'lucide-react';

export default function HeroSection({ onStartBooking }) {
  return (
    <div style={styles.heroContainer} className="animate-fade-in">
      <div style={styles.content}>
        <div style={styles.badgeContainer}>
          <span style={styles.badgeText} className="animate-pulse-neon">
            <Zap size={12} fill="#ccff00" color="#ccff00" />
            PREMIER PICKLEBALL COURTS
          </span>
        </div>
        
        <h1 style={styles.headline} className="animate-gradient-text">
          NetRally
        </h1>
        <h2 style={styles.subHeadline}>
          BOOK YOUR COURT IN SECONDS
        </h2>
        <p style={styles.paragraph}>
          Reserve high-quality indoor cushion and outdoor acrylic pickleball courts with tournament LED lighting and complete equipment rental.
        </p>

        <div style={styles.btnRow}>
          <button onClick={onStartBooking} className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            <Calendar size={18} style={{ marginRight: '6px' }} />
            Book Court Now
          </button>
        </div>
      </div>

      <div style={styles.metricsGrid} className="grid-3">
        <div className="glass-card" style={styles.metricCard}>
          <div style={{ ...styles.iconBg, color: '#ccff00' }}>
            <Trophy size={20} />
          </div>
          <div>
            <h4 style={styles.metricTitle}>3 Pro Courts</h4>
            <p style={styles.metricDesc}>Indoor Cushion & Outdoor Surfaces</p>
          </div>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={{ ...styles.iconBg, color: '#00f0ff' }}>
            <Zap size={20} />
          </div>
          <div>
            <h4 style={styles.metricTitle}>₱450.00 / Hour</h4>
            <p style={styles.metricDesc}>Flat Rate, Instant Confirmation</p>
          </div>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={{ ...styles.iconBg, color: '#c084fc' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 style={styles.metricTitle}>Equipment Rental</h4>
            <p style={styles.metricDesc}>Paddles, Cans of Balls & Court Shoes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  heroContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '4.5rem 1.5rem 3rem 1.5rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  content: {
    marginBottom: '3rem',
  },
  badgeContainer: {
    display: 'inline-block',
    marginBottom: '1.25rem',
  },
  badgeText: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(204, 255, 0, 0.08)',
    color: '#ccff00',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    padding: '0.35rem 0.85rem',
    borderRadius: '30px',
    border: '1px solid rgba(204, 255, 0, 0.2)',
  },
  headline: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '3.75rem',
    fontWeight: 850,
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
    color: '#fff',
    marginBottom: '0.75rem',
  },
  subHeadline: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: '#94a3b8',
    marginBottom: '1.5rem',
  },
  paragraph: {
    fontSize: '1rem',
    color: '#94a3b8',
    maxWidth: '680px',
    margin: '0 auto 2rem auto',
    lineHeight: 1.6,
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  secondaryLink: {
    textDecoration: 'none',
  },
  metricsGrid: {
    width: '100%',
    marginTop: '1.5rem',
  },
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    textAlign: 'left',
    padding: '1.25rem',
    background: 'rgba(22, 27, 42, 0.4)',
  },
  iconBg: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  metricTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.15rem',
  },
  metricDesc: {
    fontSize: '0.75rem',
    color: '#64748b',
  }
};
