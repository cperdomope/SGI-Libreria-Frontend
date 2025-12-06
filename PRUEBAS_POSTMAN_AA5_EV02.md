# PRUEBAS DE API CON POSTMAN - AA5-EV02

## Información de la Evidencia
**Evidencia:** GA7-220501096-AA5-EV02 API Testing
**Aprendiz:** Carlos Ivan Perdomo
**Institución:** SENA
**Proyecto:** Sistema de Gestión de Inventario - Librería

---

## 📥 INSTALACIÓN DE POSTMAN

### Paso 1: Descargar Postman
1. Visitar: https://www.postman.com/downloads/
2. Descargar la versión para Windows
3. Ejecutar el instalador descargado
4. Esperar a que termine la instalación automática
5. Abrir Postman (se abrirá automáticamente o buscar en el menú inicio)

### Paso 2: Configuración Inicial
1. Crear una cuenta gratuita (opcional pero recomendado)
2. Seleccionar "Skip" si no desea crear cuenta
3. Familiarizarse con la interfaz

---

## 🚀 PREPARACIÓN DEL SERVIDOR

### Antes de Realizar las Pruebas

1. **Iniciar la Base de Datos MySQL**
   - Abrir XAMPP o MySQL Workbench
   - Iniciar el servicio MySQL
   - Verificar que la base de datos `inventario_libreria` existe

2. **Iniciar el Servidor Backend**
   ```bash
   cd servidor
   npm start
   ```
   - Verificar que el servidor está corriendo en http://localhost:3000
   - Debe aparecer: "✅ Servidor corriendo en http://localhost:3000"

3. **Verificar Conectividad**
   - Abrir navegador
   - Ir a: http://localhost:3000
   - Debe mostrar: "API del Sistema de Inventario Funcionando 🚀"

---

## 📋 PLAN DE PRUEBAS

### Checklist de Pruebas a Realizar

#### ✅ MÓDULO 1: Autenticación
- [ ] Registro de usuario nuevo
- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas
- [ ] Registro con email duplicado

#### ✅ MÓDULO 2: Libros
- [ ] Obtener lista de todos los libros
- [ ] Crear un nuevo libro
- [ ] Actualizar un libro existente
- [ ] Eliminar un libro

#### ✅ MÓDULO 3: Clientes
- [ ] Listar todos los clientes
- [ ] Obtener un cliente por ID
- [ ] Crear un nuevo cliente
- [ ] Actualizar datos de cliente
- [ ] Eliminar un cliente

#### ✅ MÓDULO 4: Proveedores
- [ ] Listar proveedores
- [ ] Crear proveedor
- [ ] Actualizar proveedor
- [ ] Eliminar proveedor

#### ✅ MÓDULO 5: Ventas
- [ ] Listar todas las ventas
- [ ] Obtener detalle de una venta
- [ ] Crear una nueva venta

#### ✅ MÓDULO 6: Movimientos
- [ ] Registrar entrada de inventario
- [ ] Registrar salida de inventario

#### ✅ MÓDULO 7: Dashboard
- [ ] Obtener estadísticas del sistema

---

## 🧪 GUÍA DETALLADA DE PRUEBAS

### PRUEBA 1: Registro de Usuario

**Objetivo:** Verificar que se puede registrar un nuevo usuario

**Pasos en Postman:**
1. Crear nueva petición (New Request)
2. Seleccionar método: `POST`
3. URL: `http://localhost:3000/api/auth/registro`
4. Ir a pestaña "Body"
5. Seleccionar "raw" y tipo "JSON"
6. Ingresar el siguiente JSON:

```json
{
  "nombre_completo": "Carlos Perdomo",
  "email": "carlos.perdomo@sena.edu.co",
  "password": "sena2024",
  "rol_id": 1
}
```

7. Click en "Send"
8. **PANTALLAZO 1:** Capturar la respuesta exitosa (Status 201)

**Resultado Esperado:**
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "exito": true,
  "usuario": {
    "id": 2,
    "nombre_completo": "Carlos Perdomo",
    "email": "carlos.perdomo@sena.edu.co",
    "rol_id": 1
  }
}
```

---

### PRUEBA 2: Inicio de Sesión (Login)

**Objetivo:** Autenticar usuario y obtener token JWT

**Pasos en Postman:**
1. Nueva petición: `POST`
2. URL: `http://localhost:3000/api/auth/login`
3. Body → raw → JSON:

