import type { Messages } from '../en'

const info: Messages['info'] = {
  policy: {
    updated: 'Cập nhật lần cuối {date}',
    questions: 'Có câu hỏi?',
    or: 'hoặc',
    useForm: 'dùng biểu mẫu liên hệ',
    englishPrevails: 'Bản dịch này nhằm giúp bạn đọc thuận tiện. Nếu có khác biệt so với bản tiếng Anh, bản tiếng Anh sẽ được áp dụng.'
  },
  help: {
    title: 'Trợ giúp & Câu hỏi thường gặp',
    metaDescription: 'Cách đặt chỗ qua đối tác và cách trợ lý lên kế hoạch hoạt động trên GoTravelNha.',
    intro: '',
    sections: [
      {
        heading: 'Cách đặt chỗ',
        html: '<p>Vé máy bay, khách sạn và hoạt động được mở trên Trip.com, Klook và các đối tác khác. Việc đặt chỗ, thanh toán, thay đổi và hoàn tiền do đối tác xử lý theo điều khoản của họ. Chúng tôi có thể nhận hoa hồng mà bạn không phải trả thêm chi phí.</p>'
      },
      {
        heading: 'Giá có phải là giá cuối cùng?',
        html: '<p>Giá của đối tác do đối tác quy định và được xác nhận trên trang của họ trước khi bạn thanh toán.</p>'
      },
      {
        heading: 'Tôi có thể hủy hoặc được hoàn tiền không?',
        html: '<p>Hãy liên hệ đối tác bạn đã đặt. Việc thay đổi và hoàn tiền theo chính sách của đối tác đó.</p>'
      },
      {
        heading: 'Trợ lý lên kế hoạch hoạt động thế nào?',
        html: '<p>Trợ lý dùng AI để gợi ý kế hoạch theo từng ngày. Giá và tình trạng còn chỗ hiển thị bên cạnh các hoạt động do đối tác cung cấp và được kiểm tra khi bạn mở kế hoạch; AI không đặt giá. Hãy kiểm tra giờ mở cửa và thông tin chi tiết trước khi đi.</p>'
      }
    ]
  },
  privacy: {
    title: 'Chính sách bảo mật',
    metaTitle: 'Chính sách bảo mật | GoTravelNha',
    intro: 'Chính sách này giải thích GoTravelNha thu thập dữ liệu cá nhân nào, vì sao, và chia sẻ với ai.',
    sections: [
      {
        heading: 'Chúng tôi thu thập gì',
        html: '<ul><li><strong>Tài khoản:</strong> tên, tên đăng nhập, email và mật khẩu đã mã hóa, hoặc hồ sơ Google nếu bạn đăng nhập bằng Google.</li><li><strong>Đơn đặt trước đây:</strong> với vé tham quan mua trên GoTravelNha trước ngày 27/10/2026: tên, email, số điện thoại, vé và số tiền đã thanh toán. Thông tin thẻ do Stripe xử lý, không phải chúng tôi.</li><li><strong>Hồ sơ gia đình (không bắt buộc):</strong> tên, ngày sinh và ghi chú bạn thêm về những người đi cùng.</li><li><strong>Kế hoạch du lịch:</strong> điểm đến, ngày đi, tuổi người đi, ngân sách, sở thích và các kế hoạch bạn lưu.</li><li><strong>Tin nhắn:</strong> nội dung bạn gửi qua biểu mẫu liên hệ.</li><li><strong>Sử dụng:</strong> các trang bạn xem, lượt nhấp vào ưu đãi đối tác, loại thiết bị và trình duyệt, kích thước màn hình, ngôn ngữ trang bạn chọn, và cách bạn đến với chúng tôi (ví dụ thẻ chiến dịch hoặc trang web giới thiệu).</li></ul>'
      },
      {
        heading: 'Cookie và bộ nhớ trình duyệt',
        html: '<ul><li><code>gotravelnha_session</code>: giữ trạng thái đăng nhập (7 ngày).</li><li><code>gtn_sid</code> và một mã tương ứng trong bộ nhớ trình duyệt: mã khách truy cập ngẫu nhiên, giúp chúng tôi biết trang nào dẫn đến đơn đặt (30 ngày).</li><li><code>gtn_attr</code>: cách bạn đến với chúng tôi lần đầu và lần gần nhất, như thẻ chiến dịch hoặc mã nhấp quảng cáo (30 ngày).</li><li><code>gotravelnha_lang</code> (bộ nhớ trình duyệt): ngôn ngữ trang bạn đã chọn.</li><li>Các trang đối tác đặt cookie riêng khi bạn chuyển sang trang của họ.</li></ul>'
      },
      {
        heading: 'Chúng tôi chia sẻ dữ liệu với ai',
        html: '<ul><li><strong>Anthropic (Claude)</strong>, khi bạn dùng trợ lý lên kế hoạch: thông tin chuyến đi, tuổi người đi và ghi chú được gửi để tạo lịch trình.</li><li><strong>Nhà cung cấp dịch vụ email</strong>, để gửi email về đơn đặt và tài khoản.</li><li><strong>Đối tác</strong> như Trip.com và Klook nhận một mã theo dõi khi bạn chuyển sang trang của họ, để ghi nhận lượt giới thiệu.</li></ul><p>Chúng tôi không bán dữ liệu cá nhân của bạn.</p>'
      },
      {
        heading: 'Lựa chọn của bạn',
        html: '<p>Bạn có thể sửa hoặc xóa hồ sơ gia đình và chuyến đi đã lưu trong tài khoản. Để nhận bản sao dữ liệu, chỉnh sửa hoặc xóa dữ liệu, hãy liên hệ với chúng tôi. Chúng tôi lưu hồ sơ đơn đặt trong thời gian cần thiết cho nghĩa vụ kế toán và pháp lý.</p>'
      }
    ]
  },
  terms: {
    title: 'Điều khoản dịch vụ',
    metaTitle: 'Điều khoản dịch vụ | GoTravelNha',
    intro: 'Khi sử dụng GoTravelNha, bạn đồng ý với các điều khoản này.',
    sections: [
      {
        heading: 'GoTravelNha làm gì',
        html: '<ul><li><strong>Liên kết đối tác.</strong> Các liên kết tới Trip.com, Klook và đối tác khác đưa bạn sang trang của họ. Đơn đặt tại đó là hợp đồng giữa bạn và đối tác, theo điều khoản của đối tác. Chúng tôi có thể nhận hoa hồng.</li></ul>'
      },
      {
        heading: 'Trợ lý lên kế hoạch và gợi ý',
        html: '<p>Lịch trình và gợi ý chỉ mang tính tham khảo, một phần do AI tạo ra. Chúng có thể chưa đầy đủ hoặc đã lỗi thời. Hãy tự kiểm tra giờ mở cửa, giới hạn độ tuổi và thông tin di chuyển. Giá và tình trạng còn chỗ hiển thị do nhà cung cấp và đối tác cung cấp, không phải do AI.</p>'
      },
      {
        heading: 'Tài khoản của bạn',
        html: '<p>Hãy giữ kín mật khẩu. Bạn chịu trách nhiệm về hoạt động trên tài khoản của mình. Chúng tôi có thể tạm khóa tài khoản dùng để gian lận hoặc lạm dụng.</p>'
      }
    ]
  },
  contact: {
    eyebrow: 'Hỗ trợ',
    title: 'Chúng tôi có thể giúp gì?',
    subtitle: 'Gửi tin nhắn về đơn đặt, Trợ lý du lịch AI hoặc bất cứ điều gì. Chúng tôi trả lời qua email.',
    asideLabel: 'Cách khác để được hỗ trợ',
    partnerTitle: 'Đặt trên Trip.com hoặc Klook?',
    partnerText: 'Vé máy bay, khách sạn và hoạt động bạn thanh toán trên Trip.com hoặc Klook do đối tác đó quản lý. Hãy liên hệ họ qua email xác nhận để thay đổi hoặc hoàn tiền.',
    quickTitle: 'Trả lời nhanh',
    quickText: 'Câu hỏi thường gặp về đơn đặt, đối tác và Trợ lý du lịch AI.',
    helpCentre: 'Vào trung tâm trợ giúp',
    preferEmail: 'Muốn gửi email?',
    metaTitle: 'Liên hệ - GoTravelNha',
    metaDescription: 'Liên hệ với GoTravelNha. Chúng tôi sẵn sàng hỗ trợ việc đặt chỗ và trả lời mọi câu hỏi của bạn.'
  },
  form: {
    sentTitle: 'Đã gửi tin nhắn',
    sentText: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ trả lời qua email bạn cung cấp.',
    another: 'Gửi tin nhắn khác',
    title: 'Gửi tin nhắn cho chúng tôi',
    requiredBefore: 'Các trường có dấu',
    requiredAfter: 'là bắt buộc.',
    withAsterisk: 'dấu sao',
    name: 'Họ tên',
    namePlaceholder: 'Họ và tên của bạn',
    email: 'Email',
    message: 'Nội dung',
    messagePlaceholder: 'Cho chúng tôi biết bạn cần hỗ trợ gì',
    privacyBefore: 'Chúng tôi chỉ dùng thông tin của bạn để trả lời. Xem',
    privacy: 'Chính sách bảo mật',
    sending: 'Đang gửi…',
    send: 'Gửi tin nhắn',
    failed: 'Không gửi được tin nhắn. Vui lòng thử lại sau.'
  },
  unsubscribe: {
    doneTitle: 'Bạn đã hủy đăng ký',
    title: 'Hủy đăng ký nhận email',
    doneText: 'Chúng tôi sẽ không gửi email bản tin tới {email} nữa.',
    confirm: 'Ngừng gửi email bản tin tới {email}?',
    thisAddress: 'địa chỉ này',
    unsubscribing: 'Đang hủy đăng ký…',
    unsubscribe: 'Hủy đăng ký',
    back: 'Quay lại GoTravelNha',
    failed: 'Không thể hủy đăng ký. Vui lòng thử lại.',
    metaTitle: 'Hủy đăng ký | GoTravelNha'
  },
  exchange: {
    title: 'Đổi tiền',
    powered: 'Tỷ giá cung cấp bởi exchangerate.host',
    name: 'Họ tên',
    email: 'Email',
    sgdAmount: 'Số tiền SGD',
    vndAmount: 'Số tiền VND',
    amountPlaceholder: 'Nhập số tiền',
    submit: 'Gửi',
    unavailable: 'Dịch vụ tỷ giá tạm thời không khả dụng. Vui lòng thử lại sau.',
    sent: '✅ Yêu cầu đổi tiền của bạn đã được gửi!',
    failed: '❌ Gửi không thành công. Vui lòng thử lại.'
  }
}

export default info
