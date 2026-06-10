'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Peserta } from '@/types/peserta'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Peserta[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [dark, setDark] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // sinkron tema dari localStorage saat mount
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    setDark(stored !== 'light')
  }, [])

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev
      const root = document.documentElement
      if (next) {
        root.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        root.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
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
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50 text-slate-900 transition-colors duration-500 dark:from-[#0a0a14] dark:via-[#0d0a1f] dark:to-[#0a0a14] dark:text-slate-100">

      {/* Blobs background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-20 top-0 h-72 w-72 rounded-full bg-purple-400/30 blur-3xl dark:bg-purple-600/20" />
        <div className="animate-blob absolute right-0 top-20 h-72 w-72 rounded-full bg-pink-400/30 blur-3xl [animation-delay:3s] dark:bg-pink-600/20" />
        <div className="animate-blob absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/30 blur-3xl [animation-delay:6s] dark:bg-cyan-600/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10">

        {/* Top bar */}
        <div className="mb-10 flex items-center justify-between">
          <span className="rounded-full border border-purple-300/40 bg-white/40 px-3 py-1 text-xs font-medium backdrop-blur dark:border-purple-500/30 dark:bg-white/5">
            ✦ peserta finder
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
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-6xl">
            cari <span className="text-gradient">peserta</span> ujian
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            tinggal ketik nama, langsung muncul ✨ no ribet
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSubmit} className="mb-12">
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

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="animate-fade-up">
            <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
              nemu <span className="font-bold text-gradient">{results.length}</span> peserta 🎉
            </p>

            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <th className="w-12 px-4 py-3.5 font-semibold">#</th>
                      <th className="px-4 py-3.5 font-semibold">No. Kartu</th>
                      <th className="px-4 py-3.5 font-semibold">Nama Peserta</th>
                      <th className="px-4 py-3.5 font-semibold">Jabatan</th>
                      <th className="px-4 py-3.5 font-semibold">Kualifikasi</th>
                      <th className="w-24 px-4 py-3.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((p) => (
                      <tr
                        key={p.nomor_kartu_ujian}
                        className="border-t border-slate-200/50 transition-colors hover:bg-purple-50/60 dark:border-white/5 dark:hover:bg-white/5"
                      >
                        <td className="px-4 py-3 text-slate-400">{p.no}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{p.nomor_kartu_ujian}</td>
                        <td className="px-4 py-3 font-semibold">{p.nama_peserta}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.jabatan}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.kualifikasi_pendidikan}</td>
                        <td className="px-4 py-3"><StatusBadge value={p.keterangan} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 md:hidden">
              {results.map((p) => (
                <div
                  key={p.nomor_kartu_ujian}
                  className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold leading-tight">{p.nama_peserta}</h2>
                    <StatusBadge value={p.keterangan} />
                  </div>
                  <p className="mb-3 font-mono text-xs text-slate-400">{p.nomor_kartu_ujian}</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">jabatan ·</span> {p.jabatan}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">pendidikan ·</span> {p.kualifikasi_pendidikan}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Initial state */}
        {!loading && !searched && !error && (
          <div className="py-16 text-center">
            <div className="mb-4 text-6xl">🔮</div>
            <p className="text-lg text-slate-400 dark:text-slate-500">
              mulai ketik nama buat nyari peserta
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-slate-400 dark:text-slate-600">
          made with 💜 · powered by next.js
        </footer>
      </div>
    </main>
  )
}

function StatusBadge({ value }: { value: string }) {
  const val = (value ?? '').trim().toUpperCase()
  const map: Record<string, string> = {
    L: 'bg-emerald-100 text-emerald-700 ring-emerald-300/50 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
    MS: 'bg-sky-100 text-sky-700 ring-sky-300/50 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30',
    TMS: 'bg-rose-100 text-rose-700 ring-rose-300/50 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30',
  }
  const style = map[val] ?? 'bg-slate-100 text-slate-600 ring-slate-300/50 dark:bg-white/10 dark:text-slate-300 dark:ring-white/20'
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${style}`}>
      {value || '-'}
    </span>
  )
}
