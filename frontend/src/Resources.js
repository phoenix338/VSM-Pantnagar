import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { auth } from './firebase';
import './Videos.css'; // Reuse Videos styles for consistent look

const RENDER_API_URL = process.env.REACT_APP_API_URL;
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const Resources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResourceIndex, setSelectedResourceIndex] = useState(null);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ title: '', url: '' });
    const [submitting, setSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState('');
    const [apiUrl, setApiUrl] = useState(RENDER_API_URL);

    useEffect(() => {
        fetchResources();
        const unsubscribe = auth.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    const fetchResources = async () => {
        try {
            const res = await fetch(`${RENDER_API_URL}/resources`);
            if (res.ok) {
                const data = await res.json();
                setResources(data);
            }
        } catch (err) {
            console.log('Failed to fetch resources:', err.message);
        }
        setLoading(false);
    };

    const prevResource = () => {
        setSelectedResourceIndex((prev) =>
            prev === 0 ? resources.length - 1 : prev - 1
        );
    };

    const nextResource = () => {
        setSelectedResourceIndex((prev) =>
            prev === resources.length - 1 ? 0 : prev + 1
        );
    };

    if (loading) return (
        <>
            <Navbar />
            <div className="videos-loading">Loading resources...</div>
        </>
    );

    if (!resources.length) return (
        <>
            <Navbar />
            <div className="videos-loading">No resources found.</div>
            {/* Admin Form, even if no resources yet */}
            {user !== null && user.email === ADMIN_EMAIL && (
                <div className="videos-admin-form">
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        setSubmitting(true);
                        setFormMsg('');
                        try {
                            const adminPassword = prompt('Enter admin password:');
                            if (!adminPassword) throw new Error('Password is required');
                            if (!form.title || !form.url) throw new Error('Title and URL are required');
                            // No need to convert YouTube URL here; handled by getYouTubeEmbedUrl at render time
                            const res = await fetch(`${apiUrl}/resources`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    email: user.email,
                                    password: adminPassword
                                },
                                body: JSON.stringify(form)
                            });
                            if (!res.ok) throw new Error('Failed to add resource');
                            setForm({ title: '', url: '' });
                            setFormMsg('Resource added!');
                            fetchResources();
                        } catch (err) {
                            setFormMsg('Error: ' + err.message);
                        }
                        setSubmitting(false);
                    }}>
                        <h3>Add New Resource</h3>
                        <input
                            type="text"
                            placeholder="Resource Title"
                            value={form.title}
                            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                            required
                        />
                        <input
                            type="url"
                            placeholder="Resource URL (e.g. YouTube, Google Drive, etc)"
                            value={form.url}
                            onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))}
                            required
                        />
                        <button type="submit" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Resource'}
                        </button>
                        {formMsg && <p className="form-msg">{formMsg}</p>}
                    </form>
                </div>
            )}
        </>
    );

    const getYouTubeEmbedUrl = (url) => {
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
    };

    // Carousel View for selected resource (match Videos gallery exactly)
    if (selectedResourceIndex !== null) {
        const resource = resources[selectedResourceIndex];
        const prevResourceData = resources[(selectedResourceIndex - 1 + resources.length) % resources.length];
        const nextResourceData = resources[(selectedResourceIndex + 1) % resources.length];
        return (
            <>
                <Navbar />
                <div className="videos-page">
                    <div className="videos-carousel-view">
                        <div className="videos-carousel-header">
                            <button className="videos-back-btn" onClick={() => setSelectedResourceIndex(null)}>
                                <img src={require('./assets/lets-icons_back.png')} alt="Back" />
                                Back
                            </button>
                            <h1 className="videos-heading">Resources</h1>
                            <div className="videos-header-nav">
                                <button
                                    className="videos-nav-btn"
                                    onClick={prevResource}
                                >
                                    <img src={require('./assets/lucide_move-left.png')} alt="Previous" />
                                </button>
                                <button
                                    className="videos-nav-btn"
                                    onClick={nextResource}
                                >
                                    <img src={require('./assets/lucide_move-left.png')} alt="Next" />
                                </button>
                            </div>
                        </div>
                        <div className="videos-carousel-container">
                            {/* Previous Resource */}
                            <div className="videos-side-video prev" onClick={prevResource}>
                                <iframe
                                    src={getYouTubeEmbedUrl(prevResourceData.url)}
                                    title="Previous"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            {/* Center Resource */}
                            <div className="videos-center-video">
                                <iframe
                                    src={getYouTubeEmbedUrl(resource.url)}
                                    title={resource.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                                <div className="videos-video-details">
                                    <h3>{resource.title}</h3>
                                </div>
                            </div>
                            {/* Next Resource */}
                            <div className="videos-side-video next" onClick={nextResource}>
                                <iframe
                                    src={getYouTubeEmbedUrl(nextResourceData.url)}
                                    title="Next"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Grid View
    return (
        <>
            <Navbar />
            <div className="videos-page">
                <h1 className="videos-heading">Resources</h1>
                <div className="videos-grid">
                    {resources.map((resource, idx) => (
                        <div className="video-container" key={resource._id || idx} onClick={() => setSelectedResourceIndex(idx)}>
                            <div className="video-wrapper">
                                <iframe
                                    src={getYouTubeEmbedUrl(resource.url)}
                                    title={resource.title}
                                    className="video-iframe"
                                    allowFullScreen
                                />
                            </div>
                            <div className="video-overlay">
                                <div className="video-name">{resource.title}</div>
                                <div className="video-desc">{resource.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Admin Form */}
                {user !== null && user.email === ADMIN_EMAIL && (
                    <div className="videos-admin-form">
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setSubmitting(true);
                            setFormMsg('');
                            try {
                                const adminPassword = prompt('Enter admin password:');
                                if (!adminPassword) throw new Error('Password is required');
                                if (!form.title || !form.url) throw new Error('Title and URL are required');
                                const res = await fetch(`${apiUrl}/resources`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        email: user.email,
                                        password: adminPassword
                                    },
                                    body: JSON.stringify(form)
                                });
                                if (!res.ok) throw new Error('Failed to add resource');
                                setForm({ title: '', url: '' });
                                setFormMsg('Resource added!');
                                fetchResources();
                            } catch (err) {
                                setFormMsg('Error: ' + err.message);
                            }
                            setSubmitting(false);
                        }}>
                            <h3>Add New Resource</h3>
                            <input
                                type="text"
                                placeholder="Resource Title"
                                value={form.title}
                                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                required
                            />
                            <input
                                type="url"
                                placeholder="Resource URL (e.g. YouTube, Google Drive, etc)"
                                value={form.url}
                                onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))}
                                required
                            />
                            <button type="submit" disabled={submitting}>
                                {submitting ? 'Adding...' : 'Add Resource'}
                            </button>
                            {formMsg && <p className="form-msg">{formMsg}</p>}
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default Resources;
