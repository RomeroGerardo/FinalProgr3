-- 001_hardening.sql
-- Migración aplicada el 2026-11-18 sobre MariaDB 10.4.32 / base `gestor_cursos`.
-- Objetivo: que el modelo soporte la app real (fecha de inscripción, sin duplicados,
-- borrado de curso en cascada). Todo idempotente no aplica: correr una sola vez.

-- 1. Deduplicar inscripciones conservando el id más bajo de cada par (alumno_id, curso_id).
DELETE i1 FROM inscripciones i1
INNER JOIN inscripciones i2
    ON i1.alumno_id = i2.alumno_id
   AND i1.curso_id = i2.curso_id
   AND i1.id > i2.id;

-- 2. Fecha de inscripción. Se agrega nullable, se rellena y se pasa a NOT NULL
--    para no depender de DEFAULT de expresión según versión del motor.
ALTER TABLE inscripciones ADD COLUMN fecha DATE NULL;
UPDATE inscripciones SET fecha = CURDATE() WHERE fecha IS NULL;
ALTER TABLE inscripciones MODIFY COLUMN fecha DATE NOT NULL;

-- 3. Unicidad de email por persona.
ALTER TABLE alumnos
    ADD UNIQUE KEY uq_alumnos_email (email);
ALTER TABLE profesores
    ADD UNIQUE KEY uq_profesores_email (email);

-- 4. Una sola matrícula por alumno y curso.
ALTER TABLE inscripciones
    ADD UNIQUE KEY uq_inscripcion_alumno_curso (alumno_id, curso_id);

-- 5. Borrar un curso arrastra sus inscripciones.
ALTER TABLE inscripciones DROP FOREIGN KEY fk_inscripciones_curso;
ALTER TABLE inscripciones
    ADD CONSTRAINT fk_inscripciones_curso
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE;
