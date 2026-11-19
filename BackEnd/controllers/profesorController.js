const profesorRepository = require("../repositories/profesorRepository");
const { esTextoValido, esEmailValido, parsearId } = require("../utils/validation");
const { mapearError } = require("../utils/errors");
const { hashear } = require("../utils/password");

const LARGO_MINIMO_PASSWORD = 4;

const validarPassword = (password) => {
  if (!esTextoValido(password)) return "La contraseña es obligatoria";
  if (String(password).length < LARGO_MINIMO_PASSWORD) {
    return `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres`;
  }
  return null;
};

exports.crearProfesor = async (req, res, next) => {
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
    const profesor = await profesorRepository.crearProfesor(nombre, email, hashear(password));
    res.status(201).json(profesor);
  } catch (err) {
    next(mapearError(err));
  }
};

exports.listarProfesores = async (req, res, next) => {
  try {
    const profesores = await profesorRepository.obtenerProfesores();
    res.json(profesores);
  } catch (err) {
    next(mapearError(err));
  }
};

// PUT /profesores/:id/password — el admin blanquea la contraseña del profesor.
exports.actualizarPasswordProfesor = async (req, res, next) => {
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
    const resultado = await profesorRepository.actualizarPasswordProfesor(id, hashear(password));
    if (!resultado) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }
    res.status(200).json(resultado);
  } catch (err) {
    next(mapearError(err));
  }
};

exports.actualizarProfesor = async (req, res, next) => {
  const id = parsearId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "El id debe ser un entero positivo" });
  }
  const { nombre, email } = req.body || {};
  if (!esTextoValido(nombre)) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }
  if (!esTextoValido(email)) {
    return res.status(400).json({ error: "El email es obligatorio" });
  }
  if (!esEmailValido(email)) {
    return res.status(400).json({ error: "El email no es válido" });
  }
  try {
    const profesor = await profesorRepository.actualizarProfesor(id, nombre, email);
    if (!profesor) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }
    res.status(200).json(profesor);
  } catch (err) {
    next(mapearError(err));
  }
};

exports.eliminarProfesor = async (req, res, next) => {
  const id = parsearId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "El id debe ser un entero positivo" });
  }
  try {
    // No se permite dejar cursos huérfanos: la FK los pasaría a NULL y la UI
    // no sabe editar un curso sin profesor asignado.
    const cursos = await profesorRepository.contarCursosDeProfesor(id);
    if (cursos > 0) {
      return res.status(409).json({
        error: `El profesor tiene ${cursos} curso(s) asignado(s). Reasignalos antes de eliminarlo.`
      });
    }
    const resultado = await profesorRepository.eliminarProfesor(id);
    if (!resultado) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }
    res.status(200).json(resultado);
  } catch (err) {
    next(mapearError(err));
  }
};
