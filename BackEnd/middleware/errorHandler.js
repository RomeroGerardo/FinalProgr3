// Middleware centralizado de errores (S12).

// Se monta después de todas las rutas.
const notFoundHandler = (req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" })
}

// Express 5 exige los cuatro parámetros para reconocerlo como error handler.
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
    const status = err && err.status ? err.status : 500
    const mensaje = (err && err.message) || "Error interno del servidor"
    res.status(status).json({ error: mensaje })
}

module.exports = { notFoundHandler, errorHandler }
