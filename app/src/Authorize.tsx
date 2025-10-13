import { useEffect, useState, useMemo } from 'react';
import { useStytch } from '@stytch/react';
import { parseOAuthAuthorizeParams } from '@stytch/vanilla-js';

export function Authorize() {
  const stytch = useStytch();
  const [loading, setLoading] = useState(true);
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return parseOAuthAuthorizeParams(searchParams).result;
  }, []);

  useEffect(() => {
    const fetchAuthInfo = async () => {
      try {
        const response = await stytch.idp.oauthAuthorizeStart({
          ...params,
          response_type: 'code',
        });
        setAuthInfo(response);
      } catch (err) {
        console.error('OAuth authorize start failed:', err);
        setError('Failed to load authorization details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAuthInfo();
  }, [stytch, params]);

  const handleConsent = async (granted: boolean) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await stytch.idp.oauthAuthorizeSubmit({
        ...params,
        response_type: 'code',
        consent_granted: granted,
      });
      window.location.href = response.redirect_uri;
    } catch (err) {
      console.error('OAuth authorize submit failed:', err);
      setError('Authorization failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error && !authInfo) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Authorization Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h1 style={{ marginBottom: '20px' }}>Authorization Request</h1>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <p style={{ marginBottom: '10px' }}>
          <strong>{authInfo?.client_name || 'Application'}</strong> wants to access your Asana account.
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          This will allow the application to:
        </p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px', fontSize: '14px' }}>
          <li>View your Asana workspaces</li>
          <li>View and manage tasks</li>
        </ul>
      </div>

      {error && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ffebee', borderRadius: '6px' }}>
          <p style={{ color: '#c62828', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => handleConsent(true)}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: '#4CAF50',
            border: 'none',
            borderRadius: '6px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Authorizing...' : 'Allow'}
        </button>
        <button
          onClick={() => handleConsent(false)}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          Deny
        </button>
      </div>

      <p style={{ marginTop: '20px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
        Your data will be accessed securely according to our privacy policy.
      </p>
    </div>
  );
}
