<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthState } from '~/composables/useAuthState';
import Logo from '~/components/Logo.vue';

const isMenuOpen = ref(false);
const isProfileDropdownOpen = ref(false);
const route = useRoute();
const wide = computed(() => route.meta.wide === true);
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
const showCompareNav = computed(() => isFeatureEnabled(runtimeConfig.public?.enableCompareNav));

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
  if (showCompareNav.value) items.push({ to: '/compare', label: 'Compare' })
  return items
})

const footerPlaces = [
  { to: '/destinations', label: 'Destinations' }
]

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
  <div class="flex min-h-screen flex-col text-ink" :class="wide ? 'bg-[#F6F9FC]' : 'bg-sand'">
    <!-- Sticky Top Nav -->
    <header class="fixed top-0 left-0 w-full bg-white text-ink z-50 border-b border-line">
      <nav
        class="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8"
        :class="wide ? 'max-w-none' : 'container'"
      >
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
            class="flex items-center gap-2 font-semibold text-base sm:text-lg text-ink touch-manipulation min-w-0"
          >
            <Logo :size="'32'" class="shrink-0" />
            <span class="truncate">GoTravelNha</span>
          </NuxtLink>
          <ul class="ml-6 hidden min-w-0 flex-row items-center gap-0.5 lg:flex">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink
                :to="item.to"
                @click="navigate(item.to)"
                :class="['nav-link', isActive(item.to)]"
                class="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-ink/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
              >
                <KlookIcon v-if="item.to === '/klook'" :size="16" />
                {{ item.label }}
                <span v-if="item.badge" class="rounded-full bg-sea px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-white">{{ item.badge }}</span>
              </NuxtLink>
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
                class="inline-flex h-10 items-center justify-center rounded-lg bg-ink px-3.5 text-sm font-semibold leading-none text-white hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
              >
                Log in
              </NuxtLink>
            </div>
            
            <!-- Profile Dropdown -->
            <div v-else class="relative">
            <button
              @click="toggleProfileDropdown"
              class="flex h-10 items-center gap-2 rounded-lg border border-line px-1.5 transition-colors hover:bg-sand active:bg-sand sm:gap-2.5 sm:px-2"
            >
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-sea text-sm font-semibold text-white">
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
              <div class="h-10 w-16 animate-pulse rounded-lg bg-sand"></div>
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
            class="fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white z-[70] lg:hidden shadow-2xl flex flex-col overflow-hidden"
          >
            <!-- Drawer Header -->
            <div class="flex items-center justify-between border-b border-line bg-sand p-5">
              <div class="flex items-center gap-3">
                <Logo :size="'32'" />
                <span class="font-bold text-lg text-slate-900">GoTravelNha</span>
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
                    class="flex min-h-14 items-center gap-3 rounded-2xl px-4 text-base font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
                  >
                    <KlookIcon v-if="item.to === '/klook'" :size="20" />
                    {{ item.label }}
                    <span v-if="item.badge" class="rounded-full bg-sea px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-white">{{ item.badge }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </nav>

            <!-- Drawer Footer (User section) -->
            <div v-if="isAuthenticated" class="p-4 border-t border-slate-200 bg-slate-50">
              <div class="flex items-center gap-3 px-2 py-2">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
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
      :class="wide ? 'px-0 pt-16 lg:h-dvh lg:overflow-hidden' : 'container mx-auto flex-1 px-4 pt-[5.5rem] sm:px-6 lg:px-8'"
    >
      <NuxtPage />
    </main>

    <!-- Footer: always sticks to bottom -->
    <footer class="w-full bg-ink py-8 text-white" :class="wide ? 'mt-0' : 'mt-12 sm:mt-16 sm:py-10'">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-6 max-w-2xl">
          <div class="mb-3 flex items-center gap-2.5">
            <Logo :size="'28'" />
            <h3 class="text-lg font-semibold text-white">GoTravelNha</h3>
          </div>
          <p class="text-sm leading-relaxed text-white/75">
            Flight and hotel bookings open on Trip.com or Klook. Singapore attraction tickets that we sell are paid for here.
          </p>
        </div>
        <nav aria-label="Footer" class="mb-6 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
          <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="text-white/90 hover:text-white">{{ item.footerLabel || item.label }}</NuxtLink>
          <NuxtLink v-for="item in footerPlaces" :key="item.to" :to="item.to" class="text-white/90 hover:text-white">{{ item.label }}</NuxtLink>
        </nav>

        <div class="flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-4 text-center md:flex-row md:text-left">
          <p class="text-xs text-white/60 sm:text-sm">
            © {{ new Date().getFullYear() }} GoTravelNha. All rights reserved.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/70">
            <NuxtLink to="/help" class="py-1 hover:text-white">Help</NuxtLink>
            <NuxtLink to="/bookings" class="py-1 hover:text-white">My bookings</NuxtLink>
            <NuxtLink to="/contact" class="py-1 hover:text-white">Contact</NuxtLink>
            <NuxtLink to="/refund-policy" class="py-1 hover:text-white">Refunds</NuxtLink>
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
  background: #e6f4f4;
  color: #0b1f33;
}

.nav-link:hover {
  background-color: #f6f3ee;
}
</style>
