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
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '40px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5em', marginBottom: '10px' }}>Asana MCP Server</h1>
      <p style={{ fontSize: '1.1em', color: '#666', marginBottom: '40px' }}>
        OAuth authorization server for Asana + ChatGPT integration
      </p>

      {asanaConnected && (
        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            border: '2px solid #c3e6cb',
          }}
        >
          <strong>✓ Successfully connected to Asana!</strong>
          <p style={{ margin: '10px 0 0 0' }}>You can now use the Asana MCP tools in ChatGPT.</p>
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            border: '2px solid #f5c6cb',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '30px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'left'
      }}>
        <h2 style={{ marginTop: 0 }}>Getting Started</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>
            <strong>Connect your MCP server to ChatGPT</strong>
            <p style={{ color: '#666', margin: '5px 0 10px 0' }}>
              Add this MCP server URL in ChatGPT Settings → Connectors
            </p>
          </li>
          <li>
            <strong>Authorize the MCP app</strong>
            <p style={{ color: '#666', margin: '5px 0 10px 0' }}>
              ChatGPT will redirect you to authorize access (Stytch OAuth)
            </p>
          </li>
          <li>
            <strong>Connect your Asana account</strong>
            <p style={{ color: '#666', margin: '5px 0 10px 0' }}>
              Click the button below to link your Asana account
            </p>
          </li>
        </ol>
      </div>

      <div style={{ marginTop: '30px' }}>
        <a
          href="/asana/authorize"
          style={{
            padding: '15px 30px',
            fontSize: '1.1em',
            backgroundColor: '#f06a6a',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            display: 'inline-block',
            fontWeight: 'bold',
          }}
        >
          Connect Asana Account
        </a>
      </div>

      <p style={{ marginTop: '30px', fontSize: '0.9em', color: '#999' }}>
        Need help? Check the <a href="https://github.com/your-repo" style={{ color: '#4CAF50' }}>documentation</a>
      </p>
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
