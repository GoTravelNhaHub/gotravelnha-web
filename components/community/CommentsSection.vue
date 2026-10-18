<template>
  <section id="comments" class="scroll-mt-[150px] pt-10 font-brand" aria-labelledby="comments-title">
    <h2 id="comments-title" class="text-[21px] font-bold tracking-[-0.01em] text-cm-ink">{{ t('community.comments.title', { count: total }) }}</h2>
    <p class="mt-1 text-[14px] text-cm-muted">{{ t('community.comments.subtitle') }}</p>

    <!-- Compose -->
    <div class="mt-5 max-w-3xl rounded-cm-lg border border-cm-line bg-white p-4 sm:p-5">
      <ClientOnly>
        <template v-if="!isAuthenticated">
          <p class="text-[14.5px] text-cm-body">
            <NuxtLink :to="{ path: '/login', query: { redirect: `${route.path}#comments` } }" class="text-link">{{ t('community.comments.signIn') }}</NuxtLink>
            {{ t('community.comments.signInText') }}
          </p>
        </template>
        <template v-else-if="loadedProfile && !profile">
          <p class="mb-4 text-[14.5px] font-semibold text-cm-ink">{{ t('community.comments.profileFirst') }}</p>
          <ProfileForm :with-bio="false" :submit-label="t('community.comments.profileSave')" />
        </template>
        <form v-else-if="profile" @submit.prevent="post">
          <div class="flex gap-2" role="radiogroup" :aria-label="t('community.comments.kind')">
            <button v-for="option in KINDS" :key="option" type="button" role="radio" class="h-8 rounded-full px-3.5 text-[13.5px] font-medium" :class="kind === option ? 'bg-cm-soft text-cm-active ring-1 ring-[#CFE0F7]' : 'bg-cm-canvas text-cm-body'" :aria-checked="kind === option" @click="kind = option">
              {{ t(`community.comments.kinds.${option}`) }}
            </button>
          </div>
          <label class="mt-3 block">
            <span class="sr-only">{{ t('community.comments.label') }}</span>
            <textarea v-model="draft" :maxlength="MAX" class="form-input min-h-[96px]" :placeholder="kind === 'QUESTION' ? t('community.comments.questionPlaceholder') : t('community.comments.tipPlaceholder')"></textarea>
          </label>
          <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p class="text-[12.5px] text-cm-muted">{{ t('community.comments.postingAs', { name: profile.displayName }) }} · {{ t('community.comments.rules') }}</p>
            <button type="submit" class="cm-btn-primary h-10 px-5 text-[14.5px]" :disabled="posting || !draft.trim()">{{ posting ? t('community.publish.saving') : t('community.comments.post') }}</button>
          </div>
          <p v-if="error" class="alert-error mt-3" role="alert">{{ error }}</p>
        </form>
        <template #fallback><div class="h-[60px] animate-pulse rounded-xl bg-cm-canvas"></div></template>
      </ClientOnly>
    </div>

    <!-- List -->
    <p v-if="loadFailed" class="alert-error mt-5 max-w-3xl" role="alert">{{ t('community.comments.loadFailed') }}</p>
    <p v-else-if="loaded && !comments.length" class="mt-5 max-w-3xl text-[14.5px] text-cm-muted">{{ t('community.comments.empty') }}</p>
    <ol class="mt-5 max-w-3xl space-y-3">
      <li v-for="comment in comments" :key="comment.id" class="rounded-cm-lg border border-cm-line bg-white p-4">
        <div class="flex items-start gap-3">
          <CreatorAvatar :name="comment.author?.displayName || '?'" :src="comment.author?.avatarUrl" :size="38" />
          <div class="min-w-0 flex-1">
            <p class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[14px]">
              <NuxtLink v-if="comment.author" :to="`/travelers/${comment.author.handle}`" class="font-semibold text-cm-ink hover:text-cm-active">{{ comment.author.displayName }}</NuxtLink>
              <span v-else class="font-semibold text-cm-muted">{{ t('community.comments.deletedUser') }}</span>
              <span class="rounded-full px-2 py-0.5 text-[11.5px] font-semibold" :class="comment.kind === 'QUESTION' ? 'bg-[#FFF4E5] text-[#9A4B00]' : 'bg-cm-soft text-cm-active'">{{ t(`community.comments.kinds.${comment.kind}`) }}</span>
              <time class="text-[12.5px] text-cm-muted" :datetime="comment.createdAt">{{ ago(comment.createdAt) }}</time>
              <span v-if="comment.editedAt" class="text-[12.5px] text-cm-muted">· {{ t('community.comments.edited') }}</span>
            </p>
            <form v-if="editingId === comment.id" class="mt-2" @submit.prevent="saveEdit(comment)">
              <textarea v-model="editDraft" :maxlength="MAX" class="form-input min-h-[80px]" :aria-label="t('community.comments.label')"></textarea>
              <div class="mt-2 flex justify-end gap-2">
                <button type="button" class="cm-btn-outline h-9 px-4 text-[13.5px]" @click="editingId = ''">{{ t('community.profile.cancel') }}</button>
                <button type="submit" class="cm-btn-primary h-9 px-4 text-[13.5px]" :disabled="!editDraft.trim()">{{ t('community.profile.save') }}</button>
              </div>
            </form>
            <!-- Plain text, escaped by Vue; line breaks kept -->
            <p v-else class="mt-1.5 whitespace-pre-line break-words text-[15px] leading-[23px] text-cm-body">{{ comment.body }}</p>
            <div v-if="editingId !== comment.id" class="mt-2 flex gap-4 text-[13px] font-medium text-cm-muted">
              <template v-if="comment.mine">
                <button type="button" class="hover:text-cm-active" @click="startEdit(comment)">{{ t('community.comments.edit') }}</button>
                <button type="button" class="hover:text-[#B91C1C]" @click="remove(comment)">{{ t('community.comments.delete') }}</button>
              </template>
              <button v-else type="button" class="hover:text-cm-ink" @click="reportId = comment.id">{{ t('community.report.action') }}</button>
            </div>
          </div>
        </div>
      </li>
    </ol>
    <div v-if="nextCursor" class="mt-4 max-w-3xl text-center">
      <button type="button" class="cm-btn-outline h-10 px-5 text-[14px]" :disabled="loadingMore" @click="loadMore">{{ loadingMore ? t('community.discover.loading') : t('community.comments.more') }}</button>
    </div>

    <ReportDialog :open="!!reportId" target-type="COMMENT" :target="reportId" @close="reportId = ''" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CreatorAvatar from '~/components/community/feed/CreatorAvatar.vue'
