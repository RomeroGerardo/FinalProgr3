// backend/controllers/inscripcionController.js
const inscripcionRepository = require("../repositories/inscripcionRepository");
const { esIdPositivo, parsearId } = require("../utils/validation");
const { mapearError } = require("../utils/errors");

exports.inscribirAlumno = async (req, res, next) => {
  const { alumno_id, curso_id } = req.body || {};
  if (!esIdPositivo(alumno_id)) {
    return res.status(400).json({ error: "El alumno_id debe ser un entero positivo" });
  }
  if (!esIdPositivo(curso_id)) {
    return res.status(400).json({ error: "El curso_id debe ser un entero positivo" });
  }
  try {
    const inscripcion = await inscripcionRepository.inscribirAlumno(
      Number(alumno_id),
      Number(curso_id)
    );
    res.status(201).json(inscripcion);
  } catch (err) {
    next(mapearError(err));
  }
};

exports.listarInscripciones = async (req, res, next) => {
  try {
    const inscripciones = await inscripcionRepository.obtenerInscripciones();
    res.json(inscripciones);
  } catch (err) {
    next(mapearError(err));
  }
};

exports.eliminarInscripcion = async (req, res, next) => {
  const id = parsearId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "El id debe ser un entero positivo" });
  }
  try {
    const resultado = await inscripcionRepository.eliminarInscripcion(id);
    if (!resultado) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }
    res.status(200).json(resultado);
  } catch (err) {
    next(mapearError(err));
  }
};
