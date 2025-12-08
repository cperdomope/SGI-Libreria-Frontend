import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BarraNavegacion from './componentes/BarraNavegacion';
import RutaProtegidaPorRol from './componentes/RutaProtegidaPorRol';
import Inicio from './paginas/Inicio';
import Inventario from './paginas/Inventario';
import Movimientos from './paginas/Movimientos';
import PaginaClientes from './paginas/PaginaClientes';
import PaginaVentas from './paginas/PaginaVentas';
import HistorialVentas from './paginas/HistorialVentas';
import PaginaProveedores from './paginas/PaginaProveedores';
import PaginaAutores from './paginas/PaginaAutores';
import PaginaCategorias from './paginas/PaginaCategorias';
import Acceso from './paginas/Acceso';
import { AuthProvider, useAuth } from './contexto/AuthContext';

// 1. Componente que protege las rutas privadas
const RutaProtegida = ({ children }) => {
  const { usuario, cargando } = useAuth();
  
  if (cargando) return <div className="p-5 text-center">Cargando sistema...</div>;
  
  if (!usuario) {
    return <Navigate to="/acceso" replace />;
  }
  
  return children;
};

// 2. Layout que incluye la barra de navegación
const LayoutPrincipal = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <BarraNavegacion />
      <div className="flex-grow-1">
        {children}
      </div>
      <footer className="bg-light text-center p-3 mt-auto border-top">
        <small className="text-muted">© 2025 SGI Librería - Proyecto SENA</small>
      </footer>
    </div>
  );
};

// 3. App Principal
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/acceso" element={<Acceso />} />

          {/* Rutas Privadas con Protección por Rol */}

          {/* DASHBOARD - Solo Administradores */}
          <Route path="/" element={
            <RutaProtegida>
              <RutaProtegidaPorRol permiso="verDashboard" redirigirA="/ventas">
                <LayoutPrincipal><Inicio /></LayoutPrincipal>
              </RutaProtegidaPorRol>
            </RutaProtegida>
          } />

          {/* INVENTARIO - Todos pueden ver, solo Admin edita (control en página) */}
          <Route path="/inventario" element={
            <RutaProtegida>
              <RutaProtegidaPorRol permiso="verInventario">
                <LayoutPrincipal><Inventario /></LayoutPrincipal>
              </RutaProtegidaPorRol>
            </RutaProtegida>
          } />

          {/* MOVIMIENTOS - Solo Administradores */}
          <Route path="/movimientos" element={
            <RutaProtegida>
              <RutaProtegidaPorRol permiso="registrarMovimiento">
                <LayoutPrincipal><Movimientos /></LayoutPrincipal>
              </RutaProtegidaPorRol>
            </RutaProtegida>
          } />

          {/* CLIENTES - Todos pueden gestionar */}
          <Route path="/clientes" element={
            <RutaProtegida>
              <RutaProtegidaPorRol permiso="verClientes">
                <LayoutPrincipal><PaginaClientes /></LayoutPrincipal>
              </RutaProtegidaPorRol>
            </RutaProtegida>
          } />

          {/* VENTAS (POS) - Administradores y Vendedores */}
          <Route path="/ventas" element={
            <RutaProtegida>
              <RutaProtegidaPorRol permiso="registrarVenta">
                <LayoutPrincipal><PaginaVentas /></LayoutPrincipal>
              </RutaProtegidaPorRol>
            </RutaProtegida>
          } />

          {/* HISTORIAL VENTAS - Administradores y Vendedores */}
          <Route path="/historial-ventas" element={
            <RutaProtegida>
              <RutaProtegidaPorRol permiso="verVentas">
                <LayoutPrincipal><HistorialVentas /></LayoutPrincipal>
              </RutaProtegidaPorRol>
            </RutaProtegida>
          } />

          {/* PROVEEDORES - Solo Administradores */}
          <Route path="/proveedores" element={
            <RutaProtegida>
              <RutaProtegidaPorRol permiso="verProveedores">
                <LayoutPrincipal><PaginaProveedores /></LayoutPrincipal>
              </RutaProtegidaPorRol>
            </RutaProtegida>
          } />

          {/* AUTORES - Todos pueden ver, solo Admin edita (control en página) */}
          <Route path="/autores" element={
            <RutaProtegida>
              <RutaProtegidaPorRol permiso="verAutores">
                <LayoutPrincipal><PaginaAutores /></LayoutPrincipal>
              </RutaProtegidaPorRol>
            </RutaProtegida>
          } />

          {/* CATEGORÍAS - Todos pueden ver, solo Admin edita (control en página) */}
          <Route path="/categorias" element={
            <RutaProtegida>
              <RutaProtegidaPorRol permiso="verCategorias">
                <LayoutPrincipal><PaginaCategorias /></LayoutPrincipal>
              </RutaProtegidaPorRol>
            </RutaProtegida>
          } />

          {/* Cualquier ruta desconocida redirige a ventas (accesible para todos) */}
          <Route path="*" element={<Navigate to="/ventas" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;