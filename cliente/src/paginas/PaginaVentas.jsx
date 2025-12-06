import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

/* EVIDENCIA SENA: GA7-220501096-AA4-EV03
  AUTOR: Carlos Alberto Reyes
  MÓDULO: Punto de Venta (POS) - Frontend
  DESCRIPCIÓN: Interfaz para buscar libros, gestionar carrito de compras y registrar ventas.
*/

// --- ICONOS VISUALES (SVG) PARA LA INTERFAZ ---
// Se usan iconos directos para no depender de librerías externas pesadas.
const IconoBuscar = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconoUsuario = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconoBasura = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;

// --- FUNCIÓN DE UTILIDAD ---
// Convierte textos a números para evitar errores de cálculo (NaN)
const parsearNumero = (valor) => {
  const num = Number(valor);
  return isNaN(num) || num === null || num === undefined ? 0 : num;
};

const PaginaVentas = () => {
  // --- VARIABLES DE ESTADO (Memoria del componente) ---
  const [libros, setLibros] = useState([]); // Lista completa del inventario
  const [clientes, setClientes] = useState([]); // Lista de clientes registrados
  const [busqueda, setBusqueda] = useState(''); // Texto que escribe el usuario para buscar
  const [carrito, setCarrito] = useState([]); // Productos seleccionados para la venta
  const [clienteId, setClienteId] = useState(''); // Cliente seleccionado para la factura
  const [loading, setLoading] = useState(true); // Indicador de carga
  const [procesando, setProcesando] = useState(false); // Para bloquear el botón mientras guarda

  // --- CARGA INICIAL DE DATOS ---
  // Se ejecuta automáticamente al abrir la página
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        // Peticiones simultáneas al servidor para traer libros y clientes
        const [resLibros, resClientes] = await Promise.all([
          axios.get('http://localhost:3000/api/libros'),
          axios.get('http://localhost:3000/api/clientes')
        ]);
        setLibros(resLibros.data);
        setClientes(resClientes.data);
      } catch (error) {
        alert('Error conectando con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // --- LÓGICA DEL CARRITO DE COMPRAS ---
  
  // Función para añadir un libro al carrito
  const agregarAlCarrito = (libro) => {
    const precio = parsearNumero(libro.precio);
    const stock = parsearNumero(libro.stock);

    setCarrito(prevCarrito => {
      // Verificamos si el libro ya estaba en el carrito
      const itemExistente = prevCarrito.find(item => item.id === libro.id);
      
      // Validación: No permitir vender más de lo que hay en inventario
      if (itemExistente && itemExistente.cantidad >= stock) {
        alert(`Stock insuficiente. Solo hay ${stock} unidades.`);
        return prevCarrito;
      }

      if (itemExistente) {
        // Si ya existe, sumamos 1 a la cantidad
        return prevCarrito.map(item => 
          item.id === libro.id 
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * precio }
          : item
        );
      } else {
        // Si es nuevo, lo agregamos a la lista
        return [...prevCarrito, { ...libro, precio, stock, cantidad: 1, subtotal: precio }];
      }
    });
  };

  // Función para quitar un libro de la lista
  const eliminarDelCarrito = (id) => {
    setCarrito(prevCarrito => prevCarrito.filter(item => item.id !== id));
  };

  // --- CÁLCULOS AUTOMÁTICOS ---
  // Calcula el total a pagar sumando los subtotales del carrito
  // 'useMemo' optimiza para que no recalcule si el carrito no cambia
  const totalVenta = useMemo(() => {
    return carrito.reduce((acc, item) => acc + parsearNumero(item.subtotal), 0);
  }, [carrito]);

  // --- PROCESO FINAL DE VENTA ---
  const confirmarVenta = async () => {
    if (!clienteId) {
      alert('Por favor selecciona un cliente.');
      return;
    }

    if (!window.confirm(`¿Confirmar venta por $${totalVenta.toLocaleString()}?`)) return;

    setProcesando(true);
    try {
      // Preparamos el paquete de datos para enviar al Backend
      const datosVenta = {
        cliente_id: clienteId,
        total: totalVenta,
        items: carrito.map(i => ({ 
            libro_id: i.id, 
            cantidad: i.cantidad, 
            precio_unitario: i.precio 
        }))
      };

      // Enviamos los datos para guardar en Base de Datos
      const respuesta = await axios.post('http://localhost:3000/api/ventas', datosVenta);
      
      alert(`Venta registrada exitosamente. ID: ${respuesta.data.ventaId}`);
      
      // Limpiamos la pantalla para la siguiente venta
      setCarrito([]);
      setClienteId('');
      
      // Recargamos los libros para ver el stock actualizado
      const resLibros = await axios.get('http://localhost:3000/api/libros');
      setLibros(resLibros.data);

    } catch (error) {
      alert('Hubo un error al guardar la venta.');
      console.error(error);
    } finally {
      setProcesando(false);
    }
  };

  // --- RENDERIZADO (Lo que ve el usuario) ---
  return (
    <div className="container-fluid h-100 bg-light p-4">
      <div className="row">
        
        {/* COLUMNA IZQUIERDA: Catálogo de Libros */}
        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Catálogo de Libros</h3>
            {/* Buscador */}
            <div className="input-group w-50">
              <span className="input-group-text"><IconoBuscar /></span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Buscar por título..." 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="row">
            {libros
              .filter(l => l.titulo.toLowerCase().includes(busqueda.toLowerCase()))
              .map(libro => (
                <div key={libro.id} className="col-md-4 mb-3">
                  <div className="card shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="card-title text-truncate">{libro.titulo}</h5>
                      <p className="card-text text-muted small">{libro.autor}</p>
                      <h6 className="text-primary fw-bold">
                        ${parsearNumero(libro.precio).toLocaleString()}
                      </h6>
                      <small>Disponibles: {parsearNumero(libro.stock)}</small>
                      <button 
                        className="btn btn-primary w-100 mt-2 btn-sm"
                        onClick={() => agregarAlCarrito(libro)}
                        disabled={parsearNumero(libro.stock) <= 0}
                      >
                        {parsearNumero(libro.stock) > 0 ? '+ Agregar' : 'Agotado'}
                      </button>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: Resumen de Factura */}
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0"><IconoUsuario /> Facturación</h5>
            </div>
            <div className="card-body">
              {/* Selector de Cliente */}
              <label className="form-label">Cliente:</label>
              <select 
                className="form-select mb-3"
                value={clienteId}
                onChange={e => setClienteId(e.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre_completo}</option>
                ))}
              </select>

              <hr />
              
              {/* Lista de productos agregados */}
              <h6>Productos en Carrito:</h6>
              <ul className="list-group list-group-flush mb-3" style={{maxHeight: '300px', overflowY: 'auto'}}>
                {carrito.length === 0 && <li className="list-group-item text-muted">Carrito vacío</li>}
                {carrito.map((item) => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{item.titulo}</strong><br/>
                      <small>{item.cantidad} x ${item.precio.toLocaleString()}</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span>${item.subtotal.toLocaleString()}</span>
                      <button className="btn btn-sm btn-danger py-0" onClick={() => eliminarDelCarrito(item.id)}><IconoBasura /></button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Total y Botón Pagar */}
              <div className="alert alert-success text-center">
                <h3>Total: ${totalVenta.toLocaleString()}</h3>
              </div>
              <button 
                className="btn btn-success w-100 btn-lg"
                onClick={confirmarVenta}
                disabled={carrito.length === 0 || procesando}
              >
                {procesando ? 'Procesando...' : 'CONFIRMAR VENTA'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaginaVentas;