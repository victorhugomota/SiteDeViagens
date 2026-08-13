import React, { useState, useRef } from 'react';
import {
  X, MapPin, Calendar, Hotel, Fuel, Ticket, Plus, Trash2, Navigation,
  Edit3, CheckCircle2, Car, Camera, ExternalLink, Coffee
} from 'lucide-react';
import type { Trip, TripMemory } from '../types/trip';
import { formatCurrency, formatDate, calculateNights, getDestinationImageUrl } from '../utils/formatters';
import { MapRoute } from './MapRoute';
import { addMemoryToTrip, removeMemoryFromTrip } from '../services/tripService';

interface TripDetailModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
  onAddExtraItem: (trip: Trip, item: { description: string; value: number }) => Promise<void>;
  onRemoveExtraItem: (trip: Trip, itemId: string) => Promise<void>;
}

// Comprime imagem para base64
async function compressImageToBase64(file: File, maxPx = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round((height / width) * maxPx); width = maxPx; }
        else { width = Math.round((width / height) * maxPx); height = maxPx; }
      }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = url;
  });
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  trip, isOpen, onClose, onEdit, onDelete, onAddExtraItem, onRemoveExtraItem
}) => {
  const [newDesc, setNewDesc] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<TripMemory | null>(null);
  const memoryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !trip) return null;

  const nights = calculateNights(trip.startDate, trip.endDate);
  const imageUrl = trip.coverImageBase64 || getDestinationImageUrl(trip.destinationAddress, trip.coverImageUrl);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    const val = parseFloat(newValue.replace(',', '.')) || 0;
    setIsAdding(true);
    try {
      await onAddExtraItem(trip, { description: newDesc.trim(), value: val });
      setNewDesc(''); setNewValue('');
    } finally { setIsAdding(false); }
  };

  const handleAddMemory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsAddingMemory(true);
    try {
      for (const file of files) {
        const base64 = await compressImageToBase64(file, 1000);
        await addMemoryToTrip(trip, { imageBase64: base64, caption: '' });
      }
    } finally { setIsAddingMemory(false); }
  };

  const handleRemoveMemory = async (memoryId: string) => {
    if (!window.confirm('Remover esta foto?')) return;
    await removeMemoryFromTrip(trip, memoryId);
    if (selectedMemory?.id === memoryId) setSelectedMemory(null);
  };

  const memories = trip.memories || [];

  // Agrupar itens por tipo
  const mealItems = (trip.extraItems || []).filter(i => i.mealType);
  const customItems = (trip.extraItems || []).filter(i => !i.mealType);

  const sectionStyle = { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' };
  const inputStyle = { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' };
  const labelStyle = { color: 'var(--text-muted)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-4"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
      >
        {/* Banner */}
        <div className="relative h-52 w-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <img src={imageUrl} alt={trip.destinationAddress} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <button onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
            <div>
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-2 inline-block"
                style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
              >
                Detalhamento Completo
              </span>
              <h2 className="text-2xl font-black text-white drop-shadow-md">{trip.title || trip.destinationAddress}</h2>
              <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-rose-400" /> {trip.destinationAddress}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { onClose(); onEdit(trip); }}
                className="p-2.5 rounded-xl bg-black/60 hover:bg-blue-900/80 text-white border border-white/20 cursor-pointer transition-colors"
                title="Editar"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Excluir a viagem "${trip.title || trip.destinationAddress}"?`)) {
                    onDelete(trip.id);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl bg-black/60 hover:bg-rose-900/80 text-white border border-white/20 cursor-pointer transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">

          {/* Origem e Período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border p-4 text-xs" style={sectionStyle}>
            <div>
              <span className="flex items-center gap-1 font-semibold mb-1.5" style={labelStyle}>
                <Navigation className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Partida:
              </span>
              <p className="rounded-xl border px-3 py-2" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
                {trip.originAddress}
              </p>
            </div>
            <div>
              <span className="flex items-center gap-1 font-semibold mb-1.5" style={labelStyle}>
                <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Período:
              </span>
              <p className="rounded-xl border px-3 py-2 flex justify-between" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
                <span>{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
                <span className="font-bold" style={{ color: 'var(--accent)' }}>({nights} noites)</span>
              </p>
            </div>
          </div>

          {/* Fotos da Hospedagem */}
          {(trip.accommodation?.photos?.length || 0) > 0 && (
            <div className="rounded-2xl border p-4 space-y-3" style={sectionStyle}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={labelStyle}>
                  <Hotel className="w-4 h-4 text-indigo-400" /> {trip.accommodation?.name || 'Hospedagem'}
                </h3>
                {trip.accommodation?.url && (
                  <a href={trip.accommodation.url} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] flex items-center gap-1 hover:underline" style={{ color: 'var(--accent)' }}>
                    <ExternalLink className="w-3 h-3" /> Ver hospedagem ↗
                  </a>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {trip.accommodation.photos!.map((photo, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden h-24">
                    <img src={photo} alt={`Hospedagem ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mapa */}
          <MapRoute
            destinationName={trip.destinationAddress}
            destLat={trip.destinationLat}
            destLng={trip.destinationLng}
          />

          {/* Decomposição de Custos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { label: 'Hospedagem', icon: <Hotel className="w-4 h-4 text-indigo-400" />, value: formatCurrency(trip.accommodation?.totalCost || 0), sub: `${nights}x ${formatCurrency(trip.accommodation?.pricePerNight || 0)}` },
              { label: 'Combustível', icon: <Fuel className="w-4 h-4 text-amber-400" />, value: formatCurrency(trip.transport?.calculatedFuelCost || 0), sub: `${(trip.transport?.distanceKm || 0) * 2} km (I+V)` },
              { label: 'Pedágios', icon: <Ticket className="w-4 h-4" style={{ color: 'var(--accent)' }} />, value: formatCurrency(trip.transport?.tollCost || 0), sub: 'Ida e Volta' },
              {
                label: trip.carRental?.enabled ? 'Carro Alugado' : 'Aluguel Carro',
                icon: <Car className="w-4 h-4 text-blue-400" />,
                value: trip.carRental?.enabled ? formatCurrency(trip.carRental.totalCost) : 'Não incluído',
                sub: trip.carRental?.enabled ? `${trip.carRental.daysCount} diárias` : '—'
              }
            ].map(({ label, icon, value, sub }) => (
              <div key={label} className="rounded-2xl border p-3.5" style={sectionStyle}>
                <span className="flex items-center gap-1.5 font-semibold" style={labelStyle}>{icon} {label}</span>
                <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
                <span className="text-[10px] block mt-0.5" style={labelStyle}>{sub}</span>
              </div>
            ))}
          </div>

          {/* Refeições por Dia */}
          {mealItems.length > 0 && (
            <div className="rounded-2xl border p-4 space-y-3" style={sectionStyle}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={labelStyle}>
                  <Coffee className="w-4 h-4 text-amber-400" /> Alimentação por Dia
                  {trip.breakfastIncluded && (
                    <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>Café incluso na hospedagem</span>
                  )}
                </h3>
                <span className="text-xs font-bold text-emerald-500">
                  {formatCurrency(mealItems.reduce((s, i) => s + i.value, 0))}
                </span>
              </div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar">
                {mealItems.map(item => (
                  <div key={item.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl border text-xs"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
                  >
                    <span style={{ color: 'var(--text-primary)' }}>{item.description}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-500">{formatCurrency(item.value)}</span>
                      <button onClick={() => onRemoveExtraItem(trip, item.id)}
                        className="text-rose-400 hover:text-rose-300 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itens Extras */}
          <div className="rounded-2xl border p-4 space-y-4" style={sectionStyle}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={labelStyle}>
                <Ticket className="w-4 h-4 text-emerald-400" /> Gastos & Itens Extras
              </h3>
              <span className="text-xs font-bold text-emerald-500">
                Total Extras: {formatCurrency(customItems.reduce((a, i) => a + i.value, 0))}
              </span>
            </div>

            <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2">
              <input type="text" placeholder="Ex: Passeio, Ingressos..."
                value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                className="flex-1 border rounded-xl px-3.5 py-2 text-xs outline-none" style={inputStyle} />
              <input type="number" step="0.01" placeholder="Valor R$"
                value={newValue} onChange={(e) => setNewValue(e.target.value)}
                className="w-full sm:w-28 border rounded-xl px-3.5 py-2 text-xs outline-none" style={inputStyle} />
              <button type="submit" disabled={isAdding}
                className="px-4 py-2 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                style={{ backgroundColor: '#059669' }}>
                <Plus className="w-4 h-4" /> {isAdding ? '...' : 'Adicionar'}
              </button>
            </form>

            {customItems.length > 0 ? (
              <div className="space-y-1.5">
                {customItems.map(item => (
                  <div key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border text-xs"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
                  >
                    <span style={{ color: 'var(--text-primary)' }}>{item.description}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-500">{formatCurrency(item.value)}</span>
                      <button onClick={() => onRemoveExtraItem(trip, item.id)}
                        className="text-rose-400 hover:text-rose-300 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic" style={labelStyle}>Nenhum item extra adicionado.</p>
            )}
          </div>

          {/* ESTIMATIVA TOTAL */}
          <div
            className="p-4 rounded-2xl border flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderColor: 'var(--accent-border)' }}
          >
            <div>
              <span className="text-xs uppercase font-semibold block" style={labelStyle}>Estimativa Geral</span>
              <span className="text-2xl font-black text-emerald-500">{formatCurrency(trip.totalEstimateCost || 0)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs" style={labelStyle}>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Sincronizado no Firebase</span>
            </div>
          </div>

          {/* ========================
              SEÇÃO DE LEMBRANÇAS
              ======================== */}
          <div className="rounded-2xl border p-4 space-y-4" style={sectionStyle}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={labelStyle}>
                <Camera className="w-4 h-4 text-pink-400" /> Lembranças da Viagem
                <span className="px-2 py-0.5 rounded-full text-[10px]"
                  style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  {memories.length} foto{memories.length !== 1 ? 's' : ''}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => memoryInputRef.current?.click()}
                disabled={isAddingMemory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white cursor-pointer transition-opacity"
                style={{ background: 'linear-gradient(135deg, #db2777, #ec4899)' }}
              >
                {isAddingMemory ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                Adicionar Lembranças
              </button>
              <input
                ref={memoryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAddMemory}
              />
            </div>

            {memories.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-10 rounded-2xl border-2 border-dashed cursor-pointer"
                style={{ borderColor: 'var(--border-secondary)' }}
                onClick={() => memoryInputRef.current?.click()}
              >
                <Camera className="w-10 h-10 mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Adicione fotos desta viagem</p>
                <p className="text-xs mt-1" style={labelStyle}>Clique para selecionar fotos do seu dispositivo</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {memories.map(memory => (
                  <div
                    key={memory.id}
                    className="relative rounded-2xl overflow-hidden group cursor-pointer"
                    onClick={() => setSelectedMemory(memory)}
                  >
                    <img src={memory.imageBase64} alt={memory.caption || 'Lembrança'} className="w-full h-36 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        {memory.caption && <p className="text-[11px] text-white truncate">{memory.caption}</p>}
                        <p className="text-[10px] text-white/60">{new Date(memory.addedAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveMemory(memory.id); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {/* Botão adicionar mais */}
                <div
                  className="rounded-2xl border-2 border-dashed flex items-center justify-center h-36 cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ borderColor: 'var(--border-secondary)' }}
                  onClick={() => memoryInputRef.current?.click()}
                >
                  <Plus className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Lightbox de Lembrança */}
      {selectedMemory && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setSelectedMemory(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={selectedMemory.imageBase64} alt={selectedMemory.caption || ''} className="w-full max-h-[80vh] object-contain rounded-2xl" />
            <button
              onClick={() => setSelectedMemory(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white cursor-pointer hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            {selectedMemory.caption && (
              <p className="text-center text-sm text-white/80 mt-3">{selectedMemory.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
