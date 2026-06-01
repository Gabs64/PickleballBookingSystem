import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus, 
  LayoutDashboard, 
  TrendingUp, 
  Settings, 
  ClipboardList, 
  UserSquare2,
  Calendar,
  DollarSign,
  Briefcase
} from 'lucide-react';

export default function AdminPortal() {
  const { bookings, users, addUser, authenticateUser } = useBooking();

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('admin_logged_in') === 'true';
  });
  const [loggedAdmin, setLoggedAdmin] = useState(() => {
    const saved = sessionStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab State: 'dashboard' or 'accounts'
  const [activeTab, setActiveTab] = useState('dashboard');

  // New account form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Customer'); // Customer, Cashier, Admin
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // SMTP Settings States
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpSecure, setSmtpSecure] = useState('false');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpSenderName, setSmtpSenderName] = useState('NetRally Arena');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Hydrate settings
  React.useEffect(() => {
    const saved = localStorage.getItem('pickleball_smtp_config');
    if (saved) {
      const config = JSON.parse(saved);
      setSmtpHost(config.host || '');
      setSmtpPort(config.port || '587');
      setSmtpSecure(config.secure === true ? 'true' : 'false');
      setSmtpUser(config.auth?.user || '');
      setSmtpPass(config.auth?.pass || '');
      setSmtpSenderName(config.senderName || 'NetRally Arena');
    }
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettingsSuccess('');
    const config = {
      host: smtpHost,
      port: Number(smtpPort),
      secure: smtpSecure === 'true',
      senderName: smtpSenderName,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    };
    localStorage.setItem('pickleball_smtp_config', JSON.stringify(config));
    setSettingsSuccess('SMTP server configurations securely compiled and saved!');
  };

  const handleClearSettings = () => {
    localStorage.removeItem('pickleball_smtp_config');
    setSmtpHost('');
    setSmtpPort('587');
    setSmtpSecure('false');
    setSmtpUser('');
    setSmtpPass('');
    setSmtpSenderName('NetRally Arena');
    setSettingsSuccess('SMTP configurations successfully cleared! Reverted to sandbox fallback.');
  };

  // Login handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const res = authenticateUser(emailInput, passwordInput, 'Admin');
    if (res.success) {
      setIsLoggedIn(true);
      setLoggedAdmin(res.user);
      sessionStorage.setItem('admin_logged_in', 'true');
      sessionStorage.setItem('admin_user', JSON.stringify(res.user));
    } else {
      setLoginError(res.message);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedAdmin(null);
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('admin_user');
    setEmailInput('');
    setPasswordInput('');
  };

  // User creation handler
  const handleCreateAccount = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newName.trim() || !newEmail.trim() || !newPhone.trim() || !newPassword.trim()) {
      setFormError('Please fill out all fields.');
      return;
    }

    const userData = {
      name: newName,
      email: newEmail,
      phone: newPhone,
      password: newPassword,
      role: newRole
    };

    const res = addUser(userData);
    if (res.success) {
      setFormSuccess(`Successfully registered the new account for ${newName} as a ${newRole}!`);
      // Reset form
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
      setNewRole('Customer');
    } else {
      setFormError(res.message);
    }
  };

  // Gating check
  if (!isLoggedIn) {
    return (
      <div style={styles.loginLayout}>
        <div style={styles.glowBg1}></div>
        <div style={styles.glowBg2}></div>
        
        <div className="glass-card" style={styles.loginCard}>
          <div style={styles.loginHeader}>
            <div style={styles.logoBadge}>
              <span>ADMIN CONSOLE</span>
            </div>
            <h2 style={styles.loginTitle}>System Control Sign In</h2>
            <p style={styles.loginSubtitle}>Access is strictly restricted to authorized system administrators.</p>
          </div>

          {loginError && (
            <div style={styles.errorAlert}>
              <span>⚠️ {loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={styles.loginForm}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">Administrator Email</label>
              <input
                id="admin-email"
                type="email"
                className="form-control"
                placeholder="admin@netrally.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                style={{ background: 'rgba(9, 10, 15, 0.7)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="admin-password">Control Password</label>
              <input
                id="admin-password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                style={{ background: 'rgba(9, 10, 15, 0.7)' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={styles.loginBtn}>
              Gain Console Access
            </button>
          </form>
          
          <div style={styles.loginHelp}>
            <p>Warning: Unauthorized access attempts are monitored and recorded.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Calculations for KPIs ---
  const totalUsers = users.length;
  const cashierCount = users.filter(u => u.role === 'Cashier').length;
  const customerCount = users.filter(u => u.role === 'Customer').length;
  const adminCount = users.filter(u => u.role === 'Admin').length;

  const totalBookings = bookings.length;
  const paidBookings = bookings.filter(b => b.paymentStatus === 'Paid');
  const revenue = paidBookings.reduce((sum, b) => sum + (b.rates?.total || 0), 0);

  return (
    <div style={styles.adminLayout} className="animate-fade-in">
      
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBranding}>
          <div style={styles.brandBadge}>
            <ShieldCheck size={18} color="#c084fc" />
          </div>
          <div>
            <h3 style={styles.brandTitle}>Admin Console</h3>
            <span style={styles.brandRole}>CENTRAL COMMAND</span>
          </div>
        </div>

        <nav style={styles.navMenu}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{
              ...styles.navBtn,
              backgroundColor: activeTab === 'dashboard' ? 'rgba(192, 132, 252, 0.08)' : 'transparent',
              color: activeTab === 'dashboard' ? '#c084fc' : '#94a3b8',
              borderLeft: activeTab === 'dashboard' ? '3px solid #c084fc' : '3px solid transparent'
            }}
          >
            <LayoutDashboard size={18} />
            Overview Dashboard
          </button>

          <button 
            onClick={() => setActiveTab('accounts')}
            style={{
              ...styles.navBtn,
              backgroundColor: activeTab === 'accounts' ? 'rgba(192, 132, 252, 0.08)' : 'transparent',
              color: activeTab === 'accounts' ? '#c084fc' : '#94a3b8',
              borderLeft: activeTab === 'accounts' ? '3px solid #c084fc' : '3px solid transparent'
            }}
          >
            <Users size={18} />
            User Accounts ({totalUsers})
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            style={{
              ...styles.navBtn,
              backgroundColor: activeTab === 'settings' ? 'rgba(192, 132, 252, 0.08)' : 'transparent',
              color: activeTab === 'settings' ? '#c084fc' : '#94a3b8',
              borderLeft: activeTab === 'settings' ? '3px solid #c084fc' : '3px solid transparent'
            }}
          >
            <Settings size={18} />
            System Settings
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <button 
            onClick={handleLogout} 
            className="btn btn-sm btn-danger" 
            style={{ width: '100%', marginBottom: '1rem', fontSize: '0.75rem' }}
          >
            Command Log Out
          </button>
          <span style={styles.serverStatus}>⚡ Admin Control: Active</span>
          <span style={styles.serverIp}>HOST: Gabs64-Local-Server</span>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main style={styles.mainArea}>
        
        {/* Header */}
        <header style={styles.terminalHeader}>
          <div style={styles.headerLeft}>
            <span style={styles.terminalGreeting}>System Command: <strong>Central Node</strong></span>
            <span style={styles.terminalTime}>CONTROL SESSION: <strong style={{ color: '#fff' }}>ACTIVE</strong></span>
          </div>

          <div style={styles.headerRight}>
            <div style={{ ...styles.profileBadge, cursor: 'pointer' }} onClick={handleLogout} title="Sign Out">
              <UserSquare2 size={20} color="#c084fc" />
              <span style={styles.adminName}>{loggedAdmin?.name || 'System Admin'}</span>
              <span style={{ fontSize: '0.65rem', color: '#f87171', marginLeft: '6px', fontWeight: 600 }}>(Log out)</span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Router */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* KPI Cards Grid */}
            <div className="grid-4" style={{ width: '100%' }}>
              
              {/* Total Users */}
              <div className="glass-card" style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiTitle}>SYSTEM USERS</span>
                  <div style={{ ...styles.kpiIconWrapper, background: 'rgba(192, 132, 252, 0.08)', border: '1px solid rgba(192, 132, 252, 0.2)' }}>
                    <Users size={20} color="#c084fc" />
                  </div>
                </div>
                <h2 style={styles.kpiValue}>{totalUsers}</h2>
                <div style={styles.kpiSubText}>
                  <span>{cashierCount} Cashiers · {customerCount} Customers · {adminCount} Admins</span>
                </div>
              </div>

              {/* Total Bookings */}
              <div className="glass-card" style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiTitle}>TOTAL BOOKINGS</span>
                  <div style={{ ...styles.kpiIconWrapper, background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    <Calendar size={20} color="#00f0ff" />
                  </div>
                </div>
                <h2 style={styles.kpiValue}>{totalBookings}</h2>
                <div style={styles.kpiSubText}>
                  <span>{paidBookings.length} Paid reservations</span>
                </div>
              </div>

              {/* Revenue Card */}
              <div className="glass-card" style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiTitle}>TOTAL REVENUE</span>
                  <div style={{ ...styles.kpiIconWrapper, background: 'rgba(204, 255, 0, 0.08)', border: '1px solid rgba(204, 255, 0, 0.2)' }}>
                    <DollarSign size={20} color="#ccff00" />
                  </div>
                </div>
                <h2 style={styles.kpiValue}>₱{revenue.toLocaleString()}</h2>
                <div style={styles.kpiSubText}>
                  <span>GCash & Cards compiled</span>
                </div>
              </div>

              {/* Staff Operators */}
              <div className="glass-card" style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiTitle}>ACTIVE CASHIERS</span>
                  <div style={{ ...styles.kpiIconWrapper, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <Briefcase size={20} color="#10b981" />
                  </div>
                </div>
                <h2 style={styles.kpiValue}>{cashierCount}</h2>
                <div style={styles.kpiSubText}>
                  <span>Reception counters open</span>
                </div>
              </div>

            </div>

            {/* Quick Overview Section */}
            <div className="glass-card" style={styles.contentBlock}>
              <h3 style={styles.blockTitle}>System Overview & Server Diagnostics</h3>
              <p style={styles.blockDesc}>
                This system runs standard React context persistence mapped to `localStorage` sandbox tables. All actions executed in the cashier and admin console portals instantly synchronize on the active process.
              </p>
              
              <div style={styles.diagnosticsGrid}>
                <div style={styles.diagItem}>
                  <span style={styles.diagLabel}>Core Database Status</span>
                  <span style={{ ...styles.diagVal, color: '#10b981' }}>🟢 SECURELY MOUNTED</span>
                </div>
                <div style={styles.diagItem}>
                  <span style={styles.diagLabel}>Operator Table</span>
                  <span style={styles.diagVal}>{cashierCount} Cashier Accounts Registered</span>
                </div>
                <div style={styles.diagItem}>
                  <span style={styles.diagLabel}>Customer Table</span>
                  <span style={styles.diagVal}>{customerCount} Registered Customers</span>
                </div>
                <div style={styles.diagItem}>
                  <span style={styles.diagLabel}>Administrators Node</span>
                  <span style={styles.diagVal}>{adminCount} Superuser Admin Accounts</span>
                </div>
              </div>
            </div>
            
          </div>
        )}

        {activeTab === 'accounts' && (
          <div style={styles.accountsGrid}>
            
            {/* Left: Accounts List */}
            <div className="glass-card" style={styles.accountsListCard}>
              <h3 style={styles.blockTitle}>Registered System Accounts</h3>
              <p style={{ ...styles.blockDesc, marginBottom: '1.5rem' }}>
                Central database operators audit log. Displays registered accounts authorized for terminal or portal entries.
              </p>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Full Name</th>
                      <th style={styles.th}>Email Address</th>
                      <th style={styles.th}>Phone</th>
                      <th style={styles.th}>Account Role</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#fff' }}>{u.name}</td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>{u.phone}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.roleBadge,
                            backgroundColor: 
                              u.role === 'Admin' ? 'rgba(192, 132, 252, 0.1)' : 
                              u.role === 'Cashier' ? 'rgba(0, 240, 255, 0.1)' : 'rgba(204, 255, 0, 0.1)',
                            color:
                              u.role === 'Admin' ? '#c084fc' : 
                              u.role === 'Cashier' ? '#00f0ff' : '#ccff00',
                            border: 
                              u.role === 'Admin' ? '1px solid rgba(192, 132, 252, 0.2)' : 
                              u.role === 'Cashier' ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid rgba(204, 255, 0, 0.2)'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: u.verified ? '#10b981' : '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            <span style={{ ...styles.statusDot, background: u.verified ? '#10b981' : '#fbbf24' }}></span> 
                            {u.verified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Create Account Form */}
            <div className="glass-card" style={styles.formCard}>
              <div style={styles.formCardHeader}>
                <UserPlus size={22} color="#c084fc" />
                <h3 style={styles.blockTitle}>Register User Profile</h3>
              </div>
              <p style={{ ...styles.blockDesc, marginBottom: '1.5rem' }}>
                Provision customer, cashier receptionist, or administrator credentials instantly.
              </p>

              {formError && (
                <div style={{ ...styles.errorAlert, marginBottom: '1.25rem' }}>
                  <span>⚠️ {formError}</span>
                </div>
              )}

              {formSuccess && (
                <div style={styles.successAlert}>
                  <span>✅ {formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateAccount} style={styles.adminForm}>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-name">Full Profile Name</label>
                  <input
                    id="new-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Johnathan Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="new-email">User Email Address</label>
                  <input
                    id="new-email"
                    type="email"
                    className="form-control"
                    placeholder="e.g. john@domain.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="new-phone">Active Contact Number</label>
                  <input
                    id="new-phone"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 0917-xxx-xxxx"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="new-password">Secure Login Password</label>
                  <input
                    id="new-password"
                    type="password"
                    className="form-control"
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label" htmlFor="new-role">Assigned Platform Role</label>
                  <select
                    id="new-role"
                    className="form-control"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    style={{ background: 'rgba(9, 10, 15, 0.7)', color: '#fff', cursor: 'pointer' }}
                  >
                    <option value="Customer" style={{ background: '#0e111a', color: '#fff' }}>Customer (Standard Public Account)</option>
                    <option value="Cashier" style={{ background: '#0e111a', color: '#fff' }}>Cashier (Terminal Operator Account)</option>
                    <option value="Admin" style={{ background: '#0e111a', color: '#fff' }}>Admin (Full System Privilege)</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={styles.createBtn}>
                  <UserPlus size={16} />
                  Provision User Account
                </button>
              </form>
            </div>

          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="glass-card" style={{ ...styles.formCard, maxWidth: '580px', width: '100%' }}>
              <div style={styles.formCardHeader}>
                <Settings size={22} color="#c084fc" />
                <h3 style={styles.blockTitle}>SMTP Mail Server Settings</h3>
              </div>
              <p style={{ ...styles.blockDesc, marginBottom: '1.5rem' }}>
                Configure your corporate SMTP credentials to send real-time email verification codes directly to player inboxes.
              </p>

              {settingsSuccess && (
                <div style={styles.successAlert}>
                  <span>✅ {settingsSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} style={styles.adminForm}>
                <div className="form-group">
                  <label className="form-label" htmlFor="smtp-host">SMTP Relay Host</label>
                  <input
                    id="smtp-host"
                    type="text"
                    className="form-control"
                    placeholder="e.g. smtp.gmail.com or smtp.brevo.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="smtp-port">SMTP Port</label>
                    <input
                      id="smtp-port"
                      type="text"
                      className="form-control"
                      placeholder="e.g. 465 or 587"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="smtp-secure">Connection Security</label>
                    <select
                      id="smtp-secure"
                      className="form-control"
                      value={smtpSecure}
                      onChange={(e) => setSmtpSecure(e.target.value)}
                      style={{ background: 'rgba(9, 10, 15, 0.7)', color: '#fff', cursor: 'pointer', height: '38px' }}
                    >
                      <option value="false">STARTTLS / Port 587</option>
                      <option value="true">SSL / Port 465</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="smtp-sender">Sender Display Name</label>
                  <input
                    id="smtp-sender"
                    type="text"
                    className="form-control"
                    placeholder="NetRally Arena"
                    value={smtpSenderName}
                    onChange={(e) => setSmtpSenderName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="smtp-user">SMTP Username / Email</label>
                  <input
                    id="smtp-user"
                    type="email"
                    className="form-control"
                    placeholder="your-email@gmail.com"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label" htmlFor="smtp-pass">SMTP Password / App Password</label>
                  <input
                    id="smtp-pass"
                    type="password"
                    className="form-control"
                    placeholder="your app-specific password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={handleClearSettings} className="btn btn-secondary" style={{ flex: 1 }}>
                    Clear Settings
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ ...styles.createBtn, flex: 2 }}>
                    Save System Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}

const styles = {
  adminLayout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#07080c',
  },
  sidebar: {
    width: '240px',
    background: 'rgba(14, 17, 26, 0.85)',
    backdropFilter: 'blur(16px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
    flexShrink: 0,
    zIndex: 10,
  },
  sidebarBranding: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    marginBottom: '2.5rem',
  },
  brandBadge: {
    width: '32px',
    height: '32px',
    background: 'rgba(192, 132, 252, 0.08)',
    border: '1px solid rgba(192, 132, 252, 0.15)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '0.85rem',
    fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: '-0.02em',
    color: '#fff',
  },
  brandRole: {
    display: 'block',
    fontSize: '0.6rem',
    fontWeight: 700,
    color: '#c084fc',
    letterSpacing: '0.05em',
    marginTop: '1px',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    background: 'transparent',
    border: 'none',
    padding: '0.75rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    fontFamily: "'Outfit', sans-serif",
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    position: 'relative',
  },
  sidebarFooter: {
    marginTop: 'auto',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  serverStatus: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#c084fc',
  },
  serverIp: {
    fontSize: '0.65rem',
    color: '#64748b',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    padding: '1.5rem 2rem 3rem 2rem',
  },
  terminalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '1rem',
    marginBottom: '2rem',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  terminalGreeting: {
    fontSize: '0.85rem',
    color: '#cbd5e1',
  },
  terminalTime: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  profileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '0.35rem 0.85rem',
    borderRadius: '30px',
  },
  adminName: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#fff',
  },
  kpiCard: {
    background: 'rgba(15, 18, 30, 0.55)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  kpiTitle: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#cbd5e1',
    letterSpacing: '0.04em',
  },
  kpiIconWrapper: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: '2rem',
    fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
    color: '#fff',
    lineHeight: 1.1,
    marginBottom: '0.5rem',
  },
  kpiSubText: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  contentBlock: {
    background: 'rgba(15, 18, 30, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    padding: '2rem',
  },
  blockTitle: {
    fontSize: '1.2rem',
    fontWeight: 750,
    color: '#fff',
    marginBottom: '0.5rem',
  },
  blockDesc: {
    fontSize: '0.85rem',
    color: '#cbd5e1',
    lineHeight: 1.5,
  },
  diagnosticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginTop: '1.75rem',
  },
  diagItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    background: 'rgba(9, 10, 15, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '1rem',
    borderRadius: '8px',
  },
  diagLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  diagVal: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#fff',
  },
  accountsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: '1.5rem',
    alignItems: 'start',
  },
  accountsListCard: {
    background: 'rgba(15, 18, 30, 0.45)',
    padding: '1.75rem',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '0.85rem 1rem',
    fontSize: '0.8rem',
    color: '#cbd5e1',
  },
  roleBadge: {
    display: 'inline-flex',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#10b981',
  },
  formCard: {
    background: 'rgba(15, 18, 30, 0.6)',
    border: '1px solid rgba(192, 132, 252, 0.2)',
    boxShadow: '0 0 20px rgba(192, 132, 252, 0.05)',
    padding: '1.75rem',
  },
  formCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem',
  },
  adminForm: {
    display: 'flex',
    flexDirection: 'column',
  },
  createBtn: {
    width: '100%',
    background: '#c084fc',
    color: '#000',
    fontWeight: 750,
    border: 'none',
    boxShadow: '0 4px 12px rgba(192, 132, 252, 0.25)',
  },
  successAlert: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginBottom: '1.25rem',
    fontSize: '0.8rem',
    color: '#34d399',
  },
  errorAlert: {
    background: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.25)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginBottom: '1.5rem',
    fontSize: '0.8rem',
    color: '#f87171',
  },
  loginLayout: {
    minHeight: '100vh',
    width: '100vw',
    background: '#07080c',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  glowBg1: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    background: 'rgba(192, 132, 252, 0.03)',
    filter: 'blur(100px)',
    top: '15%',
    left: '20%',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  glowBg2: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    background: 'rgba(204, 255, 0, 0.02)',
    filter: 'blur(100px)',
    bottom: '15%',
    right: '20%',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  loginCard: {
    width: '100%',
    maxWidth: '400px',
    background: 'rgba(15, 18, 30, 0.65)',
    border: '1px solid rgba(192, 132, 252, 0.25)',
    borderRadius: '16px',
    padding: '2.5rem 2rem',
    boxShadow: '0 0 30px rgba(192, 132, 252, 0.1), var(--shadow-lg)',
    zIndex: 2,
  },
  loginHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(192, 132, 252, 0.05)',
    border: '1px solid rgba(192, 132, 252, 0.15)',
    borderRadius: '30px',
    padding: '0.35rem 0.85rem',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#c084fc',
    letterSpacing: '0.08em',
    marginBottom: '1rem',
  },
  loginTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.02em',
    marginBottom: '0.5rem',
  },
  loginSubtitle: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    lineHeight: 1.4,
  },
  loginBtn: {
    width: '100%',
    padding: '0.8rem',
    background: '#c084fc',
    color: '#000',
    fontWeight: 750,
    fontSize: '0.9rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(192, 132, 252, 0.25)',
    transition: 'all 0.2s',
  },
  loginHelp: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#475569',
  }
};
