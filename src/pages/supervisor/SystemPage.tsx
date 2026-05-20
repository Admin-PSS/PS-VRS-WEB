import { useLiveQuery } from 'dexie-react-hooks'
import { db, resetDatabase } from '../../data/db'
import { Navbar } from '../../components/Layout'
import { useAuth, LEVEL_ADMIN, LEVEL_DBADMIN } from '../../context/AuthContext'

const LEVELS: Record<number, string> = { 1: 'System Admin', 2: 'Read Only', 3: 'Read/Write', 4: 'Edit', 5: 'DB Admin' }

export default function SystemPage() {
  const { user } = useAuth()
  const isAdmin = user?.level === LEVEL_ADMIN || user?.level === LEVEL_DBADMIN

  const stats = useLiveQuery(async () => ({
    townships: await db.sys_township.count(),
    rhcs:      await db.sys_rhc.count(),
    srhcs:     await db.sys_srhc.count(),
    villages:  await db.sys_village.count(),
    hws:       await db.sys_chwamw.count(),
    clients:   await db.clients.count(),
    anc:       await db.anc.count(),
    delivery:  await db.delivery.count(),
    pnc:       await db.pnc.count(),
    nbc:       await db.nbc.count(),
    referral:  await db.referral.count(),
    vhw:       await db.vhwRegister.count(),
  }), [])

  const users = useLiveQuery(() => db.sys_user.toArray(), [])

  const handleReset = () => {
    if (window.confirm('Delete ALL local data and re-seed from CSV?')) resetDatabase()
  }

  return (
    <div>
      <Navbar title="System" showBack backTo="/supervisor" />
      <div className="page">

        {/* Reference data */}
        <div className="card" style={{ marginBottom: '12px' }}>
          <p className="section-title" style={{ marginTop: 0 }}>Reference Data</p>
          {[
            ['Townships',     stats?.townships],
            ['RHCs',          stats?.rhcs],
            ['Sub-RHCs',      stats?.srhcs],
            ['Villages',      stats?.villages],
            ['Health Workers',stats?.hws],
          ].map(([label, val]) => (
            <div key={label as string} style={rowStyle}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label as string}</span>
              <span style={{ fontWeight: 600 }}>{val ?? '…'}</span>
            </div>
          ))}
        </div>

        {/* Clinical records */}
        <div className="card" style={{ marginBottom: '12px' }}>
          <p className="section-title" style={{ marginTop: 0 }}>Clinical Records</p>
          {[
            ['Clients',        stats?.clients],
            ['ANC Visits',     stats?.anc],
            ['Deliveries',     stats?.delivery],
            ['PNC Visits',     stats?.pnc],
            ['NBC Contacts',   stats?.nbc],
            ['Referrals',      stats?.referral],
            ['VHW Register',   stats?.vhw],
          ].map(([label, val]) => (
            <div key={label as string} style={rowStyle}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label as string}</span>
              <span style={{ fontWeight: 600 }}>{val ?? '…'}</span>
            </div>
          ))}
        </div>

        {/* Users */}
        {isAdmin && (
          <div className="card" style={{ marginBottom: '12px' }}>
            <p className="section-title" style={{ marginTop: 0 }}>Users</p>
            {users?.map(u => (
              <div key={u.UserName} style={rowStyle}>
                <span style={{ fontSize: '0.875rem' }}>{u.UserName}</span>
                <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                  {LEVELS[u.UserLevel] ?? `Level ${u.UserLevel}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Danger zone */}
        {isAdmin && (
          <div className="card" style={{ borderColor: '#c62828' }}>
            <p className="section-title" style={{ marginTop: 0, color: '#c62828' }}>Danger Zone</p>
            <button
              className="btn"
              style={{ background: '#c62828', color: '#fff', fontSize: '0.85rem' }}
              onClick={handleReset}
            >
              Reset Local Database
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Deletes all local data and re-seeds reference tables from CSV.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const rowStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '7px 0', borderBottom: '1px solid var(--border)',
}
