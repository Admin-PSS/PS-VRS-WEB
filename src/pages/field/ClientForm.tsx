import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { Navbar } from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'

function generateClientID(hwId: number): string {
  const now = new Date()
  return `${hwId}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getTime()).slice(-4)}`
}

export default function ClientForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const villages = useLiveQuery(() => db.sys_village.toArray(), [])
  const chwamws = useLiveQuery(() => db.sys_chwamw.toArray(), [])

  const [form, setForm] = useState({
    Client_Name: '',
    Client_Age: '',
    Client_StartDate: new Date().toISOString().slice(0, 10),
    Village_Pcode: '',
    HW_ID: '',
    Preg_G: '',
    Preg_P1: '',
    Preg_P2: '',
    Preg_LMP: '',
    BirthPlan_Place: '',
    Client_Remark: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const selectedVillage = villages?.find(v => v.Village_Pcode === Number(form.Village_Pcode))
  const selectedHW = chwamws?.find(h => h.HW_ID === Number(form.HW_ID))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedVillage) { setError('Please select a village'); return }
    if (!selectedHW) { setError('Please select a health worker'); return }

    setSaving(true)
    setError('')
    try {
      const hwId = Number(form.HW_ID)
      await db.clients.add({
        TS_Pcode: selectedVillage.TS_Pcode,
        RHC_Code: selectedVillage.RHC_Code,
        SRHC_Code: selectedVillage.SRHC_Code,
        Village_Pcode: selectedVillage.Village_Pcode,
        CHWAMW: selectedHW.CHWAMW,
        HW_ID: hwId,
        Client_ID: generateClientID(hwId),
        Client_StartDate: form.Client_StartDate,
        Client_Name: form.Client_Name.trim(),
        Client_Age: Number(form.Client_Age),
        Client_Village: selectedVillage.Village_Pcode,
        Preg_LMP: form.Preg_LMP || undefined,
        Preg_G: form.Preg_G ? Number(form.Preg_G) : undefined,
        Preg_P1: form.Preg_P1 ? Number(form.Preg_P1) : undefined,
        Preg_P2: form.Preg_P2 ? Number(form.Preg_P2) : undefined,
        BirthPlan_Place: form.BirthPlan_Place || undefined,
        Client_Remark: form.Client_Remark || undefined,
      })
      navigate('/field/clients')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Navbar title="New Client" showBack backTo="/field/clients" />
      <div className="page">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <p className="section-title">Client Details</p>

          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" value={form.Client_Name} onChange={e => set('Client_Name', e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age *</label>
              <input type="number" min="10" max="60" value={form.Client_Age} onChange={e => set('Client_Age', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Registration Date *</label>
              <input type="date" value={form.Client_StartDate} onChange={e => set('Client_StartDate', e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Village *</label>
            <select value={form.Village_Pcode} onChange={e => set('Village_Pcode', e.target.value)} required>
              <option value="">– Select Village –</option>
              {villages?.map(v => (
                <option key={v.Village_Pcode} value={v.Village_Pcode}>{v.Village}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Health Worker (CHW/AMW) *</label>
            <select value={form.HW_ID} onChange={e => set('HW_ID', e.target.value)} required>
              <option value="">– Select HW –</option>
              {chwamws?.map(h => (
                <option key={h.HW_ID} value={h.HW_ID}>{h.HW_Name} ({h.CHWAMW})</option>
              ))}
            </select>
          </div>

          <p className="section-title">Pregnancy Information</p>

          <div className="form-row">
            <div className="form-group">
              <label>Gravida (G)</label>
              <input type="number" min="0" value={form.Preg_G} onChange={e => set('Preg_G', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Para (P)</label>
              <input type="number" min="0" value={form.Preg_P1} onChange={e => set('Preg_P1', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>LMP Date</label>
            <input type="date" value={form.Preg_LMP} onChange={e => set('Preg_LMP', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Birth Plan Place</label>
            <input type="text" value={form.BirthPlan_Place} onChange={e => set('BirthPlan_Place', e.target.value)} placeholder="e.g. Health facility, Home" />
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <textarea value={form.Client_Remark} onChange={e => set('Client_Remark', e.target.value)} />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Client'}
          </button>
        </form>
      </div>
    </div>
  )
}
