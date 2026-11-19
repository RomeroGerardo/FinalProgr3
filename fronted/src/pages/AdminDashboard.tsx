import React, { useState } from 'react';
import { 
  Plus, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Trash2, 
  Mail, 
  Calendar, 
  KeyRound,
  Search,
  UserPlus,
  Edit2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Curso, Profesor, Alumno, Inscripcion } from '../types';
import { StatCard } from '../components/StatCard';
import { CursoList } from '../components/CursoList';
import { CursoForm } from '../components/CursoForm';

interface AdminDashboardProps {
  cursos: Curso[];
  profesores: Profesor[];
  alumnos: Alumno[];
  inscripciones: Inscripcion[];
  currentSubTab: string;
  setCurrentSubTab: (tab: string) => void;
  // Operaciones de Cursos
  onCrearCurso: (nombre: string, profesor_id: number) => Promise<void>;
  onEditarCurso: (id: number, nombre: string, profesor_id: number) => Promise<void>;
  onEliminarCurso: (id: number) => Promise<void>;
  // Operaciones de Profesores
  onCrearProfesor: (nombre: string, email: string, password: string) => Promise<boolean>;
  onEditarProfesor: (id: number, nombre: string, email: string) => Promise<boolean>;
  onResetearPasswordProfesor: (id: number, password: string) => Promise<boolean>;
  onEliminarProfesor: (id: number) => Promise<void>;
  // Operaciones de Inscripciones/Alumnos
  onCrearAlumno: (nombre: string, email: string, password: string) => Promise<boolean>;
  onResetearPasswordAlumno: (id: number, password: string) => Promise<boolean>;
  onEliminarAlumno: (id: number) => Promise<void>;
  onEliminarInscripcion: (id: number) => Promise<void>;
}

