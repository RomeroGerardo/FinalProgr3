const express = require("express")
const cors = require("cors")
const app = express()

const { notFoundHandler, errorHandler } = require("./middleware/errorHandler")

app.use(cors())
app.use(express.json())

const cursoController = require("./controllers/cursoController")
const alumnoController = require("./controllers/alumnoController")
const inscripcionController = require("./controllers/inscripcionController")
const profesorController = require("./controllers/profesorController")
const authController = require("./controllers/authController")

// Smoke check: el frontend lo usa para saber si el backend está vivo.
app.get("/", (req, res) => {
    res.json({ status: "ok" })
})

app.post("/cursos", cursoController.crearCurso)
app.get("/cursos", cursoController.listarCursos)
app.put("/cursos/:id", cursoController.actualizarCurso)
app.delete("/cursos/:id", cursoController.eliminarCurso)

app.post("/auth/login", authController.login)

app.post("/alumnos", alumnoController.crearAlumno)
app.get("/alumnos", alumnoController.listarAlumnos)
app.put("/alumnos/:id/password", alumnoController.actualizarPasswordAlumno)
app.delete("/alumnos/:id", alumnoController.eliminarAlumno)

app.post("/inscripciones", inscripcionController.inscribirAlumno)
app.get("/inscripciones", inscripcionController.listarInscripciones)
app.delete("/inscripciones/:id", inscripcionController.eliminarInscripcion)

app.post("/profesores", profesorController.crearProfesor)
app.get("/profesores", profesorController.listarProfesores)
app.put("/profesores/:id", profesorController.actualizarProfesor)
app.put("/profesores/:id/password", profesorController.actualizarPasswordProfesor)
app.delete("/profesores/:id", profesorController.eliminarProfesor)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
})
