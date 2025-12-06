# Evidencia AA5-EV01: Diseño y Desarrollo de Servicios Web

## Información del Proyecto

**Proyecto:** Sistema de Gestión de Inventario - Librería
**Actividad:** GA7-220501096-AA5-EV01 Diseño y Desarrollo de Servicios Web
**Aprendiz:** Carlos Ivan Perdomo
**Institución:** SENA
**Programa:** Grado 11 - Análisis y Desarrollo de Sistemas de Información

---

## Descripción del Servicio Web

Este proyecto implementa un **servicio web de autenticación** para un sistema de gestión de inventario de librería. El servicio proporciona dos funcionalidades principales:

### 1. Registro de Usuario
- **Endpoint:** `POST /api/auth/registro`
- **Descripción:** Permite registrar un nuevo usuario en el sistema
- **Tecnologías:** Node.js, Express, MySQL, bcrypt

### 2. Inicio de Sesión (Login)
- **Endpoint:** `POST /api/auth/login`
- **Descripción:** Autentica un usuario y genera un token JWT
- **Validación:** Verifica email y contraseña encriptada
- **Respuesta:** Token de autenticación o mensaje de error

---

## Tecnologías Utilizadas

- **Backend:** Node.js con Express.js
- **Base de Datos:** MySQL
- **Seguridad:**
  - bcryptjs - Encriptación de contraseñas
  - jsonwebtoken (JWT) - Tokens de autenticación
- **Control de Versiones:** Git y GitHub
- **Dependencias adicionales:**
  - mysql2 - Conexión a base de datos
  - dotenv - Variables de entorno
  - cors - Control de acceso entre dominios

---

## Estructura del Proyecto

```
proyecto-inventario/
├── servidor/
│   ├── controladores/
│   │   └── controladorAuth.js    # Lógica de registro y login
│   ├── rutas/
│   │   └── rutasAuth.js          # Endpoints del servicio web
│   ├── configuracion/
│   │   └── db.js                 # Conexión a base de datos
│   └── index.js                  # Servidor principal
├── base_datos/
│   └── script_inicial.sql        # Script de creación de BD
└── README_AA5_EV01.md            # Este documento
```

---

## Documentación del Servicio Web

### 🔹 Endpoint: Registro de Usuario

**URL:** `http://localhost:3000/api/auth/registro`
**Método:** POST
**Content-Type:** application/json

**Body de la Petición:**
```json
{
  "nombre_completo": "Juan Pérez",
  "email": "juan@email.com",
  "password": "contraseña123",
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
    "email": "juan@email.com",
    "rol_id": 2
  }
}
```

**Respuesta Error (409 - Email duplicado):**
```json
{
  "error": "El correo electrónico ya está registrado"
}
```

---

### 🔹 Endpoint: Inicio de Sesión

**URL:** `http://localhost:3000/api/auth/login`
**Método:** POST
**Content-Type:** application/json

**Body de la Petición:**
```json
{
  "email": "juan@email.com",
  "password": "contraseña123"
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
    "email": "juan@email.com",
    "rol_id": 2
  }
}
```

**Respuesta Error (401 - Credenciales incorrectas):**
```json
{
  "error": "Credenciales incorrectas",
  "exito": false
}
```

**Respuesta Error (403 - Usuario inactivo):**
```json
{
  "error": "Usuario inactivo. Contacte al administrador",
  "exito": false
}
```

---

## Características de Seguridad

### 🔒 Encriptación de Contraseñas
- Se utiliza **bcrypt** con 10 salt rounds
- Las contraseñas NUNCA se almacenan en texto plano
- Cada contraseña tiene un hash único

### 🔑 Autenticación con JWT
- Token generado con información del usuario
- Tiempo de expiración: 8 horas
- El token debe enviarse en peticiones protegidas

### ✅ Validaciones Implementadas
- Verificación de campos obligatorios
- Validación de email único (no duplicados)
- Verificación de estado del usuario (activo/inactivo)
- Comparación segura de contraseñas

---

## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/cperdomope/SGI-Libreria-Frontend.git
cd SGI-Libreria-Frontend
```

### 2. Instalar Dependencias del Servidor
```bash
cd servidor
npm install
```

### 3. Configurar Base de Datos
Ejecutar el script SQL ubicado en `base_datos/script_inicial.sql`:
```bash
mysql -u root -p < base_datos/script_inicial.sql
```

### 4. Configurar Variables de Entorno
Crear archivo `.env` en la carpeta `servidor`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=inventario_libreria
JWT_SECRET=SECRETO_SENA_PROYECTO
```

### 5. Iniciar el Servidor
```bash
npm start
```

El servidor estará corriendo en: `http://localhost:3000`

---

## Pruebas del Servicio Web

### Usando Postman o Thunder Client

#### Test 1: Registro de Usuario
1. Método: POST
2. URL: `http://localhost:3000/api/auth/registro`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "nombre_completo": "María González",
  "email": "maria@libreria.com",
  "password": "segura123",
  "rol_id": 2
}
```
5. Resultado esperado: Status 201, usuario creado

#### Test 2: Login Exitoso
1. Método: POST
2. URL: `http://localhost:3000/api/auth/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "maria@libreria.com",
  "password": "segura123"
}
```
5. Resultado esperado: Status 200, token JWT generado

#### Test 3: Login con Credenciales Incorrectas
1. Método: POST
2. URL: `http://localhost:3000/api/auth/login`
3. Body (raw JSON):
```json
{
  "email": "maria@libreria.com",
  "password": "incorrecta"
}
```
4. Resultado esperado: Status 401, mensaje de error

---

## Código con Comentarios

Todos los archivos del servicio web contienen comentarios detallados que explican:
- La función de cada módulo
- El propósito de cada función
- Los pasos del proceso de autenticación
- Las validaciones implementadas
- El manejo de errores

### Archivos Principales:
- `servidor/controladores/controladorAuth.js` - Lógica de negocio
- `servidor/rutas/rutasAuth.js` - Definición de endpoints

---

## Control de Versiones con Git

### Repositorio en GitHub
🔗 **URL del Repositorio:**
[https://github.com/cperdomope/SGI-Libreria-Frontend](https://github.com/cperdomope/SGI-Libreria-Frontend)

### Commits Principales
```bash
git log --oneline
```
- `021e18d` Agregar script SQL de creación de base de datos
- `d42e6d1` Limpieza de archivos
- `0ac812d` Actualizar configuración del proyecto
- `2ba9f2a` Entrega Evidencia Frontend AA4-EV03

### Historial de Desarrollo
El proyecto utiliza Git para el control de versiones, con commits organizados que documentan cada etapa del desarrollo.

---

## Base de Datos

### Tabla: usuarios
```sql
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    estado TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);
```

### Tabla: roles
```sql
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
```

---

## Flujo de Autenticación

### 1. Registro de Usuario
```
Cliente → POST /api/auth/registro
    ↓
Validar datos requeridos
    ↓
Verificar email no duplicado
    ↓
Encriptar contraseña con bcrypt
    ↓
Guardar en base de datos
    ↓
Retornar confirmación
```

### 2. Inicio de Sesión
```
Cliente → POST /api/auth/login
    ↓
Validar credenciales
    ↓
Buscar usuario por email
    ↓
Verificar estado activo
    ↓
Comparar contraseña con bcrypt
    ↓
Generar token JWT
    ↓
Retornar token y datos del usuario
```

---

## Conclusiones

Este servicio web cumple con los siguientes requisitos de la evidencia:

✅ Servicio web funcional para registro e inicio de sesión
✅ Validación de usuario y contraseña
✅ Mensajes de autenticación satisfactoria o error
✅ Código completamente comentado
✅ Proyecto versionado con Git y GitHub
✅ Implementación de seguridad con bcrypt y JWT
✅ Buenas prácticas de desarrollo

El sistema está listo para ser integrado con el frontend y ampliado con funcionalidades adicionales de gestión de inventario.

---

## Contacto

**Desarrollador:** Carlos Ivan Perdomo
**GitHub:** [@cperdomope](https://github.com/cperdomope)
**Repositorio:** [SGI-Libreria-Frontend](https://github.com/cperdomope/SGI-Libreria-Frontend)

---

**Fecha de Entrega:** Diciembre 2025
**Proyecto SENA - Análisis y Desarrollo de Sistemas de Información**
