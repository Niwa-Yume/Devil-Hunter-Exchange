<template>
  <div class="relative wallet-card overflow-hidden select-none">
    <!-- Bandeau supérieur sombre -->
    <div class="header-band">
      <div>
        <div class="heading upper-kern title">DHX - DEVIL HUNTER EXCHANGE</div>
        <div class="mono subtitle">PUBLIC SAFETY DIVISION 4</div>
      </div>
      <div class="header-right">
        <div class="crest">
          <UIcon name="i-heroicons-shield-check-20-solid" class="icon" />
        </div>
        <div class="mono gov">
          <div>政府公安局</div>
          <div class="caps">PUBLIC SAFETY</div>
          <div class="caps strong">DEVIL HUNTERS</div>
        </div>
      </div>
    </div>

    <!-- Corps: layout horizontal 30/70 -->
    <div class="card-body">
      <!-- Section GAUCHE (ID) ~35% -->
      <section class="id-section">
        <div class="avatar-wrap">
          <div class="avatar-ring"></div>
          <div class="avatar-frame">
            <img v-if="userImage" :src="userImage" :alt="username" class="avatar-img" />
            <div v-else class="avatar-fallback">
              <UIcon name="i-heroicons-user-20-solid" class="w-8 h-8" />
            </div>
          </div>
        </div>
        <div class="id-infos">
          <div class="heading name" :title="displayedUsername">{{ displayedUsername }}</div>
          <div class="mono chip">{{ sidebarCode }}</div>
        </div>
      </section>

      <!-- Section DROITE (DATA) ~65% -->
      <section class="data-section">
        <div class="data-grid">
          <!-- Ligne personnalisée: PRIX x10 items | VALEUR -->
          <div class="data-block row-line span-2">
            <span class="mono k-label">PRIX x10 items</span>
            <span class="mono k-value">VALEUR: {{ yen(portfolioValue) }}</span>
          </div>

          <!-- Portfolio -->
          <div class="data-block">
            <div class="label mono">PORTFOLIO VALUE</div>
            <div class="value mono" :class="portfolioColorClass">{{ yen(portfolioValue) }}</div>
          </div>
          <!-- Cash -->
          <div class="data-block">
            <div class="label mono">CASH AVAILABLE</div>
            <div class="value mono">{{ yen(cashAmount) }}</div>
          </div>
          <!-- Performance -->
          <div class="data-block">
            <div class="label mono">PERFORMANCE</div>
            <div class="value mono perf" :class="trendColorClass">
              <UIcon :name="trendIcon" class="perf-icon" />
              <span>{{ signedPercent }}</span>
            </div>
          </div>
          <!-- Public Safety chip -->
          <div class="data-block">
            <div class="label mono">AUTHORITY</div>
            <div class="value mono faint">政府公安局 • PUBLIC SAFETY</div>
          </div>
          <!-- Issued/Sign -->
          <div class="data-block">
            <div class="label mono">ISSUED</div>
            <div class="value mono faint">{{ issuedDate }} • SIGN: ______</div>
          </div>
          <!-- Reset CTA -->
          <div class="data-block cta">
            <UButton class="btn-cta btn-sell btn-lg" icon="i-heroicons-arrow-path-20-solid" aria-label="Reset portfolio" @click="onReset">RESET PORTFOLIO</UButton>
          </div>
        </div>
      </section>
    </div>

    <!-- Barre latérale codée -->
    <div class="side-code">
      <div class="mono code">{{ sidebarCode }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  username: string
  userImage?: string
  portfolioValue: number
  cashAmount: number
  performancePercentage: number
  performanceTrend: 'up' | 'down' | 'neutral'
}>()

const displayedUsername = computed(() => (props.username || '').replace(/\s+/g, ' ').trim())

function formatYen(v: number) {
  try { return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(v) } catch { return String(v) }
}
function yen(v: number) { return `${formatYen(v)}\u202F¥` }

const trendIcon = computed(() => {
  if (props.performanceTrend === 'up') return 'i-heroicons-arrow-up-20-solid'
  if (props.performanceTrend === 'down') return 'i-heroicons-arrow-down-20-solid'
  return 'i-heroicons-minus-20-solid'
})
const trendColorClass = computed(() => {
  if (props.performanceTrend === 'up') return 'text-orange'
  if (props.performanceTrend === 'down') return 'text-red'
  return 'text-muted'
})
const portfolioColorClass = computed(() => {
  if (props.performanceTrend === 'down') return 'text-red'
  if (props.performanceTrend === 'up') return 'text-orange'
  return 'text-plain'
})

