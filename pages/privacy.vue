<template>
  <PolicyPage page="privacy" updated="2026-10-15" legal />
</template>

<script setup lang="ts">
const { t } = useI18n()
useHead(() => ({ title: t('info.privacy.metaTitle') }))
</script>
