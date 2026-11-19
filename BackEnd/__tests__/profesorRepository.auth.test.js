// BackEnd/__tests__/profesorRepository.auth.test.js
jest.mock("../db", () => ({ query: jest.fn() }));

const db = require("../db");
const profesorRepository = require("../repositories/profesorRepository");

const responder = (resultado) => (...args) => args[args.length - 1](null, resultado);

beforeEach(() => {
  db.query.mockReset();
});

describe("profesorRepository.crearProfesor con contraseña", () => {
  test("guarda el hash en password_hash y no devuelve el hash", async () => {
    db.query.mockImplementation(responder({ insertId: 5 }));

    const profesor = await profesorRepository.crearProfesor("Marta", "marta@prof.com", "scrypt$aa$bb");

    expect(db.query.mock.calls[0][0]).toContain("INSERT INTO profesores (nombre, email, password_hash)");
    expect(db.query.mock.calls[0][1]).toEqual(["Marta", "marta@prof.com", "scrypt$aa$bb"]);
    expect(profesor).toEqual({ id: 5, nombre: "Marta", email: "marta@prof.com" });
    expect(profesor.password_hash).toBeUndefined();
  });
});

describe("profesorRepository.obtenerProfesores", () => {
  test("no expone password_hash al frontend", async () => {
    db.query.mockImplementation(responder([{ id: 1, nombre: "Carlos", email: "carlos@prof.com" }]));

    await profesorRepository.obtenerProfesores();

    const sql = db.query.mock.calls[0][0];
    expect(sql).not.toContain("SELECT *");
    expect(sql).not.toContain("password_hash");
  });
});

describe("profesorRepository.obtenerProfesorPorEmail", () => {
  test("busca sin distinguir mayúsculas y devuelve la fila con el hash", async () => {
    db.query.mockImplementation(responder([{ id: 5, nombre: "Marta", email: "marta@prof.com", password_hash: "scrypt$aa$bb" }]));

    const fila = await profesorRepository.obtenerProfesorPorEmail("Marta@Prof.com");

    expect(db.query.mock.calls[0][0]).toContain("LOWER(email) = LOWER(?)");
    expect(db.query.mock.calls[0][1]).toEqual(["Marta@Prof.com"]);
    expect(fila.password_hash).toBe("scrypt$aa$bb");
  });

  test("devuelve null si el email no existe", async () => {
    db.query.mockImplementation(responder([]));

    await expect(profesorRepository.obtenerProfesorPorEmail("nadie@prof.com")).resolves.toBeNull();
  });
});

describe("profesorRepository.actualizarPasswordProfesor", () => {
  test("actualiza el hash de una fila existente", async () => {
    db.query.mockImplementation(responder({ affectedRows: 1 }));

    const r = await profesorRepository.actualizarPasswordProfesor(5, "scrypt$cc$dd");

    expect(db.query.mock.calls[0][0]).toContain("UPDATE profesores SET password_hash = ? WHERE id = ?");
    expect(db.query.mock.calls[0][1]).toEqual(["scrypt$cc$dd", 5]);
    expect(r).toEqual({ success: true });
  });

  test("devuelve null si el profesor no existe", async () => {
    db.query.mockImplementation(responder({ affectedRows: 0 }));

    await expect(profesorRepository.actualizarPasswordProfesor(99, "scrypt$cc$dd")).resolves.toBeNull();
  });
});
