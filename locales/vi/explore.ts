import type { Messages } from '../en'

const explore: Messages['explore'] = {
  meta: {
    title: 'Trợ lý AI lên kế hoạch du lịch gia đình | GoTravelNha',
    description: 'Lên kế hoạch kỳ nghỉ gia đình theo từng ngày với trợ lý du lịch AI, sau đó so sánh vé máy bay, khách sạn và hoạt động trên Trip.com và Klook trước khi đặt.'
  },
  hero: {
    eyebrow: 'Trợ lý AI lên kế hoạch cho gia đình',
    title: 'Kỳ nghỉ gia đình, lên kế hoạch trong vài phút.',
    subtitle: 'Cho chúng tôi biết bạn đi đâu và đi cùng ai. Nhận lịch trình chi tiết từng ngày, rồi tìm vé máy bay, khách sạn và hoạt động trên Trip.com và Klook.',
    trust: ['Lịch trình riêng theo từng ngày', 'Chia sẻ với cả nhà', 'So sánh nơi đặt trước khi thanh toán']
  },
  prompt: {
    label: 'Mô tả chuyến đi của bạn',
    placeholderPrefix: 'Ví dụ:',
    examples: [
      '5 ngày ở Tokyo, 2 người lớn và 2 bé 4 và 9 tuổi, nhịp độ thong thả',
      '4 ngày ở Seoul với bé mới biết đi',
      'Cuối tuần ở Bangkok với con tuổi teen',
      'Một tuần ở Bali dịp nghỉ hè'
    ],
    try: 'Thử:',
    submit: 'Lên kế hoạch',
    secondary: 'Hoặc tìm ưu đãi du lịch',
    needsText: 'Hãy mô tả chuyến đi, hoặc chọn một ví dụ bên dưới.'
  },
  sample: {
    eyebrow: 'Bạn nhận được gì',
    title: 'Một kế hoạch dễ dàng làm theo',
    introBefore: 'Đây là khung kế hoạch cho',
    brief: '3 ngày ở Tokyo với hai bé 4 và 9 tuổi',
    introAfter: '. Mỗi ngày một khu vực, di chuyển ngắn giữa các điểm và có thời gian nghỉ cho bé nhỏ.',
    points: ['Điểm tham quan phù hợp với tuổi của từng bé', 'Thời gian di chuyển giữa các điểm', 'Liên kết đặt vé máy bay, khách sạn và vé tham quan'],
    cta: 'Tùy chỉnh chuyến đi này',
    prompt: '3 ngày ở Tokyo, 2 người lớn và 2 bé 4 và 9 tuổi, nhịp độ thong thả',
    tabsLabel: 'Các ngày mẫu',
    day: 'Ngày {n}',
    note: 'Kế hoạch mẫu. Thời gian và quãng đường chỉ là ước tính; hãy kiểm tra ngày mở cửa trước khi đi.',
    days: [
      {
        title: 'Asakusa và Skytree',
        stops: [
          { time: '9:00', name: 'Chùa Senso-ji', note: 'Đi sớm trước khi đông người. Ăn vặt trên phố Nakamise.', next: 'Khoảng 20 phút đi bộ hoặc một ga tàu' },
          { time: '11:30', name: 'Thủy cung Sumida', note: 'Trong nhà, yên tĩnh, hợp với bé 4 tuổi.', next: 'Cùng tòa nhà' },
          { time: '13:00', name: 'Ăn trưa và lên đài quan sát Skytree', note: 'Mùa cao điểm nên đặt khung giờ trước.', next: '' },
          { time: '15:00', name: 'Nghỉ ở khách sạn', note: 'Giờ ngủ trưa của bé nhỏ.', next: '' }
        ]
      },
      {
        title: 'Công viên Ueno',
        stops: [
          { time: '9:30', name: 'Sở thú Ueno', note: 'Xem gấu trúc trước vì hàng chờ dài nhanh. Thường đóng cửa thứ Hai.', next: 'Khoảng 10 phút đi bộ qua công viên' },
          { time: '12:30', name: 'Ăn trưa dã ngoại trong công viên', note: 'Mua đồ ăn ở cửa hàng tiện lợi là tiện nhất.', next: 'Khoảng 5 phút đi bộ' },
          { time: '13:30', name: 'Bảo tàng Tự nhiên và Khoa học', note: 'Khủng long và phòng trải nghiệm cho bé 9 tuổi.', next: '' }
        ]
      },
      {
        title: 'Odaiba và Toyosu',
        stops: [
          { time: '9:30', name: 'teamLab Planets', note: 'Đặt khung giờ trước. Có phòng lội nước: nên mặc quần ngắn.', next: 'Khoảng 15 phút đi tuyến Yurikamome' },
          { time: '12:30', name: 'Ăn trưa ở trung tâm thương mại Odaiba', note: 'Có nhà hàng gia đình và khu vui chơi trong nhà.', next: '' },
          { time: '14:00', name: 'Bảo tàng khoa học Miraikan', note: 'Robot và vũ trụ. Thường đóng cửa thứ Ba.', next: '' }
        ]
      }
    ]
  },
  destinations: {
    eyebrow: 'Được các gia đình yêu thích',
    title: 'Đi đâu tiếp theo?',
    subtitle: 'Chọn một thành phố và trợ lý AI sẽ bắt đầu lên kế hoạch.',
    all: 'Tất cả {count} điểm đến →',
    cta: 'Lên kế hoạch'
  },
  deals: {
    title: 'Tìm vé máy bay, khách sạn và hoạt động'
  },
  compare: {
    eyebrow: 'So sánh nơi đặt',
    title: 'Xem cả Trip.com và Klook trước khi đặt',
    text: 'Giá, loại phòng và những gì bao gồm khác nhau giữa các đối tác. Mỗi hướng dẫn đều dẫn tới cả hai, để bạn xem giá thực tế trên từng trang và đặt ở nơi có tổng chi phí hợp lý nhất cho gia đình.',
    flights: 'Vé máy bay',
    hotels: 'Khách sạn',
    attractions: 'Vé tham quan',
    tripPoints: ['Nhiều lựa chọn vé máy bay và khách sạn', 'Xem nhanh giá vé và phòng', 'Linh hoạt hành trình và ngày đi'],
    klookPoints: ['Tour, điểm tham quan và đưa đón', 'Kết hợp chỗ ở với hoạt động', 'Tiện đặt hoạt động khi đã đến nơi']
  },
  guides: {
    eyebrow: 'Hướng dẫn đặt chỗ',
    title: 'Cần kiểm tra gì ở mỗi đối tác',
    subtitle: 'Mỗi hướng dẫn dẫn tới Trip.com và Klook, kèm mẹo cần kiểm tra trước khi thanh toán.',
    count: '{count} hướng dẫn',
    emptyTitle: 'Chưa có hướng dẫn đặt chỗ',
    emptyText: 'Hướng dẫn về vé máy bay, khách sạn và vé tham quan sẽ xuất hiện ở đây khi được đăng.',
    fallbackOutcome: 'Mở cả hai đối tác từ một nơi.',
    items: {
      flights: { title: 'Tìm cách đặt vé máy bay phù hợp nhất', outcome: 'Mở trang tìm chuyến bay của Trip.com và Klook từ một nơi, rồi đặt ở nơi có tổng chi phí tốt nhất.', destination: 'Toàn cầu', category: 'Vé máy bay' },
      hotels: { title: 'Tìm cách đặt khách sạn phù hợp nhất', outcome: 'Mở trang tìm khách sạn của Trip.com và Klook, xem loại phòng và tổng giá ở mỗi nơi.', destination: 'Toàn cầu', category: 'Khách sạn' },
      attractions: { title: 'Tìm cách đặt vé tham quan phù hợp nhất', outcome: 'Mở trang vé tham quan Singapore trên Trip.com và Klook, xem mỗi nơi bao gồm những gì.', destination: 'Singapore', category: 'Vé tham quan' }
    }
  },
  how: {
    eyebrow: 'Cách hoạt động',
    title: 'Lên kế hoạch, điều chỉnh, rồi đặt',
    steps: [
      { title: 'Mô tả chuyến đi', text: 'Bạn đi đâu, khi nào, và tuổi của mọi người đi cùng.' },
      { title: 'Điều chỉnh kế hoạch', text: 'Yêu cầu một ngày tiết kiệm hơn, ít đi bộ hơn hoặc thêm hoạt động cho bé. Trợ lý sẽ sửa lại.' },
      { title: 'Lưu, chia sẻ và đặt', text: 'Lưu kế hoạch, gửi cho gia đình, rồi đặt trên Trip.com hoặc Klook.' }
    ]
  },
  newsletter: {
    title: 'Lên kế hoạch sớm cho kỳ nghỉ học tới',
    text: 'Nhận ý tưởng du lịch gia đình, lịch trình có sẵn và thỉnh thoảng có ưu đãi từ Trip.com hoặc Klook, gửi thẳng vào hộp thư của bạn.',
    button: 'Gửi ý tưởng cho tôi'
  },
  bookingNote: {
    text: 'Thanh toán vé máy bay, khách sạn và hoạt động diễn ra trên Trip.com hoặc Klook. Nếu có câu hỏi, hãy vào Trợ giúp hoặc Liên hệ.',
    help: 'Trợ giúp',
    contact: 'Liên hệ'
  }
}

export default explore
