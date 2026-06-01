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
                `SELECT cursos.id, cursos.nombre, profesores.nombre AS profesor
                 FROM cursos
                 LEFT JOIN profesores ON cursos.profesor_id = profesores.id`,
                (err, rows) => {
                    if (err) return reject(err)
                    resolve(rows)
                }
            )
        })
    }
}

module.exports = new CursoRepository()