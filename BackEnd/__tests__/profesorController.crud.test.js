// Regresiones de controller para PUT/DELETE /profesores/:id.
jest.mock("../repositories/profesorRepository", () => ({
  crearProfesor: jest.fn(),
  obtenerProfesores: jest.fn(),
  actualizarProfesor: jest.fn(),
  eliminarProfesor: jest.fn(),
  contarCursosDeProfesor: jest.fn()
}));

const profesorRepository = require("../repositories/profesorRepository");
const profesorController = require("../controllers/profesorController");

const resMock = () => {
  const r = { statusCode: 200, body: undefined };
  r.status = jest.fn((c) => { r.statusCode = c; return r; });
  r.json = jest.fn((b) => { r.body = b; return r; });
  return r;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PUT /profesores/:id (actualizarProfesor)", () => {
  test("200 y devuelve el profesor actualizado", async () => {
    profesorRepository.actualizarProfesor.mockResolvedValue({ id: 3, nombre: "Ana", email: "ana@prof.com" });
    const res = resMock();

    await profesorController.actualizarProfesor(
      { params: { id: "3" }, body: { nombre: "Ana", email: "ana@prof.com" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 3, nombre: "Ana", email: "ana@prof.com" });
    expect(profesorRepository.actualizarProfesor).toHaveBeenCalledWith(3, "Ana", "ana@prof.com");
  });

  test("404 cuando el profesor no existe", async () => {
    profesorRepository.actualizarProfesor.mockResolvedValue(null);
    const res = resMock();

    await profesorController.actualizarProfesor(
      { params: { id: "99" }, body: { nombre: "Ana", email: "ana@prof.com" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Profesor no encontrado" });
  });

  test("400 si el id no es un entero positivo", async () => {
    const res = resMock();

    await profesorController.actualizarProfesor(
      { params: { id: "abc" }, body: { nombre: "Ana", email: "ana@prof.com" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(400);
    expect(profesorRepository.actualizarProfesor).not.toHaveBeenCalled();
  });

  test("400 si falta el nombre", async () => {
    const res = resMock();

    await profesorController.actualizarProfesor(
      { params: { id: "3" }, body: { nombre: "   ", email: "ana@prof.com" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(400);
    expect(profesorRepository.actualizarProfesor).not.toHaveBeenCalled();
  });

  test("400 si el email no es valido", async () => {
    const res = resMock();

    await profesorController.actualizarProfesor(
      { params: { id: "3" }, body: { nombre: "Ana", email: "ana.prof.com" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(400);
    expect(profesorRepository.actualizarProfesor).not.toHaveBeenCalled();
  });
});

describe("DELETE /profesores/:id (eliminarProfesor)", () => {
  test("409 y NO borra si el profesor tiene cursos asignados", async () => {
    profesorRepository.contarCursosDeProfesor.mockResolvedValue(2);
    const res = resMock();

    await profesorController.eliminarProfesor({ params: { id: "3" } }, res, jest.fn());

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/2/);
    expect(profesorRepository.eliminarProfesor).not.toHaveBeenCalled();
  });

  test("200 { success: true } cuando no tiene cursos", async () => {
    profesorRepository.contarCursosDeProfesor.mockResolvedValue(0);
    profesorRepository.eliminarProfesor.mockResolvedValue({ success: true });
    const res = resMock();

    await profesorController.eliminarProfesor({ params: { id: "3" } }, res, jest.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  test("404 si el profesor no existe", async () => {
    profesorRepository.contarCursosDeProfesor.mockResolvedValue(0);
    profesorRepository.eliminarProfesor.mockResolvedValue(null);
    const res = resMock();

    await profesorController.eliminarProfesor({ params: { id: "99" } }, res, jest.fn());

    expect(res.statusCode).toBe(404);
  });

  test("400 si el id no es un entero positivo", async () => {
    const res = resMock();

    await profesorController.eliminarProfesor({ params: { id: "0" } }, res, jest.fn());

    expect(res.statusCode).toBe(400);
    expect(profesorRepository.eliminarProfesor).not.toHaveBeenCalled();
  });
});
