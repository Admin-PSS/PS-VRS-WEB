import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { Navbar } from '../../components/Layout'

export default function Townships() {
  const [expanded, setExpanded] = useState<number | null>(null)

  const rhcs      = useLiveQuery(() => db.sys_rhc.toArray(), [])
  const srhcs     = useLiveQuery(() => db.sys_srhc.toArray(), [])
  const villages  = useLiveQuery(() => db.sys_village.toArray(), [])
  const hws       = useLiveQuery(() => db.sys_chwamw.toArray(), [])
  const townships = useLiveQuery(() => db.sys_township.toArray(), [])

  const toggle = (code: number) => setExpanded(e => e === code ? null : code)

  return (
    <div>
      <Navbar title="Townships" showBack backTo="/supervisor" />
      <div className="page">

        {townships?.map(ts => (
          <div key={ts.TS_PCode} style={{ marginBottom: '16px' }}>
            <div style={{
              background: 'var(--primary)', color: '#fff',
              padding: '10px 14px', borderRadius: '8px 8px 0 0',
              fontWeight: 700, fontSize: '0.95rem',
            }}>
              {ts.Township}
              <span style={{ fontWeight: 400, fontSize: '0.8rem', marginLeft: '8px', opacity: 0.85 }}>
                ({ts.Org_Short})
              </span>
            </div>

            {rhcs?.filter(r => r.TS_Pcode === ts.TS_PCode).map(rhc => {
              const rhcSRHCs   = srhcs?.filter(s => s.RHC_Code === rhc.RHC_Code) ?? []
              const rhcVils    = villages?.filter(v => v.RHC_Code === rhc.RHC_Code) ?? []
              const rhcHWs     = hws?.filter(h => h.RHC_Code === rhc.RHC_Code) ?? []
              const isOpen     = expanded === rhc.RHC_Code

              return (
                <div key={rhc.RHC_Code} className="card" style={{ marginBottom: '6px', borderRadius: '0', padding: '0' }}>
                  {/* RHC header row */}
                  <button
                    onClick={() => toggle(rhc.RHC_Code)}
                    style={{
                      width: '100%', textAlign: 'left', background: 'none',
                      border: 'none', padding: '12px 14px', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rhc.RHC_Name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {rhcSRHCs.length} sub-RHC · {rhcVils.length} villages · {rhcHWs.length} HW
                      <span style={{ marginLeft: '8px' }}>{isOpen ? '▲' : '▼'}</span>
                    </span>
                  </button>

                  {/* Population stats */}
                  {(rhc.PopulationByRHC19 || rhc.ExpPregByRHC19) && (
                    <div style={{
                      display: 'flex', gap: '16px', padding: '0 14px 10px',
                      fontSize: '0.78rem', color: 'var(--text-muted)',
                      borderBottom: isOpen ? '1px solid var(--border)' : 'none',
                    }}>
                      {rhc.PopulationByRHC19 && <span>Pop: <strong>{rhc.PopulationByRHC19.toLocaleString()}</strong></span>}
                      {rhc.U5PopulationByRHC19 && <span>U5: <strong>{rhc.U5PopulationByRHC19.toLocaleString()}</strong></span>}
                      {rhc.ExpPregByRHC19 && <span>Exp.Preg: <strong>{rhc.ExpPregByRHC19}</strong></span>}
                      {rhc.LiveBirthByRHC19 && <span>Births: <strong>{rhc.LiveBirthByRHC19}</strong></span>}
                    </div>
                  )}

                  {/* Expanded: sub-RHCs + villages */}
                  {isOpen && (
                    <div style={{ padding: '8px 14px 12px' }}>
                      {rhcSRHCs.map(s => {
                        const sVils = rhcVils.filter(v => v.SRHC_Code === s.SRHC_Code)
                        return (
                          <div key={s.SRHC_Code} style={{ marginBottom: '10px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--primary-dark)', marginBottom: '4px' }}>
                              {s.SRHC_Name}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {sVils.map(v => (
                                <span key={v.Village_Pcode} style={{
                                  fontSize: '0.75rem', padding: '2px 8px',
                                  background: v.HardToReach19 ? '#fff3e0' : 'var(--primary-light)',
                                  borderRadius: '99px', color: 'var(--text)',
                                }}>
                                  {v.Village}{v.HardToReach19 ? ' ⚠' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
          ⚠ = Hard-to-reach village
        </p>
      </div>
    </div>
  )
}
