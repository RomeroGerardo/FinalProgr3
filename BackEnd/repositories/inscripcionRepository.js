// backend/repositories/inscripcionRepository.js
const db = require("../db");

class InscripcionRepository {
  // La fecha la pone MySQL con CURDATE() y se relee como string YYYY-MM-DD
  // para no devolver un Date de JS al frontend.
  inscribirAlumno(alumno_id, curso_id) {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO inscripciones (alumno_id, curso_id, fecha) VALUES (?, ?, CURDATE())",
        [alumno_id, curso_id],
        (err, result) => {
          if (err) return reject(err);
          db.query(
            "SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha FROM inscripciones WHERE id = ?",
            [result.insertId],
            (err2, rows) => {
              if (err2) return reject(err2);
              const fecha = rows && rows.length > 0 ? rows[0].fecha : null;
              resolve({ id: result.insertId, alumno_id, curso_id, fecha });
            }
          );
        }
      );
    });
  }

  obtenerInscripciones() {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT inscripciones.id,
                inscripciones.alumno_id,
                inscripciones.curso_id,
                alumnos.nombre AS alumno,
                cursos.nombre AS curso,
                DATE_FORMAT(inscripciones.fecha, '%Y-%m-%d') AS fecha
         FROM inscripciones
         JOIN alumnos ON inscripciones.alumno_id = alumnos.id
         JOIN cursos ON inscripciones.curso_id = cursos.id`,
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  // Resuelve { success: true }, o null si el id no existe.
  eliminarInscripcion(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM inscripciones WHERE id = ?", [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0 ? { success: true } : null);
      });
    });
  }
}

module.exports = new InscripcionRepository();
