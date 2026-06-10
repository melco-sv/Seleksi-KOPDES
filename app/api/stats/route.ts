import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const table = process.env.DB_TABLE ?? 'peserta_hasil'
  try {
    const [rows] = await pool.execute(
      `SELECT keterangan, COUNT(*) AS count FROM \`${table}\` GROUP BY keterangan`
    )
    const counts: Record<string, number> = { L: 0, MS: 0, TMS: 0 }
    for (const row of rows as { keterangan: string; count: number }[]) {
      const key = (row.keterangan ?? '').trim().toUpperCase()
      if (key in counts) counts[key] = Number(row.count)
    }
    return NextResponse.json(counts)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ L: 0, MS: 0, TMS: 0 }, { status: 500 })
  }
}
