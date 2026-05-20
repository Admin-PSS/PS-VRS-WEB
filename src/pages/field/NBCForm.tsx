import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { Navbar } from '../../components/Layout'

export default function NBCForm() {
  const navigate = useNavigate()
  const clients   = useLiveQuery(() => db.clients.toArray().then(a => a.sort((x, y) => x.Client_Name.localeCompare(y.Client_Name))), [])

  const [clientId, setClientId] = useState('')
  const [form, setForm] = useState({
    NBC_Date:              new Date().toISOString().slice(0, 10),
    NBC_Name:              '',
    ChildSr:               '1',
    NBC_Weight:            '',
    NBC_KGLB:              'KG',
    NBC_Temperature:       '',
    NBC_BirthDefect:       false,
    NBC_Warming:           false,
    NBC_CordDryClean:      false,
    NBC_CordChlorhexadine: false,
    NBC_EBF:               false,
    NBC_Jaundice:          false,
    NBC_Respiration:       false,
    NBC_Skin:              false,
    NBC_DangerSign:        false,
    NBC_Remark:            '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }))

  const selectedClient = clients?.find(c => c.Client_ID === clientId)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedClient) { setError('Please select a client'); return }

    setSaving(true); setError('')
    try {
      const existing = await db.nbc.where('Client_ID').equals(clientId).count()
      await db.nbc.add({
        TS_Pcode:      selectedClient.TS_Pcode,
        RHC_Code:      selectedClient.RHC_Code,
        SRHC_Code:     selectedClient.SRHC_Code,
        Village_Pcode: selectedClient.Village_Pcode,
        CHWAMW:        selectedClient.CHWAMW,
        HW_ID:         selectedClient.HW_ID,
        Client_ID:     clientId,
        ChildSr:       Number(form.ChildSr),
        NBC_Name:      form.NBC_Name || undefined,
        NBC_Sr:        existing + 1,
        NBC_Date:      form.NBC_Date,
        NBC_Weight:    form.NBC_Weight    ? Number(form.NBC_Weight)    : undefined,
        NBC_KGLB:      form.NBC_KGLB,
        NBC_Temperature: form.NBC_Temperature ? Number(form.NBC_Temperature) : undefined,
        NBC_BirthDefect:       form.NBC_BirthDefect,
        NBC_Warming:           form.NBC_Warming,
        NBC_CordDryClean:      form.NBC_CordDryClean,
        NBC_CordChlorhexadine: form.NBC_CordChlorhexadine,
        NBC_EBF:               form.NBC_EBF,
        NBC_Jaundice:          form.NBC_Jaundice,
        NBC_Respiration:       form.NBC_Respiration,
        NBC_Skin:              form.NBC_Skin,
        NBC_DangerSign:        form.NBC_DangerSign,
        NBC_Remark: form.NBC_Remark || undefined,
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
      <Navbar title="Newborn Care" showBack backTo="/field" />
      <div className="page">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── Client & Child ── */}
          <div className="form-group">
            <label>Mother (Client) *</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)} required>
              <option value="">– Select Client –</option>
              {clients?.map(c => (
                <option key={c.Client_ID} value={c.Client_ID}>
                  {c.Client_Name} ({c.Client_ID})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Child Name</label>
              <input type="text" value={form.NBC_Name}
                onChange={e => set('NBC_Name', e.target.value)}
                placeholder="Optional" />
            </div>
            <div className="form-group">
              <label>Child # (Sr)</label>
              <input type="number" min="1" max="5" value={form.ChildSr}
                onChange={e => set('ChildSr', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Visit Date *</label>
            <input type="date" value={form.NBC_Date}
              onChange={e => set('NBC_Date', e.target.value)} required />
          </div>

          {/* ── Measurements ── */}
          <p className="section-title">Measurements</p>

          <div className="form-row">
            <div className="form-group">
              <label>Weight</label>
              <input type="number" step="0.01" min="0.3" max="10"
                value={form.NBC_Weight}
                onChange={e => set('NBC_Weight', e.target.value)}
                placeholder="e.g. 3.20" />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select value={form.NBC_KGLB} onChange={e => set('NBC_KGLB', e.target.value)}>
                <option value="KG">KG</option>
                <option value="LB">LB</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Temperature (°C)</label>
            <input type="number" step="0.1" min="34" max="42"
              value={form.NBC_Temperature}
              onChange={e => set('NBC_Temperature', e.target.value)}
              placeholder="e.g. 37.0" />
          </div>

          {/* ── Care Provided ── */}
          <p className="section-title">Care Provided</p>

          {[
            ['NBC_Warming',           'Warming done'],
            ['NBC_CordDryClean',      'Cord — dry & clean'],
            ['NBC_CordChlorhexadine', 'Cord chlorhexidine applied'],
            ['NBC_EBF',               'Exclusive breastfeeding (EBF)'],
          ].map(([field, label]) => (
            <label key={field} className="check-label">
              <input type="checkbox"
                checked={form[field as keyof typeof form] as boolean}
                onChange={e => set(field, e.target.checked)} />
              {label}
            </label>
          ))}

          {/* ── Findings ── */}
          <p className="section-title">Findings</p>

          {[
            ['NBC_BirthDefect', 'Birth defect present'],
            ['NBC_Jaundice',    'Jaundice'],
            ['NBC_Respiration', 'Abnormal respiration'],
            ['NBC_Skin',        'Skin problem'],
            ['NBC_DangerSign',  'Danger sign present'],
          ].map(([field, label]) => (
            <label key={field} className="check-label">
              <input type="checkbox"
                checked={form[field as keyof typeof form] as boolean}
                onChange={e => set(field, e.target.checked)} />
              {label}
            </label>
          ))}

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Remarks</label>
            <textarea value={form.NBC_Remark}
              onChange={e => set('NBC_Remark', e.target.value)} />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Newborn Care'}
          </button>
        </form>
      </div>
    </div>
  )
}
