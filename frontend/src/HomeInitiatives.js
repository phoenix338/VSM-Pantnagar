import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const HomeInitiatives = () => {
    const [initiatives, setInitiatives] = useState([]);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/initiatives`)
            .then(res => res.json())
            .then(data => setInitiatives(data));
    }, []);

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
                        onClick={() => handleToggle(idx)}
                    >
                        <div className="home-initiative-heading">{item.title || `Initiative ${idx + 1}`}</div>
                        {expanded === idx && (
                            <div className={`home-initiative-details${idx % 2 === 1 ? ' reverse' : ''}`}>
                                {item.imageUrl && (
                                    <div className="home-initiative-image-wrapper">
                                        <img src={item.imageUrl} alt="Initiative" className="home-initiative-image" />
                                    </div>
                                )}
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