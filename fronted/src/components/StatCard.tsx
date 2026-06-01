import React from 'react';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  titulo: string;
  valor: number | string;
  iconName: keyof typeof Icons;
  trend?: string;
  trendType?: 'positive' | 'neutral' | 'negative';
  accentColor?: string; // e.g. "indigo", "emerald", "amber", "blue"
}

export function StatCard({
  titulo,
  valor,
  iconName,
  trend,
  trendType = 'positive',
  accentColor = 'indigo'
}: StatCardProps) {
  // Obtener dinámicamente el componente de Icono de lucide-react
  const IconComponent = Icons[iconName] as any;

  // Clases de colores según el color de acento
  const borderColors: Record<string, string> = {
    indigo: "border-[#8b7cf8]/20 bg-[#8b7cf8]/5 text-[#8b7cf8]",
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-400",
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-400"
  };

  const trendColors = {
    positive: "text-emerald-400 bg-emerald-500/10",
    neutral: "text-slate-400 bg-slate-500/10",
    negative: "text-rose-400 bg-rose-500/10"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className="bg-[#181534] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group"
    >
      {/* Fondo Decorativo Sutil */}
      <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-br from-white/5 to-transparent rounded-full translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-300" />
      
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl border ${borderColors[accentColor] || borderColors.indigo}`}>
          {IconComponent && <IconComponent className="w-6 h-6" />}
        </div>
        
        {trend && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${trendColors[trendType]}`}>
            {trend}
          </span>
         )}
      </div>

      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
        {titulo}
      </p>
      
      <h3 className="text-3xl font-bold font-display text-white tracking-tight">
        {valor}
      </h3>
    </motion.div>
  );
}
