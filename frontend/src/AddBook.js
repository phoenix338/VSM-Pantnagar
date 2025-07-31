import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import './AdminForms.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const AddBook = () => {
    const [user, setUser] = useState(null);
    const [genres, setGenres] = useState([]);
    const [form, setForm] = useState({
        title: '',
        genre: '',
        previewDescription: '',
        isMainBook: false
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState('');

    useEffect(() => {
        fetchGenres();
        const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
        return () => unsubscribe();
    }, []);

    const fetchGenres = async () => {
        try {
            const res = await fetch(`${API_URL}/genres`);
            const data = await res.json();
            setGenres(data);
        } catch (err) {
            console.error('Error fetching genres:', err);
        }
    };

    const isAdmin = user && user.email === ADMIN_EMAIL;

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormMsg('');

        try {
            if (!selectedFile) {
                throw new Error('Book front page image is required');
            }

            if (!form.genre) {
                throw new Error('Please select a genre');
            }

            const adminPassword = prompt('Enter admin password:');
            if (!adminPassword) throw new Error('Password is required');

            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('genre', form.genre);
            formData.append('previewDescription', form.previewDescription);
            formData.append('isMainBook', form.isMainBook);
            formData.append('frontPageImage', selectedFile);

            const res = await fetch(`${API_URL}/books`, {
                method: 'POST',
                headers: {
                    email: user.email,
                    password: adminPassword
                },
                body: formData
            });

            if (!res.ok) throw new Error('Failed to add book');

            setForm({
                title: '',
                genre: '',
                previewDescription: '',
                isMainBook: false
            });
            setSelectedFile(null);
            setFormMsg('Book added successfully!');
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
                    <h1>Add New Book</h1>
                    <form className="admin-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">Book Title</label>
                            <input
                                type="text"
                                id="title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                                placeholder="Enter book title"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="genre">Genre</label>
                            <select
                                id="genre"
                                value={form.genre}
                                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                                required
                            >
                                <option value="">Select a genre</option>
                                {genres.map(genre => (
                                    <option key={genre._id} value={genre._id}>
                                        {genre.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="previewDescription">Preview Description</label>
                            <textarea
                                id="previewDescription"
                                value={form.previewDescription}
                                onChange={(e) => setForm({ ...form, previewDescription: e.target.value })}
                                required
                                placeholder="Enter book preview description"
                                rows="4"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="isMainBook">
                                <input
                                    type="checkbox"
                                    id="isMainBook"
                                    checked={form.isMainBook}
                                    onChange={(e) => setForm({ ...form, isMainBook: e.target.checked })}
                                />
                                Set as main book for this genre (will be displayed in center)
                            </label>
                        </div>

                        <div className="form-group">
                            <label htmlFor="frontPageImage">Book Front Page Image</label>
                            <input
                                type="file"
                                id="frontPageImage"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                            />
                            <p className="form-help">Upload the front page image of the book</p>
                        </div>

                        <button type="submit" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Book'}
                        </button>

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

export default AddBook; 