// =====================================================
// CONTROLADOR DE MOVIMIENTOS (KARDEX)
// =====================================================
// Este archivo gestiona las entradas y salidas de inventario.
// En contabilidad y logística, esto se llama "Kardex":
// un registro histórico de todos los movimientos de mercancía.
//
// ¿Para qué sirve el Kardex?
// Para saber EXACTAMENTE qué pasó con cada libro:
//   - ¿Cuándo llegó mercancía? ¿De qué proveedor? ¿A qué costo?
//   - ¿Cuándo se hizo un ajuste? ¿Quién lo autorizó?
//   - ¿Por qué el stock cambió si no fue por una venta?
//
// Tipos de movimiento que este módulo permite registrar:
//
//   - ENTRADA: llega mercancía comprada a un proveedor.
//     El proveedor y el costo de compra son obligatorios, porque una
//     entrada sin esos datos no se podría auditar después: nadie sabría
//     a quién se le compró el libro ni a qué precio.
//
//   - SALIDA: sale mercancía por un motivo que NO es una venta.
//     Por ejemplo: un ejemplar dañado en bodega, una pérdida, o un
//     ajuste negativo después de un conteo físico.
//
// ¿Y las devoluciones de cliente o los ajustes positivos?
// Por ahora no se pueden registrar aquí, precisamente porque toda
// ENTRADA exige proveedor y costo. Es una limitación conocida del
// alcance actual: la alternativa sería permitir entradas sin origen,
// y eso abriría un hueco en la trazabilidad, que es justo lo que el
// kardex existe para evitar.
//
// NOTA: Las salidas por VENTAS las registra automáticamente
// el ventaControlador.js. Este módulo es para movimientos manuales.

// "El módulo de movimientos implementa el Kardex del sistema.
//  Cada entrada o salida se registra con: quién la hizo, cuándo,
//  el stock anterior y el nuevo, y en el caso de entradas,
//  el proveedor y el costo de compra. Todo esto dentro de una
//  transacción para garantizar que el historial y el stock
//  siempre estén sincronizados."
// =====================================================

// Conexión al pool de base de datos MySQL
const db = require('../config/db');

// Helper de paginación reutilizable (utils/paginacion.js).
// Lo usamos en obtenerMovimientos para no repetir aquí la lógica de
// validar ?pagina y ?limite, calcular el OFFSET y armar la metadata.
const { aplicarPaginacion } = require('../utils/paginacion');

// ─────────────────────────────────────────────────────────
// TIPOS DE MOVIMIENTO VÁLIDOS
// ─────────────────────────────────────────────────────────
// Deben coincidir con el ENUM definido en la tabla mdc_movimientos.
// Al usarlos desde esta constante evitamos errores de tipeo.
const TIPOS_MOVIMIENTO = {
  ENTRADA: 'ENTRADA',
  SALIDA:  'SALIDA'
};

// =====================================================
// CONTROLADOR 1: REGISTRAR UN MOVIMIENTO DE INVENTARIO
// =====================================================
// Ruta: POST /api/movimientos
// Registra una entrada o salida manual del inventario.
// Usa transacción porque afecta dos tablas a la vez:
//   1. mdc_movimientos → historial del kardex
//   2. mdc_libros → stock_actual actualizado