```json
{
  "email": "carlos.perdomo@sena.edu.co",
  "password": "sena2024"
}
```

4. Click en "Send"
5. **PANTALLAZO 2:** Capturar respuesta con el token
6. **IMPORTANTE:** Copiar el token de la respuesta (necesario para siguientes pruebas)

**Resultado Esperado:**
```json
{
  "mensaje": "Autenticación satisfactoria",
  "exito": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 2,
    "nombre": "Carlos Perdomo",
    "email": "carlos.perdomo@sena.edu.co",
    "rol_id": 1
  }
}
```

---

### PRUEBA 3: Login con Credenciales Incorrectas

**Objetivo:** Verificar manejo de errores de autenticación

**Pasos en Postman:**
1. Nueva petición: `POST`
2. URL: `http://localhost:3000/api/auth/login`
3. Body → raw → JSON:

```json
{
  "email": "carlos.perdomo@sena.edu.co",
  "password": "contraseña_incorrecta"
}
```

4. Click en "Send"
5. **PANTALLAZO 3:** Capturar error 401

**Resultado Esperado:**
```json
{
  "error": "Credenciales incorrectas",
  "exito": false
}
```

---

### CONFIGURAR AUTENTICACIÓN PARA SIGUIENTES PRUEBAS

**IMPORTANTE:** Para las siguientes pruebas que requieren autenticación:

1. En cada petición, ir a pestaña "Headers"
2. Agregar un nuevo header:
   - **Key:** `Authorization`
   - **Value:** `Bearer {tu_token_aquí}`
   - Reemplazar `{tu_token_aquí}` con el token obtenido en PRUEBA 2

**Alternativa - Variables de Entorno:**
1. Click en "Environment" (esquina superior derecha)
2. Crear nuevo environment "API Testing"
3. Agregar variable:
   - **Variable:** `token`
   - **Value:** Pegar el token completo
4. Usar en headers: `Bearer {{token}}`

---

### PRUEBA 4: Crear un Nuevo Libro

**Objetivo:** Registrar un libro en el inventario

**Pasos en Postman:**
1. Nueva petición: `POST`
2. URL: `http://localhost:3000/api/libros`
3. Headers:
   - `Authorization: Bearer {token}`
4. Body → raw → JSON:

```json
{
  "isbn": "978-0134685991",
  "titulo": "Effective Java",
  "descripcion": "Best practices for Java programming",
  "precio_venta": 95000,
  "stock_actual": 20,
  "stock_minimo": 5,
  "autor_id": 2,
  "categoria_id": 1
}
```

5. Click en "Send"
6. **PANTALLAZO 4:** Capturar respuesta exitosa

**Resultado Esperado:**
```json
{
  "mensaje": "Libro creado exitosamente",
  "id": 8
}
```

---

### PRUEBA 5: Obtener Lista de Libros

**Objetivo:** Listar todos los libros del inventario

**Pasos en Postman:**
1. Nueva petición: `GET`
2. URL: `http://localhost:3000/api/libros`
3. Headers:
   - `Authorization: Bearer {token}`
4. Click en "Send"
5. **PANTALLAZO 5:** Capturar lista de libros

**Resultado Esperado:**
Array de libros en JSON

---

### PRUEBA 6: Actualizar un Libro

**Objetivo:** Modificar datos de un libro existente

**Pasos en Postman:**
1. Nueva petición: `PUT`
2. URL: `http://localhost:3000/api/libros/1`
   (Reemplazar "1" con el ID del libro a actualizar)
3. Headers:
   - `Authorization: Bearer {token}`
4. Body → raw → JSON:

```json
{
  "precio_venta": 50000,
  "stock_actual": 25
}
```

5. Click en "Send"
6. **PANTALLAZO 6:** Capturar confirmación

---

### PRUEBA 7: Crear un Cliente

**Objetivo:** Registrar un nuevo cliente

**Pasos en Postman:**
1. Nueva petición: `POST`
2. URL: `http://localhost:3000/api/clientes`
3. Headers:
   - `Authorization: Bearer {token}`
4. Body → raw → JSON:

```json
{
  "nombre_completo": "Laura Martínez",
  "documento": "1234567890",
  "email": "laura.martinez@email.com",
  "telefono": "3101234567",
  "direccion": "Calle 45 #12-34"
}
```

