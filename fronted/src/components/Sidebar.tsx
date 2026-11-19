import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Users, 
  CheckSquare, 
  LogOut, 
  FileText,
  Compass,
  Briefcase,
  X,
  Radio
} from 'lucide-react';
import { Usuario } from '../types';

interface SidebarProps {
  user: Usuario;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ user, currentTab, setCurrentTab, onLogout, isOpen, onClose }: SidebarProps) {
  // Configuración de pestañas por rol
  const menuByRole = {
    admin: [
      { id: 'dashboard', label: 'Estadísticas', icon: LayoutDashboard },
      { id: 'cursos', label: 'Cursos', icon: BookOpen },
      { id: 'profesores', label: 'Profesores', icon: GraduationCap },
      { id: 'alumnos', label: 'Alumnos', icon: Users },
      { id: 'inscripciones', label: 'Inscripciones', icon: CheckSquare },
    ],
    profesor: [
      { id: 'dashboard', label: 'Inicio Profesor', icon: LayoutDashboard },
      { id: 'mis-cursos', label: 'Mis Cursos', icon: BookOpen },
      { id: 'contenido', label: 'Clases y Material', icon: FileText },
    ],
    alumno: [
      { id: 'mis-cursos', label: 'Mis Cursos', icon: GraduationCap },
      { id: 'clase-en-vivo', label: 'Clase en Vivo', icon: Radio },
      { id: 'explorar', label: 'Explorar Cursos', icon: Compass },
    ]
  };

  const menuItems = menuByRole[user.rol] || [];

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity" 
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-40
        w-72 h-screen
        bg-[#110d2c] border-r border-white/5
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Cabecera Sidebar con Botón Cerrar (Móvil) */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-white tracking-tight block">EduGestor</span>
              <span className="text-[10px] text-violet-400 font-semibold uppercase tracking-widest block">Core Panel</span>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enlaces de Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            NAVEGACIÓN
          </p>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  onClose(); // Cerrar en móviles al hacer click
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                  ${isActive 
                    ? 'bg-violet-600/10 border-l-4 border-violet-500 text-violet-400 font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <IconComponent className={`w-5 h-5 transition-transform group-hover:scale-105 duration-150 ${isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-white'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Pie de Página de Usuario */}
        <div className="p-4 border-t border-white/5 mt-auto bg-[#0d0924]/60">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.nombre}</p>
              <p className="text-[9px] text-violet-400 font-bold uppercase tracking-widest">{user.rol}</p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
