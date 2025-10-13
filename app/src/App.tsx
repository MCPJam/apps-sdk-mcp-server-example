import { Routes, Route } from 'react-router-dom';
import { Login } from './Login';
import { Authenticate } from './Authenticate';
import { Authorize } from './Authorize';
import { ProtectedRoute } from './ProtectedRoute';

function Home() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Asana ChatGPT OAuth</h1>
      <p>OAuth authorization server is running.</p>
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
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
