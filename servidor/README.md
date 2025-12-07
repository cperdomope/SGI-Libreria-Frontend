# Backend - Sistema de Gestión de Inventario

API RESTful del sistema de gestión de inventario para librería, desarrollado con Node.js y Express.

## Tecnologías

- **Node.js** - Entorno de ejecución JavaScript
- **Express 5.1.0** - Framework web para API REST
- **MySQL2 3.15.3** - Driver de base de datos MySQL
- **JWT (jsonwebtoken 9.0.2)** - Autenticación mediante tokens
- **bcryptjs 3.0.3** - Encriptación de contraseñas
- **CORS 2.8.5** - Control de acceso entre orígenes
- **dotenv 17.2.3** - Manejo de variables de entorno

## Estructura de Carpetas

```
servidor/
├── configuracion/
│   └── db.js                   # Configuración de conexión MySQL
├── controladores/
│   ├── controladorAuth.js      # Login y autenticación
│   ├── libroControlador.js     # CRUD de libros
│   ├── movimientoControlador.js # Gestión de kardex
│   ├── dashboardControlador.js # Estadísticas generales
│   ├── clienteControlador.js   # CRUD de clientes
│   ├── proveedorControlador.js # CRUD de proveedores
│   ├── ventaControlador.js     # Gestión de ventas
│   ├── autorControlador.js     # CRUD de autores
│   └── categoriaControlador.js # CRUD de categorías
├── middlewares/
│   └── verificarToken.js       # Middleware de autenticación JWT
├── rutas/
│   ├── rutasAuth.js            # Endpoints de autenticación
│   ├── rutasLibros.js          # Endpoints de libros
│   ├── rutasMovimientos.js     # Endpoints de movimientos
│   ├── rutasDashboard.js       # Endpoints de estadísticas
│   ├── clienteRutas.js         # Endpoints de clientes
│   ├── proveedorRutas.js       # Endpoints de proveedores
│   ├── ventaRutas.js           # Endpoints de ventas
│   ├── autorRutas.js           # Endpoints de autores
│   └── categoriaRutas.js       # Endpoints de categorías
├── scripts/
│   └── reset_password.js       # Script para resetear contraseñas
├── .env                        # Variables de entorno (NO subir a git)
├── .env.example                # Plantilla de variables de entorno
├── index.js                    # Punto de entrada del servidor
└── package.json                # Dependencias y scripts
```

## Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz de `servidor/`:

```env
# Puerto del servidor
PORT=3000

# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=inventario_libreria

# Clave secreta para JWT (generar una aleatoria y segura)
JWT_SECRET=tu_clave_secreta_super_segura_y_larga

# Origen permitido para CORS (URL del frontend)
CORS_ORIGIN=http://localhost:5173
```

### Configuración de Base de Datos

1. Importar el script SQL inicial:
```bash
mysql -u root -p < ../base_datos/script_inicial.sql
```

2. Verificar conexión en `configuracion/db.js`

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar servidor
node index.js
```

El servidor estará corriendo en `http://localhost:3000`

## Endpoints de la API

### Autenticación (NO requieren token)

#### POST /api/auth/login
Iniciar sesión y obtener token JWT

**Body:**
```json
{
  "email": "admin@sena.edu.co",
  "password": "123456"
}
```

**Response (éxito):**
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre_completo": "Super Admin",
    "email": "admin@sena.edu.co",
    "rol": "Administrador"
  }
}
```

**Response (error - credenciales incorrectas):**
```json
{
  "error": "Credenciales incorrectas",
  "mensaje": "El correo electrónico o la contraseña son incorrectos. Tiene 2 intento(s) restante(s)."
}
```

**Response (error - cuenta bloqueada):**
```json
{
  "error": "Credenciales incorrectas",
  "mensaje": "Su cuenta ha sido bloqueada por 3 minutos por seguridad. Por favor, espere antes de intentar nuevamente."
}
```

### Libros (requieren token JWT)

#### GET /api/libros
Obtener todos los libros

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "isbn": "978-0307474728",
    "titulo": "Cien Años de Soledad",
    "descripcion": "Obra maestra del realismo mágico",
    "precio_venta": 45000.00,
    "stock_actual": 15,
    "stock_minimo": 5,
    "autor_id": 1,
    "autor_nombre": "Gabriel García Márquez",
    "categoria_id": 2,
    "categoria_nombre": "Ficción",
    "fecha_creacion": "2025-12-01T10:30:00.000Z"
  }
]
```

#### POST /api/libros
Crear nuevo libro

**Body:**
```json
{
  "isbn": "978-1234567890",
  "titulo": "Título del Libro",
  "descripcion": "Descripción detallada",
  "precio_venta": 50000,
  "stock_actual": 10,
  "stock_minimo": 5,
  "autor_id": 1,
  "categoria_id": 1
}
```

#### PUT /api/libros/:id
Actualizar libro existente

#### DELETE /api/libros/:id
Eliminar libro

### Movimientos (requieren token JWT)

