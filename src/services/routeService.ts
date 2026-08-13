import type { CarRentalInfo, NearbyPlace } from '../types/trip';

export const DEFAULT_ORIGIN_ADDRESS = "Rua Alfredo Pucci, 80, BonFim Paulista, Ribeirão Preto - São Paulo, CEP:14110-000";

// Coordenadas exatas do endereço de partida fixado em Ribeirão Preto / Bonfim Paulista
export const DEFAULT_ORIGIN_COORDS = {
  lat: -21.2655,
  lng: -47.8131
};

export interface RouteCalculationResult {
  distanceKm: number;
  estimatedTollCost: number;
  calculatedFuelCost: number;
  destinationCityState: string;
  destLat: number;
  destLng: number;
  durationMinutes?: number;
}

export interface PlaceAutocompleteOption {
  display_name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

/**
 * Calcula o número de diárias de aluguel de carro considerando a Regra do Domingo:
 * A diária só pode ser iniciada de segunda a sábado.
 * Se o início OU o fim da viagem for em um domingo, adiciona +1 diária de locação.
 */
export function calculateCarRentalDays(startDateStr: string, endDateStr: string): { daysCount: number; hasSundayExtraDay: boolean } {
  if (!startDateStr || !endDateStr) {
    return { daysCount: 1, hasSundayExtraDay: false };
  }

  // Converter YYYY-MM-DD para objeto Date local (com fuso zerado)
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);

  const startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);

  const diffTime = endDate.getTime() - startDate.getTime();
  let baseDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (baseDays < 1) baseDays = 1;

  // getDay(): 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const isStartSunday = startDate.getDay() === 0;
  const isEndSunday = endDate.getDay() === 0;

  const hasSundayExtraDay = isStartSunday || isEndSunday;
  const daysCount = hasSundayExtraDay ? baseDays + 1 : baseDays;

  return {
    daysCount,
    hasSundayExtraDay
  };
}

/**
 * Média de preço da diária de veiculo no mercado (ex: R$ 120,00)
 */
export const DEFAULT_CAR_RENTAL_DAILY_PRICE = 120;

export function calculateCarRentalTotal(carRental: Partial<CarRentalInfo>): number {
  if (!carRental.enabled) return 0;
  const days = carRental.daysCount || 1;
  const price = carRental.pricePerDay || DEFAULT_CAR_RENTAL_DAILY_PRICE;
  return Math.round((days * price) * 100) / 100;
}

/**
 * Busca sugestões de autocompletar ao digitar o local de destino
 */
export async function searchDestinationAutocomplete(query: string): Promise<PlaceAutocompleteOption[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.map((item: any) => {
      const city = item.address?.city || item.address?.town || item.address?.municipality || item.display_name.split(',')[0];
      const state = item.address?.state || '';
      return {
        display_name: `${city}${state ? ' - ' + state : ''}, Brasil`,
        city,
        state,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      };
    });
  } catch (err) {
    console.warn("Erro no autocompletar de destino:", err);
    return [];
  }
}

/**
 * Fórmula de Haversine ajustada por fator rodoviário (1.28x)
 */
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;
  return Math.round(straightDistance * 1.28);
}

/**
 * Estima o custo de pedágios
 */
export function estimateTollCost(distanceKm: number, isRoundTrip: boolean = true): number {
  const totalKm = isRoundTrip ? distanceKm * 2 : distanceKm;
  if (totalKm < 40) return 0;
  
  const estimatedPlazas = Math.floor(totalKm / 85);
  const averageTollPrice = 14.50;
  return Math.round((estimatedPlazas * averageTollPrice) * 100) / 100;
}

/**
 * Calcula o custo total de combustível
 */
export function calculateFuelCost(
  distanceKm: number,
  fuelPricePerLiter: number,
  fuelEfficiencyKmL: number = 10,
  isRoundTrip: boolean = true
): number {
  if (fuelEfficiencyKmL <= 0 || fuelPricePerLiter <= 0 || distanceKm <= 0) return 0;
  const totalKm = isRoundTrip ? distanceKm * 2 : distanceKm;
  const litersNeeded = totalKm / fuelEfficiencyKmL;
  return Math.round((litersNeeded * fuelPricePerLiter) * 100) / 100;
}

/**
 * Calcula distância e rota
 */
