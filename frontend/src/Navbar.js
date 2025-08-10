import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './assets/VSM-icon.png';
import headphones from './assets/hugeicons_customer-support.png';
import { auth } from './firebase';
import './Home.css';

const Navbar = (props) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // Mobile dropdown states
  const [aboutOpen, setAboutOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.displayName) {
        setUserName(user.displayName);
      } else {
        setUserName('');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleHomeClick = (e) => {
    e.preventDefault();
    navigate('/', { state: { skipIntro: true } });
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (props.resetHome) {
      props.resetHome();
    }
    navigate('/', { state: { skipIntro: false } });
  };

  return (
    <>
      {/* Top grey navbar */}
      <div style={{ background: '#DCDCDC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 8px' : '0 2vw', position: 'fixed', top: 0, left: 0, width: '100vw', height: 44, zIndex: 1000, boxSizing: 'border-box' }}>
        <div style={{ flex: 1 }} />
        {/* Centered Search Bar */}
        {!isMobile && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#444', borderRadius: 20, padding: '0 14px', height: 28, minWidth: 180 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="Search"
                style={{ background: '#444', border: 'none', borderRadius: 20, color: '#fff', padding: '2px 8px', width: 110, outline: 'none', fontSize: 13 }}
                className="search-input"
              />
            </div>
          </div>
        )}
        {/* Right side: User name or New and headphones */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <span style={{ fontFamily: 'Freehand, cursive', fontStyle: 'normal', color: '#FF0000', fontWeight: 500, fontSize: 22, marginRight: 10 }}>
            {userName ? userName : 'New'}
          </span>
          <Link to="/contact" className="navbar-contact-link" style={{ color: '#DD783C', fontFamily: 'open sans', fontWeight: 400, fontSize: 18, textDecoration: 'none', marginLeft: 8 }}>
            Contact Us
          </Link>
        </div>
      </div>
      {/* Main white navbar */}
      <div style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 8px' : '0 2vw', position: 'fixed', top: 44, left: 0, width: '100vw', height: 64, zIndex: 1001, boxSizing: 'border-box', boxShadow: '0 2px 6px #0001' }}>
        {/* Logo (overlapping both navbars) */}
        <img
          src={logo}
          alt="Logo"
          style={{ height: isMobile ? 60 : 110, width: isMobile ? 60 : 110, borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: isMobile ? 8 : -25, left: isMobile ? 8 : 18, zIndex: 1101, background: '#fff', boxShadow: '0 1px 4px #0001', border: '2px solid #fff', cursor: 'pointer', pointerEvents: isMobile ? 'none' : 'auto' }}
          onClick={handleLogoClick}
        />
        {/* Hamburger for mobile - centered vertically in white navbar */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <button
              style={{ background: 'none', border: 'none', fontSize: 32, color: '#DD783C', cursor: 'pointer', marginLeft: 80, zIndex: 1301, height: 64, display: 'flex', alignItems: 'center' }}
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Open menu"
            >
              <svg width="32" height="32" viewBox="0 0 32 32"><rect y="6" width="32" height="4" rx="2" fill="#DD783C" /><rect y="14" width="32" height="4" rx="2" fill="#DD783C" /><rect y="22" width="32" height="4" rx="2" fill="#DD783C" /></svg>
            </button>
          </div>
        )}
        {/* Nav Links */}
        {!isMobile ? (
          <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, fontFamily: 'Arimo, sans-serif', fontStyle: 'normal', fontWeight: 400, color: '#DD783C', fontSize: 15, gap: 15 }}>
            <li style={{ cursor: 'pointer', marginLeft: 130, position: 'relative' }} className="navbar-item dropdown">
              <span className="dropdown-label">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }} onClick={handleHomeClick}>Home</Link>
              </span>
            </li>
            {/* About Us Dropdown */}
            <li style={{ cursor: 'pointer', position: 'relative' }} className="navbar-item dropdown">
              <span className="dropdown-label">
                About Us <span style={{ fontSize: 13 }}><svg width="16" height="16" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginLeft: 0 }}><path d="M7 10l5 5 5-5" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              </span>
              <div className="dropdown-menu">
                <Link to="/our-impact" className="dropdown-item">Our Impact</Link>
                <Link to="/meet-our-team" className="dropdown-item">Meet Our Team</Link>
                <Link to="/timeline" className="dropdown-item">Timeline</Link>
              </div>
            </li>
            {/* Events Dropdown */}
            <li style={{ cursor: 'pointer', position: 'relative' }} className="navbar-item dropdown">
              <span className="dropdown-label">
                Events <span style={{ fontSize: 13 }}><svg width="16" height="16" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginLeft: 0 }}><path d="M7 10l5 5 5-5" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              </span>
              <div className="dropdown-menu">
                <Link to="/our-events" className="dropdown-item">Our Events</Link>
                <Link to="/events/upcoming" className="dropdown-item">Upcoming Events</Link>
                <Link to="/events/upcoming" state={{ scrollTo: 'previous' }} className="dropdown-item">Previous Events</Link>
                <a href="https://www.youthariseawake.org/" target="_blank" rel="noopener noreferrer" className="dropdown-item">YUVA</a>
              </div>
            </li>
            {/* Gallery Dropdown */}
            <li style={{ cursor: 'pointer', position: 'relative' }} className="navbar-item dropdown">
              <span className="dropdown-label">
                Memory Wall <span style={{ fontSize: 13 }}><svg width="16" height="16" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginLeft: 0 }}><path d="M7 10l5 5 5-5" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              </span>
              <div className="dropdown-menu">
                <Link to="/gallery/images" className="dropdown-item">Frozen Moments</Link>
                <Link to="/gallery/videos" className="dropdown-item">Flowing Moments</Link>
              </div>
            </li>
            <li style={{ cursor: 'pointer' }}><Link to="/books" style={{ textDecoration: 'none', color: 'inherit' }}>Books</Link></li>
            <li style={{ cursor: 'pointer' }}><Link to="/resources" style={{ textDecoration: 'none', color: 'inherit' }}>Resources</Link></li>
            <li style={{ cursor: 'pointer' }}>
              <a
                href="https://vsmmotivation.in/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                VSM Motivation
              </a>
            </li>
          </ul>
        ) : (
          mobileMenuOpen && (
            <div style={{ position: 'absolute', top: 108, left: 0, width: '100vw', background: '#fff', boxShadow: '0 2px 8px #0002', zIndex: 1300, padding: '0', right: 'unset', minWidth: '100vw' }}>
              <ul style={{ display: 'flex', flexDirection: 'column', listStyle: 'none', margin: 0, padding: 0, fontFamily: 'Arimo, sans-serif', fontWeight: 400, color: '#DD783C', fontSize: 15, gap: 4 }}>
                <li style={{ padding: '12px 24px', borderBottom: '1px solid #eee' }}><span onClick={(e) => { handleHomeClick(e); setMobileMenuOpen(false); }} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>Home</span></li>
                {/* About Us Dropdown */}
                <li style={{ padding: '12px 24px', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setAboutOpen((open) => !open)}>
                    About Us
                    <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginLeft: 6 }}><path d="M7 10l5 5 5-5" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {aboutOpen && (
                    <ul style={{ listStyle: 'none', paddingLeft: 16, marginTop: 8 }}>
                      <li><Link to="/our-impact" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setMobileMenuOpen(false)}>Our Impact</Link></li>
                      <li><Link to="/meet-our-team" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setMobileMenuOpen(false)}>Meet Our Team</Link></li>
                      <li><Link to="/timeline" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setMobileMenuOpen(false)}>Timeline</Link></li>
                    </ul>
                  )}
                </li>
                {/* Events Dropdown */}
                <li style={{ padding: '12px 24px', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setEventsOpen((open) => !open)}>
                    Events
                    <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginLeft: 6 }}><path d="M7 10l5 5 5-5" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {eventsOpen && (
                    <ul style={{ listStyle: 'none', paddingLeft: 16, marginTop: 8 }}>
                      <li><Link to="/our-events" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setMobileMenuOpen(false)}>Our Events</Link></li>
                      <li><Link to="/events/upcoming" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setMobileMenuOpen(false)}>Upcoming Events</Link></li>
                      <li><Link to="/events/upcoming" state={{ scrollTo: 'previous' }} style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setMobileMenuOpen(false)}>Previous Events</Link></li>
                      <li><a href="https://www.youthariseawake.org/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setMobileMenuOpen(false)}>YUVA</a></li>
                    </ul>
                  )}
                </li>
                {/* Gallery Dropdown */}
                <li style={{ padding: '12px 24px', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setGalleryOpen((open) => !open)}>
                    Gallery
                    <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginLeft: 6 }}><path d="M7 10l5 5 5-5" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {galleryOpen && (
                    <ul style={{ listStyle: 'none', paddingLeft: 16, marginTop: 8 }}>
                      <li><Link to="/gallery/images" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setMobileMenuOpen(false)}>Images</Link></li>
                      <li><Link to="/gallery/videos" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setMobileMenuOpen(false)}>Videos</Link></li>
                    </ul>
                  )}
                </li>
                <li style={{ padding: '12px 24px', borderBottom: '1px solid #eee' }}><Link to="/books" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setMobileMenuOpen(false)}>Books</Link></li>
                <li style={{ padding: '12px 24px', borderBottom: '1px solid #eee' }}><Link to="/resources" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setMobileMenuOpen(false)}>Resources</Link></li>
                <li style={{ padding: '12px 24px', borderBottom: '1px solid #eee' }}><a href="https://vsmmotivation.in/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setMobileMenuOpen(false)}>VSM Motivation</a></li>
              </ul>
            </div>
          )
        )}
        {/* Right side: Login and Contribute buttons (always visible, not in hamburger) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: isMobile ? 'auto' : undefined }}>
          <Link to="/login">
            <button className="login-btn" style={{ fontSize: isMobile ? 14 : 16, padding: isMobile ? '6px 16px' : '10px 24px', borderRadius: 8 }}>Login</button>
          </Link>
          <Link to="/contribute">
            <button className="contribute-btn" style={{ fontSize: isMobile ? 13 : 16, padding: isMobile ? '5px 12px' : '10px 24px', borderRadius: 8, maxWidth: isMobile ? '100px' : undefined, whiteSpace: 'normal', overflowWrap: 'break-word', marginRight: isMobile ? '8px' : undefined }}>Contribute</button>
          </Link>
        </div>
      </div>
      // ...existing code...
    </>
  );
};

export default Navbar;