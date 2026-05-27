import { useTranslation } from 'react-i18next';
import RevsLogo from './RevsLogo';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="px-4 lg:px-10 pb-6 lg:pb-8">
      <div className="mx-auto max-w-6xl">
        <div
          data-testid="legal-disclaimer"
          className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-[11px] leading-relaxed text-ink-400 flex items-start gap-3"
        >
          <RevsLogo size={28} className="shrink-0 mt-0.5 opacity-90" />
          <div>{t('footer.disclaimer')}</div>
        </div>
      </div>
    </footer>
  );
}
