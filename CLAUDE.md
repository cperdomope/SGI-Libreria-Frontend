# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Descripción del Proyecto

Sistema de Gestión de Inventario para Librería (SGI) - Proyecto de Grado SENA. Sistema full-stack que gestiona libros, ventas, clientes, movimientos de stock e incluye un módulo de Punto de Venta (POS).

**ROL:** Lead Developer Full Stack

## Comandos de Desarrollo

### Cliente (Frontend React)
```bash
cd cliente
npm install          # Instalar dependencias
npm run dev          # Iniciar servidor de desarrollo (Vite en puerto 5173)
npm run build        # Compilar para producción
npm run lint         # Ejecutar ESLint
npm run preview      # Previsualizar build de producción
```

### Servidor (Backend Node.js)
```bash
cd servidor
npm install          # Instalar dependencias
node index.js        # Iniciar servidor en puerto 3000
```

### Configuración de Base de Datos
- Base de datos MySQL: `inventario_libreria`
- Configurar conexión en `servidor/.env`:
  - `DB_HOST` (por defecto: localhost)
  - `DB_USER` (por defecto: root)
  - `DB_PASSWORD`
  - `DB_NAME` (por defecto: inventario_libreria)
  - `PORT` (por defecto: 3000)

## Stack Tecnológico

### Backend
- **Framework:** Node.js + Express (Puerto 3000)
- **Sintaxis:** CommonJS (`require`/`module.exports`) - **NUNCA usar `import` en el backend**
- **Base de Datos:** MySQL con librería `mysql2` (pool de conexiones)
- **Seguridad:** JWT implementado con `jsonwebtoken` + `bcryptjs` para hashing de contraseñas
- **CORS:** Habilitado para comunicación con frontend

### Frontend
- **Framework:** React 19 + Vite (Puerto 5173)
- **Estilos:** Bootstrap 5 (clases utilitarias) + CSS personalizado
- **Iconos:** SVG Inline exclusivamente - **PROHIBIDO usar librerías externas de iconos**
- **Enrutamiento:** React Router v7
- **Estado:** Hooks nativos (useState, useEffect, useContext)
- **HTTP:** Axios para llamadas a la API

### Estructura de Carpetas
**ESTRICTAMENTE EN ESPAÑOL:** `servidor/controladores`, `cliente/src/paginas`, etc.

```
proyecto-inventario/
├── cliente/                    # Frontend React
│   ├── src/
│   │   ├── componentes/       # Componentes reutilizables
│   │   ├── paginas/           # Vistas principales (Inicio, Inventario, etc.)
│   │   ├── contexto/          # Context API (AuthContext)
│   │   ├── servicios/         # Configuración de API (Axios)
│   │   ├── App.jsx            # Configuración de rutas y layout
│   │   └── main.jsx           # Punto de entrada
│   └── package.json
├── servidor/                   # Backend Express
│   ├── controladores/         # Lógica de negocio
│   ├── rutas/                 # Definición de endpoints
│   ├── configuracion/         # DB y configuraciones
│   │   └── db.js              # Pool de conexiones MySQL
│   ├── index.js               # Punto de entrada del servidor
│   └── .env                   # Variables de entorno
└── base_datos/                # Scripts SQL
    └── script_inicial.sql
```

## Arquitectura del Sistema

### Frontend (cliente/)

**Patrón de Autenticación:**
- Context API (`contexto/AuthContext.jsx`) para estado global de autenticación
- Tokens y datos de usuario en localStorage con claves `token_sgi` y `usuario_sgi`
- Secret JWT: `'SECRETO_SENA_PROYECTO'` (debe moverse a .env en producción)
- Expiración del token: 8 horas

**Patrón de Rutas Protegidas:**
- Componente `RutaProtegida` envuelve páginas privadas
- Redirige a `/acceso` si el usuario no está autenticado
- Componente `LayoutPrincipal` envuelve todas las páginas autenticadas con `BarraNavegacion` y footer

**Comunicación con API:**
- Instancia centralizada de Axios en `servicios/api.js`
- Base URL: `http://localhost:3000/api`

**Páginas Implementadas:**
- `/acceso` - Página de login (pública)
- `/` - Dashboard/Inicio (protegida)
- `/inventario` - Gestión de inventario de libros (protegida)
- `/movimientos` - Historial de movimientos de stock (protegida)
- `/clientes` - Gestión de clientes con CRUD completo (protegida)
- `/ventas` - Sistema de Punto de Venta (POS) (protegida)

