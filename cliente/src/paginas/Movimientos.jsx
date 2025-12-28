/**
 * =====================================================
 * PÁGINA DE REGISTRO DE MOVIMIENTOS
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Módulo para registrar movimientos de inventario.
 * Permite registrar entradas (compras) y salidas (ventas)
 * de libros, actualizando automáticamente el stock.
 *
 * @requires react - Hooks useState, useEffect
 * @requires ../servicios/api - Cliente Axios configurado
 *
 * CARACTERÍSTICAS:
 * - Selector de libros con stock actual visible
 * - Toggle visual para tipo de movimiento (entrada/salida)
 * - Actualización automática del stock tras registro
 * - Alertas de éxito/error con auto-scroll
 *
 * @author Equipo de Desarrollo SGI
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import api from '../servicios/api';

/**
 * Componente para registrar movimientos de inventario.
 * Actualiza el stock de libros según entradas o salidas.
 *
 * @component
 * @returns {JSX.Element} Formulario de registro de movimientos
 */
const Movimientos = () => {
  const [libros, setLibros] = useState([]);
  const [formData, setFormData] = useState({
    libro_id: '',
    tipo_movimiento: 'SALIDA',
    cantidad: 1,
    usuario_id: 1
  });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  /**
   * Obtiene el listado de libros con stock desde el backend.
   * Se re-usa después de cada movimiento para mostrar stock actualizado.
   *
   * @async
   * @returns {Promise<void>}
   */
  const cargarLibros = async () => {
    try {
      const res = await api.get('/libros');
      // Extraer datos considerando estructura { exito, datos }
      const librosData = res.data.datos || res.data;
      if (Array.isArray(librosData)) {
        setLibros(librosData);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Movimientos] Error cargando libros:', error);
      }
    }
  };

  // Cargar libros al montar el componente
  useEffect(() => {
    cargarLibros();
  }, []);

  /**
   * Actualiza el estado del formulario cuando cambia un input.
   *
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement>} e - Evento del input
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Registra el movimiento de inventario en el backend.
   * Actualiza el stock del libro y muestra mensaje de éxito/error.
   *
   * @async
   * @param {React.FormEvent} e - Evento del formulario
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    if (!formData.libro_id) {
      setMensaje({ texto: 'Por favor selecciona un libro', tipo: 'danger' });
      return;
    }

    try {
      // Convertir valores numéricos de string a number antes de enviar
      const dataToSend = {
        ...formData,
        libro_id: parseInt(formData.libro_id, 10),
        cantidad: parseInt(formData.cantidad, 10)
      };

      const res = await api.post('/movimientos', dataToSend);

      // Mostrar mensaje de éxito del backend o genérico
      const textoExito = res.data.mensaje || '¡Movimiento registrado correctamente!';
      setMensaje({ texto: textoExito, tipo: 'success' });

      // Resetear cantidad para próximo registro
      setFormData({ ...formData, cantidad: 1 });

      // Actualizar lista de libros para reflejar nuevo stock
      await cargarLibros();

      // Scroll al inicio para que el usuario vea el mensaje
      window.scrollTo(0, 0);

    } catch (error) {
      // Mostrar mensaje de error del backend o genérico
      const errorMsg = error.response?.data?.mensaje || error.response?.data?.error || 'Error al procesar la solicitud';
      setMensaje({ texto: errorMsg, tipo: 'danger' });
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-dark text-white">
              <h3 className="mb-0">Registrar Movimiento</h3>
            </div>
            <div className="card-body">
              
              {/* ALERTA VISIBLE */}
              {mensaje.texto && (
                <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
                  <strong>{mensaje.tipo === 'success' ? '¡Éxito! ' : 'Error: '}</strong>
                  {mensaje.texto}
                  <button type="button" className="btn-close" onClick={() => setMensaje({ text: '', tipo: '' })}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Seleccionar Libro:</label>
                  <select 
                    className="form-select" 
                    name="libro_id" 
                    onChange={handleChange} 
                    required
                    value={formData.libro_id} // Controlamos el valor con el estado
                  >
                    <option value="" disabled>-- Elige un libro --</option>
                    {libros.map(libro => (
                      <option key={libro.id} value={libro.id}>
                        {libro.titulo} (Stock Actual: {libro.stock_actual})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label d-block">Tipo de Acción:</label>
                  <div className="btn-group w-100" role="group">
                    <input 
                      type="radio" 
                      className="btn-check" 
                      name="tipo_movimiento" 
                      id="vta" 
                      value="SALIDA" 
                      checked={formData.tipo_movimiento === 'SALIDA'}
                      onChange={handleChange}
                    />
                    <label className="btn btn-outline-danger" htmlFor="vta">📉 Registrar Venta (Salida)</label>

                    <input 
                      type="radio" 
                      className="btn-check" 
                      name="tipo_movimiento" 
                      id="comp" 
                      value="ENTRADA" 
                      checked={formData.tipo_movimiento === 'ENTRADA'}
                      onChange={handleChange}
                    />
                    <label className="btn btn-outline-success" htmlFor="comp">📈 Registrar Compra (Entrada)</label>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Cantidad:</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="cantidad" 
                    min="1"
                    value={formData.cantidad}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Confirmar Movimiento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Movimientos;