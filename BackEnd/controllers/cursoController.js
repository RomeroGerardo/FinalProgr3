const cursoRepository = require("../repositories/cursoRepository")

exports.crearCurso = async (req, res) => {
    const { nombre, profesor_id } = req.body
    try {
        const curso = await cursoRepository.crearCurso(nombre, profesor_id)
        res.json(curso)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

exports.listarCursos = async (req, res) => {
    try {
        const cursos = await cursoRepository.obtenerCursos()
        console.log('listarCursos ->', cursos)
        res.json(cursos)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
