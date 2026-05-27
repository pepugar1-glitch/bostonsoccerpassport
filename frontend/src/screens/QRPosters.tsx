import { useState, useEffect, useRef, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import {
  Lock,
  Download,
  FileImage,
  FileText,
  Printer,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { VENUES, CATEGORY_LABELS, CATEGORY_COLORS } from '@/data/venues';
import { buildVenueLandingUrl } from '@/lib/utm';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import { track } from '@/lib/analytics';
import type { Venue } from '@/types';

const PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'revs2026';
const UNLOCK_TTL = 24 * 60 * 60 * 1000;

export default function QRPosters() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { toast, state } = useAppStore();

  useEffect(() => {
    const u = storage.getAdminUnlock();
    if (u && Date.now() - u.at < UNLOCK_TTL) setUnlocked(true);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === PASSCODE) {
      storage.setAdminUnlock({ at: Date.now() });
      setUnlocked(true);
      setError('');
      track('admin_unlock', { surface: 'qrcodes' });
    } else setError('Incorrect passcode');
  };

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto mt-12 lg:mt-20" data-testid="qrcodes-gate">
        <div className="rounded-3xl bg-navy-900/60 ring-1 ring-white/5 shadow-card p-7 text-center">
          <div className="mx-auto h-14 w-14 grid place-items-center rounded-2xl bg-revs-500/15 ring-1 ring-revs-500/30">
            <Lock size={22} className="text-revs-300" />
          </div>
          <h1 className="mt-4 text-xl font-display font-bold tracking-tight">QR Poster Studio</h1>
          <p className="mt-1 text-sm text-ink-300">
            Generate printable A4 QR posters for every venue. Same passcode as the admin dashboard.
          </p>
          <form onSubmit={onSubmit} className="mt-5 grid gap-3">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              data-testid="qrcodes-passcode-input"
              placeholder="Passcode"
              className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 focus:ring-revs-400 outline-none px-3 py-2.5 text-sm text-center tracking-widest"
            />
            <button
              type="submit"
              data-testid="qrcodes-passcode-submit"
              className="rounded-xl bg-revs-500 hover:bg-revs-400 text-white px-3 py-2.5 text-sm font-semibold shadow-glow"
            >
              Unlock
            </button>
            {error && <div className="text-xs text-revs-300">{error}</div>}
          </form>
        </div>
      </div>
    );
  }

  const archetype = state.archetypeResult?.archetype;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://boston-rev-passport.preview.emergentagent.com';

  return (
    <div className="space-y-6 pb-2" data-testid="qrcodes-screen">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-ink-300 hover:text-white">
            <ChevronLeft size={12} /> Admin
          </Link>
          <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-ink-400 inline-flex items-center gap-2">
            <ShieldCheck size={12} className="text-revs-300" /> Admin · Print studio
          </div>
          <h1 className="mt-1 text-2xl lg:text-3xl font-display font-bold tracking-tight">QR Poster Studio</h1>
          <p className="mt-1 text-sm text-ink-300 max-w-2xl">
            One printable A4 poster per venue. The QR encodes the app URL with a per-venue UTM so every
            scan is attributable in the funnel. Download PNG or PDF for print, or batch-download all.
          </p>
        </div>
        <BatchActions origin={origin} archetype={archetype} />
      </header>

      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/5 px-4 py-3 text-[11px] text-ink-300">
        UTM template:&nbsp;
        <code className="text-ink-100">utm_source=passport · utm_medium=qr · utm_campaign=wc2026 · utm_content={'{venue_id}'} · utm_term={'{archetype}'}</code>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {VENUES.map((v) => (
          <PosterCard key={v.id} venue={v} origin={origin} archetype={archetype} onDownload={() => toast({ title: `Downloaded poster · ${v.name}`, variant: 'info' })} />
        ))}
      </div>
    </div>
  );
}

