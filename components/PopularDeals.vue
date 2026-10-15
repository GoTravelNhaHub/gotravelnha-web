<template>
  <section v-if="widget && active" class="space-y-6">
    <SectionHeading eyebrow="Trip.com promotion" :title="widget.title" :subtitle="widget.description" />
    <div class="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white">
      <!-- Lazy: this sits near the bottom of the page and pulls in Trip.com's scripts -->
      <iframe
        :src="widget.url"
        :title="widget.title"
        loading="lazy"
        class="mx-auto h-[600px] w-full min-w-[320px] max-w-[1024px]"
        frameborder="0"
        style="border: none"
      ></iframe>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SectionHeading from '~/components/site/SectionHeading.vue'
import { useTripPromotions } from '~/composables/useTripPromotions'

const props = withDefaults(defineProps<{ campaignId?: string }>(), { campaignId: 'popular-flight-deals' })

const { getPromotionWidget, isCampaignActive } = useTripPromotions()

const widget = computed(() => getPromotionWidget(props.campaignId))
// Decided during server render too, so an inactive campaign never loads the iframe or collapses the page
const active = computed(() => isCampaignActive(props.campaignId))
</script>
