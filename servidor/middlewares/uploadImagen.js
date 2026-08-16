// =====================================================
// MIDDLEWARE: SUBIDA DE IMÁGENES CON MULTER
// =====================================================
// Multer es una librería de Node.js para manejar peticiones
// multipart/form-data, que es el formato usado cuando un
// formulario HTML envía archivos (imágenes, PDFs, etc.).
//
// ¿Por qué se necesita un middleware especial para archivos?
// Las peticiones normales envían JSON en el body.
// Cuando se adjunta un archivo, el formato cambia completamente:
// el browser divide la petición en "partes" (multipart).
// Express no puede parsear ese formato por sí solo; Multer lo hace.
//
// ¿Qué hace este middleware?
//   1. Intercepta la petición antes del controlador
//   2. Extrae la imagen del formulario
//   3. Valida tipo de archivo (extensión Y MIME type)
//   4. Si es válida, la guarda en disco con nombre único
//   5. Agrega req.file al request para que el controlador sepa
//      dónde quedó guardada la imagen
//
// SEGURIDAD — doble validación de tipo:
// Solo validar la extensión (.jpg, .png) NO es seguro porque
// cualquiera puede renombrar un archivo .exe a .jpg.
// Por eso también validamos el MIME type, que viene del contenido
// real del archivo. Un atacante tendría que falsificar AMBOS.

// "Para la subida de portadas usamos Multer con doble validación:
//  verificamos tanto la extensión del nombre del archivo como el
//  MIME type de su contenido. Esto evita que alguien suba un
//  archivo malicioso con extensión .jpg. Además limitamos el
//  tamaño a 2 MB y guardamos con nombres únicos generados con
//  timestamp + número aleatorio para evitar sobreescrituras."
// =====================================================

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ─────────────────────────────────────────────────────────
// MODO DE ALMACENAMIENTO: CLOUDINARY o DISCO LOCAL
// ─────────────────────────────────────────────────────────
// Si las tres variables de Cloudinary están en el .env,
// las imágenes se suben directo a la nube (Cloudinary).
// Si no están configuradas, se guardan en disco local
// (comportamiento original — retrocompatibilidad).
const usarCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY    &&
  process.env.CLOUDINARY_API_SECRET
);

let storage;

