import React, { useEffect, useState } from 'react';
import api from '../servicios/api';
import { useAuth } from '../contexto/AuthContext';

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Categorías</h2>
        {tienePermiso('crearCategoria') && (
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalCategoria" onClick={abrirModalNuevo}>
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
                  <td>
                    {tienePermiso('editarCategoria') && (
                      <button
                        className="btn btn-sm btn-outline-info me-2"
                        data-bs-toggle="modal"
                        data-bs-target="#modalCategoria"
                        onClick={() => abrirModalEditar(categoria)}
                      >
                        Editar
                      </button>
                    )}
                    {tienePermiso('eliminarCategoria') && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEliminar(categoria.id, categoria.nombre)}
                      >
                        Eliminar
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
            <div className="modal-header bg-dark text-white">
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