**Navegación (BarraNavegacion.jsx):**
- Menú responsivo con degradado y estilos "Glassmorphism"
- Enlaces a todas las secciones principales

### Backend (servidor/)

**Patrón MVC:**
```
rutas/ → controladores/ → configuracion/db.js
```

**Endpoints de API Implementados:**
- `/api/auth` - Autenticación (login)
- `/api/libros` - CRUD de libros
- `/api/movimientos` - Movimientos de stock
- `/api/dashboard` - Estadísticas del dashboard
- `/api/clientes` - CRUD completo de clientes
- `/api/ventas` - Operaciones de ventas (POS) con transacciones

**Conexión a Base de Datos:**
- Pool de conexiones configurado en `configuracion/db.js`
- Exporta `pool.promise()` para usar async/await
- Todas las consultas usan prepared statements (prevención de SQL injection)

**ORDEN CRÍTICO DE MIDDLEWARES en index.js:**
```javascript
// 1. CORS primero
app.use(cors());

// 2. express.json() ANTES de las rutas
app.use(express.json());

// 3. Luego las rutas
app.use('/api/ventas', rutasVentas);
app.use('/api/libros', rutasLibros);
// ... etc
```

### Base de Datos (MySQL)

**Tablas Implementadas:**
- `usuarios` - Usuarios del sistema con contraseñas hasheadas y roles
- `roles` - Roles de usuarios
- `libros` - Libros con ISBN, título, precio, stock (actual y mínimo)
- `autores` - Autores (relación con libros mediante FK)
- `categorias` - Categorías (relación con libros mediante FK)
- `movimientos` - Movimientos de stock (entrada/salida)
- `clientes` - Clientes con campos: id, nombre_completo, documento, email, telefono, direccion
- `ventas` - Cabecera de factura (id, cliente_id, total, fecha_venta)
- `detalle_ventas` - Detalle de items vendidos (id, venta_id, libro_id, cantidad, precio_unitario)
- `proveedores` - Tabla creada, **pendiente implementar CRUD**

**Relaciones Importantes:**
- Libros se unen con autores y categorías en queries
- Restricciones de clave foránea previenen eliminación de registros referenciados
- Sistema transaccional implementado en ventas (BEGIN TRANSACTION, COMMIT, ROLLBACK)

## REGLAS DE ORO (MANDATORIAS)

### 1. Sintaxis Backend - CommonJS SIEMPRE
```javascript
// ✅ CORRECTO - SIEMPRE usar esto en el backend
const express = require('express');
const db = require('../configuracion/db');
module.exports = { funcion1, funcion2 };

// ❌ INCORRECTO - NUNCA usar esto en el backend
import express from 'express';  // Esto rompe el servidor actual
export default { funcion1 };
```

### 2. Rutas React - Siempre Protegidas
Todas las rutas nuevas deben ir en `App.jsx` dentro de `<RutaProtegida>`:
```jsx
<Route path="/nueva-ruta" element={
  <RutaProtegida>
    <LayoutPrincipal><NuevaPagina /></LayoutPrincipal>
  </RutaProtegida>
} />
```

### 3. Iconos - SVG Inline Exclusivamente
**NUNCA instalar librerías de iconos (react-icons, font-awesome, etc.)**

Crear componentes funcionales para iconos SVG dentro del mismo archivo:
```jsx
const IconoCarrito = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z"/>
  </svg>
);
```

### 4. Nombres y Comentarios en Español
TODO el código debe estar en español: nombres de variables, funciones, comentarios, mensajes.

```javascript
// ✅ CORRECTO
const obtenerLibros = async (req, res) => {
  // Consulta todos los libros con sus autores
  const [libros] = await db.query('SELECT * FROM libros');
};

// ❌ INCORRECTO
const getBooks = async (req, res) => {
  // Query all books with authors
  const [books] = await db.query('SELECT * FROM libros');
};
```

## Estado Actual del Desarrollo (LO LOGRADO)

### ✅ Módulo de Clientes (COMPLETO)
- **Archivo:** `servidor/controladores/clienteControlador.js` + `servidor/rutas/clienteRutas.js`
- **Frontend:** `cliente/src/paginas/PaginaClientes.jsx`
- CRUD completo funcional
- Tabla con búsqueda y filtros
- Modal de edición/creación controlado por estado (sin jQuery)

