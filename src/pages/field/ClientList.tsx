import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../../data/db'
import { Navbar } from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { canWrite } from '../../context/AuthContext'

export default function ClientList() {
  const { user } = useAuth()
  const clients = useLiveQuery(
    () => db.clients.orderBy('Client_StartDate').reverse().limit(100).toArray(),
    []
  )

  return (
    <div>
      <Navbar title="Client Register" showBack backTo="/field" />
      <div className="page">
        {canWrite(user?.level ?? 0) && (
          <div style={{ marginBottom: '16px' }}>
            <Link to="/field/clients/new" className="btn btn-primary btn-full">
              + New Client
            </Link>
          </div>
        )}

        {clients === undefined && <div className="spinner">Loading…</div>}

        {clients?.length === 0 && (
          <div className="alert alert-info">No clients registered yet.</div>
        )}

        {clients && clients.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {clients.map(c => (
              <div key={c.AutoSr} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.Client_Name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ID: {c.Client_ID} · Age: {c.Client_Age}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Reg: {c.Client_StartDate}
                  </div>
                </div>
                <span className="badge badge-blue">G{c.Preg_G}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
