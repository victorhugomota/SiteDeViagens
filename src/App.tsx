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
import { DEFAULT_ORIGIN_ADDRESS } from './services/routeService';

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

      // Se o modal de detalhes estiver aberto, atualiza a viagem selecionada em tempo real
      if (selectedTripForDetail) {
        const updated = fetchedTrips.find(t => t.id === selectedTripForDetail.id);
        if (updated) setSelectedTripForDetail(updated);
      }
    }, (err) => {
      console.warn("Monitoramento do Firestore em tempo real aguardando inicialização:", err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedTripForDetail?.id]);

  // Se a lista estiver vazia pela primeira vez, cria viagens demonstrativas no banco de dados
  const handleCreateSampleTrips = async () => {
    const today = new Date();
    const startDate1 = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate1 = new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const sampleTrip1: TripFormData = {
      title: "Viagem para Florianópolis - Praias de Verão",
      originAddress: DEFAULT_ORIGIN_ADDRESS,
      destinationAddress: "Florianópolis - SC",
      startDate: startDate1,
      endDate: endDate1,
      accommodation: {
        name: "Pousada Beira Mar Joaquina",
        pricePerNight: 280,
        nightsCount: 5,
        totalCost: 1400
      },
      transport: {
        distanceKm: 690,
        isRoundTrip: true,
        fuelPricePerLiter: 5.89,
        fuelEfficiencyKmL: 11,
        calculatedFuelCost: 739.84,
        tollCost: 95.00
      },
      extraItems: [
        { id: '1', description: 'Passeio de barco em Ilha dos Campeches', value: 150 },
        { id: '2', description: 'Jantar no Mercado Público', value: 180 },
        { id: '3', description: 'Aluguel de prancha de surf', value: 80 }
      ],
      notes: "Levar protetor solar e câmera fotográfica",
      status: 'planned',
      totalEstimateCost: 2644.84
    };

    await createTrip(sampleTrip1);
  };

  // Salvar Viagem (Criar ou Editar)
  const handleSaveTrip = async (formData: TripFormData, editTripId?: string) => {
    if (editTripId) {
      await updateTrip(editTripId, formData);
    } else {
      await createTrip(formData);
      // Efeito festivo de celebração ao criar nova viagem
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // Excluir Viagem
  const handleDeleteTrip = async (tripId: string) => {
    await deleteTrip(tripId);
    if (selectedTripForDetail?.id === tripId) {
      setIsDetailModalOpen(false);
      setSelectedTripForDetail(null);
    }
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (trip: Trip) => {
    setTripToEdit(trip);
    setIsFormModalOpen(true);
  };

  // Abrir Modal de Criação
  const handleOpenCreate = () => {
    setTripToEdit(null);
    setIsFormModalOpen(true);
  };

  // Abrir Modal de Detalhes e Itens Extras
  const handleViewDetails = (trip: Trip) => {
    setSelectedTripForDetail(trip);
    setIsDetailModalOpen(true);
  };

  // Adicionar Item Extra via Modal de Detalhes
  const handleAddExtraItem = async (trip: Trip, item: { description: string; value: number }) => {
    await addExpenseItemToTrip(trip, item);
  };

  // Remover Item Extra via Modal de Detalhes
  const handleRemoveExtraItem = async (trip: Trip, itemId: string) => {
    await removeExpenseItemFromTrip(trip, itemId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Cabeçalho Fixo */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCreateModal={handleOpenCreate}
        trips={trips}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner de Boas-Vindas e Ação Rápida */}
        {trips.length === 0 && !isLoading && (
          <div className="p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl border border-blue-800/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">Bem-vindo ao ViajaMais Pro! 👋</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Crie suas viagens com cálculo automático de combustível e pedágio a partir do seu endereço em Ribeirão Preto - SP. Adicione hospedagem e passeios extras (como "Passeio de barco") para obter uma estimativa de gastos perfeita.
              </p>
            </div>
            <button
              onClick={handleCreateSampleTrips}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all whitespace-nowrap cursor-pointer"
            >
              🚀 Carregar Viagem Exemplo
            </button>
          </div>
        )}

        {/* Estado de Carregamento */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400">Carregando suas viagens do banco de dados Firebase...</p>
          </div>
        ) : activeView === 'grid' ? (
          /* Visão em Grade (Lista de Cards) */
          <TripList
            trips={trips}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteTrip}
            onViewDetails={handleViewDetails}
            onOpenCreateModal={handleOpenCreate}
          />
        ) : (
          /* Visão em Agenda (Calendário Interativo) */
          <TripCalendar
            trips={trips}
            onSelectTrip={handleViewDetails}
          />
        )}

      </main>

      {/* Modal de Criação / Edição */}
      <TripFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveTrip}
        tripToEdit={tripToEdit}
      />

      {/* Modal de Detalhes e Gerenciador de Despesas Extras */}
      <TripDetailModal
        trip={selectedTripForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleOpenEdit}
        onAddExtraItem={handleAddExtraItem}
        onRemoveExtraItem={handleRemoveExtraItem}
      />

      {/* Rodapé da Aplicação */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <p>ViajaMais Pro • Sistema de Criação de Viagens e Controle de Gastos • Conectado ao Firebase Cloud Firestore</p>
      </footer>

    </div>
  );
}

export default App;
