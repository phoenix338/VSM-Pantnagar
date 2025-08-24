import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import './Footer.css';
import backToTopImg from './assets/backtotop.png';
import { useEffect, useState } from 'react';
const Footer = () => {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFooterLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [resources, setResources] = useState({});
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch(process.env.REACT_APP_API_URL + '/resources');
        if (res.ok) {
          const data = await res.json();
          setResources(data);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchResources();
  }, []);
  // const newsletter = resources.eNewsletters
  return (
    <footer className="footer-container">
      <div className="footer-links-row">
        <div className="footer-col">
          <Link to="/our-impact" className="footer-link" onClick={handleFooterLinkClick}>Our Impact</Link>
          <Link to="/our-events" className="footer-link" onClick={handleFooterLinkClick}>Events Board</Link>

          <Link to="/contact" className="footer-link" onClick={handleFooterLinkClick}>Contact Us</Link>
        </div>
        <div className="footer-col">
          <Link to="/contribute" className="footer-link" onClick={handleFooterLinkClick}>Contribute</Link>
          <Link to="/books" className="footer-link" onClick={handleFooterLinkClick}>Our Publications</Link>
          {/* <a href={newsletter.pdfUrl}
            download={newsletter.title ? `${newsletter.title.replace(/\s+/g, '_')}.pdf` : 'newsletter.pdf'} className="footer-link" onClick={handleFooterLinkClick}>Newsletters</a> */}
          {resources.eNewsletters?.length > 0 && (
            <a
              href={resources.eNewsletters[0].pdfUrl}
              download={
                resources.eNewsletters[0].title
                  ? `${resources.eNewsletters[0].title.replace(/\s+/g, '_')}.pdf`
                  : 'newsletter.pdf'
              }
              className="footer-link"
            >
              Newsletters
            </a>
          )}
        </div>
        <div className="footer-col right-col">
          <Link to="/#calendar" className="footer-link" onClick={handleFooterLinkClick}>Calendar</Link>
          <Link to="https://www.youthariseawake.org/" className="footer-link" onClick={handleFooterLinkClick} target='_blank'>Yuva</Link>
          <Link to="https://vsmmotivation.in/" className="footer-link" onClick={handleFooterLinkClick} target='_blank'>VSM Motivation</Link>

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
            <b>Don't miss the chance to be a part of</b>
            <FaInstagram className="footer-icon" />
            <FaFacebook className="footer-icon" />
            {/* <FaXTwitter className="footer-icon" /> */}
            <FaYoutube className="footer-icon" />
          </div>
        </div>
        <div className="footer-copyright">
          <span style={{ marginRight: 8 }}>&copy;</span> All Rights Reserved | Developed By ....
        </div>
      </div>
      {/* Responsive styles for mobile */}
      <style>{`
        @media (max-width: 700px) {
          .footer-container {
            padding: 12px 0 !important;
          }
          .footer-links-row {
            flex-direction: column !important;
            align-items: center !important;
            gap: 18px !important;
          }
          .footer-col {
            width: 100vw !important;
            max-width: 350px !important;
            text-align: center !important;
            margin: 0 auto 12px auto !important;
            font-size: 1rem !important;
          }
          .footer-col.right-col {
            margin-bottom: 0 !important;
          }
          .footer-link {
            font-size: 1rem !important;
            padding: 6px 0 !important;
            display: block !important;
          }
          .footer-bottom-wrapper {
            padding: 0 !important;
          }
          .footer-bottom-row {
            flex-direction: column !important;
            align-items: center !important;
            gap: 12px !important;
          }
          .footer-backtotop {
            flex-direction: row !important;
            align-items: center !important;
            gap: 8px !important;
            font-size: 1rem !important;
          }
          .footer-arrow-circle img {
            width: 40px !important;
            height: 40px !important;
          }
          .footer-social {
            font-size: 1rem !important;
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
          }
          .footer-icon {
            font-size: 22px !important;
          }
          .footer-copyright {
            font-size: 0.95rem !important;
            text-align: center !important;
            margin-top: 10px !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer; 