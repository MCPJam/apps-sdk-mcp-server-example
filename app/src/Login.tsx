import { useMemo, useEffect } from 'react';
import {
  StytchLogin,
  useStytchUser,
} from '@stytch/react';
import {
  Products,
  OAuthProviders,
  type StytchEvent,
} from '@stytch/vanilla-js';

export function Login() {
  const { user } = useStytchUser();

  useEffect(() => {
    if (user) {
      const returnTo = localStorage.getItem('returnTo') || '/';
      localStorage.removeItem('returnTo');
      window.location.href = returnTo;
    }
  }, [user]);

  const loginConfig = useMemo(
    () => ({
      products: [Products.oauth],
      oauthOptions: {
        providers: [{ type: OAuthProviders.Github }],
        loginRedirectURL: window.location.origin + '/authenticate',
        signupRedirectURL: window.location.origin + '/authenticate',
      },
    }),
    []
  );

  const handleOnEvent = (evt: StytchEvent) => {
    if (evt.type === 'AUTHENTICATE_FLOW_COMPLETE') {
      const returnTo = localStorage.getItem('returnTo') || '/';
      localStorage.removeItem('returnTo');
      window.location.href = returnTo;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
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
            <h1 className="text-xl font-semibold text-gray-900 text-center">Sign In</h1>
            <p className="text-sm text-gray-600 text-center mt-2">
              Sign in to authorize the Unofficial Asana MCP Server
            </p>
          </div>

          {/* Login Form */}
          <div className="px-6 py-6">
            <StytchLogin config={loginConfig} callbacks={{ onEvent: handleOnEvent }} />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Secure authentication powered by Stytch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
