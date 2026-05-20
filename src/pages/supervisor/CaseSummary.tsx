import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { Navbar } from '../../components/Layout'
import { ReportFilter, ReportSection, StatRow, MFTRow, MFTHeader } from './ReportFilter'
import type { VHWRegister } from '../../data/db'

function isPneumonia(r: VHWRegister)  { return r.Case_VerySeverePneumonia || r.Case_SeverePneumonia || r.Case_Pneumonia }
function isDiarrhoea(r: VHWRegister)  { return r.Case_DiarrWith || r.Case_DiarrNoWith || r.Case_Dysentry }
function isOther(r: VHWRegister)      { return !isPneumonia(r) && !isDiarrhoea(r) }
function isUnder5(r: VHWRegister)     { return (r.Patient_AgeInYear ?? 99) < 5 }

function caseCounts(records: VHWRegister[], predicate: (r: VHWRegister) => boolean | undefined) {
  const hits = records.filter(r => predicate(r))
  return {
    new:    hits.filter(r => r.Patient_Type === 1).length,
    old:    hits.filter(r => r.Patient_Type === 2).length,
    m:      hits.filter(r => r.Patient_Sex === 1).length,
    f:      hits.filter(r => r.Patient_Sex === 2).length,
    under5: hits.filter(isUnder5).length,
    over5:  hits.filter(r => !isUnder5(r)).length,
    total:  hits.length,
  }
}

