-- =====================================================
-- SCRIPT COMPLETO - BASE DE DATOS SGI LIBRERÍA
-- =====================================================
-- Sistema de Gestión de Inventario - Librería El Saber
-- Proyecto SENA - Tecnólogo en Análisis y Desarrollo de Software
--
-- VERSIÓN: 4.0.0
-- FECHA: Marzo 2026
--
-- PREFIJO DE TABLAS: mdc_
-- (Usamos un prefijo para evitar conflictos de nombres con otras
-- bases de datos en servidores de hosting compartido. De esta forma,
-- nuestras tablas se identifican fácilmente como parte del proyecto.)
--
-- MOTOR: InnoDB
-- (Elegimos InnoDB porque es el motor de almacenamiento de MySQL que
-- soporta transacciones ACID y claves foráneas (Foreign Keys).
-- Las transacciones nos permiten agrupar varias operaciones SQL en una
-- sola unidad: si una falla, todas se revierten, protegiendo la
-- integridad de los datos. Esto es fundamental en un sistema de ventas
-- donde se modifica stock y se registran movimientos simultáneamente.)
--
-- CHARSET: utf8mb4
-- (Usamos utf8mb4 en lugar de utf8 porque utf8mb4 soporta el conjunto
-- completo de caracteres Unicode, incluyendo tildes, eñes, emojis y
-- símbolos especiales. utf8 de MySQL solo soporta hasta 3 bytes por
-- carácter, lo que excluye algunos caracteres. utf8mb4 usa hasta 4
-- bytes y es el estándar recomendado actualmente.)
--
-- COLLATE: utf8mb4_unicode_ci
-- (El collation define cómo MySQL compara y ordena texto.
-- 'unicode_ci' significa que las comparaciones no distinguen entre
-- mayúsculas y minúsculas (Case Insensitive), así que buscar
-- 'garcía' encontrará 'García' y 'GARCÍA'. Esto es ideal para
-- búsquedas de nombres, títulos y correos electrónicos.)


-- INSTRUCCIONES DE INSTALACIÓN:
--
-- 1. Abrir MySQL Workbench, HeidiSQL o terminal MySQL
--
-- 2. Ejecutar este script completo:
--    mysql -u root -p < sgi_libreria_completo.sql
--
-- 3. Listo. Los usuarios de ejemplo ya quedan con sus contraseñas
--    cifradas con bcrypt, por lo que se puede iniciar sesión de una vez:
--    - Administrador: ldarlys@sena.edu.co   / Luzd12345
--    - Vendedor:      michelle@sena.edu.co  / vendedor123
--    - Administrador: cip@sena.edu.co       / cip123
--
--    (Si desea cambiar alguna contraseña, vea la SECCIÓN 7.2 al final
--     del script, donde se explica cómo generar un hash nuevo.)


-- =====================================================
-- SECCIÓN 1: PREPARACIÓN DEL ENTORNO
-- =====================================================
-- Antes de crear cualquier tabla, debemos preparar el entorno de MySQL.
-- Esto incluye configurar el charset de la conexión, crear la base de
-- datos y seleccionarla como la base de datos activa.

-- SET NAMES establece el charset que usará el cliente MySQL para enviar
-- y recibir datos. Con esto nos aseguramos de que los caracteres
-- especiales (tildes, eñes) se transmitan correctamente entre el
-- cliente y el servidor de base de datos.
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- DROP DATABASE IF EXISTS elimina la base de datos si ya existía.
-- Esto permite ejecutar el script varias veces sin errores (instalación
-- limpia). IMPORTANTE: esto borra TODOS los datos existentes, por lo
-- que solo debe usarse en desarrollo o al instalar por primera vez.
DROP DATABASE IF EXISTS inventario_libreria;

-- CREATE DATABASE crea una nueva base de datos vacía. Le asignamos
-- el charset utf8mb4 y el collation unicode_ci como configuración
-- predeterminada, de modo que todas las tablas que creemos dentro
-- hereden automáticamente esta configuración.
CREATE DATABASE inventario_libreria
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- USE selecciona la base de datos activa. A partir de aquí, todas
-- las sentencias CREATE TABLE, INSERT, etc., se ejecutarán dentro
-- de 'inventario_libreria'.
USE inventario_libreria;

-- FOREIGN_KEY_CHECKS controla si MySQL verifica las claves foráneas
-- al ejecutar sentencias. Lo desactivamos temporalmente (valor 0)
-- porque vamos a crear todas las tablas de una vez y algunas tienen
-- referencias cruzadas entre sí. Si no lo desactiváramos, MySQL
-- daría error al intentar crear una FK hacia una tabla que aún no
-- existe. Lo reactivamos al final de la creación de tablas.
SET FOREIGN_KEY_CHECKS = 0;


