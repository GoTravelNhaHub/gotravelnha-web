<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthState } from '~/composables/useAuthState';
import Logo from '~/components/Logo.vue';
import { FAMILY_HUB_URL } from '~/utils/family-hub';

const isMenuOpen = ref(false);
const isProfileDropdownOpen = ref(false);
const route = useRoute();
const wide = computed(() => route.meta.wide === true);
// Full-width pages draw their own hero and use .site-shell for content
const bleed = computed(() => route.meta.bleed === true);
const router = useRouter();

// Auth state
const { user, setUser, clearUser, isAuthenticated, isAdmin } = useAuthState();

const runtimeConfig = useRuntimeConfig();

const isFeatureEnabled = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return !['false', '0', 'off', 'no'].includes(normalized);
  }
  return Boolean(value);
};

const showBestDealsNav = computed(() => isFeatureEnabled(runtimeConfig.public?.enableBestDealsNav));

const isActive = (path) => {
  if (route.path === path || route.path.startsWith(`${path}/`)) return 'active-link'
  return ''
}

const navItems = computed(() => {
  const items = [
    { to: '/explore', label: 'Explore' },
    { to: '/trip', label: 'Trip.com' },
    { to: '/klook', label: 'Klook' },
    { to: '/planner', label: 'AI Travel Agent', footerLabel: 'Planner', badge: 'New' }
  ]
  return items
})

const footerHelp = [
  { to: '/help', label: 'Help' },
  { to: '/bookings', label: 'My bookings' },
  { to: '/contact', label: 'Contact' },
  { to: '/refund-policy', label: 'Refunds' }
]

const familyHubUrl = FAMILY_HUB_URL
const { track } = useFunnel()

const trackFamilyHub = (placement) => {
  track('familyhub_nav_clicked', { placement })
  isMenuOpen.value = false
}

const navigate = (path) => {
  router.push(path);
  isMenuOpen.value = false; // Close mobile menu on navigation
};

