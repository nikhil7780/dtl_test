import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useVoice } from '../context/VoiceContext';

const NAV_DATA = {
    "QR_01": "Move right 1 step and walk down 8 steps infront of you.",
    "QR_02": "Turn left and move forward 2 steps to access the 3rd QR.",
    "QR_03": "Turn left and walk down 8 steps infront of you to reach floor 1 and turn right.",
    "QR_04": "Turn left, walk straight 3 steps, turn left and walk straight 4 steps to reach entrance of room 1.",
    // Room Navigation
    "ROOM_1": "Room 1 is directly ahead. Walk straight 5 steps. Turn right at the corner. Room 1 is on your left. Entrance is 2 steps ahead.",
    "ROOM_2": "Room 2 is to your right. Turn right and walk 3 steps. Room 2 entrance is on your right side.",
    "ROOM_3": "Room 3 is further ahead. Walk straight 8 steps. Turn left at the end of the corridor. Room 3 is 3 steps ahead on your right.",
    "ROOM_4": "Room 4 is on the same floor. Walk straight 6 steps, then turn right. Room 4 entrance is ahead on your left.",
    "ROOM_5": "Room 5 is upstairs. Find the elevator or staircase ahead. Go up one floor. Turn left and walk 4 steps. Room 5 is on your right.",
    "ROOM_6": "Room 6 is in the east wing. Walk straight to the end of this corridor. Turn right. Room 6 entrance is 5 steps ahead on your right."
};

