-- =============================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Sistema de Gestión de Inventario - Librería
-- Proyecto SENA - Grado 11
-- =============================================

-- 1. Creación de la Base de Datos
CREATE DATABASE IF NOT EXISTS inventario_libreria;
USE inventario_libreria;

-- 2. Tabla de Roles (Seguridad y Normalización)
-- Separa los roles para no repetir texto en la tabla de usuarios
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE -- Ej: 'Administrador', 'Vendedor'
);

-- 3. Tabla de Usuarios
-- Contraseñas deben ser hash (no texto plano), por eso el largo de 255
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    estado TINYINT(1) DEFAULT 1, -- 1: Activo, 0: Inactivo (Soft Delete)
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- 4. Tablas Maestras (Autores y Categorías)
-- Cumpliendo 3NF: Separamos datos repetitivos
CREATE TABLE autores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 5. Tabla de Libros (El Inventario)
-- Stock actual se actualiza aquí, pero el historial está en 'movimientos'
CREATE TABLE libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(20) UNIQUE, -- Código único internacional del libro
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_venta DECIMAL(10, 2) NOT NULL,
    stock_actual INT DEFAULT 0, -- Se actualiza automáticamente o vía backend
    stock_minimo INT DEFAULT 5, -- Para alertas de reporte
    autor_id INT,
    categoria_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES autores(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- 6. Tabla de Movimientos (Kardex / Auditoría)
-- ¡LA MÁS IMPORTANTE! Aquí registras entradas (compras) y salidas (ventas)
CREATE TABLE movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libro_id INT NOT NULL,
    usuario_id INT NOT NULL, -- Quién hizo el movimiento
    tipo_movimiento ENUM('ENTRADA', 'SALIDA') NOT NULL,
    cantidad INT NOT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT, -- Ej: "Factura compra #123" o "Venta mostrador"
    FOREIGN KEY (libro_id) REFERENCES libros(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 7. Tabla de Clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    documento VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabla de Proveedores
CREATE TABLE proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabla de Ventas (Cabecera de Factura)
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 10. Tabla de Detalles de Ventas (Items de la factura)
CREATE TABLE detalle_ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    libro_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (libro_id) REFERENCES libros(id)
);

-- =============================================
-- DATOS SEMILLA (SEEDERS) PARA PRUEBAS INICIALES
-- =============================================

-- Insertar Roles
INSERT INTO roles (nombre) VALUES ('Administrador'), ('Vendedor');

-- Insertar un Usuario Admin (Password temporal: '123456')
-- NOTA: En producción, este hash debe generarse con bcrypt en el backend.
INSERT INTO usuarios (nombre_completo, email, password_hash, rol_id)
VALUES ('Super Admin', 'admin@libreria.com', '$2b$10$X7...', 1);

-- Insertar Categorías y Autores de ejemplo
INSERT INTO categorias (nombre) VALUES ('Tecnología'), ('Ficción'), ('Historia'), ('Ciencia'), ('Negocios');
INSERT INTO autores (nombre) VALUES
    ('Gabriel García Márquez'),
    ('Robert C. Martin'),
    ('Isabel Allende'),
    ('Mario Vargas Llosa');

-- Insertar Libros de ejemplo
INSERT INTO libros (isbn, titulo, descripcion, precio_venta, stock_actual, stock_minimo, autor_id, categoria_id) VALUES
    ('978-0307474728', 'Cien Años de Soledad', 'Obra maestra del realismo mágico', 45000, 15, 5, 1, 2),
    ('978-0132350884', 'Clean Code', 'Guía para escribir código limpio', 85000, 10, 3, 2, 1),
    ('978-0062466532', 'La Casa de los Espíritus', 'Saga familiar chilena', 38000, 12, 5, 3, 2);

-- Insertar Clientes de ejemplo
INSERT INTO clientes (nombre_completo, documento, email, telefono, direccion) VALUES
    ('María González', '1020304050', 'maria.gonzalez@email.com', '3101234567', 'Calle 10 #20-30'),
    ('Carlos Rodríguez', '1020304051', 'carlos.rodriguez@email.com', '3109876543', 'Carrera 15 #25-40'),
    ('Ana Martínez', '1020304052', 'ana.martinez@email.com', '3205551234', 'Avenida 7 #12-18');

-- Insertar Proveedores de ejemplo
INSERT INTO proveedores (nombre_empresa, contacto, email, telefono, direccion) VALUES
    ('Distribuidora Libros S.A.', 'Juan Pérez', 'ventas@distlibros.com', '6015551234', 'Calle 50 #30-20'),
    ('Editorial Nacional', 'Laura Gómez', 'contacto@editnacional.com', '6015559876', 'Carrera 80 #45-10');
