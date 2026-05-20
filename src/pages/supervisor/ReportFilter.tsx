import type { SysRHC, SysCHWAMW } from '../../data/db'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const YEARS  = Array.from({ length: 8 }, (_, i) => 2019 + i)

interface BaseProps {
  year: number
  month: number
  onYear: (y: number) => void
  onMonth: (m: number) => void
}

interface RHCFilterProps extends BaseProps {
  mode: 'rhc'
  rhcCode: number | null
  rhcs: SysRHC[] | undefined
  onRHC: (r: number | null) => void
}

interface HWFilterProps extends BaseProps {
  mode: 'hw'
  hwId: number | null
  hws: SysCHWAMW[] | undefined
  onHW: (h: number | null) => void
}

type Props = RHCFilterProps | HWFilterProps

export function ReportFilter(props: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
      <select
        className="form-control-inline"
        value={props.month}
        onChange={e => props.onMonth(Number(e.target.value))}
        style={selectStyle}
      >
        {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
      </select>

      <select
        value={props.year}
        onChange={e => props.onYear(Number(e.target.value))}
        style={selectStyle}
      >
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>

      {props.mode === 'rhc' && (
        <select
          value={props.rhcCode ?? ''}
          onChange={e => props.onRHC(e.target.value ? Number(e.target.value) : null)}
          style={selectStyle}
        >
          <option value="">All RHCs</option>
          {props.rhcs?.map(r => <option key={r.RHC_Code} value={r.RHC_Code}>{r.RHC_Name}</option>)}
        </select>
      )}

      {props.mode === 'hw' && (
        <select
          value={props.hwId ?? ''}
          onChange={e => props.onHW(e.target.value ? Number(e.target.value) : null)}
          style={selectStyle}
        >
          <option value="">All HWs</option>
          {props.hws?.map(h => <option key={h.HW_ID} value={h.HW_ID}>{h.HW_Name}</option>)}
        </select>
      )}
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1.5px solid var(--border)',
  borderRadius: '6px',
  fontSize: '0.9rem',
  background: 'var(--card-bg)',
}

// ── Display helpers ──────────────────────────────────────────────────────────

export function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: '12px' }}>
      <p className="section-title" style={{ marginTop: 0 }}>{title}</p>
      {children}
    </div>
  )
}

export function StatRow({ label, value, bold }: { label: string; value: string | number; bold?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '7px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, fontSize: '1rem' }}>{value}</span>
    </div>
  )
}

export function MFTRow({ label, m, f, t }: { label: string; m: number; f: number; t: number }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 40px 40px 48px',
      padding: '7px 0', borderBottom: '1px solid var(--border)', alignItems: 'center',
      fontSize: '0.875rem', gap: '4px',
    }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ textAlign: 'right', color: '#1565C0' }}>{m}</span>
      <span style={{ textAlign: 'right', color: '#880E4F' }}>{f}</span>
      <span style={{ textAlign: 'right', fontWeight: 600 }}>{t}</span>
    </div>
  )
}

export function MFTHeader() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 40px 40px 48px',
      padding: '4px 0', gap: '4px',
      fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
    }}>
      <span />
      <span style={{ textAlign: 'right' }}>M</span>
      <span style={{ textAlign: 'right' }}>F</span>
      <span style={{ textAlign: 'right' }}>Total</span>
    </div>
  )
}
