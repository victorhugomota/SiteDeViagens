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

const BG_GRADIENTS_DARK = [
  { key: 'gradient-default', label: 'Padrão',    css: 'linear-gradient(135deg, #020817, #0f172a)' },
  { key: 'gradient-aurora',  label: 'Aurora',    css: 'linear-gradient(135deg, #05141c, #160c29)' },
  { key: 'gradient-sunset',  label: 'Crepúsculo',css: 'linear-gradient(135deg, #1c0812, #090e1a)' },
  { key: 'gradient-emerald', label: 'Esmeralda', css: 'linear-gradient(135deg, #031811, #030d1a)' },
  { key: 'gradient-royal',   label: 'Noite Real',css: 'linear-gradient(135deg, #0c081e, #050c1e)' },
];

const BG_GRADIENTS_LIGHT = [
  { key: 'gradient-default', label: 'Suave',    css: 'linear-gradient(135deg, #f0f4f8, #e2e8f0)' },
  { key: 'gradient-rose',    label: 'Rosê',     css: 'linear-gradient(135deg, #fff1f2, #ffe4e6)' },
  { key: 'gradient-ocean',   label: 'Céu Azul', css: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' },
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
  const [bgGradient, setBgGradient] = useState<string>(() => {
    return localStorage.getItem('viajaBgGradient') || 'gradient-default';
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
    root.setAttribute('data-bg', bgGradient);
    localStorage.setItem('viajaTheme', theme);
    localStorage.setItem('viajaAccent', accent);
    localStorage.setItem('viajaBgGradient', bgGradient);
  }, [theme, accent, bgGradient]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const totalTrips = trips.length;
  const totalEstimatedBudget = trips.reduce((acc, t) => acc + (t.totalEstimateCost || 0), 0);
  const totalKm = trips.reduce((acc, t) => acc + ((t.transport?.distanceKm || 0) * 2), 0);

  const bgList = theme === 'dark' ? BG_GRADIENTS_DARK : BG_GRADIENTS_LIGHT;

  return (
    <header
      className="sticky top-0 z-30 shadow-xl backdrop-blur-md border-b"
      style={{
        backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.92)',
        borderColor: theme === 'light' ? '#e2e8f0' : '#1e293b'
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
                className="p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--accent)'
                }}
                title="Personalizar Cores e Fundo"
              >
                <Palette className="w-4 h-4" />
              </button>
              
              {showPalette && (
                <div
                  className="absolute right-0 top-full mt-2 p-3 rounded-2xl border shadow-2xl z-50 animate-fadeIn min-w-[220px] space-y-3"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                >
                  {/* Seção 1: Cor de Destaque */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                      Cor de Destaque
                    </p>
                    <div className="flex gap-1.5">
                      {ACCENT_COLORS.map(color => (
                        <button
                          key={color.key}
                          onClick={() => { setAccent(color.key); }}
                          className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
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

                  {/* Seção 2: Degradê de Fundo do Site */}
                  <div className="pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                      Degradê de Fundo
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {bgList.map(bg => (
                        <button
                          key={bg.key}
                          onClick={() => { setBgGradient(bg.key); setShowPalette(false); }}
                          className="px-2.5 py-1.5 rounded-xl border text-[10px] font-semibold text-left transition-all cursor-pointer truncate flex items-center gap-1.5"
                          style={{
                            background: bg.css,
                            borderColor: bgGradient === bg.key ? 'var(--accent)' : 'var(--border-primary)',
                            color: '#ffffff',
                            boxShadow: bgGradient === bg.key ? '0 0 0 1px var(--accent)' : 'none'
                          }}
                          title={bg.label}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
                          <span className="truncate">{bg.label}</span>
                        </button>
                      ))}
                    </div>
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
