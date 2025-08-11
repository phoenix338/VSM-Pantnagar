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
    const [reviews, setReviews] = useState({});
    const [showForm, setShowForm] = useState({});
    const [reviewForm, setReviewForm] = useState({});

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
            // Fetch reviews for each event
            data.forEach(event => fetchReviews(event._id));
        } catch (err) {
            setEvents([]);
        }
        setLoading(false);
    };

    const fetchReviews = async (eventId) => {
        try {
            if (!user) return;
            const endpoint = user.email === ADMIN_EMAIL
                ? `/event-reviews/admin/${eventId}`
                : `/event-reviews/${eventId}`;
            const res = await fetch(`${API_URL}${endpoint}`, {
                headers: user.email === ADMIN_EMAIL
                    ? { email: user.email, password: prompt("Enter admin password:") }
                    : {}
            });
            const data = await res.json();
            setReviews(prev => ({ ...prev, [eventId]: data }));
        } catch (err) {
            console.error(err);
        }
    };

    const isAdmin = user && user.email === ADMIN_EMAIL;



    const handleSubmitReview = async (eventId) => {
        setSubmitting(true);
        setFormMsg('');
        try {
            const res = await fetch(`${API_URL}/event-reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    ...reviewForm[eventId]
                })
            });

            if (!res.ok) throw new Error('Failed to submit review');

            setFormMsg('Review submitted for approval!');
            setReviewForm(prev => ({ ...prev, [eventId]: { name: '', collegeOrOccupation: '', text: '' } }));
            fetchReviews(eventId);
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };

    const handleApprove = async (reviewId, eventId) => {
        try {
            await fetch(`${API_URL}/event-reviews/${reviewId}/approve`, {
                method: 'PATCH',
                headers: {
                    email: user.email,
                    password: prompt('Enter admin password:')
                }
            });
            fetchReviews(eventId);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReject = async (reviewId, eventId) => {
        try {
            await fetch(`${API_URL}/event-reviews/${reviewId}/reject`, {
                method: 'PATCH',
                headers: {
                    email: user.email,
                    password: prompt('Enter admin password:')
                }
            });
            fetchReviews(eventId);
        } catch (err) {
            console.error(err);
        }
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
                                            {user && (
                                                <div>
                                                    <button
                                                        onClick={() => setShowForm(prev => ({ ...prev, [event._id]: !prev[event._id] }))}
                                                    >
                                                        {showForm[event._id] ? 'Hide Review Form' : 'Write Review'}
                                                    </button>
                                                    {showForm[event._id] && (
                                                        <div className="review-form">
                                                            <input
                                                                placeholder="Your Name"
                                                                value={reviewForm[event._id]?.name || ''}
                                                                onChange={e => setReviewForm(prev => ({
                                                                    ...prev,
                                                                    [event._id]: { ...prev[event._id], name: e.target.value }
                                                                }))}
                                                            />
                                                            <input
                                                                placeholder="College / Occupation"
                                                                value={reviewForm[event._id]?.collegeOrOccupation || ''}
                                                                onChange={e => setReviewForm(prev => ({
                                                                    ...prev,
                                                                    [event._id]: { ...prev[event._id], collegeOrOccupation: e.target.value }
                                                                }))}
                                                            />
                                                            <textarea
                                                                placeholder="Write your review"
                                                                value={reviewForm[event._id]?.text || ''}
                                                                onChange={e => setReviewForm(prev => ({
                                                                    ...prev,
                                                                    [event._id]: { ...prev[event._id], text: e.target.value }
                                                                }))}
                                                            />
                                                            <button onClick={() => handleSubmitReview(event._id)} disabled={submitting}>
                                                                Submit Review
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {reviews[event._id] && (
                                                <div className="reviews-list">
                                                    <h4>Reviews</h4>
                                                    {reviews[event._id].length === 0 ? (
                                                        <p>No reviews yet.</p>
                                                    ) : (
                                                        reviews[event._id].map(r => (
                                                            <div key={r._id} className={`review-item ${r.status}`}>
                                                                <p><strong>{r.name}</strong> ({r.collegeOrOccupation})</p>
                                                                <p>{r.text}</p>
                                                                {isAdmin && r.status === 'pending' && (
                                                                    <div>
                                                                        <button onClick={() => handleApprove(r._id, event._id)}>Approve</button>
                                                                        <button onClick={() => handleReject(r._id, event._id)}>Reject</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
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
