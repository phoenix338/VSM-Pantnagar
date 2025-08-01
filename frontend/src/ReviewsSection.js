import React, { useState, useEffect, useRef } from 'react';
import './ReviewsSection.css';
import { auth } from './firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const ReviewsSection = () => {
    const [reviews, setReviews] = useState([]);
    const [selected, setSelected] = useState(0);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ name: '', designation: '', title: '', text: '', image: null });
    const [formMsg, setFormMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef();

    useEffect(() => {
        fetchReviews();
        const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
        return () => unsubscribe();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${API_URL}/reviews`);
            const data = await res.json();
            setReviews(data);
        } catch (err) {
            setReviews([]);
        }
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
            formData.append('name', form.name);
            formData.append('designation', form.designation);
            formData.append('title', form.title);
            formData.append('text', form.text);
            formData.append('image', form.image);
            const res = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    email: user.email,
                    password: adminPassword
                },
                body: formData
            });
            if (!res.ok) throw new Error('Failed to add review');
            setForm({ name: '', designation: '', title: '', text: '', image: null });
            if (fileInputRef.current) fileInputRef.current.value = '';
            setFormMsg('Review added!');
            fetchReviews();
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };

    const handleDelete = async id => {
        setSubmitting(true);
        setFormMsg('');
        try {
            const adminPassword = prompt('Enter admin password:');
            if (!adminPassword) throw new Error('Password is required');
            const res = await fetch(`${API_URL}/reviews/${id}`, {
                method: 'DELETE',
                headers: {
                    email: user.email,
                    password: adminPassword
                }
            });
            if (!res.ok) throw new Error('Failed to delete review');
            fetchReviews();
            if (selected >= reviews.length - 1) setSelected(Math.max(0, reviews.length - 2));
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };

    const handleImageChange = e => {
        setForm({ ...form, image: e.target.files[0] });
    };

    return (
        <div className="reviews-section-root">
            <div className="reviews-section-header-row">
                <h2 className="reviews-section-title">Reviews</h2>
                <div className="reviews-section-horizontal-line" />
            </div>
            <div className="reviews-section-main">
                <div className="reviews-main-left">
                    {reviews[selected] ? (
                        <div className="reviews-main-card">
                            <div className="reviews-main-name">{reviews[selected].name}</div>
                            <div className="reviews-main-divider" />
                            <div className="reviews-main-designation">
                                {reviews[selected].designation.split('\n').map((line, idx) => (
                                    <div key={idx}>{line}</div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="reviews-main-card-placeholder" />
                    )}
                </div>
                <div className="reviews-main-center">
                    {reviews[selected] ? (
                        <>
                            <div className="reviews-main-title">{reviews[selected].title}</div>
                            <div className="reviews-main-text">{reviews[selected].text}</div>
                        </>
                    ) : (
                        <>
                            <div className="reviews-main-title">The Great Start!</div>
                            <div className="reviews-main-text">"VSM is a thought process that connects to the ‘rest of the world’ and beyond, by continual engagement with meaningful activities, leading us to the path of growth and integral humanism."</div>
                        </>
                    )}
                </div>
                <div className="reviews-section-divider" />
                <div className="reviews-main-right">
                    <div className="reviews-scroll-list">
                        {reviews.map((item, i) => (
                            <div
                                className="reviews-scroll-item"
                                key={item._id}
                                onClick={() => setSelected(i)}
                                style={{ border: i === selected ? '2px solid #dd783c' : '1.5px solid #e3b48a', position: 'relative' }}
                            >
                                <div className="reviews-scroll-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div className="reviews-scroll-name">{item.name}</div>
                                        <div className="reviews-scroll-designation">
                                            {item.designation.split('\n').map((line, idx) => (
                                                <div key={idx}>{line}</div>
                                            ))}
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <button className="timeline-delete-btn" style={{ alignSelf: 'flex-end', position: 'static' }} onClick={e => { e.stopPropagation(); handleDelete(item._id); }}>Delete</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {isAdmin && (
                <div className="reviews-section-form-wrapper">
                    <form className="timeline-admin-form" onSubmit={handleAdd} style={{ maxWidth: 400 }}>
                        <h3>Add Review</h3>
                        <input
                            name="name"
                            placeholder="Name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                        />
                        <textarea
                            name="designation"
                            placeholder="Designation"
                            value={form.designation}
                            onChange={e => setForm({ ...form, designation: e.target.value })}
                            rows={2}
                            required
                        />
                        <input
                            name="title"
                            placeholder="Review Title"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                        />
                        <textarea
                            name="text"
                            placeholder="Review Text"
                            value={form.text}
                            onChange={e => setForm({ ...form, text: e.target.value })}
                            rows={4}
                            required
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            required
                        />
                        <button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Review'}</button>
                        {formMsg && <div style={{ marginTop: 8, color: formMsg.startsWith('Error') ? 'red' : 'green' }}>{formMsg}</div>}
                    </form>
                </div>
            )}
        </div>
    );
};

export default ReviewsSection; 