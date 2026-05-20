import Papa from 'papaparse'
import { db } from './db'

async function loadCSV<T>(path: string): Promise<T[]> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
  const text = await res.text()
  const { data, errors } = Papa.parse<T>(text, { header: true, skipEmptyLines: true, dynamicTyping: true })
  if (errors.length) console.warn(`CSV parse warnings for ${path}:`, errors)
  return data
}

export async function seedIfEmpty(): Promise<void> {
  const count = await db.sys_township.count()
  if (count > 0) return  // already seeded

  console.info('Seeding reference tables from CSV…')

  try {
    const [townships, rhcs, srhcs, villages, chwamws, orgs, drugs, lookups, lookupMains, userLevels, users] =
      await Promise.all([
        loadCSV('/seed/sys_township.csv'),
        loadCSV('/seed/sys_rhc.csv'),
        loadCSV('/seed/sys_srhc.csv'),
        loadCSV('/seed/sys_village.csv'),
        loadCSV('/seed/sys_chwamw.csv'),
        loadCSV('/seed/sys_org.csv'),
        loadCSV('/seed/sys_drug.csv'),
        loadCSV('/seed/sys_lookup.csv'),
        loadCSV('/seed/sys_lookupMain.csv'),
        loadCSV('/seed/sys_userLevel.csv'),
        loadCSV('/seed/sys_user.csv'),
      ])

    const tables = [
      db.sys_township, db.sys_rhc, db.sys_srhc, db.sys_village,
      db.sys_chwamw, db.sys_org, db.sys_drug, db.sys_lookup,
      db.sys_lookupMain, db.sys_userLevel, db.sys_user,
    ]
    await db.transaction('rw', tables, async () => {
        await db.sys_township.bulkPut(townships as never[])
        await db.sys_rhc.bulkPut(rhcs as never[])
        await db.sys_srhc.bulkPut(srhcs as never[])
        await db.sys_village.bulkPut(villages as never[])
        await db.sys_chwamw.bulkPut(chwamws as never[])
        await db.sys_org.bulkPut(orgs as never[])
        await db.sys_drug.bulkPut(drugs as never[])
        await db.sys_lookup.bulkPut(lookups as never[])
        await db.sys_lookupMain.bulkPut(lookupMains as never[])
        await db.sys_userLevel.bulkPut(userLevels as never[])
        await db.sys_user.bulkPut(users as never[])
      }
    )
    console.info('Seed complete.')
  } catch (err) {
    console.error('Seed failed:', err)
  }
}
