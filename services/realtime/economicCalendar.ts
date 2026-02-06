/**
 * Service Calendrier Économique
 * Récupère les événements économiques importants pour EUR/USD
 */

export interface EconomicEvent {
  id: string;
  title: string;
  country: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'CAD' | 'AUD' | 'NZD';
  date: Date;
  time: string;
  impact: 'low' | 'medium' | 'high';
  forecast?: string;
  previous?: string;
  actual?: string;
  currency: string;
  description?: string;
}

// Cache pour les événements
let cachedEvents: EconomicEvent[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Récupère les événements économiques de la semaine
 */
export async function fetchEconomicCalendar(): Promise<EconomicEvent[]> {
  // Vérifier le cache
  if (cachedEvents && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedEvents;
  }

  try {
    // Utiliser Forex Factory (gratuit, pas de clé API)
    const response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json');

    if (!response.ok) {
      console.warn('[Calendar] API non disponible, utilisation des données de fallback');
      return getFallbackEvents();
    }

    const data = await response.json();

    const events: EconomicEvent[] = data
      .filter((event: any) =>
        ['USD', 'EUR'].includes(event.country) &&
        event.impact !== 'Holiday'
      )
      .map((event: any, index: number) => ({
        id: `evt_${index}_${event.date}`,
        title: event.title,
        country: event.country as 'USD' | 'EUR',
        date: parseForexFactoryDate(event.date, event.time),
        time: event.time || 'All Day',
        impact: mapImpact(event.impact),
        forecast: event.forecast || undefined,
        previous: event.previous || undefined,
        actual: event.actual || undefined,
        currency: event.country,
        description: getEventDescription(event.title),
      }))
      .sort((a: EconomicEvent, b: EconomicEvent) => a.date.getTime() - b.date.getTime());

    cachedEvents = events;
    cacheTimestamp = Date.now();

    console.log(`[Calendar] ${events.length} événements économiques récupérés`);
    return events;
  } catch (error) {
    console.error('[Calendar] Erreur:', error);
    return getFallbackEvents();
  }
}

function parseForexFactoryDate(dateStr: string, timeStr: string): Date {
  try {
    // Format: "Dec 15" ou "12-15"
    const year = new Date().getFullYear();
    let date: Date;

    if (dateStr.includes('-')) {
      const [month, day] = dateStr.split('-');
      date = new Date(year, parseInt(month) - 1, parseInt(day));
    } else {
      date = new Date(`${dateStr} ${year}`);
    }

    // Ajouter l'heure si disponible
    if (timeStr && timeStr !== 'All Day' && timeStr !== 'Tentative') {
      const [hours, minutes] = timeStr.replace(/[ap]m/i, '').split(':');
      const isPM = timeStr.toLowerCase().includes('pm');
      let h = parseInt(hours);
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
      date.setHours(h, parseInt(minutes) || 0);
    }

    return date;
  } catch {
    return new Date();
  }
}

function mapImpact(impact: string): 'low' | 'medium' | 'high' {
  switch (impact?.toLowerCase()) {
    case 'high':
    case 'red':
      return 'high';
    case 'medium':
    case 'orange':
    case 'yellow':
      return 'medium';
    default:
      return 'low';
  }
}

function getEventDescription(title: string): string {
  const descriptions: Record<string, string> = {
    'Non-Farm Payrolls': 'Nombre d\'emplois créés hors secteur agricole. Impact majeur sur USD.',
    'NFP': 'Nombre d\'emplois créés hors secteur agricole. Impact majeur sur USD.',
    'CPI': 'Indice des prix à la consommation. Mesure l\'inflation.',
    'FOMC': 'Réunion du comité monétaire de la Fed. Décision sur les taux.',
    'ECB': 'Décision de la Banque Centrale Européenne sur les taux.',
    'GDP': 'Produit Intérieur Brut. Croissance économique.',
    'Retail Sales': 'Ventes au détail. Indicateur de consommation.',
    'Unemployment': 'Taux de chômage.',
    'PMI': 'Indice des directeurs d\'achat. Santé économique.',
    'Interest Rate': 'Décision sur les taux d\'intérêt.',
  };

  for (const [key, desc] of Object.entries(descriptions)) {
    if (title.toLowerCase().includes(key.toLowerCase())) {
      return desc;
    }
  }

  return '';
}

/**
 * Événements de fallback quand l'API n'est pas disponible
 */
function getFallbackEvents(): EconomicEvent[] {
  const now = new Date();
  const events: EconomicEvent[] = [];

  // Générer des événements fictifs pour la semaine
  const importantEvents = [
    { title: 'FOMC Meeting Minutes', country: 'USD', impact: 'high' },
    { title: 'ECB Interest Rate Decision', country: 'EUR', impact: 'high' },
    { title: 'US Non-Farm Payrolls', country: 'USD', impact: 'high' },
    { title: 'EU CPI (YoY)', country: 'EUR', impact: 'medium' },
    { title: 'US Initial Jobless Claims', country: 'USD', impact: 'medium' },
    { title: 'German ZEW Economic Sentiment', country: 'EUR', impact: 'medium' },
    { title: 'US Retail Sales (MoM)', country: 'USD', impact: 'medium' },
    { title: 'EU GDP (QoQ)', country: 'EUR', impact: 'high' },
  ];

  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);

    // Ajouter 1-2 événements par jour
    const eventsForDay = importantEvents.slice(i % importantEvents.length, (i % importantEvents.length) + 2);

    eventsForDay.forEach((evt, idx) => {
      const eventDate = new Date(date);
      eventDate.setHours(8 + idx * 4, 30, 0, 0);

      events.push({
        id: `fallback_${i}_${idx}`,
        title: evt.title,
        country: evt.country as 'USD' | 'EUR',
        date: eventDate,
        time: `${8 + idx * 4}:30 AM`,
        impact: evt.impact as 'low' | 'medium' | 'high',
        forecast: '--',
        previous: '--',
        currency: evt.country,
        description: getEventDescription(evt.title),
      });
    });
  }

  return events;
}

