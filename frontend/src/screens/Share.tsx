import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import {
  Download,
  Copy,
  Share2,
  Image as ImageIcon,
  Sparkles,
  Type,
  Palette,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/cn';

type Template = 'stop' | 'global' | 'summer';

const TEMPLATES: { id: Template; label: string; subtitle: string }[] = [
  { id: 'stop', label: 'My Boston Soccer Stop', subtitle: 'Spot · Date · Vibe' },
  { id: 'global', label: 'From Global Soccer to New England Soccer', subtitle: 'Country → Boston' },
  { id: 'summer', label: 'Boston Soccer Summer', subtitle: 'Postcard from the city' },
];

const PALETTES: { id: 'country' | 'boston' | 'revs'; label: string; primary: string; secondary: string }[] = [
  { id: 'country', label: 'Country', primary: '#10B981', secondary: '#FFD700' },
  { id: 'boston', label: 'Boston', primary: '#0A1A3D', secondary: '#FFFFFF' },
  { id: 'revs', label: 'Revs', primary: '#C8102E', secondary: '#0A1A3D' },
];

const STICKERS = [
  { id: 'ball', label: 'Ball' },
  { id: 'scarf', label: 'Scarf' },
  { id: 'skyline', label: 'Skyline' },
  { id: 'matchday', label: 'Matchday' },
];

const CAPTIONS: Record<Template, string> = {
  stop: 'Another stop on my Boston soccer summer. #BostonSoccerPassport',
  global: 'From the world stage to the New England pitch. #BostonSoccerPassport',
  summer: 'Boston, the soccer city. Summer 2026. #BostonSoccerPassport',
};

export default function Share() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState<Template>('summer');
  const [palette, setPalette] = useState<typeof PALETTES[number]>(PALETTES[2]);
  const [stickers, setStickers] = useState<Record<string, boolean>>({ ball: true, skyline: true });
  const [headline, setHeadline] = useState('Boston Soccer Summer');
  const [subhead, setSubhead] = useState('City Hall Plaza · Jun 13');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const { addPoints, toast } = useAppStore();
  const [busy, setBusy] = useState<'download' | 'share' | null>(null);

  const handlePhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPhotoData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const generatePng = async () => {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#0A1A3D',
    });
    return dataUrl;
  };

  const handleDownload = async () => {
    setBusy('download');
    try {
      const url = await generatePng();
      if (!url) return;
      const a = document.createElement('a');
      a.href = url;
      a.download = `boston-soccer-passport-${Date.now()}.png`;
      a.click();
      addPoints('share-photo', 20, 'Downloaded a photo card');
      toast({ title: 'Photo card downloaded', points: 20 });
    } catch {
      toast({ title: 'Could not generate image', variant: 'warn' });
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async (target?: 'instagram' | 'x') => {
    setBusy('share');
    try {
      const url = await generatePng();
      if (!url) return;
      if (target === 'instagram') {
        await navigator.clipboard.writeText(CAPTIONS[template]);
        toast({ title: 'Caption copied for Instagram', description: 'Paste it on your IG post.', variant: 'info' });
      } else if (target === 'x') {
        const text = encodeURIComponent(CAPTIONS[template]);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
      } else if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          const blob = await (await fetch(url)).blob();
          const file = new File([blob], 'soccer-passport.png', { type: 'image/png' });
          await navigator.share({
            title: 'Boston Soccer Passport',
            text: CAPTIONS[template],
            files: [file],
          });
        } catch {
          await navigator.clipboard.writeText(CAPTIONS[template]);
          toast({ title: 'Caption copied', variant: 'info' });
        }
      } else {
        await navigator.clipboard.writeText(CAPTIONS[template]);
        toast({ title: 'Caption copied', variant: 'info' });
      }
      addPoints('share-photo', 20, `Shared photo card${target ? ` to ${target}` : ''}`);
    } catch {
      toast({ title: 'Share failed', variant: 'warn' });
    } finally {
      setBusy(null);
    }
  };

  const handleCopyCaption = async () => {
    await navigator.clipboard.writeText(CAPTIONS[template]);
    toast({ title: 'Caption copied', variant: 'info' });
  };

  return (
    <div className="space-y-6 pb-2" data-testid="share-screen">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Photo Card Studio</div>
        <h1 className="mt-1 text-2xl lg:text-3xl font-display font-bold tracking-tight">Share your day</h1>
        <p className="mt-1 text-sm text-ink-300">
          Build a 1080×1080 photo card. No FIFA marks, no trophies. Boston soccer, your way.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_22rem] gap-5">
        {/* Card preview */}
        <div className="rounded-3xl bg-navy-900/55 ring-1 ring-white/5 shadow-card p-4 lg:p-6">
          <div className="aspect-square w-full max-w-[480px] mx-auto rounded-2xl overflow-hidden">
            <div
              ref={cardRef}
              data-testid="share-card-preview"
              className="relative w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,
              }}
            >
              {/* Top accent ribbon */}
              <div
                className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ background: 'rgba(0,0,0,0.45)', color: '#ffffff' }}
              >
                Boston Soccer Passport
              </div>

              {/* Photo bg */}
              {photoData && (
                <img
                  src={photoData}
                  alt="user upload"
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
              )}

              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(180deg, rgba(10,26,61,0.0) 35%, rgba(10,26,61,0.85) 100%)',
                }}
              />

              {/* Stickers */}
              <div className="absolute top-16 right-4 flex flex-col gap-2">
                {stickers.ball && <BallSticker />}
                {stickers.scarf && <ScarfSticker color={palette.primary} />}
                {stickers.skyline && <SkylineSticker />}
                {stickers.matchday && <MatchdaySticker />}
              </div>

              {/* Headline */}
              <div className="absolute left-6 right-6 bottom-6">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  {template === 'global'
                    ? 'From global soccer to'
                    : template === 'stop'
                    ? 'My Boston soccer stop'
                    : 'Boston soccer summer'}
                </div>
                <div className="mt-1 text-3xl font-display font-bold text-white tracking-tight leading-tight">
                  {headline}
                </div>
                <div className="mt-1 text-sm text-white/80">{subhead}</div>
              </div>

              {/* Crest mark */}
              <div className="absolute bottom-6 right-6 grid place-items-center h-10 w-10 rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                <svg viewBox="0 0 24 24" width={22} height={22}>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                  <path d="M12 4l1.6 3.4L12 10l-1.6-2.6L12 4z" fill="#C8102E" />
                  <path d="M12 20l-1.6-3.4L12 14l1.6 2.6L12 20z" fill="#C8102E" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={handleDownload}
              disabled={busy !== null}
              data-testid="share-download"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-revs-500 hover:bg-revs-400 text-white px-3 py-2.5 text-sm font-semibold shadow-glow disabled:opacity-60"
            >
              <Download size={15} /> Download
            </button>
            <button
              onClick={handleCopyCaption}
              data-testid="share-copy-caption"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-2.5 text-sm"
            >
              <Copy size={15} /> Copy caption
            </button>
            <button
              onClick={() => handleShare('instagram')}
              disabled={busy !== null}
              data-testid="share-instagram"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-2.5 text-sm disabled:opacity-60"
            >
              <Share2 size={15} /> Instagram
            </button>
            <button
              onClick={() => handleShare('x')}
              disabled={busy !== null}
              data-testid="share-x"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-2.5 text-sm disabled:opacity-60"
            >
              <Share2 size={15} /> Share to X
            </button>
          </div>
        </div>

        {/* Controls */}
        <aside className="space-y-4">
          <Panel title="Template" icon={Sparkles}>
            <div className="grid gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  data-testid={`template-${t.id}`}
                  className={cn(
                    'text-left rounded-xl px-3 py-2.5 ring-1 transition-colors',
                    template === t.id
                      ? 'bg-revs-500/15 ring-revs-500/40'
                      : 'bg-white/[0.04] ring-white/10 hover:bg-white/[0.08]'
                  )}
                >
                  <div className="text-sm font-semibold leading-tight">{t.label}</div>
                  <div className="text-[11px] text-ink-400 mt-0.5">{t.subtitle}</div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Photo" icon={ImageIcon}>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
                data-testid="share-photo-input"
              />
              <span className="block w-full text-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10 px-3 py-2.5 text-sm cursor-pointer">
                {photoData ? 'Replace photo' : 'Upload a photo'}
              </span>
            </label>
            {photoData && (
              <button
                onClick={() => setPhotoData(null)}
                className="mt-2 w-full text-xs text-ink-300 hover:text-white"
              >
                Remove photo
              </button>
            )}
          </Panel>

          <Panel title="Text" icon={Type}>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Headline</span>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                data-testid="share-headline-input"
                className="mt-1 w-full rounded-xl bg-white/[0.04] ring-1 ring-white/10 focus:ring-revs-400 outline-none px-3 py-2 text-sm"
              />
            </label>
            <label className="block mt-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Subhead</span>
              <input
                value={subhead}
                onChange={(e) => setSubhead(e.target.value)}
                data-testid="share-subhead-input"
                className="mt-1 w-full rounded-xl bg-white/[0.04] ring-1 ring-white/10 focus:ring-revs-400 outline-none px-3 py-2 text-sm"
              />
            </label>
          </Panel>

          <Panel title="Palette" icon={Palette}>
            <div className="grid grid-cols-3 gap-2">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPalette(p)}
                  data-testid={`palette-${p.id}`}
                  className={cn(
                    'rounded-xl ring-1 px-3 py-3 text-left transition-colors',
                    palette.id === p.id ? 'ring-revs-500/40 bg-revs-500/10' : 'ring-white/10 bg-white/[0.04]'
                  )}
                >
                  <div
                    className="h-6 w-full rounded-md"
                    style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})` }}
                  />
                  <div className="mt-1.5 text-[11px] font-semibold">{p.label}</div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Stickers" icon={Sparkles}>
            <div className="grid grid-cols-2 gap-2">
              {STICKERS.map((s) => (
                <label
                  key={s.id}
                  className={cn(
                    'flex items-center gap-2 rounded-xl ring-1 px-3 py-2 cursor-pointer text-sm',
                    stickers[s.id] ? 'ring-revs-500/40 bg-revs-500/10' : 'ring-white/10 bg-white/[0.04]'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={!!stickers[s.id]}
                    onChange={(e) => setStickers((prev) => ({ ...prev, [s.id]: e.target.checked }))}
                    data-testid={`sticker-${s.id}`}
                    className="accent-revs-500"
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Sparkles; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 px-4 py-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={13} className="text-ink-300" />
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-300">{title}</div>
      </div>
      {children}
    </div>
  );
}

/* Sticker SVGs — explicitly generic, no FIFA marks, no trophies */
function BallSticker() {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="26" fill="#ffffff" stroke="#0A1A3D" strokeWidth="2.5" />
      <path d="M32 12l8 8-3 11h-10l-3-11 8-8z" fill="#0A1A3D" />
      <path d="M14 36l8-4 8 9-3 10-13-4-0-11z" fill="#0A1A3D" opacity="0.85" />
      <path d="M50 36l-8-4-8 9 3 10 13-4 0-11z" fill="#0A1A3D" opacity="0.85" />
    </svg>
  );
}
function ScarfSticker({ color }: { color: string }) {
  return (
    <svg width="76" height="32" viewBox="0 0 76 32" aria-hidden>
      <rect x="2" y="6" width="72" height="20" rx="6" fill={color} stroke="#ffffff" strokeWidth="2" />
      <rect x="2" y="10" width="72" height="3" fill="#ffffff" opacity="0.85" />
      <rect x="2" y="19" width="72" height="3" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}
function SkylineSticker() {
  return (
    <svg width="84" height="34" viewBox="0 0 84 34" aria-hidden>
      <g fill="#ffffff" opacity="0.92">
        <rect x="2" y="14" width="8" height="18" />
        <rect x="12" y="8" width="10" height="24" />
        <rect x="24" y="20" width="8" height="12" />
        <rect x="34" y="4" width="12" height="28" />
        <rect x="48" y="14" width="10" height="18" />
        <rect x="60" y="10" width="8" height="22" />
        <rect x="70" y="16" width="10" height="16" />
      </g>
    </svg>
  );
}
function MatchdaySticker() {
  return (
    <div
      style={{
        background: '#ffffff',
        color: '#0A1A3D',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}
    >
      Matchday
    </div>
  );
}
