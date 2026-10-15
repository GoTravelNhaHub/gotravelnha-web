import type { Messages } from '../en'

const info: Messages['info'] = {
  policy: {
    updated: '最后更新：{date}',
    questions: '有疑问？',
    or: '或',
    useForm: '使用联系表单',
    englishPrevails: '本译文仅为方便阅读。如与英文版本不一致，以英文版本为准。'
  },
  help: {
    title: '帮助与常见问题',
    metaDescription: '了解在 GoTravelNha 上如何预订、获取门票、退款以及行程规划如何运作。',
    intro: '',
    sections: [
      {
        heading: '两种预订方式',
        html: '<ul><li><strong>在 GoTravelNha 通过"立即预订"付款的景点门票。</strong>你通过 Stripe 向我们付款，我们向供应商订票。这类预订由我们负责联系。</li><li><strong>在 Trip.com、Klook 等合作伙伴预订的机票、酒店和活动。</strong>这些链接会打开合作伙伴网站，预订、付款、改签和退款均由该合作伙伴按其条款处理。我们可能获得佣金，你无需支付额外费用。</li></ul>'
      },
      {
        heading: '什么时候能收到门票？',
        html: '<p>付款后，我们会发送一封含预订编号（GTN-…）的确认邮件。供应商出票后预订即确认，我们会在第二封邮件中发送门票。在此之前，状态显示为"正在确认门票"。</p>'
      },
      {
        heading: '如何查看我的预订？',
        html: '<p>前往<a href="/bookings">我的预订</a>，输入预订编号和付款时使用的邮箱。如果预订时已登录，预订会自动显示在那里。</p>'
      },
      {
        heading: '价格是最终价格吗？',
        html: '<p>GoTravelNha 结账价格以新加坡元计，即你实际支付的金额。如果在你打开页面和付款之间价格发生变化，我们会在扣款前请你确认。合作伙伴的价格由合作伙伴设定，并在你付款前于其网站上确认。</p>'
      },
      {
        heading: '可以取消或退款吗？',
        html: '<p>请参阅我们的<a href="/refund-policy">退款和取消政策</a>。合作伙伴的预订请直接联系该合作伙伴。</p>'
      },
      {
        heading: '已付款但没收到邮件',
        html: '<p>请先检查垃圾邮件文件夹，然后在<a href="/bookings">我的预订</a>中查询。如果仍然找不到，请用付款时的邮箱<a href="/contact">联系我们</a>。</p>'
      },
      {
        heading: '行程规划如何运作？',
        html: '<p>行程规划使用 AI 建议每日行程。活动旁显示的价格和余量来自合作伙伴，并在你打开行程时核实；AI 不设定价格。出发前请确认开放时间和详细信息。</p>'
      }
    ]
  },
  privacy: {
    title: '隐私政策',
    metaTitle: '隐私政策 | GoTravelNha',
    intro: '本政策说明 GoTravelNha 收集哪些个人数据、原因以及与谁共享。',
    sections: [
      {
        heading: '我们收集的信息',
        html: '<ul><li><strong>账户：</strong>姓名、用户名、邮箱和加密后的密码；如使用 Google 登录，则为你的 Google 资料。</li><li><strong>预订：</strong>姓名、邮箱、电话、所购门票及付款金额。银行卡信息由 Stripe 处理，而非我们。</li><li><strong>家庭资料（可选）：</strong>你添加的同行人员姓名、出生日期和备注。</li><li><strong>行程：</strong>目的地、日期、出行人年龄、预算、兴趣以及你保存的行程。</li><li><strong>消息：</strong>你通过联系表单发送的内容。</li><li><strong>使用情况：</strong>你访问的页面、对合作伙伴优惠的点击、设备和浏览器类型、屏幕尺寸、你选择的网站语言，以及你如何来到本站（例如活动标签或来源网站）。</li></ul>'
      },
      {
        heading: 'Cookie 和本地存储',
        html: '<ul><li><code>gotravelnha_session</code>：保持登录状态（7 天）。</li><li><code>gtn_sid</code> 及对应的本地存储 ID：随机访客 ID，用于了解哪些页面带来了预订（30 天）。</li><li><code>gtn_attr</code>：你首次和最近一次来到本站的方式，例如活动标签或广告点击 ID（30 天）。</li><li><code>gotravelnha_lang</code>（本地存储）：你选择的网站语言。</li><li>当你跳转到合作伙伴网站时，对方会设置其自己的 Cookie。</li></ul>'
      },
      {
        heading: '我们与谁共享数据',
        html: '<ul><li><strong>Stripe</strong>，用于处理付款和发送收据。</li><li><strong>门票供应商</strong>，提供出票所需的信息。</li><li><strong>Anthropic（Claude）</strong>，在你使用行程规划时：会发送你的行程信息、出行人年龄和备注以生成行程。</li><li><strong>邮件服务商</strong>，用于发送预订和账户邮件。</li><li><strong>合作伙伴</strong>如 Trip.com 和 Klook，在你点击跳转时会收到跟踪编号，以便记录推荐来源。</li></ul><p>我们不会出售你的个人数据。</p>'
      },
      {
        heading: '你的选择',
        html: '<p>你可以在账户中编辑或删除家庭资料和已保存的行程。如需获取数据副本、更正或删除数据，请联系我们。我们会在会计和法律义务所需的期限内保留预订记录。</p>'
      }
    ]
  },
  terms: {
    title: '服务条款',
    metaTitle: '服务条款 | GoTravelNha',
    intro: '使用 GoTravelNha 即表示你同意以下条款。',
    sections: [
      {
        heading: 'GoTravelNha 提供的服务',
        html: '<ul><li><strong>通过本站结账销售的景点门票。</strong>我们收取你的付款并代你向供应商订票。这些门票的合同方为 GoTravelNha。</li><li><strong>合作伙伴链接。</strong>指向 Trip.com、Klook 等合作伙伴的链接会将你带到其网站。在那里完成的预订是你与该合作伙伴之间的合同，适用合作伙伴的条款。我们可能获得佣金。</li></ul>'
      },
      {
        heading: '价格与付款',
        html: '<ul><li>结账价格以新加坡元计，并在你付款前于 Stripe 付款页面上确认。</li><li>付款由 Stripe 处理。我们不会查看或存储你的完整银行卡信息。</li><li>供应商出票后预订即确认。我们会通过邮件发送门票，并在你的预订页面显示。</li><li>优惠码须在付款时使用，事后无法补加。</li></ul>'
      },
      {
        heading: '取消与退款',
        html: '<p>请参阅我们的<a href="/refund-policy">退款和取消政策</a>。</p>'
      },
      {
        heading: '行程规划与推荐',
        html: '<p>行程和推荐仅供参考，部分由 AI 生成，可能不完整或已过时。请自行确认开放时间、年龄限制和出行信息。所显示的价格和余量来自我们的供应商和合作伙伴，而非 AI。</p>'
      },
      {
        heading: '你的账户',
        html: '<p>请妥善保管密码。你需对账户中的活动负责。对于用于欺诈或滥用的账户，我们可能会暂停使用。</p>'
      }
    ]
  },
  refund: {
    title: '退款和取消政策',
    metaTitle: '退款和取消政策 | GoTravelNha',
    intro: '本政策适用于通过 GoTravelNha 结账购买的景点门票。在合作伙伴网站（如 Trip.com 或 Klook）上完成的预订适用该合作伙伴的政策。',
    sections: [
      {
        heading: '各景点的取消条款',
        html: '<p>每个景点会在付款前于其页面上显示取消条款。这些条款由景点或供应商制定，适用于你的预订。许多门票一经出票便无法取消。</p>'
      },
      {
        heading: '如果我们无法出票',
        html: '<p>如果你付款后供应商无法出票，我们会联系你并退还你支付的金额。</p>'
      },
      {
        heading: '申请取消或退款',
        html: '<p>请提供预订编号（GTN-…）并<a href="/contact">联系我们</a>。我们会与供应商核对景点的条款，并告知你能否退款。</p>'
      },
      {
        heading: '退款方式',
        html: '<p>退款会通过 Stripe 退回到你使用的银行卡或付款方式。退款发出后我们会发邮件通知你。银行可能需要 5–10 个工作日才会显示。</p>'
      }
    ]
  },
  contact: {
    eyebrow: '客户支持',
    title: '我们能帮你什么？',
    subtitle: '关于预订、AI 旅行助手或其他任何问题，都可以给我们留言。我们会通过邮件回复。',
    asideLabel: '其他获取帮助的方式',
    ticketsTitle: '在 GoTravelNha 购买的门票',
    ticketsText: '如是新加坡景点门票，请在表单中填写预订编号，方便我们查找订单。',
    myBookings: '我的预订',
    refund: '退款政策',
    partnerTitle: '在 Trip.com 或 Klook 预订的？',
    partnerText: '在 Trip.com 或 Klook 付款的机票、酒店和活动由对应平台管理。如需改签或退款，请通过预订确认信息联系对方。',
    quickTitle: '快速解答',
    quickText: '关于预订、合作伙伴和 AI 旅行助手的常见问题。',
    helpCentre: '前往帮助中心',
    preferEmail: '想发邮件？',
    metaTitle: '联系我们 - GoTravelNha',
    metaDescription: '联系 GoTravelNha。我们随时为你的旅行预订提供帮助并解答疑问。'
  },
  form: {
    sentTitle: '消息已发送',
    sentText: '感谢你的来信。我们会回复到你提供的邮箱。',
    another: '再发一条消息',
    title: '给我们留言',
    requiredBefore: '标有',
    requiredAfter: '的字段为必填项。',
    withAsterisk: '星号',
    name: '姓名',
    namePlaceholder: '你的全名',
    email: '邮箱',
    reference: '预订编号',
    optional: '（可选）',
    referenceHint: '适用于在 GoTravelNha 购买的新加坡景点门票，编号见确认邮件。',
    message: '留言',
    messagePlaceholder: '告诉我们你需要什么帮助',
    privacyBefore: '我们只会用你的信息回复你。详见我们的',
    privacy: '隐私政策',
    sending: '发送中…',
    send: '发送消息',
    failed: '消息发送失败，请稍后再试。'
  },
  unsubscribe: {
    doneTitle: '已退订',
    title: '退订邮件',
    doneText: '我们将不再向 {email} 发送新闻邮件。',
    confirm: '停止向 {email} 发送新闻邮件？',
    thisAddress: '此邮箱',
    unsubscribing: '正在退订…',
    unsubscribe: '退订',
    back: '返回 GoTravelNha',
    failed: '退订失败，请重试。',
    metaTitle: '退订 | GoTravelNha'
  },
  exchange: {
    title: '货币兑换',
    powered: '汇率由 exchangerate.host 提供',
    name: '你的姓名',
    email: '你的邮箱',
    sgdAmount: '新加坡元金额',
    vndAmount: '越南盾金额',
    amountPlaceholder: '输入金额',
    submit: '提交',
    unavailable: '汇率服务暂时不可用，请稍后再试。',
    sent: '✅ 你的兑换申请已发送！',
    failed: '❌ 发送失败，请重试。'
  }
}

export default info
