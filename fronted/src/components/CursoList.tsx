import React, { useState } from 'react';
import { Book, Edit2, Trash2, User, Users, BookOpen, Search, Filter } from 'lucide-react';
import { Curso } from '../types';

interface CursoListProps {
  cursos: Curso[];
  profesores: { id: number; nombre: string }[];
  incripciones: { curso_id: number }[];
  canEdit?: boolean;
  onEdit?: (curso: Curso) => void;
  onDelete?: (id: number) => void;
  onEnroll?: (id: number) => void;
  enrolledIds?: number[];
  rol?: 'admin' | 'profesor' | 'alumno';
}

export function CursoList({
  cursos,
  profesores,
  incripciones,
  canEdit = false,
  onEdit,
  onDelete,
  onEnroll,
  enrolledIds = [],
  rol = 'alumno'
}: CursoListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProf, setSelectedProf] = useState<number | 'todos'>('todos');

  // Filtrado reactivo de cursos
  const filteredCursos = cursos.filter((curso) => {
    const matchesSearch = curso.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProf = selectedProf === 'todos' || curso.profesor_id === selectedProf;
    return matchesSearch && matchesProf;
  });

  const getAlumnosCount = (cursoId: number) => {
    return incripciones.filter(i => i.curso_id === cursoId).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Controles de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-[#181534] p-4 rounded-2xl border border-white/5 shadow-xl">
        {/* Barra de Búsqueda */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Buscar cursos por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#110d2c]/65 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Selector de Profesor */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedProf}
            onChange={(e) => setSelectedProf(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            className="w-full bg-[#110d2c]/65 border border-white/5 rounded-xl py-2.5 px-3 text-sm text-slate-300 focus:border-violet-500 focus:outline-none transition-colors"
          >
            <option value="todos">Todos los profesores</option>
            {profesores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Tarjetas de Curso */}
      {filteredCursos.length === 0 ? (
        <div className="bg-[#181534]/50 border border-white/5 rounded-2xl p-12 text-center text-slate-400">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-base font-semibold text-white mb-1">No se encontraron cursos</p>
          <p className="text-xs text-slate-400">Prueba ajustando los filtros o añade un nuevo curso.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCursos.map((curso) => {
            const isEnrolled = enrolledIds.includes(curso.id);
            const alumnosCont = getAlumnosCount(curso.id);
            const prof = profesores.find(p => p.id === curso.profesor_id)?.nombre || curso.profesor || 'Sin asignar';

            return (
              <div
                key={curso.id}
                className="bg-white rounded-2xl border border-slate-100 flex flex-col justify-between overflow-hidden shadow-md group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Banner de Curso en Gradiente */}
                <div className="h-28 bg-gradient-to-r from-violet-600 to-indigo-700 p-6 flex flex-col justify-between text-white relative">
                  <div className="absolute top-3 right-3 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-bold tracking-widest uppercase">
                    ID: {curso.id}
                  </div>
                  <Book className="w-5 h-5 text-violet-100" />
                  <h4 className="text-lg font-bold font-display truncate leading-snug">{curso.nombre}</h4>
                </div>

                {/* Contenido/Detalles de Tarjeta */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2.5 text-slate-600 text-sm">
                      <User className="w-4 h-4 text-violet-500" />
                      <span className="font-medium truncate">Prof. {prof}</span>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-slate-500 text-xs font-semibold">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{alumnosCont} {alumnosCont === 1 ? 'Alumno incripto' : 'Alumnos inscriptos'}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                    {canEdit && onEdit && (
                      <button
                        onClick={() => onEdit(curso)}
                        className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                        title="Editar Curso"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {canEdit && onDelete && (
                      <button
                        onClick={() => onDelete(curso.id)}
                        className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                        title="Eliminar Curso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {rol === 'alumno' && onEnroll && (
                      <button
                        onClick={() => !isEnrolled && onEnroll(curso.id)}
                        disabled={isEnrolled}
                        className={`
                          w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all uppercase tracking-wider
                          ${isEnrolled
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default flex items-center justify-center gap-1.5'
                            : 'bg-violet-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow active:scale-[0.98]'
                          }
                        `}
                      >
                        {isEnrolled ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Inscripto</span>
                          </>
                        ) : 'Inscribirse al curso'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
