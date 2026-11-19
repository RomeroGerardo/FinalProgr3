// BackEnd/__tests__/controllers.test.js

jest.mock("../repositories/cursoRepository", () => ({
  crearCurso: jest.fn(),
  obtenerCursos: jest.fn(),
  actualizarCurso: jest.fn(),
  eliminarCurso: jest.fn()
}));

jest.mock("../repositories/alumnoRepository", () => ({
  crearAlumno: jest.fn(),
  obtenerAlumnos: jest.fn()
}));

jest.mock("../repositories/profesorRepository", () => ({
  crearProfesor: jest.fn(),
  obtenerProfesores: jest.fn()
}));

jest.mock("../repositories/inscripcionRepository", () => ({
  inscribirAlumno: jest.fn(),
  obtenerInscripciones: jest.fn(),
  eliminarInscripcion: jest.fn()
}));

const cursoRepository = require("../repositories/cursoRepository");
const alumnoRepository = require("../repositories/alumnoRepository");
const profesorRepository = require("../repositories/profesorRepository");
const inscripcionRepository = require("../repositories/inscripcionRepository");

const cursoController = require("../controllers/cursoController");
const alumnoController = require("../controllers/alumnoController");
const profesorController = require("../controllers/profesorController");
const inscripcionController = require("../controllers/inscripcionController");
const { notFoundHandler, errorHandler } = require("../middleware/errorHandler");

const mockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.body = undefined;
  res.status = jest.fn((codigo) => {
    res.statusCode = codigo;
    return res;
  });
  res.json = jest.fn((cuerpo) => {
    res.body = cuerpo;
    return res;
  });
  return res;
};

const errorMysql = (errno, message) => Object.assign(new Error(message), { errno });

