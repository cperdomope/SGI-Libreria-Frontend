# Base de Datos - Sistema de Gestion de Inventario

Documentacion de la estructura de base de datos del sistema SGI Libreria.

## Archivos SQL

| Archivo | Descripcion | Uso |
|---------|-------------|-----|
| `sgi_libreria_completo.sql` | **Script completo portátil (USAR ESTE)** | Instalación nueva o en otra máquina |
| `script_completo.sql` | Script anterior (depreciado) | No usar - reemplazado por sgi_libreria_completo.sql |
| `migracion_columnas_faltantes.sql` | Añade columnas faltantes a BD existente | Solo si BD ya existe y faltan columnas |

## Instalacion Rapida

### Nueva Instalacion (Recomendado para otra máquina)

```bash
# 1. Ejecutar script SQL completo
mysql -u root -p < sgi_libreria_completo.sql

# 2. Generar contrasenas bcrypt validas
cd ../servidor
node scripts/reset_password.js

# 3. Iniciar el servidor
npm start
```

## Credenciales por Defecto

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| Administrador | admin@sena.edu.co | 123456 | Administrador |
| Vendedor | vendedor@sena.edu.co | vendedor123 | Vendedor |

> **⚠️ IMPORTANTE:** Ejecutar `reset_password.js` después de la instalación SQL para generar hashes bcrypt válidos. Sin este paso, NO podrás iniciar sesión.

## Estructura de la Base de Datos

### Nombre: `inventario_libreria`

### Prefijo de Tablas: `mdc_`

Todas las tablas usan el prefijo `mdc_` para evitar conflictos en hosting compartido.

### Diagrama de Relaciones

```
mdc_roles (1) ────< (N) mdc_usuarios
                              │
                              ├──> mdc_movimientos (N)
                              └──> mdc_ventas (N)

mdc_autores (1) ────< (N) mdc_libros ────< (N) mdc_movimientos
mdc_categorias (1) ─< (N) mdc_libros ────< (N) mdc_detalle_ventas

mdc_clientes (1) ───< (N) mdc_ventas (1) ───< (N) mdc_detalle_ventas
```

## Tablas del Sistema (10)

### 1. mdc_roles
Control de acceso por roles (RBAC).

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (PK) | ID autoincremental |
| nombre | VARCHAR(50) | Nombre unico del rol |

**Roles disponibles:** Administrador, Vendedor

---

### 2. mdc_usuarios
Usuarios del sistema con autenticacion.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (PK) | ID autoincremental |
| nombre_completo | VARCHAR(100) | Nombre del usuario |
| email | VARCHAR(100) | Email unico |
| password_hash | VARCHAR(255) | Contrasena hasheada (bcrypt) |
| rol_id | INT (FK) | Referencia a mdc_roles |
| estado | TINYINT(1) | 1=Activo, 0=Inactivo |
| fecha_creacion | TIMESTAMP | Fecha de registro |

---

### 3. mdc_autores
Catalogo de autores de libros.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (PK) | ID autoincremental |
| nombre | VARCHAR(100) | Nombre del autor |
| nacionalidad | VARCHAR(50) | País de origen |
| fecha_creacion | TIMESTAMP | Fecha de registro |

---

### 4. mdc_categorias
Categorias de clasificacion.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (PK) | ID autoincremental |
| nombre | VARCHAR(50) | Nombre unico de categoria |
| descripcion | VARCHAR(200) | Descripción de la categoría |
| fecha_creacion | TIMESTAMP | Fecha de registro |

---

### 5. mdc_libros
Inventario principal de libros.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (PK) | ID autoincremental |
| isbn | VARCHAR(20) | Codigo ISBN unico |
| titulo | VARCHAR(150) | Titulo del libro |
| descripcion | TEXT | Descripcion detallada |
| precio_venta | DECIMAL(10,2) | Precio de venta |
| stock_actual | INT | Cantidad disponible |
| stock_minimo | INT | Umbral para alertas (default: 5) |
| autor_id | INT (FK) | Referencia a mdc_autores |
| categoria_id | INT (FK) | Referencia a mdc_categorias |
| activo | TINYINT(1) | 1=Activo, 0=Desactivado (default: 1) |
| fecha_creacion | TIMESTAMP | Fecha de registro |

---

