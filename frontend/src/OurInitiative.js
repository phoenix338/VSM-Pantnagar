import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import './OurInitiative.css';
import initiativeGif from './assets/gif/events.mp4';
import { auth } from './firebase';
import Footer from './Footer';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

// Function to convert URLs in text to clickable links
const convertTextToLinks = (text) => {
    if (!text) return '';

    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Split the text by URLs and create React elements
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            // This is a URL, make it a clickable link
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: '#007bff',
                        textDecoration: 'none',
                        wordBreak: 'break-all'
                    }}
                >
                    {part}
                </a>
            );
        } else {
            // This is regular text
            return part;
        }
    });
};

const OurInitiative = () => {
    const { eventId } = useParams();
    const location = useLocation();
    const [initiatives, setInitiatives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ title: '', text: '', imageUrls: [] });
    const [imageFiles, setImageFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [formMsg, setFormMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState({}); // Track current image for each event
    const [selectedInitiativeForUpload, setSelectedInitiativeForUpload] = useState(''); // For admin upload
    useEffect(() => {
        document.title = "Events Board | VSM";
    }, []);
    useEffect(() => {
        fetch(`${API_URL}/initiatives`)
            .then(res => res.json())
            .then(data => {
                setInitiatives(data);
                setLoading(false);
                // Initialize current image index for each event
                const initialIndexes = {};
                data.forEach(item => {
                    initialIndexes[item._id] = 0;
                });
                setCurrentImageIndex(initialIndexes);
                // Scroll to specific event if eventId is provided
                if (eventId) {
                    setTimeout(() => {
                        const eventElement = document.getElementById(`event-${eventId}`);
                        if (eventElement) {
                            eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 500);
                }
            })
            .catch(err => {
                setError('Failed to load events');
                setLoading(false);
            });
    }, [eventId]);

    // Auto-advance slideshow every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => {
                const newIndexes = { ...prev };
                initiatives.forEach(item => {
                    if (item.imageUrls && item.imageUrls.length > 1) {
                        newIndexes[item._id] = (newIndexes[item._id] + 1) % item.imageUrls.length;
                    }
                });
                return newIndexes;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [initiatives]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    const isAdmin = user && user.email === ADMIN_EMAIL;

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = e => {
        setImageFiles(Array.from(e.target.files));
    };
    const handleImageFilesChange = e => {
        setImageFiles(Array.from(e.target.files));
    };
    const handleUploadImages = async () => {
        if (!selectedInitiativeForUpload) return alert('Select an initiative/event');
        if (imageFiles.length === 0) return alert('Select images to upload');

        try {
            setUploading(true);
            const adminPassword = prompt('Enter admin password:');
            if (!adminPassword) throw new Error('Password required');

            const formData = new FormData();
            imageFiles.forEach(img => formData.append('images', img));

            const res = await fetch(`${API_URL}/${selectedInitiativeForUpload}/images`, {
                method: 'PATCH',
                headers: {
                    email: user.email,
                    password: adminPassword
                },
                body: formData
            });

            if (!res.ok) throw new Error('Failed to upload images');
            const updatedInitiative = await res.json();
            alert('Images uploaded successfully!');

            // Update initiatives in state
            setInitiatives(prev =>
                prev.map(item => (item._id === updatedInitiative._id ? updatedInitiative : item))
            );
            setImageFiles([]);
            setSelectedInitiativeForUpload('');
        } catch (err) {
            alert(err.message);
        } finally {
            setUploading(false);
        }
    };
    const handleDeleteImage = async (initiativeId, imageUrl) => {
        if (!isAdmin) return;
        try {
            const adminPassword = prompt("Enter admin password:");
            if (!adminPassword) return;

            const res = await fetch(`${API_URL}/${initiativeId}/images/delete`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    email: user.email,
                    password: adminPassword
                },
                body: JSON.stringify({ urlsToDelete: [imageUrl] })
            });

            if (!res.ok) throw new Error("Failed to delete image");
            const updatedInitiative = await res.json();

            setInitiatives(prev =>
                prev.map(item => (item._id === updatedInitiative._id ? updatedInitiative : item))
            );

            // Reset current index if needed
            setCurrentImageIndex(prev => ({
                ...prev,
                [initiativeId]: Math.min(prev[initiativeId] || 0, updatedInitiative.imageUrls.length - 1)
            }));

        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddInitiative = async e => {
        e.preventDefault();
        setSubmitting(true);
        setFormMsg('');
        let imageUrls = [];
        try {
            if (imageFiles.length > 0) {
                setUploading(true);
                const formData = new FormData();
                imageFiles.forEach(file => {
                    formData.append('images', file);
                });
                const res = await fetch(`${API_URL}/upload-multiple-images`, {
                    method: 'POST',
                    headers: {
                        email: user.email,
                        password: prompt('Enter admin password:')
                    },
                    body: formData
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Image upload failed');
                imageUrls = data.imageUrls;
                setUploading(false);
            }
            const res = await fetch(`${API_URL}/initiatives`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    email: user.email,
                    password: prompt('Enter admin password:')
                },
                body: JSON.stringify({ ...form, imageUrls })
            });
            if (!res.ok) throw new Error('Failed to add event');
            setForm({ title: '', text: '', imageUrls: [] });
            setImageFiles([]);
            setFormMsg('Event added!');
            // Refresh list
            const data = await res.json();
            setInitiatives(prev => [...prev, data]);
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        const password = prompt('Enter admin password to delete event:');
        if (!password) return;
        try {
            const res = await fetch(`${API_URL}/initiatives/${id}`, {
                method: 'DELETE',
                headers: {
                    email: user.email,
                    password
                }
            });
            if (!res.ok) throw new Error('Failed to delete event');
            setInitiatives(prev => prev.filter(i => i._id !== id));
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const nextImage = (eventId) => {
        const event = initiatives.find(item => item._id === eventId);
        if (event && event.imageUrls && event.imageUrls.length > 1) {
            setCurrentImageIndex(prev => ({
                ...prev,
                [eventId]: (prev[eventId] + 1) % event.imageUrls.length
            }));
        }
    };

    const prevImage = (eventId) => {
        const event = initiatives.find(item => item._id === eventId);
        if (event && event.imageUrls && event.imageUrls.length > 1) {
            setCurrentImageIndex(prev => ({
                ...prev,
                [eventId]: prev[eventId] === 0 ? event.imageUrls.length - 1 : prev[eventId] - 1
            }));
        }
    };

    return (
        <>
            <Navbar />
            <div className="initiative-page main-content-gap">
                <div className="initiative-gif-wrapper">
                    <video
                        src={require('./assets/gif/events1.mp4')}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
                <div className="initiatives-list">
                    <h1 className="our-initiative-heading">Our Events</h1>

                    {loading && <div>Loading events...</div>}
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    {initiatives.map((item, idx) => (
                        <div
                            className={`initiative-row${idx % 2 === 1 ? ' even' : ''}`}
                            key={item._id || idx}
                            id={`event-${item._id}`}
                        >
                            <div className="initiative-text-col">
                                <h2 className="initiative-heading">{item.title || `Event ${idx + 1}`}</h2>
                                <div className="initiative-content-row">
                                    <div className="initiative-text">
                                        {item.text && (
                                            <p style={{ margin: '0px', padding: '0px', marginTop: '0px', fontSize: '1.7vw', lineHeight: 1.4, textAlign: 'left' }}>
                                                {(() => {
                                                    // First, split by 'Contribute page' and render as Link
                                                    const parts = item.text.split('Contribute page');
                                                    const withContributeLink = [];
                                                    for (let i = 0; i < parts.length; i++) {
                                                        if (i > 0) {
                                                            withContributeLink.push(
                                                                <Link key={`contribute-link-${i}`} to="/contribute" style={{ color: '#DD783C', fontWeight: 500, textDecoration: 'none' }}>Contribute page</Link>
                                                            );
                                                        }
                                                        // Now, convert URLs in each part
                                                        withContributeLink.push(...convertTextToLinks(parts[i]));
                                                    }
                                                    return withContributeLink;
                                                })()}
                                            </p>
                                        )}
                                    </div>
                                    {(item.imageUrls && item.imageUrls.length > 0) || item.imageUrl ? (
                                        <div className="image-slideshow">
                                            <img
                                                src={item.imageUrls && item.imageUrls.length > 0
                                                    ? item.imageUrls[currentImageIndex[item._id] || 0]
                                                    : item.imageUrl}
                                                alt="Event"
                                                className="initiative-img"

                                            />
                                            {isAdmin && item.imageUrls && item.imageUrls.length > 0 && (
                                                <button
                                                    onClick={() =>
                                                        handleDeleteImage(
                                                            item._id,
                                                            item.imageUrls[currentImageIndex[item._id] || 0]
                                                        )
                                                    }
                                                    style={{
                                                        position: "absolute",
                                                        top: 8,
                                                        right: 8,
                                                        background: "red",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "50%",
                                                        width: 24,
                                                        height: 24,
                                                        cursor: "pointer",
                                                        fontSize: 16,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        zIndex: 10
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            )}
                                            {item.imageUrls && item.imageUrls.length > 1 && (
                                                <>
                                                    <button
                                                        className="slideshow-btn prev-btn"
                                                        onClick={() => prevImage(item._id)}
                                                    >
                                                        ‹
                                                    </button>
                                                    <button
                                                        className="slideshow-btn next-btn"
                                                        onClick={() => nextImage(item._id)}
                                                    >
                                                        ›
                                                    </button>
                                                    <div className="image-indicators">
                                                        {item.imageUrls.map((_, index) => (
                                                            <span
                                                                key={index}
                                                                className={`indicator ${(currentImageIndex[item._id] || 0) === index ? 'active' : ''}`}
                                                                onClick={() => setCurrentImageIndex(prev => ({ ...prev, [item._id]: index }))}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="no-image">No images available</div>
                                    )}
                                </div>
                                {isAdmin && (
                                    <button
                                        className="initiative-delete-btn"
                                        onClick={() => handleDelete(item._id)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {isAdmin && (
                    <div className="admin-initiative-form">
                        <h3>Add Event</h3>
                        <form onSubmit={handleAddInitiative} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
                            <input name="title" placeholder="Event title" value={form.title} onChange={handleChange} required />
                            <textarea name="text" placeholder="Event text" value={form.text} onChange={handleChange} required style={{ minHeight: 60 }} />
                            <input type="file" accept="image/*" multiple onChange={handleFileChange} />
                            {uploading && <div>Uploading images...</div>}
                            <button type="submit" disabled={submitting || uploading}>{submitting ? 'Adding...' : 'Add Event'}</button>
                            {formMsg && <div style={{ color: formMsg.startsWith('Error') ? 'red' : 'green' }}>{formMsg}</div>}
                        </form>
                    </div>

                )


                }
                {isAdmin && (
                    <div className='admin-initiative-form'>
                        <h3>Upload Images to Initiative/Event</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>

                            <select
                                value={selectedInitiativeForUpload}
                                onChange={e => setSelectedInitiativeForUpload(e.target.value)}
                                style={{ display: 'block', marginBottom: 12 }}
                            >
                                <option value="">-- Select Initiative/Event --</option>
                                {initiatives.map(init => (
                                    <option key={init._id} value={init._id}>
                                        {init.title}
                                    </option>
                                ))}
                            </select>

                            <input type="file" multiple onChange={handleImageFilesChange} style={{ display: 'block', marginBottom: 12 }} />

                            <button type='submit' onClick={handleUploadImages} disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload Images'}
                            </button>
                        </div>
                    </div>
                )}
                <Footer />
                {/* Responsive spacing for main content */}
                <style>{`
                  @media (max-width: 600px) {
                    .main-content-gap {
                      margin-top: 100px !important;
                    }
                  }
                  @media (min-width: 601px) {
                    .main-content-gap {
                      margin-top: 60px !important;
                    }
                  }
                `}</style>
            </div>
        </>
    );
};

export default OurInitiative; 