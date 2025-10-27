<template>
  <div class="dashboard-wrapper mb-8">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h2 class="heading">📊 MARCHÉ ANALYTIQUE</h2>
        <p class="header-subtitle">Comparez les performances et l'évolution des prix</p>
      </div>
      <div class="header-stats">
        <div class="stat-box">
          <span class="stat-label">SÉLECTIONNÉS</span>
          <span class="stat-value">{{ selectedCharIds.length }}/{{ charactersWithHistory.length }}</span>
        </div>
      </div>
    </div>

    <!-- Grille des personnages -->
    <div class="characters-section">
      <div class="characters-grid">
        <button
          v-for="char in charactersWithHistory"
          :key="char.id"
          @click="toggleCharacter(char.id)"
          :class="['char-card', selectedCharIds.includes(char.id) && 'active']"
          :style="selectedCharIds.includes(char.id) ? { borderColor: getColorForIndex(selectedCharIds.indexOf(char.id)) } : {}"
        >
          <div class="char-image-wrapper">
            <img
              :src="char.image"
              :alt="char.name"
              class="char-image"
              loading="lazy"
              decoding="async"
              width="80"
              height="80"
            />
            <div v-if="selectedCharIds.includes(char.id)" class="check-badge">✓</div>
          </div>
          <div class="char-info">
            <div class="char-name">{{ char.name }}</div>
            <div class="char-price">¥{{ formatNumber(char.price) }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Graphique -->
    <div class="chart-section">
      <div v-if="selectedCharIds.length > 0" class="chart-wrapper">
        <canvas ref="chartCanvas"></canvas>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📈</div>
        <p class="empty-text">Sélectionnez des personnages pour voir l'évolution des prix</p>
      </div>
    </div>

    <!-- Stats détaillées -->
    <div v-if="selectedCharIds.length > 0" class="stats-section">
      <div class="stats-grid">
        <div v-for="(char, idx) in selectedChars" :key="char.id" class="stat-card" :style="{ borderLeftColor: getColorForIndex(idx) }">
          <div class="stat-card-header">
            <img :src="char.image" :alt="char.name" class="stat-card-img" loading="lazy" decoding="async" width="40" height="40" />
            <div class="stat-card-name">{{ char.name }}</div>
          </div>
          <div class="stat-card-metrics">
            <div class="metric">
              <span class="metric-label">MIN</span>
              <span class="metric-value">¥{{ formatNumber(minPriceFor(char)) }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">MAX</span>
              <span class="metric-value">¥{{ formatNumber(maxPriceFor(char)) }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">ACTUEL</span>
              <span class="metric-value">¥{{ formatNumber(char.price) }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">CHANGE</span>
              <span class="metric-value" :class="getChangeClass(char)">{{ getChangePercent(char) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import useCharacters, { type CharacterLike } from '../composables/useCharacters'

interface PriceEntry { chapter: number; price: number }

const { listEnriched } = useCharacters()

const characters = computed<CharacterLike[]>(() => listEnriched.value)
const charactersWithHistory = computed(() => (characters.value || []).filter(c => c.priceHistory && c.priceHistory.length))

// Persiste la sélection pour survivre au refresh
const selectedCharIds = useLocalStorage<string[]>('dhx-selected-ids', [])
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: any = null
let ChartJs: any = null

const colors = [
  '#ff3d00', '#ff6b6b', '#4ecdc4', '#ffd93d', '#a8e6cf', '#ff8b94', '#6bcf7f', '#ff6b9d',
  '#ff9a56', '#66bb6a', '#ec407a', '#ab47bc', '#29b6f6', '#26c6da', '#ef5350', '#5e35b1'
]

// Init sélection quand les données arrivent et qu'il n'y a rien en mémoire
watchEffect(() => {
  const list = charactersWithHistory.value
  if (list.length === 0) return
  if (!Array.isArray(selectedCharIds.value)) selectedCharIds.value = []
  // Nettoie la sélection des ids obsolètes
  const setIds = new Set(list.map(c => c.id))
  selectedCharIds.value = (selectedCharIds.value || []).filter(id => setIds.has(id))
  // Si vide après nettoyage, sélectionne les 3 premiers
  if (selectedCharIds.value.length === 0) {
    selectedCharIds.value = list.slice(0, 3).map(c => c.id)
  }
})

function toggleCharacter(charId: string) {
  const arr = selectedCharIds.value || []
  const idx = arr.indexOf(charId)
  if (idx > -1) {
    arr.splice(idx, 1)
  } else {
    arr.push(charId)
  }
  selectedCharIds.value = [...arr]
}

function getColorForIndex(idx: number) { return colors[idx % colors.length] }
function minPriceFor(char: CharacterLike): number { return Math.min(...(char.priceHistory?.map(p => p.price) || [0])) }
function maxPriceFor(char: CharacterLike): number { return Math.max(...(char.priceHistory?.map(p => p.price) || [0])) }
function getChangePercent(char: CharacterLike): string {
  if (!char.priceHistory || char.priceHistory.length < 2) return '0'
  const first = char.priceHistory[0].price
  const last = char.priceHistory[char.priceHistory.length - 1].price
  const pct = ((last - first) / first * 100).toFixed(1)
  const num = parseFloat(pct)
  return num > 0 ? `+${pct}` : pct
}
function getChangeClass(char: CharacterLike): string {
  const pct = parseFloat(getChangePercent(char))
  return pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral'
}
function formatNumber(n: number): string { return new Intl.NumberFormat('ja-JP').format(Math.round(n)) }

function datasetFor(char: CharacterLike, idx: number) {
  const color = getColorForIndex(idx)
  return {
    label: char.name,
    data: char.priceHistory!.map(p => p.price),
    borderColor: color,
    backgroundColor: color + '20',
    borderWidth: 2,
    fill: true,
    tension: 0.3,
    pointStyle: 'circle' as const,
    pointRadius: 2,
    pointHitRadius: 6,
    pointHoverRadius: 4,
    pointBackgroundColor: color,
    pointBorderColor: '#fff',
    pointBorderWidth: 1,
    pointHoverBorderWidth: 2
  }
}

const selectedChars = computed(() => charactersWithHistory.value.filter(c => selectedCharIds.value.includes(c.id)))

let renderTimer: any = null
async function renderChart() {
  if (renderTimer) { clearTimeout(renderTimer); renderTimer = null }
  // petit debounce pour laisser DOM/data se stabiliser
  renderTimer = setTimeout(async () => {
    try {
      const sel = selectedChars.value
      if (!sel || sel.length === 0) {
        if (chart) { chart.destroy(); chart = null }
        return
      }
      if (!ChartJs && typeof window !== 'undefined') {
        const mod = await import('chart.js/auto')
        ChartJs = (mod as any).default || mod
      }
      const canvas = chartCanvas.value
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx || !ChartJs) return

      if (chart) { chart.destroy(); chart = null }

      const datasets = sel.map((char, idx) => datasetFor(char, idx))
      const labels = sel[0]?.priceHistory?.map(p => `Ch.${p.chapter}`) || []

      chart = new ChartJs(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: '#fff',
                font: { family: "'Roboto Mono', monospace", size: 12, weight: 'bold' },
                padding: 16,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              titleColor: '#ff3d00',
              bodyColor: '#fff',
              borderColor: '#fff',
              borderWidth: 2,
              padding: 12,
              font: { family: "'Roboto Mono', monospace", size: 12 },
              titleFont: { weight: 'bold', size: 13 },
              callbacks: {
                label: (context: any) => ` ${context.dataset?.label}: ¥${new Intl.NumberFormat('ja-JP').format(context.parsed.y)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: { color: 'rgba(255, 255, 255, 0.08)' },
              ticks: {
                color: '#999',
                font: { family: "'Roboto Mono', monospace", size: 11 },
                callback: (v: any) => '¥' + new Intl.NumberFormat('ja-JP').format(v)
              }
            },
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: {
                color: '#999',
                font: { family: "'Roboto Mono', monospace", size: 11 }
              }
            }
          },
          elements: { point: { radius: 2 } }
        }
      })
    } finally {
      renderTimer = null
    }
  }, 50)
}

// Réagir à la fois à la sélection ET à l’arrivée des données
watch([selectedCharIds, charactersWithHistory], () => { void renderChart() }, { deep: false })

onBeforeUnmount(() => {
  if (chart) { try { chart.destroy() } catch {} chart = null }
})
</script>

<style scoped>
.dashboard-wrapper {
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 100%);
  border: 2px solid #fff;
  border-radius: 0;
  overflow: hidden;
  margin-bottom: 32px;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 2px solid #fff;
  gap: 20px;
}

.header-content {
  flex: 1;
}

.header-content h2 {
  font-size: 24px;
  margin: 0 0 4px 0;
  letter-spacing: 0.08em;
}

.header-subtitle {
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  color: #999;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.header-stats {
  display: flex;
  gap: 12px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: #0a0a0a;
  border: 1px solid #fff;
}

.stat-label {
  font-family: 'Roboto Mono', monospace;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.6;
}

.stat-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 16px;
  font-weight: 900;
  color: #ff3d00;
}

/* Grille des personnages */
.characters-section {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}

.char-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: transparent;
  border: 2px solid #333;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.char-card:hover {
  border-color: #666;
  background: rgba(255, 61, 0, 0.05);
}

.char-card.active {
  background: rgba(255, 61, 0, 0.1);
  border-width: 2px;
}

.char-image-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  overflow: hidden;
  flex-shrink: 0;
}

.char-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.2) contrast(1.1);
  transition: filter 0.2s ease;
}

.char-card:hover .char-image {
  filter: grayscale(0) contrast(1.15);
}

.check-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  background: #ff3d00;
  border: 2px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #000;
}

.char-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  min-width: 0;
}

.char-name {
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.char-price {
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  font-weight: 900;
  color: #ff3d00;
}

/* Section Graphique */
.chart-section {
  background: #000;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 420px;
}

.chart-wrapper {
  padding: 20px;
  height: 100%;
}

.chart-wrapper canvas {
  max-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.3;
}

.empty-text {
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  color: #fff;
  margin: 0;
  font-weight: 600;
}

/* Section Stats */
.stats-section {
  background: #000;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1px;
  background: #fff;
}

.stat-card {
  background: #0a0a0a;
  padding: 16px;
  border-left: 4px solid #ff3d00;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.stat-card-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #333;
}

.stat-card-name {
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-card-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-family: 'Roboto Mono', monospace;
  font-size: 9px;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.metric-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  font-weight: 900;
  color: #ff3d00;
}

.metric-value.positive {
  color: #a8e6cf;
}

.metric-value.negative {
  color: #ff6b6b;
}

.metric-value.neutral {
  color: #999;
}

@media (max-width: 768px) {
  .characters-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }

  .stat-card {
    padding: 12px;
  }

  .char-image-wrapper {
    width: 70px;
    height: 70px;
  }
}

/* Deuxième partie des styles */
@media (max-width: 768px) {
  .dashboard-wrapper {
    background: linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 100%);
    border: 2px solid #fff;
    border-radius: 0;
    overflow: hidden;
  }

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 2px solid #fff;
    gap: 20px;
  }

  .header-title {
    flex: 1;
  }

  .header-title h2 {
    font-size: 24px;
    margin: 0 0 4px 0;
    letter-spacing: 0.08em;
  }

  .header-subtitle {
    font-family: 'Roboto Mono', monospace;
    font-size: 11px;
    color: #999;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .header-stats {
    display: flex;
    gap: 12px;
  }

  .stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    background: #0a0a0a;
    border: 1px solid #fff;
  }

  .stat-label {
    font-family: 'Roboto Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    opacity: 0.6;
  }

  .stat-value {
    font-family: 'Roboto Mono', monospace;
    font-size: 18px;
    font-weight: 900;
    color: #ff3d00;
  }

  .selector-panel {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .clear-btn {
    background: transparent;
    border: 1px solid #999;
    color: #999;
    padding: 4px 12px;
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .clear-btn:hover {
    border-color: #fff;
    color: #fff;
  }

  .selector-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
  }

  .char-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: transparent;
    border: 2px solid #333;
    color: #fff;
    font-family: 'Roboto Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    gap: 8px;
  }

  .char-button:hover {
    border-color: #666;
  }

  .char-button.active {
    background: rgba(255, 61, 0, 0.1);
    border-width: 2px;
  }

  .check-mark {
    font-size: 14px;
    font-weight: bold;
  }

  .chart-container {
    position: relative;
    background: #000;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    min-height: 400px;
  }

  .chart-wrapper {
    padding: 20px;
    height: 100%;
  }

  .chart-wrapper canvas {
    max-height: 400px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
    padding: 40px 20px;
    text-align: center;
  }

  .empty-icon {
    font-size: 48px;
    opacity: 0.3;
  }

  .empty-text {
    font-family: 'Roboto Mono', monospace;
    font-size: 14px;
    color: #fff;
    margin: 0;
    font-weight: 600;
  }

  .empty-hint {
    font-family: 'Roboto Mono', monospace;
    font-size: 11px;
    color: #999;
    margin: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1px;
    background: #fff;
    padding: 1px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .stat-card {
    background: #0a0a0a;
    padding: 16px;
    border-left: 4px solid #ff3d00;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .stat-card-name {
    font-family: 'Roboto Mono', monospace;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .stat-card-values {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .value-pair {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .label {
    font-family: 'Roboto Mono', monospace;
    font-size: 9px;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .value {
    font-family: 'Roboto Mono', monospace;
    font-size: 13px;
    font-weight: 900;
    color: #ff3d00;
  }

  .value.positive {
    color: #a8e6cf;
  }

  .value.negative {
    color: #ff6b6b;
  }

  .value.neutral {
    color: #999;
  }
}
</style>
