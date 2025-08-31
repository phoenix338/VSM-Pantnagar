import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import './MeetOurTeam.css';
import MeetGIF from './assets/meetourteam1.mp4';
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
        document.title = "Meet Our Team | VSM";
    }, []);
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
    const handlepatronDelete = async id => {
        const adminPassword = prompt('Enter admin password:');
        if (!adminPassword) return;
        try {
            const res = await fetch(`${API_URL}/patrons/${id}`, {
                method: 'DELETE',
                headers: {
                    email: user.email,
                    password: adminPassword
                }
            });
            if (!res.ok) throw new Error('Failed to delete');
            setpatronMembers(m => m.filter(mem => mem._id !== id));
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    return (
        <div className="meet-our-team-root">
            <Navbar />
            <div className="meetourteam-hero-section">
                <video
                    src={require('./assets/meetourteam1.mp4')}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
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
                                    <a href={mem.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                        {/* LinkedIn SVG */}
                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48">
                                            <path fill="#0288D1" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path>
                                            <path fill="#FFF" d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"></path>
                                        </svg>
                                    </a>

                                </div>
                            )}
                            {isAdmin && (
                                <button className="team-member-delete-btn" onClick={() => handlepatronDelete(mem._id)}>Delete</button>
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