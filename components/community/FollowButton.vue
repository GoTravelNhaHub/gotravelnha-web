<template>
  <!-- Hidden on your own profile; signed-out visitors are sent to sign in -->
  <button
    v-if="!isSelf"
    type="button"
    class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold transition disabled:opacity-60"
    :class="[sizeClass, active ? 'bg-cm-primary text-white hover:bg-cm-primary-hover' : variant === 'soft' ? 'bg-cm-soft text-cm-active shadow-[0_1px_2px_rgba(16,32,72,0.08)] hover:bg-[#DCEAFB]' : 'border border-[#CFE0F7] bg-white text-cm-active hover:border-cm-primary']"
    :aria-pressed="active"
    :disabled="isPending(handle)"
    @click.stop.prevent="toggle(handle, placement)"
  >
    {{ active ? t('community.follow.following') : t('community.feed.follow') }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ handle: string; placement: string; variant?: 'soft' | 'outline'; size?: 'sm' | 'md' }>(), { variant: 'outline', size: 'md' })
const { t } = useI18n()
const { isFollowing, toggle, isPending } = useFollows()
const { profile } = useOwnProfile()
const active = computed(() => isFollowing(props.handle))
const isSelf = computed(() => profile.value?.handle === props.handle)
const sizeClass = computed(() => (props.size === 'sm' ? 'h-[34px] px-[15px] text-[14.5px]' : 'h-10 px-5 text-[14.5px]'))
</script>
