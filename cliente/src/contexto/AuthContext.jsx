import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

// ======================================
// CONSTANTES DE ROLES
// ======================================
export const ROLES = {
  ADMINISTRADOR: 1,
  VENDEDOR: 2
};

// ======================================
// PERMISOS POR ROL
// ======================================
export const PERMISOS = {
  [ROLES.ADMINISTRADOR]: {
    // Dashboard
    verDashboard: true,

    // Inventario (Libros)
    verInventario: true,
    crearLibro: true,
    editarLibro: true,
    eliminarLibro: true,

    // Autores
    verAutores: true,
    crearAutor: true,
    editarAutor: true,
    eliminarAutor: true,

    // Categorías
    verCategorias: true,
    crearCategoria: true,
    editarCategoria: true,
    eliminarCategoria: true,

    // Clientes
    verClientes: true,
    crearCliente: true,
    editarCliente: true,
    eliminarCliente: true,

    // Proveedores
    verProveedores: true,
    crearProveedor: true,
    editarProveedor: true,
    eliminarProveedor: true,

    // Ventas
    registrarVenta: true,
    verVentas: true,

    // Movimientos
    registrarMovimiento: true
  },
  [ROLES.VENDEDOR]: {
    // Dashboard
    verDashboard: false,

    // Inventario (Libros) - Solo lectura
    verInventario: true,
    crearLibro: false,
    editarLibro: false,
    eliminarLibro: false,

    // Autores - Solo lectura
    verAutores: true,
    crearAutor: false,
    editarAutor: false,
    eliminarAutor: false,

    // Categorías - Solo lectura
    verCategorias: true,
    crearCategoria: false,
    editarCategoria: false,
    eliminarCategoria: false,

    // Clientes - Solo listar y crear (para ventas)
    verClientes: true,
    crearCliente: true,
    editarCliente: false, // Solo admin puede editar
    eliminarCliente: false, // Solo admin puede eliminar

    // Proveedores - Sin acceso
    verProveedores: false,
    crearProveedor: false,
    editarProveedor: false,
    eliminarProveedor: false,

    // Ventas - Función principal
    registrarVenta: true,
    verVentas: true,

    // Movimientos - Sin acceso
    registrarMovimiento: false
  }
};

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

  // ======================================
  // UTILIDADES DE ROLES
  // ======================================

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {number} rolRequerido - ID del rol a verificar
   * @returns {boolean}
   */
  const tieneRol = (rolRequerido) => {
    if (!usuario || !usuario.rol_id) return false;
    return usuario.rol_id === rolRequerido;
  };

  /**
   * Verifica si el usuario es Administrador
   * @returns {boolean}
   */
  const esAdministrador = () => {
    return tieneRol(ROLES.ADMINISTRADOR);
  };

  /**
   * Verifica si el usuario es Vendedor
   * @returns {boolean}
   */
  const esVendedor = () => {
    return tieneRol(ROLES.VENDEDOR);
  };

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} permiso - Nombre del permiso a verificar
   * @returns {boolean}
   */
  const tienePermiso = (permiso) => {
    if (!usuario || !usuario.rol_id) return false;
    const permisosDelRol = PERMISOS[usuario.rol_id];
    return permisosDelRol && permisosDelRol[permiso] === true;
  };

  /**
   * Obtiene el nombre del rol del usuario actual
   * @returns {string}
   */
  const nombreRol = () => {
    if (!usuario || !usuario.rol_id) return 'Invitado';
    return usuario.rol_id === ROLES.ADMINISTRADOR ? 'Administrador' : 'Vendedor';
  };

  const value = {
    usuario,
    login,
    logout,
    cargando,
    // Utilidades de roles
    tieneRol,
    esAdministrador,
    esVendedor,
    tienePermiso,
    nombreRol,
    ROLES
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