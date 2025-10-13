import { useMemo, useEffect } from 'react';
import {
  StytchLogin,
  useStytchUser,
  type StytchLoginConfig,
} from '@stytch/react';
import {
  Products,
  OAuthProviders,
  OTPMethods,
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

  const loginConfig = useMemo<StytchLoginConfig>(
    () => ({
      products: [Products.oauth],
      oauthOptions: {
        providers: [{ type: OAuthProviders.Google }],
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
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '30px' }}>
      <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>Sign In</h1>
      <StytchLogin config={loginConfig} callbacks={{ onEvent: handleOnEvent }} />
    </div>
  );
}
