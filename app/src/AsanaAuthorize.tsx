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
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '30px', textAlign: 'center' }}>
        <h2>Authorization Error</h2>
        <p style={{ color: '#c62828' }}>{error}</p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '30px', textAlign: 'center' }}>
      <h2>Connecting to Asana...</h2>
      <p>Redirecting you to Asana to authorize access...</p>
    </div>
  );
}
