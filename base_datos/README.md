# Base de Datos - Sistema de Gestión de Inventario

Documentación de la estructura de base de datos y scripts SQL del sistema.

## Contenido

- `script_inicial.sql` - Script de creación completa de la base de datos
- `migracion_metodo_pago.sql` - Migración para agregar métodos de pago
- `verificar_estructura_ventas.sql` - Script de verificación de tablas de ventas

## Estructura de Base de Datos

### Nombre de la Base de Datos
```sql
inventario_libreria
```

### Diagrama de Relaciones

```
roles (1) ───< (N) usuarios
                      │
                      └──> movimientos (N)
                      └──> ventas (N)

autores (1) ───< (N) libros ───< (N) movimientos
categorias (1) ───< (N) libros ───< (N) detalle_ventas

clientes (1) ───< (N) ventas (1) ───< (N) detalle_ventas

libros (1) ───< (N) detalle_ventas
```

## Tablas Detalladas

### 1. roles
Catálogo de roles del sistema

| Campo  | Tipo        | Descripción           |
|--------|-------------|-----------------------|
| id     | INT (PK)    | ID autoincremental    |
| nombre | VARCHAR(50) | Nombre del rol (UNIQUE)|

**Datos iniciales:**
- Administrador
- Vendedor

### 2. usuarios
Usuarios del sistema con autenticación

| Campo           | Tipo         | Descripción                    |
|-----------------|--------------|--------------------------------|
| id              | INT (PK)     | ID autoincremental             |
| nombre_completo | VARCHAR(100) | Nombre del usuario             |
| email           | VARCHAR(100) | Email (UNIQUE)                 |
| password_hash   | VARCHAR(255) | Contraseña hasheada con bcrypt |
| rol_id          | INT (FK)     | Relación con tabla roles       |
| estado          | TINYINT(1)   | 1: Activo, 0: Inactivo         |
| fecha_creacion  | TIMESTAMP    | Fecha de registro              |

**Índices:**
- PRIMARY KEY: id
- UNIQUE: email
- FOREIGN KEY: rol_id → roles(id)

**Usuario por defecto:**
- Email: admin@sena.edu.co
- Password: 123456 (hasheada)
- Rol: Administrador

### 3. autores
Autores de los libros

| Campo  | Tipo         | Descripción        |
|--------|--------------|---------------------|
| id     | INT (PK)     | ID autoincremental |
| nombre | VARCHAR(100) | Nombre del autor   |

**Validaciones:**
- No se puede eliminar si tiene libros asociados

### 4. categorias
Categorías de clasificación de libros

| Campo  | Tipo        | Descripción              |
|--------|-------------|--------------------------|
| id     | INT (PK)    | ID autoincremental       |
| nombre | VARCHAR(50) | Nombre de categoría (UNIQUE)|

**Validaciones:**
- Nombre único (no duplicados)
- No se puede eliminar si tiene libros asociados

### 5. libros
Catálogo de libros (inventario)

| Campo         | Tipo          | Descripción                        |
|---------------|---------------|------------------------------------|
| id            | INT (PK)      | ID autoincremental                 |
| isbn          | VARCHAR(20)   | Código internacional (UNIQUE)      |
| titulo        | VARCHAR(150)  | Título del libro                   |
| descripcion   | TEXT          | Descripción detallada              |
| precio_venta  | DECIMAL(10,2) | Precio de venta al público         |
| stock_actual  | INT           | Cantidad disponible                |
| stock_minimo  | INT           | Umbral para alertas (default: 5)   |
| autor_id      | INT (FK)      | Relación con autores               |
| categoria_id  | INT (FK)      | Relación con categorías            |
| fecha_creacion| TIMESTAMP     | Fecha de registro                  |

**Índices:**
- PRIMARY KEY: id
- UNIQUE: isbn
- FOREIGN KEY: autor_id → autores(id)
- FOREIGN KEY: categoria_id → categorias(id)

**Reglas de negocio:**
- stock_actual se actualiza automáticamente con movimientos
- stock_minimo se usa para alertas de inventario bajo

### 6. movimientos
Kardex - Historial de entradas y salidas