### 6. mdc_movimientos
Kardex - Historial de entradas y salidas.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (PK) | ID autoincremental |
| libro_id | INT (FK) | Libro afectado |
| usuario_id | INT (FK) | Usuario que registro |
| tipo_movimiento | ENUM | 'ENTRADA' o 'SALIDA' |
| cantidad | INT | Cantidad del movimiento |
| fecha_movimiento | TIMESTAMP | Fecha/hora del registro |
| observaciones | TEXT | Notas adicionales |

---

### 7. mdc_clientes
Registro de clientes.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (PK) | ID autoincremental |
| nombre_completo | VARCHAR(100) | Nombre del cliente o empresa |
| documento | VARCHAR(20) | Documento unico |
| tipo_documento | ENUM | 'CC', 'NIT', 'CE', 'Pasaporte' |
| email | VARCHAR(100) | Correo electronico |
| telefono | VARCHAR(20) | Numero de contacto |
| direccion | VARCHAR(200) | Direccion fisica |
| fecha_registro | TIMESTAMP | Fecha de registro |

---

### 8. mdc_proveedores
Registro de proveedores.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (PK) | ID autoincremental |
| nombre_empresa | VARCHAR(100) | Razon social |
| nit | VARCHAR(20) | NIT de la empresa |
| nombre_contacto | VARCHAR(100) | Persona de contacto |
| email | VARCHAR(100) | Correo corporativo |
| telefono | VARCHAR(20) | Telefono de contacto |
| direccion | VARCHAR(200) | Direccion de la empresa |
| fecha_registro | TIMESTAMP | Fecha de registro |

---

### 9. mdc_ventas
Cabecera de facturas de venta.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (PK) | Numero de factura |
| cliente_id | INT (FK) | Cliente que compro |
| usuario_id | INT (FK) | Usuario que registro |
| total_venta | DECIMAL(10,2) | Total de la venta |
| metodo_pago | ENUM | 'Efectivo', 'Tarjeta', 'Transferencia' |
| estado | ENUM | 'Completada', 'Pendiente', 'Cancelada' (default: 'Completada') |
| fecha_venta | TIMESTAMP | Fecha/hora de la transaccion |

---

### 10. mdc_detalle_ventas
Items de cada factura.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (PK) | ID autoincremental |
| venta_id | INT (FK) | Factura relacionada |
| libro_id | INT (FK) | Libro vendido |
| cantidad | INT | Unidades vendidas |
| precio_unitario | DECIMAL(10,2) | Precio al momento de venta |
| subtotal | DECIMAL(10,2) | Cantidad x Precio |

**Regla:** ON DELETE CASCADE - Si se elimina venta, se eliminan sus detalles.

---

## Vistas del Sistema (3)

El script `sgi_libreria_completo.sql` crea automáticamente 3 vistas útiles:

### v_libros_stock_bajo
Muestra libros que están en o bajo el stock mínimo.

```sql
SELECT * FROM v_libros_stock_bajo;
```

### v_ventas_hoy
Resumen de ventas del día actual (total ventas, ingresos, promedio).

```sql
SELECT * FROM v_ventas_hoy;
```

### v_catalogo_libros
Catálogo completo con autor, categoría y estado de stock.

```sql
SELECT * FROM v_catalogo_libros WHERE estado_stock = 'Disponible';
```

---

## Índices de Optimización

El script incluye 10 índices para mejorar el rendimiento:

- `idx_libros_titulo` - Búsquedas por título
- `idx_libros_isbn` - Búsquedas por ISBN
- `idx_libros_stock` - Consultas de inventario
- `idx_ventas_fecha` - Reportes por fecha
- `idx_ventas_cliente` - Historial por cliente
- `idx_movimientos_fecha` - Kardex por fecha
- `idx_movimientos_libro` - Movimientos por libro
- `idx_clientes_nombre` - Búsqueda de clientes
- `idx_clientes_documento` - Validación de documentos
- `idx_usuarios_email` - Login rápido

---

## Consultas Utiles

### Ver todas las tablas
```sql
USE inventario_libreria;
SHOW TABLES LIKE 'mdc_%';
```

### Estadisticas de inventario
```sql
SELECT
    COUNT(*) as total_libros,
    SUM(stock_actual) as total_unidades,
    AVG(precio_venta) as precio_promedio
FROM mdc_libros;
```

### Libros con stock bajo
```sql
SELECT id, titulo, stock_actual, stock_minimo
FROM mdc_libros
WHERE stock_actual <= stock_minimo;
```

