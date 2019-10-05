import { getEnumKeyAndValue } from 'misc-utils-of-mine-generic'
import { ObjectFlags, Symbol, SymbolFlags, Type, TypeFlags } from 'ts-morph'

export function getSymbolFlags(s: Symbol): string[] {
  const v: string[] = []
  getEnumKeyAndValue(SymbolFlags).map(({ key, value }) => {
    if (typeof key !== 'number' && s.hasFlags(value)) {
      v.push(key)
    }
  })
  return v
}

export function getTypeFlags(s: Type): string[] {
  const v: string[] = []
  const f = s.getFlags()
  getEnumKeyAndValue(TypeFlags).map(({ key, value }) => {
    if (typeof key !== 'number' && f & value) {
      v.push(key)
    }
  })
  return v
}

export function getObjectFlags(s: Type): string[] {
  const v: string[] = []
  const f = s.getObjectFlags()
  getEnumKeyAndValue(ObjectFlags).map(({ key, value }) => {
    if (typeof key !== 'number' && f & value) {
      v.push(key)
    }
  })
  return v
}
