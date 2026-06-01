import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { Curso, Profesor, Usuario, Inscripcion } from '../types';

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

  // Alumno ID logueado (en el sistema simulado)
  const alumnoId = user.id || 1;

  // Filtrar cursos en los que ya está inscripto este alumno
  const misInscripciones = inscripciones.filter(i => i.alumno_id === alumnoId);
  const misCursosCargados = misInscripciones.map(i => {
    return cursos.find(c => c.id === i.curso_id);
  }).filter((c): c is Curso => !!c);

  // Filtrar cursos disponibles (excluyendo inscripciones existentes para que explore nuevos!)
  const cursosDisponibles = cursos.filter(c => 
    !misInscripciones.some(i => i.curso_id === c.id)
  );

  // Estados de visualización de detalles
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);

  // Datos simulados de syllabus de clases para dar profundidad en la visualización del temario
  const syllabusGenerico = [
    { nro: "Sección 1", clases: ["Introducción al ecosistema y configuración de entorno", "Sintaxis declarativa contra programación estructurada"] },
    { nro: "Sección 2", clases: ["Manejo del estado reactivo y pasaje de propiedades", "Buenas prácticas y modularización de vistas"] },
    { nro: "Sección 3", clases: ["Peticiones HTTP con fetch y conexión a bases de datos", "Presentación y defensa práctica del proyecto final"] }
  ];

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
            Bienvenido a tu campus virtual. Aquí puedes seguir repasando tus cursos matriculados, consultar las clases asignadas y matricularte en nuevas materias tecnológicas para expandir tus proyectos de ingeniería.
          </p>
        </div>
        <div className="absolute right-[-10px] bottom-[-40px] w-72 h-72 bg-white/10 rounded-full blur-[80px]" />
      </div>

      {/* Vista: MIS CURSOS ACTIVOS */}
      {currentTab === 'mis-cursos' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold font-display text-white">Mi Campus Virtual</h3>
            <p className="text-xs text-slate-400">Materias en curso y de avance continuo para {user.nombre}</p>
          </div>

          {misCursosCargados.length === 0 ? (
            <div className="bg-[#181534] border border-white/5 rounded-3xl p-12 text-center text-slate-400 shadow-xl">
              <GraduationCap className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-base font-semibold text-white mb-2">No estás inscripto en ningún curso aún</p>
              <p className="text-xs text-slate-500 mb-6">Explora el catálogo para agregar asignaturas a tu cursada.</p>
              <button
                onClick={() => {
                  // Simula trigger de pestaña
                  const tabBtn = document.getElementById('link-explorar');
                  if (tabBtn) tabBtn.click();
                }}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold font-display shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
              >
                Explorar Catálogo de Cursos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {misCursosCargados.map((curso) => {
                const profesor = profesores.find(p => p.id === curso.profesor_id)?.nombre || curso.profesor || 'Sin asignar';
                const inscripcionFecha = misInscripciones.find(i => i.curso_id === curso.id)?.fecha || '2026-06-01';

                return (
                  <div
                    key={curso.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all"
                  >
                    <div className="h-32 bg-gradient-to-r from-violet-600 to-indigo-700 p-6 flex flex-col justify-between text-white relative">
                      <div className="absolute top-3 right-3 bg-white/15 px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-widest text-[#ece9ff]">
                        Activo
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

                      <button
                        onClick={() => setCursoSeleccionado(curso)}
                        className="w-full bg-slate-900 font-display hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 group/btn"
                      >
                        <span>Entrar al aula</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 duration-150" />
                      </button>
                    </div>
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
                        onClick={() => setCursoSeleccionado(curso)}
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

      {/* ═ POPUP: CONSULTAR DETALLES / INFORMACIÓN DEL CURSO (Syllabus) ═ */}
      {cursoSeleccionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-100 transform transition-all">
            
            {/* Cabecera del Panel */}
            <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-800 text-white relative">
              <button 
                onClick={() => setCursoSeleccionado(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#dcd6ff] block mb-1">Guía del Curso</span>
              <h3 className="font-display font-bold text-xl leading-snug truncate pr-8">
                {cursoSeleccionado.nombre}
              </h3>
            </div>

            {/* Contenido Modular de Sílabos / Syllabus */}
            <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
              
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">TUTOR EN CARGO</span>
                  <p className="text-sm font-semibold text-slate-800">
                    Prof. {profesores.find(p => p.id === cursoSeleccionado.profesor_id)?.nombre || cursoSeleccionado.profesor || 'Sin asignar'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">DURACIÓN SIMULADA</span>
                  <p className="text-sm font-semibold text-slate-800">12 Semanas (60 Cred.)</p>
                </div>
              </div>

              {/* Temario Syllabus por Unidades */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Cronograma del Plan de Estudios</h4>
                <div className="space-y-3.5">
                  {syllabusGenerico.map((unidad, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-100/60 flex gap-3 text-slate-700">
                      <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 self-start mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 leading-tight mb-1.5">{unidad.nro}</h5>
                        <ul className="space-y-1.5">
                          {unidad.clases.map((cl, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5 leading-snug">
                              <span className="text-violet-500 font-bold shrink-0 block mt-0.5">•</span>
                              <span>{cl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recursos de Aula Simulado */}
              <div className="p-4 rounded-xl border border-violet-500/10 bg-violet-500/5 space-y-2 text-violet-900 text-xs leading-relaxed">
                <div className="flex gap-2 items-start text-violet-700">
                  <MessageSquare className="w-4 h-4 shrink-0 text-violet-500 block mt-0.5" />
                  <div>
                    <span className="font-bold block text-violet-900 text-sm mb-0.5">Foro de consultas disponible</span>
                    Contacta a tu profesor en clase o comparte dudas mediante correos oficiales.
                  </div>
                </div>
              </div>

            </div>

            {/* Pie de Receso */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setCursoSeleccionado(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold transition-all hover:bg-slate-800 cursor-pointer"
              >
                Cerrar Guía Académica
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
