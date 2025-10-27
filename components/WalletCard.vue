<template>
  <div class="relative wallet-card overflow-hidden select-none text-black">
    <!-- Fond discret: léger grain + fines stries -->
    <div class="pointer-events-none absolute inset-0 opacity-[0.015]" style="background:
      repeating-linear-gradient(0deg, rgba(0,0,0,.08), rgba(0,0,0,.08) 2px, transparent 2px, transparent 6px),
      radial-gradient( at 20% 10%, rgba(0,0,0,.12) 0 20%, transparent 21% ),
      radial-gradient( at 70% 70%, rgba(0,0,0,.08) 0 14%, transparent 15% );"></div>

    <!-- Bandeau supérieur -->
    <div class="relative z-10 px-4 sm:px-5 md:px-6 py-2 bg-[#f1f0f6] border-b border-black/40 flex items-center justify-between">
      <div>
        <div class="heading text-base sm:text-lg tracking-wide upper-kern">DEVIL HUNTER EXCHANGE</div>
        <div class="mono text-[11px] sm:text-xs text-black/80">PUBLIC SAFETY DIVISION 4</div>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full border-2 border-[#ea580c] grid place-items-center">
          <UIcon name="i-heroicons-shield-check-20-solid" class="w-4 h-4 text-[#ea580c]" />
        </div>
        <div class="leading-tight text-right">
          <div class="mono text-[10px] tracking-wide text-black/70">政府公安局</div>
           <div class="mono text-[10px] uppercase tracking-wide text-black/70">PUBLIC SAFETY</div>
           <div class="mono text-[11px] uppercase tracking-wide text-black">DEVIL HUNTERS</div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="relative z-10 p-4 sm:p-5 md:p-6 text-black">
      <!-- Grille principale -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <!-- Col Profil -->
        <div class="relative flex items-start gap-4">
          <!-- Sceau circulaire discret sous la photo -->
          <div class="absolute -top-2 -left-2 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#ea580c] opacity-15"></div>
          <div class="relative z-10 w-24 h-24 sm:w-28 sm:h-28 bg-white border-2 border-black overflow-hidden flex items-center justify-center shadow-[inset_0_0_0_4px_#f6f6f8]">
            <!-- Image utilisateur ou icône par défaut -->
            <!-- TODO: remplacer par un composant UAvatar si disponible -->
          </div>

        </div>

        <!-- Col Valeurs (tableau lisible) -->
        <div class="grid grid-cols-1 gap-3">
          <div class="grid grid-cols-[140px_1fr] items-baseline gap-3">
            <div class="mono text-[11px] tracking-wide text-black/60 font-bold uppercase">PORTFOLIO VALUE</div>
            <ClientOnly fallback="...">
              <div class="mono text-3xl font-black leading-none" :class="portfolioColorClass">{{ yen(portfolioValue) }}</div>
            </ClientOnly>
          </div>
          <div class="grid grid-cols-[140px_1fr] items-baseline gap-3">
            <div class="mono text-[11px] tracking-wide text-black/60 font-bold uppercase">CASH AVAILABLE</div>
            <ClientOnly fallback="...">
              <div class="mono text-3xl font-black leading-none text-black">{{ yen(cashAmount) }}</div>
            </ClientOnly>
          </div>
          <div class="divider"></div>
          <div class="grid grid-cols-[140px_1fr] items-baseline gap-3">
            <div class="mono text-[11px] tracking-wide text-black/60 font-bold uppercase">CARD CODE</div>
            <div class="mono text-base font-bold text-black">{{ sidebarCode }}</div>
          </div>
        </div>

        <!-- Col Performance (net, lisible) -->
        <div class="flex items-center lg:items-start justify-between lg:justify-end gap-4">
          <div class="text-right">
            <div class="mono text-[11px] tracking-wide text-black/60 font-bold uppercase">PERFORMANCE</div>
            <ClientOnly fallback="...">
              <div class="flex items-center justify-end gap-2">
                <UIcon :name="trendIcon" :class="['w-6 h-6', trendColorClass]" />
                <div class="mono text-3xl font-black" :class="trendColorClass">{{ signedPercent }}</div>
              </div>
            </ClientOnly>
            <div class="mono text-[11px] text-black/50">Performance / All Time</div>
          </div>
        </div>
      </div>

      <div class="divider my-4"></div>

      <!-- Bas de carte: infos et bouton reset -->
      <div class="flex items-end justify-between gap-3 flex-wrap">
        <div class="mono text-[11px] text-black/60 font-bold">政府公安局 • PUBLIC SAFETY</div>
        <div class="mono text-[11px] text-black/60 text-right hidden sm:block">
          <div>ISSUED: {{ issuedDate }}</div>
          <div class="mt-1">SIGNATURE: <span class="inline-block align-bottom border-b border-black/40 min-w-[120px]"></span></div>
        </div>
        <button
          class="btn-reset"
          @click="onReset"
        >
          <UIcon name="i-heroicons-arrow-path-20-solid" class="w-4 h-4 mr-1" />
          RESET PORTFOLIO
        </button>
      </div>
    </div>

    <!-- Barre latérale codée -->
    <div class="absolute right-0 top-0 h-full w-10 border-l border-black flex items-center justify-center bg-[repeating-linear-gradient(90deg,_transparent,_transparent_6px,_rgba(0,0,0,0.08)_6px,_rgba(0,0,0,0.08)_12px)]">
      <div class="mono text-[10px] -rotate-90 tracking-[.3em] text-black/80">{{ sidebarCode }}</div>
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

function formatYen(v: number) {
  try {
    return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(v)
  } catch {
    return String(v)
  }
}
function yen(v: number) {
  return `${formatYen(v)}\u202F¥`
}

const trendIcon = computed(() => {
  if (props.performanceTrend === 'up') return 'i-heroicons-arrow-up-20-solid'
  if (props.performanceTrend === 'down') return 'i-heroicons-arrow-down-20-solid'
  return 'i-heroicons-minus-20-solid'
})
const trendColorClass = computed(() => {
  if (props.performanceTrend === 'up') return '!text-[#ea580c]'
  if (props.performanceTrend === 'down') return 'text-red-600'
  return 'text-slate-500'
})
const portfolioColorClass = computed(() => {
  if (props.performanceTrend === 'down') return 'text-red-600'
  if (props.performanceTrend === 'up') return '!text-[#ea580c]'
  return 'text-slate-900'
})

const signedPercent = computed(() => {
  const v = Number(props.performancePercentage) || 0
  const sign = v > 0 ? '+' : v < 0 ? '' : ''
  return `${sign}${v.toFixed(1)}%`
})

const sidebarCode = computed(() => {
  const base = String(props.username || 'USER').trim()
  const token = base.split(/\s+/)[0]?.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'USER'
  return `SDH-${token}-41103`
})

const issuedDate = computed(() => {
  try {
    return new Date().toISOString().slice(0, 10)
  } catch { return '' }
})

const emit = defineEmits<{
  reset: []
}>()

function onReset() {
  if (confirm('⚠️ ATTENTION: Voulez-vous vraiment réinitialiser votre portefeuille ? Toutes vos données seront perdues !')) {
    emit('reset')
  }
}
</script>

<style scoped>
.wallet-card {
  width: 100%;
  max-width: 760px;
  /* Couleur de carte plus claire pour le contraste */
  background: linear-gradient(180deg, #faf9fe, #f0eef8);
  border: 2px solid rgba(0,0,0,.7);
  box-shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 10px 22px rgba(0,0,0,.28);
  color: #0f0f0f;
}
.divider { border-top: 1px solid rgba(0,0,0,.35); }
/* Utilise les classes globales "heading" et "mono" déjà présentes dans le projet */
.heading { font-family: 'Special Elite', system-ui, -apple-system, sans-serif; letter-spacing: .02em; }
.mono { font-family: 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.upper-kern { letter-spacing: .08em; text-transform: uppercase; }
.overprint { text-shadow: 1px 0 currentColor; }
.stamp { font-family: 'Special Elite', system-ui, -apple-system, sans-serif; letter-spacing: .08em; }

/* Bouton RESET rouge vif */
.btn-reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background-color: #dc2626 !important;
  color: white !important;
  border: 2px solid #000 !important;
  font-family: 'Special Elite', system-ui, -apple-system, sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: none !important;
}

.btn-reset:hover {
  background-color: #b91c1c !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
}

.btn-reset:active {
  transform: translateY(0);
  box-shadow: none !important;
}
</style>
