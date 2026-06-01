// BackEnd/__tests__/repositorios.test.js

// Mockear el módulo de base de datos para no requerir una conexión real
jest.mock("../db", () => {
  return {
    query: jest.fn()
  };
});

const db = require("../db");
const alumnoRepository = require("../repositories/alumnoRepository");
const cursoRepository = require("../repositories/cursoRepository");
const profesorRepository = require("../repositories/profesorRepository");
const inscripcionRepository = require("../repositories/inscripcionRepository");

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

  // Prueba 3: Crear Curso Exitosamente
  test("Prueba 3: cursoRepository.crearCurso debe registrar un curso asociado a un profesor y retornar su ID", async () => {
    const nombreCurso = "Ingeniería de Software con Node.js";
    const profesorId = 2;
    const resultadoSimulado = { insertId: 102 };

    db.query.mockImplementation((sql, valores, callback) => {
      const cb = typeof valores === "function" ? valores : callback;
      cb(null, resultadoSimulado);
    });

    const cursoCreado = await cursoRepository.crearCurso(nombreCurso, profesorId);

    expect(cursoCreado).toEqual({
      id: 102,
      nombre: nombreCurso,
      profesor_id: profesorId
    });

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query.mock.calls[0][0]).toContain("INSERT INTO cursos");
    expect(db.query.mock.calls[0][1]).toEqual([nombreCurso, profesorId]);
  });

  // Prueba 4: Crear Profesor Exitosamente
  test("Prueba 4: profesorRepository.crearProfesor debe registrar un nuevo docente y retornar su objeto", async () => {
    const nombreProfesor = "Ing. Gerardo Ruiz";
    const emailProfesor = "gerardo.ruiz@edugestor.com";
    const resultadoSimulado = { insertId: 2 };

    db.query.mockImplementation((sql, valores, callback) => {
      const cb = typeof valores === "function" ? valores : callback;
      cb(null, resultadoSimulado);
    });

    const profesorCreado = await profesorRepository.crearProfesor(nombreProfesor, emailProfesor);

    expect(profesorCreado).toEqual({
      id: 2,
      nombre: nombreProfesor,
      email: emailProfesor
    });

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query.mock.calls[0][0]).toContain("INSERT INTO profesores");
    expect(db.query.mock.calls[0][1]).toEqual([nombreProfesor, emailProfesor]);
  });

  // Prueba 5: Registrar Inscripción Exitosamente
  test("Prueba 5: inscripcionRepository.inscribirAlumno debe registrar la inscripción de un alumno en un curso", async () => {
    const alumnoId = 1;
    const cursoId = 102;
    const resultadoSimulado = { insertId: 30 };

    db.query.mockImplementation((sql, valores, callback) => {
      const cb = typeof valores === "function" ? valores : callback;
      cb(null, resultadoSimulado);
    });

    const inscripcionCreada = await inscripcionRepository.inscribirAlumno(alumnoId, cursoId);

    expect(inscripcionCreada).toEqual({
      id: 30,
      alumno_id: alumnoId,
      curso_id: cursoId
    });

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query.mock.calls[0][0]).toContain("INSERT INTO inscripciones");
    expect(db.query.mock.calls[0][1]).toEqual([alumnoId, cursoId]);
  });
});
