# Sistema de Gestión de Inventario - Librería

Sistema completo de gestión de inventario desarrollado como proyecto académico del SENA (Servicio Nacional de Aprendizaje). Permite administrar el inventario de una librería, gestionar ventas, clientes, proveedores, autores y categorías con un sistema de autenticación seguro.

## Descripción del Proyecto

Aplicación web completa que implementa un sistema de gestión de inventario para una librería, cumpliendo con las mejores prácticas de desarrollo web, seguridad y normalización de bases de datos (3NF). El sistema permite control completo del inventario mediante un sistema de kardex, gestión de ventas con punto de venta (POS), y administración de entidades relacionadas.

### Contexto Académico

- **Institución:** SENA (Servicio Nacional de Aprendizaje)
- **Nivel:** Grado 11
- **Tipo:** Proyecto de formación técnica
- **Objetivo:** Aplicar conocimientos de desarrollo web, bases de datos relacionales y seguridad informática

## Características Principales

### Módulos del Sistema

1. **Autenticación y Seguridad**
   - Sistema de login con JWT (JSON Web Tokens)
   - **Control de Acceso Basado en Roles (RBAC)** - Dos roles: Administrador y Vendedor
   - Middleware de verificación de roles para protección de endpoints
   - Protección de rutas en frontend basada en permisos
   - Protección contra ataques de fuerza bruta (bloqueo después de 3 intentos fallidos por 3 minutos)
   - Encriptación de contraseñas con bcrypt
   - Rutas protegidas con verificación de token
   - CORS configurado para mayor seguridad

2. **Gestión de Inventario**
   - Registro completo de libros (ISBN, título, descripción, precio, stock)
   - Control de stock actual y stock mínimo
   - Alertas de inventario bajo
   - Relación con autores y categorías

3. **Sistema de Movimientos (Kardex)**
   - Registro de todas las entradas y salidas de inventario
   - Auditoría completa de movimientos
   - Trazabilidad por usuario
   - Observaciones detalladas por movimiento

4. **Punto de Venta (POS)**
   - Interfaz moderna para registro de ventas
   - Selección de cliente y productos
   - Cálculo automático de totales
   - Generación de detalles de venta
   - Actualización automática de inventario

5. **Historial de Ventas**
   - Visualización de todas las ventas realizadas
   - Detalles completos de cada venta
   - Información de cliente y productos vendidos
   - Exportación de reportes

6. **Gestión de Clientes**
   - Registro completo de clientes
   - Datos de contacto y ubicación
   - Historial de compras
   - Validación de documento único

7. **Gestión de Proveedores**
   - Registro de empresas proveedoras
   - Datos de contacto (NIT, email, teléfono)
   - Información de ubicación
   - Historial de relaciones comerciales

8. **Gestión de Autores**
   - CRUD completo de autores
   - Validación de asociaciones antes de eliminar
   - Conteo de libros por autor

9. **Gestión de Categorías**
   - CRUD completo de categorías
   - Validación de nombres únicos
   - Organización del catálogo

10. **Dashboard/Inicio**
    - Estadísticas generales del sistema
    - Resumen de inventario
    - Métricas de ventas

## Tecnologías Utilizadas

### Backend

- **Node.js** - Entorno de ejecución de JavaScript
- **Express 5.1.0** - Framework web para Node.js
- **MySQL 2** - Base de datos relacional
- **JWT (jsonwebtoken 9.0.2)** - Autenticación basada en tokens
- **bcryptjs 3.0.3** - Encriptación de contraseñas
- **CORS 2.8.5** - Control de acceso entre orígenes
- **dotenv 17.2.3** - Gestión de variables de entorno

### Frontend

- **React 19.2.0** - Librería de interfaces de usuario
- **Vite 7.2.4** - Herramienta de construcción y servidor de desarrollo
- **React Router DOM 7.9.6** - Enrutamiento en React
- **Axios 1.13.2** - Cliente HTTP para peticiones API
- **Bootstrap 5.3.8** - Framework CSS para estilos
- **ESLint 9.39.1** - Linter para calidad de código

## Estructura de Base de Datos

### Tablas Principales

