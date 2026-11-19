// Traduce errores de MySQL/MariaDB a errores HTTP conocidos.

const ERRORES_MYSQL = {
    1062: { status: 409, mensaje: "El registro ya existe (valor duplicado)" },
    1452: { status: 400, mensaje: "La referencia indicada no existe" }
}

const crearError = (status, mensaje) => {
    const err = new Error(mensaje)
    err.status = status
    return err
}

// Si el error viene de MySQL y es conocido, devuelve un error con status HTTP;
// si no, devuelve el error original para que el errorHandler lo trate como 500.
const mapearError = (err) => {
    const conocido = err && ERRORES_MYSQL[err.errno]
    if (!conocido) return err
    const mapeado = crearError(conocido.status, conocido.mensaje)
    mapeado.cause = err
    return mapeado
}

module.exports = { crearError, mapearError }
