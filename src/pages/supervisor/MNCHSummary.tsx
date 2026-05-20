import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { Navbar } from '../../components/Layout'
import { ReportFilter, ReportSection, StatRow, MFTRow, MFTHeader } from './ReportFilter'

export default function MNCHSummary() {
  const now   = new Date()
  const [year,    setYear]    = useState(now.getFullYear())
  const [month,   setMonth]   = useState(now.getMonth() + 1)
  const [rhcCode, setRhcCode] = useState<number | null>(null)

  const rhcs = useLiveQuery(() => db.sys_rhc.toArray(), [])

  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end   = `${year}-${String(month).padStart(2, '0')}-31`
  const matchRHC  = (d: { RHC_Code: number }) => rhcCode === null || d.RHC_Code === rhcCode
  const inPeriod  = (date: string | undefined) => !!date && date >= start && date <= end

  const data = useLiveQuery(async () => {
    const [ancs, deliveries, pncs, nbcs, referrals, allAnc] = await Promise.all([
      db.anc.filter(a => matchRHC(a) && inPeriod(a.ANC_Date)).toArray(),
      db.delivery.filter(d => matchRHC(d) && inPeriod(d.Delivery_Date)).toArray(),
      db.pnc.filter(p => matchRHC(p) && inPeriod(p.PNC_Date)).toArray(),
      db.nbc.filter(n => matchRHC(n) && inPeriod(n.NBC_Date)).toArray(),
      db.referral.filter(r => matchRHC(r) && inPeriod(r.Ref_Date)).toArray(),
      db.anc.filter(a => matchRHC(a)).toArray(),
    ])

    // ANC — clients with 4+ cumulative visits
    const ancVisitCount: Record<string, number> = {}
    for (const a of allAnc) ancVisitCount[a.Client_ID] = (ancVisitCount[a.Client_ID] ?? 0) + 1
    const anc4Plus = Object.values(ancVisitCount).filter(n => n >= 4).length

    // Deliveries by outcome + sex
    const lb = (sex: number) => deliveries.filter(d => d.Delivery_ChildOutcome === 1 && d.Delivery_ChildSex === sex).length
    const sb = (sex: number) => deliveries.filter(d => d.Delivery_ChildOutcome === 2 && d.Delivery_ChildSex === sex).length
    const lbM = lb(1), lbF = lb(2), lbT = lbM + lbF
    const sbM = sb(1), sbF = sb(2), sbT = sbM + sbF

    // NBC — danger signs
    const nbcDanger   = nbcs.filter(n => n.NBC_DangerSign).length
    const nbcEBF      = nbcs.filter(n => n.NBC_EBF).length

    // Referrals by person type (1=Mother, 2=Child, 3=Both)
    const ref = (morC: number) => referrals.filter(r => r.Ref_MorC === morC).length
    const refCompleted = referrals.filter(r => r.Ref_Completeness).length

    return {
      anc: {
        visits: ancs.length,
        clients: new Set(ancs.map(a => a.Client_ID)).size,
        fourPlus: anc4Plus,
      },
      delivery: { lbM, lbF, lbT, sbM, sbF, sbT, total: deliveries.length, cdk: deliveries.filter(d => d.Delivery_CDK).length },
      pnc: { contacts: new Set(pncs.map(p => p.Client_ID)).size, visits: pncs.length },
      nbc: { total: nbcs.length, danger: nbcDanger, ebf: nbcEBF },
      referral: { maternal: ref(1), child: ref(2), both: ref(3), total: referrals.length, completed: refCompleted },
    }
  }, [year, month, rhcCode])

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div>
      <Navbar title="MNCH Summary" showBack backTo="/supervisor" />
      <div className="page">
        <ReportFilter
          mode="rhc" year={year} month={month}
          onYear={setYear} onMonth={setMonth}
          rhcCode={rhcCode} rhcs={rhcs} onRHC={setRhcCode}
        />

        {!data && <div className="spinner">Computing…</div>}

        {data && <>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {MONTHS[month - 1]} {year}{rhcCode ? ` · RHC ${rhcs?.find(r => r.RHC_Code === rhcCode)?.RHC_Name}` : ' · All RHCs'}
          </p>

          <ReportSection title="ANC (Antenatal Care)">
            <StatRow label="Total ANC Visits"          value={data.anc.visits} />
            <StatRow label="Unique Clients Seen"       value={data.anc.clients} />
            <StatRow label="Clients with 4+ Visits"    value={data.anc.fourPlus} bold />
          </ReportSection>

          <ReportSection title="Deliveries">
            <MFTHeader />
            <MFTRow label="Live Births"  m={data.delivery.lbM} f={data.delivery.lbF} t={data.delivery.lbT} />
            <MFTRow label="Still Births" m={data.delivery.sbM} f={data.delivery.sbF} t={data.delivery.sbT} />
            <MFTRow label="Total"        m={data.delivery.lbM + data.delivery.sbM} f={data.delivery.lbF + data.delivery.sbF} t={data.delivery.total} />
            <div style={{ marginTop: '8px' }}>
              <StatRow label="CDK Used" value={data.delivery.cdk} />
            </div>
          </ReportSection>

          <ReportSection title="PNC (Postnatal Care)">
            <StatRow label="Unique Clients Seen" value={data.pnc.contacts} />
            <StatRow label="Total PNC Visits"    value={data.pnc.visits} />
          </ReportSection>

          <ReportSection title="NBC (Newborn Care)">
            <StatRow label="Total NBC Contacts"  value={data.nbc.total} bold />
            <StatRow label="EBF Practiced"       value={data.nbc.ebf} />
            <StatRow label="Danger Signs Found"  value={data.nbc.danger} />
          </ReportSection>

          <ReportSection title="Referrals">
            <StatRow label="Maternal"  value={data.referral.maternal} />
            <StatRow label="Child"     value={data.referral.child} />
            <StatRow label="Both"      value={data.referral.both} />
            <StatRow label="Total Referred"   value={data.referral.total} bold />
            <StatRow label="Completed (Arrived)" value={data.referral.completed} />
          </ReportSection>
        </>}
      </div>
    </div>
  )
}
