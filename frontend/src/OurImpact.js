import React from 'react';
import Navbar from './Navbar';
import './OurImpact.css';
import impactGif from './assets/impact.gif';
import ImpactStats from './ImpactStats';
import NewsSection from './NewsSection';
import ReviewsSection from './ReviewsSection';
import Footer from './Footer';
import { useEffect } from 'react';
const OurImpact = () => {
    useEffect(() => {
        document.title = "Our Impact | VSM";
    }, []);

    return (
        <div className="our-impact-root">
            <Navbar />
            <section className="our-impact-hero">
                <img src={impactGif} alt="Impact" className="our-impact-gif" />
            </section>
            <div className="about-container">
                <h2>About Us</h2>
                <p className='about-heading'>
                    Vivekanand Swadhyay Mandal (VSM): A Mission of Youth Empowerment and Nation Building
                </p>
                <p className='about-text'>
                    {/* your long text here */}
                </p>
            </div>
            <section className="our-impact-heading-section">
                <h1 className="our-impact-heading">
                    <span className="our-impact-heading-main">Impacts:</span> Flickers Of Change
                </h1>
            </section>
            <ImpactStats />
            <NewsSection />
            <ReviewsSection />
            <Footer />
        </div>
    );
};

export default OurImpact; 