// BackEnd/__tests__/alumnoController.auth.test.js
// S1-S3, S7, S8: controllers de alta con credenciales, reset, baja y login.
jest.mock("../repositories/alumnoRepository", () => ({
  crearAlumno: jest.fn(),
  obtenerAlumnos: jest.fn(),
  obtenerAlumnoPorEmail: jest.fn(),
  actualizarPasswordAlumno: jest.fn(),
  eliminarAlumno: jest.fn(),
  contarInscripcionesDeAlumno: jest.fn()
}));

const alumnoRepository = require("../repositories/alumnoRepository");
const alumnoController = require("../controllers/alumnoController");
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

describe("POST /alumnos (crearAlumno con credenciales)", () => {
  test("201 y hashea la contraseña antes de guardarla", async () => {
    alumnoRepository.crearAlumno.mockResolvedValue({ id: 9, nombre: "Leo", email: "leo@mail.com" });
    const res = resMock();

    await alumnoController.crearAlumno(
      { body: { nombre: "Leo", email: "leo@mail.com", password: "alu123" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: 9, nombre: "Leo", email: "leo@mail.com" });

    const [, , hash] = alumnoRepository.crearAlumno.mock.calls[0];
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(hash).not.toContain("alu123");
  });

  test("400 si falta la contraseña", async () => {
    const res = resMock();

    await alumnoController.crearAlumno(
      { body: { nombre: "Leo", email: "leo@mail.com" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/contrase/i);
    expect(alumnoRepository.crearAlumno).not.toHaveBeenCalled();
  });

  test("400 si la contraseña es demasiado corta", async () => {
    const res = resMock();

    await alumnoController.crearAlumno(
      { body: { nombre: "Leo", email: "leo@mail.com", password: "123" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(400);
    expect(alumnoRepository.crearAlumno).not.toHaveBeenCalled();
  });
});

describe("PUT /alumnos/:id/password (blanquear contraseña)", () => {
  test("200 y guarda un hash nuevo", async () => {
    alumnoRepository.actualizarPasswordAlumno.mockResolvedValue({ success: true });
    const res = resMock();

    await alumnoController.actualizarPasswordAlumno(
      { params: { id: "6" }, body: { password: "nuevaClave1" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
    const [id, hash] = alumnoRepository.actualizarPasswordAlumno.mock.calls[0];
    expect(id).toBe(6);
    expect(hash.startsWith("scrypt$")).toBe(true);
  });

  test("404 si el alumno no existe", async () => {
    alumnoRepository.actualizarPasswordAlumno.mockResolvedValue(null);
    const res = resMock();

    await alumnoController.actualizarPasswordAlumno(
      { params: { id: "99" }, body: { password: "nuevaClave1" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(404);
  });

  test("400 si la contraseña es corta", async () => {
    const res = resMock();

    await alumnoController.actualizarPasswordAlumno(
      { params: { id: "6" }, body: { password: "12" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(400);
    expect(alumnoRepository.actualizarPasswordAlumno).not.toHaveBeenCalled();
  });
});

describe("DELETE /alumnos/:id", () => {
  test("200 y reporta cuántas inscripciones se dieron de baja", async () => {
    alumnoRepository.contarInscripcionesDeAlumno.mockResolvedValue(2);
    alumnoRepository.eliminarAlumno.mockResolvedValue({ success: true });
    const res = resMock();

    await alumnoController.eliminarAlumno({ params: { id: "6" } }, res, jest.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, inscripcionesEliminadas: 2 });
  });

  test("404 si el alumno no existe", async () => {
    alumnoRepository.contarInscripcionesDeAlumno.mockResolvedValue(0);
    alumnoRepository.eliminarAlumno.mockResolvedValue(null);
    const res = resMock();

    await alumnoController.eliminarAlumno({ params: { id: "99" } }, res, jest.fn());

    expect(res.statusCode).toBe(404);
  });

  test("400 si el id no es un entero positivo", async () => {
    const res = resMock();

    await alumnoController.eliminarAlumno({ params: { id: "abc" } }, res, jest.fn());

    expect(res.statusCode).toBe(400);
    expect(alumnoRepository.eliminarAlumno).not.toHaveBeenCalled();
  });
});

describe("POST /auth/login", () => {
  const login = (body, res) => authController.login({ body }, res, jest.fn());

  test("200 con los datos del alumno cuando la contraseña es correcta", async () => {
    const { hashear } = require("../utils/password");
    alumnoRepository.obtenerAlumnoPorEmail.mockResolvedValue({
      id: 6,
      nombre: "Leo",
      email: "leo@mail.com",
      password_hash: hashear("alu123")
    });
    const res = resMock();

    await login({ email: "leo@mail.com", password: "alu123" }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 6, nombre: "Leo", email: "leo@mail.com", rol: "alumno" });
  });

  test("401 con contraseña incorrecta", async () => {
    const { hashear } = require("../utils/password");
    alumnoRepository.obtenerAlumnoPorEmail.mockResolvedValue({
      id: 6, nombre: "Leo", email: "leo@mail.com", password_hash: hashear("alu123")
    });
    const res = resMock();

    await login({ email: "leo@mail.com", password: "otra" }, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Credenciales inválidas");
  });

  test("401 con el mismo mensaje si el email no existe (no filtra datos)", async () => {
    alumnoRepository.obtenerAlumnoPorEmail.mockResolvedValue(null);
    const res = resMock();

    await login({ email: "nadie@mail.com", password: "x" }, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Credenciales inválidas");
  });

  test("401 explicando que falta asignar contraseña", async () => {
    alumnoRepository.obtenerAlumnoPorEmail.mockResolvedValue({
      id: 6, nombre: "Leo", email: "leo@mail.com", password_hash: null
    });
    const res = resMock();

    await login({ email: "leo@mail.com", password: "x" }, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/contrase/i);
    expect(res.body.error).toMatch(/administrador/i);
  });

  test("400 si falta email o contraseña", async () => {
    const res = resMock();

    await login({ email: "leo@mail.com" }, res);

    expect(res.statusCode).toBe(400);
    expect(alumnoRepository.obtenerAlumnoPorEmail).not.toHaveBeenCalled();
  });
});
