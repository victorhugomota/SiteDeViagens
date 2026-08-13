import React, { useState } from 'react';
import { Search, Compass, Plus, SlidersHorizontal } from 'lucide-react';
import type { Trip } from '../types/trip';
import { TripCard } from './TripCard';

interface TripListProps {
  trips: Trip[];
  onEdit: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
  onViewDetails: (trip: Trip) => void;
  onOpenCreateModal: () => void;
}

export const TripList: React.FC<TripListProps> = ({
  trips,
  onEdit,
  onDelete,
  onViewDetails,
  onOpenCreateModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planned' | 'ongoing' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'cost'>('date');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtragem de viagens
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      (trip.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.destinationAddress || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'planned') {
      return trip.startDate > todayStr;
    } else if (statusFilter === 'ongoing') {
      return trip.startDate <= todayStr && trip.endDate >= todayStr;
    } else if (statusFilter === 'completed') {
      return trip.endDate < todayStr;
    }

    return true;
  });

  // Ordenação
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === 'date') {
      return a.startDate.localeCompare(b.startDate);
    } else {
      return (b.totalEstimateCost || 0) - (a.totalEstimateCost || 0);
    }
  });

  return (
    <div className="space-y-6">
      
      {/* Barra de Filtros e Pesquisa */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por destino ou título da viagem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors"
          />
        </div>

        {/* Tabs de Filtro por Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Todas ({trips.length})
          </button>

          <button
            onClick={() => setStatusFilter('planned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'planned'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Próximas
          </button>

          <button
            onClick={() => setStatusFilter('ongoing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'ongoing'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Em Andamento
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Concluídas
          </button>
        </div>

        {/* Seletor de Ordenação */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'cost')}
            className="bg-transparent text-slate-200 font-medium outline-none cursor-pointer"
          >
            <option value="date" className="bg-slate-900">Data de Ida</option>
            <option value="cost" className="bg-slate-900">Maior Valor</option>
          </select>
        </div>

      </div>

      {/* Lista de Cards */}
      {sortedTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        /* Estado Vazio */
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-slate-800 border-dashed">
          <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-1">Nenhuma viagem encontrada</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            {searchQuery
              ? `Nenhum resultado para "${searchQuery}". Tente limpar os filtros.`
              : 'Você ainda não cadastrou nenhuma viagem. Comece criando o seu próximo destino!'}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Minha Primeira Viagem</span>
          </button>
        </div>
      )}

    </div>
  );
};
