import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 1. Cargamos Bootstrap (Librería externa)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// 2. Cargamos tus Estilos Personalizados (¡ESTO FALTABA!)
// Sin esto, la tarjeta de login no sabe que debe centrarse ni tener color
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)