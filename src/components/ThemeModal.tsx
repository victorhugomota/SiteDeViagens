import React, { useState, useEffect } from 'react';
import { X, Palette, Sparkles, RefreshCw, Check, Sun, Moon, Layout, Eye } from 'lucide-react';

export interface ThemeSettings {
  themeMode: 'dark' | 'light';
  accentColor: string;
  bgGradient: string;
  cardBg: string;
  headerBg: string;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  themeMode: 'dark',
  accentColor: 'cyan',
  bgGradient: 'gradient-default',
  cardBg: 'card-default',
  headerBg: 'header-default',
};

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ThemeSettings;
  onApplySettings: (newSettings: ThemeSettings) => void;
}

const ACCENT_OPTIONS = [
  { key: 'cyan',   label: 'Ciano',   hex: '#06b6d4' },
  { key: 'purple', label: 'Roxo',    hex: '#a855f7' },
  { key: 'green',  label: 'Verde',   hex: '#22c55e' },
  { key: 'orange', label: 'Laranja', hex: '#f97316' },
  { key: 'pink',   label: 'Rosa',    hex: '#ec4899' },
  { key: 'blue',   label: 'Azul',    hex: '#3b82f6' },
  { key: 'amber',  label: 'Dourado', hex: '#eab308' },
  { key: 'red',    label: 'Rubi',    hex: '#ef4444' },
];

const BG_GRADIENTS_DARK = [
  { key: 'gradient-default', label: 'Cosmos Escuro', css: 'linear-gradient(135deg, #020817, #0f172a)' },
  { key: 'gradient-aurora',  label: 'Aurora Teal',   css: 'linear-gradient(135deg, #05141c, #160c29)' },
  { key: 'gradient-sunset',  label: 'Pôr do Sol',    css: 'linear-gradient(135deg, #1c0812, #090e1a)' },
  { key: 'gradient-emerald', label: 'Esmeralda',     css: 'linear-gradient(135deg, #031811, #030d1a)' },
  { key: 'gradient-royal',   label: 'Noite Real',    css: 'linear-gradient(135deg, #0c081e, #050c1e)' },
];

