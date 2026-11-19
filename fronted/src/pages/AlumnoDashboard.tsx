import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  User, 
  CheckCircle, 
  Search, 
  BookOpenCheck,
  Compass,
  ArrowRight,
  Info,
  Calendar,
  FileText,
  Video,
  ExternalLink,
  MessageSquare,
  Award,
  CheckSquare,
  Clock,
  Check,
  X,
  Radio
} from 'lucide-react';
import { Curso, Profesor, Usuario, Inscripcion } from '../types';
import { ClaseEnVivoEstado, escucharClaseEnVivo } from '../utils/claseEnVivo';

interface AlumnoDashboardProps {
  user: Usuario;
  cursos: Curso[];
  profesores: Profesor[];
  inscripciones: Inscripcion[];
  currentTab: string; // 'mis-cursos' or 'explorar'
  onInscribir: (alumno_id: number, curso_id: number) => Promise<void>;
}

export function AlumnoDashboard({
  user,
  cursos,
  profesores,
  inscripciones,
  currentTab,
  onInscribir
}: AlumnoDashboardProps) {

  // Alumno ID logueado
  const alumnoId = user.id || 1;

  // Filtrar cursos en los que ya está inscripto este alumno
  const misInscripciones = inscripciones.filter(i => i.alumno_id === alumnoId);
  const misCursosCargados = misInscripciones.map(i => {
    return cursos.find(c => c.id === i.curso_id);
  }).filter((c): c is Curso => !!c);

  // Filtrar cursos disponibles
  const cursosDisponibles = cursos.filter(c => 
    !misInscripciones.some(i => i.curso_id === c.id)
  );

  // Estados de visualización de detalles
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [subTabModal, setSubTabModal] = useState<'en-vivo' | 'syllabus' | 'notas' | 'asistencias' | 'materiales'>('notas');
  const [claseEnVivo, setClaseEnVivo] = useState<ClaseEnVivoEstado | null>(null);
  const [unidoAlVivo, setUnidoAlVivo] = useState(false);
  const [segundosAlumno, setSegundosAlumno] = useState(0);

  // Datos simulados de syllabus de clases
  const syllabusGenerico = [
    { nro: "Sección 1", clases: ["Introducción al ecosistema y configuración de entorno", "Sintaxis declarativa contra programación estructurada"] },
    { nro: "Sección 2", clases: ["Manejo del estado reactivo y pasaje de propiedades", "Buenas prácticas y modularización de vistas"] },
    { nro: "Sección 3", clases: ["Peticiones HTTP con fetch y conexión a bases de datos", "Presentación y defensa práctica del proyecto final"] }
  ];

  // Notas, asistencias y materiales cargados por los profesores
  const [alumnoNotas, setAlumnoNotas] = useState<Array<{ evaluacion: string; nota: string; observacion: string }>>([]);
  const [alumnoAsistencias, setAlumnoAsistencias] = useState<Array<{ fecha: string; estado: string }>>([]);
  const [materialesCurso, setMaterialesCurso] = useState<any[]>([]);

  useEffect(() => {
    if (!cursoSeleccionado) return;
    try {
      // 1. Notas del alumno en este curso
      const guardadasNotas = localStorage.getItem('edugestor_notas');
      if (guardadasNotas) {
        const parsed = JSON.parse(guardadasNotas);
        const lista: Array<{ evaluacion: string; nota: string; observacion: string }> = [];
        Object.keys(parsed).forEach(key => {
          if (key.startsWith(`${cursoSeleccionado.id}_`)) {
            const evaluacion = key.split('_').slice(1).join('_');
            const notaAlumno = parsed[key][alumnoId];
            if (notaAlumno && (notaAlumno.nota || notaAlumno.observacion)) {
              lista.push({
                evaluacion,
                nota: notaAlumno.nota,
                observacion: notaAlumno.observacion || ''
              });
            }
          }
        });
        setAlumnoNotas(lista);
      }

      // 2. Asistencias del alumno en este curso
      const guardadasAsist = localStorage.getItem('edugestor_asistencias');
      if (guardadasAsist) {
        const parsed = JSON.parse(guardadasAsist);
        const listaAsist: Array<{ fecha: string; estado: string }> = [];
        Object.keys(parsed).forEach(key => {
          if (key.startsWith(`${cursoSeleccionado.id}_`)) {
            const fecha = key.split('_').slice(1).join('_');
            const estado = parsed[key][alumnoId];
            if (estado) {
              listaAsist.push({ fecha, estado });
            }
          }
        });
        setAlumnoAsistencias(listaAsist);
      }

      // 3. Materiales publicados en este curso
      const guardadosMats = localStorage.getItem('edugestor_materiales');
      if (guardadosMats) {
        const parsed = JSON.parse(guardadosMats);
        setMaterialesCurso(parsed.filter((m: any) => m.cursoId === cursoSeleccionado.id));
      }
    } catch {
      // Fallback
    }
  }, [cursoSeleccionado, alumnoId]);

  useEffect(() => {
    return escucharClaseEnVivo((estado) => {
      setClaseEnVivo(estado);
      if (!estado) setUnidoAlVivo(false);
    });
  }, []);

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval> | null = null;
    if (unidoAlVivo && claseEnVivo?.activa) {
      intervalo = setInterval(() => setSegundosAlumno((s) => s + 1), 1000);
    } else {
      setSegundosAlumno(0);
    }
    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [unidoAlVivo, claseEnVivo?.activa]);

  const formatoTiempo = (totalSegundos: number) => {
    const hrs = Math.floor(totalSegundos / 3600);
    const mins = Math.floor((totalSegundos % 3600) / 60);
    const segs = totalSegundos % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const claseVivaDelCurso = (cursoId?: number | null) =>
    claseEnVivo?.activa && cursoId && claseEnVivo.cursoId === cursoId ? claseEnVivo : null;

  const misCursosEnVivo = misCursosCargados.filter((c) => claseVivaDelCurso(c.id));

  const abrirAulaEnVivo = (curso: Curso) => {
    setCursoSeleccionado(curso);
    setSubTabModal('en-vivo');
    if (claseVivaDelCurso(curso.id)) setUnidoAlVivo(true);
  };

  const renderSalaAlumno = (curso: Curso) => {
    const viva = claseVivaDelCurso(curso.id);
    if (!viva) {
      return (
        <div className="p-8 bg-slate-50 rounded-2xl text-center border border-slate-100">
          <Radio className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No hay clase en vivo ahora</p>
          <p className="text-xs text-slate-400 mt-1">Cuando el profesor inicie la transmisión vas a poder unirte desde acá.</p>
        </div>
      );
    }

    if (!unidoAlVivo) {
      return (
        <div className="p-8 bg-rose-50 rounded-2xl text-center border border-rose-100 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            En vivo
          </span>
          <p className="text-sm font-semibold text-slate-800">Prof. {viva.profesorNombre} está transmitiendo</p>
          <button
            type="button"
            onClick={() => setUnidoAlVivo(true)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
          >
            Unirme a la clase
          </button>
        </div>
      );
    }

    return (
      <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 aspect-video flex flex-col">
        <div className="p-3 flex items-center justify-between text-white">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            EN VIVO
          </span>
          <span className="text-[11px] font-mono text-slate-300">{formatoTiempo(segundosAlumno)}</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          {viva.pantallaCompartida ? (
            <div className="w-full h-full bg-slate-900 rounded-xl border border-white/10 p-4 font-mono text-[11px] text-slate-300">
              <p className="text-slate-400 mb-2">Pantalla compartida por Prof. {viva.profesorNombre}</p>
              <p className="text-violet-400">// {viva.cursoNombre}</p>
              <p><span className="text-indigo-400">class</span> ClaseEnVivo {'{'}</p>
              <p className="pl-4">estado: <span className="text-emerald-400">"transmitiendo"</span>;</p>
              <p>{'}'}</p>
            </div>
          ) : (
            <div className="text-center text-white">
              <div className="w-16 h-16 rounded-full bg-violet-600 mx-auto flex items-center justify-center font-bold text-2xl mb-2">
                {viva.profesorNombre.charAt(0)}
              </div>
              <p className="font-bold">Prof. {viva.profesorNombre}</p>
              <p className="text-xs text-violet-300">{viva.cursoNombre}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Banner del Estudiante */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-800 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
        <div className="relative z-10 max-w-lg">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d5cbfb] bg-white/10 px-3 py-1 rounded-full mb-3.5 inline-block">
            Módulo del Alumno
          </span>
          <h2 className="text-3xl font-bold font-display tracking-tight mb-2">
            ¡Hola, {user.nombre}! 📚
          </h2>
          <p className="text-violet-100/90 text-sm leading-relaxed">
            Bienvenido a tu campus virtual. Aquí puedes consultar tus materias matriculadas, consultar tus notas cargadas por los docentes, tus asistencias y el material multimedia publicado.
          </p>
        </div>
        <div className="absolute right-[-10px] bottom-[-40px] w-72 h-72 bg-white/10 rounded-full blur-[80px]" />
      </div>

      {/* Vista: MIS CURSOS ACTIVOS */}
      {currentTab === 'mis-cursos' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold font-display text-white">Mi Campus Virtual</h3>
            <p className="text-xs text-slate-400">Materias en curso y avance académico para {user.nombre}</p>
          </div>

          {misCursosCargados.length === 0 ? (
            <div className="bg-[#181534] border border-white/5 rounded-3xl p-12 text-center text-slate-400 shadow-xl">
              <GraduationCap className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-base font-semibold text-white mb-2">No estás inscripto en ningún curso aún</p>
              <p className="text-xs text-slate-500 mb-6">Explora el catálogo para agregar asignaturas a tu cursada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {misCursosCargados.map((curso) => {
                const profesor = profesores.find(p => p.id === curso.profesor_id)?.nombre || curso.profesor || 'Sin asignar';
                const inscripcionFecha = misInscripciones.find(i => i.curso_id === curso.id)?.fecha || 'Sin fecha';

                return (
                  <div
                    key={curso.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all"
                  >
                    <div className="h-32 bg-gradient-to-r from-violet-600 to-indigo-700 p-6 flex flex-col justify-between text-white relative">
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {claseVivaDelCurso(curso.id) && (
                          <span className="bg-rose-600 px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-widest animate-pulse">
                            En vivo
                          </span>
                        )}
                        <span className="bg-white/15 px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-widest text-[#ece9ff]">
                          Activo
                        </span>
                      </div>
                      <BookOpenCheck className="w-5 h-5 text-indigo-150" />
                      <h4 className="font-display font-bold text-lg leading-snug truncate pr-12">{curso.nombre}</h4>
                    </div>

                    <div className="p-6">
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2.5 text-slate-700 text-sm">
                          <User className="w-4 h-4 text-violet-500" />
                          <span className="font-medium">Prof. {profesor}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-500 text-xs font-semibold">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Inscripto el: {inscripcionFecha}</span>
                        </div>
                      </div>

                      {claseVivaDelCurso(curso.id) ? (
                        <button
                          onClick={() => abrirAulaEnVivo(curso)}
                          className="w-full bg-rose-600 font-display hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                        >
                          <Radio className="w-4 h-4" />
                          <span>Unirme a la clase en vivo</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setCursoSeleccionado(curso);
                            setSubTabModal('notas');
                          }}
                          className="w-full bg-slate-900 font-display hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 group/btn"
                        >
                          <span>Entrar al aula / Ver Notas</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 duration-150" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {currentTab === 'clase-en-vivo' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold font-display text-white">Clase en vivo</h3>
            <p className="text-xs text-slate-400">Acá ves y te unís a la transmisión que inicia tu profesor</p>
          </div>

          {misCursosEnVivo.length === 0 ? (
            <div className="bg-[#181534] border border-white/5 rounded-3xl p-12 text-center text-slate-400 shadow-xl">
              <Radio className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-base font-semibold text-white mb-2">Ninguna materia está transmitiendo ahora</p>
              <p className="text-xs text-slate-500">Cuando el docente pulse “Iniciar Clase en Vivo”, aparece acá y en la tarjeta del curso.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {misCursosEnVivo.map((curso) => {
                const viva = claseVivaDelCurso(curso.id);
                return (
                  <div key={curso.id} className="bg-[#181534] border border-rose-500/30 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white uppercase">En vivo</span>
                      <span className="text-xs text-slate-400">Prof. {viva?.profesorNombre}</span>
                    </div>
                    <h4 className="font-display font-bold text-lg text-white">{curso.nombre}</h4>
                    <button
                      type="button"
                      onClick={() => abrirAulaEnVivo(curso)}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <Radio className="w-4 h-4" />
                      Entrar a la sala
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Vista: EXPLORAR CURSOS TOTALES (CATÁLOGO) */}
      {currentTab === 'explorar' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold font-display text-white font-display">Oferta de Materias</h3>
            <p className="text-xs text-slate-400">Inscríbete y agrega materias a tu plan de estudios de forma instantánea</p>
          </div>

          {cursosDisponibles.length === 0 ? (
            <div className="bg-[#181534] border border-white/5 rounded-3xl p-12 text-center text-slate-400">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className="text-base font-semibold text-white mb-1">¡Al día!</p>
              <p className="text-xs text-slate-400">Te has matriculado en todos los cursos disponibles en la plataforma.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursosDisponibles.map((curso) => {
                const profesor = profesores.find(p => p.id === curso.profesor_id)?.nombre || curso.profesor || 'Sin asignar';
                return (
                  <div
                    key={curso.id}
                    className="bg-[#181534] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-11 h-11 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-400 mb-6 border border-violet-600/20">
                        <Compass className="w-5.5 h-5.5" />
                      </div>
                      <h4 className="font-display font-bold text-lg text-white mb-2 leading-tight">
                        {curso.nombre}
                      </h4>
                      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                        Aprende sobre {curso.nombre} guiado por docentes del área. Este curso cubre proyectos integrales y prácticas semanales de evaluación.
                      </p>
                      <div className="flex items-center gap-2 border-t border-white/5 pt-4 mb-6 text-slate-300 text-xs font-semibold">
                        <User className="w-4 h-4 text-violet-400" />
                        <span>Prof. {profesor}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCursoSeleccionado(curso);
                          setSubTabModal('syllabus');
                        }}
                        className="py-2.5 px-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        title="Ver detalles"
                      >
                        <Info className="w-4 h-4 text-violet-400" />
                        <span>Info</span>
                      </button>
                      <button
                        onClick={() => onInscribir(alumnoId, curso.id)}
                        className="flex-1 py-2.5 max-w-full bg-violet-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
                      >
                        Inscribirme ahora
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═ POPUP: AULA VIRTUAL DEL ALUMNO (NOTAS, ASISTENCIA, MATERIALES Y SYLLABUS) ═ */}
      {cursoSeleccionado && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100 transform transition-all">
            
            {/* Cabecera del Panel */}
            <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-800 text-white relative">
              <button 
                onClick={() => setCursoSeleccionado(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#dcd6ff] bg-white/10 px-2.5 py-0.5 rounded-full">
                  Campus Alumno
                </span>
                <span className="text-xs text-violet-200 font-mono">ID: #{cursoSeleccionado.id}</span>
              </div>
              <h3 className="font-display font-bold text-2xl leading-snug truncate pr-8">
                {cursoSeleccionado.nombre}
              </h3>
              <p className="text-xs text-violet-200 mt-1">
                Prof. {profesores.find(p => p.id === cursoSeleccionado.profesor_id)?.nombre || cursoSeleccionado.profesor || 'Sin asignar'}
              </p>
            </div>

            {/* Pestañas de Navegación del Aula */}
            <div className="flex border-b border-slate-100 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
              {[
                { id: 'en-vivo', label: 'Clase en Vivo', icon: Radio },
                { id: 'notas', label: 'Mis Calificaciones', icon: Award },
                { id: 'asistencias', label: 'Mis Asistencias', icon: CheckSquare },
                { id: 'materiales', label: 'Materiales de Clase', icon: FileText },
                { id: 'syllabus', label: 'Plan de Estudios', icon: BookOpen }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActiva = subTabModal === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSubTabModal(tab.id as any)}
                    className={`
                      pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 transition-all relative whitespace-nowrap
                      ${isActiva 
                        ? 'text-violet-600 font-bold border-b-2 border-violet-600' 
                        : 'text-slate-500 hover:text-slate-800'
                      }
                    `}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Contenido Dinámico de la Pestaña Seleccionada */}
            <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto">
              
              {subTabModal === 'en-vivo' && cursoSeleccionado && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-sm">Sala de clase en vivo</h4>
                    <p className="text-xs text-slate-500">El alumno entra acá cuando el profesor inicia la transmisión</p>
                  </div>
                  {renderSalaAlumno(cursoSeleccionado)}
                </div>
              )}

              {/* TAB 1: MIS CALIFICACIONES */}
              {subTabModal === 'notas' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-slate-900 text-sm">Boletín de Notas del Curso</h4>
                      <p className="text-xs text-slate-500">Calificaciones oficiales registradas por tu profesor</p>
                    </div>
                  </div>

                  {alumnoNotas.length === 0 ? (
                    <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-500 border border-slate-100">
                      <Award className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">Aún no hay notas cargadas para tu usuario</p>
                      <p className="text-xs text-slate-400 mt-1">El docente registrará las calificaciones tras las instancias de evaluación.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {alumnoNotas.map((n, idx) => {
                        const numNota = parseFloat(n.nota);
                        let badgeCondicion = { texto: 'Sin calificar', clase: 'bg-slate-100 text-slate-600' };
                        if (!isNaN(numNota)) {
                          if (numNota >= 7) badgeCondicion = { texto: 'Promocionado', clase: 'bg-emerald-100 text-emerald-800' };
                          else if (numNota >= 4) badgeCondicion = { texto: 'Aprobado', clase: 'bg-blue-100 text-blue-800' };
                          else badgeCondicion = { texto: 'Desaprobado', clase: 'bg-rose-100 text-rose-800' };
                        }

                        return (
                          <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-900 text-sm">{n.evaluacion}</h5>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeCondicion.clase}`}>
                                  {badgeCondicion.texto}
                                </span>
                              </div>
                              {n.observacion && (
                                <p className="text-xs text-slate-600 mt-1 italic">
                                  "{n.observacion}"
                                </p>
                              )}
                            </div>

                            <div className="text-right">
                              <span className="text-2xl font-black font-display text-violet-600">{n.nota || '-'}</span>
                              <span className="text-[10px] text-slate-400 block font-semibold">/ 10 Pts</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MIS ASISTENCIAS */}
              {subTabModal === 'asistencias' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-sm">Registro de Asistencia</h4>
                    <p className="text-xs text-slate-500">Presentismo registrado por el docente en clases en vivo y presenciales</p>
                  </div>

                  {alumnoAsistencias.length === 0 ? (
                    <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-500 border border-slate-100">
                      <CheckSquare className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">Aún no se registraron asistencias para tu usuario</p>
                      <p className="text-xs text-slate-400 mt-1">Tu profesor tomará lista durante las clases en vivo.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alumnoAsistencias.map((a, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-700 font-semibold">{a.fecha}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            a.estado === 'presente' ? 'bg-emerald-100 text-emerald-800' :
                            a.estado === 'tarde' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {a.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MATERIALES DE CLASE */}
              {subTabModal === 'materiales' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-sm">Materiales Multimedia y Documentos</h4>
                    <p className="text-xs text-slate-500">Recursos de estudio compartidos por el docente</p>
                  </div>

                  {materialesCurso.length === 0 ? (
                    <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-500 border border-slate-100">
                      <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No hay materiales cargados en este curso</p>
                      <p className="text-xs text-slate-400 mt-1">El profesor subirá videos y guías en PDF próximamente.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {materialesCurso.map((m: any) => (
                        <div key={m.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 rounded-lg bg-violet-100 text-violet-700 shrink-0">
                              {m.tipo === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>
                            <div className="overflow-hidden">
                              <h5 className="font-semibold text-slate-900 text-xs truncate">{m.titulo}</h5>
                              <span className="text-[10px] font-mono text-slate-500">{m.fechaSubida}</span>
                            </div>
                          </div>
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SYLLABUS / PLAN DE ESTUDIOS */}
              {subTabModal === 'syllabus' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cronograma del Plan de Estudios</h4>
                  <div className="space-y-3">
                    {syllabusGenerico.map((unidad, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-3 text-slate-700">
                        <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-slate-900 mb-1">{unidad.nro}</h5>
                          <ul className="space-y-1">
                            {unidad.clases.map((cl, i) => (
                              <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                                <span className="text-violet-500 font-bold">•</span>
                                <span>{cl}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Pie de Receso */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setCursoSeleccionado(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold transition-all hover:bg-slate-800 cursor-pointer"
              >
                Cerrar Aula
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
