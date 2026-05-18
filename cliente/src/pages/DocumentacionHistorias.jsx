// =====================================================
// PÁGINA: Historias de Usuario (Documentación SENA)
// =====================================================
// En la metodología ágil (Scrum), las Historias de Usuario (HU) describen
// funcionalidades del sistema desde la perspectiva del usuario final.
// Siguen el formato estándar:
//   "COMO [rol], QUIERO [acción], PARA [beneficio]"
//
// Este formato responde tres preguntas fundamentales:
//   - QUIÉN necesita la funcionalidad (rol/actor)
//   - QUÉ necesita hacer (la acción concreta)
//   - POR QUÉ lo necesita (el valor de negocio)
//
// Cada HU tiene además una prioridad (Alta, Media, Baja) que define
// el orden de desarrollo en el Sprint Backlog del proyecto.
//
// Este componente se carga con lazy() desde Acceso.jsx, así que solo
// se descarga cuando el usuario abre el modal de documentación.
//
// Conceptos aplicados:
//   - Datos estáticos fuera del componente (optimización de renders)
//   - reduce() para agrupar array plano en objeto por módulo
//   - Object.entries() + .map() para iterar objetos en JSX
//   - Template literals para clases CSS dinámicas
// =====================================================

// -- Array de Historias de Usuario del proyecto --
// Definido fuera del componente porque son datos ESTÁTICOS que no cambian.
// Si estuvieran dentro, React los recrearía en cada render (innecesario).
const historias = [
  // ── MÓDULO: AUTENTICACIÓN ──
  {
    id: 'HU-01',
    titulo: 'Iniciar sesión en el sistema',
    como: 'Usuario (Administrador o Vendedor)',
    quiero: 'iniciar sesión con mi correo y contraseña',
    para: 'acceder a las funcionalidades del sistema según mi rol',
    prioridad: 'Alta',
    modulo: 'Autenticación'
  },
  {
    id: 'HU-02',
    titulo: 'Bloqueo de cuenta por intentos fallidos',
    como: 'Sistema',
    quiero: 'bloquear la cuenta después de 3 intentos fallidos de login',
    para: 'proteger las cuentas de accesos no autorizados',
    prioridad: 'Alta',
    modulo: 'Autenticación'
  },
  {
    id: 'HU-03',
    titulo: 'Cerrar sesión',
    como: 'Usuario autenticado',
    quiero: 'cerrar mi sesión desde la barra de navegación',
    para: 'proteger mi cuenta cuando deje de usar el sistema',
    prioridad: 'Alta',
    modulo: 'Autenticación'
  },
  {
    id: 'HU-04',
    titulo: 'Cambiar mi contraseña',
    como: 'Usuario autenticado',
    quiero: 'cambiar mi contraseña desde un modal en la barra de navegación',
    para: 'mantener la seguridad de mi cuenta',
    prioridad: 'Media',
    modulo: 'Autenticación'
  },

  // ── MÓDULO: DASHBOARD ──
  {
    id: 'HU-05',
    titulo: 'Ver el dashboard con estadísticas',
    como: 'Administrador',
    quiero: 'ver un panel con tarjetas de ventas del día, ventas de la semana, ventas del mes y alertas de stock; además de métricas secundarias de total de libros, valor del inventario y total de clientes',
    para: 'tener una visión rápida del estado del negocio',
    prioridad: 'Alta',
    modulo: 'Dashboard'
  },
  {
    id: 'HU-06',
    titulo: 'Ver gráficas de ventas y categorías',
    como: 'Administrador',
    quiero: 'ver una gráfica de área con ventas de los últimos 6 meses y una gráfica de dona con la distribución por categorías',
    para: 'analizar el comportamiento de las ventas y del catálogo',
    prioridad: 'Media',
    modulo: 'Dashboard'
  },
  {
    id: 'HU-07',
    titulo: 'Ver top de productos y clientes',
    como: 'Administrador',
    quiero: 'ver los 5 libros más vendidos y los 5 mejores clientes',
    para: 'saber cuáles son los productos más populares y los clientes más frecuentes',
    prioridad: 'Media',
    modulo: 'Dashboard'
  },
  {
    id: 'HU-08',
    titulo: 'Ver libros con stock bajo',
    como: 'Administrador',
    quiero: 'ver una tabla con los libros que tienen stock igual o menor al mínimo',
    para: 'saber cuáles libros necesito reabastecer',
    prioridad: 'Alta',
    modulo: 'Dashboard'
  },

  // ── MÓDULO: INVENTARIO ──
  {
    id: 'HU-09',
    titulo: 'Ver lista de libros del inventario',
    como: 'Usuario (Administrador o Vendedor)',
    quiero: 'ver todos los libros con su imagen, título, autor, categoría, precio y stock',
    para: 'conocer qué libros hay disponibles en la librería',
    prioridad: 'Alta',
    modulo: 'Inventario'
  },
  {
    id: 'HU-10',
    titulo: 'Buscar libros en el inventario',
    como: 'Usuario (Administrador o Vendedor)',
    quiero: 'buscar libros por título, autor o ISBN escribiendo en un campo de búsqueda',
    para: 'encontrar rápidamente un libro específico',
    prioridad: 'Alta',
    modulo: 'Inventario'
  },
  {
    id: 'HU-11',
    titulo: 'Crear un libro nuevo',
    como: 'Administrador',
    quiero: 'agregar un libro con su título, ISBN, autor, categoría, precio, stock y una imagen de portada',
    para: 'registrar nuevos libros en el inventario',
    prioridad: 'Alta',
    modulo: 'Inventario'
  },
  {
    id: 'HU-12',
    titulo: 'Editar un libro existente',
    como: 'Administrador',
    quiero: 'modificar los datos de un libro (título, precio, stock, portada, etc.)',
    para: 'corregir o actualizar la información de un libro',
    prioridad: 'Alta',
    modulo: 'Inventario'
  },
  {
    id: 'HU-13',
    titulo: 'Eliminar un libro',
    como: 'Administrador',
    quiero: 'eliminar un libro del inventario',
    para: 'quitar libros que ya no se venden',
    prioridad: 'Media',
    modulo: 'Inventario'
  },

  // ── MÓDULO: MOVIMIENTOS (KARDEX) ──
  {
    id: 'HU-14',
    titulo: 'Registrar entrada de inventario',
    como: 'Administrador',
    quiero: 'registrar una entrada de libros indicando el libro, la cantidad, el proveedor y el costo de compra',
    para: 'que el stock se actualice automáticamente cuando llegan libros nuevos',
    prioridad: 'Alta',
    modulo: 'Movimientos'
  },
  {
    id: 'HU-15',
    titulo: 'Registrar salida de inventario',
    como: 'Administrador',
    quiero: 'registrar una salida de libros indicando el libro y la cantidad',
    para: 'descontar del stock los libros que salieron por motivos diferentes a ventas',
    prioridad: 'Alta',
    modulo: 'Movimientos'
  },
  {
    id: 'HU-16',
    titulo: 'Ver historial de movimientos',
    como: 'Administrador',
    quiero: 'ver el historial con el libro, tipo (entrada/salida), cantidad, stock anterior, stock nuevo, proveedor, costo, usuario y fecha',
    para: 'tener un control detallado de todo lo que ha entrado y salido del inventario',
    prioridad: 'Alta',
    modulo: 'Movimientos'
  },

  // ── MÓDULO: VENTAS (POS) ──
  {
    id: 'HU-17',
    titulo: 'Registrar una venta',
    como: 'Usuario (Administrador o Vendedor)',
    quiero: 'buscar un cliente, agregar libros al carrito, elegir método de pago y confirmar la venta',
    para: 'registrar las ventas de la librería y descontar el stock automáticamente',
    prioridad: 'Alta',
    modulo: 'Ventas'
  },
  {
    id: 'HU-18',
    titulo: 'Aplicar descuento a una venta',
    como: 'Usuario (Administrador o Vendedor)',
    quiero: 'aplicar un descuento en porcentaje (0% a 100%) al total de la venta desde el punto de venta',
    para: 'ofrecer descuentos a los clientes y que el sistema calcule automáticamente el subtotal, descuento y total final',
    prioridad: 'Media',
    modulo: 'Ventas'
  },
  {
    id: 'HU-19',
    titulo: 'Ver historial de ventas',
    como: 'Usuario (Administrador o Vendedor)',
    quiero: 'ver todas las ventas realizadas con su estado (completada o anulada)',
    para: 'consultar las ventas anteriores',
    prioridad: 'Alta',
    modulo: 'Ventas'
  },
  {
    id: 'HU-20',
    titulo: 'Filtrar ventas por fecha y buscar por cliente',
    como: 'Usuario (Administrador o Vendedor)',
    quiero: 'filtrar las ventas por rango de fechas y buscar por nombre de cliente',
    para: 'encontrar rápidamente una venta específica',
    prioridad: 'Media',
    modulo: 'Ventas'
  },
  {
    id: 'HU-21',
    titulo: 'Anular una venta',
    como: 'Administrador',
    quiero: 'anular una venta, lo que devuelve los libros al inventario automáticamente',
    para: 'corregir ventas que se hicieron por error',
    prioridad: 'Alta',
    modulo: 'Ventas'
  },
  {
    id: 'HU-22',
    titulo: 'Descargar ticket de venta en PDF',
    como: 'Usuario (Administrador o Vendedor)',
    quiero: 'descargar un ticket de venta en formato PDF',
    para: 'entregarle un comprobante al cliente',
    prioridad: 'Media',
    modulo: 'Ventas'
  },
  {
    id: 'HU-23',
    titulo: 'Exportar ventas a Excel',
    como: 'Usuario (Administrador o Vendedor)',
    quiero: 'exportar la lista de ventas filtrada a un archivo de Excel',
    para: 'analizar los datos de ventas en una hoja de cálculo',
    prioridad: 'Baja',
    modulo: 'Ventas'
  },

  // ── MÓDULO: CLIENTES ──
  {
    id: 'HU-24',
    titulo: 'Ver lista de clientes',
    como: 'Usuario (Administrador o Vendedor)',
    quiero: 'ver todos los clientes registrados con su nombre, documento, teléfono y correo',
    para: 'consultar la información de los clientes',
    prioridad: 'Alta',
    modulo: 'Clientes'
  },
  {
    id: 'HU-25',
    titulo: 'Buscar clientes',
    como: 'Usuario (Administrador o Vendedor)',
    quiero: 'buscar clientes por nombre o documento',
    para: 'encontrar rápidamente un cliente',
    prioridad: 'Alta',
    modulo: 'Clientes'
  },
  {
    id: 'HU-26',
    titulo: 'Crear un cliente nuevo',
    como: 'Usuario (Administrador o Vendedor)',
    quiero: 'registrar un cliente con su nombre, tipo de documento (CC, NIT, CE, Pasaporte), documento, teléfono y correo',
    para: 'tener los datos del cliente para futuras ventas',
    prioridad: 'Alta',
    modulo: 'Clientes'
  },
  {
    id: 'HU-27',
    titulo: 'Editar un cliente',
    como: 'Administrador',
    quiero: 'modificar los datos de un cliente existente',
    para: 'corregir o actualizar la información del cliente',
    prioridad: 'Media',
    modulo: 'Clientes'
  },
  {
    id: 'HU-28',
    titulo: 'Eliminar un cliente',
    como: 'Administrador',
    quiero: 'eliminar un cliente del sistema',
    para: 'quitar clientes que ya no son necesarios',
    prioridad: 'Baja',
    modulo: 'Clientes'
  },

  // ── MÓDULO: PROVEEDORES ──
  {
    id: 'HU-29',
    titulo: 'Gestionar proveedores',
    como: 'Administrador',
    quiero: 'crear, editar y eliminar proveedores con sus datos (empresa, NIT, contacto, email, teléfono, dirección)',
    para: 'mantener actualizada la información de quienes nos venden libros',
    prioridad: 'Alta',
    modulo: 'Proveedores'
  },

  // ── MÓDULO: AUTORES ──
  {
    id: 'HU-30',
    titulo: 'Gestionar autores',
    como: 'Administrador',
    quiero: 'crear, editar y eliminar autores con su nombre',
    para: 'poder clasificar los libros por autor',
    prioridad: 'Media',
    modulo: 'Autores'
  },

  // ── MÓDULO: CATEGORÍAS ──
  {
    id: 'HU-31',
    titulo: 'Gestionar categorías',
    como: 'Administrador',
    quiero: 'crear, editar y eliminar categorías con su nombre',
    para: 'poder clasificar los libros por categoría',
    prioridad: 'Media',
    modulo: 'Categorías'
  },

  // ── MÓDULO: GESTIÓN DE USUARIOS ──
  {
    id: 'HU-32',
    titulo: 'Ver lista de usuarios del sistema',
    como: 'Administrador',
    quiero: 'ver todos los usuarios con su nombre, correo, rol, estado y último acceso',
    para: 'saber quienes tienen acceso al sistema',
    prioridad: 'Alta',
    modulo: 'Usuarios'
  },
  {
    id: 'HU-33',
    titulo: 'Crear un usuario nuevo',
    como: 'Administrador',
    quiero: 'crear un usuario con nombre, correo, contraseña y rol (Administrador o Vendedor)',
    para: 'dar acceso al sistema a nuevos empleados',
    prioridad: 'Alta',
    modulo: 'Usuarios'
  },
  {
    id: 'HU-34',
    titulo: 'Editar un usuario',
    como: 'Administrador',
    quiero: 'editar el nombre, correo y rol de un usuario existente',
    para: 'actualizar la información o cambiar el rol de un empleado',
    prioridad: 'Media',
    modulo: 'Usuarios'
  },
  {
    id: 'HU-35',
    titulo: 'Activar o desactivar un usuario',
    como: 'Administrador',
    quiero: 'activar o desactivar la cuenta de un usuario (sin poder desactivarme a mí mismo)',
    para: 'controlar quienes pueden acceder al sistema sin eliminar sus cuentas',
    prioridad: 'Alta',
    modulo: 'Usuarios'
  }
];

