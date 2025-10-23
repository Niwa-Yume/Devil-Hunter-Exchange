<template>
  <UContainer class="bg-black text-white min-h-screen py-8">
   <!-- Alert bar -->
   <div class="h-2 alert-stripes mb-4"></div>

   <!-- Header -->
   <header class="mb-6">
     <div class="flex items-start justify-between gap-6 flex-col lg:flex-row">
       <div class="flex-1 w-full">
         <h1 class="glitch heading text-5xl" :data-text="'Devil Hunter Exchange (DHX)'"><span class="sr-only">Devil Hunter Exchange (DHX)</span>Devil Hunter Exchange (DHX)</h1>
         <!-- Ticker sous le titre en mobile -->
         <div class="ticker mt-4 lg:hidden">
           <div class="ticker__track">
             <span class="mx-6 upper-kern">BLOOD WARNING</span>
             <span class="mx-6">—</span>
             <span class="mx-6 upper-kern">MARKET IS CHAOTIC</span>
             <span class="mx-6">—</span>
             <span class="mx-6 upper-kern">NO MERCY TRADES</span>
             <span class="mx-6">—</span>
             <span class="mx-6 upper-kern">CHAINSAW MAN UNIVERSE</span>
             <span class="mx-6">—</span>
             <span class="mx-6 upper-kern">BLOOD WARNING</span>
             <span class="mx-6">—</span>
             <span class="mx-6 upper-kern">MARKET IS CHAOTIC</span>
             <span class="mx-6">—</span>
             <span class="mx-6 upper-kern">NO MERCY TRADES</span>
             <span class="mx-6">—</span>
             <span class="mx-6 upper-kern">CHAINSAW MAN UNIVERSE</span>
             <span class="mx-6">—</span>
           </div>
         </div>
       </div>
       <div class="flex flex-col items-end gap-3 flex-none">
         <div class="flex items-center gap-3">
           <UIcon name="i-heroicons-banknotes-20-solid" class="text-primary w-6 h-6" />
           <ClientOnly>
             <span class="mono text-2xl font-extrabold tracking-wide inline-block border border-white px-2 py-1 leading-none no-wrap">{{ yen(cash) }}</span>
           </ClientOnly>
           <!-- Ajout: icône portefeuille + valeur du portefeuille au même niveau que le cash -->
           <ClientOnly>
             <div class="flex items-center gap-2">
               <UIcon name="i-heroicons-wallet-20-solid" class="w-5 h-5 text-white" />
               <span class="mono text-2xl font-extrabold tracking-wide inline-block border border-white px-2 py-1 leading-none no-wrap">{{ yen(totalValue) }}</span>
             </div>
           </ClientOnly>
           <!-- Toggle FX -->
           <ClientOnly>
             <UButton
               :title="fxEnabled ? 'FX activés' : 'FX désactivés'"
               color="primary"
               variant="solid"
               class="btn-block uppercase font-extrabold tracking-wide !text-black"
               :class="fxEnabled ? '!bg-[#ea580c]' : '!bg-black !text-white'"
               @click="fxEnabled = !fxEnabled"
             >
               FX
             </UButton>
           </ClientOnly>
           <UButton color="primary" variant="solid" class="btn-block uppercase font-extrabold tracking-wide !text-black" @click="resetWallet">
             RESET
           </UButton>
           <!-- Ouvre le portefeuille latéral -->
           <UButton color="primary" variant="solid" class="btn-block uppercase font-extrabold tracking-wide !text-black" @click="showWallet = true">
             <UIcon name="i-heroicons-wallet-20-solid" class="w-4 h-4 mr-1" /> PORTFEUILLE
           </UButton>
         </div>
         <!-- Graphique de cash -->
         <ClientOnly>
          <CashChart :values="cashHistory" :width="360" :height="72" />
         </ClientOnly>
       </div>
     </div>

     <!-- Ticker en desktop sous le header -->
     <div class="ticker mt-4 hidden lg:block">
       <div class="ticker__track">
         <span class="mx-6 upper-kern">BLOOD WARNING</span>
         <span class="mx-6">—</span>
         <span class="mx-6 upper-kern">MARKET IS CHAOTIC</span>
         <span class="mx-6">—</span>
         <span class="mx-6 upper-kern">NO MERCY TRADES</span>
         <span class="mx-6">—</span>
         <span class="mx-6 upper-kern">CHAINSAW MAN UNIVERSE</span>
         <span class="mx-6">—</span>
         <span class="mx-6 upper-kern">BLOOD WARNING</span>
         <span class="mx-6">—</span>
         <span class="mx-6 upper-kern">MARKET IS CHAOTIC</span>
         <span class="mx-6">—</span>
         <span class="mx-6 upper-kern">NO MERCY TRADES</span>
         <span class="mx-6">—</span>
         <span class="mx-6 upper-kern">CHAINSAW MAN UNIVERSE</span>
         <span class="mx-6">—</span>
       </div>
     </div>
   </header>

   <h2 class="heading text-2xl mb-2">LE MARCHÉ</h2>
   <div class="h-2 accent-stripes mb-4"></div>

   <!-- Toolbar filtres/tri et résumé portefeuille -->
   <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
     <div class="flex items-center gap-4">
       <label class="flex items-center gap-2 cursor-pointer select-none">
         <input type="checkbox" v-model="onlyAvailable" class="accent-orange-600" />
         <span class="upper-kern">DISPO SEULEMENT</span>
       </label>
       <UButton size="sm" color="primary" variant="solid" class="btn-block !text-black" @click="toggleSort">
         <UIcon :name="sortAsc ? 'i-heroicons-arrow-up-20-solid' : 'i-heroicons-arrow-down-20-solid'" class="w-4 h-4 mr-1" /> PRIX
       </UButton>
     </div>
     <ClientOnly>
       <div class="mono no-wrap">
         <span class="mr-3">x{{ totalOwned }} items</span>
         <span>Valeur: {{ yen(totalValue) }}</span>
       </div>
     </ClientOnly>
   </div>

   <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
     <UCard
      v-for="(char, idx) in filteredList"
       :key="char?.id ?? idx"
       class="card-brutal rough-border ring-1 ring-white rounded-none shadow-none"
       :ui="{ header: 'py-3', body: 'p-0', footer: 'py-3' }"
     >
       <template #header>
         <div class="flex items-center justify-between w-full">
           <h3 class="heading text-lg overprint" :data-text="char.name">{{ char.name }}</h3>
           <div class="flex items-center gap-2">
             <ClientOnly>
               <span v-if="owned(char.id) > 0" class="mono text-xs px-2 py-0.5 border border-white bg-black">x{{ owned(char.id) }}</span>
             </ClientOnly>
             <UIcon v-if="char.status && char.status.includes('DELISTED')" name="i-heroicons-no-symbol-20-solid" class="text-red-600 w-5 h-5" />
           </div>
         </div>
       </template>

       <img :src="char.image" :alt="char.name" class="w-full h-48 object-cover posterish" />

       <!-- Mini sparkline par carte -->
       <div class="px-3 py-2 bg-black border-t border-white">
         <Sparkline :values="sparkFor(char.id, char.price)" :width="240" :height="40" stroke="#ff3d00" :stroke-width="2" :gradient="['#ff3d00', '#ff3d00']" :uid="`card-${char.id}`" />
       </div>

       <template #footer>
         <div class="flex items-center justify-between w-full">
           <div>
             <p class="mono text-3xl font-extrabold tracking-wide inline-block bg-black text-white border border-white px-2 py-1 leading-none no-wrap">{{ yen(char.price) }}</p>
             <p v-if="char.status" class="stamp text-red-600 mt-2">{{ char.status }}</p>
           </div>
           <div class="cta-group">
             <UButton
               :disabled="!isHydrated || !canBuy(char)"
               :title="!canBuy(char) ? buyReason(char) : undefined"
               color="orange"
               variant="solid"
               class="btn-cta btn-lg btn-buy data-[disabled=true]:btn-disabled w-full justify-center items-center !bg-[#ea580c] !text-black !border-white"
               @click="buy(char)"
             >
               <UIcon name="i-heroicons-arrow-up-right-16-solid" class="w-4 h-4 mr-1" /> ACHAT
             </UButton>
             <UButton
               :disabled="!isHydrated || !canSell(char)"
               :title="!canSell(char) ? 'Rien à vendre' : 'VENDRE'"
               color="red"
               variant="solid"
               class="btn-cta btn-lg btn-sell data-[disabled=true]:btn-disabled w-full justify-center items-center !bg-[#dc2626] !text-white !border-white"
               @click="sell(char)"
             >
               <UIcon name="i-heroicons-arrow-down-16-solid" class="w-4 h-4 mr-1" /> VENDRE
             </UButton>
           </div>
         </div>
       </template>
     </UCard>
   </div>

   <!-- Slide-over Portefeuille -->
   <transition name="fade">
     <div v-if="showWallet" class="fixed inset-0 z-50">
       <!-- Backdrop -->
       <div class="absolute inset-0 bg-black/70" @click="showWallet = false"></div>
       <!-- Panel -->
       <div class="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-black text-white rough-border ring-1 ring-white flex flex-col">
         <div class="p-4 border-b border-white flex items-center justify-between">
           <h3 class="heading text-xl upper-kern">PORTFEUILLE</h3>
           <UButton color="primary" variant="solid" class="btn-block !text-black" @click="showWallet = false">
             FERMER
           </UButton>
         </div>
         <div class="p-4 mono border-b border-white flex items-center justify-between">
           <div>
             <div class="upper-kern text-sm opacity-80">CASH</div>
             <div class="text-2xl font-extrabold">{{ yen(cash) }}</div>
           </div>
           <div class="text-right">
             <div class="upper-kern text-sm opacity-80">VALEUR</div>
             <div class="text-2xl font-extrabold">{{ yen(totalValue) }}</div>
           </div>
         </div>
         <div class="flex-1 overflow-y-auto">
           <div v-if="holdings.length === 0" class="p-6 text-center opacity-70 upper-kern">Aucun item détenu</div>

           <div v-for="it in holdings" :key="it.id" class="p-4 border-b border-white">
             <div class="flex items-center gap-3">
               <img :src="it.image" :alt="it.name" class="w-12 h-12 object-cover posterish" />
               <div class="flex-1">
                 <div class="flex items-center justify-between">
                   <span class="heading text-base overprint" :data-text="it.name">{{ it.name }}</span>
                   <span class="mono">x{{ it.qty }}</span>
                 </div>
                 <div class="text-sm mono opacity-80">{{ yen(it.price) }} • total {{ yen(it.total) }}</div>
               </div>
             </div>
             <div class="mt-2">
               <Sparkline :values="sparkFor(it.id, it.price)" :width="360" :height="40" stroke="#ff3d00" :stroke-width="2" :gradient="['#ff3d00', '#ff3d00']" :uid="`wallet-${it.id}`" />
             </div>
           </div>
         </div>
       </div>
     </div>
   </transition>
  </UContainer>
