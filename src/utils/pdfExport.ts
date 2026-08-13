import type { Trip } from '../types/trip';
import { formatCurrency, formatDate, calculateNights } from './formatters';
import { getNearbyRecommendations } from '../services/routeService';

export function exportTripToPdf(trip: Trip): void {
  const nights = calculateNights(trip.startDate, trip.endDate);
  const totalKm = (trip.transport?.distanceKm || 0) * 2;
  const extraItems = trip.extraItems || [];

  const originLat = trip.originLat || -21.2655;
  const originLng = trip.originLng || -47.8131;
  const destLat = trip.destinationLat || -27.5954;
  const destLng = trip.destinationLng || -48.5480;

  // Busca as 5 recomendações por categoria para o destino
  const recPlaces = getNearbyRecommendations(trip.destinationAddress, destLat, destLng);
  const restaurants = recPlaces.filter(p => p.category === 'restaurant');
  const cafes = recPlaces.filter(p => p.category === 'cafe');
  const hotels = recPlaces.filter(p => p.category === 'hotel');
  const attractions = recPlaces.filter(p => p.category === 'attraction');

  const getGoogleSearchUrl = (name: string, address: string) => {
    return `https://www.google.com/search?q=${encodeURIComponent(name + ' ' + address)}`;
  };

  const printWindow = window.open('', '_blank', 'width=980,height=1000');
  if (!printWindow) {
    alert('Por favor, permita pop-ups no seu navegador para exportar o PDF.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Viagem - ${trip.title || trip.destinationAddress}</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          font-family: 'Inter', system-ui, sans-serif;
          color: #f1f5f9;
          background: #020817;
          padding: 28px;
          font-size: 12px;
          line-height: 1.45;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 14px;
          border-bottom: 2px solid #06b6d4;
          margin-bottom: 20px;
        }

        .header-title h1 {
          font-size: 22px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .header-title p {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }

        .doc-meta {
          text-align: right;
          font-size: 11px;
          color: #94a3b8;
        }

        .trip-banner {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .trip-title {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .trip-route {
          font-size: 12px;
          color: #cbd5e1;
          margin-bottom: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .route-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .grid-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 14px;
        }

        .summary-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 10px;
          padding: 10px;
        }

        .summary-card label {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          display: block;
          margin-bottom: 3px;
        }

        .summary-card value {
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          display: block;
        }

        .summary-card sub {
          font-size: 9px;
          color: #64748b;
        }

        .section-title {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #22d3ee;
          margin-top: 20px;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 2px solid #1e293b;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          border-radius: 10px;
          overflow: hidden;
        }

        th {
          background: #1e293b;
          text-align: left;
          padding: 10px 12px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          border-bottom: 1px solid #334155;
        }

        td {
          padding: 10px 12px;
          border-bottom: 1px solid #1e293b;
          font-size: 11px;
          color: #f1f5f9;
        }

        tr:nth-child(even) td {
          background: #0f172a;
        }

        tr:nth-child(odd) td {
          background: #090d16;
        }

        .total-box {
          background: #090d16;
          color: #ffffff;
          border: 2px solid #16a34a;
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 20px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.15);
        }

        .total-box label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          display: block;
        }

        .total-box .price {
          font-size: 24px;
          font-weight: 900;
          color: #22c55e;
        }

        .rec-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .rec-box {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 12px;
        }

        .rec-box h4 {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: #ffffff;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rec-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #1e293b;
          font-size: 10px;
          transition: background 0.2s;
        }

        .rec-item:last-child {
          border-bottom: none;
        }

        .rec-link {
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .rec-link:hover {
          color: #22d3ee;
        }

        #pdf-local-map, #pdf-map {
          height: 360px;
          width: 100%;
          border-radius: 14px;
          border: 1px solid #334155;
          margin-top: 10px;
          margin-bottom: 20px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        }

        .footer {
          margin-top: 24px;
          text-align: center;
          font-size: 10px;
          color: #64748b;
          border-top: 1px dashed #334155;
          padding-top: 12px;
        }

        @media print {
          body {
            padding: 12px;
            background: #020817 !important;
            color: #f1f5f9 !important;
          }
          .no-print { display: none; }
          .page-break { page-break-before: always; }
        }
      </style>
    </head>
    <body>
      
      <div class="no-print" style="margin-bottom: 16px; text-align: right;">
        <button onclick="window.print()" style="background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; border: none; padding: 10px 22px; font-weight: bold; border-radius: 10px; cursor: pointer; font-size: 12px; shadow: 0 4px 12px rgba(6,182,212,0.3);">
          🖨️ Imprimir / Salvar em PDF
        </button>
      </div>

      <!-- Cabeçalho Limpo -->
      <div class="header">
        <div class="header-title">
          <h1>Viagens Victor e Maria</h1>
          <p>Relatório Oficial de Planejamento & Controle de Gastos</p>
        </div>
        <div class="doc-meta">
          <p><strong>Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          <p>Documento de Controle Físico</p>
        </div>
      </div>

      <!-- Banner da Viagem -->
      <div class="trip-banner">
        <div class="trip-title">${trip.title || trip.destinationAddress}</div>
        <div class="trip-route">
          <div class="route-item"><strong>📍 Partida:</strong> ${trip.originAddress}</div>
          <div class="route-item"><strong>🏁 Destino:</strong> ${trip.destinationAddress}</div>
          <div class="route-item"><strong>📅 Datas:</strong> ${formatDate(trip.startDate)} a ${formatDate(trip.endDate)} (${nights} noites)</div>
        </div>

        <div class="grid-summary">
          <div class="summary-card">
            <label>Distância Total</label>
            <value>${totalKm} km</value>
            <sub>Ida e Volta</sub>
          </div>
          <div class="summary-card">
            <label>Hospedagem</label>
            <value>${formatCurrency(trip.accommodation?.totalCost || 0)}</value>
            <sub>${nights}x ${formatCurrency(trip.accommodation?.pricePerNight || 0)}</sub>
          </div>
          <div class="summary-card">
            <label>Combustível</label>
            <value>${formatCurrency(trip.transport?.calculatedFuelCost || 0)}</value>
            <sub>Ida e Volta</sub>
          </div>
          <div class="summary-card">
            <label>Pedágios</label>
            <value>${formatCurrency(trip.transport?.tollCost || 0)}</value>
            <sub>Ida e Volta</sub>
          </div>
        </div>
      </div>

      <!-- Resumo dos Serviços -->
      <div class="section-title">Resumo dos Serviços</div>
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Descrição / Local</th>
            <th>Detalhes</th>
            <th>Custo Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Hospedagem</strong></td>
            <td>${trip.accommodation?.name || 'Não informada'}</td>
            <td>${nights} diárias (${formatCurrency(trip.accommodation?.pricePerNight || 0)}/noite)</td>
            <td><strong style="color: #22d3ee;">${formatCurrency(trip.accommodation?.totalCost || 0)}</strong></td>
          </tr>
          <tr>
            <td><strong>Combustível</strong></td>
            <td>Consumo estimado (${trip.transport?.fuelEfficiencyKmL || 10} km/L)</td>
            <td>${totalKm} km (Ida e Volta) a ${formatCurrency(trip.transport?.fuelPricePerLiter || 0)}/L</td>
            <td><strong style="color: #22d3ee;">${formatCurrency(trip.transport?.calculatedFuelCost || 0)}</strong></td>
          </tr>
          <tr>
            <td><strong>Pedágios</strong></td>
            <td>Praças de pedágio na rota</td>
            <td>Estimado para Ida e Volta</td>
            <td><strong style="color: #22d3ee;">${formatCurrency(trip.transport?.tollCost || 0)}</strong></td>
          </tr>
          ${trip.carRental?.enabled ? `
          <tr>
            <td><strong>Aluguel de Carro</strong></td>
            <td>Locação de veículo</td>
            <td>${trip.carRental.daysCount} diárias (${formatCurrency(trip.carRental.pricePerDay)}/dia) ${trip.carRental.hasSundayExtraDay ? '(Regra do Domingo inclusa)' : ''}</td>
            <td><strong style="color: #22d3ee;">${formatCurrency(trip.carRental.totalCost)}</strong></td>
          </tr>
          ` : ''}
        </tbody>
      </table>

      <!-- Alimentação e Custos Adicionais -->
      ${extraItems.length > 0 ? `
      <div class="section-title">Alimentação & Custos Adicionais</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Descrição do Item</th>
            <th style="text-align: right;">Valor (R$)</th>
          </tr>
        </thead>
        <tbody>
          ${extraItems.map((item, idx) => `
            <tr>
              <td style="width: 30px;">${idx + 1}</td>
              <td>${item.description}</td>
              <td style="text-align: right;"><strong style="color: #22d3ee;">${formatCurrency(item.value)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}

      <!-- Observações -->
      ${trip.notes ? `
      <div class="section-title">Observações</div>
      <p style="background: #0f172a; padding: 10px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 16px; color: #cbd5e1;">${trip.notes}</p>
      ` : ''}

      <!-- Caixa do Orçamento Geral -->
      <div class="total-box">
        <div>
          <label>Orçamento Geral Estimado</label>
          <span style="font-size: 10px; color: #94a3b8;">Todos os custos calculados para a viagem</span>
        </div>
        <div class="price">${formatCurrency(trip.totalEstimateCost || 0)}</div>
      </div>

      <!-- SEÇÃO: RECOMENDAÇÕES LOCAIS + MAPA DE ZOOM NO DESTINO -->
      <div class="page-break">
        <div class="section-title">📍 Recomendações Locais Próximas ao Destino (Clique para Abrir no Google)</div>
        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 12px;">
          Opções sugeridas na região de <strong>${trip.destinationAddress}</strong>. Clique em qualquer local para pesquisar detalhes e ver avaliações no Google:
        </p>

        <div class="rec-grid">
          <!-- Restaurantes -->
          <div class="rec-box">
            <h4><span>🍽️ Alimentação & Restaurantes</span> <span style="color:#f43f5e; font-size:10px;">(5 opções)</span></h4>
            ${restaurants.map(r => `
              <div class="rec-item">
                <a href="${getGoogleSearchUrl(r.name, r.address)}" target="_blank" rel="noopener noreferrer" class="rec-link" title="Abrir ${r.name} no Google">
                  <div><strong style="color:#22d3ee;">${r.name} ↗</strong><br><span style="color:#94a3b8;">${r.distance} • ${r.address}</span></div>
                  <span style="font-weight:bold; color:#f43f5e; margin-left: 6px;">★ ${r.rating}</span>
                </a>
              </div>
            `).join('')}
          </div>

          <!-- Cafés -->
          <div class="rec-box">
            <h4><span>☕ Cafés & Confeitarias</span> <span style="color:#f59e0b; font-size:10px;">(5 opções)</span></h4>
            ${cafes.map(c => `
              <div class="rec-item">
                <a href="${getGoogleSearchUrl(c.name, c.address)}" target="_blank" rel="noopener noreferrer" class="rec-link" title="Abrir ${c.name} no Google">
                  <div><strong style="color:#22d3ee;">${c.name} ↗</strong><br><span style="color:#94a3b8;">${c.distance} • ${c.address}</span></div>
                  <span style="font-weight:bold; color:#f59e0b; margin-left: 6px;">★ ${c.rating}</span>
                </a>
              </div>
            `).join('')}
          </div>

          <!-- Hotéis -->
          <div class="rec-box">
            <h4><span>🏨 Hotéis & Pousadas</span> <span style="color:#818cf8; font-size:10px;">(5 opções)</span></h4>
            ${hotels.map(h => `
              <div class="rec-item">
                <a href="${getGoogleSearchUrl(h.name, h.address)}" target="_blank" rel="noopener noreferrer" class="rec-link" title="Abrir ${h.name} no Google">
                  <div><strong style="color:#22d3ee;">${h.name} ↗</strong><br><span style="color:#94a3b8;">${h.distance} • ${h.address}</span></div>
                  <span style="font-weight:bold; color:#818cf8; margin-left: 6px;">★ ${h.rating}</span>
                </a>
              </div>
            `).join('')}
          </div>

          <!-- Lazer / Atrações -->
          <div class="rec-box">
            <h4><span>🎡 Lazer & Atrações</span> <span style="color:#06b6d4; font-size:10px;">(5 opções)</span></h4>
            ${attractions.map(a => `
              <div class="rec-item">
                <a href="${getGoogleSearchUrl(a.name, a.address)}" target="_blank" rel="noopener noreferrer" class="rec-link" title="Abrir ${a.name} no Google">
                  <div><strong style="color:#22d3ee;">${a.name} ↗</strong><br><span style="color:#94a3b8;">${a.distance} • ${a.address}</span></div>
                  <span style="font-weight:bold; color:#06b6d4; margin-left: 6px;">★ ${a.rating}</span>
                </a>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="font-weight:bold; font-size:11px; margin-top:10px; color:#cbd5e1;">
          Mapa Zoom no Destino com as Recomendações Marcadas:
        </div>
        <div id="pdf-local-map"></div>
      </div>

      <!-- SEÇÃO: MAPA DA ROTA REAL ESTRADA (ÚLTIMA PÁGINA) -->
      <div class="page-break">
        <div class="section-title">🗺️ Mapa e Rota Real da Viagem (Estradas)</div>
        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
          Percurso rodoviário completo entre <strong>${trip.originAddress}</strong> e <strong>${trip.destinationAddress}</strong>.
        </p>
        <div id="pdf-map"></div>
      </div>

      <div class="footer">
        Viagens Victor e Maria • Documento gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
      </div>

      <script>
        window.onload = function() {
          try {
            const originLat = ${originLat};
            const originLng = ${originLng};
            const destLat = ${destLat};
            const destLng = ${destLng};
            const places = ${JSON.stringify(recPlaces)};

            // 1. MAPA ZOOM NO DESTINO (RECOMENDAÇÕES)
            const localMap = L.map('pdf-local-map', { zoomControl: false }).setView([destLat, destLng], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap'
            }).addTo(localMap);

            const categoryColors = {
              restaurant: '#f43f5e',
              cafe: '#f59e0b',
              hotel: '#818cf8',
              attraction: '#06b6d4'
            };

            const localBounds = [];
            places.forEach(p => {
              localBounds.push([p.lat, p.lng]);
              L.circleMarker([p.lat, p.lng], {
                color: categoryColors[p.category] || '#06b6d4',
                fillColor: categoryColors[p.category] || '#06b6d4',
                fillOpacity: 1,
                radius: 7
              }).addTo(localMap).bindPopup('<b>' + p.name + '</b><br>' + p.distance + ' • ★ ' + p.rating);
            });

            if (localBounds.length > 0) {
              localMap.fitBounds(localBounds, { padding: [25, 25] });
            }

            // 2. MAPA ROTA COMPLETA ESTRADA
            const fullMap = L.map('pdf-map', { zoomControl: false }).setView([(originLat + destLat)/2, (originLng + destLng)/2], 7);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap'
            }).addTo(fullMap);

            L.circleMarker([originLat, originLng], {
              color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 1, radius: 8
            }).addTo(fullMap).bindPopup('<b>Partida:</b> ${trip.originAddress.replace(/'/g, "\\'")}');

            L.circleMarker([destLat, destLng], {
              color: '#f43f5e', fillColor: '#f43f5e', fillOpacity: 1, radius: 8
            }).addTo(fullMap).bindPopup('<b>Destino:</b> ${trip.destinationAddress.replace(/'/g, "\\'")}');

            fetch('https://router.project-osrm.org/route/v1/driving/' + originLng + ',' + originLat + ';' + destLng + ',' + destLat + '?overview=full&geometries=geojson')
              .then(res => res.json())
              .then(data => {
                if (data.routes && data.routes[0] && data.routes[0].geometry) {
                  const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                  const poly = L.polyline(coords, { color: '#06b6d4', weight: 5, opacity: 0.85 }).addTo(fullMap);
                  fullMap.fitBounds(poly.getBounds(), { padding: [30, 30] });
                } else {
                  const poly = L.polyline([[originLat, originLng], [destLat, destLng]], { color: '#06b6d4', weight: 4, dashArray: '6, 6' }).addTo(fullMap);
                  fullMap.fitBounds(poly.getBounds(), { padding: [30, 30] });
                }
                setTimeout(function() { window.print(); }, 900);
              })
              .catch(() => {
                const poly = L.polyline([[originLat, originLng], [destLat, destLng]], { color: '#06b6d4', weight: 4 }).addTo(fullMap);
                fullMap.fitBounds(poly.getBounds(), { padding: [30, 30] });
                setTimeout(function() { window.print(); }, 900);
              });
          } catch (e) {
            setTimeout(function() { window.print(); }, 900);
          }
        };
      </script>

    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
