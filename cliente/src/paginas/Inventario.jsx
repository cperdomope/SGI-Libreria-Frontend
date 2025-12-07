import React, { useEffect, useState } from 'react';
import api from '../servicios/api';

const Inventario = () => {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estado del formulario (Sirve para crear Y para editar)
  const [datosLibro, setDatosLibro] = useState({
    id: null, // Si tiene ID, es edición. Si es null, es nuevo.
    isbn: '', titulo: '', autor_id: '1', categoria_id: '1', precio_venta: '', stock_minimo: 5
  });

  // Cargar libros
  const cargarLibros = async () => {
    try {
      const res = await api.get('/libros');
      if (Array.isArray(res.data)) setLibros(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarLibros(); }, []);

  // Abrir Modal para CREAR
  const abrirModalNuevo = () => {
    setDatosLibro({ id: null, isbn: '', titulo: '', autor_id: '1', categoria_id: '1', precio_venta: '', stock_minimo: 5 });
  };

  // Abrir Modal para EDITAR (Carga los datos del libro en el formulario)
  const abrirModalEditar = (libro) => {
    setDatosLibro({
        id: libro.id,
        isbn: libro.isbn,
        titulo: libro.titulo,
        autor_id: libro.autor_id || '1',
        categoria_id: libro.categoria_id || '1',
        precio_venta: libro.precio_venta || 0,
        stock_minimo: libro.stock_minimo || 5
    });
  };

  // Guardar (Detecta automáticamente si es Crear o Editar)
  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (datosLibro.id) {
        // MODO EDICIÓN (PUT)
        await api.put(`/libros/${datosLibro.id}`, datosLibro);
        alert("✅ Libro actualizado correctamente");
      } else {
        // MODO CREACIÓN (POST)
        await api.post('/libros', datosLibro);
        alert("✅ Libro creado con éxito");
      }
      
      cargarLibros(); // Recargar la tabla
      document.getElementById('cerrarModalBtn').click(); // Cerrar modal
      
    } catch (error) {
      alert(error.response?.data?.error || "Error al guardar");
    }
  };

  const handleChange = (e) => {
    setDatosLibro({ ...datosLibro, [e.target.name]: e.target.value });
  };

  const handleEliminar = async (id, titulo) => {
    if (window.confirm(`¿Borrar "${titulo}"?`)) {
      try {
        await api.delete(`/libros/${id}`);
        cargarLibros();
      } catch (error) {
        alert(error.response?.data?.error || "Error al eliminar");
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📦 Inventario Actual</h2>
        {/* Botón para Crear */}
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalLibro" onClick={abrirModalNuevo}>
          + Nuevo Libro
        </button>
      </div>

      {cargando ? <div className="text-center"><div className="spinner-border text-primary"></div></div> : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover table-striped border align-middle">
            <thead className="table-dark">
              <tr>
                <th>ISBN</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {libros.map((libro) => (
                <tr key={libro.id}>
                  <td>{libro.isbn}</td>
                  <td className="fw-bold">{libro.titulo}</td>
                  <td>{libro.autor || 'N/A'}</td>
                  <td><span className="badge bg-secondary">{libro.categoria || 'Gral'}</span></td>
                  <td>${new Intl.NumberFormat('es-CO').format(libro.precio_venta || 0)}</td>
                  <td><span className={`badge ${(libro.stock_actual || 0) <= libro.stock_minimo ? 'bg-danger' : 'bg-success'}`}>{libro.stock_actual || 0}</span></td>
                  <td>
                    {/* ¡AQUÍ ESTÁ EL BOTÓN QUE FALTABA! */}
                    <button 
                        className="btn btn-sm btn-outline-info me-2" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalLibro"
                        onClick={() => abrirModalEditar(libro)}
                    >
                        Editar
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(libro.id, libro.titulo)}>Borrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL (Sirve para Crear y Editar) */}
      <div className="modal fade" id="modalLibro" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title">{datosLibro.id ? 'Editar Libro' : 'Registrar Nuevo Libro'}</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" id="cerrarModalBtn"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleGuardar}>
                <div className="mb-3">
                  <label>ISBN (Código):</label>
                  <input type="text" className="form-control" name="isbn" required value={datosLibro.isbn} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label>Título:</label>
                  <input type="text" className="form-control" name="titulo" required value={datosLibro.titulo} onChange={handleChange} />
                </div>
                <div className="row">
                   <div className="col-6 mb-3">
                      <label>Precio Venta:</label>
                      <input type="number" className="form-control" name="precio_venta" required value={datosLibro.precio_venta} onChange={handleChange} />
                   </div>
                   <div className="col-6 mb-3">
                      <label>Stock Mínimo:</label>
                      <input type="number" className="form-control" name="stock_minimo" value={datosLibro.stock_minimo} onChange={handleChange} />
                   </div>
                </div>
                {/* Selectores simplificados */}
                <div className="mb-3">
                    <label>Autor:</label>
                    <select className="form-select" name="autor_id" value={datosLibro.autor_id} onChange={handleChange}>
                        <option value="1">Gabriel García Márquez (ID: 1)</option>
                        <option value="2">Robert C. Martin (ID: 2)</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label>Categoría:</label>
                    <select className="form-select" name="categoria_id" value={datosLibro.categoria_id} onChange={handleChange}>
                        <option value="1">Tecnología (ID: 1)</option>
                        <option value="2">Ficción (ID: 2)</option>
                    </select>
                </div>

                <div className="d-grid">
                    <button type="submit" className="btn btn-primary">{datosLibro.id ? 'Guardar Cambios' : 'Crear Libro'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Inventario;