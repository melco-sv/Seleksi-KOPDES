-- =============================================================
--  Database setup untuk aplikasi Cek Hasil Seleksi KDKMP & KNMP 2026
--  Jalankan file ini di Aiven Query Editor atau MySQL client
-- =============================================================

-- ── Tabel peserta_hasil ──────────────────────────────────────
DROP TABLE IF EXISTS peserta_hasil;
CREATE TABLE peserta_hasil (
  no                    INT          NOT NULL,
  nomor_kartu_ujian     VARCHAR(30)  NOT NULL,
  nama_peserta          VARCHAR(255) NOT NULL,
  jabatan               VARCHAR(255) NOT NULL,
  kualifikasi_pendidikan VARCHAR(100) NOT NULL,
  keterangan            VARCHAR(10)  NOT NULL,
  PRIMARY KEY (nomor_kartu_ujian),
  KEY idx_nama (nama_peserta),
  KEY idx_status (keterangan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Contoh data peserta_hasil (hapus / ganti dengan data asli Anda)
-- INSERT INTO peserta_hasil VALUES
-- (1, 'P2640758110016496', 'AGUNG HIDAYATULLAH', 'Analis Kebijakan', 'S1', 'L'),
-- (2, 'P2640758110147474', 'ARINDRA BAGASKARA',  'Analis Kebijakan', 'S1', 'L');


-- ── Tabel hasil_seleksi_kompetensi ───────────────────────────
DROP TABLE IF EXISTS hasil_seleksi_kompetensi;
CREATE TABLE hasil_seleksi_kompetensi (
  no             INT          NOT NULL,
  nomor_peserta  VARCHAR(30)  NOT NULL,
  nama           VARCHAR(255) NOT NULL,
  kognitif       INT          NOT NULL,
  substansi      INT          NOT NULL,
  status         VARCHAR(10)  NOT NULL,
  PRIMARY KEY (nomor_peserta),
  KEY idx_nama   (nama),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Contoh data hasil_seleksi_kompetensi (hapus / ganti dengan data asli Anda)
-- INSERT INTO hasil_seleksi_kompetensi VALUES
-- (1, 'P2640758110016496', 'AGUNG HIDAYATULLAH',        160, 85, 'P/L'),
-- (2, 'P2640758110147474', 'ARINDRA BAGASKARA',         158, 85, 'P/L'),
-- (3, 'P2640758120075622', 'LULUK ANGGRAENI PURNAMASASI', 157, 80, 'P/L'),
-- (4, 'P2640758110155610', 'HUSNA RIZQI PURNAMA',       157, 80, 'P/L');
