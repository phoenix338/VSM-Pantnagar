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
import HinduCalendar from './HinduCalendar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

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
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [heroImage, setHeroImage] = useState(require('./assets/image.png'));
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [isNextButtonHovered, setIsNextButtonHovered] = useState(false);
    const [latestBooks, setLatestBooks] = useState([]);
    const [visionMissionVisible, setVisionMissionVisible] = useState(false);
    const [visionMissionRef, setVisionMissionRef] = useState(null);
    const [currentStep, setCurrentStep] = useState(0); // 0: initial, 1: vision, 2: mission, 3: values

    // Fetch upcoming events for hero image
    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            try {
                const res = await fetch(`${API_URL}/events/upcoming`);
                const data = await res.json();
                // Limit to max 3 events
                const limitedEvents = data.slice(0, 3);
                setUpcomingEvents(limitedEvents);
                // Use the first upcoming event's banner image as hero image
                if (limitedEvents.length > 0 && limitedEvents[0].bannerImage) {
                    setHeroImage(limitedEvents[0].bannerImage);
                }
            } catch (err) {
                console.log('No upcoming events found, using default hero image');
            }
        };
        fetchUpcomingEvents();
    }, []);

    // Fetch latest books
    useEffect(() => {
        const fetchLatestBooks = async () => {
            try {
                const res = await fetch(`${API_URL}/books`);
                const data = await res.json();
                // Get all books instead of just latest 4
                setLatestBooks(data);
            } catch (err) {
                console.log('No books found');
            }
        };
        fetchLatestBooks();
    }, []);

    // Scroll observer for Vision, Mission, Values animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisionMissionVisible(true);
                    // Start sequence: Vision -> Mission -> Values
                    setTimeout(() => setCurrentStep(1), 1000);  // Vision (1s)
                    setTimeout(() => setCurrentStep(2), 3000);  // Mission (3s)
                    setTimeout(() => setCurrentStep(3), 5000);  // Values (5s)
                }
            },
            { threshold: 0.3 }
        );

        if (visionMissionRef) {
            observer.observe(visionMissionRef);
        }

        return () => {
            if (visionMissionRef) {
                observer.unobserve(visionMissionRef);
            }
        };
    }, [visionMissionRef]);

    const nextEvent = () => {
        setCurrentEventIndex((prev) =>
            prev === upcomingEvents.length - 1 ? 0 : prev + 1
        );
    };

    const prevEvent = () => {
        setCurrentEventIndex((prev) =>
            prev === 0 ? upcomingEvents.length - 1 : prev - 1
        );
    };

    const goToEvent = (index) => {
        setCurrentEventIndex(index);
    };

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

    // Handle location state for intro video
    useEffect(() => {
        if (location.state && location.state.skipIntro === false) {
            setShowLandingVideo(true);
            setShowHindi(false);
            setShowIntroScreen(false);
            setShowIntro1(false);
            setShowIntro2(false);
            setShowIntro3(false);
            setShowIntro4(false);
        }
    }, [location.state]);

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
        fetch((process.env.REACT_APP_API_URL || 'http://localhost:3002') + '/impact')
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
                        src={require('./assets/diyaa.mp4')}
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
                            top: '50%',
                            transform: 'translateY(-40%)',
                            fontFamily: 'Tiro Devanagari Hindi, serif',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 49,
                            lineHeight: '35px',
                            color: '#DEDEB9',
                            zIndex: 2,
                            opacity: showHindi ? 1 : 0,
                            transition: 'opacity 0.8s ease',
                        }}
                    >
                        {showHindi && (
                            <>
                                Why curse the darkness,<br /><br />Better to light a lamp.
                            </>
                        )}
                    </div>
                    <button
                        style={{
                            position: 'absolute',
                            left: 61,
                            top: '50%',
                            transform: 'translateY(-5%)',
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
                            fontFamily: 'Arial, sans-serif',
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
                            fontFamily: 'Helvetica',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 48,
                            color: '#FFD700',
                            marginBottom: 40,
                            opacity: showIntro2 ? 1 : 0,
                            transition: 'opacity 0.8s',
                            position: 'relative',
                            display: 'inline-block',
                        }}>
                            <span style={{
                                position: 'absolute',
                                top: '-15px',
                                left: '-20px',
                                fontSize: '24px',
                                color: '#FFD700',
                                animation: 'sparkle 2s infinite',
                                opacity: 0.9,
                            }}>✨</span>
                            <span style={{
                                position: 'absolute',
                                top: '10px',
                                right: '-25px',
                                fontSize: '20px',
                                color: '#FFD700',
                                animation: 'sparkle 2.5s infinite 0.5s',
                                opacity: 0.8,
                            }}>✨</span>
                            <span style={{
                                position: 'absolute',
                                bottom: '5px',
                                left: '30px',
                                fontSize: '18px',
                                color: '#FFD700',
                                animation: 'sparkle 1.8s infinite 1s',
                                opacity: 0.7,
                            }}>✨</span>
                            Introducing VSM
                            <span style={{
                                position: 'absolute',
                                top: '5px',
                                right: '40px',
                                fontSize: '22px',
                                color: '#FFD700',
                                animation: 'sparkle 2.2s infinite 0.8s',
                                opacity: 0.8,
                            }}>✨</span>
                            <span style={{
                                position: 'absolute',
                                bottom: '-10px',
                                right: '15px',
                                fontSize: '16px',
                                color: '#FFD700',
                                animation: 'sparkle 1.5s infinite 1.2s',
                                opacity: 0.6,
                            }}>✨</span>
                        </div>
                        <div style={{
                            fontFamily: 'Georgia, serif',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 45,
                            color: '#000',
                            textAlign: 'center',
                            opacity: showIntro3 ? 1 : 0,
                            transition: 'opacity 0.8s',
                        }}>
                            - Built with inspiration, sustained by love
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
                {/* Hero Section: Events Carousel */}
                {upcomingEvents.length > 0 ? (
                    <div style={{
                        width: '100vw',
                        height: '65vh',
                        position: 'relative',
                        background: '#FFE4D6',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Event Banner Image */}
                        <div style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <img
                                src={upcomingEvents[currentEventIndex].bannerImage}
                                alt={upcomingEvents[currentEventIndex].title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>

                        {/* Pagination Dots */}
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '10px',
                            zIndex: 10
                        }}>
                            {upcomingEvents.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToEvent(index)}
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        background: index === currentEventIndex ? '#DD783C' : 'rgba(221, 120, 60, 0.4)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Next Button */}
                        {upcomingEvents.length > 1 && (
                            <button
                                onClick={nextEvent}
                                onMouseEnter={() => setIsNextButtonHovered(true)}
                                onMouseLeave={() => setIsNextButtonHovered(false)}
                                style={{
                                    position: 'absolute',
                                    right: '30px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: isNextButtonHovered ? '#C6692E' : '#DD783C',
                                    border: 'none',
                                    borderRadius: '12px',
                                    width: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    color: 'white',
                                    zIndex: 10,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <svg width="16" height="27" viewBox="0 0 16 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M1.375 1.25L13.625 13.5L1.375 25.75"
                                        stroke="white"
                                        strokeWidth="3"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                ) : (
                    // Fallback to original hero image if no events
                    <img
                        src={heroImage}
                        alt="Hero"
                        style={{ width: '100vw', display: 'block', margin: 0, padding: 0, objectFit: 'cover' }}
                    />
                )}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
                    <button
                        className="register-btn"
                        onClick={() => {
                            if (upcomingEvents.length > 0 && upcomingEvents[currentEventIndex].googleFormLink) {
                                window.open(upcomingEvents[currentEventIndex].googleFormLink, '_blank');
                            }
                        }}
                    >
                        Register
                    </button>
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

                        <div style={{ fontFamily: 'Apple Chancery, cursive', fontSize: 64, color: '#DD783C', fontStyle: 'normal', margin: '24px 0 12px 0', fontWeight: 500 }}>
                            Quote of The Day:
                        </div>
                        <div style={{ fontFamily: 'Oranienbaum, serif', fontSize: 48, fontWeight: 400, color: '#8B8080', margin: '0 0 0 0', fontStyle: 'normal', textDecoration: 'none', lineHeight: 1.1 }}>
                            {quoteOfTheDay}
                        </div>
                        {quoteAuthor && <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, color: '#181818', marginTop: 8 }}>{quoteAuthor}</div>}
                        <HinduCalendar />
                        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 32, color: '#DD783C', fontWeight: 700, margin: '32px 0 10px 0', background: '#fff', borderRadius: 32, display: 'inline-block', padding: '10px 40px', boxShadow: '0 4px 16px #0002', letterSpacing: 2, border: '1.5px solid #eee', color: '#e53935' }}>
                            {new Date().toLocaleDateString('en-GB').replace(/\//g, ' / ')}
                        </div>
                    </div>
                </div>
                {/* Vision, Mission and Values Section */}
                <div
                    ref={setVisionMissionRef}
                    style={{
                        width: '100%',
                        maxWidth: 1200,
                        margin: '0 auto',
                        padding: '48px 0 64px 0',
                        textAlign: 'center',
                        opacity: visionMissionVisible ? 1 : 0,
                        transform: visionMissionVisible ? 'translateY(0)' : 'translateY(50px)',
                        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
                    }}
                >
                    <div
                        style={{
                            fontFamily: 'Apple Chancery, cursive',
                            fontSize: 64,
                            color: '#DD783C',
                            fontWeight: 500,
                            marginBottom: 32,
                            opacity: visionMissionVisible ? 1 : 0,
                            transform: visionMissionVisible ? 'translateY(0)' : 'translateY(30px)',
                            transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s'
                        }}
                    >
                        Vision, Mission and Values
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', marginBottom: 64 }}>
                        {/* Vision Section with Text Box */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                            {/* Text Box to the left of Vision */}
                            <div style={{
                                position: 'absolute',
                                left: '-20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: '#FFFDCE',
                                padding: '16px',
                                borderRadius: '12px',
                                maxWidth: '200px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                fontSize: '18px',
                                lineHeight: '1.4',
                                color: '#333',
                                textAlign: 'left',
                                opacity: currentStep >= 1 ? 1 : 0,
                                transition: 'opacity 0.6s ease-out 0.6s'
                            }}>
                                To inspire and support personal excellence through value-based development, uplifting individuals from mediocrity to higher human potential.
                            </div>

                            <img
                                src={currentStep >= 1 ? require('./assets/sunafter.png') : require('./assets/sunvsm.png')}
                                alt="Vision"
                                style={{
                                    width: 110,
                                    height: 110,
                                    objectFit: 'contain',
                                    marginBottom: 18,
                                    transition: 'all 0.8s ease-out'
                                }}
                            />
                            <div style={{ color: '#DD783C', fontWeight: 700, fontSize: 32, marginTop: 8, letterSpacing: 1 }}>VISION</div>
                        </div>

                        {/* Connecting Sunrays */}
                        <div style={{
                            position: 'absolute',
                            top: '30%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1,
                            width: '200px',
                            height: '100px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            pointerEvents: 'none'
                        }}>
                            <img
                                src={require('./assets/sunrays.png')}
                                alt="Connecting Sunrays"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    opacity: 0.7
                                }}
                            />
                        </div>

                        {/* Mission Section with Text Box */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                            {/* Text Box to the right of Mission */}
                            <div style={{
                                position: 'absolute',
                                right: '-20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: '#FFFDCE',
                                padding: '16px',
                                borderRadius: '12px',
                                maxWidth: '200px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                fontSize: '18px',
                                lineHeight: '1.4',
                                color: '#333',
                                textAlign: 'left',
                                opacity: currentStep >= 2 ? 1 : 0,
                                transition: 'opacity 0.6s ease-out 0.6s'
                            }}>
                                To nurture holistic human development, balancing inner growth with social responsibility and national consciousness.
                            </div>

                            <img
                                src={currentStep >= 2 ? require('./assets/plantafter.png') : require('./assets/plant.png')}
                                alt="Mission"
                                style={{
                                    width: 110,
                                    height: 110,
                                    objectFit: 'contain',
                                    marginBottom: 18,
                                    transition: 'all 0.8s ease-out'
                                }}
                            />
                            <div style={{ color: '#DD783C', fontWeight: 700, fontSize: 32, marginTop: 8, letterSpacing: 1 }}>MISSION</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img
                                src={currentStep >= 3 ? require('./assets/treeafter.png') : require('./assets/tree.png')}
                                alt="Values"
                                style={{
                                    width: 120,
                                    height: 120,
                                    objectFit: 'contain',
                                    marginBottom: 18,
                                    transition: 'all 0.8s ease-out'
                                }}
                            />
                            <div style={{ color: '#DD783C', fontWeight: 700, fontSize: 32, marginTop: 8, letterSpacing: 1 }}>VALUES</div>

                            {/* Text Box below Values */}
                            <div style={{
                                background: '#FFFDCE',
                                padding: '20px',
                                borderRadius: '12px',
                                maxWidth: '400px',
                                marginTop: '24px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                fontSize: '18px',
                                lineHeight: '1.5',
                                color: '#333',
                                textAlign: 'center',
                                opacity: currentStep >= 3 ? 1 : 0,
                                transition: 'opacity 0.6s ease-out 0.6s'
                            }}>
                                To uphold compassion, integrity, self-awareness, and service as the foundation for meaningful personal and collective growth.
                            </div>
                        </div>
                    </div>
                </div>
                {/* Our Impact Section */}
                <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 0 64px 0', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Apple Chancery, cursive', fontSize: 64, color: '#DD783C', fontWeight: 500, marginBottom: 32 }}>
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

            {/* Latest Books Section */}
            <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '64px 0', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Apple Chancery, cursive', fontSize: 64, color: '#DD783C', fontWeight: 500, marginBottom: 48 }}>
                    Latest Books
                </div>
                <div className="books-scroll-container" style={{
                    display: 'flex',
                    gap: '32px',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    padding: '0 20px 20px 20px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#DD783C #f0f0f0'
                }}>
                    {latestBooks.map((book, index) => (
                        <div key={book._id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minWidth: '300px',
                            maxWidth: '350px',
                            flexShrink: 0,
                            padding: '20px',
                            backgroundColor: '#FFE7D7',
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            border: '1px solid #e0e0e0',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}>
                            <div style={{
                                width: '260px',
                                height: '360px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                marginBottom: '16px',
                                backgroundColor: '#f5f5f5'
                            }}>
                                <img
                                    src={book.frontPageImage}
                                    alt={book.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                            <div style={{
                                fontFamily: 'Arimo, sans-serif',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#333',
                                textAlign: 'center',
                                lineHeight: '1.2'
                            }}>
                                {book.title}
                            </div>
                        </div>
                    ))}
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