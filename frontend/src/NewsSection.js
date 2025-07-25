import React, { useState, useEffect, useRef } from 'react';
import './NewsSection.css';
import { auth } from './firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const NewsSection = () => {
    const [news, setNews] = useState([]);
    const [selected, setSelected] = useState(0);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ title: '', image: null });
    const [formMsg, setFormMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef();

    useEffect(() => {
        fetchNews();
        const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
        return () => unsubscribe();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await fetch(`${API_URL}/news`);
            const data = await res.json();
            setNews(data);
        } catch (err) {
            setNews([]);
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
            formData.append('title', form.title);
            formData.append('image', form.image);
            const res = await fetch(`${API_URL}/news`, {
                method: 'POST',
                headers: {
                    email: user.email,
                    password: adminPassword
                },
                body: formData
            });
            if (!res.ok) throw new Error('Failed to add news');
            setForm({ title: '', image: null });
            if (fileInputRef.current) fileInputRef.current.value = '';
            setFormMsg('News added!');
            fetchNews();
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
            const res = await fetch(`${API_URL}/news/${id}`, {
                method: 'DELETE',
                headers: {
                    email: user.email,
                    password: adminPassword
                }
            });
            if (!res.ok) throw new Error('Failed to delete news');
            fetchNews();
            if (selected >= news.length - 1) setSelected(Math.max(0, news.length - 2));
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };

    const handleImageChange = e => {
        setForm({ ...form, image: e.target.files[0] });
    };

    return (
        <div className="news-section-root">
            <div className="news-section-header-row">
                <h2 className="news-section-title">News</h2>
                <div className="news-section-horizontal-line" />
            </div>
            <div className="news-section-main">
                <div className="news-main-left">
                    {news[selected] ? (
                        <>
                            <div className="news-main-image-placeholder">
                                <img
                                    src={news[selected].imageUrl}
                                    alt={news[selected].title}
                                    className="news-main-image"
                                />
                            </div>
                            <div className="news-main-title-placeholder">{news[selected].title}</div>
                            {isAdmin && (
                                <button className="timeline-delete-btn" style={{ marginTop: 10 }} onClick={() => handleDelete(news[selected]._id)}>Delete</button>
                            )}
                        </>
                    ) : (
                        <div className="news-main-image-placeholder" />
                    )}
                </div>
                <div className="news-main-right">
                    <div className="news-scroll-list">
                        {news.map((item, i) => (
                            <div
                                className="news-scroll-item"
                                key={item._id}
                                onClick={() => setSelected(i)}
                                style={{ border: i === selected ? '2px solid #dd783c' : 'none' }}
                            >
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="news-scroll-image-placeholder"
                                    style={{ objectFit: 'cover', width: 280, height: 200, borderRadius: 20 }}
                                />
                                <div className="news-scroll-title-placeholder">{item.title}</div>
                                {isAdmin && (
                                    <button className="timeline-delete-btn" style={{ marginTop: 4, fontSize: 12 }} onClick={e => { e.stopPropagation(); handleDelete(item._id); }}>Delete</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {isAdmin && (
                <div className="news-section-form-wrapper">
                    <form className="timeline-admin-form" onSubmit={handleAdd} style={{ maxWidth: 400 }}>
                        <h3>Add News</h3>
                        <input
                            name="title"
                            placeholder="Title"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            required
                        />
                        <button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add News'}</button>
                        {formMsg && <div style={{ marginTop: 8, color: formMsg.startsWith('Error') ? 'red' : 'green' }}>{formMsg}</div>}
                    </form>
                </div>
            )}
        </div>
    );
};

export default NewsSection; 