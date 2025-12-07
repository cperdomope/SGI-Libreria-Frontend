import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../servicios/api';

// --- ICONOS SVG INLINE ---
const IconoDinero = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
    <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"/>
  </svg>
);

const IconoAlerta = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </svg>
);

const IconoLibros = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v11a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-11z"/>
    <path d="M9.5 1a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5h4z"/>
    <path d="M11 2.5v11a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-11A1.5 1.5 0 0 0 12.5 1h-2A1.5 1.5 0 0 0 11 2.5z"/>
  </svg>
);

const IconoClientes = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
  </svg>
);

const Inicio = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      const respuesta = await api.get('/dashboard');
      setEstadisticas(respuesta.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError('Error al cargar estadísticas del dashboard');
    } finally {
      setCargando(false);
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  if (cargando) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando indicadores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h5>Error al cargar el dashboard</h5>
          <p>{error}</p>
          <button onClick={cargarEstadisticas} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          No hay datos disponibles
          <button onClick={cargarEstadisticas} className="btn btn-primary ms-3">
            Cargar datos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark mb-0">
          Panel de Control - Dashboard
        </h2>
        <button
          onClick={cargarEstadisticas}
          className="btn btn-outline-primary btn-sm"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* KPIs Principales - Tarjetas */}
      <div className="row g-3 mb-4">
        {/* Ventas Hoy */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-white">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-white-50 mb-2">Ventas Hoy</h6>
                  <h3 className="fw-bold mb-0">{estadisticas.ventas_hoy.cantidad}</h3>
                  <p className="small mb-0 mt-2">{formatearPrecio(estadisticas.ventas_hoy.ingresos)}</p>
                </div>
                <IconoDinero />
              </div>
            </div>
          </div>
        </div>

        {/* Ventas del Mes */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 bg-gradient" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <div className="card-body text-white">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-white-50 mb-2">Ventas del Mes</h6>
                  <h3 className="fw-bold mb-0">{estadisticas.ventas_mes.cantidad}</h3>
                  <p className="small mb-0 mt-2">{formatearPrecio(estadisticas.ventas_mes.ingresos)}</p>
                </div>
                <IconoDinero />
              </div>
            </div>
          </div>
        </div>

        {/* Total Libros */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 bg-primary">
            <div className="card-body text-white">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-white-50 mb-2">Catálogo</h6>
                  <h3 className="fw-bold mb-0">{estadisticas.total_libros}</h3>
                  <p className="small mb-0 mt-2">Libros registrados</p>
                </div>
                <IconoLibros />
              </div>
            </div>
          </div>
        </div>

        {/* Stock Bajo */}
        <div className="col-md-3">
          <div className={`card border-0 shadow-sm h-100 ${estadisticas.alertas_stock > 0 ? 'bg-danger' : 'bg-success'}`}>
            <div className="card-body text-white">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-white-50 mb-2">Alertas Stock</h6>
                  <h3 className="fw-bold mb-0">{estadisticas.alertas_stock}</h3>
                  <p className="small mb-0 mt-2">
                    {estadisticas.alertas_stock > 0 ? 'Requieren reposición' : 'Todo OK'}
                  </p>
                </div>
                <IconoAlerta />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Productos Más Vendidos */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold">📊 Top 5 Productos Más Vendidos</h5>
            </div>
            <div className="card-body p-0">
              {estadisticas.productos_mas_vendidos.length === 0 ? (
                <p className="text-center text-muted py-4">No hay ventas registradas</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Libro</th>
                        <th>Autor</th>
                        <th className="text-center">Vendidos</th>
                        <th className="text-end">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estadisticas.productos_mas_vendidos.map((producto, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold">{producto.titulo}</td>
                          <td className="text-muted">{producto.autor || 'N/A'}</td>
                          <td className="text-center">
                            <span className="badge bg-primary">{producto.total_vendido}</span>
                          </td>
                          <td className="text-end text-success fw-bold">
                            {formatearPrecio(producto.ingresos_generados)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mejores Clientes */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold">⭐ Top 5 Mejores Clientes</h5>
            </div>
            <div className="card-body p-0">
              {estadisticas.mejores_clientes.length === 0 ? (
                <p className="text-center text-muted py-4">No hay clientes con compras</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Cliente</th>
                        <th className="text-center">Compras</th>
                        <th className="text-end">Total Gastado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estadisticas.mejores_clientes.map((cliente, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="fw-semibold">{cliente.nombre}</div>
                            <small className="text-muted">{cliente.documento}</small>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-info">{cliente.total_compras}</span>
                          </td>
                          <td className="text-end text-success fw-bold">
                            {formatearPrecio(cliente.total_gastado)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Libros con Stock Bajo */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold text-danger">⚠️ Libros con Stock Bajo</h5>
            </div>
            <div className="card-body p-0">
              {estadisticas.libros_stock_bajo.length === 0 ? (
                <p className="text-center text-success py-4">✅ No hay libros con stock bajo</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-striped mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Autor</th>
                        <th className="text-center">Stock Actual</th>
                        <th className="text-center">Stock Mínimo</th>
                        <th className="text-center">Faltante</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estadisticas.libros_stock_bajo.map((libro) => (
                        <tr key={libro.id}>
                          <td>#{libro.id}</td>
                          <td className="fw-semibold">{libro.titulo}</td>
                          <td className="text-muted">{libro.autor || 'N/A'}</td>
                          <td className="text-center">
                            <span className="badge bg-danger">{libro.stock_actual}</span>
                          </td>
                          <td className="text-center">{libro.stock_minimo}</td>
                          <td className="text-center text-danger fw-bold">{libro.faltante}</td>
                          <td>
                            <Link
                              to="/inventario"
                              className="btn btn-sm btn-outline-primary"
                            >
                              Reabastecer
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accesos Directos */}
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">🚀 Accesos Directos</h5>
          <div className="d-flex flex-wrap gap-3">
            <Link to="/ventas" className="btn btn-primary px-4">
              💰 Nueva Venta (POS)
            </Link>
            <Link to="/historial-ventas" className="btn btn-outline-primary px-4">
              📋 Ver Historial de Ventas
            </Link>
            <Link to="/inventario" className="btn btn-outline-secondary px-4">
              📦 Gestionar Inventario
            </Link>
            <Link to="/clientes" className="btn btn-outline-info px-4">
              👥 Gestionar Clientes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