const toggleProfileDropdown = () => {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

// Prevent body scroll when menu is open
watch(isMenuOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

const logout = async () => {
  // Clear user from state
  clearUser();
  isProfileDropdownOpen.value = false;
  
  // Redirect to home
  router.push('/');
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const target = event.target;
  if (isProfileDropdownOpen.value && !target.closest('.relative')) {
    isProfileDropdownOpen.value = false;
  }
};

// Check for logged-in user on mount
onMounted(() => {
  // Session will be managed by the login system
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

</script>

<template>
  <!-- Full-screen app pages use the visible height (dvh). 100vh is taller than the visible
       area on phones while the address bar shows, which left an empty strip under the chat. -->
  <div class="flex flex-col bg-[#F6F9FC] text-ink" :class="wide ? 'h-dvh overflow-hidden' : 'min-h-screen'">
    <!-- Sticky Top Nav -->
    <header class="fixed top-0 left-0 z-50 w-full print:hidden border-b border-[#E2E8F0] bg-white/95 font-brand text-[#101D3A] backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <nav class="site-gutter flex h-16 items-center justify-between">
        <!-- Left Side: Logo + Hamburger -->
        <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <!-- Toggle Button for Mobile -->
          <button
            @click="isMenuOpen = !isMenuOpen"
            class="text-slate-700 block lg:hidden focus:outline-none p-2.5 touch-manipulation active:bg-slate-100 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'" />
            </svg>
          </button>

          <!-- Logo --> 
          <NuxtLink 
            to="/" 
            @click="navigate('/')" 
            class="flex min-w-0 items-center gap-2 text-[17px] font-bold tracking-[-0.02em] text-[#101D3A] touch-manipulation sm:text-lg"
          >
            <Logo :size="'32'" class="shrink-0" />
            <span class="truncate">GoTravel<span class="text-[#008A9B]">Nha</span></span>
          </NuxtLink>
          <ul class="ml-6 hidden min-w-0 flex-row items-center gap-0.5 lg:flex">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink
                :to="item.to"
                @click="navigate(item.to)"
                :class="['nav-link', isActive(item.to)]"
                class="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[14px] font-semibold text-[#334155] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
              >
                <KlookIcon v-if="item.to === '/klook'" :size="16" />
                {{ item.label }}
                <span v-if="item.badge" class="rounded-full bg-[#008A9B] px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-white">{{ item.badge }}</span>
              </NuxtLink>
            </li>
            <li>
              <a
                :href="familyHubUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-lg px-3 text-[14px] font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#101D3A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
                @click="trackFamilyHub('header')"
              >
                FamilyHub
                <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5v8A1.5 1.5 0 0 0 5.5 16h8a1.5 1.5 0 0 0 1.5-1.5V12M11 4h5m0 0v5m0-5L9 11" />
                </svg>
                <span class="sr-only">opens in a new tab</span>
              </a>
            </li>
          </ul>
        </div>

        <ClientOnly>
          <div class="flex items-center gap-3 flex-shrink-0">
            <!-- Login or Profile Dropdown -->
            <div v-if="!isAuthenticated" class="relative">
              <NuxtLink 
                to="/login" 
                @click="navigate('/login')" 
                class="inline-flex h-10 items-center justify-center rounded-lg bg-[#101D3A] px-4 text-[14px] font-semibold leading-none text-white hover:bg-[#1E2D4F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] focus-visible:ring-offset-2"
              >
                Log in
              </NuxtLink>
            </div>
            
            <!-- Profile Dropdown -->
            <div v-else class="relative">
            <button
              @click="toggleProfileDropdown"
              class="flex h-10 items-center gap-2 rounded-lg border border-[#E2E8F0] px-1.5 transition-colors hover:bg-[#F1F5F9] active:bg-[#F1F5F9] sm:gap-2.5 sm:px-2"
            >
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#008A9B] text-sm font-semibold text-white">
                {{ user.firstName ? user.firstName.charAt(0) : user.username.charAt(0) }}
              </div>
              <span class="hidden lg:block text-sm font-semibold text-slate-700">{{ user.firstName || user.username }}</span>
              <svg class="w-4 h-4 text-slate-500 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <div
              v-if="isProfileDropdownOpen"
              class="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 overflow-hidden backdrop-blur-sm"
            >
              <NuxtLink
                to="/user"
                @click="isProfileDropdownOpen = false"
                class="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                My Profile
              </NuxtLink>
              <div v-if="isAdmin">
                <NuxtLink
                  to="/admin"
                  @click="isProfileDropdownOpen = false"
                  class="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  Admin Portal
                </NuxtLink>
              </div>
              <hr class="my-2 border-slate-200">
              <button
                @click="logout"
                class="flex items-center gap-3 w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Logout
              </button>
            </div>
          </div>
          </div>
          
          <template #fallback>
            <div class="flex items-center gap-3 flex-shrink-0">
              <div class="h-10 w-16 animate-pulse rounded-lg bg-[#F1F5F9]"></div>
            </div>
          </template>
        </ClientOnly>
      </nav>

      <!-- Mobile: Native Style Side Drawer with Backdrop -->
      <Teleport to="body">
        <!-- Backdrop Overlay -->
        <Transition
          enter-active-class="transition-opacity duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isMenuOpen"
            @click="closeMenu"
            class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
            aria-hidden="true"
          ></div>
        </Transition>

        <!-- Side Drawer -->
        <Transition
          enter-active-class="transition-transform duration-300 ease-out"
          enter-from-class="-translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition-transform duration-250 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="-translate-x-full"
        >
          <aside
            v-if="isMenuOpen"
            class="fixed left-0 top-0 bottom-0 z-[70] flex w-[85vw] max-w-sm flex-col overflow-hidden bg-white font-brand shadow-2xl lg:hidden"
          >
            <!-- Drawer Header -->
            <div class="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F6F9FC] p-5">
              <div class="flex items-center gap-3">
                <Logo :size="'32'" />
                <span class="text-lg font-bold tracking-[-0.02em] text-[#101D3A]">GoTravel<span class="text-[#008A9B]">Nha</span></span>
              </div>
              <button
                @click="closeMenu"
                class="p-2 rounded-full hover:bg-white/80 active:bg-white transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <svg class="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Navigation Items -->
            <nav class="flex-1 overflow-y-auto py-4 px-4">
              <ul class="flex flex-col gap-1">
                <li v-for="item in navItems" :key="item.to">
                  <NuxtLink
                    :to="item.to"
                    @click="navigate(item.to)"
                    :class="['nav-link', isActive(item.to)]"
                    class="flex min-h-14 items-center gap-3 rounded-xl px-4 text-base font-semibold text-[#101D3A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
                  >
                    <KlookIcon v-if="item.to === '/klook'" :size="20" />
                    {{ item.label }}
                    <span v-if="item.badge" class="rounded-full bg-[#008A9B] px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-white">{{ item.badge }}</span>
                  </NuxtLink>
                </li>
                <li class="mt-2 border-t border-[#E2E8F0] pt-2">
                  <a
                    :href="familyHubUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex min-h-14 items-center gap-2 rounded-xl px-4 text-base font-semibold text-[#64748B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
                    @click="trackFamilyHub('menu')"
                  >
                    FamilyHub
                    <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5v8A1.5 1.5 0 0 0 5.5 16h8a1.5 1.5 0 0 0 1.5-1.5V12M11 4h5m0 0v5m0-5L9 11" />
                    </svg>
                    <span class="sr-only">opens in a new tab</span>
                  </a>
                </li>
              </ul>
            </nav>

            <!-- Drawer Footer (User section) -->
            <div v-if="isAuthenticated" class="p-4 border-t border-slate-200 bg-slate-50">
              <div class="flex items-center gap-3 px-2 py-2">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#008A9B] text-lg font-bold text-white">
                  {{ user.firstName ? user.firstName.charAt(0) : user.username.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-slate-900 truncate">{{ user.firstName || user.username }}</p>
                  <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
                </div>
              </div>
            </div>
          </aside>
        </Transition>
      </Teleport>
    </header>

    <!-- Main Content -->
    <main
      class="w-full"
      :class="wide ? 'min-h-0 flex-1 overflow-hidden px-0 pt-16' : bleed ? 'flex-1 pt-16' : 'site-shell flex-1 pt-[5.5rem] print:pt-0'"
    >
      <NuxtPage />
    </main>

    <!-- Footer: always sticks to bottom -->
    <!-- Full-screen app pages (the AI Travel Agent) have no footer -->
    <footer v-if="!wide" class="w-full bg-[#101D3A] font-brand text-white print:hidden" :class="bleed ? 'mt-0' : 'mt-12 sm:mt-16'">
      <div class="site-shell py-7 sm:py-12">
        <!-- Phones: Plan and Help side by side, products on one line, so the footer stays short -->
        <div class="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] md:gap-8">
          <div class="col-span-2 max-w-sm md:col-span-1">
            <div class="flex items-center gap-2.5">
              <Logo :size="'28'" />
              <p class="text-lg font-bold tracking-[-0.02em] text-white">GoTravel<span class="text-[#5EEAD4]">Nha</span></p>
            </div>
            <p class="mt-2 text-[13px] leading-5 text-white/70 sm:mt-3 sm:text-[14px] sm:leading-[22px]">
              Plan family trips and compare where to book. Flight and hotel bookings open on Trip.com or Klook. Singapore attraction tickets that we sell are paid for here.
            </p>
          </div>
          <nav aria-label="Plan">
            <h3 class="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/50">Plan</h3>
            <ul class="mt-1.5 sm:mt-3 sm:space-y-1">
              <li v-for="item in navItems" :key="item.to">
                <NuxtLink :to="item.to" class="inline-flex min-h-9 items-center text-[13px] font-medium text-white/85 hover:text-white sm:text-[14px]">{{ item.footerLabel || item.label }}</NuxtLink>
              </li>
            </ul>
          </nav>
          <nav aria-label="Help">
            <h3 class="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/50">Help</h3>
            <ul class="mt-1.5 sm:mt-3 sm:space-y-1">
              <li v-for="item in footerHelp" :key="item.to">
                <NuxtLink :to="item.to" class="inline-flex min-h-9 items-center text-[13px] font-medium text-white/85 hover:text-white sm:text-[14px]">{{ item.label }}</NuxtLink>
              </li>
            </ul>
          </nav>
          <div class="col-span-2 flex items-center gap-4 md:col-span-1 md:block">
            <h3 class="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/50">Our products</h3>
            <a
              :href="familyHubUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-9 items-center gap-1.5 text-[13px] font-medium text-white/85 hover:text-white sm:text-[14px] md:mt-3"
              @click="trackFamilyHub('footer')"
            >
              FamilyHub
              <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5v8A1.5 1.5 0 0 0 5.5 16h8a1.5 1.5 0 0 0 1.5-1.5V12M11 4h5m0 0v5m0-5L9 11" />
              </svg>
              <span class="sr-only">opens in a new tab</span>
            </a>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/10 pt-3 md:mt-10 md:pt-5">
          <p class="text-[12px] text-white/55 sm:text-[13px]">© {{ new Date().getFullYear() }} GoTravelNha. All rights reserved.</p>
          <div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-white/60 sm:text-[13px]">
            <NuxtLink to="/privacy" class="py-1 hover:text-white">Privacy Policy</NuxtLink>
            <NuxtLink to="/terms" class="py-1 hover:text-white">Terms of Service</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
ul {
  transition: all 0.3s ease-in-out;
}

.group ul {
  display: none;
}

.group:hover ul {
  display: block !important;
}

.nav-link.active-link {
  background: #e8f7fa;
  color: #007789;
}

.nav-link:hover {
  background-color: #f1f5f9;
  color: #101d3a;
}

.nav-link.active-link:hover {
  background: #e8f7fa;
  color: #007789;
}
</style>