#### GET /api/movimientos
Obtener historial de movimientos (kardex)

#### POST /api/movimientos
Registrar nuevo movimiento (entrada o salida)

**Body:**
```json
{
  "libro_id": 1,
  "tipo_movimiento": "ENTRADA",
  "cantidad": 10,
  "observaciones": "Compra a proveedor #123"
}
```

### Clientes (requieren token JWT)

#### GET /api/clientes
Obtener todos los clientes

#### POST /api/clientes
Crear nuevo cliente

**Body:**
```json
{
  "nombre_completo": "Juan Pérez",
  "documento": "1234567890",
  "email": "juan@email.com",
  "telefono": "3101234567",
  "direccion": "Calle 123 #45-67"
}
```

#### PUT /api/clientes/:id
Actualizar cliente

#### DELETE /api/clientes/:id
Eliminar cliente

### Proveedores (requieren token JWT)

#### GET /api/proveedores
Obtener todos los proveedores

#### POST /api/proveedores
Crear nuevo proveedor

**Body:**
```json
{
  "nombre_empresa": "Distribuidora ABC",
  "nit": "900123456-7",
  "nombre_contacto": "María López",
  "email": "ventas@abc.com",
  "telefono": "6015551234",
  "direccion": "Carrera 50 #30-20"
}
```

#### PUT /api/proveedores/:id
Actualizar proveedor

#### DELETE /api/proveedores/:id
Eliminar proveedor

### Autores (requieren token JWT)

#### GET /api/autores
Obtener todos los autores

#### POST /api/autores
Crear nuevo autor

**Body:**
```json
{
  "nombre": "Gabriel García Márquez"
}
```

#### PUT /api/autores/:id
Actualizar autor

#### DELETE /api/autores/:id
Eliminar autor (valida que no tenga libros asociados)

**Response (error - tiene libros):**
```json
{
  "error": "No se puede eliminar. Hay 5 libro(s) asociado(s) a este autor."
}
```

### Categorías (requieren token JWT)

#### GET /api/categorias
Obtener todas las categorías

#### POST /api/categorias
Crear nueva categoría

**Body:**
```json
{
  "nombre": "Tecnología"
}
```

**Response (error - nombre duplicado):**
```json
{
  "error": "Ya existe una categoría con ese nombre"
}
```

#### PUT /api/categorias/:id
Actualizar categoría

#### DELETE /api/categorias/:id
Eliminar categoría (valida que no tenga libros asociados)

### Ventas (requieren token JWT)

#### GET /api/ventas
Obtener historial de ventas

#### GET /api/ventas/:id
Obtener detalle de una venta específica

#### POST /api/ventas
Registrar nueva venta

**Body:**
```json
{
  "cliente_id": 1,
  "items": [
    {
      "libro_id": 1,
      "cantidad": 2,
      "precio_unitario": 45000
    },
    {
      "libro_id": 2,
      "cantidad": 1,
      "precio_unitario": 85000
    }
  ]
}
```

### Dashboard (requieren token JWT)

#### GET /api/dashboard/estadisticas
Obtener estadísticas generales del sistema

## Seguridad Implementada

### Autenticación JWT

**Flujo de autenticación:**
1. Cliente envía credenciales a `/api/auth/login`
2. Servidor valida credenciales
3. Si son correctas, genera token JWT con expiración
4. Cliente incluye token en header de todas las peticiones protegidas
5. Middleware `verificarToken` valida token en cada petición

**Configuración del token:**
```javascript
const token = jwt.sign(
  {
    id: usuario.id,
    email: usuario.email,
    rol: rolNombre
  },
  process.env.JWT_SECRET,
  { expiresIn: '8h' } // Token expira en 8 horas
);
```

### Protección contra Fuerza Bruta

**Mecanismo implementado:**
- Contador de intentos fallidos en memoria
- Bloqueo temporal de 3 minutos después de 3 intentos fallidos
- Mensajes informativos sin revelar si el usuario existe
- Limpieza automática de bloqueos expirados

**Código en controladorAuth.js:**
```javascript
const TIEMPO_BLOQUEO_MINUTOS = 3;
const MAX_INTENTOS = 3;

// Estructura de seguimiento:
{
  intentos: 0,
  bloqueado: false,
  tiempoBloqueo: null
}
```

### Encriptación de Contraseñas

**bcrypt con 10 rounds:**
```javascript
const passwordHash = await bcrypt.hash(password, 10);
```

**Verificación:**
```javascript
const esValida = await bcrypt.compare(passwordIngresado, passwordHash);
```

### CORS Configurado

**Configuración en index.js:**
```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
```

### Middleware de Verificación de Token

**verificarToken.js:**
- Extrae token del header Authorization
- Verifica firma del token
- Valida expiración
- Adjunta datos de usuario a request
- Retorna 401 si token es inválido

## Manejo de Errores

### Errores Comunes

**Error 400 - Bad Request**
- Datos faltantes o inválidos
- Validaciones de negocio fallidas

