import React, { useState, useEffect } from 'react';
import api from '../servicios/api';

const Movimientos = () => {
  const [libros, setLibros] = useState([]);
  const [formData, setFormData] = useState({
    libro_id: '',
    tipo_movimiento: 'SALIDA',
    cantidad: 1,
    usuario_id: 1
  });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Función para cargar libros (la sacamos del useEffect para poder re-usarla)
  const cargarLibros = async () => {
    try {
      const res = await api.get('/libros');
      if (Array.isArray(res.data)) {
        setLibros(res.data);
      }
    } catch (error) {
      console.error("Error cargando libros", error);
    }
  };

  // Cargar libros al iniciar la página
  useEffect(() => {
    cargarLibros();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    if (!formData.libro_id) {
      setMensaje({ texto: 'Por favor selecciona un libro', tipo: 'danger' });
      return;
    }

    try {
      const res = await api.post('/movimientos', formData);
      
      // 1. Mostrar mensaje de éxito (Con respaldo por si el backend no envía 'mensaje')
      const textoExito = res.data.mensaje || '¡Movimiento registrado correctamente!';
      setMensaje({ texto: textoExito, tipo: 'success' });
      
      // 2. Limpiar cantidad
      setFormData({ ...formData, cantidad: 1 });

      // 3. Recargar la lista de libros para ver el stock actualizado en el select
      await cargarLibros();

      // 4. Subir el scroll para asegurar que el usuario vea la alerta
      window.scrollTo(0, 0);

    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al procesar la solicitud';
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