const BG_GRADIENTS_LIGHT = [
  { key: 'gradient-default', label: 'Padrão Suave', css: 'linear-gradient(135deg, #f0f4f8, #e2e8f0)' },
  { key: 'gradient-rose',    label: 'Rosê Aurora',  css: 'linear-gradient(135deg, #fff1f2, #ffe4e6)' },
  { key: 'gradient-ocean',   label: 'Céu Azul',     css: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' },
];

const CARD_BG_DARK = [
  { key: 'card-default', label: 'Slate Padrão',  hex: '#1e293b' },
  { key: 'card-obsidian',label: 'Obsidiana',     hex: '#0f172a' },
  { key: 'card-purple',  label: 'Roxo Noturno',  hex: '#1e1b4b' },
  { key: 'card-emerald', label: 'Verde Escuro',  hex: '#064e3b' },
  { key: 'card-charcoal',label: 'Carvão',        hex: '#18181b' },
];

const CARD_BG_LIGHT = [
  { key: 'card-default', label: 'Branco Neve',   hex: '#ffffff' },
  { key: 'card-slate-light', label: 'Cinza Suave', hex: '#f8fafc' },
  { key: 'card-cream',    label: 'Creme',        hex: '#fffbe6' },
];

const HEADER_STYLES_DARK = [
  { key: 'header-default',     label: 'Glass Transparente', css: 'rgba(15, 23, 42, 0.92)' },
  { key: 'header-solid-dark',  label: 'Escuro Sólido',      css: '#090d16' },
  { key: 'header-indigo',      label: 'Índigo Noturno',     css: '#1e1b4b' },
  { key: 'header-teal',        label: 'Teal Profundo',      css: '#042f2e' },
];

const HEADER_STYLES_LIGHT = [
  { key: 'header-default',     label: 'Cristal Suave',  css: 'rgba(255, 255, 255, 0.92)' },
  { key: 'header-solid-light', label: 'Branco Puro',    css: '#ffffff' },
  { key: 'header-sky',         label: 'Azul Suave',     css: '#e0f2fe' },
];

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  settings,
  onApplySettings
}) => {
  const [draft, setDraft] = useState<ThemeSettings>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const isDark = draft.themeMode === 'dark';
  const bgList = isDark ? BG_GRADIENTS_DARK : BG_GRADIENTS_LIGHT;
  const cardList = isDark ? CARD_BG_DARK : CARD_BG_LIGHT;
  const headerList = isDark ? HEADER_STYLES_DARK : HEADER_STYLES_LIGHT;

  const currentAccentHex = ACCENT_OPTIONS.find(a => a.key === draft.accentColor)?.hex || '#06b6d4';

  const handleReset = () => {
    setDraft(DEFAULT_THEME_SETTINGS);
  };

  const handleSave = () => {
    onApplySettings(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-4 border flex flex-col max-h-[90vh]"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
      >
        {/* Topo do Modal */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center space-x-3">
            <div
              className="p-2.5 rounded-2xl text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${currentAccentHex}, #3b82f6)` }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                Estúdio de Personalização Visual
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Customize as cores do cabeçalho, fundo, cards e botões do seu sistema
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full border transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Personalizável */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">

          {/* 1. MODO TEMA (ESCURO / CLARO) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <Layout className="w-4 h-4" style={{ color: currentAccentHex }} /> Modo do Tema
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDraft(prev => ({ ...prev, themeMode: 'dark' }))}
                className="p-3 rounded-2xl border flex items-center justify-center gap-2 font-semibold text-xs transition-all cursor-pointer"
                style={{
                  backgroundColor: draft.themeMode === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'var(--bg-input)',
                  borderColor: draft.themeMode === 'dark' ? currentAccentHex : 'var(--border-primary)',
                  color: draft.themeMode === 'dark' ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: draft.themeMode === 'dark' ? `0 0 0 2px ${currentAccentHex}` : 'none'
                }}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Modo Escuro</span>
                {draft.themeMode === 'dark' && <Check className="w-4 h-4 ml-auto" style={{ color: currentAccentHex }} />}
              </button>

              <button
                type="button"
                onClick={() => setDraft(prev => ({ ...prev, themeMode: 'light' }))}
                className="p-3 rounded-2xl border flex items-center justify-center gap-2 font-semibold text-xs transition-all cursor-pointer"
                style={{
                  backgroundColor: draft.themeMode === 'light' ? '#ffffff' : 'var(--bg-input)',
                  borderColor: draft.themeMode === 'light' ? currentAccentHex : 'var(--border-primary)',
                  color: draft.themeMode === 'light' ? '#0f172a' : 'var(--text-muted)',
                  boxShadow: draft.themeMode === 'light' ? `0 0 0 2px ${currentAccentHex}` : 'none'
                }}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Modo Claro</span>
                {draft.themeMode === 'light' && <Check className="w-4 h-4 ml-auto" style={{ color: currentAccentHex }} />}
              </button>
            </div>
          </div>

          {/* 2. COR DE DESTAQUE (BOTÕES E ÍCONES) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <Sparkles className="w-4 h-4" style={{ color: currentAccentHex }} /> Cor de Destaque (Botões & Ícones)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {ACCENT_OPTIONS.map(c => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, accentColor: c.key }))}
                  className="p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: draft.accentColor === c.key ? c.hex : 'var(--border-primary)',
                    boxShadow: draft.accentColor === c.key ? `0 0 0 2px ${c.hex}` : 'none'
                  }}
                >
                  <span className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                  <span className="text-[10px] font-semibold truncate w-full text-center" style={{ color: 'var(--text-primary)' }}>
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. DEGRADÊ DE FUNDO DO SITE */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              🖼️ Degradê de Fundo da Aplicação
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {bgList.map(bg => (
                <button
                  key={bg.key}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, bgGradient: bg.key }))}
                  className="p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden"
                  style={{
                    background: bg.css,
                    borderColor: draft.bgGradient === bg.key ? currentAccentHex : 'var(--border-primary)',
                    boxShadow: draft.bgGradient === bg.key ? `0 0 0 2px ${currentAccentHex}` : 'none'
                  }}
                >
                  <span className="text-xs font-bold block text-white drop-shadow-md">{bg.label}</span>
                  <span className="text-[9px] text-white/80 block mt-0.5">Fundo Dinâmico</span>
                  {draft.bgGradient === bg.key && (
                    <Check className="w-4 h-4 absolute top-2 right-2 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 4. COR DOS CARDS DAS VIAGENS */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              📌 Cor da Região da Viagem (Cards de Viagem)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {cardList.map(c => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, cardBg: c.key }))}
                  className="p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: draft.cardBg === c.key ? currentAccentHex : 'var(--border-primary)',
                    boxShadow: draft.cardBg === c.key ? `0 0 0 2px ${currentAccentHex}` : 'none'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                    <span className="text-xs font-bold" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{c.label}</span>
                  </div>
                  {draft.cardBg === c.key && <Check className="w-4 h-4" style={{ color: currentAccentHex }} />}
                </button>
              ))}
            </div>
          </div>

          {/* 5. ESTILO DO CABEÇALHO */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              🔝 Cor e Estilo do Cabeçalho Superior
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {headerList.map(h => (
                <button
                  key={h.key}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, headerBg: h.key }))}
                  className="p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between"
                  style={{
                    backgroundColor: h.css,
                    borderColor: draft.headerBg === h.key ? currentAccentHex : 'var(--border-primary)',
                    boxShadow: draft.headerBg === h.key ? `0 0 0 2px ${currentAccentHex}` : 'none'
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{h.label}</span>
                  {draft.headerBg === h.key && <Check className="w-4 h-4" style={{ color: currentAccentHex }} />}
                </button>
              ))}
            </div>
          </div>

          {/* PRÉ-VISUALIZAÇÃO AO VIVO */}
          <div
            className="p-4 rounded-2xl border space-y-2"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Eye className="w-3.5 h-3.5" style={{ color: currentAccentHex }} /> Pré-visualização do Seu Tema
            </span>
            <div className="flex items-center justify-between p-3 rounded-xl border text-xs" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentAccentHex }} />
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Card de Demonstração</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-white" style={{ backgroundColor: currentAccentHex }}>
                Ativo
              </span>
            </div>
          </div>

        </div>

        {/* Rodapé com Ações */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between shrink-0 gap-3"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
        >
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restaurar Padrão
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              style={{
                background: `linear-gradient(135deg, ${currentAccentHex}, #3b82f6)`,
                boxShadow: `0 4px 14px rgba(6,182,212,0.3)`
              }}
            >
              <Check className="w-4 h-4" /> Aplicar Tema
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
