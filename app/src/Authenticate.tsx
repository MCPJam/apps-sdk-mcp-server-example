import { useEffect, useState } from 'react';
import { useStytch } from '@stytch/react';

export function Authenticate() {
  const stytch = useStytch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    console.log('Authenticate page - Full URL:', window.location.href);
    console.log('Authenticate page - Token:', token);

    if (!token) {
      console.error('No token found in URL');
      setError('No authentication token found in URL');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    stytch.oauth
      .authenticate(token, { session_duration_minutes: 60 })
      .then((response) => {
        console.log('Authentication successful:', response);
        const returnTo = localStorage.getItem('returnTo') || '/';
        localStorage.removeItem('returnTo');
        window.location.href = returnTo;
      })
      .catch((err) => {
        console.error('Authentication failed:', err);
        setError(`Authentication failed: ${err.message || 'Unknown error'}`);
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      });
  }, [stytch]);

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Authentication Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p>Completing authentication...</p>
    </div>
  );
}
