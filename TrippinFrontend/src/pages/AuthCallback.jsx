import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGitHub, loginWithGoogle } = useAuth(); // Assume these are added to AuthContext or we will add them
  const [error, setError] = useState(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (isProcessing.current) return;

    // Extract params from both search and fragment (Google uses fragment for id_token)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const code = searchParams.get('code') || hashParams.get('code');
    const idToken = hashParams.get('id_token');
    const state = searchParams.get('state') || hashParams.get('state');

    if (!code && !idToken) {
      setError('No authorization code or token found in URL.');
      return;
    }

    if (!state) {
      setError('No state parameter found to identify the provider.');
      return;
    }

    const processLogin = async () => {
      isProcessing.current = true;
      try {
        if (state === 'github') {
          await loginWithGitHub(code);
        } else if (state === 'google') {
          // If we have id_token, use it. If we have code, we might need a different method.
          // But our current redirect uses id_token.
          await loginWithGoogle(idToken || code);
        } else {
          throw new Error(`Unknown provider: ${state}`);
        }
        navigate('/discover');
      } catch (err) {
        console.error('OAuth Callback Error:', err);
        setError('Failed to authenticate with ' + state);
      }
    };

    processLogin();
  }, [searchParams, navigate, loginWithGitHub, loginWithGoogle]);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')} style={{ marginTop: '20px' }}>Back to Login</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--ink-muted)',
          borderTopColor: 'var(--terra-500)',
          borderRadius: '50%',
        }}
      />
    </div>
  );
}
