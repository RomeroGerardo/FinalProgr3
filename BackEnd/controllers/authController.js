// Login real de alumnos y profesores contra la base de datos.
// Las cuentas demo (admin / profesor de ejemplo / alumno de ejemplo) siguen resolviéndose en el
// frontend; este endpoint cubre a los alumnos y profesores que el admin registra con contraseña.
const alumnoRepository = require("../repositories/alumnoRepository");
const profesorRepository = require("../repositories/profesorRepository");
const { esTextoValido } = require("../utils/validation");
const { verificar } = require("../utils/password");
const { mapearError } = require("../utils/errors");

exports.login = async (req, res, next) => {
    const { email, password } = req.body || {};

    if (!esTextoValido(email) || !esTextoValido(password)) {
        return res.status(400).json({ error: "El email y la contraseña son obligatorios" });
    }

    try {
        const alumno = await alumnoRepository.obtenerAlumnoPorEmail(email);

        if (alumno) {
            if (!alumno.password_hash) {
                return res.status(401).json({
                    error: "Este alumno todavía no tiene contraseña asignada. Pedile al administrador que te la asigne."
                });
            }

            if (!verificar(password, alumno.password_hash)) {
                return res.status(401).json({ error: "Credenciales inválidas" });
            }

            return res.status(200).json({
                id: alumno.id,
                nombre: alumno.nombre,
                email: alumno.email,
                rol: "alumno"
            });
        }

        const profesor = await profesorRepository.obtenerProfesorPorEmail(email);

        if (profesor) {
            if (!profesor.password_hash) {
                return res.status(401).json({
                    error: "Este profesor todavía no tiene contraseña asignada. Pedile al administrador que te la asigne."
                });
            }

            if (!verificar(password, profesor.password_hash)) {
                return res.status(401).json({ error: "Credenciales inválidas" });
            }

            return res.status(200).json({
                id: profesor.id,
                nombre: profesor.nombre,
                email: profesor.email,
                rol: "profesor"
            });
        }

        // Mismo mensaje para "no existe" y "contraseña incorrecta": no se filtra
        // qué emails están registrados.
        return res.status(401).json({ error: "Credenciales inválidas" });
    } catch (err) {
        next(mapearError(err));
    }
};