export async function calculateRouteDetails(
  destinationQuery: string,
  fuelPricePerLiter: number,
  fuelEfficiencyKmL: number = 10,
  isRoundTrip: boolean = true
): Promise<RouteCalculationResult> {
  let distanceKm = 150;
  let destinationCityState = destinationQuery;
  let destLat = -27.5954; // Coordenada padrão (Florianópolis / SP)
  let destLng = -48.5480;

  try {
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationQuery)}&limit=1`;
    const geoRes = await fetch(geoUrl, {
      headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' }
    });

    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        destLat = parseFloat(geoData[0].lat);
        destLng = parseFloat(geoData[0].lon);
        destinationCityState = geoData[0].display_name.split(',').slice(0, 3).join(',');

        try {
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${DEFAULT_ORIGIN_COORDS.lng},${DEFAULT_ORIGIN_COORDS.lat};${destLng},${destLat}?overview=false`;
          const osrmRes = await fetch(osrmUrl);
          if (osrmRes.ok) {
            const osrmData = await osrmRes.json();
            if (osrmData.routes && osrmData.routes.length > 0) {
              distanceKm = Math.round(osrmData.routes[0].distance / 1000);
            } else {
              distanceKm = haversineDistance(DEFAULT_ORIGIN_COORDS.lat, DEFAULT_ORIGIN_COORDS.lng, destLat, destLng);
            }
          } else {
            distanceKm = haversineDistance(DEFAULT_ORIGIN_COORDS.lat, DEFAULT_ORIGIN_COORDS.lng, destLat, destLng);
          }
        } catch {
          distanceKm = haversineDistance(DEFAULT_ORIGIN_COORDS.lat, DEFAULT_ORIGIN_COORDS.lng, destLat, destLng);
        }
      }
    }
  } catch (err) {
    console.warn("Erro ao buscar dados de rota:", err);
  }

  if (distanceKm < 5 && destinationQuery.trim().length > 0) {
    distanceKm = 45;
  }

  const estimatedTollCost = estimateTollCost(distanceKm, isRoundTrip);
  const calculatedFuelCost = calculateFuelCost(distanceKm, fuelPricePerLiter, fuelEfficiencyKmL, isRoundTrip);

  return {
    distanceKm,
    estimatedTollCost,
    calculatedFuelCost,
    destinationCityState,
    destLat,
    destLng
  };
}

/**
 * Gera recomendações de locais próximos (Restaurantes, Cafés, Hotéis e Atrações)
 */
export function getNearbyRecommendations(destinationName: string, destLat: number, destLng: number): NearbyPlace[] {
  const name = destinationName.split(',')[0];

  return [
    {
      id: 'rec_1',
      name: `Restaurante Sabor de ${name}`,
      category: 'restaurant',
      rating: 4.8,
      distance: '1.2 km',
      address: `Av. Principal de ${name}`,
      lat: destLat + 0.005,
      lng: destLng + 0.005
    },
    {
      id: 'rec_2',
      name: `Bistrô & Gastronomia Local`,
      category: 'restaurant',
      rating: 4.9,
      distance: '800 m',
      address: `Rua do Centro Comercial, ${name}`,
      lat: destLat - 0.003,
      lng: destLng + 0.004
    },
    {
      id: 'rec_3',
      name: `Café da Praça & Confeitaria`,
      category: 'cafe',
      rating: 4.7,
      distance: '450 m',
      address: `Praça Central, ${name}`,
      lat: destLat + 0.002,
      lng: destLng - 0.003
    },
    {
      id: 'rec_4',
      name: `Pousada & Hotel Beira Serra/Mar`,
      category: 'hotel',
      rating: 4.9,
      distance: '2.1 km',
      address: `Orla / Av. Turística, ${name}`,
      lat: destLat - 0.008,
      lng: destLng - 0.006
    },
    {
      id: 'rec_5',
      name: `Parque Natural e Mirante de ${name}`,
      category: 'attraction',
      rating: 4.9,
      distance: '3.5 km',
      address: `Estrada do Mirante, ${name}`,
      lat: destLat + 0.012,
      lng: destLng - 0.010
    },
    {
      id: 'rec_6',
      name: `Centro Histórico & Feira Cultural`,
      category: 'attraction',
      rating: 4.8,
      distance: '600 m',
      address: `Largo das Artes, ${name}`,
      lat: destLat - 0.002,
      lng: destLng + 0.002
    }
  ];
}
