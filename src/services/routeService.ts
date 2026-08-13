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
 * Busca sugestões de autocompletar via Photon API (suporte a CORS 100% livre) com fallback Nominatim simples (sem headers customizados)
 */
export async function searchPlaceAutocomplete(query: string): Promise<PlaceAutocompleteOption[]> {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim();

  // 1. Photon API
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=default`;
    const res = await fetch(photonUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const results: PlaceAutocompleteOption[] = data.features.map((feat: any) => {
          const props = feat.properties || {};
          const coords = feat.geometry?.coordinates || [0, 0];
          const lng = coords[0];
          const lat = coords[1];

          const name = props.name || '';
          const street = props.street || (props.name !== props.city ? props.name : '');
          const suburb = props.suburb || props.district || '';
          const city = props.city || props.town || props.county || props.state || '';
          const state = props.state || '';
          const country = props.country || 'Brasil';

          const parts = [street, suburb, city].filter(Boolean);
          const shortName = parts.length > 0 ? parts.join(', ') + (state ? ' - ' + state : '') : (name || q);

          const fullParts = [name, street, suburb, city, state, country].filter(Boolean);
          const fullName = Array.from(new Set(fullParts)).join(', ');

          return {
            display_name: fullName || shortName,
            display_name_short: shortName,
            city,
            state,
            lat,
            lng
          };
        });

        if (results.length > 0) return results;
      }
    }
  } catch (err) {
    console.warn("Photon API fallback para Nominatim:", err);
  }

  // 2. Fallback Nominatim: fetch simples SEM headers customizados
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1`;
    const res = await fetch(nomUrl);
    if (res.ok) {
      const data = await res.json();
      return data.map((item: any) => {
        const addr = item.address || {};
        const road = addr.road || addr.pedestrian || addr.path || addr.street || '';
        const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.district || '';
        const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || '';
        const state = addr.state || '';
        const country = addr.country || 'Brasil';

        const parts = [road, suburb, city].filter(Boolean);
        const shortName = parts.length > 0 ? parts.join(', ') + (state ? ' - ' + state : '') : item.display_name.split(',').slice(0, 3).join(',');

        const fullParts = [road, suburb, city, state, country].filter(Boolean);
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
    }
  } catch (err) {
    console.warn("Erro no Nominatim fallback:", err);
  }

  return [];
}

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

/**
 * Média real de praças de pedágio em rodovias do Brasil (~1 praça a cada 55 km, R$ 15,80/praça)
 */
export function estimateTollCost(distanceKm: number, isRoundTrip: boolean = true): number {
  if (distanceKm < 35) return 0;
  const plazasOneWay = Math.max(1, Math.round(distanceKm / 55));
  const totalPlazas = isRoundTrip ? plazasOneWay * 2 : plazasOneWay;
  const averageTollPrice = 15.80;
  return Math.round((totalPlazas * averageTollPrice) * 100) / 100;
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

  if ((!originCoordsInput || (originLat === DEFAULT_ORIGIN_COORDS.lat && originLng === DEFAULT_ORIGIN_COORDS.lng)) && originQuery && !originQuery.includes("Alfredo Pucci")) {
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(originQuery.trim())}&limit=1`;
      const res = await fetch(photonUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features[0]) {
          const coords = data.features[0].geometry.coordinates;
          originLng = coords[0];
          originLat = coords[1];
        }
      }
    } catch (e) {
      console.warn("Erro ao geocodificar origem via Photon:", e);
    }
  }

  if ((!destCoordsInput || (destLat === -27.5954 && destLng === -48.5480)) && destinationQuery && destinationQuery.trim().length > 0) {
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(destinationQuery.trim())}&limit=1`;
      const res = await fetch(photonUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features[0]) {
          const coords = data.features[0].geometry.coordinates;
          destLng = coords[0];
          destLat = coords[1];
          const props = data.features[0].properties || {};
          destinationCityState = [props.name || props.city, props.state].filter(Boolean).join(', ');
        }
      }
    } catch (e) {
      console.warn("Erro ao geocodificar destino via Photon:", e);
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

/**
 * Retorna exatamente 5 opções de recomendações por categoria (Restaurantes, Cafés, Hotéis e Atrações)
 */
export function getNearbyRecommendations(destinationName: string, destLat: number, destLng: number): NearbyPlace[] {
  const name = destinationName.split(',')[0].trim() || 'Destino';

  return [
    // 5 RESTAURANTES (Comida)
    { id: 'rec_rest_1', name: `Restaurante Sabor de ${name}`, category: 'restaurant', rating: 4.8, distance: '600 m', address: `Av. Beira Mar, ${name}`, lat: destLat + 0.003, lng: destLng + 0.003 },
    { id: 'rec_rest_2', name: `Bistrô & Gastronomia ${name}`, category: 'restaurant', rating: 4.9, distance: '850 m', address: `Rua das Flores, 120, ${name}`, lat: destLat - 0.002, lng: destLng + 0.004 },
    { id: 'rec_rest_3', name: `Churrascaria & Grelhados Serra/Mar`, category: 'restaurant', rating: 4.7, distance: '1.2 km', address: `Av. Central, ${name}`, lat: destLat + 0.005, lng: destLng - 0.002 },
    { id: 'rec_rest_4', name: `Cantina Italiana Tradicional`, category: 'restaurant', rating: 4.8, distance: '1.5 km', address: `Rua do Comércio, ${name}`, lat: destLat - 0.004, lng: destLng - 0.003 },
    { id: 'rec_rest_5', name: `Peixaria & Frutos do Mar`, category: 'restaurant', rating: 4.9, distance: '1.8 km', address: `Orla Turística, ${name}`, lat: destLat + 0.006, lng: destLng + 0.005 },

    // 5 CAFÉS
    { id: 'rec_cafe_1', name: `Café da Praça & Confeitaria`, category: 'cafe', rating: 4.8, distance: '400 m', address: `Praça Matriz, ${name}`, lat: destLat + 0.001, lng: destLng - 0.002 },
    { id: 'rec_cafe_2', name: `Empório & Cafeteria Gourmet`, category: 'cafe', rating: 4.9, distance: '700 m', address: `Rua das Palmeiras, ${name}`, lat: destLat - 0.003, lng: destLng + 0.002 },
    { id: 'rec_cafe_3', name: `Doceria & Padaria Artesanal`, category: 'cafe', rating: 4.7, distance: '950 m', address: `Av. Principal, ${name}`, lat: destLat + 0.004, lng: destLng + 0.001 },
    { id: 'rec_cafe_4', name: `Café com Prosa & Livraria`, category: 'cafe', rating: 4.8, distance: '1.1 km', address: `Rua Histórica, ${name}`, lat: destLat - 0.005, lng: destLng - 0.004 },
    { id: 'rec_cafe_5', name: `Sorvete & Açaí Concept`, category: 'cafe', rating: 4.6, distance: '1.3 km', address: `Av. dos Esportes, ${name}`, lat: destLat + 0.002, lng: destLng - 0.005 },

    // 5 HOTÉIS / POUSADAS
    { id: 'rec_hotel_1', name: `Pousada Beira Mar / Serra Premium`, category: 'hotel', rating: 4.9, distance: '1.1 km', address: `Av. da Praia / Orla, ${name}`, lat: destLat - 0.006, lng: destLng - 0.005 },
    { id: 'rec_hotel_2', name: `Hotel & Resort Vila Verde`, category: 'hotel', rating: 4.8, distance: '2.3 km', address: `Estrada do Parque, ${name}`, lat: destLat + 0.008, lng: destLng + 0.007 },
    { id: 'rec_hotel_3', name: `Pousada Charmosa do Vale`, category: 'hotel', rating: 4.7, distance: '1.6 km', address: `Rua dos Colibris, ${name}`, lat: destLat - 0.004, lng: destLng + 0.006 },
    { id: 'rec_hotel_4', name: `Flat & Suites Executive`, category: 'hotel', rating: 4.6, distance: '900 m', address: `Centro Executivo, ${name}`, lat: destLat + 0.002, lng: destLng - 0.003 },
    { id: 'rec_hotel_5', name: `Eco Pousada Natureza`, category: 'hotel', rating: 4.9, distance: '3.1 km', address: `Recanto Ecológico, ${name}`, lat: destLat + 0.011, lng: destLng - 0.009 },

    // 5 ATRAÇÕES / LAZER
    { id: 'rec_attr_1', name: `Mirante & Parque Panorâmico`, category: 'attraction', rating: 4.9, distance: '2.5 km', address: `Alto da Colina, ${name}`, lat: destLat + 0.010, lng: destLng - 0.008 },
    { id: 'rec_attr_2', name: `Centro Histórico & Feira de Artesanato`, category: 'attraction', rating: 4.8, distance: '500 m', address: `Largo das Artes, ${name}`, lat: destLat - 0.001, lng: destLng + 0.001 },
    { id: 'rec_attr_3', name: `Trilha Ecológica & Cachoeira do Sol`, category: 'attraction', rating: 4.9, distance: '4.2 km', address: `Estrada Ecológica, ${name}`, lat: destLat + 0.014, lng: destLng + 0.012 },
    { id: 'rec_attr_4', name: `Museu da Cultura & Galeria Local`, category: 'attraction', rating: 4.7, distance: '800 m', address: `Rua Imperial, ${name}`, lat: destLat - 0.003, lng: destLng - 0.002 },
    { id: 'rec_attr_5', name: `Praça Esportiva & Pier do Pôr do Sol`, category: 'attraction', rating: 4.8, distance: '1.4 km', address: `Orla Principal, ${name}`, lat: destLat - 0.005, lng: destLng + 0.003 },
  ];
}
