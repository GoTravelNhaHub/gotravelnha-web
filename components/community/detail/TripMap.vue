<template>
  <!-- Trip map: each stop pinned (places named by AI, coordinates from OpenStreetMap), filtered by day -->
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[80] flex items-center justify-center bg-[#0A1024]/50 p-0 backdrop-blur-sm sm:p-4" @click.self="emit('close')">
      <section class="flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white font-brand shadow-cm-panel sm:h-auto sm:max-h-[92vh] sm:rounded-[20px]" role="dialog" aria-modal="true" aria-labelledby="trip-map-title" @keydown.esc="emit('close')">
        <header class="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
          <div class="min-w-0">
            <h2 id="trip-map-title" class="text-[17px] font-bold text-cm-ink">{{ t('community.trip.mapTitle') }}</h2>
            <p class="text-[13px] text-cm-muted">{{ caption }}</p>
          </div>
          <button type="button" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-cm-muted hover:bg-cm-canvas" :aria-label="t('community.customize.close')" @click="emit('close')"><CmIcon name="close" :size="20" /></button>
        </header>

        <div v-if="mapData" class="scrollbar-hide flex gap-2 overflow-x-auto px-5 pb-3" role="tablist">
          <button type="button" role="tab" :aria-selected="selectedDay === null" class="h-9 shrink-0 rounded-full px-4 text-[13.5px] font-semibold transition" :class="selectedDay === null ? 'bg-cm-ink text-white' : 'bg-[#F1F4F9] text-cm-body hover:bg-[#E4EAF3]'" @click="selectedDay = null">
            {{ t('community.trip.mapAllDays') }}
          </button>
          <button
            v-for="day in mapData.days"
            :key="day.day"
            type="button"
            role="tab"
            :aria-selected="selectedDay === day.day"
            class="flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition"
            :class="selectedDay === day.day ? 'bg-cm-ink text-white' : 'bg-[#F1F4F9] text-cm-body hover:bg-[#E4EAF3]'"
            @click="selectedDay = day.day"
          >
            <span class="h-2.5 w-2.5 rounded-full" :style="{ background: dayColour(day.day) }" aria-hidden="true"></span>
            {{ t('community.trip.mapDay', { day: day.day }) }}
          </button>
        </div>

        <div class="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_320px]">
          <div class="relative min-h-[50vh] bg-[#E8EEF6] md:h-[66vh] md:max-h-[640px]">
            <div v-show="state === 'ready'" ref="mapEl" class="absolute inset-0" />
            <iframe v-if="state === 'fallback' && fallback" :src="fallback.src" :title="caption" loading="lazy" referrerpolicy="no-referrer" class="absolute inset-0 h-full w-full border-0"></iframe>
            <div v-if="state === 'loading'" class="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <span class="h-9 w-9 animate-spin rounded-full border-[3px] border-cm-primary border-t-transparent" aria-hidden="true"></span>
              <p class="max-w-xs text-[14px] text-cm-body" role="status">{{ t('community.trip.mapLoading') }}</p>
            </div>
            <p v-if="state === 'fallback'" class="absolute inset-x-3 top-3 rounded-xl bg-white/95 px-3 py-2 text-[13px] text-cm-body shadow-sm">{{ t('community.trip.mapFailed') }}</p>
          </div>

          <aside v-if="state === 'ready' && mapData" class="max-h-[34vh] overflow-y-auto border-t border-cm-line md:max-h-[640px] md:border-l md:border-t-0" :aria-label="t('community.trip.mapStops')">
            <ol class="divide-y divide-cm-line">
              <template v-for="day in visibleDays" :key="day.day">
                <li class="sticky top-0 z-10 bg-white/95 px-4 pb-1.5 pt-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-cm-muted backdrop-blur">
                  {{ t('community.detail.dayTitle', { day: day.day, theme: day.theme }) }}
                </li>
                <li v-if="!day.stops.length" class="px-4 py-3 text-[13.5px] text-cm-muted">{{ t('community.trip.mapNoStops') }}</li>
                <li v-for="(stop, index) in day.stops" :key="`${day.day}-${index}`">
                  <button type="button" class="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-cm-canvas" @click="focusStop(day.day, index)">
                    <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white" :style="{ background: dayColour(day.day) }">{{ index + 1 }}</span>
                    <span class="min-w-0">
                      <span class="block text-[14px] font-semibold leading-5 text-cm-ink">{{ stop.title }}</span>
                      <span class="block text-[12.5px] text-cm-muted">{{ t(`planner.slots.${stop.slot}`) }}<template v-if="stop.place !== stop.title"> · {{ stop.place }}</template></span>
                    </span>
                  </button>
                </li>
              </template>
            </ol>
            <p v-if="mapData.unmapped" class="px-4 py-3 text-[12.5px] leading-5 text-cm-muted">{{ t('community.trip.mapUnmapped', { count: mapData.unmapped }) }}</p>
          </aside>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { Map as LeafletMap, LayerGroup, Marker } from 'leaflet'
import CmIcon from '~/components/community/feed/CmIcon.vue'

interface MapStop {
  slot: string
  title: string
  place: string
  lat: number
  lon: number
}
interface TripMapData {
  centre: { lat: number; lon: number } | null
  days: Array<{ day: number; theme: string; stops: MapStop[] }>
  unmapped: number
}

const props = defineProps<{
  open: boolean
  slug: string
  destination: string
  /** Day to show first (1-based); null shows every day */
  day: number | null
  /** City map from utils/planner-map, shown if pins cannot be loaded */
  fallback: { city: string; src: string } | null
}>()
const emit = defineEmits<{ close: [] }>()
const { t, placeName } = useI18n()

const DAY_COLOURS = ['#0060FC', '#FC6008', '#0CA678', '#C2255C', '#7048E8', '#E67700', '#1098AD', '#5C940D', '#D6336C', '#495057']
const dayColour = (day: number) => DAY_COLOURS[(day - 1) % DAY_COLOURS.length]

const mapEl = ref<HTMLElement | null>(null)
const mapData = ref<TripMapData | null>(null)
const state = ref<'loading' | 'ready' | 'fallback'>('loading')
const selectedDay = ref<number | null>(null)

const visibleDays = computed(() => (mapData.value?.days ?? []).filter((day) => selectedDay.value === null || day.day === selectedDay.value))
const pinned = computed(() => visibleDays.value.reduce((sum, day) => sum + day.stops.length, 0))
const caption = computed(() =>
  state.value === 'ready'
    ? t('community.trip.mapPinned', { count: pinned.value, destination: placeName(props.destination) })
    : t('community.trip.mapCaption', { destination: placeName(props.fallback?.city ?? props.destination) })
)

let L: typeof import('leaflet') | null = null
let map: LeafletMap | null = null
let layer: LayerGroup | null = null
const markers = new Map<string, Marker>()

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

async function load() {
  if (mapData.value) return
  state.value = 'loading'
  try {
    const response = await $api<{ data: TripMapData }>(`/api/community/trips/${encodeURIComponent(props.slug)}/map`)
    mapData.value = response.data
    state.value = response.data.days.some((day) => day.stops.length) ? 'ready' : 'fallback'
  } catch {
    state.value = 'fallback'
  }
  if (state.value === 'fallback' && !props.fallback) state.value = mapData.value ? 'ready' : 'fallback'
}

async function ensureMap() {
  if (!mapEl.value) return
  if (!L) {
    const [leaflet] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')])
    L = (leaflet as any).default ?? leaflet
  }
  if (!map && L) {
    map = L.map(mapEl.value, { zoomControl: true, scrollWheelZoom: true })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(map)
    layer = L.layerGroup().addTo(map)
  }
  map?.invalidateSize()
}

function draw() {
  if (!L || !map || !layer || !mapData.value) return
  layer.clearLayers()
  markers.clear()
  const points: Array<[number, number]> = []

  for (const day of visibleDays.value) {
    const colour = dayColour(day.day)
    const route = day.stops.map((stop) => [stop.lat, stop.lon] as [number, number])
    if (route.length > 1) L.polyline(route, { color: colour, weight: 3, opacity: 0.7, dashArray: '6 8' }).addTo(layer)
    day.stops.forEach((stop, index) => {
      const icon = L!.divIcon({
        className: '',
        html: `<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:${colour};color:#fff;font:700 12px/1 system-ui,sans-serif;border:2px solid #fff;box-shadow:0 2px 6px rgba(10,16,36,.35)">${index + 1}</span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      })
      const marker = L!.marker([stop.lat, stop.lon], { icon, title: stop.title, riseOnHover: true })
        .bindPopup(
          `<strong style="font-size:14px">${escapeHtml(stop.title)}</strong><br><span style="color:#5B6478;font-size:12.5px">${escapeHtml(
            `${t('community.trip.mapDay', { day: day.day })} · ${t(`planner.slots.${stop.slot}`)}`
          )}</span>`
        )
        .addTo(layer!)
      markers.set(`${day.day}-${index}`, marker)
      points.push([stop.lat, stop.lon])
    })
  }

  if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 })
  else if (points.length === 1) map.setView(points[0], 14)
  else if (mapData.value.centre) map.setView([mapData.value.centre.lat, mapData.value.centre.lon], 11)
}

function focusStop(day: number, index: number) {
  const marker = markers.get(`${day}-${index}`)
  if (!marker || !map) return
  map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 15), { duration: 0.6 })
  marker.openPopup()
}

watch(
  () => props.open,
  async (open) => {
    // The dialog's DOM goes away when closed, so the Leaflet map is rebuilt on the next open
    if (!open) {
      map?.remove()
      map = null
      layer = null
      return
    }
    selectedDay.value = props.day
    await load()
    if (state.value !== 'ready') return
    await nextTick()
    await ensureMap()
    draw()
  },
  { immediate: true }
)
watch(selectedDay, () => draw())

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>