### Ventas del dia
```sql
SELECT
    v.id as factura,
    c.nombre_completo as cliente,
    v.total_venta,
    v.metodo_pago,
    v.fecha_venta
FROM mdc_ventas v
JOIN mdc_clientes c ON v.cliente_id = c.id
WHERE DATE(v.fecha_venta) = CURDATE();
```

### Top 5 libros mas vendidos
```sql
SELECT
    l.titulo,
    SUM(dv.cantidad) as vendidos,
    SUM(dv.subtotal) as ingresos
FROM mdc_detalle_ventas dv
JOIN mdc_libros l ON dv.libro_id = l.id
GROUP BY l.id
ORDER BY vendidos DESC
LIMIT 5;
```

## Backup y Restauracion

### Crear Backup
```bash
mysqldump -u root -p inventario_libreria > backup_$(date +%Y%m%d).sql
```

### Restaurar Backup
```bash
mysql -u root -p inventario_libreria < backup_20251227.sql
```

## Características del Script Completo

El archivo `sgi_libreria_completo.sql` incluye:

✅ **10 Tablas** con prefijo `mdc_` y todas las relaciones FK
✅ **Datos de prueba** (8 categorías, 8 autores, 10 libros, 7 clientes, 4 proveedores)
✅ **2 Usuarios** (Administrador y Vendedor) con hashes placeholder
✅ **10 Índices** de optimización para consultas frecuentes
✅ **3 Vistas** útiles (stock bajo, ventas hoy, catálogo)
✅ **Verificación automática** de instalación al ejecutarse
✅ **Charset UTF-8** completo (utf8mb4) para emojis y caracteres especiales

## Normalizacion

La base de datos cumple con la **Tercera Forma Normal (3NF)**:

- **1NF:** Valores atomicos, sin grupos repetitivos
- **2NF:** Atributos dependen completamente de la clave primaria
- **3NF:** No hay dependencias transitivas

**Motor:** InnoDB (soporte transaccional y claves foráneas)

## Seguridad

### Usuario de Base de Datos (Produccion)

No usar root en produccion. Crear usuario especifico:

```sql
CREATE USER 'inventario_app'@'localhost' IDENTIFIED BY 'password_segura';
GRANT SELECT, INSERT, UPDATE, DELETE ON inventario_libreria.* TO 'inventario_app'@'localhost';
FLUSH PRIVILEGES;
```

### Buenas Practicas

- Usar variables de entorno (.env) para credenciales
- Hacer backups periodicos
- Mantener MySQL actualizado
- No exponer puertos de BD al exterior

---

## Verificación de Instalación

Después de ejecutar `sgi_libreria_completo.sql`, el script muestra automáticamente:

- ✅ Estado de creación de la base de datos
- 📊 Lista de tablas creadas con número de registros
- 👁️ Vistas disponibles

### Prueba rápida

```sql
-- Ver tablas creadas
USE inventario_libreria;
SHOW TABLES;

-- Ver cantidad de registros
SELECT
    (SELECT COUNT(*) FROM mdc_libros) AS libros,
    (SELECT COUNT(*) FROM mdc_autores) AS autores,
    (SELECT COUNT(*) FROM mdc_categorias) AS categorias,
    (SELECT COUNT(*) FROM mdc_clientes) AS clientes,
    (SELECT COUNT(*) FROM mdc_proveedores) AS proveedores;

-- Ver libros con stock bajo
SELECT * FROM v_libros_stock_bajo;
```

---

## Datos de Prueba Incluidos

El script `sgi_libreria_completo.sql` incluye datos de ejemplo para pruebas:

- **8 Categorías**: Tecnología, Ficción, Historia, Ciencia, Negocios, Arte, Infantil, Autoayuda
- **8 Autores**: García Márquez, Robert C. Martin, Isabel Allende, Vargas Llosa, Paulo Coelho, Stephen King, Borges, Cortázar
- **10 Libros**: Incluyendo "Cien Años de Soledad", "Clean Code", "El Alquimista", "It", etc.
- **7 Clientes**: 5 personas naturales + 2 empresas
- **4 Proveedores**: Distribuidoras y editoriales

---

**Proyecto SENA - Sistema de Gestion de Inventario**
**Tecnologo en Analisis y Desarrollo de Software**
**Version: 2.1.0 - Diciembre 2024**
