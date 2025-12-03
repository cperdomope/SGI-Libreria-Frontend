import React, { useState, useEffect } from 'react';
import api from '../servicios/api';

// --- ICONOS SVG INLINE ---
const IconoOjo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
  </svg>
);

const IconoImpresora = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
    <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
  </svg>
);

const HistorialVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [detalleVenta, setDetalleVenta] = useState(null);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      setCargando(true);
      const respuesta = await api.get('/ventas');
      setVentas(respuesta.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el historial de ventas');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const verDetalleVenta = async (ventaId) => {
    try {
      const respuesta = await api.get(`/ventas/${ventaId}`);
      setDetalleVenta(respuesta.data);
      setVentaSeleccionada(ventaId);
      setMostrarModal(true);
    } catch (err) {
      alert('Error al cargar detalle de la venta');
      console.error(err);
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setVentaSeleccionada(null);
    setDetalleVenta(null);
  };

  const imprimirFactura = () => {
    window.print();
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">
            <i className="bi bi-clock-history me-2"></i>
            Historial de Ventas
          </h4>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No hay ventas registradas
                    </td>
                  </tr>
                ) : (
                  ventas.map((venta) => (
                    <tr key={venta.id}>
                      <td>#{venta.id}</td>
                      <td>{formatearFecha(venta.fecha_venta)}</td>
                      <td>{venta.cliente || 'Cliente General'}</td>
                      <td className="fw-bold text-success">
                        {formatearPrecio(venta.total)}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => verDetalleVenta(venta.id)}
                          title="Ver detalles"
                        >
                          <IconoOjo /> Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      {mostrarModal && detalleVenta && (
        <>
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Detalle de Venta #{detalleVenta.venta.id}</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={cerrarModal}
                  ></button>
                </div>

                <div className="modal-body" id="factura-contenido">
                  {/* Información de la Venta */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="text-muted">Información de Venta</h6>
                      <p className="mb-1">
                        <strong>Fecha:</strong> {formatearFecha(detalleVenta.venta.fecha_venta)}
                      </p>
                      <p className="mb-1">
                        <strong>Factura N°:</strong> {detalleVenta.venta.id}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">Datos del Cliente</h6>
                      <p className="mb-1">
                        <strong>Nombre:</strong> {detalleVenta.venta.cliente || 'Cliente General'}
                      </p>
                      {detalleVenta.venta.documento && (
                        <p className="mb-1">
                          <strong>Documento:</strong> {detalleVenta.venta.documento}
                        </p>
                      )}
                      {detalleVenta.venta.telefono && (
                        <p className="mb-1">
                          <strong>Teléfono:</strong> {detalleVenta.venta.telefono}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tabla de Items */}
                  <h6 className="text-muted mb-3">Productos Vendidos</h6>
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th>Autor</th>
                        <th className="text-center">Cant.</th>
                        <th className="text-end">Precio Unit.</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalleVenta.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.titulo}</td>
                          <td>{item.autor || 'N/A'}</td>
                          <td className="text-center">{item.cantidad}</td>
                          <td className="text-end">{formatearPrecio(item.precio_unitario)}</td>
                          <td className="text-end fw-bold">
                            {formatearPrecio(item.cantidad * item.precio_unitario)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-success">
                        <td colSpan="4" className="text-end fw-bold">TOTAL:</td>
                        <td className="text-end fw-bold fs-5">
                          {formatearPrecio(detalleVenta.venta.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="text-center mt-4 text-muted">
                    <small>¡Gracias por su compra! - SGI Librería</small>
                  </div>
                </div>

                <div className="modal-footer no-print">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={imprimirFactura}
                  >
                    <IconoImpresora /> Imprimir Factura
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cerrarModal}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CSS para impresión */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #factura-contenido,
              #factura-contenido * {
                visibility: visible;
              }
              .no-print {
                display: none !important;
              }
              .modal {
                position: absolute;
                left: 0;
                top: 0;
                margin: 0;
                padding: 15px;
                width: 100%;
                background: white;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default HistorialVentas;
