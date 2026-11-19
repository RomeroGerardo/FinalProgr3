// BackEnd/__tests__/alumnosAuth.test.js
// S1-S3, S7, S8: alta con contraseña, reset, baja y login del alumno.
jest.mock("../db", () => ({ query: jest.fn() }));

const db = require("../db");
const alumnoRepository = require("../repositories/alumnoRepository");

// El repositorio llama db.query tanto con (sql, cb) como con (sql, params, cb).
const responder = (resultado) => (...args) => args[args.length - 1](null, resultado);

beforeEach(() => {
  db.query.mockReset();
});

describe("alumnoRepository.crearAlumno con contraseña", () => {
  test("guarda el hash en password_hash y no devuelve el hash", async () => {
    db.query.mockImplementation(responder({ insertId: 9 }));

    const alumno = await alumnoRepository.crearAlumno("Leo", "leo@mail.com", "scrypt$aa$bb");

    expect(db.query.mock.calls[0][0]).toContain("INSERT INTO alumnos (nombre, email, password_hash)");
    expect(db.query.mock.calls[0][1]).toEqual(["Leo", "leo@mail.com", "scrypt$aa$bb"]);
    expect(alumno).toEqual({ id: 9, nombre: "Leo", email: "leo@mail.com" });
    expect(alumno.password_hash).toBeUndefined();
  });
});

describe("alumnoRepository.obtenerAlumnos", () => {
  test("no expone password_hash al frontend", async () => {
    db.query.mockImplementation(responder([{ id: 1, nombre: "Ana", email: "ana@mail.com" }]));

    await alumnoRepository.obtenerAlumnos();

    const sql = db.query.mock.calls[0][0];
    expect(sql).not.toContain("SELECT *");
    expect(sql).not.toContain("password_hash");
  });
});

describe("alumnoRepository.obtenerAlumnoPorEmail", () => {
  test("busca sin distinguir mayúsculas y devuelve la fila con el hash", async () => {
    db.query.mockImplementation(responder([{ id: 6, nombre: "Leo", email: "leo@mail.com", password_hash: "scrypt$aa$bb" }]));

    const fila = await alumnoRepository.obtenerAlumnoPorEmail("Leo@Mail.com");

    expect(db.query.mock.calls[0][0]).toContain("LOWER(email) = LOWER(?)");
    expect(db.query.mock.calls[0][1]).toEqual(["Leo@Mail.com"]);
    expect(fila.password_hash).toBe("scrypt$aa$bb");
  });

  test("devuelve null si el email no existe", async () => {
    db.query.mockImplementation(responder([]));

    await expect(alumnoRepository.obtenerAlumnoPorEmail("nadie@mail.com")).resolves.toBeNull();
  });
});

describe("alumnoRepository.actualizarPasswordAlumno", () => {
  test("actualiza el hash de una fila existente", async () => {
    db.query.mockImplementation(responder({ affectedRows: 1 }));

    const r = await alumnoRepository.actualizarPasswordAlumno(6, "scrypt$cc$dd");

    expect(db.query.mock.calls[0][0]).toContain("UPDATE alumnos SET password_hash = ? WHERE id = ?");
    expect(db.query.mock.calls[0][1]).toEqual(["scrypt$cc$dd", 6]);
    expect(r).toEqual({ success: true });
  });

  test("devuelve null si el alumno no existe", async () => {
    db.query.mockImplementation(responder({ affectedRows: 0 }));

    await expect(alumnoRepository.actualizarPasswordAlumno(99, "scrypt$cc$dd")).resolves.toBeNull();
  });
});

describe("alumnoRepository.eliminarAlumno y conteo de inscripciones", () => {
  test("elimina y devuelve { success: true }", async () => {
    db.query.mockImplementation(responder({ affectedRows: 1 }));

    await expect(alumnoRepository.eliminarAlumno(6)).resolves.toEqual({ success: true });
    expect(db.query.mock.calls[0][0]).toContain("DELETE FROM alumnos WHERE id = ?");
  });

  test("devuelve null si no existe", async () => {
    db.query.mockImplementation(responder({ affectedRows: 0 }));

    await expect(alumnoRepository.eliminarAlumno(99)).resolves.toBeNull();
  });

  test("cuenta las inscripciones del alumno", async () => {
    db.query.mockImplementation(responder([{ total: 3 }]));

    await expect(alumnoRepository.contarInscripcionesDeAlumno(6)).resolves.toBe(3);
    expect(db.query.mock.calls[0][0]).toContain("FROM inscripciones WHERE alumno_id = ?");
  });
});
