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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-8 border-b border-gray-200 text-center">
            <div className="flex flex-col items-center justify-center gap-3 mb-2">
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Asana_logo.svg"
                alt="Asana"
                className="h-8 opacity-60"
              />
              <h1 className="text-3xl font-semibold text-gray-900">Unofficial Asana Apps SDK MCP Server</h1>
            </div>
          </div>

          {/* Success Message */}
          {asanaConnected && (
            <div className="mx-6 mt-6 p-4 bg-asana-green/10 border border-asana-green/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-asana-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-asana-green">Successfully connected to Asana!</p>
                  <p className="text-sm text-asana-successText mt-1">You can now use the Asana MCP tools in ChatGPT.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Getting Started */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold flex items-center justify-center">1</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Connect your MCP server to ChatGPT</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Add this MCP server URL in ChatGPT Settings → Connectors
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold flex items-center justify-center">2</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Authorize the MCP app</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ChatGPT will redirect you to authorize access (Stytch OAuth)
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold flex items-center justify-center">3</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Connect your Asana account</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click the button below to link your Asana account
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* CTA */}
          <div className="px-6 py-6 bg-gray-50 border-t border-gray-200 text-center">
            <a
              href="/asana/authorize"
              className="inline-flex items-center gap-2 px-6 py-3 bg-coral-500 hover:bg-coral-600 text-white text-sm font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: '#f06a6a' }}
            >
              Connect Asana Account
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          Need help? Check the <a href="https://github.com/your-repo" className="text-blue-600 hover:text-blue-700">documentation</a>
        </p>
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
