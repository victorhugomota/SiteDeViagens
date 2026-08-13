import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Hotel, Fuel, Ticket, Plus, Trash2, Calculator, Sparkles, Navigation, RotateCcw, Info } from 'lucide-react';
import type { Trip, TripFormData, ExpenseItem } from '../types/trip';
import { DEFAULT_ORIGIN_ADDRESS, calculateRouteDetails, estimateTollCost, calculateFuelCost } from '../services/routeService';
import { formatCurrency, calculateNights } from '../utils/formatters';

interface TripFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tripData: TripFormData, editTripId?: string) => Promise<void>;
  tripToEdit?: Trip | null;
}

export const TripFormModal: React.FC<TripFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tripToEdit
}) => {
  const [title, setTitle] = useState('');
  const [originAddress, setOriginAddress] = useState(DEFAULT_ORIGIN_ADDRESS);
  const [destinationAddress, setDestinationAddress] = useState('');
  
  // Datas
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeekStr);

  // Hospedagem
  const [accommodationName, setAccommodationName] = useState('');
  const [pricePerNight, setPricePerNight] = useState<number>(150);

  // Transporte & Combustível
  const [distanceKm, setDistanceKm] = useState<number>(300);
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(5.89);
  const [fuelEfficiencyKmL, setFuelEfficiencyKmL] = useState<number>(10);
  const [isRoundTrip] = useState<boolean>(true);
  const [tollCost, setTollCost] = useState<number>(45);

  // Itens Extras
  const [extraItems, setExtraItems] = useState<ExpenseItem[]>([]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemValue, setNewItemValue] = useState<string>('');

  // UI States
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');

  // Carrega dados se for edição
  useEffect(() => {
    if (tripToEdit) {
      setTitle(tripToEdit.title || '');
      setOriginAddress(tripToEdit.originAddress || DEFAULT_ORIGIN_ADDRESS);
      setDestinationAddress(tripToEdit.destinationAddress || '');
      setStartDate(tripToEdit.startDate || todayStr);
      setEndDate(tripToEdit.endDate || nextWeekStr);
      
      setAccommodationName(tripToEdit.accommodation?.name || '');
      setPricePerNight(tripToEdit.accommodation?.pricePerNight || 0);

      setDistanceKm(tripToEdit.transport?.distanceKm || 0);
      setFuelPricePerLiter(tripToEdit.transport?.fuelPricePerLiter || 5.89);
      setFuelEfficiencyKmL(tripToEdit.transport?.fuelEfficiencyKmL || 10);
      setTollCost(tripToEdit.transport?.tollCost || 0);

      setExtraItems(tripToEdit.extraItems || []);
      setNotes(tripToEdit.notes || '');
    } else {
      resetForm();
    }
  }, [tripToEdit, isOpen]);

  const resetForm = () => {
    setTitle('');
    setOriginAddress(DEFAULT_ORIGIN_ADDRESS);
    setDestinationAddress('');
    setStartDate(todayStr);
    setEndDate(nextWeekStr);
    setAccommodationName('');
    setPricePerNight(150);
    setDistanceKm(300);
    setFuelPricePerLiter(5.89);
    setFuelEfficiencyKmL(10);
    setTollCost(45);
    setExtraItems([
      { id: '1', description: 'Passeio de barco', value: 50 },
      { id: '2', description: 'Alimentação em restaurantes', value: 250 }
    ]);
    setNotes('');
  };

  // Cálculo automático de rota quando o destino ou preço do combustível muda
  const handleAutoCalculateRoute = async (destQuery?: string) => {
    const query = destQuery !== undefined ? destQuery : destinationAddress;
    if (!query.trim()) return;

    setIsCalculatingRoute(true);
    try {
      const routeInfo = await calculateRouteDetails(
        query,
        fuelPricePerLiter,
        fuelEfficiencyKmL,
        isRoundTrip
      );

      setDistanceKm(routeInfo.distanceKm);
      setTollCost(routeInfo.estimatedTollCost);
      if (!title) {
        setTitle(`Viagem para ${query.split(',')[0]}`);
      }
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Cálculos dinâmicos
  const nights = calculateNights(startDate, endDate);
  const totalAccommodationCost = Math.round((nights * (pricePerNight || 0)) * 100) / 100;
  const calculatedFuelCost = calculateFuelCost(distanceKm, fuelPricePerLiter, fuelEfficiencyKmL, isRoundTrip);
  const totalExtraItemsCost = extraItems.reduce((sum, item) => sum + (item.value || 0), 0);
  const totalEstimateCost = Math.round((totalAccommodationCost + calculatedFuelCost + (tollCost || 0) + totalExtraItemsCost) * 100) / 100;

  // Adicionar item extra
  const handleAddExtraItem = () => {
    if (!newItemDesc.trim()) return;
    const val = parseFloat(newItemValue.replace(',', '.')) || 0;
    
    const newItem: ExpenseItem = {
      id: `item_${Date.now()}`,
      description: newItemDesc.trim(),
      value: val
    };

    setExtraItems([...extraItems, newItem]);
    setNewItemDesc('');
    setNewItemValue('');
  };

  // Remover item extra
  const handleRemoveExtraItem = (id: string) => {
    setExtraItems(extraItems.filter(item => item.id !== id));
  };

  // Submissão do Formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationAddress.trim()) {
      alert('Por favor, informe o local de destino!');
      return;
    }

    setIsSaving(true);
    try {
      const formData: TripFormData = {
        title: title.trim() || `Viagem para ${destinationAddress}`,
        originAddress: originAddress || DEFAULT_ORIGIN_ADDRESS,
        destinationAddress,
        startDate,
        endDate,
        accommodation: {
          name: accommodationName || 'Hospedagem',
          pricePerNight: pricePerNight || 0,
          nightsCount: nights,
          totalCost: totalAccommodationCost
        },
        transport: {
          distanceKm: distanceKm || 0,
          isRoundTrip,
          fuelPricePerLiter: fuelPricePerLiter || 0,
          fuelEfficiencyKmL: fuelEfficiencyKmL || 10,
          calculatedFuelCost,
          tollCost: tollCost || 0
        },
        extraItems,
        notes,
        totalEstimateCost,
        status: 'planned'
      };

      await onSave(formData, tripToEdit ? tripToEdit.id : undefined);
      onClose();
    } catch (err) {
      console.error("Erro ao salvar viagem:", err);
      alert("Erro ao salvar viagem no banco de dados. Verifique a conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {tripToEdit ? 'Editar Viagem' : 'Nova Viagem'}
              </h2>
              <p className="text-xs text-slate-400">Preencha os dados e estimativas de gastos da sua rota</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto custom-scrollbar">
          
          {/* Título da Viagem */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Título da Viagem (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Férias de Verão em Florianópolis"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Origem e Destino estilo Google Maps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            
            {/* Endereço de Partida Fixado */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" /> Local de Partida (Fixo)
                </label>
                <button
                  type="button"
                  onClick={() => setOriginAddress(DEFAULT_ORIGIN_ADDRESS)}
                  title="Restaurar endereço padrão"
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Restaurar
                </button>
              </div>
              <input
                type="text"
                value={originAddress}
                onChange={(e) => setOriginAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-cyan-400" /> Endereço fixado em Ribeirão Preto - SP
              </p>
            </div>

            {/* Local de Destino Estilo Google Maps */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> Local de Destino
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Digite a cidade ou local (ex: Ubatuba - SP)"
                  value={destinationAddress}
                  onChange={(e) => {
                    setDestinationAddress(e.target.value);
                  }}
                  onBlur={() => handleAutoCalculateRoute()}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleAutoCalculateRoute()}
                  disabled={isCalculatingRoute}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-lg text-xs font-semibold hover:bg-cyan-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {isCalculatingRoute ? (
                    <span className="animate-spin text-xs">🌀</span>
                  ) : (
                    <Calculator className="w-3.5 h-3.5" />
                  )}
                  <span>Calcular</span>
                </button>
              </div>

              {/* Sugestões Rápidas de Destino */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                <span className="text-[10px] text-slate-400">Exemplos:</span>
                {['Florianópolis - SC', 'Ubatuba - SP', 'Gramado - RS', 'Rio de Janeiro - RJ'].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setDestinationAddress(loc);
                      handleAutoCalculateRoute(loc);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-cyan-400 hover:border-cyan-800 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {loc.split(' - ')[0]}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Datas de Ida e Volta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Data de Ida
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Data de Volta
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                required
              />
            </div>

            <div className="flex flex-col justify-center items-center bg-slate-900/80 rounded-xl p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total de Noites</span>
              <span className="text-xl font-extrabold text-cyan-400">{nights} {nights === 1 ? 'Noite' : 'Noites'}</span>
            </div>
          </div>

          {/* Hospedagem */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Hotel className="w-4 h-4 text-indigo-400" /> Hospedagem
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Local de Hospedagem</label>
                <input
                  type="text"
                  placeholder="Ex: Pousada Beira Mar ou Airbnb"
                  value={accommodationName}
                  onChange={(e) => setAccommodationName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Preço por Diária (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span>Custo Total de Hospedagem ({nights}x {formatCurrency(pricePerNight)}):</span>
              <span className="font-bold text-indigo-400 text-sm">{formatCurrency(totalAccommodationCost)}</span>
            </div>
          </div>

          {/* Transporte, Distância, Combustível e Pedágios */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Fuel className="w-4 h-4 text-amber-400" /> Transporte, Combustível & Pedágios
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Distância (Ida em Km)</label>
                <input
                  type="number"
                  min="1"
                  value={distanceKm}
                  onChange={(e) => {
                    const dist = parseFloat(e.target.value) || 0;
                    setDistanceKm(dist);
                    setTollCost(estimateTollCost(dist, isRoundTrip));
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Preço Combustível (R$/L)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={fuelPricePerLiter}
                  onChange={(e) => setFuelPricePerLiter(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Consumo do Carro (km/L)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={fuelEfficiencyKmL}
                  onChange={(e) => setFuelEfficiencyKmL(parseFloat(e.target.value) || 10)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estimativa Pedágios (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tollCost}
                  onChange={(e) => setTollCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Combustível (Ida e Volta):</span>
                <span className="font-bold text-amber-400">{formatCurrency(calculatedFuelCost)}</span>
              </div>
              <div className="flex items-center justify-between border-l border-slate-800 pl-3">
                <span className="text-slate-400">Total Pedágios:</span>
                <span className="font-bold text-cyan-400">{formatCurrency(tollCost)}</span>
              </div>
            </div>
          </div>

          {/* Itens & Passeios Extras */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Ticket className="w-4 h-4 text-emerald-400" /> Itens Extras & Passeios (Ex: Passeio de barco)
            </h4>

            {/* Inputs para adicionar novo item */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Descrição do item (ex: Passeio de barco, Ingressos)"
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 outline-none"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor (R$ 50,00)"
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
                className="w-full sm:w-36 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 outline-none"
              />
              <button
                type="button"
                onClick={handleAddExtraItem}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>

            {/* Lista de itens extras cadastrados */}
            {extraItems.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {extraItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-200 font-medium">{item.description}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-emerald-400">{formatCurrency(item.value)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Nenhum item extra adicionado ainda.</p>
            )}
          </div>

          {/* Resumo Final e Estimativa Geral */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400 block">Estimativa Total de Gastos da Viagem</span>
              <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalEstimateCost)}</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? 'Salvando...' : tripToEdit ? 'Salvar Alterações' : 'Criar Viagem'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
