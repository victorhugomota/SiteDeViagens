import React from 'react';
import { Compass, Calendar as CalendarIcon, Grid, Plus, DollarSign, MapPin } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { Trip } from '../types/trip';

interface HeaderProps {
  activeView: 'grid' | 'calendar';
  setActiveView: (view: 'grid' | 'calendar') => void;
  onOpenCreateModal: () => void;
  trips: Trip[];
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenCreateModal,
  trips
}) => {
  const totalTrips = trips.length;
  const totalEstimatedBudget = trips.reduce((acc, t) => acc + (t.totalEstimateCost || 0), 0);
  const totalKm = trips.reduce((acc, t) => acc + ((t.transport?.distanceKm || 0) * (t.transport?.isRoundTrip ? 2 : 1)), 0);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-xl backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Título */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 text-white">
              <Compass className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ViajaMais <span className="text-cyan-400 text-xs font-semibold uppercase tracking-widest ml-1 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50">Pro</span>
              </h1>
              <p className="text-xs text-slate-400">Planejador de Viagens & Gestão Inteligente de Custos</p>
            </div>
          </div>

          {/* Cards Rápidos de Métricas */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Viagens</span>
              <span className="text-sm font-bold text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {totalTrips}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Orçamento Total</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                {formatCurrency(totalEstimatedBudget)}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Distância Total</span>
              <span className="text-sm font-bold text-blue-400">
                {totalKm.toLocaleString('pt-BR')} km
              </span>
            </div>
          </div>

          {/* Controles de Visão e Ação Principal */}
          <div className="flex items-center gap-3">
            {/* Seletor de Visão (Cards / Agenda) */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveView('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  activeView === 'grid'
                    ? 'bg-slate-800 text-cyan-400 shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Viagens</span>
              </button>

              <button
                onClick={() => setActiveView('calendar')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  activeView === 'calendar'
                    ? 'bg-slate-800 text-cyan-400 shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Agenda</span>
              </button>
            </div>

            {/* Botão Nova Viagem */}
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all duration-200 cursor-pointer"
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
