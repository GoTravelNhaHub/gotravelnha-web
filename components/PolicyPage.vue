<template>
  <div class="max-w-3xl mx-auto py-8 sm:py-12">
    <h1 class="text-3xl font-bold text-slate-900">{{ title }}</h1>
    <p class="mt-2 text-sm text-slate-500">Last updated {{ updated }}</p>
    <div class="policy mt-8 space-y-6 text-slate-700 leading-relaxed">
      <slot />
    </div>
    <p class="mt-10 text-sm text-slate-600">
      Questions?
      <a v-if="supportEmail" :href="`mailto:${supportEmail}`" class="text-emerald-700 hover:underline">{{ supportEmail }}</a>
      <template v-if="supportEmail"> or </template>
      <NuxtLink to="/contact" class="text-emerald-700 hover:underline">use our contact form</NuxtLink>.
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; updated: string }>()
const supportEmail = useRuntimeConfig().public.supportEmail
</script>

<style scoped>
.policy :deep(h2) {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(15 23 42);
  margin-top: 2rem;
}
.policy :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
}
.policy :deep(li) {
  margin-top: 0.25rem;
}
</style>
