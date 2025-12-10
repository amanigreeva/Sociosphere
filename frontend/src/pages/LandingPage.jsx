import React from 'react';
import { Link } from 'react-router-dom';
import '../pages/landing.css';

const LandingPage = () => {
    return (
        <div className="landing-container">
            <div className="landing-left">
                <h1>Welcome to SocioSphere</h1>
                <p>Connect with friends and the world around you.</p>
            </div>
            <div className="landing-right">
                <div className="auth-box">
                    <h2>Get Started</h2>
                    <div className="auth-buttons">
                        <Link to="/login" className="auth-btn login-btn">Log In</Link>
                        <Link to="/register" className="auth-btn register-btn">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
