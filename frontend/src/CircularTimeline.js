import React, { useState, useEffect } from 'react';
import './CircularTimeline.css';
import { auth } from './firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const HorizontalTimeline = () => {
    const [events, setEvents] = useState([]);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ year: '', label: '' });
    const [loading, setLoading] = useState(false);
    const [formMsg, setFormMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(0);

    useEffect(() => {
        fetchEvents();
        const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
        return () => unsubscribe();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/timeline-events`);
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            setEvents([]);
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
            const res = await fetch(`${API_URL}/timeline-events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    email: user.email,
                    password: adminPassword
                },
                body: JSON.stringify({ year: Number(form.year), label: form.label })
            });
            if (!res.ok) throw new Error('Failed to add event');
            setForm({ year: '', label: '' });
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
            const res = await fetch(`${API_URL}/timeline-events/${id}`, {
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

    const handlePrev = () => {
        setSelectedEvent(prev => prev > 0 ? prev - 1 : events.length - 1);
    };

    const handleNext = () => {
        setSelectedEvent(prev => prev < events.length - 1 ? prev + 1 : 0);
    };

    if (loading) return <div>Loading timeline...</div>;

    return (
        <div className="horizontal-timeline-container">
            <div className="timeline-wrapper">
                {/* Navigation Arrows */}
                <button className="timeline-nav-btn timeline-nav-prev" onClick={handlePrev}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                </button>

                <button className="timeline-nav-btn timeline-nav-next" onClick={handleNext}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                </button>

                {/* Timeline Line */}
                <div className="timeline-line">
                    <div className="timeline-progress" style={{ width: `${((selectedEvent + 1) / events.length) * 100}%` }}></div>
                </div>

                {/* Timeline Events */}
                <div className="timeline-events">
                    {events.map((event, idx) => (
                        <div
                            key={event._id || event.year}
                            className={`timeline-event-dot ${idx <= selectedEvent ? 'active' : ''} ${idx === selectedEvent ? 'selected' : ''}`}
                            onClick={() => setSelectedEvent(idx)}
                        >
                            <div className="timeline-event-date">{event.year}</div>
                            {isAdmin && (
                                <button
                                    className="timeline-delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(event._id);
                                    }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Event Details */}
                {events[selectedEvent] && (
                    <div className="timeline-event-details">
                        <div className="event-description">
                            The event of {events[selectedEvent].year}: {events[selectedEvent].label}
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Form */}
            {isAdmin && (
                <form className="timeline-admin-form" onSubmit={handleAdd}>
                    <h3>Add Timeline Event</h3>
                    <input type="number" name="year" placeholder="Year" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required />
                    <input name="label" placeholder="Description" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} required />
                    <button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Event'}</button>
                    {formMsg && <div style={{ marginTop: 8, color: formMsg.startsWith('Error') ? 'red' : 'green' }}>{formMsg}</div>}
                </form>
            )}
        </div>
    );
};

export default HorizontalTimeline; 