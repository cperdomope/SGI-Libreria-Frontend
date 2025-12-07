# Frontend - Sistema de Gestión de Inventario

Frontend de la aplicación de gestión de inventario para librería, desarrollado con React + Vite.

## Tecnologías

- **React 19.2.0** - Librería de interfaces de usuario
- **Vite 7.2.4** - Herramienta de construcción y servidor de desarrollo rápido
- **React Router DOM 7.9.6** - Enrutamiento del lado del cliente
- **Axios 1.13.2** - Cliente HTTP para comunicación con API
- **Bootstrap 5.3.8** - Framework CSS para diseño responsivo
- **ESLint 9.39.1** - Herramienta de linting para calidad de código

## Estructura de Carpetas

```
src/
├── componentes/
│   └── BarraNavegacion.jsx    # Menú principal con navegación
├── contexto/
│   └── AuthContext.jsx        # Contexto global de autenticación
├── paginas/
│   ├── Acceso.jsx             # Página de login
│   ├── Inicio.jsx             # Dashboard principal
│   ├── Inventario.jsx         # Gestión de libros
│   ├── Movimientos.jsx        # Kardex de movimientos
│   ├── PaginaClientes.jsx     # CRUD de clientes
│   ├── PaginaVentas.jsx       # Punto de Venta (POS)
│   ├── HistorialVentas.jsx    # Historial de transacciones
│   ├── PaginaProveedores.jsx  # CRUD de proveedores
│   ├── PaginaAutores.jsx      # CRUD de autores
│   └── PaginaCategorias.jsx   # CRUD de categorías
├── servicios/
│   └── api.js                 # Configuración de Axios con interceptores JWT
├── App.jsx                    # Componente raíz con rutas
└── main.jsx                   # Punto de entrada de la aplicación
```

## Características Implementadas

### Sistema de Autenticación
- Login con JWT
- Rutas protegidas (redirecciona a /acceso si no hay sesión)
- Contexto global de usuario
- Interceptores de Axios para incluir token automáticamente
- Logout con limpieza de sesión

### Componentes Principales

#### BarraNavegación
- Menú responsivo con Bootstrap
- Dropdowns organizados por módulos (Ventas, Logística)
- Iconos SVG personalizados
- Indicador de usuario activo
- Botón de cerrar sesión

#### AuthContext
- Proveedor de contexto para estado de autenticación
- Persistencia de token en localStorage
- Métodos de login y logout
- Estado de carga durante verificación

### Páginas

#### Acceso (Login)
- Formulario de autenticación
- Validación de campos
- Manejo de errores (intentos fallidos, cuenta bloqueada)
- Redirección automática tras login exitoso

#### Inicio (Dashboard)
- Estadísticas generales del sistema
- Métricas de inventario y ventas
- Acceso rápido a módulos principales

#### Inventario
- Tabla responsiva de libros
- Modal para crear/editar libros
- Selects dinámicos de autores y categorías desde API
- Validación de ISBN único
- Control de stock actual y mínimo
- Eliminación con confirmación

#### Movimientos (Kardex)
- Historial completo de entradas y salidas
- Filtros por tipo de movimiento
- Registro de nuevos movimientos
- Observaciones detalladas
- Actualización automática de stock

#### PaginaVentas (POS)
- Interfaz de punto de venta moderna
- Selección de cliente
- Agregar productos al carrito
- Cálculo automático de totales
- Confirmación de venta

#### HistorialVentas
- Listado de todas las ventas
- Ver detalles completos de cada venta
- Información de cliente y productos
- Búsqueda y filtros

#### PaginaClientes
- CRUD completo de clientes
- Tabla responsiva con hover effects
- Modal para crear/editar
- Validación de documento único
- Campo "Documento" en formato título (corrección aplicada)

