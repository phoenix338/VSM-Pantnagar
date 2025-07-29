import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { auth } from './firebase';
import './GalleryImages.css';

const RENDER_API_URL = process.env.REACT_APP_API_URL;
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const GalleryImages = () => {
    const [galleryImages, setGalleryImages] = useState([]);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', image: null });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState('');
    const [apiUrl, setApiUrl] = useState(RENDER_API_URL);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const fileInputRef = React.useRef();

    useEffect(() => {
        fetchGalleryImages();
        const unsubscribe = auth.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    const fetchGalleryImages = async () => {
        // Try localhost first, then fall back to Render
        const urls = [RENDER_API_URL];

        for (const url of urls) {
            try {
                const res = await fetch(`${url}/gallery-images`);
                if (res.ok) {
                    const data = await res.json();
                    setGalleryImages(data);
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
            if (!form.image) throw new Error('Image is required');

            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('image', form.image);

            const res = await fetch(`${apiUrl}/gallery-images`, {
                method: 'POST',
                headers: {
                    email: user.email,
                    password: adminPassword
                },
                body: formData
            });

            if (!res.ok) throw new Error('Failed to add image');

            setForm({ title: '', description: '', image: null });
            if (fileInputRef.current) fileInputRef.current.value = '';
            setFormMsg('Image added!');
            fetchGalleryImages();
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };

    const handleDelete = async id => {
        const adminPassword = prompt('Enter admin password:');
        if (!adminPassword) return;

        try {
            const res = await fetch(`${apiUrl}/gallery-images/${id}`, {
                method: 'DELETE',
                headers: {
                    email: user.email,
                    password: adminPassword
                }
            });

            if (!res.ok) throw new Error('Failed to delete image');
            fetchGalleryImages();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleImageChange = e => {
        setForm({ ...form, image: e.target.files[0] });
    };

    const handleImageClick = (index) => {
        setSelectedImageIndex(index);
    };

    const closeModal = () => {
        setSelectedImageIndex(null);
    };

    const nextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    const handleKeyDown = (e) => {
        if (selectedImageIndex !== null) {
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            }
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex]);

    if (loading) return <div>Loading gallery...</div>;

    const currentImage = selectedImageIndex !== null ? galleryImages[selectedImageIndex] : null;
    const prevImageData = selectedImageIndex !== null ? galleryImages[(selectedImageIndex - 1 + galleryImages.length) % galleryImages.length] : null;
    const nextImageData = selectedImageIndex !== null ? galleryImages[(selectedImageIndex + 1) % galleryImages.length] : null;

    return (
        <>
            <Navbar />
            <div className="gallery-page">
                {selectedImageIndex !== null ? (
                    // Carousel View
                    <div className="gallery-carousel-view">
                        {/* Header with Back, Gallery, and Navigation */}
                        <div className="gallery-carousel-header">
                            <button className="gallery-back-btn" onClick={() => setSelectedImageIndex(null)}>
                                <img src={require('./assets/lets-icons_back.png')} alt="Back" />
                                Back
                            </button>

                            <h1 className="gallery-heading">Gallery</h1>

                            <div className="gallery-header-nav">
                                <button
                                    className="gallery-nav-btn"
                                    onClick={prevImage}
                                >
                                    <img src={require('./assets/lucide_move-left.png')} alt="Previous" />
                                </button>
                                <button
                                    className="gallery-nav-btn"
                                    onClick={nextImage}
                                >
                                    <img src={require('./assets/lucide_move-left.png')} alt="Next" />
                                </button>
                            </div>
                        </div>

                        <div className="gallery-carousel-container">
                            {/* Previous Image - always show */}
                            <div className="gallery-side-image prev" onClick={prevImage}>
                                <img src={prevImageData ? prevImageData.imageUrl : galleryImages[galleryImages.length - 1].imageUrl} alt="Previous" />
                            </div>

                            {/* Center Image */}
                            <div className="gallery-center-image">
                                <img src={currentImage.imageUrl} alt={currentImage.title} />
                                <div className="gallery-image-details">
                                    <h3>{currentImage.title}</h3>
                                    <p>{currentImage.description}</p>
                                </div>
                            </div>

                            {/* Next Image - always show */}
                            <div className="gallery-side-image next" onClick={nextImage}>
                                <img src={nextImageData ? nextImageData.imageUrl : galleryImages[0].imageUrl} alt="Next" />
                            </div>
                        </div>
                    </div>
                ) : (
                    // Grid View
                    <>
                        <h1 className="gallery-heading">Gallery</h1>
                        <div className="gallery-grid">
                            {galleryImages.map((item, index) => (
                                <div className="gallery-img-container" key={item._id}>
                                    <div className="gallery-img-wrapper">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="gallery-img"
                                            onClick={() => handleImageClick(index)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {isAdmin && (
                                            <button
                                                className="gallery-delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item._id);
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    <div className="gallery-img-overlay">
                                        {item.title && <div className="gallery-name">{item.title}</div>}
                                        {item.description && <div className="gallery-title">{item.description}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {isAdmin && (
                    <div className="gallery-admin-form">
                        <form onSubmit={handleAdd}>
                            <h3>Add Gallery Image</h3>
                            <input
                                name="title"
                                placeholder="Image Title"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                required
                            />
                            <textarea
                                name="description"
                                placeholder="Image Description"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                required
                                style={{ minHeight: 80, resize: 'vertical' }}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                ref={fileInputRef}
                                required
                            />
                            <button type="submit" disabled={submitting}>
                                {submitting ? 'Adding...' : 'Add Image'}
                            </button>
                            {formMsg && (
                                <div style={{
                                    marginTop: 8,
                                    color: formMsg.startsWith('Error') ? 'red' : 'green'
                                }}>
                                    {formMsg}
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default GalleryImages; 