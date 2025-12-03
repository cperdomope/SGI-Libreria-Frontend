import React, { useState, useEffect, useMemo } from 'react';

// --- ICONOS SVG INLINE (Estilo Material Design/Bootstrap) ---
const IconoBuscar = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconoCodigoBarras = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>;
const IconoUsuario = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconoBasura = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconoMas = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconoMenos = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconoCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const IconoAlerta = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

const PaginaVentas = () => {
  // --- ESTADOS GLOBALES ---
  const [libros, setLibros] = useState([]); 
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE LA TRANSACCIÓN ---
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [procesando, setProcesando] = useState(false);
  
  // --- ESTADOS DE UI ---
  const [notificacion, setNotificacion] = useState(null); // { tipo: 'exito' | 'error', msj: '' }

  // 1. Cargar Datos Iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resLibros, resClientes] = await Promise.all([
        fetch('http://localhost:3000/api/libros'),
        fetch('http://localhost:3000/api/clientes')
      ]);
      setLibros(await resLibros.json());
      setClientes(await resClientes.json());
    } catch (error) {
      mostrarNotificacion('error', 'Error conectando con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Lógica del Carrito
  const agregarAlCarrito = (libro) => {
    // Buscar si ya existe en el carrito
    const itemExistente = carrito.find(item => item.id === libro.id);
    const cantidadActual = itemExistente ? itemExistente.cantidad : 0;

    // VALIDACIÓN DE NEGOCIO: Stock Físico
    if (cantidadActual >= libro.stock) {
      mostrarNotificacion('error', `Stock insuficiente. Solo hay ${libro.stock} unidades.`);
      return;
    }

    if (itemExistente) {
      // Incrementar cantidad
      const nuevoCarrito = carrito.map(item => 
        item.id === libro.id 
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio }
          : item
      );
      setCarrito(nuevoCarrito);
    } else {
      // Agregar nuevo item
      setCarrito([...carrito, { ...libro, cantidad: 1, subtotal: Number(libro.precio) }]);
    }
  };

  const modificarCantidad = (id, delta) => {
    const item = carrito.find(i => i.id === id);
    const libroOriginal = libros.find(l => l.id === id);

    if (!item || !libroOriginal) return;

    const nuevaCantidad = item.cantidad + delta;

    // Reglas: No bajar de 1, No subir más que el stock
    if (nuevaCantidad < 1) return;
    if (nuevaCantidad > libroOriginal.stock) {
      mostrarNotificacion('error', `Tope de stock alcanzado (${libroOriginal.stock}).`);
      return;
    }

    setCarrito(carrito.map(i => 
      i.id === id 
        ? { ...i, cantidad: nuevaCantidad, subtotal: nuevaCantidad * i.precio }
        : i
    ));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const limpiarVenta = () => {
    if (window.confirm('¿Cancelar la venta actual y limpiar el carrito?')) {
      setCarrito([]);
      setClienteId('');
      setBusqueda('');
    }
  };

  // 3. Cálculo de Totales
  const totalVenta = useMemo(() => carrito.reduce((acc, item) => acc + item.subtotal, 0), [carrito]);
  const totalItems = useMemo(() => carrito.reduce((acc, item) => acc + item.cantidad, 0), [carrito]);

  // 4. Procesar Venta
  const confirmarVenta = async () => {
    if (carrito.length === 0) return;
    if (!clienteId) {
      mostrarNotificacion('error', 'Debes seleccionar un cliente para facturar.');
      return;
    }

    if (!window.confirm(`¿Cobrar $${totalVenta.toLocaleString()} a este cliente?`)) return;

    setProcesando(true);
    try {
      const payload = {
        cliente_id: clienteId,
        total: totalVenta,
        items: carrito.map(i => ({ libro_id: i.id, cantidad: i.cantidad, precio_unitario: i.precio }))
      };

      const res = await fetch('http://localhost:3000/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje);

      mostrarNotificacion('exito', `Venta #${data.ventaId} registrada correctamente.`);
      
      // Actualización Optimista del Stock Local (para no recargar toda la API)
      const librosActualizados = libros.map(l => {
        const vendido = carrito.find(c => c.id === l.id);
        return vendido ? { ...l, stock: l.stock - vendido.cantidad } : l;
      });
      setLibros(librosActualizados);
      
      // Reset
      setCarrito([]);
      setClienteId('');
    } catch (error) {
      mostrarNotificacion('error', error.message || 'Error procesando la venta');
    } finally {
      setProcesando(false);
    }
  };

  // Helper de notificaciones
  const mostrarNotificacion = (tipo, msj) => {
    setNotificacion({ tipo, msj });
    setTimeout(() => setNotificacion(null), 4000);
  };

  // Filtrado de libros (Buscador)
  const librosFiltrados = libros.filter(l => {
    const texto = busqueda.toLowerCase();
    // Búsqueda robusta: Título, Autor, ISBN (si existiera en tu BD, asumimos campo isbn o codigo) o ID
    return l.titulo.toLowerCase().includes(texto) || 
           l.autor.toLowerCase().includes(texto) ||
           l.id.toString().includes(texto);
  });

  return (
    <div className="container-fluid h-100 bg-light" style={{ minHeight: 'calc(100vh - 60px)' }}>
      {/* Toast de Notificación */}
      {notificacion && (
        <div className={`position-fixed top-0 start-50 translate-middle-x mt-4 p-3 rounded shadow text-white fw-bold d-flex align-items-center gap-2 z-3 ${notificacion.tipo === 'exito' ? 'bg-success' : 'bg-danger'}`} style={{ minWidth: '300px' }}>
          {notificacion.tipo === 'exito' ? <IconoCheck /> : <IconoAlerta />}
          {notificacion.msj}
        </div>
      )}

      <div className="row h-100 g-0">
        
        {/* ================= ZONA IZQUIERDA: CATÁLOGO ================= */}
        <div className="col-lg-8 d-flex flex-column border-end" style={{ height: 'calc(100vh - 60px)' }}>
          {/* Header del Catálogo */}
          <div className="bg-white p-3 border-bottom shadow-sm z-1">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0 fw-bold text-secondary"><IconoCodigoBarras /> Catálogo de Libros</h5>
              <span className="badge bg-light text-dark border">{libros.length} Títulos</span>
            </div>
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-white border-end-0 text-muted"><IconoBuscar /></span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0" 
                placeholder="Escribe título, autor o código..." 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="flex-grow-1 overflow-auto p-3 bg-light">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center h-50">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : (
              <div className="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3">
                {librosFiltrados.map(libro => {
                  const enCarrito = carrito.find(i => i.id === libro.id);
                  const stockRestante = libro.stock - (enCarrito ? enCarrito.cantidad : 0);
                  const sinStock = stockRestante <= 0;

                  return (
                    <div className="col" key={libro.id}>
                      <div 
                        className={`card h-100 border-0 shadow-sm transition-all user-select-none ${sinStock ? 'opacity-50 grayscale' : 'cursor-pointer hover-scale'}`}
                        style={{ 
                          border: enCarrito ? '2px solid #0d6efd' : '1px solid transparent',
                          transform: enCarrito ? 'scale(0.98)' : 'scale(1)',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => !sinStock && agregarAlCarrito(libro)}
                      >
                        {/* Indicador de Cantidad en Carrito (Badge) */}
                        {enCarrito && (
                          <div className="position-absolute top-0 end-0 m-2 badge bg-primary rounded-circle shadow" style={{ width: 25, height: 25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {enCarrito.cantidad}
                          </div>
                        )}

                        {/* Placeholder de Portada (Color generado por ID para variedad visual) */}
                        <div className="card-img-top d-flex align-items-center justify-content-center text-white fw-bold fs-3" 
                             style={{ height: '120px', backgroundColor: `hsl(${libro.id * 50}, 60%, 80%)` }}>
                          <span style={{ opacity: 0.5 }}>📖</span>
                        </div>
                        
                        <div className="card-body p-2 d-flex flex-column">
                          <h6 className="card-title fw-bold text-truncate mb-1 text-dark" style={{ fontSize: '0.9rem' }} title={libro.titulo}>
                            {libro.titulo}
                          </h6>
                          <small className="text-muted text-truncate mb-2">{libro.autor}</small>
                          
                          <div className="mt-auto d-flex justify-content-between align-items-end border-top pt-2">
                            <div>
                              <div className="fw-bold text-primary">${Number(libro.precio).toLocaleString()}</div>
                              <small className="text-muted" style={{ fontSize: '0.7rem' }}>Stock: {libro.stock}</small>
                            </div>
                            <button className={`btn btn-sm ${sinStock ? 'btn-secondary' : 'btn-outline-primary'} rounded-circle p-0`} style={{ width: 28, height: 28 }} disabled={sinStock}>
                              <IconoMas />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {librosFiltrados.length === 0 && !loading && (
              <div className="text-center text-muted mt-5">
                <p className="fs-5">No se encontraron libros.</p>
                <small>Intenta con otro término de búsqueda.</small>
              </div>
            )}
          </div>
        </div>

        {/* ================= ZONA DERECHA: TICKET / FACTURACIÓN ================= */}
        <div className="col-lg-4 d-flex flex-column bg-white shadow-lg z-2" style={{ height: 'calc(100vh - 60px)' }}>
          
          {/* 1. Selector de Cliente */}
          <div className="p-3 bg-primary text-white">
            <h5 className="mb-3 fw-bold d-flex align-items-center gap-2"><IconoUsuario /> Datos de Factura</h5>
            <select 
              className="form-select form-select-sm border-0 shadow-none text-dark fw-bold" 
              value={clienteId}
              onChange={e => setClienteId(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">-- SELECCIONAR CLIENTE --</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.documento} - {c.nombre_completo}</option>
              ))}
            </select>
            {!clienteId && <small className="text-white-50 mt-1 d-block"><IconoAlerta /> Obligatorio para venta</small>}
          </div>

          {/* 2. Lista de Items (Scrollable) */}
          <div className="flex-grow-1 overflow-auto p-0">
            {carrito.length === 0 ? (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-cart mb-3" viewBox="0 0 16 16"><path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
                <h5>Carrito Vacío</h5>
                <p className="small">Agrega productos del catálogo</p>
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {carrito.map(item => (
                  <li key={item.id} className="list-group-item p-3 border-bottom-0 border-top">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="fw-bold text-dark lh-sm" style={{ maxWidth: '80%' }}>{item.titulo}</div>
                      <div className="fw-bold text-primary">${(item.precio * item.cantidad).toLocaleString()}</div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>
                        Unitario: ${Number(item.precio).toLocaleString()}
                      </small>
                      
                      {/* Controles de Cantidad */}
                      <div className="btn-group btn-group-sm border rounded bg-light" role="group">
                        <button 
                          className="btn btn-link text-dark text-decoration-none px-2 py-0 hover-bg-gray"
                          onClick={() => modificarCantidad(item.id, -1)}
                        >
                          <IconoMenos />
                        </button>
                        <span className="px-2 py-1 bg-white border-start border-end fw-bold d-flex align-items-center" style={{ minWidth: '30px', justifyContent: 'center' }}>
                          {item.cantidad}
                        </span>
                        <button 
                          className="btn btn-link text-dark text-decoration-none px-2 py-0 hover-bg-gray"
                          onClick={() => modificarCantidad(item.id, 1)}
                        >
                          <IconoMas />
                        </button>
                      </div>

                      <button 
                        className="btn btn-sm text-danger opacity-50 hover-opacity-100 p-0 ms-2"
                        onClick={() => eliminarDelCarrito(item.id)}
                        title="Quitar item"
                      >
                        <IconoBasura />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 3. Footer de Totales y Acción */}
          <div className="p-4 bg-light border-top">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-secondary">Cantidad de libros:</span>
              <span className="fw-bold">{totalItems}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="fs-5 text-dark fw-bold">TOTAL A PAGAR:</span>
              <span className="fs-4 text-primary fw-bolder">${totalVenta.toLocaleString()}</span>
            </div>

            <div className="d-grid gap-2">
              <button 
                className={`btn btn-lg fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2 ${carrito.length > 0 && clienteId ? 'btn-success' : 'btn-secondary disabled'}`}
                onClick={confirmarVenta}
                disabled={procesando || carrito.length === 0 || !clienteId}
              >
                {procesando ? (
                  <> <span className="spinner-border spinner-border-sm"></span> Procesando... </>
                ) : (
                  <> <IconoCheck /> CONFIRMAR VENTA </>
                )}
              </button>
              
              {carrito.length > 0 && (
                <button 
                  className="btn btn-outline-danger btn-sm border-0"
                  onClick={limpiarVenta}
                  disabled={procesando}
                >
                  Cancelar Venta (Limpiar)
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Estilos CSS Inline para efectos hover simples */}
      <style>{`
        .hover-scale:hover { transform: scale(1.02); z-index: 10; cursor: pointer; border-color: #0d6efd !important; }
        .hover-bg-gray:hover { background-color: #e9ecef; }
        .hover-opacity-100:hover { opacity: 1 !important; }
        .grayscale { filter: grayscale(100%); }
      `}</style>
    </div>
  );
};

export default PaginaVentas;