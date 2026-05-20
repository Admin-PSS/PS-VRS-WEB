import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { Navbar } from '../../components/Layout'

export default function HealthWorkers() {
  const [search,  setSearch]  = useState('')
  const [rhcCode, setRhcCode] = useState<number | null>(null)
  const [typeFilter, setType] = useState<string>('')

  const hws  = useLiveQuery(() => db.sys_chwamw.toArray().then(a => a.sort((x, y) => x.HW_Name.localeCompare(y.HW_Name))), [])
  const rhcs = useLiveQuery(() => db.sys_rhc.toArray(), [])

  const filtered = hws?.filter(h =>
    (rhcCode === null || h.RHC_Code === rhcCode) &&
    (typeFilter === '' || h.CHWAMW === typeFilter) &&
    (search === '' || h.HW_Name.toLowerCase().includes(search.toLowerCase()))
  )

  const badge = (val?: boolean) =>
    val ? <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>✓</span>
        : <span style={{ color: 'var(--border)' }}>–</span>

  return (
    <div>
      <Navbar title="Health Workers" showBack backTo="/supervisor" />
      <div className="page">

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          <input
            type="search"
            placeholder="Search name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={inputStyle}
          />
          <select value={rhcCode ?? ''} onChange={e => setRhcCode(e.target.value ? Number(e.target.value) : null)} style={inputStyle}>
            <option value="">All RHCs</option>
            {rhcs?.map(r => <option key={r.RHC_Code} value={r.RHC_Code}>{r.RHC_Name}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setType(e.target.value)} style={inputStyle}>
            <option value="">CHW &amp; AMW</option>
            <option value="CHW">CHW only</option>
            <option value="AMW">AMW only</option>
          </select>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          {filtered?.length ?? 0} health workers
        </p>

        <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'var(--primary-light)' }}>
                <th style={th}>Name</th>
                <th style={th}>Type</th>
                <th style={{ ...th, textAlign: 'left' }}>RHC</th>
                <th style={th}>CCM</th>
                <th style={th}>NBC</th>
                <th style={th}>VRS</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map(h => (
                <tr key={h.HW_ID}>
                  <td style={{ ...td, fontWeight: 500 }}>{h.HW_Name}</td>
                  <td style={td}>
                    <span className={`badge ${h.CHWAMW === 'AMW' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '0.7rem' }}>
                      {h.CHWAMW}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: 'left', color: 'var(--text-muted)' }}>
                    {rhcs?.find(r => r.RHC_Code === h.RHC_Code)?.RHC_Name ?? h.RHC_Code}
                  </td>
                  <td style={td}>{badge(h.CCM_Trained)}</td>
                  <td style={td}>{badge(h.CBNBC_Trained)}</td>
                  <td style={td}>{badge(h.VRS_Trained)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered?.length === 0 && (
            <div className="alert alert-info" style={{ margin: '12px' }}>No health workers match the filter.</div>
          )}
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', border: '1.5px solid var(--border)',
  borderRadius: '6px', fontSize: '0.9rem', background: 'var(--card-bg)',
}
const th: React.CSSProperties = { padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: 'var(--primary-dark)' }
const td: React.CSSProperties = { padding: '8px 6px', textAlign: 'right', borderBottom: '1px solid var(--border)' }