-- =====================================================
-- SECCIÓN 2: TABLAS DEL SISTEMA DE SEGURIDAD
-- =====================================================
-- Estas tablas manejan la autenticación (quién eres) y la autorización
-- (qué puedes hacer). Implementamos un sistema RBAC (Role-Based Access
-- Control), que significa Control de Acceso Basado en Roles. En RBAC,
-- los permisos se asignan a roles (Administrador, Vendedor) y luego
-- cada usuario se asocia a un rol, en lugar de asignar permisos
-- individualmente a cada usuario.

-- 2.1 Tabla de Roles (Sistema RBAC)
-- Esta tabla almacena los roles disponibles en el sistema.
-- Actualmente manejamos dos: Administrador (acceso total) y
-- Vendedor (acceso limitado a ventas e inventario).
-- INT AUTO_INCREMENT PRIMARY KEY: crea un identificador numérico único
-- que se incrementa automáticamente con cada nuevo registro.
-- VARCHAR(50): tipo de dato para texto con longitud máxima de 50 caracteres.
-- NOT NULL: indica que el campo es obligatorio, no puede quedar vacío.
-- UNIQUE: garantiza que no se puedan repetir nombres de rol.
CREATE TABLE mdc_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB COMMENT='Roles del sistema RBAC';

-- 2.2 Tabla de Usuarios
-- Almacena las credenciales y datos de cada usuario que puede
-- iniciar sesión en el sistema. La contraseña se guarda como hash
-- bcrypt (nunca en texto plano) por razones de seguridad.
-- TINYINT(1): tipo de dato pequeño que usamos como booleano
-- (1 = verdadero/activo, 0 = falso/inactivo).
-- TIMESTAMP: almacena fecha y hora. DEFAULT CURRENT_TIMESTAMP
-- asigna automáticamente la fecha/hora actual al crear un registro.
-- FOREIGN KEY: crea una relación entre esta tabla y mdc_roles.
-- El campo rol_id de esta tabla debe contener un valor que exista
-- en la columna id de mdc_roles. ON UPDATE CASCADE significa que
-- si el id del rol cambia, se actualiza automáticamente aquí.
CREATE TABLE mdc_usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
    rol_id INT NOT NULL,
    estado TINYINT(1) DEFAULT 1 COMMENT '1=Activo, 0=Inactivo',
    ultimo_acceso TIMESTAMP NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES mdc_roles(id) ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Usuarios del sistema con autenticación JWT';


-- =====================================================
-- SECCIÓN 3: TABLAS DEL CATÁLOGO
-- =====================================================
-- Estas tablas almacenan la información del catálogo de productos
-- de la librería: los autores, las categorías y los libros.
-- Separamos autores y categorías en tablas independientes para
-- aplicar el principio de normalización de bases de datos.
-- La normalización evita la repetición de datos: en lugar de escribir
-- "Gabriel García Márquez" en cada libro, guardamos el nombre una
-- sola vez en mdc_autores y lo referenciamos con un id numérico.

-- 3.1 Tabla de Autores
-- Catálogo de autores de libros. Cada autor se registra una sola
-- vez y puede estar asociado a múltiples libros (relación 1:N).
CREATE TABLE mdc_autores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Catálogo de autores de libros';

-- 3.2 Tabla de Categorías
-- Clasificación de libros por género o tema (Novela, Programación,
-- Historia, etc.). Al igual que autores, se normaliza en su propia
-- tabla para evitar inconsistencias (por ejemplo, que un libro diga
-- "Programación" y otro "programación" con minúscula).
-- UNIQUE en 'nombre' impide que se registren categorías duplicadas.
CREATE TABLE mdc_categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Categorías para clasificar libros';

