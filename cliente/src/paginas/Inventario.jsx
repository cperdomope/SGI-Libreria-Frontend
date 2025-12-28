/**
 * =====================================================
 * PÁGINA DE INVENTARIO - GESTIÓN DE LIBROS
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description CRUD completo para la gestión del catálogo
 * de libros. Incluye paginación y control de permisos RBAC.
 *
 * FUNCIONALIDADES:
 * - Listado paginado de libros
 * - Crear nuevo libro (solo Administradores)
 * - Editar libro existente (solo Administradores)
 * - Eliminar libro (solo Administradores)
 * - Indicador visual de stock bajo
 * - Modal reutilizable para crear/editar
 *
 * PERMISOS RBAC:
 * - verInventario: Ver listado (todos los roles)
 * - crearLibro: Crear nuevos libros
 * - editarLibro: Modificar libros existentes
 * - eliminarLibro: Borrar libros del catálogo
 *
 * @author Equipo de Desarrollo SGI
 * @version 2.0.0
 */

import React, { useEffect, useState } from 'react';
import api from '../servicios/api';
import { useAuth } from '../contexto/AuthContext';

// =====================================================
// ICONOS SVG (Bootstrap Icons - MIT License)
// =====================================================

/**
 * Icono de lápiz - Editar registro
 */
const IconoEditar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
  </svg>
);

/**
 * Icono de basura - Eliminar registro
 */
const IconoEliminar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
  </svg>
);

// =====================================================
// CONFIGURACIÓN DE PAGINACIÓN
// =====================================================

/**
 * Cantidad de registros por página.
 *
 * @constant {number}
 */
const ELEMENTOS_POR_PAGINA = 5;

/**
 * Valores por defecto para un libro nuevo.
 *
 * @constant {Object}
 */
