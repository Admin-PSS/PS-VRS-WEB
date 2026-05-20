import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { Navbar } from '../../components/Layout'
import { useLookup } from '../../hooks/useLookup'

const now = new Date()

function CheckRow({ label, field, form, set }: {
  label: string
  field: string
  form: Record<string, unknown>
  set: (f: string, v: boolean) => void
}) {
  return (
    <label className="check-label">
      <input type="checkbox"
        checked={form[field] as boolean}
        onChange={e => set(field, e.target.checked)} />
      {label}
    </label>
  )
}

function DrugField({ label, field, form, set }: {
  label: string
  field: string
  form: Record<string, unknown>
  set: (f: string, v: string) => void
}) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input type="number" step="0.5" min="0"
        value={form[field] as string}
        onChange={e => set(field, e.target.value)}
        placeholder="0" />
    </div>
  )
}

type FormState = Record<string, string | boolean>

export default function VHWForm() {
  const navigate  = useNavigate()
  const chwamws   = useLiveQuery(() => db.sys_chwamw.toArray(), [])
  const villages  = useLiveQuery(() => db.sys_village.toArray(), [])
  const sexOpts   = useLookup(10)
  const typeOpts  = useLookup(16)

  const [form, setForm] = useState<FormState>({
    HW_ID:          '',
    Report_Month:   String(now.getMonth() + 1),
    Report_Year:    String(now.getFullYear()),
    RegisterDate:   now.toISOString().slice(0, 10),
    Patient_Name:   '',
    Patient_Sex:    '',
    Patient_AgeInYear: '',
    Village_Pcode:  '',
    Patient_Type:   '',

    // Danger signs
    Find_NotDrinkEat: false, Find_Vomit:    false, Find_Fit:       false,
    Find_NotWakeUp:   false, Find_FastBreath: false, Find_Chest:   false,
    Find_Stridor:     false, Find_Blood:     false, Find_Restless: false,
    Find_SunkenEye:   false, Find_Thirsty:   false, Find_SkinVery: false,
    Find_SkinSlow:    false, Find_Fever:     false, Find_Other:    '',

    // Case classification
    Case_VerySeverePneumonia: false, Case_SeverePneumonia: false,
    Case_Pneumonia:     false, Case_Cough:        false,
    Case_DiarrWith:     false, Case_DiarrNoWith:  false, Case_Dysentry: false,
    Case_CoughThan21:   false, Case_CoughNotThan21: false,
    Case_DiarrThan14:   false, Case_DiarrNotThan14: false,
    Other_Case:         '',

    // Treatments
    Treat_ORS:          '', Treat_Zinc:          '',
    Treat_ParaSyr:      '', Treat_ParaTab250:    '',
    Treat_ParaTab500:   '', Treat_Amoxil:        '',
    Treat_Cotrimoxazole: '', Treat_OtherDrug:    '',

    ReferredYN: false, ArrivedYN: false,
    Remark: '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const setF  = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }))
  const setStr = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const selectedHW = chwamws?.find(h => h.HW_ID === Number(form.HW_ID))
  const selectedVillage = villages?.find(v => v.Village_Pcode === Number(form.Village_Pcode))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedHW) { setError('Please select a health worker'); return }

    setSaving(true); setError('')
    try {
      const month = Number(form.Report_Month)
      const year  = Number(form.Report_Year)
      const existing = await db.vhwRegister
        .where('[TS_Pcode+RHC_Code+HW_ID]')
        .equals([selectedHW.TS_Pcode, selectedHW.RHC_Code, selectedHW.HW_ID])
        .count()

      const num = (f: string) => form[f] ? Number(form[f]) : undefined

      await db.vhwRegister.add({
        TS_Pcode:      selectedHW.TS_Pcode,
        RHC_Code:      selectedHW.RHC_Code,
        SRHC_Code:     selectedHW.SRHC_Code,
        Village_Pcode: selectedVillage?.Village_Pcode ?? selectedHW.Village_Pcode,
        CHWAMW:        selectedHW.CHWAMW,
        HW_ID:         selectedHW.HW_ID,
        Report_Month:  month,
        Report_Year:   year,
        SrNo:          existing + 1,
        RegisterDate:  form.RegisterDate as string,
        Patient_Name:  (form.Patient_Name as string).trim(),
        Patient_Sex:   Number(form.Patient_Sex) || 0,
        Patient_AgeInYear: Number(form.Patient_AgeInYear) || 0,
        Patient_Village: selectedVillage?.Village ?? (form.Village_Pcode as string),
        Patient_Type:  num('Patient_Type'),

        Find_NotDrinkEat: form.Find_NotDrinkEat as boolean,
        Find_Vomit:       form.Find_Vomit       as boolean,
        Find_Fit:         form.Find_Fit          as boolean,
        Find_NotWakeUp:   form.Find_NotWakeUp    as boolean,
        Find_FastBreath:  form.Find_FastBreath   as boolean,
        Find_Chest:       form.Find_Chest        as boolean,
        Find_Stridor:     form.Find_Stridor      as boolean,
        Find_Blood:       form.Find_Blood        as boolean,
        Find_Restless:    form.Find_Restless     as boolean,
        Find_SunkenEye:   form.Find_SunkenEye    as boolean,
        Find_Thirsty:     form.Find_Thirsty      as boolean,
        Find_SkinVery:    form.Find_SkinVery     as boolean,
        Find_SkinSlow:    form.Find_SkinSlow     as boolean,
        Find_Fever:       form.Find_Fever        as boolean,
        Find_Other:       (form.Find_Other as string) || undefined,

        Case_VerySeverePneumonia: form.Case_VerySeverePneumonia as boolean,
        Case_SeverePneumonia:     form.Case_SeverePneumonia     as boolean,
        Case_Pneumonia:           form.Case_Pneumonia           as boolean,
        Case_Cough:               form.Case_Cough               as boolean,
        Case_DiarrWith:           form.Case_DiarrWith           as boolean,
        Case_DiarrNoWith:         form.Case_DiarrNoWith         as boolean,
        Case_Dysentry:            form.Case_Dysentry            as boolean,
        Case_CoughThan21:         form.Case_CoughThan21         as boolean,
        Case_CoughNotThan21:      form.Case_CoughNotThan21      as boolean,
        Case_DiarrThan14:         form.Case_DiarrThan14         as boolean,
        Case_DiarrNotThan14:      form.Case_DiarrNotThan14      as boolean,
        Other_Case: (form.Other_Case as string) || undefined,

        Treat_ORS:           num('Treat_ORS'),
        Treat_Zinc:          num('Treat_Zinc'),
        Treat_ParaSyr:       num('Treat_ParaSyr'),
        Treat_ParaTab250:    num('Treat_ParaTab250'),
        Treat_ParaTab500:    num('Treat_ParaTab500'),
        Treat_Amoxil:        num('Treat_Amoxil'),
        Treat_Cotrimoxazole: num('Treat_Cotrimoxazole'),
        Treat_OtherDrug: (form.Treat_OtherDrug as string) || undefined,

        ReferredYN: form.ReferredYN as boolean,
        ArrivedYN:  form.ArrivedYN  as boolean,
        Remark:     (form.Remark as string) || undefined,
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
      <Navbar title="Patient Register" showBack backTo="/field" />
      <div className="page">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── Report Period ── */}
          <p className="section-title">Report Period</p>
          <div className="form-row">
            <div className="form-group">
              <label>Month *</label>
              <select value={form.Report_Month as string} onChange={e => setStr('Report_Month', e.target.value)} required>
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                  <option key={i+1} value={i+1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Year *</label>
              <input type="number" min="2019" max="2030"
                value={form.Report_Year as string}
                onChange={e => setStr('Report_Year', e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Health Worker *</label>
            <select value={form.HW_ID as string} onChange={e => setStr('HW_ID', e.target.value)} required>
              <option value="">– Select CHW/AMW –</option>
              {chwamws?.map(h => (
                <option key={h.HW_ID} value={h.HW_ID}>{h.HW_Name} ({h.CHWAMW})</option>
              ))}
            </select>
          </div>

          {/* ── Patient ── */}
          <p className="section-title">Patient</p>

          <div className="form-group">
            <label>Register Date *</label>
            <input type="date" value={form.RegisterDate as string}
              onChange={e => setStr('RegisterDate', e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Patient Name *</label>
            <input type="text" value={form.Patient_Name as string}
              onChange={e => setStr('Patient_Name', e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sex</label>
              <select value={form.Patient_Sex as string} onChange={e => setStr('Patient_Sex', e.target.value)}>
                <option value="">–</option>
                {sexOpts?.map(o => <option key={o.ID} value={o.ID}>{o.Description}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Age (years)</label>
              <input type="number" min="0" max="120"
                value={form.Patient_AgeInYear as string}
                onChange={e => setStr('Patient_AgeInYear', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Village</label>
              <select value={form.Village_Pcode as string} onChange={e => setStr('Village_Pcode', e.target.value)}>
                <option value="">–</option>
                {villages?.map(v => <option key={v.Village_Pcode} value={v.Village_Pcode}>{v.Village}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Patient Type</label>
              <select value={form.Patient_Type as string} onChange={e => setStr('Patient_Type', e.target.value)}>
                <option value="">–</option>
                {typeOpts?.map(o => <option key={o.ID} value={o.ID}>{o.Description}</option>)}
              </select>
            </div>
          </div>

          {/* ── Danger Signs ── */}
          <p className="section-title">Danger Signs</p>
          {([
            ['Find_NotDrinkEat', 'Unable to drink/eat'],
            ['Find_Vomit',       'Vomiting everything'],
            ['Find_Fit',         'Convulsions / fits'],
            ['Find_NotWakeUp',   'Unable to wake up / unconscious'],
            ['Find_FastBreath',  'Fast breathing'],
            ['Find_Chest',       'Chest in-drawing'],
            ['Find_Stridor',     'Stridor'],
            ['Find_Blood',       'Blood in stool'],
            ['Find_Restless',    'Restless / irritable'],
            ['Find_SunkenEye',   'Sunken eyes'],
            ['Find_Thirsty',     'Drinking thirstily'],
            ['Find_SkinVery',    'Skin pinch: goes back very slowly'],
            ['Find_SkinSlow',    'Skin pinch: goes back slowly'],
            ['Find_Fever',       'Fever'],
          ] as [string, string][]).map(([field, label]) => (
            <CheckRow key={field} field={field} label={label} form={form} set={setF} />
          ))}
          <div className="form-group" style={{ marginTop: '8px' }}>
            <label>Other finding</label>
            <input type="text" value={form.Find_Other as string}
              onChange={e => setStr('Find_Other', e.target.value)} />
          </div>

          {/* ── Case Classification ── */}
          <p className="section-title">Case Classification</p>
          {([
            ['Case_VerySeverePneumonia', 'Very severe pneumonia'],
            ['Case_SeverePneumonia',     'Severe pneumonia'],
            ['Case_Pneumonia',           'Pneumonia'],
            ['Case_Cough',               'Cough / cold (no pneumonia)'],
            ['Case_DiarrWith',           'Diarrhoea with dehydration'],
            ['Case_DiarrNoWith',         'Diarrhoea without dehydration'],
            ['Case_Dysentry',            'Dysentery'],
            ['Case_CoughThan21',         'Persistent cough ≥ 21 days'],
            ['Case_CoughNotThan21',      'Persistent cough < 21 days'],
            ['Case_DiarrThan14',         'Persistent diarrhoea ≥ 14 days'],
            ['Case_DiarrNotThan14',      'Persistent diarrhoea < 14 days'],
          ] as [string, string][]).map(([field, label]) => (
            <CheckRow key={field} field={field} label={label} form={form} set={setF} />
          ))}
          <div className="form-group" style={{ marginTop: '8px' }}>
            <label>Other case</label>
            <input type="text" value={form.Other_Case as string}
              onChange={e => setStr('Other_Case', e.target.value)} />
          </div>

          {/* ── Treatment ── */}
          <p className="section-title">Treatment Dispensed</p>
          <div className="form-row">
            <DrugField label="ORS (sachets)"       field="Treat_ORS"           form={form} set={setStr} />
            <DrugField label="Zinc (tabs)"         field="Treat_Zinc"          form={form} set={setStr} />
          </div>
          <div className="form-row">
            <DrugField label="Paracetamol syrup"   field="Treat_ParaSyr"       form={form} set={setStr} />
            <DrugField label="Paracetamol 250mg"   field="Treat_ParaTab250"    form={form} set={setStr} />
          </div>
          <div className="form-row">
            <DrugField label="Paracetamol 500mg"   field="Treat_ParaTab500"    form={form} set={setStr} />
            <DrugField label="Amoxicillin (tabs)"  field="Treat_Amoxil"        form={form} set={setStr} />
          </div>
          <div className="form-row">
            <DrugField label="Cotrimoxazole (tabs)" field="Treat_Cotrimoxazole" form={form} set={setStr} />
            <div className="form-group">
              <label>Other drug</label>
              <input type="text" value={form.Treat_OtherDrug as string}
                onChange={e => setStr('Treat_OtherDrug', e.target.value)} />
            </div>
          </div>

          {/* ── Referral ── */}
          <p className="section-title">Referral</p>
          <label className="check-label">
            <input type="checkbox" checked={form.ReferredYN as boolean}
              onChange={e => setF('ReferredYN', e.target.checked)} />
            Patient referred
          </label>
          <label className="check-label" style={{ marginBottom: '16px' }}>
            <input type="checkbox" checked={form.ArrivedYN as boolean}
              onChange={e => setF('ArrivedYN', e.target.checked)} />
            Patient arrived at referral site
          </label>

          <div className="form-group">
            <label>Remarks</label>
            <textarea value={form.Remark as string}
              onChange={e => setStr('Remark', e.target.value)} />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Patient Record'}
          </button>
        </form>
      </div>
    </div>
  )
}
