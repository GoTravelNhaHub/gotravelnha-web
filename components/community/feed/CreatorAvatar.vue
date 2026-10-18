<template>
  <img v-if="src" :src="src" alt="" :width="size" :height="size" class="shrink-0 rounded-full object-cover" :style="{ width: `${size}px`, height: `${size}px` }" referrerpolicy="no-referrer" />
  <span v-else class="flex shrink-0 items-center justify-center rounded-full font-semibold text-white" :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.4)}px`, background: tint }" aria-hidden="true">{{ initial }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Real avatars only; otherwise initials (no stock photos of people for creators)
const props = withDefaults(defineProps<{ name: string; src?: string | null; size?: number }>(), { src: null, size: 42 })
const TINTS = ['linear-gradient(135deg,#3D8EF5,#0642D2)', 'linear-gradient(135deg,#22B3A6,#0B7C8C)', 'linear-gradient(135deg,#F59E5B,#E0476A)', 'linear-gradient(135deg,#8B7CF6,#5B3FD1)']
const initial = computed(() => props.name.trim().charAt(0).toUpperCase() || '?')
const tint = computed(() => TINTS[[...props.name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % TINTS.length])
</script>
