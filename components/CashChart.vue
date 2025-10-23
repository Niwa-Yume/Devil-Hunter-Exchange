<template>
  <div class="w-full rough-border ring-1 ring-white p-3 bg-black">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-banknotes-20-solid" class="w-5 h-5" style="color:#ff3d00" />
        <span class="upper-kern">CASH</span>
      </div>
      <div class="mono no-wrap">
        {{ formattedLast }}
        <span :class="pctClass" class="ml-2">{{ sign }}{{ Math.abs(pct).toFixed(1) }}%</span>
      </div>
    </div>
    <Sparkline uid="cash" :values="values" :width="width" :height="height" stroke="#ff3d00" :stroke-width="2" :gradient="['#ff3d00', '#ff3d00']" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Sparkline from './Sparkline.vue'

const props = withDefaults(defineProps<{
  values: number[]
  width?: number
  height?: number
}>(), {
  width: 320,
  height: 64
})

const last = computed(() => props.values?.[props.values.length - 1] ?? 0)
const first = computed(() => props.values?.[0] ?? last.value)
const diff = computed(() => last.value - first.value)
const pct = computed(() => first.value ? (diff.value / first.value) * 100 : 0)
const sign = computed(() => pct.value >= 0 ? '+' : '-')
const pctClass = computed(() => pct.value >= 0 ? 'text-[#ff3d00]' : 'text-red-600')

function formatYen(v: number) {
  try { return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(v) } catch { return String(v) }
}
const formattedLast = computed(() => `${formatYen(last.value)}\u202F¥`)
</script>
