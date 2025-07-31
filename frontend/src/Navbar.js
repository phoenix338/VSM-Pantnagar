import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './assets/VSM-icon.png';
import headphones from './assets/hugeicons_customer-support.png';
import { auth } from './firebase';
import './Home.css';
const Navbar = (props) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

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

  return (
    <>
      {/* Top grey navbar */}
      <div style={{ background: '#DCDCDC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2vw', position: 'fixed', top: 0, left: 0, width: '100vw', height: 44, zIndex: 1000, boxSizing: 'border-box' }}>
        <div style={{ flex: 1 }} />
        {/* Centered Search Bar */}
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
        {/* Right side: User name or New and headphones */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <span style={{ fontFamily: 'Freehand, cursive', fontStyle: 'normal', color: '#FF0000', fontWeight: 500, fontSize: 22, marginRight: 10 }}>
            {userName ? userName : 'New'}
          </span>
          <Link to="/contact" className="navbar-headphone-link">
            <img
              src={headphones}
              alt="Customer Support"
            />
          </Link>
        </div>
      </div>
      {/* Main white navbar */}
      <div style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2vw', position: 'fixed', top: 44, left: 0, width: '100vw', height: 64, zIndex: 1001, boxSizing: 'border-box', boxShadow: '0 2px 6px #0001' }}>
        {/* Logo (overlapping both navbars) */}
        <img src={logo} alt="Logo" style={{ height: 110, width: 110, borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: -30, left: 18, zIndex: 1101, background: '#fff', boxShadow: '0 1px 4px #0001', border: '2px solid #fff' }} />
        {/* Nav Links */}
        <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, fontFamily: 'Arimo, sans-serif', fontStyle: 'normal', fontWeight: 400, color: '#DD783C', fontSize: 15, gap: 15 }}>
          <li style={{ cursor: 'pointer', marginLeft: 130 }}>
            <span onClick={handleHomeClick} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>Home</span>
          </li><li style={{ cursor: 'pointer', position: 'relative' }} className="navbar-item dropdown">
            <span className="dropdown-label">
              About us <span style={{ fontSize: 13 }}><svg width="16" height="16" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginLeft: 0 }}><path d="M7 10l5 5 5-5" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            </span>
            <div className="dropdown-menu">
              <Link to="/our-initiative" className="dropdown-item">Our Initiative</Link>
              <Link to="/our-impact" className="dropdown-item">Our Impact</Link>
              <Link to="/meet-our-team" className="dropdown-item">Meet our Team</Link>
              <Link to="/timeline" className="dropdown-item">Timeline</Link>
            </div>
          </li><li style={{ cursor: 'pointer', position: 'relative' }} className="navbar-item dropdown">
            <span className="dropdown-label">
              Events <span style={{ fontSize: 13 }}><svg width="16" height="16" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginLeft: 0 }}><path d="M7 10l5 5 5-5" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            </span>
            <div className="dropdown-menu">
              <Link to="/events/upcoming" className="dropdown-item">Upcoming Events</Link>
              <Link to="/events/previous" className="dropdown-item">Previous Events</Link>
            </div>
          </li><li style={{ cursor: 'pointer', position: 'relative' }} className="navbar-item dropdown">
            <span className="dropdown-label">
              Gallery <span style={{ fontSize: 13 }}><svg width="16" height="16" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginLeft: 0 }}><path d="M7 10l5 5 5-5" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            </span>
            <div className="dropdown-menu">
              <Link to="/gallery/images" className="dropdown-item">Images</Link>
              <Link to="/gallery/videos" className="dropdown-item">Videos</Link>
            </div>
          </li><li style={{ cursor: 'pointer' }}><Link to="/books" style={{ textDecoration: 'none', color: 'inherit' }}>Books</Link></li><li style={{ cursor: 'pointer' }}>Resources</li><li style={{ cursor: 'pointer' }}>VSM Motivation</li>
        </ul>
        {/* Right side: Login and Contribute buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/login">
            <button className="login-btn" >Login</button>
          </Link>
          <button className="contribute-btn" >Contribute</button>
        </div>
      </div>
    </>
  );
};

export default Navbar; 