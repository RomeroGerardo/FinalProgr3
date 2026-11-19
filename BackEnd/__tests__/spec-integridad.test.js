// Regresiones de contrato derivadas de odd/tasks/conectar-backend-db.md (S1-S6, S11, S12).
jest.mock("../repositories/cursoRepository", () => ({
  crearCurso: jest.fn(), obtenerCursos: jest.fn(),
  actualizarCurso: jest.fn(), eliminarCurso: jest.fn()
}));
jest.mock("../repositories/inscripcionRepository", () => ({
  inscribirAlumno: jest.fn(), obtenerInscripciones: jest.fn(), eliminarInscripcion: jest.fn()
}));
jest.mock("../repositories/alumnoRepository", () => ({
  crearAlumno: jest.fn(), obtenerAlumnos: jest.fn()
}));
jest.mock("../repositories/profesorRepository", () => ({
  crearProfesor: jest.fn(), obtenerProfesores: jest.fn()
}));

const cursoRepo = require("../repositories/cursoRepository");
const incRepo = require("../repositories/inscripcionRepository");
const alumnoRepo = require("../repositories/alumnoRepository");
const cursoCtrl = require("../controllers/cursoController");
const incCtrl = require("../controllers/inscripcionController");
const alumnoCtrl = require("../controllers/alumnoController");
const { errorHandler } = require("../middleware/errorHandler");

const resMock = () => {
  const r = { statusCode: 200, body: undefined };
  r.status = jest.fn((c) => { r.statusCode = c; return r; });
  r.json = jest.fn((b) => { r.body = b; return r; });
  return r;
};
const errno = (n, m) => Object.assign(new Error(m), { errno: n });

describe("S1 - contrato de GET /inscripciones", () => {
  test("devuelve fecha como YYYY-MM-DD y no un datetime ISO", async () => {
    incRepo.obtenerInscripciones.mockResolvedValue([
      { id: 1, alumno_id: 2, curso_id: 3, alumno: "A", curso: "B", fecha: "2026-11-18" }
    ]);
    const res = resMock();
    await incCtrl.listarInscripciones({}, res, jest.fn());
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toEqual(expect.objectContaining({ alumno_id: 2, curso_id: 3 }));
    expect(res.body[0].fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("S3 - PUT /cursos/:id", () => {
  test("400 si falta profesor_id, sin tocar la base", async () => {
    const res = resMock();
    await cursoCtrl.actualizarCurso({ params: { id: "7" }, body: { nombre: "Redes" } }, res, jest.fn());
    expect(res.statusCode).toBe(400);
    expect(cursoRepo.actualizarCurso).not.toHaveBeenCalled();
  });
  test("404 si el curso no existe", async () => {
    cursoRepo.actualizarCurso.mockResolvedValue(null);
    const res = resMock();
    await cursoCtrl.actualizarCurso({ params: { id: "99" }, body: { nombre: "R", profesor_id: 1 } }, res, jest.fn());
    expect(res.statusCode).toBe(404);
  });
});

describe("S4/S5 - DELETE responde { success: true }", () => {
  test("DELETE /cursos/:id existente", async () => {
    cursoRepo.eliminarCurso.mockResolvedValue({ success: true });
    const res = resMock();
    await cursoCtrl.eliminarCurso({ params: { id: "1" } }, res, jest.fn());
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
  test("DELETE /inscripciones/:id inexistente", async () => {
    incRepo.eliminarInscripcion.mockResolvedValue(null);
    const res = resMock();
    await incCtrl.eliminarInscripcion({ params: { id: "404" } }, res, jest.fn());
    expect(res.statusCode).toBe(404);
  });
});

describe("S6 - cadena completa 1062 -> 409 en el errorHandler", () => {
  test("POST duplicado responde 409 con cuerpo de error, no 500", async () => {
    alumnoRepo.crearAlumno.mockRejectedValue(errno(1062, "Duplicate entry"));
    const res = resMock();
    let capturado;
    await alumnoCtrl.crearAlumno(
      { body: { nombre: "Ana", email: "ana@mail.com", password: "ana12345" } }, res,
      (e) => { capturado = e; errorHandler(e, {}, res, jest.fn()); }
    );
    expect(capturado.status).toBe(409);
    expect(res.statusCode).toBe(409);
    expect(typeof res.body.error).toBe("string");
  });
});

describe("S11 - pool configurado, sin conexión al importar", () => {
  test("db.js llama createPool una vez con connectionLimit", () => {
    jest.isolateModules(() => {
      jest.doMock("mysql2", () => ({ createPool: jest.fn(() => ({ query: jest.fn() })) }));
      const mysql = require("mysql2");
      const pool = require("../db");
      expect(mysql.createPool).toHaveBeenCalledTimes(1);
      expect(mysql.createPool.mock.calls[0][0]).toEqual(
        expect.objectContaining({ connectionLimit: expect.any(Number) })
      );
      expect(typeof pool.query).toBe("function");
    });
  });
});
