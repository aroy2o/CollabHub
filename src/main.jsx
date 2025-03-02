import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Switched back to BrowserRouter for clean URLs
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App.jsx';
import './index.css';

// Note: Ensure your server/Vite dev server is configured to fallback to index.html for unmatched routes.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
