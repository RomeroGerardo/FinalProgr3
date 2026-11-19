const db = require("../db")

class CursoRepository {
    crearCurso(nombre, profesor_id) {
        return new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO cursos (nombre, profesor_id) VALUES (?,?)",
                [nombre, profesor_id],
                (err, result) => {
                    if (err) return reject(err)
                    resolve({ id: result.insertId, nombre, profesor_id })
                }
            )
        })
    }

    obtenerCursos() {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT cursos.id, cursos.nombre, cursos.profesor_id, profesores.nombre AS profesor
                 FROM cursos
                 LEFT JOIN profesores ON cursos.profesor_id = profesores.id`,
                (err, rows) => {
                    if (err) return reject(err)
                    resolve(rows)
                }
            )
        })
    }

    // Resuelve el curso actualizado, o null si el id no existe.
    actualizarCurso(id, nombre, profesor_id) {
        return new Promise((resolve, reject) => {
            db.query(
                "UPDATE cursos SET nombre = ?, profesor_id = ? WHERE id = ?",
                [nombre, profesor_id, id],
                (err, result) => {
                    if (err) return reject(err)
                    const curso = { id, nombre, profesor_id }
                    if (result.affectedRows > 0) return resolve(curso)

                    // MySQL informa 0 filas afectadas también cuando la fila existe
                    // pero los valores no cambiaron, así que se confirma la existencia.
                    db.query("SELECT id FROM cursos WHERE id = ?", [id], (err2, rows) => {
                        if (err2) return reject(err2)
                        resolve(rows && rows.length > 0 ? curso : null)
                    })
                }
            )
        })
    }

    // Las inscripciones asociadas se borran por el ON DELETE CASCADE de la FK.
    // Resuelve { success: true }, o null si el id no existe.
    eliminarCurso(id) {
        return new Promise((resolve, reject) => {
            db.query(
                "DELETE FROM cursos WHERE id = ?",
                [id],
                (err, result) => {
                    if (err) return reject(err)
                    resolve(result.affectedRows > 0 ? { success: true } : null)
                }
            )
        })
    }
}

module.exports = new CursoRepository()
