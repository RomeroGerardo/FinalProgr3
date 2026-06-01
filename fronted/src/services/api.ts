import { Curso, Profesor, Alumno, Inscripcion } from '../types';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Datos de simulación iniciales por si el backend no está activo o de forma predeterminada
const MOCK_PROFESORES: Profesor[] = [
  { id: 1, nombre: "Dra. María González", email: "maria.gonzalez@edugestor.com" },
  { id: 2, nombre: "Ing. Gerardo Ruiz", email: "gerardo.ruiz@edugestor.com" },
  { id: 3, nombre: "Msc. Carlos Rodríguez", email: "carlos.rodriguez@edugestor.com" }
];

const MOCK_CURSOS: Curso[] = [
  { id: 101, nombre: "Introducción a React v19", profesor_id: 1, profesor: "Dra. María González" },
  { id: 102, nombre: "Ingeniería de Software con Node.js", profesor_id: 2, profesor: "Ing. Gerardo Ruiz" },
  { id: 103, nombre: "Bases de Datos Relacionales y MySQL", profesor_id: 2, profesor: "Ing. Gerardo Ruiz" },
  { id: 104, nombre: "Metodologías Ágiles de Desarrollo", profesor_id: 3, profesor: "Msc. Carlos Rodríguez" }
];

const MOCK_ALUMNOS: Alumno[] = [
  { id: 1, nombre: "Naomi Soria", email: "naomi.soria2024@gmail.com" },
  { id: 2, nombre: "Lucas Ramírez", email: "lucas.ramirez@edugestor.com" },
  { id: 3, nombre: "Sofía Pérez", email: "sofia.perez@edugestor.com" }
];

const MOCK_INSCRIPCIONES: Inscripcion[] = [
  { id: 1, alumno_id: 1, alumno: "Naomi Soria", curso_id: 101, curso: "Introducción a React v19", fecha: "2026-05-15" },
  { id: 2, alumno_id: 1, alumno: "Naomi Soria", curso_id: 102, curso: "Ingeniería de Software con Node.js", fecha: "2026-05-18" },
  { id: 3, alumno_id: 2, alumno: "Lucas Ramírez", curso_id: 103, curso: "Bases de Datos Relacionales y MySQL", fecha: "2026-05-20" }
];

// Inicializar localStorage si no existe para que persista durante el uso simulado
const initLocalStorage = () => {
  if (!localStorage.getItem('eg_profesores')) {
    localStorage.setItem('eg_profesores', JSON.stringify(MOCK_PROFESORES));
  }
  if (!localStorage.getItem('eg_cursos')) {
    localStorage.setItem('eg_cursos', JSON.stringify(MOCK_CURSOS));
  }
  if (!localStorage.getItem('eg_alumnos')) {
    localStorage.setItem('eg_alumnos', JSON.stringify(MOCK_ALUMNOS));
  }
  if (!localStorage.getItem('eg_inscripciones')) {
    localStorage.setItem('eg_inscripciones', JSON.stringify(MOCK_INSCRIPCIONES));
  }
};

initLocalStorage();

// Variable para forzar modo simulado para desarrollo interactivo en AI Studio
// pero con capacidad de interactuar con el backend de Gerardo si está en ejecución
let autoDetectBackend = true;
let backendActive = false;

// Comprobar disponibilidad de forma rápida al cargar
const checkBackend = async () => {
  if (!autoDetectBackend) return false;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1000); // 1 segundo timeout
    const r = await fetch(`${API_URL}/cursos`, { signal: controller.signal });
    clearTimeout(id);
    backendActive = r.ok;
    console.log(`EduGestor API - Detectado backend real: ${backendActive}`);
    return r.ok;
  } catch (e) {
    backendActive = false;
    console.log("EduGestor API - Usando modo simulado local");
    return false;
  }
};

// Ejecución inicial de detección
checkBackend();

/**
 * Helper genérico para peticiones HTTP
 * Si falla, recurre de forma transparente al almacenamiento simulado en LocalStorage.
 */
async function apiCall<T>(endpoint: string, options?: RequestInit, getFallbackData?: () => T): Promise<T> {
  if (autoDetectBackend) {
    try {
      const url = `${API_URL}${endpoint}`;
      const response = await fetch(url, options);
      if (response.ok) {
        backendActive = true;
        return await response.json();
      }
    } catch (error) {
      console.warn(`Error de conexión con ${endpoint}, recurriendo a LocalStorage:`, error);
      backendActive = false;
    }
  }

  // Fallback: LocalStorage
  if (getFallbackData) {
    return getFallbackData();
  }
  throw new Error("Conexión perdida y no hay respaldo de datos disponible.");
}

