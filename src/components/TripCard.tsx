import React from 'react';
import { Calendar, MapPin, Hotel, Fuel, Ticket, PlusCircle, Edit3, Trash2, Navigation, Car } from 'lucide-react';
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
  const imageUrl = getDestinationImageUrl(trip.destinationAddress, trip.coverImageUrl);

  // Status Badge Logic
  const todayStr = new Date().toISOString().split('T')[0];
  let statusBadge = { label: 'Planejada', bg: 'bg-blue-950/80 text-blue-400 border-blue-800' };
  
  if (trip.startDate <= todayStr && trip.endDate >= todayStr) {
    statusBadge = { label: 'Em Andamento', bg: 'bg-amber-950/80 text-amber-400 border-amber-800' };
  } else if (trip.endDate < todayStr) {
    statusBadge = { label: 'Concluída', bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800' };
  }

  const extraItemsTotal = (trip.extraItems || []).reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="group bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-cyan-500/50 shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Imagem de Capa e Overlay */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={imageUrl}
          alt={trip.destinationAddress}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

        {/* Badge de Status */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${statusBadge.bg}`}>
            {statusBadge.label}
          </span>
        </div>

        {/* Distância Em Destaque */}
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span>{trip.transport?.distanceKm || 0} km (Ida)</span>
        </div>

        {/* Nome do Destino sobre a imagem */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-xl font-bold text-white drop-shadow-md truncate">
            {trip.title || trip.destinationAddress}
          </h3>
          <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{trip.destinationAddress}</span>
          </p>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Datas e Duração */}
        <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
          </div>
          <span className="font-semibold text-slate-400">{nights} {nights === 1 ? 'noite' : 'noites'}</span>
        </div>

        {/* Resumo Detalhado dos Gastos */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          
          {/* Hospedagem */}
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Hotel className="w-3.5 h-3.5 text-indigo-400" /> Hospedagem
            </span>
            <span className="font-semibold text-slate-200 mt-1">
              {formatCurrency(trip.accommodation?.totalCost || 0)}
            </span>
          </div>

          {/* Combustível */}
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-amber-400" /> Combustível
            </span>
            <span className="font-semibold text-slate-200 mt-1">
              {formatCurrency(trip.transport?.calculatedFuelCost || 0)}
            </span>
          </div>

          {/* Pedágio / Aluguel de Carro */}
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              {trip.carRental?.enabled ? (
                <>
                  <Car className="w-3.5 h-3.5 text-blue-400" /> Carro Alugado
                </>
              ) : (
                <>
                  <Ticket className="w-3.5 h-3.5 text-cyan-400" /> Pedágios
                </>
              )}
            </span>
            <span className="font-semibold text-slate-200 mt-1">
              {trip.carRental?.enabled ? formatCurrency(trip.carRental.totalCost) : formatCurrency(trip.transport?.tollCost || 0)}
            </span>
          </div>

          {/* Gastos Extras */}
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" /> Extras / Refeições
            </span>
            <span className="font-semibold text-slate-200 mt-1">
              {formatCurrency(extraItemsTotal)}
            </span>
          </div>

        </div>

        {/* Rodapé do Card com Estimativa Total e Botões */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Estimativa Total</span>
            <span className="text-lg font-extrabold text-emerald-400">
              {formatCurrency(trip.totalEstimateCost || 0)}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => onViewDetails(trip)}
              title="Ver detalhes & Gastos"
              className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-400 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEdit(trip)}
              title="Editar Viagem"
              className="p-2 rounded-lg bg-slate-800 hover:bg-blue-950 hover:text-blue-400 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Tem certeza que deseja excluir a viagem "${trip.title || trip.destinationAddress}"?`)) {
                  onDelete(trip.id);
                }
              }}
              title="Excluir Viagem"
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
