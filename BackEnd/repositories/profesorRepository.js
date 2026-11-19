const db = require("../db");

// Columnas que puede ver el frontend. password_hash NUNCA sale del backend.
const COLUMNAS_PUBLICAS = "id, nombre, email";

class ProfesorRepository {
  crearProfesor(nombre, email, passwordHash) {
    return new Promise((resolve, reject) => {
      const columnas = passwordHash ? "nombre, email, password_hash" : "nombre, email";
      const placeholders = passwordHash ? "?, ?, ?" : "?, ?";
      const valores = passwordHash ? [nombre, email, passwordHash] : [nombre, email];

      db.query(
        `INSERT INTO profesores (${columnas}) VALUES (${placeholders})`,
        valores,
        (err, result) => {
          if (err) return reject(err);
          resolve({ id: result.insertId, nombre, email });
        }
      );
    });
  }

  obtenerProfesores() {
    return new Promise((resolve, reject) => {
      db.query(`SELECT ${COLUMNAS_PUBLICAS} FROM profesores`, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  // Login: acá sí se necesita el hash. Compara el email sin distinguir mayúsculas.
  obtenerProfesorPorEmail(email) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT ${COLUMNAS_PUBLICAS}, password_hash FROM profesores WHERE LOWER(email) = LOWER(?) LIMIT 1`,
        [email],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows && rows.length > 0 ? rows[0] : null);
        }
      );
    });
  }

  // Blanquear contraseña: reemplaza el hash. null si el profesor no existe.
  actualizarPasswordProfesor(id, passwordHash) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE profesores SET password_hash = ? WHERE id = ?",
        [passwordHash, id],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.affectedRows > 0 ? { success: true } : null);
        }
      );
    });
  }

  // Resuelve el profesor actualizado, o null si el id no existe.
  actualizarProfesor(id, nombre, email) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE profesores SET nombre = ?, email = ? WHERE id = ?",
        [nombre, email, id],
        (err, result) => {
          if (err) return reject(err);
          const profesor = { id, nombre, email };
          if (result.affectedRows > 0) return resolve(profesor);

          // MySQL informa 0 filas afectadas también cuando la fila existe pero
          // los valores no cambiaron, así que se confirma la existencia.
          db.query("SELECT id FROM profesores WHERE id = ?", [id], (err2, rows) => {
            if (err2) return reject(err2);
            resolve(rows && rows.length > 0 ? profesor : null);
          });
        }
      );
    });
  }

  // Cantidad de cursos asignados: si es > 0 el profesor no se puede borrar.
  contarCursosDeProfesor(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) AS total FROM cursos WHERE profesor_id = ?",
        [id],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows && rows.length > 0 ? Number(rows[0].total) : 0);
        }
      );
    });
  }

  // Solo se invoca cuando el profesor ya no tiene cursos asignados.
  // Resuelve { success: true }, o null si el id no existe.
  eliminarProfesor(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM profesores WHERE id = ?", [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0 ? { success: true } : null);
      });
    });
  }
}

module.exports = new ProfesorRepository();