// "Al registrar un movimiento, el sistema usa una transacción
//  para garantizar que si falla el UPDATE del stock,
//  también se deshace el INSERT del historial,
//  evitando tener un kardex que no coincide con el inventario real."
exports.registrarMovimiento = async (req, res, next) => {
  // Extraemos todos los campos del formulario de movimientos
  let { libro_id, tipo_movimiento, cantidad, observaciones, proveedor_id, costo_compra } = req.body;

  // ─────────────────────────────────────────────────
  // VALIDACIONES INICIALES
  // Rechazamos datos inválidos antes de abrir la transacción
  // ─────────────────────────────────────────────────

  // Los tres campos básicos son siempre obligatorios
  if (!libro_id || !tipo_movimiento || !cantidad) {
    return res.status(400).json({
      exito:   false,
      mensaje: 'Datos incompletos: se requiere libro_id, tipo_movimiento y cantidad'
    });
  }

  // Convertimos el ID del libro a número entero y verificamos que sea válido
  libro_id = parseInt(libro_id, 10);
  if (isNaN(libro_id) || libro_id <= 0) {
    return res.status(400).json({
      exito:   false,
      mensaje: 'El libro_id debe ser un número válido mayor a cero'
    });
  }

  // La cantidad debe ser un número entero positivo (no 0, no negativo, no decimal)
  cantidad = parseInt(cantidad, 10);
  if (isNaN(cantidad) || cantidad <= 0) {
    return res.status(400).json({
      exito:   false,
      mensaje: 'La cantidad debe ser un número entero mayor a cero'
    });
  }

  // Verificamos que el tipo de movimiento sea uno de los válidos
  // Object.values(TIPOS_MOVIMIENTO) = ['ENTRADA', 'SALIDA']
  if (!Object.values(TIPOS_MOVIMIENTO).includes(tipo_movimiento)) {
    return res.status(400).json({
      exito:   false,
      mensaje: `Tipo de movimiento inválido. Use: ${Object.values(TIPOS_MOVIMIENTO).join(' o ')}`
    });
  }

  // ─────────────────────────────────────────────────
  // VALIDACIONES ESPECÍFICAS PARA ENTRADAS
  // ─────────────────────────────────────────────────
  // Una ENTRADA es una compra a proveedor, así que requerimos:
  //   - proveedor_id: de quién compramos
  //   - costo_compra: cuánto costó (puede ser 0 si fue donación)
  //
  // NOTA TÉCNICA: usamos verificación explícita de null/undefined/'',
  // porque costo_compra = 0 es un valor válido (libros donados)
  // y !0 daría true, rechazando erróneamente las donaciones.
  let proveedorIdFinal = null;
  let costoCompraFinal = null;

  if (tipo_movimiento === TIPOS_MOVIMIENTO.ENTRADA) {
    // Con !proveedor_id basta: cubre undefined, null y la cadena vacía
    // que envía un <select> cuando no se ha elegido nada.
    // Aquí sí podemos usar el valor "falsy" como criterio porque no
    // existe un proveedor con id 0. Con costo_compra, en cambio, el 0
    // sí es un valor legítimo — por eso justo abajo se valida distinto.
    if (!proveedor_id) {
      return res.status(400).json({
        exito:   false,
        mensaje: 'El proveedor es obligatorio para registrar una entrada de inventario'
      });
    }

    // Verificamos explícitamente ausencia del costo (0 es válido)
    if (costo_compra === undefined || costo_compra === null || costo_compra === '') {
      return res.status(400).json({
        exito:   false,
        mensaje: 'El costo de compra es obligatorio para registrar una entrada de inventario'
      });
    }

    // Convertimos a número entero
    proveedorIdFinal = parseInt(proveedor_id, 10);
    if (isNaN(proveedorIdFinal) || proveedorIdFinal <= 0) {
      return res.status(400).json({
        exito:   false,
        mensaje: 'El proveedor_id debe ser un número entero positivo'
      });
    }

    // Convertimos el costo a número decimal
    costoCompraFinal = parseFloat(costo_compra);
    if (isNaN(costoCompraFinal)) {
      return res.status(400).json({
        exito:   false,
        mensaje: 'El costo de compra debe ser un número válido'
      });
    }
    if (costoCompraFinal < 0) {
      return res.status(400).json({
        exito:   false,
        mensaje: 'El costo de compra no puede ser negativo',
        codigo:  'COSTO_NEGATIVO'
      });
    }
  }

  // Verificamos que hay un usuario autenticado registrando el movimiento.
  // req.usuario viene del middleware verificarToken que decodifica el JWT.
  if (!req.usuario?.id) {
    return res.status(401).json({
      exito:   false,
      mensaje: 'Se requiere autenticación para registrar movimientos'
    });
  }

  // ─────────────────────────────────────────────────
  // INICIO DE LA TRANSACCIÓN
  // ─────────────────────────────────────────────────
  let connection;

  try {
    // Obtenemos una conexión exclusiva para manejar la transacción
    connection = await db.getConnection();
    await connection.beginTransaction();

    // ─────────────────────────────────────────────────
    // VERIFICAR QUE EL LIBRO EXISTE
    // ─────────────────────────────────────────────────
    // Obtenemos también el stock actual para calcular el nuevo stock
    // y para validar que no quede negativo en una SALIDA.
    //
    // FOR UPDATE bloquea la fila del libro hasta que la transacción termine.
    // Es imprescindible aquí: entre esta lectura y el UPDATE del stock puede
    // ocurrir una venta del mismo libro. Sin el bloqueo, ambas operaciones
    // leerían el mismo stock_anterior y el kardex registraría un valor que
    // ya no corresponde al inventario real.
    const [libroRows] = await connection.query(
      'SELECT id, stock_actual, titulo FROM mdc_libros WHERE id = ? FOR UPDATE',
      [libro_id]
    );

    if (libroRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        exito:   false,
        mensaje: 'El libro especificado no existe',
        codigo:  'LIBRO_NOT_FOUND'
      });
    }

    const libro = libroRows[0];

    // ─────────────────────────────────────────────────
    // VERIFICAR QUE EL PROVEEDOR EXISTE (solo para ENTRADA)
    // ─────────────────────────────────────────────────
    // Lo hacemos dentro de la transacción para máxima consistencia.
    // Si el proveedor no existe, cancelamos todo.
    if (tipo_movimiento === TIPOS_MOVIMIENTO.ENTRADA) {
      const [proveedorRows] = await connection.query(
        'SELECT id FROM mdc_proveedores WHERE id = ?',
        [proveedorIdFinal]
      );

      if (proveedorRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          exito:   false,
          mensaje: 'El proveedor especificado no existe en el sistema',
          codigo:  'PROVEEDOR_NOT_FOUND'
        });
      }
    }

    // ─────────────────────────────────────────────────
    // VERIFICAR STOCK SUFICIENTE PARA SALIDAS
    // ─────────────────────────────────────────────────
    // No permitimos que el stock quede negativo.
    // Si se intenta sacar más de lo que hay, cancelamos.
    if (tipo_movimiento === TIPOS_MOVIMIENTO.SALIDA) {
      if (libro.stock_actual < cantidad) {
        await connection.rollback();
        return res.status(400).json({
          exito:   false,
          mensaje: `Stock insuficiente para "${libro.titulo}". Disponible: ${libro.stock_actual}, Solicitado: ${cantidad}`,
          codigo:  'STOCK_INSUFICIENTE'
        });
      }
    }

    // ─────────────────────────────────────────────────
    // PASO 1: CALCULAR EL NUEVO STOCK
    // ─────────────────────────────────────────────────
    const stockAnterior = libro.stock_actual;

    // ENTRADA suma unidades, SALIDA las resta
    const stockNuevo = tipo_movimiento === TIPOS_MOVIMIENTO.ENTRADA
      ? stockAnterior + cantidad
      : stockAnterior - cantidad;

    // ─────────────────────────────────────────────────
    // PASO 2: INSERTAR EL MOVIMIENTO EN EL HISTORIAL (KARDEX)
    // ─────────────────────────────────────────────────
    // Guardamos: qué libro, qué tipo, cuánto, quién lo hizo,
    // stock antes y después, observaciones, proveedor y costo (si aplica).
    await connection.query(
      `INSERT INTO mdc_movimientos
       (libro_id, tipo_movimiento, cantidad, usuario_id, stock_anterior, stock_nuevo,
        observaciones, proveedor_id, costo_compra)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        libro_id,
        tipo_movimiento,
        cantidad,
        req.usuario.id,       // Quién registró el movimiento (trazabilidad)
        stockAnterior,
        stockNuevo,
        observaciones  || null,
        proveedorIdFinal,     // null para SALIDAs
        costoCompraFinal      // null para SALIDAs
      ]
    );

    // ─────────────────────────────────────────────────
    // PASO 3: ACTUALIZAR EL STOCK DEL LIBRO
    // ─────────────────────────────────────────────────
    // Usamos el operador dinámico (+/-) para sumar o restar.
    // La operación aritmética se hace en MySQL y no en JavaScript: así es
    // el motor quien la resuelve sobre el valor real de la fila bloqueada.
    const operador = tipo_movimiento === TIPOS_MOVIMIENTO.ENTRADA ? '+' : '-';

    // ¿Y esa variable metida dentro del texto del SQL no es inyección?
    // No, y vale la pena entender por qué, porque en el resto del archivo
    // insistimos en lo contrario. La regla real no es "nunca interpolar",
    // es "nunca interpolar algo que venga del usuario".
    //
    // Aquí `operador` no viene de la petición: lo produce el ternario de
    // la línea de arriba, que solo puede devolver '+' o '-'. El usuario
    // no puede influir en su contenido, únicamente en cuál de los dos
    // valores se elige, y ambos son seguros.
    //
    // La cantidad y el id, que sí llegan del cliente, viajan como
    // marcadores ? — que es donde de verdad importa.
    await connection.query(
      `UPDATE mdc_libros SET stock_actual = stock_actual ${operador} ? WHERE id = ?`,
      [cantidad, libro_id]
    );

    // Confirmamos la transacción: ambas operaciones se guardan permanentemente
    await connection.commit();

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Movimiento] ${tipo_movimiento} de ${cantidad} unidades para libro #${libro_id}`);
    }

    // Respondemos con un resumen del movimiento realizado.
    //
    // Reutilizamos stockAnterior y stockNuevo, que ya calculamos en el
    // PASO 1 y que son exactamente los valores que acabamos de guardar
    // en el kardex. Volver a calcularlos aquí sería repetir la misma
    // operación y arriesgarse a que un día las dos versiones se separen.
    res.status(201).json({
      exito:   true,
      mensaje: 'Movimiento registrado exitosamente',
      datos: {
        tipo:            tipo_movimiento,
        cantidad:        cantidad,
        libro:           libro.titulo,
        stock_anterior:  stockAnterior,
        stock_actual:    stockNuevo,
        // Informamos quién ejecutó el movimiento (auditoría).
        // El nombre sale del token JWT, donde se guarda bajo la clave
        // "nombre" (ver authControlador.js, donde se firma el token).
        // Si por lo que sea no viniera, mostramos el id para que la
        // respuesta nunca quede sin identificar al responsable.
        auditado_por:    req.usuario.nombre || `Usuario #${req.usuario.id}`
      }
    });

  } catch (error) {
    // Si algo falló, deshacemos todo para mantener la consistencia
    if (connection) await connection.rollback();

    if (process.env.NODE_ENV === 'development') {
      console.error('[Movimiento] Error:', error);
    }

    // Delegamos al errorHandler global en lugar de responder aquí.
    // Ese middleware ya sabe traducir los códigos de MySQL a mensajes
    // claros (duplicados, claves foráneas, conexión perdida) y oculta
    // los detalles internos en producción. Responder un 500 genérico
    // desde aquí desperdiciaría todo ese trabajo.
    next(error);

  } finally {
    // Liberamos la conexión pase lo que pase (éxito o error)
    if (connection) connection.release();
  }
};

