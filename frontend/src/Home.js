import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import logo from './assets/VSM-icon.png';
import headphones from './assets/hugeicons_customer-support.png';
import Footer from './Footer';
import './Home.css';
import testimonialBg from './assets/testimonialbg.png';
import Navbar from './Navbar';
import quotesFile from './assets/VSM-Quotes.xlsx';
import HomeInitiatives from './HomeInitiatives';
import './HomeInitiatives.css';
import ImpactStats from './ImpactStats';
const testimonials = [
    { name: 'Dr. J Kumar', title: 'Dean College of Agriculture, GBPUAT, Pantnagar', text: 'Initiatives like VSM help students realize their inner potential, ad value.' },
    { name: 'Dr. A Sharma', title: 'Professor, GBPUAT', text: 'VSM is a great platform for holistic development.' },
    { name: 'Dr. S Verma', title: 'Lecturer, GBPUAT', text: 'Students benefit immensely from VSM activities.' },
    { name: 'Dr. R Singh', title: 'Assistant Professor, GBPUAT', text: 'VSM inspires students to achieve more.' },
    { name: 'Dr. P Gupta', title: 'Researcher, GBPUAT', text: 'A wonderful initiative for youth empowerment.' },
];

function Home() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showLandingVideo, setShowLandingVideo] = useState(true);
    const [showHindi, setShowHindi] = useState(false);
    const [showIntroScreen, setShowIntroScreen] = useState(false);
    const [showIntro1, setShowIntro1] = useState(false);
    const [showIntro2, setShowIntro2] = useState(false);
    const [showIntro3, setShowIntro3] = useState(false);
    const [showIntro4, setShowIntro4] = useState(false);
    const [quoteOfTheDay, setQuoteOfTheDay] = useState('');
    const [quoteAuthor, setQuoteAuthor] = useState('');
    const [impact, setImpact] = useState(null);

    // Only skip intro if skipIntro is set in location.state, then clear the state
    useEffect(() => {
        if (location.state && location.state.skipIntro) {
            setShowLandingVideo(false);
            setShowHindi(false);
            setShowIntroScreen(false);
            setShowIntro1(false);
            setShowIntro2(false);
            setShowIntro3(false);
            setShowIntro4(false);
            // Clear the state so future visits don't skip the intro
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);

    // Reset function for Navbar
    const resetHome = () => {
        setShowLandingVideo(true);
        setShowHindi(false);
        setShowIntroScreen(false);
        setShowIntro1(false);
        setShowIntro2(false);
        setShowIntro3(false);
        setShowIntro4(false);
    };

    useEffect(() => {
        if (showLandingVideo) {
            const timer = setTimeout(() => setShowHindi(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [showLandingVideo]);

    useEffect(() => {
        if (showIntroScreen) {
            setShowIntro1(false);
            setShowIntro2(false);
            setShowIntro3(false);
            setShowIntro4(false);
            const t1 = setTimeout(() => setShowIntro1(true), 100);
            const t2 = setTimeout(() => setShowIntro2(true), 1100);
            const t3 = setTimeout(() => setShowIntro3(true), 2100);
            const t4 = setTimeout(() => setShowIntro4(true), 3100);
            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
        }
    }, [showIntroScreen]);

    // Load and parse quotes from Excel
    useEffect(() => {
        fetch(quotesFile)
            .then(res => res.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const quotes = XLSX.utils.sheet_to_json(sheet);
                if (quotes.length > 0) {
                    // Pick quote based on day of year
                    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
                    const idx = dayOfYear % quotes.length;
                    setQuoteOfTheDay(quotes[idx].Quote || quotes[idx].quote || quotes[idx].Text || '');
                }
            });
    }, []);

    useEffect(() => {
        fetch('http://localhost:3002/impact')
            .then(res => res.json())
            .then(data => {
                setImpact(data);
                // console.log('Impact data:', data);
            })
            .catch(err => {
                console.error('Impact fetch error:', err);
            });
    }, []);

    // First: Video overlay
    if (showLandingVideo) {
        return (
            <>
                <Navbar resetHome={resetHome} />
                <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 2000, overflow: 'hidden' }}>
                    <video
                        src={require('./assets/diya.mp4')}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: 1 }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            width: 757,
                            height: 360,
                            left: 61,
                            top: 157,
                            fontFamily: 'Tiro Devanagari Hindi, serif',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 62,
                            lineHeight: '35px',
                            color: '#DEDEB9',
                            zIndex: 2,
                            opacity: showHindi ? 1 : 0,
                            transition: 'opacity 0.8s ease',
                        }}
                    >
                        {showHindi && (
                            <>
                                अंधकार को क्यों धिक्कारे,<br /><br />अच्छा है एक दीप जलाये।
                            </>
                        )}
                    </div>
                    <button
                        style={{
                            position: 'absolute',
                            left: 61,
                            top: 340,
                            background: '#fff',
                            color: '#a2592a',
                            fontSize: 24,
                            border: 'none',
                            borderRadius: 10,
                            padding: '10px 36px',
                            boxShadow: '0 4px 12px #0002',
                            cursor: 'pointer',
                            fontWeight: 500,
                            zIndex: 2,
                            width: 156,
                        }}
                        onClick={() => {
                            setShowLandingVideo(false);
                            setShowIntroScreen(true);
                        }}
                    >
                        Enter
                    </button>
                    <div
                        style={{
                            position: 'absolute',
                            width: 300,
                            height: 70,
                            left: 61,
                            top: 431,
                            fontFamily: 'Tiro Devanagari Hindi, serif',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 26,
                            lineHeight: '35px',
                            color: '#DEDEB9',
                            zIndex: 2,
                        }}
                    >
                        Why curse the darkness,<br />it is better to light a lamp.
                    </div>
                    <div style={{ position: 'absolute', right: 10, bottom: 40, zIndex: 3, display: 'flex', alignItems: 'center', width: 320, justifyContent: 'center' }}>
                        <div style={{ height: 2, background: '#dedeb9', flex: 1, marginRight: 16 }} />
                        <button
                            style={{ background: '#fff', color: '#a2592a', fontSize: 24, border: 'none', borderRadius: 10, padding: '10px 36px', boxShadow: '0 4px 12px #0002', cursor: 'pointer', fontWeight: 500, width: 156 }}
                            onClick={() => {
                                setShowLandingVideo(false);
                                setShowIntroScreen(false);
                            }}
                        >
                            Skip
                        </button>
                        <div style={{ height: 2, background: '#dedeb9', flex: 1, marginLeft: 16 }} />
                    </div>
                </div>
            </>
        );
    }

    // Second: Intro screen
    if (showIntroScreen) {
        return (
            <>
                <Navbar resetHome={resetHome} />
                <div style={{ width: '100vw', height: '100vh', background: '#f9f3ec', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 1500 }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{
                            fontFamily: 'Italiana, serif',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 50,
                            color: '#000',
                            marginBottom: 24,
                            opacity: showIntro1 ? 1 : 0,
                            transition: 'opacity 0.8s',
                        }}>
                            Come, let's witness the heart warming saga of<br />growth and transformation
                        </div>
                        <div style={{
                            fontFamily: 'Joan, serif',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 48,
                            color: '#904B1C',
                            marginBottom: 40,
                            opacity: showIntro2 ? 1 : 0,
                            transition: 'opacity 0.8s',
                        }}>
                            Introducing VSM
                        </div>
                        <div style={{
                            fontFamily: 'Joan',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 45,
                            color: '#000',
                            textAlign: 'right',
                            opacity: showIntro3 ? 1 : 0,
                            transition: 'opacity 0.8s',
                        }}>
                            - Built with inspiration, sustained<br />by love
                        </div>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: 40 }}>
                            <button
                                style={{
                                    background: '#fff',
                                    color: '#a2592a',
                                    fontSize: 24,
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '10px 36px',
                                    boxShadow: '0 4px 12px #0002',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    width: 156,
                                    opacity: showIntro4 ? 1 : 0,
                                    transition: 'opacity 0.8s',
                                }}
                                onClick={() => setShowIntroScreen(false)}
                                disabled={!showIntro4}
                            >
                                Enter
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div style={{ position: 'relative' }}>
            <Navbar resetHome={resetHome} />
            {/* Main scrollable content after navbars */}
            <div style={{ marginTop: 100 }}>
                {/* Hero Section: Full image.png */}
                <img
                    src={require('./assets/image.png')}
                    alt="Hero"
                    style={{ width: '100vw', display: 'block', margin: 0, padding: 0, objectFit: 'cover' }}
                />
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
                    <button className="register-btn">Register</button>
                </div>
                {/* Quote of the Day Section */}
                <div style={{
                    width: '100vw',
                    minHeight: 700,
                    position: 'relative',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: 40
                }}>
                    {/* Left Cloud */}
                    <img src={require('./assets/cloud-left.png')} alt="Cloud Left" style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 500, zIndex: 1, minHeight: '100%', objectFit: 'cover' }} />
                    {/* Right Cloud */}
                    <img src={require('./assets/cloud-right.png')} alt="Cloud Right" style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 500, zIndex: 1, minHeight: '100%', objectFit: 'cover' }} />
                    {/* Sun at top center */}
                    <img src={require('./assets/sun.png')} alt="Sun" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 270, zIndex: 2, marginTop: 0 }} />
                    {/* Center Content */}
                    <div style={{
                        position: 'relative',
                        zIndex: 2,
                        width: '100%',
                        maxWidth: 700,
                        margin: '0 auto',
                        textAlign: 'center',
                        padding: '0 16px',
                        background: 'transparent',
                        borderRadius: 0,
                        boxShadow: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginTop: 110,
                    }}>
                        {/* Quote of the Day */}
                        <div style={{ fontFamily: 'Tangerine, cursive', fontSize: 80, color: '#DD783C', fontStyle: 'normal', margin: '24px 0 12px 0', fontWeight: 500 }}>
                            Quote of The Day:
                        </div>
                        <div style={{ fontFamily: 'Oranienbaum, serif', fontSize: 48, fontWeight: 400, color: '#8B8080', margin: '0 0 0 0', fontStyle: 'normal', textDecoration: 'none', lineHeight: 1.1 }}>
                            {quoteOfTheDay}
                        </div>
                        {quoteAuthor && <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, color: '#181818', marginTop: 8 }}>{quoteAuthor}</div>}
                        <div style={{ fontFamily: 'Tiro Devanagari Hindi, serif', fontSize: 28, color: '#111', margin: '18px 0 0 0', lineHeight: 1.5, textAlign: 'left', display: 'inline-block' }}>
                            तिथि: शुक्ल पक्ष नवमी<br />
                            नक्षत्र: उत्तर फाल्गुनी<br />
                            वार: बुधवार
                        </div>
                        <div style={{ fontFamily: 'Tiro Devanagari Hindi, serif', fontSize: 26, color: '#d44', margin: '10px 0 0 0', fontWeight: 700, textAlign: 'left', display: 'inline-block' }}>
                            महेश नवमी:
                        </div>
                        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 32, color: '#DD783C', fontWeight: 700, margin: '32px 0 10px 0', background: '#fff', borderRadius: 32, display: 'inline-block', padding: '10px 40px', boxShadow: '0 4px 16px #0002', letterSpacing: 2, border: '1.5px solid #eee', color: '#e53935' }}>
                            {new Date().toLocaleDateString('en-GB').replace(/\//g, ' / ')}
                        </div>
                    </div>
                </div>
                {/* Vision, Mission and Values Section */}
                <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '48px 0 64px 0', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Tangerine, cursive', fontSize: 64, color: '#DD783C', fontWeight: 500, marginBottom: 32 }}>
                        Vision, Mission and Values
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', marginBottom: 64 }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img src={require('./assets/Sun2.png')} alt="Vision" style={{ width: 110, height: 110, objectFit: 'contain', marginBottom: 18 }} />
                            <div style={{ color: '#DD783C', fontWeight: 700, fontSize: 32, marginTop: 8, letterSpacing: 1 }}>VISION</div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img src={require('./assets/Irrigation.png')} alt="Mission" style={{ width: 110, height: 110, objectFit: 'contain', marginBottom: 18 }} />
                            <div style={{ color: '#DD783C', fontWeight: 700, fontSize: 32, marginTop: 8, letterSpacing: 1 }}>MISSION</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img src={require('./assets/Acacia.png')} alt="Values" style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 18 }} />
                            <div style={{ color: '#DD783C', fontWeight: 700, fontSize: 32, marginTop: 8, letterSpacing: 1 }}>VALUES</div>
                        </div>
                    </div>
                </div>
                {/* Our Impact Section */}
                <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 0 64px 0', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Tangerine, cursive', fontSize: 64, color: '#DD783C', fontWeight: 700, marginBottom: 32 }}>
                        Our Impact
                    </div>
                    <div style={{ background: '#FFE5D0', borderRadius: 48, padding: '48px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 16px #0001', flexWrap: 'wrap', gap: 0 }}>
                        {/* 1 */}
                        <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                <img src={require('./assets/famicons_people-outline.png')} alt="Volunteers" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/famicons_people-outline.png')} alt="Volunteers" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/famicons_people-outline.png')} alt="Volunteers" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontFamily: 'Red Hat Display, sans-serif', fontSize: 38, fontWeight: 400, color: '#000', marginBottom: 0, fontStyle: 'normal' }}>{impact ? impact.volunteers : '...'}</div>
                            <div style={{ fontFamily: 'Arimo, sans-serif', fontSize: 20, color: '#222', marginTop: 8 }}>Volunteers<br />Engaged</div>
                        </div>
                        {/* 2 */}
                        <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                <img src={require('./assets/Microphone.png')} alt="Events" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/Microphone.png')} alt="Events" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/Microphone.png')} alt="Events" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontFamily: 'Red Hat Display, sans-serif', fontSize: 38, fontWeight: 400, color: '#000', marginBottom: 0, fontStyle: 'normal' }}>{impact ? impact.events : '...'}</div>
                            <div style={{ fontFamily: 'Arimo, sans-serif', fontSize: 20, color: '#222', marginTop: 8 }}>Events<br />Conducted</div>
                        </div>
                        {/* 3 */}
                        <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                <img src={require('./assets/People.png')} alt="People Impacted" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/People.png')} alt="People Impacted" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/People.png')} alt="People Impacted" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontFamily: 'Red Hat Display, sans-serif', fontSize: 38, fontWeight: 400, color: '#000', marginBottom: 0, fontStyle: 'normal' }}>{impact ? impact.people : '...'}</div>
                            <div style={{ fontFamily: 'Arimo, sans-serif', fontSize: 20, color: '#222', marginTop: 8 }}>People<br />Impacted</div>
                        </div>
                        {/* 4 */}
                        <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                <img src={require('./assets/Alarm Clock.png')} alt="Hours" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/Alarm Clock.png')} alt="Hours" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/Alarm Clock.png')} alt="Hours" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontFamily: 'Red Hat Display, sans-serif', fontSize: 38, fontWeight: 400, color: '#000', marginBottom: 0, fontStyle: 'normal' }}>{impact ? impact.hours : '...'}</div>
                            <div style={{ fontFamily: 'Arimo, sans-serif', fontSize: 20, color: '#222', marginTop: 8 }}>Hours<br />Contributed</div>
                        </div>
                        {/* 5 */}
                        <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                <img src={require('./assets/Dollar Bag.png')} alt="Donated" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/Dollar Bag.png')} alt="Donated" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/Dollar Bag.png')} alt="Donated" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontFamily: 'Red Hat Display, sans-serif', fontSize: 38, fontWeight: 400, color: '#000', marginBottom: 0, fontStyle: 'normal' }}>{impact ? impact.donors : '...'}</div>
                            <div style={{ fontFamily: 'Arimo, sans-serif', fontSize: 20, color: '#222', marginTop: 8 }}>People<br />Donated</div>
                        </div>
                        {/* 6 */}
                        <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                <img src={require('./assets/bx_calendar.png')} alt="Years" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/bx_calendar.png')} alt="Years" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/bx_calendar.png')} alt="Years" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontFamily: 'Red Hat Display, sans-serif', fontSize: 38, fontWeight: 400, color: '#000', marginBottom: 0, fontStyle: 'normal' }}>{impact ? impact.years : '...'}</div>
                            <div style={{ fontFamily: 'Arimo, sans-serif', fontSize: 20, color: '#222', marginTop: 8 }}>Years</div>
                        </div>
                    </div>
                </div>
            </div>
            <HomeInitiatives />
            {/* Testimonials Section */}
            <section className="testimonials-section">
                <h2 className="testimonials-heading">Testimonials</h2>
                <div className="testimonials-quote-bg-img">
                    <img src={testimonialBg} alt="Testimonials background" className="testimonials-bg-img" />

                </div>
                <div className="testimonials-cards-row">
                    {testimonials.map((t, i) => (
                        <div
                            key={t.name}
                            className={`testimonial-card ${i === 2 ? 'active' : i === 1 || i === 3 ? 'side' : 'faded'}`}
                        >
                            <div className="testimonial-card-name"><b>{i === 2 ? t.name : `Dr. J ...`}</b></div>
                            {i === 2 && (
                                <div className="testimonial-card-title">{t.title}</div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="testimonials-bar"></div>
            </section>

            <Footer />
        </div>

    );
}

export default Home; 