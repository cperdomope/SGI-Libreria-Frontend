Documentación Completa de la API
Sistema de Gestión de Inventario - Librería

Actividad: AA5-EV03 - Diseño y Desarrollo de Servicios Web
Institución: SENA (Servicio Nacional de Aprendizaje)
# Aprendices: ## Luz Darlys González Torres - Yaniri Michell Martínez Ramírez - Carlos Ivan Perdomo
Fecha: Diciembre 2025
Versión API: 1.0

Tabla de Contenidos

1. [Información General](#información-general)
2. [Autenticación y Seguridad](#autenticación-y-seguridad)
3. [Arquitectura de la API](#arquitectura-de-la-api)
4. [Endpoints por Módulo](#endpoints-por-módulo)
   - [Autenticación](#1-módulo-de-autenticación)
   - [Libros](#2-módulo-de-libros-inventario)
   - [Movimientos](#3-módulo-de-movimientos-kardex)
   - [Dashboard](#4-módulo-de-dashboard)
   - [Clientes](#5-módulo-de-clientes)
   - [Ventas](#6-módulo-de-ventas)
   - [Proveedores](#7-módulo-de-proveedores)
   - [Autores](#8-módulo-de-autores)
   - [Categorías](#9-módulo-de-categorías)
5. [Códigos de Estado HTTP](#códigos-de-estado-http)
6. [Ejemplos de Uso](#ejemplos-de-uso)



 Información General

Descripción del Sistema

Sistema de gestión de inventario completo desarrollado con arquitectura REST API, que permite administrar el inventario de una librería, gestionar ventas, clientes, proveedores, autores y categorías con un sistema de autenticación seguro basado en JWT.

 URL Base del API


http://localhost:3000/api


Formato de Datos

- Request: JSON (application/json)
- Response: JSON (application/json)
- Encoding: UTF-8

# Tecnologías Implementadas

- Backend:** Node.js + Express 5.1.0
- Base de Datos:** MySQL 8.0
- Autenticación:** JWT (JSON Web Tokens)
- Seguridad:** bcryptjs para hash de contraseñas
- CORS: Habilitado para comunicación frontend-backend


# Autenticación y Seguridad

# Sistema de Autenticación JWT

Todos los endpoints (excepto `/api/auth/login` y `/api/auth/registro`) requieren autenticación mediante token JWT.

# Header Requerido


Authorization: Bearer <token_jwt>


# Ejemplo de Header Completo

http
GET /api/libros HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...


### Sistema de Roles (RBAC)

El sistema implementa *Control de Acceso Basado en Roles* con dos roles:

| Rol | ID | Permisos |
|-----|----|----|
| Administrador | 1 | Acceso completo a todos los módulos |
| Vendedor | 2 | Acceso limitado a POS, ventas, clientes (lectura de inventario) |

# Credenciales de Prueba

*Administrador:*
- Email: `admin@sena.edu.co`
- Password: `123456`

*Vendedor:*
- Email: `vendedor@sena.edu.co`
- Password: `vendedor123`

### Medidas de Seguridad Implementadas

1. **Protección contra Fuerza Bruta**
   - Bloqueo temporal (3 minutos) después de 3 intentos fallidos
   - Contador de intentos restantes

2. **Encriptación de Contraseñas**
   - Hash con bcrypt (10 salt rounds)
   - Nunca se almacenan contraseñas en texto plano

3. **Tokens JWT**
   - Tiempo de expiración: 8 horas
   - Firmados con clave secreta (JWT_SECRET)

4. **CORS Configurado**
   - Solo acepta peticiones del origen especificado
   - Credentials habilitadas

5. **Validación de Datos**
   - Validación de campos requeridos
   - Verificación de integridad referencial
   - Prevención de duplicados


# Arquitectura de la API

# Patrón MVC Implementado


servidor/
├── configuracion/        # Configuración de conexión a BD
│   └── db.js
├── controladores/        # Lógica de negocio
│   ├── controladorAuth.js
│   ├── controladorLibros.js
│   ├── controladorMovimientos.js
│   ├── controladorDashboard.js
│   ├── clienteControlador.js
│   ├── ventaControlador.js
│   ├── proveedorControlador.js
│   ├── autorControlador.js
│   └── categoriaControlador.js
├── middlewares/          # Seguridad y validaciones
│   ├── verificarToken.js
│   └── verificarRol.js
├── rutas/                # Definición de endpoints
│   ├── rutasAuth.js
│   ├── rutasLibros.js
│   ├── rutasMovimientos.js
│   ├── rutasDashboard.js
│   ├── clienteRutas.js
│   ├── ventaRutas.js
│   ├── proveedorRutas.js
│   ├── autorRutas.js
│   └── categoriaRutas.js
└── index.js              # Servidor principal


### Flujo de Request-Response


Cliente → Servidor Express → CORS Middleware → JSON Parser
  → Ruta → verificarToken → verificarRol → Controlador
  → Base de Datos MySQL → Respuesta JSON → Cliente


# Middlewares Implementados

1. **verificarToken:** Valida el JWT en cada petición
2. **verificarRol:** Verifica permisos según rol de usuario
3. **soloAdministrador:** Middleware pre-configurado para admins
4. **administradorOVendedor:** Middleware para ambos roles



# Endpoints por Módulo

# 1. Módulo de Autenticación

**Ruta base:** `/api/auth`

# 1.1. Registro de Usuario

Registra un nuevo usuario en el sistema.

*Endpoint:* `POST /api/auth/registro`
*Autenticación:* No requerida
*Rol requerido:* Ninguno

# Request Body

```json
{
  "nombre_completo": "Juan Pérez García",
  "email": "juan.perez@email.com",
  "password": "contraseña123",
  "rol_id": 2
}
```

# Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre_completo | string | Sí | Nombre completo del usuario |
| email | string | Sí | Correo electrónico (único) |
| password | string | Sí | Contraseña (será encriptada) |
| rol_id | integer | Sí | ID del rol (1: Admin, 2: Vendedor) |

# Respuesta Exitosa (201 Created)

```json
{
  "mensaje": "Usuario registrado exitosamente",
  "exito": true,
  "usuario": {
    "id": 5,
    "nombre_completo": "Juan Pérez García",
    "email": "juan.perez@email.com",
    "rol_id": 2
  }
}
```

# Respuesta Error - Email Duplicado (409 Conflict)

```json
{
  "error": "El correo electrónico ya está registrado"
}
```

# Respuesta Error - Campos Faltantes (400 Bad Request)

```json
{
  "error": "Todos los campos son obligatorios",
  "campos_requeridos": ["nombre_completo", "email", "password", "rol_id"]
}
```

---

# 1.2. Inicio de Sesión (Login)

Autentica un usuario y genera un token JWT.

**Endpoint:** `POST /api/auth/login`
**Autenticación:** No requerida
**Rol requerido:** Ninguno

# Request Body

```json
{
  "email": "admin@sena.edu.co",
  "password": "123456"
}
```

# Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| email | string | Sí | Correo electrónico registrado |
| password | string | Sí | Contraseña del usuario |

# Respuesta Exitosa (200 OK)

```json
{
  "mensaje": "Autenticación satisfactoria",
  "exito": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoxLCJub21icmUiOiJBZG1pbmlzdHJhZG9yIFNFTkEiLCJlbWFpbCI6ImFkbWluQHNlbmEuZWR1LmNvIiwiaWF0IjoxNzAxMjAwMDAwLCJleHAiOjE3MDEyMjg4MDB9.xyz123",
  "usuario": {
    "id": 1,
    "nombre": "Administrador SENA",
    "email": "admin@sena.edu.co",
    "rol_id": 1
  }
}
```

# Respuesta Error - Credenciales Incorrectas (401 Unauthorized)

```json
{
  "error": "Credenciales incorrectas",
  "exito": false,
  "intentosRestantes": 2,
  "mensaje": "El correo electrónico o la contraseña son incorrectos. Tiene 2 intento(s) restante(s)."
}
```

# Respuesta Error - Cuenta Bloqueada (429 Too Many Requests)

```json
{
  "error": "Su cuenta ha sido bloqueada temporalmente por seguridad. Por favor, espere 3 minuto(s) antes de intentar nuevamente.",
  "exito": false,
  "bloqueado": true,
  "minutosRestantes": 3
}
```

# Respuesta Error - Usuario Inactivo (403 Forbidden)

```json
{
  "error": "Usuario inactivo. Contacte al administrador del sistema.",
  "exito": false
}
```

---

# 2. Módulo de Libros (Inventario)

**Ruta base:** `/api/libros`
**Autenticación:** Requerida (JWT)

# 2.1. Obtener Todos los Libros

**Endpoint:** `GET /api/libros`
**Rol requerido:** Administrador o Vendedor
**Descripción:** Obtiene listado completo de libros con información de autor y categoría

# Headers

```
Authorization: Bearer <token>
```

# Query Parameters (Opcionales)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| categoria_id | integer | Filtrar por categoría | ?categoria_id=1 |
| autor_id | integer | Filtrar por autor | ?autor_id=2 |
| stock_bajo | boolean | Solo libros con stock bajo | ?stock_bajo=true |

# Respuesta Exitosa (200 OK)

```json
{
  "exito": true,
  "cantidad": 3,
  "libros": [
    {
      "id": 1,
      "isbn": "978-3-16-148410-0",
      "titulo": "Cien Años de Soledad",
      "descripcion": "Obra maestra del realismo mágico",
      "precio_venta": 45000.00,
      "stock_actual": 15,
      "stock_minimo": 5,
      "autor_id": 1,
      "autor_nombre": "Gabriel García Márquez",
      "categoria_id": 1,
      "categoria_nombre": "Literatura",
      "fecha_creacion": "2024-12-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "isbn": "978-84-376-0494-7",
      "titulo": "Don Quijote de la Mancha",
      "descripcion": "Clásico de la literatura española",
      "precio_venta": 38000.00,
      "stock_actual": 3,
      "stock_minimo": 5,
      "autor_id": 2,
      "autor_nombre": "Miguel de Cervantes",
      "categoria_id": 1,
      "categoria_nombre": "Literatura",
      "fecha_creacion": "2024-12-01T10:05:00.000Z"
    }
  ]
}
```

---

# 2.2. Crear Nuevo Libro

**Endpoint:** `POST /api/libros`
**Rol requerido:** Solo Administrador
**Descripción:** Registra un nuevo libro en el inventario

# Request Body

```json
{
  "isbn": "978-84-204-8250-8",
  "titulo": "La Casa de los Espíritus",
  "descripcion": "Primera novela de Isabel Allende",
  "precio_venta": 42000.00,
  "stock_actual": 10,
  "stock_minimo": 3,
  "autor_id": 3,
  "categoria_id": 1
}
```

# Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| isbn | string | Sí | ISBN único del libro |
| titulo | string | Sí | Título del libro |
| descripcion | string | No | Descripción o sinopsis |
| precio_venta | decimal | Sí | Precio de venta al público |
| stock_actual | integer | Sí | Cantidad en inventario |
| stock_minimo | integer | Sí | Stock mínimo para alertas |
| autor_id | integer | Sí | ID del autor (FK) |
| categoria_id | integer | Sí | ID de la categoría (FK) |

# Respuesta Exitosa (201 Created)

```json
{
  "mensaje": "Libro creado exitosamente",
  "exito": true,
  "libro": {
    "id": 15,
    "isbn": "978-84-204-8250-8",
    "titulo": "La Casa de los Espíritus",
    "precio_venta": 42000.00,
    "stock_actual": 10
  }
}
```

# Respuesta Error - ISBN Duplicado (409 Conflict)

```json
{
  "error": "Ya existe un libro con ese ISBN"
}
```

---

# 2.3. Actualizar Libro

**Endpoint:** `PUT /api/libros/:id`
**Rol requerido:** Solo Administrador
**Descripción:** Actualiza la información de un libro existente

# Parámetros de URL

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | ID del libro a actualizar |

# Request Body (Campos opcionales)

```json
{
  "titulo": "Cien Años de Soledad - Edición Conmemorativa",
  "precio_venta": 50000.00,
  "stock_actual": 20,
  "stock_minimo": 8
}
```

# Respuesta Exitosa (200 OK)

```json
{
  "mensaje": "Libro actualizado exitosamente",
  "exito": true
}
```

# Respuesta Error - Libro No Encontrado (404 Not Found)

```json
{
  "error": "Libro no encontrado"
}
```

---

# 2.4. Eliminar Libro

**Endpoint:** `DELETE /api/libros/:id`
**Rol requerido:** Solo Administrador
**Descripción:** Elimina un libro del sistema (solo si no tiene ventas asociadas)

# Parámetros de URL

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | ID del libro a eliminar |

# Respuesta Exitosa (200 OK)

```json
{
  "mensaje": "Libro eliminado exitosamente",
  "exito": true
}
```

# Respuesta Error - Libro con Ventas (409 Conflict)

```json
{
  "error": "No se puede eliminar el libro porque tiene ventas registradas"
}
```

---

# 3. Módulo de Movimientos (Kardex)

**Ruta base:** `/api/movimientos`
**Autenticación:** Requerida (JWT)
**Rol requerido:** Solo Administrador

# 3.1. Obtener Historial de Movimientos

**Endpoint:** `GET /api/movimientos`
**Descripción:** Obtiene el historial completo de entradas y salidas de inventario

# Query Parameters (Opcionales)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| libro_id | integer | Filtrar por libro | ?libro_id=5 |
| tipo_movimiento | string | ENTRADA o SALIDA | ?tipo_movimiento=ENTRADA |
| fecha_desde | date | Desde fecha | ?fecha_desde=2024-12-01 |
| fecha_hasta | date | Hasta fecha | ?fecha_hasta=2024-12-31 |

# Respuesta Exitosa (200 OK)

```json
{
  "exito": true,
  "cantidad": 25,
  "movimientos": [
    {
      "id": 1,
      "libro_id": 1,
      "libro_titulo": "Cien Años de Soledad",
      "tipo_movimiento": "ENTRADA",
      "cantidad": 20,
      "usuario_id": 1,
      "usuario_nombre": "Administrador SENA",
      "observaciones": "Compra a proveedor Editorial XYZ",
      "fecha": "2024-12-01T14:30:00.000Z"
    },
    {
      "id": 2,
      "libro_id": 1,
      "libro_titulo": "Cien Años de Soledad",
      "tipo_movimiento": "SALIDA",
      "cantidad": 5,
      "usuario_id": 2,
      "usuario_nombre": "Vendedor SENA",
      "observaciones": "Venta factura #001",
      "fecha": "2024-12-02T10:15:00.000Z"
    }
  ]
}
```

---

# 3.2. Registrar Movimiento

**Endpoint:** `POST /api/movimientos`
**Descripción:** Registra una entrada o salida de inventario y actualiza el stock

# Request Body

```json
{
  "libro_id": 1,
  "tipo_movimiento": "ENTRADA",
  "cantidad": 15,
  "observaciones": "Reabastecimiento mensual - Proveedor Libros SA"
}
```

# Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| libro_id | integer | Sí | ID del libro |
| tipo_movimiento | string | Sí | ENTRADA o SALIDA |
| cantidad | integer | Sí | Cantidad de unidades (>0) |
| observaciones | string | No | Notas adicionales |

# Respuesta Exitosa (201 Created)

```json
{
  "mensaje": "Movimiento registrado exitosamente",
  "exito": true,
  "movimiento": {
    "id": 26,
    "libro_id": 1,
    "tipo_movimiento": "ENTRADA",
    "cantidad": 15,
    "stock_nuevo": 30
  }
}
```

# Respuesta Error - Stock Insuficiente (400 Bad Request)

```json
{
  "error": "Stock insuficiente. Stock actual: 5, cantidad solicitada: 10"
}
```

---

# 4. Módulo de Dashboard

**Ruta base:** `/api/dashboard`
**Autenticación:** Requerida (JWT)
**Rol requerido:** Solo Administrador

# 4.1. Obtener Estadísticas Generales

**Endpoint:** `GET /api/dashboard/estadisticas`
**Descripción:** Obtiene métricas y estadísticas del sistema

# Respuesta Exitosa (200 OK)

```json
{
  "exito": true,
  "estadisticas": {
    "total_libros": 45,
    "total_categorias": 8,
    "total_autores": 12,
    "total_clientes": 34,
    "total_proveedores": 5,
    "ventas_hoy": {
      "cantidad": 8,
      "total": 345000.00
    },
    "ventas_mes": {
      "cantidad": 120,
      "total": 5430000.00
    },
    "stock_bajo": {
      "cantidad": 6,
      "libros": [
        {
          "id": 2,
          "titulo": "Don Quijote de la Mancha",
          "stock_actual": 3,
          "stock_minimo": 5
        }
      ]
    },
    "ultimas_ventas": [
      {
        "id": 45,
        "fecha": "2024-12-13T09:30:00.000Z",
        "cliente": "María González",
        "total": 42000.00
      }
    ]
  }
}
```

---

# 5. Módulo de Clientes

**Ruta base:** `/api/clientes`
**Autenticación:** Requerida (JWT)

# 5.1. Obtener Todos los Clientes

**Endpoint:** `GET /api/clientes`
**Rol requerido:** Administrador o Vendedor
**Descripción:** Lista todos los clientes registrados

# Respuesta Exitosa (200 OK)

```json
{
  "exito": true,
  "cantidad": 3,
  "clientes": [
    {
      "id": 1,
      "documento": "1234567890",
      "nombre_completo": "María González López",
      "email": "maria.gonzalez@email.com",
      "telefono": "3201234567",
      "direccion": "Calle 50 #30-20, Bogotá",
      "fecha_registro": "2024-11-15T10:00:00.000Z"
    }
  ]
}
```

---

# 5.2. Obtener Cliente por ID

**Endpoint:** `GET /api/clientes/:id`
**Rol requerido:** Administrador o Vendedor

# Respuesta Exitosa (200 OK)

```json
{
  "exito": true,
  "cliente": {
    "id": 1,
    "documento": "1234567890",
    "nombre_completo": "María González López",
    "email": "maria.gonzalez@email.com",
    "telefono": "3201234567",
    "direccion": "Calle 50 #30-20, Bogotá",
    "fecha_registro": "2024-11-15T10:00:00.000Z",
    "total_compras": 5,
    "monto_total": 215000.00
  }
}
```

---

# 5.3. Crear Cliente

**Endpoint:** `POST /api/clientes`
**Rol requerido:** Administrador o Vendedor
**Descripción:** Registra un nuevo cliente

# Request Body

```json
{
  "documento": "9876543210",
  "nombre_completo": "Carlos Ramírez Pérez",
  "email": "carlos.ramirez@email.com",
  "telefono": "3109876543",
  "direccion": "Carrera 15 #45-80, Medellín"
}
```

# Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| documento | string | Sí | Cédula o documento único |
| nombre_completo | string | Sí | Nombre completo |
| email | string | No | Correo electrónico |
| telefono | string | Sí | Número de teléfono |
| direccion | string | No | Dirección física |

# Respuesta Exitosa (201 Created)

```json
{
  "mensaje": "Cliente creado exitosamente",
  "exito": true,
  "cliente": {
    "id": 35,
    "documento": "9876543210",
    "nombre_completo": "Carlos Ramírez Pérez"
  }
}
```

---

# 5.4. Actualizar Cliente

**Endpoint:** `PUT /api/clientes/:id`
**Rol requerido:** Solo Administrador

# Request Body (Campos opcionales)

```json
{
  "telefono": "3109876544",
  "direccion": "Carrera 15 #45-81, Medellín"
}
```

# Respuesta Exitosa (200 OK)

```json
{
  "mensaje": "Cliente actualizado exitosamente",
  "exito": true
}
```

---

# 5.5. Eliminar Cliente

**Endpoint:** `DELETE /api/clientes/:id`
**Rol requerido:** Solo Administrador

# Respuesta Exitosa (200 OK)

```json
{
  "mensaje": "Cliente eliminado exitosamente",
  "exito": true
}
```

# Respuesta Error - Cliente con Ventas (409 Conflict)

```json
{
  "error": "No se puede eliminar el cliente porque tiene ventas registradas"
}
```


# 6. Módulo de Ventas

**Ruta base:** `/api/ventas`
**Autenticación:** Requerida (JWT)
**Rol requerido:** Administrador o Vendedor

# 6.1. Obtener Historial de Ventas

**Endpoint:** `GET /api/ventas`
**Descripción:** Lista todas las ventas realizadas

# Query Parameters (Opcionales)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| fecha_desde | date | Desde fecha |
| fecha_hasta | date | Hasta fecha |
| cliente_id | integer | Filtrar por cliente |

# Respuesta Exitosa (200 OK)

```json
{
  "exito": true,
  "cantidad": 50,
  "ventas": [
    {
      "id": 1,
      "cliente_id": 1,
      "cliente_nombre": "María González López",
      "usuario_id": 2,
      "vendedor_nombre": "Vendedor SENA",
      "metodo_pago": "EFECTIVO",
      "subtotal": 90000.00,
      "descuento": 0.00,
      "total": 90000.00,
      "fecha": "2024-12-10T14:30:00.000Z"
    }
  ]
}
```

# 6.2. Obtener Detalle de Venta

**Endpoint:** `GET /api/ventas/:id`
**Descripción:** Obtiene información detallada de una venta específica

# Respuesta Exitosa (200 OK)

```json
{
  "exito": true,
  "venta": {
    "id": 1,
    "cliente_id": 1,
    "cliente_nombre": "María González López",
    "cliente_documento": "1234567890",
    "vendedor_nombre": "Vendedor SENA",
    "metodo_pago": "EFECTIVO",
    "subtotal": 90000.00,
    "descuento": 0.00,
    "total": 90000.00,
    "fecha": "2024-12-10T14:30:00.000Z",
    "detalles": [
      {
        "id": 1,
        "libro_id": 1,
        "libro_titulo": "Cien Años de Soledad",
        "isbn": "978-3-16-148410-0",
        "cantidad": 2,
        "precio_unitario": 45000.00,
        "subtotal": 90000.00
      }
    ]
  }
}
```

---

# 6.3. Crear Venta (Procesar POS)

**Endpoint:** `POST /api/ventas`
**Descripción:** Registra una nueva venta (transacción completa)

# Request Body

```json
{
  "cliente_id": 1,
  "metodo_pago": "TARJETA_CREDITO",
  "descuento": 0.00,
  "items": [
    {
      "libro_id": 1,
      "cantidad": 2,
      "precio_unitario": 45000.00
    },
    {
      "libro_id": 3,
      "cantidad": 1,
      "precio_unitario": 35000.00
    }
  ]
}
```

# Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| cliente_id | integer | Sí | ID del cliente |
| metodo_pago | string | Sí | EFECTIVO, TARJETA_DEBITO, TARJETA_CREDITO, TRANSFERENCIA |
| descuento | decimal | No | Monto de descuento (default: 0) |
| items | array | Sí | Array de productos a vender |
| items[].libro_id | integer | Sí | ID del libro |
| items[].cantidad | integer | Sí | Cantidad a vender |
| items[].precio_unitario | decimal | Sí | Precio al momento de venta |

# Respuesta Exitosa (201 Created)

```json
{
  "mensaje": "Venta registrada exitosamente",
  "exito": true,
  "venta": {
    "id": 51,
    "total": 125000.00,
    "fecha": "2024-12-13T10:45:00.000Z"
  }
}
```

# Respuesta Error - Stock Insuficiente (400 Bad Request)

```json
{
  "error": "Stock insuficiente para el libro 'Cien Años de Soledad'. Stock disponible: 1, cantidad solicitada: 2"
}
```

---

# 7. Módulo de Proveedores

**Ruta base:** `/api/proveedores`
**Autenticación:** Requerida (JWT)
**Rol requerido:** Solo Administrador

# 7.1. Obtener Proveedores

**Endpoint:** `GET /api/proveedores`

# Respuesta Exitosa (200 OK)

```json
{
  "exito": true,
  "cantidad": 2,
  "proveedores": [
    {
      "id": 1,
      "nombre_empresa": "Distribuidora Libros SA",
      "nit": "900123456-7",
      "nombre_contacto": "Pedro Sánchez",
      "email": "contacto@distribuidora.com",
      "telefono": "6013456789",
      "direccion": "Calle 80 #15-30, Bogotá",
      "fecha_registro": "2024-11-01T10:00:00.000Z"
    }
  ]
}
```

---

# 7.2. Crear Proveedor

**Endpoint:** `POST /api/proveedores`

# Request Body

```json
{
  "nombre_empresa": "Editorial Planeta Colombia",
  "nit": "830123456-2",
  "nombre_contacto": "Laura Martínez",
  "email": "ventas@planeta.com.co",
  "telefono": "6017654321",
  "direccion": "Avenida El Dorado #69-76, Bogotá"
}
```

# Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre_empresa | string | Sí | Razón social |
| nit | string | Sí | NIT único |
| nombre_contacto | string | Sí | Persona de contacto |
| email | string | No | Email de contacto |
| telefono | string | Sí | Teléfono principal |
| direccion | string | No | Dirección física |

# Respuesta Exitosa (201 Created)

```json
{
  "mensaje": "Proveedor creado exitosamente",
  "exito": true,
  "proveedor": {
    "id": 6,
    "nombre_empresa": "Editorial Planeta Colombia"
  }
}
```

---

# 7.3. Actualizar Proveedor

**Endpoint:** `PUT /api/proveedores/:id`

# Request Body (Campos opcionales)

```json
{
  "telefono": "6017654322",
  "email": "nuevoemail@planeta.com.co"
}
```

---

# 7.4. Eliminar Proveedor

**Endpoint:** `DELETE /api/proveedores/:id`

---

# 8. Módulo de Autores

**Ruta base:** `/api/autores`
**Autenticación:** Requerida (JWT)

# 8.1. Obtener Autores

**Endpoint:** `GET /api/autores`
**Rol requerido:** Administrador o Vendedor (lectura)

# Respuesta Exitosa (200 OK)

```json
{
  "exito": true,
  "cantidad": 4,
  "autores": [
    {
      "id": 1,
      "nombre": "Gabriel García Márquez",
      "pais_origen": "Colombia",
      "biografia": "Escritor colombiano, premio Nobel de Literatura 1982",
      "total_libros": 5,
      "fecha_creacion": "2024-11-01T10:00:00.000Z"
    }
  ]
}
```

---

# 8.2. Crear Autor

**Endpoint:** `POST /api/autores`
**Rol requerido:** Solo Administrador

# Request Body

```json
{
  "nombre": "Isabel Allende",
  "pais_origen": "Chile",
  "biografia": "Escritora chilena de novelas y cuentos"
}
```

# Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | Sí | Nombre completo del autor |
| pais_origen | string | No | País de origen |
| biografia | string | No | Biografía breve |

---

# 8.3. Actualizar Autor

**Endpoint:** `PUT /api/autores/:id`
**Rol requerido:** Solo Administrador

---

# 8.4. Eliminar Autor

**Endpoint:** `DELETE /api/autores/:id`
**Rol requerido:** Solo Administrador
**Nota:** Solo se puede eliminar si no tiene libros asociados

# Respuesta Error - Autor con Libros (409 Conflict)

```json
{
  "error": "No se puede eliminar el autor porque tiene libros asociados. Total de libros: 5"
}
```

---

# 9. Módulo de Categorías

**Ruta base:** `/api/categorias`
**Autenticación:** Requerida (JWT)

# 9.1. Obtener Categorías

**Endpoint:** `GET /api/categorias`
**Rol requerido:** Administrador o Vendedor (lectura)

# Respuesta Exitosa (200 OK)

```json
{
  "exito": true,
  "cantidad": 5,
  "categorias": [
    {
      "id": 1,
      "nombre": "Literatura",
      "descripcion": "Novelas, cuentos y poesía",
      "total_libros": 12,
      "fecha_creacion": "2024-11-01T10:00:00.000Z"
    }
  ]
}
```

---

# 9.2. Crear Categoría

**Endpoint:** `POST /api/categorias`
**Rol requerido:** Solo Administrador

# Request Body

```json
{
  "nombre": "Ciencia Ficción",
  "descripcion": "Libros de ciencia ficción y fantasía"
}
```

# Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | Sí | Nombre único de la categoría |
| descripcion | string | No | Descripción de la categoría |

---

# 9.3. Actualizar Categoría

**Endpoint:** `PUT /api/categorias/:id`
**Rol requerido:** Solo Administrador

---

# 9.4. Eliminar Categoría

**Endpoint:** `DELETE /api/categorias/:id`
**Rol requerido:** Solo Administrador
**Nota:** Solo se puede eliminar si no tiene libros asociados

---

# Códigos de Estado HTTP

# Códigos de Éxito

| Código | Descripción | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa (GET, PUT, DELETE) |
| 201 | Created | Recurso creado exitosamente (POST) |

# Códigos de Error del Cliente

| Código | Descripción | Uso |
|--------|-------------|-----|
| 400 | Bad Request | Datos inválidos o campos faltantes |
| 401 | Unauthorized | No autenticado (token faltante/inválido) |
| 403 | Forbidden | Sin permisos (token válido pero rol insuficiente) |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (duplicados, violación de integridad) |
| 429 | Too Many Requests | Cuenta bloqueada por intentos fallidos |

# Códigos de Error del Servidor

| Código | Descripción | Uso |
|--------|-------------|-----|
| 500 | Internal Server Error | Error interno del servidor |



# Ejemplos de Uso

# Ejemplo 1: Flujo Completo de Login y Consulta

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sena.edu.co",
    "password": "admin123"
  }'

# Respuesta:
# { "token": "eyJhbGc...", "usuario": {...} }

# 2. Usar el token para consultar libros
curl -X GET http://localhost:3000/api/libros \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### Ejemplo 2: Crear Venta Completa

```bash
curl -X POST http://localhost:3000/api/ventas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "cliente_id": 1,
    "metodo_pago": "EFECTIVO",
    "items": [
      {
        "libro_id": 1,
        "cantidad": 2,
        "precio_unitario": 45000.00
      }
    ]
  }'
```

---

# Ejemplo 3: Registrar Movimiento de Entrada

```bash
curl -X POST http://localhost:3000/api/movimientos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "libro_id": 1,
    "tipo_movimiento": "ENTRADA",
    "cantidad": 20,
    "observaciones": "Compra a Editorial XYZ"
  }'
```

---

# Ejemplo 4: Manejo de Errores

```javascript
// Usando fetch en JavaScript
async function obtenerLibros() {
  const response = await fetch('http://localhost:3000/api/libros', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.error('Token inválido o expirado. Redirigir a login.');
    } else if (response.status === 403) {
      console.error('Sin permisos para esta operación.');
    } else {
      console.error('Error en la petición:', response.statusText);
    }
    return;
  }

  const data = await response.json();
  console.log('Libros:', data.libros);
}
```

---

# Notas Finales

# Buenas Prácticas

1. **Siempre incluir el token JWT** en requests autenticados
2. **Validar respuestas** antes de procesar datos
3. **Manejar errores** apropiadamente en el cliente
4. **Respetar los roles** - no intentar acciones no permitidas
5. **Usar HTTPS** en producción para mayor seguridad

# Variables de Entorno Requeridas

```env
# Servidor
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=inventario_libreria
JWT_SECRET=tu_clave_secreta_super_segura
CORS_ORIGIN=http://localhost:5173
```

# Contacto y Soporte

**Proyecto:** Sistema de Gestión de Inventario - Librería
**Institución:** SENA (Servicio Nacional de Aprendizaje)
**Actividad:** AA5-EV03 - Diseño y Desarrollo de Servicios Web

**Fecha de Documentación:** Diciembre 13, 2025
**Versión del Documento:** 1.0
