import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { Navbar } from '../../components/Layout'
import { useLookup } from '../../hooks/useLookup'

export default function DeliveryForm() {
  const navigate = useNavigate()
  const clients = useLiveQuery(() => db.clients.toArray().then(a => a.sort((x, y) => x.Client_Name.localeCompare(y.Client_Name))), [])

  // Lookups
  const deliveryHow   = useLookup(1)   // Pregnancy Outcome / delivery type
  const deliveredBy   = useLookup(3)   // Attendant
  const motherOutcome = useLookup(5)
  const childOutcome  = useLookup(6)
  const motherBleeding = useLookup(7)
  const childBF       = useLookup(8)
  const childResp     = useLookup(9)
  const sex           = useLookup(10)
  const birthPlace    = useLookup(17)

  const [clientId, setClientId] = useState('')
  const [form, setForm] = useState({
    Delivery_Date: new Date().toISOString().slice(0, 10),
    Delivery_Time: '',
    Delivery_Place: '',
    Delivery_By: '',
    Delivery_How: '',
    Delivery_MotherOutcome: '',
    Delivery_MotherBleeding: '',
    Delivery_CDK: false,
    Delivery_ChildOutcome: '',
    Delivery_ChildWeight: '',
    Delivery_ChildSex: '',
    Delivery_ChildBF: '',
    Delivery_ChildBF1Hour: false,
    Delivery_ChildRespiration: '',
    Delivery_Remark: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }))

  const selectedClient = clients?.find(c => c.Client_ID === clientId)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedClient) { setError('Please select a client'); return }

    setSaving(true); setError('')
    try {
      const existing = await db.delivery.where('Client_ID').equals(clientId).count()
      await db.delivery.add({
        TS_Pcode:      selectedClient.TS_Pcode,
        RHC_Code:      selectedClient.RHC_Code,
        SRHC_Code:     selectedClient.SRHC_Code,
        Village_Pcode: selectedClient.Village_Pcode,
        CHWAMW:        selectedClient.CHWAMW,
        HW_ID:         selectedClient.HW_ID,
        Client_ID:     clientId,
        Delivery_Date: form.Delivery_Date,
        Delivery_Time: form.Delivery_Time || undefined,
        Delivery_Place:          form.Delivery_Place    ? Number(form.Delivery_Place)    : undefined,
        Delivery_By:             form.Delivery_By       ? Number(form.Delivery_By)       : undefined,
        Delivery_How:            form.Delivery_How      ? Number(form.Delivery_How)      : undefined,
        Delivery_MotherOutcome:  form.Delivery_MotherOutcome  ? Number(form.Delivery_MotherOutcome)  : undefined,
        Delivery_MotherBleeding: form.Delivery_MotherBleeding ? Number(form.Delivery_MotherBleeding) : undefined,
        Delivery_CDK:            form.Delivery_CDK,
        ChildSr:                 existing + 1,
        Delivery_ChildOutcome:   form.Delivery_ChildOutcome   ? Number(form.Delivery_ChildOutcome)   : undefined,
        Delivery_ChildWeight:    form.Delivery_ChildWeight    ? Number(form.Delivery_ChildWeight)    : undefined,
        Delivery_ChildSex:       form.Delivery_ChildSex       ? Number(form.Delivery_ChildSex)       : undefined,
        Delivery_ChildBF:        form.Delivery_ChildBF        ? Number(form.Delivery_ChildBF)        : undefined,
        Delivery_ChildBF1Hour:   form.Delivery_ChildBF1Hour,
        Delivery_ChildRespiration: form.Delivery_ChildRespiration ? Number(form.Delivery_ChildRespiration) : undefined,
        Delivery_Remark: form.Delivery_Remark || undefined,
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
      <Navbar title="Delivery" showBack backTo="/field" />
      <div className="page">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── Client ── */}
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

          {/* ── Date & Time ── */}
          <div className="form-row">
            <div className="form-group">
              <label>Delivery Date *</label>
              <input type="date" value={form.Delivery_Date}
                onChange={e => set('Delivery_Date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" value={form.Delivery_Time}
                onChange={e => set('Delivery_Time', e.target.value)} />
            </div>
          </div>

          {/* ── Delivery details ── */}
          <p className="section-title">Delivery Details</p>

          <div className="form-row">
            <div className="form-group">
              <label>Birth Place</label>
              <select value={form.Delivery_Place} onChange={e => set('Delivery_Place', e.target.value)}>
                <option value="">–</option>
                {birthPlace?.map(o => <option key={o.ID} value={o.ID}>{o.Description}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Delivered By</label>
              <select value={form.Delivery_By} onChange={e => set('Delivery_By', e.target.value)}>
                <option value="">–</option>
                {deliveredBy?.map(o => <option key={o.ID} value={o.ID}>{o.Description}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Delivery Type</label>
            <select value={form.Delivery_How} onChange={e => set('Delivery_How', e.target.value)}>
              <option value="">–</option>
              {deliveryHow?.map(o => <option key={o.ID} value={o.ID}>{o.Description}</option>)}
            </select>
          </div>

          {/* ── Mother ── */}
          <p className="section-title">Mother</p>

          <div className="form-row">
            <div className="form-group">
              <label>Mother Outcome</label>
              <select value={form.Delivery_MotherOutcome} onChange={e => set('Delivery_MotherOutcome', e.target.value)}>
                <option value="">–</option>
                {motherOutcome?.map(o => <option key={o.ID} value={o.ID}>{o.Description}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Bleeding</label>
              <select value={form.Delivery_MotherBleeding} onChange={e => set('Delivery_MotherBleeding', e.target.value)}>
                <option value="">–</option>
                {motherBleeding?.map(o => <option key={o.ID} value={o.ID}>{o.Description}</option>)}
              </select>
            </div>
          </div>

          <label className="check-label">
            <input type="checkbox" checked={form.Delivery_CDK}
              onChange={e => set('Delivery_CDK', e.target.checked)} />
            CDK Used
          </label>

          {/* ── Child ── */}
          <p className="section-title">Child</p>

          <div className="form-row">
            <div className="form-group">
              <label>Child Outcome</label>
              <select value={form.Delivery_ChildOutcome} onChange={e => set('Delivery_ChildOutcome', e.target.value)}>
                <option value="">–</option>
                {childOutcome?.map(o => <option key={o.ID} value={o.ID}>{o.Description}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Sex</label>
              <select value={form.Delivery_ChildSex} onChange={e => set('Delivery_ChildSex', e.target.value)}>
                <option value="">–</option>
                {sex?.map(o => <option key={o.ID} value={o.ID}>{o.Description}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Birth Weight (kg)</label>
            <input type="number" step="0.01" min="0.5" max="6"
              value={form.Delivery_ChildWeight}
              onChange={e => set('Delivery_ChildWeight', e.target.value)}
              placeholder="e.g. 3.20" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Breastfeeding</label>
              <select value={form.Delivery_ChildBF} onChange={e => set('Delivery_ChildBF', e.target.value)}>
                <option value="">–</option>
                {childBF?.map(o => <option key={o.ID} value={o.ID}>{o.Description}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Respiration</label>
              <select value={form.Delivery_ChildRespiration} onChange={e => set('Delivery_ChildRespiration', e.target.value)}>
                <option value="">–</option>
                {childResp?.map(o => <option key={o.ID} value={o.ID}>{o.Description}</option>)}
              </select>
            </div>
          </div>

          <label className="check-label">
            <input type="checkbox" checked={form.Delivery_ChildBF1Hour}
              onChange={e => set('Delivery_ChildBF1Hour', e.target.checked)} />
            Breastfed within 1 hour
          </label>

          {/* ── Remarks ── */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Remarks</label>
            <textarea value={form.Delivery_Remark}
              onChange={e => set('Delivery_Remark', e.target.value)} />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Delivery'}
          </button>
        </form>
      </div>
    </div>
  )
}
