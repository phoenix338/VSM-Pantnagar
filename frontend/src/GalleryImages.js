import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { auth } from './firebase';
import './GalleryImages.css';

const RENDER_API_URL = process.env.REACT_APP_API_URL;
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const GalleryImages = () => {
    const [galleryImages, setGalleryImages] = useState([]);
    const [otherImages, setOtherImages] = useState([]);
    const [imagesSubsections, setImagesSubsections] = useState([]);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ titles: [''], descriptions: [''], images: [], imagesSubsection: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState('');
    const [apiUrl, setApiUrl] = useState(RENDER_API_URL);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const fileInputRef = React.useRef();

    useEffect(() => {
        fetchGalleryImages();
        fetchOtherImages();
        fetchImagesSubsections();
        const unsubscribe = auth.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    const fetchOtherImages = async () => {
        try {
            const res = await fetch(`${RENDER_API_URL}/other-images`);
            if (res.ok) {
                const data = await res.json();
                setOtherImages(data);
            }
        } catch (err) {
            console.log('Failed to fetch other images:', err.message);
        }
    };
    const fetchImagesSubsections = async () => {
        try {
            const res = await fetch(`${RENDER_API_URL}/images-subsections`);
            if (res.ok) {
                const data = await res.json();
                setImagesSubsections(data);
            }
        } catch (err) {
            console.log('Failed to fetch images subsections:', err.message);
        }
    };

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
            if (!form.images.length) throw new Error('At least one image is required');
            if (!form.imagesSubsection) throw new Error('Please select an image subsection');
            for (let i = 0; i < form.images.length; i++) {
                if (!form.titles[i] || !form.descriptions[i]) throw new Error('Each image must have a title and description');
            }
            const formData = new FormData();
            form.titles.forEach(t => formData.append('title', t));
            form.descriptions.forEach(d => formData.append('description', d));
            form.images.forEach(img => formData.append('images', img));
            formData.append('imagesSubsection', form.imagesSubsection);
            const res = await fetch(`${apiUrl}/gallery-images`, {
                method: 'POST',
                headers: {
                    email: user.email,
                    password: adminPassword
                },
                body: formData
            });
            if (!res.ok) throw new Error('Failed to add images');
            setForm({ titles: [''], descriptions: [''], images: [], imagesSubsection: '', newSubsectionName: '' });
            if (fileInputRef.current) fileInputRef.current.value = '';
            setFormMsg('Images added!');
            fetchGalleryImages();
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };
    const handleAddotherimages = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormMsg('');

        try {
            const adminPassword = prompt('Enter admin password:');
            if (!adminPassword) throw new Error('Password is required');
            if (!form.images.length) throw new Error('At least one image is required');
            if (!form.imagesSubsection) throw new Error('Please select an image subsection');

            // Check if subsection exists in DB
            const subsectionExists = imagesSubsections.some(sub => sub.name === form.imagesSubsection);

            const formData = new FormData();
            formData.append('subsection', form.imagesSubsection);
            form.images.forEach((img) => {
                formData.append('images', img);
            });

            let endpoint = `${apiUrl}/other-images`;
            let method = 'POST';

            if (subsectionExists) {
                // If subsection exists, use PATCH to append images
                endpoint = `${apiUrl}/other-images/append`;
                method = 'PATCH';
            }

            const res = await fetch(endpoint, {
                method,
                headers: {
                    email: user.email,
                    password: adminPassword,
                },
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to add images');

            setForm({ images: [], imagesSubsection: '' });
            if (fileInputRef.current) fileInputRef.current.value = '';
            setFormMsg('Images added!');
            fetchOtherImages();
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

    const handleDeleteOtherImage = async id => {
        const adminPassword = prompt('Enter admin password:');
        if (!adminPassword) return;
        try {
            const res = await fetch(`${apiUrl}/other-images/${id}`, {
                method: 'DELETE',
                headers: {
                    email: user.email,
                    password: adminPassword
                }
            });
            if (!res.ok) throw new Error('Failed to delete image');
            fetchOtherImages();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleImageChange = e => {
        const files = Array.from(e.target.files);
        setForm({
            ...form,
            images: files,
            titles: files.map((_, i) => form.titles[i] || ''),
            descriptions: files.map((_, i) => form.descriptions[i] || '')
        });
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
                {/* Gallery Images Section */}
                {selectedImageIndex !== null ? (
                    // Carousel View
                    <div className="gallery-carousel-view">
                        <div className="gallery-carousel-header">
                            <button className="gallery-back-btn" onClick={closeModal}>
                                <img src={require('./assets/lets-icons_back.png')} alt="Back" />
                                Back
                            </button>
                            <div style={{ color: 'grey', fontSize: '40px', marginBottom: 12, fontFamily: 'alex brush', textAlign: 'center', paddingTop: '50px', paddingBottom: '30px' }}>Dignitaries Who Graced VSM</div>
                            <div className="gallery-header-nav">
                                <button className="gallery-nav-btn" onClick={prevImage}>
                                    <img src={require('./assets/lucide_move-left.png')} alt="Previous" />
                                </button>
                                <button className="gallery-nav-btn" onClick={nextImage}>
                                    <img src={require('./assets/lucide_move-left.png')} alt="Next" />
                                </button>
                            </div>
                        </div>
                        <div className="gallery-carousel-container">
                            <div className="gallery-side-image prev" onClick={prevImage}>
                                <img src={prevImageData ? prevImageData.imageUrl : galleryImages[galleryImages.length - 1].imageUrl} alt="Previous" />
                            </div>
                            <div className="gallery-center-image">
                                <img src={currentImage.imageUrl} alt={currentImage.title} />
                                <div className="gallery-image-details">
                                    <h3>{currentImage.title}</h3>
                                    <p>{currentImage.description}</p>
                                </div>
                            </div>
                            <div className="gallery-side-image next" onClick={nextImage}>
                                <img src={nextImageData ? nextImageData.imageUrl : galleryImages[0].imageUrl} alt="Next" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="gallery-gif-wrapper">
                            {/* <img src={booksGif} alt="Books" className="books-gif" /> */}
                            <h1 className="gallery-heading">Frozen Moments</h1>

                        </div>
                        <div style={{ color: 'grey', fontSize: '40px', marginBottom: 12, fontFamily: 'alex brush', textAlign: 'center', paddingTop: '50px', paddingBottom: '30px' }}>Dignitaries Who Graced VSM</div>
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

                        {/* Admin form (for both sections) */}
                        {isAdmin && (
                            <div className="gallery-admin-form">
                                <form onSubmit={handleAddotherimages}>
                                    <h3>Add Other Images</h3>
                                    {/* Select subsection */}
                                    <select
                                        value={form.imagesSubsection}
                                        onChange={e => setForm({ ...form, imagesSubsection: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Image Subsection</option>
                                        {imagesSubsections.map(sub => (
                                            <option key={sub._id} value={sub.name}>{sub.name}</option>
                                        ))}
                                    </select>
                                    {/* File upload */}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        ref={fileInputRef}
                                        required
                                    />
                                    {/* Preview uploaded files */}
                                    {form.images.length > 0 && form.images.map((img, idx) => (
                                        <div key={idx} style={{
                                            marginBottom: 10,
                                            border: '1px solid #eee',
                                            padding: 10,
                                            borderRadius: 6
                                        }}>
                                            <b>Image {idx + 1}:</b> {img.name}
                                        </div>
                                    ))}
                                    {/* Submit button */}
                                    <button type="submit" disabled={submitting}>
                                        {submitting ? 'Adding...' : 'Add Images'}
                                    </button>
                                    {/* Form message */}
                                    {formMsg && (
                                        <div style={{
                                            marginTop: 8,
                                            color: formMsg.startsWith('Error') ? 'red' : 'green'
                                        }}>
                                            {formMsg}
                                        </div>
                                    )}
                                </form>
                                {/* Add new subsection */}
                                <form
                                    onSubmit={async e => {
                                        e.preventDefault();
                                        setSubmitting(true);
                                        setFormMsg('');
                                        try {
                                            const adminPassword = prompt('Enter admin password:');
                                            if (!adminPassword) throw new Error('Password is required');
                                            if (!form.newSubsectionName) throw new Error('Name is required');
                                            const res = await fetch(`${apiUrl}/images-subsections`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    email: user.email,
                                                    password: adminPassword
                                                },
                                                body: JSON.stringify({ name: form.newSubsectionName })
                                            });
                                            if (!res.ok) throw new Error('Failed to add subsection');
                                            setFormMsg('Subsection added!');
                                            setForm(f => ({ ...f, newSubsectionName: '' }));
                                            fetchImagesSubsections();
                                        } catch (err) {
                                            setFormMsg('Error: ' + err.message);
                                        }
                                        setSubmitting(false);
                                    }}
                                    style={{ marginTop: 32, borderTop: '1px solid #ddd', paddingTop: 24 }}
                                >
                                    <h4>Add Gallery Subsection</h4>
                                    <input
                                        type="text"
                                        placeholder="New subsection name"
                                        value={form.newSubsectionName || ''}
                                        onChange={e => setForm({ ...form, newSubsectionName: e.target.value })}
                                        required
                                    />
                                    <button type="submit" disabled={submitting}>
                                        {submitting ? 'Adding...' : 'Add Subsection'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Other Images Section (grouped by subsection) */}
                        {otherImages.map((entry) => (
                            <div key={entry._id} style={{ marginBottom: 32 }}>
                                <div style={{ color: 'grey', fontSize: '40px', marginBottom: 12, fontFamily: 'alex brush', textAlign: 'center', paddingTop: '50px', paddingBottom: '30px' }}>{entry.subsection}</div>
                                <div className="gallery-grid">
                                    {entry.urls.map((url, idx) => (
                                        <div className="gallery-img-container-other" key={entry._id + '-' + idx}>
                                            <div className="gallery-img-wrapper">
                                                <img
                                                    src={url}
                                                    alt={`Other Image ${idx + 1}`}
                                                    className="gallery-img-other"
                                                />
                                                {isAdmin && (
                                                    <button
                                                        className="gallery-delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteOtherImage(entry._id);
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </>
    );
};

export default GalleryImages; 