import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import Button from '../components/shared/Button';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGitHub, loginWithGoogle, loginWithMicrosoft } = useAuth();
  const [error, setError] = useState(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (isProcessing.current) return;

    // Extract params from both search and fragment (Google/MS use fragment for id_token)
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
          await loginWithGoogle(idToken || code);
        } else if (state === 'microsoft') {
          await loginWithMicrosoft(idToken);
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
  }, [searchParams, navigate, loginWithGitHub, loginWithGoogle, loginWithMicrosoft]);

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem',
        backgroundColor: '#0a0a0c',
        color: '#f3f4f6'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          backgroundColor: '#121216',
          padding: '2.5rem',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          border: '1px solid #27272a'
        }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', color: '#f3f4f6' }}>
            Authentication Error
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            {error}
          </p>
          <Button variant="primary" onClick={() => navigate('/login')} style={{ width: '100%' }}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#0a0a0c' 
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #27272a',
          borderTopColor: '#f97316',
          borderRadius: '50%',
        }}
      />
    </div>
  );
}

