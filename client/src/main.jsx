// css import
import './index.css'

// Component import
import App from './App.jsx'
import store from './Redux/store.js';


// library import
import { Toaster } from 'react-hot-toast';
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

createRoot(document.getElementById('root')).render(
  <Provider store={store}> 
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </Provider>
);

