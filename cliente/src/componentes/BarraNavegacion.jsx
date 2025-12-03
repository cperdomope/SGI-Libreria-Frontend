import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContext';

// --- ICONOS SVG INLINE ---
const IconoLibro = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
    <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v9.138a1.5 1.5 0 0 1-1.272 1.488L2.5 13.5A1.5 1.5 0 0 1 1 12V2.5zM2.5 2a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-3z"/>
    <path d="M8 2.5A1.5 1.5 0 0 1 9.5 1h3A1.5 1.5 0 0 1 14 2.5v9.138a1.5 1.5 0 0 1-1.272 1.488L9.5 13.5A1.5 1.5 0 0 1 8 12V2.5zM9.5 2a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-3z"/>
  </svg>
);

const IconoInventario = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
  </svg>
);

const IconoClientes = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
  </svg>
);

const IconoMovimientos = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 4H14.5a.5.5 0 0 0 .5-.5z"/>
  </svg>
);

// Nuevo Icono para Ventas (Billete/Caja)
const IconoVentas = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
    <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"/>
  </svg>
);

const IconoSalir = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z"/>
    <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z"/>
  </svg>
);

const BarraNavegacion = () => {
  const { usuario, cerrarSesion } = useAuth(); // Contexto de Autenticación
  const navigate = useNavigate();
  const location = useLocation();

  const manejarSalida = () => {
    if(window.confirm('¿Desea cerrar sesión?')) {
      cerrarSesion();
      navigate('/acceso');
    }
  };

  // Función auxiliar mejorada para resaltar la ruta activa con estilo "Pill"
  const activo = (ruta) => {
    const base = "nav-link d-flex align-items-center gap-2 px-3 mx-1 transition-all";
    return location.pathname === ruta 
      ? `${base} text-white bg-white bg-opacity-25 rounded-pill fw-bold shadow-sm` 
      : `${base} text-white text-opacity-75 hover-opacity-100`;
  };

  return (
    <nav 
      className="navbar navbar-expand-lg navbar-dark shadow"
      style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)' }}
    >
      <div className="container-fluid px-4">
        {/* Marca / Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/" style={{ fontSize: '1.25rem' }}>
          <div className="bg-white text-primary rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 35, height: 35 }}>
             <IconoLibro />
          </div>
          <span>SGI Librería</span>
        </Link>

        {/* Botón hamburguesa para móvil */}
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#menuNavegacion" 
          aria-controls="menuNavegacion" 
          aria-expanded="false" 
          aria-label="Alternar navegación"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido colapsable */}
        <div className="collapse navbar-collapse py-2 py-lg-0" id="menuNavegacion">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className={activo('/')} to="/">
                Dashboard
              </Link>
            </li>
            
            {/* --- VENTAS / POS (NUEVO) --- */}
            <li className="nav-item">
              <Link className={activo('/ventas')} to="/ventas">
                <IconoVentas /> POS / Ventas
              </Link>
            </li>

            <li className="nav-item">
              <Link className={activo('/inventario')} to="/inventario">
                <IconoInventario /> Inventario
              </Link>
            </li>
            <li className="nav-item">
              <Link className={activo('/movimientos')} to="/movimientos">
                <IconoMovimientos /> Movimientos
              </Link>
            </li>
            <li className="nav-item">
              <Link className={activo('/clientes')} to="/clientes">
                <IconoClientes /> Clientes
              </Link>
            </li>
          </ul>

          {/* Sección de Usuario */}
          <div className="d-flex align-items-center text-white border-start border-white border-opacity-25 ps-lg-4 ms-lg-2 mt-3 mt-lg-0">
            <div className="me-3 lh-1 text-end d-none d-lg-block">
              <div className="small text-white-50">Bienvenido</div>
              <div className="fw-bold">{usuario?.nombre || 'Administrador'}</div>
            </div>
            <button 
              className="btn btn-light bg-white bg-opacity-10 border-0 text-white rounded-circle p-2 d-flex align-items-center justify-content-center hover-bg-opacity-25"
              style={{ width: 40, height: 40 }}
              onClick={manejarSalida}
              title="Cerrar Sesión"
            >
              <IconoSalir />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BarraNavegacion;