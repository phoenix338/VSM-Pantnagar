import React, { useState } from 'react';
import { useEffect } from "react";
import Navbar from './Navbar';
import Footer from './Footer';
import './ContactUs.css';
import contactGif from './assets/contactus.gif';
import { auth } from "./firebase";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [faqs, setFaqs] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ question: "", answer: "" });
    const [formMsg, setFormMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);  // which faq is being edited
    const [editedQuestion, setEditedQuestion] = useState("");
    const [editedAnswer, setEditedAnswer] = useState(""); // temporary input
    useEffect(() => {
        fetchFaqs();
        const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
        return () => unsubscribe();
    }, []);

    const fetchFaqs = async () => {
        try {
            const res = await fetch(`${API_URL}/faq`);
            const data = await res.json();
            setFaqs(data);
        } catch {
            setFaqs([]);
        }
    };

    const isAdmin = user && user.email === ADMIN_EMAIL;

    const handleAdd = async e => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/faq`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (!res.ok) throw new Error("Failed to add FAQ");
            const newFaq = await res.json();
            setFaqs([newFaq, ...faqs]);
            setForm({ question: "", answer: "" });
            setFormMsg("FAQ added!");
        } catch (err) {
            setFormMsg("Error: " + err.message);
        }
        setSubmitting(false);
    };
    const handleSave = async (faqId) => {
        try {
            const res = await fetch(`${API_URL}/faq/${faqId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: editedQuestion, answer: editedAnswer }),
            });

            if (!res.ok) {
                throw new Error("Failed to update FAQ");
            }

            // update local state
            setFaqs(faqs.map(f => f._id === faqId ? { ...f, question: editedQuestion, answer: editedAnswer } : f));
            setEditingFaq(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async id => {
        if (!window.confirm("Delete this FAQ?")) return;
        try {
            await fetch(`${API_URL}/faq/${id}`, { method: "DELETE" });
            setFaqs(faqs.filter(f => f._id !== id));
        } catch (err) {
            alert("Error deleting: " + err.message);
        }
    };
    const [expandedFaq, setExpandedFaq] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
            alert('Please fill in all fields.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address.');
            return;
        }

        setSubmitting(true);

        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Message sent successfully! We will get back to you soon.');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                alert(data.error || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please check your internet connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    // const faqs = [
    //     { question: "What are your office hours?", answer: "Our office is open Monday to Friday from 9:00 AM to 6:00 PM." },
    //     { question: "How can I reach your team?", answer: "You can reach us via phone, email, or by visiting our office in Pantnagar." },
    //     { question: "Do you offer online consultations?", answer: "Yes, we offer online consultations for remote clients." },
    //     { question: "What services do you provide?", answer: "We provide a wide range of services including consultation, training, and support." }
    // ];

    return (
        <>
            <Navbar />
            <div className="contact-page">
                <div className="contact-gif-wrapper">
                    <img src={contactGif} alt="Contact" className="contact-gif" />
                </div>

                <div className="contact-heading-section">
                    <h1>Contact Us</h1>
                </div>

                <div className="contact-wrapper">
                    <div className="contact-content">
                        <div className="contact-info-section">
                            <h2>Get in Touch</h2>
                            <p className="contact-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                            <div className="contact-details">
                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <svg viewBox="0 0 256 256">
                                            <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                                                <path d="M 45 0 C 27.677 0 13.584 14.093 13.584 31.416 c 0 4.818 1.063 9.442 3.175 13.773 c 2.905 5.831 11.409 20.208 20.412 35.428 l 4.385 7.417 C 42.275 89.252 43.585 90 45 90 s 2.725 -0.748 3.444 -1.966 l 4.382 -7.413 c 8.942 -15.116 17.392 -29.4 20.353 -35.309 c 0.027 -0.051 0.055 -0.103 0.08 -0.155 c 2.095 -4.303 3.157 -8.926 3.157 -13.741 C 76.416 14.093 62.323 0 45 0 z M 45 42.81 c -6.892 0 -12.5 -5.607 -12.5 -12.5 c 0 -6.893 5.608 -12.5 12.5 -12.5 c 6.892 0 12.5 5.608 12.5 12.5 C 57.5 37.202 51.892 42.81 45 42.81 z" fill="white" />
                                            </g>
                                        </svg>
                                    </div>
                                    <div className="contact-text">
                                        <h3>Our Location</h3>
                                        <p>Pantnagar, Uttrakhand</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <svg viewBox="0 0 256 256">
                                            <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                                                <path d="M 38.789 51.211 l 10.876 10.876 c 0.974 0.974 2.471 1.194 3.684 0.543 l 13.034 -6.997 c 0.964 -0.518 2.129 -0.493 3.07 0.066 l 19.017 11.285 c 1.357 0.805 1.903 2.489 1.268 3.933 c -1.625 3.698 -4.583 10.476 -5.758 13.473 c -0.247 0.631 -0.615 1.209 -1.127 1.652 c -12.674 10.986 -37.89 -2.4 -57.191 -21.701 C 6.358 45.039 -7.028 19.823 3.958 7.149 c 0.444 -0.512 1.022 -0.88 1.652 -1.127 c 2.996 -1.175 9.775 -4.133 13.473 -5.758 c 1.444 -0.635 3.128 -0.089 3.933 1.268 l 11.285 19.017 c 0.558 0.941 0.583 2.106 0.066 3.07 L 27.37 36.651 c -0.651 1.213 -0.431 2.71 0.543 3.684 C 27.913 40.335 38.789 51.211 38.789 51.211 z" fill="white" />
                                            </g>
                                        </svg>
                                    </div>
                                    <div className="contact-text">
                                        <h3>Phone Number</h3>
                                        <p>+91 1234567890</p>
                                        <p className="hours">Mon - Fri: 9:00 AM - 6:00 PM</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <svg viewBox="0 0 256 256">
                                            <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                                                <path d="M 45 51.815 l 45 -33.87 v -1.967 c 0 -2.03 -1.646 -3.676 -3.676 -3.676 H 3.676 C 1.646 12.302 0 13.948 0 15.978 v 1.967 L 45 51.815 z" fill="white" />
                                                <path d="M 47.405 60.019 c -0.712 0.536 -1.559 0.804 -2.405 0.804 s -1.693 -0.268 -2.405 -0.804 L 0 27.958 v 46.064 c 0 2.03 1.646 3.676 3.676 3.676 h 82.648 c 2.03 0 3.676 -1.646 3.676 -3.676 V 27.958 L 47.405 60.019 z" fill="white" />
                                            </g>
                                        </svg>
                                    </div>
                                    <div className="contact-text">
                                        <h3>Email Address</h3>
                                        <p>info@vsmpantnagar.org</p>
                                    </div>
                                </div>
                            </div>
                            <div className="social-media">
                                <div className="social-icon">
                                    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.8473 0.432617C15.2157 0.436266 15.9103 0.443565 16.51 0.460594L16.7459 0.469109C17.0184 0.47884 17.2872 0.491004 17.612 0.505601C18.9063 0.566421 19.7894 0.770776 20.5642 1.07123C21.367 1.38019 22.0433 1.79863 22.7197 2.47373C23.3384 3.08161 23.8171 3.81721 24.1222 4.62919C24.4226 5.40404 24.627 6.28714 24.6878 7.5826C24.7024 7.90617 24.7146 8.17499 24.7243 8.44868L24.7316 8.68466C24.7498 9.28313 24.7571 9.97769 24.7596 11.3461L24.7608 12.2536V13.8471C24.7637 14.7343 24.7544 15.6215 24.7328 16.5085L24.7255 16.7445C24.7158 17.0182 24.7036 17.287 24.689 17.6106C24.6282 18.9061 24.4214 19.7879 24.1222 20.564C23.8171 21.376 23.3384 22.1116 22.7197 22.7195C22.1118 23.3382 21.3762 23.8169 20.5642 24.122C19.7894 24.4224 18.9063 24.6268 17.612 24.6876L16.7459 24.7241L16.51 24.7314C15.9103 24.7484 15.2157 24.7569 13.8473 24.7594L12.9398 24.7606H11.3476C10.4599 24.7637 9.57226 24.7544 8.68486 24.7326L8.44888 24.7253C8.16012 24.7144 7.87143 24.7018 7.58281 24.6876C6.28856 24.6268 5.40546 24.4224 4.62939 24.122C3.81785 23.8167 3.08267 23.3381 2.47515 22.7195C1.85594 22.1117 1.37688 21.3761 1.07143 20.564C0.77098 19.7892 0.566624 18.9061 0.505805 17.6106L0.469313 16.7445L0.463231 16.5085C0.440808 15.6216 0.43067 14.7343 0.432821 13.8471V11.3461C0.429454 10.4589 0.438375 9.57166 0.459582 8.68466L0.468096 8.44868C0.477828 8.17499 0.489992 7.90617 0.504588 7.5826C0.565408 6.28714 0.769763 5.40525 1.07021 4.62919C1.37637 3.81688 1.85628 3.08125 2.47637 2.47373C3.08354 1.85525 3.81828 1.37663 4.62939 1.07123C5.40546 0.770776 6.28734 0.566421 7.58281 0.505601C7.90637 0.491004 8.17641 0.47884 8.44888 0.469109L8.68486 0.461811C9.57185 0.440199 10.4591 0.430872 11.3463 0.433833L13.8473 0.432617ZM12.5968 6.51461C10.9838 6.51461 9.43678 7.15539 8.29618 8.29598C7.15559 9.43657 6.51481 10.9836 6.51481 12.5966C6.51481 14.2096 7.15559 15.7566 8.29618 16.8972C9.43678 18.0378 10.9838 18.6786 12.5968 18.6786C14.2098 18.6786 15.7568 18.0378 16.8974 16.8972C18.038 15.7566 18.6788 14.2096 18.6788 12.5966C18.6788 10.9836 18.038 9.43657 16.8974 8.29598C15.7568 7.15539 14.2098 6.51461 12.5968 6.51461ZM12.5968 8.9474C13.076 8.94732 13.5506 9.04163 13.9933 9.22495C14.4361 9.40826 14.8384 9.677 15.1773 10.0158C15.5163 10.3546 15.7851 10.7568 15.9686 11.1995C16.1521 11.6423 16.2465 12.1168 16.2466 12.596C16.2467 13.0752 16.1524 13.5498 15.9691 13.9925C15.7857 14.4353 15.517 14.8376 15.1782 15.1765C14.8394 15.5155 14.4372 15.7843 13.9945 15.9678C13.5517 16.1512 13.0772 16.2457 12.598 16.2458C11.6302 16.2458 10.702 15.8613 10.0176 15.177C9.33329 14.4926 8.94882 13.5644 8.94882 12.5966C8.94882 11.6288 9.33329 10.7006 10.0176 10.0162C10.702 9.33187 11.6302 8.9474 12.598 8.9474M18.9841 4.69001C18.5808 4.69001 18.1941 4.8502 17.909 5.13535C17.6238 5.4205 17.4636 5.80725 17.4636 6.21051C17.4636 6.61377 17.6238 7.00051 17.909 7.28566C18.1941 7.57081 18.5808 7.73101 18.9841 7.73101C19.3874 7.73101 19.7741 7.57081 20.0593 7.28566C20.3444 7.00051 20.5046 6.61377 20.5046 6.21051C20.5046 5.80725 20.3444 5.4205 20.0593 5.13535C19.7741 4.8502 19.3874 4.69001 18.9841 4.69001Z" fill="white" />
                                    </svg>
                                </div>
                                <div className="social-icon">
                                    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_1236_1499)">
                                            <path d="M10.7273 15L15.9173 12L10.7273 9V15ZM22.2873 7.17C22.4173 7.64 22.5073 8.27 22.5673 9.07C22.6373 9.87 22.6673 10.56 22.6673 11.16L22.7273 12C22.7273 14.19 22.5673 15.8 22.2873 16.83C22.0373 17.73 21.4573 18.31 20.5573 18.56C20.0873 18.69 19.2273 18.78 17.9073 18.84C16.6073 18.91 15.4173 18.94 14.3173 18.94L12.7273 19C8.53729 19 5.92729 18.84 4.89729 18.56C3.9973 18.31 3.41729 17.73 3.16729 16.83C3.03729 16.36 2.9473 15.73 2.8873 14.93C2.8173 14.13 2.78729 13.44 2.78729 12.84L2.72729 12C2.72729 9.81 2.88729 8.2 3.16729 7.17C3.41729 6.27 3.9973 5.69 4.89729 5.44C5.3673 5.31 6.22729 5.22 7.5473 5.16C8.84729 5.09 10.0373 5.06 11.1373 5.06L12.7273 5C16.9173 5 19.5273 5.16 20.5573 5.44C21.4573 5.69 22.0373 6.27 22.2873 7.17Z" fill="white" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1236_1499">
                                                <rect width="24" height="24" fill="white" transform="translate(0.727295)" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </div>
                                {/* <div className="social-icon">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <mask id="mask0_1236_1518" maskUnits="userSpaceOnUse" x="0" y="0" width="18" height="18">
                                            <path d="M0 0H17.0296V17.0296H0V0Z" fill="white" />
                                        </mask>
                                        <g mask="url(#mask0_1236_1518)">
                                            <path d="M13.4108 0.797852H16.0224L10.3175 7.33477L17.0296 16.2315H11.7747L7.65601 10.8368L2.94855 16.2315H0.334509L6.43596 9.23722L0 0.799068H5.38864L9.10595 5.72913L13.4108 0.797852ZM12.4924 14.6648H13.9399L4.59798 2.28307H3.04586L12.4924 14.6648Z" fill="white" />
                                        </g>
                                    </svg>
                                </div> */}
                                <div className="social-icon">
                                    <svg width="27" height="19" viewBox="0 0 27 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M18.4903 0.477653C20.7163 0.324387 22.4363 1.6235 23.581 3.1221C24.7341 4.63408 25.5284 6.6083 25.9651 8.54967C26.3993 10.491 26.5161 12.5772 26.1549 14.3555C25.8082 16.0634 24.8825 18.0169 22.7891 18.6433C20.8185 19.2321 19.0912 18.3757 17.8602 17.3394C16.6244 16.2993 15.5783 14.8421 14.756 13.4761C14.3711 12.8344 14.01 12.1787 13.6734 11.5104C13.3372 12.1783 12.9765 12.8336 12.592 13.4749C11.7697 14.8421 10.7236 16.2993 9.48777 17.3394C8.25556 18.3757 6.52949 19.2321 4.55893 18.6433C2.4655 18.0169 1.53983 16.0646 1.19315 14.3555C0.833098 12.5772 0.949873 10.491 1.38413 8.54967C1.8196 6.6083 2.6139 4.63287 3.76827 3.1221C4.91168 1.6235 6.63167 0.324387 8.85768 0.477653C10.945 0.623621 12.4619 2.03829 13.407 3.23766L13.6746 3.5892L13.941 3.23644C14.8861 2.03829 16.403 0.622404 18.4903 0.477653ZM8.60466 4.11833C8.09378 4.08306 7.42476 4.34458 6.66816 5.33716C5.92129 6.31636 5.30093 7.76144 4.94452 9.34884C4.58812 10.9362 4.53703 12.4859 4.76936 13.6306C4.97007 14.6158 5.29241 14.9698 5.48947 15.0939L5.57218 15.1352L5.60503 15.1474C5.88723 15.2326 6.3519 15.2082 7.13769 14.5465C7.92227 13.8872 8.72265 12.8277 9.46587 11.5943C9.79673 11.0433 10.1045 10.4789 10.3806 9.93636L10.6969 9.29775L10.9803 8.6932L11.2309 8.13609L11.4437 7.64102L11.6177 7.22015C11.382 6.74757 11.1125 6.29267 10.8112 5.859C10.0279 4.74478 9.24206 4.16334 8.60466 4.11955V4.11833ZM18.7433 4.11833C18.1059 4.16334 17.3202 4.74478 16.5368 5.859C16.2355 6.29267 15.966 6.74757 15.7303 7.22015L16.0064 7.88065L16.2376 8.40857L16.3677 8.6932L16.6524 9.29775L16.9686 9.93636C17.2447 10.4789 17.5513 11.0433 17.8821 11.5943C18.6253 12.8277 19.427 13.8872 20.2091 14.5465C20.9402 15.162 21.3927 15.2253 21.6809 15.1632L21.7442 15.1474C21.9023 15.0988 22.3317 14.8445 22.5786 13.6293C22.8098 12.4859 22.7599 10.9362 22.4035 9.34763C22.0483 7.76144 21.4279 6.31636 20.6798 5.33716C19.922 4.34458 19.2542 4.08427 18.7433 4.11833Z" fill="white" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="contact-form-section">
                            <h2>Send us a Message</h2>
                            <p>Have a question or want to get in touch? Fill out the form below and we'll get back to you as soon as possible.</p>
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            placeholder="Your Full Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            placeholder="Your Email Address"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <input
                                        type="text"
                                        placeholder="What is this regarding?"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea
                                        placeholder="Tell us How can we help you"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows="5"
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={submitting} className="submit-btn">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M22.9279 1.14014L14.6879 22.8661L10.6639 14.8191L15.9409 9.54214L14.5259 8.12814L9.24988 13.4041L1.20288 9.38114L22.9279 1.14014Z" fill="black" />
                                    </svg>
                                    {submitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Our Office Section */}
                {/* <div className="office-section">
                    <h2>Our Office</h2>
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.84109534767!2d77.06889754725782!3d28.52758200617607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd1e6b0a6a3f%3A0x1234567890abcdef!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1234567890"
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div> */}

                {/* FAQ Section */}
                <div className="faq-section">
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-container">
                        {faqs.map((faq, index) => (
                            <div key={index} className="faq-item">
                                <div className="faq-question" onClick={() => toggleFaq(index)}>
                                    <span>{faq.question}</span>
                                    {isAdmin && (
                                        <>
                                            <button
                                                className="faq-delete"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleDelete(faq._id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                            <button
                                                className="faq-edit"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    setEditingFaq(faq._id); // track which FAQ is being edited
                                                    setEditedQuestion(faq.question); // prefill current question
                                                    setEditedAnswer(faq.answer); // prefill current answer
                                                }}
                                            >
                                                Edit
                                            </button>
                                        </>
                                    )}
                                    <svg
                                        className={`faq-icon ${expandedFaq === index ? 'expanded' : ''}`}
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M12 4V20M4 12H20" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                {expandedFaq === index && (
                                    <div className="faq-answer">
                                        {isAdmin && editingFaq === faq._id ? (
                                            <div className="faq-edit-form">
                                                <label style={{ fontWeight: 'bold', marginBottom: 4 }}>Question:</label>
                                                <textarea
                                                    value={editedQuestion}
                                                    onChange={e => setEditedQuestion(e.target.value)}
                                                    rows={2}
                                                    style={{ width: '100%', marginBottom: 8 }}
                                                />
                                                <label style={{ fontWeight: 'bold', marginBottom: 4 }}>Answer:</label>
                                                <textarea
                                                    value={editedAnswer}
                                                    onChange={e => setEditedAnswer(e.target.value)}
                                                    rows={4}
                                                    style={{ width: '100%', marginBottom: 8 }}
                                                />
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleSave(faq._id);
                                                    }}
                                                    style={{ marginRight: 8 }}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setEditingFaq(null);
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            faq.answer
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {isAdmin && (
                <form className="admin-contact-form" onSubmit={handleAdd} style={{ marginTop: 20, maxWidth: 400 }}>
                    <h3>Add FAQ</h3>
                    <input
                        type="text"
                        placeholder="Question"
                        value={form.question}
                        onChange={e => setForm({ ...form, question: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Answer"
                        value={form.answer}
                        onChange={e => setForm({ ...form, answer: e.target.value })}
                        required
                    />
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Adding..." : "Add FAQ"}
                    </button>
                    {formMsg && (
                        <div style={{ marginTop: 8, color: formMsg.startsWith("Error") ? "red" : "green" }}>
                            {formMsg}
                        </div>
                    )}
                </form>
            )}
            <Footer />
        </>
    );
};

export default ContactUs; 