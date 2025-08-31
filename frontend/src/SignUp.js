import React, { useState } from 'react';
import './Login.css';
import { GoogleIcon, FacebookIcon } from './Login';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from 'firebase/auth';
import { useEffect } from 'react';
const SignUp = () => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [signedUp, setSignedUp] = useState(false);
    const [fade, setFade] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    useEffect(() => {
        document.title = "Sign Up | VSM";
    }, []);
    const handleContinue = (e) => {
        e.preventDefault();
        setFade('fade-out');
        setTimeout(() => {
            setStep(2);
            setFade('fade-in');
            setTimeout(() => setFade(''), 400);
        }, 400);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setMessage('');
        if (form.password !== form.confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }
        setLoading(true);
        setFade('fade-out');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            await updateProfile(userCredential.user, { displayName: form.name });
            await sendEmailVerification(userCredential.user);
            await signOut(auth);
            setTimeout(() => {
                setSignedUp(true);
                setFade('fade-in');
                setTimeout(() => setFade(''), 400);
            }, 400);
            setMessage('Sign up successful! Please check your email to verify your account before logging in.');
        } catch (error) {
            setMessage(error.message);
            setFade('');
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className={`login-form-section ${fade}`}>
                <h1>Welcome To VSM</h1>
                {!signedUp ? (
                    <form className="login-form" onSubmit={e => e.preventDefault()}>
                        {step === 1 ? (
                            <>
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your Name"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Example@email.com"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                                <button className="signin-btn continue-btn" onClick={handleContinue}>
                                    Continue
                                </button>
                                <div className="or-divider">
                                    <span>Or</span>
                                </div>
                                <button className="google-btn">
                                    <GoogleIcon /> Sign in with Google
                                </button>
                                <button className="facebook-btn">
                                    <FacebookIcon /> Sign in with Facebook
                                </button>
                            </>
                        ) : (
                            <>
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="At least 8 characters"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Re-enter your password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button type="button" className="signin-btn signup-btn" onClick={handleSignUp} disabled={loading}>
                                    {loading ? 'Signing Up...' : 'Sign Up'}
                                </button>
                                {/* Only show message if not signedUp */}
                                {!signedUp && message && (
                                    <div style={{ color: message.includes('successful') ? 'green' : 'red', marginTop: 12 }}>{message}</div>
                                )}
                            </>
                        )}
                    </form>
                ) : (
                    <div className="signup-success-message">
                        <p>Sign up successful! Please check your email to verify your account before logging in.</p>
                        <button className="signin-btn" onClick={() => navigate('/login')}>Sign In</button>
                    </div>
                )}
                <div className="signup-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
            <div className="login-image-section">
                <img src={require('./assets/भारतीय-नववर्ष-उत्सव (1).png')} alt="Sign Up Visual" />
            </div>
            {/* Responsive styles for mobile */}
            <style>{`
                @media (max-width: 700px) {
                    .login-container {
                        flex-direction: column !important;
                        align-items: center !important;
                        padding: 8px !important;
                    }
                    .login-form-section {
                        width: 100vw !important;
                        max-width: 100vw !important;
                        padding: 8px 12px 0 12px !important;
                        box-sizing: border-box !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                    }
                    .login-form {
                        width: 100%;
                        max-width: 350px;
                        margin: 0 auto;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .login-form h1 {
                        font-size: 1.15rem !important;
                        margin-bottom: 14px !important;
                        margin-top: 8px !important;
                        text-align: center !important;
                        word-break: break-word !important;
                        overflow-wrap: break-word !important;
                        white-space: normal !important;
                        line-height: 1.2 !important;
                        font-weight: 600 !important;
                        max-width: 90vw !important;
                    }
                    .login-form label {
                        font-size: 0.95rem !important;
                        margin-bottom: 4px !important;
                        width: 100%;
                        max-width: 350px;
                        text-align: left;
                    }
                    .login-form input {
                        font-size: 0.95rem !important;
                        padding: 8px !important;
                        margin-bottom: 10px !important;
                        width: 100%;
                        max-width: 350px;
                        box-sizing: border-box;
                    }
                    .signin-btn, .continue-btn, .signup-btn {
                        font-size: 0.95rem !important;
                        padding: 8px 0 !important;
                        margin-bottom: 10px !important;
                        width: 100%;
                        max-width: 350px;
                    }
                    .google-btn, .facebook-btn {
                        font-size: 0.95rem !important;
                        padding: 8px 0 !important;
                        margin-bottom: 10px !important;
                        width: 100%;
                        max-width: 350px;
                    }
                    .or-divider {
                        margin: 16px 0 !important;
                        font-size: 0.95rem !important;
                        width: 100%;
                        max-width: 350px;
                        text-align: center;
                    }
                    .signup-success-message {
                        width: 100%;
                        max-width: 350px;
                        margin: 0 auto;
                        text-align: center;
                    }
                    .login-image-section {
                        width: 100vw !important;
                        max-width: 100vw !important;
                        margin-top: 16px !important;
                        display: flex !important;
                        justify-content: center !important;
                    }
                    .login-image-section img {
                        width: 85vw !important;
                        max-width: 300px !important;
                        height: auto !important;
                        border-radius: 10px !important;
                    }
                    .signup-link {
                        font-size: 0.95rem !important;
                        margin-top: 10px !important;
                        width: 100%;
                        max-width: 350px;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default SignUp; 