import React, { useEffect, useState } from 'react';
import api from '../servicios/api';
import { useAuth } from '../contexto/AuthContext';

// --- ICONOS SVG INLINE ---
const IconoEditar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
  </svg>
);

const IconoEliminar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
  </svg>
);

const Inventario = () => {
  // Hook de autenticación y permisos
  const { tienePermiso } = useAuth();

  const [libros, setLibros] = useState([]);
  const [autores, setAutores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estado del formulario (Sirve para crear Y para editar)
  const [datosLibro, setDatosLibro] = useState({
    id: null, // Si tiene ID, es edición. Si es null, es nuevo.
    isbn: '', titulo: '', autor_id: '', categoria_id: '', precio_venta: '', stock_minimo: 5
  });

  // Cargar datos
  const cargarDatos = async () => {
    try {
      const [resLibros, resAutores, resCategorias] = await Promise.all([
        api.get('/libros'),
        api.get('/autores'),
        api.get('/categorias')
      ]);

      if (Array.isArray(resLibros.data)) setLibros(resLibros.data);
      if (Array.isArray(resAutores.data)) setAutores(resAutores.data);
      if (Array.isArray(resCategorias.data)) setCategorias(resCategorias.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // Abrir Modal para CREAR
  const abrirModalNuevo = () => {
    setDatosLibro({
      id: null,
      isbn: '',
      titulo: '',
      autor_id: autores[0]?.id || '',
      categoria_id: categorias[0]?.id || '',
      precio_venta: '',
      stock_minimo: 5
    });
  };

  // Abrir Modal para EDITAR (Carga los datos del libro en el formulario)
  const abrirModalEditar = (libro) => {
    setDatosLibro({
        id: libro.id,
        isbn: libro.isbn,
        titulo: libro.titulo,
        autor_id: libro.autor_id || '',
        categoria_id: libro.categoria_id || '',
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
      
      cargarDatos(); // Recargar la tabla
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
        cargarDatos();
      } catch (error) {
        alert(error.response?.data?.error || "Error al eliminar");
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="module-header mb-4 shadow-sm" style={{ borderRadius: '8px' }}>
        <h2 className="text-white">📦 Inventario Actual</h2>
        {/* Botón para Crear - Solo Administradores */}
        {tienePermiso('crearLibro') && (
          <button className="btn btn-light btn-sm" data-bs-toggle="modal" data-bs-target="#modalLibro" onClick={abrirModalNuevo}>
            + Nuevo Libro
          </button>
        )}
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
                  <td className="text-center action-buttons">
                    {tienePermiso('editarLibro') && (
                      <button
                          className="btn btn-sm btn-outline-primary me-1"
                          data-bs-toggle="modal"
                          data-bs-target="#modalLibro"
                          onClick={() => abrirModalEditar(libro)}
                          title="Editar"
                      >
                          <IconoEditar />
                      </button>
                    )}
                    {tienePermiso('eliminarLibro') && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(libro.id, libro.titulo)} title="Eliminar">
                        <IconoEliminar />
                      </button>
                    )}
                    {!tienePermiso('editarLibro') && !tienePermiso('eliminarLibro') && (
                      <span className="text-muted small">Solo consulta</span>
                    )}
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
            <div className="modal-header bg-primary text-white">
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
                <div className="mb-3">
                    <label>Autor:</label>
                    <select className="form-select" name="autor_id" value={datosLibro.autor_id} onChange={handleChange} required>
                        <option value="">Seleccione un autor</option>
                        {autores.map(autor => (
                            <option key={autor.id} value={autor.id}>{autor.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label>Categoría:</label>
                    <select className="form-select" name="categoria_id" value={datosLibro.categoria_id} onChange={handleChange} required>
                        <option value="">Seleccione una categoría</option>
                        {categorias.map(categoria => (
                            <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                        ))}
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