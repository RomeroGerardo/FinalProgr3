const mysql = require("mysql2")

// Pool de conexiones: no abre ninguna conexión al importarse, y se reutiliza
// una sola instancia para todos los repositorios. Se exporta el pool porque
// expone pool.query(sql, params, cb), igual que el objeto que se exportaba antes.
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "gestor_cursos",
    connectionLimit: 10,
    waitForConnections: true
})

module.exports = pool
