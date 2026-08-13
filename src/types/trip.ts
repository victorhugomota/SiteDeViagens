export interface ExpenseItem {
  id: string;
  description: string;
  value: number;
}

export interface AccommodationInfo {
  name: string;
  pricePerNight: number;
  nightsCount: number;
  totalCost: number;
}

export interface TransportCostInfo {
  distanceKm: number; // Distância só de ida (em km)
  isRoundTrip: boolean; // Padrão: true
  fuelPricePerLiter: number; // R$/Litro
  fuelEfficiencyKmL: number; // km/Litro (ex: 10)
  calculatedFuelCost: number; // R$ total de combustível
  tollCost: number; // R$ estimado de pedágios
}

export type TripStatus = 'planned' | 'ongoing' | 'completed';

export interface Trip {
  id: string;
  title: string;
  originAddress: string;
  destinationAddress: string;
  destinationCity?: string;
  destinationState?: string;
  startDate: string; // ISO string 'YYYY-MM-DD'
  endDate: string;   // ISO string 'YYYY-MM-DD'
  accommodation: AccommodationInfo;
  transport: TransportCostInfo;
  extraItems: ExpenseItem[];
  totalEstimateCost: number; // Soma de Hospedagem + Combustível + Pedágios + Itens Extras
  notes?: string;
  coverImageUrl?: string;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
}

export type TripFormData = Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>;
