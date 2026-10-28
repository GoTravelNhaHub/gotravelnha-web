<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <div class="max-w-3xl mx-auto px-4 pt-8 space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">👪 {{ t('account.family.title') }}</h1>
        <p class="text-gray-600">
          {{ t('account.family.intro') }}
        </p>
      </div>

      <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{{ error }}</div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        <div v-for="traveller in travellers" :key="traveller.id" class="p-4 flex items-start justify-between gap-4">
          <div>
            <div class="font-semibold text-gray-900">
              {{ traveller.name }}
              <span v-if="traveller.relation" class="ml-2 text-xs font-medium text-gray-500 capitalize">{{ t(`account.family.relations.${traveller.relation}`) }}</span>
            </div>
            <div class="text-sm text-gray-600">
              {{ traveller.birthDate ? t('account.family.age', { age: ageToday(traveller.birthDate) }) : t('account.family.noBirthDate') }}
            </div>
            <div v-if="traveller.notes" class="text-sm text-gray-500 mt-1">{{ traveller.notes }}</div>
          </div>
          <div class="flex gap-3 text-sm">
            <button @click="edit(traveller)" class="text-blue-600 hover:underline">{{ t('account.family.edit') }}</button>
            <button @click="remove(traveller)" class="text-red-600 hover:underline">{{ t('account.family.remove') }}</button>
          </div>
        </div>
        <div v-if="!loading && travellers.length === 0" class="p-6 text-center text-gray-500">
          {{ t('account.family.empty') }}
        </div>
      </div>

      <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 class="text-lg font-bold text-gray-900">{{ editingId ? t('account.family.editTitle') : t('account.family.addTitle') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block">
            <span class="text-sm font-medium text-gray-700">{{ t('account.family.name') }}</span>
            <input v-model.trim="draft.name" required maxlength="40" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">{{ t('account.family.relation') }}</span>
            <select v-model="draft.relation" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option :value="null">—</option>
              <option value="self">{{ t('account.family.relations.self') }}</option>
              <option value="partner">{{ t('account.family.relations.partner') }}</option>
              <option value="child">{{ t('account.family.relations.child') }}</option>
              <option value="grandparent">{{ t('account.family.relations.grandparent') }}</option>
              <option value="other">{{ t('account.family.relations.other') }}</option>
            </select>
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">{{ t('account.family.birthDate') }}</span>
            <input v-model="draft.birthDate" type="date" :max="today" class="mt-1 w-full min-w-0 max-w-full h-12 px-3 border border-gray-300 rounded-lg text-base" />
          </label>
        </div>
        <label class="block">
          <span class="text-sm font-medium text-gray-700">{{ t('account.family.notes') }}</span>
          <input
            v-model.trim="draft.notes"
            maxlength="300"
            :placeholder="t('account.family.notesPlaceholder')"
            class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </label>
        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {{ saving ? t('account.family.saving') : editingId ? t('account.family.saveChanges') : t('account.family.addTraveller') }}
          </button>
          <button v-if="editingId" type="button" @click="resetDraft" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">
            {{ t('account.family.cancel') }}
          </button>
        </div>
      </form>

      <NuxtLink to="/planner" class="inline-flex text-brand-700 font-semibold hover:underline">{{ t('account.family.planWithFamily') }}</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

interface Traveller {
  id: string
  name: string
  relation: string | null
  birthDate: string | null
  notes: string | null
}

const { t } = useI18n()
const today = new Date().toISOString().slice(0, 10)
const travellers = ref<Traveller[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const editingId = ref<string | null>(null)
const draft = reactive({ name: '', relation: null as string | null, birthDate: '', notes: '' })

const ageToday = (birthDate: string) => {
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getUTCFullYear()
  if (now.getMonth() < birth.getUTCMonth() || (now.getMonth() === birth.getUTCMonth() && now.getDate() < birth.getUTCDate())) {
    age -= 1
  }
  return Math.max(age, 0)
}

const resetDraft = () => {
  editingId.value = null
  Object.assign(draft, { name: '', relation: null, birthDate: '', notes: '' })
}

const load = async () => {
  try {
    loading.value = true
    const response = await $api<{ data: Traveller[] }>('/api/travellers')
    travellers.value = response.data
  } catch (err: any) {
    error.value = t('account.family.loadFailed')
  } finally {
    loading.value = false
  }
}

const edit = (traveller: Traveller) => {
  editingId.value = traveller.id
  Object.assign(draft, {
    name: traveller.name,
    relation: traveller.relation,
    birthDate: traveller.birthDate ? traveller.birthDate.slice(0, 10) : '',
    notes: traveller.notes || ''
  })
}

const save = async () => {
  const body = {
    name: draft.name,
    relation: draft.relation,
    birthDate: draft.birthDate || null,
    notes: draft.notes || null
  }
  try {
    saving.value = true
    error.value = null
    if (editingId.value) {
      await $api(`/api/travellers/${editingId.value}`, { method: 'PUT', body })
    } else {
      await $api('/api/travellers', { method: 'POST', body })
    }
    resetDraft()
    await load()
  } catch (err: any) {
    error.value = err?.data?.message || t('account.family.saveFailed')
  } finally {
    saving.value = false
  }
}

const remove = async (traveller: Traveller) => {
  if (!window.confirm(t('account.family.confirmRemove', { name: traveller.name }))) return
  try {
    await $api(`/api/travellers/${traveller.id}`, { method: 'DELETE' })
    await load()
  } catch (err: any) {
    error.value = t('account.family.removeFailed')
  }
}

onMounted(load)
</script>
