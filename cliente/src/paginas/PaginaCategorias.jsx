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

const PaginaCategorias = () => {
  // Hook de autenticación y permisos
  const { tienePermiso } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [datosCategoria, setDatosCategoria] = useState({ id: null, nombre: '' });

  const cargarCategorias = async () => {
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarCategorias(); }, []);

  const abrirModalNuevo = () => {
    setDatosCategoria({ id: null, nombre: '' });
  };

  const abrirModalEditar = (categoria) => {
    setDatosCategoria({ id: categoria.id, nombre: categoria.nombre });
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (datosCategoria.id) {
        await api.put(`/categorias/${datosCategoria.id}`, { nombre: datosCategoria.nombre });
        alert('Categoría actualizada correctamente');
      } else {
        await api.post('/categorias', { nombre: datosCategoria.nombre });
        alert('Categoría creada exitosamente');
      }
      cargarCategorias();
      document.getElementById('cerrarModalBtn').click();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Eliminar la categoría "${nombre}"?`)) {
      try {
        await api.delete(`/categorias/${id}`);
        alert('Categoría eliminada exitosamente');
        cargarCategorias();
      } catch (error) {
        alert(error.response?.data?.error || 'Error al eliminar');
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="module-header mb-4 shadow-sm" style={{ borderRadius: '8px' }}>
        <h2 className="text-white">Gestión de Categorías</h2>
        {tienePermiso('crearCategoria') && (
          <button className="btn btn-light btn-sm" data-bs-toggle="modal" data-bs-target="#modalCategoria" onClick={abrirModalNuevo}>
            + Nueva Categoría
          </button>
        )}
      </div>

      {cargando ? (
        <div className="text-center"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover table-striped border align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.id}>
                  <td>{categoria.id}</td>
                  <td className="fw-bold">{categoria.nombre}</td>
                  <td className="text-center action-buttons">
                    {tienePermiso('editarCategoria') && (
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        data-bs-toggle="modal"
                        data-bs-target="#modalCategoria"
                        onClick={() => abrirModalEditar(categoria)}
                        title="Editar"
                      >
                        <IconoEditar />
                      </button>
                    )}
                    {tienePermiso('eliminarCategoria') && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEliminar(categoria.id, categoria.nombre)}
                        title="Eliminar"
                      >
                        <IconoEliminar />
                      </button>
                    )}
                    {!tienePermiso('editarCategoria') && !tienePermiso('eliminarCategoria') && (
                      <span className="text-muted small">Solo consulta</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <div className="modal fade" id="modalCategoria" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">{datosCategoria.id ? 'Editar Categoría' : 'Nueva Categoría'}</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" id="cerrarModalBtn"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleGuardar}>
                <div className="mb-3">
                  <label>Nombre de la Categoría:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={datosCategoria.nombre}
                    onChange={(e) => setDatosCategoria({ ...datosCategoria, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    {datosCategoria.id ? 'Guardar Cambios' : 'Crear Categoría'}
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

export default PaginaCategorias;
