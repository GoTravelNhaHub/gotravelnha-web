import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { communityEnabled } from '~/utils/feature-flags'
import { FAMILY_HUB_URL } from '~/utils/family-hub'

export interface AppNavItem {
  key: string
  label: string
  icon: string
  activeIcon?: string
  /** Internal route. Null: not built yet, shown as "coming soon" */
  to: string | null
  /** External link, opened in a new tab */
  href?: string
}

/**
 * Header, side rail, phone menu and tab bar of the site (the community design).
 * Community-only items (Saved, Following, Notifications) appear only with NUXT_PUBLIC_ENABLE_COMMUNITY on,
 * so production never shows a menu of placeholders.
 */
export const useAppNav = () => {
  const { t } = useI18n()
  const route = useRoute()
  const community = computed(() => communityEnabled(useRuntimeConfig().public))

  const main = computed<AppNavItem[]>(() => [
    { key: 'home', label: t('community.feed.nav.home'), icon: 'home', to: '/explore' },
    ...(community.value ? [{ key: 'community', label: t('community.feed.nav.community'), icon: 'users', activeIcon: 'usersSolid', to: '/community' }] : []),
    { key: 'planner', label: t('community.feed.nav.planner'), icon: 'compass', to: '/planner' },
    { key: 'myTrips', label: t('community.feed.nav.myTrips'), icon: 'trips', to: '/mytrip' },
    // Following and Notifications are later community steps (docs/gotravelnha-social-transformation.md)
    ...(community.value
      ? [
          { key: 'saved', label: t('community.feed.nav.saved'), icon: 'bookmark', to: '/saved' },
          { key: 'following', label: t('community.feed.nav.following'), icon: 'following', to: null },
          { key: 'notifications', label: t('community.feed.nav.notifications'), icon: 'bell', to: null }
        ]
      : [])
  ])

  const partners = computed<AppNavItem[]>(() => [
    { key: 'trip', label: 'Trip.com', icon: 'hotel', to: '/trip' },
    { key: 'klook', label: 'Klook', icon: 'klook', to: '/klook' },
    { key: 'familyhub', label: 'FamilyHub', icon: 'external', to: null, href: FAMILY_HUB_URL }
  ])

  const pick = (keys: string[]) => keys.map((key) => [...main.value, ...partners.value].find((item) => item.key === key)).filter((item): item is AppNavItem => !!item)

  // As in the community design; without the community, real destinations replace its placeholders
  const header = computed(() => (community.value ? pick(['home', 'community', 'planner', 'saved']) : pick(['home', 'planner', 'myTrips', 'trip', 'klook'])))
  const tabs = computed(() => [
    ...(community.value ? pick(['home', 'community', 'planner', 'saved']) : pick(['home', 'planner', 'myTrips'])),
    { key: 'profile', label: t('community.feed.nav.profile'), icon: 'user', to: '/user' }
  ])

  const isActive = (item: AppNavItem) =>
    !!item.to && (route.path === item.to || route.path.startsWith(`${item.to}/`))

  return { main, partners, header, tabs, community, isActive }
}
