import { computed } from 'vue'
import { communityEnabled } from '~/utils/feature-flags'

/** Main site navigation, shared by the default and community layouts and the footer */
export const useSiteNav = () => {
  const { t } = useI18n()
  const config = useRuntimeConfig().public
  const showCommunity = computed(() => communityEnabled(config))

  const navItems = computed(() => [
    { to: '/explore', label: t('common.nav.explore') },
    ...(showCommunity.value ? [{ to: '/community', label: t('common.nav.community') }] : []),
    { to: '/trip', label: 'Trip.com' },
    { to: '/klook', label: 'Klook' },
    { to: '/planner', label: t('common.nav.planner'), footerLabel: t('common.nav.plannerShort'), badge: t('common.nav.new') }
  ])

  return { navItems, showCommunity }
}
