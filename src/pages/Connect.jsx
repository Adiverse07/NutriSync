// src/components/Connect.jsx
import { useEffect, useState } from 'react';
import { FiWatch } from 'react-icons/fi';

function Connect() {
  const [scanning, setScanning] = useState(false);
  const [connected, setConnected] = useState(false);

  // On mount, check for existing, non-expired token in localStorage
  useEffect(() => {
    let tokens = {};
    try {
      tokens = JSON.parse(localStorage.getItem('google_fit_tokens') || '{}');
    } catch {
      tokens = {};
    }

    const { access_token, expiry_date } = tokens;

    if (access_token && expiry_date && expiry_date > Date.now()) {
      // Still valid
      setConnected(true);
    } else {
      // Missing or expired → clear and treat as disconnected
      localStorage.removeItem('google_fit_tokens');
      setConnected(false);
    }
  }, []);

  const startScan = async () => {
    setScanning(true);
    try {
      const response = await fetch("http://localhost:3000/api/googlefit/url");
      const { authUrl } = await response.json();

      setTimeout(() => {
        setScanning(false);
        window.location.href = authUrl;
      }, 1500);
    } catch (err) {
      console.error("Failed to fetch auth URL", err);
      setScanning(false);
    }
  };

  const getLabel = () => {
    if (connected) return "Connected";
    if (scanning) return "Connecting...";
    return "Connect";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <button
        onClick={startScan}
        disabled={scanning || connected}
        className={`
          relative flex items-center justify-center
          w-24 h-24 rounded-full transition-all
          ${connected
            ? 'bg-green-500 animate-pulse shadow-lg shadow-green-400/50'
            : 'bg-primary'}
          ${scanning ? 'border-4 border-dashed border-white animate-spin-slow' : ''}
        `}
      >
        <FiWatch className="text-3xl text-white" />
      </button>
      <p className={`text-sm font-medium ${connected ? 'text-green-400' : 'text-white/80'}`}>
        {getLabel()}
      </p>
    </div>
  );
}

export default Connect;
