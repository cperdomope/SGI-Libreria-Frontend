import React, { useEffect, useState } from 'react';
import api from '../servicios/api';

const PaginaAutores = () => {
  const [autores, setAutores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [datosAutor, setDatosAutor] = useState({ id: null, nombre: '' });

  const cargarAutores = async () => {
    try {
      const res = await api.get('/autores');
      setAutores(res.data);
    } catch (error) {
      console.error('Error al cargar autores:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarAutores(); }, []);

  const abrirModalNuevo = () => {
    setDatosAutor({ id: null, nombre: '' });
  };

  const abrirModalEditar = (autor) => {
    setDatosAutor({ id: autor.id, nombre: autor.nombre });
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (datosAutor.id) {
        await api.put(`/autores/${datosAutor.id}`, { nombre: datosAutor.nombre });
        alert('Autor actualizado correctamente');
      } else {
        await api.post('/autores', { nombre: datosAutor.nombre });
        alert('Autor creado exitosamente');
      }
      cargarAutores();
      document.getElementById('cerrarModalBtn').click();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Eliminar el autor "${nombre}"?`)) {
      try {
        await api.delete(`/autores/${id}`);
        alert('Autor eliminado exitosamente');
        cargarAutores();
      } catch (error) {
        alert(error.response?.data?.error || 'Error al eliminar');
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Autores</h2>
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalAutor" onClick={abrirModalNuevo}>
          + Nuevo Autor
        </button>
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
              {autores.map((autor) => (
                <tr key={autor.id}>
                  <td>{autor.id}</td>
                  <td className="fw-bold">{autor.nombre}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-info me-2"
                      data-bs-toggle="modal"
                      data-bs-target="#modalAutor"
                      onClick={() => abrirModalEditar(autor)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleEliminar(autor.id, autor.nombre)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <div className="modal fade" id="modalAutor" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title">{datosAutor.id ? 'Editar Autor' : 'Nuevo Autor'}</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" id="cerrarModalBtn"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleGuardar}>
                <div className="mb-3">
                  <label>Nombre del Autor:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={datosAutor.nombre}
                    onChange={(e) => setDatosAutor({ ...datosAutor, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    {datosAutor.id ? 'Guardar Cambios' : 'Crear Autor'}
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

export default PaginaAutores;
