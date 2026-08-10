// =====================================================
// PAGINA: Manual Técnico (Documentación SENA)
// =====================================================
// El Manual Técnico es un documento obligatorio en proyectos SENA que
// describe la arquitectura interna del sistema. A diferencia del Manual
// de Usuario (que explica CÓMO usar el sistema), el Manual Técnico
// explica CÓMO está construido: tecnologías, estructura de carpetas,
// base de datos, API, seguridad y despliegue.
//
// Audiencia: desarrolladores, instructores técnicos y jurados SENA
// que necesitan entender las decisiones técnicas del proyecto.
//
// Este componente no tiene lógica (useState, useEffect, etc.) porque
// es contenido 100% estático. Es un componente "presentacional puro":
// solo retorna JSX con HTML y clases Bootstrap para dar formato.
// Se carga con lazy() desde Acceso.jsx (code splitting).
//
// Conceptos aplicados:
//   - Componente presentacional puro (sin estado ni efectos)
//   - Grid system de Bootstrap (row + col-md-4) para layouts responsivos
//   - Cards de Bootstrap para organizar contenido visualmente
//   - Template literals multilínea en JSX con {`texto`} dentro de <pre>
//   - Etiqueta <code> para resaltar nombres técnicos inline
//   - Etiqueta <pre> para bloques de código con formato preservado
// =====================================================

// =====================================================
// COMPONENTE: DocumentacionManualTecnico
// =====================================================
// Al no tener imports de React ni hooks, este archivo demuestra que
// en React 19 + Vite solo necesitamos escribir JSX y exportar.
// El JSX transform de Vite se encarga de compilar el JSX a JavaScript.

