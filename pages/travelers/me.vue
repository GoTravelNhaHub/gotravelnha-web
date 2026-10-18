<template>
  <div class="mx-auto max-w-2xl pb-14 font-brand">
    <div v-if="!loaded" class="h-40 animate-pulse rounded-cm-lg bg-white"></div>
    <section v-else class="cm-card p-5 sm:p-7" aria-labelledby="me-title">
      <h1 id="me-title" class="text-[24px] font-bold tracking-[-0.02em] text-cm-ink">{{ t('community.profile.createTitle') }}</h1>
      <p class="mt-1 text-[15px] text-cm-muted">{{ t('community.profile.createText') }}</p>
      <div class="mt-5"><ProfileForm @saved="(saved) => router.replace(`/travelers/${saved.handle}`)" /></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProfileForm from '~/components/community/ProfileForm.vue'
import { communityEnabled } from '~/utils/feature-flags'

if (!communityEnabled(useRuntimeConfig().public)) throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })

// "Traveler profile" in the avatar menu: your public profile, or the form to create one
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const router = useRouter()
const { profile, loaded, load } = useOwnProfile()

onMounted(async () => {
  await load(true)
  if (profile.value) router.replace(`/travelers/${profile.value.handle}`)
})

useHead(() => ({ title: t('community.profile.createTitle'), meta: [{ name: 'robots', content: 'noindex, nofollow', key: 'robots' }] }))
</script>
