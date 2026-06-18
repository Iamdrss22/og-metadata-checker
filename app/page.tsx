'use client';

import { useState, useEffect, FormEvent } from 'react';

interface OgMetadata {
  title: string | null;
  description: string | null;
  image: string | null;
  imageWidth: string | null;
  imageHeight: string | null;
  imageAlt: string | null;
  url: string | null;
  type: string | null;
  siteName: string | null;
}

interface TagRow {
  label: string;
  value: string | null;
  tag: string;
}

const MM_GREEN = '#34D378';

function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors
        border-[#34D378]/30 text-[#34D378] hover:bg-[#34D378]/10"
    >
      {dark ? (
        <>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.42-1.41l.71-.71zM18 9a1 1 0 110 2h-1a1 1 0 110-2h1zM4.22 16.22a1 1 0 001.42-1.42l-.71-.7a1 1 0 10-1.42 1.41l.71.71zM3 11a1 1 0 100-2H2a1 1 0 100 2h1zm13.78 5.22a1 1 0 01-1.42-1.42l.71-.7a1 1 0 111.42 1.41l-.71.71zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.78 4.78a1 1 0 00-1.42-1.42l-.71.71a1 1 0 101.42 1.41l.71-.7zM10 6a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
          Light
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          Dark
        </>
      )}
    </button>
  );
}

