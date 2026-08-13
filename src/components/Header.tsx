import React from 'react';
import { Calendar as CalendarIcon, Grid, Plus, DollarSign, MapPin, Sun, Moon, Palette } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { Trip } from '../types/trip';
import type { ThemeSettings } from './ThemeModal';

interface HeaderProps {
  activeView: 'grid' | 'calendar';
  setActiveView: (view: 'grid' | 'calendar') => void;
  onOpenCreateModal: () => void;
  onOpenThemeModal: () => void;
  trips: Trip[];
  themeSettings: ThemeSettings;
  onToggleThemeMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenCreateModal,
  onOpenThemeModal,
  trips,
  themeSettings,
  onToggleThemeMode
}) => {
  const totalTrips = trips.length;
  const totalEstimatedBudget = trips.reduce((acc, t) => acc + (t.totalEstimateCost || 0), 0);
  const totalKm = trips.reduce((acc, t) => acc + ((t.transport?.distanceKm || 0) * 2), 0);

  const isLight = themeSettings.themeMode === 'light';

  return (
    <header
      className="sticky top-0 z-30 shadow-xl backdrop-blur-md border-b transition-colors"
      style={{
        backgroundColor: 'var(--header-bg, rgba(15,23,42,0.92))',
        borderColor: isLight ? '#e2e8f0' : '#1e293b'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
        
        {/* Linha Superior: Logo + Título + Tema / Personalização */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3 shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}logo.jpg`}
              alt="Victor e Maria"
              className="w-11 h-11 rounded-2xl object-cover shadow-lg shrink-0"
            />
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Viagens Victor e Maria
              </h1>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Planejador de Viagens</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleThemeMode}
              className="p-2 rounded-xl border transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-secondary)'
              }}
              title={isLight ? 'Mudar para modo escuro' : 'Mudar para modo claro'}
            >
              {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            <button
              onClick={onOpenThemeModal}
              className="p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)'
              }}
              title="Personalizar Cores e Aparência do Sistema"
            >
              <Palette className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">Personalizar Cores</span>
            </button>
          </div>
        </div>

        {/* Linha Inferior: Métricas + Visão + Nova Viagem */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          
          <div
            className="grid grid-cols-3 sm:flex gap-2 p-1.5 rounded-2xl border"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
          >
            <div className="px-2 py-1 rounded-xl border text-center sm:text-left" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold block" style={{ color: 'var(--text-muted)' }}>Viagens</span>
              <span className="text-xs sm:text-sm font-bold flex items-center justify-center sm:justify-start gap-1" style={{ color: 'var(--text-primary)' }}>
                <MapPin className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                {totalTrips}
              </span>
            </div>

            <div className="px-2 py-1 rounded-xl border text-center sm:text-left" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold block" style={{ color: 'var(--text-muted)' }}>Orçamento</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-500 flex items-center justify-center sm:justify-start gap-1">
                <DollarSign className="w-3 h-3" />
                {formatCurrency(totalEstimatedBudget)}
              </span>
            </div>

            <div className="px-2 py-1 rounded-xl border text-center sm:text-left" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold block" style={{ color: 'var(--text-muted)' }}>Km Total</span>
              <span className="text-xs sm:text-sm font-bold text-blue-500">{totalKm.toLocaleString('pt-BR')} km</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex p-1 rounded-xl border flex-1 sm:flex-initial"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
            >
              <button
                onClick={() => setActiveView('grid')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                style={activeView === 'grid' ? {
                  backgroundColor: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-border)'
                } : { color: 'var(--text-muted)' }}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Viagens</span>
              </button>

              <button
                onClick={() => setActiveView('calendar')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                style={activeView === 'calendar' ? {
                  backgroundColor: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-border)'
                } : { color: 'var(--text-muted)' }}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>
            </div>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-lg active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
              style={{
                background: `linear-gradient(135deg, var(--accent-dark), var(--accent))`,
                boxShadow: `0 4px 14px var(--shadow-accent)`
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