const DocumentacionManualTecnico = () => {
  return (
    <div className="container py-4">
      <h2 className="fw-bold text-primary mb-1">Manual Técnico</h2>
      <p className="text-muted mb-4">
        Este manual explica cómo está construido el sistema por dentro: qué tecnologías usamos,
        cómo está organizado el código y cómo funciona cada parte.
      </p>

      {/* -- SECCIÓN 1: DESCRIPCIÓN GENERAL --
          Cada sección usa el componente Card de Bootstrap 5:
          - card: contenedor con bordes y sombra
          - card-header: encabezado coloreado (bg-primary = azul)
          - card-body: contenido con padding interno
          shadow-sm: sombra sutil para dar profundidad visual */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white fw-bold">
          1. Descripción general del sistema
        </div>
        <div className="card-body">
          <p>
            El <strong>SGI Librería El Saber</strong> es una aplicación web que sirve para gestionar
            el inventario, las ventas, los clientes y los proveedores de una librería.
          </p>
          <p>
            El sistema tiene dos tipos de usuarios:
          </p>
          <ul>
            <li><strong>Administrador:</strong> puede hacer todo (gestionar inventario, usuarios, ver estadísticas, anular ventas, etc.)</li>
            <li><strong>Vendedor:</strong> puede registrar ventas, ver el inventario y gestionar clientes</li>
          </ul>
          <p className="mb-0">
            La aplicación funciona desde el navegador (Chrome, Firefox, Edge, etc.) y se adapta
            a celulares, tablets y computadores.
          </p>
        </div>
      </div>

      {/* -- SECCIÓN 2: ARQUITECTURA --
          Aquí usamos el Grid System de Bootstrap para mostrar 3 cards
          lado a lado. El sistema de grilla divide la pantalla en 12 columnas:
          - col-md-4 = cada card ocupa 4 de 12 columnas (1/3 del ancho)
          - En pantallas menores a "md" (768px), las cards se apilan verticalmente
          - row: contenedor flex que alinea las columnas
          - g-3: gap (espacio) de 1rem entre las cards
          - h-100: hace que todas las cards tengan la misma altura */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white fw-bold">
          2. Arquitectura del sistema (cómo está dividido)
        </div>
        <div className="card-body">
          <p>El proyecto tiene 3 partes principales que trabajan juntas:</p>

          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <div className="card h-100 border-success">
                <div className="card-body text-center">
                  <h5 className="text-success fw-bold">Frontend</h5>
                  <p className="small mb-1">Carpeta: <code>cliente/</code></p>
                  <p className="small mb-0">Es lo que el usuario ve y toca en el navegador: botones, formularios, tablas, gráficas.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-warning">
                <div className="card-body text-center">
                  <h5 className="text-warning fw-bold">Backend</h5>
                  <p className="small mb-1">Carpeta: <code>servidor/</code></p>
                  <p className="small mb-0">Es la lógica del negocio. Recibe peticiones del frontend, las procesa y responde con datos.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-info">
                <div className="card-body text-center">
                  <h5 className="text-info fw-bold">Base de Datos</h5>
                  <p className="small mb-1">MySQL</p>
                  <p className="small mb-0">Donde se guarda toda la información de forma permanente: libros, ventas, usuarios, etc.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="alert alert-light border">
            <strong>Flujo básico:</strong> El usuario hace clic en un botón (Frontend) &rarr;
            Se envía una petición al servidor (Backend) &rarr; El servidor consulta o guarda datos
            en la base de datos (MySQL) &rarr; El servidor responde &rarr; El frontend muestra el resultado.
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 3: TECNOLOGÍAS ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white fw-bold">
          3. Tecnologías utilizadas
        </div>
        <div className="card-body">
          <h6 className="fw-bold mt-2 mb-2">Frontend (lo que ve el usuario)</h6>
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Tecnología</th>
                  <th>Para qué la usamos</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>React</strong></td><td>Para crear la interfaz del usuario (botones, formularios, tablas)</td></tr>
                <tr><td><strong>Vite</strong></td><td>Para que el proyecto cargue rápido mientras desarrollamos</td></tr>
                <tr><td><strong>Bootstrap 5</strong></td><td>Para que el diseño se vea bien y funcione en celulares</td></tr>
                <tr><td><strong>React Router</strong></td><td>Para navegar entre páginas sin recargar toda la app</td></tr>
                <tr><td><strong>Axios</strong></td><td>Para enviar y recibir datos del servidor</td></tr>
                <tr><td><strong>react-hook-form</strong></td><td>Para manejar formularios y validar los campos</td></tr>
                <tr><td><strong>Recharts</strong></td><td>Para crear las gráficas del Dashboard</td></tr>
                <tr><td><strong>jsPDF</strong></td><td>Para generar tickets de venta en PDF</td></tr>
                <tr><td><strong>xlsx</strong></td><td>Para exportar datos a archivos de Excel</td></tr>
              </tbody>
            </table>
          </div>

          <h6 className="fw-bold mt-3 mb-2">Backend (la lógica del servidor)</h6>
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Tecnología</th>
                  <th>Para qué la usamos</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>Node.js</strong></td><td>Motor que permite correr JavaScript en el servidor</td></tr>
                <tr><td><strong>Express 5</strong></td><td>Framework para crear las rutas de la API y manejar peticiones</td></tr>
                <tr><td><strong>MySQL 8</strong></td><td>Base de datos donde se guarda toda la información</td></tr>
                <tr><td><strong>JWT</strong></td><td>Para manejar sesiones de forma segura con tokens</td></tr>
                <tr><td><strong>bcryptjs</strong></td><td>Para guardar las contraseñas encriptadas</td></tr>
                <tr><td><strong>Multer + Cloudinary</strong></td><td>Para subir imágenes de portada: Multer recibe el archivo y Cloudinary lo almacena en la nube</td></tr>
                <tr><td><strong>Helmet</strong></td><td>Para aplicar cabeceras de seguridad HTTP automáticamente (CSP, HSTS, X-Frame-Options, etc.)</td></tr>
                <tr><td><strong>morgan</strong></td><td>Para ver en la consola qué peticiones llegan al servidor</td></tr>
                <tr><td><strong>compression</strong></td><td>Para comprimir las respuestas y que cargue más rápido</td></tr>
                <tr><td><strong>Jest + Supertest</strong></td><td>Para hacer pruebas automatizadas</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* -- SECCIÓN 4: ESTRUCTURA DE CARPETAS --
          Usamos la etiqueta <pre> (preformateado) para mostrar texto con
          formato fijo (monoespaciado). Dentro, usamos un template literal
          multilínea con {`texto`}. Las backticks (`) permiten escribir
          texto en varias líneas y preservar los saltos de línea y espacios.
          style={{ overflowX: 'auto' }} agrega scroll horizontal si el
          contenido es más ancho que la pantalla (importante en móviles). */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white fw-bold">
          4. Estructura de carpetas del proyecto
        </div>
        <div className="card-body">
          <pre className="bg-light p-3 rounded small" style={{ overflowX: 'auto' }}>
{`proyecto-inventario/
|
|-- cliente/                    (Frontend - React)
|   |-- src/
|   |   |-- main.jsx            (Punto de entrada de React)
|   |   |-- index.css           (Estilos base de la aplicación)
|   |   |-- App.jsx             (Componente raíz con las rutas)
|   |   |
|   |   |-- pages/              (Páginas de la aplicación)
|   |   |   |-- Acceso.jsx            Login
|   |   |   |-- Inicio.jsx            Dashboard
|   |   |   |-- Inventario.jsx        Lista de libros
|   |   |   |-- Movimientos.jsx       Entradas y salidas
|   |   |   |-- PaginaVentas.jsx      Punto de venta
|   |   |   |-- HistorialVentas.jsx   Historial de ventas
|   |   |   |-- PaginaClientes.jsx    Clientes
|   |   |   |-- AdminUsuarios.jsx     Gestión de usuarios
|   |   |   |-- PaginaProveedores.jsx Proveedores
|   |   |   |-- PaginaAutores.jsx     Autores
|   |   |   |-- PaginaCategorias.jsx  Categorías
|   |   |   |-- DocumentacionHistorias.jsx      Historias de usuario
|   |   |   |-- DocumentacionCriterios.jsx      Criterios de aceptación
|   |   |   |-- DocumentacionManualTecnico.jsx  Manual técnico
|   |   |   |-- DocumentacionManualUsuario.jsx  Manual de usuario
|   |   |
|   |   |-- components/         (Componentes reutilizables)
|   |   |   |-- BarraNavegacion.jsx
|   |   |   |-- ModalCambiarPassword.jsx
|   |   |   |-- RutaProtegida.jsx
|   |   |   |-- RutaProtegidaPorRol.jsx
|   |   |   |-- LayoutPrincipal.jsx
|   |   |
|   |   |-- context/AuthContext.jsx   (Manejo de sesión y permisos)
|   |   |-- services/api.js           (Conexión con el servidor)
|   |   |-- hooks/usePaginacion.js    (Lógica de paginación)
|   |   |-- styles/custom-theme.css   (Estilos personalizados)
|
|-- servidor/                   (Backend - Node.js + Express)
|   |-- controllers/            (Lógica de cada módulo)
|   |-- routes/                 (Rutas de la API)
|   |-- middlewares/            (Seguridad: JWT, roles, etc.)
|   |-- config/db.js            (Conexión a MySQL)
|   |-- utils/paginacion.js     (Utilidad para paginar resultados)
|   |-- pruebas/                (Tests automatizados)
|   |-- scripts/                (Scripts auxiliares de mantenimiento)
|   |-- uploads/portadas/       (Imágenes de libros)
|   |-- app.js                  (Configuración del servidor)
|   |-- index.js                (Archivo que arranca todo)
|   |-- pm2.config.js           (Configuración de PM2 para producción)
|
|-- base_datos/
    |-- sgi_libreria_completo.sql   (Script para crear la BD)`}
          </pre>
        </div>
      </div>

      {/* ── SECCIÓN 5: BASE DE DATOS ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white fw-bold">
          5. Base de datos
        </div>
        <div className="card-body">
          <p>
            Usamos <strong>MySQL 8</strong> con motor <strong>InnoDB</strong> (que soporta transacciones).
            La base de datos se llama <code>inventario_libreria</code> y tiene 10 tablas.
            Todas las tablas empiezan con el prefijo <code>mdc_</code>.
          </p>

          <h6 className="fw-bold mt-3">Tablas del sistema</h6>
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Tabla</th>
                  <th>Qué guarda</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>mdc_roles</code></td><td>Roles: Administrador (1) y Vendedor (2)</td></tr>
                <tr><td><code>mdc_usuarios</code></td><td>Cuentas de empleados (nombre, email, contraseña encriptada, estado)</td></tr>
                <tr><td><code>mdc_libros</code></td><td>Libros con ISBN, precio, stock actual, stock mínimo y portada</td></tr>
                <tr><td><code>mdc_autores</code></td><td>Autores con nombre</td></tr>
                <tr><td><code>mdc_categorias</code></td><td>Categorías con nombre único</td></tr>
                <tr><td><code>mdc_movimientos</code></td><td>Historial de entradas y salidas de inventario</td></tr>
                <tr><td><code>mdc_clientes</code></td><td>Datos de los clientes</td></tr>
                <tr><td><code>mdc_proveedores</code></td><td>Datos de los proveedores</td></tr>
                <tr><td><code>mdc_ventas</code></td><td>Las ventas realizadas (cabecera)</td></tr>
                <tr><td><code>mdc_detalle_ventas</code></td><td>Los libros vendidos en cada venta (detalle)</td></tr>
              </tbody>
            </table>
          </div>

          <h6 className="fw-bold mt-3">Relaciones entre tablas</h6>
          <pre className="bg-light p-3 rounded small">
{`mdc_roles --------> mdc_usuarios ---------> mdc_movimientos
                                 |---------> mdc_ventas

mdc_autores ------> mdc_libros ------------> mdc_movimientos
mdc_categorias ---> mdc_libros ------------> mdc_detalle_ventas

mdc_clientes -----> mdc_ventas ------------> mdc_detalle_ventas
mdc_proveedores --> mdc_movimientos`}
          </pre>

          <p className="mb-0">
            La base de datos está normalizada en <strong>Tercera Forma Normal (3NF)</strong>,
            lo que significa que la información no se repite innecesariamente y está bien organizada.
          </p>
        </div>
      </div>

      {/* -- SECCIÓN 6: API REST --
          REST (Representational State Transfer) es un estilo de arquitectura
          para comunicar sistemas a través de HTTP. Los 5 métodos principales:
            GET    = Obtener datos (lectura)
            POST   = Crear un recurso nuevo
            PUT    = Actualizar un recurso completo
            PATCH  = Actualizar parcialmente un recurso
            DELETE = Eliminar un recurso
          Cada endpoint combina un método HTTP + una URL + permisos requeridos. */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white fw-bold">
          6. API REST (cómo se comunica el frontend con el backend)
        </div>
        <div className="card-body">
          <p>
            El frontend y el backend se comunican a través de una <strong>API REST</strong>.
            Esto significa que el frontend envía peticiones HTTP (GET, POST, PUT, DELETE) a
            URLs específicas del servidor, y el servidor responde con datos en formato JSON.
          </p>

          <h6 className="fw-bold mt-3">Principales endpoints (rutas del servidor)</h6>
          <div className="table-responsive">
            <table className="table table-bordered table-sm small">
              <thead className="table-light">
                <tr>
                  <th>Método</th>
                  <th>Ruta</th>
                  <th>Qué hace</th>
                  <th>Quién puede</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><span className="badge bg-success">POST</span></td><td>/api/auth/login</td><td>Iniciar sesión</td><td>Cualquiera</td></tr>
                <tr><td><span className="badge bg-primary">GET</span></td><td>/api/libros</td><td>Ver todos los libros</td><td>Autenticado</td></tr>
                <tr><td><span className="badge bg-success">POST</span></td><td>/api/libros</td><td>Crear un libro</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-warning text-dark">PUT</span></td><td>/api/libros/:id</td><td>Editar un libro</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-danger">DELETE</span></td><td>/api/libros/:id</td><td>Eliminar un libro</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-primary">GET</span></td><td>/api/movimientos</td><td>Ver movimientos</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-success">POST</span></td><td>/api/movimientos</td><td>Registrar movimiento</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-primary">GET</span></td><td>/api/ventas</td><td>Ver ventas</td><td>Autenticado</td></tr>
                <tr><td><span className="badge bg-success">POST</span></td><td>/api/ventas</td><td>Crear una venta</td><td>Autenticado</td></tr>
                <tr><td><span className="badge bg-info text-dark">PATCH</span></td><td>/api/ventas/:id/anular</td><td>Anular venta</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-primary">GET</span></td><td>/api/clientes</td><td>Ver clientes</td><td>Autenticado</td></tr>
                <tr><td><span className="badge bg-success">POST</span></td><td>/api/clientes</td><td>Crear cliente</td><td>Autenticado</td></tr>
                <tr><td><span className="badge bg-warning text-dark">PUT</span></td><td>/api/clientes/:id</td><td>Editar cliente</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-danger">DELETE</span></td><td>/api/clientes/:id</td><td>Eliminar cliente</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-primary">GET</span></td><td>/api/dashboard</td><td>Ver estadísticas</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-primary">GET</span></td><td>/api/usuarios</td><td>Ver usuarios</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-success">POST</span></td><td>/api/usuarios</td><td>Crear usuario</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-warning text-dark">PUT</span></td><td>/api/usuarios/:id</td><td>Editar usuario</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-info text-dark">PATCH</span></td><td>/api/usuarios/:id/estado</td><td>Activar/desactivar usuario</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-primary">GET</span></td><td>/api/proveedores</td><td>Ver proveedores</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-success">POST</span></td><td>/api/proveedores</td><td>Crear proveedor</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-warning text-dark">PUT</span></td><td>/api/proveedores/:id</td><td>Editar proveedor</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-danger">DELETE</span></td><td>/api/proveedores/:id</td><td>Eliminar proveedor</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-primary">GET</span></td><td>/api/autores</td><td>Ver autores</td><td>Autenticado</td></tr>
                <tr><td><span className="badge bg-success">POST</span></td><td>/api/autores</td><td>Crear autor</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-warning text-dark">PUT</span></td><td>/api/autores/:id</td><td>Editar autor</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-danger">DELETE</span></td><td>/api/autores/:id</td><td>Eliminar autor</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-primary">GET</span></td><td>/api/categorias</td><td>Ver categorías</td><td>Autenticado</td></tr>
                <tr><td><span className="badge bg-success">POST</span></td><td>/api/categorias</td><td>Crear categoría</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-warning text-dark">PUT</span></td><td>/api/categorias/:id</td><td>Editar categoría</td><td>Admin</td></tr>
                <tr><td><span className="badge bg-danger">DELETE</span></td><td>/api/categorias/:id</td><td>Eliminar categoría</td><td>Admin</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* -- SECCIÓN 7: SEGURIDAD --
          La seguridad se implementa en CAPAS (defense in depth):
          1. Frontend: validación de formularios (UX, no seguridad real)
          2. Red: CORS limita qué dominios pueden hacer peticiones
          3. Rate limiting: limita peticiones por IP (anti fuerza bruta)
          4. Autenticación: JWT verifica que el usuario está logueado
          5. Autorización: RBAC verifica que tiene permiso para la acción
          6. Datos: bcrypt encripta contraseñas, transacciones ACID protegen integridad
          Cada capa frena un tipo diferente de ataque. */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white fw-bold">
          7. Medidas de seguridad implementadas
        </div>
        <div className="card-body">
          <ul className="mb-0">
            <li className="mb-2"><strong>Contraseñas encriptadas (bcryptjs):</strong> Las contraseñas se guardan encriptadas en la base de datos. Nadie puede ver la contraseña real.</li>
            <li className="mb-2"><strong>Tokens JWT:</strong> Cuando el usuario inicia sesión, se genera un token que lo identifica. Este token se envía en cada petición para verificar que está autenticado.</li>
            <li className="mb-2"><strong>Control de roles (RBAC):</strong> Cada ruta del servidor verifica si el usuario tiene el permiso necesario según su rol.</li>
            <li className="mb-2"><strong>Bloqueo de cuenta por intentos fallidos:</strong> Después de 3 intentos fallidos de login con el mismo correo, la cuenta se bloquea por 3 minutos.</li>
            <li className="mb-2"><strong>Rate limiting por IP:</strong> El login permite máximo 10 intentos por IP cada 15 minutos; la API general permite 500 peticiones por IP cada 15 minutos. Protege contra ataques de fuerza bruta.</li>
            <li className="mb-2"><strong>Cabeceras de seguridad (Helmet):</strong> Se aplican automáticamente cabeceras HTTP como X-Content-Type-Options, X-Frame-Options, HSTS y Content-Security-Policy.</li>
            <li className="mb-2"><strong>CORS:</strong> Solo el frontend autorizado puede comunicarse con el servidor.</li>
            <li className="mb-2"><strong>Validación doble:</strong> Los datos se validan tanto en el frontend como en el backend.</li>
            <li className="mb-2"><strong>Validación de imágenes:</strong> La subida de portadas valida la extensión y el MIME type real del archivo para evitar subir archivos maliciosos con extensión .jpg.</li>
            <li className="mb-0"><strong>Transacciones ACID:</strong> Las operaciones críticas (ventas, movimientos) usan transacciones para que los datos no queden incompletos.</li>
          </ul>
        </div>
      </div>

      {/* ── SECCIÓN 8: INSTALACIÓN ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white fw-bold">
          8. Cómo instalar y correr el proyecto
        </div>
        <div className="card-body">
          <h6 className="fw-bold">Requisitos previos</h6>
          <ul>
            <li>Node.js versión 20 o superior</li>
            <li>MySQL 8 instalado</li>
          </ul>

          <h6 className="fw-bold mt-3">Paso 1: Clonar el proyecto</h6>
          <pre className="bg-light p-2 rounded small">git clone https://github.com/cperdomope/SGI-Libreria-el-Saber.git</pre>

          <h6 className="fw-bold mt-3">Paso 2: Crear la base de datos</h6>
          <pre className="bg-light p-2 rounded small">mysql -u root -p &lt; base_datos/sgi_libreria_completo.sql</pre>

          <h6 className="fw-bold mt-3">Paso 3: Configurar y arrancar el backend</h6>
          <pre className="bg-light p-2 rounded small">
{`cd servidor
cp .env.example .env    (editar con los datos de MySQL y Cloudinary)
npm install
# Generar los hashes bcrypt de las contraseñas de los usuarios de
# ejemplo (procedimiento detallado en el README y en el Manual de
# Instalación en PDF, descargable desde este mismo modal)
npm start               (arranca en http://localhost:3000)`}
          </pre>

          <h6 className="fw-bold mt-3">Paso 4: Configurar y arrancar el frontend</h6>
          <pre className="bg-light p-2 rounded small">
{`cd cliente
npm install
# Crear archivo .env con: VITE_API_URL=http://localhost:3000/api
npm run dev             (arranca en http://localhost:5173)`}
          </pre>

          <h6 className="fw-bold mt-3">Variables de entorno del backend (servidor/.env)</h6>
          <pre className="bg-light p-2 rounded small">
{`PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=inventario_libreria
DB_SSL=false
JWT_SECRET=una_clave_secreta
JWT_EXPIRY=8h
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Cloudinary (para almacenar portadas en la nube)
# Si no se configuran, las imágenes se guardan en disco local (solo desarrollo)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret`}
          </pre>

          <h6 className="fw-bold mt-3">Variables de entorno del frontend (cliente/.env)</h6>
          <pre className="bg-light p-2 rounded small">
{`VITE_API_URL=http://localhost:3000/api`}
          </pre>
        </div>
      </div>

      {/* ── SECCIÓN 9: PRUEBAS ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white fw-bold">
          9. Pruebas automatizadas
        </div>
        <div className="card-body">
          <p>
            Usamos <strong>Jest</strong> (framework de pruebas) y <strong>Supertest</strong> (para
            simular peticiones HTTP) para verificar que las funciones más importantes del backend
            funcionan correctamente.
          </p>
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Archivo</th>
                  <th>Qué prueba</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>pruebas/auth.test.js</code></td><td>Login, token JWT, rutas protegidas</td></tr>
                <tr><td><code>pruebas/libros.test.js</code></td><td>CRUD de libros y permisos por rol</td></tr>
                <tr><td><code>pruebas/clientes.test.js</code></td><td>CRUD de clientes y permisos por rol</td></tr>
                <tr><td><code>pruebas/ventas.test.js</code></td><td>Creación de ventas, validación de totales y seguridad</td></tr>
                <tr><td><code>pruebas/movimientos.test.js</code></td><td>Entradas y salidas de inventario (Kardex)</td></tr>
                <tr><td><code>pruebas/usuarios.test.js</code></td><td>Gestión de usuarios y cambio de contraseña</td></tr>
                <tr><td><code>pruebas/catalogos.test.js</code></td><td>CRUD de autores, categorías y proveedores</td></tr>
                <tr><td><code>pruebas/dashboard.test.js</code></td><td>Estadísticas, gráficas y datos del dashboard</td></tr>
              </tbody>
            </table>
          </div>
          <pre className="bg-light p-2 rounded small mb-0">
{`cd servidor
npm test`}
          </pre>
        </div>
      </div>

      {/* ── SECCIÓN 10: DESPLIEGUE ── */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white fw-bold">
          10. Despliegue en producción (cómo se sube a internet)
        </div>
        <div className="card-body">
          <div className="alert alert-light border mb-3">
            Los tres servicios (frontend, backend y base de datos) se despliegan en <strong>Railway</strong>,
            una plataforma en la nube que permite hospedar aplicaciones Node.js y bases de datos MySQL.
          </div>

          <h6 className="fw-bold mb-2">URLs de producción</h6>
          <div className="table-responsive mb-3">
            <table className="table table-bordered table-sm small">
              <thead className="table-light">
                <tr>
                  <th>Servicio</th>
                  <th>URL / Host</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Frontend</strong></td>
                  <td><code>https://sgi-libreria-el-saber-production.up.railway.app</code></td>
                  <td>Interfaz React (build Vite servido con <code>serve</code>)</td>
                </tr>
                <tr>
                  <td><strong>Backend</strong></td>
                  <td><code>https://friendly-kindness-production-06fe.up.railway.app</code></td>
                  <td>API Express 5 — puerto interno 8080 (inyectado por Railway)</td>
                </tr>
                <tr>
                  <td><strong>Base de datos</strong></td>
                  <td><code>autorack.proxy.rlwy.net:39238</code></td>
                  <td>Plugin MySQL de Railway — BD: <code>inventario_libreria</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <div className="card h-100 border-success">
                <div className="card-body text-center">
                  <h6 className="fw-bold text-success">Frontend</h6>
                  <p className="small mb-0">Build de Vite desplegado en Railway; usa <code>serve -s dist -l $PORT</code> para SPA routing</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-warning">
                <div className="card-body text-center">
                  <h6 className="fw-bold text-warning">Backend</h6>
                  <p className="small mb-0">Servicio Node.js en Railway; Root Directory: <code>servidor/</code>, comando: <code>node index.js</code></p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-info">
                <div className="card-body text-center">
                  <h6 className="fw-bold text-info">Base de Datos</h6>
                  <p className="small mb-0">Plugin MySQL de Railway — las variables de conexión se inyectan automáticamente al backend</p>
                </div>
              </div>
            </div>
          </div>

          <h6 className="fw-bold mb-2">Configuración especial requerida por Railway</h6>
          <div className="alert alert-info small mb-3">
            <strong>Trust Proxy:</strong> Railway coloca el backend detrás de un proxy reverso. Para que
            el rate-limiter (<code>express-rate-limit</code>) pueda leer correctamente la IP real del
            usuario desde la cabecera <code>X-Forwarded-For</code>, es obligatorio agregar en <code>app.js</code>:
            <pre className="bg-light p-2 rounded mt-2 mb-0">app.set(&apos;trust proxy&apos;, 1);</pre>
            Sin esta línea, Express rechaza la cabecera y lanza el error
            <code> ERR_ERL_UNEXPECTED_X_FORWARDED_FOR</code>.
          </div>

          <div className="alert alert-warning mb-0 small">
            <strong>Importante:</strong> Las variables de entorno con contraseñas y claves secretas
            (JWT_SECRET, Cloudinary) se configuran directamente en el panel de Railway, nunca se suben a GitHub.
            El archivo <code>servidor/.env</code> está excluido por <code>.gitignore</code>.
          </div>
        </div>
      </div>
    </div>
  );
};

// Se exporta como default para que lazy() en Acceso.jsx pueda importarlo.
// Los imports dinámicos (import()) requieren que el módulo tenga un export default.
export default DocumentacionManualTecnico;
