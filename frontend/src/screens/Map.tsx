import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';
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
  Search,
  LocateFixed,
  Loader2,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { VENUES, CATEGORY_LABELS, CATEGORY_COLORS } from '@/data/venues';
import { EVENTS } from '@/data/content';
import { MBTA_LINES, MBTA_STATIONS, GILLETTE_ROUTES } from '@/data/mbta';
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

function haversine(p: { lat: number; lng: number }, v: { lat: number; lng: number }) {
  const R = 6371; // km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(v.lat - p.lat);
  const dLng = toRad(v.lng - p.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p.lat)) * Math.cos(toRad(v.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function FitBounds({
  venues,
  userPos,
}: {
  venues: Venue[];
  userPos?: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (userPos) {
      // Zoom into the 6 nearest venues + the user position so you see your local area.
      const nearest = venues.slice(0, 6);
      const pts: [number, number][] = [
        [userPos.lat, userPos.lng],
        ...nearest.map((v) => [v.lat, v.lng] as [number, number]),
      ];
      map.fitBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: 14 });
      return;
    }
    if (venues.length === 0) return;
    const bounds = L.latLngBounds(venues.map((v) => [v.lat, v.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }, [venues, userPos, map]);
  return null;
}

export default function MapScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') as VenueCategory | null;
  const [active, setActive] = useState<Set<VenueCategory>>(
    new Set(initialFilter ? [initialFilter] : [])
  );
  const [selected, setSelected] = useState<Venue | null>(null);
  const [showMbta, setShowMbta] = useState(true);
  const [showGillette, setShowGillette] = useState(true);
  const [query, setQuery] = useState('');
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const { state, addToSchedule, checkInVenue, openPhotoPrompt, toast } = useAppStore();
  const { t } = useTranslation();
  const selectedPhotos = useMemo(
    () => (selected ? state.photos.filter((p) => p.venueId === selected.id) : []),
    [selected, state.photos]
  );
  const selectedCheckedIn = selected ? Boolean(state.checkIns[selected.id]) : false;

  const visible = useMemo(() => {
    let list = VENUES;
    if (active.size > 0) list = list.filter((v) => active.has(v.category));
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.neighborhood.toLowerCase().includes(q) ||
          v.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (userPos) {
      list = [...list].sort((a, b) => haversine(userPos, a) - haversine(userPos, b));
    }
    return list;
  }, [active, query, userPos]);

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      toast({ title: 'Geolocation not supported', variant: 'warn' });
      return;
    }
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      toast({ title: 'Location needs HTTPS', description: 'Open the site over https://', variant: 'warn' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast({ title: 'Sorted by distance from you', variant: 'info' });
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast({
            title: 'Location permission blocked',
            description: 'Allow location for this site in Safari/Chrome settings, then tap Near me again.',
            variant: 'warn',
          });
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          toast({ title: 'Location unavailable', description: 'Try outdoors or check that Location Services are on.', variant: 'warn' });
        } else if (err.code === err.TIMEOUT) {
          toast({ title: 'Location took too long', description: 'Tap Near me again · first lock can be slow.', variant: 'warn' });
        } else {
          toast({ title: 'Could not get your location', variant: 'warn' });
        }
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
    );
  };

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
    const text = `${v.name} · on the Boston Soccer Passport.`;
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
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-xl lg:text-2xl font-display font-bold tracking-tight">{t('nav.map')}</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMbta((v) => !v)}
              data-testid="map-toggle-mbta"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full ring-1 px-3 py-1.5 text-xs font-medium transition-colors',
                showMbta
                  ? 'bg-white/[0.08] ring-white/20 text-white'
                  : 'bg-white/[0.03] ring-white/10 text-ink-300 hover:bg-white/[0.06]'
              )}
              aria-pressed={showMbta}
            >
              <SubwayIcon /> {t('map.subway')}
            </button>
            <button
              type="button"
              onClick={() => setShowGillette((v) => !v)}
              data-testid="map-toggle-gillette"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full ring-1 px-3 py-1.5 text-xs font-medium transition-colors',
                showGillette
                  ? 'bg-white/[0.08] ring-white/20 text-white'
                  : 'bg-white/[0.03] ring-white/10 text-ink-300 hover:bg-white/[0.06]'
              )}
              aria-pressed={showGillette}
            >
              <RouteIcon /> {t('map.gilletteRoutes')}
            </button>
          </div>
        </div>

        {/* Search + Near me */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-testid="map-search"
              placeholder={t('map.searchPlaceholder')}
              className="w-full ps-9 pe-9 py-2.5 rounded-full bg-white/[0.05] ring-1 ring-white/10 focus:ring-revs-400 outline-none text-sm placeholder:text-ink-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-300 hover:text-white hover:bg-white/10"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={userPos ? () => setUserPos(null) : requestLocation}
            data-testid="map-near-me"
            disabled={locating}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full ring-1 px-3 py-2.5 text-xs font-medium transition-colors shrink-0',
              userPos
                ? 'bg-revs-500 ring-revs-400 text-white'
                : 'bg-white/[0.05] ring-white/10 text-ink-100 hover:bg-white/[0.1]',
              locating && 'opacity-70 cursor-wait'
            )}
            aria-pressed={Boolean(userPos)}
          >
            {locating ? <Loader2 size={13} className="animate-spin" /> : <LocateFixed size={13} />}
            <span className="hidden sm:inline">{t('map.nearMe')}</span>
          </button>
        </div>

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
                {t('map.filters.all')} ({VENUES.length})
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
              {showMbta &&
                MBTA_LINES.flatMap((line) =>
                  line.paths.map((path, i) => (
                    <Polyline
                      key={`${line.id}-${i}`}
                      positions={path}
                      pathOptions={{
                        color: line.color,
                        weight: 4,
                        opacity: 0.75,
                        lineCap: 'round',
                        lineJoin: 'round',
                      }}
                      eventHandlers={{
                        click: () => toast({ title: line.name, variant: 'info' }),
                      }}
                    >
                      <Tooltip sticky direction="top" opacity={0.95}>
                        {line.name}
                      </Tooltip>
                    </Polyline>
                  ))
                )}
              {showMbta &&
                MBTA_STATIONS.map((s) => {
                  const primaryLineColor =
                    MBTA_LINES.find((l) => l.id === s.lines[0])?.color || '#FFFFFF';
                  const lineNames = s.lines
                    .map((id) => MBTA_LINES.find((l) => l.id === id)?.name.replace(' Line', '') || id)
                    .join(' + ');
                  return (
                    <CircleMarker
                      key={`station-${s.name}-${s.lat}-${s.lng}`}
                      center={[s.lat, s.lng]}
                      radius={s.lines.length > 1 ? 5 : 4}
                      pathOptions={{
                        color: '#FFFFFF',
                        weight: 1.5,
                        fillColor: primaryLineColor,
                        fillOpacity: 1,
                      }}
                      eventHandlers={{
                        click: () =>
                          toast({
                            title: `${s.name} station`,
                            description: `${lineNames} Line${s.lines.length > 1 ? 's' : ''}`,
                            variant: 'info',
                          }),
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -2]} opacity={0.95}>
                        {s.name}
                        {s.lines.length > 1 && (
                          <span className="text-[10px] opacity-80"> · {lineNames}</span>
                        )}
                      </Tooltip>
                    </CircleMarker>
                  );
                })}
              {showGillette &&
                GILLETTE_ROUTES.map((route) => (
                  <Polyline
                    key={`gillette-${route.id}`}
                    positions={route.path}
                    pathOptions={{
                      color: route.color,
                      weight: 4,
                      opacity: 0.9,
                      dashArray: route.mode === 'bus' ? '8 6' : '0',
                      lineCap: 'round',
                    }}
                    eventHandlers={{
                      click: () =>
                        toast({
                          title: route.name,
                          description: route.description,
                          variant: 'info',
                        }),
                    }}
                  >
                    <Tooltip sticky direction="top" opacity={0.95}>
                      <div className="font-semibold">{route.name}</div>
                      <div className="text-[10px] opacity-80 max-w-[220px] whitespace-normal">
                        {route.description}
                      </div>
                    </Tooltip>
                  </Polyline>
                ))}
              <FitBounds venues={visible} userPos={userPos} />
              {userPos && (
                <>
                  <CircleMarker
                    center={[userPos.lat, userPos.lng]}
                    radius={9}
                    pathOptions={{
                      color: '#FFFFFF',
                      weight: 3,
                      fillColor: '#60A5FA',
                      fillOpacity: 1,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -2]}>{t('map.youAreHere')}</Tooltip>
                  </CircleMarker>
                  <CircleMarker
                    center={[userPos.lat, userPos.lng]}
                    radius={20}
                    pathOptions={{
                      color: '#60A5FA',
                      weight: 1,
                      fillColor: '#60A5FA',
                      fillOpacity: 0.18,
                      interactive: false,
                    }}
                  />
                </>
              )}
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
              {showMbta && (
                <>
                  <div className="mt-2 pt-2 border-t border-white/10 text-[10px] uppercase tracking-[0.18em] text-ink-400 mb-1.5">
                    MBTA
                  </div>
                  {MBTA_LINES.map((line) => (
                    <div key={line.id} className="flex items-center gap-2">
                      <span
                        className="h-1 w-4 rounded-full"
                        style={{ backgroundColor: line.color }}
                      />
                      <span className="text-ink-100">{line.name}</span>
                    </div>
                  ))}
                </>
              )}
              {showGillette && (
                <>
                  <div className="mt-2 pt-2 border-t border-white/10 text-[10px] uppercase tracking-[0.18em] text-ink-400 mb-1.5">
                    {t('map.gilletteRoutes')}
                  </div>
                  {GILLETTE_ROUTES.map((route) => (
                    <div key={route.id} className="flex items-center gap-2">
                      <span
                        className="h-1 w-4 rounded-full"
                        style={{
                          background:
                            route.mode === 'bus'
                              ? `repeating-linear-gradient(90deg, ${route.color} 0 4px, transparent 4px 7px)`
                              : route.color,
                        }}
                      />
                      <span className="text-ink-100">{route.name}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
      </div>

      {/* Venue bottom sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              key="sheet"
              data-testid="venue-sheet"
              className="fixed inset-x-0 bottom-0 z-[1010] rounded-t-3xl bg-navy-900 ring-1 ring-white/10 shadow-card max-w-2xl mx-auto"
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

              {selectedPhotos.length > 0 && (
                <div className="px-6 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">
                      {t('photos.venueFeedTitle', { count: selectedPhotos.length })}
                    </div>
                  </div>
                  <div className="mt-2 -mx-1 px-1 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {selectedPhotos.slice(0, 8).map((p) => (
                      <div
                        key={p.id}
                        className="shrink-0 h-20 w-20 rounded-xl overflow-hidden ring-1 ring-white/10 bg-black/30"
                        title={p.caption || p.venueName}
                      >
                        <img
                          src={p.dataUrl}
                          alt={p.caption || p.venueName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-6 mt-4 grid grid-cols-2 gap-2 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
                <button
                  onClick={() => handleAddToSchedule(selected)}
                  data-testid="venue-sheet-add-schedule"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  <CalendarPlus size={15} /> Add to Schedule
                </button>
                {selectedCheckedIn ? (
                  <button
                    onClick={() => openPhotoPrompt(selected.id, selected.name)}
                    data-testid="venue-sheet-add-photo"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-revs-500 hover:bg-revs-400 active:bg-revs-600 text-white px-3 py-2.5 text-sm font-semibold transition-colors"
                  >
                    <Camera size={15} /> {t('photos.addPhotoCta')}
                  </button>
                ) : (
                  <button
                    onClick={() => checkInVenue(selected.id, selected.name)}
                    data-testid="venue-sheet-checkin"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-revs-500 hover:bg-revs-400 active:bg-revs-600 text-white px-3 py-2.5 text-sm font-semibold transition-colors"
                  >
                    <CheckCircle2 size={15} /> {t('map.card.checkIn')} (+25)
                  </button>
                )}
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
          <ChevronRight size={11} className="rtl:rotate-180" /> Showing {visible.length} of {VENUES.length}
        </span>
      </div>
    </div>
  );
}

function SubwayIcon() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="16" rx="3" />
      <line x1="8" y1="19" x2="6" y2="22" />
      <line x1="16" y1="19" x2="18" y2="22" />
      <circle cx="9" cy="15" r="0.5" fill="currentColor" />
      <circle cx="15" cy="15" r="0.5" fill="currentColor" />
      <line x1="5" y1="11" x2="19" y2="11" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h6a4 4 0 0 0 0-8H10a4 4 0 0 1 0-8h6" />
    </svg>
  );
}
