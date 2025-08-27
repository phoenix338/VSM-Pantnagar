import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { auth } from './firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import './Events.css';
// import eventsGif from './assets/gif/events.gif';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const UpcomingEvents = () => {
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
    const location = useLocation();
    const previousEventsRef = useRef(null);

    useEffect(() => {
        fetchEvents();
        const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Scroll to previous events section if specified
        if (location.state?.scrollTo === 'previous') {
            setTimeout(() => {
                if (previousEventsRef.current) {
                    previousEventsRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 500);
        }
    }, [location.state, events]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            // Fetch both upcoming and previous events
            const [upcomingRes, previousRes] = await Promise.all([
                fetch(`${API_URL}/events/upcoming`),
                fetch(`${API_URL}/events/previous`)
            ]);

            const upcomingData = await upcomingRes.json();
            const previousData = await previousRes.json();

            // Combine both arrays into one
            const allEvents = [...upcomingData, ...previousData];
            setEvents(allEvents);
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
            const res = await fetch(`${API_URL}/events/${id}`, {
                method: 'DELETE',
                headers: {
                    email: user.email
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


    // Review logic for previous events
    const [reviews, setReviews] = useState({});
    const [showForm, setShowForm] = useState({});
    const [reviewForm, setReviewForm] = useState({});
    const [submittingReview, setSubmittingReview] = useState(false);
    const [formMsgReview, setFormMsgReview] = useState('');
    const [adminReviewError, setAdminReviewError] = useState('');

    useEffect(() => {
        // Fetch reviews for each previous event
        const prevEvents = events.filter(event => new Date(event.date) < new Date());
        if (prevEvents.length > 0) {
            prevEvents.forEach(event => fetchReviews(event._id));
        }
    }, [events]);

    // Assuming you already have isAdmin state from your auth context/session
    const fetchReviews = async (eventId) => {
        setAdminReviewError('');
        try {
            const res = await fetch(`${API_URL}/event-reviews/${eventId}`);
            const data = await res.json();

            const filteredData = isAdmin
                ? data
                : data.filter(rev => rev.status === 'approved');

            setReviews(prev => ({
                ...prev,
                [eventId]: filteredData
            }));
        } catch (err) {
            setAdminReviewError('Error fetching reviews.');
            console.error(err);
        }
    };

    // Approve review
    const handleApproveReview = async (eventId, reviewId) => {
        try {
            const res = await fetch(`${API_URL}/event-reviews/${reviewId}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error('Failed to approve review');

            setReviews(prev => ({
                ...prev,
                [eventId]: prev[eventId].map(rev =>
                    rev._id === reviewId ? { ...rev, status: 'approved' } : rev
                )
            }));
        } catch (err) {
            console.error(err);
            alert('Error approving review');
        }
    };

    // Reject review
    const handleRejectReview = async (eventId, reviewId) => {
        try {
            const res = await fetch(`${API_URL}/event-reviews/${reviewId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to reject review');

            setReviews(prev => ({
                ...prev,
                [eventId]: prev[eventId].filter(rev => rev._id !== reviewId)
            }));
        } catch (err) {
            console.error(err);
            alert('Error rejecting review');
        }
    };


    const handleSubmitReview = async (eventId) => {
        setSubmittingReview(true);
        setFormMsgReview('');
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
            setFormMsgReview('Review submitted for approval!');
            setReviewForm(prev => ({ ...prev, [eventId]: { name: '', collegeOrOccupation: '', text: '' } }));
            fetchReviews(eventId);
        } catch (err) {
            setFormMsgReview('Error: ' + err.message);
        }
        setSubmittingReview(false);
    };

    return (
        <>
            <Navbar />
            <div className="events-page">
                <div className="events-gif-wrapper">
                    <video
                        src={require('./assets/upevents.mp4')}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="video-size"
                    />
                    {/* <img src={eventsGif} alt="Events" className="events-gif" /> */}
                </div>
                <div className="events-container">
                    <h1 className="events-heading">Upcoming and Previous Events</h1>

                    <div className="events-header">
                        <h2>Upcoming Events</h2>
                    </div>

                    {events.filter(event => new Date(event.date) >= new Date()).length === 0 ? (
                        <div className="no-events">
                            <p>No upcoming events at the moment. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="events-grid">
                            {events.filter(event => new Date(event.date) >= new Date()).map(event => {
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
                                            {/* Admin delete button for upcoming events */}
                                            {isAdmin && (
                                                <button
                                                    className="event-delete-btn"
                                                    style={{ marginTop: '10px' }}
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this event?')) {
                                                            const adminPassword = prompt('Enter admin password:');
                                                            if (!adminPassword) return;
                                                            setSubmitting(true);
                                                            setFormMsg('');
                                                            fetch(`${API_URL}/events/${event._id}`, {
                                                                method: 'DELETE',
                                                                headers: {
                                                                    email: user.email,
                                                                    password: adminPassword
                                                                }
                                                            })
                                                                .then(res => {
                                                                    if (!res.ok) throw new Error('Failed to delete event');
                                                                    setEvents(prev => prev.filter(e => e._id !== event._id));
                                                                    setFormMsg('Event deleted!');
                                                                })
                                                                .catch(err => setFormMsg('Error: ' + err.message))
                                                                .finally(() => setSubmitting(false));
                                                        }
                                                    }}
                                                    disabled={submitting}
                                                >Delete Event</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="events-header" ref={previousEventsRef}>
                        <h2>Previous Events</h2>
                    </div>

                    {events
                        .filter(event => new Date(event.date) < new Date()) // past events
                        .map(event => {
                            const eventDate = new Date(event.date);
                            const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
                            const year = eventDate.getFullYear();
                            const day = eventDate.getDate();

                            const eventReviews = reviews[event._id] || [];
                            const isFormVisible = showForm[event._id] || false;
                            const reviewData = reviewForm[event._id] || { name: '', collegeOrOccupation: '', text: '' };

                            // Only show reviews section if logged in
                            if (!user) {
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
                                            {/* Admin delete button for previous events */}
                                            {isAdmin && (
                                                <button
                                                    className="event-delete-btn"
                                                    style={{ marginTop: '10px' }}
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this event?')) {
                                                            const adminPassword = prompt('Enter admin password:');
                                                            if (!adminPassword) return;
                                                            setSubmitting(true);
                                                            setFormMsg('');
                                                            fetch(`${API_URL}/events/${event._id}`, {
                                                                method: 'DELETE',
                                                                headers: {
                                                                    email: user.email,
                                                                    password: adminPassword
                                                                }
                                                            })
                                                                .then(res => {
                                                                    if (!res.ok) throw new Error('Failed to delete event');
                                                                    setEvents(prev => prev.filter(e => e._id !== event._id));
                                                                    setFormMsg('Event deleted!');
                                                                })
                                                                .catch(err => setFormMsg('Error: ' + err.message))
                                                                .finally(() => setSubmitting(false));
                                                        }
                                                    }}
                                                    disabled={submitting}
                                                >Delete Event</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

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

                                        {/* Reviews List */}
                                        <div className="event-reviews">
                                            {eventReviews.length > 0 ? (
                                                eventReviews.map((rev) => (
                                                    <div key={rev._id} className="review-card">
                                                        <p className="review-text">"{rev.text}"</p>
                                                        <p className="review-author">
                                                            — {rev.name}, {rev.collegeOrOccupation}
                                                        </p>

                                                        {/* Admin controls */}
                                                        {isAdmin && (
                                                            <div className="admin-review-actions">
                                                                {rev.status === 'pending' && (
                                                                    <>
                                                                        <button onClick={() => handleApproveReview(event._id, rev._id)}>
                                                                            Approve
                                                                        </button>
                                                                        <button onClick={() => handleRejectReview(event._id, rev._id)}>
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {rev.status === 'approved' && (
                                                                    <span className="status approved">✅ Approved</span>
                                                                )}
                                                                {rev.status === 'rejected' && (
                                                                    <span className="status rejected">❌ Rejected</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-reviews">No reviews yet.</p>
                                            )}
                                        </div>

                                        {/* Only normal users see "Write a Review" */}
                                        {!isAdmin && (
                                            <>
                                                <a
                                                    className="toggle-review-btn"
                                                    onClick={() =>
                                                        setShowForm(prev => ({
                                                            ...prev,
                                                            [event._id]: !isFormVisible
                                                        }))
                                                    }
                                                >
                                                    {isFormVisible ? 'Hide Review' : 'Write a Review'}
                                                </a>

                                                {/* Review Form */}
                                                {isFormVisible && (
                                                    <div className="review-form">
                                                        <input
                                                            type="text"
                                                            placeholder="Your Name"
                                                            value={reviewData.name}
                                                            onChange={(e) =>
                                                                setReviewForm(prev => ({
                                                                    ...prev,
                                                                    [event._id]: { ...reviewData, name: e.target.value }
                                                                }))
                                                            }
                                                            required
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="College / Occupation"
                                                            value={reviewData.collegeOrOccupation}
                                                            onChange={(e) =>
                                                                setReviewForm(prev => ({
                                                                    ...prev,
                                                                    [event._id]: { ...reviewData, collegeOrOccupation: e.target.value }
                                                                }))
                                                            }
                                                            required
                                                        />
                                                        <textarea
                                                            placeholder="Your Review"
                                                            value={reviewData.text}
                                                            onChange={(e) =>
                                                                setReviewForm(prev => ({
                                                                    ...prev,
                                                                    [event._id]: { ...reviewData, text: e.target.value }
                                                                }))
                                                            }
                                                            required
                                                        ></textarea>
                                                        <button
                                                            onClick={() => handleSubmitReview(event._id)}
                                                            disabled={submittingReview}
                                                        >
                                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                                        </button>
                                                        {formMsgReview && <p className="form-msg">{formMsgReview}</p>}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {/* Admin delete button for previous events */}
                                        {isAdmin && (
                                            <button
                                                className="event-delete-btn"
                                                style={{ marginTop: '10px' }}
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this event?')) {
                                                        const adminPassword = prompt('Enter admin password:');
                                                        if (!adminPassword) return;
                                                        setSubmitting(true);
                                                        setFormMsg('');
                                                        fetch(`${API_URL}/events/${event._id}`, {
                                                            method: 'DELETE',
                                                            headers: {
                                                                email: user.email,
                                                                password: adminPassword
                                                            }
                                                        })
                                                            .then(res => {
                                                                if (!res.ok) throw new Error('Failed to delete event');
                                                                setEvents(prev => prev.filter(e => e._id !== event._id));
                                                                setFormMsg('Event deleted!');
                                                            })
                                                            .catch(err => setFormMsg('Error: ' + err.message))
                                                            .finally(() => setSubmitting(false));
                                                    }
                                                }}
                                                disabled={submitting}
                                            >Delete Event</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}




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
                                <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                                    Image should look good if dimensions are <b>1440×500px</b>. <br />
                                    Supported formats: <b>JPG, JPEG, PNG</b>.
                                </p>
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
