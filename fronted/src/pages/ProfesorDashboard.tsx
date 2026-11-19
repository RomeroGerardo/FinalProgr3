import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  Video, 
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Trash2, 
  BookMarked, 
  Upload, 
  CheckCircle,
  CheckSquare,
  ExternalLink,
  Calendar,
  Check,
  X,
  Award,
  AlertCircle,
  ArrowLeft,
  UserCheck,
  UserX,
  Clock,
  Users,
  ChevronRight,
  Radio,
  Sparkles,
  Hand,
  Volume2,
  MonitorOff,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Curso, Profesor, Alumno, Inscripcion, Usuario } from '../types';
import { StatCard } from '../components/StatCard';
import { guardarClaseEnVivo, finalizarClaseEnVivoStorage, leerClaseEnVivo } from '../utils/claseEnVivo';

interface ProfesorDashboardProps {
  user: Usuario;
  cursos: Curso[];
  profesores: Profesor[];
  alumnos: Alumno[];
  inscripciones: Inscripcion[];
  currentTab: string; // 'dashboard', 'mis-cursos', or 'contenido'
}

interface Material {
  id: number;
  cursoId: number;
  titulo: string;
  tipo: 'video' | 'pdf' | 'link';
  url: string;
  fechaSubida: string;
}

type EstadoAsistencia = 'presente' | 'ausente' | 'tarde';

interface NotaAlumno {
  nota: string;
  observacion: string;
}

const EVALUACIONES_DEFAULT = [
  'Primer Parcial',
  'Segundo Parcial',
  'Trabajo Práctico Integrador',
  'Examen Final'
];