const LIBRO_INICIAL = {
  id: null,
  isbn: '',
  titulo: '',
  autor_id: '',
  categoria_id: '',
  precio_venta: '',
  stock_minimo: 5
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

/**
 * Página de gestión de inventario de libros.
 * Implementa CRUD con paginación y control de permisos.
 *
 * @returns {JSX.Element} Interfaz completa del inventario
 */
const Inventario = () => {
  // ─────────────────────────────────────────────────
  // HOOKS Y AUTENTICACIÓN
  // ─────────────────────────────────────────────────

  const { tienePermiso } = useAuth();

  // ─────────────────────────────────────────────────
  // ESTADOS
  // ─────────────────────────────────────────────────

  // Datos del catálogo
  const [libros, setLibros] = useState([]);
  const [autores, setAutores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estado del formulario (crear/editar)
  // Si id es null, es creación. Si tiene valor, es edición.
  const [datosLibro, setDatosLibro] = useState(LIBRO_INICIAL);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);

  // ─────────────────────────────────────────────────
  // CÁLCULOS DE PAGINACIÓN
  // ─────────────────────────────────────────────────

  const indiceInicio = (paginaActual - 1) * ELEMENTOS_POR_PAGINA;
  const indiceFin = indiceInicio + ELEMENTOS_POR_PAGINA;
  const librosPaginados = libros.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(libros.length / ELEMENTOS_POR_PAGINA);

  // ─────────────────────────────────────────────────
  // CARGA DE DATOS
  // ─────────────────────────────────────────────────

  /**
   * Carga libros, autores y categorías desde el backend.
   * Usa Promise.all para optimizar las peticiones.
   *
   * @async
   * @returns {Promise<void>}
   */
  const cargarDatos = async () => {
    try {
      const [resLibros, resAutores, resCategorias] = await Promise.all([
        api.get('/libros'),
        api.get('/autores'),
        api.get('/categorias')
      ]);

      // Extraer datos considerando estructura de respuesta
      const librosData = resLibros.data.datos || resLibros.data;
      const autoresData = resAutores.data.datos || resAutores.data;
      const categoriasData = resCategorias.data.datos || resCategorias.data;

      if (Array.isArray(librosData)) setLibros(librosData);
      if (Array.isArray(autoresData)) setAutores(autoresData);
      if (Array.isArray(categoriasData)) setCategorias(categoriasData);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[Inventario] Error cargando datos:', err);
      }
    } finally {
      setCargando(false);
    }
  };

  /**
   * Efecto inicial para cargar datos al montar el componente.
   */
  useEffect(() => {
    cargarDatos();
  }, []);

  // ─────────────────────────────────────────────────
  // GESTIÓN DEL MODAL
  // ─────────────────────────────────────────────────

  /**
   * Prepara el formulario para crear un nuevo libro.
   * Establece valores iniciales y el primer autor/categoría disponible.
   */
  const abrirModalNuevo = () => {
    setDatosLibro({
      ...LIBRO_INICIAL,
      autor_id: autores[0]?.id || '',
      categoria_id: categorias[0]?.id || ''
    });
  };

  /**
   * Prepara el formulario para editar un libro existente.
   * Carga los datos del libro seleccionado.
   *
   * @param {Object} libro - Libro a editar
   */
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

  // ─────────────────────────────────────────────────
  // MANEJADORES DE FORMULARIO
  // ─────────────────────────────────────────────────

  /**
   * Actualiza el estado del formulario cuando cambia un campo.
   *
   * @param {React.ChangeEvent} e - Evento de cambio
   */
  const handleChange = (e) => {
    setDatosLibro({ ...datosLibro, [e.target.name]: e.target.value });
  };

  /**
   * Guarda el libro (crea o actualiza según el contexto).
   * Detecta automáticamente si es creación o edición por el ID.
   *
   * @async
   * @param {React.FormEvent} e - Evento del formulario
   * @returns {Promise<void>}
   */
  const handleGuardar = async (e) => {
    e.preventDefault();

    try {
      if (datosLibro.id) {
        // Modo edición: actualizar libro existente
        await api.put(`/libros/${datosLibro.id}`, datosLibro);
        alert('Libro actualizado correctamente');
      } else {
        // Modo creación: nuevo libro
        await api.post('/libros', datosLibro);
        alert('Libro creado con éxito');
      }

      // Recargar tabla y cerrar modal
      cargarDatos();
      document.getElementById('cerrarModalBtn').click();

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Inventario] Error al guardar:', error);
      }
      alert(error.response?.data?.mensaje || error.response?.data?.error || 'Error al guardar');
    }
  };

  /**
   * Elimina un libro previa confirmación del usuario.
   *
   * @async
   * @param {number} id - ID del libro
   * @param {string} titulo - Título para mostrar en confirmación
   * @returns {Promise<void>}
   */
  const handleEliminar = async (id, titulo) => {
    if (!window.confirm(`¿Borrar "${titulo}"?`)) {
      return;
    }

    try {
      await api.delete(`/libros/${id}`);
      cargarDatos();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Inventario] Error al eliminar:', error);
      }
      alert(error.response?.data?.mensaje || error.response?.data?.error || 'Error al eliminar');
    }
  };

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────

  return (
    <div className="container mt-4">

      {/* ─────────────────────────────────────────────────
          ENCABEZADO DEL MÓDULO
          ───────────────────────────────────────────────── */}
      <div className="module-header mb-4 shadow-sm" style={{ borderRadius: '8px' }}>
        <h2 className="text-white">Inventario Actual</h2>
        {tienePermiso('crearLibro') && (
          <button
            className="btn btn-light btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#modalLibro"
            onClick={abrirModalNuevo}
          >
            + Nuevo Libro
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────
          TABLA DE LIBROS
          ───────────────────────────────────────────────── */}
      {cargando ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
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
              {librosPaginados.map((libro) => (
                <tr key={libro.id}>
                  <td>{libro.isbn}</td>
                  <td className="fw-bold">{libro.titulo}</td>
                  <td>{libro.autor || 'N/A'}</td>
                  <td>
                    <span className="badge bg-secondary">{libro.categoria || 'Gral'}</span>
                  </td>
                  <td>${new Intl.NumberFormat('es-CO').format(libro.precio_venta || 0)}</td>
                  <td>
                    {/* Indicador visual de stock bajo */}
                    <span className={`badge ${
                      (libro.stock_actual || 0) <= libro.stock_minimo ? 'bg-danger' : 'bg-success'
                    }`}>
                      {libro.stock_actual || 0}
                    </span>
                  </td>
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
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEliminar(libro.id, libro.titulo)}
                        title="Eliminar"
                      >
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

      {/* ─────────────────────────────────────────────────
          CONTROLES DE PAGINACIÓN
          ───────────────────────────────────────────────── */}
      {!cargando && totalPaginas > 1 && (
        <nav className="d-flex justify-content-center mt-3" aria-label="Paginación de inventario">
          <ul className="pagination pagination-sm">
            <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>
            </li>
            {[...Array(totalPaginas)].map((_, i) => (
              <li key={i + 1} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPaginaActual(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* ─────────────────────────────────────────────────
          MODAL CREAR/EDITAR LIBRO
          Reutilizable para ambas operaciones
          ───────────────────────────────────────────────── */}
      <div className="modal fade" id="modalLibro" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-fullscreen-sm-down">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                {datosLibro.id ? 'Editar Libro' : 'Registrar Nuevo Libro'}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
                id="cerrarModalBtn"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleGuardar}>
                <div className="mb-3">
                  <label className="form-label">ISBN (Código):</label>
                  <input
                    type="text"
                    className="form-control"
                    name="isbn"
                    required
                    value={datosLibro.isbn}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Título:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="titulo"
                    required
                    value={datosLibro.titulo}
                    onChange={handleChange}
                  />
                </div>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label">Precio Venta:</label>
                    <input
                      type="number"
                      className="form-control"
                      name="precio_venta"
                      required
                      min="0"
                      value={datosLibro.precio_venta}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label">Stock Mínimo:</label>
                    <input
                      type="number"
                      className="form-control"
                      name="stock_minimo"
                      min="0"
                      value={datosLibro.stock_minimo}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Autor:</label>
                  <select
                    className="form-select"
                    name="autor_id"
                    value={datosLibro.autor_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un autor</option>
                    {autores.map(autor => (
                      <option key={autor.id} value={autor.id}>{autor.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Categoría:</label>
                  <select
                    className="form-select"
                    name="categoria_id"
                    value={datosLibro.categoria_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    {datosLibro.id ? 'Guardar Cambios' : 'Crear Libro'}
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

export default Inventario;
