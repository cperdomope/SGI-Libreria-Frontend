# Guía de Pruebas de API con Postman
## Sistema de Gestión de Inventario - Librería

**Proyecto:** AA5-EV03 - Diseño y Desarrollo de Servicios Web
**Institución:** SENA (Servicio Nacional de Aprendizaje)



## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Configuración Inicial](#configuración-inicial)
3. [Colección de Pruebas](#colección-de-pruebas)
4. [Pruebas Paso a Paso](#pruebas-paso-a-paso)
5. [Casos de Prueba por Módulo](#casos-de-prueba-por-módulo)
6. [Variables de Entorno](#variables-de-entorno)



## Introducción

Esta guía te ayudará a probar todos los servicios web (APIs) del Sistema de Gestión de Inventario usando **Postman**, una herramienta popular para testing de APIs REST.

### ¿Qué es Postman?

Postman es una aplicación que permite:
- Enviar peticiones HTTP (GET, POST, PUT, DELETE)
- Probar APIs sin necesidad de un frontend
- Guardar colecciones de requests
- Automatizar pruebas


## Configuración Inicial

### 1. Iniciar el Servidor Backend

Antes de probar, asegúrate de que el servidor esté corriendo:

```bash
cd servidor
node index.js
```

Deberías ver:
```
✅ Servidor corriendo en http://localhost:3000
```

### 2. Configurar Variables de Entorno en Postman

Las variables te permiten reutilizar valores como la URL base y el token.

**Pasos:**

1. En Postman, clic en **Environments** (icono de engranaje arriba a la derecha)
2. Clic en **Create Environment**
3. Nombre: `Inventario Libreria Local`
4. Agregar variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| base_url | http://localhost:3000/api | http://localhost:3000/api |
| token | (dejar vacío) | (dejar vacío) |
| admin_email | admin@sena.edu.co | admin@sena.edu.co |
| admin_password | admin123 | admin123 |

5. Clic en **Save**
6. Seleccionar el environment en el dropdown de la esquina superior derecha

---

## Colección de Pruebas

### Crear Nueva Colección

1. En Postman, clic en **Collections** (barra lateral izquierda)
2. Clic en el botón **+** o **New Collection**
3. Nombre: `API Inventario Librería - SENA`
4. Descripción: `Colección completa de pruebas para el proyecto AA5-EV03`
5. Clic en **Create**

---

## Pruebas Paso a Paso

### PASO 1: Login de Administrador

**Propósito:** Obtener un token JWT para autenticarse en los demás endpoints.

**Configuración del Request:**

1. En la colección, clic en **Add request**
2. Nombre: `Login - Administrador`
3. Método: `POST`
4. URL: `{{base_url}}/auth/login`
5. En la pestaña **Headers**, agregar:
   - Key: `Content-Type`
   - Value: `application/json`

6. En la pestaña **Body**, seleccionar **raw** y **JSON**, luego escribir:

```json
{
  "email": "{{admin_email}}",
  "password": "{{admin_password}}"
}
```

7. Clic en **Send**

**Respuesta Esperada (200 OK):**

```json
{
  "mensaje": "Autenticación satisfactoria",
  "exito": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Administrador SENA",
    "email": "admin@sena.edu.co",
    "rol_id": 1
  }
}
```

**IMPORTANTE: Guardar el Token Automáticamente**

En la pestaña **Tests** del request, agrega este script para guardar el token:

```javascript
// Si la respuesta es exitosa, guardar el token
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    console.log("✅ Token guardado:", jsonData.token.substring(0, 20) + "...");
}
```

Ahora cada vez que hagas login, el token se guardará automáticamente en la variable `{{token}}`.

---

### PASO 2: Obtener Libros (Endpoint Protegido)

**Propósito:** Verificar que el token funciona y obtener el inventario.

**Configuración del Request:**

1. Add request: `Obtener Todos los Libros`
2. Método: `GET`
3. URL: `{{base_url}}/libros`
4. En la pestaña **Headers**, agregar:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
   - Key: `Content-Type`
   - Value: `application/json`

5. Clic en **Send**

**Respuesta Esperada (200 OK):**

```json
{
  "exito": true,
  "cantidad": 3,
  "libros": [
    {
      "id": 1,
      "isbn": "978-3-16-148410-0",
      "titulo": "Cien Años de Soledad",
      "precio_venta": 45000.00,
      "stock_actual": 15,
      "autor_nombre": "Gabriel García Márquez",
      "categoria_nombre": "Literatura"
    }
  ]
}
```

---

### PASO 3: Crear un Nuevo Libro

**Propósito:** Probar la creación de recursos (solo administradores).

**Configuración del Request:**

1. Add request: `Crear Nuevo Libro`
2. Método: `POST`
3. URL: `{{base_url}}/libros`
4. Headers:
   - `Authorization: Bearer {{token}}`
   - `Content-Type: application/json`

5. Body (raw JSON):

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

6. Clic en **Send**

**Respuesta Esperada (201 Created):**

```json
{
  "mensaje": "Libro creado exitosamente",
  "exito": true,
  "libro": {
    "id": 15,
    "isbn": "978-84-204-8250-8",
    "titulo": "La Casa de los Espíritus"
  }
}
```

---

### PASO 4: Crear Cliente

**Configuración del Request:**

1. Add request: `Crear Cliente`
2. Método: `POST`
3. URL: `{{base_url}}/clientes`
4. Headers:
   - `Authorization: Bearer {{token}}`
   - `Content-Type: application/json`

5. Body (raw JSON):

```json
{
  "documento": "1098765432",
  "nombre_completo": "Ana María Torres",
  "email": "ana.torres@email.com",
  "telefono": "3156789012",
  "direccion": "Carrera 7 #32-16, Bogotá"
}
```

---

### PASO 5: Registrar Movimiento de Inventario

**Configuración del Request:**

1. Add request: `Registrar Entrada de Inventario`
2. Método: `POST`
3. URL: `{{base_url}}/movimientos`
4. Headers:
   - `Authorization: Bearer {{token}}`
   - `Content-Type: application/json`

5. Body (raw JSON):

```json
{
  "libro_id": 1,
  "tipo_movimiento": "ENTRADA",
  "cantidad": 20,
  "observaciones": "Compra mensual a proveedor Distribuidora Libros SA"
}
```

**Respuesta Esperada (201 Created):**

```json
{
  "mensaje": "Movimiento registrado exitosamente",
  "exito": true,
  "movimiento": {
    "id": 26,
    "libro_id": 1,
    "tipo_movimiento": "ENTRADA",
    "cantidad": 20,
    "stock_nuevo": 35
  }
}
```

---

### PASO 6: Crear Venta Completa (POS)

**Configuración del Request:**

1. Add request: `Registrar Venta - POS`
2. Método: `POST`
3. URL: `{{base_url}}/ventas`
4. Headers:
   - `Authorization: Bearer {{token}}`
   - `Content-Type: application/json`

5. Body (raw JSON):

```json
{
  "cliente_id": 1,
  "metodo_pago": "EFECTIVO",
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

**Respuesta Esperada (201 Created):**

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

---

### PASO 7: Obtener Estadísticas del Dashboard

**Configuración del Request:**

1. Add request: `Dashboard - Estadísticas`
2. Método: `GET`
3. URL: `{{base_url}}/dashboard/estadisticas`
4. Headers:
   - `Authorization: Bearer {{token}}`

**Respuesta Esperada (200 OK):**

```json
{
  "exito": true,
  "estadisticas": {
    "total_libros": 45,
    "total_clientes": 34,
    "ventas_hoy": {
      "cantidad": 8,
      "total": 345000.00
    },
    "stock_bajo": {
      "cantidad": 6
    }
  }
}
```

---

## Casos de Prueba por Módulo

### 📚 Módulo LIBROS

| Prueba | Método | URL | Body | Respuesta |
|--------|--------|-----|------|-----------|
| Listar libros | GET | `/libros` | - | 200 OK |
| Crear libro | POST | `/libros` | JSON con datos | 201 Created |
| Actualizar libro | PUT | `/libros/1` | JSON con cambios | 200 OK |
| Eliminar libro | DELETE | `/libros/1` | - | 200 OK |
| Libro duplicado | POST | `/libros` | ISBN existente | 409 Conflict |

---

### 👥 Módulo CLIENTES

| Prueba | Método | URL | Descripción |
|--------|--------|-----|-------------|
| Listar clientes | GET | `/clientes` | Lista todos |
| Obtener cliente | GET | `/clientes/1` | Detalle de uno |
| Crear cliente | POST | `/clientes` | Nuevo cliente |
| Actualizar cliente | PUT | `/clientes/1` | Modificar datos |
| Eliminar cliente | DELETE | `/clientes/1` | Borrar |

---

### 🏢 Módulo PROVEEDORES

| Prueba | Método | URL | Rol Requerido |
|--------|--------|-----|---------------|
| Listar proveedores | GET | `/proveedores` | Admin |
| Crear proveedor | POST | `/proveedores` | Admin |
| Actualizar proveedor | PUT | `/proveedores/1` | Admin |
| Eliminar proveedor | DELETE | `/proveedores/1` | Admin |

---

### 📦 Módulo MOVIMIENTOS (Kardex)

| Prueba | Método | URL | Body Ejemplo |
|--------|--------|-----|--------------|
| Historial completo | GET | `/movimientos` | - |
| Registrar entrada | POST | `/movimientos` | {"tipo_movimiento": "ENTRADA", ...} |
| Registrar salida | POST | `/movimientos` | {"tipo_movimiento": "SALIDA", ...} |

---

### 💰 Módulo VENTAS

| Prueba | Método | URL | Descripción |
|--------|--------|-----|-------------|
| Historial de ventas | GET | `/ventas` | Todas las ventas |
| Detalle de venta | GET | `/ventas/1` | Una venta específica |
| Registrar venta | POST | `/ventas` | Nueva transacción POS |

---

### ✍️ Módulo AUTORES

| Prueba | Método | URL | Body |
|--------|--------|-----|------|
| Listar autores | GET | `/autores` | - |
| Crear autor | POST | `/autores` | {"nombre": "Isabel Allende", ...} |
| Actualizar autor | PUT | `/autores/1` | Campos a modificar |
| Eliminar autor | DELETE | `/autores/1` | - |

---

### 📂 Módulo CATEGORÍAS

| Prueba | Método | URL | Validación |
|--------|--------|-----|------------|
| Listar categorías | GET | `/categorias` | 200 OK |
| Crear categoría | POST | `/categorias` | Nombre único |
| Actualizar categoría | PUT | `/categorias/1` | 200 OK |
| Eliminar categoría | DELETE | `/categorias/1` | Sin libros asociados |

---

## Pruebas de Seguridad

### 🔒 Prueba 1: Request Sin Token

**Objetivo:** Verificar que endpoints protegidos rechazan peticiones sin autenticación.

1. Crear request: `GET /libros` **SIN** header `Authorization`
2. Enviar

**Respuesta Esperada (401 Unauthorized):**

```json
{
  "error": "Token no proporcionado",
  "exito": false
}
```

---

### 🔒 Prueba 2: Token Expirado o Inválido

1. En el environment, cambiar `token` a: `xyz123tokeninvalido`
2. Intentar: `GET /libros`

**Respuesta Esperada (403 Forbidden):**

```json
{
  "error": "Token inválido",
  "exito": false
}
```

---

### 🔒 Prueba 3: Vendedor Intentando Acción de Admin

1. Login como vendedor:
```json
{
  "email": "vendedor@sena.edu.co",
  "password": "vendedor123"
}
```

2. Guardar el token del vendedor
3. Intentar: `POST /libros` (crear libro - solo admins)

**Respuesta Esperada (403 Forbidden):**

```json
{
  "error": "Acceso denegado",
  "mensaje": "No tiene permisos suficientes para realizar esta acción"
}
```

---

### 🔒 Prueba 4: Protección contra Fuerza Bruta

1. Crear request: `POST /auth/login`
2. Enviar 3 veces con contraseña incorrecta:
```json
{
  "email": "admin@sena.edu.co",
  "password": "contraseñaincorrecta"
}
```

**Primera y segunda vez (401):**
```json
{
  "error": "Credenciales incorrectas",
  "intentosRestantes": 2
}
```

**Tercera vez (429 Too Many Requests):**
```json
{
  "error": "Su cuenta ha sido bloqueada temporalmente por seguridad...",
  "bloqueado": true,
  "minutosRestantes": 3
}
```

---

## Variables de Entorno Postman

### Configuración Completa

```json
{
  "id": "inventario-libreria-local",
  "name": "Inventario Libreria Local",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api",
      "enabled": true
    },
    {
      "key": "token",
      "value": "",
      "enabled": true
    },
    {
      "key": "admin_email",
      "value": "admin@sena.edu.co",
      "enabled": true
    },
    {
      "key": "admin_password",
      "value": "admin123",
      "enabled": true
    },
    {
      "key": "vendedor_email",
      "value": "vendedor@sena.edu.co",
      "enabled": true
    },
    {
      "key": "vendedor_password",
      "value": "vendedor123",
      "enabled": true
    }
  ]
}
```

---

## Scripts de Automatización

### Auto-guardar Token en Login

En la pestaña **Tests** del request de login:

```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    pm.environment.set("user_id", jsonData.usuario.id);
    pm.environment.set("user_rol", jsonData.usuario.rol_id);

    pm.test("✅ Login exitoso", function () {
        pm.expect(jsonData.exito).to.be.true;
    });

    pm.test("✅ Token recibido", function () {
        pm.expect(jsonData.token).to.exist;
    });
}
```

### Validar Respuestas

En cualquier request, pestaña **Tests**:

```javascript
pm.test("Status code es 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Respuesta contiene 'exito: true'", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.exito).to.be.true;
});

