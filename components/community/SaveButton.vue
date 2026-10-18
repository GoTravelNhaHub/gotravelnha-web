<template>
  <!-- icon: feed card bookmark. pill: trip page action with the save count -->
  <button
    type="button"
    class="inline-flex items-center justify-center transition disabled:opacity-60"
    :class="variant === 'pill'
      ? ['h-12 gap-2 rounded-full border px-5 text-[15px] font-semibold', saved ? 'border-cm-primary bg-cm-soft text-cm-active' : 'border-[#CFE0F7] bg-white text-cm-ink hover:border-cm-primary']
      : ['h-9 w-9 rounded-full hover:bg-cm-soft', saved ? 'text-cm-primary' : 'text-[#5B6478]']"
    :aria-pressed="saved"
    :aria-label="saved ? t('community.detail.saved') : t('community.feed.card.save')"
    :title="saved ? t('community.detail.saved') : t('community.feed.card.save')"
    :disabled="isPending(trip.id)"
    @click.stop.prevent="toggle(trip, placement)"
  >
    <svg :width="variant === 'pill' ? 20 : 21" :height="variant === 'pill' ? 20 : 21" viewBox="0 0 24 24" :fill="saved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="m19 21-7-4.5L5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" /></svg>
    <template v-if="variant === 'pill'">
      {{ saved ? t('community.detail.saved') : t('community.detail.save') }}
      <span class="tabular-nums text-cm-muted">{{ count }}</span>
    </template>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{ trip: { id: string; slug: string; saveCount: number }; placement: string; variant?: 'icon' | 'pill' }>(),
  { variant: 'icon' }
)
const { t } = useI18n()
const { isSaved, countFor, toggle, isPending } = useSavedTrips()
const saved = computed(() => isSaved(props.trip.id))
const count = computed(() => countFor(props.trip.id, props.trip.saveCount))
</script>
