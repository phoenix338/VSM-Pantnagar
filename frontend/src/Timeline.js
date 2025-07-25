import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CircularTimeline from './CircularTimeline';
import timelineGif from './assets/timeline.gif';
import './Timeline.css';

const Timeline = () => (
    <div className="timeline-root">
        <Navbar />
        <div className="timeline-hero-section">
            <img src={timelineGif} alt="Timeline" className="timeline-gif" />
        </div>
        <div className="timeline-heading-section">
            <h1 className="timeline-heading">Timeline</h1>
        </div>
        <CircularTimeline />
        <Footer />
    </div>
);

export default Timeline; 