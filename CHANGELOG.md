# Registro de Cambios (CHANGELOG)

Todos los cambios notables del Sistema de Gestión de Inventario serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [Versión Actual] - 2025-12-07

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
