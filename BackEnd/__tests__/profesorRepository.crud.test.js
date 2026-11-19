// Regresiones de repositorio para el CRUD de profesores (PUT/DELETE /profesores/:id).
jest.mock("../db", () => ({ query: jest.fn() }));

const db = require("../db");
const profesorRepository = require("../repositories/profesorRepository");

const responder = (resultado) => (sql, params, cb) => cb(null, resultado);

beforeEach(() => {
  db.query.mockReset();
});

describe("profesorRepository.actualizarProfesor", () => {
  test("actualiza nombre y email y devuelve el objeto actualizado", async () => {
    db.query.mockImplementation(responder({ affectedRows: 1 }));

    const profesor = await profesorRepository.actualizarProfesor(3, "Dra. Ana Ruiz", "ana@prof.com");

    expect(profesor).toEqual({ id: 3, nombre: "Dra. Ana Ruiz", email: "ana@prof.com" });
    expect(db.query.mock.calls[0][0]).toContain("UPDATE profesores SET nombre = ?, email = ? WHERE id = ?");
    expect(db.query.mock.calls[0][1]).toEqual(["Dra. Ana Ruiz", "ana@prof.com", 3]);
  });

  test("con affectedRows=0 pero fila existente devuelve el objeto (guardar sin cambios)", async () => {
    db.query
      .mockImplementationOnce(responder({ affectedRows: 0 }))
      .mockImplementationOnce((sql, params, cb) => cb(null, [{ id: 3 }]));

    const profesor = await profesorRepository.actualizarProfesor(3, "Dra. Ana Ruiz", "ana@prof.com");

    expect(profesor).toEqual({ id: 3, nombre: "Dra. Ana Ruiz", email: "ana@prof.com" });
    expect(db.query.mock.calls[1][0]).toContain("SELECT id FROM profesores WHERE id = ?");
  });

  test("con affectedRows=0 y fila inexistente devuelve null", async () => {
    db.query
      .mockImplementationOnce(responder({ affectedRows: 0 }))
      .mockImplementationOnce((sql, params, cb) => cb(null, []));

    const profesor = await profesorRepository.actualizarProfesor(99, "X", "x@prof.com");

    expect(profesor).toBeNull();
  });

  test("propaga el error de MySQL sin tragarlo", async () => {
    db.query.mockImplementation((sql, params, cb) => cb(Object.assign(new Error("dup"), { errno: 1062 })));

    await expect(profesorRepository.actualizarProfesor(3, "A", "a@prof.com")).rejects.toMatchObject({ errno: 1062 });
  });
});

describe("profesorRepository.contarCursosDeProfesor", () => {
  test("devuelve el numero de cursos asignados", async () => {
    db.query.mockImplementation(responder([{ total: 2 }]));

    const total = await profesorRepository.contarCursosDeProfesor(3);

    expect(total).toBe(2);
    expect(db.query.mock.calls[0][0]).toContain("FROM cursos WHERE profesor_id = ?");
    expect(db.query.mock.calls[0][1]).toEqual([3]);
  });
});

describe("profesorRepository.eliminarProfesor", () => {
  test("devuelve { success: true } cuando borra una fila", async () => {
    db.query.mockImplementation(responder({ affectedRows: 1 }));

    const resultado = await profesorRepository.eliminarProfesor(3);

    expect(resultado).toEqual({ success: true });
    expect(db.query.mock.calls[0][0]).toContain("DELETE FROM profesores WHERE id = ?");
  });

  test("devuelve null cuando el id no existe", async () => {
    db.query.mockImplementation(responder({ affectedRows: 0 }));

    await expect(profesorRepository.eliminarProfesor(99)).resolves.toBeNull();
  });
});
