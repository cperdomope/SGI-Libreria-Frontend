# 🔧 INSTRUCCIONES PARA CORREGIR EL ERROR DE MIGRACIÓN

## ❌ Error Encontrado
```
Error Code: 1054. Unknown column 'total' in 'ventas'
```

## 📋 Causa del Problema
Tu base de datos tiene la columna como `total_venta` en lugar de `total`, pero la migración intentaba usar `total`.

---

## ✅ SOLUCIÓN - Sigue estos pasos:

### PASO 1: Verificar la estructura actual (OPCIONAL)

Ejecuta este script para ver cómo está tu tabla:
```sql
-- Archivo: base_datos/verificar_estructura_ventas.sql
```

En MySQL Workbench:
1. Abrir el archivo `base_datos/verificar_estructura_ventas.sql`
2. Ejecutar el script completo
3. Ver la estructura actual de la tabla

---

### PASO 2: Ejecutar la migración CORREGIDA

El archivo `base_datos/migracion_metodo_pago.sql` ha sido **ACTUALIZADO** con una versión inteligente que:
- ✅ Detecta automáticamente si tu columna es `total` o `total_venta`
- ✅ Ejecuta el ALTER TABLE correcto para tu caso
- ✅ Muestra la estructura ANTES y DESPUÉS

**Ejecutar ahora:**

```bash
# En MySQL Workbench:
# 1. Abrir: base_datos/migracion_metodo_pago.sql
# 2. Ejecutar todo el script (Ctrl+Shift+Enter)

# O desde línea de comandos:
mysql -u root -p inventario_libreria < "base_datos/migracion_metodo_pago.sql"
```

---

### PASO 3: Verificar que funcionó

Deberías ver al final del script:
```
✅ Migración completada: Campo metodo_pago agregado exitosamente
```

Y en la estructura DESPUÉS debe aparecer:
```
metodo_pago | enum('Efectivo','Tarjeta','Transferencia') | NO | | Efectivo
```

---

## 🔍 VERIFICACIÓN ADICIONAL

Ejecuta este comando SQL para confirmar:

```sql
USE inventario_libreria;
DESCRIBE ventas;
```

Debes ver una columna llamada `metodo_pago` con tipo ENUM.

---

## ⚠️ SI AÚN DA ERROR

Si el error persiste, ejecuta manualmente este comando (según tu estructura):

**Si tu tabla tiene `total_venta`:**
```sql
USE inventario_libreria;

ALTER TABLE ventas
ADD COLUMN metodo_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia')
DEFAULT 'Efectivo'
AFTER total_venta;
```

**Si tu tabla tiene `total`:**
```sql
USE inventario_libreria;

ALTER TABLE ventas
ADD COLUMN metodo_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia')
DEFAULT 'Efectivo'
AFTER total;
```

---

## 📝 Nota sobre la Inconsistencia

Tu base de datos tiene una inconsistencia entre:
- **Script SQL inicial:** Usa `total` (línea 100 de script_inicial.sql)
- **Controlador de ventas:** Usa `total_venta` en el código

La migración actualizada maneja ambos casos automáticamente. Si quieres más detalles, avísame y podemos estandarizar todo a un solo nombre.

---

## ✅ Una vez completada la migración:

1. Reiniciar el servidor backend:
   ```bash
   cd servidor
   node index.js
   ```

2. Probar crear una venta desde el frontend

3. Verificar en la base de datos que el campo `metodo_pago` se guardó correctamente

---

**¿Necesitas ayuda con algún paso específico?**