```
inventario_libreria/
├── roles                 # Roles de usuario (Administrador, Vendedor)
├── usuarios              # Usuarios del sistema con autenticación
├── autores               # Autores de libros
├── categorias            # Categorías de libros
├── libros                # Inventario de libros
├── movimientos           # Kardex - Entradas y salidas
├── clientes              # Registro de clientes
├── proveedores           # Registro de proveedores
├── ventas                # Cabecera de facturas
└── detalle_ventas        # Items de cada venta
```

### Normalización

La base de datos está normalizada en Tercera Forma Normal (3NF):
- Sin redundancia de datos
- Separación de entidades en tablas independientes
- Relaciones mediante claves foráneas
- Integridad referencial garantizada

## Instalación

### Requisitos Previos

- Node.js (versión 16 o superior)
- MySQL (versión 8.0 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd proyecto-inventario
   ```

2. **Configurar Base de Datos**
   ```bash
   mysql -u root -p < base_datos/script_inicial.sql
   ```

3. **Configurar Backend**
   ```bash
   cd servidor
   npm install
   ```

4. **Crear archivo .env en la carpeta servidor**
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=inventario_libreria
   JWT_SECRET=tu_clave_secreta_super_segura
   CORS_ORIGIN=http://localhost:5173
   ```

5. **Configurar Frontend**
   ```bash
   cd ../cliente
   npm install
   ```

6. **Crear archivo .env en la carpeta cliente**
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

## Ejecución

### Iniciar Backend
```bash
cd servidor
node index.js
```
El servidor estará disponible en `http://localhost:3000`

### Iniciar Frontend
```bash
cd cliente
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

## Credenciales de Acceso

### Sistema de Roles

El sistema cuenta con **dos roles** con diferentes niveles de acceso:

**Usuario Administrador (Acceso Total):**
- Email: `admin@sena.edu.co`
- Contraseña: `admin123`
- **Permisos:** Acceso completo a todos los módulos del sistema

**Usuario Vendedor (Acceso Limitado):**
- Email: `vendedor@sena.edu.co`
- Contraseña: `vendedor123`
- **Permisos:**
  - ✅ Punto de Venta (POS) - Registrar ventas
  - ✅ Historial de Ventas - Consultar ventas realizadas
  - ✅ Clientes - Ver y crear clientes (no puede editar ni eliminar)
  - ✅ Inventario - Solo lectura (consultar precios y stock)
  - ✅ Autores y Categorías - Solo lectura
  - ❌ Dashboard, Proveedores, Movimientos - Sin acceso

> **Importante:** Cambiar estas credenciales en un entorno de producción

## Estructura del Proyecto

```
proyecto-inventario/
├── base_datos/                    # Scripts SQL
│   ├── script_inicial.sql         # Creación de BD y datos semilla
│   ├── migracion_metodo_pago.sql  # Migraciones adicionales
│   └── verificar_estructura_ventas.sql
│
├── servidor/                      # Backend (Node.js + Express)
│   ├── configuracion/
│   │   └── db.js                 # Configuración de MySQL
│   ├── controladores/
│   │   ├── controladorAuth.js    # Autenticación y login
│   │   ├── libroControlador.js   # CRUD de libros
│   │   ├── movimientoControlador.js
│   │   ├── dashboardControlador.js
│   │   ├── clienteControlador.js
│   │   ├── proveedorControlador.js
│   │   ├── ventaControlador.js
│   │   ├── autorControlador.js
│   │   └── categoriaControlador.js
│   ├── middlewares/
│   │   ├── verificarToken.js     # Middleware JWT
│   │   └── verificarRol.js       # Middleware RBAC (roles)
│   ├── rutas/
│   │   ├── rutasAuth.js
│   │   ├── rutasLibros.js
│   │   ├── rutasMovimientos.js
│   │   ├── rutasDashboard.js
│   │   ├── clienteRutas.js
│   │   ├── proveedorRutas.js
│   │   ├── ventaRutas.js
│   │   ├── autorRutas.js
│   │   └── categoriaRutas.js
│   ├── scripts/
│   │   └── reset_password.js     # Script para resetear contraseñas
│   ├── .env
│   ├── index.js                  # Punto de entrada del servidor
│   └── package.json
│
└── cliente/                       # Frontend (React + Vite)
    ├── public/
    ├── src/
    │   ├── componentes/
    │   │   ├── BarraNavegacion.jsx      # Menú de navegación con iconos
    │   │   ├── RutaProtegida.jsx        # HOC para rutas autenticadas
    │   │   └── RutaProtegidaPorRol.jsx  # HOC para rutas con permisos
    │   ├── contexto/
    │   │   └── AuthContext.jsx          # Contexto de autenticación y permisos
    │   ├── paginas/
    │   │   ├── Acceso.jsx           # Página de login
    │   │   ├── Inicio.jsx           # Dashboard
    │   │   ├── Inventario.jsx       # Gestión de libros
    │   │   ├── Movimientos.jsx      # Kardex
    │   │   ├── PaginaClientes.jsx   # Gestión de clientes
    │   │   ├── PaginaVentas.jsx     # Punto de Venta (POS)
    │   │   ├── HistorialVentas.jsx  # Historial de ventas
    │   │   ├── PaginaProveedores.jsx # Gestión de proveedores
    │   │   ├── PaginaAutores.jsx    # Gestión de autores
    │   │   └── PaginaCategorias.jsx # Gestión de categorías
    │   ├── servicios/
    │   │   └── api.js               # Configuración de Axios con JWT
    │   ├── App.jsx                  # Componente principal
    │   └── main.jsx                 # Punto de entrada
    ├── .env
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Libros
- `GET /api/libros` - Obtener todos los libros
- `POST /api/libros` - Crear libro
- `PUT /api/libros/:id` - Actualizar libro
- `DELETE /api/libros/:id` - Eliminar libro

### Movimientos
- `GET /api/movimientos` - Obtener historial de movimientos
- `POST /api/movimientos` - Registrar movimiento

### Clientes
- `GET /api/clientes` - Obtener clientes
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Proveedores
- `GET /api/proveedores` - Obtener proveedores
- `POST /api/proveedores` - Crear proveedor
- `PUT /api/proveedores/:id` - Actualizar proveedor
- `DELETE /api/proveedores/:id` - Eliminar proveedor

### Autores
- `GET /api/autores` - Obtener autores
- `POST /api/autores` - Crear autor
- `PUT /api/autores/:id` - Actualizar autor
- `DELETE /api/autores/:id` - Eliminar autor (valida asociaciones)

### Categorías
- `GET /api/categorias` - Obtener categorías
- `POST /api/categorias` - Crear categoría
- `PUT /api/categorias/:id` - Actualizar categoría
- `DELETE /api/categorias/:id` - Eliminar categoría (valida unicidad)

### Ventas
- `GET /api/ventas` - Obtener historial de ventas
- `GET /api/ventas/:id` - Obtener detalle de venta
- `POST /api/ventas` - Registrar venta

### Dashboard
- `GET /api/dashboard/estadisticas` - Obtener estadísticas generales

> **Nota:** Todos los endpoints (excepto /api/auth/login) requieren autenticación vía token JWT en el header:
> ```
> Authorization: Bearer <token>
> ```

## Seguridad Implementada

### Medidas de Seguridad

1. **Autenticación JWT**
   - Tokens con expiración
   - Verificación en cada petición protegida
   - Almacenamiento seguro en localStorage

2. **Protección de Contraseñas**
   - Hash con bcrypt (10 rounds)
   - No se almacenan contraseñas en texto plano
   - Script de reseteo seguro

3. **Protección contra Fuerza Bruta**
   - Bloqueo temporal de cuenta (3 minutos) después de 3 intentos fallidos
   - Mensajes informativos sin revelar si el usuario existe
   - Contador de intentos restantes

4. **CORS Configurado**
   - Solo acepta peticiones del origen especificado en .env
   - Credentials habilitadas para cookies y headers

5. **Variables de Entorno**
   - Datos sensibles en archivos .env
   - No se suben al repositorio (.gitignore)
   - Configuración separada por entorno

6. **Control de Acceso Basado en Roles (RBAC)**
   - Sistema de roles jerárquicos (Administrador, Vendedor)
   - Middleware de verificación de roles en backend
   - Protección de rutas en frontend basada en permisos
   - Ocultamiento de elementos UI según permisos
   - Doble capa de seguridad: Frontend + Backend

7. **Validación de Datos**
   - Validación en backend de todos los campos
   - Verificación de integridad referencial
   - Prevención de duplicados

## Mejoras y Actualizaciones Recientes

### Versión Actual (Diciembre 2025)

#### Sistema de Control de Acceso por Roles (RBAC)
- **Implementación completa de roles:** Administrador y Vendedor
- **Middleware verificarRol.js:** Protección de endpoints por rol
- **Componente RutaProtegidaPorRol:** Protección de rutas en frontend
- **Sistema de permisos granular:** Control específico por acción (ver, crear, editar, eliminar)
- **Validación de permisos en UI:** Ocultamiento de botones según rol
- **Doble capa de seguridad:** Frontend oculta opciones + Backend bloquea peticiones
- **Scripts de verificación:** Herramientas para probar el sistema RBAC

#### Nuevas Funcionalidades
- Implementación completa de gestión de Autores (CRUD)
- Implementación completa de gestión de Categorías (CRUD)
- Selects dinámicos en Inventario cargados desde API
- Validación de asociaciones antes de eliminar autores
- Prevención de categorías duplicadas

#### Mejoras de UI/UX
- Tabla de proveedores completamente responsiva con breakpoints Bootstrap
- Efecto hover mejorado en tabla de proveedores (color verde #c3f0ca)
- Centralización de texto en todas las tablas
- Scroll horizontal para tablas en dispositivos móviles
- Prevención de traducción automática en campos técnicos (atributo translate="no")
- Iconos SVG personalizados para menú de navegación
- Mejora en mensajes de error de autenticación

#### Seguridad
- Reducción de tiempo de bloqueo de 15 a 3 minutos (apropiado para entorno educativo)
- Mensajes de error más profesionales y claros
- Corrección en script de reseteo de contraseñas

#### Correcciones
- Fix: Campo "Dirección" ahora visible en tabla de proveedores
- Fix: Campo "Documento" ya no aparece en mayúsculas
- Fix: Modales funcionando correctamente
- Fix: Responsividad de botones de acción en tablas

## Uso del Sistema

### Flujo de Trabajo Típico

1. **Inicio de Sesión**
   - Acceder a la aplicación
   - Ingresar credenciales
   - Sistema verifica y genera token JWT

2. **Configuración Inicial**
   - Registrar autores de libros
   - Crear categorías de clasificación
   - Registrar proveedores

3. **Gestión de Inventario**
   - Agregar libros al catálogo
   - Asociar con autor y categoría
   - Definir precios y stock mínimo

4. **Registro de Movimientos**
   - Registrar entradas (compras a proveedores)
   - Sistema actualiza stock automáticamente
   - Agregar observaciones relevantes

5. **Gestión de Clientes**
   - Registrar nuevos clientes
   - Actualizar información de contacto
   - Consultar historial de compras

6. **Proceso de Venta**
   - Acceder al módulo POS
   - Seleccionar cliente
   - Agregar productos al carrito
   - Confirmar venta
   - Sistema genera factura y actualiza inventario

7. **Reportes y Consultas**
   - Consultar historial de ventas
   - Ver detalles de transacciones
   - Analizar estadísticas en dashboard

## Pruebas

### Datos de Prueba

El sistema incluye datos semilla para facilitar las pruebas:
- 2 roles (Administrador, Vendedor)
- 1 usuario administrador
- 5 categorías
- 4 autores
- 3 libros de ejemplo
- 3 clientes de prueba
- 2 proveedores de prueba

## Solución de Problemas

### Error: No se puede conectar a la base de datos
- Verificar que MySQL esté corriendo
- Confirmar credenciales en archivo .env
- Verificar que la base de datos existe

### Error: Token inválido o expirado
- Cerrar sesión y volver a iniciar
- Verificar JWT_SECRET en .env del servidor

### Error: CORS bloqueando peticiones
- Verificar CORS_ORIGIN en .env del servidor
- Confirmar que coincide con la URL del frontend

### Error: No se pueden eliminar autores/categorías
- Sistema valida que no haya libros asociados
- Primero eliminar o reasignar libros relacionados

## Contribuciones

Este es un proyecto académico del SENA. Para contribuir:

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto fue desarrollado con fines educativos para el SENA (Servicio Nacional de Aprendizaje).

## Autores

Proyecto desarrollado por estudiantes de Grado 11 - SENA

## Contacto y Soporte

Para preguntas o soporte sobre este proyecto académico, contactar a través de los canales institucionales del SENA.

---

**Proyecto SENA - Sistema de Gestión de Inventario para Librería**

*Desarrollado como parte del programa de formación técnica - 2025*