import ProfileForm from '~/components/community/ProfileForm.vue'
import ReportDialog from '~/components/community/ReportDialog.vue'

interface CommentView {
  id: string
  body: string
  kind: 'TIP' | 'QUESTION'
  createdAt: string
  editedAt: string | null
  author: { handle: string; displayName: string; avatarUrl: string | null } | null
  mine: boolean
}

const MAX = 2000
const KINDS = ['TIP', 'QUESTION'] as const

const props = defineProps<{ slug: string; tripId: string; count: number }>()
const emit = defineEmits<{ count: [value: number] }>()
const { t, localeTag, locale } = useI18n()
const { track } = useFunnel()
const route = useRoute()
const { isAuthenticated } = useAuthState()
const { profile, loaded: loadedProfile, load: loadProfile } = useOwnProfile()

const comments = ref<CommentView[]>([])
const nextCursor = ref<string | null>(null)
const loaded = ref(false)
const loadFailed = ref(false)
const loadingMore = ref(false)
const total = ref(props.count)
watch(total, (value) => emit('count', value))

const draft = ref('')
const kind = ref<(typeof KINDS)[number]>('TIP')
const posting = ref(false)
const error = ref('')
const editingId = ref('')
const editDraft = ref('')
const reportId = ref('')

const url = (cursor?: string) => `/api/community/trips/${encodeURIComponent(props.slug)}/comments${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`

const fetchFirst = async () => {
  try {
    const page = await $fetch<{ data: CommentView[]; nextCursor: string | null }>(url())
    comments.value = page.data
    nextCursor.value = page.nextCursor
    loadFailed.value = false
  } catch {
    loadFailed.value = true
  } finally {
    loaded.value = true
  }
}

onMounted(() => {
  fetchFirst()
  loadProfile()
})

const loadMore = async () => {
  if (!nextCursor.value) return
  try {
    loadingMore.value = true
    const page = await $fetch<{ data: CommentView[]; nextCursor: string | null }>(url(nextCursor.value))
    comments.value = [...comments.value, ...page.data]
    nextCursor.value = page.nextCursor
  } finally {
    loadingMore.value = false
  }
}

const messageFor = (err: any) => {
  const status = err?.statusCode ?? err?.status
  if (status === 429) return t('community.comments.tooMany')
  return locale.value === 'en' && err?.data?.message ? err.data.message : t('community.comments.failed')
}

const post = async () => {
  if (!draft.value.trim()) return
  try {
    posting.value = true
    error.value = ''
    await $fetch(url(), { method: 'POST', body: { body: draft.value, kind: kind.value } })
    track('comment_posted', { tripId: props.tripId, kind: kind.value })
    draft.value = ''
    total.value += 1
    await fetchFirst()
  } catch (err) {
    error.value = messageFor(err)
  } finally {
    posting.value = false
  }
}

const startEdit = (comment: CommentView) => {
  editingId.value = comment.id
  editDraft.value = comment.body
}

const saveEdit = async (comment: CommentView) => {
  try {
    await $fetch(`/api/community/comments/${comment.id}`, { method: 'PATCH', body: { body: editDraft.value } })
    comment.body = editDraft.value.trim()
    comment.editedAt = new Date().toISOString()
    editingId.value = ''
  } catch (err) {
    error.value = messageFor(err)
  }
}

const remove = async (comment: CommentView) => {
  if (!window.confirm(t('community.comments.confirmDelete'))) return
  try {
    await $fetch(`/api/community/comments/${comment.id}`, { method: 'DELETE' })
    comments.value = comments.value.filter((item) => item.id !== comment.id)
    total.value = Math.max(0, total.value - 1)
  } catch (err) {
    error.value = messageFor(err)
  }
}

const ago = (value: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 60000))
  const format = new Intl.RelativeTimeFormat(localeTag.value, { numeric: 'auto' })
  if (minutes < 60) return format.format(-minutes, 'minute')
  if (minutes < 60 * 24) return format.format(-Math.round(minutes / 60), 'hour')
  const days = Math.round(minutes / 1440)
  if (days < 30) return format.format(-days, 'day')
  return new Intl.DateTimeFormat(localeTag.value, { dateStyle: 'medium' }).format(new Date(value))
}
</script>
