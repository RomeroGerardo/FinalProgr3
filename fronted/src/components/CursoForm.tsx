import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Curso, Profesor } from '../types';

interface CursoFormProps {
  curso?: Curso | null; // Null si es creación, Curso si es edición
  profesores: Profesor[];
  profesorIdInicial?: number | null; // Preselección al crear desde la tarjeta de un profesor
  onSubmit: (datos: { nombre: string; profesor_id: number }) => void;
  onCancel: () => void;
}

export function CursoForm({ curso, profesores, profesorIdInicial, onSubmit, onCancel }: CursoFormProps) {
  const [nombre, setNombre] = useState('');
  const [profesorId, setProfesorId] = useState<number>(0);
  const [error, setError] = useState('');

  // Sincronizar datos si estamos editando un curso
  useEffect(() => {
    if (curso) {
      setNombre(curso.nombre);
      setProfesorId(curso.profesor_id);
    } else {
      setNombre('');
      const inicial = profesorIdInicial ?? (profesores.length > 0 ? profesores[0].id : 0);
      setProfesorId(inicial);
    }
    setError('');
  }, [curso, profesores, profesorIdInicial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre del curso es obligatorio.');
      return;
    }
    if (!profesorId || profesorId === 0) {
      setError('Debes seleccionar un profesor asignado.');
      return;
    }
    onSubmit({ nombre, profesor_id: profesorId });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-100 transform transition-all scale-100">
        
        {/* Cabecera del Formulario */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-display font-bold text-lg text-slate-900">
            {curso ? 'Editar Curso' : 'Crear Nuevo Curso'}
          </h3>
          <button 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Nombre del Curso
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej: Desarrollo Backend con Express y MySQL"
              className="w-full bg-[#fafafd] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Profesor Asignado
            </label>
            <select
              value={profesorId}
              onChange={(e) => {
                setProfesorId(Number(e.target.value));
                if (error) setError('');
              }}
              className="w-full bg-[#fafafd] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:outline-none transition-all"
            >
              {profesores.length === 0 ? (
                <option value={0}>No hay profesores registrados</option>
              ) : (
                profesores.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.email})</option>
                ))
              )}
            </select>
          </div>

          {/* Botones de acción del Modal */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold shadow-md shadow-violet-500/10 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{curso ? 'Guardar Cambios' : 'Crear Curso'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