### ✅ Módulo POS - Punto de Venta (COMPLETO)
- **Archivo:** `servidor/controladores/ventaControlador.js` + `servidor/rutas/ventaRutas.js`
- **Frontend:** `cliente/src/paginas/PaginaVentas.jsx`
- **Endpoint Transaccional:** POST `/api/ventas`
  - Usa `connection.beginTransaction()`, `commit()` y `rollback()`
  - Lógica: Crea venta → Crea detalles → Descuenta stock atómicamente
- **Diseño:** Interfaz dividida 70% Catálogo / 30% Ticket
- **Funcionalidades:**
  - Buscador en tiempo real (Título, Autor, ID)
  - Validaciones de negocio: control de stock máximo, bloqueo de venta sin cliente
  - Cálculo automático de totales
  - Actualización optimista del stock local al vender

### ✅ Módulo de Inventario (Libros)
- CRUD completo de libros
- Gestión de stock actual y stock mínimo
- Relaciones con autores y categorías

### ✅ Módulo de Movimientos
- Registro de entradas y salidas de stock
- Historial completo

### ✅ Dashboard Básico
- Vista inicial del sistema
- **PENDIENTE:** Actualizar con KPIs reales de ventas

## LO QUE FALTA POR HACER (ROADMAP)

### 🔲 1. Historial de Ventas (PRIORIDAD ALTA)
**Objetivo:** Crear vista administrativa para visualizar ventas realizadas

**Backend:**
- Endpoint GET `/api/ventas` para listar todas las ventas
- Endpoint GET `/api/ventas/:id` para obtener detalle de una venta específica (incluir items del detalle_ventas)

**Frontend:**
- Crear `cliente/src/paginas/HistorialVentas.jsx`
- Tabla con columnas: Fecha, Cliente, Total, Acciones
- Botón "Ver Detalles" que abre modal con items vendidos
- Agregar ruta en `App.jsx` dentro de `<RutaProtegida>`
- Agregar enlace en `BarraNavegacion.jsx`

### 🔲 2. Generación de Factura/Recibo (PRIORIDAD ALTA)
**Objetivo:** Generar comprobante imprimible al finalizar venta

**Opciones de implementación:**
- **Opción 1 (Más simple):** Modal de impresión con diseño de factura en HTML/CSS usando `window.print()`
- **Opción 2:** Generar PDF en el backend usando librería como `pdfkit` o `html-pdf`

**Campos del recibo:**
- Encabezado con datos de la librería
- Número de factura (ID de venta)
- Fecha y hora
- Datos del cliente
- Tabla de items (libro, cantidad, precio unitario, subtotal)
- Total de la venta
- Pie con mensaje de agradecimiento

### 🔲 3. Dashboard Avanzado con KPIs (PRIORIDAD MEDIA)
**Objetivo:** Actualizar Dashboard principal con estadísticas reales

**Backend:**
- Crear endpoint GET `/api/dashboard/estadisticas` que retorne:
  - Total de ventas del día
  - Total de ventas del mes
  - Producto más vendido (TOP 5)
  - Clientes con más compras
  - Libros con stock bajo (stock_actual < stock_minimo)
  - Ingresos totales del mes

**Frontend:**
- Actualizar `cliente/src/paginas/Inicio.jsx`
- Crear tarjetas (cards) con estadísticas visuales
- Gráficos opcionales (usar Chart.js o similar si se requiere)

### 🔲 4. Módulo de Proveedores (PRIORIDAD BAJA)
**Objetivo:** Implementar CRUD de proveedores (similar a Clientes)

**Backend:**
- Crear `servidor/controladores/proveedorControlador.js`
- Crear `servidor/rutas/proveedorRutas.js`
- Registrar rutas en `servidor/index.js`

**Frontend:**
- Crear `cliente/src/paginas/PaginaProveedores.jsx` (usar `PaginaClientes.jsx` como plantilla)
- Agregar ruta en `App.jsx`
- Agregar enlace en navegación

**Campos tabla proveedores:** id, nombre_empresa, contacto, email, telefono, direccion

## Convenciones de Código Importantes

