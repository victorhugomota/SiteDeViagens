import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { DEFAULT_ORIGIN_COORDS, DEFAULT_ORIGIN_ADDRESS, getNearbyRecommendations } from '../services/routeService';
import { Utensils, Coffee, Hotel, Sparkles, MapPin, Star } from 'lucide-react';

// Custom Map Markers Icons
const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-cyan.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const placeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -26],
  shadowSize: [32, 32]
});

interface MapRouteProps {
  destinationName: string;
  destLat?: number;
  destLng?: number;
}

export const MapRoute: React.FC<MapRouteProps> = ({
  destinationName,
  destLat = -27.5954,
  destLng = -48.5480
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'restaurant' | 'cafe' | 'hotel' | 'attraction'>('all');

  const originCoords: [number, number] = [DEFAULT_ORIGIN_COORDS.lat, DEFAULT_ORIGIN_COORDS.lng];
  const destCoords: [number, number] = [destLat, destLng];
  const centerLat = (originCoords[0] + destCoords[0]) / 2;
  const centerLng = (originCoords[1] + destCoords[1]) / 2;

  const polylineCoords = [originCoords, destCoords];

  const nearbyPlaces = getNearbyRecommendations(destinationName || 'Destino', destLat, destLng);

  const filteredPlaces = nearbyPlaces.filter(p => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
      
      {/* Barra de Filtros de Locais Próximos (Estilo Google Maps) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
          Locais Próximos:
        </span>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveCategory('restaurant')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors border cursor-pointer ${
              activeCategory === 'restaurant'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-rose-400" />
            <span>Restaurantes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('cafe')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors border cursor-pointer ${
              activeCategory === 'cafe'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>Café</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('hotel')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors border cursor-pointer ${
              activeCategory === 'hotel'
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Hotel className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hotéis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('attraction')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors border cursor-pointer ${
              activeCategory === 'attraction'
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Atrações e Lazer</span>
          </button>
        </div>
      </div>

      {/* Mapa Interativo com Trajeto */}
      <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative z-0">
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

          {/* Marcador de Origem (Ribeirão Preto) */}
          <Marker position={originCoords} icon={originIcon}>
            <Popup>
              <div className="text-xs font-bold text-slate-900">
                🚀 Partida (Fixo)
                <p className="text-[10px] font-normal text-slate-700">{DEFAULT_ORIGIN_ADDRESS}</p>
              </div>
            </Popup>
          </Marker>

          {/* Marcador do Destino Selecionado */}
          <Marker position={destCoords} icon={destIcon}>
            <Popup>
              <div className="text-xs font-bold text-slate-900">
                🏁 Destino: {destinationName}
              </div>
            </Popup>
          </Marker>

          {/* Linha da Rota Traçada */}
          <Polyline
            positions={polylineCoords}
            pathOptions={{ color: '#06b6d4', weight: 4, opacity: 0.8, dashArray: '8, 8' }}
          />

          {/* Marcadores de Locais Próximos */}
          {filteredPlaces.map((place) => (
            <Marker key={place.id} position={[place.lat, place.lng]} icon={placeIcon}>
              <Popup>
                <div className="text-xs text-slate-900">
                  <strong>{place.name}</strong>
                  <div className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5">
                    ★ {place.rating} • {place.distance}
                  </div>
                  <p className="text-[10px] text-slate-600">{place.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Cards de Recomendações Próximas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {filteredPlaces.slice(0, 3).map((place) => (
          <div key={place.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
            <div className="truncate">
              <span className="font-semibold text-slate-200 block truncate">{place.name}</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> {place.distance} • {place.address}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
              <Star className="w-3 h-3 fill-amber-400" /> {place.rating}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};
