import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Camera, ImagePlus, Loader2, RotateCcw, Check } from 'lucide-react';
import { useAppStore, PHOTO_BONUS_POINTS } from '@/lib/store';
import { compressImage, estimateDataUrlBytes } from '@/lib/photos';

export default function PhotoCaptureModal() {
  const { state, closePhotoPrompt, addPhoto, toast } = useAppStore();
  const prompt = state.photoPrompt;
  const { t } = useTranslation();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!prompt.open) {
      setPreview(null);
      setCaption('');
      setProcessing(false);
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePhotoPrompt();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [prompt.open, closePhotoPrompt]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: t('photos.errorNotImage'), variant: 'warn' });
      return;
    }
    setProcessing(true);
    try {
      const dataUrl = await compressImage(file);
      const bytes = estimateDataUrlBytes(dataUrl);
      if (bytes > 1_200_000) {
        toast({ title: t('photos.errorTooLarge'), variant: 'warn' });
      }
      setPreview(dataUrl);
    } catch {
      toast({ title: t('photos.errorFailed'), variant: 'warn' });
    } finally {
      setProcessing(false);
    }
  };

  const onSave = () => {
    if (!preview) return;
    try {
      addPhoto({
        venueId: prompt.venueId,
        venueName: prompt.venueName,
        dataUrl: preview,
        caption: caption.trim() || undefined,
      });
      closePhotoPrompt();
    } catch {
      toast({ title: t('photos.errorStorageFull'), variant: 'warn' });
    }
  };

  const onSkip = () => {
    closePhotoPrompt();
  };

  return (
    <AnimatePresence>
      {prompt.open && (
        <div
          data-testid="photo-prompt"
          className="fixed inset-0 z-[1016] flex items-center justify-center px-4 py-6"
        >
          <motion.div
            aria-hidden
            onClick={closePhotoPrompt}
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm rounded-[26px] bg-gradient-to-br from-navy-800/95 via-navy-900/95 to-navy-950 ring-1 ring-white/10 shadow-card overflow-hidden"
          >
            <div
              aria-hidden
              className="absolute inset-x-0 -top-20 h-44 opacity-50 pointer-events-none"
              style={{
                background:
                  'radial-gradient(60% 100% at 50% 100%, rgba(200,16,46,0.4), transparent 70%)',
              }}
            />

            <button
              type="button"
              onClick={closePhotoPrompt}
              data-testid="photo-prompt-close"
              aria-label="Close"
              className="absolute top-3 right-3 rounded-full p-1.5 text-ink-300 hover:bg-white/[0.06] hover:text-white transition-colors z-10"
            >
              <X size={16} />
            </button>

            <div className="relative px-7 pt-8 pb-2 text-center">
              <div className="mx-auto grid place-items-center h-12 w-12 rounded-2xl bg-revs-500/15 ring-1 ring-revs-500/30 text-revs-200">
                <Camera size={22} />
              </div>
              <h2 className="mt-4 text-lg font-display font-bold tracking-tight leading-tight">
                {t('photos.promptTitle')}
              </h2>
              <p className="mt-2 text-[13px] text-ink-300 leading-relaxed">
                {t('photos.promptBody', { venue: prompt.venueName })}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-revs-500/15 ring-1 ring-revs-500/30 px-3 py-1 text-[11px] font-semibold text-revs-200">
                +{PHOTO_BONUS_POINTS} {t('photos.bonusBadge')}
              </div>
            </div>

            <div className="relative px-7 pt-5 pb-7 space-y-3">
              {preview ? (
                <>
                  <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black/30">
                    <img src={preview} alt="preview" className="w-full max-h-72 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setCaption('');
                      }}
                      data-testid="photo-prompt-retake"
                      className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 ring-1 ring-white/20 backdrop-blur px-2.5 py-1 text-[11px] font-medium"
                    >
                      <RotateCcw size={11} /> {t('photos.retake')}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value.slice(0, 80))}
                    data-testid="photo-prompt-caption"
                    placeholder={t('photos.captionPlaceholder')}
                    className="w-full rounded-xl bg-white/[0.04] ring-1 ring-white/10 focus:ring-revs-400 outline-none px-3 py-2.5 text-sm placeholder:text-ink-400"
                  />
                  <button
                    type="button"
                    onClick={onSave}
                    data-testid="photo-prompt-save"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-revs-500 hover:bg-revs-400 text-white px-5 py-3 text-[14px] font-semibold transition-colors shadow-glow"
                  >
                    <Check size={16} /> {t('photos.save', { points: PHOTO_BONUS_POINTS })}
                  </button>
                </>
              ) : (
                <>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    data-testid="photo-prompt-camera"
                    disabled={processing}
                    className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-white hover:bg-ink-50 text-navy-950 px-5 py-3 text-[14px] font-semibold transition-colors shadow-card disabled:opacity-60"
                  >
                    {processing ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                    {t('photos.takePhoto')}
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    data-testid="photo-prompt-gallery"
                    disabled={processing}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-5 py-3 text-[13px] font-medium transition-colors disabled:opacity-60"
                  >
                    <ImagePlus size={15} /> {t('photos.pickFromGallery')}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onSkip}
                data-testid="photo-prompt-skip"
                className="w-full text-[12px] text-ink-400 hover:text-white py-2 transition-colors"
              >
                {t('photos.skip')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
