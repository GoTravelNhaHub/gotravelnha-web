<template>
  <PolicyPage page="help" updated="2026-10-12" />
</template>

<script setup lang="ts">
const { t } = useI18n()
useHead(() => ({ title: `${t('info.help.title')} | GoTravelNha`, meta: [{ name: 'description', content: t('info.help.metaDescription') }] }))
</script>
