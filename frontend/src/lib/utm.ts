// Deep-link + UTM helpers.

import type { FanArchetype } from '@/types';

// Official Revolution ticketing landing (verified live).
// Ticketmaster respects the UTMs we attach when the Revs site hands off.
export const TICKETING_BASE_URL = 'https://www.revolutionsoccer.net/tickets';

const FIXED_UTM = {
  utm_source: 'passport',
  utm_medium: 'qr',
  utm_campaign: 'wc2026',
} as const;

export interface UtmParams {
  venueId: string;
  archetype?: FanArchetype | string;
  extras?: Record<string, string>;
}

export function buildUtm({ venueId, archetype, extras }: UtmParams): URLSearchParams {
  const p = new URLSearchParams();
  p.set('utm_source', FIXED_UTM.utm_source);
  p.set('utm_medium', FIXED_UTM.utm_medium);
  p.set('utm_campaign', FIXED_UTM.utm_campaign);
  p.set('utm_content', venueId);
  if (archetype) p.set('utm_term', String(archetype));
  if (extras) for (const [k, v] of Object.entries(extras)) p.set(k, v);
  return p;
}

/**
 * Build a deep link to Revolution ticketing with full UTM tagging.
 * Pass `overrideHost` to point at a specific match page (e.g. a Ticketmaster
 * event URL) while keeping the UTM scheme consistent.
 */
export function buildTicketLink(params: UtmParams, overrideHost?: string): string {
  const qs = buildUtm(params).toString();
  const host = overrideHost || TICKETING_BASE_URL;
  const sep = host.includes('?') ? '&' : '?';
  return `${host}${sep}${qs}`;
}

/** Build a per-venue QR landing URL — the app itself, with attribution params. */
export function buildVenueLandingUrl(origin: string, params: UtmParams): string {
  const qs = buildUtm(params).toString();
  return `${origin.replace(/\/$/, '')}/?venue=${encodeURIComponent(params.venueId)}&${qs}`;
}
