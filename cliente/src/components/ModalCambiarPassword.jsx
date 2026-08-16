// =====================================================
// COMPONENTE: MODAL PARA CAMBIAR CONTRASEÑA
// =====================================================
// Este componente renderiza una ventana emergente (modal) que permite
// a CUALQUIER usuario del sistema cambiar su propia contrasena.
// Se abre desde el menu desplegable de usuario en la BarraNavegacion.
//
// Flujo de funcionamiento:
//   1. El usuario hace clic en "Cambiar Contraseña" en la BarraNavegacion
//   2. BarraNavegacion cambia el estado visible=true y se abre este modal
//   3. El usuario llena los 3 campos: contraseña actual, nueva y confirmación
//   4. Al enviar, se valida en el frontend (evita peticiones innecesarias)
//   5. Si pasa la validación, se hace PATCH /api/usuarios/cambiar-password
//   6. El backend verifica la contraseña actual con bcrypt
//   7. Si es correcta, hashea la nueva contraseña y la guarda en la BD
//
// Patron de comunicación padre-hijo con props:
//   Este componente recibe dos props desde BarraNavegacion:
//   - visible (booleano): controla si el modal se muestra o no
//   - onCerrar (función callback): función que el padre pasa para que
//     este componente pueda "avisarle" que se cierre el modal.
//     Es un patron comun en React: el estado vive en el padre y
//     el hijo le avisa cuando debe cambiarlo.
//
// Conceptos aplicados:
//   - useState: múltiples estados para formulario, errores y carga
//   - Validación en frontend: mejora la UX dando feedback inmediato
//   - Peticiones HTTP con async/await y manejo de errores try/catch
//   - Renderizado condicional: if (!visible) return null
//   - Spread operator (...form): para actualizar campos individuales
// =====================================================

// useState: hook de React para manejar estado local.
// Lo usamos para controlar los valores del formulario, los mensajes
// de error/exito y el estado de carga del boton.
import { useState } from 'react';

// api: instancia de Axios preconfigurada en services/api.js.
// Axios es una librería para hacer peticiones HTTP (GET, POST, PATCH, etc.)
// Nuestra instancia 'api' ya tiene configurado:
//   - La URL base del servidor (ej: http://localhost:3001/api)
//   - Un interceptor que agrega automáticamente el token JWT en el
//     header Authorization de cada petición, para que el backend
//     pueda verificar que el usuario está autenticado.
import api from '../services/api';


// =====================================================
// COMPONENTE FUNCIONAL: ModalCambiarPassword
// =====================================================
// Recibe dos props por desestructuracion:
//   - visible: booleano que indica si el modal debe mostrarse
//   - onCerrar: función callback del componente padre para cerrar el modal

