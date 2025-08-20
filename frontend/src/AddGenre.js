import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import './AdminForms.css';
import { Link } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const AddGenre = () => {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({
        name: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
        return () => unsubscribe();
    }, []);

    const isAdmin = user && user.email === ADMIN_EMAIL;

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormMsg('');

        try {

            const adminPassword = prompt('Enter admin password:');
            if (!adminPassword) throw new Error('Password is required');

            const formData = new FormData();
            formData.append('name', form.name);

            const res = await fetch(`${API_URL}/genres`, {
                method: 'POST',
                headers: {
                    email: user.email,
                    password: adminPassword
                },
                body: formData
            });

            if (!res.ok) throw new Error('Failed to add genre');

            setForm({ name: '' });
            setFormMsg('Genre added successfully!');
        } catch (err) {
            setFormMsg('Error: ' + err.message);
        }
        setSubmitting(false);
    };

    if (!isAdmin) {
        return (
            <>
                <Navbar />
                <div className="admin-access-denied">
                    <h2>Access Denied</h2>
                    <p>You need admin privileges to access this page.</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="admin-form-container">
                <div className="admin-form-wrapper">
                    <h1>Add New Genre</h1>
                    <form className="admin-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Genre Name</label>
                            <input
                                type="text"
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                placeholder="Enter genre name"
                            />
                        </div>

                        {/* <div className="form-group">
                            <label htmlFor="image">Genre Image</label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                            />
                            <p className="form-help">Upload a square image for best results</p>
                        </div> */}

                        <button type="submit" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Genre'}
                        </button>
                        <Link to="/books">
                            <button type="button">
                                Cancel
                            </button>
                        </Link>

                        {formMsg && (
                            <div className={`form-msg ${formMsg.includes('Error') ? 'error' : 'success'}`}>
                                {formMsg}
                            </div>
                        )}
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AddGenre; 