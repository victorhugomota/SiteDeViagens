import React from 'react';
import { Calendar, MapPin, Hotel, Fuel, Ticket, Edit3, Trash2, Navigation, Car, Camera } from 'lucide-react';
import type { Trip } from '../types/trip';
import { formatCurrency, formatDate, calculateNights, getDestinationImageUrl } from '../utils/formatters';

interface TripCardProps {
  trip: Trip;
  onEdit: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
  onViewDetails: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const nights = calculateNights(trip.startDate, trip.endDate);
  const imageUrl = trip.coverImageBase64 || getDestinationImageUrl(trip.destinationAddress, trip.coverImageUrl);

  const todayStr = new Date().toISOString().split('T')[0];
  let statusLabel = 'Planejada';
  let statusStyle = { bg: '#1e3a5f', text: '#60a5fa', border: '#1e40af' };
  
  if (trip.startDate <= todayStr && trip.endDate >= todayStr) {
    statusLabel = 'Em Andamento';
    statusStyle = { bg: '#451a03', text: '#fb923c', border: '#92400e' };
  } else if (trip.endDate < todayStr) {
    statusLabel = 'Concluída';
    statusStyle = { bg: '#052e16', text: '#4ade80', border: '#166534' };
  }

  const extraItemsTotal = (trip.extraItems || []).reduce((sum, item) => sum + item.value, 0);
  const memoriesCount = (trip.memories || []).length;

  return (
    <div
      className="group rounded-2xl border shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer hover:shadow-2xl"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
      onClick={() => onViewDetails(trip)}
    >
      {/* Imagem de Capa */}
      <div className="relative h-48 w-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <img
          src={imageUrl}
          alt={trip.destinationAddress}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badge Status */}
        <div className="absolute top-3 left-3">
          <span
            className="px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Distância Ida+Volta */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-xs text-white flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
          <span>{(trip.transport?.distanceKm || 0) * 2} km (I+V)</span>
        </div>

        {/* Fotos de Lembrança Badge */}
        {memoriesCount > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[11px] text-white flex items-center gap-1">
            <Camera className="w-3 h-3 text-pink-400" />
            <span>{memoriesCount} foto{memoriesCount !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Título */}
        <div className="absolute bottom-3 left-4 right-16">
          <h3 className="text-lg font-bold text-white drop-shadow-md truncate">
            {trip.title || trip.destinationAddress}
          </h3>
          <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
            <span>{trip.destinationAddress}</span>
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Datas */}
        <div
          className="flex items-center justify-between text-xs px-2.5 py-2 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
          </div>
          <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>
            {nights} {nights === 1 ? 'noite' : 'noites'}
          </span>
        </div>

        {/* Resumo de Gastos */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          
          <div className="p-2.5 rounded-xl border flex flex-col" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}>
            <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Hotel className="w-3.5 h-3.5 text-indigo-400" /> Hospedagem
            </span>
            <span className="font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(trip.accommodation?.totalCost || 0)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl border flex flex-col" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}>
            <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Fuel className="w-3.5 h-3.5 text-amber-400" /> Combustível
            </span>
            <span className="font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(trip.transport?.calculatedFuelCost || 0)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl border flex flex-col" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}>
            <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              {trip.carRental?.enabled
                ? <><Car className="w-3.5 h-3.5 text-blue-400" /> Carro Alugado</>
                : <><Ticket className="w-3.5 h-3.5 text-cyan-400" /> Pedágios</>
              }
            </span>
            <span className="font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
              {trip.carRental?.enabled ? formatCurrency(trip.carRental.totalCost) : formatCurrency(trip.transport?.tollCost || 0)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl border flex flex-col" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}>
            <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <span className="text-emerald-400">+</span> Extras / Refeições
            </span>
            <span className="font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(extraItemsTotal)}
            </span>
          </div>
        </div>

        {/* Rodapé */}
        <div
          className="pt-3 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div>
            <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--text-muted)' }}>Estimativa Total</span>
            <span className="text-lg font-extrabold text-emerald-500">
              {formatCurrency(trip.totalEstimateCost || 0)}
            </span>
          </div>

          {/* Botões de Ação (stopPropagation para não abrir o modal de detalhes) */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(trip); }}
              title="Editar Viagem"
              className="p-2 rounded-lg border transition-colors cursor-pointer hover:text-blue-400"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-muted)' }}
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Excluir a viagem "${trip.title || trip.destinationAddress}"?`)) {
                  onDelete(trip.id);
                }
              }}
              title="Excluir Viagem"
              className="p-2 rounded-lg border transition-colors cursor-pointer hover:text-rose-400"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-muted)' }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