const ModalCambiarPassword = ({ visible, onCerrar }) => {

  // ---------------------------------------------------------
  // ESTADOS DEL COMPONENTE (useState)
  // ---------------------------------------------------------
  // En React, el "estado" es información que puede cambiar con el
  // tiempo y que, al cambiar, provoca que el componente se vuelva
  // a renderizar (re-render) para reflejar los nuevos datos en la UI.

  // Estado del formulario: un objeto con los 3 campos.
  // Usamos un solo useState con un objeto en lugar de 3 useState
  // separados porque los campos están lógicamente relacionados
  // (todos pertenecen al mismo formulario).
  const [form, setForm] = useState({
    passwordActual: '',       // La contraseña que el usuario usa actualmente
    passwordNueva: '',        // La nueva contraseña que quiere establecer
    passwordConfirmacion: ''  // Repeticion de la nueva contraseña (evita errores de tipeo)
  });

  // Estado para mensajes de retroalimentación al usuario.
  // Solo uno de estos dos estará activo a la vez (error O exito).
  const [error, setError] = useState('');   // Mensaje en rojo (alert-danger)
  const [exito, setExito] = useState('');   // Mensaje en verde (alert-success)

  // Estado de carga: indica si la petición HTTP está en curso.
  // Mientras es true, el boton de enviar se deshabilita para evitar
  // que el usuario haga doble clic y envie la petición dos veces.
  const [guardando, setGuardando] = useState(false);


  // ---------------------------------------------------------
  // FUNCIÓN: cerrar
  // ---------------------------------------------------------
  // Cierra el modal y reinicia todos los estados a sus valores
  // iniciales. Esto es importante para que la próxima vez que el
  // usuario abra el modal, encuentre el formulario limpio sin
  // datos ni mensajes de la sesión anterior.

  const cerrar = () => {
    setForm({ passwordActual: '', passwordNueva: '', passwordConfirmacion: '' });
    setError('');
    setExito('');
    onCerrar(); // Ejecutamos el callback del padre para que cambie visible=false
  };


  // ---------------------------------------------------------
  // FUNCIÓN: manejarEnvio (evento submit del formulario)
  // ---------------------------------------------------------
  // Esta función es "async" porque hace una petición HTTP al backend
  // que tarda un tiempo en responder. "async/await" nos permite
  // escribir código asíncrono (que espera respuestas) de forma
  // secuencial y legible, en lugar de usar .then().then().then()
  //
  // Recibe el evento "e" del formulario (evento submit del DOM).

  const manejarEnvio = async (e) => {
    // preventDefault() evita el comportamiento por defecto del formulario
    // HTML, que es recargar toda la página al enviarse. En una SPA
    // (Single Page Application) NUNCA queremos recargar la página;
    // en su lugar, manejamos el envío con JavaScript.
    e.preventDefault();

    // Limpiamos mensajes previos antes de una nueva validación
    setError('');
    setExito('');

    // ---------------------------------------------------------
    // VALIDACIONES EN EL FRONTEND
    // ---------------------------------------------------------
    // Validamos los datos ANTES de enviarlos al servidor. Esto
    // mejora la experiencia del usuario (UX) porque:
    //   - El feedback es instantaneo (no espera respuesta del servidor)
    //   - Ahorra ancho de banda (no envía peticiones que van a fallar)
    //   - Reduce carga en el servidor
    //
    // IMPORTANTE: estas validaciones son solo para UX. El backend
    // TAMBIÉN valida porque un usuario malicioso podría saltarse
    // el frontend enviando peticiones directamente con Postman o curl.
    //
    // El patron "return setError(...)" aprovecha que setError retorna
    // undefined, y "return undefined" sale de la función inmediatamente,
    // evitando que se ejecute el código posterior.

    if (!form.passwordActual) {
      return setError('Ingrese su contraseña actual');
    }
    if (form.passwordNueva.length < 8) {
      return setError('La nueva contraseña debe tener al menos 8 caracteres');
    }
    if (form.passwordNueva !== form.passwordConfirmacion) {
      return setError('La nueva contraseña y la confirmación no coinciden');
    }
    if (form.passwordActual === form.passwordNueva) {
      return setError('La nueva contraseña debe ser diferente a la actual');
    }

    // ---------------------------------------------------------
    // PETICIÓN HTTP AL BACKEND
    // ---------------------------------------------------------
    // Usamos try/catch/finally para manejar errores de forma elegante.
    //   try: intenta ejecutar el código (puede fallar si el servidor
    //        responde con error o si no hay conexión)
    //   catch: captura el error si algo fallo en el try
    //   finally: se ejecuta SIEMPRE, haya o no error (ideal para
    //            limpiar estados como "guardando")

    try {
      setGuardando(true); // Deshabilitamos el boton de envío

      // PATCH: método HTTP para actualizaciones parciales.
      // A diferencia de PUT (que reemplaza el recurso completo),
      // PATCH solo modifica los campos que se envian.
      // En este caso, solo actualizamos la contraseña del usuario.
      await api.patch('/usuarios/cambiar-password', {
        passwordActual: form.passwordActual,
        passwordNueva: form.passwordNueva,
        passwordConfirmacion: form.passwordConfirmacion
      });

      // Si llegamos aquí sin errores, el cambio fue exitoso
      setExito('Contraseña actualizada exitosamente');

      // Limpiamos el formulario y cerramos el modal automáticamente
      // después de 2 segundos para que el usuario alcance a leer
      // el mensaje de exito. setTimeout es una función de JavaScript
      // que ejecuta una función después de X milisegundos.
      setForm({ passwordActual: '', passwordNueva: '', passwordConfirmacion: '' });
      setTimeout(cerrar, 2000);

    } catch (err) {
      // Si el backend respondio con un error HTTP (400, 401, 500, etc.),
      // Axios lo captura aqui. Extraemos el mensaje de error del backend
      // usando encadenamiento opcional (?.) por si alguna propiedad no existe.
      // El operador || proporciona un mensaje genérico como fallback.
      const mensaje = err.response?.data?.mensaje || 'Error al cambiar la contraseña';
      setError(mensaje);
    } finally {
      // Rehabilitamos el boton sin importar si hubo exito o error
      setGuardando(false);
    }
  };


  // ---------------------------------------------------------
  // RENDERIZADO CONDICIONAL
  // ---------------------------------------------------------
  // Si visible es false, retornamos null (nada). React no renderiza
  // null en el DOM, así que el modal simplemente desaparece.
  // Este patron se llama "early return" (retorno temprano) y es
  // más limpio que envolver todo el JSX en un {visible && (...)}.
  if (!visible) return null;


  // ---------------------------------------------------------
  // JSX DEL MODAL
  // ---------------------------------------------------------
  // Construimos el modal manualmente con clases de Bootstrap 5
  // en lugar de usar el sistema de modales JavaScript de Bootstrap.
  // Esto nos da control total desde React sobre cuando se muestra
  // y cuando se oculta, ya que React maneja el DOM virtual.

  return (
    // ── FONDO OSCURO (backdrop) ──
    // El div exterior cubre toda la pantalla con un fondo negro
    // semitransparente (rgba con opacidad 0.5). "d-block" lo hace
    // visible (Bootstrap lo oculta por defecto). zIndex: 1060
    // lo posiciona por encima de todos los demas elementos.
    //
    // onClick: si el usuario hace clic en el fondo oscuro (no en el
    // modal), lo cerramos. e.target === e.currentTarget verifica que
    // el clic fue en este div exacto y no en un elemento hijo.
    // Sin esta verificación, cualquier clic DENTRO del modal también
    // lo cerraria (porque los eventos "burbujean" hacia arriba en el DOM).
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
      onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}
    >
      {/* modal-sm: modal de tamaño pequeño (max-width: 300px).
          Suficiente para un formulario de 3 campos. */}
      <div className="modal-dialog modal-sm">
        <div className="modal-content">

          {/* ── ENCABEZADO DEL MODAL ──
              bg-warning: fondo amarillo de Bootstrap, usado para
              indicar precaucion (cambiar la contraseña es una
              acción sensible). btn-close: boton X de Bootstrap. */}
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title">Cambiar Contraseña</h5>
            <button type="button" className="btn-close" onClick={cerrar} />
          </div>

          {/* ── FORMULARIO ──
              Envolvemos los campos en <form> para que el evento
              onSubmit se dispare al presionar Enter o al hacer
              clic en el boton de tipo "submit". */}
          <form onSubmit={manejarEnvio}>
            <div className="modal-body">

              {/* Mensajes de retroalimentación al usuario.
                  Usamos renderizado condicional con && :
                  si 'error' es un string vacío (falsy), no se renderiza.
                  Si tiene texto (truthy), se muestra el alert. */}
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              {exito && <div className="alert alert-success py-2 small">{exito}</div>}

              {/* ── CAMPO: Contraseña actual ──
                  type="password" oculta el texto con puntos.
                  autoComplete="current-password" le indica al navegador
                  que puede sugerir la contraseña guardada. */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">Contraseña Actual *</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  value={form.passwordActual}
                  onChange={(e) => setForm({ ...form, passwordActual: e.target.value })}
                  placeholder="Tu contraseña actual"
                  autoComplete="current-password"
                  required
                />
              </div>

              {/* ── CAMPO: Nueva contraseña ──
                  minLength={8} es una validación HTML5 nativa que
                  complementa nuestra validación en JavaScript. */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">Nueva Contraseña *</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  value={form.passwordNueva}
                  onChange={(e) => setForm({ ...form, passwordNueva: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              {/* ── CAMPO: Confirmar nueva contraseña ──
                  autoComplete="new-password" en ambos campos de
                  contraseña nueva ayuda al navegador a entender que
                  el usuario está creando una nueva contrasena. */}
              <div className="mb-2">
                <label className="form-label fw-semibold small">Confirmar Nueva Contraseña *</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  value={form.passwordConfirmacion}
                  onChange={(e) => setForm({ ...form, passwordConfirmacion: e.target.value })}
                  placeholder="Repite la nueva contraseña"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* ── BOTONES DEL MODAL ──
                El boton "Cancelar" es type="button" para que NO dispare
                el submit del formulario. El boton "Cambiar" es type="submit"
                para que SI lo dispare. "disabled={guardando}" lo deshabilita
                mientras la petición está en curso. */}
            <div className="modal-footer py-2">
              <button type="button" className="btn btn-sm btn-secondary" onClick={cerrar}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-sm btn-warning" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Exportamos el componente para usarlo en BarraNavegacion.jsx
export default ModalCambiarPassword;
