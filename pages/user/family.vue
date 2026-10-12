<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <div class="max-w-3xl mx-auto px-4 pt-8 space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">👪 My family</h1>
        <p class="text-gray-600">
          Save the people you travel with. The trip planner uses their ages on the travel date to suggest suitable activities.
        </p>
      </div>

      <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{{ error }}</div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        <div v-for="traveller in travellers" :key="traveller.id" class="p-4 flex items-start justify-between gap-4">
          <div>
            <div class="font-semibold text-gray-900">
              {{ traveller.name }}
              <span v-if="traveller.relation" class="ml-2 text-xs font-medium text-gray-500 capitalize">{{ traveller.relation }}</span>
            </div>
            <div class="text-sm text-gray-600">
              {{ traveller.birthDate ? `Age ${ageToday(traveller.birthDate)}` : 'No birth date' }}
            </div>
            <div v-if="traveller.notes" class="text-sm text-gray-500 mt-1">{{ traveller.notes }}</div>
          </div>
          <div class="flex gap-3 text-sm">
            <button @click="edit(traveller)" class="text-blue-600 hover:underline">Edit</button>
            <button @click="remove(traveller)" class="text-red-600 hover:underline">Remove</button>
          </div>
        </div>
        <div v-if="!loading && travellers.length === 0" class="p-6 text-center text-gray-500">
          No one saved yet. Add yourself and the people you travel with.
        </div>
      </div>

      <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 class="text-lg font-bold text-gray-900">{{ editingId ? 'Edit traveller' : 'Add a traveller' }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block">
            <span class="text-sm font-medium text-gray-700">Name</span>
            <input v-model.trim="draft.name" required maxlength="40" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">Relation</span>
            <select v-model="draft.relation" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option :value="null">—</option>
              <option value="self">Me</option>
              <option value="partner">Partner</option>
              <option value="child">Child</option>
              <option value="grandparent">Grandparent</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">Birth date</span>
            <input v-model="draft.birthDate" type="date" :max="today" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </label>
        </div>
        <label class="block">
          <span class="text-sm font-medium text-gray-700">Notes (optional)</span>
          <input
            v-model.trim="draft.notes"
            maxlength="300"
            placeholder="e.g. uses a stroller, vegetarian, loves animals"
            class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </label>
        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {{ saving ? 'Saving…' : editingId ? 'Save changes' : 'Add traveller' }}
          </button>
          <button v-if="editingId" type="button" @click="resetDraft" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">
            Cancel
          </button>
        </div>
      </form>

      <NuxtLink to="/planner" class="inline-flex text-emerald-700 font-semibold hover:underline">Plan a trip with your family →</NuxtLink>
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
    const response = await $fetch<{ data: Traveller[] }>('/api/travellers')
    travellers.value = response.data
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not load your family. Please sign in again.'
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
      await $fetch(`/api/travellers/${editingId.value}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/travellers', { method: 'POST', body })
    }
    resetDraft()
    await load()
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not save this traveller.'
  } finally {
    saving.value = false
  }
}

const remove = async (traveller: Traveller) => {
  if (!window.confirm(`Remove ${traveller.name}?`)) return
  try {
    await $fetch(`/api/travellers/${traveller.id}`, { method: 'DELETE' })
    await load()
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not remove this traveller.'
  }
}

onMounted(load)
</script>
