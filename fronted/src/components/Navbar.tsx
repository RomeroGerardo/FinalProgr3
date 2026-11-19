import React, { useEffect, useState } from 'react';
import { Menu, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface NavbarProps {
  titulo: string;
  onOpenSidebar: () => void;
  onRefreshData?: () => void;
}

export function Navbar({ titulo, onOpenSidebar, onRefreshData }: NavbarProps) {
  // null = todavía no hubo ningún request real; true/false = resultado del último.
  const [backendConectado, setBackendConectado] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkConnection = () => {
    // Comprobar estado de conexión del api.ts
    setBackendConectado(api.isBackendActive());
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    if (onRefreshData) {
      setLoading(true);
      await onRefreshData();
      checkConnection();
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <header className="h-20 bg-[#110d2c]/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
      
      {/* Lado izquierdo: Toggle Móvil + Título */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div>
          <h2 className="text-lg lg:text-xl font-bold font-display text-white tracking-tight">
            {titulo}
          </h2>
          <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
            Gestión Académica de Cursos Online • EduGestor
          </p>
        </div>
      </div>

      {/* Lado derecho: Indicador de Backend + Controles */}
      <div className="flex items-center gap-3">
        {/* Recargar Datos */}
        {onRefreshData && (
          <button
            onClick={handleManualRefresh}
            title="Sincronizar datos"
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-violet-400' : ''}`} />
          </button>
        )}

        <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

        {/* Indicador de Conexión */}
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold select-none transition-all
          ${backendConectado === true
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : backendConectado === false
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-slate-500/10 border-slate-500/20 text-slate-300'
          }
        `}>
          <div className={`w-2 h-2 rounded-full ${
            backendConectado === true ? 'bg-emerald-400 animate-pulse'
            : backendConectado === false ? 'bg-amber-400'
            : 'bg-slate-400 animate-pulse'
          }`} />
          {backendConectado === null ? (
            <span className="flex items-center gap-1">
              <Database className="w-3 w-3 inline" />
              <span>Conectando…</span>
            </span>
          ) : backendConectado ? (
            <span className="flex items-center gap-1">
              <Database className="w-3 w-3 inline" />
              <span>Base de datos conectada</span>
            </span>
          ) : (
            <span className="flex items-center gap-1" title="El backend en http://localhost:3000 no responde. Verificá que el servidor y MySQL estén levantados.">
              <AlertCircle className="w-3.5 h-3.5 inline text-amber-400" />
              <span>Backend caído</span>
            </span>
          )}
        </div>
      </div>
      
    </header>
  );
}
