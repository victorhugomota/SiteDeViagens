/**
 * Formata um valor numérico para moeda brasileira (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

/**
 * Formata datas ISO (YYYY-MM-DD) para o padrão brasileiro (DD/MM/YYYY)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
}

/**
 * Retorna o número de noites entre duas datas ISO (YYYY-MM-DD)
 */
export function calculateNights(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Retorna imagens de alta qualidade do Unsplash de acordo com o nome da cidade ou destino
 */
export function getDestinationImageUrl(destination: string, customUrl?: string): string {
  if (customUrl && customUrl.trim().length > 0) return customUrl;

  const destLower = destination.toLowerCase();
  
  if (destLower.includes('praia') || destLower.includes('florianopolis') || destLower.includes('salvador') || destLower.includes('rio de janeiro') || destLower.includes('recife') || destLower.includes('u衝突') || destLower.includes('ubatuba') || destLower.includes('santos')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
  }
  if (destLower.includes('gramado') || destLower.includes('campos do jordao') || destLower.includes('serra') || destLower.includes('montanha') || destLower.includes('canela')) {
    return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80';
  }
  if (destLower.includes('sao paulo') || destLower.includes('curitiba') || destLower.includes('belo horizonte') || destLower.includes('brasilia')) {
    return 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=800&q=80';
  }
  
  // Imagem padrão de viagem deslumbrante
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
}
