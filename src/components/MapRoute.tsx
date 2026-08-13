import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { DEFAULT_ORIGIN_COORDS, DEFAULT_ORIGIN_ADDRESS, getNearbyRecommendations, fetchRealRoutePolyline } from '../services/routeService';
import { Utensils, Coffee, Hotel, Sparkles, MapPin, Star } from 'lucide-react';

const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-cyan.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const placeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [20, 32], iconAnchor: [10, 32], popupAnchor: [1, -26], shadowSize: [32, 32]
});

interface MapRouteProps {
  destinationName: string;
  destLat?: number;
  destLng?: number;
  routePolyline?: [number, number][]; // Pontos reais da estrada do OSRM
}

export const MapRoute: React.FC<MapRouteProps> = ({
  destinationName,
  destLat = -27.5954,
  destLng = -48.5480,
  routePolyline: externalPolyline
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'restaurant' | 'cafe' | 'hotel' | 'attraction'>('all');
  const [realPolyline, setRealPolyline] = useState<[number, number][] | null>(externalPolyline || null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const originCoords: [number, number] = [DEFAULT_ORIGIN_COORDS.lat, DEFAULT_ORIGIN_COORDS.lng];
  const destCoords: [number, number] = [destLat, destLng];
  const centerLat = (originCoords[0] + destCoords[0]) / 2;
  const centerLng = (originCoords[1] + destCoords[1]) / 2;

  // Se não recebeu polyline externa, busca do OSRM
  useEffect(() => {
    if (externalPolyline) {
      setRealPolyline(externalPolyline);
      return;
    }
    let cancelled = false;
    const loadPolyline = async () => {
      setLoadingRoute(true);
      const poly = await fetchRealRoutePolyline(DEFAULT_ORIGIN_COORDS.lat, DEFAULT_ORIGIN_COORDS.lng, destLat, destLng);
      if (!cancelled) {
        setRealPolyline(poly);
        setLoadingRoute(false);
      }
    };
    loadPolyline();
    return () => { cancelled = true; };
  }, [destLat, destLng, externalPolyline]);

  const nearbyPlaces = getNearbyRecommendations(destinationName || 'Destino', destLat, destLng);
  const filteredPlaces = nearbyPlaces.filter(p => activeCategory === 'all' || p.category === activeCategory);

  // Linha reta de fallback
  const fallbackLine: [number, number][] = [originCoords, destCoords];
  const polylineToRender = realPolyline || fallbackLine;
  const isRealRoute = !!realPolyline;

  return (
    <div
      className="space-y-3 p-4 rounded-2xl border"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
    >
      {/* Barra de Filtros */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Locais Próximos:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { key: 'restaurant', label: 'Restaurantes', icon: Utensils, color: '#f43f5e' },
            { key: 'cafe', label: 'Café', icon: Coffee, color: '#f59e0b' },
            { key: 'hotel', label: 'Hotéis', icon: Hotel, color: '#818cf8' },
            { key: 'attraction', label: 'Atrações', icon: Sparkles, color: '#22d3ee' },
          ].map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(prev => prev === key as typeof activeCategory ? 'all' : key as typeof activeCategory)}
              className="px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border cursor-pointer"
              style={{
                backgroundColor: activeCategory === key ? `${color}20` : 'var(--bg-input)',
                color: activeCategory === key ? color : 'var(--text-secondary)',
                borderColor: activeCategory === key ? `${color}60` : 'var(--border-primary)'
              }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color }} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mapa com Rota Real */}
      <div className="h-64 w-full rounded-2xl overflow-hidden border relative z-0" style={{ borderColor: 'var(--border-primary)' }}>
        {loadingRoute && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-white font-medium">Carregando rota real...</span>
            </div>
          </div>
        )}
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={6}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={originCoords} icon={originIcon}>
            <Popup>
              <div className="text-xs font-bold">
                🚀 Partida (Fixo)
                <p className="text-[10px] font-normal mt-1">{DEFAULT_ORIGIN_ADDRESS}</p>
              </div>
            </Popup>
          </Marker>

          <Marker position={destCoords} icon={destIcon}>
            <Popup>
              <div className="text-xs font-bold">
                🏁 Destino: {destinationName}
              </div>
            </Popup>
          </Marker>

          {/* Rota Real (estrada) ou Fallback Tracejado */}
          <Polyline
            positions={polylineToRender}
            pathOptions={isRealRoute
              ? { color: '#06b6d4', weight: 5, opacity: 0.9 }
              : { color: '#94a3b8', weight: 3, opacity: 0.6, dashArray: '8, 8' }
            }
          />

          {filteredPlaces.map(place => (
            <Marker key={place.id} position={[place.lat, place.lng]} icon={placeIcon}>
              <Popup>
                <div className="text-xs">
                  <strong>{place.name}</strong>
                  <div className="text-[10px] mt-0.5">★ {place.rating} • {place.distance}</div>
                  <p className="text-[10px] mt-0.5">{place.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Badge de status da rota */}
      {!loadingRoute && (
        <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <div
            className="w-3 h-1.5 rounded-full"
            style={{ backgroundColor: isRealRoute ? '#06b6d4' : '#94a3b8' }}
          />
          <span>
            {isRealRoute ? '✓ Rota real pelas estradas (OSRM)' : '⚡ Rota estimada em linha reta (OSRM indisponível)'}
          </span>
        </div>
      )}

      {/* Cards de Recomendações */}
      {filteredPlaces.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {filteredPlaces.slice(0, 3).map(place => (
            <div
              key={place.id}
              className="p-2.5 rounded-xl border text-xs flex items-center justify-between"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
            >
              <div className="truncate mr-2">
                <span className="font-semibold block truncate" style={{ color: 'var(--text-primary)' }}>{place.name}</span>
                <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <MapPin className="w-3 h-3" style={{ color: 'var(--accent)' }} /> {place.distance}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0 bg-amber-950 text-amber-400 border border-amber-800">
                <Star className="w-3 h-3 fill-amber-400" /> {place.rating}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
