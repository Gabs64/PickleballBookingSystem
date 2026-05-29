import React from 'react';
import { useBooking } from '../context/BookingContext';
import { TrendingUp, Percent, MapPin, Users, Award, ShoppingBag, ShieldCheck, DollarSign } from 'lucide-react';

export default function AnalyticsPanel() {
  const { bookings, courts, getRelativeDateString } = useBooking();

  const todayStr = getRelativeDateString(0);

  // Filter paid/completed bookings for today
  const todayPaidBookings = bookings.filter(
    (b) => b.date === todayStr && b.status !== 'Cancelled' && b.paymentStatus === 'Paid'
  );

  // Filter overall bookings for today
  const todayTotalBookings = bookings.filter(
    (b) => b.date === todayStr && b.status !== 'Cancelled'
  );

  // 1. Calculate Gross Revenue today
  const todayRevenue = todayPaidBookings.reduce((sum, b) => sum + b.rates.total, 0);

  // 2. Calculate Occupancy Rate today
  // Operating capacity: 4 courts * 16 operating hours = 64 total court-hours per day
  const totalBookedHoursToday = todayTotalBookings.reduce((sum, b) => sum + b.slots.length, 0);
  const occupancyPercentage = Math.min(100, Math.round((totalBookedHoursToday / 64) * 100));

  // 3. Top court of the day (highest earnings today)
  const courtRevenueMap = {};
  courts.forEach(c => { courtRevenueMap[c.id] = 0; });
  todayPaidBookings.forEach(b => {
    courtRevenueMap[b.courtId] = (courtRevenueMap[b.courtId] || 0) + b.rates.total;
  });

  let topCourtId = 'court-1';
  let maxRevenue = -1;
  Object.keys(courtRevenueMap).forEach(id => {
    if (courtRevenueMap[id] > maxRevenue) {
      maxRevenue = courtRevenueMap[id];
      topCourtId = id;
    }
  });
  const topCourtName = courts.find(c => c.id === topCourtId)?.name || 'Court 1';

  // 4. Active players checked-in today
  const activePlayersCount = bookings.filter(
    (b) => b.date === todayStr && b.status === 'Checked-In'
  ).length;

  // 5. Gear rentals summary
  let rentedPaddles = 0;
  let rentedShoes = 0;
  let rentedBalls = 0;
  todayTotalBookings.forEach(b => {
    rentedPaddles += b.addons.paddles;
    rentedShoes += b.addons.shoes;
    if (b.addons.balls) rentedBalls += 1;
  });

  // 6. Payment methods chart calculation
  const paymentMethods = { Cash: 0, GCash: 0, 'Credit Card': 0, EWallet: 0 };
  todayPaidBookings.forEach(b => {
    const method = b.paymentMethod.includes('GCash') ? 'GCash' : b.paymentMethod;
    paymentMethods[method] = (paymentMethods[method] || 0) + b.rates.total;
  });
  const totalPaymentSum = Object.values(paymentMethods).reduce((a, b) => a + b, 0) || 1;

  // 7. Court occupancy count calculation for graph
  const courtOccupancyHours = {};
  courts.forEach(c => { courtOccupancyHours[c.id] = 0; });
  todayTotalBookings.forEach(b => {
    courtOccupancyHours[b.courtId] = (courtOccupancyHours[b.courtId] || 0) + b.slots.length;
  });

  return (
    <div style={styles.container} className="animate-fade-in">
      <h3 style={styles.sectionTitle}>Business Metrics & Performance</h3>
      <p style={styles.sectionSubtitle}>Simulated administrative insights for court occupancy, financial yield, and utility rates.</p>

      {/* Analytics Metric Cards Grid */}
      <div className="grid-4" style={styles.metricsGrid}>
        
        <div className="glass-card" style={styles.metricCard}>
          <div style={{ ...styles.iconBg, color: '#10b981' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <span style={styles.metricLabel}>TODAY'S SALES</span>
            <h3 style={styles.metricValue}>₱{todayRevenue.toFixed(2)}</h3>
            <span style={styles.metricTrends} className="badge badge-paid">
              <TrendingUp size={10} /> +12.4% vs Yesterday
            </span>
          </div>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={{ ...styles.iconBg, color: 'var(--accent-neon)' }}>
            <Percent size={20} />
          </div>
          <div>
            <span style={styles.metricLabel}>COURT OCCUPANCY</span>
            <h3 style={styles.metricValue}>{occupancyPercentage}%</h3>
            <span style={styles.metricTrendsSub}>{totalBookedHoursToday} / 64 Hours Booked</span>
          </div>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={{ ...styles.iconBg, color: '#00f0ff' }}>
            <Users size={20} />
          </div>
          <div>
            <span style={styles.metricLabel}>ACTIVE MATCHES</span>
            <h3 style={styles.metricValue}>{activePlayersCount} Playing</h3>
            <span style={styles.metricTrendsSub}>Players Checked-In Now</span>
          </div>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={{ ...styles.iconBg, color: '#c084fc' }}>
            <Award size={20} />
          </div>
          <div>
            <span style={styles.metricLabel}>TOP YIELD ARENA</span>
            <h3 style={{ ...styles.metricValue, fontSize: '1.05rem', marginTop: '0.2rem', marginBottom: '0.2rem' }}>
              {topCourtName.replace('Championship ', '').replace('Grandstand ', '')}
            </h3>
            <span style={styles.metricTrendsSub}>Earned ₱{courtRevenueMap[topCourtId]?.toFixed(0) || 0} Today</span>
          </div>
        </div>

      </div>

      {/* Visual Custom CSS Charts */}
      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        
        {/* Court Occupancy breakdown Bar Chart */}
        <div className="glass-card" style={styles.chartCard}>
          <h4 style={styles.chartTitle}>Occupancy hours by Court</h4>
          <p style={styles.chartSub}>Total reservation duration per court in hours today (Max 16 hrs)</p>

          <div style={styles.barChartContainer}>
            {courts.map(c => {
              const hrs = courtOccupancyHours[c.id] || 0;
              const percent = Math.min(100, Math.round((hrs / 16) * 100));
              return (
                <div key={c.id} style={styles.chartBarLine}>
                  <div style={styles.barLabelWrapper}>
                    <span style={styles.barLabel}>{c.name.replace('Championship ', '').replace('Grandstand ', '')}</span>
                    <span style={styles.barVal}>{hrs} hrs ({percent}%)</span>
                  </div>
                  <div style={styles.barTrack}>
                    <div 
                      style={{ 
                        ...styles.barFill, 
                        width: `${percent}%`, 
                        background: `linear-gradient(90deg, ${c.color}aa 0%, ${c.color} 100%)`,
                        boxShadow: `0 0 10px ${c.color}33`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Channels Sales Share Bar Chart */}
        <div className="glass-card" style={styles.chartCard}>
          <h4 style={styles.chartTitle}>Revenue by Payment Channels</h4>
          <p style={styles.chartSub}>Total currency processed across modern transaction channels today</p>

          <div style={styles.barChartContainer}>
            {Object.keys(paymentMethods).map(channel => {
              const amount = paymentMethods[channel] || 0;
              const percent = Math.round((amount / totalPaymentSum) * 100);
              
              let barColor = '#34d399';
              if (channel === 'GCash') barColor = '#60a5fa';
              if (channel === 'Credit Card') barColor = '#a78bfa';
              if (channel === 'Cash') barColor = '#fbbf24';

              return (
                <div key={channel} style={styles.chartBarLine}>
                  <div style={styles.barLabelWrapper}>
                    <span style={styles.barLabel}>{channel}</span>
                    <span style={styles.barVal}>₱{amount.toFixed(2)} ({percent}%)</span>
                  </div>
                  <div style={styles.barTrack}>
                    <div 
                      style={{ 
                        ...styles.barFill, 
                        width: `${percent}%`, 
                        background: `linear-gradient(90deg, ${barColor}99 0%, ${barColor} 100%)`,
                        boxShadow: `0 0 10px ${barColor}22`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Equipment Rental Subpanel */}
      <div className="glass-card" style={styles.gearSummaryCard}>
        <div style={styles.gearHeader}>
          <ShoppingBag size={18} color="var(--accent-neon)" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Today's Equipment Rental Ledger</h4>
        </div>
        <div style={styles.gearMetricsRow}>
          <div style={styles.gearMetricItem}>
            <span style={styles.gearLabel}>PADDLES RENTED</span>
            <strong style={styles.gearValue}>{rentedPaddles} Pairs</strong>
            <span style={styles.gearYield}>Yield: ₱{(rentedPaddles * 50 * 2).toFixed(2)}</span>
          </div>
          <div style={styles.gearMetricItem}>
            <span style={styles.gearLabel}>COURT SHOES RENTED</span>
            <strong style={styles.gearValue}>{rentedShoes} Pairs</strong>
            <span style={styles.gearYield}>Yield: ₱{(rentedShoes * 100).toFixed(2)}</span>
          </div>
          <div style={{ ...styles.gearMetricItem, borderRight: 'none' }}>
            <span style={styles.gearLabel}>BALL CANS DISTRIBUTED</span>
            <strong style={styles.gearValue}>{rentedBalls} Cans</strong>
            <span style={styles.gearYield}>Yield: ₱{(rentedBalls * 150).toFixed(2)}</span>
          </div>
        </div>
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: '1.25rem 0',
  },
  sectionTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
  },
  sectionSubtitle: {
    fontSize: '0.75rem',
    color: '#cbd5e1',
    marginTop: '0.15rem',
  },
  metricsGrid: {
    marginTop: '1.5rem',
  },
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    background: 'rgba(22, 27, 42, 0.45)',
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
    border: '1px solid rgba(255,255,255,0.05)',
  },
  metricLabel: {
    display: 'block',
    fontSize: '0.55rem',
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.04em',
  },
  metricValue: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.1,
    marginTop: '0.1rem',
    marginBottom: '0.2rem',
  },
  metricTrends: {
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.1rem 0.4rem',
    boxShadow: 'none',
  },
  metricTrendsSub: {
    fontSize: '0.65rem',
    color: '#64748b',
  },
  chartCard: {
    padding: '1.5rem',
    background: 'rgba(22, 27, 42, 0.35)',
  },
  chartTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#fff',
  },
  chartSub: {
    fontSize: '0.7rem',
    color: '#64748b',
    marginBottom: '1.5rem',
  },
  barChartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.15rem',
  },
  chartBarLine: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  barLabelWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
  },
  barLabel: {
    color: '#cbd5e1',
    fontWeight: 500,
  },
  barVal: {
    fontWeight: 700,
    color: '#fff',
  },
  barTrack: {
    width: '100%',
    height: '8px',
    background: 'rgba(9, 10, 15, 0.6)',
    borderRadius: '4px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.02)',
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  gearSummaryCard: {
    marginTop: '1.5rem',
    padding: '1.25rem 1.5rem',
    background: 'rgba(22, 27, 42, 0.45)',
  },
  gearHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '0.5rem',
    marginBottom: '1rem',
  },
  gearMetricsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  gearMetricItem: {
    flex: 1,
    minWidth: '150px',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    paddingRight: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  gearLabel: {
    fontSize: '0.55rem',
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.04em',
    marginBottom: '0.2rem',
  },
  gearValue: {
    fontSize: '1.05rem',
    fontWeight: 800,
    color: '#fff',
  },
  gearYield: {
    fontSize: '0.65rem',
    color: 'var(--accent-neon)',
    fontWeight: 600,
    marginTop: '0.15rem',
  }
};
