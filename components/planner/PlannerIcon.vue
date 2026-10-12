<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="(d, index) in paths[name]" :key="index" :d="d" />
  </svg>
</template>

<script setup lang="ts">
export type PlannerIconName =
  | 'spark'
  | 'pin'
  | 'calendar'
  | 'users'
  | 'wallet'
  | 'sliders'
  | 'bookmark'
  | 'copy'
  | 'refresh'
  | 'check'
  | 'send'
  | 'sun'
  | 'sunset'
  | 'moon'
  | 'list'
  | 'info'
  | 'globe'
  | 'bulb'
  | 'ticket'
  | 'suitcase'
  | 'arrow'

defineProps<{ name: PlannerIconName }>()

const paths: Record<PlannerIconName, string[]> = {
  spark: ['M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z', 'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'],
  pin: ['M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z', 'M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  calendar: ['M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z', 'M4 10h16', 'M8 3v4', 'M16 3v4'],
  users: ['M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M2.5 20a6.5 6.5 0 0 1 13 0', 'M16 4.5a3.5 3.5 0 0 1 0 6.5', 'M18 14.5a6.5 6.5 0 0 1 3.5 5.5'],
  wallet: ['M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3', 'M4 7.5v10A1.5 1.5 0 0 0 5.5 19H20V8H6.5A2.5 2.5 0 0 1 4 7.5z', 'M16 13.5h.01'],
  sliders: ['M4 7h10', 'M18 7h2', 'M16 5v4', 'M4 17h4', 'M12 17h8', 'M10 15v4'],
  bookmark: ['M6.5 4h11A1.5 1.5 0 0 1 19 5.5V21l-7-4.5L5 21V5.5A1.5 1.5 0 0 1 6.5 4z'],
  copy: ['M9 9h10.5A1.5 1.5 0 0 1 21 10.5V20a1 1 0 0 1-1 1h-9.5A1.5 1.5 0 0 1 9 19.5z', 'M15 5.5V4.5A1.5 1.5 0 0 0 13.5 3H4.5A1.5 1.5 0 0 0 3 4.5v9A1.5 1.5 0 0 0 4.5 15H6'],
  refresh: ['M20 11a8 8 0 0 0-14.3-4.9L4 8', 'M4 3v5h5', 'M4 13a8 8 0 0 0 14.3 4.9L20 16', 'M20 21v-5h-5'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  send: ['M4 12l16-8-6 16-2.5-6.5z', 'M11.5 13.5L20 4'],
  sun: ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M12 2v2', 'M12 20v2', 'M4.9 4.9l1.4 1.4', 'M17.7 17.7l1.4 1.4', 'M2 12h2', 'M20 12h2', 'M4.9 19.1l1.4-1.4', 'M17.7 6.3l1.4-1.4'],
  sunset: ['M7 17a5 5 0 0 1 10 0', 'M3 21h18', 'M12 3v6', 'M9 6l3 3 3-3', 'M4.2 12.2l1.4 1.4', 'M19.8 12.2l-1.4 1.4'],
  moon: ['M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z'],
  list: ['M9 6h11', 'M9 12h11', 'M9 18h11', 'M4.5 6h.01', 'M4.5 12h.01', 'M4.5 18h.01'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 11v5', 'M12 7.5h.01'],
  globe: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M3 12h18', 'M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z'],
  bulb: ['M9 18h6', 'M10 21h4', 'M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z'],
  ticket: ['M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z', 'M14 6v12'],
  suitcase: ['M5 8h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z', 'M9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8'],
  arrow: ['M5 12h14', 'M13 6l6 6-6 6']
}
</script>
