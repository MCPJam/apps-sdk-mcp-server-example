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

      // Redirect back to the MCP client with the authorization result
      window.location.href = response.redirect_uri;
    } catch (err) {
      console.error('OAuth authorize submit failed:', err);
      setError('Authorization failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-4">Loading authorization details...</p>
        </div>
      </div>
    );
  }

  if (error && !authInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-8 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authorization Error</h2>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-center mb-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Asana_logo.svg"
                alt="Asana"
                className="h-6 opacity-60"
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 text-center">Authorization Request</h1>
          </div>

          {/* Request Details */}
          <div className="px-6 py-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-900 mb-3">
                <strong className="font-semibold">{authInfo?.client_name || 'Unofficial Asana MCP Server'}</strong> wants to access your Asana account.
              </p>
              <p className="text-sm text-gray-600 mb-2">
                This will allow the application to:
              </p>
              <ul className="space-y-1.5 ml-4">
                <li className="text-sm text-gray-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>View your Asana workspaces</span>
                </li>
                <li className="text-sm text-gray-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>View and manage tasks</span>
                </li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800 flex-1">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleConsent(true)}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {submitting ? 'Authorizing...' : 'Allow'}
              </button>
              <button
                onClick={() => handleConsent(false)}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 text-sm font-semibold border border-gray-300 rounded-lg transition-colors"
              >
                Deny
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Your data will be accessed securely according to our privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
