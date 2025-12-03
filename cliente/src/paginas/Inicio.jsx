import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../servicios/api';

const Inicio = () => {
  const [stats, setStats] = useState({
    total_libros: 0,
    alertas_stock: 0,
    ventas_mes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarStats = async () => {
      try {
        // Intentamos cargar, si falla no rompemos la app, solo mostramos ceros
        const res = await api.get('/dashboard');
        if(res.data) setStats(res.data);
      } catch (error) {
        console.error("Error dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarStats();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Cargando indicadores...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 fade-in">
      <h2 className="mb-4 fw-bold text-dark">Panel de Control</h2>
      
      <div className="row g-4">
        {/* Tarjeta 1 */}
        <div className="col-md-4">
          <div className="card text-white bg-primary h-100 shadow border-0 card-metric">
            <div className="card-body p-4">
              <h5 className="card-title opacity-75">Catálogo Total</h5>
              <h1 className="display-4 fw-bold my-2">{stats.total_libros}</h1>
              <p className="card-text small">Libros registrados en sistema</p>
            </div>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div className="col-md-4">
          <div className={`card text-white h-100 shadow border-0 card-metric ${stats.alertas_stock > 0 ? 'bg-danger' : 'bg-success'}`}>
            <div className="card-body p-4">
              <h5 className="card-title opacity-75">Alertas de Stock</h5>
              <h1 className="display-4 fw-bold my-2">{stats.alertas_stock}</h1>
              <p className="card-text small">
                {stats.alertas_stock > 0 ? 'Libros requieren atención' : 'Inventario saludable'}
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta 3 */}
        <div className="col-md-4">
          <div className="card text-white bg-info h-100 shadow border-0 card-metric">
            <div className="card-body p-4">
              <h5 className="card-title opacity-75">Ventas del Mes</h5>
              <h1 className="display-4 fw-bold my-2">{stats.ventas_mes}</h1>
              <p className="card-text small">Unidades despachadas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 p-4 bg-white rounded shadow-sm border">
        <h4 className="mb-3">Accesos Directos</h4>
        <div className="d-flex flex-wrap gap-3">
            <Link to="/movimientos" className="btn btn-outline-primary px-4 py-2">
                📉 Registrar Nueva Venta
            </Link>
            <Link to="/movimientos" className="btn btn-outline-success px-4 py-2">
                📈 Registrar Compra
            </Link>
            <Link to="/inventario" className="btn btn-outline-dark px-4 py-2">
                📦 Ver Inventario Completo
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Inicio;