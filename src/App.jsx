import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useVoice } from './context/VoiceContext';
import VoiceVisualizer from './components/VoiceVisualizer';

// Pages
import Home from './pages/Home';
import VoiceForm from './pages/VoiceForm';
import QueueStatus from './pages/QueueStatus';
import QRNavigation from './pages/QRNavigation';
import SignReader from './pages/SignReader';

const App = () => {
  const { transcript, resetTranscript, speak, startListening, stopListening, listening } = useVoice();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [lastCommand, setLastCommand] = React.useState('');

  useEffect(() => {
    if (!transcript) return; // Don't process empty transcript
    
    const lower = transcript.toLowerCase();

    console.log("=== APP.JSX DEBUG ===");
    console.log("Transcript:", transcript);
    console.log("Listening:", listening);

    // Check if this is a new command (not the same as last processed)
    if (transcript === lastCommand) return;

    let commandDetected = false;

    if (lower.includes('go to form') || lower.includes('open form')) {
      console.log("✓ Detected: Go to Form");
      setLastCommand(transcript);
      resetTranscript();
      speak("Opening Voice Form");
      setTimeout(() => navigate('/form'), 500);
      commandDetected = true;
    } else if (lower.includes('go to token') || lower.includes('go to queue')) {
      console.log("✓ Detected: Go to Queue");
      setLastCommand(transcript);
      resetTranscript();
      speak("Opening Token System");
      setTimeout(() => navigate('/queue'), 500);
      commandDetected = true;
    } else if (lower.includes('go to map') || lower.includes('navigation')) {
      console.log("✓ Detected: Go to Map");
      setLastCommand(transcript);
      resetTranscript();
      speak("Opening Navigation System");
      setTimeout(() => navigate('/qr'), 500);
      commandDetected = true;
    } else if (lower.includes('read sign') || lower.includes('open reader')) {
      console.log("✓ Detected: Read Sign");
      setLastCommand(transcript);
      resetTranscript();
      speak("Opening Sign Reader");
      setTimeout(() => navigate('/signs'), 500);
      commandDetected = true;
    } else if (lower.includes('go home') || lower.includes('main menu') || lower.includes('go to home')) {
      console.log("✓ Detected: Go Home");
      setLastCommand(transcript);
      resetTranscript();
      speak("Going to Main Menu");
      setTimeout(() => navigate('/'), 500);
      commandDetected = true;
    }
  }, [transcript, navigate, resetTranscript, speak, lastCommand]);

  const handleInitialInteraction = () => {
    startListening();
    setHasInteracted(true);
    // Play a silent sound or speak to unlock AudioContext
    const audio = new Audio();
    audio.play().catch(() => { });
    speak("Voice Assistant Active.");
  };

  return (
    <div className="app-container">
      {!hasInteracted ? (
        <div
          onClick={handleInitialInteraction}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.95)', color: '#ffffff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '20px',
            touchAction: 'manipulation', // Optimization for touch devices
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>👆</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '15px', fontWeight: 'bold' }}>Tap Screen to Start</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '300px' }}>
            Visual Assistance System<br />
            <span style={{ fontSize: '0.9rem', marginTop: '10px', display: 'block' }}>(Works with TalkBack / VoiceOver)</span>
          </p>
        </div>
      ) : null}

      <div style={{ paddingBottom: '100px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form" element={<VoiceForm />} />
          <Route path="/queue" element={<QueueStatus />} />
          <Route path="/qr" element={<QRNavigation />} />
          <Route path="/signs" element={<SignReader />} />
        </Routes>
      </div>

      <VoiceVisualizer />
    </div>
  );
}

export default App;