| Campo           | Tipo         | Descripción                       |
|-----------------|--------------|-----------------------------------|
| id              | INT (PK)     | ID autoincremental                |
| libro_id        | INT (FK)     | Libro afectado                    |
| usuario_id      | INT (FK)     | Usuario que registró              |
| tipo_movimiento | ENUM         | 'ENTRADA' o 'SALIDA'              |
| cantidad        | INT          | Cantidad del movimiento           |
| fecha_movimiento| TIMESTAMP    | Fecha/hora del registro           |
| observaciones   | TEXT         | Notas adicionales                 |

**Índices:**
- PRIMARY KEY: id
- FOREIGN KEY: libro_id → libros(id)
- FOREIGN KEY: usuario_id → usuarios(id)

**Tipos de movimiento:**
- `ENTRADA`: Compras, devoluciones de clientes
- `SALIDA`: Ventas, ajustes de inventario

### 7. clientes
Registro de clientes

| Campo           | Tipo         | Descripción                |
|-----------------|--------------|----------------------------|
| id              | INT (PK)     | ID autoincremental         |
| nombre_completo | VARCHAR(100) | Nombre del cliente         |
| documento       | VARCHAR(20)  | Documento de identidad (UNIQUE)|
| email           | VARCHAR(100) | Correo electrónico         |
| telefono        | VARCHAR(20)  | Número de contacto         |
| direccion       | VARCHAR(200) | Dirección física           |
| fecha_registro  | TIMESTAMP    | Fecha de registro          |

**Índices:**
- PRIMARY KEY: id
- UNIQUE: documento

### 8. proveedores
Registro de empresas proveedoras

| Campo          | Tipo         | Descripción                |
|----------------|--------------|----------------------------|
| id             | INT (PK)     | ID autoincremental         |
| nombre_empresa | VARCHAR(100) | Razón social               |
| nit            | VARCHAR(20)  | NIT de la empresa          |
| nombre_contacto| VARCHAR(100) | Persona de contacto        |
| email          | VARCHAR(100) | Correo corporativo         |
| telefono       | VARCHAR(20)  | Teléfono de contacto       |
| direccion      | VARCHAR(200) | Dirección de la empresa    |
| fecha_registro | TIMESTAMP    | Fecha de registro          |

**Nota:** Campo "nit" almacenado directamente en proveedores (no hay campo identificación separado)

### 9. ventas
Cabecera de facturas

| Campo       | Tipo          | Descripción                  |
|-------------|---------------|------------------------------|
| id          | INT (PK)      | Número de factura            |
| cliente_id  | INT (FK)      | Cliente que compró           |
| total       | DECIMAL(10,2) | Total de la venta            |
| fecha_venta | TIMESTAMP     | Fecha/hora de la transacción |
| usuario_id  | INT (FK)      | Usuario que registró         |

**Índices:**
- PRIMARY KEY: id
- FOREIGN KEY: cliente_id → clientes(id)
- FOREIGN KEY: usuario_id → usuarios(id)

### 10. detalle_ventas
Items de cada factura

| Campo          | Tipo          | Descripción              |
|----------------|---------------|--------------------------|
| id             | INT (PK)      | ID autoincremental       |
| venta_id       | INT (FK)      | Factura relacionada      |
| libro_id       | INT (FK)      | Libro vendido            |
| cantidad       | INT           | Unidades vendidas        |
| precio_unitario| DECIMAL(10,2) | Precio al momento venta  |

**Índices:**
- PRIMARY KEY: id
- FOREIGN KEY: venta_id → ventas(id) ON DELETE CASCADE
- FOREIGN KEY: libro_id → libros(id)

**Reglas:**
- ON DELETE CASCADE: Si se elimina venta, se eliminan sus detalles
- precio_unitario se guarda para mantener histórico (puede cambiar el precio del libro)

## Scripts SQL

### script_inicial.sql

Script completo para crear la base de datos desde cero.

**Contenido:**
1. Creación de base de datos
2. Definición de todas las tablas
3. Relaciones y claves foráneas
4. Datos semilla (seeders) para pruebas:
   - 2 roles
   - 1 usuario administrador
   - 5 categorías
   - 4 autores
   - 3 libros de ejemplo
   - 3 clientes de prueba
   - 2 proveedores de ejemplo

