import type { Trip } from '../types/trip';
import { formatCurrency, formatDate, calculateNights } from './formatters';

export function exportTripToPdf(trip: Trip): void {
  const nights = calculateNights(trip.startDate, trip.endDate);
  const totalKm = (trip.transport?.distanceKm || 0) * 2;
  const logoUrl = `${window.location.origin}${import.meta.env.BASE_URL}logo.jpg`;

  const extraItems = trip.extraItems || [];

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
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
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Inter', system-ui, sans-serif;
          color: #0f172a;
          background: #ffffff;
          padding: 32px;
          font-size: 13px;
          line-height: 1.5;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 20px;
          border-bottom: 2px solid #06b6d4;
          margin-bottom: 24px;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .header-logo {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          object-fit: cover;
          border: 2px solid #06b6d4;
        }

        .header-title h1 {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
        }

        .header-title p {
          font-size: 11px;
          color: #64748b;
        }

        .doc-meta {
          text-align: right;
          font-size: 11px;
          color: #64748b;
        }

        .trip-banner {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .trip-title {
          font-size: 22px;
          font-weight: 800;
          color: #020817;
          margin-bottom: 6px;
        }

        .trip-route {
          font-size: 13px;
          color: #334155;
          margin-bottom: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .route-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .grid-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        .summary-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px;
        }

        .summary-card label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          display: block;
          margin-bottom: 4px;
        }

        .summary-card value {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          display: block;
        }

        .summary-card sub {
          font-size: 10px;
          color: #94a3b8;
        }

        .section-title {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #0f172a;
          margin-top: 24px;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e2e8f0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        th {
          background: #f1f5f9;
          text-align: left;
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #475569;
          border-bottom: 1px solid #cbd5e1;
        }

        td {
          padding: 10px 14px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
        }

        tr:nth-child(even) td {
          background: #f8fafc;
        }

        .total-box {
          background: #020817;
          color: #ffffff;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 28px;
        }

        .total-box label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          display: block;
        }

        .total-box .price {
          font-size: 26px;
          font-weight: 900;
          color: #22c55e;
        }

        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          color: #94a3b8;
          border-top: 1px dashed #cbd5e1;
          padding-top: 16px;
        }

        @media print {
          body { padding: 16px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      
      <div className="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #06b6d4; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 10px; cursor: pointer; font-size: 13px;">
          🖨️ Imprimir / Salvar em PDF
        </button>
      </div>

      <!-- Cabeçalho -->
      <div className="header">
        <div className="header-brand">
          <img src="${logoUrl}" alt="Logo" className="header-logo" onerror="this.style.display='none'" />
          <div className="header-title">
            <h1>Viagens Victor e Maria</h1>
            <p>Relatório de Planejamento & Controle de Gastos</p>
          </div>
        </div>
        <div className="doc-meta">
          <p><strong>Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          <p>Documento de Controle Físico</p>
        </div>
      </div>

      <!-- Banner da Viagem -->
      <div className="trip-banner">
        <div className="trip-title">${trip.title || trip.destinationAddress}</div>
        <div className="trip-route">
          <div className="route-item"><strong>📍 Partida:</strong> ${trip.originAddress}</div>
          <div className="route-item"><strong>🏁 Destino:</strong> ${trip.destinationAddress}</div>
          <div className="route-item"><strong>📅 Datas:</strong> ${formatDate(trip.startDate)} a ${formatDate(trip.endDate)} (${nights} noites)</div>
        </div>

        <div className="grid-summary">
          <div className="summary-card">
            <label>Distância Total</label>
            <value>${totalKm} km</value>
            <sub>Ida e Volta</sub>
          </div>
          <div className="summary-card">
            <label>Hospedagem</label>
            <value>${formatCurrency(trip.accommodation?.totalCost || 0)}</value>
            <sub>${nights}x ${formatCurrency(trip.accommodation?.pricePerNight || 0)}</sub>
          </div>
          <div className="summary-card">
            <label>Combustível</label>
            <value>${formatCurrency(trip.transport?.calculatedFuelCost || 0)}</value>
            <sub>Ida e Volta</sub>
          </div>
          <div className="summary-card">
            <label>Pedágios</label>
            <value>${formatCurrency(trip.transport?.tollCost || 0)}</value>
            <sub>Ida e Volta</sub>
          </div>
        </div>
      </div>

      <!-- Detalhes de Hospedagem e Transporte -->
      <div className="section-title">Resumo dos Serviços</div>
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
            <td><strong>${formatCurrency(trip.accommodation?.totalCost || 0)}</strong></td>
          </tr>
          <tr>
            <td><strong>Combustível</strong></td>
            <td>Consumo estimado (${trip.transport?.fuelEfficiencyKmL || 10} km/L)</td>
            <td>${totalKm} km (Ida e Volta) a ${formatCurrency(trip.transport?.fuelPricePerLiter || 0)}/L</td>
            <td><strong>${formatCurrency(trip.transport?.calculatedFuelCost || 0)}</strong></td>
          </tr>
          <tr>
            <td><strong>Pedágios</strong></td>
            <td>Praças de pedágio na rota</td>
            <td>Estimado para Ida e Volta</td>
            <td><strong>${formatCurrency(trip.transport?.tollCost || 0)}</strong></td>
          </tr>
          ${trip.carRental?.enabled ? `
          <tr>
            <td><strong>Aluguel de Carro</strong></td>
            <td>Locação de veículo</td>
            <td>${trip.carRental.daysCount} diárias (${formatCurrency(trip.carRental.pricePerDay)}/dia) ${trip.carRental.hasSundayExtraDay ? '(Regra do Domingo inclusa)' : ''}</td>
            <td><strong>${formatCurrency(trip.carRental.totalCost)}</strong></td>
          </tr>
          ` : ''}
        </tbody>
      </table>

      <!-- Alimentação e Itens Extras -->
      ${extraItems.length > 0 ? `
      <div className="section-title">Alimentação & Custos Adicionais</div>
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
              <td style="width: 40px;">${idx + 1}</td>
              <td>${item.description}</td>
              <td style="text-align: right;"><strong>${formatCurrency(item.value)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}

      <!-- Observações -->
      ${trip.notes ? `
      <div className="section-title">Observações</div>
      <p style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">${trip.notes}</p>
      ` : ''}

      <!-- Caixa de Total -->
      <div className="total-box">
        <div>
          <label>Orçamento Geral Estimado</label>
          <span style="font-size: 11px; color: #cbd5e1;">Todos os custos calculados para a viagem</span>
        </div>
        <div className="price">${formatCurrency(trip.totalEstimateCost || 0)}</div>
      </div>

      <div className="footer">
        Viagens Victor e Maria • Documento gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>

    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
