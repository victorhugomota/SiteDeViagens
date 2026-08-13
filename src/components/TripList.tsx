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

  const filterBtn = (active: boolean, activeColor: string) => ({
    backgroundColor: active ? `${activeColor}20` : 'var(--bg-secondary)',
    color: active ? activeColor : 'var(--text-muted)',
    borderColor: active ? `${activeColor}60` : 'var(--border-primary)'
  });

  return (
    <div className="space-y-6">
      
      {/* Barra de Filtros e Pesquisa */}
      <div
        className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl border"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      >
        
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Pesquisar por destino ou título da viagem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Tabs de Filtro por Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {([
            { key: 'all',       label: `Todas (${trips.length})`, color: 'var(--accent)' },
            { key: 'planned',   label: 'Próximas',       color: '#60a5fa' },
            { key: 'ongoing',   label: 'Em Andamento',   color: '#fb923c' },
            { key: 'completed', label: 'Concluídas',     color: '#4ade80' },
          ] as const).map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border"
              style={filterBtn(statusFilter === key, color)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Seletor de Ordenação */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'cost')}
            className="font-medium outline-none cursor-pointer"
            style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}
          >
            <option value="date">Data de Ida</option>
            <option value="cost">Maior Valor</option>
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
        <div
          className="text-center py-16 px-4 rounded-3xl border border-dashed"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--accent)' }}
          >
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Nenhuma viagem encontrada</h3>
          <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
            {searchQuery
              ? `Nenhum resultado para "${searchQuery}". Tente limpar os filtros.`
              : 'Você ainda não cadastrou nenhuma viagem. Comece criando o seu próximo destino!'}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, var(--accent-dark), var(--accent))', boxShadow: '0 4px 14px var(--shadow-accent)' }}
          >
            <Plus className="w-4 h-4" />
            <span>Criar Minha Primeira Viagem</span>
          </button>
        </div>
      )}

    </div>
  );
};
