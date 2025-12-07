import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../servicios/api';
import { useAuth } from '../contexto/AuthContext';

// Iconos SVG Inline
const Icons = {
  Book: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
      <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    </svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
    </svg>
  ),
  Eye: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
    </svg>
  ),
  EyeSlash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
    </svg>
  )
};

const Acceso = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  // Estados para errores específicos de cada campo
  const [errores, setErrores] = useState({ email: '', password: '', general: '' });
  const [loading, setLoading] = useState(false);
  const [intentosRestantes, setIntentosRestantes] = useState(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [mensajeDetallado, setMensajeDetallado] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Función de Validación Robusta
  const validarFormulario = () => {
    let esValido = true;
    const nuevosErrores = { email: '', password: '', general: '' };

    // 1. Validar Email
    if (!email) {
      nuevosErrores.email = 'El correo electrónico es obligatorio.';
      esValido = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nuevosErrores.email = 'El formato del correo no es válido.';
      esValido = false;
    }

    // 2. Validar Contraseña
    if (!password) {
      nuevosErrores.password = 'La contraseña es obligatoria.';
      esValido = false;
    } else if (password.length < 4) {
      nuevosErrores.password = 'La contraseña debe tener al menos 4 caracteres.';
      esValido = false;
    }

    setErrores(nuevosErrores);
    return esValido;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Ejecutar validación antes de enviar
    if (!validarFormulario()) return;

    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });

      // Guardar datos de sesión
      login(res.data.usuario, res.data.token);

      // Forzar recarga completa para evitar conflictos con la advertencia del navegador
      window.location.href = '/';

    } catch (err) {
      const errorData = err.response?.data;

      // Verificar si la cuenta está bloqueada
      if (errorData?.bloqueado) {
        setBloqueado(true);
        setIntentosRestantes(0);
        setMensajeDetallado(errorData.error);
      } else if (errorData?.intentosRestantes !== undefined) {
        // Mostrar intentos restantes
        setIntentosRestantes(errorData.intentosRestantes);
        setMensajeDetallado(errorData.mensaje || errorData.error);
        setBloqueado(false);
      } else {
        // Error genérico
        setMensajeDetallado(errorData?.error || 'No se pudo conectar al servidor. Intente más tarde.');
        setBloqueado(false);
      }

      setErrores(prev => ({
        ...prev,
        general: errorData?.error || 'Error de conexión'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="login-icon">
            <Icons.Book />
          </div>
          <h2 className="fw-bold text-dark">Bienvenido</h2>
          <p className="text-muted">Sistema de Gestión Bibliotecaria</p>
        </div>
        
        {/* Alerta de Error con Intentos Restantes */}
        {errores.general && (
          <div className={`alert ${bloqueado ? 'alert-danger' : 'alert-warning'} mb-4`} role="alert">
            <div className="d-flex align-items-start">
              <div className="flex-grow-1">
                <strong className="d-block mb-1">
                  {bloqueado ? '🔒 Cuenta Bloqueada' : '⚠️ Error de Autenticación'}
                </strong>
                <p className="mb-2 small">{mensajeDetallado || errores.general}</p>
                {intentosRestantes !== null && !bloqueado && (
                  <div className="mt-2">
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${
                          intentosRestantes === 2 ? 'bg-success' :
                          intentosRestantes === 1 ? 'bg-warning' : 'bg-danger'
                        }`}
                        style={{ width: `${(intentosRestantes / 3) * 100}%` }}
                      ></div>
                    </div>
                    <small className="text-muted mt-1 d-block">
                      Intentos restantes: <strong>{intentosRestantes}</strong> de 3
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          {/* Input Email */}
          <div className="mb-4">
            <label className="form-label fw-bold small text-muted">CORREO ELECTRÓNICO</label>
            <div className="input-group has-validation">
              <span className="input-group-text bg-light border-end-0 text-muted"><Icons.User /></span>
              <input 
                type="email" 
                className={`form-control border-start-0 bg-light ${errores.email ? 'is-invalid' : ''}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errores.email) setErrores({ ...errores, email: '' }); 
                }}
                placeholder="ejemplo@sena.edu.co"
                required 
                disabled={loading}
              />
              <div className="invalid-feedback">
                {errores.email}
              </div>
            </div>
          </div>

          {/* Input Password */}
          <div className="mb-4">
            <label className="form-label fw-bold small text-muted">CONTRASEÑA</label>
            <div className="input-group has-validation">
              <span className="input-group-text bg-light border-end-0 text-muted"><Icons.Lock /></span>
              <input 
                type={mostrarPassword ? "text" : "password"} 
                className={`form-control border-start-0 border-end-0 bg-light ${errores.password ? 'is-invalid' : ''}`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errores.password) setErrores({ ...errores, password: '' });
                }}
                placeholder="••••••"
                required 
                disabled={loading}
              />
              <button 
                className="btn btn-light border border-start-0 text-muted" 
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              >
                {mostrarPassword ? <Icons.EyeSlash /> : <Icons.Eye />}
              </button>
              <div className="invalid-feedback">
                {errores.password}
              </div>
            </div>
          </div>

          <div className="d-grid gap-2">
            <button
              type="submit"
              className={`btn ${bloqueado ? 'btn-danger' : 'btn-primary'} py-2 fw-bold`}
              disabled={loading || bloqueado}
            >
              {bloqueado ? (
                <>
                  🔒 CUENTA BLOQUEADA
                </>
              ) : loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Validando...
                </>
              ) : (
                'INGRESAR AL SISTEMA'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <small className="text-muted">
            Proyecto Tecnólogo SENA &copy; 2025
          </small>
        </div>
      </div>
    </div>
  );
};

export default Acceso;