# Registro de Cambios (CHANGELOG)

Todos los cambios notables del Sistema de Gestión de Inventario serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [Versión Actual] - 2025-12-08 (Unificación Visual y Mejoras de UI)

### Cambiado

#### 🎨 Unificación de Diseño Visual en Modales y Acciones

**Objetivo:**
Estandarizar el esquema de colores en toda la aplicación siguiendo el diseño del módulo "Historial de Ventas".

**Cambios implementados:**

**1. Headers de Modales - Color Evergreen (#053225)**
- ✅ **PaginaClientes.jsx** - Modal header cambiado a `bg-primary` (color evergreen)
- ✅ **Inventario.jsx** - Modal header cambiado a `bg-primary`
- ✅ **PaginaAutores.jsx** - Modal header cambiado a `bg-primary`
- ✅ **PaginaCategorias.jsx** - Modal header cambiado a `bg-primary`
- ✅ **PaginaProveedores.jsx** - Modal header cambiado a `bg-primary`
- **Antes:** Gradiente verde/teal `linear-gradient(135deg, #1e7464 0%, #26a69a 100%)`
- **Ahora:** Color sólido evergreen consistente con HistorialVentas

**2. Botones de "Editar" - Color Evergreen**
- ✅ Todos los botones de editar cambiados de `btn-outline-info` (azul #3498DB) a `btn-outline-primary` (evergreen)
- ✅ Nuevo estilo CSS para `.action-buttons .btn-outline-primary`:
  - Color base: evergreen (#053225)
  - Hover: Fondo rgba(5, 50, 37, 0.1) con escala 1.1
  - Transición suave y efecto visual mejorado
- Aplica a: Clientes, Inventario, Autores, Categorías, Proveedores

**3. Botones de Submit en Modales**
- ✅ Cambiados de gradiente inline a `btn-primary` estándar
- ✅ Consistencia visual en todos los formularios de agregar/editar

**4. Botones "+" de Agregar - Posicionamiento**
- ✅ Nueva clase CSS `.module-header` con flexbox
- ✅ Posicionamiento automático en esquina superior derecha
- ✅ Diseño responsivo: `justify-content: space-between`
- ✅ Aplica a: Inventario, Autores, Categorías, Proveedores

**Archivos modificados:**
- `cliente/src/paginas/PaginaClientes.jsx`
- `cliente/src/paginas/Inventario.jsx`
- `cliente/src/paginas/PaginaAutores.jsx`
- `cliente/src/paginas/PaginaCategorias.jsx`
- `cliente/src/paginas/PaginaProveedores.jsx`
- `cliente/src/styles/custom-theme.css`

**Resultado:**
- ✅ Diseño visual 100% consistente en toda la aplicación
- ✅ Esquema de colores unificado basado en paleta evergreen
- ✅ Mejor experiencia de usuario con interfaz coherente
- ✅ Headers de módulos posicionados correctamente (título izquierda, botón derecha)

---

## [Versión Anterior] - 2025-12-07 (Corrección Crítica de Seguridad)

### Corregido

#### 🔒 Corrección Crítica: Permisos de Frontend en Módulos

**Problema identificado:**
- El rol VENDEDOR podía ver y usar botones de editar/eliminar en Clientes y Libros
- Aunque el backend bloqueaba las peticiones (403 Forbidden), la UI mostraba opciones no permitidas
- Esto generaba confusión y mala experiencia de usuario

**Solución implementada:**

**1. PaginaClientes.jsx**
- ✅ Importado `useAuth` para verificar permisos
- ✅ Botón "Nuevo Cliente" ahora verifica `tienePermiso('crearCliente')`
- ✅ Botón "Editar" ahora verifica `tienePermiso('editarCliente')` - **VENDEDOR NO PUEDE EDITAR**
- ✅ Botón "Eliminar" ahora verifica `tienePermiso('eliminarCliente')` - **VENDEDOR NO PUEDE ELIMINAR**
- ✅ Muestra "Solo lectura" cuando no tiene permisos de edición/eliminación

**2. Inventario.jsx (Libros)**
- ✅ Importado `useAuth` para verificar permisos
- ✅ Botón "+ Nuevo Libro" ahora verifica `tienePermiso('crearLibro')` - **VENDEDOR NO VE EL BOTÓN**
- ✅ Botón "Editar" ahora verifica `tienePermiso('editarLibro')` - **VENDEDOR NO VE EL BOTÓN**
- ✅ Botón "Borrar" ahora verifica `tienePermiso('eliminarLibro')` - **VENDEDOR NO VE EL BOTÓN**
- ✅ Muestra "Solo consulta" cuando no tiene permisos

**3. PaginaAutores.jsx**
- ✅ Importado `useAuth` para verificar permisos
- ✅ Botón "+ Nuevo Autor" ahora verifica `tienePermiso('crearAutor')` - **VENDEDOR NO VE EL BOTÓN**
- ✅ Botón "Editar" ahora verifica `tienePermiso('editarAutor')` - **VENDEDOR NO VE EL BOTÓN**
- ✅ Botón "Eliminar" ahora verifica `tienePermiso('eliminarAutor')` - **VENDEDOR NO VE EL BOTÓN**
- ✅ Muestra "Solo consulta" cuando no tiene permisos

**4. PaginaCategorias.jsx**
- ✅ Importado `useAuth` para verificar permisos
- ✅ Botón "+ Nueva Categoría" ahora verifica `tienePermiso('crearCategoria')` - **VENDEDOR NO VE EL BOTÓN**
- ✅ Botón "Editar" ahora verifica `tienePermiso('editarCategoria')` - **VENDEDOR NO VE EL BOTÓN**
- ✅ Botón "Eliminar" ahora verifica `tienePermiso('eliminarCategoria')` - **VENDEDOR NO VE EL BOTÓN**
- ✅ Muestra "Solo consulta" cuando no tiene permisos

**5. Permisos Actualizados en AuthContext.jsx**
- Confirmado: `editarCliente: false` para VENDEDOR (línea 83)
- Confirmado: Clientes comentado como "Solo listar y crear (para ventas)"
- Confirmado: Todos los permisos de Autores en `false` (crear, editar, eliminar)
- Confirmado: Todos los permisos de Categorías en `false` (crear, editar, eliminar)

**6. Backend Verificado**
- Confirmado: `clienteRutas.js` línea 19 usa `soloAdministrador` para PUT (editar)
- Confirmado: `clienteRutas.js` línea 22 usa `soloAdministrador` para DELETE (eliminar)
- Confirmado: `autorRutas.js` protegido con `soloAdministrador` para todas las operaciones de escritura
- Confirmado: `categoriaRutas.js` protegido con `soloAdministrador` para todas las operaciones de escritura

**Resultado:**
- ✅ VENDEDOR ahora ve una interfaz limpia sin opciones prohibidas
- ✅ Doble capa de seguridad: Frontend oculta + Backend bloquea
- ✅ Mejor experiencia de usuario (no intenta acciones que fallarán)
- ✅ Cumple 100% con los requisitos de RBAC

**Permisos VENDEDOR en Clientes:**
- ✅ Ver lista de clientes (para consulta en ventas)
- ✅ Crear nuevos clientes (para registro durante venta)
- ❌ Editar clientes existentes (solo Admin)
- ❌ Eliminar clientes (solo Admin)

**Permisos VENDEDOR en Libros:**
- ✅ Ver catálogo (precios y stock para ventas)
- ❌ Crear libros (solo Admin)
- ❌ Editar libros (solo Admin)
- ❌ Eliminar libros (solo Admin)

**Permisos VENDEDOR en Autores:**
- ✅ Ver lista de autores (solo consulta)
- ❌ Crear autores (solo Admin)
- ❌ Editar autores (solo Admin)
- ❌ Eliminar autores (solo Admin)

**Permisos VENDEDOR en Categorías:**
- ✅ Ver lista de categorías (solo consulta)
- ❌ Crear categorías (solo Admin)
- ❌ Editar categorías (solo Admin)
- ❌ Eliminar categorías (solo Admin)

---

## [Versión Anterior] - 2025-12-07

### Agregado

#### Nuevos Módulos
- **Gestión de Autores (CRUD completo)**
  - Crear, leer, actualizar y eliminar autores
  - Validación de asociaciones antes de eliminar (verifica libros asociados)
  - Endpoint: `/api/autores`
  - Controlador: `servidor/controladores/autorControlador.js`
  - Rutas protegidas con JWT
  - Interfaz de usuario: `cliente/src/paginas/PaginaAutores.jsx`

- **Gestión de Categorías (CRUD completo)**
  - Crear, leer, actualizar y eliminar categorías
  - Prevención de nombres duplicados
  - Validación de asociaciones con libros antes de eliminar
  - Endpoint: `/api/categorias`
  - Controlador: `servidor/controladores/categoriaControlador.js`
  - Rutas protegidas con JWT
  - Interfaz de usuario: `cliente/src/paginas/PaginaCategorias.jsx`

#### Mejoras de UI/UX
- **Tabla de Proveedores completamente responsiva**
  - Implementación de breakpoints Bootstrap para ocultar columnas según tamaño de pantalla
  - Scroll horizontal en dispositivos móviles
  - Columnas adaptativas:
    - Mobile: Empresa, NIT, Teléfono, Acciones
    - Tablet (≥768px): + ID
    - Desktop (≥992px): + Contacto, Dirección
    - XL (≥1200px): + Email (todas las columnas)

- **Efecto hover mejorado en tablas**
  - Color verde (#c3f0ca) que armoniza con la paleta de la aplicación
  - Sombra con efecto de elevación
  - Transform scale(1.01) para feedback visual
  - Transiciones suaves

- **Centralización de texto en tablas**
  - Todo el contenido de tablas ahora está centrado
  - Mejor legibilidad y presentación profesional

- **Prevención de traducción automática**
  - Atributo `translate="no"` en campos técnicos (NIT)
  - Evita que navegadores traduzcan términos específicos

- **Iconos SVG personalizados**
  - Iconos inline para menú de navegación
  - IconoAutores (icono de libros)
  - IconoCategorias (icono de etiqueta)
  - Diseño consistente en toda la aplicación

#### Funcionalidades del Sistema
- **Selects dinámicos en Inventario**
  - Carga de autores desde API en lugar de valores hardcodeados
  - Carga de categorías desde API
  - Actualización automática al agregar nuevos autores/categorías

- **Campo "Dirección" visible en Proveedores**
  - Corrección: el campo ahora se muestra correctamente en la tabla
  - Incluido en formulario modal

- **Sistema de Roles y Permisos (CRÍTICO)**
  - Implementación completa de control de acceso basado en roles
  - Diferenciación entre Administrador y Vendedor
  - Middleware de verificación de roles en backend
  - Protección de rutas en frontend según permisos
  - Interfaz adaptativa que muestra/oculta opciones según rol

### Cambiado

#### Seguridad
- **Tiempo de bloqueo de cuenta reducido**
  - De 15 minutos a 3 minutos
  - Apropiado para entorno educativo
  - Mantiene protección contra fuerza bruta

- **Mensajes de error mejorados**
  - Mensajes más profesionales y claros
  - Sin revelar información sensible sobre existencia de usuarios
  - Contador de intentos restantes visible

#### UI/UX
- **Campo "Documento" en formato título**
  - Cambio de "DOCUMENTO" (mayúsculas) a "Documento" (título)
  - Consistencia con otros campos del formulario
  - Eliminación de clase `text-uppercase`

### Corregido

#### Backend
- **Script de reseteo de contraseñas**
  - Corrección de ruta del módulo db: `require('../configuracion/db')`
  - Agregado de configuración dotenv
  - Ahora funciona correctamente desde carpeta scripts/

#### Frontend
- **Navegación y rutas**
  - Registro correcto de rutas `/autores` y `/categorias` en App.jsx
  - Items de menú agregados en BarraNavegacion.jsx
  - Lazy loading y code splitting funcional

- **Tabla de Proveedores**
  - Campo "Dirección" ahora visible (se había omitido en renderizado)
  - Colspan corregido de 7 a 8 para mensaje de tabla vacía
  - Botones de acción mantienen espaciado correcto en todas las resoluciones

- **Prevención de traducción NIT**
  - Campo NIT ya no se traduce a "LIENDRE" por navegadores
  - Solución: atributo HTML `translate="no"`

## [Nueva Versión] - 2025-12-07 (Implementación de Roles)

### Agregado

#### Sistema de Control de Acceso por Roles

**Backend:**
- **Middleware de verificación de roles** (`servidor/middlewares/verificarRol.js`)
  - Constantes de roles: ADMINISTRADOR (1), VENDEDOR (2)
  - Función `verificarRol(rolesPermitidos)` para validar acceso
  - Middlewares preconfigurados: `soloAdministrador`, `administradorOVendedor`
  - Logging de intentos de acceso denegado para auditoría

- **Protección de endpoints por rol:**
  - **Dashboard** (`/api/dashboard`) - Solo Administrador
  - **Libros** (`/api/libros`):
    - GET: Administrador y Vendedor (consulta)
    - POST/PUT/DELETE: Solo Administrador (gestión)
  - **Autores** (`/api/autores`):
    - GET: Administrador y Vendedor (consulta)
    - POST/PUT/DELETE: Solo Administrador (gestión)
  - **Categorías** (`/api/categorias`):
    - GET: Administrador y Vendedor (consulta)
    - POST/PUT/DELETE: Solo Administrador (gestión)
  - **Clientes** (`/api/clientes`):
    - GET/POST/PUT: Administrador y Vendedor (gestión)
    - DELETE: Solo Administrador
  - **Proveedores** (`/api/proveedores`) - Solo Administrador (todos los métodos)
  - **Ventas** (`/api/ventas`) - Administrador y Vendedor (función principal de vendedores)
  - **Movimientos** (`/api/movimientos`) - Solo Administrador (ajustes de inventario sensibles)

**Frontend:**
- **Actualización de AuthContext** (`cliente/src/contexto/AuthContext.jsx`)
  - Constantes exportadas: `ROLES` y `PERMISOS`
  - Mapeo completo de permisos por rol
  - Funciones utilitarias:
    - `tieneRol(rolRequerido)`: Verifica si usuario tiene rol específico
    - `esAdministrador()`: Verifica si es administrador
    - `esVendedor()`: Verifica si es vendedor
    - `tienePermiso(permiso)`: Verifica permiso específico
    - `nombreRol()`: Obtiene nombre legible del rol

- **Componente RutaProtegidaPorRol** (`cliente/src/componentes/RutaProtegidaPorRol.jsx`)
  - Protección de rutas basada en permisos granulares
  - Redirección automática si no tiene permiso
  - Mensaje de "Acceso Denegado" amigable
  - Ruta de redirección configurable

- **BarraNavegación actualizada** (`cliente/src/componentes/BarraNavegacion.jsx`)
  - Muestra/oculta opciones del menú según permisos del usuario
  - Dropdown "Gestión Comercial": visible para roles con acceso a ventas/clientes
  - Dropdown "Logística": visible para roles con acceso a inventario
  - Dashboard: solo visible para administradores
  - Indicador de rol en sección de usuario

- **Rutas protegidas en App.jsx** (`cliente/src/App.jsx`)
  - Todas las rutas ahora verifican permisos específicos
  - Redirección inteligente: usuarios sin acceso a Dashboard van a /ventas
  - Doble capa de protección: autenticación + permisos

### Permisos Definidos por Rol

#### ADMINISTRADOR (rol_id = 1)
**Acceso Total:**
- ✅ Dashboard/Estadísticas
- ✅ Inventario: Ver, Crear, Editar, Eliminar
- ✅ Autores: Ver, Crear, Editar, Eliminar
- ✅ Categorías: Ver, Crear, Editar, Eliminar
- ✅ Clientes: Ver, Crear, Editar, Eliminar
- ✅ Proveedores: Ver, Crear, Editar, Eliminar
- ✅ Ventas: Registrar, Ver Historial
- ✅ Movimientos: Registrar Entradas/Salidas

#### VENDEDOR (rol_id = 2)
**Acceso Limitado:**
- ✅ Ventas (POS): Registrar ventas (FUNCIÓN PRINCIPAL)
- ✅ Historial: Ver ventas realizadas
- ✅ Clientes: Ver, Crear, Editar (necesario para ventas)
- ✅ Inventario: Solo lectura (consultar productos disponibles)
- ✅ Autores: Solo lectura (información)
- ✅ Categorías: Solo lectura (información)
- ❌ Dashboard (sin acceso a métricas del negocio)
- ❌ Proveedores (gestión administrativa)
- ❌ Movimientos (solo admin ajusta stock)
- ❌ Eliminar Clientes (solo administrador)
- ❌ Crear/Editar/Eliminar: Libros, Autores, Categorías

### Seguridad

- **Doble validación de permisos:**
  - Backend: Middleware `verificarRol` rechaza peticiones no autorizadas (HTTP 403)
  - Frontend: Componentes y rutas ocultan/bloquean acceso según permisos

- **Auditoría de accesos:**
  - Log de intentos de acceso denegado en consola del servidor
  - Incluye: Usuario ID, Rol, Método HTTP, URL solicitada

- **Mensajes de error seguros:**
  - No revelan estructura interna del sistema
  - Respuestas uniformes: "Acceso denegado" / "No tiene permisos suficientes"

### Compatibilidad

- **Sin cambios en base de datos:**
  - Utiliza tabla `roles` existente
  - Roles ya definidos: Administrador (ID=1), Vendedor (ID=2)
  - Compatible con usuarios existentes

- **Retrocompatibilidad:**
  - Usuario administrador existente mantiene todos los permisos
  - Tokens JWT existentes continúan funcionando
  - No requiere re-login de usuarios activos

### Documentación

#### Agregado
- **README.md principal** (raíz del proyecto)
  - Descripción completa del sistema
  - Instrucciones de instalación y configuración
  - Listado de todas las funcionalidades
  - Estructura del proyecto
  - API endpoints documentados
  - Medidas de seguridad implementadas
  - Guía de uso del sistema

- **cliente/README.md**
  - Documentación específica del frontend
  - Tecnologías y dependencias
  - Estructura de carpetas
  - Descripción de componentes y páginas
  - Scripts disponibles (dev, build, preview, lint)
  - Configuración de variables de entorno
  - Rutas de la aplicación
  - Guía de troubleshooting

- **servidor/README.md**
  - Documentación completa del backend
  - Endpoints de API con ejemplos
  - Estructura de controladores y rutas
  - Configuración de base de datos
  - Seguridad implementada (JWT, bcrypt, CORS)
  - Formato de respuestas de error
  - Scripts útiles
  - Guía de desarrollo

- **base_datos/README.md**
  - Estructura detallada de base de datos
  - Tablas con todas sus columnas y tipos
  - Diagrama de relaciones
  - Normalización 3NF explicada
  - Consultas SQL útiles
  - Guía de backup y restauración
  - Instrucciones para migraciones
  - Índices y optimización

- **CHANGELOG.md** (este archivo)
  - Registro cronológico de cambios
  - Formato Keep a Changelog

---

## [Versión Anterior] - 2025-12-06

### Agregado

#### Refactorización y Seguridad
- Sistema de autenticación JWT completo
- Encriptación de contraseñas con bcrypt
- Variables de entorno para datos sensibles
- Configuración CORS segura
- Middleware de verificación de token
- Protección contra ataques de fuerza bruta

#### Módulos Principales
- Gestión de Inventario (Libros)
- Sistema de Movimientos (Kardex)
- Punto de Venta (POS)
- Historial de Ventas
- Gestión de Clientes
- Gestión de Proveedores
- Dashboard con estadísticas

#### Base de Datos
- Migración a estructura normalizada 3NF
- Script inicial con datos semilla
- Relaciones con claves foráneas
- Integridad referencial garantizada

#### Frontend
- Aplicación React con Vite
- React Router para navegación
- Bootstrap 5 para estilos
- Contexto de autenticación
- Rutas protegidas
- Componente de navegación responsivo

#### Backend
- API RESTful con Express 5
- Controladores separados por entidad
- Rutas protegidas con JWT
- Validaciones de datos
- Manejo consistente de errores

---

## Tipos de Cambios

- **Agregado**: Para funcionalidades nuevas
- **Cambiado**: Para cambios en funcionalidades existentes
- **Deprecado**: Para funcionalidades que serán removidas
- **Eliminado**: Para funcionalidades eliminadas
- **Corregido**: Para correcciones de bugs
- **Seguridad**: Para cambios relacionados con vulnerabilidades

---

## Versionamiento

Este proyecto sigue el versionamiento semántico (SemVer):
- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nuevas funcionalidades compatibles
- **PATCH**: Correcciones de bugs compatibles

---

Proyecto SENA - Sistema de Gestión de Inventario para Librería
