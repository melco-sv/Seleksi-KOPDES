import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { Peserta } from '@/types/peserta'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''
  const table = process.env.DB_TABLE ?? 'peserta'

  if (!query) {
    return NextResponse.json({ data: [], total: 0 })
  }

  try {
    const searchTerm = `%${query}%`
    const [rows] = await pool.execute(
      `SELECT no, nomor_kartu_ujian, nama_peserta, jabatan, kualifikasi_pendidikan, keterangan
       FROM \`${table}\`
       WHERE nama_peserta LIKE ?
       ORDER BY nama_peserta ASC
       LIMIT 100`,
      [searchTerm]
    )

    const data = rows as Peserta[]
    return NextResponse.json({ data, total: data.length })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data dari database' },
      { status: 500 }
    )
  }
}
