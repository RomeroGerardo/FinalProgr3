import React, { useState } from 'react';
import { GraduationCap, AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { Usuario } from '../types';

interface LoginProps {
  onLoginSuccess: (user: Usuario) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Cuentas preconfiguradas con roles para la simulación académica
  const CUENTAS_DEMO = [
    { email: 'admin@edugestor.com', pass: 'admin123', rol: 'admin', nombre: 'Administradora Inés', id: null },
    { email: 'maria@prof.com', pass: 'prof123', rol: 'profesor', nombre: 'Dra. María González', id: 1 },
    { email: 'lucas@alumno.com', pass: 'alu123', rol: 'alumno', nombre: 'Lucas Ramírez', id: 2 },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    // Buscar en cuentas demo
    const usuarioSimulado = CUENTAS_DEMO.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.pass === password
    );

    if (usuarioSimulado) {
      onLoginSuccess({
        id: usuarioSimulado.id,
        email: usuarioSimulado.email,
        nombre: usuarioSimulado.nombre,
        rol: usuarioSimulado.rol as 'admin' | 'profesor' | 'alumno',
      });
    } else {
      // Intentar una simulación flexible para que cualquier combinación sirva de prueba si el docente lo requiere
      if (email.includes('admin') && password === '123') {
        onLoginSuccess({ id: null, email, nombre: 'Admin Demo', rol: 'admin' });
      } else if (email.includes('prof') && password === '123') {
        onLoginSuccess({ id: 1, email, nombre: 'Profesor Demo', rol: 'profesor' });
      } else if (email.includes('alu') && password === '123') {
        onLoginSuccess({ id: 1, email, nombre: 'Estudiante Demo', rol: 'alumno' });
      } else {
        setError('Credenciales inválidas. Usa una de las cuentas demo de abajo.');
      }
    }
  };

  const handleFillDemo = (demo: typeof CUENTAS_DEMO[0]) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0d0924]">
      {/* Luces de fondo decorativas estilo Cosmic (Violeta y Azul sutiles) */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#181534] border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        {/* Isotipo y Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-violet-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-display font-black text-2xl text-white tracking-tight block">EduGestor</span>
            <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest block">Software Engineering</span>
          </div>
        </div>

        {/* Encabezado */}
        <h1 className="font-display text-3xl font-bold text-white mb-2 tracking-tight">Bienvenido</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Ingresa tus credenciales para gestionar tu catálogo, cursos e inscripciones.
        </p>

        {/* Error */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@ejemplo.com"
                className="w-full bg-[#110d2c]/65 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#110d2c]/65 border border-white/5 rounded-2xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 rounded-2xl transition-all transform active:scale-[0.98] mt-2 shadow-lg shadow-violet-600/30 font-display text-sm tracking-wide"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Acceso rápido a Cuentas Demo */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3.5">
            PROBAR DIFERENTES ROLES (CUENTAS DEMO)
          </p>
          <div className="flex flex-col gap-2">
            {CUENTAS_DEMO.map((demo) => {
              const roleColors = {
                admin: 'bg-amber-500/10 hover:bg-amber-500/25 border-amber-500/20 text-amber-300',
                profesor: 'bg-indigo-500/10 hover:bg-indigo-500/25 border-indigo-500/20 text-indigo-300',
                alumno: 'bg-emerald-500/10 hover:bg-emerald-500/25 border-emerald-500/20 text-emerald-300'
              };

              return (
                <button
                  key={demo.email}
                  onClick={() => handleFillDemo(demo)}
                  className={`
                    w-full py-2 px-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between group
                    ${roleColors[demo.rol as 'admin'|'profesor'|'alumno']}
                  `}
                >
                  <div className="font-semibold block">
                    {demo.nombre} 
                    <span className="text-[9px] opacity-70 font-medium block">{demo.email}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold px-2 py-0.5 roundedbg-black/20">
                    {demo.rol}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
