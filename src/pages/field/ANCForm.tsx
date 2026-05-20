import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { Navbar } from '../../components/Layout'
import { useLookup } from '../../hooks/useLookup'

export default function ANCForm() {
  const navigate = useNavigate()
  const clients = useLiveQuery(() => db.clients.toArray().then(a => a.sort((x, y) => x.Client_Name.localeCompare(y.Client_Name))), [])
  const heTopics = useLookup(2)

  const [clientId, setClientId] = useState('')
  const [form, setForm] = useState({
    ANC_Date: new Date().toISOString().slice(0, 10),
    ANC_PregnancyWeek: '',
    ANC_BPS: '',
    ANC_BPD: '',
    ANC_Weight: '',
    ANC_Anemia: false,
    ANC_DangerSign: false,
    ANC_FHS: false,
    ANC_TT: '',
    ANC_IronFolate: '',
    ANC_VitaB1: '',
    ANC_CDK: false,
    ANC_Deworming: false,
    ANC_Remark: '',
    he: Array(10).fill(false) as boolean[],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }))
  const setHE = (i: number, val: boolean) => setForm(f => {
    const he = [...f.he]; he[i] = val; return { ...f, he }
  })

  const selectedClient = clients?.find(c => c.Client_ID === clientId)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedClient) { setError('Please select a client'); return }

    setSaving(true); setError('')
    try {
      const existing = await db.anc.where('Client_ID').equals(clientId).count()
      await db.anc.add({
        TS_Pcode: selectedClient.TS_Pcode,
        RHC_Code: selectedClient.RHC_Code,
        SRHC_Code: selectedClient.SRHC_Code,
        Village_Pcode: selectedClient.Village_Pcode,
        CHWAMW: selectedClient.CHWAMW,
        HW_ID: selectedClient.HW_ID,
        Client_ID: clientId,
        ANC_Sr: existing + 1,
        ANC_Date: form.ANC_Date,
        ANC_PregnancyWeek: form.ANC_PregnancyWeek ? Number(form.ANC_PregnancyWeek) : undefined,
        ANC_BPS: form.ANC_BPS ? Number(form.ANC_BPS) : undefined,
        ANC_BPD: form.ANC_BPD ? Number(form.ANC_BPD) : undefined,
        ANC_Weight: form.ANC_Weight ? Number(form.ANC_Weight) : undefined,
        ANC_Anemia: form.ANC_Anemia,
        ANC_DangerSign: form.ANC_DangerSign,
        ANC_FHS: form.ANC_FHS,
        ANC_TT: form.ANC_TT ? Number(form.ANC_TT) : undefined,
        ANC_IronFolate: form.ANC_IronFolate ? Number(form.ANC_IronFolate) : undefined,
        ANC_VitaB1: form.ANC_VitaB1 ? Number(form.ANC_VitaB1) : undefined,
        ANC_CDK: form.ANC_CDK,
        ANC_Deworming: form.ANC_Deworming,
        ANC_HE1: form.he[0], ANC_HE2: form.he[1], ANC_HE3: form.he[2],
        ANC_HE4: form.he[3], ANC_HE5: form.he[4], ANC_HE6: form.he[5],
        ANC_HE7: form.he[6], ANC_HE8: form.he[7], ANC_HE9: form.he[8],
        ANC_HE10: form.he[9],
        ANC_Remark: form.ANC_Remark || undefined,
      })
      navigate('/field')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Navbar title="ANC Visit" showBack backTo="/field" />
      <div className="page">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Client *</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)} required>
              <option value="">– Select Client –</option>
              {clients?.map(c => (
                <option key={c.Client_ID} value={c.Client_ID}>{c.Client_Name} ({c.Client_ID})</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Visit Date *</label>
              <input type="date" value={form.ANC_Date} onChange={e => set('ANC_Date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Pregnancy Week</label>
              <input type="number" min="4" max="44" value={form.ANC_PregnancyWeek} onChange={e => set('ANC_PregnancyWeek', e.target.value)} />
            </div>
          </div>

          <p className="section-title">Vital Signs</p>
          <div className="form-row">
            <div className="form-group">
              <label>BP Systolic</label>
              <input type="number" value={form.ANC_BPS} onChange={e => set('ANC_BPS', e.target.value)} placeholder="mmHg" />
            </div>
            <div className="form-group">
              <label>BP Diastolic</label>
              <input type="number" value={form.ANC_BPD} onChange={e => set('ANC_BPD', e.target.value)} placeholder="mmHg" />
            </div>
          </div>
          <div className="form-group">
            <label>Weight (kg)</label>
            <input type="number" step="0.1" value={form.ANC_Weight} onChange={e => set('ANC_Weight', e.target.value)} />
          </div>

          <p className="section-title">Findings</p>
          {[
            ['ANC_FHS', 'Foetal Heart Sound'],
            ['ANC_Anemia', 'Anaemia'],
            ['ANC_DangerSign', 'Danger Sign'],
            ['ANC_CDK', 'CDK Given'],
            ['ANC_Deworming', 'Deworming'],
          ].map(([field, label]) => (
            <label key={field} className="check-label">
              <input type="checkbox" checked={form[field as keyof typeof form] as boolean}
                onChange={e => set(field, e.target.checked)} />
              {label}
            </label>
          ))}

          <p className="section-title">Health Education</p>
          {heTopics?.map((topic, i) => (
            <label key={topic.ID} className="check-label">
              <input type="checkbox" checked={form.he[i] ?? false} onChange={e => setHE(i, e.target.checked)} />
              {topic.Description}
            </label>
          ))}

          <p className="section-title">Supplements</p>
          <div className="form-row">
            <div className="form-group">
              <label>Iron/Folate (tabs)</label>
              <input type="number" min="0" value={form.ANC_IronFolate} onChange={e => set('ANC_IronFolate', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Vita B1 (tabs)</label>
              <input type="number" min="0" value={form.ANC_VitaB1} onChange={e => set('ANC_VitaB1', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>TT Dose</label>
            <input type="number" min="0" max="5" value={form.ANC_TT} onChange={e => set('ANC_TT', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <textarea value={form.ANC_Remark} onChange={e => set('ANC_Remark', e.target.value)} />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save ANC Visit'}
          </button>
        </form>
      </div>
    </div>
  )
}
