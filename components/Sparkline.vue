<template>
  <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="sparkline">
    <defs v-if="gradient">
      <linearGradient :id="gid" x1="0" y1="0" :x2="0" :y2="height" gradientUnits="userSpaceOnUse">
        <stop offset="0%" :stop-color="gradient[0]" :stop-opacity="0.6"/>
        <stop offset="100%" :stop-color="gradient[1]" :stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path v-if="fillPath" :d="fillPath" :fill="gradient ? `url(#${gid})` : fill"/>
    <polyline :points="points" :stroke="stroke" :stroke-width="strokeWidth" fill="none" stroke-linejoin="round" stroke-linecap="round" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  values: number[]
  width?: number
  height?: number
  stroke?: string
  strokeWidth?: number
  fill?: string
  gradient?: [string, string] | null
  uid?: string
}>(), {
  width: 240,
  height: 48,
  stroke: '#ff3d00',
  strokeWidth: 2,
  fill: 'transparent',
  gradient: () => ['#ff3d00', '#ff3d00']
})

function hashSig(sig: string): string {
  let h = 5381
  for (let i = 0; i < sig.length; i++) h = ((h << 5) + h) ^ sig.charCodeAt(i)
  return Math.abs(h >>> 0).toString(36)
}

const gid = computed(() => {
  if (props.uid) return `spark-${props.uid}`
  const v = props.values || []
  const first = v[0] ?? 0
  const last = v[v.length - 1] ?? 0
  const sig = JSON.stringify([props.width, props.height, v.length, first, last])
  return `spark-${hashSig(sig)}`
})

const stats = computed(() => {
  const v = props.values && props.values.length ? props.values : [0]
  const min = Math.min(...v)
  const max = Math.max(...v)
  return { v, min, max: max === min ? min + 1 : max }
})

const points = computed(() => {
  const { v, min, max } = stats.value
  const n = v.length
  if (!n) return ''
  const stepX = props.width / Math.max(1, n - 1)
  const norm = (val: number) => (val - min) / (max - min)
  return v.map((val, i) => {
    const x = i * stepX
    const y = props.height - norm(val) * props.height
    return `${x},${y}`
  }).join(' ')
})

const fillPath = computed(() => {
  if (!props.gradient) return ''
  const pts = points.value
  if (!pts) return ''
  const first = `0,${props.height}`
  const lastX = props.width
  const last = `${lastX},${props.height}`
  return `M ${first} L ${pts} L ${last} Z`
})
</script>
