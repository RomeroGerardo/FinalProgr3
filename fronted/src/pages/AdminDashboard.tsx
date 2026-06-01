import React, { useState } from 'react';
import { 
  Plus, 
  GraduationCap, 
  BookOpen, 
  Users, 
  CheckSquare, 
  Trash2, 
  Mail, 
  Calendar, 
  Search,
  UserPlus
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
  onCrearProfesor: (nombre: string, email: string) => Promise<void>;
  // Operaciones de Inscripciones/Alumnos
  onCrearAlumno: (nombre: string, email: string) => Promise<void>;
  onInscribir: (alumno_id: number, curso_id: number) => Promise<void>;
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
  onCrearAlumno,
  onInscribir,
  onEliminarInscripcion
}: AdminDashboardProps) {
  
  // Estados de control para Popups/Modales
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [isCursoFormOpen, setIsCursoFormOpen] = useState(false);
  
  // Agregar Profesor
  const [isProfesorFormOpen, setIsProfesorFormOpen] = useState(false);
  const [profNombre, setProfNombre] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profError, setProfError] = useState('');

  // Agregar Alumno
  const [isAlumnoFormOpen, setIsAlumnoFormOpen] = useState(false);
  const [aluNombre, setAluNombre] = useState('');
  const [aluEmail, setAluEmail] = useState('');
  const [aluError, setAluError] = useState('');

  // Nueva Inscripción QuickForm
  const [isInscripcionFormOpen, setIsInscripcionFormOpen] = useState(false);
  const [selAlumnoId, setSelAlumnoId] = useState<number>(0);
  const [selCursoId, setSelCursoId] = useState<number>(0);
  const [insError, setInsError] = useState('');

  // Guardar Curso (Creación / Edición)
  const handleCursoSubmit = async (datos: { nombre: string; profesor_id: number }) => {
    if (cursoEditando) {
      await onEditarCurso(cursoEditando.id, datos.nombre, datos.profesor_id);
    } else {
      await onCrearCurso(datos.nombre, datos.profesor_id);
    }
    setIsCursoFormOpen(false);
    setCursoEditando(null);
  };

  // Crear Profesor Submit
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

    await onCrearProfesor(profNombre.trim(), profEmail.trim());
    setProfNombre('');
    setProfEmail('');
    setIsProfesorFormOpen(false);
  };

  // Crear Alumno Submit
  const handleAlumnoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAluError('');

    if (!aluNombre.trim() || !aluEmail.trim()) {
      setAluError('Todos los campos son obligatorios.');
      return;
    }

    if (!aluEmail.includes('@')) {
      setAluError('Ingresa un correo electrónico válido.');
      return;
    }

    await onCrearAlumno(aluNombre.trim(), aluEmail.trim());
    setAluNombre('');
    setAluEmail('');
    setIsAlumnoFormOpen(false);
  };

  // Inscribir Submit
  const handleInscripcionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInsError('');

    if (!selAlumnoId || selAlumnoId === 0) {
      setInsError('Selecciona un alumno.');
      return;
    }

    if (!selCursoId || selCursoId === 0) {
      setInsError('Selecciona un curso.');
      return;
    }

    // Verificar si ya está inscripto
    const yaInscripto = inscripciones.some(i => i.alumno_id === selAlumnoId && i.curso_id === selCursoId);
    if (yaInscripto) {
      setInsError('El alumno ya está inscripto en este curso.');
      return;
    }

    await onInscribir(selAlumnoId, selCursoId);
    setIsInscripcionFormOpen(false);
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
                  onClick={() => {
                    setCursoEditando(null);
                    setIsCursoFormOpen(true);
                  }}
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
                <button
                  onClick={() => {
                    if (alumnos.length === 0 || cursos.length === 0) {
                      alert('Registra al menos un alumno y un curso antes de crear una inscripción.');
                      return;
                    }
                    setSelAlumnoId(alumnos[0].id);
                    setSelCursoId(cursos[0].id);
                    setIsInscripcionFormOpen(true);
                  }}
                  className="p-1 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/20 transition-all flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Matricular</span>
                </button>
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
                onClick={() => {
                  setCursoEditando(null);
                  setIsCursoFormOpen(true);
                }}
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
                onClick={() => setIsProfesorFormOpen(true)}
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
                {profesores.map((prof) => (
                  <div key={prof.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 text-slate-800">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100/30">
                      {prof.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <h4 className="font-semibold text-slate-900 truncate">{prof.nombre}</h4>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 text-violet-500" />
                        <span>{prof.email}</span>
                      </p>
                      <span className="inline-block mt-1.5 text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Docente ID: {prof.id}
                      </span>
                    </div>
                  </div>
                ))}
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
              <button
                onClick={() => {
                  if (alumnos.length === 0 || cursos.length === 0) {
                    alert('Registra al menos un alumno y un curso antes de crear una inscripción.');
                    return;
                  }
                  setSelAlumnoId(alumnos[0].id);
                  setSelCursoId(cursos[0].id);
                  setIsInscripcionFormOpen(true);
                }}
                className="px-4 py-2.5 bg-violet-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-5 h-5" />
                <span>Matricular Alumno</span>
              </button>
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
              <h3 className="font-display font-bold text-lg text-slate-930">Asistente — Añadir Profesor</h3>
              <button onClick={() => setIsProfesorFormOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus className="w-5 h-5 rotate-45" /></button>
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
              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsProfesorFormOpen(false)} className="px-4 py-2 rounded-xl text-slate-500 border border-slate-200 text-sm font-semibold">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold shadow-md hover:bg-indigo-700">Registrar Docente</button>
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
              <button onClick={() => setIsAlumnoFormOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus className="w-5 h-5 rotate-45" /></button>
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
              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsAlumnoFormOpen(false)} className="px-4 py-2 rounded-xl text-slate-500 border border-slate-200 text-sm font-semibold">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700">Registrar Alumno</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═ MODAL: NUEVA INSCRIPCIÓN / MATRICULA ═ */}
      {isInscripcionFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-display font-bold text-lg text-slate-930">Asistente — Nueva Inscripción (Matrícula)</h3>
              <button onClick={() => setIsInscripcionFormOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <form onSubmit={handleInscripcionSubmit} className="p-6 space-y-4">
              {insError && <div className="p-3 bg-rose-100 text-rose-600 rounded-xl text-xs font-medium">{insError}</div>}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Seleccionar Alumno</label>
                <select
                  value={selAlumnoId}
                  onChange={(e) => setSelAlumnoId(Number(e.target.value))}
                  className="w-full bg-[#fafafd] border border-slate-200 rounded-xl px-4 py-3 text-sm"
                >
                  {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Seleccionar Curso</label>
                <select
                  value={selCursoId}
                  onChange={(e) => setSelCursoId(Number(e.target.value))}
                  className="w-full bg-[#fafafd] border border-slate-200 rounded-xl px-4 py-3 text-sm"
                >
                  {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsInscripcionFormOpen(false)} className="px-4 py-2 rounded-xl text-slate-500 border border-slate-200 text-sm font-semibold">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold shadow-md hover:bg-indigo-700">Asignar Matrícula</button>
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
          onSubmit={handleCursoSubmit}
          onCancel={() => {
            setIsCursoFormOpen(false);
            setCursoEditando(null);
          }}
        />
      )}

    </div>
  );
}
