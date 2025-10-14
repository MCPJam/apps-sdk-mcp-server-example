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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-8 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Asana_logo.svg"
            alt="Asana"
            className="h-6 opacity-60"
          />
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-sm text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
