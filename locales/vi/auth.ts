import type { Messages } from '../en'

const auth: Messages['auth'] = {
  shell: {
    back: 'Quay lại trang chủ',
    privacy: 'Bảo mật',
    terms: 'Điều khoản'
  },
  google: {
    opening: 'Đang mở Google…',
    continue: 'Tiếp tục với Google',
    signUp: 'Đăng ký với Google',
    failedIn: 'Không thể đăng nhập bằng Google',
    failedUp: 'Không thể đăng ký bằng Google'
  },
  redirect: {
    opening: 'Đang chuyển bạn đến trang đăng nhập bảo mật của GoTravelNha…',
    failed: 'Đăng nhập chưa hoàn tất. Vui lòng thử lại.'
  },
  password: {
    show: 'Hiện mật khẩu',
    hide: 'Ẩn mật khẩu'
  },
  login: {
    title: 'Đăng nhập',
    description: 'Chào mừng bạn trở lại. Tiếp tục với các chuyến đi và đơn đặt đã lưu.',
    headline: 'Mọi chuyến đi của gia đình, ở cùng một nơi.',
    subline: 'Đăng nhập để xem kế hoạch du lịch AI đã lưu, hồ sơ gia đình và các đơn đặt của bạn.',
    points: ['Kế hoạch đã lưu từ Trợ lý du lịch AI', 'Tuổi và nhu cầu của gia đình sẵn sàng cho mọi kế hoạch', 'Theo dõi đơn đặt ở một nơi'],
    divider: 'hoặc đăng nhập bằng email',
    username: 'Tên đăng nhập hoặc email',
    password: 'Mật khẩu',
    forgot: 'Quên mật khẩu?',
    passwordPlaceholder: 'Mật khẩu của bạn',
    remember: 'Ghi nhớ đăng nhập',
    submitting: 'Đang đăng nhập…',
    submit: 'Đăng nhập',
    newHere: 'Mới dùng GoTravelNha?',
    create: 'Tạo tài khoản',
    invalid: 'Tên đăng nhập hoặc mật khẩu không đúng',
    completeFailed: 'Không thể hoàn tất đăng nhập'
  },
  register: {
    title: 'Tạo tài khoản',
    description: 'Miễn phí. Lưu kế hoạch du lịch và giữ thông tin gia đình ở một nơi.',
    headline: 'Lên kế hoạch du lịch gia đình nhẹ nhàng hơn.',
    subline: 'Tài khoản giữ kế hoạch, người đi và đơn đặt của bạn ở cùng một nơi.',
    points: ['Lưu kế hoạch từ Trợ lý du lịch AI', 'Tối đa 10 kế hoạch AI mỗi ngày (khách: 3)', 'Một hồ sơ gia đình với tuổi và nhu cầu', 'Theo dõi đơn đặt ở một nơi'],
    referral: 'Bạn đang tham gia bằng mã giới thiệu. Người giới thiệu sẽ nhận điểm khi bạn đăng ký.',
    divider: 'hoặc dùng email',
    firstName: 'Tên',
    lastName: 'Họ',
    username: 'Tên đăng nhập',
    email: 'Email',
    password: 'Mật khẩu',
    passwordPlaceholder: 'Ít nhất 8 ký tự',
    passwordHint: 'Dùng 8 ký tự trở lên.',
    agreeBefore: 'Tôi đồng ý với',
    terms: 'Điều khoản dịch vụ',
    and: 'và',
    privacy: 'Chính sách bảo mật',
    submitting: 'Đang tạo tài khoản…',
    submit: 'Tạo tài khoản',
    haveAccount: 'Đã có tài khoản?',
    signIn: 'Đăng nhập',
    success: 'Tạo tài khoản thành công! Đang chuyển trang...',
    failed: 'Đăng ký không thành công. Vui lòng thử lại.'
  },
  forgot: {
    title: 'Đặt lại mật khẩu',
    description: 'Nhập email của tài khoản, chúng tôi sẽ gửi liên kết để bạn đặt mật khẩu mới.',
    headline: 'Quay lại lên kế hoạch trong một phút.',
    subline: 'Các chuyến đi đã lưu và hồ sơ gia đình vẫn được giữ nguyên.',
    checkEmail: 'Kiểm tra email của bạn',
    email: 'Email',
    sending: 'Đang gửi…',
    send: 'Gửi liên kết đặt lại',
    backToSignIn: 'Quay lại đăng nhập',
    noAccount: 'Chưa có tài khoản?',
    createOne: 'Tạo tài khoản',
    sent: 'Hướng dẫn đặt lại mật khẩu đã được gửi tới {email}. Vui lòng kiểm tra email và làm theo hướng dẫn.',
    sentMaybe: 'Nếu email này có tài khoản, hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.'
  },
  reset: {
    title: 'Chọn mật khẩu mới',
    description: 'Dùng 8 ký tự trở lên. Bạn sẽ đăng nhập bằng mật khẩu này lần sau.',
    updated: 'Đã cập nhật mật khẩu',
    newPassword: 'Mật khẩu mới',
    newPlaceholder: 'Ít nhất 8 ký tự',
    confirm: 'Nhập lại mật khẩu mới',
    confirmPlaceholder: 'Nhập lại',
    saving: 'Đang lưu…',
    save: 'Lưu mật khẩu mới',
    continue: 'Tiếp tục đăng nhập',
    back: 'Quay lại đăng nhập',
    invalidToken: 'Liên kết đặt lại không hợp lệ hoặc bị thiếu. Vui lòng yêu cầu đặt lại mật khẩu mới.',
    mismatch: 'Mật khẩu không khớp',
    success: 'Mật khẩu đã được đặt lại. Bạn có thể đăng nhập bằng mật khẩu mới.',
    failed: 'Không thể đặt lại mật khẩu. Liên kết có thể không hợp lệ hoặc đã hết hạn.'
  }
}

export default auth
