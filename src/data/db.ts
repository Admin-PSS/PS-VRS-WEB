import Dexie, { type EntityTable } from 'dexie'

// ── Clinical types ──────────────────────────────────────────────────────────

export interface Client {
  AutoSr?: number
  TS_Pcode: string
  RHC_Code: number
  SRHC_Code: number
  Village_Pcode: number
  CHWAMW: string
  HW_ID: number
  Client_ID: string
  Client_StartDate: string
  Client_Name: string
  Client_Age: number
  Client_Village: number
  Preg_LMP?: string
  Preg_EDD?: string
  Preg_G?: number
  Preg_P1?: number
  Preg_P2?: number
  Preg_History?: string
  PastPreg_BOH_YN?: boolean
  PastPreg_DeliveredBy?: number
  PastPreg_Note?: string
  BirthPlan_Place?: string
  BirthPlan_Attendant?: number
  BirthPlan_Note?: string
  Client_Remark?: string
}

export interface ANC {
  AutoSr?: number
  TS_Pcode: string
  RHC_Code: number
  SRHC_Code: number
  Village_Pcode: number
  CHWAMW: string
  HW_ID: number
  Client_ID: string
  ANC_Sr: number
  ANC_Date: string
  ANC_Provider?: number
  ANC_PregnancyWeek?: number
  ANC_Presentation?: string
  ANC_FHS?: boolean
  ANC_BPS?: number
  ANC_BPD?: number
  ANC_Weight?: number
  ANC_AbdominalExam?: string
  ANC_Anemia?: boolean
  ANC_DangerSign?: boolean
  ANC_TT?: number
  ANC_IronFolate?: number
  ANC_VitaB1?: number
  ANC_CDK?: boolean
  ANC_Deworming?: boolean
  ANC_HE1?: boolean; ANC_HE2?: boolean; ANC_HE3?: boolean; ANC_HE4?: boolean
  ANC_HE5?: boolean; ANC_HE6?: boolean; ANC_HE7?: boolean; ANC_HE8?: boolean
  ANC_HE9?: boolean; ANC_HE10?: boolean
  ANC_Remark?: string
}

export interface Delivery {
  AutoSr?: number
  TS_Pcode: string
  RHC_Code: number
  SRHC_Code: number
  Village_Pcode: number
  CHWAMW: string
  HW_ID: number
  Client_ID: string
  Delivery_Date: string
  Delivery_Time?: string
  Delivery_By?: number
  Delivery_How?: number
  Delivery_MotherOutcome?: number
  Delivery_MotherBleeding?: number
  Delivery_CDK?: boolean
  ChildSr?: number
  Delivery_ChildOutcome?: number
  Delivery_ChildWeight?: number
  Delivery_ChildSex?: number
  Delivery_Place?: number
  Delivery_ChildBF?: number
  Delivery_ChildBF1Hour?: boolean
  Delivery_ChildRespiration?: number
  Delivery_Remark?: string
}

export interface PNC {
  AutoSr?: number
  TS_Pcode: string
  RHC_Code: number
  SRHC_Code: number
  Village_Pcode: number
  CHWAMW: string
  HW_ID: number
  Client_ID: string
  PNC_Sr: number
  PNC_Date: string
  PNC_Temperature?: number
  PNC_BPS?: number
  PNC_BPD?: number
  PNC_Anemia?: boolean
  PNC_IronFolate?: boolean
  PNC_VitaB1?: number
  PNC_VitaA?: boolean
  PNC_HE1?: boolean; PNC_HE2?: boolean; PNC_HE3?: boolean; PNC_HE4?: boolean
  PNC_HE5?: boolean; PNC_HE6?: boolean; PNC_HE7?: boolean; PNC_HE8?: boolean
  PNC_HE9?: boolean; PNC_HE10?: boolean
  PNC_Remark?: string
}

