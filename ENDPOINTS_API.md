# ENDPOINTS DE LA API - Sistema de Gestión de Inventario

## Información del Proyecto
**Evidencia:** GA7-220501096-AA5-EV02 API
**Aprendiz:** Carlos Ivan Perdomo
**Institución:** SENA
**Base URL:** `http://localhost:3000`

---

## 📋 ÍNDICE DE MÓDULOS

1. [Autenticación](#1-autenticación)
2. [Libros](#2-libros)
3. [Clientes](#3-clientes)
4. [Proveedores](#4-proveedores)
5. [Ventas](#5-ventas)
6. [Movimientos](#6-movimientos)
7. [Dashboard](#7-dashboard)

---

## 1. AUTENTICACIÓN

### 1.1 Registro de Usuario
**Endpoint:** `POST /api/auth/registro`
**Descripción:** Registra un nuevo usuario en el sistema
**Autenticación:** No requerida

**Body (JSON):**
```json
{
  "nombre_completo": "Juan Pérez",
  "email": "juan@libreria.com",
  "password": "segura123",
  "rol_id": 2
}
```

**Respuesta Exitosa (201):**
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "exito": true,
  "usuario": {
    "id": 5,
    "nombre_completo": "Juan Pérez",
    "email": "juan@libreria.com",
    "rol_id": 2
  }
}
```

**Códigos de Estado:**
- `201` - Usuario creado exitosamente
- `400` - Campos faltantes
- `409` - Email ya registrado
- `500` - Error del servidor

---

### 1.2 Inicio de Sesión
**Endpoint:** `POST /api/auth/login`
**Descripción:** Autentica un usuario y genera token JWT
**Autenticación:** No requerida

**Body (JSON):**
```json
{
  "email": "juan@libreria.com",
  "password": "segura123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "mensaje": "Autenticación satisfactoria",
  "exito": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 5,
    "nombre": "Juan Pérez",
    "email": "juan@libreria.com",
    "rol_id": 2
  }
}
```

**Códigos de Estado:**
- `200` - Autenticación exitosa
- `400` - Campos faltantes
- `401` - Credenciales incorrectas
- `403` - Usuario inactivo
- `500` - Error del servidor

---

## 2. LIBROS

### 2.1 Obtener Todos los Libros
**Endpoint:** `GET /api/libros`
**Descripción:** Lista todos los libros del inventario
**Autenticación:** Requerida (Token JWT)

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "isbn": "978-0307474728",
    "titulo": "Cien Años de Soledad",
    "autor_id": 1,
    "categoria_id": 2,
    "precio_venta": 45000,
    "stock_actual": 15,
    "stock_minimo": 5
  }
]
```

---

### 2.2 Crear Nuevo Libro
**Endpoint:** `POST /api/libros`
**Descripción:** Registra un nuevo libro en el inventario
**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "isbn": "978-0132350884",
  "titulo": "Clean Code",
  "descripcion": "Manual de estilo para el desarrollo ágil de software",
  "precio_venta": 85000,
  "stock_actual": 10,
  "stock_minimo": 3,
  "autor_id": 2,
  "categoria_id": 1
}
```

**Respuesta Exitosa (201):**
```json
{
  "mensaje": "Libro creado exitosamente",
  "id": 12
}
```

**Códigos de Estado:**
- `201` - Libro creado
- `400` - Datos inválidos
- `500` - Error del servidor

---

### 2.3 Actualizar Libro
**Endpoint:** `PUT /api/libros/:id`
**Descripción:** Actualiza los datos de un libro existente
**Autenticación:** Requerida

**Parámetros URL:**
- `id` - ID del libro a actualizar

**Body (JSON):**
```json
{
  "titulo": "Clean Code - Edición Actualizada",
  "precio_venta": 90000,
  "stock_actual": 20
}
```

**Respuesta Exitosa (200):**
```json
{
  "mensaje": "Libro actualizado exitosamente"
}
```

**Códigos de Estado:**
- `200` - Actualización exitosa
- `404` - Libro no encontrado
- `500` - Error del servidor

---

### 2.4 Eliminar Libro
**Endpoint:** `DELETE /api/libros/:id`
**Descripción:** Elimina un libro del inventario
**Autenticación:** Requerida

**Parámetros URL:**
- `id` - ID del libro a eliminar

**Respuesta Exitosa (200):**
```json
{
  "mensaje": "Libro eliminado exitosamente"
}
```

**Códigos de Estado:**
- `200` - Eliminación exitosa
- `404` - Libro no encontrado
- `500` - Error del servidor

---

## 3. CLIENTES

### 3.1 Obtener Todos los Clientes
**Endpoint:** `GET /api/clientes`
**Descripción:** Lista todos los clientes registrados
**Autenticación:** Requerida

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre_completo": "María González",
    "documento": "1020304050",
    "email": "maria@email.com",
    "telefono": "3101234567",
    "direccion": "Calle 10 #20-30"
  }
]
```

---

### 3.2 Obtener Cliente por ID
**Endpoint:** `GET /api/clientes/:id`
**Descripción:** Obtiene la información de un cliente específico
**Autenticación:** Requerida

**Parámetros URL:**
- `id` - ID del cliente

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "nombre_completo": "María González",
  "documento": "1020304050",
  "email": "maria@email.com",
  "telefono": "3101234567",
  "direccion": "Calle 10 #20-30",
  "fecha_registro": "2024-12-01T10:00:00.000Z"
}
```

---

### 3.3 Crear Nuevo Cliente
**Endpoint:** `POST /api/clientes`
**Descripción:** Registra un nuevo cliente
**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "nombre_completo": "Pedro Ramírez",
  "documento": "1030405060",
  "email": "pedro@email.com",
  "telefono": "3209876543",
  "direccion": "Carrera 20 #15-25"
}
```

**Respuesta Exitosa (201):**
```json
{
  "mensaje": "Cliente creado exitosamente",
  "id": 8
}
```

---

### 3.4 Actualizar Cliente
**Endpoint:** `PUT /api/clientes/:id`
**Descripción:** Actualiza datos de un cliente existente
**Autenticación:** Requerida

**Parámetros URL:**
- `id` - ID del cliente

**Body (JSON):**
```json
{
  "telefono": "3201112233",
  "direccion": "Nueva Dirección Calle 30 #10-15"
}
```

**Respuesta Exitosa (200):**
```json
{
  "mensaje": "Cliente actualizado exitosamente"
}
```

---

### 3.5 Eliminar Cliente
**Endpoint:** `DELETE /api/clientes/:id`
**Descripción:** Elimina un cliente del sistema
**Autenticación:** Requerida

**Parámetros URL:**
- `id` - ID del cliente

**Respuesta Exitosa (200):**
```json
{
  "mensaje": "Cliente eliminado exitosamente"
}
```

---

## 4. PROVEEDORES

### 4.1 Obtener Todos los Proveedores
**Endpoint:** `GET /api/proveedores`
**Descripción:** Lista todos los proveedores registrados
**Autenticación:** Requerida

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre_empresa": "Distribuidora Libros S.A.",
    "contacto": "Juan Pérez",
    "email": "ventas@distlibros.com",
    "telefono": "6015551234",
    "direccion": "Calle 50 #30-20"
  }
]
```

---

### 4.2 Crear Nuevo Proveedor
**Endpoint:** `POST /api/proveedores`
**Descripción:** Registra un nuevo proveedor
**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "nombre_empresa": "Editorial Planeta",
  "contacto": "Ana López",
  "email": "contacto@planeta.com",
  "telefono": "6015559999",
  "direccion": "Avenida 68 #45-30"
}
```

**Respuesta Exitosa (201):**
```json
{
  "mensaje": "Proveedor creado exitosamente",
  "id": 5
}
```

---

### 4.3 Actualizar Proveedor
**Endpoint:** `PUT /api/proveedores/:id`
**Descripción:** Actualiza datos de un proveedor
**Autenticación:** Requerida

**Parámetros URL:**
- `id` - ID del proveedor

**Body (JSON):**
```json
{
  "telefono": "6015558888",
  "email": "nuevo@planeta.com"
}
```

**Respuesta Exitosa (200):**
```json
{
  "mensaje": "Proveedor actualizado exitosamente"
}
```

---

### 4.4 Eliminar Proveedor
**Endpoint:** `DELETE /api/proveedores/:id`
**Descripción:** Elimina un proveedor
**Autenticación:** Requerida

**Parámetros URL:**
- `id` - ID del proveedor

**Respuesta Exitosa (200):**
```json
{
  "mensaje": "Proveedor eliminado exitosamente"
}
```

---

## 5. VENTAS

### 5.1 Obtener Todas las Ventas
**Endpoint:** `GET /api/ventas`
**Descripción:** Lista todas las ventas realizadas
**Autenticación:** Requerida

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "cliente_id": 1,
    "total": 130000,
    "fecha_venta": "2024-12-05T14:30:00.000Z",
    "usuario_id": 1
  }
]
```

---

### 5.2 Obtener Detalle de Venta
**Endpoint:** `GET /api/ventas/:id`
**Descripción:** Obtiene el detalle completo de una venta específica
**Autenticación:** Requerida

**Parámetros URL:**
- `id` - ID de la venta

**Respuesta Exitosa (200):**
```json
{
  "venta": {
    "id": 1,
    "cliente_id": 1,
    "total": 130000,
    "fecha_venta": "2024-12-05T14:30:00.000Z"
  },
  "detalles": [
    {
      "libro_id": 1,
      "titulo": "Cien Años de Soledad",
      "cantidad": 2,
      "precio_unitario": 45000,
      "subtotal": 90000
    },
    {
      "libro_id": 3,
      "titulo": "Clean Code",
      "cantidad": 1,
      "precio_unitario": 40000,
      "subtotal": 40000
    }
  ]
}
```

---

### 5.3 Crear Nueva Venta
**Endpoint:** `POST /api/ventas`
**Descripción:** Registra una nueva venta (transacción completa)
**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "cliente_id": 1,
  "usuario_id": 1,
  "libros": [
    {
      "libro_id": 1,
      "cantidad": 2,
      "precio_unitario": 45000
    },
    {
      "libro_id": 3,
      "cantidad": 1,
      "precio_unitario": 40000
    }
  ]
}
```