// -- Mapas de colores para badges --
// Estos objetos actúan como "lookup tables" (tablas de búsqueda):
// dado un nombre de prioridad o módulo, retornan la clase Bootstrap
// correspondiente. Es más limpio que usar múltiples if/else o switch.
const colorPrioridad = {
  'Alta': 'danger',    // Rojo: urgente, se desarrolla primero
  'Media': 'warning',  // Amarillo: importante pero no crítica
  'Baja': 'info'       // Azul claro: deseable, se hace al final
};

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
// COMPONENTE: DocumentacionHistorias
// =====================================================
const DocumentacionHistorias = () => {

  // -- Agrupar historias por módulo con reduce() --
  // Transforma el array plano en un objeto donde cada clave es un módulo
  // y el valor es un array de historias que pertenecen a ese módulo.
  // El operador ||= (asignación lógica OR) crea el array si no existe.
  // Ejemplo resultado: { 'Autenticación': [HU-01, HU-02, ...], 'Dashboard': [...] }
  const modulos = historias.reduce((acc, h) => {
    (acc[h.modulo] ||= []).push(h);
    return acc;
  }, {});

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-primary">Historias de Usuario</h2>
        <p className="text-muted">
          Estas son las funcionalidades del sistema descritas desde el punto de vista del usuario.
          Cada historia explica qué puede hacer cada tipo de usuario y para qué le sirve.
        </p>
        {/* Object.keys() retorna un array con las claves del objeto.
            .length nos da cuántos módulos únicos hay. */}
        <div className="alert alert-light border">
          <strong>Total:</strong> {historias.length} historias de usuario &nbsp;|&nbsp;
          <strong>Módulos:</strong> {Object.keys(modulos).length}
        </div>
      </div>

      {/* Object.entries() convierte el objeto en array de pares [clave, valor]
          para poder usar .map(). Desestructuramos como [modulo, lista]. */}
      {Object.entries(modulos).map(([modulo, lista]) => (
        <div key={modulo} className="mb-5">
          <h4 className="fw-bold border-bottom pb-2 mb-3">
            <span className={`badge bg-${colorModulo[modulo] || 'secondary'} me-2`}>{modulo}</span>
            <small className="text-muted fw-normal">({lista.length} historias)</small>
          </h4>

          {lista.map(h => (
            <div key={h.id} className="card mb-3 shadow-sm">
              {/* flex-wrap + gap-2: en móvil, el badge de prioridad baja
                  debajo del título en lugar de desbordarse */}
              <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <span className="badge bg-secondary me-2">{h.id}</span>
                  <strong>{h.titulo}</strong>
                </div>
                {/* Lookup en colorPrioridad: obtiene el color Bootstrap
                    según la prioridad de la historia */}
                <span className={`badge bg-${colorPrioridad[h.prioridad]}`}>
                  Prioridad: {h.prioridad}
                </span>
              </div>
              {/* Cuerpo de la card: formato estándar de HU (Como/Quiero/Para) */}
              <div className="card-body">
                <p className="mb-1"><strong>Como:</strong> {h.como}</p>
                <p className="mb-1"><strong>Quiero:</strong> {h.quiero}</p>
                <p className="mb-0"><strong>Para:</strong> {h.para}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DocumentacionHistorias;
