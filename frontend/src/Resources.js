import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import { auth } from './firebase';
import './Videos.css'; // Reuse Videos styles for consistent look
import './Resources.css'
import Footer from './Footer';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.js`;
const RENDER_API_URL = process.env.REACT_APP_API_URL;
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
const Resources = () => {
    const [resources, setResources] = useState({});
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
                setResources(data); // data: { talksByDignitaries, uniqueIndia, miscellaneous }
            }
        } catch (err) {
            console.log('Failed to fetch resources:', err.message);
        }
        setLoading(false);
    };
    const isAdmin = user && user.email === ADMIN_EMAIL;

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
            <Footer />
        </>
    );

    if (!resources || (!resources.talksByDignitaries?.length && !resources.uniqueIndia?.length && !resources.miscellaneous?.length)) return (
        <>
            <Navbar />
            <div className="videos-loading">No resources found.</div>
            {user !== null && user.email === ADMIN_EMAIL && (
                <AdminResourceForms fetchResources={fetchResources} user={user} apiUrl={apiUrl} />
            )}
            <Footer />

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
                <Footer />
            </>
        );
    }

    // Grid View
    return (
        <>
            <Navbar resources={resources} />
            <div className="videos-page">
                <div className="resources-gif-wrapper">
                    {/* <img src={booksGif} alt="Books" className="books-gif" /> */}
                    <h1 className="videos-heading">Resources</h1>

                </div>
                <div className="resource-section">
                    <h2 id="videos" style={{ scrollMarginTop: 120 }}>Talks by Dignitaries</h2>
                    <div className="videos-grid">
                        {resources.talksByDignitaries?.map((resource, idx) => (
                            <div className="video-container" key={resource._id || idx}>
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
                                    <div className="video-desc">{resource.designation}</div>
                                </div>
                                {/* Delete Button for Admin */}
                                {isAdmin && (
                                    <button
                                        style={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                            background: '#ff4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: 24,
                                            height: 24,
                                            fontSize: 16,
                                            cursor: 'pointer'
                                        }}
                                        onClick={async () => {
                                            const confirmDelete = window.confirm(`Delete "${resource.title}"?`);
                                            if (!confirmDelete) return;

                                            const adminPassword = prompt('Enter admin password:');
                                            if (!adminPassword) return;

                                            try {
                                                const res = await fetch(`${apiUrl}/talks-by-dignitaries/${resource._id}`, {
                                                    method: 'DELETE',
                                                    headers: {
                                                        email: user.email,
                                                        password: adminPassword
                                                    }
                                                });
                                                if (!res.ok) {
                                                    const errData = await res.json();
                                                    throw new Error(errData.error || 'Failed to delete resource');
                                                }
                                                fetchResources(); // refresh list
                                            } catch (err) {
                                                alert('Error: ' + err.message);
                                            }
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="resource-section">
                    <h2 id="uniqueindia" style={{ scrollMarginTop: 120 }}>The Unique India</h2>
                    <div className="videos-grid">
                        {resources.uniqueIndia?.map((resource, idx) => (
                            <div className="video-container" key={resource._id || idx}>
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
                                </div>
                                {isAdmin && (
                                    <button
                                        style={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                            background: '#ff4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: 24,
                                            height: 24,
                                            fontSize: 16,
                                            cursor: 'pointer'
                                        }}
                                        onClick={async () => {
                                            const confirmDelete = window.confirm(`Delete "${resource.title}"?`);
                                            if (!confirmDelete) return;

                                            const adminPassword = prompt('Enter admin password:');
                                            if (!adminPassword) return;

                                            try {
                                                const res = await fetch(`${apiUrl}/unique-india/${resource._id}`, {
                                                    method: 'DELETE',
                                                    headers: {
                                                        email: user.email,
                                                        password: adminPassword
                                                    }
                                                });
                                                if (!res.ok) {
                                                    const errData = await res.json();
                                                    throw new Error(errData.error || 'Failed to delete resource');
                                                }
                                                fetchResources(); // refresh list
                                            } catch (err) {
                                                alert('Error: ' + err.message);
                                            }
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="resource-section">
                    <h2 id="miscellaneous" style={{ scrollMarginTop: 120 }}>Miscellaneous</h2>
                    <div className="videos-grid">
                        {resources.miscellaneous?.map((resource, idx) => (
                            <div className="video-container" key={resource._id || idx}>
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
                                </div>
                                {isAdmin && (
                                    <button
                                        style={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                            background: '#ff4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: 24,
                                            height: 24,
                                            fontSize: 16,
                                            cursor: 'pointer'
                                        }}
                                        onClick={async () => {
                                            const confirmDelete = window.confirm(`Delete "${resource.title}"?`);
                                            if (!confirmDelete) return;

                                            const adminPassword = prompt('Enter admin password:');
                                            if (!adminPassword) return;

                                            try {
                                                const res = await fetch(`${apiUrl}/miscellaneous/${resource._id}`, {
                                                    method: 'DELETE',
                                                    headers: {
                                                        email: user.email,
                                                        password: adminPassword
                                                    }
                                                });
                                                if (!res.ok) {
                                                    const errData = await res.json();
                                                    throw new Error(errData.error || 'Failed to delete resource');
                                                }
                                                fetchResources(); // refresh list
                                            } catch (err) {
                                                alert('Error: ' + err.message);
                                            }
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="resource-section">
                    <h2 id="ebooks" style={{ scrollMarginTop: 120 }}>eBooks</h2>
                    <div className="ebooks-grid">
                        {resources.eBooks?.map((ebook, idx) => (
                            <div className="ebook-container" key={ebook._id || idx} style={{ position: 'relative' }}>
                                {/* <div className="ebook-title">{ebook.title}</div> */}
                                {/* Flipbook viewer placeholder */}
                                <PDFFlipbookViewer url={ebook.pdfUrl} title={ebook.title} />
                                {isAdmin && (
                                    <button
                                        style={{
                                            position: 'absolute',
                                            top: 30,
                                            right: 200,
                                            background: '#ff4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: 24,
                                            height: 24,
                                            fontSize: 16,
                                            cursor: 'pointer',
                                            zIndex: 10
                                        }}
                                        onClick={async () => {
                                            const confirmDelete = window.confirm(`Delete eBook "${ebook.title}"?`);
                                            if (!confirmDelete) return;

                                            const adminPassword = prompt('Enter admin password:');
                                            if (!adminPassword) return;

                                            try {
                                                const res = await fetch(`${apiUrl}/ebooks/${ebook._id}`, {
                                                    method: 'DELETE',
                                                    headers: {
                                                        email: user.email,
                                                        password: adminPassword
                                                    }
                                                });
                                                if (!res.ok) throw new Error('Failed to delete eBook');
                                                fetchResources(); // refresh list
                                            } catch (err) {
                                                alert('Error: ' + err.message);
                                            }
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                        ))}
                    </div>
                </div>
                {/* eNewsletters section removed. Will be shown in Navbar dropdown only. */}

                {user !== null && user.email === ADMIN_EMAIL && (
                    <AdminResourceForms fetchResources={fetchResources} user={user} apiUrl={apiUrl} />
                )}
            </div>
            <Footer />

        </>
    );
};

// Flipbook PDF viewer for eBooks using react-pdf and react-pageflip
function PDFFlipbookViewer({ url, title }) {
    const [numPages, setNumPages] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setLoading(false);
    }
    function onDocumentLoadError(err) {
        setError('Failed to load PDF');
        setLoading(false);
    }

    return (
        <div className="flipbook-viewer">
            <h4 style={{ textAlign: 'center', margin: 8 }}>{title}</h4>
            {loading && <div>Loading PDF...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading="Loading PDF..."
                error="Failed to load PDF."
            >
                {numPages && (
                    <HTMLFlipBook
                        width={700}
                        height={900}
                        showCover={true}
                        maxShadowOpacity={0.5}
                        className="pdf-flipbook"
                        size="stretch"
                        minWidth={700}
                        maxWidth={700}
                        minHeight={900}
                        maxHeight={900}
                        drawShadow={true}
                        flippingTime={600}
                        useMouseEvents={true}
                        usePortrait={false}
                        startPage={0}
                        mobileScrollSupport={true}
                        showPageCorners={true}
                        style={{ margin: '0 auto' }}
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <div key={`page_${index + 1}`} className="pdf-flipbook-page">
                                <Page
                                    pageNumber={index + 1}
                                    width={700}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </div>
                        ))}
                    </HTMLFlipBook>
                )}
            </Document>
        </div>
    );
}

// Admin form component for all five sections
function AdminResourceForms({ fetchResources, user, apiUrl }) {
    const [submitting, setSubmitting] = React.useState(false);
    const [formMsg, setFormMsg] = React.useState('');
    const [talkForm, setTalkForm] = React.useState({ title: '', url: '', designation: '' });
    const [uniqueIndiaForm, setUniqueIndiaForm] = React.useState({ title: '', url: '' });
    const [miscForm, setMiscForm] = React.useState({ title: '', url: '' });
    const [ebookForm, setEbookForm] = React.useState({ title: '', pdfUrl: '' });
    const [enewsletterForm, setEnewsletterForm] = React.useState({ title: '', pdfUrl: '' });

    const handleSubmit = async (section, form) => {
        setSubmitting(true);
        setFormMsg('');
        try {
            const adminPassword = prompt('Enter admin password:');
            if (!adminPassword) throw new Error('Password is required');
            let url = `${apiUrl}/resources`;
            let body = { ...form, section };
            let headers = {
                'Content-Type': 'application/json',
                email: user.email,
                password: adminPassword
            };
            // Route to correct endpoint for eBooks and eNewsletters
            if (section === 'ebooks') {
                url = `${apiUrl}/ebooks`;
                body = { title: form.title, pdfUrl: form.pdfUrl };
            } else if (section === 'enewsletters') {
                url = `${apiUrl}/enewsletters`;
                body = { title: form.title, pdfUrl: form.pdfUrl };
            }
            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error('Failed to add resource');
            setFormMsg('Resource added!');
            setTalkForm({ title: '', url: '', designation: '' });
            setUniqueIndiaForm({ title: '' });
            setMiscForm({ title: '' });
            fetchResources();
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };

    return (
        <div className="videos-admin-form">
            <form onSubmit={e => { e.preventDefault(); handleSubmit('talksByDignitaries', talkForm); }}>
                <h3>Add Talk by Dignitary</h3>
                <input type="text" placeholder="Title" value={talkForm.title} onChange={e => setTalkForm(f => ({ ...f, title: e.target.value }))} required />
                <input type="url" placeholder="Video URL" value={talkForm.url} onChange={e => setTalkForm(f => ({ ...f, url: e.target.value }))} required />
                <input type="text" placeholder="Designation" value={talkForm.designation} onChange={e => setTalkForm(f => ({ ...f, designation: e.target.value }))} required />
                <button type="submit" disabled={submitting}>Add</button>
            </form>
            <form onSubmit={e => { e.preventDefault(); handleSubmit('uniqueIndia', uniqueIndiaForm); }}>
                <h3>Add Unique India Resource</h3>
                <input type="text" placeholder="Title" value={uniqueIndiaForm.title} onChange={e => setUniqueIndiaForm(f => ({ ...f, title: e.target.value }))} required />
                <input type="url" placeholder="Video URL" value={uniqueIndiaForm.url || ''} onChange={e => setUniqueIndiaForm(f => ({ ...f, url: e.target.value }))} required />
                <button type="submit" disabled={submitting}>Add</button>
            </form>
            <form onSubmit={e => { e.preventDefault(); handleSubmit('miscellaneous', miscForm); }}>
                <h3>Add Miscellaneous Resource</h3>
                <input type="text" placeholder="Title" value={miscForm.title} onChange={e => setMiscForm(f => ({ ...f, title: e.target.value }))} required />
                <input type="url" placeholder="Video URL" value={miscForm.url || ''} onChange={e => setMiscForm(f => ({ ...f, url: e.target.value }))} required />
                <button type="submit" disabled={submitting}>Add</button>
            </form>
            <form onSubmit={e => { e.preventDefault(); if (!ebookForm.pdfUrl) { setFormMsg('Please upload a PDF before submitting.'); return; } handleSubmit('ebooks', ebookForm); }}>
                <h3>Add eBook</h3>
                <input type="text" placeholder="Title" value={ebookForm.title || ''} onChange={e => setEbookForm(f => ({ ...f, title: e.target.value }))} required />

                <input type="file" accept="application/pdf" onChange={async e => {
                    if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append('pdf', file);
                        setFormMsg('Uploading PDF...');
                        try {
                            const res = await fetch(`${apiUrl}/upload-ebook-pdf`, {
                                method: 'POST',
                                body: formData
                            });
                            const data = await res.json();
                            if (data.pdfUrl) {
                                setEbookForm(f => ({ ...f, pdfUrl: data.pdfUrl }));
                                setFormMsg('PDF uploaded!');
                            } else {
                                setFormMsg('Failed to upload PDF');
                            }
                        } catch (err) {
                            setFormMsg('Error uploading PDF');
                        }
                    }
                }} />
                <button type="submit" disabled={submitting}>Add</button>
            </form>
            <form onSubmit={e => { e.preventDefault(); if (!enewsletterForm.pdfUrl) { setFormMsg('Please upload a PDF before submitting.'); return; } handleSubmit('enewsletters', enewsletterForm); }}>
                <h3>Add eNewsletter</h3>
                <input type="text" placeholder="Title" value={enewsletterForm.title || ''} onChange={e => setEnewsletterForm(f => ({ ...f, title: e.target.value }))} required />

                <input type="file" accept="application/pdf" onChange={async e => {
                    if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append('pdf', file);
                        setFormMsg('Uploading PDF...');
                        try {
                            const res = await fetch(`${apiUrl}/upload-enewsletter-pdf`, {
                                method: 'POST',
                                body: formData
                            });
                            const data = await res.json();
                            if (data.pdfUrl) {
                                setEnewsletterForm(f => ({ ...f, pdfUrl: data.pdfUrl }));
                                setFormMsg('PDF uploaded!');
                            } else {
                                setFormMsg('Failed to upload PDF');
                            }
                        } catch (err) {
                            setFormMsg('Error uploading PDF');
                        }
                    }
                }} />
                <button type="submit" disabled={submitting}>Add</button>
            </form>
            {formMsg && <p className="form-msg">{formMsg}</p>}
        </div>
    );
}

export default Resources;
