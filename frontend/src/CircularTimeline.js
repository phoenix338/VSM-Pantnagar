import React, { useState, useEffect } from 'react';
import './CircularTimeline.css';
import { auth } from './firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const radius = 100;
const center = 150;
const outerRadius = 130;

function polarToCartesian(cx, cy, r, angleDeg) {
    const angle = (angleDeg - 90) * (Math.PI / 180.0);
    return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
    };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y,
        "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
}

const CircularTimeline = () => {
    const [events, setEvents] = useState([]);
    const [hoveredSector, setHoveredSector] = useState(null);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ year: '', label: '' });
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

    // If hovering, show up to hoveredSector; else show first 3
    const visibleCount = hoveredSector !== null ? hoveredSector + 1 : 3;
    const anglePerEvent = events.length > 0 ? 360 / events.length : 1;
    const innerColor = "#fef5f1";
    const arcColor = "#d3d3d3";
    const labelBgPadding = 10;
    const labelBgHeight = 32;

    return (
        <div className="timeline-container">
            {loading ? (
                <div>Loading timeline...</div>
            ) : (
                <svg
                    width="500"
                    height="500"
                    onMouseLeave={() => setHoveredSector(null)}
                    style={{ cursor: 'pointer' }}
                >
                    {/* Inner circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill={innerColor}
                        stroke="black"
                        strokeWidth="2"
                    />
                    {/* Outer arcs */}
                    {events.map((event, idx) => {
                        const startAngle = idx * anglePerEvent;
                        const endAngle = startAngle + anglePerEvent;
                        const path = describeArc(center, center, outerRadius, startAngle, endAngle);
                        const labelAngle = (startAngle + endAngle) / 2;
                        // Position the label a bit further from the line
                        const labelPos = polarToCartesian(center, center, outerRadius + 60, labelAngle);
                        const lineEnd = polarToCartesian(center, center, outerRadius + 30, labelAngle);
                        const isVisible = idx < visibleCount;
                        // Estimate label width for background
                        const labelText = `${event.year}: ${event.label}`;
                        const labelWidth = Math.max(120, labelText.length * 9);
                        return (
                            <g key={event._id || event.year}>
                                <path
                                    d={path}
                                    fill="none"
                                    stroke={arcColor}
                                    strokeWidth={34}
                                    opacity={isVisible ? 1 : 0.2}
                                    onMouseEnter={() => setHoveredSector(idx)}
                                    style={{ cursor: idx > 2 ? 'pointer' : 'default' }}
                                />
                                {isVisible && (
                                    <>
                                        <line
                                            x1={lineEnd.x}
                                            y1={lineEnd.y}
                                            x2={labelPos.x}
                                            y2={labelPos.y}
                                            stroke="black"
                                            strokeWidth={3}
                                        />
                                        {/* Label background */}
                                        <rect
                                            className="timeline-event-label-bg"
                                            x={labelPos.x - (labelWidth / 2)}
                                            y={labelPos.y - labelBgHeight / 2}
                                            width={labelWidth}
                                            height={labelBgHeight}
                                            rx={12}
                                        />
                                        {/* Label text */}
                                        <text
                                            className="timeline-event-text"
                                            x={labelPos.x}
                                            y={labelPos.y + 6}
                                            textAnchor="middle"
                                            alignmentBaseline="middle"
                                        >
                                            {labelText}
                                        </text>
                                        {isAdmin && (
                                            <foreignObject x={labelPos.x - 30} y={labelPos.y + 18} width="60" height="30">
                                                <button className="timeline-delete-btn" onClick={e => { e.stopPropagation(); handleDelete(event._id); }}>Delete</button>
                                            </foreignObject>
                                        )}
                                    </>
                                )}
                            </g>
                        );
                    })}
                </svg>
            )}
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

export default CircularTimeline; 