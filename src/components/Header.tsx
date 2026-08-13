import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Grid, Plus, DollarSign, MapPin, Sun, Moon, Palette } from 'lucide-react';
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
  const totalKm = trips.reduce((acc, t) => acc + ((t.transport?.distanceKm || 0) * 2), 0);

  return (
    <header
      className="sticky top-0 z-30 shadow-xl backdrop-blur-md border-b"
      style={{
        backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
        borderColor: theme === 'light' ? '#e2e8f0' : '#1e293b'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
        
        {/* Linha Superior: Logo + Título + Tema / Cores */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3 shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}logo.jpg`}
              alt="Victor e Maria"
              className="w-11 h-11 rounded-2xl object-cover border-2 shadow-lg shrink-0"
              style={{ borderColor: 'var(--accent)' }}
            />
            <div>
              <h1 className="text-lg sm:text-xl font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                Viagens Victor e Maria
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full hidden sm:inline-block"
                  style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
                >
                  Pro
                </span>
              </h1>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Planejador de Viagens</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
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
