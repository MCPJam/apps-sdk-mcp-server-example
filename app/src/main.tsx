import React from 'react';
import ReactDOM from 'react-dom/client';
import { StytchProvider } from '@stytch/react';
import { StytchUIClient } from '@stytch/vanilla-js';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const stytch = new StytchUIClient(
  import.meta.env.VITE_STYTCH_PUBLIC_TOKEN || ''
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StytchProvider stytch={stytch}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StytchProvider>
  </React.StrictMode>
);
