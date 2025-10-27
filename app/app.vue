<template>
  <div class="bg-black text-white min-h-screen py-8 px-4 sm:px-4 lg:px-0 w-full max-w-[928px] mx-auto">
    <!-- Alert bar -->
    <div class="h-2 alert-stripes mb-4"></div>

    <!-- Header -->
    <header class="mb-6">
      <div class="flex items-start justify-between gap-6 flex-col lg:flex-row">
        <div class="flex-1 w-full flex items-center justify-between">
          <h1 class="glitch heading text-5xl" :data-text="'Devil Hunter Exchange (DHX)'">
            <span class="sr-only">Devil Hunter Exchange (DHX)</span>
          </h1>
        </div>
        <!-- Carte Portefeuille (style Devil Hunter ID) -->
        <div class="w-full lg:w-auto">
          <WalletCard
            :username="userName"
            :userImage="userImage"
            :portfolioValue="totalValue"
            :cashAmount="cash"
            :performancePercentage="performancePct"
            :performanceTrend="performanceTrend"
            @reset="resetWallet"
          />
        </div>
      </div>

    </header>

    <Dashboard></Dashboard>


    <h2 class="heading text-2xl mb-2">LE MARCHÉ</h2>
    <div class="h-2 accent-stripes mb-4"></div>

    <!-- Toolbar filtres/tri et résumé portefeuille -->
    <div style="display:flex;flex-wrap:nowrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" v-model="onlyAvailable" class="accent-orange-600" />
          <span class="upper-kern">Uniquement en vie</span>
        </label>
        <button class="prix-button" @click="toggleSort">
          <UIcon :name="sortAsc ? 'i-heroicons-arrow-up-20-solid' : 'i-heroicons-arrow-down-20-solid'" class="prix-icon" />
          <span>PRIX</span>
        </button>
      </div>
      <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
        <ClientOnly>
          <div class="toolbar-summary">
            <div class="summary-item">
              <span class="summary-label">ITEMS</span>
              <span class="summary-value">{{ totalOwned }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-item">
              <span class="summary-label">VALEUR</span>
              <span class="summary-value">{{ yen(totalValue) }}</span>
            </div>
          </div>
        </ClientOnly>
      </div>
    </div>

    <div class="cards-grid">
      <UCard
        v-for="(char, idx) in filteredList"
        :key="char?.id ?? idx"
        class="card-brutal rough-border ring-1 ring-white rounded-none shadow-none overflow-hidden !p-0"
      >
        <template #header>
          <div class="flex items-center justify-center w-full gap-1 py-1 px-2 text-center">
            <ClientOnly>
              <span v-if="owned(char.id) > 0" class="mono text-[10px] px-1 py-0.5 border-2 border-white bg-black font-bold">x{{ owned(char.id) }}</span>
            </ClientOnly>
            <h3 class="heading text-sm overprint truncate whitespace-nowrap max-w-[70%]" :data-text="char.name">{{ char.name }}</h3>
            <div class="flex items-center gap-1">
              <UIcon v-if="char.status && char.status.includes('DELISTED')" name="i-heroicons-no-symbol-20-solid" class="text-red-600 w-4 h-4" />
            </div>
          </div>
        </template>

        <!-- Centre l'image de façon fiable -->
        <div class="relative w-full min-h-32 flex items-center justify-center text-center px-0">
          <img :src="char.image" :alt="char.name" class="max-h-28 text-center items-center w-auto h-auto max-w-full object-contain posterish block mx-auto self-center justify-self-center" />
          <div v-if="char.status" class="absolute top-1 left-1 stamp text-red-600 bg-black/80 px-1 py-0.5 border border-red-600 text-[10px]">{{ char.status }}</div>
        </div>

        <!-- Mini sparkline par carte -->
        <div class="px-2 py-1 bg-black border-t border-white flex justify-center">
          <Sparkline class="w-full max-w-full" :values="sparkFor(char.id, char.price)" :width="240" :height="24" stroke="#ff3d00" :stroke-width="2" :gradient="['#ff3d00', '#ff3d00']" :uid="`card-${char.id}`" />
        </div>

        <template #footer>
          <div class="space-y-1.5 p-2">
            <!-- Prix -->
            <div class="flex items-center justify-center">
              <p class="mono text-lg font-extrabold tracking-wide bg-black text-white border-2 border-white px-2 py-0.5 leading-none">{{ yen(char.price) }}</p>
            </div>

            <!-- Boutons d'action -->
            <div class="grid grid-cols-2 gap-1 place-items-center">
              <UButton
                :disabled="!isHydrated || !canBuy(char)"
                :title="!canBuy(char) ? buyReason(char) : undefined"
                color="warning"
                variant="solid"
                size="md"
                class="btn-cta btn-buy btn-lg data-[disabled=true]:btn-disabled w-full justify-center !bg-[#ea580c] !text-white font-bold"
                @click="buy(char)"
              >
                <UIcon name="i-heroicons-arrow-up-right-16-solid" class="w-5 h-5 mr-1.5" /> ACHETER
              </UButton>
              <UButton
                :disabled="!isHydrated || !canSell(char)"
                :title="!canSell(char) ? 'Rien à vendre' : 'VENDRE'"
                color="error"
                variant="solid"
                size="md"
                class="btn-cta btn-sell btn-lg data-[disabled=true]:btn-disabled w-full justify-center !bg-[#dc2626] !text-white font-bold"
                @click="sell(char)"
              >
                <UIcon name="i-heroicons-arrow-down-16-solid" class="w-5 h-5 mr-1.5" /> VENDRE
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
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { ref, watchEffect, computed, onMounted } from 'vue'
import Sparkline from '../components/Sparkline.vue'
import WalletCard from '../components/WalletCard.vue'
import Dashboard from '../components/Dashboard.vue'
import useCharacters from '../composables/useCharacters'

interface Character { id: string; name: string; price: number; image: string; status?: string }

// Fetch côté client via composable partagé
const { data, error, list, listEnriched } = useCharacters()

if (error.value) {
  console.error('ERREUR: Impossible de charger /data.json', error.value)
}

// Liste sûre (jamais null) et typée souple pour le template
const charactersList = ref<any[]>([])
watchEffect(() => {
  charactersList.value = Array.isArray(listEnriched.value) ? (listEnriched.value as any[]) : []
})
// Liste pour le template sans inférence stricte
const listAny = computed<any[]>(() => charactersList.value)

// Portefeuille persistant (localStorage)
const cash = useLocalStorage<number>('dhx-cash', 10000)
const wallet = useLocalStorage<Record<string, number>>('dhx-wallet', {})

// Profil utilisateur basique (pour WalletCard)
const userName = useLocalStorage<string>('dhx-username', 'DENJI INVESTOR')
const userImage = useLocalStorage<string>('dhx-user-image', '/images/denji.svg')


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
  if (typeof document === 'undefined' ) return
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
  // reset de l'historique
  cashHistory.value = [cash.value]

  toast.add({
    title: 'PORTEFEUILLE RÉINITIALISÉ',
    description: 'Retour à 10,000¥ de capital initial',
    icon: 'i-heroicons-arrow-path-20-solid',
    color: 'error'
  })

  triggerFx('sell')
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

// Helper: statut vivant/vivante (robuste aux accents)
function isAliveStatus(status: any): boolean {
  const s = String(status ?? '')
  if (!s) return false
  const norm = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  // couvre "Vivant" et "Vivante"
  return norm.startsWith('vivant')
}

const filteredList = computed<any[]>(() => {
  let list = listAny.value
  if (onlyAvailable.value) {
    list = list.filter(item => isAliveStatus(item?.status))
  }
  return list.slice().sort((a: any, b: any) => {
    const ap = Number(a?.price ?? 0)
    const bp = Number(b?.price ?? 0)
    return sortAsc.value ? ap - bp : bp - ap
  })
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

// Performance globale (cash + portefeuille) vs baseline 10000
const netWorth = computed(() => (Number(cash.value) || 0) + (Number(totalValue.value) || 0))
const performancePct = computed(() => {
  const base = 10000
  const pct = base > 0 ? ((netWorth.value - base) / base) * 100 : 0
  return Number(pct.toFixed(1))
})
const performanceTrend = computed<'up' | 'down' | 'neutral'>(() => {
  if (performancePct.value > 0.05) return 'up'
  if (performancePct.value < -0.05) return 'down'
  return 'neutral'
})

// Vente
function canSell(char: Character) { return (wallet.value[char["id"]] || 0) > 0 }
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

/* Bouton PRIX - Design Chainsaw Man */
.prix-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #0a0a0a;
  border: 2px solid #fff;
  color: #fff;
  font-family: 'Roboto Mono', monospace;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3);
  position: relative;
  overflow: hidden;
}

.prix-button:hover {
  background: #1a1a1a;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3), 0 0 12px rgba(255,61,0,0.2);
}

.prix-button:active {
  transform: translateY(1px);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5), 0 0 8px rgba(255,61,0,0.15);
}

