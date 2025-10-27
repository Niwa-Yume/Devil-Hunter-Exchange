import { computed } from 'vue'

export interface PriceEntry { chapter: number; price: number }
export interface CharacterLike {
  id: string
  name: string
  price: number
  image: string
  status?: string
  priceHistory?: PriceEntry[]
}

function seedFromString(str: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function makeRand(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}
export function makeSparkHistory(id: string, price: number, n = 24): PriceEntry[] {
  const rnd = makeRand(seedFromString(id))
  const base = Math.max(0, Number(price) || 0)
  const series: number[] = []
  let v = base > 0 ? base * (0.85 + rnd() * 0.3) : (1 + rnd())
  for (let i = 0; i < n; i++) {
    const step = 0.98 + rnd() * 0.04
    v = Math.max(0, v * step)
    series.push(v)
  }
  const last = series[series.length - 1] || 1
  const k = last > 0 ? (base / last) : 0
  for (let i = 0; i < series.length; i++) series[i] = (series[i] ?? 0) * k
  if (base === 0) series[series.length - 1] = 0
  return series.map((p, idx) => ({ chapter: idx + 1, price: p }))
}

export default function useCharacters() {
  // Chargement centralisé côté client
  const { data, error } = useFetch<CharacterLike[]>('/data.json', {
    server: false,
    lazy: true,
    default: () => []
  })

  const list = computed<CharacterLike[]>(() => Array.isArray(data.value) ? (data.value as CharacterLike[]) : [])

  // Liste enrichie: garantit un priceHistory
  const listEnriched = computed<CharacterLike[]>(() => list.value.map((it) => {
    if (it?.priceHistory && it.priceHistory.length) return it
    return {
      ...it,
      priceHistory: makeSparkHistory(String(it?.id ?? ''), Number(it?.price) || 0)
    }
  }))

  return { data, error, list, listEnriched }
}