</template>

<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { ref, watchEffect, computed, onMounted } from 'vue'
// Force l’enregistrement côté template
import CashChart from '../components/CashChart.vue'
import Sparkline from '../components/Sparkline.vue'

interface Character { id: string; name: string; price: number; image: string; status?: string }

// Fetch côté client uniquement pour éviter tout blocage SSR
const { data, error } = await useFetch('/data.json', {
  server: false,
  lazy: true,
  default: () => []
})

if (error.value) {
  console.error('ERREUR: Impossible de charger /data.json', error.value)
}

// Liste sûre (jamais null) et typée souple pour le template
const charactersList = ref<any[]>([])
watchEffect(() => {
  charactersList.value = Array.isArray(data.value) ? (data.value as any[]) : []
})
// Liste pour le template sans inférence stricte
const listAny = computed<any[]>(() => charactersList.value)

// Portefeuille persistant (localStorage)
const cash = useLocalStorage<number>('dhx-cash', 10000)
const wallet = useLocalStorage<Record<string, number>>('dhx-wallet', {})

// Historique du cash (persistant)
const cashHistory = useLocalStorage<number[]>('dhx-cash-history', [10000])

function pushCashHistory(v: number) {
  // évite doublons successifs et limite la taille à 120 points
  const arr = cashHistory.value
  const last = arr[arr.length - 1]
  if (last !== v) arr.push(v)
  if (arr.length > 120) arr.splice(0, arr.length - 120)
}

