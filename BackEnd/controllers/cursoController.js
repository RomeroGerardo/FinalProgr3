const cursoRepository = require("../repositories/cursoRepository")
const { esTextoValido, esIdPositivo, parsearId } = require("../utils/validation")
const { mapearError } = require("../utils/errors")

exports.crearCurso = async (req, res, next) => {
    const { nombre, profesor_id } = req.body || {}
    if (!esTextoValido(nombre)) {
        return res.status(400).json({ error: "El nombre es obligatorio" })
    }
    if (!esIdPositivo(profesor_id)) {
        return res.status(400).json({ error: "El profesor_id debe ser un entero positivo" })
    }
    try {
        const curso = await cursoRepository.crearCurso(nombre, Number(profesor_id))
        res.status(201).json(curso)
    } catch (err) {
        next(mapearError(err))
    }
}

exports.listarCursos = async (req, res, next) => {
    try {
        const cursos = await cursoRepository.obtenerCursos()
        res.json(cursos)
    } catch (err) {
        next(mapearError(err))
    }
}

exports.actualizarCurso = async (req, res, next) => {
    const id = parsearId(req.params.id)
    if (id === null) {
        return res.status(400).json({ error: "El id debe ser un entero positivo" })
    }
    const { nombre, profesor_id } = req.body || {}
    if (!esTextoValido(nombre)) {
        return res.status(400).json({ error: "El nombre es obligatorio" })
    }
    if (!esIdPositivo(profesor_id)) {
        return res.status(400).json({ error: "El profesor_id debe ser un entero positivo" })
    }
    try {
        const curso = await cursoRepository.actualizarCurso(id, nombre, Number(profesor_id))
        if (!curso) {
            return res.status(404).json({ error: "Curso no encontrado" })
        }
        res.status(200).json(curso)
    } catch (err) {
        next(mapearError(err))
    }
}

exports.eliminarCurso = async (req, res, next) => {
    const id = parsearId(req.params.id)
    if (id === null) {
        return res.status(400).json({ error: "El id debe ser un entero positivo" })
    }
    try {
        // Las inscripciones del curso se borran por el ON DELETE CASCADE de la FK.
        const resultado = await cursoRepository.eliminarCurso(id)
        if (!resultado) {
            return res.status(404).json({ error: "Curso no encontrado" })
        }
        res.status(200).json(resultado)
    } catch (err) {
        next(mapearError(err))
    }
}