const QRNavigation = () => {
    const { speak, transcript, resetTranscript } = useVoice();
    const [data, setData] = useState('Scanning...');
    const [roomInput, setRoomInput] = useState('');
    const [scanMode, setScanMode] = useState(true); // true = QR scan, false = room input
    const scannerRef = useRef(null);
    const lastScanTime = useRef(0);
    const SCAN_COOLDOWN = 5000; // 5 seconds

    // Handle voice input for room navigation
    useEffect(() => {
        if (!scanMode && transcript) {
            const lower = transcript.toLowerCase();
            const roomNumber = transcript.match(/\d+/)?.[0];
            
            if (roomNumber) {
                console.log("Voice input detected room:", roomNumber);
                setRoomInput(roomNumber);
                handleRoomNavigation(roomNumber);
                resetTranscript();
            }
        }
    }, [transcript, scanMode]);

    const handleRoomNavigation = (room) => {
        const roomKey = `ROOM_${room}`;
        const message = NAV_DATA[roomKey] || `Navigating to room ${room}. Please wait for navigation instructions.`;
        setData(`Room ${room}`);
        speak(message);
    };

    useEffect(() => {
        if (scanMode) {
            speak("Navigation Mode. Scanning for QR codes.");
        } else {
            speak("Room input mode. Say the room number.");
        }

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        // Auto-start using back camera
        html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanFailure
        ).catch(err => {
            console.error("Error starting scanner", err);
            speak("Camera permission denied.");
        });

        // Cleanup
        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().then(() => html5QrCode.clear());
            }
        };
    }, [scanMode, speak, resetTranscript]);

    const onScanSuccess = (decodedText, decodedResult) => {
        const now = Date.now();

        // Cooldown Check
        if (now - lastScanTime.current < SCAN_COOLDOWN) {
            return;
        }

        if (decodedText === data && now - lastScanTime.current < 10000) return; // double check strict debounce for same code

        lastScanTime.current = now;
        setData(decodedText);
        const message = NAV_DATA[decodedText] || `Unknown Location Code: ${decodedText}`;
        speak(message);
    };

    const onScanFailure = (error) => {
        // handle error if needed
    };

    const simulateScan = (code) => {
        // Bypass cooldown logic for manual testing, or respect it if desired
        // For demo, we force it:
        lastScanTime.current = Date.now();
        setData(code);
        const message = NAV_DATA[code] || `Unknown Location Code: ${code}`;
        speak(message);
    }

    const handleInputChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
        setRoomInput(value);
    };

    const handleSubmitRoom = () => {
        if (roomInput.trim()) {
            handleRoomNavigation(roomInput);
            setRoomInput('');
        } else {
            speak("Please enter a valid room number");
        }
    };

    return (
        <div className="container">
            <h1 className="hc-text mb-4 text-center">Navigation - QR or Voice Room Input</h1>

            {/* Mode Toggle */}
            <div className="card max-w-lg mx-auto mb-4">
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => setScanMode(true)}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: scanMode ? '#00ff9d' : '#333',
                            color: scanMode ? '#000' : '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        📱 Scan QR
                    </button>
                    <button
                        onClick={() => setScanMode(false)}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: !scanMode ? '#00ff9d' : '#333',
                            color: !scanMode ? '#000' : '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        🎤 Voice Room
                    </button>
                </div>
            </div>

            {/* QR Scanner Mode */}
            {scanMode ? (
                <div className="card max-w-lg mx-auto">
                    <div id="reader" style={{ width: '100%', minHeight: '300px', background: 'black' }}></div>

                    <div className="mt-4 p-4 text-center bg-gray-900 rounded border border-gray-700">
                        <h3 className="text-gray-400 text-sm">Detected Location:</h3>
                        <p className="text-xl font-bold text-accent-primary mt-2">{data}</p>
                    </div>

                    {/* Simulation Controls for Demo */}
                    <div className="mt-8 border-t border-gray-700 pt-4">
                        <h4 className="mb-2 text-sm text-gray-500">Test QR Codes:</h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {Object.keys(NAV_DATA).filter(k => k.startsWith('QR')).map(key => (
                                <button
                                    key={key}
                                    onClick={() => simulateScan(key)}
                                    className="px-3 py-1 bg-gray-700 rounded hover:bg-white hover:text-black text-xs"
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* Voice Room Input Mode */
                <div className="card max-w-lg mx-auto">
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <h2 className="hc-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎤 Room Input</h2>
                        <p className="hc-text" style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#aaa' }}>
                            Say "Room 1", "Room 2", "Room 3", etc.
                        </p>

                        {/* Manual Input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="hc-text" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>
                                Or Type Room Number:
                            </label>
                            <input
                                type="text"
                                value={roomInput}
                                onChange={handleInputChange}
                                placeholder="Enter room number"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    fontSize: '1.2rem',
                                    border: '2px solid #00ff9d',
                                    borderRadius: '8px',
                                    background: '#1a1a1a',
                                    color: '#fff',
                                    textAlign: 'center',
                                    marginBottom: '1rem'
                                }}
                            />
                            <button
                                onClick={handleSubmitRoom}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#00ff9d',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    marginBottom: '1rem'
                                }}
                            >
                                Get Directions
                            </button>
                        </div>

                        {/* Voice Status */}
                        <div style={{
                            padding: '1rem',
                            background: '#222',
                            borderRadius: '8px',
                            border: '1px solid #00ff9d'
                        }}>
                            <p className="hc-text" style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '0.5rem' }}>
                                📍 Last Input:
                            </p>
                            <p className="hc-text" style={{ fontSize: '1.5rem', color: '#00ff9d', fontWeight: 'bold' }}>
                                {data}
                            </p>
                        </div>

                        {/* Quick Buttons */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <p className="hc-text" style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '0.75rem' }}>
                                Quick Access:
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                {[1, 2, 3, 4, 5, 6].map(room => (
                                    <button
                                        key={room}
                                        onClick={() => {
                                            setRoomInput(room.toString());
                                            handleRoomNavigation(room.toString());
                                        }}
                                        style={{
                                            padding: '0.75rem',
                                            background: '#333',
                                            color: '#fff',
                                            border: '1px solid #00ff9d',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.background = '#00ff9d'}
                                        onMouseOut={(e) => e.target.style.background = '#333'}
                                    >
                                        Room {room}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRNavigation;
