import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import regeneratorRuntime from "regenerator-runtime";

const VoiceContext = createContext();

export const useVoice = () => useContext(VoiceContext);

export const VoiceProvider = ({ children }) => {
    const [transcript, setTranscript] = useState('');
    const [listening, setListening] = useState(false);
    const [isSystemSpeaking, setIsSystemSpeaking] = useState(false);
    const [status, setStatus] = useState("Idle");
    const [audioLevel, setAudioLevel] = useState(0);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const silenceTimerRef = useRef(null);
    const isRecordingRef = useRef(false);
    const streamRef = useRef(null);
    const recognitionRef = useRef(null);

    // Get SpeechRecognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // Speak function
    const speak = (text) => {
        console.log("SPEAK:", text);
        setIsSystemSpeaking(true);
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("US English") || v.name.includes("Samantha"));
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 1.0;
        utterance.onend = () => {
            setIsSystemSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
    };

    const sendAudioToServer = async (mimeType = 'audio/webm') => {
        try {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            console.log(`Sending Audio: ${blob.size} bytes, Type: ${mimeType}`);

            if (blob.size < 100) {
                console.log("Audio too short/empty, ignoring.");
                setStatus("Too quiet - try again");
                return;
            }

            const formData = new FormData();
            const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
            formData.append('audio', blob, `command.${ext}`);

            setStatus("Sending to server...");
            
            // Build API URL with environment variable support
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const endpoint = `${apiUrl}/api/transcribe`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("Server Error:", errText);
                setStatus("Server error");
                speak("Server connection failed. Please try again.");
                return;
            }

            const data = await response.json();

            if (data.error) {
                console.error("API Error:", data.error);
                setStatus("Recognition error");
                speak("Could not understand. Please try again.");
                return;
            }

            if (data.text) {
                console.log("Server Transcript:", data.text);
                setTranscript(data.text);
                setStatus("Got it");
            } else {
                console.log("No text transcribed");
                setStatus("No speech detected");
            }
        } catch (e) {
            console.error("Transcription Failed", e);
            setStatus("Connection error");
            speak("Network error. Check your connection.");
        } finally {
            setTimeout(() => {
                if (listening) setStatus("Listening...");
            }, 1000);
        }
    };

    // Use Web Speech API (Desktop & Mobile Chrome) or Fallback (iOS/other)
    const initSpeechRecognition = () => {
        if (!SpeechRecognition) {
            console.warn("Web Speech API not available, will use audio upload");
            return null;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;
            recognition.lang = 'en-US';

            // Mobile-specific settings
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            console.log("Device type:", isMobile ? "Mobile" : "Desktop");

            recognition.onstart = () => {
                console.log("Speech Recognition Started");
                setStatus("Listening (Web Speech)...");
            };

            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;

                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    const cleanedText = finalTranscript.trim();
                    console.log("Final transcript:", cleanedText);
                    setTranscript(cleanedText);
                } else if (interimTranscript) {
                    console.log("Interim transcript:", interimTranscript);
                    setTranscript(interimTranscript);
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                let errorMsg = event.error;
                
                // Handle common mobile errors
                if (event.error === 'network') {
                    errorMsg = "Network error - check internet connection";
                } else if (event.error === 'no-speech') {
                    errorMsg = "No speech detected - try again";
                } else if (event.error === 'audio-capture') {
                    errorMsg = "Microphone not working";
                }
                
                setStatus(`Error: ${errorMsg}`);
                speak(`Error: ${errorMsg}`);
            };

            recognition.onend = () => {
                console.log("Speech Recognition Ended");
                if (listening && recognitionRef.current) {
                    try {
                        console.log("Restarting recognition");
                        recognitionRef.current.start();
                    } catch (e) {
                        console.log("Could not restart recognition:", e.message);
                    }
                }
            };

            console.log("Speech Recognition initialized successfully");
            return recognition;
        } catch (e) {
            console.error("Failed to initialize Speech Recognition:", e);
            return null;
        }
    };

    const detectVoiceActivity = () => {
        if (!analyserRef.current || !listening) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkVolume = () => {
            if (!listening || !analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const average = sum / bufferLength;

            setAudioLevel(average);

            const SPEECH_THRESHOLD = 5;
            const SILENCE_DURATION = 1500;

            if (average > SPEECH_THRESHOLD && !isSystemSpeaking) {
                if (!isRecordingRef.current) {
                    console.log("Speech Detected - Recording...");
                    setStatus("Recording...");
                    isRecordingRef.current = true;
                    chunksRef.current = [];
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
                        mediaRecorderRef.current.start();
                    }
                }

                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

                silenceTimerRef.current = setTimeout(() => {
                    if (isRecordingRef.current) {
                        console.log("Silence Detected - Stopping...");
                        setStatus("Processing...");
                        isRecordingRef.current = false;
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                            mediaRecorderRef.current.stop();
                        }
                    }
                }, SILENCE_DURATION);
            }

            requestAnimationFrame(checkVolume);
        };
        checkVolume();
    };

    const startListening = async () => {
        if (listening) return;
        
        console.log("=== Starting Voice Input ===");
        console.log("SpeechRecognition available:", !!SpeechRecognition);
        console.log("User Agent:", navigator.userAgent);
        
        setListening(true);

        try {
            // Initialize audio context for visualizer
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContextClass();
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }
            audioContextRef.current = ctx;

            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            analyserRef.current = analyser;

            console.log("Microphone access granted");

            // Priority 1: Try Web Speech API (Works on Desktop & Android Chrome)
            if (SpeechRecognition) {
                console.log("Attempting to initialize Web Speech API");
                if (!recognitionRef.current) {
                    recognitionRef.current = initSpeechRecognition();
                }
                
                if (recognitionRef.current) {
                    try {
                        recognitionRef.current.start();
                        console.log("Web Speech API started successfully");
                        setStatus("Listening (Web Speech API)...");
                    } catch (e) {
                        console.error("Failed to start Web Speech API:", e);
                        console.log("Falling back to audio upload mode");
                        setupAudioRecording(stream);
                    }
                } else {
                    console.log("Web Speech API initialization failed, using audio upload");
                    setupAudioRecording(stream);
                }
            } else {
                // Fallback: iOS Safari and other browsers without Web Speech API
                console.log("Web Speech API not available on this browser");
                console.log("Using audio upload fallback for better compatibility");
                setupAudioRecording(stream);
            }

            // Start visualizer for all modes
            detectVoiceActivity();
        } catch (err) {
            console.error("Error during voice input setup:", err);
            setStatus("Error: " + err.message);
            speak("Permission denied. Please allow microphone access.");
            setListening(false);
        }
    };

    const setupAudioRecording = (stream) => {
        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
            mimeType = 'audio/wav';
        }

        console.log("Using mimeType for audio recording:", mimeType);
        
        try {
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            mediaRecorderRef.current.onstop = () => sendAudioToServer(mimeType);
            setStatus("Listening (Audio Upload Mode)...");
            speak("Audio recording mode activated. Speak now.");
        } catch (e) {
            console.error("Failed to setup audio recording:", e);
            setStatus("Microphone error");
            speak("Could not initialize microphone. Please try again.");
        }
    };

    // MANUAL CONTROLS FOR PRESENTATION / MOBILE TESTING
    const startManualRecord = () => {
        console.log("Manual record started");
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                console.log("Started Web Speech API (manual)");
            } catch (e) {
                console.log("Could not start Web Speech API:", e.message);
            }
        } else if (mediaRecorderRef.current) {
            isRecordingRef.current = true;
            chunksRef.current = [];
            mediaRecorderRef.current.start();
            console.log("Started audio recording (manual)");
        }
        setStatus("Recording (Manual)...");
    };

    const stopManualRecord = () => {
        console.log("Manual record stopped");
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.log("Could not stop Web Speech API:", e.message);
            }
        } else if (mediaRecorderRef.current && isRecordingRef.current) {
            isRecordingRef.current = false;
            mediaRecorderRef.current.stop();
        }
        setStatus("Stopped");
    };

    const stopListening = () => {
        setListening(false);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.log("Recognition already stopped");
            }
        }
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        setStatus("Stopped");
    };

    const resetTranscript = () => setTranscript('');

    // Trigger detect loop when listening state changes
    useEffect(() => {
        if (listening && analyserRef.current) {
            detectVoiceActivity();
        }
    }, [listening]);

    useEffect(() => {
        return () => stopListening();
    }, []);

    return (
        <VoiceContext.Provider value={{
            speak,
            startListening,
            stopListening,
            listening,
            transcript,
            resetTranscript,
            status,
            audioLevel,
            startManualRecord,
            stopManualRecord
        }}>
            {children}
        </VoiceContext.Provider>
    );
};
