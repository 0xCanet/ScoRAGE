export type DomainObservation = {
  available: boolean;
  domain?: string;
  registeredAt?: string;
  updatedAt?: string;
  ageDays?: number;
  notes: string[];
  error?: string;
};

const parseDate = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export async function inspectDomain(domain?: string): Promise<DomainObservation> {
  if (!domain) {
    return {
      available: false,
      notes: ['Aucun domaine exploitable'],
      error: 'domain missing',
    };
  }

  try {
    const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      headers: {
        accept: 'application/rdap+json, application/json',
        'user-agent': 'ScoRAGE/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`RDAP HTTP ${response.status}`);
    }

    const payload = (await response.json()) as { events?: Array<{ eventAction?: string; eventDate?: string }> };
    const registrationEvent = payload.events?.find((event) => /registration/i.test(event.eventAction ?? ''));
    const updatedEvent = payload.events?.find((event) => /last changed|last update/i.test(event.eventAction ?? ''));
    const registeredAt = parseDate(registrationEvent?.eventDate);
    const updatedAt = parseDate(updatedEvent?.eventDate);
    const ageDays = registeredAt ? Math.max(0, Math.floor((Date.now() - new Date(registeredAt).getTime()) / 86_400_000)) : undefined;
    const notes = ['RDAP domaine récupéré'];
    if (ageDays !== undefined) {
      notes.push(`Âge du domaine estimé: ${ageDays} jour(s)`);
    }

    return {
      available: true,
      domain,
      registeredAt,
      updatedAt,
      ageDays,
      notes,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'RDAP indisponible';
    return {
      available: false,
      domain,
      notes: [message],
      error: message,
    };
  }
}
