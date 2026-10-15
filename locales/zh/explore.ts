import type { Messages } from '../en'

const explore: Messages['explore'] = {
  meta: {
    title: 'AI 家庭旅行规划 | GoTravelNha',
    description: '用 AI 旅行助手按天规划家庭假期，然后在 Trip.com 和 Klook 上比较机票、酒店和活动再预订。'
  },
  hero: {
    eyebrow: '专为家庭打造的 AI 行程规划',
    title: '几分钟，规划好全家的假期。',
    subtitle: '告诉我们去哪里、和谁一起去。获取按天安排的行程，再到 Trip.com 和 Klook 查找机票、酒店和活动。',
    trust: ['专属每日行程', '与家人一起分享', '付款前比较预订选项']
  },
  prompt: {
    label: '描述你的旅行',
    placeholderPrefix: '例如：',
    examples: [
      '东京 5 天，2 位成人和 2 个孩子（4 岁和 9 岁），节奏轻松',
      '首尔 4 天，带一个学步的宝宝',
      '和青少年孩子去曼谷过周末',
      '学校假期去巴厘岛一周'
    ],
    try: '试试：',
    submit: '规划我的行程',
    secondary: '或查找旅行优惠',
    needsText: '请描述你的旅行，或选择下面的示例。'
  },
  sample: {
    eyebrow: '你将获得',
    title: '一份真正可以照着走的行程',
    introBefore: '这是一份行程的示例：',
    brief: '东京 3 天，孩子 4 岁和 9 岁',
    introAfter: '。每天一个区域，景点之间路程短，并为小朋友预留休息时间。',
    points: ['按每个孩子的年龄推荐景点', '标注景点之间的交通时间', '机票、酒店和门票的预订链接'],
    cta: '定制这趟行程',
    prompt: '东京 3 天，2 位成人和 2 个孩子（4 岁和 9 岁），节奏轻松',
    tabsLabel: '示例行程日',
    day: '第 {n} 天',
    note: '示例行程。时间和交通均为估算，出发前请确认开放日。',
    days: [
      {
        title: '浅草和晴空塔',
        stops: [
          { time: '9:00', name: '浅草寺', note: '趁人少早点去，在仲见世通尝尝小吃。', next: '步行约 20 分钟或坐一站电车' },
          { time: '11:30', name: '墨田水族馆', note: '室内安静，适合 4 岁的孩子。', next: '同一栋楼' },
          { time: '13:00', name: '午餐和晴空塔观景台', note: '旺季建议提前预约观景台时段。', next: '' },
          { time: '15:00', name: '回酒店休息', note: '小朋友的午睡时间。', next: '' }
        ]
      },
      {
        title: '上野公园',
        stops: [
          { time: '9:30', name: '上野动物园', note: '先看熊猫，排队很快变长。通常周一闭园。', next: '穿过公园步行约 10 分钟' },
          { time: '12:30', name: '公园野餐午餐', note: '在便利店买午餐最方便。', next: '步行约 5 分钟' },
          { time: '13:30', name: '国立科学博物馆', note: '恐龙和互动展厅，适合 9 岁的孩子。', next: '' }
        ]
      },
      {
        title: '台场和丰洲',
        stops: [
          { time: '9:30', name: 'teamLab Planets', note: '需预约时段。有涉水展区，建议穿短裤。', next: '乘百合海鸥线约 15 分钟' },
          { time: '12:30', name: '台场商场午餐', note: '有家庭餐厅和室内游乐区。', next: '' },
          { time: '14:00', name: '日本科学未来馆', note: '机器人和太空主题。通常周二闭馆。', next: '' }
        ]
      }
    ]
  },
  destinations: {
    eyebrow: '家庭热门目的地',
    title: '下一站去哪里？',
    subtitle: '选择一个城市，AI 助手会开始为你规划。',
    all: '全部 {count} 个目的地 →',
    cta: '开始规划'
  },
  deals: {
    title: '查找机票、酒店和活动'
  },
  compare: {
    eyebrow: '比较预订选项',
    title: '预订前，看看 Trip.com 和 Klook',
    text: '不同平台的价格、房型和包含内容各不相同。每份指南都链接到两个平台，你可以分别查看实时价格，再选择总价最适合全家的平台预订。',
    flights: '机票',
    hotels: '酒店',
    attractions: '景点门票',
    tripPoints: ['机票和酒店选择丰富', '快速查看票价和房型', '路线和日期灵活'],
    klookPoints: ['旅游团、景点和交通', '住宿与活动打包', '到达后预订活动很方便']
  },
  guides: {
    eyebrow: '预订指南',
    title: '每个平台需要注意什么',
    subtitle: '每份指南都链接到 Trip.com 和 Klook，并附上付款前需要确认的要点。',
    count: '{count} 份指南',
    emptyTitle: '暂无预订指南',
    emptyText: '机票、酒店和景点指南发布后会显示在这里。',
    fallbackOutcome: '在一个页面打开两个平台。',
    items: {
      flights: { title: '找到最合适的机票预订方式', outcome: '在一个页面打开 Trip.com 和 Klook 的机票搜索，选择总价最合适的平台预订。', destination: '全球', category: '机票' },
      hotels: { title: '找到最合适的酒店预订方式', outcome: '打开 Trip.com 和 Klook 的酒店搜索，分别查看房型和总价。', destination: '全球', category: '酒店' },
      attractions: { title: '找到最合适的景点门票', outcome: '打开 Trip.com 和 Klook 的新加坡门票页面，查看各自包含的内容。', destination: '新加坡', category: '景点门票' }
    }
  },
  how: {
    eyebrow: '使用方法',
    title: '规划、调整，然后预订',
    steps: [
      { title: '描述旅行', text: '去哪里、什么时候去，以及每位同行者的年龄。' },
      { title: '调整行程', text: '想省钱一点、少走路或多些亲子活动？告诉助手，它会帮你修改。' },
      { title: '保存、分享并预订', text: '保存行程、发给家人，然后在 Trip.com 或 Klook 预订。' }
    ]
  },
  newsletter: {
    title: '提前规划下一个学校假期',
    text: '家庭旅行灵感、现成的行程，以及偶尔来自 Trip.com 或 Klook 的优惠，直接发到你的邮箱。',
    button: '给我发灵感'
  },
  bookingNote: {
    text: '机票和酒店在 Trip.com 或 Klook 完成付款。我们销售的新加坡景点门票在 GoTravelNha 付款。如有疑问，请前往帮助中心或联系我们。',
    help: '帮助中心',
    contact: '联系我们'
  }
}

export default explore
