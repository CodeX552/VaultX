import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// React app ko root DOM node me mount kar rahe hain.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* BrowserRouter se client-side navigation enable hoti hai. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
