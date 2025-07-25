import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import './MeetOurTeam.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const MeetOurTeam = () => {
    const [members, setMembers] = useState([]);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ name: '', designation: '', image: null });
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/team`)
            .then(res => res.json())
            .then(data => setMembers(data));
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
                setForm({ name: '', designation: '', image: null });
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

    // Find founder (first member with 'founder' in designation, case-insensitive)
    const founder = members.find(m => /founder/i.test(m.designation));
    const rest = members.filter(m => m !== founder);

    return (
        <div className="meet-our-team-root">
            <Navbar />
            <h1 className="meet-our-team-title">Our Team: Lantern bearers</h1>
            {founder && (
                <div className="team-founder-card">
                    <img src={founder.imageUrl} alt={founder.name} className="team-founder-img" />
                    <div className="team-founder-name">{founder.name}</div>
                    <div className="team-founder-designation">{founder.designation}</div>
                    {isAdmin && (
                        <button className="team-founder-delete-btn" onClick={() => handleDelete(founder._id)}>
                            Delete
                        </button>
                    )}
                </div>
            )}
            <div className="meet-our-team-grid">
                {rest.map((mem, idx) => (
                    <div className="team-member-card" key={mem._id || idx}>
                        <img src={mem.imageUrl} alt={mem.name} className="team-member-img" />
                        <div className="team-member-name">{mem.name}</div>
                        <div className="team-member-designation">{mem.designation}</div>
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
                        <input name="image" type="file" accept="image/*" onChange={handleChange} required />
                        <button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Member'}</button>
                        {formMsg && <div style={{ color: formMsg.startsWith('Error') ? 'red' : 'green' }}>{formMsg}</div>}
                    </form>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default MeetOurTeam; 