export default function CaseSummary() {
  const now  = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [hwId,  setHwId]  = useState<number | null>(null)

  const hws = useLiveQuery(() => db.sys_chwamw.toArray().then(a => a.sort((x, y) => x.HW_Name.localeCompare(y.HW_Name))), [])

  const data = useLiveQuery(async () => {
    const records = await db.vhwRegister
      .filter(r => r.Report_Year === year && r.Report_Month === month && (hwId === null || r.HW_ID === hwId))
      .toArray()

    const pneu  = caseCounts(records, isPneumonia)
    const diarr = caseCounts(records, isDiarrhoea)
    const other = caseCounts(records, isOther)
    const total = {
      new: pneu.new + diarr.new + other.new,
      old: pneu.old + diarr.old + other.old,
      m:   pneu.m   + diarr.m   + other.m,
      f:   pneu.f   + diarr.f   + other.f,
      under5: pneu.under5 + diarr.under5 + other.under5,
      over5:  pneu.over5  + diarr.over5  + other.over5,
      total:  records.length,
    }

    // Pneumonia sub-types
    const vSevere = records.filter(r => r.Case_VerySeverePneumonia).length
    const severe  = records.filter(r => r.Case_SeverePneumonia).length
    const nonSev  = records.filter(r => r.Case_Pneumonia).length

    // Diarrhoea sub-types
    const diarrDehyd   = records.filter(r => r.Case_DiarrWith).length
    const diarrNoDehyd = records.filter(r => r.Case_DiarrNoWith).length
    const dysentry     = records.filter(r => r.Case_Dysentry).length

    // Treatments (sum quantities)
    const sum = (field: keyof VHWRegister) =>
      records.reduce((acc, r) => acc + (Number(r[field]) || 0), 0)

    const treatments = {
      ors:          sum('Treat_ORS'),
      zinc:         sum('Treat_Zinc'),
      paraSyr:      sum('Treat_ParaSyr'),
      para250:      sum('Treat_ParaTab250'),
      para500:      sum('Treat_ParaTab500'),
      amoxil:       sum('Treat_Amoxil'),
      cotrim:       sum('Treat_Cotrimoxazole'),
    }

    const referred  = records.filter(r => r.ReferredYN).length
    const arrived   = records.filter(r => r.ArrivedYN).length

    return { pneu, diarr, other, total, vSevere, severe, nonSev, diarrDehyd, diarrNoDehyd, dysentry, treatments, referred, arrived, total_records: records.length }
  }, [year, month, hwId])

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div>
      <Navbar title="Case Summary" showBack backTo="/supervisor" />
      <div className="page">
        <ReportFilter
          mode="hw" year={year} month={month}
          onYear={setYear} onMonth={setMonth}
          hwId={hwId} hws={hws} onHW={setHwId}
        />

        {!data && <div className="spinner">Computing…</div>}

        {data && <>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {MONTHS[month - 1]} {year} · {data.total_records} patient records
          </p>

          {/* Case count table */}
          <div className="card" style={{ marginBottom: '12px', overflowX: 'auto' }}>
            <p className="section-title" style={{ marginTop: 0 }}>Case Counts</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--primary-light)' }}>
                  <th style={th}>Condition</th>
                  <th style={th}>New</th>
                  <th style={th}>Old</th>
                  <th style={th}>M</th>
                  <th style={th}>F</th>
                  <th style={th}>&lt;5</th>
                  <th style={th}>5+</th>
                  <th style={{ ...th, fontWeight: 700 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Pneumonia',  data.pneu],
                  ['Diarrhoea',  data.diarr],
                  ['Others',     data.other],
                ].map(([label, c]) => {
                  const d = c as typeof data.pneu
                  return (
                    <tr key={label as string}>
                      <td style={td}>{label as string}</td>
                      <td style={td}>{d.new}</td>
                      <td style={td}>{d.old}</td>
                      <td style={{ ...td, color: '#1565C0' }}>{d.m}</td>
                      <td style={{ ...td, color: '#880E4F' }}>{d.f}</td>
                      <td style={td}>{d.under5}</td>
                      <td style={td}>{d.over5}</td>
                      <td style={{ ...td, fontWeight: 700 }}>{d.total}</td>
                    </tr>
                  )
                })}
                <tr style={{ background: 'var(--primary-light)', fontWeight: 700 }}>
                  <td style={td}>Total</td>
                  <td style={td}>{data.total.new}</td>
                  <td style={td}>{data.total.old}</td>
                  <td style={{ ...td, color: '#1565C0' }}>{data.total.m}</td>
                  <td style={{ ...td, color: '#880E4F' }}>{data.total.f}</td>
                  <td style={td}>{data.total.under5}</td>
                  <td style={td}>{data.total.over5}</td>
                  <td style={{ ...td, fontWeight: 700 }}>{data.total.total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ReportSection title="Pneumonia Sub-types">
            <StatRow label="Very Severe Pneumonia" value={data.vSevere} />
            <StatRow label="Severe Pneumonia"      value={data.severe} />
            <StatRow label="Non-severe Pneumonia"  value={data.nonSev} />
          </ReportSection>

          <ReportSection title="Diarrhoea Sub-types">
            <StatRow label="With Dehydration"    value={data.diarrDehyd} />
            <StatRow label="Without Dehydration" value={data.diarrNoDehyd} />
            <StatRow label="Dysentery"           value={data.dysentry} />
          </ReportSection>

          <ReportSection title="Treatment Dispensed">
            <StatRow label="ORS (sachets)"         value={data.treatments.ors} />
            <StatRow label="Zinc (tabs)"            value={data.treatments.zinc} />
            <StatRow label="Paracetamol syrup"      value={data.treatments.paraSyr} />
            <StatRow label="Paracetamol 250mg"      value={data.treatments.para250} />
            <StatRow label="Paracetamol 500mg"      value={data.treatments.para500} />
            <StatRow label="Amoxicillin (tabs)"     value={data.treatments.amoxil} />
            <StatRow label="Cotrimoxazole (tabs)"   value={data.treatments.cotrim} />
          </ReportSection>

          <ReportSection title="Referrals">
            <StatRow label="Referred"                value={data.referred} bold />
            <StatRow label="Arrived at facility"     value={data.arrived} />
          </ReportSection>
        </>}
      </div>
    </div>
  )
}

const th: React.CSSProperties = { padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: 'var(--primary-dark)' }
const td: React.CSSProperties = { padding: '8px 6px', textAlign: 'right', borderBottom: '1px solid var(--border)' }
