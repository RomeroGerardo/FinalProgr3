-- 002_profesores_password.sql
-- Migración aplicada el 2026-11-18 sobre MariaDB 10.4.32 / base `gestor_cursos`.
-- Objetivo: permitir que los profesores tengan credenciales de acceso asignadas por el admin.

ALTER TABLE profesores
    ADD COLUMN password_hash VARCHAR(255) NULL;
