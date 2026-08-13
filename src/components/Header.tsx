import React from 'react';
import { Calendar as CalendarIcon, Grid, Plus, DollarSign, MapPin, Sun, Moon } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { Trip } from '../types/trip';

interface HeaderProps {
  activeView: 'grid' | 'calendar';
  setActiveView: (view: 'grid' | 'calendar') => void;
  onOpenCreateModal: () => void;
  trips: Trip[];
  themeMode: 'dark' | 'light';
  onToggleThemeMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenCreateModal,
  trips,
  themeMode,
  onToggleThemeMode
}) => {
  const totalTrips = trips.length;
  const totalEstimatedBudget = trips.reduce((acc, t) => acc + (t.totalEstimateCost || 0), 0);
  const totalKm = trips.reduce((acc, t) => acc + ((t.transport?.distanceKm || 0) * 2), 0);

  const isLight = themeMode === 'light';

  return (
    <header
      className="sticky top-0 z-30 shadow-xl backdrop-blur-md border-b transition-colors"
      style={{
        backgroundColor: '#0f172a',
        borderColor: '#1e293b'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
        
        {/* Linha Superior: Logo + Título + Botão Único de Modo Claro/Escuro */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3 shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}logo.jpg`}
              alt="Victor e Maria"
              className="w-11 h-11 rounded-2xl object-cover shadow-lg shrink-0"
            />
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-sm">
                Viagens Victor e Maria
              </h1>
              <p className="text-[11px] text-slate-300 font-medium">Planejador de Viagens</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleThemeMode}
              className="p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 shadow-md active:scale-95 text-slate-200 border-slate-700 bg-slate-800 hover:bg-slate-700"
              title={isLight ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro'}
            >
              {isLight ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold hidden sm:inline text-slate-200">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold hidden sm:inline text-slate-200">Modo Escuro</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Linha Inferior: Métricas + Visão + Nova Viagem */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          
          <div
            className="grid grid-cols-3 sm:flex gap-2 p-1.5 rounded-2xl border bg-slate-950/80 border-slate-800"
          >
            <div className="px-2.5 py-1 rounded-xl border border-slate-800 text-center sm:text-left">
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold block text-slate-400">Viagens</span>
              <span className="text-xs sm:text-sm font-bold flex items-center justify-center sm:justify-start gap-1 text-white">
                <MapPin className="w-3 h-3 text-cyan-400" />
                {totalTrips}
              </span>
            </div>

            <div className="px-2.5 py-1 rounded-xl border border-slate-800 text-center sm:text-left">
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold block text-slate-400">Orçamento</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                <DollarSign className="w-3 h-3" />
                {formatCurrency(totalEstimatedBudget)}
              </span>
            </div>

            <div className="px-2.5 py-1 rounded-xl border border-slate-800 text-center sm:text-left">
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold block text-slate-400">Km Total</span>
              <span className="text-xs sm:text-sm font-bold text-blue-400">{totalKm.toLocaleString('pt-BR')} km</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex p-1 rounded-xl border flex-1 sm:flex-initial bg-slate-950/80 border-slate-800"
            >
              <button
                onClick={() => setActiveView('grid')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeView === 'grid'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Viagens</span>
              </button>

              <button
                onClick={() => setActiveView('calendar')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeView === 'calendar'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>
            </div>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-lg active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
              style={{
                background: `linear-gradient(135deg, #0891b2, #06b6d4)`,
                boxShadow: `0 4px 14px rgba(6,182,212,0.3)`
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Nova Viagem</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
