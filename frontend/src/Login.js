import React, { useState } from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup, FacebookAuthProvider } from 'firebase/auth';
import { auth } from './firebase';
import { useEffect } from 'react';
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 48 48" style={{ marginRight: '12px' }}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 48 48" style={{ marginRight: '12px' }}>
        <path fill="#039be5" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"></path>
        <path fill="#fff" d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"></path>
    </svg>
);

function getFriendlyFirebaseMessage(error) {
    if (!error || !error.code) return error.message || "An error occurred.";
    switch (error.code) {
        case "auth/user-not-found":
            return "No account found with this email.";
        case "auth/wrong-password":
            return "Incorrect password. Please try again.";
        case "auth/email-already-in-use":
            return "This email is already registered.";
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";
        case "auth/popup-closed-by-user":
            return "The sign-in popup was closed before completing sign in.";
        default:
            return error.message || "An error occurred. Please try again.";
    }
}

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    useEffect(() => {
        document.title = "Login | VSM";
    }, []);
    const handleSignIn = async (e) => {
        e.preventDefault();
        setMessage('');
        setShowResend(false);
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
            if (!userCredential.user.emailVerified) {
                setMessage('Please verify your email before logging in.');
                setShowResend(true);
                setLoading(false);
                return;
            }
            setMessage('Login successful!');
            // Redirect to home page after intro
            navigate('/', { state: { skipIntro: true } });
        } catch (error) {
            setMessage(getFriendlyFirebaseMessage(error));
        }
        setLoading(false);
    };

    const handleResendVerification = async () => {
        setLoading(true);
        setMessage('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
            await sendEmailVerification(userCredential.user);
            setMessage('Verification email resent! Please check your inbox.');
        } catch (error) {
            setMessage(getFriendlyFirebaseMessage(error));
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setMessage('');
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            setMessage('Google sign-in successful!');
            // Redirect to home page after intro
            navigate('/', { state: { skipIntro: true } });
        } catch (error) {
            setMessage(getFriendlyFirebaseMessage(error));
        }
        setLoading(false);
    };

    const handleFacebookSignIn = async () => {
        setLoading(true);
        setMessage('');
        try {
            const provider = new FacebookAuthProvider();
            await signInWithPopup(auth, provider);
            setMessage('Facebook sign-in successful!');
        } catch (error) {
            setMessage(getFriendlyFirebaseMessage(error));
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-form-section">
                <h1>Welcome Back</h1>
                <form className="login-form" onSubmit={handleSignIn}>
                    <label>Email</label>
                    <input type="email" name="email" placeholder="Example@email.com" value={form.email} onChange={handleChange} />
                    <label>Password</label>
                    <input type="password" name="password" placeholder="At least 8 characters" value={form.password} onChange={handleChange} />
                    <div className="forgot-password">
                        <a href="#">Forgot Password?</a>
                    </div>
                    <button type="submit" className="signin-btn" disabled={loading}>{loading ? 'Signing In...' : 'Sign in'}</button>
                    {message && <div style={{ color: message.includes('successful') ? 'green' : 'red', marginTop: 12 }}>{message}</div>}
                    {showResend && (
                        <button type="button" className="google-btn" style={{ marginTop: 8 }} onClick={handleResendVerification} disabled={loading}>
                            Resend Verification Email
                        </button>
                    )}
                </form>
                <div className="or-divider">
                    <span>Or</span>
                </div>
                <button className="google-btn" onClick={handleGoogleSignIn} disabled={loading}>
                    <GoogleIcon /> Sign in with Google
                </button>
                <button className="facebook-btn" onClick={handleFacebookSignIn} disabled={loading}>
                    <FacebookIcon /> Sign in with Facebook
                </button>
                <div className="signup-link">
                    Don't you have an account? <Link to="/signup" className='signuplink'>Sign up</Link>
                </div>
            </div>
            <div className="login-image-section">
                <img src={require('./assets/भारतीय-नववर्ष-उत्सव (1).png')} alt="Login Visual" style={{ width: '100%', maxWidth: 400, height: 'auto', borderRadius: 16 }} />
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
                    .signin-btn {
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

export default Login;
export { GoogleIcon, FacebookIcon }; 