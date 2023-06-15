import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom'
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import configureStore from './redux/store'
import { restoreCSRF, csrfFetch } from './redux/middleware/csrf';

import { ModalProvider } from './context/ModalContext';
import { SocketProvider } from './context/SocketContext';

const store = configureStore();


if (process.env.NODE_ENV !== 'production') {
  restoreCSRF();
  window.csrfFetch = csrfFetch;
  window.store = store;
}



function Root(){
  

  return(
    <Provider store={store}>
      <BrowserRouter>
          <SocketProvider> 
            <ModalProvider> 
              <App />
            </ModalProvider> 
          </SocketProvider> 
      </BrowserRouter>
    </Provider>
  );
}


ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById('root')
);
