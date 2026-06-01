import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  FileText, 
  Video, 
  Trash2, 
  BookMarked, 
  Upload, 
  CheckCircle,
  FileUp,
  Layout,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Curso, Profesor, Usuario } from '../types';
import { StatCard } from '../components/StatCard';
import { CursoForm } from '../components/CursoForm';

interface ProfesorDashboardProps {
  user: Usuario;
  cursos: Curso[];
  profesores: Profesor[];
  inscripciones: { curso_id: number }[];
  currentTab: string; // 'dashboard', 'mis-cursos', or 'contenido'
  onCrearCurso: (nombre: string, profesor_id: number) => Promise<void>;
  onEditarCurso: (id: number, nombre: string, profesor_id: number) => Promise<void>;
  onEliminarCurso: (id: number) => Promise<void>;
}

// Simulor del gestor de materiales de clase
interface Material {
  id: number;
  cursoId: number;
  titulo: string;
  tipo: 'video' | 'pdf' | 'link';
  url: string;
  fechaSubida: string;
}

export function ProfesorDashboard({
  user,
  cursos,
  profesores,
  inscripciones,
  currentTab,
  onCrearCurso,
  onEditarCurso,
  onEliminarCurso
}: ProfesorDashboardProps) {

  // Filtrar cursos asignados a este profesor
  const misCursos = cursos.filter(c => c.profesor_id === user.id || c.profesor === user.nombre);
  
  // Total de alumnos inscriptos en sus cursos
  const misAlumnosCount = inscripciones.filter(i => 
    misCursos.some(c => c.id === i.curso_id)
  ).length;

  // Controladores de formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [cursoAEditar, setCursoAEditar] = useState<Curso | null>(null);

  // Estados del Gestor de Materiales (Pre-integración)
  const [materiales, setMateriales] = useState<Material[]>([
    { id: 1, cursoId: misCursos[0]?.id || 101, titulo: "Clase 01 — Fundamentos y Virtual DOM", tipo: 'video', url: 'https://youtube.com', fechaSubida: '2026-05-20' },
    { id: 2, cursoId: misCursos[0]?.id || 101, titulo: "Guía Teórica de Componentes y Props.pdf", tipo: 'pdf', url: '#', fechaSubida: '2026-05-22' },
    { id: 3, cursoId: misCursos[1]?.id || 102, titulo: "Estructura del Proyecto Node.js", tipo: 'link', url: 'https://github.com', fechaSubida: '2026-05-25' }
  ]);

  const [nuevoMaterialTitulo, setNuevoMaterialTitulo] = useState('');
  const [nuevoMaterialTipo, setNuevoMaterialTipo] = useState<'video' | 'pdf' | 'link'>('video');
  const [nuevoMaterialUrl, setNuevoMaterialUrl] = useState('');
  const [selectCursoIdMaterial, setSelectCursoIdMaterial] = useState<number>(misCursos[0]?.id || 0);

  // Simulación de carga (Uploader)
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const handleGuardarCurso = async (datos: { nombre: string; profesor_id: number }) => {
    if (cursoAEditar) {
      await onEditarCurso(cursoAEditar.id, datos.nombre, datos.profesor_id);
    } else {
      // Forzar ID del profesor logueado
      await onCrearCurso(datos.nombre, user.id || datos.profesor_id);
    }
    setIsFormOpen(false);
    setCursoAEditar(null);
  };

  const handleSubirMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMaterialTitulo.trim() || !selectCursoIdMaterial) return;

    setSubiendo(true);
    setProgreso(10);

    // Simular un cargador visual de carga de materiales (ideal para exposiciones)
    const interval = setInterval(() => {
      setProgreso((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          const nuevo: Material = {
            id: Date.now(),
            cursoId: selectCursoIdMaterial,
            titulo: nuevoMaterialTitulo.trim(),
            tipo: nuevoMaterialTipo,
            url: nuevoMaterialUrl.trim() || 'https://edugestor.com/material',
            fechaSubida: new Date().toISOString().split('T')[0]
          };

          setMateriales([nuevo, ...materiales]);
          setNuevoMaterialTitulo('');
          setNuevoMaterialUrl('');
          setSubiendo(false);
          setProgreso(0);
          return 0;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleEliminarMaterial = (id: number) => {
    setMateriales(materiales.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-8">
      
      {/* Banner de Bienvenida Personalizado */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-800 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
        <div className="relative z-10 max-w-lg">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d5cbfb] bg-white/10 px-3 py-1 rounded-full mb-3.5 inline-block">
            Módulo del Docente
          </span>
          <h2 className="text-3xl font-bold font-display tracking-tight mb-2">
            ¡Hola, {user.nombre}! 👋
          </h2>
          <p className="text-violet-100/90 text-sm leading-relaxed">
            Desde este portal puedes administrar la planificación educativa, evaluar tus cursos asignados, añadir contenido multimedia y preparar guías teóricas para tus estudiantes.
          </p>
        </div>
        <div className="absolute right-[-10px] bottom-[-40px] w-72 h-72 bg-white/10 rounded-full blur-[80px]" />
      </div>

      {/* Grid de KPIs del Profesor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          titulo="Mis Cursos Asignados"
          valor={misCursos.length}
          iconName="BookOpen"
          trend="Activos"
          trendType="neutral"
          accentColor="indigo"
        />
        <StatCard
          titulo="Alumnos en mis Cursos"
          valor={misAlumnosCount}
          iconName="Users"
          trend="Inscriptos"
          trendType="positive"
          accentColor="emerald"
        />
        <StatCard
          titulo="Materiales Multimedia"
          valor={materiales.filter(m => misCursos.some(c => c.id === m.cursoId)).length}
          iconName="FileText"
          trend="Archivos"
          trendType="neutral"
          accentColor="blue"
        />
      </div>

      {/* PESTAÑA: TABLERO / MIS CURSOS */}
      {(currentTab === 'dashboard' || currentTab === 'mis-cursos') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-xl font-bold font-display text-white">Administrador de Cursos</h3>
              <p className="text-xs text-slate-400">Edita o añade materias a tu cargo de forma directa</p>
            </div>
            <button
              onClick={() => {
                setCursoAEditar(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-505 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Curso</span>
            </button>
          </div>

          {misCursos.length === 0 ? (
            <div className="bg-[#181534] border border-white/5 rounded-3xl p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-base font-semibold text-white mb-1">No tienes cursos asignados aún</p>
              <p className="text-xs text-slate-500">Crea uno nuevo usando el botón de arriba!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {misCursos.map((curso) => {
                const countAlumnos = inscripciones.filter(i => i.curso_id === curso.id).length;
                return (
                  <motion.div
                    key={curso.id}
                    layoutId={`prof-curso-${curso.id}`}
                    className="bg-white rounded-2xl overflow-hidden shadow-md flex flex-col justify-between border border-slate-100 hover:shadow-lg transition-all"
                  >
                    <div className="p-6">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold mb-4">
                        <BookMarked className="w-5.5 h-5.5" />
                      </div>
                      <h4 className="text-slate-900 font-display font-bold text-lg mb-1 tracking-tight truncate">
                        {curso.nombre}
                      </h4>
                      <div className="flex gap-4 mt-3">
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">ID: {curso.id}</span>
                        <span className="text-xs text-violet-600 font-bold block">{countAlumnos} ALUMNOS</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => {
                          setCursoAEditar(curso);
                          setIsFormOpen(true);
                        }}
                        className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs text-center hover:bg-slate-100 transition-colors"
                      >
                        Editar nombre
                      </button>
                      <button
                        onClick={() => onEliminarCurso(curso.id)}
                        className="p-1 px-2.5 rounded-lg border border-rose-200 text-rose-500 text-xs hover:bg-rose-50 transition-colors"
                        title="Eliminar curso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA: PLANIFICACION Y MATERIAL MULTIMEDIA */}
      {currentTab === 'contenido' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Formulario Agregar Material */}
          <div className="bg-[#181534] border border-white/5 rounded-3xl p-6 shadow-xl h-fit space-y-5">
            <div>
              <h3 className="font-display font-bold text-white text-lg">Asistente de Carga</h3>
              <p className="text-xs text-slate-400">Prepara recursos pedagógicos para tus cursos activos</p>
            </div>

            <form onSubmit={handleSubirMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Asociar al Curso</label>
                <select
                  value={selectCursoIdMaterial}
                  onChange={(e) => setSelectCursoIdMaterial(Number(e.target.value))}
                  className="w-full bg-[#110d2c]/65 border border-white/5 rounded-2xl py-3 px-4 text-sm text-slate-300 focus:outline-[#8b7cf8]"
                >
                  {misCursos.length === 0 ? (
                    <option value={0}>Primero crea un curso</option>
                  ) : (
                    misCursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Título del Recurso</label>
                <input
                  type="text"
                  value={nuevoMaterialTitulo}
                  onChange={(e) => setNuevoMaterialTitulo(e.target.value)}
                  placeholder="Ej: Apunte PDF sobre Bases de Datos"
                  className="w-full bg-[#110d2c]/65 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white placeholder-slate-505 outline-none focus:border-violet-500 transition-colors"
                  required
                  disabled={subiendo}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tipo de Recurso</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'video', label: 'Video', icon: Video },
                    { id: 'pdf', label: 'PDF', icon: FileText },
                    { id: 'link', label: 'Enlace', icon: ExternalLink }
                  ].map(tipo => {
                    const SelectedIcon = tipo.icon;
                    return (
                      <button
                        key={tipo.id}
                        type="button"
                        onClick={() => setNuevoMaterialTipo(tipo.id as any)}
                        className={`
                          py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all
                          ${nuevoMaterialTipo === tipo.id 
                            ? 'bg-violet-600/15 border-violet-500 text-violet-400' 
                            : 'bg-[#110d2c]/50 border-white/5 text-slate-400 hover:text-white'
                          }
                        `}
                      >
                        <SelectedIcon className="w-4 h-4" />
                        <span>{tipo.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Enlace / URL</label>
                <input
                  type="text"
                  value={nuevoMaterialUrl}
                  onChange={(e) => setNuevoMaterialUrl(e.target.value)}
                  placeholder="https://drive.google.com/... o enlace de vídeo"
                  className="w-full bg-[#110d2c]/65 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white placeholder-slate-505 outline-none focus:border-violet-500 transition-colors"
                  disabled={subiendo}
                />
              </div>

              <button
                type="submit"
                disabled={subiendo || misCursos.length === 0}
                className={`
                  w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all
                  ${subiendo 
                    ? 'bg-violet-600/20 text-violet-400 border border-violet-550 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-500 text-white hover:shadow shadow-violet-500/20 active:scale-[0.98]'
                  }
                `}
              >
                {subiendo ? (
                  <div className="flex flex-col items-center w-full gap-2 py-1">
                    <div className="flex justify-between w-full text-xs font-extrabold px-1">
                      <span>Procesando...</span>
                      <span>{progreso}%</span>
                    </div>
                    <div className="w-full bg-[#110d2c] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-violet-400 h-full transition-all duration-200" style={{ width: `${progreso}%` }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Subir Material de Clase</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Columna Derecha: Listado de Material multimedia */}
          <div className="lg:col-span-2 bg-[#181534] border border-white/5 rounded-3xl p-6 shadow-xl space-y-5">
            <div>
              <h3 className="font-display font-bold text-white text-lg">Biblioteca de Materiales</h3>
              <p className="text-xs text-slate-400">Lista de elementos cargados clasificados por curso</p>
            </div>

            {materiales.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">No hay archivos ni contenido compartido en esta lista.</p>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
                {materiales.map((mat) => {
                  const cursoNombre = cursos.find(c => c.id === mat.cursoId)?.nombre || `Curso ID: ${mat.cursoId}`;
                  return (
                    <motion.div
                      key={mat.id}
                      layout
                      className="p-4 bg-[#110d2c]/50 rounded-2xl border border-white/5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        <div className={`p-3 rounded-xl shrink-0 ${
                          mat.tipo === 'video' ? 'bg-indigo-500/10 text-indigo-400' :
                          mat.tipo === 'pdf' ? 'bg-rose-500/10 text-rose-450' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {mat.tipo === 'video' ? <Video className="w-5 h-5" /> :
                           mat.tipo === 'pdf' ? <FileText className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                        </div>
                        <div className="overflow-hidden">
                          <h5 className="font-semibold text-sm text-white truncate">{mat.titulo}</h5>
                          <p className="text-xs text-violet-400/90 truncate font-medium">{cursoNombre}</p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono font-semibold mt-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>Publicado: {mat.fechaSubida}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a 
                          href={mat.url} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                          title="Abrir recurso"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleEliminarMaterial(mat.id)}
                          className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-450 hover:text-rose-400 transition-colors"
                          title="Eliminar material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Modal De Creación/Edición de Cursos (Integrado) */}
      {isFormOpen && (
        <CursoForm
          curso={cursoAEditar}
          profesores={profesores}
          onSubmit={handleGuardarCurso}
          onCancel={() => {
            setIsFormOpen(false);
            setCursoAEditar(null);
          }}
        />
      )}

    </div>
  );
}
