'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Peserta } from '@/types/peserta'

const STATUS_LABEL: Record<string, string> = {
  L:   'LULUS',
  MS:  'MEMENUHI SYARAT',
  TMS: 'TIDAK MEMENUHI SYARAT',
}

const STATUS_STYLE: Record<string, string> = {
  L:   'bg-emerald-100 text-emerald-700 ring-emerald-300/60 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  MS:  'bg-sky-100 text-sky-700 ring-sky-300/60 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30',
  TMS: 'bg-rose-100 text-rose-700 ring-rose-300/60 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30',
}

interface GlobalStats { L: number; MS: number; TMS: number }

export default function Home() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<Peserta[]>([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError]       = useState('')
  const [dark, setDark]         = useState(true)
  const [stats, setStats]       = useState<GlobalStats | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    setDark(stored !== 'light')
  }, [])

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
  }, [])

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  const search = useCallback(async (value: string) => {
    if (!value.trim()) {
      setResults([])
      setSearched(false)
      setError('')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Terjadi kesalahan')
      setResults(json.data)
      setSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 400)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    search(query)
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50 text-slate-900 transition-colors duration-500 dark:from-[#0a0a14] dark:via-[#0d0a1f] dark:to-[#0a0a14] dark:text-slate-100">

      {/* Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-20 top-0 h-72 w-72 rounded-full bg-purple-400/30 blur-3xl dark:bg-purple-600/20" />
        <div className="animate-blob absolute right-0 top-20 h-72 w-72 rounded-full bg-pink-400/30 blur-3xl [animation-delay:3s] dark:bg-pink-600/20" />
        <div className="animate-blob absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/30 blur-3xl [animation-delay:6s] dark:bg-cyan-600/20" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10">

        {/* Top bar */}
        <div className="mb-10 flex items-center justify-between">
          <span className="rounded-full border border-purple-300/40 bg-white/40 px-3 py-1 text-xs font-medium backdrop-blur dark:border-purple-500/30 dark:bg-white/5">
            ✦ hasil seleksi
          </span>
          <button
            onClick={toggleTheme}
            aria-label="Ganti tema"
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-300/50 bg-white/50 text-lg backdrop-blur transition-all hover:scale-110 active:scale-95 dark:border-white/10 dark:bg-white/5"
          >
            {dark ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-5xl">
            Cek Hasil Seleksi
          </h1>
          <h2 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
            <span className="text-gradient">KDKMP &amp; KNMP</span> 2026
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            tinggal ketik nama, langsung muncul ✨ no ribet
          </p>
        </div>

        {/* Global Stats Dashboard */}
        <GlobalStatsDashboard stats={stats} />

        {/* Search */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="group relative mx-auto max-w-2xl">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-60 blur transition duration-500 group-focus-within:opacity-100" />
            <div className="relative flex items-center rounded-2xl bg-white/80 backdrop-blur-xl dark:bg-[#12101f]/90">
              <span className="pl-5 text-xl">🔍</span>
              <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="ketik nama peserta di sini..."
                className="w-full bg-transparent px-4 py-4 text-base outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                autoFocus
              />
              <button
                type="submit"
                className="m-2 shrink-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-pink-500/40 active:scale-95"
              >
                cari
              </button>
            </div>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-slate-400">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
            <p className="text-sm">lagi nyari datanya... ⏳</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-red-300/50 bg-red-50/80 px-5 py-4 text-sm text-red-600 backdrop-blur dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* No Results */}
        {!loading && searched && results.length === 0 && !error && (
          <div className="py-16 text-center">
            <div className="mb-3 text-5xl">🫥</div>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              gak nemu data buat &ldquo;{query}&rdquo;
            </p>
          </div>
        )}

        {/* Cards */}
        {!loading && results.length > 0 && (
          <div className="animate-fade-up">
            <p className="mb-5 text-center text-sm text-slate-500 dark:text-slate-400">
              nemu <span className="font-bold text-gradient">{results.length}</span> peserta 🎉
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((p) => (
                <PesertaCard key={p.nomor_kartu_ujian} peserta={p} />
              ))}
            </div>
          </div>
        )}

        {/* Initial state */}
        {!loading && !searched && !error && (
          <div className="py-10 text-center">
            <div className="mb-4 text-6xl">🔮</div>
            <p className="text-lg text-slate-400 dark:text-slate-500">
              mulai ketik nama buat nyari peserta
            </p>
          </div>
        )}

        {/* Spacer to push footer down */}
        <div className="flex-1" />

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-slate-400 dark:text-slate-600">
          made by Melco Lauwento
        </footer>
      </div>
    </main>
  )
}

function GlobalStatsDashboard({ stats }: { stats: GlobalStats | null }) {
  const items = [
    {
      key: 'L',
      label: 'LULUS',
      count: stats?.L ?? null,
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-200/70 dark:border-emerald-500/20',
      numColor: 'text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-500',
    },
    {
      key: 'MS',
      label: 'MEMENUHI SYARAT',
      count: stats?.MS ?? null,
      bg: 'bg-sky-50 dark:bg-sky-500/10',
      border: 'border-sky-200/70 dark:border-sky-500/20',
      numColor: 'text-sky-600 dark:text-sky-400',
      dot: 'bg-sky-500',
    },
    {
      key: 'TMS',
      label: 'TIDAK MEMENUHI SYARAT',
      count: stats?.TMS ?? null,
      bg: 'bg-rose-50 dark:bg-rose-500/10',
      border: 'border-rose-200/70 dark:border-rose-500/20',
      numColor: 'text-rose-600 dark:text-rose-400',
      dot: 'bg-rose-500',
    },
  ]

  return (
    <div className="mb-8 grid grid-cols-3 gap-3">
      {items.map((s) => (
        <div
          key={s.key}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-5 backdrop-blur-xl ${s.bg} ${s.border}`}
        >
          {s.count === null ? (
            <div className="h-8 w-12 animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/10" />
          ) : (
            <span className={`text-3xl font-extrabold tabular-nums leading-none ${s.numColor}`}>
              {s.count.toLocaleString('id-ID')}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
            <span className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {s.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function PesertaCard({ peserta: p }: { peserta: Peserta }) {
  const statusKey   = (p.keterangan ?? '').trim().toUpperCase()
  const statusLabel = STATUS_LABEL[statusKey] ?? p.keterangan ?? '-'
  const statusStyle = STATUS_STYLE[statusKey] ?? 'bg-slate-100 text-slate-600 ring-slate-300/50 dark:bg-white/10 dark:text-slate-300 dark:ring-white/20'
  const hasKompetensi = p.kognitif !== null && p.kognitif !== undefined

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/60 bg-white/70 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <span className="shrink-0 rounded-lg bg-purple-100 px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
              #{p.no}
            </span>
            <h2 className="text-sm font-bold leading-snug">{p.nama_peserta}</h2>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusStyle}`}>
            {statusLabel}
          </span>
        </div>
        <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{p.nomor_kartu_ujian}</p>
      </div>

      <div className="mx-4 h-px bg-slate-200/70 dark:bg-white/10" />

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-4 py-3 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex gap-1.5">
          <span className="w-20 shrink-0 text-slate-400">Jabatan</span>
          <span className="font-medium">{p.jabatan || '-'}</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-20 shrink-0 text-slate-400">Pendidikan</span>
          <span className="font-medium">{p.kualifikasi_pendidikan || '-'}</span>
        </div>
      </div>

      {/* Kompetensi scores */}
      {hasKompetensi && (
        <>
          <div className="mx-4 h-px bg-slate-200/70 dark:bg-white/10" />
          <div className="flex items-center gap-3 px-4 py-3">
            <ScoreItem label="Kognitif" value={p.kognitif!} />
            <div className="h-8 w-px bg-slate-200/70 dark:bg-white/10" />
            <ScoreItem label="Substansi" value={p.substansi!} />
          </div>
        </>
      )}
    </div>
  )
}

function ScoreItem({ label, value }: { label: string; value: number }) {
  const color =
    value >= 160
      ? 'text-emerald-600 dark:text-emerald-400'
      : value >= 140
      ? 'text-amber-500 dark:text-amber-400'
      : 'text-rose-500 dark:text-rose-400'
  return (
    <div className="flex flex-1 flex-col items-center">
      <span className={`text-lg font-extrabold tabular-nums leading-none ${color}`}>{value}</span>
      <span className="mt-0.5 text-[10px] text-slate-400">{label}</span>
    </div>
  )
}
