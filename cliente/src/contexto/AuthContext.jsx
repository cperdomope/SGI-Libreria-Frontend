import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al iniciar la app, intentamos recuperar la sesión
  useEffect(() => {
    try {
      const usuarioGuardado = localStorage.getItem('usuario_sgi');
      const tokenGuardado = localStorage.getItem('token_sgi');

      if (usuarioGuardado && tokenGuardado) {
        // Parseamos con cuidado
        const userParseado = JSON.parse(usuarioGuardado);
        if (userParseado && userParseado.id) {
            setUsuario(userParseado);
        }
      }
    } catch (error) {
      console.error("Error recuperando sesión:", error);
      // Si hay error (datos corruptos), limpiamos todo por seguridad
      localStorage.removeItem('usuario_sgi');
      localStorage.removeItem('token_sgi');
    } finally {
      // Siempre terminamos de cargar, haya usuario o no
      setCargando(false);
    }
  }, []);

  const login = (datosUsuario, token) => {
    // Validar que los datos sean reales antes de guardar
    if (!datosUsuario || !token) {
        console.error("Intento de login con datos vacíos");
        return;
    }
    
    setUsuario(datosUsuario);
    localStorage.setItem('usuario_sgi', JSON.stringify(datosUsuario));
    localStorage.setItem('token_sgi', token);
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario_sgi');
    localStorage.removeItem('token_sgi');
    // Usamos reload para limpiar completamente la memoria de React
    window.location.href = '/acceso';
  };

  const value = {
    usuario,
    login,
    logout,
    cargando
  };

  return (
    <AuthContext.Provider value={value}>
      {!cargando && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};