export function ProfesorDashboard({
  user,
  cursos,
  alumnos,
  inscripciones,
  currentTab
}: ProfesorDashboardProps) {

  // Cursos asignados a este profesor
  const misCursos = cursos.filter(c => c.profesor_id === user.id || c.profesor === user.nombre);

  // Alumnos inscriptos en todos los cursos del docente
  const misAlumnosCount = inscripciones.filter(i => 
    misCursos.some(c => c.id === i.curso_id)
  ).length;

  // Curso actualmente abierto para gestionar
  const [cursoActivoId, setCursoActivoId] = useState<number | null>(() => {
    return misCursos[0]?.id || null;
  });

  useEffect(() => {
    if (cursoActivoId && !misCursos.some(c => c.id === cursoActivoId)) {
      setCursoActivoId(misCursos[0]?.id || null);
    } else if (!cursoActivoId && misCursos.length > 0) {
      setCursoActivoId(misCursos[0].id);
    }
  }, [misCursos, cursoActivoId]);

  // Subpestañas del curso abierto
  const [subTabCurso, setSubTabCurso] = useState<'en-vivo' | 'materiales' | 'asistencias' | 'notas' | 'alumnos'>('en-vivo');

  useEffect(() => {
    if (currentTab === 'contenido') {
      setSubTabCurso('materiales');
    }
  }, [currentTab]);

  // Toast Notificador
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const notificar = (msg: string) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(null), 3500);
  };

  // ══════════════ 1. SIMULADOR DE CLASE EN VIVO ══════════════
  const [claseEnVivoActiva, setClaseEnVivoActiva] = useState(false);
  const [segundosEnVivo, setSegundosEnVivo] = useState(0);
  const [microActivo, setMicroActivo] = useState(true);
  const [camaraActiva, setCamaraActiva] = useState(true);
  const [pantallaCompartida, setPantallaCompartida] = useState(false);
  const [manosLevantadas, setManosLevantadas] = useState<string[]>([]);
  const [alumnoFichaId, setAlumnoFichaId] = useState<number | null>(null);

  // Contador de tiempo de clase en vivo
  useEffect(() => {
    let intervalo: any = null;
    if (claseEnVivoActiva) {
      intervalo = setInterval(() => {
        setSegundosEnVivo(s => s + 1);
      }, 1000);
    } else {
      setSegundosEnVivo(0);
      setManosLevantadas([]);
    }
    return () => clearInterval(intervalo);
  }, [claseEnVivoActiva]);

  // Simular preguntas de alumnos ocasionales durante el vivo
  useEffect(() => {
    if (!claseEnVivoActiva) return;
    const timeout = setTimeout(() => {
      setManosLevantadas(['Ana García']);
    }, 4000);
    return () => clearTimeout(timeout);
  }, [claseEnVivoActiva]);

  const formatoTiempo = (totalSegundos: number) => {
    const hrs = Math.floor(totalSegundos / 3600);
    const mins = Math.floor((totalSegundos % 3600) / 60);
    const segs = totalSegundos % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const publicarEstadoClase = (activa: boolean, compartiendo = pantallaCompartida) => {
    const curso = misCursos.find(c => c.id === cursoActivoId);
    if (!activa || !curso) {
      finalizarClaseEnVivoStorage();
      return;
    }
    guardarClaseEnVivo({
      activa: true,
      cursoId: curso.id,
      cursoNombre: curso.nombre,
      profesorNombre: user.nombre,
      pantallaCompartida: compartiendo,
      startedAt: Date.now() - segundosEnVivo * 1000
    });
  };

  useEffect(() => {
    const guardada = leerClaseEnVivo();
    if (guardada && guardada.cursoId === cursoActivoId) {
      setClaseEnVivoActiva(true);
      setPantallaCompartida(!!guardada.pantallaCompartida);
      const transcurridos = Math.max(0, Math.floor((Date.now() - guardada.startedAt) / 1000));
      setSegundosEnVivo(transcurridos || 1);
    }
  }, [cursoActivoId]);

  const iniciarClaseEnVivo = () => {
    setClaseEnVivoActiva(true);
    setSegundosEnVivo(1);
    const curso = misCursos.find(c => c.id === cursoActivoId);
    if (curso) {
      guardarClaseEnVivo({
        activa: true,
        cursoId: curso.id,
        cursoNombre: curso.nombre,
        profesorNombre: user.nombre,
        pantallaCompartida: false,
        startedAt: Date.now()
      });
    }
    notificar('Transmisión iniciada. Los alumnos ya pueden unirse desde su campus.');
  };

  const finalizarClaseEnVivo = () => {
    setClaseEnVivoActiva(false);
    setPantallaCompartida(false);
    finalizarClaseEnVivoStorage();
    notificar('Clase en vivo terminada. Los alumnos ya no ven la sala.');
  };

  const togglePantallaCompartida = () => {
    if (!claseEnVivoActiva) return;
    const nuevo = !pantallaCompartida;
    setPantallaCompartida(nuevo);
    publicarEstadoClase(true, nuevo);
    notificar(nuevo ? 'Estás compartiendo pantalla.' : 'Dejaste de compartir pantalla.');
  };

  // ══════════════ 2. GESTOR DE MATERIALES ══════════════
  const [materiales, setMateriales] = useState<Material[]>(() => {
    try {
      const guardados = localStorage.getItem('edugestor_materiales');
      if (guardados) return JSON.parse(guardados);
    } catch {
      // Ignorar error de JSON
    }
    return [
      { id: 1, cursoId: 1, titulo: "Clase 01 — Fundamentos y Arquitectura del Sistema", tipo: 'video', url: 'https://youtube.com', fechaSubida: '2026-11-10' },
      { id: 2, cursoId: 1, titulo: "Guía Teórica de Componentes y Estado.pdf", tipo: 'pdf', url: 'https://edugestor.com/docs/guia-teorica.pdf', fechaSubida: '2026-11-12' },
      { id: 3, cursoId: 2, titulo: "Normalización de Bases de Datos Relacionales", tipo: 'video', url: 'https://youtube.com', fechaSubida: '2026-11-14' },
      { id: 4, cursoId: 2, titulo: "Ejercicios Prácticos de SQL DDL y DML.pdf", tipo: 'pdf', url: 'https://edugestor.com/docs/ejercicios-sql.pdf', fechaSubida: '2026-11-15' }
    ];
  });

  const [nuevoMaterialTitulo, setNuevoMaterialTitulo] = useState('');
  const [nuevoMaterialTipo, setNuevoMaterialTipo] = useState<'video' | 'pdf' | 'link'>('video');
  const [nuevoMaterialUrl, setNuevoMaterialUrl] = useState('');
  const [subiendoMaterial, setSubiendoMaterial] = useState(false);

  const handleSubirMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMaterialTitulo.trim() || !cursoActivoId) return;

    setSubiendoMaterial(true);
    setTimeout(() => {
      const nuevo: Material = {
        id: Date.now(),
        cursoId: cursoActivoId,
        titulo: nuevoMaterialTitulo.trim(),
        tipo: nuevoMaterialTipo,
        url: nuevoMaterialUrl.trim() || (nuevoMaterialTipo === 'video' ? 'https://youtube.com' : 'https://edugestor.com/recurso.pdf'),
        fechaSubida: new Date().toISOString().split('T')[0]
      };

      const actualizados = [nuevo, ...materiales];
      setMateriales(actualizados);
      try {
        localStorage.setItem('edugestor_materiales', JSON.stringify(actualizados));
      } catch {
        // Fallback
      }

      setNuevoMaterialTitulo('');
      setNuevoMaterialUrl('');
      setSubiendoMaterial(false);
      notificar(`Material "${nuevo.titulo}" publicado con éxito.`);
    }, 250);
  };

  const handleEliminarMaterial = (id: number) => {
    const actualizados = materiales.filter(m => m.id !== id);
    setMateriales(actualizados);
    try {
      localStorage.setItem('edugestor_materiales', JSON.stringify(actualizados));
    } catch {
      // Fallback
    }
    notificar('Material eliminado del curso.');
  };

  // ══════════════ 3. GESTOR DE ASISTENCIAS ══════════════
  const [fechaAsistencia, setFechaAsistencia] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Estructura: { [`${cursoId}_${fecha}`]: { [alumnoId]: 'presente' | 'ausente' | 'tarde' } }
  const [asistenciasMap, setAsistenciasMap] = useState<Record<string, Record<number, EstadoAsistencia>>>(() => {
    try {
      const guardadas = localStorage.getItem('edugestor_asistencias');
      if (guardadas) return JSON.parse(guardadas);
    } catch {
      // Ignorar error
    }
    return {};
  });

  const claveAsistencia = cursoActivoId ? `${cursoActivoId}_${fechaAsistencia}` : '';
  const asistenciasDelDia = (claveAsistencia && asistenciasMap[claveAsistencia]) || {};

  const handleCambiarAsistencia = (alumnoId: number, estado: EstadoAsistencia) => {
    if (!cursoActivoId) return;
    setAsistenciasMap(prevMap => {
      const diaActual = prevMap[claveAsistencia] || {};
      const nuevoMap = {
        ...prevMap,
        [claveAsistencia]: {
          ...diaActual,
          [alumnoId]: estado
        }
      };
      try {
        localStorage.setItem('edugestor_asistencias', JSON.stringify(nuevoMap));
      } catch {
        // Fallback
      }
      return nuevoMap;
    });
  };

  const handleMarcarTodos = (estado: EstadoAsistencia) => {
    if (!cursoActivoId) return;
    const inscritos = inscripciones.filter(i => i.curso_id === cursoActivoId);
    const nuevoDia: Record<number, EstadoAsistencia> = {};
    inscritos.forEach(i => {
      nuevoDia[i.alumno_id] = estado;
    });

    setAsistenciasMap(prevMap => {
      const nuevoMap = {
        ...prevMap,
        [claveAsistencia]: nuevoDia
      };
      try {
        localStorage.setItem('edugestor_asistencias', JSON.stringify(nuevoMap));
      } catch {
        // Fallback
      }
      return nuevoMap;
    });
    notificar(`Se marcaron todos los alumnos como ${estado}s para el ${fechaAsistencia}.`);
  };

  const guardarAsistenciasManual = () => {
    try {
      localStorage.setItem('edugestor_asistencias', JSON.stringify(asistenciasMap));
      notificar(`Asistencia del ${fechaAsistencia} guardada y confirmada.`);
    } catch {
      notificar('Error al guardar asistencias.');
    }
  };

  // ══════════════ 4. GESTOR DE NOTAS Y CALIFICACIONES (PERSISTENTES) ══════════════
  const [evaluacionActiva, setEvaluacionActiva] = useState<string>('Primer Parcial');

  // Estructura: { [`${cursoId}_${evaluacion}`]: { [alumnoId]: { nota: string, observacion: string } } }
  const [notasMap, setNotasMap] = useState<Record<string, Record<number, NotaAlumno>>>(() => {
    try {
      const guardadas = localStorage.getItem('edugestor_notas');
      if (guardadas) return JSON.parse(guardadas);
    } catch {
      // Ignorar error
    }
    // Datos iniciales demostrativos para que no arranque vacío
    return {
      "1_Primer Parcial": {
        1: { nota: "9", observacion: "Excelente desempeño y puntualidad" },
        2: { nota: "6.5", observacion: "Buen examen, reforzar diagramas" },
        6: { nota: "8", observacion: "Gran defensa práctica" }
      }
    };
  });

  const claveNotas = cursoActivoId ? `${cursoActivoId}_${evaluacionActiva}` : '';
  const notasDeEvaluacion = (claveNotas && notasMap[claveNotas]) || {};

  const handleNotaChange = (alumnoId: number, nota: string) => {
    if (!cursoActivoId) return;
    setNotasMap(prevMap => {
      const evaluacionActual = prevMap[claveNotas] || {};
      const alumnoActual = evaluacionActual[alumnoId] || { nota: '', observacion: '' };
      const nuevoMap = {
        ...prevMap,
        [claveNotas]: {
          ...evaluacionActual,
          [alumnoId]: { ...alumnoActual, nota }
        }
      };
      try {
        localStorage.setItem('edugestor_notas', JSON.stringify(nuevoMap));
      } catch (err) {
        console.error("Error guardando notas:", err);
      }
      return nuevoMap;
    });
  };

  const handleObservacionChange = (alumnoId: number, observacion: string) => {
    if (!cursoActivoId) return;
    setNotasMap(prevMap => {
      const evaluacionActual = prevMap[claveNotas] || {};
      const alumnoActual = evaluacionActual[alumnoId] || { nota: '', observacion: '' };
      const nuevoMap = {
        ...prevMap,
        [claveNotas]: {
          ...evaluacionActual,
          [alumnoId]: { ...alumnoActual, observacion }
        }
      };
      try {
        localStorage.setItem('edugestor_notas', JSON.stringify(nuevoMap));
      } catch (err) {
        console.error("Error guardando observacion:", err);
      }
      return nuevoMap;
    });
  };

  const handleGuardarNotas = () => {
    try {
      localStorage.setItem('edugestor_notas', JSON.stringify(notasMap));
      notificar(`✓ Calificaciones de "${evaluacionActiva}" guardadas en el sistema permanentemente.`);
    } catch {
      notificar('Error al guardar calificaciones.');
    }
  };

  // Curso actualmente activo
  const cursoActivo = misCursos.find(c => c.id === cursoActivoId) || null;

  // Inscripciones del curso activo
  const inscripcionesCursoActivo = cursoActivoId 
    ? inscripciones.filter(i => i.curso_id === cursoActivoId)
    : [];

  // Materiales del curso activo
  const materialesCursoActivo = cursoActivoId
    ? materiales.filter(m => m.cursoId === cursoActivoId)
    : [];

  const obtenerFichaAlumno = (alumnoId: number) => {
    const alumnoObj = alumnos.find(a => a.id === alumnoId);
    const inscripcion = inscripcionesCursoActivo.find(i => i.alumno_id === alumnoId);
    const nombre = inscripcion?.alumno || alumnoObj?.nombre || `Estudiante #${alumnoId}`;

    const notas: Array<{ evaluacion: string; nota: string; observacion: string; condicion: string }> = [];
    Object.keys(notasMap).forEach(key => {
      if (!cursoActivoId || !key.startsWith(`${cursoActivoId}_`)) return;
      const evaluacion = key.split('_').slice(1).join('_');
      const data = notasMap[key][alumnoId];
      if (!data || !data.nota) return;
      const num = parseFloat(data.nota);
      let condicion = 'Sin calificar';
      if (!isNaN(num)) {
        if (num >= 7) condicion = 'Promocionado';
        else if (num >= 4) condicion = 'Aprobado';
        else condicion = 'Desaprobado';
      }
      notas.push({ evaluacion, nota: data.nota, observacion: data.observacion || '', condicion });
    });

    const asistencias: Array<{ fecha: string; estado: EstadoAsistencia }> = [];
    Object.keys(asistenciasMap).forEach(key => {
      if (!cursoActivoId || !key.startsWith(`${cursoActivoId}_`)) return;
      const estado = asistenciasMap[key][alumnoId];
      if (!estado) return;
      asistencias.push({ fecha: key.split('_').slice(1).join('_'), estado });
    });

    const nums = notas.map(n => parseFloat(n.nota)).filter(n => !isNaN(n));
    const promedio = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    const presentes = asistencias.filter(a => a.estado === 'presente' || a.estado === 'tarde').length;
    const pctAsistencia = asistencias.length ? Math.round((presentes / asistencias.length) * 100) : null;

    let condicionFinal = 'Sin calificar';
    if (pctAsistencia !== null && pctAsistencia < 75) condicionFinal = 'Libre';
    else if (promedio !== null) {
      if (promedio >= 7) condicionFinal = 'Promocionado';
      else if (promedio >= 4) condicionFinal = 'Regular';
      else condicionFinal = 'Desaprobado';
    }

    return {
      nombre,
      email: alumnoObj?.email || 'alumno@mail.com',
      notas,
      asistencias,
      promedio,
      pctAsistencia,
      condicionFinal
    };
  };

  const fichaAlumno = alumnoFichaId ? obtenerFichaAlumno(alumnoFichaId) : null;

  return (
    <div className="space-y-8">
      
      {/* Banner de Bienvenida Personalizado */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-800 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d5cbfb] bg-white/10 px-3 py-1 rounded-full mb-3.5 inline-block">
            Módulo del Docente
          </span>
          <h2 className="text-3xl font-bold font-display tracking-tight mb-2">
            ¡Hola, {user.nombre}! 👋
          </h2>
          <p className="text-violet-100/90 text-sm leading-relaxed">
            Aquí gestionas tus cursos asignados por la administración. Puedes simular clases en vivo con pase de asistencia en tiempo real, subir material multimedia y registrar calificaciones de forma permanente.
          </p>
        </div>
        <div className="absolute right-[-10px] bottom-[-40px] w-72 h-72 bg-white/10 rounded-full blur-[80px]" />
      </div>

      {/* Toast Notificador Local */}
      <AnimatePresence>
        {mensajeExito && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mensajeExito}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de KPIs del Profesor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          titulo="Mis Cursos Asignados"
          valor={misCursos.length}
          iconName="BookOpen"
          trend="Asignados por Admin"
          trendType="neutral"
          accentColor="indigo"
        />
        <StatCard
          titulo="Alumnos en mis Cursos"
          valor={misAlumnosCount}
          iconName="Users"
          trend="Matriculados"
          trendType="positive"
          accentColor="emerald"
        />
        <StatCard
          titulo="Materiales Publicados"
          valor={materiales.filter(m => misCursos.some(c => c.id === m.cursoId)).length}
          iconName="FileText"
          trend="Recursos activos"
          trendType="neutral"
          accentColor="blue"
        />
      </div>

      {/* ═ SELECCIÓN O DETALLE DEL CURSO ═ */}
      {misCursos.length === 0 ? (
        <div className="bg-[#181534] border border-white/5 rounded-3xl p-12 text-center text-slate-400">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-base font-semibold text-white mb-1">No tienes cursos asignados aún</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            El administrador del instituto debe darte de alta en una materia desde su panel de gestión para que puedas comenzar a gestionar el aula virtual.
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ═ TARJETAS DE CURSOS ASIGNADOS ═ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Mis Cursos Asignados</h3>
                <p className="text-xs text-slate-400">Abre un curso para simular clase en vivo, tomar asistencias y calificar</p>
              </div>
              <span className="text-xs text-slate-400 font-semibold bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                {misCursos.length} materia{misCursos.length !== 1 ? 's' : ''} a cargo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {misCursos.map((curso) => {
                const countAlumnos = inscripciones.filter(i => i.curso_id === curso.id).length;
                const countMats = materiales.filter(m => m.cursoId === curso.id).length;
                const estaActivo = cursoActivoId === curso.id;

                return (
                  <motion.div
                    key={curso.id}
                    layoutId={`prof-curso-${curso.id}`}
                    className={`
                      rounded-2xl overflow-hidden shadow-md flex flex-col justify-between border transition-all cursor-pointer
                      ${estaActivo 
                        ? 'bg-[#1e1a42] border-violet-500 shadow-violet-500/10' 
                        : 'bg-[#181534] border-white/5 hover:border-violet-500/40 hover:bg-[#1b173c]'
                      }
                    `}
                    onClick={() => setCursoActivoId(curso.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
                          estaActivo ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                        }`}>
                          <BookMarked className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                          ID: #{curso.id}
                        </span>
                      </div>

                      <h4 className="text-white font-display font-bold text-lg mb-2 tracking-tight">
                        {curso.nombre}
                      </h4>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{countAlumnos} alumno{countAlumnos !== 1 ? 's' : ''}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{countMats} recurso{countMats !== 1 ? 's' : ''}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        {estaActivo ? 'Curso abierto' : 'Clic para abrir'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCursoActivoId(curso.id);
                        }}
                        className={`
                          px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5
                          ${estaActivo 
                            ? 'bg-violet-600 text-white shadow-md' 
                            : 'bg-white/10 hover:bg-violet-600 text-slate-200 hover:text-white'
                          }
                        `}
                      >
                        <span>{estaActivo ? 'Gestionando' : 'Abrir Curso'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ═ ESPACIO DE TRABAJO DEL CURSO ABIERTO ═ */}
          {cursoActivo && (
            <div className="bg-[#181534] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              {/* Encabezado del Curso Abierto */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-md border border-violet-500/20 flex items-center gap-1.5">
                      {claseEnVivoActiva ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                          <span className="text-rose-400">En Vivo</span>
                        </>
                      ) : (
                        <span>Aula Virtual</span>
                      )}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">ID: #{cursoActivo.id}</span>
                  </div>
                  <h3 className="text-2xl font-bold font-display text-white tracking-tight">
                    {cursoActivo.nombre}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {inscripcionesCursoActivo.length} estudiante{inscripcionesCursoActivo.length !== 1 ? 's' : ''} matriculado{inscripcionesCursoActivo.length !== 1 ? 's' : ''} en esta cátedra
                  </p>
                </div>

                {/* Sub-pestañas de gestión del curso */}
                <div className="flex flex-wrap gap-2 bg-[#110d2c] p-1.5 rounded-2xl border border-white/5">
                  {[
                    { id: 'en-vivo', label: 'Clase en Vivo', icon: Radio, badge: claseEnVivoActiva ? 'LIVE' : undefined },
                    { id: 'materiales', label: 'Material de Clase', icon: FileText },
                    { id: 'asistencias', label: 'Planilla Asistencias', icon: CheckSquare },
                    { id: 'notas', label: 'Cargar Notas', icon: Award },
                    { id: 'alumnos', label: 'Alumnos Inscriptos', icon: Users }
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    const isTabActiva = subTabCurso === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSubTabCurso(tab.id as any)}
                        className={`
                          px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all relative
                          ${isTabActiva
                            ? 'bg-violet-600 text-white shadow-md font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                        <TabIcon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                        {tab.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500 text-white uppercase animate-pulse">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ──────────────────────────────────────────────────────────
                  SUB-PESTAÑA 1: SIMULADOR DE CLASE EN VIVO + ASISTENCIA
                 ────────────────────────────────────────────────────────── */}
              {subTabCurso === 'en-vivo' && (
                <div className="space-y-6">
                  
                  {/* Barra de Control de Transmisión */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#110d2c]/80 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl border ${
                        claseEnVivoActiva ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' : 'bg-slate-500/10 border-white/5 text-slate-400'
                      }`}>
                        <Radio className={`w-6 h-6 ${claseEnVivoActiva ? 'animate-pulse' : ''}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-white text-base">
                            Transmisión en Directo — {cursoActivo.nombre}
                          </h4>
                          {claseEnVivoActiva && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              REC {formatoTiempo(segundosEnVivo)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {claseEnVivoActiva 
                            ? 'Transmitiendo con video interactivo y toma de asistencia en tiempo real'
                            : 'Inicia la clase virtual para que tus alumnos puedan conectarse y tomar lista'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {claseEnVivoActiva ? (
                        <button
                          type="button"
                          onClick={finalizarClaseEnVivo}
                          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Finalizar Clase</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={iniciarClaseEnVivo}
                          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2 font-display"
                        >
                          <Radio className="w-4 h-4" />
                          <span>Iniciar Clase en Vivo</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Escenario de Clase: Reproductor / Pantalla y Panel de Asistencia en Vivo */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Columna Izquierda: Ventana de Transmisión (7 columnas) */}
                    <div className="lg:col-span-7 flex flex-col space-y-3">
                      <div className="bg-[#0e0a24] rounded-2xl border border-white/10 overflow-hidden relative aspect-video flex flex-col justify-between shadow-2xl">
                        
                        {/* Cabecera de la Pantalla */}
                        <div className="p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white z-10">
                          <div className="flex items-center gap-2">
                            {claseEnVivoActiva ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1.5 shadow-md shadow-rose-600/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                EN VIVO
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
                                SALA EN ESPERA
                              </span>
                            )}
                            <span className="text-xs font-mono text-slate-300 font-semibold">{formatoTiempo(segundosEnVivo)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-black/40 px-3 py-1 rounded-xl border border-white/5 backdrop-blur-sm">
                            <Users className="w-3.5 h-3.5 text-violet-400" />
                            <span>{claseEnVivoActiva ? inscripcionesCursoActivo.length : 0} conectados</span>
                          </div>
                        </div>

                        {/* Centro del Video: Cámara o Pantalla Compartida */}
                        <div className="flex-1 flex items-center justify-center relative p-6">
                          {!claseEnVivoActiva ? (
                            <div className="text-center space-y-3">
                              <div className="w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
                                <Radio className="w-8 h-8" />
                              </div>
                              <p className="text-sm font-semibold text-white">La transmisión aún no ha comenzado</p>
                              <p className="text-xs text-slate-400 max-w-xs">Haz clic en "Iniciar Clase en Vivo" arriba para activar tu cámara y convocar a los estudiantes.</p>
                            </div>
                          ) : pantallaCompartida ? (
                            /* Modo: Pantalla Compartida (Código / Diapositivas) */
                            <div className="w-full h-full bg-[#181534] rounded-xl border border-white/10 p-5 font-mono text-xs text-slate-300 flex flex-col justify-between overflow-hidden shadow-inner relative">
                              <button
                                type="button"
                                onClick={togglePantallaCompartida}
                                className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-lg"
                              >
                                <MonitorOff className="w-3.5 h-3.5" />
                                Dejar de compartir
                              </button>
                              <div>
                                <div className="flex items-center justify-between pb-3 border-b border-white/5 text-[11px] text-slate-400">
                                  <span>💻 Presentando: Clase01_ArquitecturaSoftware.ts</span>
                                  <span className="text-emerald-400 font-bold">1080p HD • 60 FPS</span>
                                </div>
                                <div className="mt-3 space-y-1.5 text-slate-300 leading-relaxed">
                                  <p className="text-violet-400">// Clase en vivo: Arquitectura y Capas del Dominio</p>
                                  <p><span className="text-indigo-400">interface</span> <span className="text-amber-300">CursoOnline</span> &#123;</p>
                                  <p className="pl-4">id: <span className="text-blue-400">number</span>;</p>
                                  <p className="pl-4">titulo: <span className="text-emerald-400">"{cursoActivo.nombre}"</span>;</p>
                                  <p className="pl-4">profesor: <span className="text-emerald-400">"{user.nombre}"</span>;</p>
                                  <p className="pl-4">asistenciasTomadas: <span className="text-blue-400">true</span>;</p>
                                  <p>&#125;</p>
                                </div>
                              </div>
                              
                              {/* Picture in picture de la cámara docente */}
                              <div className="self-end bg-[#110d2c] border border-violet-500/30 rounded-xl p-2.5 flex items-center gap-2 shadow-xl">
                                <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-xs">
                                  {user.nombre.charAt(0)}
                                </div>
                                <div className="text-[10px]">
                                  <p className="font-bold text-white leading-tight">Prof. {user.nombre}</p>
                                  <p className="text-violet-400 font-mono text-[9px]">Micrófono Activo</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Modo: Cámara Web del Docente */
                            <div className="text-center space-y-4">
                              <div className="relative inline-block">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 border-2 border-violet-400 text-white flex items-center justify-center font-bold text-3xl shadow-xl shadow-violet-600/30 mx-auto">
                                  {user.nombre.charAt(0).toUpperCase()}
                                </div>
                                {microActivo && (
                                  <span className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 text-white rounded-full border-2 border-[#0e0a24]">
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                              <div>
                                <h5 className="font-display font-bold text-white text-base">Prof. {user.nombre}</h5>
                                <p className="text-xs text-violet-300">Docente titular — {cursoActivo.nombre}</p>
                              </div>

                              {/* Ecualizador animado si el micro está activo */}
                              {microActivo && (
                                <div className="flex items-center justify-center gap-1 h-4">
                                  <span className="w-1 h-3 bg-violet-400 rounded-full animate-bounce" />
                                  <span className="w-1 h-5 bg-violet-300 rounded-full animate-bounce [animation-delay:0.1s]" />
                                  <span className="w-1 h-4 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Notificación de mano levantada */}
                          {manosLevantadas.length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute top-16 right-4 bg-amber-500/20 border border-amber-500/40 text-amber-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 backdrop-blur-md shadow-lg"
                            >
                              <Hand className="w-3.5 h-3.5 text-amber-400" />
                              <span>{manosLevantadas[0]} levantó la mano</span>
                            </motion.div>
                          )}
                        </div>

                        {/* Barra de Controles de Audio/Video en la parte inferior */}
                        <div className="p-3 bg-black/80 backdrop-blur-md border-t border-white/5 flex items-center justify-center gap-3 z-10">
                          <button
                            type="button"
                            onClick={() => setMicroActivo(!microActivo)}
                            disabled={!claseEnVivoActiva}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              microActivo 
                                ? 'bg-white/10 text-white border-white/10 hover:bg-white/20' 
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                            title={microActivo ? 'Silenciar micrófono' : 'Activar micrófono'}
                          >
                            {microActivo ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => setCamaraActiva(!camaraActiva)}
                            disabled={!claseEnVivoActiva}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              camaraActiva 
                                ? 'bg-white/10 text-white border-white/10 hover:bg-white/20' 
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                            title={camaraActiva ? 'Apagar cámara' : 'Encender cámara'}
                          >
                            {camaraActiva ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                          </button>

                          <button
                            type="button"
                            onClick={togglePantallaCompartida}
                            disabled={!claseEnVivoActiva}
                            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              pantallaCompartida 
                                ? 'bg-rose-600 text-white border-rose-500 shadow-md' 
                                : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
                            }`}
                          >
                            {pantallaCompartida ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                            <span>{pantallaCompartida ? 'Dejar de compartir' : 'Compartir Pantalla'}</span>
                          </button>

                          {claseEnVivoActiva && (
                            <button
                              type="button"
                              onClick={finalizarClaseEnVivo}
                              className="px-3.5 py-2.5 rounded-xl border border-rose-500/40 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>Terminar clase</span>
                            </button>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Columna Derecha: Lista de Todos los Alumnos para Asistencia en Vivo (5 columnas) */}
                    <div className="lg:col-span-5 bg-[#110d2c]/70 border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                          <div>
                            <h4 className="font-display font-bold text-white text-sm flex items-center gap-2">
                              <CheckSquare className="w-4 h-4 text-violet-400" />
                              <span>Pase de Asistencia en Vivo</span>
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {inscripcionesCursoActivo.length} alumno{inscripcionesCursoActivo.length !== 1 ? 's' : ''} matriculado{inscripcionesCursoActivo.length !== 1 ? 's' : ''} en el curso
                            </p>
                          </div>
                          
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                            {fechaAsistencia}
                          </span>
                        </div>

                        {/* Atajos Rápidos */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleMarcarTodos('presente')}
                            className="flex-1 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Todos Presentes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMarcarTodos('ausente')}
                            className="flex-1 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Todos Ausentes</span>
                          </button>
                        </div>

                        {/* Listado de Alumnos con Selector de Estado */}
                        {inscripcionesCursoActivo.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-6">No hay alumnos inscriptos en este curso.</p>
                        ) : (
                          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                            {inscripcionesCursoActivo.map((ins) => {
                              const alumnoObj = alumnos.find(a => a.id === ins.alumno_id);
                              const nombre = ins.alumno || alumnoObj?.nombre || `Estudiante #${ins.alumno_id}`;
                              const estadoActual = asistenciasDelDia[ins.alumno_id] || 'presente';

                              return (
                                <div
                                  key={ins.id}
                                  className="p-3 bg-[#181534] rounded-xl border border-white/5 flex items-center justify-between gap-2"
                                >
                                  <button
                                    type="button"
                                    onClick={() => setAlumnoFichaId(ins.alumno_id)}
                                    className="flex items-center gap-2.5 overflow-hidden text-left hover:opacity-80"
                                    title="Ver ficha del alumno"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0 border border-violet-500/20">
                                      {nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                      <p className="text-xs font-semibold text-white truncate">{nombre}</p>
                                      <p className="text-[10px] text-slate-400 font-mono truncate">{alumnoObj?.email || 'alumno@mail.com'}</p>
                                    </div>
                                  </button>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleCambiarAsistencia(ins.alumno_id, 'presente')}
                                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                        estadoActual === 'presente' 
                                          ? 'bg-emerald-500 text-white shadow-sm' 
                                          : 'bg-white/5 text-slate-400 hover:text-emerald-300'
                                      }`}
                                      title="Presente"
                                    >
                                      P
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCambiarAsistencia(ins.alumno_id, 'ausente')}
                                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                        estadoActual === 'ausente' 
                                          ? 'bg-rose-500 text-white shadow-sm' 
                                          : 'bg-white/5 text-slate-400 hover:text-rose-300'
                                      }`}
                                      title="Ausente"
                                    >
                                      A
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCambiarAsistencia(ins.alumno_id, 'tarde')}
                                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                        estadoActual === 'tarde' 
                                          ? 'bg-amber-500 text-slate-900 shadow-sm' 
                                          : 'bg-white/5 text-slate-400 hover:text-amber-300'
                                      }`}
                                      title="Tarde"
                                    >
                                      T
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Botón de Guardado de Asistencia */}
                      <button
                        type="button"
                        onClick={guardarAsistenciasManual}
                        className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-600/20 flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Guardar Asistencia de la Sesión</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────
                  SUB-PESTAÑA 2: MATERIAL DE CLASE (VIDEO, PDF, ENLACE)
                 ────────────────────────────────────────────────────────── */}
              {subTabCurso === 'materiales' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Formulario para agregar material */}
                  <div className="bg-[#110d2c]/60 border border-white/5 rounded-2xl p-6 space-y-4">
                    <div>
                      <h4 className="font-display font-bold text-white text-base">Publicar Material</h4>
                      <p className="text-xs text-slate-400">Sube videos, guías teóricas en PDF o enlaces de consulta</p>
                    </div>

                    <form onSubmit={handleSubirMaterial} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Título del Recurso
                        </label>
                        <input
                          type="text"
                          value={nuevoMaterialTitulo}
                          onChange={(e) => setNuevoMaterialTitulo(e.target.value)}
                          placeholder="Ej: Clase 02 — Modelado Relacional"
                          className="w-full bg-[#181534] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500 transition-colors"
                          required
                          disabled={subiendoMaterial}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Tipo de Formato
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'video', label: 'Video', icon: Video },
                            { id: 'pdf', label: 'PDF', icon: FileText },
                            { id: 'link', label: 'Enlace', icon: ExternalLink }
                          ].map((formato) => {
                            const FormatoIcon = formato.icon;
                            return (
                              <button
                                key={formato.id}
                                type="button"
                                onClick={() => setNuevoMaterialTipo(formato.id as any)}
                                className={`
                                  py-2 px-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-all
                                  ${nuevoMaterialTipo === formato.id
                                    ? 'bg-violet-600/20 border-violet-500 text-violet-300 font-bold'
                                    : 'bg-[#181534] border-white/5 text-slate-400 hover:text-white'
                                  }
                                `}
                              >
                                <FormatoIcon className="w-4 h-4" />
                                <span>{formato.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          {nuevoMaterialTipo === 'video' ? 'Enlace del Video (YouTube / Meet / Drive)' :
                           nuevoMaterialTipo === 'pdf' ? 'URL del Documento PDF' : 'Enlace Web'}
                        </label>
                        <input
                          type="text"
                          value={nuevoMaterialUrl}
                          onChange={(e) => setNuevoMaterialUrl(e.target.value)}
                          placeholder={
                            nuevoMaterialTipo === 'video' ? 'https://youtube.com/watch?v=...' :
                            nuevoMaterialTipo === 'pdf' ? 'https://sitio.com/apunte.pdf' :
                            'https://github.com/...'
                          }
                          className="w-full bg-[#181534] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500 transition-colors"
                          disabled={subiendoMaterial}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={subiendoMaterial || !nuevoMaterialTitulo.trim()}
                        className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{subiendoMaterial ? 'Publicando…' : 'Agregar Material'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Listado de materiales para el curso activo */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-bold text-white text-base">
                        Materiales Disponibles ({materialesCursoActivo.length})
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Los alumnos inscriptos pueden visualizar estos recursos
                      </span>
                    </div>

                    {materialesCursoActivo.length === 0 ? (
                      <div className="p-8 bg-[#110d2c]/40 border border-white/5 rounded-2xl text-center text-slate-400">
                        <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-white mb-1">Aún no hay materiales en este curso</p>
                        <p className="text-xs text-slate-500">Publica un video o archivo PDF usando el formulario de la izquierda.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {materialesCursoActivo.map((mat) => (
                          <div
                            key={mat.id}
                            className="p-4 bg-[#110d2c]/50 rounded-2xl border border-white/5 flex items-center justify-between gap-4 hover:border-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-3.5 overflow-hidden">
                              <div className={`p-3 rounded-xl shrink-0 ${
                                mat.tipo === 'video' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' :
                                mat.tipo === 'pdf' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' :
                                'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {mat.tipo === 'video' ? <Video className="w-5 h-5" /> :
                                 mat.tipo === 'pdf' ? <FileText className="w-5 h-5" /> :
                                 <ExternalLink className="w-5 h-5" />}
                              </div>
                              <div className="overflow-hidden">
                                <h5 className="font-semibold text-sm text-white truncate">{mat.titulo}</h5>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                                  <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300">
                                    {mat.tipo}
                                  </span>
                                  <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    {mat.fechaSubida}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={mat.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                                title="Ver / Abrir recurso"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => handleEliminarMaterial(mat.id)}
                                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                title="Eliminar material"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────
                  SUB-PESTAÑA 3: PLANILLA DE ASISTENCIAS
                 ────────────────────────────────────────────────────────── */}
              {subTabCurso === 'asistencias' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#110d2c]/60 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-violet-600/15 text-violet-400 border border-violet-500/20">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Fecha de la Clase
                        </label>
                        <input
                          type="date"
                          value={fechaAsistencia}
                          onChange={(e) => setFechaAsistencia(e.target.value)}
                          className="bg-[#181534] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-violet-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMarcarTodos('presente')}
                        className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Todos Presentes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarcarTodos('ausente')}
                        className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Todos Ausentes</span>
                      </button>
                      <button
                        type="button"
                        onClick={guardarAsistenciasManual}
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Guardar</span>
                      </button>
                    </div>
                  </div>

                  {/* Tabla de asistencia de alumnos inscriptos */}
                  {inscripcionesCursoActivo.length === 0 ? (
                    <div className="p-8 bg-[#110d2c]/40 border border-white/5 rounded-2xl text-center text-slate-400">
                      <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-white mb-1">No hay alumnos inscriptos en este curso</p>
                      <p className="text-xs text-slate-500">Los estudiantes deben matricularse en esta materia para tomar asistencia.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#110d2c]/40">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-white/5">
                            <th className="py-3 px-4">Alumno</th>
                            <th className="py-3 px-4">Correo</th>
                            <th className="py-3 px-4 text-center">Estado de Asistencia ({fechaAsistencia})</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {inscripcionesCursoActivo.map((ins) => {
                            const alumnoObj = alumnos.find(a => a.id === ins.alumno_id);
                            const nombre = ins.alumno || alumnoObj?.nombre || `Estudiante #${ins.alumno_id}`;
                            const email = alumnoObj?.email || 'alumno@mail.com';
                            const estadoActual = asistenciasDelDia[ins.alumno_id] || 'presente';

                            return (
                              <tr key={ins.id} className="hover:bg-white/5 transition-colors text-slate-300">
                                <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                                    {nombre.charAt(0).toUpperCase()}
                                  </div>
                                  <span>{nombre}</span>
                                </td>
                                <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{email}</td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleCambiarAsistencia(ins.alumno_id, 'presente')}
                                      className={`
                                        px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1
                                        ${estadoActual === 'presente'
                                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                          : 'bg-white/5 hover:bg-emerald-500/15 text-slate-400 hover:text-emerald-300'
                                        }
                                      `}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Presente</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCambiarAsistencia(ins.alumno_id, 'ausente')}
                                      className={`
                                        px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1
                                        ${estadoActual === 'ausente'
                                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                                          : 'bg-white/5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-300'
                                        }
                                      `}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Ausente</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCambiarAsistencia(ins.alumno_id, 'tarde')}
                                      className={`
                                        px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1
                                        ${estadoActual === 'tarde'
                                          ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/30'
                                          : 'bg-white/5 hover:bg-amber-500/15 text-slate-400 hover:text-amber-300'
                                        }
                                      `}
                                    >
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>Tarde</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────
                  SUB-PESTAÑA 4: CARGAR NOTAS Y CALIFICACIONES (GUARDADAS)
                 ────────────────────────────────────────────────────────── */}
              {subTabCurso === 'notas' && (
                <div className="space-y-6">
                  
                  {/* Selector de Instancia de Evaluación */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#110d2c]/60 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-violet-600/15 text-violet-400 border border-violet-500/20">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Instancia de Evaluación
                        </label>
                        <select
                          value={evaluacionActiva}
                          onChange={(e) => setEvaluacionActiva(e.target.value)}
                          className="bg-[#181534] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-violet-500 outline-none font-semibold cursor-pointer"
                        >
                          {EVALUACIONES_DEFAULT.map(ev => (
                            <option key={ev} value={ev}>{ev}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Autoguardado en memoria permanente</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleGuardarNotas}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-600/20 transition-all flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Guardar Calificaciones</span>
                      </button>
                    </div>
                  </div>

                  {/* Tabla de Carga de Notas */}
                  {inscripcionesCursoActivo.length === 0 ? (
                    <div className="p-8 bg-[#110d2c]/40 border border-white/5 rounded-2xl text-center text-slate-400">
                      <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-white mb-1">No hay alumnos inscriptos en este curso</p>
                      <p className="text-xs text-slate-500">Los estudiantes deben matricularse en este curso para cargar notas.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#110d2c]/40">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-white/5">
                            <th className="py-3 px-4">Alumno</th>
                            <th className="py-3 px-4 w-32">Calificación (1-10)</th>
                            <th className="py-3 px-4 w-36 text-center">Condición</th>
                            <th className="py-3 px-4">Devolución / Observación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {inscripcionesCursoActivo.map((ins) => {
                            const alumnoObj = alumnos.find(a => a.id === ins.alumno_id);
                            const nombre = ins.alumno || alumnoObj?.nombre || `Estudiante #${ins.alumno_id}`;
                            const dataNota = notasDeEvaluacion[ins.alumno_id] || { nota: '', observacion: '' };
                            const numNota = parseFloat(dataNota.nota);

                            let estadoBadge = { texto: 'Sin calificar', clase: 'bg-slate-500/10 text-slate-400 border-white/5' };
                            if (!isNaN(numNota)) {
                              if (numNota >= 7) {
                                estadoBadge = { texto: 'Promocionado', clase: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
                              } else if (numNota >= 4) {
                                estadoBadge = { texto: 'Aprobado', clase: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
                              } else {
                                estadoBadge = { texto: 'Desaprobado', clase: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
                              }
                            }

                            return (
                              <tr key={ins.id} className="hover:bg-white/5 transition-colors text-slate-300">
                                <td className="py-3 px-4 font-semibold text-white">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-violet-500/15 text-violet-400 flex items-center justify-center font-bold text-xs border border-violet-500/20">
                                      {nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{nombre}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    step="0.5"
                                    value={dataNota.nota}
                                    onChange={(e) => handleNotaChange(ins.alumno_id, e.target.value)}
                                    placeholder="Ej: 8"
                                    className="w-24 bg-[#181534] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white text-center font-bold focus:border-violet-500 outline-none"
                                  />
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${estadoBadge.clase}`}>
                                    {estadoBadge.texto}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <input
                                    type="text"
                                    value={dataNota.observacion}
                                    onChange={(e) => handleObservacionChange(ins.alumno_id, e.target.value)}
                                    placeholder="Comentarios sobre el examen..."
                                    className="w-full bg-[#181534] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────
                  SUB-PESTAÑA 5: ALUMNOS INSCRIPTOS
                 ────────────────────────────────────────────────────────── */}
              {subTabCurso === 'alumnos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-white text-base">
                        Padrón de Estudiantes Matriculados
                      </h4>
                      <p className="text-xs text-slate-400">Alumnos con inscripción activa en {cursoActivo.nombre}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      {inscripcionesCursoActivo.length} inscripto{inscripcionesCursoActivo.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {inscripcionesCursoActivo.length === 0 ? (
                    <div className="p-8 bg-[#110d2c]/40 border border-white/5 rounded-2xl text-center text-slate-400">
                      <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-white mb-1">Aún no hay alumnos matriculados</p>
                      <p className="text-xs text-slate-500">Los estudiantes pueden inscribirse a esta materia desde su panel de alumno.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inscripcionesCursoActivo.map((ins) => {
                        const alumnoObj = alumnos.find(a => a.id === ins.alumno_id);
                        const nombre = ins.alumno || alumnoObj?.nombre || `Estudiante #${ins.alumno_id}`;
                        const email = alumnoObj?.email || 'alumno@mail.com';

                        return (
                          <button
                            type="button"
                            key={ins.id}
                            onClick={() => setAlumnoFichaId(ins.alumno_id)}
                            className="p-4 bg-[#110d2c]/50 border border-white/5 rounded-2xl flex items-center justify-between gap-4 text-left hover:border-violet-500/40 hover:bg-[#181534] transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-violet-600/15 text-violet-400 flex items-center justify-center font-bold text-sm border border-violet-500/20">
                                {nombre.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h5 className="font-semibold text-sm text-white">{nombre}</h5>
                                <p className="text-xs text-slate-400">{email}</p>
                                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Calendar className="w-3 h-3 text-violet-500" />
                                  <span>Inscripción: {ins.fecha || 'Sin fecha'}</span>
                                </span>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-500/15 text-violet-300 border border-violet-500/20">
                              Ver ficha
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {fichaAlumno && alumnoFichaId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181534] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-800 text-white relative">
              <button
                type="button"
                onClick={() => setAlumnoFichaId(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-[10px] uppercase tracking-widest font-bold text-violet-100 mb-1">Ficha académica</p>
              <h3 className="font-display font-bold text-2xl">{fichaAlumno.nombre}</h3>
              <p className="text-xs text-violet-100/80">{fichaAlumno.email}</p>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#110d2c] border border-white/5">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Condición</p>
                  <p className="text-sm font-bold text-white mt-1">{fichaAlumno.condicionFinal}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#110d2c] border border-white/5">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Promedio</p>
                  <p className="text-sm font-bold text-white mt-1">
                    {fichaAlumno.promedio !== null ? fichaAlumno.promedio.toFixed(1) : '—'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#110d2c] border border-white/5">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Asistencia</p>
                  <p className="text-sm font-bold text-white mt-1">
                    {fichaAlumno.pctAsistencia !== null ? `${fichaAlumno.pctAsistencia}%` : '—'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-violet-400" /> Notas
                </h4>
                {fichaAlumno.notas.length === 0 ? (
                  <p className="text-xs text-slate-500">Todavía no hay calificaciones cargadas.</p>
                ) : (
                  <div className="space-y-2">
                    {fichaAlumno.notas.map((n) => (
                      <div key={n.evaluacion} className="p-3 rounded-xl bg-[#110d2c] border border-white/5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-white">{n.evaluacion}</p>
                          {n.observacion && <p className="text-[11px] text-slate-400 italic">{n.observacion}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-violet-300">{n.nota}</p>
                          <p className="text-[10px] font-bold text-slate-400">{n.condicion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-violet-400" /> Asistencias
                </h4>
                {fichaAlumno.asistencias.length === 0 ? (
                  <p className="text-xs text-slate-500">Todavía no hay asistencias registradas.</p>
                ) : (
                  <div className="space-y-1.5">
                    {fichaAlumno.asistencias.map((a) => (
                      <div key={a.fecha} className="p-2.5 rounded-lg bg-[#110d2c] border border-white/5 flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-300">{a.fecha}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          a.estado === 'presente' ? 'bg-emerald-500/20 text-emerald-300' :
                          a.estado === 'tarde' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-rose-500/20 text-rose-300'
                        }`}>
                          {a.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