// Synchronise l’historique au démarrage si besoin
if (!Array.isArray(cashHistory.value) || cashHistory.value.length === 0) {
  cashHistory.value = [cash.value]
} else {
  // s’assurer que la dernière valeur reflète le cash actuel
  const last = cashHistory.value[cashHistory.value.length - 1]
  if (last !== cash.value) pushCashHistory(cash.value)
}

function canBuy(char: Character) {
  return typeof char?.price === 'number' && cash.value >= char.price && !(char.status && /DELISTED/i.test(char.status))
}

function owned(id: string): number {
  return wallet.value[id] || 0
}

function buyReason(char: Character) {
  if (char.status && /DELISTED/i.test(char.status)) return 'Indisponible (DELISTED)'
  if (!(typeof char?.price === 'number')) return 'Prix invalide'
  if (cash.value < char.price) return 'Fonds insuffisants'
  return 'ACHAT'
}

// Notifications d’achat/vente — sûr même si useToast n’est pas dispo
let toast: { add: (o: any) => void }
try {
  // @ts-ignore - auto import Nuxt peut fournir useToast
  const t = useToast()
  toast = t && typeof t.add === 'function' ? t : { add: () => {} }
} catch {
  toast = { add: () => {} }
}

const fxEnabled = useLocalStorage<boolean>('dhx-fx-enabled', true)