-- 3.3 Tabla de Libros (Inventario Principal)
-- Esta es la tabla central del sistema. Almacena toda la información
-- de cada libro: datos bibliográficos, precio, stock y relaciones
-- con autor y categoría.
-- ISBN: es el código internacional estándar para identificar libros.
-- DECIMAL(10,2): tipo numérico para valores monetarios. 10 dígitos
-- en total, 2 de ellos decimales. Ejemplo: 85000.00 (pesos COP).
-- Usamos DECIMAL en lugar de FLOAT porque FLOAT puede tener errores
-- de precisión con decimales, algo inaceptable en valores de dinero.
-- stock_minimo: define el umbral de alerta. Cuando stock_actual cae
-- por debajo de este valor, el sistema muestra una alerta visual.
-- ON DELETE SET NULL: si se elimina un autor o categoría, el campo
-- correspondiente en el libro se pone en NULL en lugar de eliminar
-- el libro. Así no perdemos datos de inventario por borrar un autor.
CREATE TABLE mdc_libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(20) UNIQUE COMMENT 'ISBN-13 del libro',
    portada VARCHAR(255) NULL COMMENT 'Nombre del archivo de imagen de portada (carpeta uploads/portadas/)',
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_venta DECIMAL(10, 2) NOT NULL COMMENT 'Precio en COP',
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 5 COMMENT 'Umbral para alerta de reabastecimiento',
    autor_id INT,
    categoria_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES mdc_autores(id) ON DELETE SET NULL,
    FOREIGN KEY (categoria_id) REFERENCES mdc_categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Inventario principal de libros';


-- =====================================================
-- SECCIÓN 4: TABLAS DE OPERACIONES
-- =====================================================
-- Estas tablas registran las operaciones diarias del negocio:
-- datos de clientes, proveedores y movimientos de inventario.
-- El orden de creación importa: mdc_clientes y mdc_proveedores
-- se crean ANTES de mdc_movimientos y mdc_ventas porque estas
-- últimas tienen claves foráneas que los referencian.

-- 4.1 Tabla de Clientes
-- Registro de clientes para facturación y seguimiento de compras.
-- El campo 'documento' almacena la cédula de ciudadanía (CC) o
-- NIT para personas jurídicas. Se marca como UNIQUE para evitar
-- registrar el mismo cliente dos veces.
CREATE TABLE mdc_clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documento VARCHAR(20) NOT NULL UNIQUE COMMENT 'CC, NIT o documento de identidad',
    nombre_completo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(200),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Clientes de la librería';

-- 4.2 Tabla de Proveedores
-- Empresas o distribuidoras que suministran libros a la librería.
-- Almacenamos la información de contacto para gestionar pedidos
-- y mantener la relación comercial.
CREATE TABLE mdc_proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(100) NOT NULL,
    nit VARCHAR(20) COMMENT 'NIT de la empresa',
    nombre_contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(200),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Proveedores de libros';

