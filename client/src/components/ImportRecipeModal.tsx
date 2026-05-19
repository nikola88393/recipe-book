import { useState, useRef, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import {
  Link2, X, ArrowRight, AlertCircle, Loader2,
  Download, CheckCircle2, WifiOff, ShieldAlert,
} from 'lucide-react';
import { importRecipeFromUrl, type ImportedRecipe } from '../lib/recipeImporter';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

type ImportStep = 'idle' | 'running' | 'preview' | 'error';

interface Props {
  /** Firebase auth user — required to attach the ID token to the request */
  currentUser: User | null;
  onImport: (recipe: ImportedRecipe) => void;
  onClose: () => void;
}

export function ImportRecipeModal({ currentUser, onImport, onClose }: Props) {
  const [url, setUrl] = useState('');
  const [step, setStep] = useState<ImportStep>('idle');
  const [preview, setPreview] = useState<ImportedRecipe | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const isOnline = useOnlineStatus();

  const isAuthenticated = !!currentUser;
  const canImport = isOnline && isAuthenticated;

  useEffect(() => {
    if (canImport) inputRef.current?.focus();
  }, [canImport]);

  const handleFetch = useCallback(async () => {
    if (!url.trim() || step === 'running' || !canImport || !currentUser) return;
    setStep('running');
    setErrorMsg('');
    try {
      const recipe = await importRecipeFromUrl(url.trim(), currentUser);
      setPreview(recipe);
      setStep('preview');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setStep('error');
    }
  }, [url, step, canImport, currentUser]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step === 'idle' && canImport) handleFetch();
    if (e.key === 'Escape') onClose();
  };

  const isRunning = step === 'running';

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(20,20,19,0.52)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-ivory border border-border-cream rounded-[24px] shadow-[rgba(0,0,0,0.16)_0px_24px_64px] w-full max-w-lg flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 pt-8 pb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${canImport ? 'bg-celadon/15 text-celadon' : 'bg-warm-sand text-stone-gray'}`}>
              {!isOnline ? <WifiOff size={18} /> : !isAuthenticated ? <ShieldAlert size={18} /> : <Download size={18} />}
            </div>
            <div>
              <p className="font-sans text-[11px] uppercase tracking-[0.5px] text-stone-gray">Import</p>
              <h2 className="font-serif text-[20px] font-medium text-foreground leading-[1.20]">Recipe from Web</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-gray hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* ── Offline banner ── */}
        {!isOnline && (
          <div className="mx-8 mb-5 flex items-start gap-3 px-4 py-4 rounded-[12px] bg-warm-sand border border-border-cream">
            <WifiOff size={16} className="text-stone-gray shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-[14px] font-medium text-foreground mb-0.5">You're offline</p>
              <p className="font-sans text-[13px] text-olive-gray">
                Importing requires an internet connection. Your saved recipes are still available.
              </p>
            </div>
          </div>
        )}

        {/* ── Not signed in banner ── */}
        {isOnline && !isAuthenticated && (
          <div className="mx-8 mb-5 flex items-start gap-3 px-4 py-4 rounded-[12px] bg-warm-sand border border-border-cream">
            <ShieldAlert size={16} className="text-stone-gray shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-[14px] font-medium text-foreground mb-0.5">Sign in required</p>
              <p className="font-sans text-[13px] text-olive-gray">
                Please sign in to import recipes from the web.
              </p>
            </div>
          </div>
        )}

        {/* ── URL input ── */}
        <div className="px-8 pb-6 flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); if (step !== 'idle') setStep('idle'); }}
              onKeyDown={handleKeyDown}
              placeholder="https://www.allrecipes.com/recipe/…"
              disabled={isRunning || !canImport}
              className="flex-1 bg-background border border-border-cream focus:border-focus focus:ring-1 focus:ring-focus rounded-[12px] px-4 py-3 font-sans text-[15px] text-foreground outline-none transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleFetch}
              disabled={!url.trim() || isRunning || !canImport}
              className="btn-primary px-5 py-3 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isRunning ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
              <span className="hidden sm:inline">{isRunning ? 'Extracting…' : 'Import'}</span>
            </button>
          </div>

          {canImport && (
            <div className="flex items-start gap-2">
              <Link2 size={12} className="text-stone-gray shrink-0 mt-0.5" />
              <p className="font-sans text-[12px] text-stone-gray leading-[1.50]">
                Powered by <span className="font-medium text-foreground">Groq + Llama 3.1</span>.
                Works with AllRecipes, BBC Good Food, NYT Cooking, Serious Eats, and more.
              </p>
            </div>
          )}
        </div>

        {/* ── Running ── */}
        {isRunning && (
          <div className="mx-8 mb-6 flex items-center gap-3 px-4 py-3 rounded-[12px] bg-celadon/8 border border-celadon/25">
            <Loader2 size={14} className="animate-spin text-celadon shrink-0" />
            <p className="font-sans text-[13px] text-olive-gray">
              Fetching page and extracting recipe via Groq…
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {step === 'error' && (
          <div className="mx-8 mb-8 flex items-start gap-3 px-4 py-4 rounded-[12px] bg-error/8 border border-error/20">
            <AlertCircle size={17} className="text-error shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-[14px] font-medium text-foreground mb-1">Import failed</p>
              <p className="font-sans text-[13px] text-olive-gray break-words">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* ── Preview ── */}
        {step === 'preview' && preview && (
          <div className="border-t border-border-cream bg-background/60">
            <div className="px-8 py-6 flex flex-col gap-4 max-h-72 overflow-y-auto">
              <div className="flex items-center gap-2 text-celadon mb-1">
                <CheckCircle2 size={16} />
                <span className="font-sans text-[13px] font-medium">Recipe extracted successfully</span>
              </div>
              <div>
                <p className="font-sans text-[11px] uppercase tracking-[0.5px] text-stone-gray mb-1">Title</p>
                <p className="font-serif text-[20px] font-medium text-foreground leading-[1.20]">{preview.title}</p>
              </div>
              {preview.description && (
                <div>
                  <p className="font-sans text-[11px] uppercase tracking-[0.5px] text-stone-gray mb-1">Description</p>
                  <p className="font-sans text-[14px] text-olive-gray line-clamp-2 leading-[1.50]">{preview.description}</p>
                </div>
              )}
              <div className="flex gap-6">
                <div>
                  <p className="font-sans text-[11px] uppercase tracking-[0.5px] text-stone-gray mb-0.5">Ingredients</p>
                  <p className="font-serif text-[24px] font-medium text-foreground">{preview.ingredients.length}</p>
                </div>
                <div>
                  <p className="font-sans text-[11px] uppercase tracking-[0.5px] text-stone-gray mb-0.5">Steps</p>
                  <p className="font-serif text-[24px] font-medium text-foreground">{preview.instructions.length}</p>
                </div>
              </div>
            </div>
            <div className="px-8 pb-8 flex gap-3">
              <button onClick={onClose} className="flex-1 btn-secondary justify-center py-3">Cancel</button>
              <button
                onClick={() => { onImport(preview); onClose(); }}
                className="flex-1 btn-primary justify-center py-3"
              >
                Save to Book
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