function PosterCard({
  venue,
  origin,
  archetype,
  onDownload,
}: {
  venue: Venue;
  origin: string;
  archetype?: string;
  onDownload: () => void;
}) {
  const posterRef = useRef<HTMLDivElement>(null);
  const url = useMemo(
    () => buildVenueLandingUrl(origin, { venueId: venue.id, archetype }),
    [origin, venue.id, archetype]
  );

  const exportPng = async () => {
    if (!posterRef.current) return;
    track('qr_poster_download', { venueId: venue.id, format: 'png' });
    const data = await toPng(posterRef.current, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: '#ffffff',
    });
    const a = document.createElement('a');
    a.href = data;
    a.download = `bsp-poster-${venue.id}.png`;
    a.click();
    onDownload();
  };

  const exportPdf = async () => {
    if (!posterRef.current) return;
    track('qr_poster_download', { venueId: venue.id, format: 'pdf' });
    const data = await toPng(posterRef.current, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: '#ffffff',
    });
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    pdf.addImage(data, 'PNG', 0, 0, 210, 297);
    pdf.save(`bsp-poster-${venue.id}.pdf`);
    onDownload();
  };

  return (
    <div
      data-testid={`poster-card-${venue.id}`}
      className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 shadow-card p-4"
    >
      {/* Preview wrap — A4 aspect 210:297 ≈ 0.707 */}
      <div className="rounded-xl overflow-hidden ring-1 ring-white/10 bg-white">
        <div
          ref={posterRef}
          data-testid={`poster-preview-${venue.id}`}
          className="aspect-[210/297] w-full flex flex-col"
          style={{ background: '#FFFFFF' }}
        >
          {/* Banner */}
          <div
            className="px-4 py-3 flex items-center justify-between shrink-0"
            style={{ background: '#0A1A3D', color: '#FFFFFF' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="grid place-items-center h-7 w-7 rounded-md"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                  <path d="M12 4l1.6 3.4L12 10l-1.6-2.6L12 4z" fill="#C8102E" />
                  <path d="M12 20l-1.6-3.4L12 14l1.6 2.6L12 20z" fill="#C8102E" />
                  <path d="M4 12l3.4-1.6L10 12l-2.6 1.6L4 12z" fill="#ffffff" />
                  <path d="M20 12l-3.4 1.6L14 12l2.6-1.6L20 12z" fill="#ffffff" />
                </svg>
              </div>
              <div className="leading-tight">
                <div
                  className="text-[7px] uppercase tracking-[0.18em]"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Boston
                </div>
                <div className="text-[11px] font-bold">Soccer Passport</div>
              </div>
            </div>
            <div
              className="px-2 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-[0.14em] whitespace-nowrap"
              style={{ background: CATEGORY_COLORS[venue.category], color: '#FFFFFF' }}
            >
              {CATEGORY_LABELS[venue.category]}
            </div>
          </div>

          {/* Body */}
          <div
            className="flex-1 px-4 py-4 flex flex-col items-center justify-center text-center"
            style={{ color: '#0A1A3D' }}
          >
            <div className="text-[8px] uppercase tracking-[0.22em]" style={{ color: '#5A6378' }}>
              Scan to start
            </div>
            <h2
              className="mt-1.5 text-[13px] font-bold leading-tight px-1"
              style={{ color: '#0A1A3D' }}
            >
              {venue.name}
            </h2>
            <p className="mt-0.5 text-[9px]" style={{ color: '#5A6378' }}>
              {venue.neighborhood}
            </p>

            {/* QR */}
            <div
              className="mt-3 rounded-xl p-2"
              style={{ background: '#FFFFFF', boxShadow: '0 0 0 1px #DCDFE7' }}
            >
              <QRCodeSVG
                value={url}
                size={140}
                level="M"
                includeMargin={false}
                fgColor="#0A1A3D"
                bgColor="#FFFFFF"
              />
            </div>

            <p
              className="mt-3 text-[9px] font-semibold leading-snug px-2"
              style={{ color: '#0A1A3D' }}
            >
              Discover where to watch, play & celebrate soccer in New England.
            </p>
            <div
              className="mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.18em]"
              style={{ background: '#C8102E', color: '#FFFFFF' }}
            >
              +25 points on check-in
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-3 py-2 text-[6.5px] shrink-0"
            style={{ background: '#F7F8FA', color: '#5A6378' }}
          >
            <div className="break-all leading-snug">{url}</div>
            <div className="mt-0.5 leading-snug">
              Boston Soccer Passport is a local soccer guide concept. Not affiliated with FIFA, MLS, or the
              New England Revolution.
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={exportPng}
          data-testid={`poster-download-png-${venue.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-revs-500 hover:bg-revs-400 text-white px-3 py-2 text-xs font-semibold shadow-glow"
        >
          <FileImage size={14} /> PNG
        </button>
        <button
          onClick={exportPdf}
          data-testid={`poster-download-pdf-${venue.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-2 text-xs font-semibold"
        >
          <FileText size={14} /> PDF
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-2 text-xs"
        >
          Preview link
        </a>
      </div>

      <div className="mt-3 text-[10px] text-ink-400 truncate">
        <span className="text-ink-300">QR encodes:</span> {url}
      </div>
    </div>
  );
}

function BatchActions({ origin, archetype }: { origin: string; archetype?: string }) {
  const [busy, setBusy] = useState(false);
  const { toast } = useAppStore();

  const downloadAllPdf = async () => {
    setBusy(true);
    track('qr_poster_batch_download', { format: 'pdf', count: VENUES.length });
    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      // Render each poster off-screen one at a time
      for (let i = 0; i < VENUES.length; i++) {
        const v = VENUES[i];
        const node = await renderOffscreenPoster(v, origin, archetype);
        const data = await toPng(node, {
          cacheBust: true,
          pixelRatio: 2.5,
          backgroundColor: '#ffffff',
        });
        if (i > 0) pdf.addPage('a4', 'portrait');
        pdf.addImage(data, 'PNG', 0, 0, 210, 297);
        node.remove();
      }
      pdf.save(`bsp-posters-all-${VENUES.length}.pdf`);
      toast({ title: `Batch PDF · ${VENUES.length} posters`, variant: 'info' });
    } catch (err) {
      toast({ title: 'Batch export failed', variant: 'warn' });
    } finally {
      setBusy(false);
    }
  };

  const handlePrint = () => {
    track('qr_poster_print');
    window.print();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={downloadAllPdf}
        disabled={busy}
        data-testid="posters-batch-pdf"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-revs-500 hover:bg-revs-400 text-white px-3 py-2 text-xs font-semibold shadow-glow',
          busy && 'opacity-60 cursor-not-allowed'
        )}
      >
        <Download size={13} /> {busy ? 'Building…' : 'All posters · PDF'}
      </button>
      <button
        onClick={handlePrint}
        data-testid="posters-print"
        className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-2 text-xs"
      >
        <Printer size={13} /> Print
      </button>
    </div>
  );
}

