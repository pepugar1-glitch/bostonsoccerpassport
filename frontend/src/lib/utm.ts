// Deep-link + UTM helpers.
// TODO(integration: Ticketmaster) Swap the placeholder host below for the real
//   Revs / Ticketmaster / SeatGeek partner URL once provided. UTM structure is
//   fixed per the campaign spec.

import type { FanArchetype } from '@/types';

/**
 * Placeholder ticketing host. DO NOT treat as a real URL — it's a structured
 * stand-in so the campaign UTMs are reviewable in the prototype.
 */
export const TICKETING_PLACEHOLDER_HOST = 'https://example.com/revs-tickets';

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

/** Build a deep link to the Revs ticketing placeholder with full UTM tagging. */
export function buildTicketLink(params: UtmParams): string {
  const qs = buildUtm(params).toString();
  return `${TICKETING_PLACEHOLDER_HOST}?${qs}`;
}

/** Build a per-venue QR landing URL — the app itself, with attribution params. */
export function buildVenueLandingUrl(origin: string, params: UtmParams): string {
  const qs = buildUtm(params).toString();
  return `${origin.replace(/\/$/, '')}/?venue=${encodeURIComponent(params.venueId)}&${qs}`;
}
