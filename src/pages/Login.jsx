import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // In real app, send to backend for verification
            // For now, simple client-side check
            if (email && password.length >= 6) {
                // Save to localStorage
                localStorage.setItem('user', JSON.stringify({ email, loginTime: new Date() }));
                navigate('/');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('Login failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#050505',
            color: '#fff'
        }}>
            <div style={{
                background: '#111',
                padding: '2rem',
                borderRadius: '20px',
                border: '1px solid rgba(0, 255, 157, 0.3)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{ marginBottom: '2rem', color: '#00ff9d', textAlign: 'center' }}>
                    Voice Assistant
                </h1>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#222',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#222',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            marginBottom: '1rem',
                            padding: '0.75rem',
                            background: '#ff0055',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#00ff9d',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#000',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: '#aaa'
                }}>
                    Demo: Use any email and 6+ char password
                </p>
            </div>
        </div>
    );
};

export default Login;
