import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const HomeInitiatives = () => {
    const [initiatives, setInitiatives] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState({});

    useEffect(() => {
        fetch(`${API_URL}/initiatives`)
            .then(res => res.json())
            .then(data => {
                setInitiatives(data);
                // Initialize currentImageIndex for all initiatives
                const initialIndexes = {};
                data.forEach(item => {
                    initialIndexes[item._id] = 0;
                });
                setCurrentImageIndex(initialIndexes);
            });
    }, []);

    // Auto-advance slideshow for expanded initiatives
    useEffect(() => {
        const intervals = {};

        initiatives.forEach(item => {
            if (expanded === initiatives.indexOf(item) && item.imageUrls && item.imageUrls.length > 1) {
                intervals[item._id] = setInterval(() => {
                    setCurrentImageIndex(prev => ({
                        ...prev,
                        [item._id]: (prev[item._id] + 1) % item.imageUrls.length
                    }));
                }, 5000);
            }
        });

        return () => {
            Object.values(intervals).forEach(interval => clearInterval(interval));
        };
    }, [expanded, initiatives]);

    const handleToggle = idx => {
        setExpanded(expanded === idx ? null : idx);
    };

    return (
        <section className="home-initiatives-section">
            <h2 className="home-initiatives-title">Our Events</h2>
            <div className="home-initiatives-list">
                {initiatives.map((item, idx) => (
                    <div
                        className={`home-initiative-card${expanded === idx ? ' expanded' : ''}`}
                        key={item._id || idx}
                    >
                        <div className="home-initiative-header" onClick={() => handleToggle(idx)}>
                            <div className="home-initiative-heading">{item.title || `Initiative ${idx + 1}`}</div>
                            <svg
                                className={`home-initiative-icon ${expanded === idx ? 'expanded' : ''}`}
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        {expanded === idx && (
                            <div className={`home-initiative-details${idx % 2 === 1 ? ' reverse' : ''}`}>
                                {(item.imageUrls && item.imageUrls.length > 0) || item.imageUrl ? (
                                    <div className="home-initiative-image-wrapper">
                                        {item.imageUrls && item.imageUrls.length > 1 ? (
                                            <div className="home-initiative-slideshow">
                                                <img
                                                    src={item.imageUrls[currentImageIndex[item._id] || 0]}
                                                    alt="Event"
                                                    className="home-initiative-image"
                                                />
                                            </div>
                                        ) : (
                                            <img
                                                src={item.imageUrls && item.imageUrls.length > 0
                                                    ? item.imageUrls[0]
                                                    : item.imageUrl}
                                                alt="Event"
                                                className="home-initiative-image"
                                            />
                                        )}
                                    </div>
                                ) : null}
                                <div className="home-initiative-summary">
                                    {item.text && (
                                        <p style={{ marginBottom: 8, fontSize: '1.05em', lineHeight: 1.4, textAlign: 'left' }}>
                                            {item.text
                                                .match(/[^.?!]+[.?!]+[\])'"`'"`]*|.+/g)
                                                .filter(s => s.trim())
                                                .slice(0, 3)
                                                .map((sentence, i) => sentence.trim())
                                                .join(' ')}
                                        </p>
                                    )}
                                    <Link to={`/our-events/${item._id}`} className="home-initiative-readmore">
                                        Read More &rarr;
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HomeInitiatives; 