function triggerFx(kind: 'buy' | 'sell') {
  if (!fxEnabled.value) return
  if (typeof document === 'undefined') return
  const el = document.body
  if (!el) return
  const cls = kind === 'buy' ? 'fx-buy' : 'fx-sell'
  // ajoute fx-root si absent
  if (!el.classList.contains('fx-root')) el.classList.add('fx-root')
  el.classList.add(cls)
  // retire après l’anim (~400ms)
  window.setTimeout(() => { el.classList.remove(cls) }, 420)
}

function buy(char: Character) {
  if (!canBuy(char)) return
  cash.value -= char.price
  wallet.value[char.id] = (wallet.value[char.id] || 0) + 1
  pushCashHistory(cash.value)
  triggerFx('buy')
  toast.add({
    title: 'ACHAT',
    description: `${char.name} +1`,
    icon: 'i-heroicons-banknotes-20-solid',
    color: 'primary'
  })
}

function resetWallet() {
  cash.value = 10000
  wallet.value = {}
  // reset de l’historique
  cashHistory.value = [cash.value]
}

function formatYen(v: number) {
  try {
    return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(v)
  } catch {
    return String(v)
  }
}

// Espace insécable fine avant le symbole pour empêcher le retour à la ligne
function yen(v: number) {
  return `${formatYen(v)}\u202F¥`
}

// Filtres/tri persistants
const onlyAvailable = useLocalStorage<boolean>('dhx-only-available', false)
const sortAsc = useLocalStorage<boolean>('dhx-sort-asc', false)

