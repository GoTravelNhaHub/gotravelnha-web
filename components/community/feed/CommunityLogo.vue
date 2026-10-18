<template>
  <Logo :size="size" />
</template>

<script setup lang="ts">
import Logo from '~/components/Logo.vue'

withDefaults(defineProps<{ size?: number | string }>(), { size: 40 })
</script>