-- 4.3 Tabla de Movimientos (Kardex)
-- El Kardex es un registro contable que documenta cada entrada y
-- salida de productos del inventario. Cada vez que llegan libros
-- de un proveedor (ENTRADA) o se venden libros (SALIDA), se crea
-- un registro aquí. Esto permite auditar el historial completo de
-- movimientos de cada libro.
-- ENUM: tipo de dato que solo permite valores específicos, en este
-- caso 'ENTRADA' o 'SALIDA'. Si se intenta insertar otro valor,
-- MySQL rechaza la operación, garantizando la integridad de datos.
-- stock_anterior y stock_nuevo: guardan una "foto" del stock antes
-- y después del movimiento, facilitando la auditoría y permitiendo
-- reconstruir el historial de inventario.
-- ON DELETE RESTRICT: impide eliminar un libro o usuario que tenga
-- movimientos registrados. Esto protege la trazabilidad del inventario.
-- ON DELETE SET NULL (proveedor_id): si se elimina un proveedor,
-- el movimiento se conserva pero el campo proveedor_id queda en NULL.
CREATE TABLE mdc_movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libro_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo_movimiento ENUM('ENTRADA', 'SALIDA') NOT NULL,
    cantidad INT NOT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    proveedor_id INT NULL COMMENT 'Proveedor que suministró los libros (solo para ENTRADA)',
    costo_compra DECIMAL(10, 2) NULL COMMENT 'Precio unitario de compra al proveedor',
    stock_anterior INT COMMENT 'Stock antes del movimiento',
    stock_nuevo INT COMMENT 'Stock después del movimiento',
    FOREIGN KEY (libro_id) REFERENCES mdc_libros(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES mdc_usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (proveedor_id) REFERENCES mdc_proveedores(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Kardex de movimientos de inventario';


-- =====================================================
-- SECCIÓN 5: TABLAS DE VENTAS
-- =====================================================
-- Las ventas se manejan con un modelo de cabecera-detalle, un
-- patrón muy común en bases de datos de facturación:
-- - La CABECERA (mdc_ventas) almacena la información general de la
--   venta: quién compró, quién vendió, fecha, total y método de pago.
-- - El DETALLE (mdc_detalle_ventas) almacena cada libro incluido
--   en esa venta con su cantidad y precio.
-- Esta separación permite que una venta tenga múltiples libros
-- (relación 1:N entre cabecera y detalle).

-- 5.1 Tabla de Ventas (Cabecera de Factura)
-- Cada registro representa una venta/factura completa.
-- El campo 'estado' permite manejar anulaciones sin borrar datos:
-- cuando se anula una venta, se cambia el estado a 'Anulada' y se
-- revierte el stock de los libros vendidos.
-- ON DELETE RESTRICT en cliente_id: impide eliminar un cliente que
-- tenga ventas asociadas, protegiendo el historial de facturación.
-- ON DELETE SET NULL en usuario_id: si se elimina el vendedor, la
-- venta se conserva pero sin referencia al vendedor. Esto es menos
-- estricto porque la venta ya fue realizada.
CREATE TABLE mdc_ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    usuario_id INT COMMENT 'Vendedor que realizó la venta',
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_venta DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0,
    metodo_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia', 'Mixto') DEFAULT 'Efectivo',
    estado ENUM('Completada', 'Anulada', 'Pendiente') DEFAULT 'Completada',
    FOREIGN KEY (cliente_id) REFERENCES mdc_clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES mdc_usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Cabecera de facturas de venta';

-- 5.2 Tabla de Detalle de Ventas (Items de Factura)
-- Cada registro representa una línea/item dentro de una factura.
-- Guardamos el precio_unitario al momento de la venta porque el
-- precio del libro puede cambiar en el futuro, pero la factura
-- debe reflejar el precio que se cobró en ese momento.
-- subtotal = cantidad * precio_unitario (se calcula en el backend
-- pero se almacena para consultas rápidas).
-- ON DELETE CASCADE en venta_id: si se elimina una venta, se
-- eliminan automáticamente todos sus items de detalle. Esto
-- mantiene la consistencia: no queremos detalles huérfanos
-- sin su venta padre.
-- ON DELETE RESTRICT en libro_id: impide eliminar un libro que
-- aparece en alguna factura, preservando el historial de ventas.
CREATE TABLE mdc_detalle_ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    libro_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL COMMENT 'Precio al momento de la venta',
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES mdc_ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (libro_id) REFERENCES mdc_libros(id) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Detalle de items por venta';

-- Reactivamos la verificación de claves foráneas ahora que todas
-- las tablas ya fueron creadas correctamente.
SET FOREIGN_KEY_CHECKS = 1;


-- =====================================================
-- SECCIÓN 6: ÍNDICES DE RENDIMIENTO
-- =====================================================
-- Un índice es una estructura de datos que MySQL crea internamente
-- para acelerar las búsquedas en una tabla, similar al índice de
-- un libro que te permite encontrar un tema sin leer todas las páginas.
-- Sin índice, MySQL debe recorrer TODA la tabla (Full Table Scan)
-- para encontrar un registro, lo cual es muy lento con miles de filas.
--
-- NOTA IMPORTANTE: InnoDB ya crea índices automáticamente para:
-- - PRIMARY KEY (clave primaria)
-- - FOREIGN KEY (claves foráneas)
-- - UNIQUE (restricciones de unicidad)
--
-- Los índices adicionales que creamos aquí cubren columnas que se
-- usan frecuentemente en cláusulas WHERE, ORDER BY y JOIN pero
-- que no tienen índice automático. Esto mejora significativamente
-- el rendimiento de las consultas más comunes del sistema.
--
-- NOTA: Algunos de los índices a continuación coinciden con columnas
-- que ya tienen UNIQUE o FOREIGN KEY (y por tanto ya tienen índice
-- automático). En esos casos el índice explícito es redundante pero
-- no causa errores; MySQL simplemente lo ignora si ya existe uno
-- equivalente. Los mantenemos documentados por claridad.

-- mdc_ventas: estos índices aceleran las consultas del dashboard
-- y el historial de ventas, que filtran por fecha, cliente y estado.
CREATE INDEX idx_ventas_fecha       ON mdc_ventas (fecha_venta);
CREATE INDEX idx_ventas_cliente     ON mdc_ventas (cliente_id);
CREATE INDEX idx_ventas_estado      ON mdc_ventas (estado);

-- mdc_detalle_ventas: acelera los JOINs entre ventas y sus detalles,
-- y las consultas de "productos más vendidos" que agrupan por libro.
CREATE INDEX idx_detalle_venta      ON mdc_detalle_ventas (venta_id);
CREATE INDEX idx_detalle_libro      ON mdc_detalle_ventas (libro_id);

-- mdc_libros: el índice compuesto (stock_actual, stock_minimo)
-- optimiza la consulta de alertas de stock bajo que compara ambos
-- campos. El índice de título acelera las búsquedas por nombre.
CREATE INDEX idx_libros_stock       ON mdc_libros (stock_actual, stock_minimo);
CREATE INDEX idx_libros_titulo      ON mdc_libros (titulo);

-- mdc_movimientos: optimiza las consultas del Kardex que filtran
-- movimientos por libro específico, rango de fechas o proveedor.
CREATE INDEX idx_mov_libro          ON mdc_movimientos (libro_id);
CREATE INDEX idx_mov_fecha          ON mdc_movimientos (fecha_movimiento);
CREATE INDEX idx_mov_proveedor      ON mdc_movimientos (proveedor_id);

-- mdc_clientes: acelera la búsqueda de clientes por nombre
-- (barra de búsqueda en el frontend).
CREATE INDEX idx_clientes_nombre    ON mdc_clientes (nombre_completo);


-- =====================================================
-- SECCIÓN 7: DATOS SEMILLA (SEEDERS)
-- =====================================================
-- Los "seeders" o datos semilla son registros iniciales que se
-- insertan en la base de datos para que el sistema sea funcional
-- desde la primera ejecución. Sin estos datos, no habría roles
-- para asignar, ni usuarios para iniciar sesión, ni libros para
-- gestionar. En un entorno de producción real, solo los roles y
-- el usuario administrador serían datos semilla; el resto se
-- agregaría desde la interfaz del sistema.

-- 7.1 Roles del Sistema
-- Insertamos los dos roles base del sistema RBAC.
-- El id se asigna automáticamente: 1=Administrador, 2=Vendedor.
-- Estos ids se usan como referencia en el código del backend para
-- verificar permisos en los middlewares de autorización.
INSERT INTO mdc_roles (nombre) VALUES
    ('Administrador'),
    ('Vendedor');

-- 7.2 Usuarios del Sistema
-- Nunca almacenamos contraseñas en texto plano. Lo que se guarda es un
-- hash bcrypt: un algoritmo diseñado específicamente para contraseñas,
-- que es lento a propósito (para dificultar ataques de fuerza bruta) y
-- agrega un "salt" aleatorio a cada hash, de modo que dos contraseñas
-- iguales producen hashes distintos. El proceso es irreversible: al
-- iniciar sesión, el sistema no descifra el hash, sino que vuelve a
-- aplicar el algoritmo a lo ingresado y compara los resultados.
--
-- Los hashes de esta sección corresponden a las contraseñas de ejemplo
-- del proyecto y ya están listos para usar:
--   ldarlys@sena.edu.co  -> Luzd12345    (Administrador)
--   michelle@sena.edu.co -> vendedor123  (Vendedor)
--   cip@sena.edu.co      -> cip123       (Administrador)
--
-- CÓMO CAMBIAR UNA CONTRASEÑA:
--   1. Generar el hash nuevo (desde la carpeta servidor/):
--      node -e "console.log(require('bcryptjs').hashSync('MiClaveNueva', 10))"
--   2. Actualizarlo en la base de datos:
--      UPDATE mdc_usuarios SET password_hash = '<hash_generado>'
--       WHERE email = 'correo@ejemplo.com';
--   También puede cambiarse desde la propia aplicación, en el menú de
--   usuario -> "Cambiar Contraseña".
INSERT INTO mdc_usuarios (nombre_completo, email, password_hash, rol_id, estado) VALUES
    ('Luz Darlys',          'ldarlys@sena.edu.co',  '$2b$10$45fO1kPRYAJuLJxxZeHVr.r9mrKbsuSJcNEsk/dT3anbdf/KFohUm', 1, 1),
    ('Michelle Martínez',   'michelle@sena.edu.co', '$2b$10$cTW.JbPZ.0Gdu4EAaWOpfu/xh5f27m4SQTjq5wwxmoN5Rc6X/0p3u', 2, 1),
    ('Carlos Iván Perdomo', 'cip@sena.edu.co',      '$2b$10$ESgSWoorbgeIVNuhuXL0xuZsgoIJQIqVmahpu3hYQphOfVoe0XtNe', 1, 1);

-- 7.3 Categorías de Libros
-- Categorías predefinidas para clasificar el inventario.
-- Se pueden agregar más desde la interfaz del administrador.
INSERT INTO mdc_categorias (nombre) VALUES
    ('Novela Literaria'),
    ('Programación / Tecnología'),
    ('Historia'),
    ('Poesía'),
    ('Economía y Finanzas'),
    ('Cocina / Gastronomía'),
    ('Desarrollo Personal');

-- 7.4 Autores de Ejemplo
-- Autores colombianos representativos y algunos adicionales.
-- El id se asigna automáticamente y se referencia desde mdc_libros.
INSERT INTO mdc_autores (nombre) VALUES
    ('Gabriel García Márquez'),
    ('Robert C. Martin'),
    ('Álvaro Mutis'),
    ('Laura Restrepo'),
    ('William Ospina'),
    ('Manuel Echaverría'),
    ('José Eustasio Rivera'),
    ('Rafael Pombo');

-- 7.5 Libros de Ejemplo (Catálogo Inicial)
-- Insertamos un catálogo inicial de libros para demostración.
-- Los campos autor_id y categoria_id hacen referencia a los
-- registros insertados anteriormente (por su id numérico).
-- El precio está en pesos colombianos (COP).
INSERT INTO mdc_libros (isbn, titulo, descripcion, precio_venta, stock_actual, stock_minimo, autor_id, categoria_id) VALUES
    ('978-1', 'Cien Años de Soledad', 'El libro CIEN AÑOS DE SOLEDAD es la obra cumbre del realismo mágico: una saga familiar que recorre siete generaciones de los Buendía en el mítico pueblo de Macondo. Entre guerras, amores imposibles y prodigios sobrenaturales, García Márquez teje un universo donde la soledad y el destino se entrelazan con la historia de toda Latinoamérica.', 50000, 15, 5, 1, 1),
    ('978-2', 'El Amor en los Tiempos del Cólera', 'El libro EL AMOR EN LOS TIEMPOS DEL CÓLERA se impone como una lectura imprescindible dentro de la literatura colombiana: una novela que promete una experiencia sensorial y emocional, donde el tiempo y el amor se entrelazan en un paisaje caribeño que transforma lo cotidiano en mito. Una historia de pasión que sobrevive más de medio siglo de espera.', 30000, 2, 5, 1, 1),
    ('978-3', 'El Coronel No Tiene Quien Le Escriba', 'El libro EL CORONEL NO TIENE QUIEN LE ESCRIBA es una novela breve y contundente que retrata la dignidad humana frente a la adversidad. Un coronel retirado espera una pensión que nunca llega, mientras la pobreza y la esperanza se debaten en cada página. García Márquez logra con prosa austera una de las obras más emotivas de la literatura universal.', 60000, 25, 5, 1, 1),
    ('978-4', 'La Bandera de la Patria', 'El libro LA BANDERA DE LA PATRIA es una obra que explora los cimientos de la identidad colombiana a través de sus símbolos más profundos. Con una narrativa que combina historia y reflexión, invita al lector a redescubrir el sentido de pertenencia y orgullo nacional en un recorrido por las raíces culturales que nos definen como nación.', 88000, 12, 5, 5, 1),
    ('978-5', 'El Arte de Programar', 'El libro EL ARTE DE PROGRAMAR es una guía esencial para todo aquel que desee dominar el desarrollo de software. Desde los fundamentos lógicos hasta las mejores prácticas profesionales, este texto transforma conceptos complejos en conocimiento accesible, convirtiendo al lector en un programador más eficiente, creativo y preparado para los retos tecnológicos actuales.', 85000, 37, 5, 2, 2),
    ('978-6', 'El Amor Al Límite', 'El libro EL AMOR AL LÍMITE es una historia apasionante que lleva las emociones al extremo. Entre decisiones imposibles y encuentros que desafían el destino, esta novela explora hasta donde puede llegar el corazón humano cuando el amor se convierte en la fuerza más poderosa y a la vez más vulnerable de la existencia.', 30000, 47, 5, 4, 1),
    ('978-7', 'La Vorágine', 'El libro LA VORÁGINE es un clásico indiscutible de la literatura colombiana que sumerge al lector en la inmensidad de la selva amazónica. A través de la travesía de Arturo Cova, José Eustasio Rivera denuncia la explotación cauchera mientras construye una narrativa salvaje y poética donde la naturaleza devora todo a su paso.', 70000, 29, 5, 7, 1),
    ('978-8', 'La Pobre Viejecita', 'El libro LA POBRE VIEJECITA es un clásico entrañable de la literatura infantil colombiana escrito por Rafael Pombo. Con humor e ironía, narra la historia de una anciana que lo tenía todo pero vivía quejándose, enseñando a los más pequeños sobre la gratitud y el valor de lo que se tiene. Una lectura divertida y llena de sabiduría.', 45000, 29, 5, 8, 1);

-- 7.6 Clientes de Ejemplo
-- Clientes de prueba para demostración. Incluimos tanto personas
-- naturales (con cédula de ciudadanía) como personas jurídicas
-- (con NIT), ya que la librería puede vender a ambos tipos.
INSERT INTO mdc_clientes (documento, nombre_completo, telefono, email, direccion) VALUES
    ('1020304050', 'María González Pérez',    '3101234567', 'maria.gonzalez@email.com',   'Calle 10 #20-30, Bogotá'),
    ('1020304051', 'Carlos Rodríguez López',  '3109876543', 'carlos.rodriguez@email.com', 'Carrera 15 #25-40, Medellín'),
    ('1020304052', 'Ana Martínez Silva',      '3205551234', 'ana.martinez@email.com',     'Avenida 7 #12-18, Cali'),
    ('1020304053', 'Luis Hernández García',   '3156667788', 'luis.hernandez@email.com',   'Calle 45 #30-22, Barranquilla'),
    ('1020304054', 'Sofía Ramírez Torres',    '3001112233', 'sofia.ramirez@email.com',    'Carrera 8 #15-60, Cartagena'),
    ('900111222-1','Empresa ABC S.A.S.',      '6017778899', 'compras@empresaabc.com',     'Zona Industrial, Bogotá'),
    ('899999999-4','Universidad Nacional',    '6013165000', 'biblioteca@unal.edu.co',     'Ciudad Universitaria, Bogotá');

-- 7.7 Proveedores de Ejemplo
-- Distribuidoras y editoriales que suministran libros.
-- El NIT incluye el dígito de verificación (ej: 900123456-1).
INSERT INTO mdc_proveedores (nombre_empresa, nit, nombre_contacto, telefono, email, direccion) VALUES
    ('Distribuidora de Libros S.A.',  '900123456-1', 'Juan Pérez Gómez',    '6015551234', 'ventas@distlibros.com',            'Calle 50 #30-20, Bogotá'),
    ('Editorial Nacional Ltda.',      '900789012-3', 'Laura Gómez Ruiz',    '6015559876', 'contacto@editnacional.com',        'Carrera 80 #45-10, Bogotá'),
    ('Importadora Lecturas S.A.S.',   '900456789-5', 'Pedro Sánchez Díaz',  '6014443322', 'pedidos@implecturas.com',          'Avenida 68 #22-15, Bogotá'),
    ('Penguin Random House',          '800555666-7', 'Andrea López',        '6012223344', 'ventas.co@penguinrandomhouse.com', 'Calle 93 #12-45, Bogotá');


-- =====================================================
-- SECCIÓN 8: VISTAS ÚTILES
-- =====================================================
-- Una VISTA (VIEW) es una consulta SQL guardada con un nombre.
-- Funciona como una "tabla virtual": no almacena datos propios,
-- sino que ejecuta su consulta cada vez que se accede a ella.
-- Las vistas son útiles para:
-- 1. Simplificar consultas complejas (se escriben una vez y se
--    reutilizan con un simple SELECT * FROM nombre_vista).
-- 2. Encapsular lógica de negocio en la base de datos.
-- 3. Restringir el acceso a ciertas columnas o filas.

-- Vista: Libros con stock bajo
-- Muestra solo los libros cuyo stock_actual es menor o igual al
-- stock_minimo definido. Esta vista alimenta las alertas del
-- dashboard para que el administrador sepa qué libros necesitan
-- reabastecimiento.
-- LEFT JOIN: une las tablas incluso si el libro no tiene autor o
-- categoría asignada (en ese caso esos campos aparecen como NULL).
-- A diferencia de INNER JOIN que excluiría esos registros.
CREATE OR REPLACE VIEW v_libros_stock_bajo AS
SELECT
    l.id,
    l.isbn,
    l.titulo,
    a.nombre AS autor,
    c.nombre AS categoria,
    l.stock_actual,
    l.stock_minimo,
    l.precio_venta
FROM mdc_libros l
LEFT JOIN mdc_autores a ON l.autor_id = a.id
LEFT JOIN mdc_categorias c ON l.categoria_id = c.id
WHERE l.stock_actual <= l.stock_minimo
ORDER BY l.stock_actual ASC;

-- Vista: Resumen de ventas del día
-- Calcula estadísticas rápidas de las ventas de hoy: cantidad total,
-- ingresos y promedio por venta. Se usa en el dashboard principal.
-- COALESCE: función que devuelve el primer valor no NULL de sus
-- argumentos. Si no hay ventas hoy, SUM y AVG devuelven NULL, pero
-- con COALESCE mostramos 0 en su lugar. Esto evita errores en el
-- frontend al intentar mostrar un valor NULL.
-- CURDATE(): función de MySQL que retorna la fecha actual (sin hora).
-- DATE(): extrae solo la parte de fecha de un TIMESTAMP.
CREATE OR REPLACE VIEW v_ventas_hoy AS
SELECT
    COUNT(*) AS total_ventas,
    COALESCE(SUM(total_venta), 0) AS ingresos_totales,
    COALESCE(AVG(total_venta), 0) AS promedio_venta
FROM mdc_ventas
WHERE DATE(fecha_venta) = CURDATE()
    AND estado = 'Completada';

-- Vista: Catálogo completo de libros con estado de stock
-- Muestra todos los libros con su información completa y un campo
-- calculado 'estado_stock' que clasifica visualmente cada libro.
-- CASE WHEN: es la estructura condicional de SQL, equivalente a
-- un if-else en programación. Evaluamos las condiciones en orden:
-- primero si el stock es 0 (Agotado), luego si está por debajo
-- del mínimo (Stock Bajo), y si ninguna se cumple (ELSE), el
-- libro está Disponible.
CREATE OR REPLACE VIEW v_catalogo_libros AS
SELECT
    l.id,
    l.isbn,
    l.titulo,
    l.descripcion,
    a.nombre AS autor,
    c.nombre AS categoria,
    l.precio_venta,
    l.stock_actual,
    l.stock_minimo,
    CASE
        WHEN l.stock_actual = 0 THEN 'Agotado'
        WHEN l.stock_actual <= l.stock_minimo THEN 'Stock Bajo'
        ELSE 'Disponible'
    END AS estado_stock
FROM mdc_libros l
LEFT JOIN mdc_autores a ON l.autor_id = a.id
LEFT JOIN mdc_categorias c ON l.categoria_id = c.id
ORDER BY l.titulo;


-- =====================================================
-- SECCIÓN 9: VERIFICACIÓN DE INSTALACIÓN
-- =====================================================
-- Estas consultas se ejecutan al final del script para confirmar
-- que todo se creó correctamente. Muestran un resumen de las
-- tablas creadas, sus registros y las vistas disponibles.
-- information_schema es una base de datos especial de MySQL que
-- contiene metadatos (información sobre la estructura) de todas
-- las bases de datos del servidor.

SELECT '=============================================' AS '';
SELECT '  BASE DE DATOS CREADA EXITOSAMENTE'         AS 'ESTADO';
SELECT '=============================================' AS '';

-- Consultamos information_schema.TABLES para obtener información
-- sobre cada tabla: nombre, cantidad aproximada de registros y
-- tamaño en KB. TABLE_ROWS es una estimación de InnoDB, no un
-- conteo exacto, pero es suficiente para verificar la instalación.
SELECT
    TABLE_NAME  AS 'Tabla',
    TABLE_ROWS  AS 'Registros (aprox)',
    ROUND(DATA_LENGTH / 1024, 2) AS 'Tamaño (KB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'inventario_libreria'
ORDER BY TABLE_NAME;

-- Verificamos que las vistas se crearon correctamente consultando
-- information_schema.VIEWS.
SELECT
    TABLE_NAME AS 'Vista'
FROM information_schema.VIEWS
WHERE TABLE_SCHEMA = 'inventario_libreria';


-- =====================================================
-- PASOS SIGUIENTES (después de ejecutar este script)
-- =====================================================
--
-- La base de datos ya quedó lista y con datos de ejemplo. Para poner
-- el sistema en marcha (el detalle completo está en el Manual de
-- Instalación y en el README del proyecto):
--
-- 1. Configurar el backend:
--      cd servidor
--      copy .env.example .env    (completar con los datos de MySQL)
--      npm install
--      npm start                 -> http://localhost:3000
--
-- 2. Configurar el frontend, en otra terminal:
--      cd cliente
--      copy .env.example .env    (VITE_API_URL=http://localhost:3000/api)
--      npm install
--      npm run dev               -> http://localhost:5173
--
-- 3. Iniciar sesión en http://localhost:5173 con cualquiera de los
--    usuarios de ejemplo (sus contraseñas ya están cifradas en la
--    SECCIÓN 7.2 de este script):
--      ldarlys@sena.edu.co  / Luzd12345    (Administrador)
--      michelle@sena.edu.co / vendedor123  (Vendedor)
--      cip@sena.edu.co      / cip123       (Administrador)
--
-- NOTA: el stock de los libros inicia en el valor sembrado y a partir
-- de ahí solo cambia por movimientos de inventario, ventas y
-- anulaciones, para conservar la trazabilidad del Kardex.
--
-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
