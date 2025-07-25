import React from 'react';
import Navbar from './Navbar';
import './OurImpact.css';
import impactGif from './assets/impact.gif';
import ImpactStats from './ImpactStats';
import NewsSection from './NewsSection';
import ReviewsSection from './ReviewsSection';
import Footer from './Footer';

const OurImpact = () => (
    <div className="our-impact-root">
        <Navbar />
        <section className="our-impact-hero">
            <img src={impactGif} alt="Impact" className="our-impact-gif" />
        </section>
        <section className="our-impact-heading-section">
            <h1 className="our-impact-heading">
                <span className="our-impact-heading-main">Impacts:</span> Flickers of Change
            </h1>
        </section>
        <section className="our-impact-explore-section">
            <div className="our-impact-explore-text">
                Explore the events to transform the<br />society into
            </div>
        </section>
        <ImpactStats />
        <NewsSection />
        <ReviewsSection />
        <Footer />
    </div>
);

export default OurImpact; 