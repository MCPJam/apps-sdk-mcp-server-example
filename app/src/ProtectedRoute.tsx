import { useEffect } from 'react';
import { useStytchUser } from '@stytch/react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, fromCache } = useStytchUser();

  useEffect(() => {
    if (!user && !fromCache) {
      localStorage.setItem('returnTo', window.location.pathname + window.location.search);
      window.location.href = '/login';
    }
  }, [user, fromCache]);

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
