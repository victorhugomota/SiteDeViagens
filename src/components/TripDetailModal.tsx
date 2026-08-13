import React, { useState } from 'react';
import { X, MapPin, Calendar, Hotel, Fuel, Ticket, Plus, Trash2, Navigation, Edit3, CheckCircle2 } from 'lucide-react';
import type { Trip } from '../types/trip';
import { formatCurrency, formatDate, calculateNights, getDestinationImageUrl } from '../utils/formatters';

interface TripDetailModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trip: Trip) => void;
  onAddExtraItem: (trip: Trip, item: { description: string; value: number }) => Promise<void>;
  onRemoveExtraItem: (trip: Trip, itemId: string) => Promise<void>;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  trip,
  isOpen,
  onClose,
  onEdit,
  onAddExtraItem,
  onRemoveExtraItem
}) => {
  const [newDesc, setNewDesc] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen || !trip) return null;

  const nights = calculateNights(trip.startDate, trip.endDate);
  const imageUrl = getDestinationImageUrl(trip.destinationAddress, trip.coverImageUrl);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    const val = parseFloat(newValue.replace(',', '.')) || 0;

    setIsAdding(true);
    try {
      await onAddExtraItem(trip, { description: newDesc.trim(), value: val });
      setNewDesc('');
      setNewValue('');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Banner com foto e botão fechar */}
        <div className="relative h-56 w-full bg-slate-950">
          <img src={imageUrl} alt={trip.destinationAddress} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white backdrop-blur-md border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
            <div>
              <span className="px-3 py-1 bg-cyan-950/80 text-cyan-400 border border-cyan-800 rounded-full text-xs font-semibold backdrop-blur-md mb-2 inline-block">
                Detalhamento Completo
              </span>
              <h2 className="text-2xl font-black text-white drop-shadow-md">
                {trip.title || trip.destinationAddress}
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-cyan-400" /> {trip.destinationAddress}
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                onEdit(trip);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-blue-900 text-white text-xs font-semibold border border-slate-700 backdrop-blur-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Editar
            </button>
          </div>
        </div>

        {/* Corpo com Informações */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Origem e Período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" /> Origem da Partida:
              </span>
              <p className="text-slate-200 font-medium bg-slate-900 p-2 rounded-xl border border-slate-800">
                {trip.originAddress}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Período da Viagem:
              </span>
              <p className="text-slate-200 font-medium bg-slate-900 p-2 rounded-xl border border-slate-800 flex justify-between">
                <span>{formatDate(trip.startDate)} até {formatDate(trip.endDate)}</span>
                <span className="text-cyan-400 font-bold">({nights} noites)</span>
              </p>
            </div>
          </div>

          {/* Decomposição de Custos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            
            {/* Hospedagem */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <Hotel className="w-4 h-4 text-indigo-400" /> Hospedagem
              </span>
              <p className="text-sm font-bold text-white mt-1">
                {formatCurrency(trip.accommodation?.totalCost || 0)}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {trip.accommodation?.name || 'Local'} ({nights}x {formatCurrency(trip.accommodation?.pricePerNight || 0)})
              </span>
            </div>

            {/* Combustível */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <Fuel className="w-4 h-4 text-amber-400" /> Combustível
              </span>
              <p className="text-sm font-bold text-white mt-1">
                {formatCurrency(trip.transport?.calculatedFuelCost || 0)}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {trip.transport?.distanceKm || 0} km (Ida) • {trip.transport?.fuelEfficiencyKmL || 10} km/L @ {formatCurrency(trip.transport?.fuelPricePerLiter || 0)}/L
              </span>
            </div>

            {/* Pedágios */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <Ticket className="w-4 h-4 text-cyan-400" /> Pedágios
              </span>
              <p className="text-sm font-bold text-white mt-1">
                {formatCurrency(trip.transport?.tollCost || 0)}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Estimado pela rota calculada
              </span>
            </div>

          </div>

          {/* Gerenciamento de Itens & Passeios Extras */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-400" /> Gastos & Passeios Extras
              </h3>
              <span className="text-xs font-bold text-emerald-400">
                Total Extras: {formatCurrency((trip.extraItems || []).reduce((acc, i) => acc + i.value, 0))}
              </span>
            </div>

            {/* Formulário para Adicionar Novo Item */}
            <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Ex: Passeio de barco, Jantar especial..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 outline-none"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor R$"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full sm:w-32 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 outline-none"
              />
              <button
                type="submit"
                disabled={isAdding}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> {isAdding ? 'Adicionando...' : 'Adicionar'}
              </button>
            </form>

            {/* Lista de Itens Cadastrados */}
            {trip.extraItems && trip.extraItems.length > 0 ? (
              <div className="space-y-2">
                {trip.extraItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                  >
                    <span className="text-slate-200 font-medium">{item.description}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-400">{formatCurrency(item.value)}</span>
                      <button
                        onClick={() => onRemoveExtraItem(trip, item.id)}
                        title="Remover item"
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                Nenhum item extra adicionado. Use o formulário acima para adicionar atrações ou passeios (ex: "Passeio de barco" - R$ 50,00).
              </p>
            )}
          </div>

          {/* Estimativa Final */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400 block">Estimativa Geral de Gastos Computada</span>
              <span className="text-2xl font-black text-emerald-400">{formatCurrency(trip.totalEstimateCost || 0)}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Sincronizado no Firebase</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