**Uso:**
```bash
mysql -u root -p < script_inicial.sql
```

**Importante:**
- Ejecutar solo una vez al iniciar el proyecto
- Crear backup antes de re-ejecutar
- Dropea y recrea toda la base de datos

### migracion_metodo_pago.sql

Migración para agregar funcionalidad de métodos de pago.

**Contenido:**
- Agregar columnas de método de pago a tabla ventas
- Valores por defecto
- Actualización de registros existentes

**Uso:**
```bash
mysql -u root -p inventario_libreria < migracion_metodo_pago.sql
```

### verificar_estructura_ventas.sql

Script de verificación para validar estructura de tablas de ventas.

**Uso:**
```bash
mysql -u root -p inventario_libreria < verificar_estructura_ventas.sql
```

**Utilidad:**
- Verificar que las tablas existan
- Validar estructura de columnas
- Debugging de problemas de esquema

## Normalización

La base de datos está normalizada en **Tercera Forma Normal (3NF)**:

### Primera Forma Normal (1NF)
- Todos los valores son atómicos
- No hay grupos repetitivos
- Cada columna tiene un nombre único

### Segunda Forma Normal (2NF)
- Cumple 1NF
- Todos los atributos no clave dependen completamente de la clave primaria
- Ejemplo: autores y categorías están separados de libros

### Tercera Forma Normal (3NF)
- Cumple 2NF
- No hay dependencias transitivas
- Ejemplo: nombre_autor no está en libros, sino en tabla autores

**Beneficios:**
- Eliminación de redundancia
- Integridad de datos
- Facilita actualizaciones
- Optimiza almacenamiento

## Integridad Referencial

### Claves Foráneas Configuradas

Todas las relaciones tienen claves foráneas definidas:

```sql
-- Ejemplo en tabla libros
FOREIGN KEY (autor_id) REFERENCES autores(id)
FOREIGN KEY (categoria_id) REFERENCES categorias(id)

-- Ejemplo en tabla movimientos
FOREIGN KEY (libro_id) REFERENCES libros(id)
FOREIGN KEY (usuario_id) REFERENCES usuarios(id)

-- Ejemplo en detalle_ventas con CASCADE
FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE
```

### Validaciones en Backend

El backend implementa validaciones adicionales:
- No eliminar autor si tiene libros asociados
- No eliminar categoría si tiene libros asociados
- No permitir categorías con nombres duplicados
- Validar existencia de registros antes de crear relaciones

## Consultas Útiles

### Ver todas las tablas
```sql
USE inventario_libreria;
SHOW TABLES;
```

### Verificar estructura de tabla
```sql
DESCRIBE libros;
SHOW CREATE TABLE libros;
```

### Estadísticas de inventario
```sql
SELECT
    COUNT(*) as total_libros,
    SUM(stock_actual) as total_stock,
    AVG(precio_venta) as precio_promedio
FROM libros;
```

### Libros con stock bajo
```sql
SELECT id, titulo, stock_actual, stock_minimo
FROM libros
WHERE stock_actual <= stock_minimo;
```

### Libros por categoría
```sql
SELECT c.nombre as categoria, COUNT(l.id) as cantidad
FROM categorias c
LEFT JOIN libros l ON c.id = l.categoria_id
GROUP BY c.id, c.nombre;
```

### Historial de movimientos de un libro
```sql
SELECT
    m.fecha_movimiento,
    m.tipo_movimiento,
    m.cantidad,
    m.observaciones,
    u.nombre_completo as usuario
FROM movimientos m
JOIN usuarios u ON m.usuario_id = u.id
WHERE m.libro_id = 1
ORDER BY m.fecha_movimiento DESC;
```

### Ventas del día
```sql
SELECT
    v.id as factura,
    c.nombre_completo as cliente,
    v.total,
    v.fecha_venta
FROM ventas v
JOIN clientes c ON v.cliente_id = c.id
WHERE DATE(v.fecha_venta) = CURDATE()
ORDER BY v.fecha_venta DESC;
```