5. Click en "Send"
6. **PANTALLAZO 7:** Capturar respuesta

---

### PRUEBA 8: Obtener Cliente por ID

**Objetivo:** Consultar información de un cliente específico

**Pasos en Postman:**
1. Nueva petición: `GET`
2. URL: `http://localhost:3000/api/clientes/1`
3. Headers:
   - `Authorization: Bearer {token}`
4. Click en "Send"
5. **PANTALLAZO 8:** Capturar datos del cliente

---

### PRUEBA 9: Crear un Proveedor

**Objetivo:** Registrar un nuevo proveedor

**Pasos en Postman:**
1. Nueva petición: `POST`
2. URL: `http://localhost:3000/api/proveedores`
3. Headers:
   - `Authorization: Bearer {token}`
4. Body → raw → JSON:

```json
{
  "nombre_empresa": "Librería Central S.A.S",
  "contacto": "Roberto Sánchez",
  "email": "ventas@libreriacentral.com",
  "telefono": "6015551234",
  "direccion": "Carrera 7 #40-50"
}
```

5. Click en "Send"
6. **PANTALLAZO 9:** Capturar respuesta

---

### PRUEBA 10: Crear una Venta

**Objetivo:** Registrar una transacción de venta completa

**Pasos en Postman:**
1. Nueva petición: `POST`
2. URL: `http://localhost:3000/api/ventas`
3. Headers:
   - `Authorization: Bearer {token}`
4. Body → raw → JSON:

```json
{
  "cliente_id": 1,
  "usuario_id": 2,
  "libros": [
    {
      "libro_id": 1,
      "cantidad": 2,
      "precio_unitario": 45000
    },
    {
      "libro_id": 2,
      "cantidad": 1,
      "precio_unitario": 38000
    }
  ]
}
```

5. Click en "Send"
6. **PANTALLAZO 10:** Capturar confirmación de venta

---

### PRUEBA 11: Obtener Detalle de Venta

**Objetivo:** Consultar el detalle completo de una venta

**Pasos en Postman:**
1. Nueva petición: `GET`
2. URL: `http://localhost:3000/api/ventas/1`
3. Headers:
   - `Authorization: Bearer {token}`
4. Click en "Send"
5. **PANTALLAZO 11:** Capturar detalle con libros vendidos

---

### PRUEBA 12: Registrar Movimiento de Inventario

**Objetivo:** Registrar entrada de productos

**Pasos en Postman:**
1. Nueva petición: `POST`
2. URL: `http://localhost:3000/api/movimientos`
3. Headers:
   - `Authorization: Bearer {token}`
4. Body → raw → JSON:

```json
{
  "libro_id": 1,
  "usuario_id": 2,
  "tipo_movimiento": "ENTRADA",
  "cantidad": 50,
  "observaciones": "Compra a proveedor - Factura F-12345"
}
```

5. Click en "Send"
6. **PANTALLAZO 12:** Capturar confirmación

---

### PRUEBA 13: Obtener Estadísticas del Dashboard

**Objetivo:** Consultar métricas del sistema

**Pasos en Postman:**
1. Nueva petición: `GET`
2. URL: `http://localhost:3000/api/dashboard`
3. Headers:
   - `Authorization: Bearer {token}`
4. Click en "Send"
5. **PANTALLAZO 13:** Capturar estadísticas

---

## 🎥 GUÍA PARA GRABACIÓN DEL VIDEO

### Preparación
- Cerrar todas las pestañas innecesarias
- Tener Postman y el navegador listos
- Verificar que el servidor está corriendo
- Duración recomendada: 5-10 minutos

### Herramientas de Grabación Sugeridas
- **OBS Studio** (Gratis): https://obsproject.com/
- **Loom** (Gratis hasta 5 min): https://www.loom.com/
- **Screencast-O-Matic** (Gratis): https://screencast-o-matic.com/
- **Windows Game Bar** (Incluido en Windows 10/11): Win + G

### Estructura del Video

**INTRODUCCIÓN (30 segundos)**
- "Buenos días/tardes, mi nombre es Carlos Ivan Perdomo"
- "Voy a realizar el testing de la API del Sistema de Gestión de Inventario"
- "Evidencia AA5-EV02 del SENA"

**PARTE 1: Mostrar el Servidor Corriendo (30 segundos)**
- Mostrar la terminal con el servidor activo
- Abrir navegador y mostrar http://localhost:3000
- Explicar que el servidor está funcionando