**Respuesta Exitosa (201):**
```json
{
  "mensaje": "Venta registrada exitosamente",
  "venta_id": 15,
  "total": 130000
}
```

**Códigos de Estado:**
- `201` - Venta creada
- `400` - Datos inválidos o stock insuficiente
- `500` - Error del servidor

---

## 6. MOVIMIENTOS

### 6.1 Registrar Movimiento de Inventario
**Endpoint:** `POST /api/movimientos`
**Descripción:** Registra una entrada o salida de inventario
**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "libro_id": 1,
  "usuario_id": 1,
  "tipo_movimiento": "ENTRADA",
  "cantidad": 50,
  "observaciones": "Compra a proveedor - Factura #12345"
}
```

**Valores de tipo_movimiento:**
- `ENTRADA` - Incrementa el stock
- `SALIDA` - Decrementa el stock

**Respuesta Exitosa (201):**
```json
{
  "mensaje": "Movimiento registrado exitosamente",
  "movimiento_id": 23
}
```

**Códigos de Estado:**
- `201` - Movimiento registrado
- `400` - Datos inválidos
- `500` - Error del servidor

---

## 7. DASHBOARD

### 7.1 Obtener Estadísticas del Sistema
**Endpoint:** `GET /api/dashboard`
**Descripción:** Obtiene estadísticas generales del sistema
**Autenticación:** Requerida

**Respuesta Exitosa (200):**
```json
{
  "total_libros": 145,
  "total_clientes": 87,
  "total_ventas_mes": 2340000,
  "libros_bajo_stock": 12,
  "ventas_recientes": [
    {
      "id": 15,
      "fecha": "2024-12-05",
      "total": 130000,
      "cliente": "María González"
    }
  ],
  "libros_mas_vendidos": [
    {
      "titulo": "Cien Años de Soledad",
      "cantidad_vendida": 45
    }
  ]
}
```

---

## 📝 NOTAS IMPORTANTES

### Autenticación
- La mayoría de endpoints requieren autenticación con JWT
- El token se obtiene al hacer login
- Debe incluirse en el header: `Authorization: Bearer {token}`
- El token expira en 8 horas

### Códigos de Estado HTTP Comunes
- `200` - Operación exitosa
- `201` - Recurso creado exitosamente
- `400` - Solicitud incorrecta (datos inválidos)
- `401` - No autenticado
- `403` - No autorizado
- `404` - Recurso no encontrado
- `409` - Conflicto (duplicado)
- `500` - Error interno del servidor

### Formato de Respuestas
Todas las respuestas de la API están en formato JSON con Content-Type: `application/json`

---

## 🔗 Repositorio GitHub
**URL:** https://github.com/cperdomope/SGI-Libreria-Frontend

---

**Desarrollador:** Carlos Ivan Perdomo
**Proyecto SENA - Análisis y Desarrollo de Software**
**Evidencia:** AA5-EV02 - Testing de API