describe("Controladores - validación y códigos HTTP (S6, S12)", () => {
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  test("crearCurso responde 201 con el curso creado", async () => {
    cursoRepository.crearCurso.mockResolvedValue({ id: 5, nombre: "Redes", profesor_id: 2 });
    const req = { body: { nombre: "Redes", profesor_id: 2 } };
    const res = mockRes();

    await cursoController.crearCurso(req, res, next);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: 5, nombre: "Redes", profesor_id: 2 });
    expect(cursoRepository.crearCurso).toHaveBeenCalledWith("Redes", 2);
    expect(next).not.toHaveBeenCalled();
  });

  test("crearCurso responde 400 si falta el nombre y no toca la base", async () => {
    const req = { body: { nombre: "   ", profesor_id: 2 } };
    const res = mockRes();

    await cursoController.crearCurso(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "El nombre es obligatorio" });
    expect(cursoRepository.crearCurso).not.toHaveBeenCalled();
  });

  test("crearCurso responde 400 si profesor_id no es un entero positivo", async () => {
    const req = { body: { nombre: "Redes", profesor_id: 0 } };
    const res = mockRes();

    await cursoController.crearCurso(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(cursoRepository.crearCurso).not.toHaveBeenCalled();
  });

  test("crearCurso delega en el errorHandler con status 409 ante un UNIQUE duplicado (1062)", async () => {
    cursoRepository.crearCurso.mockRejectedValue(errorMysql(1062, "Duplicate entry"));
    const req = { body: { nombre: "Redes", profesor_id: 2 } };
    const res = mockRes();

    await cursoController.crearCurso(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].status).toBe(409);
  });

  test("crearAlumno responde 201 con el alumno creado", async () => {
    alumnoRepository.crearAlumno.mockResolvedValue({ id: 9, nombre: "Naomi", email: "naomi@edugestor.com" });
    // S1: el admin define la contraseña al crear el alumno.
    const req = { body: { nombre: "Naomi", email: "naomi@edugestor.com", password: "naomi123" } };
    const res = mockRes();

    await alumnoController.crearAlumno(req, res, next);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: 9, nombre: "Naomi", email: "naomi@edugestor.com" });
  });

  test("crearAlumno responde 400 si el email no contiene @", async () => {
    const req = { body: { nombre: "Naomi", email: "naomi.edugestor.com", password: "naomi123" } };
    const res = mockRes();

    await alumnoController.crearAlumno(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(alumnoRepository.crearAlumno).not.toHaveBeenCalled();
  });

  test("crearProfesor responde 400 si falta el email", async () => {
    const req = { body: { nombre: "Gerardo" } };
    const res = mockRes();

    await profesorController.crearProfesor(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(profesorRepository.crearProfesor).not.toHaveBeenCalled();
  });

  test("actualizarCurso responde 200 con el curso actualizado", async () => {
    cursoRepository.actualizarCurso.mockResolvedValue({ id: 7, nombre: "Redes", profesor_id: 2 });
    const req = { params: { id: "7" }, body: { nombre: "Redes", profesor_id: 2 } };
    const res = mockRes();

    await cursoController.actualizarCurso(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 7, nombre: "Redes", profesor_id: 2 });
    expect(cursoRepository.actualizarCurso).toHaveBeenCalledWith(7, "Redes", 2);
  });

  test("actualizarCurso responde 404 si el curso no existe", async () => {
    cursoRepository.actualizarCurso.mockResolvedValue(null);
    const req = { params: { id: "99" }, body: { nombre: "Redes", profesor_id: 2 } };
    const res = mockRes();

    await cursoController.actualizarCurso(req, res, next);

    expect(res.statusCode).toBe(404);
  });

  test("actualizarCurso responde 400 si el id no es un entero positivo", async () => {
    const req = { params: { id: "abc" }, body: { nombre: "Redes", profesor_id: 2 } };
    const res = mockRes();

    await cursoController.actualizarCurso(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(cursoRepository.actualizarCurso).not.toHaveBeenCalled();
  });

  test("eliminarCurso responde 200 { success: true } y 404 cuando no existe", async () => {
    cursoRepository.eliminarCurso.mockResolvedValueOnce({ success: true });
    const resExistente = mockRes();
    await cursoController.eliminarCurso({ params: { id: "7" } }, resExistente, next);
    expect(resExistente.statusCode).toBe(200);
    expect(resExistente.body).toEqual({ success: true });

    cursoRepository.eliminarCurso.mockResolvedValueOnce(null);
    const resInexistente = mockRes();
    await cursoController.eliminarCurso({ params: { id: "99" } }, resInexistente, next);
    expect(resInexistente.statusCode).toBe(404);
    expect(next).not.toHaveBeenCalled();
  });

  test("inscribirAlumno responde 201 con la inscripción y su fecha", async () => {
    inscripcionRepository.inscribirAlumno.mockResolvedValue({
      id: 30,
      alumno_id: 1,
      curso_id: 102,
      fecha: "2026-11-18"
    });
    const req = { body: { alumno_id: 1, curso_id: 102 } };
    const res = mockRes();

    await inscripcionController.inscribirAlumno(req, res, next);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: 30, alumno_id: 1, curso_id: 102, fecha: "2026-11-18" });
  });

  test("inscribirAlumno responde 400 si alumno_id no es un entero positivo", async () => {
    const req = { body: { alumno_id: "abc", curso_id: 102 } };
    const res = mockRes();

    await inscripcionController.inscribirAlumno(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(inscripcionRepository.inscribirAlumno).not.toHaveBeenCalled();
  });

  test("inscribirAlumno delega en el errorHandler con status 400 cuando falta la FK (1452)", async () => {
    inscripcionRepository.inscribirAlumno.mockRejectedValue(
      errorMysql(1452, "Cannot add or update a child row")
    );
    const req = { body: { alumno_id: 1, curso_id: 999 } };
    const res = mockRes();

    await inscripcionController.inscribirAlumno(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].status).toBe(400);
  });

  test("eliminarInscripcion responde 200 { success: true } y 404 cuando no existe", async () => {
    inscripcionRepository.eliminarInscripcion.mockResolvedValueOnce({ success: true });
    const resExistente = mockRes();
    await inscripcionController.eliminarInscripcion({ params: { id: "30" } }, resExistente, next);
    expect(resExistente.statusCode).toBe(200);
    expect(resExistente.body).toEqual({ success: true });

    inscripcionRepository.eliminarInscripcion.mockResolvedValueOnce(null);
    const resInexistente = mockRes();
    await inscripcionController.eliminarInscripcion({ params: { id: "404" } }, resInexistente, next);
    expect(resInexistente.statusCode).toBe(404);
  });
});

describe("Middleware de errores (S12)", () => {
  test("notFoundHandler responde 404 para rutas desconocidas", () => {
    const res = mockRes();

    notFoundHandler({ method: "GET", url: "/desconocida" }, res);

    expect(res.statusCode).toBe(404);
  });

  test("errorHandler respeta err.status y cae a 500 sin status", () => {
    const resConStatus = mockRes();
    errorHandler(Object.assign(new Error("Duplicado"), { status: 409 }), {}, resConStatus, jest.fn());
    expect(resConStatus.statusCode).toBe(409);

    const resSinStatus = mockRes();
    errorHandler(new Error("Explotó"), {}, resSinStatus, jest.fn());
    expect(resSinStatus.statusCode).toBe(500);
  });
});
