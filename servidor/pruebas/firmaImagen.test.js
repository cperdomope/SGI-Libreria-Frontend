// =====================================================
// PRUEBAS DE VALIDACIÓN DE FIRMA DE ARCHIVO
// =====================================================
// Verifican la defensa contra subida de archivos maliciosos.
//
// El problema que resuelve:
//   La validación por extensión (.jpg) y por MIME type (image/jpeg) es
//   insuficiente, porque AMBAS las controla quien envía la petición:
//     - la extensión es parte del nombre del archivo
//     - el MIME type es una cabecera que declara el cliente
//   Con curl o Postman, un atacante puede subir un ejecutable llamado
//   "portada.jpg" declarando "Content-Type: image/jpeg" y pasar las dos.
//
//   Lo único que el atacante NO puede falsificar es el contenido real:
//   si el archivo ha de funcionar como ejecutable, sus primeros bytes
//   tienen que ser los de un ejecutable, no los de un JPEG.
//
// Por eso comprobamos el "número mágico": la secuencia fija de bytes con
// la que empieza cada formato de imagen.
//
// Estas pruebas son UNITARIAS: trabajan sobre buffers construidos a mano,
// así que verifican la lógica de seguridad tanto si el servidor guarda
// las portadas en disco local como si las sube a Cloudinary.
//
// "Validamos la firma binaria del archivo y no solo su extensión y su
//  MIME type, porque esos dos los declara el cliente y se pueden
//  falsificar. Los primeros bytes del contenido, no."
// =====================================================

const { esFirmaDeImagen } = require('../middlewares/uploadImagen');

// ─────────────────────────────────────────────────────
// CONSTRUCTORES DE BUFFERS DE PRUEBA
// ─────────────────────────────────────────────────────
// Creamos cabeceras reales de cada formato. No necesitamos imágenes
// completas: la validación solo mira los primeros 12 bytes.

/** Cabecera JPEG: FF D8 FF, seguida de relleno hasta 12 bytes. */
const cabeceraJPEG = () => Buffer.concat([
  Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]),
  Buffer.alloc(8)
]);

/** Cabecera PNG: 89 50 4E 47 0D 0A 1A 0A ("\x89PNG\r\n\x1a\n"). */
const cabeceraPNG = () => Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  Buffer.alloc(4)
]);

/** Cabecera WEBP: "RIFF" + 4 bytes de tamaño + "WEBP". */
const cabeceraWEBP = () => Buffer.concat([
  Buffer.from('RIFF', 'ascii'),
  Buffer.from([0x00, 0x00, 0x00, 0x00]),
  Buffer.from('WEBP', 'ascii')
]);

describe('Validación de firma binaria de imágenes', () => {

  // ── Formatos que SI aceptamos ──────────────────────

  test('Acepta una cabecera JPEG real', () => {
    expect(esFirmaDeImagen(cabeceraJPEG())).toBe(true);
  });

  test('Acepta una cabecera PNG real', () => {
    expect(esFirmaDeImagen(cabeceraPNG())).toBe(true);
  });

  test('Acepta una cabecera WEBP real', () => {
    expect(esFirmaDeImagen(cabeceraWEBP())).toBe(true);
  });

  // ── El ataque que esto previene ────────────────────

  // Un ejecutable de Windows empieza con "MZ" (0x4D 0x5A).
  // Aunque llegue llamándose "portada.jpg" y declarando image/jpeg,
  // su contenido lo delata.
  test('Rechaza un ejecutable de Windows renombrado como .jpg', () => {
    const exe = Buffer.concat([
      Buffer.from([0x4D, 0x5A, 0x90, 0x00]),  // MZ + cabecera DOS
      Buffer.alloc(8)
    ]);

    expect(esFirmaDeImagen(exe)).toBe(false);
  });

  // Un script PHP subido a una carpeta que se sirve públicamente es
  // el vector clásico de ejecución remota de codigo.
  test('Rechaza un script PHP renombrado como imagen', () => {
    const php = Buffer.from('<?php system($_GET["c"]); ?>', 'ascii');
    expect(esFirmaDeImagen(php)).toBe(false);
  });

  test('Rechaza un PDF (formato válido, pero no permitido aquí)', () => {
    const pdf = Buffer.concat([
      Buffer.from('%PDF-1.7', 'ascii'),
      Buffer.alloc(4)
    ]);

    expect(esFirmaDeImagen(pdf)).toBe(false);
  });

  // Un RIFF puede ser WAV o AVI, no solo WEBP. Comprobar únicamente
  // los primeros 4 bytes dejaría pasar audio y video: por eso la
  // validación exige también "WEBP" en los bytes 8 a 11.
  test('Rechaza un RIFF que no es WEBP (por ejemplo, un WAV)', () => {
    const wav = Buffer.concat([
      Buffer.from('RIFF', 'ascii'),
      Buffer.from([0x00, 0x00, 0x00, 0x00]),
      Buffer.from('WAVE', 'ascii')
    ]);

    expect(esFirmaDeImagen(wav)).toBe(false);
  });

  // ── Entradas degeneradas ───────────────────────────
  // La validación no debe romperse ante entradas inesperadas:
  // una excepción aquí tumbaría la petición con un error 500 en vez
  // de un 400 controlado.

  test('Rechaza un archivo vacío sin lanzar excepción', () => {
    expect(esFirmaDeImagen(Buffer.alloc(0))).toBe(false);
  });

  test('Rechaza un archivo más corto que la firma', () => {
    expect(esFirmaDeImagen(Buffer.from([0xFF, 0xD8]))).toBe(false);
  });

  test('Rechaza valores que no son un Buffer', () => {
    expect(esFirmaDeImagen(null)).toBe(false);
    expect(esFirmaDeImagen(undefined)).toBe(false);
    expect(esFirmaDeImagen('portada.jpg')).toBe(false);
  });
});
