/**
 * Modelos de datos para el sistema EduGestor
 */

export interface Profesor {
  id: number;
  nombre: string;
  email: string;
}

export interface Curso {
  id: number;
  nombre: string;
  profesor_id: number;
  profesor?: string; // Nombre del profesor si viene asociado del backend
}

export interface Alumno {
  id: number;
  nombre: string;
  email: string;
}

export interface Inscripcion {
  id: number;
  alumno_id: number;
  alumno?: string; // Nombre del alumno
  curso_id: number;
  curso?: string; // Nombre del curso
  fecha?: string;
}

export interface Usuario {
  id: number | null; // null para administradores simulados
  email: string;
  nombre: string;
  rol: 'admin' | 'profesor' | 'alumno';
}
