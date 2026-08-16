// =====================================================
// PÁGINA: Criterios de Aceptación (Documentación SENA)
// =====================================================
// En la metodología ágil (Scrum), cada Historia de Usuario tiene asociados
// "criterios de aceptación": condiciones específicas y verificables que
// definen CUANDO una funcionalidad se considera terminada y correcta.
//
// Estructura de este archivo:
//   1. Array "criterios": datos estáticos con todas las HU y sus criterios
//   2. Objeto "colorModulo": mapa de colores para badges por módulo
//   3. Componente DocumentacionCriterios: agrupa por módulo y renderiza
//
// Este componente se carga de forma diferida (lazy) desde Acceso.jsx,
// por lo que solo se descarga cuando el usuario abre el modal de documentación.
//
// Conceptos aplicados:
//   - Datos estáticos fuera del componente (no se recrean en cada render)
//   - Object.entries(): convierte un objeto en array de pares [clave, valor]
//   - Array.reduce(): acumula/agrupa elementos de un array en una estructura
//   - Template literals con expresiones: `bg-${variable}`
// =====================================================

// -- Array de criterios de aceptación --
// Se define fuera del componente como constante porque son datos ESTÁTICOS
// que nunca cambian durante la ejecución. Si estuvieran dentro del componente,
// React los recrearía en memoria en cada render (innecesario).
// Cada objeto tiene: id (HU-XX), titulo, módulo (para agrupar) y criterios (array de strings).
const criterios = [
  // ── AUTENTICACIÓN ──
  {
    id: 'HU-01',
    titulo: 'Iniciar sesión en el sistema',
    modulo: 'Autenticación',
    criterios: [
      'El sistema muestra un formulario con campos de correo y contraseña',
      'Si el correo o la contraseña están vacíos, el formulario no se envía y muestra un mensaje de error',
      'Si los datos son correctos, el sistema redirige al usuario a la página principal según su rol',
      'Si los datos son incorrectos, se muestra un mensaje de error claro',
      'La sesión se mantiene activa aunque el usuario recargue la página (se guarda en localStorage)'
    ]
  },
  {
    id: 'HU-02',
    titulo: 'Bloqueo de cuenta por intentos fallidos',
    modulo: 'Autenticación',
    criterios: [
      'Después de 3 intentos fallidos consecutivos, la cuenta se bloquea por 3 minutos',
      'Se muestra una barra de progreso que indica cuántos intentos quedan',
      'El usuario bloqueado ve un mensaje claro indicando que su cuenta fue bloqueada',
      'El bloqueo se levanta automáticamente después de 3 minutos'
    ]
  },
  {
    id: 'HU-03',
    titulo: 'Cerrar sesión',
    modulo: 'Autenticación',
    criterios: [
      'El botón de cerrar sesión está visible en el menú de usuario',
      'Al hacer clic, se muestra una confirmación antes de cerrar',
      'Al confirmar, se elimina la sesión y se redirige a la página de login',
      'Después de cerrar sesión, no se puede acceder a páginas protegidas'
    ]
  },
  {
    id: 'HU-04',
    titulo: 'Cambiar mi contraseña',
    modulo: 'Autenticación',
    criterios: [
      'Se accede desde un botón en el menú de usuario que abre un modal',
      'El modal pide la contraseña actual, la nueva contraseña y la confirmación',
      'La nueva contraseña debe tener mínimo 8 caracteres',
      'Si la contraseña actual es incorrecta, se muestra un error',
      'Si la nueva contraseña y la confirmación no coinciden, se muestra un error',
      'Al cambiar exitosamente, se muestra un mensaje de éxito y se cierra el modal'
    ]
  },

  // ── DASHBOARD ──
  {
    id: 'HU-05',
    titulo: 'Ver el dashboard con estadísticas',
    modulo: 'Dashboard',
    criterios: [
      'Solo los Administradores pueden ver esta página',
      'Se muestran 4 tarjetas KPI: ventas del día, ventas de la semana, ventas del mes (con el porcentaje de crecimiento frente al mes anterior) y alertas de stock; además hay 3 métricas secundarias: total de libros, valor del inventario y total de clientes',
      'Las ventas anuladas no se cuentan en los indicadores',
      'Los datos se cargan automáticamente al entrar a la página',
      'Si un Vendedor intenta acceder, se le redirige a la página de ventas'
    ]
  },
  {
    id: 'HU-06',
    titulo: 'Ver gráficas de ventas y categorías',
    modulo: 'Dashboard',
    criterios: [
      'Se muestra una gráfica de área con las ventas e ingresos de los últimos 6 meses',
      'Se muestra una gráfica de dona con la distribución de libros por categoría',
      'Las gráficas se adaptan al tamaño de la pantalla (responsive)',
      'Los datos se obtienen del servidor en tiempo real'
    ]
  },
  {
    id: 'HU-07',
    titulo: 'Ver top de productos y clientes',
    modulo: 'Dashboard',
    criterios: [
      'Se muestra una lista con los 5 libros más vendidos y cuánto generaron en ingresos',
      'Se muestra una lista con los 5 mejores clientes por total gastado',
      'Los datos se actualizan cada vez que se entra al dashboard'
    ]
  },
  {
    id: 'HU-08',
    titulo: 'Ver libros con stock bajo',
    modulo: 'Dashboard',
    criterios: [
      'Se muestra una tabla con los libros cuyo stock actual está por debajo del stock mínimo',
      'La tabla muestra: título, autor, stock actual, stock mínimo y las unidades faltantes',
      'Hay un enlace que lleva directamente al módulo de inventario'
    ]
  },

  // ── INVENTARIO ──
  {
    id: 'HU-09',
    titulo: 'Ver lista de libros del inventario',
    modulo: 'Inventario',
    criterios: [
      'Se muestra una tabla paginada con todos los libros registrados (5 por página)',
      'Cada libro muestra: miniatura de portada, ISBN, título, autor, categoría, precio y stock',
      'El stock tiene un indicador visual de color: rojo cuando está en el mínimo o por debajo, verde cuando hay existencias suficientes',
      'La tabla se puede ver en celulares con desplazamiento horizontal'
    ]
  },
  {
    id: 'HU-10',
    titulo: 'Buscar libros en el inventario',
    modulo: 'Inventario',
    criterios: [
      'Hay un campo de búsqueda en la parte superior de la tabla',
      'Al escribir, la tabla se filtra instantáneamente sin hacer petición al servidor',
      'Se puede buscar por título o por ISBN',
      'Si no hay resultados, se muestra un mensaje indicándolo'
    ]
  },
  {
    id: 'HU-11',
    titulo: 'Crear un libro nuevo',
    modulo: 'Inventario',
    criterios: [
      'Solo el Administrador ve el botón de "Agregar libro"',
      'Se abre un formulario para llenar: título, ISBN, autor, categoría, precio de venta, stock mínimo y portada',
      'El título y el precio son obligatorios; el precio debe ser mayor a cero',
      'El stock actual no se digita: el libro nace en cero y su existencia se alimenta con las entradas del Kardex, garantizando la trazabilidad',
      'La portada acepta imágenes JPG, PNG o WebP de máximo 2 MB',
      'El ISBN no puede repetirse: si ya existe, el sistema muestra un mensaje claro',
      'Al crear exitosamente, el libro aparece en la tabla sin recargar la página'
    ]
  },
  {
    id: 'HU-12',
    titulo: 'Editar un libro existente',
    modulo: 'Inventario',
    criterios: [
      'Solo el Administrador ve el botón de editar en cada libro',
      'Al hacer clic, se abre el formulario con los datos actuales del libro',
      'Se pueden modificar todos los campos, incluida la imagen de portada (la anterior se elimina del servidor)',
      'El stock actual no se modifica desde aquí: solo cambia por movimientos, ventas o anulaciones',
      'Al guardar, los cambios se reflejan en la tabla inmediatamente'
    ]
  },
  {
    id: 'HU-13',
    titulo: 'Eliminar un libro',
    modulo: 'Inventario',
    criterios: [
      'Solo el Administrador ve el botón de eliminar',
      'Se muestra una confirmación antes de eliminar',
      'Al eliminar, el libro y su imagen de portada se borran del servidor',
      'No se puede eliminar un libro que tenga ventas o movimientos registrados: el sistema lo impide para proteger el historial',
      'El libro desaparece de la tabla sin recargar la página'
    ]
  },

  // ── MOVIMIENTOS ──
  {
    id: 'HU-14',
    titulo: 'Registrar entrada de inventario',
    modulo: 'Movimientos',
    criterios: [
      'Se selecciona el tipo "ENTRADA"',
      'Se debe elegir el libro, la cantidad, el proveedor y el costo de compra',
      'El proveedor y el costo son obligatorios para las entradas',
      'Al registrar, el stock del libro se actualiza automáticamente',
      'El movimiento aparece en el panel de últimos movimientos'
    ]
  },
  {
    id: 'HU-15',
    titulo: 'Registrar salida de inventario',
    modulo: 'Movimientos',
    criterios: [
      'Se selecciona el tipo "SALIDA"',
      'Se debe elegir el libro y la cantidad a descontar',
      'No se puede sacar más libros de los que hay en stock',
      'Al registrar, el stock del libro se actualiza automáticamente'
    ]
  },
  {
    id: 'HU-16',
    titulo: 'Ver historial de movimientos',
    modulo: 'Movimientos',
    criterios: [
      'Se muestra una tabla con todos los movimientos registrados',
      'Cada movimiento muestra: libro, tipo, cantidad, stock anterior, stock nuevo, proveedor, costo, usuario y fecha',
      'El panel se actualiza automáticamente cuando se registra un nuevo movimiento'
    ]
  },

  // ── VENTAS ──
  {
    id: 'HU-17',
    titulo: 'Registrar una venta',
    modulo: 'Ventas',
    criterios: [
      'Se puede buscar y seleccionar un cliente',
      'Se pueden agregar varios libros al carrito buscándolos en el catálogo',
      'Se puede aumentar o disminuir la cantidad de cada libro en el carrito',
      'No se permite agregar más unidades de las que hay en existencia',
      'Se puede eliminar un libro del carrito',
      'Se debe elegir un método de pago (Efectivo, Tarjeta, Transferencia o Mixto)',
      'Al confirmar la venta, el stock de cada libro se descuenta automáticamente',
      'El servidor recalcula y valida el total (no confía en el navegador) y ejecuta todo en una transacción'
    ]
  },
  {
    id: 'HU-18',
    titulo: 'Aplicar descuento a una venta',
    modulo: 'Ventas',
    criterios: [
      'En la sección de facturación del punto de venta hay un campo para ingresar el porcentaje de descuento (0 % a 100 %)',
      'Al cambiar el porcentaje, se muestra automáticamente el subtotal, el monto del descuento y el total final',
      'El descuento no puede ser negativo ni mayor al 100 %',
      'El servidor valida que el descuento no sea mayor al subtotal y recalcula el total por seguridad',
      'El descuento se guarda en la base de datos y se muestra en el historial de ventas y en el ticket PDF'
    ]
  },
  {
    id: 'HU-19',
    titulo: 'Ver historial de ventas',
    modulo: 'Ventas',
    criterios: [
      'Se muestra una tabla con todas las ventas realizadas',
      'Cada venta tiene un estado visual: Completada (verde) o Anulada (rojo)',
      'La tabla tiene paginación en el servidor de 10 registros por página',
      'Se puede ver el detalle de cada venta con todos sus productos'
    ]
  },
  {
    id: 'HU-20',
    titulo: 'Filtrar ventas por fecha y buscar por cliente',
    modulo: 'Ventas',
    criterios: [
      'Hay campos de fecha "desde" y "hasta" para filtrar por rango',
      'Hay un campo de búsqueda para buscar por nombre de cliente',
      'La búsqueda espera a que el usuario termine de escribir antes de consultar al servidor',
      'Los filtros se aplican sin recargar la página y se pueden combinar (fecha + cliente)'
    ]
  },
  {
    id: 'HU-21',
    titulo: 'Anular una venta',
    modulo: 'Ventas',
    criterios: [
      'Solo el Administrador ve el botón de anular',
      'Se muestra una confirmación antes de anular',
      'Al anular, el stock de cada libro de la venta se devuelve automáticamente',
      'La reversión queda registrada en el Kardex con la observación de la venta anulada (trazabilidad)',
      'La venta no se borra: cambia su estado visual a "Anulada"',
      'Una venta ya anulada no se puede anular de nuevo'
    ]
  },
  {
    id: 'HU-22',
    titulo: 'Descargar ticket de venta en PDF',
    modulo: 'Ventas',
    criterios: [
      'Hay un botón de PDF en cada venta del historial',
      'El PDF se genera en el navegador con formato de ticket de punto de venta (80 mm)',
      'El ticket incluye los datos de la venta: cliente, productos, cantidades, precios, descuento y total',
      'El archivo se descarga automáticamente al hacer clic'
    ]
  },
  {
    id: 'HU-23',
    titulo: 'Exportar ventas a Excel',
    modulo: 'Ventas',
    criterios: [
      'Hay un botón de "Exportar a Excel" en el historial de ventas',
      'Se exporta la vista filtrada actual (respetando los filtros aplicados)',
      'El archivo se descarga en formato .xlsx',
      'El archivo incluye las columnas visibles en la tabla'
    ]
  },

  // ── CLIENTES ──
  {
    id: 'HU-24',
    titulo: 'Ver lista de clientes',
    modulo: 'Clientes',
    criterios: [
      'Se muestra una tabla paginada con todos los clientes registrados (5 por página)',
      'La tabla muestra: documento, nombre completo, teléfono, correo y dirección',
      'La tabla se adapta a celulares ocultando las columnas menos importantes'
    ]
  },
  {
    id: 'HU-25',
    titulo: 'Buscar clientes',
    modulo: 'Clientes',
    criterios: [
      'Hay un campo de búsqueda en la parte superior',
      'Se puede buscar por nombre o número de documento',
      'La búsqueda filtra la tabla instantáneamente sin petición al servidor',
      'Si no hay resultados, se muestra un mensaje'
    ]
  },
  {
    id: 'HU-26',
    titulo: 'Crear un cliente nuevo',
    modulo: 'Clientes',
    criterios: [
      'Tanto el Administrador como el Vendedor pueden crear clientes',
      'Se piden los campos: documento, nombre completo, teléfono, correo y dirección',
      'El documento y el nombre completo son obligatorios',
      'El número de documento debe ser único (no se puede repetir); admite cédula o NIT',
      'Al crear exitosamente, el cliente aparece en la tabla y queda disponible en el punto de venta'
    ]
  },
  {
    id: 'HU-27',
    titulo: 'Editar un cliente',
    modulo: 'Clientes',
    criterios: [
      'Solo el Administrador ve el botón de editar',
      'Se abre un formulario con los datos actuales del cliente',
      'Se pueden modificar todos los campos',
      'Los cambios se guardan y se reflejan en la tabla'
    ]
  },
  {
    id: 'HU-28',
    titulo: 'Eliminar un cliente',
    modulo: 'Clientes',
    criterios: [
      'Solo el Administrador ve el botón de eliminar',
      'Se muestra una confirmación antes de eliminar',
      'El cliente se elimina de la base de datos y desaparece de la tabla',
      'No se puede eliminar un cliente que tenga ventas registradas: el sistema lo impide para proteger el historial de facturación'
    ]
  },

  // ── PROVEEDORES ──
  {
    id: 'HU-29',
    titulo: 'Gestionar proveedores',
    modulo: 'Proveedores',
    criterios: [
      'Solo el Administrador puede acceder a este módulo',
      'Se puede crear un proveedor con: empresa, NIT, contacto, email, teléfono y dirección',
      'Se puede editar la información de un proveedor existente',
      'Se puede eliminar un proveedor que no tenga movimientos de inventario asociados',
      'Si el proveedor tiene movimientos registrados, el sistema muestra un mensaje de error y no permite la eliminación',
      'Las columnas se ocultan progresivamente en pantallas pequeñas'
    ]
  },

  // ── AUTORES ──
  {
    id: 'HU-30',
    titulo: 'Gestionar autores',
    modulo: 'Autores',
    criterios: [
      'Todos los usuarios pueden ver la lista de autores',
      'Solo el Administrador puede crear, editar o eliminar autores',
      'Cada autor tiene: nombre',
      'No se puede eliminar un autor que tiene libros asociados',
      'Si se intenta eliminar un autor con libros, se muestra un mensaje de error'
    ]
  },

  // ── CATEGORÍAS ──
  {
    id: 'HU-31',
    titulo: 'Gestionar categorías',
    modulo: 'Categorías',
    criterios: [
      'Todos los usuarios pueden ver la lista de categorías',
      'Solo el Administrador puede crear, editar o eliminar categorías',
      'Cada categoría tiene: nombre',
      'No se puede eliminar una categoría que tiene libros asociados',
      'Si se intenta eliminar una categoría con libros, se muestra un mensaje de error'
    ]
  },

  // ── USUARIOS ──
  {
    id: 'HU-32',
    titulo: 'Ver lista de usuarios del sistema',
    modulo: 'Usuarios',
    criterios: [
      'Solo el Administrador puede acceder a esta sección',
      'Se muestra una tabla con: nombre completo, email, rol (con badge), estado y último acceso',
      'El estado se muestra visualmente (activo/inactivo)'
    ]
  },
  {
    id: 'HU-33',
    titulo: 'Crear un usuario nuevo',
    modulo: 'Usuarios',
    criterios: [
      'Solo el Administrador puede crear usuarios',
      'Se piden: nombre completo, email, contraseña (mínimo 8 caracteres) y rol',
      'El email debe ser único en el sistema',
      'Al crear, el usuario aparece en la tabla con estado activo'
    ]
  },
  {
    id: 'HU-34',
    titulo: 'Editar un usuario',
    modulo: 'Usuarios',
    criterios: [
      'Solo el Administrador puede editar usuarios',
      'Se puede cambiar: nombre, email y rol',
      'La contraseña no se puede cambiar desde aquí (cada usuario cambia la suya)',
      'Los cambios se reflejan en la tabla inmediatamente'
    ]
  },
  {
    id: 'HU-35',
    titulo: 'Activar o desactivar un usuario',
    modulo: 'Usuarios',
    criterios: [
      'Solo el Administrador puede activar o desactivar usuarios',
      'Un usuario inactivo no puede iniciar sesión',
      'El Administrador no puede desactivarse a sí mismo',
      'El cambio de estado se refleja visualmente en la tabla'
    ]
  }
];

