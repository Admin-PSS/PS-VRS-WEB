import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { Navbar } from '../../components/Layout'
import { useLookup } from '../../hooks/useLookup'

export default function ReferralForm() {
  const navigate = useNavigate()
  const clients = useLiveQuery(() => db.clients.toArray().then(a => a.sort((x, y) => x.Client_Name.localeCompare(y.Client_Name))), [])
  const refPerson = useLookup(13)  // Mother / Child / Both
  const refSite   = useLookup(12)  // Destination hospitals

  const [clientId, setClientId] = useState('')
  const [form, setForm] = useState({
    Ref_Date:            new Date().toISOString().slice(0, 10),
    Ref_MorC:            '',
    Ref_DestinationSite: '',
    Ref_Reason:          '',
    Ref_Completeness:    false,
    Ref_Outcome:         '',
    Ref_Remark:          '',
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
      await db.referral.add({
        TS_Pcode:      selectedClient.TS_Pcode,
        RHC_Code:      selectedClient.RHC_Code,
        SRHC_Code:     selectedClient.SRHC_Code,
        Village_Pcode: selectedClient.Village_Pcode,
        CHWAMW:        selectedClient.CHWAMW,
        HW_ID:         selectedClient.HW_ID,
        Client_ID:     clientId,
        Ref_Date:      form.Ref_Date,
        Ref_MorC:            form.Ref_MorC            ? Number(form.Ref_MorC)            : undefined,
        Ref_DestinationSite: form.Ref_DestinationSite ? Number(form.Ref_DestinationSite) : undefined,
        Ref_Reason:       form.Ref_Reason    || undefined,
        Ref_Completeness: form.Ref_Completeness,
        Ref_Outcome:      form.Ref_Outcome   || undefined,
        Ref_Remark:       form.Ref_Remark    || undefined,
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
      <Navbar title="Referral" showBack backTo="/field" />
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

          <div className="form-row">
            <div className="form-group">
              <label>Referral Date *</label>
              <input type="date" value={form.Ref_Date}
                onChange={e => set('Ref_Date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Referred Person</label>
              <select value={form.Ref_MorC} onChange={e => set('Ref_MorC', e.target.value)}>
                <option value="">–</option>
                {refPerson?.map(o => <option key={o.ID} value={o.ID}>{o.Description}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Destination Site</label>
            <select value={form.Ref_DestinationSite} onChange={e => set('Ref_DestinationSite', e.target.value)}>
              <option value="">–</option>
              {refSite?.map(o => <option key={o.ID} value={o.ID}>{o.Description}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Reason for Referral</label>
            <textarea value={form.Ref_Reason}
              onChange={e => set('Ref_Reason', e.target.value)}
              placeholder="Describe reason…" />
          </div>

          <label className="check-label" style={{ marginBottom: '16px' }}>
            <input type="checkbox" checked={form.Ref_Completeness}
              onChange={e => set('Ref_Completeness', e.target.checked)} />
            Referral completed (patient reached destination)
          </label>

          <div className="form-group">
            <label>Outcome</label>
            <textarea value={form.Ref_Outcome}
              onChange={e => set('Ref_Outcome', e.target.value)}
              placeholder="Outcome after referral…" />
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <textarea value={form.Ref_Remark}
              onChange={e => set('Ref_Remark', e.target.value)} />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Referral'}
          </button>
        </form>
      </div>
    </div>
  )
}
