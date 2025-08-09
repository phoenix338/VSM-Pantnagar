import React, { useState, useEffect, useRef } from 'react';
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
import './QuoteOfTheDay.css';
import { auth } from './firebase';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const testimonials = [
    { name: 'Dr. J Kumar', title: 'Dean College of Agriculture, GBPUAT, Pantnagar', text: 'Initiatives like VSM help students realize their inner potential, ad value.' },
    { name: 'Dr. A Sharma', title: 'Professor, GBPUAT', text: 'VSM is a great platform for holistic development.' },
    { name: 'Dr. S Verma', title: 'Lecturer, GBPUAT', text: 'Students benefit immensely from VSM activities.' },
    { name: 'Dr. R Singh', title: 'Assistant Professor, GBPUAT', text: 'VSM inspires students to achieve more.' },
    { name: 'Dr. P Gupta', title: 'Researcher, GBPUAT', text: 'A wonderful initiative for youth empowerment.' },
];

function Home() {
    // Admin user state
    const [user, setUser] = useState(null);
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);
    // Guest testimonial state
    const [guestTestimonials, setGuestTestimonials] = useState([]);
    const [selectedGuestIndex, setSelectedGuestIndex] = useState(0);
    const [guestForm, setGuestForm] = useState({ name: '', designation: '', text: '' });
    const [guestSubmitting, setGuestSubmitting] = useState(false);
    const [guestFormMsg, setGuestFormMsg] = useState('');

    // Fetch guest testimonials
    useEffect(() => {
        fetch(`${API_URL}/guest-testimonials`)
            .then(res => res.json())
            .then(data => setGuestTestimonials(data || []))
            .catch(() => setGuestTestimonials([]));
    }, []);

    // Handle guest testimonial form submit
    const handleGuestTestimonialSubmit = async (e) => {
        e.preventDefault();
        setGuestFormMsg('');
        setGuestSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/guest-testimonials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(guestForm)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Submission failed');
            }
            setGuestForm({ name: '', designation: '', text: '' });
            setGuestFormMsg('Thank you for sharing your testimonial!');
            // Refetch testimonials after submission
            fetch(`${API_URL}/guest-testimonials`)
                .then(res => res.json())
                .then(data => setGuestTestimonials(data || []));
        } catch (err) {
            setGuestFormMsg('Error: ' + err.message);
        }
        setGuestSubmitting(false);
    }
    const location = useLocation();
    const navigate = useNavigate();

    // Function to play audio after user interaction
    const playAudio = () => {
        if (audioRef.current && !audioPlayed) {
            audioRef.current.play().then(() => {
                setAudioPlayed(true);
            }).catch(err => {
                console.log('Audio play failed:', err);
            });
        }
    };

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
    const [audioPlayed, setAudioPlayed] = useState(false);
    const audioRef = useRef(null);

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
            // Reset audio played state when logo is clicked
            setAudioPlayed(false);
            // Play audio immediately when logo is clicked
            setTimeout(() => {
                playAudio();
            }, 500);
        }
    }, [location.state, location.pathname, navigate]);

    // Handle user interaction to enable audio
    useEffect(() => {
        const handleUserInteraction = () => {
            if (!audioPlayed && showLandingVideo) {
                playAudio();
            }
        };

        // Add event listeners for user interaction
        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('touchstart', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
        };
    }, [audioPlayed, showLandingVideo]);

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

    // Reset function for Navbar
    const resetHome = () => {
        setShowLandingVideo(true);
        setShowHindi(false);
        setShowIntroScreen(false);
        setShowIntro1(false);
        setShowIntro2(false);
        setShowIntro3(false);
        setShowIntro4(false);
        // Reset audio state and play audio
        setAudioPlayed(false);
        setTimeout(() => {
            playAudio();
        }, 500);
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
                    <audio
                        ref={audioRef}
                        src={require('./assets/audio.mp3')}
                        loop
                        style={{ display: 'none' }}
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
                    <div style={{
                        position: 'absolute',
                        left: 61,
                        top: '50%',
                        transform: 'translateY(-5%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 32,
                        zIndex: 4
                    }}>
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
                            }}
                            onClick={() => {
                                setShowLandingVideo(false);
                                setShowIntroScreen(true);
                            }}
                        >
                            Enter
                        </button>
                        {/* Glowing Circle Element - right of Enter button */}
                        <div
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                                boxShadow: '0 0 20px #FFD700, 0 0 40px #FFA500, 0 0 60px #FF8C00, inset 0 0 20px rgba(255, 215, 0, 0.3)',
                                animation: 'glowPulse 2s ease-in-out infinite alternate',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                color: '#fff',
                                textShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                                transition: 'all 0.3s ease',
                                transform: 'scale(1)',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.1)';
                                e.target.style.boxShadow = '0 0 30px #FFD700, 0 0 60px #FFA500, 0 0 90px #FF8C00, inset 0 0 30px rgba(255, 215, 0, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = '0 0 20px #FFD700, 0 0 40px #FFA500, 0 0 60px #FF8C00, inset 0 0 20px rgba(255, 215, 0, 0.3)';
                            }}
                            onClick={() => {
                                // Create a ripple effect
                                const ripple = document.createElement('div');
                                ripple.style.cssText = 'position: absolute; top: 50%; left: 50%; width: 0; height: 0; border-radius: 50%; background: rgba(255, 215, 0, 0.6); transform: translate(-50%, -50%); animation: rippleEffect 0.6s ease-out; pointer-events: none;';
                                document.body.appendChild(ripple);
                                setTimeout(() => {
                                    if (ripple && ripple.parentNode) {
                                        ripple.parentNode.removeChild(ripple);
                                    }
                                }, 600);
                                // Play audio if available
                                const audio = document.querySelector('audio');
                                if (audio && audio.paused) {
                                    audio.play();
                                }
                            }}
                        ></div>
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
                            fontFamily: 'alex brush',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 40,
                            color: '#000',
                            marginBottom: 24,
                            opacity: showIntro1 ? 1 : 0,
                            transition: 'opacity 0.8s',
                        }}>
                            Come, let's witness the heart warming saga of<br />growth and transformation
                        </div>
                        <div style={{
                            fontFamily: 'alex brush',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 45,
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
                            fontFamily: 'alex brush',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 40,
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
            <div className="main-content-gap" style={{ marginTop: 100 }}>
                {/* Hero Section: Events Carousel */}
                {upcomingEvents.length > 0 ? (
                    <div
                        style={{
                            width: '100vw',
                            minHeight: '220px',
                            height: '65vh',
                            position: 'relative',
                            background: '#FFE4D6',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Event Banner Image */}
                        <div
                            style={{
                                width: '100vw',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                maxWidth: '100vw',
                                minHeight: '220px',
                            }}
                        >
                            <img
                                src={upcomingEvents[currentEventIndex].bannerImage}
                                alt={upcomingEvents[currentEventIndex].title}
                                style={{
                                    width: '100vw',
                                    maxWidth: '100vw',
                                    height: '100%',
                                    minHeight: '220px',
                                    objectFit: 'cover',
                                    display: 'block',
                                    margin: '0 auto',
                                }}
                            />
                        </div>
                        {/* Mobile specific styles */}
                        <style>{`
                            @media (max-width: 600px) {
                  .event-hero-img {
                    width: 100% !important;
                    height: auto !important;
                    min-height: 0 !important;
                    max-width: 100% !important;
                    justify-content: center !important;
                    align-items: center !important;
                    overflow: hidden !important;
                  }
                  .event-hero-img img {
                    width: 100% !important;
                    height: auto !important;
                    max-width: 100% !important;
                    min-height: 0 !important;
                    object-fit: contain !important;
                    border-radius: 10px !important;
                    box-shadow: 0 2px 8px #DD783C22 !important;
                    margin: 0 auto !important;
                  }
                            }
                        `}</style>

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
                {/* Quote of the Day Section - New Design */}
                <div style={{
                    width: '100vw',
                    minHeight: 700,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: 40,
                    background: '#e7f2fa'
                }}>
                    {/* Background Image */}
                    <img src={require('./assets/qouteoftheday.jpg')} alt="Quote Background" className="quote-bg" />
                    {/* Quote GIF - above bg, below card */}
                    {/* Frosted Glass Card */}
                    <div className="quote-frosted" style={{ zIndex: 3 }}>
                        <div className="quote-title">Quote Of The Day:</div>
                        <div className="quote-main">{quoteOfTheDay}</div>
                        {quoteAuthor && <div className="quote-author">{quoteAuthor}</div>}
                        <div className="quote-date">{new Date().toLocaleDateString('en-GB').replace(/\//g, ' / ')}</div>
                        <div className="quote-hindu"><HinduCalendar /></div>
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
                            fontFamily: 'Alex Brush, cursive',
                            fontSize: 64,
                            color: '#DD783C',
                            fontWeight: 500,
                            marginBottom: 32,
                            opacity: visionMissionVisible ? 1 : 0,
                            transform: visionMissionVisible ? 'translateY(0)' : 'translateY(30px)',
                            transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s'
                        }}
                    >
                        Vision, Mission And Values
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
                                fontFamily: 'open sans',
                                lineHeight: '1.4',
                                color: '#333',
                                textAlign: 'left',
                                fontWeight: 300,
                                opacity: currentStep >= 1 ? 1 : 0,
                                transition: 'opacity 0.6s ease-out 0.6s'
                            }}>
                                To inspire and support personal excellence through value-based development, uplifting individuals from mediocrity to higher human potential.
                            </div>

                            <img
                                src={require('./assets/sunvsm.png')}
                                alt="Vision"
                                style={{
                                    width: 110,
                                    height: 110,
                                    objectFit: 'contain',
                                    marginBottom: 18,
                                    transition: 'all 0.8s ease-out'
                                }}
                            />
                            <div style={{ fontFamily: 'open sans', color: '#DD783C', fontWeight: 300, fontSize: 32, marginTop: 8, letterSpacing: 1 }}>Vision</div>
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
                                src={require('./assets/sunraysnew.png')}
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
                                fontFamily: 'open sans',
                                fontWeight: 300,
                                transition: 'opacity 0.6s ease-out 0.6s'
                            }}>
                                To nurture holistic human development, balancing inner growth with social responsibility and national consciousness.
                            </div>

                            <img
                                src={require('./assets/plant.png')}
                                alt="Mission"
                                style={{
                                    width: 110,
                                    height: 110,
                                    objectFit: 'contain',
                                    marginBottom: 18,
                                    transition: 'all 0.8s ease-out'
                                }}
                            />
                            <div style={{ fontFamily: 'open sans', color: '#DD783C', fontWeight: 300, fontSize: 32, marginTop: 8, letterSpacing: 1 }}>Mission</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img
                                src={require('./assets/tree.png')}
                                alt="Values"
                                style={{
                                    width: 120,
                                    height: 120,
                                    objectFit: 'contain',
                                    marginBottom: 18,
                                    transition: 'all 0.8s ease-out'
                                }}
                            />
                            <div style={{ fontFamily: 'open sans', color: '#DD783C', fontWeight: 300, fontSize: 32, marginTop: 8, letterSpacing: 1 }}>Values</div>

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
                                fontFamily: 'open sans',
                                fontWeight: 300,
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
                    <div style={{ fontFamily: 'Alex Brush, cursive', fontSize: 64, color: '#DD783C', fontWeight: 500, marginBottom: 32 }}>
                        Our Impact
                    </div>
                    <ImpactStats></ImpactStats>
                    {/* <div style={{ background: '#FFE5D0', borderRadius: 48, padding: '48px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 16px #0001', flexWrap: 'wrap', gap: 0 }}>
                    <style>{`
                        @media (max-width: 900px) {
                            .main-content-gap .impact-stat-img {
                                width: 28px !important;
                                height: 28px !important;
                            }
                            .main-content-gap .impact-stat-value {
                                font-size: 28px !important;
                            }
                            .main-content-gap .impact-stat-label {
                                font-size: 15px !important;
                            }
                        }
                        @media (max-width: 600px) {
                            .main-content-gap .impact-stat-img {
                                width: 20px !important;
                                height: 20px !important;
                            }
                            .main-content-gap .impact-stat-value {
                                font-size: 18px !important;
                            }
                            .main-content-gap .impact-stat-label {
                                font-size: 11px !important;
                            }
                        }
                    `}</style> */}
                    {/* 1 */}
                    {/* <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                <img src={require('./assets/famicons_people-outline.png')} alt="Volunteers" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/famicons_people-outline.png')} alt="Volunteers" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/famicons_people-outline.png')} alt="Volunteers" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontFamily: 'Red Hat Display, sans-serif', fontSize: 38, fontWeight: 400, color: '#000', marginBottom: 0, fontStyle: 'normal' }}>{impact ? impact.volunteers : '...'}</div>
                            <div style={{ fontFamily: 'Arimo, sans-serif', fontSize: 20, color: '#222', marginTop: 8 }}>Volunteers<br />Engaged</div>
                        </div> */}
                    {/* 2 */}
                    {/* <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                <img src={require('./assets/Microphone.png')} alt="Events" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/Microphone.png')} alt="Events" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/Microphone.png')} alt="Events" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontFamily: 'Red Hat Display, sans-serif', fontSize: 38, fontWeight: 400, color: '#000', marginBottom: 0, fontStyle: 'normal' }}>{impact ? impact.events : '...'}</div>
                            <div style={{ fontFamily: 'Arimo, sans-serif', fontSize: 20, color: '#222', marginTop: 8 }}>Events<br />Conducted</div>
                        </div> */}
                    {/* 3 */}
                    {/* <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                <img src={require('./assets/People.png')} alt="People Impacted" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/People.png')} alt="People Impacted" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/People.png')} alt="People Impacted" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontFamily: 'Red Hat Display, sans-serif', fontSize: 38, fontWeight: 400, color: '#000', marginBottom: 0, fontStyle: 'normal' }}>{impact ? impact.people : '...'}</div>
                            <div style={{ fontFamily: 'Arimo, sans-serif', fontSize: 20, color: '#222', marginTop: 8 }}>People<br />Impacted</div>
                        </div> */}
                    {/* 4 */}
                    {/* <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                <img src={require('./assets/Alarm Clock.png')} alt="Hours" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/Alarm Clock.png')} alt="Hours" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/Alarm Clock.png')} alt="Hours" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontFamily: 'Red Hat Display, sans-serif', fontSize: 38, fontWeight: 400, color: '#000', marginBottom: 0, fontStyle: 'normal' }}>{impact ? impact.hours : '...'}</div>
                            <div style={{ fontFamily: 'Arimo, sans-serif', fontSize: 20, color: '#222', marginTop: 8 }}>Hours<br />Contributed</div>
                        </div> */}
                    {/* 5 */}
                    {/* <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                <img src={require('./assets/Dollar Bag.png')} alt="Donated" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/Dollar Bag.png')} alt="Donated" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/Dollar Bag.png')} alt="Donated" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontFamily: 'Red Hat Display, sans-serif', fontSize: 38, fontWeight: 400, color: '#000', marginBottom: 0, fontStyle: 'normal' }}>{impact ? impact.donors : '...'}</div>
                            <div style={{ fontFamily: 'Arimo, sans-serif', fontSize: 20, color: '#222', marginTop: 8 }}>People<br />Donated</div>
                        </div> */}
                    {/* 6 */}
                    {/* <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                <img src={require('./assets/bx_calendar.png')} alt="Years" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/bx_calendar.png')} alt="Years" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                                <img src={require('./assets/bx_calendar.png')} alt="Years" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontFamily: 'Red Hat Display, sans-serif', fontSize: 38, fontWeight: 400, color: '#000', marginBottom: 0, fontStyle: 'normal' }}>{impact ? impact.years : '...'}</div>
                            <div style={{ fontFamily: 'Arimo, sans-serif', fontSize: 20, color: '#222', marginTop: 8 }}>Years</div>
                        </div> */}
                    {/* </div> */}
                </div>
            </div>

            {/* Latest Books Section */}
            <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '64px 0', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Alex Brush, cursive', fontSize: 64, color: '#DD783C', fontWeight: 500, marginBottom: 48 }}>
                    Our Publications
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
                                        objectFit: 'fill'
                                    }}
                                />
                            </div>
                            <div style={{
                                fontFamily: 'open sans',
                                fontSize: '18px',
                                color: '#333',
                                textAlign: 'center',
                                lineHeight: '1.3',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                maxHeight: '60px',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: '3',
                                WebkitBoxOrient: 'vertical',
                                padding: '0 8px'
                            }}>
                                {book.title}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <HomeInitiatives />
            {/* Guest Testimonials Section (VSM Guest Testimonials) */}
            <section className="reviews-section-root" style={{ marginTop: 64 }}>
                <div className="reviews-section-header-row">
                    <h2 className="reviews-section-title" style={{ fontFamily: 'Alex Brush, cursive', fontSize: 64, fontWeight: 400 }}>Testimonials From Our Guests</h2>
                    <div className="reviews-section-horizontal-line" />
                </div>
                {guestTestimonials.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', margin: '32px 0', fontSize: 20 }}>
                        No guest testimonials yet.
                    </div>
                ) : (
                    <div className="reviews-section-main">
                        <div className="reviews-main-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '420px' }}>
                            {guestTestimonials[selectedGuestIndex] ? (
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <div className="reviews-main-title"></div>
                                    <div className="reviews-main-text">
                                        <span style={{ width: '100%', textAlign: 'center', fontSize: '1.1em', lineHeight: 1.5 }}>
                                            "{guestTestimonials[selectedGuestIndex].text}"
                                        </span>
                                        <div style={{
                                            textAlign: 'right',
                                            fontStyle: 'normal',
                                            fontWeight: 'bold',
                                            color: '#dd783c',
                                            fontSize: '1rem',
                                            marginTop: '1rem',
                                            width: '100%'
                                        }}>
                                            — {guestTestimonials[selectedGuestIndex].name}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <div className="reviews-section-divider" />
                        <div className="reviews-main-right">
                            <div className="reviews-scroll-list">
                                {guestTestimonials.map((item, i) => (
                                    <div
                                        className={`reviews-scroll-item${i === selectedGuestIndex ? ' active' : ''}`}
                                        key={item._id || i}
                                        onClick={() => setSelectedGuestIndex(i)}
                                        style={{
                                            border: i === selectedGuestIndex ? '2px solid #dd783c' : '2px solid #bbb',
                                            position: 'relative',
                                        }}
                                    >
                                        <div className="reviews-scroll-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <div className="reviews-scroll-name">{item.name}</div>
                                                <div className="reviews-scroll-designation">
                                                    {item.designation.split('\n').map((line, idx) => (
                                                        <div key={idx}>{line}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Guest Testimonial Submission Form (admin only) */}
            {user && user.email === ADMIN_EMAIL && (
                <section className="guest-testimonial-section" style={{ maxWidth: 600, margin: '48px auto', background: '#fff8f2', borderRadius: 18, boxShadow: '0 2px 12px #0001', padding: 32 }}>
                    <h3 style={{ color: '#DD783C', fontFamily: 'Alex Brush, cursive', fontSize: 36, marginBottom: 18, textAlign: 'center' }}>Share Your Experience</h3>
                    <form onSubmit={handleGuestTestimonialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={guestForm.name}
                            onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                            required
                            style={{ padding: 12, borderRadius: 8, border: '1.5px solid #eceae7', fontSize: 18 }}
                        />
                        <input
                            type="text"
                            name="designation"
                            placeholder="Your Designation (e.g. Student, Professor)"
                            value={guestForm.designation}
                            onChange={e => setGuestForm({ ...guestForm, designation: e.target.value })}
                            required
                            style={{ padding: 12, borderRadius: 8, border: '1.5px solid #eceae7', fontSize: 18 }}
                        />
                        <textarea
                            name="text"
                            placeholder="Your Testimonial"
                            value={guestForm.text}
                            onChange={e => setGuestForm({ ...guestForm, text: e.target.value })}
                            required
                            rows={4}
                            style={{ padding: 12, borderRadius: 8, border: '1.5px solid #eceae7', fontSize: 18, resize: 'vertical' }}
                        />
                        <button
                            type="submit"
                            disabled={guestSubmitting}
                            style={{ background: '#DD783C', color: '#fff', fontSize: 20, fontWeight: 600, border: 'none', borderRadius: 8, padding: '14px 0', cursor: 'pointer', marginTop: 6, boxShadow: '0 2px 8px #DD783C22', transition: 'background 0.2s, color 0.2s' }}
                        >
                            {guestSubmitting ? 'Submitting...' : 'Submit Testimonial'}
                        </button>
                        {guestFormMsg && (
                            <div style={{ marginTop: 8, padding: 10, borderRadius: 6, background: guestFormMsg.startsWith('Thank') ? '#d4edda' : '#f8d7da', color: guestFormMsg.startsWith('Thank') ? '#155724' : '#721c24', border: guestFormMsg.startsWith('Thank') ? '1px solid #c3e6cb' : '1px solid #f5c6cb', textAlign: 'center', fontWeight: 500 }}>
                                {guestFormMsg}
                            </div>
                        )}
                    </form>
                </section>
            )}

            <>
                {/* Enhanced mobile and desktop styles for spacing and layout */}
                <style>{`
                @media (max-width: 600px) {
                  html, body, #root, .App, .main-content, .main-scrollable-content, .main-content-gap, .books-scroll-container, .quote-bg, .quote-frosted, .event-hero-img, .event-hero-img img, footer {
                    width: 100% !important;
                    min-width: 0 !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow-x: hidden !important;
                  }
                  .main-content-gap,
                  .books-scroll-container,
                  .quote-bg,
                  .quote-frosted,
                  .event-hero-img,
                  .event-hero-img img {
                    width: 100% !important;
                    max-width: 100% !important;
                    min-width: 0 !important;
                    margin: 0 !important;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                  }
                  .books-scroll-container > div {
                    min-width: 140px !important;
                    max-width: 100% !important;
                    padding: 8px !important;
                    font-size: 14px !important;
                  }
                  .books-scroll-container img {
                    width: 100% !important;
                    max-width: 100% !important;
                    height: auto !important;
                  }
                  .reviews-section-root,
                  .guest-testimonial-section {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                  }
                  .reviews-section-main {
                    width: 100% !important;
                    max-width: 100% !important;
                  }
                  /* Remove horizontal gap for flex containers */
                  .main-content-gap > div,
                  .books-scroll-container,
                  .reviews-section-main {
                    gap: 0 !important;
                  }
                 /* Prevent any child from overflowing viewport */
                 * {
                   box-sizing: border-box !important;
                   max-width: 100% !important;
                 }
                  body {
                    padding-bottom: 70px !important;
                  }
                  .main-content-gap {
                    margin-top: 50px !important;
                  }
                  footer {
                    display: block !important;
                    position: relative !important;
                    left: 0 !important;
                    bottom: 0 !important;
                    z-index: 100 !important;
                    padding: 10px 0 8px 0 !important;
                    background: #fff8f2 !important;
                    box-shadow: 0 -4px 16px #DD783C22 !important;
                    text-align: center !important;
                    border-top-left-radius: 12px !important;
                    border-top-right-radius: 12px !important;
                    font-size: 13px !important;
                  }
                 /* Constrain event carousel arrow button */
                 .event-arrow-btn {
                   position: absolute !important;
                   right: 8px !important;
                   left: auto !important;
                   top: 50% !important;
                   transform: translateY(-50%) !important;
                   width: 40px !important;
                   height: 40px !important;
                   z-index: 10 !important;
                   box-shadow: 0 2px 8px #DD783C22 !important;
                 }
                 /* Decorative images (leaves, overlays, etc) */
                 .decorative-img {
                   max-width: 100vw !important;
                   height: auto !important;
                   overflow-x: hidden !important;
                   position: relative !important;
                 }
                  .event-hero-img,
                  .event-hero-img {
                    width: 100% !important;
                    height: auto !important;
                    min-height: 0 !important;
                    max-width: 100% !important;
                    justify-content: center !important;
                    align-items: center !important;
                    overflow: hidden !important;
                  }
                  .event-hero-img img {
                    width: 100% !important;
                    height: auto !important;
                    max-width: 100% !important;
                    min-height: 0 !important;
                    object-fit: contain !important;
                    border-radius: 10px !important;
                    box-shadow: 0 2px 8px #DD783C22 !important;
                    margin: 0 auto !important;
                  }
                  .event-hero-img {
                    justify-content: center !important;
                    align-items: center !important;
                  }
                  .quote-bg,
                  .quote-frosted {
                    border-radius: 10px !important;
                    box-shadow: 0 2px 8px #DD783C22 !important;
                    max-width: 95vw !important;
                    height: 60px !important;
                    object-fit: cover !important;
                    margin: 0 auto !important;
                    padding: 0 !important;
                  }
                  .quote-frosted {
                    box-sizing: border-box !important;
                    padding: 6px 2px !important;
                    font-size: 12px !important;
                    min-height: 0 !important;
                    height: 60px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: center !important;
                    align-items: center !important;
                  }
                  .books-scroll-container {
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                    gap: 12px !important;
                  }
                  .books-scroll-container > div {
                    min-width: 180px !important;
                    max-width: 200px !important;
                    padding: 10px !important;
                    font-size: 14px !important;
                  }
                  .books-scroll-container img {
                    width: 120px !important;
                    height: 180px !important;
                  }
                  .reviews-section-title {
                    font-size: 28px !important;
                  }
                  .reviews-section-root {
                    margin-top: 24px !important;
                  }
                  .reviews-main-text {
                    font-size: 15px !important;
                  }
                  .reviews-scroll-name {
                    font-size: 13px !important;
                  }
                  .reviews-scroll-designation {
                    font-size: 12px !important;
                  }
                  .guest-testimonial-section {
                    max-width: 98vw !important;
                    padding: 12px !important;
                    font-size: 14px !important;
                  }
                  .guest-testimonial-section input,
                  .guest-testimonial-section textarea {
                    font-size: 13px !important;
                    padding: 8px !important;
                  }
                  .guest-testimonial-section button {
                    font-size: 15px !important;
                    padding: 10px 0 !important;
                  }
                  /* Explicit mobile styles for navbar buttons and icons */
                  .navbar-buttons, .navbar .login-btn, .navbar .contribute-btn {
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: center !important;
                    gap: 8px !important;
                    width: auto !important;
                    margin: 0 8px !important;
                  }
                  .navbar .login-btn, .navbar .contribute-btn {
                    font-size: 15px !important;
                    padding: 8px 16px !important;
                    border-radius: 8px !important;
                    min-width: 80px !important;
                    max-width: 120px !important;
                    display: inline-block !important;
                  }
                  .navbar .headphone-icon {
                    display: inline-block !important;
                    width: 28px !important;
                    height: 28px !important;
                    margin-left: 8px !important;
                  }
                  .navbar .new-text {
                    display: inline-block !important;
                    font-size: 13px !important;
                    color: #DD783C !important;
                    margin-left: 6px !important;
                  }
                }
                @media (min-width: 601px) {
                  .main-content-gap {
                    margin-top: 60px !important;
                  }
                }
              `}</style>
                <Footer />
            </>
        </div>

    );
}

export default Home;