/**
 * Récupère les événements à fort impact pour les prochaines 24h
 */
export async function getHighImpactEventsNext24h(): Promise<EconomicEvent[]> {
  const events = await fetchEconomicCalendar();
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return events.filter(
    (event) =>
      event.impact === 'high' &&
      event.date >= now &&
      event.date <= in24h
  );
}

/**
 * Récupère les événements pour aujourd'hui
 */
export async function getTodayEvents(): Promise<EconomicEvent[]> {
  const events = await fetchEconomicCalendar();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return events.filter(
    (event) => event.date >= today && event.date < tomorrow
  );
}

/**
 * Récupère le prochain événement à fort impact
 */
export async function getNextHighImpactEvent(): Promise<EconomicEvent | null> {
  const events = await fetchEconomicCalendar();
  const now = new Date();

  const upcoming = events.filter(
    (event) => event.impact === 'high' && event.date > now
  );

  return upcoming[0] || null;
}

/**
 * Vérifie si on est dans une période de risque (proche d'un événement majeur)
 */
export async function isHighRiskPeriod(): Promise<{
  isHighRisk: boolean;
  reason?: string;
  event?: EconomicEvent;
}> {
  const events = await getHighImpactEventsNext24h();

  if (events.length === 0) {
    return { isHighRisk: false };
  }

  const now = new Date();
  const soon = events.find((evt) => {
    const diff = evt.date.getTime() - now.getTime();
    return diff > 0 && diff < 2 * 60 * 60 * 1000; // Dans les 2 prochaines heures
  });

  if (soon) {
    return {
      isHighRisk: true,
      reason: `${soon.title} dans moins de 2 heures`,
      event: soon,
    };
  }

  return {
    isHighRisk: false,
    reason: `${events.length} événements majeurs dans les 24h`,
  };
}
