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
            <h2 className="home-initiatives-title">Our Initiatives</h2>
            <div className="home-initiatives-list">
                {initiatives.map((item, idx) => (
                    <div
                        className={`home-initiative-card${expanded === idx ? ' expanded' : ''}`}
                        key={item._id || idx}
                        onClick={() => handleToggle(idx)}
                    >
                        <div className="home-initiative-heading">{`Initiative ${idx + 1}`}</div>
                        {expanded === idx && (
                            <div className={`home-initiative-details${idx % 2 === 1 ? ' reverse' : ''}`}>
                                {item.imageUrl && (
                                    <div className="home-initiative-image-wrapper">
                                        <img src={item.imageUrl} alt="Initiative" className="home-initiative-image" />
                                    </div>
                                )}
                                <div className="home-initiative-summary">
                                    <div className="home-initiative-title" style={{ fontWeight: 600, fontSize: '1.3em', marginBottom: 8 }}>{item.title}</div>
                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                        {item.text &&
                                            item.text
                                                .match(/[^.?!]+[.?!]+[\])'"`’”]*|.+/g)
                                                .filter(s => s.trim())
                                                .slice(0, 3)
                                                .map((sentence, i) => (
                                                    <li key={i} style={{ marginBottom: 4, fontSize: '1.05em', lineHeight: 1.4, textAlign: 'left' }}>{sentence.trim()}</li>
                                                ))}
                                    </ul>
                                    <Link to="/our-initiative" className="home-initiative-readmore">
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