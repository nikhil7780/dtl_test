import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import { FileText, Users, Map, Eye, LogOut } from 'lucide-react';

const Home = () => {
    const { speak } = useVoice();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        speak("Welcome. Please say a command like 'Go to Form', or 'Read Sign'.");
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
        speak("Logged out successfully");
    };

    const modules = [
        { name: 'Voice Form', path: '/form', icon: <FileText size={48} />, color: '#00ff9d', voiceCommand: 'Go to Form' },
        { name: 'Queue Status', path: '/queue', icon: <Users size={48} />, color: '#00d2ff', voiceCommand: 'Go to Token' },
        { name: 'Navigation', path: '/qr', icon: <Map size={48} />, color: '#ff0055', voiceCommand: 'Go to Map' },
        { name: 'Sign Reader', path: '/signs', icon: <Eye size={48} />, color: '#ffff00', voiceCommand: 'Read Sign' },
    ];

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="hc-text" style={{ fontSize: '3rem', marginBottom: 0 }}>
                    Voice Assistant
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="hc-text" style={{ fontSize: '0.9rem', color: '#aaa' }}>
                        {user.email}
                    </span>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: '#ff0055',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem'
            }}>
                {modules.map((m) => (
                    <div
                        key={m.name}
                        className="card"
                        style={{
                            cursor: 'pointer',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            border: `2px solid ${m.color}`,
                            transition: 'transform 0.2s'
                        }}
                        onClick={() => navigate(m.path)}
                    >
                        <div style={{ color: m.color }}>{m.icon}</div>
                        <h2 style={{ fontSize: '2rem' }}>{m.name}</h2>
                        <p className="hc-text" style={{ fontSize: '1rem', color: '#888' }}>
                            Say "{m.voiceCommand}"
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
