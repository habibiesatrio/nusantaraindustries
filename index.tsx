// index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Jika menggunakan router eksternal
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      {/* Membungkus di level ini memastikan seluruh navigasi 
         di InputNodePage dan Dashboard berjalan lancar 
      */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}