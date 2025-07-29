import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import './Events.css';
import eventsGif from './assets/gif/events.gif';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const PreviousEvents = () => {
    const [events, setEvents] = useState([]);
    const [user, setUser] = useState(null);
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
            const res = await fetch(`${API_URL}/events/previous`);
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            setEvents([]);
        }
        setLoading(false);
    };

    const isAdmin = user && user.email === ADMIN_EMAIL;

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
                        <h2>Previous Events</h2>
                    </div>

                    {events.length === 0 ? (
                        <div className="no-events">
                            <p>No previous events to display.</p>
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
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {formMsg && (
                        <div className={`form-msg ${formMsg.startsWith('Error') ? 'error' : 'success'}`}>
                            {formMsg}
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </>
    );
};

export default PreviousEvents; 