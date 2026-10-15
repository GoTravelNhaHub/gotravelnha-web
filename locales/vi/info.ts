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
    metaDescription: 'Cách đặt chỗ, nhận vé, hoàn tiền và cách trợ lý lên kế hoạch hoạt động trên GoTravelNha.',
    intro: '',
    sections: [
      {
        heading: 'Hai cách đặt chỗ',
        html: '<ul><li><strong>Vé tham quan có nút "Đặt ngay" thanh toán trên GoTravelNha.</strong> Bạn thanh toán cho chúng tôi qua Stripe và chúng tôi đặt vé từ nhà cung cấp. Chúng tôi là đầu mối liên hệ cho các đơn đặt này.</li><li><strong>Vé máy bay, khách sạn và hoạt động trên Trip.com, Klook và các đối tác khác.</strong> Các liên kết này mở trang của đối tác; việc đặt chỗ, thanh toán, thay đổi và hoàn tiền do đối tác xử lý theo điều khoản của họ. Chúng tôi có thể nhận hoa hồng mà bạn không phải trả thêm chi phí.</li></ul>'
      },
      {
        heading: 'Khi nào tôi nhận được vé?',
        html: '<p>Sau khi bạn thanh toán, chúng tôi gửi email xác nhận kèm mã đặt chỗ (GTN-…). Đơn đặt được xác nhận khi nhà cung cấp xuất vé; sau đó chúng tôi gửi vé trong email thứ hai. Trước đó, trạng thái hiển thị là "Đang xác nhận vé".</p>'
      },
      {
        heading: 'Làm sao kiểm tra đơn đặt?',
        html: '<p>Vào <a href="/bookings">Đơn đặt của tôi</a> và nhập mã đặt chỗ cùng email bạn đã dùng để thanh toán. Nếu bạn đăng nhập khi đặt, các đơn đặt sẽ tự động hiển thị ở đó.</p>'
      },
      {
        heading: 'Giá có phải là giá cuối cùng?',
        html: '<p>Giá khi thanh toán trên GoTravelNha tính bằng đô la Singapore và là số tiền bạn trả. Nếu giá thay đổi giữa lúc bạn mở trang và lúc thanh toán, chúng tôi sẽ yêu cầu bạn xem lại trước khi trừ tiền. Giá của đối tác do đối tác đặt và được xác nhận trên trang của họ trước khi bạn thanh toán.</p>'
      },
      {
        heading: 'Tôi có thể hủy hoặc được hoàn tiền không?',
        html: '<p>Xem <a href="/refund-policy">chính sách hoàn tiền và hủy</a> của chúng tôi. Với đơn đặt qua đối tác, hãy liên hệ trực tiếp với đối tác.</p>'
      },
      {
        heading: 'Tôi đã thanh toán nhưng không nhận được email',
        html: '<p>Hãy kiểm tra thư mục spam, rồi tra cứu đơn đặt tại <a href="/bookings">Đơn đặt của tôi</a>. Nếu vẫn không tìm thấy, hãy <a href="/contact">liên hệ với chúng tôi</a> kèm email bạn đã dùng để thanh toán.</p>'
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
        html: '<ul><li><strong>Tài khoản:</strong> tên, tên đăng nhập, email và mật khẩu đã mã hóa, hoặc hồ sơ Google nếu bạn đăng nhập bằng Google.</li><li><strong>Đơn đặt:</strong> tên, email, số điện thoại, vé bạn mua và số tiền đã thanh toán. Thông tin thẻ do Stripe xử lý, không phải chúng tôi.</li><li><strong>Hồ sơ gia đình (không bắt buộc):</strong> tên, ngày sinh và ghi chú bạn thêm về những người đi cùng.</li><li><strong>Kế hoạch du lịch:</strong> điểm đến, ngày đi, tuổi người đi, ngân sách, sở thích và các kế hoạch bạn lưu.</li><li><strong>Tin nhắn:</strong> nội dung bạn gửi qua biểu mẫu liên hệ.</li><li><strong>Sử dụng:</strong> các trang bạn xem, lượt nhấp vào ưu đãi đối tác, loại thiết bị và trình duyệt, kích thước màn hình, ngôn ngữ trang bạn chọn, và cách bạn đến với chúng tôi (ví dụ thẻ chiến dịch hoặc trang web giới thiệu).</li></ul>'
      },
      {
        heading: 'Cookie và bộ nhớ trình duyệt',
        html: '<ul><li><code>gotravelnha_session</code>: giữ trạng thái đăng nhập (7 ngày).</li><li><code>gtn_sid</code> và một mã tương ứng trong bộ nhớ trình duyệt: mã khách truy cập ngẫu nhiên, giúp chúng tôi biết trang nào dẫn đến đơn đặt (30 ngày).</li><li><code>gtn_attr</code>: cách bạn đến với chúng tôi lần đầu và lần gần nhất, như thẻ chiến dịch hoặc mã nhấp quảng cáo (30 ngày).</li><li><code>gotravelnha_lang</code> (bộ nhớ trình duyệt): ngôn ngữ trang bạn đã chọn.</li><li>Các trang đối tác đặt cookie riêng khi bạn chuyển sang trang của họ.</li></ul>'
      },
      {
        heading: 'Chúng tôi chia sẻ dữ liệu với ai',
        html: '<ul><li><strong>Stripe</strong>, để xử lý thanh toán và gửi biên nhận.</li><li><strong>Nhà cung cấp vé</strong>, với thông tin cần thiết để xuất vé.</li><li><strong>Anthropic (Claude)</strong>, khi bạn dùng trợ lý lên kế hoạch: thông tin chuyến đi, tuổi người đi và ghi chú được gửi để tạo lịch trình.</li><li><strong>Nhà cung cấp dịch vụ email</strong>, để gửi email về đơn đặt và tài khoản.</li><li><strong>Đối tác</strong> như Trip.com và Klook nhận một mã theo dõi khi bạn chuyển sang trang của họ, để ghi nhận lượt giới thiệu.</li></ul><p>Chúng tôi không bán dữ liệu cá nhân của bạn.</p>'
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
        html: '<ul><li><strong>Vé tham quan bán qua trang thanh toán của chúng tôi.</strong> Chúng tôi nhận thanh toán và thay bạn đặt vé từ nhà cung cấp. Hợp đồng cho các vé này là giữa bạn và GoTravelNha.</li><li><strong>Liên kết đối tác.</strong> Các liên kết tới Trip.com, Klook và đối tác khác đưa bạn sang trang của họ. Đơn đặt tại đó là hợp đồng giữa bạn và đối tác, theo điều khoản của đối tác. Chúng tôi có thể nhận hoa hồng.</li></ul>'
      },
      {
        heading: 'Giá và thanh toán',
        html: '<ul><li>Giá khi thanh toán tính bằng đô la Singapore và được xác nhận trên trang thanh toán Stripe trước khi bạn trả tiền.</li><li>Thanh toán do Stripe xử lý. Chúng tôi không xem hoặc lưu đầy đủ thông tin thẻ của bạn.</li><li>Đơn đặt được xác nhận khi nhà cung cấp xuất vé. Chúng tôi gửi vé qua email và hiển thị trên trang đơn đặt của bạn.</li><li>Mã khuyến mãi được áp dụng khi thanh toán và không thể thêm sau đó.</li></ul>'
      },
      {
        heading: 'Hủy và hoàn tiền',
        html: '<p>Xem <a href="/refund-policy">chính sách hoàn tiền và hủy</a> của chúng tôi.</p>'
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
  refund: {
    title: 'Chính sách hoàn tiền và hủy',
    metaTitle: 'Chính sách hoàn tiền và hủy | GoTravelNha',
    intro: 'Chính sách này áp dụng cho vé tham quan mua qua trang thanh toán GoTravelNha. Đơn đặt trên trang đối tác (như Trip.com hoặc Klook) theo chính sách của đối tác đó.',
    sections: [
      {
        heading: 'Điều kiện hủy của từng điểm tham quan',
        html: '<p>Mỗi điểm tham quan hiển thị điều kiện hủy trên trang của nó trước khi bạn thanh toán. Các điều kiện này do điểm tham quan hoặc nhà cung cấp đặt ra và áp dụng cho đơn đặt của bạn. Nhiều loại vé không thể hủy sau khi đã xuất.</p>'
      },
      {
        heading: 'Nếu chúng tôi không thể xuất vé',
        html: '<p>Nếu nhà cung cấp không thể xuất vé sau khi bạn đã thanh toán, chúng tôi sẽ liên hệ và hoàn lại số tiền bạn đã trả.</p>'
      },
      {
        heading: 'Yêu cầu hủy hoặc hoàn tiền',
        html: '<p><a href="/contact">Liên hệ với chúng tôi</a> kèm mã đặt chỗ (GTN-…). Chúng tôi sẽ kiểm tra điều kiện của điểm tham quan với nhà cung cấp và cho bạn biết có thể hoàn tiền hay không.</p>'
      },
      {
        heading: 'Cách hoàn tiền',
        html: '<p>Tiền được hoàn về thẻ hoặc phương thức thanh toán bạn đã dùng, qua Stripe. Chúng tôi gửi email khi đã hoàn tiền. Ngân hàng có thể mất 5–10 ngày làm việc để hiển thị.</p>'
      }
    ]
  },
  contact: {
    eyebrow: 'Hỗ trợ',
    title: 'Chúng tôi có thể giúp gì?',
    subtitle: 'Gửi tin nhắn về đơn đặt, Trợ lý du lịch AI hoặc bất cứ điều gì. Chúng tôi trả lời qua email.',
    asideLabel: 'Cách khác để được hỗ trợ',
    ticketsTitle: 'Vé mua trên GoTravelNha',
    ticketsText: 'Với vé tham quan Singapore, hãy thêm mã đặt chỗ vào biểu mẫu để chúng tôi tìm đơn hàng.',
    myBookings: 'Đơn đặt của tôi',
    refund: 'Chính sách hoàn tiền',
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
    reference: 'Mã đặt chỗ',
    optional: '(không bắt buộc)',
    referenceHint: 'Dành cho vé tham quan Singapore mua trên GoTravelNha. Mã có trong email xác nhận.',
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
