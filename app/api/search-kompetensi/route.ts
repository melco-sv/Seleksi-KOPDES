import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { HasilSeleksi } from '@/types/hasil-seleksi'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''

  if (!query) {
    return NextResponse.json({ data: [], total: 0 })
  }

  try {
    const searchTerm = `%${query}%`
    const [rows] = await pool.execute(
      `SELECT no, nomor_peserta, nama, kognitif, substansi, status
       FROM hasil_seleksi_kompetensi
       WHERE nama LIKE ?
       ORDER BY nama ASC
       LIMIT 100`,
      [searchTerm]
    )

    const data = rows as HasilSeleksi[]
    return NextResponse.json({ data, total: data.length })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data dari database' },
      { status: 500 }
    )
  }
}