### Manejo de Errores en Controladores
Patrón consistente en todos los controladores:
```javascript
exports.crearAlgo = async (req, res) => {
  try {
    // Lógica aquí
    const [resultado] = await db.query('INSERT INTO ...');
    res.json({ mensaje: 'Creado exitosamente' });
  } catch (error) {
    // Error de duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe ese registro' });
    }
    // Error de clave foránea
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'No se puede eliminar: tiene registros relacionados' });
    }
    // Error genérico
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
```

### Formato de Respuestas de API
```javascript
// Éxito
res.json({ mensaje: "Operación exitosa" });
// o bien
res.json(arrayDeDatos);

// Error
res.status(400).json({ error: "Mensaje de error" });
```

### Consultas a Base de Datos
SIEMPRE usar prepared statements:
```javascript
const db = require('../configuracion/db');

// ✅ CORRECTO - Con parámetros
const [filas] = await db.query('SELECT * FROM libros WHERE id = ?', [id]);

// ❌ INCORRECTO - Concatenación directa (vulnerable a SQL injection)
const [filas] = await db.query(`SELECT * FROM libros WHERE id = ${id}`);
```

### Transacciones (Para operaciones críticas como ventas)
```javascript
const conexion = await db.getConnection();
try {
  await conexion.beginTransaction();

  // Operación 1
  await conexion.query('INSERT INTO ventas ...');

  // Operación 2
  await conexion.query('INSERT INTO detalle_ventas ...');

  // Operación 3
  await conexion.query('UPDATE libros SET stock_actual = stock_actual - ? ...');

  await conexion.commit();
  res.json({ mensaje: 'Venta registrada' });
} catch (error) {
  await conexion.rollback();
  res.status(500).json({ error: 'Error en la transacción' });
} finally {
  conexion.release();
}
```

## Archivos Clave para Entender

- [cliente/src/App.jsx](cliente/src/App.jsx) - Configuración de rutas y estructura de layout
- [cliente/src/contexto/AuthContext.jsx](cliente/src/contexto/AuthContext.jsx) - Gestión de estado de autenticación
- [cliente/src/servicios/api.js](cliente/src/servicios/api.js) - Configuración de Axios
- [servidor/index.js](servidor/index.js) - Punto de entrada del servidor con todas las rutas
- [servidor/configuracion/db.js](servidor/configuracion/db.js) - Pool de conexiones MySQL
- [servidor/controladores/](servidor/controladores/) - Lógica de negocio de cada módulo
- [servidor/rutas/](servidor/rutas/) - Definición de endpoints RESTful

## Escenarios Comunes de Desarrollo

### Agregar una Nueva Entidad/Recurso
1. **Backend:**
   - Crear `servidor/controladores/nombreControlador.js` con métodos CRUD
   - Crear `servidor/rutas/nombreRutas.js` vinculando endpoints a controlador
   - Registrar ruta en `servidor/index.js`: `app.use('/api/nombre', rutasNombre);`

2. **Frontend:**
   - Crear `cliente/src/paginas/PaginaNombre.jsx`
   - Agregar ruta en `cliente/src/App.jsx` dentro de `<RutaProtegida>`
   - Agregar enlace en `cliente/src/componentes/BarraNavegacion.jsx`

### Agregar un Nuevo Endpoint a Módulo Existente
```javascript
// En servidor/rutas/nombreRutas.js
router.get('/nuevo-endpoint', controlador.nuevoMetodo);

// En servidor/controladores/nombreControlador.js
exports.nuevoMetodo = async (req, res) => {
  try {
    const [datos] = await db.query('SELECT ...');
    res.json(datos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
};
```

### Consumir API desde Frontend
```javascript
import api from '../servicios/api';

// Dentro de componente React
useEffect(() => {
  const cargarDatos = async () => {
    try {
      const respuesta = await api.get('/libros');
      setLibros(respuesta.data);
    } catch (error) {
      console.error('Error al cargar libros:', error);
    }
  };
  cargarDatos();
}, []);
```

## Notas Finales

- **Proyecto académico SENA** - Enfoque en buenas prácticas y código limpio
- **Todo en español** para facilitar comprensión del equipo
- **Bootstrap 5** para diseño rápido y responsivo
- **No over-engineering** - Mantener soluciones simples y directas
- **Priorizar funcionalidad** sobre optimizaciones prematuras