export function AdminDashboard({
  cursos,
  profesores,
  alumnos,
  inscripciones,
  currentSubTab,
  setCurrentSubTab,
  onCrearCurso,
  onEditarCurso,
  onEliminarCurso,
  onCrearProfesor,
  onEditarProfesor,
  onResetearPasswordProfesor,
  onEliminarProfesor,
  onCrearAlumno,
  onResetearPasswordAlumno,
  onEliminarAlumno,
  onEliminarInscripcion
}: AdminDashboardProps) {
  
  // Estados de control para Popups/Modales
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [isCursoFormOpen, setIsCursoFormOpen] = useState(false);
  const [profesorIdInicial, setProfesorIdInicial] = useState<number | null>(null);
  
  // Agregar / Editar Profesor
  const [isProfesorFormOpen, setIsProfesorFormOpen] = useState(false);
  const [profesorEditando, setProfesorEditando] = useState<Profesor | null>(null);
  const [profNombre, setProfNombre] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profPassword, setProfPassword] = useState('');
  const [profError, setProfError] = useState('');

  // Blanquear contraseña de un profesor
  const [profesorPasswordEditando, setProfesorPasswordEditando] = useState<Profesor | null>(null);
  const [nuevaPasswordProf, setNuevaPasswordProf] = useState('');
  const [passErrorProf, setPassErrorProf] = useState('');

  // Agregar Alumno (con credenciales)
  const [isAlumnoFormOpen, setIsAlumnoFormOpen] = useState(false);
  const [aluNombre, setAluNombre] = useState('');
  const [aluEmail, setAluEmail] = useState('');
  const [aluPassword, setAluPassword] = useState('');
  const [aluError, setAluError] = useState('');

  // Blanquear contraseña de un alumno
  const [alumnoPasswordEditando, setAlumnoPasswordEditando] = useState<Alumno | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [passError, setPassError] = useState('');

  // Guardar Curso (Creación / Edición)
  const handleCursoSubmit = async (datos: { nombre: string; profesor_id: number }) => {
    if (cursoEditando) {
      await onEditarCurso(cursoEditando.id, datos.nombre, datos.profesor_id);
    } else {
      await onCrearCurso(datos.nombre, datos.profesor_id);
    }
    setIsCursoFormOpen(false);
    setCursoEditando(null);
    setProfesorIdInicial(null);
  };

  const abrirNuevoCurso = () => {
    setCursoEditando(null);
    setProfesorIdInicial(null);
    setIsCursoFormOpen(true);
  };

  // Abre el formulario de curso con este profesor ya seleccionado.
  const abrirNuevoCursoPara = (profesorId: number) => {
    setCursoEditando(null);
    setProfesorIdInicial(profesorId);
    setIsCursoFormOpen(true);
  };

  const abrirNuevoProfesor = () => {
    setProfesorEditando(null);
    setProfNombre('');
    setProfEmail('');
    setProfPassword('');
    setProfError('');
    setIsProfesorFormOpen(true);
  };

  const abrirEdicionProfesor = (prof: Profesor) => {
    setProfesorEditando(prof);
    setProfNombre(prof.nombre);
    setProfEmail(prof.email);
    setProfPassword('');
    setProfError('');
    setIsProfesorFormOpen(true);
  };

  // Crear / Editar Profesor Submit
  const handleProfesorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfError('');

    if (!profNombre.trim() || !profEmail.trim()) {
      setProfError('Todos los campos son obligatorios.');
      return;
    }

    if (!profEmail.includes('@')) {
      setProfError('Ingresa un correo electrónico válido.');
      return;
    }

    if (!profesorEditando) {
      if (!profPassword.trim()) {
        setProfError('La contraseña es obligatoria.');
        return;
      }
      if (profPassword.trim().length < 4) {
        setProfError('La contraseña debe tener al menos 4 caracteres.');
        return;
      }
    }

    const guardado = profesorEditando
      ? await onEditarProfesor(profesorEditando.id, profNombre.trim(), profEmail.trim())
      : await onCrearProfesor(profNombre.trim(), profEmail.trim(), profPassword.trim());

    // Si falló, App ya mostró el toast con el motivo: se deja el modal abierto.
    if (!guardado) return;

    setProfNombre('');
    setProfEmail('');
    setProfPassword('');
    setProfesorEditando(null);
    setIsProfesorFormOpen(false);
  };

  // Blanquear contraseña de profesor Submit
  const handlePasswordProfesorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorProf('');

    if (!nuevaPasswordProf.trim()) {
      setPassErrorProf('Ingresa la nueva contraseña.');
      return;
    }

    if (nuevaPasswordProf.trim().length < 4) {
      setPassErrorProf('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (!profesorPasswordEditando) return;

    const actualizado = await onResetearPasswordProfesor(profesorPasswordEditando.id, nuevaPasswordProf.trim());
    if (!actualizado) return;

    setNuevaPasswordProf('');
    setProfesorPasswordEditando(null);
  };

  // Crear Alumno Submit (S1: nombre, email y contraseña)
  const handleAlumnoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAluError('');

    if (!aluNombre.trim() || !aluEmail.trim() || !aluPassword.trim()) {
      setAluError('Nombre, email y contraseña son obligatorios.');
      return;
    }

    if (!aluEmail.includes('@')) {
      setAluError('Ingresa un correo electrónico válido.');
      return;
    }

    if (aluPassword.trim().length < 4) {
      setAluError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    const creado = await onCrearAlumno(aluNombre.trim(), aluEmail.trim(), aluPassword.trim());

    // Si falló (por ejemplo email duplicado), App ya mostró el motivo.
    if (!creado) return;

    setAluNombre('');
    setAluEmail('');
    setAluPassword('');
    setIsAlumnoFormOpen(false);
  };

  // Blanquear contraseña Submit (S2)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (!nuevaPassword.trim()) {
      setPassError('Ingresa la nueva contraseña.');
      return;
    }

    if (nuevaPassword.trim().length < 4) {
      setPassError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (!alumnoPasswordEditando) return;

    const actualizado = await onResetearPasswordAlumno(alumnoPasswordEditando.id, nuevaPassword.trim());
    if (!actualizado) return;

    setNuevaPassword('');
    setAlumnoPasswordEditando(null);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Tarjetas de Estadísticas del Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          titulo="Profesores"
          valor={profesores.length}
          iconName="GraduationCap"
          trend="Docentes"
          trendType="neutral"
          accentColor="indigo"
        />
        <StatCard
          titulo="Cursos"
          valor={cursos.length}
          iconName="BookOpen"
          trend="Catálogo"
          trendType="neutral"
          accentColor="blue"
        />
        <StatCard
          titulo="Alumnos"
          valor={alumnos.length}
          iconName="Users"
          trend="Estudiantes"
          trendType="neutral"
          accentColor="emerald"
        />
        <StatCard
          titulo="Inscripciones"
          valor={inscripciones.length}
          iconName="CheckSquare"
          trend="Totales"
          trendType="neutral"
          accentColor="amber"
        />
      </div>

      {/* 2. Barra de Navegación de Pestañas Secundarias (SubTabs) */}
      <div className="flex border-b border-white/5 space-x-6">
        {[
          { id: 'dashboard', label: 'Dashboard General' },
          { id: 'cursos', label: 'Cursos' },
          { id: 'profesores', label: 'Profesores' },
          { id: 'alumnos', label: 'Alumnos' },
          { id: 'inscripciones', label: 'Inscripciones Registradas' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentSubTab(tab.id)}
            className={`
              pb-4 text-sm font-semibold transition-all relative
              ${currentSubTab === tab.id 
                ? 'text-violet-400 font-bold' 
                : 'text-slate-400 hover:text-white'
              }
            `}
          >
            {tab.label}
            {currentSubTab === tab.id && (
              <motion.div 
                layoutId="activeSubTabIndicator" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" 
              />
            )}
          </button>
        ))}
      </div>

      {/* 3. Panel de Contenido Dinámico */}
      <div className="space-y-6">
        
        {/* PESTAÑA: DASHBOARD GENERAL */}
        {currentSubTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Lista Resumen de Últimos Cursos Creados */}
            <div className="lg:col-span-2 bg-[#181534] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h4 className="font-display font-medium text-white">Cursos Recientes</h4>
                  <p className="text-xs text-slate-400">Últimos programas formativos añadidos en el catálogo</p>
                </div>
                <button
                  onClick={abrirNuevoCurso}
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Curso</span>
                </button>
              </div>

              {cursos.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No hay cursos registrados en este momento.</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {cursos.slice(-4).reverse().map((c) => {
                    const prof = profesores.find(p => p.id === c.profesor_id)?.nombre || c.profesor || 'Sin asignar';
                    return (
                      <div key={c.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 ml-1 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                            <BookOpen className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{c.nombre}</p>
                            <p className="text-xs text-slate-400">Prof. {prof}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500">ID: {c.id}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Listado de Últimas Inscripciones */}
            <div className="bg-[#181534] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h4 className="font-display font-medium text-white">Últimas Inscripciones</h4>
                  <p className="text-xs text-slate-400">Nuevos registros estudiantiles</p>
                </div>
                {/* S4: los alumnos se inscriben solos desde su panel. */}
                <span className="text-[10px] text-slate-500 text-right leading-tight max-w-[140px]">
                  Los alumnos se inscriben desde su propio panel
                </span>
              </div>

              {inscripciones.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No hay inscripciones registradas aún.</p>
              ) : (
                <div className="space-y-3">
                  {inscripciones.slice(-4).reverse().map((ins) => (
                    <div key={ins.id} className="p-3 bg-[#110d2c]/50 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-white tracking-tight">{ins.alumno}</span>
                        <span className="text-[9px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full font-bold">Activo</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{ins.curso}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* PESTAÑA: SECCIÓN CURSOS (ADMIN) */}
        {currentSubTab === 'cursos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Gestión Integral de Cursos</h3>
                <p className="text-xs text-slate-400">Crear, actualizar, asignar docentes y eliminar cursos del sistema académico</p>
              </div>
              <button
                onClick={abrirNuevoCurso}
                className="px-4 py-2.5 bg-violet-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Nuevo Curso</span>
              </button>
            </div>

            <CursoList
              cursos={cursos}
              profesores={profesores}
              incripciones={inscripciones}
              canEdit={true}
              onEdit={(curso) => {
                setCursoEditando(curso);
                setIsCursoFormOpen(true);
              }}
              onDelete={onEliminarCurso}
              rol="admin"
            />
          </div>
        )}

        {/* PESTAÑA: SECCIÓN PROFESORES (ADMIN) */}
        {currentSubTab === 'profesores' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Registro de Profesores</h3>
                <p className="text-xs text-slate-400">Gestores de contenido y tutores universitarios</p>
              </div>
              <button
                onClick={abrirNuevoProfesor}
                className="px-4 py-2.5 bg-violet-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-5 h-5" />
                <span>Agregar Profesor</span>
              </button>
            </div>

            {profesores.length === 0 ? (
              <div className="bg-[#181534]/50 border border-white/5 rounded-2xl p-12 text-center text-slate-400">
                <GraduationCap className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-base font-semibold text-white mb-1">No hay profesores cargados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {profesores.map((prof) => {
                  const materias = cursos.filter((c) => c.profesor_id === prof.id);
                  return (
                    <div
                      key={prof.id}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col text-slate-800 overflow-hidden"
                    >
                      <div className="p-5 flex items-start gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100/30">
                          {prof.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden flex-1">
                          <h4 className="font-semibold text-slate-900 truncate">{prof.nombre}</h4>
                          <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 text-violet-500 shrink-0" />
                            <span>{prof.email}</span>
                          </p>
                          <span className="inline-block mt-1.5 text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Docente ID: {prof.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setProfesorPasswordEditando(prof);
                              setNuevaPasswordProf('');
                              setPassErrorProf('');
                            }}
                            className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                            title="Blanquear contraseña"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => abrirEdicionProfesor(prof)}
                            className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                            title="Editar profesor"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEliminarProfesor(prof.id)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                            title="Eliminar profesor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="px-5 pb-5 mt-auto">
                        <div className="pt-3 border-t border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Materias asignadas ({materias.length})
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {materias.length === 0 ? (
                              <span className="text-xs text-slate-400 italic">Sin materias asignadas</span>
                            ) : (
                              materias.map((c) => (
                                <span
                                  key={c.id}
                                  className="text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-100 px-2 py-1 rounded-lg"
                                >
                                  {c.nombre}
                                </span>
                              ))
                            )}
                            <button
                              onClick={() => abrirNuevoCursoPara(prof.id)}
                              className="text-[10px] font-bold text-violet-600 hover:text-violet-800 border border-dashed border-violet-300 hover:border-violet-500 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                              title="Crea un curso y lo asigna a este profesor"
                            >
                              <Plus className="w-3 h-3" />
                              Asignar materia
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: SECCIÓN ALUMNOS (ADMIN) */}
        {currentSubTab === 'alumnos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Padrón de Alumnos</h3>
                <p className="text-xs text-slate-400">Estudiantes matriculados activos en la plataforma</p>
              </div>
              <button
                onClick={() => setIsAlumnoFormOpen(true)}
                className="px-4 py-2.5 bg-violet-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-5 h-5" />
                <span>Registrar Alumno</span>
              </button>
            </div>

            {alumnos.length === 0 ? (
              <div className="bg-[#181534]/50 border border-white/5 rounded-2xl p-12 text-center text-slate-400">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-base font-semibold text-white mb-1">No hay alumnos incriptos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {alumnos.map((a) => (
                  <div key={a.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 text-slate-800">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100/30">
                      {a.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <h4 className="font-semibold text-slate-900 truncate">{a.nombre}</h4>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 text-emerald-500" />
                        <span>{a.email}</span>
                      </p>
                      <span className="inline-block mt-1.5 text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Estudiante ID: {a.id}
                      </span>
                    </div>
                    {/* S2 / S3: blanquear contraseña o eliminar al alumno. */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setAlumnoPasswordEditando(a);
                          setNuevaPassword('');
                          setPassError('');
                        }}
                        className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                        title="Blanquear contraseña"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEliminarAlumno(a.id)}
                        className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                        title="Eliminar alumno"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: SECCIÓN INSCRIPCIONES (ADMIN) */}
        {currentSubTab === 'inscripciones' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Inscripciones y Matriculaciones</h3>
                <p className="text-xs text-slate-400">Lista completa de vinculación entre alumnos y su catálogo académico</p>
              </div>
              {/* S4: la matriculación manual del admin ya no existe. */}
              <span className="text-[11px] text-slate-500 text-right leading-tight max-w-[200px]">
                Cada alumno se inscribe desde su panel con sus credenciales
              </span>
            </div>

            {inscripciones.length === 0 ? (
              <div className="bg-[#181534]/50 border border-white/5 rounded-2xl p-12 text-center text-slate-400 font-medium">
                No hay ninguna matrícula registrada aún.
              </div>
            ) : (
              <div className="bg-[#181534] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-white/5">
                        <th className="py-4 px-6">ID Matricula</th>
                        <th className="py-4 px-6">Alumno</th>
                        <th className="py-4 px-6">Curso Asignado</th>
                        <th className="py-4 px-6">Fecha Matriculación</th>
                        <th className="py-4 px-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-white/5">
                      {inscripciones.map((ins) => (
                        <tr key={ins.id} className="hover:bg-white/5 transition-colors text-slate-300">
                          <td className="py-4 px-6 font-mono text-xs text-violet-400 font-bold">#{ins.id}</td>
                          <td className="py-4 px-6 font-semibold text-white">{ins.alumno}</td>
                          <td className="py-4 px-6">{ins.curso}</td>
                          <td className="py-4 px-6 font-mono text-xs text-slate-400 flex items-center gap-2 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-violet-500" />
                            <span>{ins.fecha || 'Sin fecha'}</span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => onEliminarInscripcion(ins.id)}
                              className="p-1 px-3.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 transition-all text-xs font-semibold"
                            >
                              Dar de baja
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ═ MODAL: AGREGAR PROFESOR ═ */}
      {isProfesorFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-display font-bold text-lg text-slate-930">
                {profesorEditando ? 'Editar Profesor' : 'Asistente — Añadir Profesor'}
              </h3>
              <button
                onClick={() => {
                  setIsProfesorFormOpen(false);
                  setProfesorEditando(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleProfesorSubmit} className="p-6 space-y-4">
              {profError && <div className="p-3 bg-rose-100 text-rose-600 rounded-xl text-xs font-medium">{profError}</div>}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={profNombre}
                  onChange={(e) => setProfNombre(e.target.value)}
                  placeholder="Ej: Dra. María González"
                  className="w-full bg-[#fafafd] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Correo Institucional</label>
                <input
                  type="email"
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  placeholder="ejemplo@prof.com"
                  className="w-full bg-[#fafafd] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                  required
                />
              </div>
              {!profesorEditando && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contraseña inicial</label>
                  <input
                    type="text"
                    value={profPassword}
                    onChange={(e) => setProfPassword(e.target.value)}
                    placeholder="mínimo 4 caracteres"
                    className="w-full bg-[#fafafd] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                    required
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    El docente usa este correo y contraseña para entrar. Se las tenés que pasar vos.
                  </p>
                </div>
              )}
              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfesorFormOpen(false);
                    setProfesorEditando(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-500 border border-slate-200 text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold shadow-md hover:bg-indigo-700">
                  {profesorEditando ? 'Guardar Cambios' : 'Registrar Docente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═ MODAL: AGREGAR ALUMNO ═ */}
      {isAlumnoFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-display font-bold text-lg text-slate-930">Asistente — Registrar Estudiante</h3>
              <button
                onClick={() => {
                  setIsAlumnoFormOpen(false);
                  setAluPassword('');
                  setAluError('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAlumnoSubmit} className="p-6 space-y-4">
              {aluError && <div className="p-3 bg-rose-100 text-rose-600 rounded-xl text-xs font-medium">{aluError}</div>}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={aluNombre}
                  onChange={(e) => setAluNombre(e.target.value)}
                  placeholder="Ej: Naomi Soria"
                  className="w-full bg-[#fafafd] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={aluEmail}
                  onChange={(e) => setAluEmail(e.target.value)}
                  placeholder="ejemplo@alumno.com"
                  className="w-full bg-[#fafafd] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contraseña inicial</label>
                <input
                  type="text"
                  value={aluPassword}
                  onChange={(e) => setAluPassword(e.target.value)}
                  placeholder="mínimo 4 caracteres"
                  className="w-full bg-[#fafafd] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                  required
                />
                <p className="mt-1.5 text-[11px] text-slate-500">
                  El alumno usa este correo y contraseña para entrar. Se las tenés que pasar vos.
                </p>
              </div>
              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAlumnoFormOpen(false);
                    setAluPassword('');
                    setAluError('');
                  }}
                  className="px-4 py-2 rounded-xl text-slate-500 border border-slate-200 text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700">Registrar Alumno</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═ MODAL: BLANQUEAR CONTRASEÑA (S2) ═ */}
      {alumnoPasswordEditando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-display font-bold text-lg text-slate-930">Blanquear contraseña</h3>
              <button
                onClick={() => {
                  setAlumnoPasswordEditando(null);
                  setNuevaPassword('');
                  setPassError('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {passError && <div className="p-3 bg-rose-100 text-rose-600 rounded-xl text-xs font-medium">{passError}</div>}
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                Alumno: <span className="font-semibold text-slate-800">{alumnoPasswordEditando.nombre}</span>
                <br />
                {alumnoPasswordEditando.email}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nueva contraseña</label>
                <input
                  type="text"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="mínimo 4 caracteres"
                  className="w-full bg-[#fafafd] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                  required
                />
              </div>
              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAlumnoPasswordEditando(null);
                    setNuevaPassword('');
                    setPassError('');
                  }}
                  className="px-4 py-2 rounded-xl text-slate-500 border border-slate-200 text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-600 text-white text-sm font-bold shadow-md hover:bg-amber-700">
                  Actualizar contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═ MODAL: BLANQUEAR CONTRASEÑA PROFESOR ═ */}
      {profesorPasswordEditando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-display font-bold text-lg text-slate-930">Blanquear contraseña docente</h3>
              <button
                onClick={() => {
                  setProfesorPasswordEditando(null);
                  setNuevaPasswordProf('');
                  setPassErrorProf('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handlePasswordProfesorSubmit} className="p-6 space-y-4">
              {passErrorProf && <div className="p-3 bg-rose-100 text-rose-600 rounded-xl text-xs font-medium">{passErrorProf}</div>}
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                Profesor: <span className="font-semibold text-slate-800">{profesorPasswordEditando.nombre}</span>
                <br />
                {profesorPasswordEditando.email}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nueva contraseña</label>
                <input
                  type="text"
                  value={nuevaPasswordProf}
                  onChange={(e) => setNuevaPasswordProf(e.target.value)}
                  placeholder="mínimo 4 caracteres"
                  className="w-full bg-[#fafafd] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                  required
                />
              </div>
              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProfesorPasswordEditando(null);
                    setNuevaPasswordProf('');
                    setPassErrorProf('');
                  }}
                  className="px-4 py-2 rounded-xl text-slate-500 border border-slate-200 text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-600 text-white text-sm font-bold shadow-md hover:bg-amber-700">
                  Actualizar contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═ MODAL: FORMULARIO CURSOS (MINI-EDITORES) ═ */}
      {isCursoFormOpen && (
        <CursoForm
          curso={cursoEditando}
          profesores={profesores}
          profesorIdInicial={profesorIdInicial}
          onSubmit={handleCursoSubmit}
          onCancel={() => {
            setIsCursoFormOpen(false);
            setCursoEditando(null);
            setProfesorIdInicial(null);
          }}
        />
      )}

    </div>
  );
}
