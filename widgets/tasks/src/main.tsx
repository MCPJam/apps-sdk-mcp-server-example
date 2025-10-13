import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App';

const container = document.getElementById('tasks-root');

if (!container) {
  throw new Error('Missing tasks-root element');
}

const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);