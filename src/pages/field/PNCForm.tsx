import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { Navbar } from '../../components/Layout'
import { useLookup } from '../../hooks/useLookup'

export default function PNCForm() {
  const navigate = useNavigate()
  const clients  = useLiveQuery(() => db.clients.toArray().then(a => a.sort((x, y) => x.Client_Name.localeCompare(y.Client_Name))), [])
  const heTopics = useLookup(2)

  const [clientId, setClientId] = useState('')
  const [form, setForm] = useState({
    PNC_Date:        new Date().toISOString().slice(0, 10),
    PNC_Temperature: '',
    PNC_BPS:         '',
    PNC_BPD:         '',
    PNC_Anemia:      false,
    PNC_IronFolate:  false,
    PNC_VitaB1:      '',
    PNC_VitaA:       false,
    PNC_Remark:      '',
    he: Array(10).fill(false) as boolean[],
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set    = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }))
  const setHE  = (i: number, val: boolean) => setForm(f => { const he = [...f.he]; he[i] = val; return { ...f, he } })

  const selectedClient = clients?.find(c => c.Client_ID === clientId)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedClient) { setError('Please select a client'); return }

    setSaving(true); setError('')
    try {
      const existing = await db.pnc.where('Client_ID').equals(clientId).count()
      await db.pnc.add({
        TS_Pcode:      selectedClient.TS_Pcode,
        RHC_Code:      selectedClient.RHC_Code,
        SRHC_Code:     selectedClient.SRHC_Code,
        Village_Pcode: selectedClient.Village_Pcode,
        CHWAMW:        selectedClient.CHWAMW,
        HW_ID:         selectedClient.HW_ID,
        Client_ID:     clientId,
        PNC_Sr:        existing + 1,
        PNC_Date:      form.PNC_Date,
        PNC_Temperature: form.PNC_Temperature ? Number(form.PNC_Temperature) : undefined,
        PNC_BPS:         form.PNC_BPS         ? Number(form.PNC_BPS)         : undefined,
        PNC_BPD:         form.PNC_BPD         ? Number(form.PNC_BPD)         : undefined,
        PNC_Anemia:     form.PNC_Anemia,
        PNC_IronFolate: form.PNC_IronFolate,
        PNC_VitaB1:     form.PNC_VitaB1 ? Number(form.PNC_VitaB1) : undefined,
        PNC_VitaA:      form.PNC_VitaA,
        PNC_HE1:  form.he[0], PNC_HE2:  form.he[1], PNC_HE3:  form.he[2],
        PNC_HE4:  form.he[3], PNC_HE5:  form.he[4], PNC_HE6:  form.he[5],
        PNC_HE7:  form.he[6], PNC_HE8:  form.he[7], PNC_HE9:  form.he[8],
        PNC_HE10: form.he[9],
        PNC_Remark: form.PNC_Remark || undefined,
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
      <Navbar title="PNC Visit" showBack backTo="/field" />
      <div className="page">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Client *</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)} required>
              <option value="">– Select Client –</option>
              {clients?.map(c => (
                <option key={c.Client_ID} value={c.Client_ID}>
                  {c.Client_Name} ({c.Client_ID})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Visit Date *</label>
            <input type="date" value={form.PNC_Date}
              onChange={e => set('PNC_Date', e.target.value)} required />
          </div>

          {/* ── Vital Signs ── */}
          <p className="section-title">Vital Signs</p>

          <div className="form-row">
            <div className="form-group">
              <label>BP Systolic</label>
              <input type="number" value={form.PNC_BPS}
                onChange={e => set('PNC_BPS', e.target.value)} placeholder="mmHg" />
            </div>
            <div className="form-group">
              <label>BP Diastolic</label>
              <input type="number" value={form.PNC_BPD}
                onChange={e => set('PNC_BPD', e.target.value)} placeholder="mmHg" />
            </div>
          </div>

          <div className="form-group">
            <label>Temperature (°C)</label>
            <input type="number" step="0.1" min="34" max="42"
              value={form.PNC_Temperature}
              onChange={e => set('PNC_Temperature', e.target.value)}
              placeholder="e.g. 37.0" />
          </div>

          {/* ── Findings & Supplements ── */}
          <p className="section-title">Findings &amp; Supplements</p>

          {[
            ['PNC_Anemia',     'Anaemia'],
            ['PNC_IronFolate', 'Iron/Folate given'],
            ['PNC_VitaA',      'Vitamin A given'],
          ].map(([field, label]) => (
            <label key={field} className="check-label">
              <input type="checkbox"
                checked={form[field as keyof typeof form] as boolean}
                onChange={e => set(field, e.target.checked)} />
              {label}
            </label>
          ))}

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Vitamin B1 (tabs)</label>
            <input type="number" min="0" value={form.PNC_VitaB1}
              onChange={e => set('PNC_VitaB1', e.target.value)} />
          </div>

          {/* ── Health Education ── */}
          <p className="section-title">Health Education</p>
          {heTopics?.map((topic, i) => (
            <label key={topic.ID} className="check-label">
              <input type="checkbox" checked={form.he[i] ?? false}
                onChange={e => setHE(i, e.target.checked)} />
              {topic.Description}
            </label>
          ))}

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Remarks</label>
            <textarea value={form.PNC_Remark}
              onChange={e => set('PNC_Remark', e.target.value)} />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save PNC Visit'}
          </button>
        </form>
      </div>
    </div>
  )
}
