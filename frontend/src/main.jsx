// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

try {
    root.render(<App />);
    console.log('React app rendered successfully');
} catch (error) {
    console.error('Error rendering React app:', error);
    document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;"><h1>Error Loading App</h1><pre>' + error.message + '</pre></div>';
}