**Error 401 - Unauthorized**
- Token ausente, inválido o expirado
- Credenciales incorrectas

**Error 404 - Not Found**
- Recurso no encontrado

**Error 409 - Conflict**
- Duplicados (ISBN, email, documento, etc.)

**Error 500 - Internal Server Error**
- Errores de base de datos
- Errores no controlados

### Formato de Respuestas de Error

```json
{
  "error": "Descripción corta del error",
  "mensaje": "Mensaje detallado para el usuario (opcional)",
  "detalles": "Información adicional (opcional)"
}
```

## Scripts Útiles

### Resetear Contraseña de Usuario

```bash
node scripts/reset_password.js
```

Este script permite resetear la contraseña de cualquier usuario. Útil para:
- Recuperar acceso de administrador
- Resetear contraseñas olvidadas
- Pruebas en desarrollo

**Uso:**
1. Editar el script con el email y nueva contraseña
2. Ejecutar: `node scripts/reset_password.js`
3. La nueva contraseña será hasheada automáticamente

## Base de Datos

### Tablas Principales

**usuarios**
- Sistema de autenticación
- Roles (Administrador, Vendedor)
- Contraseñas hasheadas con bcrypt

**libros**
- Catálogo de productos
- Relaciones con autores y categorías
- Control de stock

**movimientos**
- Kardex completo
- Entradas y salidas
- Auditoría por usuario

**ventas y detalle_ventas**
- Cabecera y detalle de facturas
- Relación con clientes y libros
- Cálculo de totales

**clientes y proveedores**
- Datos de contacto
- Documentos únicos
- Historial de transacciones

**autores y categorias**
- Tablas maestras
- Normalización 3NF
- Validación de asociaciones

### Migraciones

Si se realizan cambios en la estructura de BD:
1. Crear script en `base_datos/`
2. Documentar cambios
3. Ejecutar manualmente: `mysql -u root -p < base_datos/nueva_migracion.sql`

## Mejoras Recientes

### Versión Actual (Diciembre 2025)

#### Nuevas Funcionalidades
- Controladores de Autores y Categorías (CRUD completo)
- Rutas protegidas para Autores y Categorías
- Validación de asociaciones antes de eliminar
- Prevención de duplicados en categorías

#### Seguridad
- Reducción de tiempo de bloqueo a 3 minutos (entorno educativo)
- Mensajes de error más profesionales
- Corrección en script de reseteo de contraseñas

#### Optimizaciones
- Consultas JOIN optimizadas para obtener datos relacionados
- Validaciones de negocio antes de operaciones críticas
- Manejo consistente de errores en todos los controladores

## Desarrollo

### Agregar Nuevo Endpoint

1. **Crear controlador** en `controladores/`
```javascript
exports.obtenerDatos = async (req, res) => {
  try {
    const [resultados] = await db.query('SELECT * FROM tabla');
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos' });
  }
};
```

2. **Crear archivo de rutas** en `rutas/`
```javascript
const express = require('express');
const router = express.Router();
const controlador = require('../controladores/miControlador');
const verificarToken = require('../middlewares/verificarToken');

router.get('/', verificarToken, controlador.obtenerDatos);

module.exports = router;
```

3. **Registrar rutas** en `index.js`
```javascript
const rutasMiRecurso = require('./rutas/miRutas');
app.use('/api/mi-recurso', rutasMiRecurso);
```

### Convenciones de Código

- **Funciones async/await** para operaciones de BD
- **Destructuring** para queries: `const [resultados] = await db.query(...)`
- **Try/catch** en todos los controladores
- **Status codes HTTP** apropiados
- **Mensajes de error** descriptivos sin exponer detalles internos

## Testing

### Probar Endpoints con curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sena.edu.co","password":"123456"}'

# Obtener libros (con token)
curl -X GET http://localhost:3000/api/libros \
  -H "Authorization: Bearer <tu-token>"
```

### Probar con Postman

1. Importar colección de endpoints
2. Configurar variable de entorno para token
3. Ejecutar peticiones en orden

## Solución de Problemas

### Error: Cannot connect to database
- Verificar que MySQL esté corriendo
- Revisar credenciales en .env
- Verificar que la BD existe: `SHOW DATABASES;`

### Error: JWT secret not defined
- Verificar que JWT_SECRET esté en .env
- Reiniciar servidor después de cambios en .env

### Error: Port already in use
- Cambiar PORT en .env
- Liberar puerto: `npx kill-port 3000`

### Logs no aparecen
- Verificar console.log en código
- Revisar que servidor esté corriendo
- Ver logs en terminal donde se ejecutó `node index.js`

## Recursos

- [Express.js Documentation](https://expressjs.com)
- [MySQL2 Package](https://github.com/sidorares/node-mysql2)
- [JWT.io](https://jwt.io)
- [bcrypt.js](https://github.com/dcodeIO/bcrypt.js)

---

Parte del proyecto SENA - Sistema de Gestión de Inventario