const filteredList = computed<any[]>(() => {
  let list = listAny.value
  if (onlyAvailable.value) list = list.filter(item => !(item?.status && /DELISTED/i.test(item.status)))
  const arr = list.slice().sort((a: any, b: any) => {
    const ap = Number(a?.price ?? 0)
    const bp = Number(b?.price ?? 0)
    return sortAsc.value ? ap - bp : bp - ap
  })
  return arr
})

function toggleSort() { sortAsc.value = !sortAsc.value }

// Résumé portefeuille
const totalOwned = computed(() => Object.values(wallet.value).reduce((s: number, n: any) => s + (Number(n) || 0), 0))
const priceMap = computed<Record<string, number>>(() => {
  const m: Record<string, number> = {}
  for (const it of listAny.value) if (it?.id && typeof it?.price === 'number') m[it.id] = it.price
  return m
})
const totalValue = computed(() => Object.entries(wallet.value).reduce((s, [id, qty]) => s + (priceMap.value[id] || 0) * (Number(qty) || 0), 0))

// Vente
function canSell(char: Character) { return (wallet.value[char.id] || 0) > 0 }
function sell(char: Character) {
  if (!canSell(char)) return
  wallet.value[char.id] = Math.max(0, (wallet.value[char.id] || 0) - 1)
  cash.value += Number(char.price) || 0
  pushCashHistory(cash.value)
  triggerFx('sell')
  toast.add({ title: 'VENTE', description: `${char.name} -1`, icon: 'i-heroicons-banknotes-20-solid', color: 'primary' })
}

// Mini-sparklines déterministes par carte
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
    // LCG 32-bit
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}
function makeSpark(id: string, price: number, n = 24): number[] {
  const rnd = makeRand(seedFromString(id))
  const base = Math.max(0, Number(price) || 0)
  const arr: number[] = []
  // point de départ autour de base +/-15%
  let v = base > 0 ? base * (0.85 + rnd() * 0.3) : (1 + rnd())
  for (let i = 0; i < n; i++) {
    // petite dérive multiplicative
    const step = 0.98 + rnd() * 0.04
    v = Math.max(0, v * step)
    arr.push(v)
  }
  // ajuste pour finir exactement sur le prix courant
  const last = arr[arr.length - 1] || 1
  const k = last > 0 ? (base / last) : 0
  for (let i = 0; i < arr.length; i++) arr[i] = (arr[i] ?? 0) * k
  // si base == 0, écrase la fin à 0 pour visuel clair
  if (base === 0) arr[arr.length - 1] = 0
  return arr
}

const sparkMap = computed<Record<string, number[]>>(() => {
  const m: Record<string, number[]> = {}
  for (const it of listAny.value) {
    const id = String(it?.id || '')
    const p = Number(it?.price) || 0
    if (id) m[id] = makeSpark(id, p)
  }
  return m
})

// Slide-over état + données holdings
const showWallet = ref(false)
const holdings = computed(() => {
  const map: Record<string, any> = {}
  for (const it of listAny.value) map[it.id] = it
  const out: any[] = []
  for (const [id, qty] of Object.entries(wallet.value)) {
    const q = Number(qty) || 0
    if (q <= 0) continue
    const it = map[id]
    if (!it) continue
    const price = Number(it.price) || 0
    out.push({ id, name: it.name, image: it.image, qty: q, price, total: q * price })
  }
  // trie par valeur décroissante
  out.sort((a, b) => b.total - a.total)
  return out
})

useHead({
  bodyAttrs: { class: 'bg-black fx-root' },
  style: [ { innerHTML: '*, ::before, ::after { border-radius: 0 !important; }' } ]
})

function sparkFor(id: any, price: any): number[] {
  const key = String(id ?? '')
  const p = Number(price) || 0
  const map = sparkMap?.value || {}
  return key && map[key] && Array.isArray(map[key]) && map[key].length ? map[key] : [p]
}

const isHydrated = ref(false)
onMounted(() => { isHydrated.value = true })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
