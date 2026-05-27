import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGS, type LangCode } from '@/i18n';
import { cn } from '@/lib/cn';

export default function LanguageSelector({ variant = 'sidebar' }: { variant?: 'sidebar' | 'topbar' }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const current = SUPPORTED_LANGS.find((l) => l.code === i18n.language) || SUPPORTED_LANGS[0];

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const select = (code: LangCode) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  if (variant === 'topbar') {
    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          data-testid="lang-toggle-topbar"
          aria-label={t('nav.language')}
          className="rounded-full bg-white/[0.06] ring-1 ring-white/5 p-2 transition-colors hover:bg-white/[0.1]"
        >
          <span className="text-sm leading-none">{current.flag}</span>
        </button>
        {open && (
          <Menu current={current.code} onSelect={select} className="right-0 mt-2" />
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        data-testid="lang-toggle-sidebar"
        className="w-full inline-flex items-center justify-between gap-2 rounded-2xl bg-white/[0.04] ring-1 ring-white/5 hover:bg-white/[0.08] px-3 py-2.5 text-sm transition-colors"
      >
        <span className="inline-flex items-center gap-2.5 min-w-0">
          <Globe size={14} className="text-ink-300 shrink-0" />
          <span className="text-base leading-none">{current.flag}</span>
          <span className="truncate font-medium">{current.native}</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400">{current.code}</span>
      </button>
      {open && (
        <Menu current={current.code} onSelect={select} className="left-0 right-0 mt-2" />
      )}
    </div>
  );
}

function Menu({
  current,
  onSelect,
  className,
}: {
  current: string;
  onSelect: (code: LangCode) => void;
  className?: string;
}) {
  return (
    <div
      role="menu"
      className={cn(
        'absolute z-50 min-w-[200px] rounded-2xl bg-navy-900/95 ring-1 ring-white/10 shadow-card backdrop-blur-xl p-1',
        className
      )}
    >
      {SUPPORTED_LANGS.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onSelect(lang.code)}
          data-testid={`lang-option-${lang.code}`}
          role="menuitemradio"
          aria-checked={current === lang.code}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-colors',
            current === lang.code
              ? 'bg-revs-500/15 ring-1 ring-revs-500/30 text-white'
              : 'text-ink-200 hover:bg-white/[0.06]'
          )}
        >
          <span className="text-base leading-none">{lang.flag}</span>
          <span className="flex-1 text-start font-medium">{lang.native}</span>
          {current === lang.code && <Check size={14} className="text-revs-300" />}
        </button>
      ))}
    </div>
  );
}
