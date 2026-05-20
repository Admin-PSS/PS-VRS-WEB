import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../data/db'

export function useLookup(useId: number) {
  return useLiveQuery(
    () => db.sys_lookup.where('UseID').equals(useId).sortBy('ID'),
    [useId]
  )
}
