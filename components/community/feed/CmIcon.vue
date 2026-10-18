<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" :fill="solid ? 'currentColor' : 'none'" :stroke="solid ? 'none' : 'currentColor'" :stroke-width="stroke" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0">
    <template v-for="(shape, index) in shapes" :key="index">
      <circle v-if="shape.c" :cx="shape.c[0]" :cy="shape.c[1]" :r="shape.c[2]" />
      <rect v-else-if="shape.r" :x="shape.r[0]" :y="shape.r[1]" :width="shape.r[2]" :height="shape.r[3]" :rx="shape.r[4]" />
      <path v-else :d="shape.d" />
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Line icons in the style of the approved community mockup (Lucide geometry, 24px grid)
type Shape = { d?: string; c?: [number, number, number]; r?: [number, number, number, number, number] }

const ICONS: Record<string, Shape[]> = {
  home: [{ d: 'm3 10 9-7 9 7v10a1.5 1.5 0 0 1-1.5 1.5H15v-7H9v7H4.5A1.5 1.5 0 0 1 3 20Z' }],
  users: [{ d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }, { c: [9, 7, 4] }, { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }, { d: 'M16 3.13a4 4 0 0 1 0 7.75' }],
  usersSolid: [{ d: 'M9 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm7.5 1a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6ZM2 19.5C2 15.9 5.1 13 9 13s7 2.9 7 6.5V21H2v-1.5Zm15.2-5.4c2.8.4 4.8 2.6 4.8 5.4V21h-4.3v-1.5c0-2-.8-3.9-2.2-5.2.5-.2 1.1-.3 1.7-.2Z' }],
  compass: [{ c: [12, 12, 9.5] }, { d: 'm15.8 8.2-2.1 5.5-5.5 2.1 2.1-5.5 5.5-2.1Z' }],
  trips: [{ r: [3, 6.5, 18, 14, 2.5] }, { d: 'M8.5 6.5V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5' }, { d: 'M3 11.5h18' }, { d: 'M12 10v3' }],
  bookmark: [{ d: 'm19 21-7-4.5L5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z' }],
  following: [{ c: [9, 8, 4] }, { d: 'M2.5 21a6.5 6.5 0 0 1 13 0' }, { d: 'M17 4.5a4 4 0 0 1 0 7' }, { d: 'M19 15a6.5 6.5 0 0 1 2.5 5' }],
  bell: [{ d: 'M6 9a6 6 0 0 1 12 0c0 6.5 2.5 8.5 2.5 8.5h-17S6 15.5 6 9' }, { d: 'M10.3 21a1.9 1.9 0 0 0 3.4 0' }],
  search: [{ c: [11, 11, 7.5] }, { d: 'm20.5 20.5-4.2-4.2' }],
  arrowRight: [{ d: 'M4.5 12h15' }, { d: 'm13 5.5 6.5 6.5-6.5 6.5' }],
  pin: [{ d: 'M19.5 10c0 5.5-7.5 11.5-7.5 11.5S4.5 15.5 4.5 10a7.5 7.5 0 0 1 15 0Z' }, { c: [12, 10, 2.6] }],
  calendar: [{ r: [3.5, 4.5, 17, 16.5, 2.5] }, { d: 'M8 2.5v4M16 2.5v4M3.5 10h17' }, { d: 'M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01' }],
  heart: [{ d: 'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z' }],
  comment: [{ d: 'M7.9 20A9 9 0 1 0 4 16.1L2.5 21.5Z' }],
  sparkles: [{ d: 'M10 3.5 11.7 8a3 3 0 0 0 1.8 1.8L18 11.5l-4.5 1.7a3 3 0 0 0-1.8 1.8L10 19.5 8.3 15a3 3 0 0 0-1.8-1.8L2 11.5l4.5-1.7A3 3 0 0 0 8.3 8ZM18.5 2l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z' }],
  chevronDown: [{ d: 'm6 9 6 6 6-6' }],
  star: [{ d: 'M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.8Z' }],
  menu: [{ d: 'M4 6.5h16M4 12h16M4 17.5h16' }],
  close: [{ d: 'M18 6 6 18M6 6l12 12' }],
  user: [{ c: [12, 8, 4] }, { d: 'M4.5 21a7.5 7.5 0 0 1 15 0' }],
  external: [{ d: 'M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10' }],
  logout: [{ d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9' }],
  hotel: [{ d: 'M4 21V5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5V21M16 10h2.5A1.5 1.5 0 0 1 20 11.5V21M2.5 21h19' }, { d: 'M8 8h4M8 12h4M8 16h4' }],
  lock: [{ r: [4, 10.5, 16, 10.5, 2] }, { d: 'M8 10.5V7a4 4 0 0 1 8 0v3.5' }]
}

const SOLID = new Set(['usersSolid', 'sparkles', 'star'])

const props = withDefaults(defineProps<{ name: string; size?: number | string; stroke?: number | string }>(), { size: 20, stroke: 1.8 })
const shapes = computed(() => ICONS[props.name] ?? [])
const solid = computed(() => SOLID.has(props.name))
</script>
