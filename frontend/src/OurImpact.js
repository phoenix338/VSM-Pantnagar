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
    useEffect(() => { document.title = "Our Impact | VSM"; }, []);
    return (
        <div className="our-impact-root">
            <Navbar />
            <section className="our-impact-hero">
                <video src={require('./assets/new-ourimpact.mp4')} autoPlay loop muted playsInline />
            </section> <div className="about-container">
                <h2>About Us</h2>
                <p className='about-heading'> Vivekanand Swadhyay Mandal (VSM): A Mission of Youth Empowerment and Nation Building </p>
                <p className='about-text'>
                    Established in 1999, Vivekanand Swadhyay Mandal (VSM) emerged with a visionary mission, to transform the landscape of higher education in India by fostering man-making and character-building initiatives. Rooted in the ideals of Swami Vivekananda and inspired by the mentorship of Bharat Ratna Shri Nanaji Deshmukh, the movement was founded under the leadership of Dr. Shivendra Kumar Kashyap at Pantnagar University. Dr. Kashyap envisioned a scientific and transformative model of youth empowerment, driven by the urgency to harness India’s demographic dividend. This vision laid the foundation for VSM’s nationwide movement, a Yagna committed to instilling the spirit of <em>Nation First</em> in the hearts and minds of youth across higher education institutions. As VSM’s impact deepened, it touched the lives of hundreds, nurturing them into VSM Youth Leaders. The organization inspires students across university campuses to listen to their inner calling, understand the purpose of their existence, and rise to serve a greater cause. VSM’s mission is to kindle compassion in young hearts, fostering a heightened sense of social responsibility. It cultivates servant leadership among today’s youth, enabling them to become valuable human resources for nation-building. Simultaneously, it promotes a deeper appreciation of Indian philosophy, culture, and values. At its core, VSM is committed to revitalizing the timeless humanitarian principles and national character that form the backbone of India’s rich heritage.

                </p> </div>
            <section className="our-impact-heading-section">
                <h1 className="our-impact-heading">
                    <span className="our-impact-heading-main">Impacts:</span> Flickers Of Change </h1>
            </section> <ImpactStats /> <NewsSection /> <ReviewsSection /> <Footer />
        </div>);
}; export default OurImpact;