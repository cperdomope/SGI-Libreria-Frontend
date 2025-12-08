-- =============================================
-- Crear Usuario Vendedor
-- Email: vendedor@sena.edu.co
-- Password: vendedor123
-- =============================================

USE inventario_libreria;

-- Verificar si el usuario ya existe
SELECT id, nombre_completo, email, rol_id 
FROM usuarios 
WHERE email = 'vendedor@sena.edu.co';

-- Si no existe, crear el usuario vendedor
INSERT INTO usuarios (nombre_completo, email, password_hash, rol_id, estado)
SELECT 
  'Juan Vendedor',
  'vendedor@sena.edu.co',
  '$2b$10$Z.7d66Qu5tV58jX3ZXJzJOHKMRa3bje7jH7Mmx4mVZUzkU6pO7NAS',
  2,  -- rol_id = 2 (VENDEDOR)
  1   -- estado = 1 (ACTIVO)
WHERE NOT EXISTS (
  SELECT 1 FROM usuarios WHERE email = 'vendedor@sena.edu.co'
);

-- Verificar que se creó correctamente
SELECT 
  id,
  nombre_completo,
  email,
  rol_id,
  CASE 
    WHEN rol_id = 1 THEN 'Administrador'
    WHEN rol_id = 2 THEN 'Vendedor'
    ELSE 'Otro'
  END as nombre_rol,
  estado,
  fecha_creacion
FROM usuarios
ORDER BY id;
