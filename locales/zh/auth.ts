import type { Messages } from '../en'

const auth: Messages['auth'] = {
  shell: {
    back: '返回网站',
    privacy: '隐私',
    terms: '条款'
  },
  google: {
    opening: '正在打开 Google…',
    continue: '使用 Google 继续',
    signUp: '使用 Google 注册',
    failedIn: 'Google 登录失败',
    failedUp: 'Google 注册失败'
  },
  password: {
    show: '显示密码',
    hide: '隐藏密码'
  },
  login: {
    title: '登录',
    description: '欢迎回来。继续查看已保存的行程和预订。',
    headline: '全家的旅行，尽在一处。',
    subline: '登录后可查看保存的 AI 行程、家庭资料和预订。',
    points: ['保存 AI 旅行助手生成的行程', '家人的年龄和需求随时用于规划', '在一个地方管理所有预订'],
    divider: '或使用邮箱登录',
    username: '用户名或邮箱',
    password: '密码',
    forgot: '忘记密码？',
    passwordPlaceholder: '你的密码',
    remember: '记住我',
    submitting: '登录中…',
    submit: '登录',
    newHere: '第一次使用 GoTravelNha？',
    create: '创建账户',
    invalid: '用户名或密码错误',
    completeFailed: '登录未能完成'
  },
  register: {
    title: '创建账户',
    description: '免费注册。保存行程，并把家人的信息集中在一处。',
    headline: '规划家庭旅行，少些来回折腾。',
    subline: '账户会把你的行程、出行人和预订放在一起。',
    points: ['保存 AI 旅行助手生成的行程', '每天最多 10 份 AI 行程（未登录 3 份）', '一份包含年龄和需求的家庭资料', '在一个地方管理所有预订'],
    referral: '你正在使用推荐码注册。邀请你的朋友会在你注册后获得积分。',
    divider: '或使用邮箱',
    firstName: '名',
    lastName: '姓',
    username: '用户名',
    email: '邮箱',
    password: '密码',
    passwordPlaceholder: '至少 8 个字符',
    passwordHint: '请使用 8 个或以上字符。',
    agreeBefore: '我同意',
    terms: '服务条款',
    and: '和',
    privacy: '隐私政策',
    submitting: '正在创建账户…',
    submit: '创建账户',
    haveAccount: '已有账户？',
    signIn: '登录',
    success: '账户创建成功！正在跳转...',
    failed: '注册失败，请重试。'
  },
  forgot: {
    title: '重置密码',
    description: '输入账户邮箱，我们会发送一个设置新密码的链接。',
    headline: '一分钟后继续规划。',
    subline: '已保存的行程和家庭资料保持不变。',
    checkEmail: '请查收邮件',
    email: '邮箱',
    sending: '发送中…',
    send: '发送重置链接',
    backToSignIn: '返回登录',
    noAccount: '还没有账户？',
    createOne: '创建一个',
    sent: '密码重置说明已发送至 {email}。请查收邮件并按说明重置密码。',
    sentMaybe: '如果该邮箱已注册，重置说明已发送，请查收收件箱。'
  },
  reset: {
    title: '设置新密码',
    description: '请使用 8 个或以上字符，下次用它登录。',
    updated: '密码已更新',
    newPassword: '新密码',
    newPlaceholder: '至少 8 个字符',
    confirm: '确认新密码',
    confirmPlaceholder: '再输入一次',
    saving: '保存中…',
    save: '保存新密码',
    continue: '继续登录',
    back: '返回登录',
    invalidToken: '重置链接无效或缺失，请重新申请重置密码。',
    mismatch: '两次输入的密码不一致',
    success: '密码已重置成功，现在可以用新密码登录。',
    failed: '密码重置失败，链接可能无效或已过期。'
  }
}

export default auth
