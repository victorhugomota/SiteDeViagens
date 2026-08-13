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
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  durationMinutes?: number;
  routePolyline?: [number, number][]; // Pontos reais da estrada (OSRM)
}

export interface PlaceAutocompleteOption {
  display_name: string;
  display_name_short: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

export function calculateCarRentalDays(startDateStr: string, endDateStr: string): { daysCount: number; hasSundayExtraDay: boolean } {
  if (!startDateStr || !endDateStr) {
    return { daysCount: 1, hasSundayExtraDay: false };
  }

  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);

  const startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);

  const diffTime = endDate.getTime() - startDate.getTime();
  let baseDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (baseDays < 1) baseDays = 1;

  const isStartSunday = startDate.getDay() === 0;
  const isEndSunday = endDate.getDay() === 0;

  const hasSundayExtraDay = isStartSunday || isEndSunday;
  const daysCount = hasSundayExtraDay ? baseDays + 1 : baseDays;

  return { daysCount, hasSundayExtraDay };
}

export const DEFAULT_CAR_RENTAL_DAILY_PRICE = 120;

export function calculateCarRentalTotal(carRental: Partial<CarRentalInfo>): number {
  if (!carRental.enabled) return 0;
  const days = carRental.daysCount || 1;
  const price = carRental.pricePerDay || DEFAULT_CAR_RENTAL_DAILY_PRICE;
  return Math.round((days * price) * 100) / 100;
}

/**
 * Busca sugestões de autocompletar para qualquer endereço (partida ou destino)
 */
export async function searchPlaceAutocomplete(query: string): Promise<PlaceAutocompleteOption[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=6&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.map((item: any) => {
      const addr = item.address || {};
      const road = addr.road || addr.pedestrian || addr.path || addr.street || '';
      const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.district || '';
      const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || '';
      const state = addr.state || '';
      const postcode = addr.postcode || '';
      const country = addr.country || 'Brasil';

      const parts = [road, suburb, city].filter(Boolean);
      const shortName = parts.length > 0 ? parts.join(', ') + (state ? ' - ' + state : '') : item.display_name.split(',').slice(0, 3).join(',');

      const fullParts = [road, suburb, city, state, postcode, country].filter(Boolean);
      const fullName = fullParts.length > 0 ? fullParts.join(', ') : item.display_name;

      return {
        display_name: fullName,
        display_name_short: shortName,
        city,
        state,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      };
    });
  } catch (err) {
    console.warn("Erro no autocompletar:", err);
    return [];
  }
}

// Alias para compatibilidade retroativa
export const searchDestinationAutocomplete = searchPlaceAutocomplete;

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

export function estimateTollCost(distanceKm: number, isRoundTrip: boolean = true): number {
  const totalKm = isRoundTrip ? distanceKm * 2 : distanceKm;
  if (totalKm < 40) return 0;
  
  const estimatedPlazas = Math.floor(totalKm / 85);
  const averageTollPrice = 14.50;
  return Math.round((estimatedPlazas * averageTollPrice) * 100) / 100;
}

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

export async function fetchRealRoutePolyline(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<[number, number][] | null> {
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const res = await fetch(osrmUrl);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.routes && data.routes.length > 0 && data.routes[0].geometry?.coordinates) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Calcula distância e rota completa geocodificando Origem e Destino
 */
export async function calculateRouteDetails(
  originQuery: string,
  destinationQuery: string,
  fuelPricePerLiter: number,
  fuelEfficiencyKmL: number = 10,
  isRoundTrip: boolean = true,
  originCoordsInput?: { lat: number; lng: number },
  destCoordsInput?: { lat: number; lng: number }
): Promise<RouteCalculationResult> {
  let originLat = originCoordsInput?.lat ?? DEFAULT_ORIGIN_COORDS.lat;
  let originLng = originCoordsInput?.lng ?? DEFAULT_ORIGIN_COORDS.lng;

  let destLat = destCoordsInput?.lat ?? -27.5954;
  let destLng = destCoordsInput?.lng ?? -48.5480;
  let destinationCityState = destinationQuery;
  let routePolyline: [number, number][] | undefined;

  // Geocode Partida se não tiver coordenadas e não for a padrão
  if (!originCoordsInput && originQuery && !originQuery.includes("Alfredo Pucci")) {
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(originQuery.trim())}&limit=1`;
      const geoRes = await fetch(geoUrl, { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && geoData[0]) {
          originLat = parseFloat(geoData[0].lat);
          originLng = parseFloat(geoData[0].lon);
        }
      }
    } catch (e) {
      console.warn("Erro ao geocodificar origem:", e);
    }
  }

  // Geocode Destino se não tiver coordenadas
  if (!destCoordsInput && destinationQuery && destinationQuery.trim().length > 0) {
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationQuery.trim())}&limit=1`;
      const geoRes = await fetch(geoUrl, { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && geoData[0]) {
          destLat = parseFloat(geoData[0].lat);
          destLng = parseFloat(geoData[0].lon);
          destinationCityState = geoData[0].display_name.split(',').slice(0, 3).join(',');
        }
      }
    } catch (e) {
      console.warn("Erro ao geocodificar destino:", e);
    }
  }

  let distanceKm = haversineDistance(originLat, originLng, destLat, destLng);

  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const osrmRes = await fetch(osrmUrl);
    if (osrmRes.ok) {
      const osrmData = await osrmRes.json();
      if (osrmData.routes && osrmData.routes.length > 0) {
        distanceKm = Math.round(osrmData.routes[0].distance / 1000);
        if (osrmData.routes[0].geometry?.coordinates) {
          routePolyline = osrmData.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
          );
        }
      }
    }
  } catch (err) {
    console.warn("Erro ao buscar rota OSRM:", err);
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
    originLat,
    originLng,
    destLat,
    destLng,
    routePolyline
  };
}

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
