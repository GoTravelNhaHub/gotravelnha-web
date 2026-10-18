<template>
  <span class="inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-bold text-white shadow-sm" :class="provider === 'trip' ? 'bg-[#0068FC]' : 'bg-[#FC6008]'">
    {{ provider === 'trip' ? 'Trip.com' : 'Klook' }}
  </span>
</template>

<script setup lang="ts">
defineProps<{ provider: 'trip' | 'klook' }>()
</script>
