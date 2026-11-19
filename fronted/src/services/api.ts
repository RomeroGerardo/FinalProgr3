import { Curso, Profesor, Alumno, Inscripcion, Usuario } from '../types';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";

// Refleja el resultado del ÚLTIMO request real contra el backend (lo lee Navbar).
// null = todavía no se hizo ninguna petición (así el badge no miente al arrancar).
let backendActive: boolean | null = null;

/**
 * Helper genérico para peticiones HTTP contra el backend.
 * No hay respaldo local: si el backend falla, el error se propaga al llamador.
 */
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, options);
  } catch (error) {
    // Error de red / backend caído: se conserva el mensaje original.
    backendActive = false;
    throw new Error(error instanceof Error ? error.message : String(error));
  }

  // Llegó una respuesta HTTP: el backend está vivo aunque el status sea 4xx/5xx.
  backendActive = true;

  if (!response.ok) {
    let backendError: string | undefined;
    try {
      const body: unknown = await response.json();
      if (
        body !== null &&
        typeof body === 'object' &&
        'error' in body &&
        typeof (body as { error: unknown }).error === 'string' &&
        (body as { error: string }).error.trim() !== ''
      ) {
        backendError = (body as { error: string }).error;
      }
    } catch {
      // El cuerpo del error no es JSON: se informa el status HTTP.
    }

    throw new Error(backendError ?? `HTTP ${response.status}`);
  }

  backendActive = true;

  const texto = await response.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}

export const api = {
  // Conocer si el último request al backend fue exitoso
  isBackendActive: () => backendActive,

  // ══════════════ CURSOS ══════════════
  async obtenerCursos(): Promise<Curso[]> {
    return apiCall<Curso[]>('/cursos');
  },

  async crearCurso(curso: Omit<Curso, 'id'>): Promise<Curso> {
    return apiCall<Curso>('/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: curso.nombre, profesor_id: curso.profesor_id })
    });
  },

  async editarCurso(id: number, curso: Partial<Curso>): Promise<Curso> {
    return apiCall<Curso>(`/cursos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: curso.nombre, profesor_id: curso.profesor_id })
    });
  },

  async eliminarCurso(id: number): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/cursos/${id}`, {
      method: 'DELETE'
    });
  },

  // ══════════════ PROFESORES ══════════════
  async obtenerProfesores(): Promise<Profesor[]> {
    return apiCall<Profesor[]>('/profesores');
  },

  async crearProfesor(profesor: Omit<Profesor, 'id'> & { password: string }): Promise<Profesor> {
    return apiCall<Profesor>('/profesores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: profesor.nombre, email: profesor.email, password: profesor.password })
    });
  },

  async editarProfesor(id: number, profesor: Partial<Profesor>): Promise<Profesor> {
    return apiCall<Profesor>(`/profesores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: profesor.nombre, email: profesor.email })
    });
  },

  async resetearPasswordProfesor(id: number, password: string): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/profesores/${id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
  },

  async eliminarProfesor(id: number): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/profesores/${id}`, {
      method: 'DELETE'
    });
  },

  // ══════════════ ALUMNOS ══════════════
  async obtenerAlumnos(): Promise<Alumno[]> {
    return apiCall<Alumno[]>('/alumnos');
  },

  // S1: el admin define la contraseña al crear el alumno.
  async crearAlumno(alumno: Omit<Alumno, 'id'> & { password: string }): Promise<Alumno> {
    return apiCall<Alumno>('/alumnos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: alumno.nombre, email: alumno.email, password: alumno.password })
    });
  },

  // S2: blanquear (resetear) la contraseña de un alumno.
  async resetearPasswordAlumno(id: number, password: string): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/alumnos/${id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
  },

  // S3: eliminar al alumno (sus inscripciones se dan de baja en cascada).
  async eliminarAlumno(id: number): Promise<{ success: boolean; inscripcionesEliminadas?: number }> {
    return apiCall<{ success: boolean; inscripcionesEliminadas?: number }>(`/alumnos/${id}`, {
      method: 'DELETE'
    });
  },

  // S1: login de alumnos contra la base de datos.
  async login(email: string, password: string): Promise<Usuario> {
    return apiCall<Usuario>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },

  // ══════════════ INSCRIPCIONES ══════════════
  async obtenerInscripciones(): Promise<Inscripcion[]> {
    return apiCall<Inscripcion[]>('/inscripciones');
  },

  async inscribirAlumno(inc: Omit<Inscripcion, 'id'>): Promise<Inscripcion> {
    return apiCall<Inscripcion>('/inscripciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno_id: inc.alumno_id, curso_id: inc.curso_id })
    });
  },

  async eliminarInscripcion(id: number): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/inscripciones/${id}`, {
      method: 'DELETE'
    });
  }
};
