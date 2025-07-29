import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import './Events.css';
import eventsGif from './assets/gif/events.gif';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const UpcomingEvents = () => {
    const [events, setEvents] = useState([]);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({
        title: '',
        date: '',
        venue: '',
        googleFormLink: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formMsg, setFormMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEvents();
        const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
        return () => unsubscribe();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/events/upcoming`);
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

            setForm({ title: '', date: '', venue: '', googleFormLink: '' });
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

            setEvents(prev => prev.filter(e => e._id !== id));
            setFormMsg('Event deleted!');
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="events-loading">Loading events...</div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="events-page">
                <div className="events-gif-wrapper">
                    <img src={eventsGif} alt="Events" className="events-gif" />
                </div>
                <h1 className="events-heading">Events: Lights Ahead</h1>
                <div className="events-container">
                    <div className="events-header">
                        <h2>Upcoming Events</h2>
                    </div>

                    {events.length === 0 ? (
                        <div className="no-events">
                            <p>No upcoming events at the moment. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="events-grid">
                            {events.map(event => {
                                const eventDate = new Date(event.date);
                                const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
                                const year = eventDate.getFullYear();
                                const day = eventDate.getDate();

                                return (
                                    <div key={event._id} className="event-item">
                                        <div className="event-date-marker">
                                            <div className="event-date-month">{month}</div>
                                            <div className="event-date-year">{year}</div>
                                            <div className="event-date-day">{day}</div>
                                        </div>
                                        <div className="event-content-wrapper">
                                            <div className="event-card">
                                                <img src={event.bannerImage} alt={event.title} />
                                            </div>
                                            {event.googleFormLink && (
                                                <a
                                                    href={event.googleFormLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="event-form-link"
                                                >
                                                    Register
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {isAdmin && (
                        <div className="events-admin">
                            <form className="events-admin-form" onSubmit={handleAdd}>
                                <h3>Add New Event</h3>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Event Title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="venue"
                                    placeholder="Event Venue"
                                    value={form.venue}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="url"
                                    name="googleFormLink"
                                    placeholder="Google Form Link (optional)"
                                    value={form.googleFormLink}
                                    onChange={handleChange}
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                />
                                <button type="submit" disabled={submitting}>
                                    {submitting ? 'Adding Event...' : 'Add Event'}
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
                <Footer />
            </div>
        </>
    );
};

export default UpcomingEvents; 