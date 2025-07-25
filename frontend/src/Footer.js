import React from 'react';
import { FaInstagram, FaFacebook, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import './Footer.css';
import backToTopImg from './assets/backtotop.png';

const Footer = () => {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-container">
      <div className="footer-links-row">
        <div className="footer-col">
          <div>Our Impact</div>
          <div>Our Projects</div>
          <div>Stories</div>
          <div>Contact Us</div>
        </div>
        <div className="footer-col">
          <div>Get Involved</div>
          <div>Books</div>
          <div>Events</div>
        </div>
        <div className="footer-col right-col">
          <div><b>Samadhan<span className="footer-asterisk">*</span></b></div>
          <div><b>Calender<span className="footer-asterisk">*</span></b></div>
          <div><b>Blog<span className="footer-asterisk">*</span></b></div>
        </div>
      </div>
      <div className="footer-bottom-wrapper">
        <div className="footer-bottom-row">
          <div className="footer-backtotop" onClick={handleBackToTop} role="button" tabIndex={0} aria-label="Back to top" onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') handleBackToTop(); }}>
            <div className="footer-arrow-circle">
              <img src={backToTopImg} alt="Back To Top" style={{ width: 64, height: 64, objectFit: 'contain' }} />
            </div>
            <span>Back To Top</span>
          </div>
          <div className="footer-social">
            <b>Don’t miss the chance to be a part of</b>
            <FaInstagram className="footer-icon" />
            <FaFacebook className="footer-icon" />
            <FaXTwitter className="footer-icon" />
            <FaYoutube className="footer-icon" />
          </div>
        </div>
        <div className="footer-copyright">
          <span style={{ marginRight: 8 }}>&copy;</span> All Rights Reserved | Developed By ....
        </div>
      </div>
    </footer>
  );
};

export default Footer; 