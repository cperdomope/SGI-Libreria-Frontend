const db = require('./configuracion/db');
const bcrypt = require('bcryptjs');

async function resetearPassword() {
    try {
        const email = 'admin@sena.edu.co';
        const nuevaPassword = '123456';

        console.log(`🔄 Generando nueva encriptación para: ${nuevaPassword}...`);
        
        // 1. Encriptar la contraseña usando TU librería instalada
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(nuevaPassword, salt);

        console.log(`🔑 Hash generado: ${hash}`);

        // 2. Actualizar la base de datos
        const [resultado] = await db.query('UPDATE usuarios SET password_hash = ? WHERE email = ?', [hash, email]);

        if (resultado.affectedRows > 0) {
            console.log('✅ ¡ÉXITO! La contraseña del usuario admin@sena.edu.co ha sido actualizada.');
            console.log('👉 Ahora puedes iniciar sesión con: 123456');
        } else {
            console.log('❌ Error: No se encontró el usuario admin@sena.edu.co en la base de datos.');
            console.log('   Asegúrate de haber ejecutado el script SQL de inserción primero.');
        }

        process.exit();

    } catch (error) {
        console.error('❌ Error grave:', error);
        process.exit(1);
    }
}

resetearPassword();