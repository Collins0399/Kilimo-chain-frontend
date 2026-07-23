import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Smartphone, RefreshCw, Send, X, Wifi, Battery, PhoneCall, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';

export default function SmsUssdSimulator() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('254712345678');
  const [sessionId, setSessionId] = useState('');
  const [serviceCode] = useState('*144#');
  
  // Dialing state
  const [dialInput, setDialInput] = useState('*144#');
  const [isDialed, setIsDialed] = useState(false);

  // USSD active session states
  const [ussdResponse, setUssdResponse] = useState('');
  const [ussdInputVal, setUssdInputVal] = useState('');
  const [cumulativeInput, setCumulativeInput] = useState([]);
  const [ussdHistory, setUssdHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const historyEndRef = useRef(null);

  useEffect(() => {
    generateNewSession();
  }, []);

  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ussdHistory]);

  const generateNewSession = () => {
    const randSession = 'session_' + Math.random().toString(36).substring(2, 12);
    setSessionId(randSession);
    resetUssdSession();
  };

  const resetUssdSession = () => {
    setIsDialed(false);
    setUssdResponse('');
    setUssdInputVal('');
    setCumulativeInput([]);
    setUssdHistory([]);
    setError('');
  };

  const handleDial = async () => {
    if (dialInput !== '*144#') {
      setError('Invalid USSD service code. Please dial *144# for Kilimo-Chain.');
      return;
    }

    setLoading(true);
    setError('');
    setIsDialed(true);
    setCumulativeInput([]);
    
    try {
      const resText = await api.ussd.sendRequest({
        sessionId,
        serviceCode,
        msisdn: phoneNumber,
        input: '', // initial request is empty input
      });

      setUssdResponse(resText);
      setUssdHistory([{ type: 'response', text: resText }]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'USSD Connection error');
      setIsDialed(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSendUssd = async (e) => {
    if (e) e.preventDefault();
    if (!ussdInputVal.trim()) return;

    setLoading(true);
    setError('');

    // Cumulative input splits with '*'
    const newCumulative = [...cumulativeInput, ussdInputVal.trim()];
    const inputParam = newCumulative.join('*');

    setUssdHistory(prev => [
      ...prev,
      { type: 'input', text: ussdInputVal.trim() }
    ]);

    try {
      const resText = await api.ussd.sendRequest({
        sessionId,
        serviceCode,
        msisdn: phoneNumber,
        input: inputParam,
      });

      setUssdResponse(resText);
      setUssdHistory(prev => [
        ...prev,
        { type: 'response', text: resText }
      ]);
      setCumulativeInput(newCumulative);
      setUssdInputVal('');

      // If the USSD response starts with END, session is finished
      if (resText.startsWith('END')) {
        // Wait a few seconds then close ussd overlay
        setTimeout(() => {
          resetUssdSession();
        }, 4000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'USSD execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (num) => {
    if (isDialed) return;
    if (num === 'clear') {
      setDialInput('');
    } else if (num === 'back') {
      setDialInput(prev => prev.slice(0, -1));
    } else {
      setDialInput(prev => prev + num);
    }
  };

  // Clean USSD Response string for clean rendering (removing CON or END tags)
  const cleanUssdText = (text) => {
    if (!text) return '';
    if (text.startsWith('CON ')) return text.substring(4);
    if (text.startsWith('END ')) return text.substring(4);
    return text;
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Background glowing blobs */}
      <div style={styles.glowGreen}></div>
      <div style={styles.glowGold}></div>

      {/* Top Navigation */}
      <header style={styles.pageHeader} className="glass-panel">
        <div style={styles.brand}>
          <span style={{ fontSize: '1.5rem' }}>🌾</span>
          <span style={{ fontFamily: 'var(--font-family-heading)', fontWeight: '800', fontSize: '1.25rem' }}>
            Kilimo-Chain USSD Gateway
          </span>
        </div>
        <Link to="/login" style={styles.backBtn} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Dashboard Login</span>
        </Link>
      </header>

      <div className="simulator-layout-grid">
        <div style={styles.infoPanel}>
          <h1 style={{ fontFamily: 'var(--font-family-heading)', marginBottom: '1rem', fontSize: '2rem' }}>
            Offline Gateway Simulator 📱
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            Kilimo-Chain includes an offline USSD service allowing smallholder farmers without internet access to list harvests and manage profiles.
          </p>

          <div className="glass-card green-accent" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--accent-green)' }}>Simulator Instructions</h3>
            <ol style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Enter a phone number (e.g. <code>254712345678</code>).</li>
              <li>Dial <code>*144#</code> on the keypad and click the green Dial button.</li>
              <li>Use the interactive screen input to:
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <li>Select <code>1</code> to Register the phone number as a farmer.</li>
                  <li>Select <code>2</code> to view Profile details.</li>
                  <li>Select <code>3</code> to Add Harvest crop listings to the marketplace.</li>
                  <li>Select <code>4</code> to list current Harvests.</li>
                </ul>
              </li>
              <li>Switch to the Admin dashboards to verify farmers and approve purchases!</li>
            </ol>
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Active Handset Phone Number</label>
            <input
              type="text"
              className="form-control"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isDialed}
            />
          </div>

          <div style={styles.sessionMeta}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Session ID: <code>{sessionId}</code>
            </div>
            <button onClick={generateNewSession} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
              <RefreshCw size={12} />
              <span>New Session</span>
            </button>
          </div>
        </div>

        <div style={styles.phoneSection}>
          <div className="phone-frame">
            <div className="phone-speaker">
              <div className="phone-camera"></div>
            </div>

            <div className="phone-screen">
              <div className="phone-status-bar">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Wifi size={12} />
                  <span>Safcom</span>
                </span>
                <span>12:30 PM</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <span>98%</span>
                  <Battery size={12} />
                </span>
              </div>

              <div style={styles.screenInner}>
                {!isDialed ? (
                  /* Dial Pad Mode */
                  <div style={styles.dialerContainer}>
                    <div style={styles.dialDisplay}>
                      {dialInput}
                      <span className="ussd-cursor">|</span>
                    </div>

                    {error && <div style={styles.dialError}>{error}</div>}

                    <div style={styles.keypad}>
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                        <button
                          key={k}
                          onClick={() => handleKeyPress(k)}
                          style={styles.keyBtn}
                        >
                          {k}
                        </button>
                      ))}
                      <button onClick={() => handleKeyPress('clear')} style={{ ...styles.keyBtn, fontSize: '0.8rem', color: 'var(--accent-red)' }}>CLR</button>
                      <button onClick={handleDial} style={{ ...styles.keyBtn, background: 'var(--accent-green)', color: '#fff', borderRadius: '50%' }}>
                        <PhoneCall size={18} />
                      </button>
                      <button onClick={() => handleKeyPress('back')} style={{ ...styles.keyBtn, fontSize: '0.8rem' }}>DEL</button>
                    </div>
                  </div>
                ) : (
                  /* USSD Active Session Overlay */
                  <div style={styles.ussdOverlay}>
                    <div style={styles.ussdTitle}>USSD Session (*144#)</div>
                    
                    <div style={styles.historyScroll}>
                      {ussdHistory.map((h, i) => (
                        <div key={i} style={h.type === 'input' ? styles.histInput : styles.histResponse}>
                          {h.type === 'input' ? `> ${h.text}` : cleanUssdText(h.text)}
                        </div>
                      ))}
                      <div ref={historyEndRef} />
                    </div>

                    {error && <div style={styles.ussdErr}>{error}</div>}

                    {ussdResponse && !ussdResponse.startsWith('END') && (
                      <form onSubmit={handleSendUssd} style={styles.inputArea}>
                        <input
                          type="text"
                          required
                          autoFocus
                          className="form-control"
                          style={styles.ussdTextfield}
                          placeholder="Type response..."
                          value={ussdInputVal}
                          onChange={(e) => setUssdInputVal(e.target.value)}
                          disabled={loading}
                        />
                        <button type="submit" disabled={loading} style={styles.sendBtn}>
                          <Send size={14} />
                        </button>
                      </form>
                    )}

                    <div style={styles.ussdActions}>
                      <button
                        type="button"
                        onClick={resetUssdSession}
                        style={styles.cancelBtn}
                      >
                        <X size={14} />
                        <span>{ussdResponse.startsWith('END') ? 'Close' : 'Cancel Session'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: 'var(--bg-primary)',
    position: 'relative',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '3rem',
  },
  glowGreen: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-green) 0%, transparent 70%)',
    top: '15%',
    left: '10%',
    opacity: 0.1,
    filter: 'blur(45px)',
    pointerEvents: 'none',
  },
  glowGold: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)',
    bottom: '15%',
    right: '10%',
    opacity: 0.08,
    filter: 'blur(55px)',
    pointerEvents: 'none',
  },
  pageHeader: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    margin: '1.5rem 0 2rem 0',
    borderRadius: 'var(--radius-md)',
    zIndex: 2,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  backBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
  },
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '3rem',
    alignItems: 'start',
    maxWidth: '1100px',
    width: '90%',
    margin: '0 auto',
    zIndex: 2,
  },
  infoPanel: {
    textAlign: 'left',
  },
  sessionMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--bg-secondary)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    marginTop: '1.5rem',
    border: '1px solid var(--border-color)',
  },
  phoneSection: {
    display: 'flex',
    justifyContent: 'center',
  },
  screenInner: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  dialerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
  },
  dialDisplay: {
    fontSize: '2.25rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textAlign: 'center',
    padding: '1.5rem 0',
    fontFamily: 'var(--font-family-heading)',
    minHeight: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid var(--border-color)',
  },
  dialError: {
    color: 'var(--accent-red)',
    fontSize: '0.8rem',
    textAlign: 'center',
    marginTop: '0.5rem',
  },
  keypad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    padding: '1rem',
    justifyItems: 'center',
    alignItems: 'center',
  },
  keyBtn: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '1.25rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-fast)',
  },
  ussdOverlay: {
    background: '#090a0f',
    border: '1.5px solid #222',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '1rem',
    color: '#00ff00',
    fontFamily: 'Courier New, monospace',
    boxShadow: 'inset 0 0 20px rgba(0, 255, 0, 0.05)',
  },
  ussdTitle: {
    fontSize: '0.8rem',
    color: '#00aa00',
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #111',
    marginBottom: '0.75rem',
  },
  historyScroll: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    paddingRight: '4px',
    marginBottom: '1rem',
  },
  histInput: {
    alignSelf: 'flex-end',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  histResponse: {
    alignSelf: 'flex-start',
    whiteSpace: 'pre-wrap',
    fontSize: '0.9rem',
    lineHeight: '1.4',
    textAlign: 'left',
  },
  ussdErr: {
    color: '#ff3333',
    fontSize: '0.8rem',
    marginBottom: '0.5rem',
    textAlign: 'left',
  },
  inputArea: {
    display: 'flex',
    gap: '0.5rem',
    borderTop: '1px solid #111',
    paddingTop: '0.75rem',
  },
  ussdTextfield: {
    background: '#000',
    border: '1px solid #333',
    color: '#00ff00',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    padding: '0.5rem',
  },
  sendBtn: {
    background: '#00ff00',
    color: '#000',
    border: 'none',
    width: '34px',
    height: '34px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  ussdActions: {
    marginTop: '0.75rem',
    display: 'flex',
    justifyContent: 'center',
  },
  cancelBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #333',
    color: '#888',
    padding: '0.4rem 1rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    cursor: 'pointer',
  },
};
export { styles };
