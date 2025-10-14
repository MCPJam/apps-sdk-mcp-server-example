import { useEffect, useState } from 'react';
import { useStytchUser } from '@stytch/react';

export function AsanaAuthorize() {
  const { user } = useStytchUser();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('returnTo', window.location.pathname + window.location.search);
      window.location.href = '/login';
      return;
    }

    console.log('========================================');
    console.log('ASANA AUTHORIZATION FLOW STARTING');
    console.log('Stytch user object:', user);
    console.log('🔑 User ID:', user.user_id);
    console.log('This will be used to map Asana tokens on callback');
    console.log('========================================');

    // Build Asana OAuth URL
    const asanaAuthUrl = new URL('https://app.asana.com/-/oauth_authorize');
    asanaAuthUrl.searchParams.set('client_id', '1211620390541079');
    asanaAuthUrl.searchParams.set('redirect_uri', 'http://localhost:3010/oauth/callback');
    asanaAuthUrl.searchParams.set('response_type', 'code');
    asanaAuthUrl.searchParams.set('state', user.user_id);

    console.log('Redirecting to Asana OAuth:', asanaAuthUrl.toString());

    // Redirect to Asana
    window.location.href = asanaAuthUrl.toString();
  }, [user]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-8 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authorization Error</h2>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Asana_logo.svg"
            alt="Asana"
            className="h-8 opacity-60"
          />
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting to Asana</h2>
        <p className="text-sm text-gray-600">Redirecting you to Asana to authorize access...</p>
      </div>
    </div>
  );
}