#### PaginaProveedores
- CRUD completo de proveedores
- Tabla responsiva con breakpoints Bootstrap
- Scroll horizontal en dispositivos pequeños
- Hover effect mejorado (color verde #c3f0ca)
- Prevención de traducción automática en campo NIT
- Todos los textos centrados
- Columnas que se ocultan según tamaño de pantalla:
  - Mobile: Empresa, NIT, Teléfono, Acciones
  - Tablet (≥768px): + ID
  - Desktop (≥992px): + Contacto, Dirección
  - XL (≥1200px): + Email (todas las columnas)

#### PaginaAutores
- CRUD completo de autores
- Validación antes de eliminar (verifica libros asociados)
- Modal Bootstrap para crear/editar
- Mensajes de confirmación

#### PaginaCategorías
- CRUD completo de categorías
- Prevención de nombres duplicados
- Validación de asociaciones con libros
- Interfaz consistente con otros módulos

## Scripts Disponibles

### Desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo en `http://localhost:5173`
- Hot Module Replacement (HMR) habilitado
- Actualización instantánea en cambios

### Build de Producción
```bash
npm run build
```
Genera versión optimizada para producción en carpeta `dist/`
- Minificación de código
- Optimización de assets
- Code splitting automático

### Preview de Build
```bash
npm run preview
```
Previsualiza el build de producción localmente

### Linting
```bash
npm run lint
```
Ejecuta ESLint para verificar calidad de código

## Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz de `cliente/`:

```env
VITE_API_URL=http://localhost:3000/api
```

### Configuración de Axios (api.js)

El archivo `servicios/api.js` configura:
- Base URL desde variable de entorno
- Interceptor de request: Agrega token JWT automáticamente
- Interceptor de response: Maneja errores 401 (token inválido/expirado)
- Timeout de peticiones
- Headers por defecto

## Rutas de la Aplicación

```
/acceso              → Login (pública)
/                    → Dashboard (protegida)
/inventario          → Gestión de Libros (protegida)
/movimientos         → Kardex (protegida)
/clientes            → Gestión de Clientes (protegida)
/ventas              → Punto de Venta (protegida)
/historial-ventas    → Historial de Ventas (protegida)
/proveedores         → Gestión de Proveedores (protegida)
/autores             → Gestión de Autores (protegida)
/categorias          → Gestión de Categorías (protegida)
```

Todas las rutas protegidas redirigen a `/acceso` si no hay sesión activa.

## Componentes Reutilizables

### Iconos SVG
Iconos personalizados implementados como componentes React:
- IconoInicio
- IconoInventario
- IconoMovimientos
- IconoClientes
- IconoVentas
- IconoHistorial
- IconoProveedores
- IconoAutores
- IconoCategorias
- IconoSalir

### Modales
Todos los modales usan Bootstrap 5 con:
- Backdrop para cerrar al hacer click fuera
- Animaciones de entrada/salida
- Validación de formularios
- Manejo de estados (crear/editar)

## Estilos

### Bootstrap 5
Utiliza clases de Bootstrap para:
- Grid system (responsividad)
- Componentes (cards, tables, modals, buttons)
- Utilidades (spacing, colors, typography)

### Estilos Personalizados
- Hover effects en tablas
- Transiciones suaves
- Colores corporativos (paleta verde para proveedores)
- Sombras personalizadas

### Responsividad
Implementa breakpoints de Bootstrap:
- xs: < 576px
- sm: ≥ 576px
- md: ≥ 768px
- lg: ≥ 992px
- xl: ≥ 1200px
- xxl: ≥ 1400px

## Mejoras Recientes

### Versión Actual
- Implementación de gestión de Autores y Categorías
- Tabla de proveedores completamente responsiva
- Efecto hover mejorado en tablas
- Prevención de traducción automática (translate="no")
- Centralización de textos en tablas
- Scroll horizontal en tablas
- Campo "Documento" en formato correcto
- Iconos SVG personalizados en navegación
- Selects dinámicos cargados desde API

## Convenciones de Código

### Nomenclatura
- Componentes: PascalCase (ej: `PaginaClientes.jsx`)
- Variables/funciones: camelCase (ej: `cargarClientes`)
- Constantes: UPPER_SNAKE_CASE (ej: `TIEMPO_BLOQUEO_MINUTOS`)

### Estructura de Componentes
```jsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import api from '../servicios/api';

// 2. Componente
const NombreComponente = () => {
  // 3. Estados
  const [datos, setDatos] = useState([]);

  // 4. Effects
  useEffect(() => {
    cargarDatos();
  }, []);

  // 5. Funciones
  const cargarDatos = async () => {
    // ...
  };

  // 6. Render
  return (
    // JSX
  );
};

// 7. Export
export default NombreComponente;
```

## Solución de Problemas

### Error: Cannot connect to API
- Verificar que el backend esté corriendo en puerto 3000
- Revisar VITE_API_URL en .env
- Verificar CORS_ORIGIN en backend

### Error: Token inválido
- Cerrar sesión (limpia localStorage)
- Volver a iniciar sesión
- Verificar que JWT_SECRET coincida en backend

### Estilos no se aplican
- Verificar que Bootstrap esté importado en main.jsx
- Limpiar cache del navegador (Ctrl + Shift + R)
- Revisar consola de navegador para errores CSS

### Hot Reload no funciona
- Reiniciar servidor de desarrollo
- Verificar que archivos estén dentro de src/
- Verificar permisos de archivos

## Recursos Adicionales

- [Documentación de React](https://react.dev)
- [Documentación de Vite](https://vitejs.dev)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.3)
- [React Router](https://reactrouter.com)
- [Axios Docs](https://axios-http.com)

---

Parte del proyecto SENA - Sistema de Gestión de Inventario