export const api = {
  // Conocer si el backend de Gerardo está actualmente activo
  isBackendActive: () => backendActive,
  setUseMockOnly: (useMock: boolean) => {
    autoDetectBackend = !useMock;
    if (useMock) backendActive = false;
  },

  // ══════════════ CURSOS ══════════════
  async obtenerCursos(): Promise<Curso[]> {
    return apiCall<Curso[]>('/cursos', undefined, () => {
      const cursos = JSON.parse(localStorage.getItem('eg_cursos') || '[]');
      const profesores = JSON.parse(localStorage.getItem('eg_profesores') || '[]');
      // Rellenar nombre del profesor para el listado simulado
      return cursos.map((c: any) => ({
        ...c,
        profesor: profesores.find((p: any) => p.id === c.profesor_id)?.nombre || 'Sin Asignar'
      }));
    });
  },

  async crearCurso(curso: Omit<Curso, 'id'>): Promise<Curso> {
    const fallback = () => {
      const cursos = JSON.parse(localStorage.getItem('eg_cursos') || '[]');
      const nuevoCurso: Curso = {
        ...curso,
        id: cursos.length > 0 ? Math.max(...cursos.map((c: any) => c.id)) + 1 : 101,
      };
      cursos.push(nuevoCurso);
      localStorage.setItem('eg_cursos', JSON.stringify(cursos));
      return nuevoCurso;
    };

    return apiCall<Curso>('/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(curso)
    }, fallback);
  },

  async editarCurso(id: number, curso: Partial<Curso>): Promise<Curso> {
    const fallback = () => {
      const cursos = JSON.parse(localStorage.getItem('eg_cursos') || '[]');
      const index = cursos.findIndex((c: any) => c.id === id);
      if (index === -1) throw new Error("Curso no encontrado");
      const editado = { ...cursos[index], ...curso };
      cursos[index] = editado;
      localStorage.setItem('eg_cursos', JSON.stringify(cursos));
      return editado;
    };

    return apiCall<Curso>(`/cursos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(curso)
    }, fallback);
  },

  async eliminarCurso(id: number): Promise<{ success: boolean }> {
    const fallback = () => {
      let cursos = JSON.parse(localStorage.getItem('eg_cursos') || '[]');
      cursos = cursos.filter((c: any) => c.id !== id);
      localStorage.setItem('eg_cursos', JSON.stringify(cursos));
      return { success: true };
    };

    return apiCall<{ success: boolean }>(`/cursos/${id}`, {
      method: 'DELETE'
    }, fallback);
  },

  // ══════════════ PROFESORES ══════════════
  async obtenerProfesores(): Promise<Profesor[]> {
    return apiCall<Profesor[]>('/profesores', undefined, () => {
      return JSON.parse(localStorage.getItem('eg_profesores') || '[]');
    });
  },

  async crearProfesor(profesor: Omit<Profesor, 'id'>): Promise<Profesor> {
    const fallback = () => {
      const profesores = JSON.parse(localStorage.getItem('eg_profesores') || '[]');
      const nuevoProf: Profesor = {
        ...profesor,
        id: profesores.length > 0 ? Math.max(...profesores.map((p: any) => p.id)) + 1 : 1,
      };
      profesores.push(nuevoProf);
      localStorage.setItem('eg_profesores', JSON.stringify(profesores));
      return nuevoProf;
    };

    return apiCall<Profesor>('/profesores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profesor)
    }, fallback);
  },

  // ══════════════ ALUMNOS ══════════════
  async obtenerAlumnos(): Promise<Alumno[]> {
    return apiCall<Alumno[]>('/alumnos', undefined, () => {
      return JSON.parse(localStorage.getItem('eg_alumnos') || '[]');
    });
  },

  async crearAlumno(alumno: Omit<Alumno, 'id'>): Promise<Alumno> {
    const fallback = () => {
      const alumnos = JSON.parse(localStorage.getItem('eg_alumnos') || '[]');
      const nuevoAlu: Alumno = {
        ...alumno,
        id: alumnos.length > 0 ? Math.max(...alumnos.map((a: any) => a.id)) + 1 : 1,
      };
      alumnos.push(nuevoAlu);
      localStorage.setItem('eg_alumnos', JSON.stringify(alumnos));
      return nuevoAlu;
    };

    return apiCall<Alumno>('/alumnos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alumno)
    }, fallback);
  },

  // ══════════════ INSCRIPCIONES ══════════════
  async obtenerInscripciones(): Promise<Inscripcion[]> {
    return apiCall<Inscripcion[]>('/inscripciones', undefined, () => {
      const inscripciones = JSON.parse(localStorage.getItem('eg_inscripciones') || '[]');
      const alumnos = JSON.parse(localStorage.getItem('eg_alumnos') || '[]');
      const cursos = JSON.parse(localStorage.getItem('eg_cursos') || '[]');

      return inscripciones.map((ins: any) => ({
        ...ins,
        alumno: alumnos.find((a: any) => a.id === ins.alumno_id)?.nombre || `Alumno ID: ${ins.alumno_id}`,
        curso: cursos.find((c: any) => c.id === ins.curso_id)?.nombre || `Curso ID: ${ins.curso_id}`,
      }));
    });
  },

  async inscribirAlumno(inc: Omit<Inscripcion, 'id'>): Promise<Inscripcion> {
    const fallback = () => {
      const inscripciones = JSON.parse(localStorage.getItem('eg_inscripciones') || '[]');
      const alumnos = JSON.parse(localStorage.getItem('eg_alumnos') || '[]');
      const cursos = JSON.parse(localStorage.getItem('eg_cursos') || '[]');

      const nuevaInscr: Inscripcion = {
        ...inc,
        id: inscripciones.length > 0 ? Math.max(...inscripciones.map((i: any) => i.id)) + 1 : 1,
        fecha: new Date().toISOString().split('T')[0],
        alumno: alumnos.find((a: any) => a.id === inc.alumno_id)?.nombre || 'Alumno',
        curso: cursos.find((c: any) => c.id === inc.curso_id)?.nombre || 'Curso',
      };
      inscripciones.push(nuevaInscr);
      localStorage.setItem('eg_inscripciones', JSON.stringify(inscripciones));
      return nuevaInscr;
    };

    return apiCall<Inscripcion>('/inscripciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inc)
    }, fallback);
  },

  async eliminarInscripcion(id: number): Promise<{ success: boolean }> {
    const fallback = () => {
      let inscripciones = JSON.parse(localStorage.getItem('eg_inscripciones') || '[]');
      inscripciones = inscripciones.filter((i: any) => i.id !== id);
      localStorage.setItem('eg_inscripciones', JSON.stringify(inscripciones));
      return { success: true };
    };

    return apiCall<{ success: boolean }>(`/inscripciones/${id}`, {
      method: 'DELETE'
    }, fallback);
  }
};