export interface NBC {
  AutoSr?: number
  TS_Pcode: string
  RHC_Code: number
  SRHC_Code: number
  Village_Pcode: number
  CHWAMW: string
  HW_ID: number
  Client_ID: string
  ChildSr?: number
  NBC_Name?: string
  NBC_Sr: number
  NBC_Date: string
  NBC_Weight?: number
  NBC_KGLB?: string
  NBC_Temperature?: number
  NBC_BirthDefect?: boolean
  NBC_Warming?: boolean
  NBC_CordDryClean?: boolean
  NBC_CordChlorhexadine?: boolean
  NBC_EBF?: boolean
  NBC_Jaundice?: boolean
  NBC_Respiration?: boolean
  NBC_Skin?: boolean
  NBC_DangerSign?: boolean
  NBC_Remark?: string
}

export interface Referral {
  AutoSr?: number
  TS_Pcode: string
  RHC_Code: number
  SRHC_Code: number
  Village_Pcode: number
  CHWAMW: string
  HW_ID: number
  Client_ID: string
  Ref_Date: string
  Ref_MorC?: number
  Ref_DestinationSite?: number
  Ref_Reason?: string
  Ref_Completeness?: boolean
  Ref_Outcome?: string
  Ref_Remark?: string
}

export interface VHWRegister {
  id?: number
  TS_Pcode: string
  RHC_Code: number
  SRHC_Code: number
  Village_Pcode: number
  CHWAMW: string
  HW_ID: number
  Report_Month: number
  Report_Year: number
  SrNo: number
  RegisterDate: string
  Patient_Name: string
  Patient_Sex: number
  Patient_AgeInYear: number
  Patient_Village?: string
  Patient_Type?: number
  Find_NotDrinkEat?: boolean; Find_Vomit?: boolean; Find_Fit?: boolean
  Find_NotWakeUp?: boolean; Find_FastBreath?: boolean; Find_Chest?: boolean
  Find_Stridor?: boolean; Find_Blood?: boolean; Find_Restless?: boolean
  Find_SunkenEye?: boolean; Find_Thirsty?: boolean; Find_SkinVery?: boolean
  Find_SkinSlow?: boolean; Find_Fever?: boolean; Find_Other?: string
  Case_VerySeverePneumonia?: boolean; Case_SeverePneumonia?: boolean
  Case_Pneumonia?: boolean; Case_Cough?: boolean
  Case_DiarrWith?: boolean; Case_DiarrNoWith?: boolean; Case_Dysentry?: boolean
  Case_CoughThan21?: boolean; Case_CoughNotThan21?: boolean
  Case_DiarrThan14?: boolean; Case_DiarrNotThan14?: boolean; Other_Case?: string
  Treat_ORS?: number; Treat_Zinc?: number; Treat_ParaSyr?: number
  Treat_ParaTab250?: number; Treat_ParaTab500?: number
  Treat_Amoxil?: number; Treat_Cotrimoxazole?: number; Treat_OtherDrug?: string
  ReferredYN?: boolean
  ArrivedYN?: boolean
  Remark?: string
}

// ── System / reference types ────────────────────────────────────────────────

export interface SysTownship {
  TS_PCode: string
  Township: string
  Org_Short: string
  Grant_No?: string
}

export interface SysRHC {
  TS_Pcode: string
  RHC_Code: number
  RHC_Name: string
  PopulationByRHC19?: number
  U5PopulationByRHC19?: number
  ExpPregByRHC19?: number
  LiveBirthByRHC19?: number
}

export interface SysSRHC {
  TS_Pcode: string
  RHC_Code: number
  SRHC_Code: number
  SRHC_Name: string
}

export interface SysVillage {
  TS_Pcode: string
  RHC_Code: number
  SRHC_Code: number
  Village_Pcode: number
  Village: string
  Village_Mya?: string
  HardToReach19?: boolean
}

export interface SysCHWAMW {
  TS_Pcode: string
  RHC_Code: number
  SRHC_Code: number
  Village_Pcode: number
  CHWAMW: string
  HW_ID: number
  HW_Name: string
  HW_Sex?: string
  CCM_Trained?: boolean
  CBNBC_Trained?: boolean
  DualFunctioning?: boolean
  VRS_Trained?: boolean
}

export interface SysOrg {
  Org_Short: string
  Org_Long: string
  Type: string
}

export interface SysDrug {
  DrugID: number
  DrugDesp: string
}

export interface SysLookUp {
  UseID: number
  ID: number
  Description: string
}

