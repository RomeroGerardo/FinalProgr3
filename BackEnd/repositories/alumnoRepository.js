// backend/repositories/alumnoRepository.js
const db = require("../db");

// Columnas que puede ver el frontend. password_hash NUNCA sale del backend.
const COLUMNAS_PUBLICAS = "id, nombre, email";

class AlumnoRepository {
  crearAlumno(nombre, email, passwordHash) {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO alumnos (nombre, email, password_hash) VALUES (?, ?, ?)",
        [nombre, email, passwordHash],
        (err, result) => {
          if (err) return reject(err);
          resolve({ id: result.insertId, nombre, email });
        }
      );
    });
  }

  obtenerAlumnos() {
    return new Promise((resolve, reject) => {
      db.query(`SELECT ${COLUMNAS_PUBLICAS} FROM alumnos`, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  // Login: acá sí se necesita el hash. Compara el email sin distinguir mayúsculas.
  obtenerAlumnoPorEmail(email) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT ${COLUMNAS_PUBLICAS}, password_hash FROM alumnos WHERE LOWER(email) = LOWER(?) LIMIT 1`,
        [email],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows && rows.length > 0 ? rows[0] : null);
        }
      );
    });
  }

  // Blanquear contraseña: reemplaza el hash. null si el alumno no existe.
  actualizarPasswordAlumno(id, passwordHash) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE alumnos SET password_hash = ? WHERE id = ?",
        [passwordHash, id],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.affectedRows > 0 ? { success: true } : null);
        }
      );
    });
  }

  // Las inscripciones se borran en cascada por fk_inscripciones_alumno.
  eliminarAlumno(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM alumnos WHERE id = ?", [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0 ? { success: true } : null);
      });
    });
  }

  contarInscripcionesDeAlumno(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) AS total FROM inscripciones WHERE alumno_id = ?",
        [id],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows && rows.length > 0 ? Number(rows[0].total) : 0);
        }
      );
    });
  }
}

module.exports = new AlumnoRepository();
