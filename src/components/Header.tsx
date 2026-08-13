import React, { useState, useEffect } from 'react';
import { Compass, Calendar as CalendarIcon, Grid, Plus, DollarSign, MapPin, Sun, Moon, Palette } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { Trip } from '../types/trip';

interface HeaderProps {
  activeView: 'grid' | 'calendar';
  setActiveView: (view: 'grid' | 'calendar') => void;
  onOpenCreateModal: () => void;
  trips: Trip[];
}

const ACCENT_COLORS = [
  { key: 'cyan',   label: 'Ciano',   hex: '#06b6d4' },
  { key: 'purple', label: 'Roxo',    hex: '#a855f7' },
  { key: 'green',  label: 'Verde',   hex: '#22c55e' },
  { key: 'orange', label: 'Laranja', hex: '#f97316' },
  { key: 'pink',   label: 'Rosa',    hex: '#ec4899' },
  { key: 'blue',   label: 'Azul',    hex: '#3b82f6' },
];

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenCreateModal,
  trips
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('viajaTheme') as 'dark' | 'light') || 'dark';
  });
  const [accent, setAccent] = useState<string>(() => {
    return localStorage.getItem('viajaAccent') || 'cyan';
  });
  const [showPalette, setShowPalette] = useState(false);

  // Aplica tema e accent no elemento raiz
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    root.setAttribute('data-accent', accent);
    localStorage.setItem('viajaTheme', theme);
    localStorage.setItem('viajaAccent', accent);
  }, [theme, accent]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const totalTrips = trips.length;
  const totalEstimatedBudget = trips.reduce((acc, t) => acc + (t.totalEstimateCost || 0), 0);
  const totalKm = trips.reduce((acc, t) => acc + ((t.transport?.distanceKm || 0) * 2), 0); // sempre ida+volta

  const currentAccentHex = ACCENT_COLORS.find(c => c.key === accent)?.hex || '#06b6d4';

  return (
    <header
      className="sticky top-0 z-30 shadow-xl backdrop-blur-md border-b"
      style={{
        backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.92)',
        borderColor: theme === 'light' ? '#e2e8f0' : '#1e293b'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
          
          {/* Logo & Título */}
          <div className="flex items-center space-x-3 shrink-0">
            <div
              className="p-2.5 rounded-2xl shadow-lg text-white"
              style={{ background: `linear-gradient(135deg, ${currentAccentHex}, #3b82f6)` }}
            >
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                ViajaMais{' '}
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest ml-1 px-2 py-0.5 rounded-full"
                  style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
                >
                  Pro
                </span>
              </h1>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Planejador de Viagens</p>
            </div>
          </div>

          {/* Cards de Métricas */}
          <div
            className="flex gap-2 p-1.5 rounded-2xl border"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
          >
            <div className="px-3 py-1.5 rounded-xl border" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--text-muted)' }}>Viagens</span>
              <span className="text-sm font-bold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                {totalTrips}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl border" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--text-muted)' }}>Orçamento</span>
              <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {formatCurrency(totalEstimatedBudget)}
              </span>
            </div>
            <div className="hidden sm:block px-3 py-1.5 rounded-xl border" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--text-muted)' }}>Km Total</span>
              <span className="text-sm font-bold text-blue-500">{totalKm.toLocaleString('pt-BR')} km</span>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Seletor de Visão */}
            <div
              className="flex p-1 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
            >
              <button
                onClick={() => setActiveView('grid')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                style={activeView === 'grid' ? {
                  backgroundColor: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-border)'
                } : { color: 'var(--text-muted)' }}
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Viagens</span>
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                style={activeView === 'calendar' ? {
                  backgroundColor: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-border)'
                } : { color: 'var(--text-muted)' }}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Agenda</span>
              </button>
            </div>

            {/* Botão de Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-secondary)'
              }}
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Seletor de Cores */}
            <div className="relative">
              <button
                onClick={() => setShowPalette(prev => !prev)}
                className="p-2 rounded-xl border transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--accent)'
                }}
                title="Mudar cor de destaque"
              >
                <Palette className="w-4 h-4" />
              </button>
              
              {showPalette && (
                <div
                  className="absolute right-0 top-full mt-2 p-2 rounded-2xl border shadow-2xl z-50 animate-fadeIn"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                >
                  <p className="text-[10px] font-semibold uppercase mb-2 px-1" style={{ color: 'var(--text-muted)' }}>Cor de Destaque</p>
                  <div className="flex gap-1.5">
                    {ACCENT_COLORS.map(color => (
                      <button
                        key={color.key}
                        onClick={() => { setAccent(color.key); setShowPalette(false); }}
                        className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
                        style={{
                          backgroundColor: color.hex,
                          borderColor: accent === color.key ? '#ffffff' : 'transparent',
                          boxShadow: accent === color.key ? `0 0 0 2px ${color.hex}` : 'none'
                        }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botão Nova Viagem */}
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, var(--accent-dark), var(--accent))`,
                boxShadow: `0 4px 14px var(--shadow-accent)`
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Viagem</span>
              <span className="sm:hidden">Nova</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
