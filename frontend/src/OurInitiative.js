import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import './OurInitiative.css';
import initiativeGif from './assets/gif/initiative.gif';
import { auth } from './firebase';
import Footer from './Footer';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
const OurInitiative = () => {
    const [initiatives, setInitiatives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ title: '', text: '', imageUrl: '' });
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formMsg, setFormMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/initiatives`)
            .then(res => res.json())
            .then(data => {
                setInitiatives(data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load initiatives');
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    const isAdmin = user && user.email === ADMIN_EMAIL;

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = e => {
        setImageFile(e.target.files[0]);
    };

    const handleAddInitiative = async e => {
        e.preventDefault();
        setSubmitting(true);
        setFormMsg('');
        let imageUrl = form.imageUrl;
        try {
            // Prompt for password once
            const adminPassword = prompt('Enter admin password:');
            if (!adminPassword) throw new Error('Password is required');
            if (imageFile) {
                setUploading(true);
                const formData = new FormData();
                formData.append('image', imageFile);
                const res = await fetch(`${API_URL}/upload-image`, {
                    method: 'POST',
                    headers: {
                        email: user.email,
                        password: adminPassword
                    },
                    body: formData
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Image upload failed');
                imageUrl = data.imageUrl;
                setUploading(false);
            }
            const res = await fetch(`${API_URL}/initiatives`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    email: user.email,
                    password: adminPassword
                },
                body: JSON.stringify({ ...form, imageUrl })
            });
            if (!res.ok) throw new Error('Failed to add initiative');
            setForm({ title: '', text: '', imageUrl: '' });
            setImageFile(null);
            setFormMsg('Initiative added!');
            // Refresh list
            const data = await res.json();
            setInitiatives(prev => [...prev, data]);
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        const password = prompt('Enter admin password to delete initiative:');
        if (!password) return;
        try {
            const res = await fetch(`${API_URL}/initiatives/${id}`, {
                method: 'DELETE',
                headers: {
                    email: user.email,
                    password
                }
            });
            if (!res.ok) throw new Error('Failed to delete initiative');
            setInitiatives(prev => prev.filter(i => i._id !== id));
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    return (
        <>
            <Navbar />
            <div className="initiative-page">
                <div className="initiative-gif-wrapper">
                    <img src={initiativeGif} alt="Our Initiative" className="initiative-gif" />
                </div>
                <h1 className="our-initiative-heading">Our Initiative</h1>
                <div className="initiatives-list">
                    {loading && <div>Loading initiatives...</div>}
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    {initiatives.map((item, idx) => (
                        <div
                            className={`initiative-row${idx % 2 === 1 ? ' even' : ''}`}
                            key={item._id || idx}
                        >
                            <div className="initiative-text-col">
                                <h2 className="initiative-heading">{`Initiative ${idx + 1}`}</h2>
                                <div className="initiative-text">{item.text}</div>
                                {isAdmin && (
                                    <button
                                        className="initiative-delete-btn"
                                        onClick={() => handleDelete(item._id)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <div className="initiative-img-col">
                                <img src={item.imageUrl} alt="Initiative" className="initiative-img" />
                            </div>
                        </div>
                    ))}
                </div>
                {isAdmin && (
                    <div className="admin-initiative-form">
                        <h3>Add Initiative</h3>
                        <form onSubmit={handleAddInitiative} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
                            <input name="title" placeholder="Initiative title" value={form.title} onChange={handleChange} required />
                            <textarea name="text" placeholder="Initiative text" value={form.text} onChange={handleChange} required style={{ minHeight: 60 }} />
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                            {uploading && <div>Uploading image...</div>}
                            <button type="submit" disabled={submitting || uploading}>{submitting ? 'Adding...' : 'Add Initiative'}</button>
                            {formMsg && <div style={{ color: formMsg.startsWith('Error') ? 'red' : 'green' }}>{formMsg}</div>}
                        </form>
                    </div>
                )}
                <Footer />

            </div>
        </>
    );
};

export default OurInitiative; 