function StatusDot({ present }: { present: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 mt-1 ${
        present ? 'bg-[#34D378]' : 'bg-red-400'
      }`}
    />
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-[#34D378] hover:opacity-70 transition-opacity ml-2 flex-shrink-0"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function TagTable({ rows }: { rows: TagRow[] }) {
  return (
    <div className="divide-y divide-black/5 dark:divide-white/5">
      {rows.map(({ label, value, tag }) => (
        <div key={tag} className="flex items-start gap-3 py-3 px-4">
          <StatusDot present={value !== null} />
          <span className="text-xs font-mono text-[#34D378] w-36 flex-shrink-0 pt-0.5">{tag}</span>
          <div className="flex-1 min-w-0">
            {value ? (
              <div className="flex items-start gap-1">
                <span className="text-sm text-gray-800 dark:text-white/80 break-all leading-snug">{value}</span>
                {(tag === 'og:image' || tag === 'og:url') && <CopyButton text={value} />}
              </div>
            ) : (
              <span className="text-sm text-gray-300 dark:text-white/25 italic">not set</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SocialPreviewCard({
  metadata,
  imageError,
  onImageError,
}: {
  metadata: OgMetadata;
  imageError: boolean;
  onImageError: () => void;
}) {
  const displayUrl = metadata.url
    ? (() => { try { return new URL(metadata.url).hostname.replace(/^www\./, ''); } catch { return metadata.url; } })()
    : '—';

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
      {/* Fake browser chrome */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-4 py-2.5 border-b border-gray-200 dark:border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
        </div>
        <div className="flex-1 mx-3 bg-white dark:bg-white/10 rounded-md px-3 py-1 text-xs text-gray-400 dark:text-white/40 truncate">
          {metadata.url ?? '—'}
        </div>
      </div>

      {/* OG image */}
      {metadata.image && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={metadata.image}
          alt={metadata.imageAlt ?? 'OG preview'}
          onError={onImageError}
          className="w-full object-cover max-h-64"
        />
      ) : metadata.image && imageError ? (
        <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/30 text-sm italic">
          Image failed to load
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-white/20 text-sm italic">
          No og:image set
        </div>
      )}

      {/* Card info */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {metadata.siteName && (
            <span className="text-sm font-semibold text-gray-900 dark:text-white/90">{metadata.siteName}</span>
          )}
          {metadata.type && (
            <span className="text-xs bg-[#34D378]/10 text-[#34D378] border border-[#34D378]/20 px-2 py-0.5 rounded-full">
              {metadata.type}
            </span>
          )}
          {!metadata.siteName && !metadata.type && (
            <span className="text-xs text-gray-400 dark:text-white/30">{displayUrl}</span>
          )}
        </div>
        <p className="text-base font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-1">
          {metadata.title ?? <span className="italic text-gray-300 dark:text-white/30">No title</span>}
        </p>
        <p className="text-sm text-gray-500 dark:text-white/50 line-clamp-2">
          {metadata.description ?? <span className="italic">No description</span>}
        </p>
        <p className="text-xs text-gray-300 dark:text-white/25 mt-2 truncate">{displayUrl}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<OgMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setMetadata(null);
    setImageError(false);

    try {
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
      } else {
        setMetadata(data.metadata);
      }
    } catch {
      setError('Network error — could not reach the server');
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setUrl('');
    setMetadata(null);
    setError(null);
    setImageError(false);
  }

  const rows: TagRow[] = metadata
    ? [
        { label: 'Title', value: metadata.title, tag: 'og:title' },
        { label: 'Description', value: metadata.description, tag: 'og:description' },
        { label: 'URL', value: metadata.url, tag: 'og:url' },
        { label: 'Type', value: metadata.type, tag: 'og:type' },
        { label: 'Site Name', value: metadata.siteName, tag: 'og:site_name' },
        { label: 'Image', value: metadata.image, tag: 'og:image' },
        { label: 'Image Width', value: metadata.imageWidth, tag: 'og:image:width' },
        { label: 'Image Height', value: metadata.imageHeight, tag: 'og:image:height' },
        { label: 'Image Alt', value: metadata.imageAlt, tag: 'og:image:alt' },
      ]
    : [];

  const presentCount = rows.filter((r) => r.value !== null).length;

  return (
    <div
      className="min-h-screen transition-colors duration-300
        bg-[#F5FBF8] dark:bg-[#05100D]"
      style={dark ? { backgroundImage: `radial-gradient(ellipse 80% 60% at 50% -10%, ${MM_GREEN}1E 0%, transparent 70%)` } : undefined}
    >
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[#34D378] font-black text-xl tracking-tight">MONEYME</span>
          <span className="text-gray-900 dark:text-white font-semibold text-xl tracking-tight ml-1">Metadata Checker</span>
        </div>
        <ThemeToggle dark={dark} onToggle={() => setDark((d) => !d)} />
      </nav>

      {/* Hero */}
      <header className="px-4 pt-14 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-[#34D378]/10 border border-[#34D378]/20 text-[#34D378] text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          Open Graph Inspector
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          MONEYME Metadata Checker
        </h1>
        <p className="text-gray-500 dark:text-white/40 text-base max-w-sm mx-auto">
          Paste any URL to preview its social card and inspect every Open Graph tag.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="w-full rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10
                px-4 py-3 pr-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25
                focus:outline-none focus:ring-2 focus:ring-[#34D378]/60 focus:border-transparent shadow-sm dark:shadow-none"
            />
            {url && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear URL"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-white/30 dark:hover:text-white/60 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#34D378] hover:bg-[#2EC96C] px-6 py-3 text-sm font-bold text-[#05100D]
              shadow-lg shadow-[#34D378]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Checking
              </span>
            ) : (
              'Check'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 max-w-xl mx-auto rounded-xl bg-red-500/10 border border-red-400/20 px-4 py-3 text-sm text-red-500 dark:text-red-300">
            {error}
          </div>
        )}
      </header>

      {/* Results */}
      {metadata && (
        <main className="max-w-2xl mx-auto px-4 pb-20 space-y-6">
          <div className="flex items-center justify-between text-sm px-1">
            <span className="text-gray-400 dark:text-white/40">Social preview</span>
            <span
              className={`font-medium ${
                presentCount >= 7
                  ? 'text-[#34D378]'
                  : presentCount >= 4
                  ? 'text-yellow-500 dark:text-yellow-400'
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              {presentCount}/{rows.length} tags set
            </span>
          </div>

          <SocialPreviewCard
            metadata={metadata}
            imageError={imageError}
            onImageError={() => setImageError(true)}
          />

          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">
                Tag Breakdown
              </h2>
            </div>
            <TagTable rows={rows} />
          </div>
        </main>
      )}
    </div>
  );
}