pm.test("Tiempo de respuesta < 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

---

## Consejos para Pruebas Exitosas

### ✅ Lista de Verificación

- [ ] Servidor backend corriendo (`node index.js`)
- [ ] Base de datos MySQL iniciada y con datos
- [ ] Environment seleccionado en Postman
- [ ] Token actualizado (hacer login primero)
- [ ] Headers correctos (`Authorization`, `Content-Type`)
- [ ] Body en formato JSON válido

### 🎯 Orden Recomendado de Pruebas

1. **Login** - Obtener token
2. **GET** requests - Listar recursos
3. **POST** requests - Crear recursos
4. **PUT** requests - Actualizar recursos
5. **DELETE** requests - Eliminar recursos
6. **Pruebas de seguridad** - Validar autenticación y roles

### ⚠️ Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| Connection refused | Servidor no corriendo | Ejecutar `node index.js` |
| 401 Unauthorized | Token faltante/expirado | Hacer login nuevamente |
| 403 Forbidden | Rol insuficiente | Usar token de administrador |
| 400 Bad Request | Datos inválidos | Verificar formato JSON |
| 500 Internal Server Error | Error en BD | Revisar console del servidor |

---

## Exportar e Importar Colección

### Exportar Colección

1. En Postman, clic derecho en la colección
2. **Export**
3. Seleccionar **Collection v2.1**
4. Guardar archivo: `API_Inventario_Libreria_SENA.postman_collection.json`

### Importar Colección

1. En Postman, clic en **Import**
2. Seleccionar el archivo `.postman_collection.json`
3. Clic en **Import**

---

## Conclusión

Esta guía te permite probar de manera completa todos los servicios web del Sistema de Gestión de Inventario.

### Checklist Final de Pruebas

- [ ] Autenticación (Login, Registro)
- [ ] Gestión de Libros (CRUD)
- [ ] Movimientos de Inventario (Kardex)
- [ ] Gestión de Clientes (CRUD)
- [ ] Registro de Ventas (POS)
- [ ] Gestión de Proveedores (CRUD)
- [ ] Gestión de Autores (CRUD)
- [ ] Gestión de Categorías (CRUD)
- [ ] Dashboard (Estadísticas)
- [ ] Pruebas de seguridad (Token, Roles, Bloqueos)


