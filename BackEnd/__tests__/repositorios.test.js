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

// Normaliza los espacios en blanco para poder afirmar sobre SQL multilínea.
const sql = (consulta) => consulta.replace(/\s+/g, " ").trim();

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

    const hashEjemplo = "scrypt$aa$bb";
    const alumnoCreado = await alumnoRepository.crearAlumno(nombreEjemplo, emailEjemplo, hashEjemplo);

    // Verificar que el método retorne los datos del alumno creado junto con su ID
    expect(alumnoCreado).toEqual({
      id: 1,
      nombre: nombreEjemplo,
      email: emailEjemplo
    });

    // Verificar que db.query haya sido llamado con los parámetros correctos
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query.mock.calls[0][0]).toContain("INSERT INTO alumnos");
    expect(db.query.mock.calls[0][1]).toEqual([nombreEjemplo, emailEjemplo, hashEjemplo]);
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
    // S6: el listado no debe exponer password_hash.
    expect(db.query.mock.calls[0][0]).toContain("SELECT id, nombre, email FROM alumnos");
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

  // Prueba 5: Registrar Inscripción Exitosamente (S1: la fecha la pone la DB y se devuelve como YYYY-MM-DD)
  test("Prueba 5: inscripcionRepository.inscribirAlumno debe insertar con CURDATE() y devolver la fecha almacenada", async () => {
    const alumnoId = 1;
    const cursoId = 102;

    db.query.mockImplementation((consulta, valores, callback) => {
      const cb = typeof valores === "function" ? valores : callback;
      if (sql(consulta).includes("INSERT INTO inscripciones")) {
        return cb(null, { insertId: 30 });
      }
      if (sql(consulta).includes("SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha")) {
        return cb(null, [{ fecha: "2026-11-18" }]);
      }
      throw new Error(`Consulta inesperada: ${consulta}`);
    });

    const inscripcionCreada = await inscripcionRepository.inscribirAlumno(alumnoId, cursoId);

    expect(inscripcionCreada).toEqual({
      id: 30,
      alumno_id: alumnoId,
      curso_id: cursoId,
      fecha: "2026-11-18"
    });

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(sql(db.query.mock.calls[0][0])).toContain("INSERT INTO inscripciones");
    expect(sql(db.query.mock.calls[0][0])).toContain("CURDATE()");
    expect(db.query.mock.calls[0][1]).toEqual([alumnoId, cursoId]);
    expect(sql(db.query.mock.calls[1][0])).toContain("DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha");
    expect(db.query.mock.calls[1][1]).toEqual([30]);
  });

  // Prueba 6: GET /cursos incluye profesor_id (S2)
  test("Prueba 6: cursoRepository.obtenerCursos debe incluir profesor_id además de profesor", async () => {
    const listaCursosSimulada = [
      { id: 1, nombre: "Base de Datos", profesor_id: 2, profesor: "Ing. Gerardo Ruiz" },
      { id: 2, nombre: "Álgebra", profesor_id: null, profesor: null }
    ];

    db.query.mockImplementation((consulta, callback) => {
      const cb = typeof consulta === "function" ? consulta : callback;
      cb(null, listaCursosSimulada);
    });

    const cursos = await cursoRepository.obtenerCursos();

    expect(cursos).toEqual(listaCursosSimulada);
    const consulta = sql(db.query.mock.calls[0][0]);
    expect(consulta).toContain(
      "SELECT cursos.id, cursos.nombre, cursos.profesor_id, profesores.nombre AS profesor"
    );
    expect(consulta).toContain("LEFT JOIN profesores");
  });

  // Prueba 7: GET /inscripciones incluye ids y fecha (S1)
  test("Prueba 7: inscripcionRepository.obtenerInscripciones debe incluir alumno_id, curso_id y fecha como YYYY-MM-DD", async () => {
    const listaSimulada = [
      {
        id: 3,
        alumno_id: 1,
        curso_id: 102,
        alumno: "Naomi Soria",
        curso: "Base de Datos",
        fecha: "2026-11-18"
      }
    ];

    db.query.mockImplementation((consulta, callback) => {
      const cb = typeof consulta === "function" ? consulta : callback;
      cb(null, listaSimulada);
    });

    const inscripciones = await inscripcionRepository.obtenerInscripciones();

    expect(inscripciones).toEqual(listaSimulada);
    const consulta = sql(db.query.mock.calls[0][0]);
    expect(consulta).toContain("inscripciones.alumno_id");
    expect(consulta).toContain("inscripciones.curso_id");
    expect(consulta).toContain("DATE_FORMAT(inscripciones.fecha, '%Y-%m-%d') AS fecha");
    expect(consulta).toContain("JOIN alumnos");
    expect(consulta).toContain("JOIN cursos");
  });

  // Prueba 8: PUT /cursos/:id actualiza (S3)
  test("Prueba 8: cursoRepository.actualizarCurso debe actualizar y devolver el curso cuando la fila existe", async () => {
    db.query.mockImplementation((consulta, valores, callback) => {
      const cb = typeof valores === "function" ? valores : callback;
      cb(null, { affectedRows: 1 });
    });

    const curso = await cursoRepository.actualizarCurso(7, "Redes", 2);

    expect(curso).toEqual({ id: 7, nombre: "Redes", profesor_id: 2 });
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(sql(db.query.mock.calls[0][0])).toContain("UPDATE cursos SET nombre = ?, profesor_id = ? WHERE id = ?");
    expect(db.query.mock.calls[0][1]).toEqual(["Redes", 2, 7]);
  });

  // Prueba 9: PUT /cursos/:id con id inexistente devuelve null (S3 → 404)
  test("Prueba 9: cursoRepository.actualizarCurso debe devolver null cuando el curso no existe", async () => {
    db.query.mockImplementation((consulta, valores, callback) => {
      const cb = typeof valores === "function" ? valores : callback;
      if (sql(consulta).startsWith("UPDATE cursos")) return cb(null, { affectedRows: 0 });
      if (sql(consulta).startsWith("SELECT id FROM cursos")) return cb(null, []);
      throw new Error(`Consulta inesperada: ${consulta}`);
    });

    const curso = await cursoRepository.actualizarCurso(99, "Redes", 2);

    expect(curso).toBeNull();
    expect(db.query).toHaveBeenCalledTimes(2);
    expect(db.query.mock.calls[1][1]).toEqual([99]);
  });

  // Prueba 10: PUT sin cambios reales no debe responder 404 (MySQL informa 0 filas afectadas)
  test("Prueba 10: cursoRepository.actualizarCurso debe devolver el curso cuando existe aunque no cambie ningún valor", async () => {
    db.query.mockImplementation((consulta, valores, callback) => {
      const cb = typeof valores === "function" ? valores : callback;
      if (sql(consulta).startsWith("UPDATE cursos")) return cb(null, { affectedRows: 0 });
      if (sql(consulta).startsWith("SELECT id FROM cursos")) return cb(null, [{ id: 7 }]);
      throw new Error(`Consulta inesperada: ${consulta}`);
    });

    const curso = await cursoRepository.actualizarCurso(7, "Redes", 2);

    expect(curso).toEqual({ id: 7, nombre: "Redes", profesor_id: 2 });
  });

  // Prueba 11: DELETE /cursos/:id sin borrar inscripciones a mano (S4, la FK cascadea)
  test("Prueba 11: cursoRepository.eliminarCurso debe borrar el curso y delegar el cascade a la FK", async () => {
    db.query.mockImplementation((consulta, valores, callback) => {
      const cb = typeof valores === "function" ? valores : callback;
      cb(null, { affectedRows: 1 });
    });

    const resultado = await cursoRepository.eliminarCurso(7);

    expect(resultado).toEqual({ success: true });
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(sql(db.query.mock.calls[0][0])).toBe("DELETE FROM cursos WHERE id = ?");
    expect(db.query.mock.calls[0][1]).toEqual([7]);
  });

  // Prueba 12: DELETE /cursos/:id inexistente devuelve null (S4 → 404)
  test("Prueba 12: cursoRepository.eliminarCurso debe devolver null cuando el curso no existe", async () => {
    db.query.mockImplementation((consulta, valores, callback) => {
      const cb = typeof valores === "function" ? valores : callback;
      cb(null, { affectedRows: 0 });
    });

    const resultado = await cursoRepository.eliminarCurso(99);

    expect(resultado).toBeNull();
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  // Prueba 13: DELETE /inscripciones/:id (S5)
  test("Prueba 13: inscripcionRepository.eliminarInscripcion debe borrar la inscripción existente", async () => {
    db.query.mockImplementation((consulta, valores, callback) => {
      const cb = typeof valores === "function" ? valores : callback;
      cb(null, { affectedRows: 1 });
    });

    const resultado = await inscripcionRepository.eliminarInscripcion(30);

    expect(resultado).toEqual({ success: true });
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(sql(db.query.mock.calls[0][0])).toBe("DELETE FROM inscripciones WHERE id = ?");
    expect(db.query.mock.calls[0][1]).toEqual([30]);
  });

  // Prueba 14: DELETE /inscripciones/:id inexistente devuelve null (S5 → 404)
  test("Prueba 14: inscripcionRepository.eliminarInscripcion debe devolver null cuando la inscripción no existe", async () => {
    db.query.mockImplementation((consulta, valores, callback) => {
      const cb = typeof valores === "function" ? valores : callback;
      cb(null, { affectedRows: 0 });
    });

    const resultado = await inscripcionRepository.eliminarInscripcion(404);

    expect(resultado).toBeNull();
    expect(db.query).toHaveBeenCalledTimes(1);
  });
});