export interface SysLookUpMain {
  UseID: number
  UseDescription: string
}

export interface SysUserLevel {
  UserLevel: number
  LevelDesp: string
}

export interface SysUser {
  UserName: string
  Password: string
  UserLevel: number
}

// ── Database ────────────────────────────────────────────────────────────────

class VRSDatabase extends Dexie {
  clients!: EntityTable<Client, 'AutoSr'>
  anc!: EntityTable<ANC, 'AutoSr'>
  delivery!: EntityTable<Delivery, 'AutoSr'>
  pnc!: EntityTable<PNC, 'AutoSr'>
  nbc!: EntityTable<NBC, 'AutoSr'>
  referral!: EntityTable<Referral, 'AutoSr'>
  vhwRegister!: EntityTable<VHWRegister, 'id'>

  sys_township!: EntityTable<SysTownship, 'TS_PCode'>
  sys_rhc!: EntityTable<SysRHC, 'RHC_Code'>
  sys_srhc!: EntityTable<SysSRHC, 'SRHC_Code'>
  sys_village!: EntityTable<SysVillage, 'Village_Pcode'>
  sys_chwamw!: EntityTable<SysCHWAMW, 'HW_ID'>
  sys_org!: EntityTable<SysOrg, 'Org_Short'>
  sys_drug!: EntityTable<SysDrug, 'DrugID'>
  sys_lookup!: EntityTable<SysLookUp, 'ID'>
  sys_lookupMain!: EntityTable<SysLookUpMain, 'UseID'>
  sys_userLevel!: EntityTable<SysUserLevel, 'UserLevel'>
  sys_user!: EntityTable<SysUser, 'UserName'>

  constructor() {
    super('VRS')
    // Version 1: core clinical and reference tables
    this.version(1).stores({
      clients:     '++AutoSr, Client_ID, [TS_Pcode+RHC_Code], HW_ID, Client_StartDate',
      anc:         '++AutoSr, Client_ID, [TS_Pcode+RHC_Code], ANC_Date',
      delivery:    '++AutoSr, Client_ID, [TS_Pcode+RHC_Code], Delivery_Date',
      pnc:         '++AutoSr, Client_ID, [TS_Pcode+RHC_Code], PNC_Date',
      nbc:         '++AutoSr, Client_ID, [TS_Pcode+RHC_Code], NBC_Date',
      referral:    '++AutoSr, Client_ID, [TS_Pcode+RHC_Code], Ref_Date',

      sys_township:   'TS_PCode, Org_Short',
      sys_rhc:        'RHC_Code, TS_Pcode',
      sys_srhc:       'SRHC_Code, [TS_Pcode+RHC_Code], RHC_Code',
      sys_village:    'Village_Pcode, [TS_Pcode+RHC_Code+SRHC_Code], RHC_Code',
      sys_chwamw:     'HW_ID, [TS_Pcode+RHC_Code], CHWAMW',
      sys_org:        'Org_Short',
      sys_drug:       'DrugID',
      sys_lookup:     '[UseID+ID], UseID',
      sys_lookupMain: 'UseID',
      sys_userLevel:  'UserLevel',
      sys_user:       'UserName, UserLevel',
    })
    // Version 2: add iCCM VHW patient register (missed from initial schema)
    this.version(2).stores({
      vhwRegister: '++id, [TS_Pcode+RHC_Code+HW_ID], Report_Year, Report_Month, HW_ID',
    })
  }
}

export const db = new VRSDatabase()

// When another tab opens a newer version, close this connection so the
// upgrade can proceed instead of blocking indefinitely.
db.on('versionchange', () => {
  db.close()
  window.location.reload()
})

// If the upgrade is blocked by another tab that didn't respond, reload
// to force-close the old connection.
db.on('blocked', () => {
  window.location.reload()
})

// Close the connection when Vite HMR replaces this module so the new
// instance can open the upgraded database without being blocked.
if (import.meta.hot) {
  import.meta.hot.dispose(() => db.close())
}

/** Wipe the entire local database and reload (admin / recovery use only). */
export async function resetDatabase(): Promise<void> {
  await db.delete()
  window.location.reload()
}
