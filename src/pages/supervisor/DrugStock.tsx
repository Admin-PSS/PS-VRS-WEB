import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { Navbar } from '../../components/Layout'
import { ReportFilter } from './ReportFilter'
import type { VHWRegister } from '../../data/db'

interface DrugRow {
  name: string
  field: keyof VHWRegister
}

const DRUGS: DrugRow[] = [
  { name: 'ORS (sachets)',         field: 'Treat_ORS' },
  { name: 'Zinc (tabs)',           field: 'Treat_Zinc' },
  { name: 'Paracetamol Syrup',     field: 'Treat_ParaSyr' },
  { name: 'Paracetamol 250mg',     field: 'Treat_ParaTab250' },
  { name: 'Paracetamol 500mg',     field: 'Treat_ParaTab500' },
  { name: 'Amoxicillin (tabs)',    field: 'Treat_Amoxil' },
  { name: 'Cotrimoxazole (tabs)',  field: 'Treat_Cotrimoxazole' },
]

export default function DrugStock() {
  const now  = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [hwId,  setHwId]  = useState<number | null>(null)

  const hws = useLiveQuery(() => db.sys_chwamw.toArray().then(a => a.sort((x, y) => x.HW_Name.localeCompare(y.HW_Name))), [])

  const data = useLiveQuery(async () => {
    const records = await db.vhwRegister
      .filter(r => r.Report_Year === year && r.Report_Month === month && (hwId === null || r.HW_ID === hwId))
      .toArray()

    // Total dispensed per drug
    const totals = DRUGS.map(drug => ({
      name:  drug.name,
      total: records.reduce((acc, r) => acc + (Number(r[drug.field]) || 0), 0),
    }))

    // Per-HW breakdown
    const hwIds  = [...new Set(records.map(r => r.HW_ID))]
    const hwRows = await Promise.all(hwIds.map(async id => {
      const hw = await db.sys_chwamw.get(id)
      const recs = records.filter(r => r.HW_ID === id)
      const drugs = DRUGS.map(drug => ({
        name: drug.name,
        qty:  recs.reduce((acc, r) => acc + (Number(r[drug.field]) || 0), 0),
      }))
      return { hwName: hw?.HW_Name ?? `HW ${id}`, chwamw: hw?.CHWAMW ?? '', drugs }
    }))

    return { totals, hwRows, patientCount: records.length }
  }, [year, month, hwId])

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div>
      <Navbar title="Drug Stock" showBack backTo="/supervisor" />
      <div className="page">
        <ReportFilter
          mode="hw" year={year} month={month}
          onYear={setYear} onMonth={setMonth}
          hwId={hwId} hws={hws} onHW={setHwId}
        />

        {!data && <div className="spinner">Computing…</div>}

        {data && <>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            {MONTHS[month - 1]} {year} · Dispensed from {data.patientCount} patient records
          </p>
          <div className="alert alert-info" style={{ marginBottom: '12px', fontSize: '0.8rem' }}>
            Showing quantities dispensed. Opening balance &amp; received stock tracked separately.
          </div>

          {/* Summary totals */}
          <div className="card" style={{ marginBottom: '12px' }}>
            <p className="section-title" style={{ marginTop: 0 }}>Total Dispensed</p>
            {data.totals.map(row => (
              <div key={row.name} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '7px 0', borderBottom: '1px solid var(--border)',
                fontSize: '0.875rem',
              }}>
                <span style={{ color: 'var(--text-muted)' }}>{row.name}</span>
                <span style={{ fontWeight: row.total > 0 ? 700 : 400, color: row.total > 0 ? 'var(--text)' : 'var(--text-muted)' }}>
                  {row.total}
                </span>
              </div>
            ))}
          </div>

          {/* Per-HW breakdown */}
          {data.hwRows.length > 0 && (
            <div className="card" style={{ overflowX: 'auto' }}>
              <p className="section-title" style={{ marginTop: 0 }}>By Health Worker</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ background: 'var(--primary-light)' }}>
                    <th style={{ ...thStyle, textAlign: 'left' }}>HW</th>
                    {DRUGS.map(d => (
                      <th key={d.field} style={thStyle} title={d.name}>
                        {d.name.split(' ')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.hwRows.map(row => (
                    <tr key={row.hwName}>
                      <td style={{ ...tdStyle, textAlign: 'left' }}>
                        <div style={{ fontWeight: 500 }}>{row.hwName}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{row.chwamw}</div>
                      </td>
                      {row.drugs.map(d => (
                        <td key={d.name} style={tdStyle}>
                          {d.qty > 0 ? <strong>{d.qty}</strong> : <span style={{ color: 'var(--border)' }}>–</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.hwRows.length === 0 && (
            <div className="alert alert-info">No dispensing records for this period.</div>
          )}
        </>}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: 'var(--primary-dark)' }
const tdStyle: React.CSSProperties = { padding: '8px 6px', textAlign: 'right', borderBottom: '1px solid var(--border)' }
