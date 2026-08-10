import React from 'react';

// =====================================================
// PAGINA: Manual de Usuario
// =====================================================
// Explica paso a paso cómo usar el sistema.
// Escrito en lenguaje sencillo para que cualquier
// persona pueda entenderlo, aunque no sepa de programación.
// =====================================================

const DocumentacionManualUsuario = () => {
  return (
    <div className="container py-4">
      <h2 className="fw-bold text-primary mb-1">Manual de Usuario</h2>
      <p className="text-muted mb-4">
        Esta guía te explica paso a paso cómo usar el Sistema de Gestión de Inventario
        de la Librería El Saber. Está escrita en lenguaje sencillo para que cualquier persona
        pueda entender cómo funciona.
      </p>

      {/* ── 1. INICIAR SESIÓN ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          1. Cómo iniciar sesión
        </div>
        <div className="card-body">
          <ol>
            <li className="mb-2">Abre el navegador (Chrome, Firefox, Edge) y entra a la dirección del sistema.</li>
            <li className="mb-2">Verás la página de login con dos campos: <strong>Correo electrónico</strong> y <strong>Contraseña</strong>.</li>
            <li className="mb-2">Escribe tu correo y tu contraseña.</li>
            <li className="mb-2">Haz clic en el botón <strong>"INGRESAR AL SISTEMA"</strong>.</li>
            <li className="mb-2">Si los datos son correctos, entrarás al sistema.</li>
            <li className="mb-0">Si te equivocas 3 veces seguidas con el mismo correo, tu cuenta se bloqueará por 3 minutos automáticamente. Espera ese tiempo y vuelve a intentarlo.</li>
          </ol>
          <div className="alert alert-info mt-3 mb-0 small">
            <strong>Tip:</strong> Puedes hacer clic en el ícono del ojo para ver u ocultar tu contraseña mientras la escribes.
          </div>
        </div>
      </div>

      {/* ── 2. NAVEGACIÓN ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          2. Cómo navegar por el sistema
        </div>
        <div className="card-body">
          <p>Una vez dentro, verás una <strong>barra de navegación</strong> en la parte de arriba con estas opciones:</p>
          <ul>
            <li><strong>Dashboard:</strong> Estadísticas del negocio (solo Administrador)</li>
            <li><strong>Gestión Comercial:</strong> Ventas, Historial de Ventas y Clientes</li>
            <li><strong>Logística:</strong> Inventario, Movimientos, Autores, Categorías y Proveedores</li>
            <li><strong>Tu nombre:</strong> Menú con opciones de usuario (cambiar contraseña, cerrar sesión, gestión de usuarios)</li>
          </ul>
          <div className="alert alert-warning small mb-0">
            <strong>En celular:</strong> La barra de navegación se convierte en un botón de 3 líneas (hamburguesa).
            Toca ese botón para ver las opciones.
          </div>
        </div>
      </div>

      {/* ── 3. DASHBOARD ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          3. Dashboard (solo Administrador)
        </div>
        <div className="card-body">
          <p>Es la primera página que ve el Administrador al entrar. Aquí puedes ver:</p>
          <ul>
            <li><strong>4 tarjetas de KPI:</strong> Ventas Hoy, Ventas de la Semana, Ventas del Mes y Alertas de Stock.</li>
            <li><strong>3 métricas secundarias:</strong> Total de libros en el catálogo, valor total del inventario y total de clientes registrados.</li>
            <li><strong>Gráfica de área:</strong> Muestra la tendencia de ventas e ingresos de los últimos 6 meses.</li>
            <li><strong>Gráfica de barras:</strong> Muestra las ventas por día de la semana (lunes a domingo).</li>
            <li><strong>Gráfica de torta (dona):</strong> Muestra cómo están distribuidos los libros por categorías.</li>
            <li><strong>Top 5 libros más vendidos:</strong> Los libros que más se han vendido con sus ingresos.</li>
            <li><strong>Top 5 mejores clientes:</strong> Los clientes que más han comprado.</li>
            <li><strong>Libros con stock bajo:</strong> Una tabla con los libros que necesitan reabastecimiento.</li>
          </ul>
        </div>
      </div>

      {/* ── 4. INVENTARIO ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          4. Cómo gestionar el inventario
        </div>
        <div className="card-body">
          <h6 className="fw-bold">Ver los libros</h6>
          <ol>
            <li>Ve a <strong>Logística &rarr; Inventario</strong>.</li>
            <li>Verás una tabla con todos los libros: imagen, título, autor, categoría, precio y stock.</li>
            <li>Cada libro tiene un indicador de color: <span className="badge bg-success">Disponible</span>, <span className="badge bg-warning text-dark">Stock Bajo</span> o <span className="badge bg-danger">Agotado</span>.</li>
          </ol>

          <h6 className="fw-bold mt-3">Buscar un libro</h6>
          <ol>
            <li>Escribe en el campo de búsqueda que está arriba de la tabla.</li>
            <li>Puedes buscar por título, autor o ISBN.</li>
            <li>La tabla se filtra automáticamente mientras escribes.</li>
          </ol>

          <h6 className="fw-bold mt-3">Agregar un libro nuevo (solo Administrador)</h6>
          <ol>
            <li>Haz clic en el botón <strong>"Agregar libro"</strong>.</li>
            <li>Llena el formulario con los datos del libro (título, ISBN, autor, categoría, precio, stock).</li>
            <li>Opcionalmente, sube una imagen de portada (JPG, PNG o WebP, máximo 2 MB).</li>
            <li>Haz clic en <strong>"Guardar"</strong>.</li>
          </ol>

          <h6 className="fw-bold mt-3">Editar o eliminar un libro (solo Administrador)</h6>
          <ol>
            <li>En la tabla, busca el libro que quieres editar.</li>
            <li>Haz clic en el botón de <strong>editar</strong> (lápiz) para modificar sus datos.</li>
            <li>Haz clic en el botón de <strong>eliminar</strong> (basura) para borrarlo. Te pedirá confirmación antes.</li>
          </ol>
        </div>
      </div>

      {/* ── 5. MOVIMIENTOS ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          5. Cómo registrar movimientos de inventario (Kardex)
        </div>
        <div className="card-body">
          <p>Los movimientos sirven para registrar cuándo llegan libros nuevos (ENTRADA) o cuándo salen por algún motivo que no es venta (SALIDA).</p>

          <h6 className="fw-bold">Registrar una entrada</h6>
          <ol>
            <li>Ve a <strong>Logística &rarr; Movimientos</strong>.</li>
            <li>Selecciona el tipo <strong>"ENTRADA"</strong>.</li>
            <li>Elige el libro que llegó.</li>
            <li>Escribe la cantidad, selecciona el proveedor y escribe el costo de compra.</li>
            <li>Haz clic en <strong>"Registrar"</strong>.</li>
            <li>El stock del libro se actualizará automáticamente.</li>
          </ol>

          <h6 className="fw-bold mt-3">Registrar una salida</h6>
          <ol>
            <li>Selecciona el tipo <strong>"SALIDA"</strong>.</li>
            <li>Elige el libro y la cantidad que sale.</li>
            <li>Haz clic en <strong>"Registrar"</strong>.</li>
          </ol>

          <p className="mb-0">En la parte de abajo verás el <strong>historial de movimientos</strong> con todos los registros.</p>
        </div>
      </div>

      {/* ── 6. VENTAS ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          6. Cómo registrar una venta
        </div>
        <div className="card-body">
          <ol>
            <li className="mb-2">Ve a <strong>Gestión Comercial &rarr; POS / Ventas</strong>.</li>
            <li className="mb-2"><strong>Busca al cliente:</strong> Escribe el nombre del cliente en el buscador. Si no existe, puedes crearlo desde la sección de Clientes.</li>
            <li className="mb-2"><strong>Agrega libros al carrito:</strong> Busca el libro, elige la cantidad y haz clic en "Agregar". Puedes agregar varios libros.</li>
            <li className="mb-2"><strong>Revisa el carrito:</strong> Puedes cambiar las cantidades o eliminar productos del carrito.</li>
            <li className="mb-2"><strong>Aplica descuento (opcional):</strong> Puedes aplicar un descuento en porcentaje (0% a 100%) y el sistema calcula automáticamente el monto.</li>
            <li className="mb-2"><strong>Elige el método de pago:</strong> Efectivo, Tarjeta, Transferencia o Mixto.</li>
            <li className="mb-0"><strong>Confirma la venta:</strong> Haz clic en "Confirmar venta". El stock se descuenta automáticamente.</li>
          </ol>
          <div className="alert alert-info mt-3 mb-0 small">
            <strong>En celular:</strong> El carrito aparece debajo del formulario de productos en vez de al lado.
          </div>
        </div>
      </div>

      {/* ── 7. HISTORIAL DE VENTAS ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          7. Cómo consultar el historial de ventas
        </div>
        <div className="card-body">
          <ol>
            <li className="mb-2">Ve a <strong>Gestión Comercial &rarr; Historial</strong>.</li>
            <li className="mb-2">Verás una tabla con todas las ventas. Cada una tiene un estado: <span className="badge bg-success">Completada</span> o <span className="badge bg-danger">Anulada</span>.</li>
            <li className="mb-2"><strong>Filtrar por fecha:</strong> Usa los campos de fecha "desde" y "hasta" para filtrar.</li>
            <li className="mb-2"><strong>Buscar por cliente:</strong> Escribe el nombre del cliente en el buscador.</li>
            <li className="mb-2"><strong>Descargar ticket PDF:</strong> Haz clic en el botón de PDF junto a una venta para descargar el ticket.</li>
            <li className="mb-2"><strong>Exportar a Excel:</strong> Haz clic en "Exportar a Excel" para descargar un archivo con las ventas filtradas.</li>
            <li className="mb-0"><strong>Anular venta (solo Admin):</strong> Haz clic en "Anular" junto a una venta completada. Los libros volverían al inventario.</li>
          </ol>
        </div>
      </div>

      {/* ── 8. CLIENTES ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          8. Cómo gestionar clientes
        </div>
        <div className="card-body">
          <ol>
            <li className="mb-2">Ve a <strong>Gestión Comercial &rarr; Clientes</strong>.</li>
            <li className="mb-2">Verás la lista de clientes registrados.</li>
            <li className="mb-2"><strong>Buscar:</strong> Escribe en el buscador para filtrar por nombre o documento.</li>
            <li className="mb-2"><strong>Crear cliente:</strong> Haz clic en "Agregar cliente" y llena el formulario (nombre, tipo de documento, documento, teléfono, correo).</li>
            <li className="mb-2"><strong>Editar (solo Admin):</strong> Haz clic en el botón de editar junto al cliente.</li>
            <li className="mb-0"><strong>Eliminar (solo Admin):</strong> Haz clic en el botón de eliminar. Te pedirá confirmación.</li>
          </ol>
          <div className="alert alert-light border small mt-3 mb-0">
            <strong>Tipos de documento disponibles:</strong> Cédula de Ciudadanía (CC), NIT, Cédula de Extranjería (CE), Pasaporte.
          </div>
        </div>
      </div>

      {/* ── 9. PROVEEDORES ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          9. Cómo gestionar proveedores (solo Administrador)
        </div>
        <div className="card-body">
          <ol>
            <li className="mb-2">Ve a <strong>Logística &rarr; Proveedores</strong>.</li>
            <li className="mb-2">Verás la lista de proveedores con su empresa, NIT, contacto, etc.</li>
            <li className="mb-2"><strong>Crear proveedor:</strong> Haz clic en "Agregar proveedor" y llena los datos (empresa, NIT, contacto, email, teléfono, dirección).</li>
            <li className="mb-2"><strong>Editar:</strong> Haz clic en el botón de editar para modificar los datos.</li>
            <li className="mb-0"><strong>Eliminar:</strong> Haz clic en el botón de eliminar junto al proveedor. Solo se puede eliminar si no tiene movimientos de inventario asociados.</li>
          </ol>
        </div>
      </div>

      {/* ── 10. AUTORES Y CATEGORÍAS ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          10. Cómo gestionar autores y categorías
        </div>
        <div className="card-body">
          <h6 className="fw-bold">Autores</h6>
          <ol>
            <li className="mb-1">Ve a <strong>Logística &rarr; Autores</strong>.</li>
            <li className="mb-1">Puedes crear un autor indicando su nombre.</li>
            <li className="mb-1">No se puede eliminar un autor que tiene libros asociados.</li>
          </ol>

          <h6 className="fw-bold mt-3">Categorías</h6>
          <ol>
            <li className="mb-1">Ve a <strong>Logística &rarr; Categorías</strong>.</li>
            <li className="mb-1">Puedes crear una categoría indicando su nombre (es único: el sistema no permite repetirlo).</li>
            <li className="mb-1">No se puede eliminar una categoría que tiene libros asociados.</li>
          </ol>

          <div className="alert alert-info small mt-3 mb-0">
            <strong>Nota:</strong> Todos los usuarios pueden ver autores y categorías, pero solo el Administrador puede crear, editar o eliminar.
          </div>
        </div>
      </div>

      {/* ── 11. GESTIÓN DE USUARIOS ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          11. Cómo gestionar usuarios (solo Administrador)
        </div>
        <div className="card-body">
          <ol>
            <li className="mb-2">Haz clic en tu nombre en la barra de navegación y selecciona <strong>"Gestión de Usuarios"</strong>.</li>
            <li className="mb-2">Verás una tabla con todos los usuarios del sistema.</li>
            <li className="mb-2"><strong>Crear usuario:</strong> Haz clic en "Agregar usuario" y llena los datos (nombre, email, contraseña y rol).</li>
            <li className="mb-2"><strong>Editar:</strong> Puedes cambiar el nombre, email y rol de un usuario.</li>
            <li className="mb-0"><strong>Activar/Desactivar:</strong> Puedes desactivar un usuario para que no pueda iniciar sesión. No puedes desactivarte a ti mismo.</li>
          </ol>
        </div>
      </div>

      {/* ── 12. CAMBIAR CONTRASEÑA ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          12. Cómo cambiar tu contraseña
        </div>
        <div className="card-body">
          <ol>
            <li className="mb-2">Haz clic en tu nombre en la barra de navegación.</li>
            <li className="mb-2">Selecciona <strong>"Cambiar Contraseña"</strong>.</li>
            <li className="mb-2">Se abrirá una ventana (modal) con tres campos:</li>
          </ol>
          <ul className="mb-3">
            <li><strong>Contraseña actual:</strong> Escribe tu contraseña actual para verificar tu identidad.</li>
            <li><strong>Nueva contraseña:</strong> Escribe la nueva contraseña (mínimo 8 caracteres).</li>
            <li><strong>Confirmar contraseña:</strong> Vuelve a escribir la nueva contraseña para asegurarte de que está bien.</li>
          </ul>
          <p className="mb-0">Haz clic en <strong>"Guardar"</strong>. Si todo está bien, verás un mensaje de éxito.</p>
        </div>
      </div>

      {/* ── 13. ROLES ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          13. Diferencias entre Administrador y Vendedor
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Función</th>
                  <th className="text-center">Administrador</th>
                  <th className="text-center">Vendedor</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Ver Dashboard</td><td className="text-center text-success">Sí</td><td className="text-center text-danger">No</td></tr>
                <tr><td>Ver inventario</td><td className="text-center text-success">Sí</td><td className="text-center text-success">Sí</td></tr>
                <tr><td>Crear/editar/eliminar libros</td><td className="text-center text-success">Sí</td><td className="text-center text-danger">No</td></tr>
                <tr><td>Registrar movimientos</td><td className="text-center text-success">Sí</td><td className="text-center text-danger">No</td></tr>
                <tr><td>Registrar ventas</td><td className="text-center text-success">Sí</td><td className="text-center text-success">Sí</td></tr>
                <tr><td>Ver historial de ventas</td><td className="text-center text-success">Sí</td><td className="text-center text-success">Sí</td></tr>
                <tr><td>Anular ventas</td><td className="text-center text-success">Sí</td><td className="text-center text-danger">No</td></tr>
                <tr><td>Ver clientes</td><td className="text-center text-success">Sí</td><td className="text-center text-success">Sí</td></tr>
                <tr><td>Crear clientes</td><td className="text-center text-success">Sí</td><td className="text-center text-success">Sí</td></tr>
                <tr><td>Editar/eliminar clientes</td><td className="text-center text-success">Sí</td><td className="text-center text-danger">No</td></tr>
                <tr><td>Gestionar proveedores</td><td className="text-center text-success">Sí</td><td className="text-center text-danger">No</td></tr>
                <tr><td>Ver autores y categorías</td><td className="text-center text-success">Sí</td><td className="text-center text-success">Sí</td></tr>
                <tr><td>Gestionar usuarios</td><td className="text-center text-success">Sí</td><td className="text-center text-danger">No</td></tr>
                <tr><td>Cambiar contraseña propia</td><td className="text-center text-success">Sí</td><td className="text-center text-success">Sí</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── PREGUNTAS FRECUENTES ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          Preguntas frecuentes
        </div>
        <div className="card-body">
          <h6 className="fw-bold">¿Mi cuenta está bloqueada, qué hago?</h6>
          <p>Después de 3 intentos fallidos con el mismo correo, la cuenta se bloquea automáticamente por 3 minutos. Espera ese tiempo y vuelve a intentar iniciar sesión. No necesitas pedirle nada al Administrador.</p>

          <h6 className="fw-bold">¿No veo algunas opciones en el menú, por qué?</h6>
          <p>Probablemente tu rol es Vendedor. Algunas opciones como Dashboard, Movimientos y Gestión de Usuarios solo están disponibles para Administradores.</p>

          <h6 className="fw-bold">¿Puedo anular una venta?</h6>
          <p>Solo el Administrador puede anular ventas. Al anular, los libros vuelven al inventario automáticamente.</p>

          <h6 className="fw-bold">¿Qué pasa si intento vender más libros de los que hay en stock?</h6>
          <p className="mb-0">El sistema no lo permite. Valida la cantidad disponible antes de confirmar la venta.</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentacionManualUsuario;
