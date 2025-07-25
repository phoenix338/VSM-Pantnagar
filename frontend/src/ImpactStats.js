import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import './ImpactStats.css';

// Hardcoded icons and labels for each stat
import peopleIcon from './assets/famicons_people-outline.png';
import microphoneIcon from './assets/Microphone.png';
import peopleImpactIcon from './assets/People.png';
import hoursIcon from './assets/Alarm Clock.png';
import donorsIcon from './assets/Dollar Bag.png';
import yearsIcon from './assets/bx_calendar.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

const impactItems = [
    { key: 'volunteers', icon: peopleIcon, label: 'Volunteers Engaged' },
    { key: 'events', icon: microphoneIcon, label: 'Events Conducted' },
    { key: 'people', icon: peopleImpactIcon, label: 'People Impacted' },
    { key: 'hours', icon: hoursIcon, label: 'Hours Contributed' },
    { key: 'donors', icon: donorsIcon, label: 'People Donated' },
    { key: 'years', icon: yearsIcon, label: 'Years' },
];

const ImpactStats = ({ showEdit = true }) => {
    const [impact, setImpact] = useState(null);
    const [editIdx, setEditIdx] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [user, setUser] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/impact`)
            .then(res => res.json())
            .then(data => setImpact(data));
    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    const isAdmin = user && user.email === ADMIN_EMAIL && showEdit;

    const handleEdit = idx => {
        setEditIdx(idx);
        setEditValue(impact[impactItems[idx].key]);
    };

    const handleSave = async idx => {
        setSaving(true);
        const updated = { ...impact, [impactItems[idx].key]: editValue };
        try {
            const res = await fetch(`${API_URL}/impact`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    email: user.email,
                    password: prompt('Enter admin password to edit impact stats:')
                },
                body: JSON.stringify(updated)
            });
            if (!res.ok) throw new Error('Failed to update');
            setImpact(updated);
            setEditIdx(null);
        } catch (err) {
            alert('Error: ' + err.message);
        }
        setSaving(false);
    };

    if (!impact) return null;

    return (
        <div className="impact-stats-row">
            {impactItems.map((item, idx) => (
                <div className="impact-stat-box" key={item.key}>
                    <div className="impact-stat-icons-row">
                        <img src={item.icon} alt={item.label} className="impact-stat-icon" />
                        <img src={item.icon} alt={item.label} className="impact-stat-icon" />
                        <img src={item.icon} alt={item.label} className="impact-stat-icon" />
                    </div>
                    {editIdx === idx ? (
                        <>
                            <input
                                className="impact-stat-input"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                disabled={saving}
                                autoFocus
                            />
                            <div className="impact-stat-edit-btns">
                                <button onClick={() => handleSave(idx)} disabled={saving}>Save</button>
                                <button onClick={() => setEditIdx(null)} disabled={saving}>Cancel</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="impact-stat-value">{impact[item.key]}</div>
                            <div className="impact-stat-label">{item.label}</div>
                            {isAdmin && (
                                <button className="impact-stat-edit-btn" onClick={() => handleEdit(idx)}>
                                    Edit
                                </button>
                            )}
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ImpactStats; 