const signedPercent = computed(() => {
  const v = Number(props.performancePercentage) || 0
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toFixed(1)}%`
})

const sidebarCode = computed(() => {
  const base = String(props.username || 'USER').trim()
  const token = base.split(/\s+/)[0]?.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'USER'
  return `SDH-${token}-41103`
})

const issuedDate = computed(() => {
  try { return new Date().toISOString().slice(0, 10) } catch { return '' }
})

const emit = defineEmits<{ reset: [] }>()
function onReset() {
  alert('Portefeuille réinitialisé (pas encore fonctionnel)!')
  if (confirm('⚠️ ATTENTION: Voulez-vous vraiment réinitialiser votre portefeuille ? Toutes vos données seront perdues !')) emit('reset')
}
</script>

<style scoped>
/* Règle N°2: Dark mode industriel + ring brutaliste */
.wallet-card {
  position: relative;
  width: 100%;
  background: #0f1115; /* proche neutral-900 */
  color: #e5e7eb; /* gris clair */
  border-radius: 6px;
  box-shadow: 0 0 0 1px #374151; /* ring-1 ring-gray-700 */
}

/* Bandeau */
.header-band {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 16px 8px calc(16px + 0.5rem);
  background: #111318; /* un poil plus sombre */
  border-bottom: 1px solid #374151;
}
.header-band .title { font-size: 13px; letter-spacing: .08em; }
.header-band .subtitle { font-size: 11px; opacity: .8; }
.header-right { display: flex; align-items: center; gap: 8px; }
.crest { width: 32px; height: 32px; border: 2px solid #ea580c; border-radius: 9999px; display: flex; align-items: center; justify-content: center; background: #0b0d11; }
.crest .icon { width: 16px; height: 16px; color: #ea580c; }
.gov { font-size: 10px; line-height: 1.1; text-align: right; }
.gov .caps { text-transform: uppercase; letter-spacing: .08em; opacity: .8; }
.gov .strong { opacity: 1; }

/* Règle N°1: Layout horizontal 30/70 */
.card-body { display: flex; gap: 20px; padding: 16px; }
.id-section { flex: 0 0 36%; min-width: 260px; display: flex; gap: 12px; align-items: center; }
.data-section { flex: 1 1 64%; min-width: 320px; }

/* ID visuel */
.avatar-wrap { position: relative; }
.avatar-ring { position: absolute; inset: -6px auto auto -6px; width: 84px; height: 84px; border-radius: 9999px; border: 2px solid #ea580c; opacity: .18; }
.avatar-frame { width: 96px; height: 96px; background: #0b0d11; border: 2px solid #111827; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; }
.name { font-size: 16px; max-width: 16ch; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chip { margin-top: 4px; font-size: 11px; letter-spacing: .12em; opacity: .85; }

/* Règle N°3: DATA en 2 colonnes */
.data-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 24px; row-gap: 12px; }
.data-block { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.data-block.cta { justify-content: flex-end; align-items: center; }
.label { font-size: 11px; letter-spacing: .08em; opacity: .7; text-transform: uppercase; white-space: nowrap; }
.value { font-size: 26px; font-weight: 800; white-space: nowrap; }
.value.perf { display: inline-flex; align-items: center; gap: 8px; }
.perf-icon { width: 20px; height: 20px; }

/* Couleurs tendance */
.text-orange { color: #ea580c; }
.text-red { color: #ef4444; }
.text-muted { color: #9ca3af; }
.text-plain { color: #e5e7eb; }
.faint { color: #9ca3af; }

/* Barre latérale code */
.side-code { position: absolute; right: 0; top: 0; height: 100%; width: 36px; border-left: 1px solid #374151; background:
  repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,0.06) 6px 12px);
  display: flex; align-items: center; justify-content: center; }
.side-code .code { transform: rotate(-90deg); letter-spacing: .3em; font-size: 10px; color: #e5e7eb; opacity: .8; }

/* Responsiveness: garder l’horizontal, mais permettre le wrap de la data en 2 colonnes */
@media (max-width: 900px) {
  .id-section { flex-basis: 40%; }
  .data-section { flex-basis: 60%; }
}
@media (max-width: 680px) {
  .card-body { flex-direction: column; }
  .id-section { flex-basis: auto; }
  .data-section { flex-basis: auto; }
}

/* Ligne personnalisée sur 2 colonnes */
.span-2 { grid-column: 1 / -1; }
.row-line { display: flex; align-items: center; justify-content: space-between; padding: 4px 0; }
.k-label { font-size: 12px; letter-spacing: .06em; text-transform: uppercase; opacity: .9; }
.k-value { font-size: 15px; font-weight: 800; }
</style>