### Top libros más vendidos
```sql
SELECT
    l.titulo,
    SUM(dv.cantidad) as total_vendido,
    SUM(dv.cantidad * dv.precio_unitario) as ingresos
FROM detalle_ventas dv
JOIN libros l ON dv.libro_id = l.id
GROUP BY l.id, l.titulo
ORDER BY total_vendido DESC
LIMIT 10;
```

## Backup y Restauración

### Crear Backup
```bash
mysqldump -u root -p inventario_libreria > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar desde Backup
```bash
mysql -u root -p inventario_libreria < backup_20251207_120000.sql
```

### Backup de solo datos (sin estructura)
```bash
mysqldump -u root -p --no-create-info inventario_libreria > datos_backup.sql
```

### Backup de solo estructura (sin datos)
```bash
mysqldump -u root -p --no-data inventario_libreria > estructura_backup.sql
```

## Migraciones Futuras

Si se necesitan hacer cambios en la estructura:

1. **Crear nuevo archivo** en `base_datos/` con nombre descriptivo
2. **Documentar cambios** con comentarios SQL
3. **Incluir validaciones** (IF NOT EXISTS, etc.)
4. **Probar en desarrollo** antes de aplicar en producción
5. **Actualizar este README** con la nueva migración

**Plantilla de migración:**
```sql
-- =============================================
-- MIGRACIÓN: [Descripción del cambio]
-- Fecha: [YYYY-MM-DD]
-- Autor: [Nombre]
-- =============================================

USE inventario_libreria;

-- Agregar nueva columna si no existe
ALTER TABLE nombre_tabla
ADD COLUMN IF NOT EXISTS nueva_columna VARCHAR(100) DEFAULT NULL;

-- Actualizar datos existentes si es necesario
UPDATE nombre_tabla SET nueva_columna = 'valor' WHERE condicion;

-- Verificar cambios
SELECT * FROM nombre_tabla LIMIT 5;
```

## Índices y Optimización

### Índices Actuales

**Índices primarios (PRIMARY KEY):**
- Todas las tablas tienen id como PK autoincremental

**Índices únicos (UNIQUE):**
- usuarios.email
- libros.isbn
- clientes.documento
- categorias.nombre

**Índices de clave foránea:**
- Creados automáticamente en todas las FK

### Recomendaciones de Optimización

Si la BD crece, considerar agregar índices en:
```sql
-- Búsquedas frecuentes por título
CREATE INDEX idx_libros_titulo ON libros(titulo);

-- Filtros por fecha en ventas
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);

-- Búsquedas de movimientos por tipo
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo_movimiento);
```

## Mantenimiento

### Limpiar datos de prueba
```sql
-- Eliminar datos de ejemplo (mantener estructura)
DELETE FROM detalle_ventas;
DELETE FROM ventas;
DELETE FROM movimientos;
DELETE FROM libros;
DELETE FROM clientes;
DELETE FROM proveedores;
DELETE FROM autores WHERE id > 0;
DELETE FROM categorias WHERE id > 0;

-- Resetear autoincrements
ALTER TABLE ventas AUTO_INCREMENT = 1;
ALTER TABLE libros AUTO_INCREMENT = 1;
-- etc.
```

### Verificar integridad
```sql
-- Verificar claves foráneas huérfanas
SELECT l.id, l.titulo, l.autor_id
FROM libros l
LEFT JOIN autores a ON l.autor_id = a.id
WHERE a.id IS NULL;
```

## Seguridad

### Usuarios de Base de Datos

**NO usar root en producción.** Crear usuario específico:

```sql
CREATE USER 'inventario_app'@'localhost' IDENTIFIED BY 'password_segura';
GRANT SELECT, INSERT, UPDATE, DELETE ON inventario_libreria.* TO 'inventario_app'@'localhost';
FLUSH PRIVILEGES;
```

### Buenas Prácticas

- Nunca exponer credenciales en código
- Usar variables de entorno (.env)
- Hacer backups periódicos
- Mantener MySQL actualizado
- Monitorear logs de errores

---

Proyecto SENA - Sistema de Gestión de Inventario