.prix-button:focus-visible {
  outline: 2px dashed #fff;
  outline-offset: 2px;
}

.prix-icon {
  width: 16px;
  height: 16px;
  color: #ff3d00;
  transition: transform 0.3s ease;
}

.prix-button:hover .prix-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 0 4px rgba(255,61,0,0.4));
}

/* Toolbar Summary - Design Chainsaw Man */
.toolbar-summary {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 8px 12px;
  background: #0a0a0a;
  border: 2px solid #fff;
  color: #fff;
  font-family: 'Roboto Mono', monospace;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: all 0.2s ease;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3);
}

.toolbar-summary:hover {
  background: #1a1a1a;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3), 0 0 12px rgba(255,61,0,0.2);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 12px;
  min-width: 0;
}

.summary-label {
  font-size: 9px;
  letter-spacing: 0.15em;
  opacity: 0.8;
  text-shadow: 0 1px 0 rgba(255,255,255,0.1);
}

.summary-value {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.06em;
  color: #ff3d00;
  text-shadow: 0 0 8px rgba(255,61,0,0.4);
}

.summary-divider {
  width: 1px;
  height: 28px;
  background: linear-gradient(to bottom, transparent, #fff, transparent);
  opacity: 0.5;
  margin: 0 4px;
}

/* Grille cartes: 1 col mobile, 2 en md, 3 colonnes fixes de 280px en lg */
.cards-grid { display: grid; gap: 1.5rem; grid-template-columns: 1fr; justify-items: stretch; align-items: start; }
.cards-grid > * { min-width: 0; width: 100%; min-height: 250px; }
@media (min-width: 768px) { /* md */
  .cards-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) { /* lg */
  .cards-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

/* Amélioration des cartes */
:deep(.card-brutal) {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex !important;
  flex-direction: column !important;
  height: auto; /* plus de max-height fixe */
  text-align: center;
}

:deep(.card-brutal:hover) {
  transform: translateY(-4px);
  box-shadow: 0 8px 0 0 rgba(255, 255, 255, 0.3);
}

/* Boutons CTA améliorés */
:deep(.btn-cta) {
  font-family: var(--font-title, ui-sans-serif, sans-serif);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all 0.15s ease;
  position: relative;
  overflow: hidden;
}

:deep(.btn-cta:not([disabled]):hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 0 0 rgba(0, 0, 0, 0.8);
}

:deep(.btn-cta:not([disabled]):active) {
  transform: translateY(0);
  box-shadow: none;
}

/* Image avec effet hover */
:deep(.posterish) {
  filter: grayscale(0.2) contrast(1.1);
  transition: filter 0.3s ease, transform 0.3s ease;
}

:deep(.card-brutal:hover .posterish) {
  filter: grayscale(0) contrast(1.15);
  transform: scale(1.02);
}

/* Status badge */
:deep(.stamp) {
  font-family: var(--font-title, ui-sans-serif, sans-serif);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: bold;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Amélioration du heading */
:deep(.overprint) {
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.8);
}

/* Centrage fiable de l'image et suppression du display:flex problématique */
:deep(.card-brutal img.posterish) {
  max-height: 22rem !important;
  height: auto !important;
  width: auto !important;
  object-fit: contain !important;
  display: block; /* au lieu de flex, qui peut casser le centrage */
  margin: auto; /* centre horizontalement dans la zone disponible */
}
</style>