// Render a poster DOM off-screen so we can rasterize it without remounting the visible card.
async function renderOffscreenPoster(venue: Venue, origin: string, archetype?: string): Promise<HTMLElement> {
  const wrap = document.createElement('div');
  wrap.style.position = 'fixed';
  wrap.style.left = '-9999px';
  wrap.style.top = '0';
  wrap.style.width = '794px'; // ~A4 width in CSS px at 96 DPI
  wrap.style.height = '1123px';
  wrap.style.background = '#ffffff';
  wrap.style.color = '#0A1A3D';
  wrap.style.padding = '0';
  wrap.style.boxSizing = 'border-box';
  document.body.appendChild(wrap);

  const { default: ReactDOM } = await import('react-dom/client');
  const root = ReactDOM.createRoot(wrap);
  await new Promise<void>((resolve) => {
    root.render(<PosterPrint venue={venue} origin={origin} archetype={archetype} />);
    setTimeout(resolve, 250); // allow QR to paint
  });
  return wrap;
}

function PosterPrint({ venue, origin, archetype }: { venue: Venue; origin: string; archetype?: string }) {
  const url = buildVenueLandingUrl(origin, { venueId: venue.id, archetype });
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#ffffff', color: '#0A1A3D' }}>
      <div style={{ position: 'absolute', inset: 0, top: 0, left: 0, right: 0, padding: '24px 32px', background: '#0A1A3D', color: '#ffffff', height: 96, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <svg viewBox="0 0 24 24" width={44} height={44} aria-hidden>
            <circle cx="12" cy="12" r="9" fill="none" stroke="#ffffff" strokeWidth="1.5" />
            <path d="M12 4l1.6 3.4L12 10l-1.6-2.6L12 4z" fill="#C8102E" />
            <path d="M12 20l-1.6-3.4L12 14l1.6 2.6L12 20z" fill="#C8102E" />
            <path d="M4 12l3.4-1.6L10 12l-2.6 1.6L4 12z" fill="#ffffff" />
            <path d="M20 12l-3.4 1.6L14 12l2.6-1.6L20 12z" fill="#ffffff" />
          </svg>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.7, textTransform: 'uppercase' }}>Boston</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Soccer Passport</div>
          </div>
        </div>
        <div style={{ padding: '6px 14px', borderRadius: 999, background: CATEGORY_COLORS[venue.category], color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          {CATEGORY_LABELS[venue.category]}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, bottom: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, letterSpacing: 3, color: '#5A6378', textTransform: 'uppercase' }}>Scan to start</div>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 8, lineHeight: 1.1 }}>{venue.name}</h2>
        <div style={{ fontSize: 14, color: '#5A6378', marginTop: 4 }}>{venue.neighborhood}</div>
        <div style={{ marginTop: 28, padding: 18, background: '#fff', boxShadow: '0 0 0 1px #DCDFE7' }}>
          <QRCodeSVG value={url} size={320} level="M" includeMargin={false} fgColor="#0A1A3D" bgColor="#FFFFFF" />
        </div>
        <p style={{ marginTop: 24, fontSize: 14, fontWeight: 600, maxWidth: 520, lineHeight: 1.4 }}>
          Discover where to watch, play & celebrate soccer in New England.
        </p>
        <div style={{ marginTop: 14, display: 'inline-flex', padding: '6px 14px', borderRadius: 999, background: '#C8102E', color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          +25 points on check-in
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 28px', background: '#F7F8FA', color: '#5A6378', fontSize: 9 }}>
        <div style={{ wordBreak: 'break-all' }}>{url}</div>
        <div style={{ marginTop: 4 }}>
          Boston Soccer Passport is a local soccer guide concept. Official event details should be confirmed
          through official event organizers. Not affiliated with FIFA, MLS, or the New England Revolution.
        </div>
      </div>
    </div>
  );
}
