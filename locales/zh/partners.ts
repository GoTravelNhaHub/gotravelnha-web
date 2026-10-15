import type { Messages } from '../en'

const partners: Messages['partners'] = {
  trip: {
    eyebrow: '酒店和机票',
    title: '找到住处，然后在 Trip.com 预订',
    subtitle: '在这里搜索酒店和机票。付款前，Trip.com 会显示房型、票价和总价。',
    trust: ['在 Trip.com 付款', 'GoTravelNha 不收取费用', '一次搜索酒店和机票'],
    badge: '预订合作伙伴',
    searchLabel: '搜索酒店和机票',
    placesEyebrow: '住宿城市',
    placesTitle: '适合家庭入住的热门城市',
    placesSubtitle: '选择一个城市，然后在上方搜索框中添加日期。',
    searchHotels: '搜索酒店',
    offersEyebrow: '优惠',
    offersTitle: 'Trip.com 当前优惠',
    offersSubtitle: '这些促销会在 Trip.com 打开，价格以 Trip.com 为准。',
    bookingNote: '酒店和机票在 Trip.com 完成付款。GoTravelNha 不对这些预订收取费用。',
    bannerOffer: 'Trip.com 优惠横幅',
    bannerDeals: 'Trip.com 特价横幅',
    promotion: 'Trip.com 促销',
    metaTitle: 'Trip.com 酒店和机票 | GoTravelNha',
    metaDescription: '搜索酒店和机票，然后在 Trip.com 预订。付款前会确认房型、票价和总价。'
  },
  klook: {
    eyebrow: '活动与体验',
    title: '找到好玩的，然后在 Klook 预订',
    subtitle: '在这里搜索活动。付款前，Klook 会显示门票、时间和价格。',
    trust: ['在 Klook 付款', 'GoTravelNha 不收取费用', '景点、旅游团和交通'],
    badge: 'Klook 预订合作伙伴',
    searchTitle: '搜索 Klook',
    searchNote: '结果会在 Klook 打开，门票、时间和价格以 Klook 为准。',
    placesEyebrow: '探索城市',
    placesTitle: '按城市找好去处',
    placesSubtitle: '打开该城市的 Klook 搜索。城市卡片只是起点，并非已确认的门票。',
    searchOnKlook: '在 Klook 搜索',
    collectionsEyebrow: '精选合集',
    collectionsTitle: '按类别浏览',
    collectionsSubtitle: '浏览 Klook 通过 GoTravelNha 展示的内容。',
    collectionsLabel: 'Klook 合集',
    thingsToDo: '好玩的',
    hotels: '酒店',
    loadingCollections: '正在加载 Klook 合集…',
    failedTitle: 'Klook 合集未能加载',
    failedText: '请刷新页面重试。你仍然可以使用上方的搜索。',
    emptyHotels: '暂无酒店合集',
    emptyActivities: '暂无活动合集',
    emptyText: '请使用上方的搜索。合集发布后会显示在这里。',
    bookingNote: '活动在 Klook 完成付款。GoTravelNha 不对这些预订收取费用。',
    categories: {
      attractions: { name: '景点与演出', description: '主题乐园、博物馆和演出' },
      tours: { name: '旅游团与观光', description: '导览团和观光体验' },
      food: { name: '美食餐饮', description: '餐厅预订和美食体验' },
      transport: { name: '交通与 WiFi', description: '火车、巴士和上网' },
      activities: { name: '活动与体验', description: '探险活动和特色体验' },
      passes: { name: '景点通票', description: '多景点通票和套餐' }
    },
    metaTitle: 'Klook 活动、旅游团与优惠 | GoTravelNha',
    metaDescription: '在这里搜索活动，然后在 Klook 打开。门票、时间和价格以 Klook 为准。'
  },
  guide: {
    allGuides: '全部预订指南',
    compareTitle: '比较预订选项',
    bookingPartner: '{provider} · 预订合作伙伴',
    openSameTab: '点击合作伙伴即可打开其应用或网站（iPhone/iPad 在当前页打开）。',
    openNewTab: '点击合作伙伴即可在新标签页打开其网站。',
    heroTrust: ['链接到 Trip.com 和 Klook', '实时价格以合作伙伴网站为准', 'GoTravelNha 不收取费用'],
    whyEyebrow: '为什么两个都看看',
    whyTitle: '两个平台，一个入口',
    tipsEyebrow: '小贴士',
    tipsTitle: '付款前',
    keepPlanning: '继续规划',
    moreWays: '更多规划方式',
    related: {
      flights: { label: '机票', detail: '比较 Trip.com 和 Klook 的机票搜索' },
      hotels: { label: '酒店', detail: '预订前比较酒店搜索' },
      attractions: { label: '景点门票', detail: '比较 Trip.com 和 Klook 的景点门票' },
      planner: { label: 'AI 旅行助手', detail: '为全家生成每日行程' }
    },
    stripFlight: '打开 Trip.com 或 Klook 查看实时票价，选择航班，并在你最信任的平台完成付款。',
    stripHotel: '比较房型和价格，然后预订心仪的住处——付款和确认都在合作伙伴网站完成。',
    stripOther: '比较门票选项和余量，然后预订——在 Trip.com 或 Klook 完成付款。',
    hintTrip: '点击后，实时价格、座位和付款都在 Trip.com 完成。',
    hintKlook: '点击后，实时价格、门票和付款都在 Klook 完成。',
    cta: {
      tripFlight: '在 Trip.com 搜索机票',
      tripHotel: '在 Trip.com 浏览酒店',
      tripOther: '在 Trip.com 浏览好玩的',
      klookFlight: '在 Klook 搜索交通和机票',
      klookHotel: '在 Klook 浏览酒店',
      klookOther: '在 Klook 浏览景点门票',
      other: '打开合作伙伴'
    },
    bookingNote: '在 Trip.com 或 Klook 完成付款，价格和余量以其为准。GoTravelNha 不对这些预订收取费用。',
    items: {
      flights: {
        title: '找到最合适的机票预订方式',
        description: '打开 Trip.com 和 Klook 的机票搜索，分别查看总票价，然后选择最适合这趟旅行的平台预订。',
        badge: '机票',
        destination: '全球',
        trip: { label: 'Trip.com 机票', priceNote: '在一个地方搜索多家航空公司和航线。', highlight: '适合灵活选择航线和快速比价。' },
        klook: { label: 'Klook 机票', priceNote: '前往 Klook 机票和交通预订页面。', highlight: '如果你也打算在 Klook 预订活动，会很方便。' },
        summaryBullets: ['在一个地方比较可信赖旅行平台的预订选项。', '付款前核对总票价、行李和附加费用。', '调整日期，快速找到更低票价。'],
        tips: ['行程允许时，尝试周中出发。', '如果多次访问时价格上涨，可使用无痕模式或清除 Cookie。', '预订特价机票前，确认签证和转机规定。']
      },
      hotels: {
        title: '找到最合适的酒店预订方式',
        description: '比较 Trip.com 和 Klook 的酒店预订页面，找到合适的住处和价格。',
        badge: '酒店',
        destination: '全球',
        trip: { label: 'Trip.com 酒店', priceNote: '从经济型到高端酒店，筛选方便。', highlight: '想要更多酒店选择时的好选择。' },
        klook: { label: 'Klook 酒店', priceNote: '打开 Klook 酒店页面查看当前房价。', highlight: '适合把酒店和 Klook 活动一起预订。' },
        summaryBullets: ['比较两个可信赖预订平台的房型。', '查看各平台的促销价和会员福利。', '付款前务必确认取消政策。'],
        tips: ['比较含税费和杂费在内的住宿总价。', '计划可能变动时选择可免费取消的价格。', '付款前在合作伙伴网站查看地图位置和评价。']
      },
      attractions: {
        title: '找到最合适的景点门票',
        description: '比较 Trip.com 和 Klook 的景点门票页面，然后选择最划算的平台预订。',
        badge: '景点门票',
        destination: '新加坡',
        trip: { label: 'Trip.com 景点门票', priceNote: '快速浏览景点和活动门票。', highlight: '适合比较热门城市体验。' },
        klook: { label: 'Klook 景点门票', priceNote: '打开 Klook 景点列表和门票选项。', highlight: '在 Klook 组合门票和体验时非常方便。' },
        summaryBullets: ['在一个地方打开两个平台的景点页面。', '付款前查看价格差异和门票包含内容。', '选择符合行程和预算的选项。'],
        tips: ['比较快速通道、套餐和取消政策等包含内容。', '付款前确认不可用日期和当日兑换规则。', '尽量选择工作日前往，人更少。']
      }
    }
  },
  legacy: {
    platform: '平台',
    category: '类别',
    deal: '优惠',
    price: '价格',
    seePartner: '见合作伙伴页面',
    priceChecked: '价格核实于 {date}',
    confirmPrice: '请向合作伙伴确认价格',
    discount: '折扣',
    off: '减 {percent}%',
    checkPrice: '查看实时价格',
    notFoundTitle: '未找到优惠页面',
    notFoundText: '此链接与任何模板或现有优惠都不匹配。',
    back: '返回优惠'
  }
}

export default partners