// =====================================================
// CONTROLADOR 2: OBTENER HISTORIAL DE MOVIMIENTOS
// =====================================================
// Ruta: GET /api/movimientos
// Devuelve todos los movimientos del Kardex.
// Opcionalmente filtra por libro si se envía libro_id en la URL.
//
// Ejemplo sin filtro:   GET /api/movimientos
// Ejemplo con filtro:   GET /api/movimientos?libro_id=5

// "El historial de movimientos muestra el Kardex completo:
//  quién hizo cada movimiento, cuándo, el stock antes y después,
//  y el proveedor en el caso de entradas. Se puede filtrar
//  por libro para ver el historial de un título específico."
exports.obtenerMovimientos = async (req, res, next) => {
  // Tomamos el filtro opcional de la URL (query string)
  const { libro_id } = req.query;

  try {
    // Consulta base que une movimientos con libros, usuarios y proveedores
    // Usamos LEFT JOIN con proveedores porque las SALIDAs no tienen proveedor
    let sql = `
      SELECT
        m.id,
        m.tipo_movimiento,
        m.cantidad,
        m.stock_anterior,
        m.stock_nuevo,
        m.fecha_movimiento,
        m.observaciones,
        m.costo_compra,
        l.titulo      AS libro,
        l.isbn,
        u.nombre_completo AS usuario,
        p.nombre_empresa  AS proveedor,
        p.id              AS proveedor_id
      FROM mdc_movimientos m
      JOIN  mdc_libros      l ON m.libro_id    = l.id
      JOIN  mdc_usuarios    u ON m.usuario_id  = u.id
      LEFT JOIN mdc_proveedores p ON m.proveedor_id = p.id
    `;

    // ─────────────────────────────────────────────────
    // FILTRO OPCIONAL POR LIBRO
    // ─────────────────────────────────────────────────
    // El WHERE se construye con un marcador ? y el valor viaja aparte
    // en el arreglo de parámetros: nunca concatenamos entrada del usuario
    // dentro del SQL, que es lo que abriría la puerta a inyección.
    //
    // (En registrarMovimiento sí se interpola una variable en el UPDATE,
    //  pero es el operador '+' o '-' que decide el propio servidor, no un
    //  dato del cliente. Allá está explicado en detalle.)
    const params     = [];
    let whereClause  = '';

    if (libro_id) {
      whereClause = ' WHERE m.libro_id = ?';
      params.push(libro_id);
    }

    // Ordenamos del más reciente al más antiguo
    sql += whereClause + ' ORDER BY m.fecha_movimiento DESC';

    // ─────────────────────────────────────────────────
    // PAGINACIÓN EN SERVIDOR
    // ─────────────────────────────────────────────────
    // El kardex crece indefinidamente: cada venta, cada entrada y cada
    // ajuste añaden una fila y nunca se borra nada (esa es justamente su
    // razón de ser). Sin paginación, con el tiempo esta ruta devolvería
    // miles de registros en una sola respuesta.
    //
    // aplicarPaginacion (utils/paginacion.js) recibe dos funciones:
    //   - la primera ejecuta la consulta de datos
    //   - la segunda cuenta el total, para calcular cuántas páginas hay
    // Si la petición no trae ?pagina ni ?limite, devuelve todo como antes,
    // así que el frontend actual sigue funcionando sin cambios.
    const respuesta = await aplicarPaginacion(
      req,
      (limite, offset) => (
        limite !== undefined
          ? db.query(sql + ' LIMIT ? OFFSET ?', [...params, limite, offset])
          : db.query(sql, params)
      ),
      () => db.query(
        `SELECT COUNT(*) AS total
         FROM mdc_movimientos m
         JOIN mdc_libros   l ON m.libro_id   = l.id
         JOIN mdc_usuarios u ON m.usuario_id = u.id
         ${whereClause}`,
        params
      )
    );

    res.json(respuesta);

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Movimiento] Error al listar:', error);
    }
    // Igual que en registrarMovimiento: delegamos al errorHandler global
    next(error);
  }
};