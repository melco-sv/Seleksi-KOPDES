// Script migrasi: lokal MySQL → Aiven
// Jalankan: node migrate.mjs

import mysql from 'mysql2/promise'

// ── Koneksi LOKAL ────────────────────────────────────────────
const local = await mysql.createConnection({
  host:     'localhost',
  port:     3306,
  user:     'root',
  password: '',          // ganti jika ada password lokal
  database: 'peserta_hasil',
})

// ── Koneksi AIVEN ────────────────────────────────────────────
// Baca dari .env.local: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
import { readFileSync } from 'fs'
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(s => s.trim()))
)

const aiven = await mysql.createConnection({
  host:     env.DB_HOST,
  port:     Number(env.DB_PORT),
  user:     env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl:      { rejectUnauthorized: false },
})

console.log('✓ Terhubung ke lokal & Aiven')

// ── Buat tabel di Aiven ──────────────────────────────────────
await aiven.execute(`DROP TABLE IF EXISTS hasil_seleksi_kompetensi`)
await aiven.execute(`DROP TABLE IF EXISTS peserta_hasil`)

await aiven.execute(`
  CREATE TABLE peserta_hasil (
    no                     INT          NOT NULL,
    nomor_kartu_ujian      VARCHAR(30)  NOT NULL,
    nama_peserta           VARCHAR(255) NOT NULL,
    jabatan                VARCHAR(255) NOT NULL,
    kualifikasi_pendidikan VARCHAR(100) NOT NULL,
    keterangan             VARCHAR(10)  NOT NULL,
    PRIMARY KEY (nomor_kartu_ujian),
    KEY idx_nama   (nama_peserta),
    KEY idx_status (keterangan)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`)

await aiven.execute(`
  CREATE TABLE hasil_seleksi_kompetensi (
    no            INT          NOT NULL,
    nomor_peserta VARCHAR(30)  NOT NULL,
    nama          VARCHAR(255) NOT NULL,
    kognitif      INT          NOT NULL,
    substansi     INT          NOT NULL,
    status        VARCHAR(10)  NOT NULL,
    PRIMARY KEY (nomor_peserta),
    KEY idx_nama   (nama),
    KEY idx_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`)

console.log('✓ Tabel dibuat di Aiven')

// ── Migrasi peserta_hasil ─────────────────────────────────────
const [peserta] = await local.execute(`SELECT * FROM peserta_hasil`)
if (peserta.length > 0) {
  for (const r of peserta) {
    await aiven.execute(
      `INSERT INTO peserta_hasil VALUES (?,?,?,?,?,?)`,
      [r.no, r.nomor_kartu_ujian, r.nama_peserta, r.jabatan, r.kualifikasi_pendidikan, r.keterangan]
    )
  }
}
console.log(`✓ peserta_hasil: ${peserta.length} baris dipindahkan`)

// ── Migrasi hasil_seleksi_kompetensi ─────────────────────────
const [kompetensi] = await local.execute(`SELECT * FROM hasil_seleksi_kompetensi`)
if (kompetensi.length > 0) {
  for (const r of kompetensi) {
    await aiven.execute(
      `INSERT IGNORE INTO hasil_seleksi_kompetensi VALUES (?,?,?,?,?,?)`,
      [r.no, r.nomor_peserta, r.nama, r.kognitif, r.substansi, r.status]
    )
  }
}
console.log(`✓ hasil_seleksi_kompetensi: ${kompetensi.length} baris dipindahkan`)

await local.end()
await aiven.end()
console.log('\n🎉 Migrasi selesai! Semua data sudah di Aiven.')