// -- Mapa de colores Bootstrap para cada módulo --
// Esto permite asignar un color de badge distinto a cada sección,
// facilitando la identificación visual. Las clases (primary, success, etc.)
// son clases de Bootstrap 5 para colores de fondo (bg-*).
const colorModulo = {
  'Autenticación': 'dark',
  'Dashboard': 'primary',
  'Inventario': 'success',
  'Movimientos': 'secondary',
  'Ventas': 'danger',
  'Clientes': 'info',
  'Proveedores': 'warning',
  'Autores': 'primary',
  'Categorías': 'success',
  'Usuarios': 'dark'
};

// =====================================================
// COMPONENTE: DocumentacionCriterios
// =====================================================
const DocumentacionCriterios = () => {

  // -- Agrupar criterios por módulo usando reduce() --
  // Array.reduce() es un método funcional que recorre un array y va
  // "acumulando" un resultado. Aquí, transforma el array plano de criterios
  // en un objeto agrupado por módulo:
  //
  // ANTES (array plano):
  //   [ {modulo:'Ventas', ...}, {modulo:'Ventas', ...}, {modulo:'Clientes', ...} ]
  //
  // DESPUÉS (objeto agrupado):
  //   { 'Ventas': [{...}, {...}], 'Clientes': [{...}] }
  //
  // Parámetros de reduce:
  //   - acc (acumulador): el objeto que se va construyendo
  //   - c (current): el elemento actual del array
  //   - {} : valor inicial del acumulador (objeto vacío)
  //
  // (acc[c.modulo] ||= []) es el operador de asignación lógica OR:
  // si acc[c.modulo] no existe (undefined/null), le asigna un array vacío.
  // Luego .push(c) agrega el criterio al array de ese módulo.
  const modulos = criterios.reduce((acc, c) => {
    (acc[c.modulo] ||= []).push(c);
    return acc;
  }, {});

  // -- Contar total de criterios individuales --
  // Otro uso de reduce(): suma la cantidad de criterios de todas las HU.
  // acc empieza en 0 y va sumando c.criterios.length de cada historia.
  const totalCriterios = criterios.reduce((acc, c) => acc + c.criterios.length, 0);

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-primary">Criterios de Aceptación</h2>
        <p className="text-muted">
          Los criterios de aceptación son las condiciones que se deben cumplir para que cada
          funcionalidad se considere terminada y funcionando bien. Están asociados a cada historia de usuario.
        </p>
        <div className="alert alert-light border">
          <strong>Total:</strong> {criterios.length} historias con criterios &nbsp;|&nbsp;
          <strong>Total de criterios:</strong> {totalCriterios}
        </div>
      </div>

      {/* Object.entries() convierte el objeto "módulos" en un array de pares
          [clave, valor], es decir: [['Autenticación', [...]], ['Dashboard', [...]], ...]
          Esto permite usar .map() para iterar, ya que .map() no funciona en objetos.
          Desestructuramos cada par como [modulo, lista] directamente en los parámetros. */}
      {Object.entries(modulos).map(([modulo, lista]) => (
        <div key={modulo} className="mb-5">
          <h4 className="fw-bold border-bottom pb-2 mb-3">
            {/* Template literal: `bg-${expresión}` permite construir nombres
                de clase CSS dinámicamente. Si colorModulo[modulo] es undefined,
                el operador || usa 'secondary' como fallback (color por defecto). */}
            <span className={`badge bg-${colorModulo[modulo] || 'secondary'} me-2`}>{modulo}</span>
          </h4>

          {/* Segundo nivel de .map(): por cada módulo, iteramos sus historias */}
          {lista.map(item => (
            <div key={item.id} className="card mb-3 shadow-sm">
              <div className="card-header bg-light">
                <span className="badge bg-secondary me-2">{item.id}</span>
                <strong>{item.titulo}</strong>
              </div>
              <div className="card-body">
                <p className="text-muted small mb-2">Criterios de aceptación:</p>
                {/* <ol> = lista ordenada (numerada). Usamos índice "i" como key
                    porque estos items son estáticos y nunca cambian de orden.
                    En listas dinámicas (que cambian), usar índice como key
                    es una mala práctica porque confunde el reconciliador de React. */}
                <ol className="mb-0">
                  {item.criterios.map((criterio, i) => (
                    <li key={i} className="mb-1">{criterio}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DocumentacionCriterios;
