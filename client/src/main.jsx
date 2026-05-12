import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import './core/i18n/config'; // configures i18next + html dir/lang
import './index.css';
import { store } from './app/store';
import { attachCartPersistence } from './features/cart/persist';
import App from './App.jsx';

// Hydrate cart from localStorage before the first render so the cart icon
// shows the saved count immediately (no "0 → real" flash).
attachCartPersistence(store);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