if (usarCloudinary) {
  // ── MODO NUBE: Cloudinary ──
  // multer-storage-cloudinary conecta Multer directamente con Cloudinary.
  // El archivo nunca toca el disco del servidor: va de la memoria RAM
  // del proceso directo a Cloudinary mediante su API.
  // req.file.path    → URL pública segura (https://res.cloudinary.com/...)
  // req.file.filename → public_id asignado por Cloudinary (para borrar después)
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder:          'sgi_portadas',   // Carpeta dentro de tu cuenta Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      // Redimensiona al subir: max 400×600 px sin distorsionar
      transformation: [{ width: 400, height: 600, crop: 'limit' }]
    }
  });

} else {
  // ── MODO LOCAL: disco del servidor (comportamiento original) ──
  const DIR_PORTADAS = path.join(__dirname, '..', 'uploads', 'portadas');
  if (!fs.existsSync(DIR_PORTADAS)) {
    fs.mkdirSync(DIR_PORTADAS, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, DIR_PORTADAS),
    filename: (req, file, cb) => {
      const ext    = path.extname(file.originalname).toLowerCase();
      const nombre = `portada-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, nombre);
    }
  });
}

// ─────────────────────────────────────────────────────────
// FILTRO DE TIPO DE ARCHIVO (aplica para ambos modos)
// ─────────────────────────────────────────────────────────
const filtroImagen = (req, file, cb) => {
  const extValida  = /\.(jpg|jpeg|png|webp)$/.test(path.extname(file.originalname).toLowerCase());
  const mimeValido = /^image\/(jpeg|png|webp)$/.test(file.mimetype);
  if (extValida && mimeValido) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'), false);
  }
};

// ─────────────────────────────────────────────────────────
// INSTANCIA FINAL DE MULTER
// ─────────────────────────────────────────────────────────
const uploadPortada = multer({
  storage,
  fileFilter: filtroImagen,
  limits: { fileSize: 2 * 1024 * 1024 }  // 2 MB máximo
});

// ─────────────────────────────────────────────────────────
// VALIDACIÓN DE LA FIRMA REAL DEL ARCHIVO (NÚMEROS MÁGICOS)
// ─────────────────────────────────────────────────────────
// ¿Por qué no basta con el filtro de arriba?
// Porque file.mimetype NO se calcula leyendo el archivo: lo declara el
// navegador en la cabecera de la petición. Un atacante que use curl o
// Postman puede enviar un ejecutable diciendo "Content-Type: image/jpeg"
// y pasar tanto la validación de extensión como la de MIME.
//
// La única comprobación que el atacante NO controla es el contenido real
// del archivo. Todo formato de imagen empieza con una secuencia fija de
// bytes llamada "número mágico" o "firma":
//
//   JPEG  → FF D8 FF
//   PNG   → 89 50 4E 47 0D 0A 1A 0A
//   WebP  → "RIFF" en los bytes 0-3 y "WEBP" en los bytes 8-11
//
// Si los primeros bytes no coinciden con ninguna firma conocida, el
// archivo no es una imagen por más que se llame portada.jpg.
//
// ¿Por qué va DESPUÉS de multer y no dentro de fileFilter?
// Porque fileFilter se ejecuta cuando solo se conocen los metadatos
// (nombre y cabeceras); el contenido todavía no se ha recibido. Para
// inspeccionar bytes hay que esperar a que multer termine de escribir.
const FIRMAS_IMAGEN = {
  jpeg: (b) => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
  png:  (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47 &&
               b[4] === 0x0D && b[5] === 0x0A && b[6] === 0x1A && b[7] === 0x0A,
  webp: (b) => b.slice(0, 4).toString('ascii') === 'RIFF' &&
               b.slice(8, 12).toString('ascii') === 'WEBP'
};

/**
 * Determina si un buffer empieza con la firma de una imagen soportada.
 *
 * Se mantiene como función pura y exportada a proposito: así la lógica
 * de seguridad se puede probar con buffers construidos a mano, sin
 * depender de que el entorno use disco local o Cloudinary.
 *
 * @param   {Buffer}  buffer  Al menos los 12 primeros bytes del archivo.
 * @returns {boolean}         true si corresponde a JPEG, PNG o WEBP.
 */
const esFirmaDeImagen = (buffer) => {
  // Un buffer más corto que la firma más larga no puede validarse:
  // lo damos por inválido en lugar de leer posiciones inexistentes.
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return false;

  return Object.values(FIRMAS_IMAGEN).some((coincide) => coincide(buffer));
};

/**
 * Middleware que descarta archivos cuyo contenido no es una imagen.
 *
 * Se registra DESPUÉS de uploadPortada.single(), porque hasta que Multer
 * no termina de escribir no hay bytes que inspeccionar. Si el archivo no
 * supera la comprobación, se borra del disco y la petición termina en 400.
 *
 * @async
 * @param   {import('express').Request}  req   Debe traer req.file si hubo carga.
 * @param   {import('express').Response} res   Respuesta de Express.
 * @param   {Function} next                    Continúa la cadena de middlewares.
 * @returns {Promise<void>} 400 con INVALID_FILE_SIGNATURE si el archivo no es
 *                          una imagen; si no, cede el paso al controlador.
 */
const validarFirmaImagen = async (req, res, next) => {
  // La portada es opcional: si no se envió archivo, no hay nada que validar.
  if (!req.file) return next();

  // En modo Cloudinary el archivo ya no está en nuestro disco: se subió
  // directo a la nube. Cloudinary decodifica la imagen del lado del
  // servidor y rechaza cualquier cosa que no sea uno de los allowed_formats
  // configurados arriba, así que la validación de contenido ya ocurrió.
  if (usarCloudinary) return next();

  try {
    // Leemos solo los primeros 12 bytes, que es cuánto necesita la firma
    // más larga (WebP). No hace falta cargar el archivo completo en memoria.
    const buffer     = Buffer.alloc(12);
    const manejador  = await fs.promises.open(req.file.path, 'r');

    try {
      await manejador.read(buffer, 0, 12, 0);
    } finally {
      // Cerramos el descriptor pase lo que pase, para no filtrarlos.
      await manejador.close();
    }

    // ¿Coincide con alguna de las tres firmas que aceptamos?
    if (!esFirmaDeImagen(buffer)) {
      // El archivo ya está escrito en disco, así que hay que borrarlo:
      // dejarlo ahí significaría almacenar contenido arbitrario subido
      // por un usuario en una carpeta que además se sirve públicamente.
      await fs.promises.unlink(req.file.path).catch(() => {});

      return res.status(400).json({
        exito:   false,
        mensaje: 'El archivo no es una imagen válida. Solo se permiten JPG, PNG o WEBP.',
        codigo:  'INVALID_FILE_SIGNATURE'
      });
    }

    next();

  } catch (error) {
    // Si no pudimos leer el archivo para verificarlo, lo tratamos como
    // sospechoso y lo eliminamos. Ante la duda, no lo guardamos.
    await fs.promises.unlink(req.file.path).catch(() => {});
    next(error);
  }
};

// usarCloudinary se exporta para que librosControlador sepa
// si guardar el filename (local) o la URL completa (Cloudinary).
module.exports = { uploadPortada, validarFirmaImagen, esFirmaDeImagen, usarCloudinary };