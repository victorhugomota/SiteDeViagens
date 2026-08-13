import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { TripList } from './components/TripList';
import { TripCalendar } from './components/TripCalendar';
import { TripFormModal } from './components/TripFormModal';
import { TripDetailModal } from './components/TripDetailModal';
import type { Trip, TripFormData } from './types/trip';
import {
  subscribeTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  addExpenseItemToTrip,
  removeExpenseItemFromTrip
} from './services/tripService';

export function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeView, setActiveView] = useState<'grid' | 'calendar'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTripForDetail, setSelectedTripForDetail] = useState<Trip | null>(null);

  // Escuta a coleção 'trips' no Cloud Firestore em tempo real
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeTrips((fetchedTrips) => {
      setTrips(fetchedTrips);
      setIsLoading(false);
      // Atualiza o modal de detalhes em tempo real
      if (selectedTripForDetail) {
        const updated = fetchedTrips.find(t => t.id === selectedTripForDetail.id);
        if (updated) setSelectedTripForDetail(updated);
      }
    }, () => setIsLoading(false));
    return () => unsubscribe();
  }, [selectedTripForDetail?.id]);

  // Aplica tema/accent/bg salvos no localStorage ao inicializar
  useEffect(() => {
    const theme = localStorage.getItem('viajaTheme') || 'dark';
    const accent = localStorage.getItem('viajaAccent') || 'cyan';
    const bgGradient = localStorage.getItem('viajaBgGradient') || 'gradient-default';
    const root = document.documentElement;
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    root.setAttribute('data-accent', accent);
    root.setAttribute('data-bg', bgGradient);
  }, []);

  // Salvar Viagem (Criar ou Editar)
  const handleSaveTrip = async (formData: TripFormData, editTripId?: string) => {
    if (editTripId) {
      await updateTrip(editTripId, formData);
    } else {
      await createTrip(formData);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    await deleteTrip(tripId);
    if (selectedTripForDetail?.id === tripId) {
      setIsDetailModalOpen(false);
      setSelectedTripForDetail(null);
    }
  };

  const handleOpenEdit = (trip: Trip) => {
    setTripToEdit(trip);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleOpenCreate = () => {
    setTripToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleViewDetails = (trip: Trip) => {
    setSelectedTripForDetail(trip);
    setIsDetailModalOpen(true);
  };

  const handleAddExtraItem = async (trip: Trip, item: { description: string; value: number }) => {
    await addExpenseItemToTrip(trip, item);
  };

  const handleRemoveExtraItem = async (trip: Trip, itemId: string) => {
    await removeExpenseItemFromTrip(trip, itemId);
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        // Smooth selection color
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      }}
    >
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCreateModal={handleOpenCreate}
        trips={trips}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Carregando suas viagens...
            </p>
          </div>
        ) : activeView === 'grid' ? (
          <TripList
            trips={trips}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteTrip}
            onViewDetails={handleViewDetails}
            onOpenCreateModal={handleOpenCreate}
          />
        ) : (
          <TripCalendar
            trips={trips}
            onSelectTrip={handleViewDetails}
          />
        )}
      </main>

      <TripFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveTrip}
        tripToEdit={tripToEdit}
      />

      <TripDetailModal
        trip={selectedTripForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteTrip}
        onAddExtraItem={handleAddExtraItem}
        onRemoveExtraItem={handleRemoveExtraItem}
      />

      <footer
        className="border-t py-5 text-center text-xs"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
      >
        <p>Viagens Victor e Maria • Planejador de Viagens & Controle de Gastos</p>
      </footer>
    </div>
  );
}

export default App;
