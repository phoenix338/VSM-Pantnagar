import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { auth } from './firebase';
import './Videos.css';

const RENDER_API_URL = process.env.REACT_APP_API_URL;
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const Videos = () => {
    const [videos, setVideos] = useState([]);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ title: '', videoUrl: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState('');
    const [apiUrl, setApiUrl] = useState(RENDER_API_URL);
    const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);

    useEffect(() => {
        fetchVideos();
        const unsubscribe = auth.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    const fetchVideos = async () => {
        // Try localhost first, then fall back to Render
        const urls = [RENDER_API_URL];

        for (const url of urls) {
            try {
                const res = await fetch(`${url}/videos`);
                if (res.ok) {
                    const data = await res.json();
                    setVideos(data);
                    setApiUrl(url);
                    break;
                }
            } catch (err) {
                console.log(`Failed to fetch from ${url}:`, err.message);
                continue;
            }
        }
        setLoading(false);
    };

    const isAdmin = user && user.email === ADMIN_EMAIL;

    const handleAdd = async e => {
        e.preventDefault();
        setSubmitting(true);
        setFormMsg('');
        try {
            const adminPassword = prompt('Enter admin password:');
            if (!adminPassword) throw new Error('Password is required');
            if (!form.title || !form.videoUrl) throw new Error('Title and video URL are required');

            const res = await fetch(`${apiUrl}/videos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    email: user.email,
                    password: adminPassword
                },
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error('Failed to add video');

            setForm({ title: '', videoUrl: '' });
            setFormMsg('Video added!');
            fetchVideos();
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };

    const handleDelete = async id => {
        const adminPassword = prompt('Enter admin password:');
        if (!adminPassword) return;

        try {
            const res = await fetch(`${apiUrl}/videos/${id}`, {
                method: 'DELETE',
                headers: {
                    email: user.email,
                    password: adminPassword
                }
            });

            if (!res.ok) throw new Error('Failed to delete video');
            fetchVideos();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleVideoClick = (index) => {
        setSelectedVideoIndex(index);
    };

    const closeModal = () => {
        setSelectedVideoIndex(null);
    };

    const nextVideo = () => {
        setSelectedVideoIndex((prev) => (prev + 1) % videos.length);
    };

    const prevVideo = () => {
        setSelectedVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowRight') {
            nextVideo();
        } else if (e.key === 'ArrowLeft') {
            prevVideo();
        }
    };

    const getYouTubeEmbedUrl = (url) => {
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="videos-loading">Loading videos...</div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="videos-page">
                {selectedVideoIndex !== null ? (
                    // Carousel View
                    <div className="videos-carousel-view">
                        {/* Header with Back, Videos, and Navigation */}
                        <div className="videos-carousel-header">
                            <button className="videos-back-btn" onClick={() => setSelectedVideoIndex(null)}>
                                <img src={require('./assets/lets-icons_back.png')} alt="Back" />
                                Back
                            </button>

                            <h1 className="videos-heading">Flowing Moments</h1>

                            <div className="videos-header-nav">
                                <button
                                    className="videos-nav-btn"
                                    onClick={prevVideo}
                                >
                                    <img src={require('./assets/lucide_move-left.png')} alt="Previous" />
                                </button>
                                <button
                                    className="videos-nav-btn"
                                    onClick={nextVideo}
                                >
                                    <img src={require('./assets/lucide_move-left.png')} alt="Next" />
                                </button>
                            </div>
                        </div>

                        <div className="videos-carousel-container">
                            {/* Previous Video - always show */}
                            <div className="videos-side-video prev" onClick={prevVideo}>
                                <iframe
                                    src={getYouTubeEmbedUrl(videos[(selectedVideoIndex - 1 + videos.length) % videos.length].videoUrl)}
                                    title="Previous"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            {/* Center Video */}
                            <div className="videos-center-video">
                                <iframe
                                    src={getYouTubeEmbedUrl(videos[selectedVideoIndex].videoUrl)}
                                    title={videos[selectedVideoIndex].title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                                <div className="videos-video-details">
                                    <h3>{videos[selectedVideoIndex].title}</h3>
                                </div>
                            </div>

                            {/* Next Video - always show */}
                            <div className="videos-side-video next" onClick={nextVideo}>
                                <iframe
                                    src={getYouTubeEmbedUrl(videos[(selectedVideoIndex + 1) % videos.length].videoUrl)}
                                    title="Next"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Grid View
                    <>
                        <h1 className="videos-heading">Flowing Moments</h1>
                        <div className="videos-grid">
                            {videos.map((video, index) => (
                                <div key={video._id} className="video-container" onClick={() => handleVideoClick(index)}>
                                    <div className="video-wrapper">
                                        <iframe
                                            src={getYouTubeEmbedUrl(video.videoUrl)}
                                            title={video.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="video-iframe"
                                        ></iframe>
                                    </div>
                                    <div className="video-overlay">
                                        <div className="video-name">{video.title}</div>
                                        {isAdmin && (
                                            <button
                                                className="video-delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(video._id);
                                                }}
                                                title="Delete Video"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Admin Form */}
                {isAdmin && (
                    <div className="videos-admin-form">
                        <form onSubmit={handleAdd}>
                            <h3>Add New Video</h3>
                            <input
                                type="text"
                                placeholder="Video Title"
                                value={form.title}
                                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                required
                            />
                            <input
                                type="url"
                                placeholder="YouTube Video URL"
                                value={form.videoUrl}
                                onChange={e => setForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                                required
                            />
                            <button type="submit" disabled={submitting}>
                                {submitting ? 'Adding...' : 'Add Video'}
                            </button>
                            {formMsg && <p className="form-msg">{formMsg}</p>}
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default Videos; 