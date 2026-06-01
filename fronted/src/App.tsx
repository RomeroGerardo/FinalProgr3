import React, { useState, useEffect } from 'react';
import { Usuario, Curso, Profesor, Alumno, Inscripcion } from './types';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfesorDashboard } from './pages/ProfesorDashboard';
import { AlumnoDashboard } from './pages/AlumnoDashboard';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Session State
  const [user, setUser] = useState<Usuario | null>(null);

  // Database States
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);

  // Navigation States
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentSubTab, setCurrentSubTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notification Toast States
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    // Autocerrar en 4 segundos
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Cargar todos los datos desde el servicio central sincronizado
  const loadAllData = async () => {
    try {
      const [listaCursos, listaProfesores, listaAlumnos, listaInscripciones] = await Promise.all([
        api.obtenerCursos(),
        api.obtenerProfesores(),
        api.obtenerAlumnos(),
        api.obtenerInscripciones()
      ]);

      setCursos(listaCursos);
      setProfesores(listaProfesores);
      setAlumnos(listaAlumnos);
      setInscripciones(listaInscripciones);
    } catch (err) {
      console.error("Error cargando base de datos escolar:", err);
      showToast("Error de comunicación durante la sincronización", "error");
    }
  };

  // Sincronizar listados tras login o de forma reactiva
  useEffect(() => {
    if (user) {
      loadAllData();
      
      // Ajustar inicializaciones automáticas de pestaña por rol
      if (user.rol === 'admin') {
        setCurrentTab('dashboard');
        setCurrentSubTab('dashboard');
      } else if (user.rol === 'profesor') {
        setCurrentTab('dashboard');
      } else if (user.rol === 'alumno') {
        setCurrentTab('mis-cursos');
      }
    }
  }, [user]);

  // Manejador del Inicio de Sesion Exitoso
  const handleLoginSuccess = (usuarioLogueado: Usuario) => {
    setUser(usuarioLogueado);
    showToast(`Sesión activa: Bienvenido, ${usuarioLogueado.nombre}`, "success");
  };

  const handleLogout = () => {
    setUser(null);
    showToast("Sesión finalizada. ¡Hasta luego!");
  };

  // ══════════════ OPERACIONES / MANEJADORES DE CURSOS ══════════════
  
  const handleCrearCurso = async (nombre: string, profesor_id: number) => {
    try {
      const nuevoCurso = await api.crearCurso({ nombre, profesor_id });
      // Insertar en estado local React
      const profNombre = profesores.find(p => p.id === profesor_id)?.nombre || 'Sin asignar';
      setCursos((prev) => [...prev, { ...nuevoCurso, profesor: profNombre }]);
      showToast(`Curso "${nombre}" creado con éxito.`);
    } catch (error) {
       showToast("Error al dar de alta el curso.", "error");
    }
  };

  const handleEditarCurso = async (id: number, nombre: string, profesor_id: number) => {
    try {
      const cursoEditado = await api.editarCurso(id, { nombre, profesor_id });
      const profNombre = profesores.find(p => p.id === profesor_id)?.nombre || 'Sin asignar';
      
      setCursos((prev) => prev.map(c => c.id === id ? { ...cursoEditado, profesor: profNombre } : c));
      showToast("Información del curso actualizada.");
    } catch (error) {
      showToast("Fallo al actualizar el curso.", "error");
    }
  };

  const handleEliminarCurso = async (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar este curso de la plataforma? Esta acción desvinculará las inscripciones asociadas.")) {
      try {
        await api.eliminarCurso(id);
        setCursos((prev) => prev.filter(c => c.id !== id));
        // Desvincular inscripciones locales del curso eliminado
        setInscripciones((prev) => prev.filter(i => i.curso_id !== id));
        showToast("Curso eliminado correctamente.");
      } catch (error) {
        showToast("Error al intentar realizar la baja.", "error");
      }
    }
  };

  // ══════════════ OPERACIONES PROFESORES ══════════════
  
  const handleCrearProfesor = async (nombre: string, email: string) => {
    try {
      const nuevoProf = await api.crearProfesor({ nombre, email });
      setProfesores((prev) => [...prev, nuevoProf]);
      showToast(`Profesor "${nombre}" registrado correctamente.`);
    } catch (err) {
      showToast("Fallo al registrar profesor.", "error");
    }
  };

  // ══════════════ OPERACIONES ALUMNOS E INSCRIPCIONES ══════════════

  const handleCrearAlumno = async (nombre: string, email: string) => {
    try {
      const nuevoAlu = await api.crearAlumno({ nombre, email });
      setAlumnos((prev) => [...prev, nuevoAlu]);
      showToast(`Estudiante "${nombre}" registrado.`);
    } catch (err) {
      showToast("Fallo al registrar alumno.", "error");
    }
  };

  const handleInscribirAlumno = async (alumno_id: number, curso_id: number) => {
    try {
      const nuevaInscr = await api.inscribirAlumno({ alumno_id, curso_id });
      setInscripciones((prev) => [...prev, nuevaInscr]);
      
      const cursoNombre = cursos.find(c => c.id === curso_id)?.nombre || 'Curso';
      showToast(`Inscripción exitosa en: ${cursoNombre}`, "success");
    } catch (err) {
      showToast("Error al procesar la matrícula.", "error");
    }
  };

  const handleEliminarInscripcion = async (id: number) => {
    if (window.confirm("¿Deseas dar de baja esta asignación de matrícula de forma permanente?")) {
      try {
        await api.eliminarInscripcion(id);
        setInscripciones((prev) => prev.filter(i => i.id !== id));
        showToast("Matrícula dada de baja con éxito.");
      } catch (err) {
        showToast("Error al dar de baja la matrícula.", "error");
      }
    }
  };

  // ══════════════ RENDERIZADO CONDICIONAL DE PÁGINAS ══════════════

  const renderActiveWorkbox = () => {
    if (!user) return null;

    switch (user.rol) {
      case 'admin':
        return (
          <AdminDashboard
            cursos={cursos}
            profesores={profesores}
            alumnos={alumnos}
            inscripciones={inscripciones}
            currentSubTab={currentSubTab}
            setCurrentSubTab={setCurrentSubTab}
            onCrearCurso={handleCrearCurso}
            onEditarCurso={handleEditarCurso}
            onEliminarCurso={handleEliminarCurso}
            onCrearProfesor={handleCrearProfesor}
            onCrearAlumno={handleCrearAlumno}
            onInscribir={handleInscribirAlumno}
            onEliminarInscripcion={handleEliminarInscripcion}
          />
        );
      
      case 'profesor':
        return (
          <ProfesorDashboard
            user={user}
            cursos={cursos}
            profesores={profesores}
            inscripciones={inscripciones}
            currentTab={currentTab}
            onCrearCurso={handleCrearCurso}
            onEditarCurso={handleEditarCurso}
            onEliminarCurso={handleEliminarCurso}
          />
        );

      case 'alumno':
        return (
          <AlumnoDashboard
            user={user}
            cursos={cursos}
            profesores={profesores}
            inscripciones={inscripciones}
            currentTab={currentTab}
            onInscribir={handleInscribirAlumno}
          />
        );

      default:
        return (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-white/5 text-slate-400">
            Rol de usuario no identificado. Vuelve a iniciar sesión.
          </div>
        );
    }
  };

  // Traducir dinámicamente el título del navbar en base a las pestañas activas
  const getNavbarTitle = () => {
    if (!user) return '';
    
    if (user.rol === 'admin') {
      if (currentSubTab === 'dashboard') return 'Mesa de Trabajo — Resumen General';
      if (currentSubTab === 'cursos') return 'Gestión de Cursos Académicos';
      if (currentSubTab === 'profesores') return 'Padrón de Docentes Universitarios';
      if (currentSubTab === 'alumnos') return 'Registro de Estudiantes Activos';
      if (currentSubTab === 'inscripciones') return 'Matrículas Escolares en MySQL';
      return 'Panel de Administrador';
    }

    if (user.rol === 'profesor') {
      if (currentTab === 'dashboard') return 'Resumen del Aula Virtual';
      if (currentTab === 'mis-cursos') return 'Mis Asignaturas a Cargo';
      if (currentTab === 'contenido') return 'Sube Videos, Apuntes y Tareas';
      return 'Aula Virtual del Profesor';
    }

    if (user.rol === 'alumno') {
      if (currentTab === 'mis-cursos') return 'Mis Clases Matriculadas';
      if (currentTab === 'explorar') return 'Catálogo de Ofertas Disponibles';
      return 'Campus Virtual Estudiantil';
    }

    return 'EduGestor';
  };

  // Pantalla de LOGIN si no hay sesión abierta
  if (!user) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        {/* Toast Notificador */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`
                fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 max-w-sm
                ${toast.type === 'error' ? 'bg-[#2a131b] text-rose-300 border-rose-500/20' : 
                  toast.type === 'info' ? 'bg-[#131d2e] text-blue-300 border-blue-500/20' : 
                  'bg-[#132a1e] text-emerald-300 border-emerald-500/20'
                }
              `}
            >
              {toast.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <span className="text-xs font-semibold">{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-auto text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Layout de la plataforma de control con Sidebar y Navbar Superior
  return (
    <div className="flex min-h-screen bg-[#0b071e] relative overflow-hidden text-slate-100 font-sans">
      
      {/* 1. Sidebar Lateral */}
      <Sidebar
        user={user}
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          // Si es administrador y selecciona profesores/cursos, etc. sincronizar subTab del Dashboard
          if (user.rol === 'admin') {
            setCurrentSubTab(tab);
          }
        }}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 2. Cuerpo Principal de Contenido */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Navbar Superior */}
        <Navbar
          titulo={getNavbarTitle()}
          onOpenSidebar={() => setSidebarOpen(true)}
          onRefreshData={loadAllData}
        />

        {/* Zona Dinámica Desplazable del Dashboard */}
        <main className="p-5 sm:p-7 md:p-8 max-w-7xl w-full mx-auto flex-1 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab + currentSubTab + user.rol}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {renderActiveWorkbox()}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* 3. Toast Notificador Flotante */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`
              fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 max-w-sm
              ${toast.type === 'error' ? 'bg-[#2a131b] text-rose-300 border-rose-500/20' : 
                toast.type === 'info' ? 'bg-[#131d2e] text-blue-300 border-blue-500/20' : 
                'bg-[#132a1e] text-emerald-300 border-emerald-500/20'
              }
            `}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="text-xs font-semibold">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-auto text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
