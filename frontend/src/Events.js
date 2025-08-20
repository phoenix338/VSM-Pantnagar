import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import './Events.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const Events = () => {
    const [events, setEvents] = useState([]);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({
        title: '',
        date: '',
        venue: '',
        googleFormLink: '',
        category: 'upcoming'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formMsg, setFormMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchEvents();
        const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
        return () => unsubscribe();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/events`);
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            setEvents([]);
        }
        setLoading(false);
    };

    const isAdmin = user && user.email === ADMIN_EMAIL;

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleAdd = async e => {
        e.preventDefault();
        setSubmitting(true);
        setFormMsg('');
        try {
            if (!selectedFile) {
                throw new Error('Banner image is required');
            }

            const adminPassword = prompt('Enter admin password:');
            if (!adminPassword) throw new Error('Password is required');

            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('date', form.date);
            formData.append('venue', form.venue);
            formData.append('googleFormLink', form.googleFormLink);
            formData.append('category', form.category);
            formData.append('bannerImage', selectedFile);

            const res = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: {
                    email: user.email,
                    password: adminPassword
                },
                body: formData
            });

            if (!res.ok) throw new Error('Failed to add event');

            setForm({ title: '', date: '', venue: '', googleFormLink: '', category: 'upcoming' });
            setSelectedFile(null);
            setFormMsg('Event added!');
            fetchEvents();
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

            const res = await fetch(`${API_URL}/events/${id}`, {
                method: 'DELETE',
                headers: {
                    email: user.email,
                    password: adminPassword
                }
            });
            if (!res.ok) throw new Error('Failed to delete event');
            fetchEvents();
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };

    const filteredEvents = selectedCategory === 'all'
        ? events
        : events.filter(event => event.category === selectedCategory);

    if (loading) return <div className="events-loading">Loading events...</div>;

    return (
        <div className="events-container">
            <div className="events-header">
                <h1>Events</h1>
                <p>Discover our upcoming and past events</p>
            </div>

            {/* Category Filter */}
            <div className="events-filter">
                <button
                    className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                >
                    All Events
                </button>
                <button
                    className={`filter-btn ${selectedCategory === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('upcoming')}
                >
                    Upcoming Events
                </button>
                <button
                    className={`filter-btn ${selectedCategory === 'previous' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('previous')}
                >
                    Previous Events
                </button>
                <button
                    className={`filter-btn ${selectedCategory === 'other' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('other')}
                >
                    Other Events
                </button>
            </div>

            {/* Events Grid */}
            <div className="events-grid">
                {filteredEvents.map(event => (
                    <div key={event._id} className="event-card">
                        <div className="event-banner">
                            <img src={event.bannerImage} alt={event.title} />
                            {isAdmin && (
                                <button
                                    className="event-delete-btn"
                                    onClick={() => handleDelete(event._id)}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        <div className="event-content">
                            <h3 className="event-title">{event.title}</h3>
                            <div className="event-details">
                                <div className="event-date">
                                    <span className="label">Date:</span> {event.date}
                                </div>
                                <div className="event-venue">
                                    <span className="label">Venue:</span> {event.venue}
                                </div>
                            </div>
                            <a
                                href={event.googleFormLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="event-form-link"
                            >
                                Register Now
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Admin Form */}
            {isAdmin && (
                <div className="events-admin">
                    <form className="events-admin-form" onSubmit={handleAdd}>
                        <h3>Add New Event</h3>
                        <input
                            type="text"
                            name="title"
                            placeholder="Event Title"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            name="date"
                            placeholder="Event Date"
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            name="venue"
                            placeholder="Event Venue"
                            value={form.venue}
                            onChange={e => setForm({ ...form, venue: e.target.value })}
                            required
                        />
                        <input
                            type="url"
                            name="googleFormLink"
                            placeholder="Google Form Link"
                            value={form.googleFormLink}
                            onChange={e => setForm({ ...form, googleFormLink: e.target.value })}
                            required
                        />
                        <select
                            name="category"
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            required
                        >
                            <option value="upcoming">Upcoming Event</option>
                            <option value="previous">Previous Event</option>
                            <option value="other">Other Event</option>
                        </select>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                        />

                        <button type="submit" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Event'}
                        </button>
                        {formMsg && (
                            <div className={`form-msg ${formMsg.startsWith('Error') ? 'error' : 'success'}`}>
                                {formMsg}
                            </div>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};

export default Events; 