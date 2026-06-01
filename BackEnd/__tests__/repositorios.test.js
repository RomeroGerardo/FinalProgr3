// BackEnd/__tests__/repositorios.test.js

// Mockear el módulo de base de datos para no requerir una conexión real
jest.mock("../db", () => {
  return {
    query: jest.fn()
  };
});

const db = require("../db");
const alumnoRepository = require("../repositories/alumnoRepository");

describe("Pruebas Unitarias de Repositorios - EduGestor", () => {

  beforeEach(() => {
    // Limpiar todas las llamadas simuladas antes de cada prueba
    jest.clearAllMocks();
  });

  // Prueba 1: Crear Alumno Exitosamente
  test("Prueba 1: alumnoRepository.crearAlumno debe registrar un alumno y retornar el objeto con su ID asignado", async () => {
    const nombreEjemplo = "Naomi Soria";
    const emailEjemplo = "naomi.soria2024@gmail.com";
    const resultadoSimulado = { insertId: 1 };

    // Simular el comportamiento de db.query llamando al callback con el resultado simulado
    db.query.mockImplementation((sql, valores, callback) => {
      const cb = typeof valores === "function" ? valores : callback;
      cb(null, resultadoSimulado);
    });

    const alumnoCreado = await alumnoRepository.crearAlumno(nombreEjemplo, emailEjemplo);

    // Verificar que el método retorne los datos del alumno creado junto con su ID
    expect(alumnoCreado).toEqual({
      id: 1,
      nombre: nombreEjemplo,
      email: emailEjemplo
    });

    // Verificar que db.query haya sido llamado con los parámetros correctos
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query.mock.calls[0][0]).toContain("INSERT INTO alumnos");
    expect(db.query.mock.calls[0][1]).toEqual([nombreEjemplo, emailEjemplo]);
  });

  // Prueba 2: Obtener Alumnos Exitosamente
  test("Prueba 2: alumnoRepository.obtenerAlumnos debe retornar la lista completa de alumnos de la base de datos", async () => {
    const listaAlumnosSimulada = [
      { id: 1, nombre: "Naomi Soria", email: "naomi.soria2024@gmail.com" },
      { id: 2, nombre: "Lucas Ramírez", email: "lucas.ramirez@edugestor.com" }
    ];

    db.query.mockImplementation((sql, callback) => {
      const cb = typeof sql === "function" ? sql : callback;
      cb(null, listaAlumnosSimulada);
    });

    const alumnos = await alumnoRepository.obtenerAlumnos();

    expect(alumnos).toEqual(listaAlumnosSimulada);
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query.mock.calls[0][0]).toContain("SELECT * FROM alumnos");
  });
});
