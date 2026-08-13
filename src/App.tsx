import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { TripList } from './components/TripList';
import { TripCalendar } from './components/TripCalendar';
import { TripFormModal } from './components/TripFormModal';
import { TripDetailModal } from './components/TripDetailModal';
import { ThemeModal, DEFAULT_THEME_SETTINGS } from './components/ThemeModal';
import type { ThemeSettings } from './components/ThemeModal';
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

  // Estado da Personalização do Tema
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    try {
      const saved = localStorage.getItem('viajaThemeSettingsJSON');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_THEME_SETTINGS;
  });

  // Aplica as configurações visuais ao HTML root e salva no localStorage
  useEffect(() => {
    const root = document.documentElement;

    if (themeSettings.themeMode === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }

    root.setAttribute('data-accent', themeSettings.accentColor);
    root.setAttribute('data-bg', themeSettings.bgGradient);
    root.setAttribute('data-card', themeSettings.cardBg);
    root.setAttribute('data-header', themeSettings.headerBg);

    localStorage.setItem('viajaThemeSettingsJSON', JSON.stringify(themeSettings));
  }, [themeSettings]);

  const handleApplyThemeSettings = (newSettings: ThemeSettings) => {
    setThemeSettings(newSettings);
  };

  const handleToggleThemeMode = () => {
    setThemeSettings(prev => ({
      ...prev,
      themeMode: prev.themeMode === 'dark' ? 'light' : 'dark'
    }));
  };

  // Escuta a coleção 'trips' no Cloud Firestore em tempo real
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeTrips((fetchedTrips) => {
      setTrips(fetchedTrips);
      setIsLoading(false);
      if (selectedTripForDetail) {
        const updated = fetchedTrips.find(t => t.id === selectedTripForDetail.id);
        if (updated) setSelectedTripForDetail(updated);
      }
    }, () => setIsLoading(false));
    return () => unsubscribe();
  }, [selectedTripForDetail?.id]);

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
        color: 'var(--text-primary)'
      }}
    >
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCreateModal={handleOpenCreate}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        trips={trips}
        themeSettings={themeSettings}
        onToggleThemeMode={handleToggleThemeMode}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {isLoading ? (
          <div className="text-center py-20">
            <div
              className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
            />
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

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        settings={themeSettings}
        onApplySettings={handleApplyThemeSettings}
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
