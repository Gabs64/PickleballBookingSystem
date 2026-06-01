import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { X, CalendarDays, Clock, User, Phone, CheckCircle, ShoppingBag, Receipt, Sparkles, CreditCard, HelpCircle } from 'lucide-react';
import Badge from '../components/Badge';

export default function BookingModal({ isOpen, onClose }) {
  const { courts, operatingHours, gearRates, checkAvailability, calculateRates, addBooking, getRelativeDateString } = useBooking();

  const [bookingState, setBookingState] = useState('form'); // 'form' or 'ticket'
  
  // Selection States
  const [courtId, setCourtId] = useState('court-1');
  const [bookingDate, setBookingDate] = useState(getRelativeDateString(0));
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [addons, setAddons] = useState({ paddles: 0, balls: false, shoes: 0 });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('GCash E-Wallet');

  const [errorMessage, setErrorMessage] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);

  // Sync / Reset on open
  useEffect(() => {
    if (isOpen) {
      setBookingState('form');
      setCourtId('court-1');
      setBookingDate(getRelativeDateString(0));
      setSelectedSlots([]);
      setAddons({ paddles: 0, balls: false, shoes: 0 });
      setErrorMessage('');
      setCreatedBooking(null);

      // PREFILL CUSTOMER INFO IF LOGGED IN
      const savedUser = sessionStorage.getItem('customer_user');
      if (savedUser) {
        const userObj = JSON.parse(savedUser);
        setCustomerName(userObj.name || '');
        setCustomerEmail(userObj.email || '');
        setCustomerPhone(userObj.phone || '');
      } else {
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
      }

      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Reset selected slots when court or date changes
  useEffect(() => {
    setSelectedSlots([]);
    setErrorMessage('');
  }, [courtId, bookingDate]);

  if (!isOpen) return null;

  const handleSlotToggle = (slot) => {
    setErrorMessage('');
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot].sort());
    }
  };

  const handlePayAndConfirm = (e) => {
    e.preventDefault();
    
    // Strict Guard: User must be signed in to complete a booking
    const savedUser = sessionStorage.getItem('customer_user');
    if (!savedUser) {
      setErrorMessage('Authentication required. Please sign up or sign in to complete your booking.');
      return;
    }

    if (selectedSlots.length === 0) {
      setErrorMessage('Please select at least one hour slot from the grid.');
      return;
    }
    if (!customerName || !customerPhone || !customerEmail) {
      setErrorMessage('Please fill out all required contact fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const payload = {
      customerName,
      customerEmail,
      customerPhone,
      courtId,
      date: bookingDate,
      slots: selectedSlots,
      addons,
      paymentMethod,
      paymentStatus: 'Paid',
      status: 'Paid',
      notes: ''
    };

    const result = addBooking(payload);
    if (result.success) {
      setCreatedBooking(result.booking);
      setBookingState('ticket');
    } else {
      setErrorMessage(result.message);
    }
  };

  const activeCourt = courts.find(c => c.id === courtId);
  const liveRates = activeCourt && selectedSlots.length > 0
    ? calculateRates(courtId, selectedSlots, addons)
    : null;

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div 
        className="glass-card animate-modal-pop" 
        style={bookingState === 'form' ? styles.popupFormContainer : styles.popupTicketContainer} 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>
              {bookingState === 'form' ? 'Instant Court Booking popup' : 'Booking Receipt Ticket'}
            </h3>
            <p style={styles.subtitle}>
              {bookingState === 'form' 
                ? 'Fill out dates, gear, contact details, and e-wallet checkout below.' 
                : 'Your payment was successfully processed. Show this digital pass at the entrance.'}
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn} className="btn btn-icon btn-secondary">
            <X size={16} />
          </button>
        </div>

        {errorMessage && (
          <div style={styles.errorAlert}>
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {bookingState === 'form' ? (
          // RENDER BOOKING FORM PANEL
          <form onSubmit={handlePayAndConfirm} style={styles.form}>
            <div style={styles.scrollContent}>
              
              <div style={styles.formRow2}>
                {/* Court picker Dropdown Dropbox */}
                <div className="form-group" style={{ flex: 1.2 }}>
                  <label className="form-label">CHOOSE A COURT (DROPBOX)</label>
                  <select
                    value={courtId}
                    onChange={(e) => setCourtId(e.target.value)}
                    className="form-control"
                    style={styles.selectDropbox}
                  >
                    {courts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type} - ₱450.00/hr)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Picker */}
                <div className="form-group" style={{ flex: 0.8 }}>
                  <label className="form-label">SELECT DATE</label>
                  <input
                    type="date"
                    min={getRelativeDateString(0)}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="form-control"
                    style={{ height: '38px' }}
                  />
                </div>
              </div>

              {/* Time Slots Grid */}
              <h4 style={styles.sectionHeader}><Clock size={13} /> Select Time Slots (6:00 AM - 10:00 PM)</h4>
              <div style={styles.slotsGrid}>
                {operatingHours.map(slot => {
                  const isSelected = selectedSlots.includes(slot);
                  const isReserved = !checkAvailability(courtId, bookingDate, [slot]).available;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isReserved}
                      onClick={() => handleSlotToggle(slot)}
                      style={{
                        ...styles.slotBtn,
                        ...(isSelected ? styles.slotSelected : {}),
                        ...(isReserved ? styles.slotReserved : {})
                      }}
                    >
                      <span style={styles.slotText}>{slot.split(' - ')[0]}</span>
                      <span style={styles.slotStatus}>
                        {isReserved ? 'Booked' : isSelected ? 'Select' : 'Free'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Gear Addons Inline Counter */}
              <h4 style={styles.sectionHeader}><ShoppingBag size={13} /> Equipment Rental Add-ons</h4>
              <div style={styles.gearRow}>
                {/* Paddles */}
                <div style={styles.gearInlineItem}>
                  <div>
                    <span style={styles.gearLabel}>Carbon Paddles</span>
                    <span style={styles.gearPrice}>₱50 / hour</span>
                  </div>
                  <div style={styles.gearControls}>
                    <button type="button" onClick={() => setAddons({ ...addons, paddles: Math.max(0, addons.paddles - 1) })} style={styles.qtyBtn} className="btn btn-secondary">-</button>
                    <span style={styles.qtyVal}>{addons.paddles}</span>
                    <button type="button" onClick={() => setAddons({ ...addons, paddles: Math.min(6, addons.paddles + 1) })} style={styles.qtyBtn} className="btn btn-secondary">+</button>
                  </div>
                </div>

                {/* Shoes */}
                <div style={styles.gearInlineItem}>
                  <div>
                    <span style={styles.gearLabel}>Court Shoes</span>
                    <span style={styles.gearPrice}>₱100 flat fee</span>
                  </div>
                  <div style={styles.gearControls}>
                    <button type="button" onClick={() => setAddons({ ...addons, shoes: Math.max(0, addons.shoes - 1) })} style={styles.qtyBtn} className="btn btn-secondary">-</button>
                    <span style={styles.qtyVal}>{addons.shoes}</span>
                    <button type="button" onClick={() => setAddons({ ...addons, shoes: Math.min(6, addons.shoes + 1) })} style={styles.qtyBtn} className="btn btn-secondary">+</button>
                  </div>
                </div>

                {/* Balls Toggle */}
                <div style={styles.gearInlineItem}>
                  <div>
                    <span style={styles.gearLabel}>Can of 3 Balls</span>
                    <span style={styles.gearPrice}>₱150 flat fee</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setAddons({ ...addons, balls: !addons.balls })}
                    style={{
                      ...styles.ballToggle,
                      backgroundColor: addons.balls ? 'var(--accent-neon)' : 'transparent',
                      color: addons.balls ? 'var(--text-inverse)' : '#fff',
                      borderColor: addons.balls ? 'var(--accent-neon)' : 'var(--border-medium)'
                    }}
                    className="btn"
                  >
                    {addons.balls ? 'Added' : 'Add'}
                  </button>
                </div>
              </div>

              {/* Contact Information Form */}
              <h4 style={styles.sectionHeader}><User size={13} /> Customer Contact Details</h4>
              
              {/* Logged in info banner */}
              {sessionStorage.getItem('customer_user') ? (
                <div style={styles.authBanner}>
                  <CheckCircle size={14} color="var(--accent-neon)" style={{ marginRight: '6px' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Authenticated Profile: <strong style={{ color: '#fff' }}>{JSON.parse(sessionStorage.getItem('customer_user')).name}</strong> (Verified ✅)
                  </span>
                </div>
              ) : (
                <div style={styles.authBannerPrompt}>
                  <HelpCircle size={14} color="#00f0ff" style={{ marginRight: '6px' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>
                    Want faster booking? Sign up/Login on the landing page to auto-fill your contact details.
                  </span>
                </div>
              )}

              <div style={styles.formRow3}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Full Name <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="Jane Smith"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Email Address <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Phone Number <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="tel"
                    placeholder="0917-000-0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
              </div>



              {/* Payment System Section */}
              <h4 style={styles.sectionHeader}><CreditCard size={13} /> Payment Checkout system</h4>
              <div style={styles.formRow2}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">PAYMENT CHANNEL</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-control"
                    style={styles.selectDropbox}
                  >
                    <option value="GCash E-Wallet">GCash Online Payment (Sandbox)</option>
                    <option value="Maya Wallet">Maya E-Wallet (Sandbox)</option>
                    <option value="Credit Card">Credit / Debit Card (Simulated)</option>
                  </select>
                </div>

                <div style={styles.runningTotalBox}>
                  <span style={styles.runningTotalLabel}>TOTAL AMOUNT DUE:</span>
                  <span style={styles.runningTotalVal}>
                    ₱{liveRates ? liveRates.total.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>

            </div>

            {/* Submit Action Bar */}
            <div style={styles.footerBar}>
              <div style={styles.priceBreakdownInline}>
                {liveRates && (
                  <span style={styles.subtextBreakdown}>
                    Base: ₱{liveRates.basePrice} | Addons: ₱{liveRates.addonsCost}
                  </span>
                )}
              </div>
              <div style={styles.btnRow}>
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={styles.payBtn}>
                  Confirm & Pay ₱{liveRates ? liveRates.total.toFixed(2) : '0.00'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          // RENDER SUCCESS RECEIPT DIGITAL TICKET
          <div style={styles.ticketOuter} className="animate-fade-in">
            <div style={styles.passContainer}>
              <div style={styles.passHeader}>
                <div>
                  <h4 style={styles.passBrand}>{"<brand name>"}</h4>
                  <p style={styles.passSub}>Pickleball Court Reservation Pass</p>
                </div>
                <div>
                  <Badge status="Paid" />
                </div>
              </div>

              <div style={styles.passDivider}>
                <div style={styles.circleLeft}></div>
                <div style={styles.circleRight}></div>
              </div>

              <div style={styles.passContent}>
                <div style={styles.passRow}>
                  <div>
                    <span style={styles.passLabel}>COURT NAME</span>
                    <span style={styles.passValue}>{activeCourt?.name}</span>
                    <span style={styles.passSubvalue}>{activeCourt?.type}</span>
                  </div>
                </div>

                <div style={styles.passGrid2}>
                  <div>
                    <span style={styles.passLabel}>DATE</span>
                    <span style={styles.passValue}>{createdBooking.date}</span>
                  </div>
                  <div>
                    <span style={styles.passLabel}>RESERVATION CODE</span>
                    <span style={{ ...styles.passValue, color: '#ccff00', fontFamily: 'monospace' }}>
                      {createdBooking.id}
                    </span>
                  </div>
                </div>

                <div style={styles.passRow}>
                  <div>
                    <span style={styles.passLabel}>RESERVED SLOTS</span>
                    <span style={{ ...styles.passValue, fontSize: '0.85rem' }}>
                      {createdBooking.slots.join(', ')}
                    </span>
                  </div>
                </div>

                <div style={styles.passGrid2}>
                  <div>
                    <span style={styles.passLabel}>CUSTOMER NAME</span>
                    <span style={styles.passValue}>{createdBooking.customerName}</span>
                  </div>
                  <div>
                    <span style={styles.passLabel}>PAYMENT</span>
                    <span style={styles.passValue}>{createdBooking.paymentMethod} (Paid)</span>
                  </div>
                </div>
              </div>

              <div style={styles.passDivider}>
                <div style={styles.circleLeft}></div>
                <div style={styles.circleRight}></div>
              </div>

              <div style={styles.passReceiptSection}>
                <h5 style={styles.receiptHeader}><Receipt size={12} /> Charges Breakdown</h5>
                <div style={styles.receiptLine}>
                  <span>Court Base Fee (₱450/hr)</span>
                  <span>₱{createdBooking.rates.basePrice.toFixed(2)}</span>
                </div>
                {createdBooking.rates.addonsCost > 0 && (
                  <div style={styles.receiptLine}>
                    <span>Gear Rentals Addon</span>
                    <span>+₱{createdBooking.rates.addonsCost.toFixed(2)}</span>
                  </div>
                )}

                <div style={styles.receiptTotalLine}>
                  <span>Total Amount Paid</span>
                  <span style={{ color: '#ccff00', fontSize: '1.05rem' }}>
                    ₱{createdBooking.rates.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={styles.passFooter}>
                <div style={styles.barcodeVisual}>
                  <div style={{ height: '30px', background: '#fff', width: '100%', opacity: 0.85, display: 'flex', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                      {[4,2,3,1,5,2,4,1,3,2,6,1,4,2,3,1,4,2,5,1,3,2,4,1,2].map((w, idx) => (
                        <div 
                          key={idx} 
                          style={{
                            width: `${w * 4}%`,
                            background: idx % 2 === 0 ? '#000' : 'transparent',
                            height: '100%'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <span style={styles.barcodeText}>{createdBooking.id}</span>
                </div>
              </div>
            </div>

            <div style={styles.actionRow}>
              <button 
                onClick={onClose} 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.75rem' }}
              >
                Close Pass
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 6, 10, 0.8)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1.5rem',
  },
  popupFormContainer: {
    width: '100%',
    maxWidth: '750px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '92vh',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
    background: 'rgba(15, 18, 30, 0.95)',
  },
  popupTicketContainer: {
    width: '100%',
    maxWidth: '460px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '92vh',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
    background: 'rgba(15, 18, 30, 0.95)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '0.75rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.15rem',
  },
  closeBtn: {
    padding: '0.35rem',
  },
  errorAlert: {
    padding: '0.6rem 1rem',
    background: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    color: '#fb7171',
    fontSize: '0.8rem',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  form: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  scrollContent: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '6px',
    marginBottom: '1.25rem',
  },
  selectDropbox: {
    background: 'rgba(9, 10, 15, 0.7)',
    height: '38px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  formRow2: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  formRow3: {
    display: 'flex',
    gap: '0.5rem',
  },
  sectionHeader: {
    fontSize: '0.8rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'var(--accent-neon)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '0.25rem',
    marginBottom: '0.75rem',
    marginTop: '1.25rem',
    letterSpacing: '0.04em',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '0.35rem',
    marginBottom: '0.75rem',
  },
  slotBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.35rem 0',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.05)',
    color: '#94a3b8',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  slotSelected: {
    background: 'rgba(204, 255, 0, 0.1)',
    borderColor: 'var(--accent-neon)',
    color: '#ccff00',
  },
  slotReserved: {
    background: 'rgba(244, 63, 94, 0.04)',
    borderColor: 'rgba(244, 63, 94, 0.15)',
    color: '#64748b',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  slotText: {
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  slotStatus: {
    fontSize: '0.5rem',
    opacity: 0.7,
  },
  gearRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  gearInlineItem: {
    flex: 1,
    minWidth: '200px',
    background: 'rgba(9,10,15,0.3)',
    border: '1px solid rgba(255,255,255,0.04)',
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gearLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#fff',
  },
  gearPrice: {
    display: 'block',
    fontSize: '0.65rem',
    color: 'var(--accent-neon)',
    fontWeight: 600,
    marginTop: '1px',
  },
  gearControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  qtyBtn: {
    width: '26px',
    height: '26px',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
  qtyVal: {
    fontSize: '0.9rem',
    fontWeight: 700,
    minWidth: '15px',
    textAlign: 'center',
  },
  ballToggle: {
    fontSize: '0.7rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
  },
  runningTotalBox: {
    flex: 1,
    background: 'rgba(204, 255, 0, 0.05)',
    border: '1px solid rgba(204, 255, 0, 0.15)',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '38px',
  },
  runningTotalLabel: {
    fontSize: '0.65rem',
    fontWeight: 750,
    color: '#fff',
    letterSpacing: '0.04em',
  },
  runningTotalVal: {
    fontSize: '1.15rem',
    fontWeight: 800,
    color: 'var(--accent-neon)',
  },
  footerBar: {
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  priceBreakdownInline: {
    fontSize: '0.7rem',
    color: '#cbd5e1',
  },
  subtextBreakdown: {
    opacity: 0.8,
  },
  btnRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  payBtn: {
    padding: '0.65rem 1.25rem',
  },
  // Visual ticket container
  ticketOuter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  passContainer: {
    background: '#131929',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    width: '100%',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
    marginBottom: '1.25rem',
  },
  passHeader: {
    background: 'linear-gradient(90deg, #161c2e 0%, #1e263d 100%)',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passBrand: {
    fontSize: '1rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },
  passSub: {
    fontSize: '0.65rem',
    color: '#64748b',
    fontWeight: 500,
  },
  passDivider: {
    height: '1px',
    borderTop: '2px dashed rgba(255, 255, 255, 0.1)',
    position: 'relative',
    margin: '0 0.5rem',
  },
  circleLeft: {
    width: '16px',
    height: '16px',
    background: '#0c0d12', // Matches backdrop glass background
    borderRadius: '50%',
    position: 'absolute',
    left: '-14px',
    top: '-8px',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  circleRight: {
    width: '16px',
    height: '16px',
    background: '#0c0d12',
    borderRadius: '50%',
    position: 'absolute',
    right: '-14px',
    top: '-8px',
    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
  },
  passContent: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  passRow: {
    display: 'flex',
  },
  passGrid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  passLabel: {
    display: 'block',
    fontSize: '0.6rem',
    fontWeight: 600,
    color: '#64748b',
    letterSpacing: '0.05em',
    marginBottom: '0.15rem',
  },
  passValue: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#f8fafc',
  },
  passSubvalue: {
    display: 'block',
    fontSize: '0.7rem',
    color: '#ccff00',
    fontWeight: 500,
  },
  passReceiptSection: {
    background: 'rgba(9, 10, 15, 0.3)',
    padding: '1.25rem 1.5rem',
  },
  receiptHeader: {
    fontSize: '0.8rem',
    fontWeight: 700,
    marginBottom: '0.65rem',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  receiptLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginBottom: '0.35rem',
  },
  receiptTotalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '0.65rem',
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#fff',
  },
  passFooter: {
    padding: '1.25rem 1.5rem',
    background: '#101422',
    display: 'flex',
    justifyContent: 'center',
  },
  barcodeVisual: {
    width: '65%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.3rem',
  },
  barcodeText: {
    fontSize: '0.65rem',
    fontFamily: 'monospace',
    letterSpacing: '0.2em',
    color: '#64748b',
  },
  actionRow: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
  },
  authBanner: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(204, 255, 0, 0.04)',
    border: '1px solid rgba(204, 255, 0, 0.15)',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    color: '#ccff00',
  },
  authBannerPrompt: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
  }
};
