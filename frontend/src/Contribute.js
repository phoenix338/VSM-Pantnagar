import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import contributeGif from './assets/contribute.gif';
import './Contribute.css';
const Contribute = () => {
    const [activeTab, setActiveTab] = React.useState('volunteer');
    const [initiatives, setInitiatives] = React.useState([]);
    const [selectedEvent, setSelectedEvent] = React.useState('');

    React.useEffect(() => {
        if (activeTab === 'donate') {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
            fetch(`${API_URL}/initiatives`)
                .then(res => res.json())
                .then(data => setInitiatives(data))
                .catch(() => setInitiatives([]));
        }
    }, [activeTab]);

    return (
        <>
            <div className="contribute-root">
                <Navbar />
                <div className="contribute-hero-section">
                    <img src={contributeGif} alt="contribute" className="contribute-gif" />
                </div>
                <div className="contribute-heading-section">
                    <h1 className="contribute-heading">Your Contributions Can Make A Difference</h1>
                </div>
                <div className="contribute-tabs-section">
                    <div className="contribute-light-banner" style={{ background: '#D9D9D9', borderTopLeftRadius: 8, borderTopRightRadius: 8, border: '1px solid #bbb', borderBottom: 'none', textAlign: 'center', padding: '18px 0 8px 0' }}>
                        <span style={{ fontFamily: 'Alex Brush, cursive', fontSize: '2rem', color: 'black', fontWeight: 400 }}>Be the Light</span>
                    </div>
                    <div className="contribute-tabs">
                        <button
                            className={`contribute-tab${activeTab === 'volunteer' ? ' active' : ''}`}
                            onClick={() => setActiveTab('volunteer')}
                        >
                            Volunteer
                        </button>
                        <button
                            className={`contribute-tab${activeTab === 'donate' ? ' active' : ''}`}
                            onClick={() => setActiveTab('donate')}
                        >
                            Donate
                        </button>
                    </div>
                    <div className="contribute-tab-content">
                        {activeTab === 'volunteer' && (
                            <div className="volunteer-content">
                                <h2>Become a Volunteer</h2>
                                <p>If you’re from outside Pantnagar, and interested in joining us, you can register for our Campus Ambassador Program!  Please reach out to <b>[Name/Contact Person]</b> and register today.</p>
                            </div>
                        )}
                        {activeTab === 'donate' && (
                            <div className="donate-content">
                                <h2>Monetary Contributions</h2>
                                <p>Your generous contributions to Vivekananda Swadhyay Mandal will help us bring our events to life and spread the spirit of service. <b>These contributions are eligible for exemption under Section 80G.</b></p>
                                <div className="donate-event-dropdown">
                                    <label htmlFor="event-select" style={{ fontFamily: 'open sans', fontWeight: '500' }}><b>Select Event:</b></label>
                                    <select
                                        id="event-select"
                                        value={selectedEvent}
                                        onChange={e => setSelectedEvent(e.target.value)}
                                        style={{ marginLeft: 8, padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem' }}
                                    >
                                        <option value="">-- Choose an event --</option>
                                        {initiatives.map(event => (
                                            <option key={event._id} value={event.title}>{event.title}</option>
                                        ))}
                                    </select>
                                </div>
                                {selectedEvent && (
                                    <>
                                        <div className="donate-selected-event" style={{ paddingLeft: '10px', margin: '16px 0', fontWeight: 500, color: '#DD783C', fontFamily: 'open sans', fontWeight: '500' }}>
                                            You are contributing for: <span>{selectedEvent}</span>
                                        </div>
                                        <ul className="donate-details">
                                            <li><b>Account Name:</b> Vivekanand Swadhyay Mandal Samiti</li>
                                            <li><b>Account Number:</b> 024001000874</li>
                                            <li><b>Bank:</b> ICICI, Haldwani</li>
                                            <li><b>IFSC Code:</b> ICIC0000240 (5th character is zero)</li>
                                        </ul>
                                        <div className="qr-section">
                                            <h3>QR Code for Donations</h3>
                                            <img src={require('./assets/qrcode.jpg')} alt="QR Code" />
                                        </div>
                                        <p style={{
                                            marginTop: 16,
                                            textAlign: 'center',
                                            color: 'black',       
                                            fontSize: '1.5rem',
                                            paddingLeft: 10,
                                            fontFamily: 'Times New Roman',
                                            fontWeight:'400',
                                            fontStyle: 'italic'
                                        }}>It is not amount, it is Shraddha that matters.</p>
                            </>
                        )}
                    </div>
                        )}
                </div>
            </div>
            <Footer />
        </div >
        </>
    );
}

export default Contribute;