**PARTE 2: Testing en Postman (6-8 minutos)**

1. **Autenticación (2 minutos)**
   - Registro de usuario
   - Login exitoso y obtener token
   - Login con error (credenciales incorrectas)

2. **Módulo Libros (1.5 minutos)**
   - Listar libros
   - Crear un libro nuevo
   - Actualizar un libro

3. **Módulo Clientes (1 minuto)**
   - Crear cliente
   - Obtener cliente por ID

4. **Módulo Ventas (1.5 minutos)**
   - Crear una venta con múltiples libros
   - Obtener detalle de venta

5. **Otros Endpoints (1 minuto)**
   - Crear proveedor
   - Registrar movimiento
   - Obtener estadísticas del dashboard

**CIERRE (30 segundos)**
- "Todas las pruebas fueron exitosas"
- "La API funciona correctamente"
- Mostrar el repositorio de GitHub
- Agradecer

### Tips para la Grabación
- Hablar claro y pausado
- Explicar brevemente qué hace cada endpoint
- Mostrar las respuestas JSON
- Destacar los códigos de estado (200, 201, 401, etc.)
- Si hay un error, explicarlo y corregirlo

---

## 📸 CAPTURAS DE PANTALLA REQUERIDAS

### Lista de Pantallazos a Incluir en el Documento

1. **Pantallazo 1:** Registro de usuario exitoso (201)
2. **Pantallazo 2:** Login exitoso con token
3. **Pantallazo 3:** Login fallido (401)
4. **Pantallazo 4:** Creación de libro
5. **Pantallazo 5:** Lista de todos los libros
6. **Pantallazo 6:** Actualización de libro
7. **Pantallazo 7:** Creación de cliente
8. **Pantallazo 8:** Consulta de cliente por ID
9. **Pantallazo 9:** Creación de proveedor
10. **Pantallazo 10:** Creación de venta
11. **Pantallazo 11:** Detalle de venta
12. **Pantallazo 12:** Registro de movimiento
13. **Pantallazo 13:** Estadísticas del dashboard
14. **Pantallazo 14:** Postman mostrando la colección completa

### Formato de Capturas
- Formato: PNG o JPG
- Debe verse la URL completa
- Debe verse el método HTTP (GET, POST, PUT, DELETE)
- Debe verse el código de estado de la respuesta
- Debe verse el JSON de respuesta completo

---

## 📦 ARCHIVOS PARA ENTREGAR

### Carpeta: CARLOS_PERDOMO_AA5_EV02.zip

Debe contener:

1. **📁 servidor/** - Carpeta completa del backend
2. **📁 base_datos/** - Script SQL
3. **📄 ENDPOINTS_API.md** - Documento de endpoints
4. **📄 PRUEBAS_POSTMAN_AA5_EV02.md** - Este documento
5. **📄 DOCUMENTO_PRUEBAS.pdf** - PDF con los 14 pantallazos y descripción
6. **🎥 VIDEO_PRUEBAS_API.mp4** - Video de 5-10 minutos
7. **📄 ENLACE_REPOSITORIO.txt** - Archivo con URL de GitHub

---

## ✅ CHECKLIST FINAL

Antes de comprimir y entregar, verificar:

- [ ] Todas las 13 pruebas realizadas exitosamente
- [ ] 14 pantallazos capturados
- [ ] Video grabado (5-10 minutos)
- [ ] Documento PDF con pruebas creado
- [ ] Archivo ENDPOINTS_API.md incluido
- [ ] Código del servidor incluido
- [ ] Script SQL incluido
- [ ] Archivo con enlace de GitHub creado
- [ ] Todo comprimido en .zip o .rar
- [ ] Nombre del archivo: CARLOS_PERDOMO_AA5_EV02

---

## 🔗 RECURSOS ADICIONALES

### Repositorio GitHub
https://github.com/cperdomope/SGI-Libreria-Frontend

### Documentación Postman
https://learning.postman.com/docs/getting-started/introduction/

### Tutorial de OBS (Grabación)
https://www.youtube.com/results?search_query=como+usar+obs+studio

---

**Desarrollador:** Carlos Ivan Perdomo
**Proyecto SENA - Análisis y Desarrollo de Software**
**Evidencia:** AA5-EV02 - Testing de API con Postman
**Fecha:** Diciembre 2025
