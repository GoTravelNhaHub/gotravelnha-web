<template>
  <div id="planner-party">
    <div class="flex items-center justify-between gap-3">
      <p class="text-sm font-semibold text-ink">Travellers</p>
      <NuxtLink v-if="authenticated" to="/user/family" class="text-sm font-semibold text-sea hover:underline">
        Manage family
      </NuxtLink>
    </div>
    <ul class="mt-2 space-y-2">
      <li v-for="(person, index) in party" :key="index" class="rounded-xl border border-line bg-white p-3">
        <label v-if="person.fromProfile" class="mb-2 flex min-h-11 items-center gap-2 text-sm text-ink">
          <input v-model="person.include" type="checkbox" class="h-5 w-5 rounded border-line text-sea focus-visible:ring-sea" />
          Include on this trip
        </label>
        <div class="flex items-end gap-2">
          <label class="block min-w-0 flex-1">
            <span class="text-xs font-semibold text-ink/70">Name</span>
            <input
              v-model.trim="person.name"
              :disabled="person.fromProfile"
              maxlength="40"
              placeholder="Optional"
              class="mt-1 w-full min-w-0 rounded-xl border border-line bg-white px-3 text-base text-ink min-h-12 disabled:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
            />
          </label>
          <label class="block w-20 shrink-0">
            <span class="text-xs font-semibold text-ink/70">Age</span>
            <input
              v-model.number="person.age"
              type="number"
              min="0"
              max="110"
              required
              class="mt-1 w-full min-w-0 rounded-xl border border-line bg-white px-3 text-base text-ink min-h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
            />
          </label>
          <button
            v-if="!person.fromProfile && party.length > 1"
            type="button"
            class="mb-1 min-h-11 px-2 text-sm font-semibold text-ink/70 hover:text-ink"
            @click="$emit('remove', index)"
          >
            Remove
          </button>
        </div>
      </li>
    </ul>
    <button
      type="button"
      class="mt-2 min-h-11 text-sm font-semibold text-sea hover:underline disabled:opacity-50"
      :disabled="party.length >= 10"
      @click="$emit('add')"
    >
      Add traveller
    </button>
  </div>
</template>

<script setup lang="ts">
export interface PartyRow {
  name: string
  age: number | null
  include: boolean
  fromProfile: boolean
  birthDate?: string | null
  notes?: string | null
}

defineProps<{
  party: PartyRow[]
  authenticated: boolean
}>()

defineEmits<{
  add: []
  remove: [index: number]
}>()
</script>
