import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BarraNavegacion from './componentes/BarraNavegacion';
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

          {/* Rutas Privadas */}
          <Route path="/" element={
            <RutaProtegida>
              <LayoutPrincipal><Inicio /></LayoutPrincipal>
            </RutaProtegida>
          } />
          
          <Route path="/inventario" element={
            <RutaProtegida>
              <LayoutPrincipal><Inventario /></LayoutPrincipal>
            </RutaProtegida>
          } />
          
          <Route path="/movimientos" element={
            <RutaProtegida>
              <LayoutPrincipal><Movimientos /></LayoutPrincipal>
            </RutaProtegida>
          } />

          <Route path="/clientes" element={
            <RutaProtegida>
              <LayoutPrincipal><PaginaClientes /></LayoutPrincipal>
            </RutaProtegida>
          } />

          {/* --- NUEVA RUTA DE VENTAS (POS) --- */}
          <Route path="/ventas" element={
            <RutaProtegida>
              <LayoutPrincipal><PaginaVentas /></LayoutPrincipal>
            </RutaProtegida>
          } />

          {/* --- RUTA DE HISTORIAL DE VENTAS --- */}
          <Route path="/historial-ventas" element={
            <RutaProtegida>
              <LayoutPrincipal><HistorialVentas /></LayoutPrincipal>
            </RutaProtegida>
          } />

          {/* --- RUTA DE PROVEEDORES --- */}
          <Route path="/proveedores" element={
            <RutaProtegida>
              <LayoutPrincipal><PaginaProveedores /></LayoutPrincipal>
            </RutaProtegida>
          } />

          {/* --- RUTA DE AUTORES --- */}
          <Route path="/autores" element={
            <RutaProtegida>
              <LayoutPrincipal><PaginaAutores /></LayoutPrincipal>
            </RutaProtegida>
          } />

          {/* --- RUTA DE CATEGORÍAS --- */}
          <Route path="/categorias" element={
            <RutaProtegida>
              <LayoutPrincipal><PaginaCategorias /></LayoutPrincipal>
            </RutaProtegida>
          } />

          {/* Cualquier ruta desconocida redirige al inicio */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;