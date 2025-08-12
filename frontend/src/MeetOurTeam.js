import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import './MeetOurTeam.css';
import MeetGIF from './assets/meet-our-team.gif';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const MeetOurTeam = () => {
    const [members, setMembers] = useState([]);
    const [patronmembers, setpatronMembers] = useState([]);

    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ name: '', designation: '', email: '', contactNumber: '', image: null });
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/team`)
            .then(res => res.json())
            .then(data => setMembers(data));
    }, []);
    useEffect(() => {
        fetch(`${API_URL}/patrons`)
            .then(res => res.json())
            .then(data => setpatronMembers(data));
    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    const isAdmin = user && user.email === ADMIN_EMAIL;

    const handleChange = e => {
        const { name, value, files } = e.target;
        setForm(f => ({ ...f, [name]: files ? files[0] : value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        setFormMsg('');
        try {
            const adminPassword = prompt('Enter admin password:');
            if (!adminPassword) throw new Error('Password is required');
            let imageUrl = null;
            if (form.image) {
                const formData = new FormData();
                formData.append('image', form.image);
                formData.append('name', form.name);
                formData.append('designation', form.designation);
                formData.append('email', form.email);
                formData.append('contactNumber', form.contactNumber);
                const res = await fetch(`${API_URL}/team`, {
                    method: 'POST',
                    headers: {
                        email: user.email,
                        password: adminPassword
                    },
                    body: formData
                });
                if (!res.ok) throw new Error('Failed to add member');
                const data = await res.json();
                setMembers(m => [...m, data]);
                setForm({ name: '', designation: '', email: '', contactNumber: '', image: null });
                setFormMsg('Member added!');
            }
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };
    const handleSubmitPatron = async e => {
        e.preventDefault();
        setSubmitting(true);
        setFormMsg('');
        try {
            const adminPassword = prompt('Enter admin password:');
            if (!adminPassword) throw new Error('Password is required');
            let imageUrl = null;
            if (form.image) {
                const formData = new FormData();
                formData.append('image', form.image);
                formData.append('name', form.name);
                formData.append('designation', form.designation);
                formData.append('link', form.link);
                const res = await fetch(`${API_URL}/patrons`, {
                    method: 'POST',
                    headers: {
                        email: user.email,
                        password: adminPassword
                    },
                    body: formData
                });
                if (!res.ok) throw new Error('Failed to add member');
                const data = await res.json();
                setpatronMembers(m => [...m, data]);
                setForm({ name: '', designation: '', link: '', image: null });
                setFormMsg('Member added!');
            }
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };

    const handleDelete = async id => {
        const adminPassword = prompt('Enter admin password:');
        if (!adminPassword) return;
        try {
            const res = await fetch(`${API_URL}/team/${id}`, {
                method: 'DELETE',
                headers: {
                    email: user.email,
                    password: adminPassword
                }
            });
            if (!res.ok) throw new Error('Failed to delete');
            setMembers(m => m.filter(mem => mem._id !== id));
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    return (
        <div className="meet-our-team-root">
            <Navbar />
            <div className="meetourteam-hero-section">
                <img src={MeetGIF} alt="Timeline" className="meetourteam-gif" />
            </div>
            <div className="meet-our-team-content">
                <h1 className="meet-our-team-title">Our Team: Lantern bearers</h1>
                <div className="meet-our-team-grid">
                    {members.map((mem, idx) => (
                        <div className="team-member-card" key={mem._id || idx}>
                            <img src={mem.imageUrl} alt={mem.name} className="team-member-img" />
                            <div className="team-member-name">{mem.name}</div>
                            <div className="team-member-designation">{mem.designation}</div>
                            {mem.email && (
                                <div className="team-member-email">
                                    Email: <a href={`mailto:${mem.email}`}>{mem.email}</a>
                                </div>
                            )}
                            {mem.contactNumber && (
                                <div className="team-member-contact">
                                    Contact: <a href={`tel:${mem.contactNumber}`}>{mem.contactNumber}</a>
                                </div>
                            )}
                            {isAdmin && (
                                <button className="team-member-delete-btn" onClick={() => handleDelete(mem._id)}>Delete</button>
                            )}
                        </div>
                    ))}
                </div>
                <h1 className="meet-our-team-title">Our Patrons</h1>
                <div className="meet-our-team-grid">
                    {patronmembers.map((mem, idx) => (
                        <div className="team-member-card" key={mem._id || idx}>
                            <img src={mem.imageUrl} alt={mem.name} className="team-member-img" />
                            <div className="team-member-name">{mem.name}</div>
                            <div className="team-member-designation">{mem.designation}</div>
                            {mem.link && (
                                <div className="team-member-email">
                                    <a href={mem.link} target='_blank'>{mem.link}</a>
                                </div>
                            )}
                            {isAdmin && (
                                <button className="team-member-delete-btn" onClick={() => handleDelete(mem._id)}>Delete</button>
                            )}
                        </div>
                    ))}
                </div>
                {isAdmin && (
                    <div className="team-member-form-wrapper">
                        <h2>Add Team Member</h2>
                        <form className="team-member-form" onSubmit={handleSubmit}>
                            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                            <input name="designation" placeholder="Designation" value={form.designation} onChange={handleChange} required />
                            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
                            <input name="contactNumber" type="tel" placeholder="Contact Number" value={form.contactNumber} onChange={handleChange} />
                            <input name="image" type="file" accept="image/*" onChange={handleChange} required />
                            <button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Member'}</button>
                            {formMsg && <div style={{ color: formMsg.startsWith('Error') ? 'red' : 'green' }}>{formMsg}</div>}
                        </form>
                    </div>
                )}
                {isAdmin && (
                    <div className="team-member-form-wrapper">
                        <h2>Add Patron Member</h2>
                        <form className="team-member-form" onSubmit={handleSubmitPatron}>
                            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                            <input name="designation" placeholder="Designation" value={form.designation} onChange={handleChange} required />
                            <input name="link" type="text" placeholder="link" value={form.link} onChange={handleChange} />
                            <input name="image" type="file" accept="image/*" onChange={handleChange} required />
                            <button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Member'}</button>
                            {formMsg && <div style={{ color: formMsg.startsWith('Error') ? 'red' : 'green' }}>{formMsg}</div>}
                        </form>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default MeetOurTeam; 