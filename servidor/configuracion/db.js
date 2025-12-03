const mysql = require('mysql2');
require('dotenv').config();

// Creamos un "Pool" de conexiones (es más eficiente que una sola conexión)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probamos la conexión al iniciar
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a la Base de Datos:', err.code);
    } else {
        console.log('✅ Conectado exitosamente a la Base de Datos MySQL');
        connection.release();
    }
});

// Exportamos usando 'promise' para poder usar async/await en el futuro
module.exports = pool.promise();