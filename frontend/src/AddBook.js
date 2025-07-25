import React, { useState } from 'react';

function AddBook() {
    const [form, setForm] = useState({ title: '', author: '', coverImage: '', description: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch(process.env.REACT_APP_API_URL + '/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Failed to add book');
            setMessage('Book added successfully!');
            setForm({ title: '', author: '', coverImage: '', description: '' });
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: 400, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24 }}>
            <h2 style={{ fontFamily: 'Arimo, sans-serif', color: '#DD783C', fontWeight: 700, fontSize: 24, marginBottom: 18 }}>Add New Book (Admin)</h2>
            <form onSubmit={handleSubmit}>
                <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                <input name="author" placeholder="Author" value={form.author} onChange={handleChange} required style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                <input name="coverImage" placeholder="Cover Image URL" value={form.coverImage} onChange={handleChange} style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 8, background: '#DD783C', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer' }}>{loading ? 'Adding...' : 'Add Book'}</button>
            </form>
            {message && <div style={{ marginTop: 16, color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</div>}
        </div>
    );
}

export default AddBook; 