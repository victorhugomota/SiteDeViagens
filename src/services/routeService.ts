export const DEFAULT_ORIGIN_ADDRESS = "Rua Alfredo Pucci, 80, BonFim Paulista, Ribeirão Preto - São Paulo, CEP:14110-000";

// Coordenadas aproximadas do endereço de partida padrão (Ribeirão Preto / Bonfim Paulista)
export const DEFAULT_ORIGIN_COORDS = {
  lat: -21.2655,
  lng: -47.8131
};

export interface RouteCalculationResult {
  distanceKm: number;
  estimatedTollCost: number;
  calculatedFuelCost: number;
  destinationCityState: string;
  durationMinutes?: number;
}

/**
 * Calcula a distância em km usando a fórmula de Haversine ajustada por fator rodoviário (1.28x)
 */
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;
  
  // Fator rodoviário típico no Brasil (curvas, desvios nas estradas): ~1.28
  return Math.round(straightDistance * 1.28);
}

/**
 * Estima o custo de pedágios com base na distância da rota rodoviária (em km)
 * No Brasil, a taxa média em rodovias concedidas fica em torno de R$ 0.14/km (a cada ~80-90km há um pedágio de R$ 12-18)
 */
export function estimateTollCost(distanceKm: number, isRoundTrip: boolean = true): number {
  const totalKm = isRoundTrip ? distanceKm * 2 : distanceKm;
  if (totalKm < 40) return 0; // Rotas urbanas curtas geralmente não têm pedágio
  
  // Estimativa baseada na média das praças de pedágio do estado de SP e rodovias federais
  const estimatedPlazas = Math.floor(totalKm / 85);
  const averageTollPrice = 14.50; // Valor médio de praça
  
  const estimatedCost = estimatedPlazas * averageTollPrice;
  return Math.round(estimatedCost * 100) / 100;
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
  const cost = litersNeeded * fuelPricePerLiter;
  return Math.round(cost * 100) / 100;
}

/**
 * Busca coordenadas e rota via Nominatim / OSRM com fallback inteligente
 */
export async function calculateRouteDetails(
  destinationQuery: string,
  fuelPricePerLiter: number,
  fuelEfficiencyKmL: number = 10,
  isRoundTrip: boolean = true
): Promise<RouteCalculationResult> {
  let distanceKm = 150; // Fallback seguro
  let destinationCityState = destinationQuery;
  let durationMinutes = 120;

  try {
    // 1. Tenta Geocoding do destino via OpenStreetMap Nominatim API
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationQuery)}&limit=1`;
    const geoRes = await fetch(geoUrl, {
      headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' }
    });

    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        const destLat = parseFloat(geoData[0].lat);
        const destLon = parseFloat(geoData[0].lon);
        destinationCityState = geoData[0].display_name.split(',').slice(0, 3).join(',');

        // 2. Tenta buscar rota real via OSRM public API
        try {
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${DEFAULT_ORIGIN_COORDS.lng},${DEFAULT_ORIGIN_COORDS.lat};${destLon},${destLat}?overview=false`;
          const osrmRes = await fetch(osrmUrl);
          if (osrmRes.ok) {
            const osrmData = await osrmRes.json();
            if (osrmData.routes && osrmData.routes.length > 0) {
              distanceKm = Math.round(osrmData.routes[0].distance / 1000);
              durationMinutes = Math.round(osrmData.routes[0].duration / 60);
            } else {
              distanceKm = haversineDistance(DEFAULT_ORIGIN_COORDS.lat, DEFAULT_ORIGIN_COORDS.lng, destLat, destLon);
            }
          } else {
            distanceKm = haversineDistance(DEFAULT_ORIGIN_COORDS.lat, DEFAULT_ORIGIN_COORDS.lng, destLat, destLon);
          }
        } catch {
          distanceKm = haversineDistance(DEFAULT_ORIGIN_COORDS.lat, DEFAULT_ORIGIN_COORDS.lng, destLat, destLon);
        }
      }
    }
  } catch (err) {
    console.warn("Erro ao buscar dados de rota, usando estimativa aproximada:", err);
  }

  // Garantir mínimo de 10 km se for uma viagem válida
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
    durationMinutes
  };
}
