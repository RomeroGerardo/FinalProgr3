/**
 * Script de carga inicial (mock data) para la demo en MySQL / MariaDB (`gestor_cursos`).
 * Ejecutar desde `BackEnd/`:
 *   node db/seed.js
 * o bien:
 *   npm run seed
 */
const db = require("../db");
const { hashear } = require("../utils/password");

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
  });

const PROFESORES = [
  [1, "Carlos Romero", "carlos@prof.com"],
  [2, "Laura Fernández", "laura@prof.com"],
  [3, "Martín Gómez", "martin@prof.com"]
];

const ALUMNOS = [
  [1, "Sofía Álvarez", "sofia@alumno.com"],
  [2, "Luis Martínez", "luis@alumno.com"],
  [3, "Valentina Díaz", "valentina@alumno.com"],
  [4, "Mateo Benítez", "mateo@alumno.com"],
  [5, "Camila Rojas", "camila@alumno.com"],
  [6, "Lucas Pereyra", "lucas@alumno.com"]
];

const CURSOS = [
  [1, "Ingeniería de Software III", 1],
  [2, "Bases de Datos Relacionales", 1],
  [3, "Programación Web Full-Stack", 2],
  [4, "Arquitectura y Patrones de Diseño", 1],
  [5, "Redes y Sistemas Distribuidos", 3],
  [6, "Testing y Calidad de Software", 2]
];

const INSCRIPCIONES = [
  // Luis Martínez (id 2): 3 materias activas + 3 disponibles en catálogo (4, 5, 6)
  [2, 1, "2026-11-03"],
  [2, 2, "2026-11-05"],
  [2, 3, "2026-11-08"],
  // Resto de estudiantes para poblar las aulas de los docentes
  [1, 1, "2026-11-02"],
  [1, 2, "2026-11-04"],
  [1, 4, "2026-11-09"],
  [1, 6, "2026-11-11"],
  [3, 1, "2026-11-03"],
  [3, 3, "2026-11-06"],
  [3, 5, "2026-11-10"],
  [4, 1, "2026-11-04"],
  [4, 2, "2026-11-07"],
  [4, 5, "2026-11-12"],
  [4, 6, "2026-11-13"],
  [5, 2, "2026-11-05"],
  [5, 3, "2026-11-08"],
  [5, 4, "2026-11-14"],
  [6, 1, "2026-11-06"],
  [6, 4, "2026-11-10"],
  [6, 6, "2026-11-15"]
];

async function runSeed() {
  const passProf = hashear("prof123");
  const passAlu = hashear("alu123");

  await query("SET FOREIGN_KEY_CHECKS = 0");
  await query("TRUNCATE TABLE inscripciones");
  await query("TRUNCATE TABLE cursos");
  await query("TRUNCATE TABLE alumnos");
  await query("TRUNCATE TABLE profesores");
  await query("SET FOREIGN_KEY_CHECKS = 1");

  for (const [id, nombre, email] of PROFESORES) {
    await query(
      "INSERT INTO profesores (id, nombre, email, password_hash) VALUES (?, ?, ?, ?)",
      [id, nombre, email, passProf]
    );
  }

  for (const [id, nombre, email] of ALUMNOS) {
    await query(
      "INSERT INTO alumnos (id, nombre, email, password_hash) VALUES (?, ?, ?, ?)",
      [id, nombre, email, passAlu]
    );
  }

  for (const [id, nombre, profesorId] of CURSOS) {
    await query(
      "INSERT INTO cursos (id, nombre, profesor_id) VALUES (?, ?, ?)",
      [id, nombre, profesorId]
    );
  }

  for (const [alumnoId, cursoId, fecha] of INSCRIPCIONES) {
    await query(
      "INSERT INTO inscripciones (alumno_id, curso_id, fecha) VALUES (?, ?, ?)",
      [alumnoId, cursoId, fecha]
    );
  }

  console.log(
    `Seed completado: ${PROFESORES.length} profesores, ${ALUMNOS.length} alumnos, ${CURSOS.length} cursos, ${INSCRIPCIONES.length} inscripciones.`
  );
}

runSeed()
  .catch((err) => {
    console.error("Error ejecutando seed:", err);
    process.exitCode = 1;
  })
  .finally(() => {
    db.end();
  });
