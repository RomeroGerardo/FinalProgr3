// backend/controllers/alumnoController.js
const alumnoRepository = require("../repositories/alumnoRepository");
const { esTextoValido, esEmailValido, parsearId } = require("../utils/validation");
const { mapearError } = require("../utils/errors");
const { hashear } = require("../utils/password");

// La contraseña la escribe el admin y se la entrega al alumno.
const LARGO_MINIMO_PASSWORD = 4;

const validarPassword = (password) => {
  if (!esTextoValido(password)) return "La contraseña es obligatoria";
  if (String(password).length < LARGO_MINIMO_PASSWORD) {
    return `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres`;
  }
  return null;
};

exports.crearAlumno = async (req, res, next) => {
  const { nombre, email, password } = req.body || {};
  if (!esTextoValido(nombre)) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }
  if (!esTextoValido(email)) {
    return res.status(400).json({ error: "El email es obligatorio" });
  }
  if (!esEmailValido(email)) {
    return res.status(400).json({ error: "El email no es válido" });
  }
  const errorPassword = validarPassword(password);
  if (errorPassword) {
    return res.status(400).json({ error: errorPassword });
  }
  try {
    const alumno = await alumnoRepository.crearAlumno(nombre, email, hashear(password));
    res.status(201).json(alumno);
  } catch (err) {
    next(mapearError(err));
  }
};

exports.listarAlumnos = async (req, res, next) => {
  try {
    const alumnos = await alumnoRepository.obtenerAlumnos();
    res.json(alumnos);
  } catch (err) {
    next(mapearError(err));
  }
};

// PUT /alumnos/:id/password — el admin blanquea la contraseña del alumno.
exports.actualizarPasswordAlumno = async (req, res, next) => {
  const id = parsearId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "El id debe ser un entero positivo" });
  }
  const { password } = req.body || {};
  const errorPassword = validarPassword(password);
  if (errorPassword) {
    return res.status(400).json({ error: errorPassword });
  }
  try {
    const resultado = await alumnoRepository.actualizarPasswordAlumno(id, hashear(password));
    if (!resultado) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }
    res.status(200).json(resultado);
  } catch (err) {
    next(mapearError(err));
  }
};

// DELETE /alumnos/:id — borra al alumno y, en cascada, sus inscripciones.
exports.eliminarAlumno = async (req, res, next) => {
  const id = parsearId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "El id debe ser un entero positivo" });
  }
  try {
    // Se cuenta ANTES de borrar, para poder informar cuántas matrículas se dieron de baja.
    const inscripciones = await alumnoRepository.contarInscripcionesDeAlumno(id);
    const resultado = await alumnoRepository.eliminarAlumno(id);
    if (!resultado) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }
    res.status(200).json({ ...resultado, inscripcionesEliminadas: inscripciones });
  } catch (err) {
    next(mapearError(err));
  }
};
