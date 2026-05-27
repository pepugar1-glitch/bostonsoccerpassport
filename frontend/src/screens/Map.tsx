import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Tent,
  Tv2,
  Train,
  Landmark,
  Baby,
  Trophy,
  ChevronRight,
  X,
  MapPin,
  CalendarPlus,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { VENUES, CATEGORY_LABELS, CATEGORY_COLORS } from '@/data/venues';
import { EVENTS } from '@/data/content';
import type { Venue, VenueCategory } from '@/types';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/cn';

const CHIPS: { id: VenueCategory; label: string; icon: typeof Tent }[] = [
  { id: 'fan-festival', label: 'Fan Festival', icon: Tent },
  { id: 'watch-party', label: 'Watch Parties', icon: Tv2 },
  { id: 'transport', label: 'Transport', icon: Train },
  { id: 'culture-hub', label: 'Culture Hubs', icon: Landmark },
  { id: 'family', label: 'Family', icon: Baby },
  { id: 'revs-rewards', label: 'Revs Rewards', icon: Trophy },
];

function makeIcon(category: VenueCategory) {
  const color = CATEGORY_COLORS[category];
  const letter = CATEGORY_LABELS[category].charAt(0);
  return L.divIcon({
    className: '',
    html: `<div class="venue-marker" style="background:${color}">${letter}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function FitBounds({ venues }: { venues: Venue[] }) {
  const map = useMap();
  useEffect(() => {
    if (venues.length === 0) return;
    const bounds = L.latLngBounds(venues.map((v) => [v.lat, v.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }, [venues, map]);
  return null;
}

export default function MapScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') as VenueCategory | null;
  const [active, setActive] = useState<Set<VenueCategory>>(
    new Set(initialFilter ? [initialFilter] : [])
  );
  const [selected, setSelected] = useState<Venue | null>(null);

  const { addToSchedule, checkInVenue, toast } = useAppStore();
  const { t } = useTranslation();

  const visible = useMemo(() => {
    if (active.size === 0) return VENUES;
    return VENUES.filter((v) => active.has(v.category));
  }, [active]);

  const toggle = (id: VenueCategory) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      // Sync url for shareable filters
      if (next.size === 1) setSearchParams({ filter: [...next][0] });
      else setSearchParams({});
      return next;
    });
  };

  const venueEvent = (venueId: string) => EVENTS.find((e) => e.venueId === venueId);

  const handleAddToSchedule = (v: Venue) => {
    const ev = venueEvent(v.id);
    if (!ev) {
      toast({ title: 'No upcoming event yet', description: 'Check the Schedule tab for full lineup.', variant: 'info' });
      return;
    }
    addToSchedule(ev.id);
  };

  const handleShare = async (v: Venue) => {
    const url = window.location.origin + `/map?filter=${v.category}`;
    const text = `${v.name} — on the Boston Soccer Passport.`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: v.name, text, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast({ title: 'Link copied', description: 'Share it anywhere you like.', variant: 'info' });
    } catch {
      toast({ title: 'Share unavailable', variant: 'warn' });
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen flex flex-col" data-testid="map-screen">
      {/* Header */}
      <div className="px-4 lg:px-10 pt-4 lg:pt-8">
        <h1 className="text-xl lg:text-2xl font-display font-bold tracking-tight">{t('nav.map')}</h1>

        <div className="mt-3 -mx-4 lg:mx-0 overflow-x-auto no-scrollbar">
          <div className="px-4 lg:px-0 flex gap-2 pb-1">
              <button
                onClick={() => {
                  setActive(new Set());
                  setSearchParams({});
                }}
                data-testid="filter-chip-all"
                className={cn(
                  'shrink-0 rounded-full ring-1 px-3 py-1.5 text-xs font-medium transition-colors',
                  active.size === 0
                    ? 'bg-white text-navy-900 ring-white'
                    : 'bg-white/[0.04] ring-white/10 text-ink-100 hover:bg-white/[0.08]'
                )}
              >
                All ({VENUES.length})
              </button>
              {CHIPS.map(({ id, label, icon: Icon }) => {
                const isOn = active.has(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggle(id)}
                    data-testid={`filter-chip-${id}`}
                    className={cn(
                      'shrink-0 inline-flex items-center gap-1.5 rounded-full ring-1 px-3 py-1.5 text-xs font-medium transition-colors',
                      isOn
                        ? 'bg-revs-500 ring-revs-400 text-white'
                        : 'bg-white/[0.04] ring-white/10 text-ink-100 hover:bg-white/[0.08]'
                    )}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Map body */}
      <div className="flex-1 px-4 lg:px-10 pt-3 pb-6 lg:pb-8">
        <div className="relative h-[calc(100vh-12rem)] lg:h-[calc(100vh-12rem)] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-card">
            <MapContainer
              center={[42.3601, -71.0589]}
              zoom={12}
              scrollWheelZoom
              style={{ height: '100%', width: '100%' }}
              attributionControl
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors · &copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
              />
              <FitBounds venues={visible} />
              {visible.map((v) => (
                <Marker
                  key={v.id}
                  position={[v.lat, v.lng]}
                  icon={makeIcon(v.category)}
                  eventHandlers={{ click: () => setSelected(v) }}
                />
              ))}
            </MapContainer>

            {/* Legend (desktop) */}
            <div className="hidden lg:flex absolute right-4 top-4 z-[400] flex-col gap-1 rounded-2xl bg-navy-900/85 ring-1 ring-white/10 backdrop-blur-xl px-3 py-3 text-xs">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400 mb-1.5">Categories</div>
              {CHIPS.map(({ id, label }) => (
                <div key={id} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full ring-1 ring-white/30"
                    style={{ backgroundColor: CATEGORY_COLORS[id] }}
                  />
                  <span className={cn('text-ink-100', active.size > 0 && !active.has(id) && 'opacity-40')}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
      </div>

      {/* Venue bottom sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              key="sheet"
              data-testid="venue-sheet"
              className="fixed inset-x-0 bottom-0 z-[60] rounded-t-3xl bg-navy-900 ring-1 ring-white/10 shadow-card max-w-2xl mx-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-3 px-6 pt-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[selected.category] }}
                    />
                    <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400">
                      {CATEGORY_LABELS[selected.category]}
                    </span>
                  </div>
                  <h3 className="mt-1 text-lg font-display font-bold tracking-tight">{selected.name}</h3>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-300">
                    <MapPin size={12} /> {selected.neighborhood} · {selected.distance}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  data-testid="venue-sheet-close"
                  className="grid place-items-center h-9 w-9 rounded-full bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="px-6 mt-3 text-sm text-ink-200 leading-relaxed">{selected.description}</p>

              <div className="px-6 mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/5 px-3 py-2.5">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Hours</div>
                  <div className="mt-0.5 text-ink-100">{selected.hours}</div>
                </div>
                <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/5 px-3 py-2.5">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Tags</div>
                  <div className="mt-0.5 text-ink-100 truncate">{selected.tags.join(' · ')}</div>
                </div>
              </div>

              <div className="px-6 mt-4 grid grid-cols-2 gap-2 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
                <button
                  onClick={() => handleAddToSchedule(selected)}
                  data-testid="venue-sheet-add-schedule"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  <CalendarPlus size={15} /> Add to Schedule
                </button>
                <button
                  onClick={() => checkInVenue(selected.id, selected.name)}
                  data-testid="venue-sheet-checkin"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-revs-500 hover:bg-revs-400 active:bg-revs-600 text-white px-3 py-2.5 text-sm font-semibold transition-colors"
                >
                  <CheckCircle2 size={15} /> Check In (+25)
                </button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="venue-sheet-directions"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10 px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  <MapPin size={15} /> {t('map.card.directions')}
                </a>
                <button
                  onClick={() => handleShare(selected)}
                  data-testid="venue-sheet-share"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10 px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  <Share2 size={15} /> Share
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile FAB to deselect filters */}
      {active.size > 0 && (
        <button
          onClick={() => {
            setActive(new Set());
            setSearchParams({});
          }}
          data-testid="filter-clear-fab"
          className="lg:hidden fixed bottom-24 right-4 z-30 rounded-full bg-white/[0.08] backdrop-blur-xl ring-1 ring-white/10 px-3 py-2 text-xs inline-flex items-center gap-1.5"
        >
          <X size={13} /> Clear filters
        </button>
      )}

      {/* Footer-style hint on quick map */}
      <div className="px-4 lg:px-10 pb-4 text-[11px] text-ink-400">
        Tip: tap a pin to add to your day, check in, get directions, or share.
        <span className="inline-flex items-center gap-1 ml-2 text-ink-300">
          <ChevronRight size={11} /> Showing {visible.length} of {VENUES.length}
        </span>
      </div>
    </div>
  );
}
