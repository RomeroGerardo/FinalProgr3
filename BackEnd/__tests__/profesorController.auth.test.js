// BackEnd/__tests__/profesorController.auth.test.js
// Tests de alta de profesor con credenciales, reset de contraseña y login.
jest.mock("../repositories/profesorRepository", () => ({
  crearProfesor: jest.fn(),
  obtenerProfesores: jest.fn(),
  obtenerProfesorPorEmail: jest.fn(),
  actualizarPasswordProfesor: jest.fn(),
  actualizarProfesor: jest.fn(),
  eliminarProfesor: jest.fn(),
  contarCursosDeProfesor: jest.fn()
}));

jest.mock("../repositories/alumnoRepository", () => ({
  obtenerAlumnoPorEmail: jest.fn()
}));

const profesorRepository = require("../repositories/profesorRepository");
const alumnoRepository = require("../repositories/alumnoRepository");
const profesorController = require("../controllers/profesorController");
const authController = require("../controllers/authController");

const resMock = () => {
  const r = { statusCode: 200, body: undefined };
  r.status = jest.fn((c) => { r.statusCode = c; return r; });
  r.json = jest.fn((b) => { r.body = b; return r; });
  return r;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /profesores (crearProfesor con credenciales)", () => {
  test("201 y hashea la contraseña antes de guardarla", async () => {
    profesorRepository.crearProfesor.mockResolvedValue({ id: 5, nombre: "Marta", email: "marta@prof.com" });
    const res = resMock();

    await profesorController.crearProfesor(
      { body: { nombre: "Marta", email: "marta@prof.com", password: "prof1234" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: 5, nombre: "Marta", email: "marta@prof.com" });

    const [, , hash] = profesorRepository.crearProfesor.mock.calls[0];
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(hash).not.toContain("prof1234");
  });

  test("400 si falta la contraseña", async () => {
    const res = resMock();

    await profesorController.crearProfesor(
      { body: { nombre: "Marta", email: "marta@prof.com" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/contrase/i);
    expect(profesorRepository.crearProfesor).not.toHaveBeenCalled();
  });

  test("400 si la contraseña es menor a 4 caracteres", async () => {
    const res = resMock();

    await profesorController.crearProfesor(
      { body: { nombre: "Marta", email: "marta@prof.com", password: "123" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(400);
    expect(profesorRepository.crearProfesor).not.toHaveBeenCalled();
  });
});

describe("PUT /profesores/:id/password (blanquear contraseña docente)", () => {
  test("200 y guarda un hash nuevo", async () => {
    profesorRepository.actualizarPasswordProfesor.mockResolvedValue({ success: true });
    const res = resMock();

    await profesorController.actualizarPasswordProfesor(
      { params: { id: "5" }, body: { password: "nuevaClaveProf" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
    const [id, hash] = profesorRepository.actualizarPasswordProfesor.mock.calls[0];
    expect(id).toBe(5);
    expect(hash.startsWith("scrypt$")).toBe(true);
  });

  test("404 si el profesor no existe", async () => {
    profesorRepository.actualizarPasswordProfesor.mockResolvedValue(null);
    const res = resMock();

    await profesorController.actualizarPasswordProfesor(
      { params: { id: "99" }, body: { password: "nuevaClaveProf" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(404);
  });

  test("400 si el id no es valido", async () => {
    const res = resMock();

    await profesorController.actualizarPasswordProfesor(
      { params: { id: "abc" }, body: { password: "nuevaClaveProf" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(400);
    expect(profesorRepository.actualizarPasswordProfesor).not.toHaveBeenCalled();
  });
});

describe("POST /auth/login (login de profesor)", () => {
  const login = (body, res) => authController.login({ body }, res, jest.fn());

  test("200 con rol profesor cuando las credenciales son válidas", async () => {
    const { hashear } = require("../utils/password");
    alumnoRepository.obtenerAlumnoPorEmail.mockResolvedValue(null);
    profesorRepository.obtenerProfesorPorEmail.mockResolvedValue({
      id: 5,
      nombre: "Marta",
      email: "marta@prof.com",
      password_hash: hashear("prof1234")
    });
    const res = resMock();

    await login({ email: "marta@prof.com", password: "prof1234" }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 5, nombre: "Marta", email: "marta@prof.com", rol: "profesor" });
  });

  test("401 si el profesor no tiene contraseña asignada", async () => {
    alumnoRepository.obtenerAlumnoPorEmail.mockResolvedValue(null);
    profesorRepository.obtenerProfesorPorEmail.mockResolvedValue({
      id: 5,
      nombre: "Marta",
      email: "marta@prof.com",
      password_hash: null
    });
    const res = resMock();

    await login({ email: "marta@prof.com", password: "algo" }, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/profesor.*contrase/i);
  });
});
