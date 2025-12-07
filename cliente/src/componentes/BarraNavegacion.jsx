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

const IconoProveedores = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
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

const IconoHistorial = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/>
    <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
    <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
  </svg>
);

const IconoAutores = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z"/>
  </svg>
);

const IconoCategorias = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586V2zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
    <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043-7.457-7.457z"/>
  </svg>
);

const IconoSalir = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z"/>
    <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z"/>
  </svg>
);

const BarraNavegacion = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const manejarSalida = () => {
    if(window.confirm('¿Desea cerrar sesión?')) {
      logout();
    }
  };

  // Función para determinar si un link está activo
  const esRutaActiva = (ruta) => location.pathname === ruta;

  // Función para determinar si un dropdown contiene la ruta activa
  const dropdownActivo = (rutas) => rutas.includes(location.pathname);

  // Clases para links normales
  const claseLink = (ruta) => {
    const base = "nav-link d-flex align-items-center gap-2 px-3 mx-1";
    return esRutaActiva(ruta)
      ? `${base} text-white bg-white bg-opacity-25 rounded-pill fw-bold shadow-sm`
      : `${base} text-white text-opacity-75`;
  };

  // Clases para dropdown toggle
  const claseDropdown = (rutas) => {
    const base = "nav-link dropdown-toggle d-flex align-items-center gap-2 px-3 mx-1";
    return dropdownActivo(rutas)
      ? `${base} text-white bg-white bg-opacity-25 rounded-pill fw-bold shadow-sm`
      : `${base} text-white text-opacity-75`;
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
            {/* Dashboard - Link Simple */}
            <li className="nav-item">
              <Link className={claseLink('/')} to="/">
                Dashboard
              </Link>
            </li>

            {/* DROPDOWN: Gestión Comercial */}
            <li className="nav-item dropdown">
              <a
                className={claseDropdown(['/ventas', '/historial-ventas', '/clientes'])}
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Gestión Comercial
              </a>
              <ul className="dropdown-menu shadow-sm border-0">
                <li>
                  <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/ventas">
                    <IconoVentas /> POS / Ventas
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/historial-ventas">
                    <IconoHistorial /> Historial
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/clientes">
                    <IconoClientes /> Clientes
                  </Link>
                </li>
              </ul>
            </li>

            {/* DROPDOWN: Logística */}
            <li className="nav-item dropdown">
              <a
                className={claseDropdown(['/inventario', '/movimientos', '/proveedores', '/autores', '/categorias'])}
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Logística
              </a>
              <ul className="dropdown-menu shadow-sm border-0">
                <li>
                  <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/inventario">
                    <IconoInventario /> Inventario
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/movimientos">
                    <IconoMovimientos /> Movimientos
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/autores">
                    <IconoAutores /> Autores
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/categorias">
                    <IconoCategorias /> Categorías
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/proveedores">
                    <IconoProveedores /> Proveedores
                  </Link>
                </li>
              </ul>
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