import { Routes, Route } from 'react-router-dom';
import { Login } from './Login';
import { Authenticate } from './Authenticate';
import { Authorize } from './Authorize';
import { AsanaAuthorize } from './AsanaAuthorize';
import { ProtectedRoute } from './ProtectedRoute';

function Home() {
  const params = new URLSearchParams(window.location.search);
  const asanaConnected = params.get('asana_connected');
  const error = params.get('error');

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Asana ChatGPT OAuth</h1>
      <p>OAuth authorization server is running.</p>

      {asanaConnected && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '6px',
            maxWidth: '500px',
            margin: '20px auto',
          }}
        >
          ✓ Successfully connected to Asana! You can now use the MCP tools.
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '6px',
            maxWidth: '500px',
            margin: '20px auto',
          }}
        >
          Error: {error}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <a
          href="/asana/authorize"
          style={{
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            display: 'inline-block',
          }}
        >
          Connect Asana Account
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/authenticate" element={<Authenticate />} />
      <Route
        path="/authorize"
        element={
          <ProtectedRoute>
            <Authorize />
          </ProtectedRoute>
        }
      />
      <Route path="/asana/authorize" element={<AsanaAuthorize />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
