import type { Messages } from '../en'

const partners: Messages['partners'] = {
  trip: {
    eyebrow: 'Khách sạn và vé máy bay',
    title: 'Tìm chỗ ở, rồi đặt trên Trip.com',
    subtitle: 'Tìm khách sạn và vé máy bay tại đây. Trip.com hiển thị phòng, giá vé và tổng tiền trước khi bạn thanh toán.',
    trust: ['Thanh toán trên Trip.com', 'GoTravelNha không thu phí', 'Khách sạn và vé máy bay trong một lần tìm'],
    badge: 'Đối tác đặt chỗ',
    searchLabel: 'Tìm khách sạn và vé máy bay',
    placesEyebrow: 'Nơi lưu trú',
    placesTitle: 'Thành phố được gia đình ưa chuộng',
    placesSubtitle: 'Chọn một thành phố, rồi thêm ngày ở ô tìm kiếm phía trên.',
    searchHotels: 'Tìm khách sạn',
    offersEyebrow: 'Ưu đãi',
    offersTitle: 'Ưu đãi hiện có từ Trip.com',
    offersSubtitle: 'Các khuyến mãi này mở trên Trip.com. Giá được xác nhận tại đó.',
    bookingNote: 'Thanh toán khách sạn và vé máy bay diễn ra trên Trip.com. GoTravelNha không thu phí cho các đơn đặt này.',
    bannerOffer: 'Banner ưu đãi Trip.com',
    bannerDeals: 'Banner khuyến mãi Trip.com',
    promotion: 'Khuyến mãi Trip.com',
    metaTitle: 'Khách sạn và vé máy bay Trip.com | GoTravelNha',
    metaDescription: 'Tìm khách sạn và vé máy bay, rồi đặt trên Trip.com. Phòng, giá vé và tổng tiền được xác nhận trước khi thanh toán.'
  },
  klook: {
    eyebrow: 'Hoạt động và trải nghiệm',
    title: 'Tìm hoạt động, rồi đặt trên Klook',
    subtitle: 'Tìm hoạt động tại đây. Klook hiển thị vé, thời gian và giá trước khi bạn thanh toán.',
    trust: ['Thanh toán trên Klook', 'GoTravelNha không thu phí', 'Điểm tham quan, tour và đưa đón'],
    badge: 'Đối tác đặt chỗ Klook',
    searchTitle: 'Tìm trên Klook',
    searchNote: 'Kết quả mở trên Klook, nơi xác nhận vé, thời gian và giá.',
    placesEyebrow: 'Nơi khám phá',
    placesTitle: 'Hoạt động theo thành phố',
    placesSubtitle: 'Mở trang tìm kiếm Klook cho thành phố đó. Thẻ thành phố chỉ là điểm bắt đầu, không phải vé đã xác nhận.',
    searchOnKlook: 'Tìm trên Klook',
    collectionsEyebrow: 'Bộ sưu tập',
    collectionsTitle: 'Xem theo danh mục',
    collectionsSubtitle: 'Xem những gì Klook đang hiển thị qua GoTravelNha.',
    collectionsLabel: 'Bộ sưu tập Klook',
    thingsToDo: 'Hoạt động',
    hotels: 'Khách sạn',
    loadingCollections: 'Đang tải bộ sưu tập Klook…',
    failedTitle: 'Không tải được bộ sưu tập của Klook',
    failedText: 'Tải lại trang để thử lại. Bạn vẫn có thể tìm kiếm ở trên.',
    emptyHotels: 'Chưa có bộ sưu tập khách sạn',
    emptyActivities: 'Chưa có bộ sưu tập hoạt động',
    emptyText: 'Hãy dùng ô tìm kiếm ở trên. Bộ sưu tập sẽ xuất hiện ở đây khi được đăng.',
    bookingNote: 'Thanh toán hoạt động diễn ra trên Klook. GoTravelNha không thu phí cho các đơn đặt này.',
    categories: {
      attractions: { name: 'Điểm tham quan và show diễn', description: 'Công viên giải trí, bảo tàng và show diễn' },
      tours: { name: 'Tour và tham quan', description: 'Tour có hướng dẫn và trải nghiệm tham quan' },
      food: { name: 'Ẩm thực', description: 'Đặt bàn nhà hàng và trải nghiệm ẩm thực' },
      transport: { name: 'Đưa đón và WiFi', description: 'Tàu, xe buýt và kết nối internet' },
      activities: { name: 'Hoạt động và trải nghiệm', description: 'Hoạt động mạo hiểm và trải nghiệm độc đáo' },
      passes: { name: 'Thẻ tham quan', description: 'Thẻ tham quan nhiều điểm và gói combo' }
    },
    metaTitle: 'Hoạt động, tour và ưu đãi Klook | GoTravelNha',
    metaDescription: 'Tìm hoạt động tại đây, rồi mở trên Klook. Vé, thời gian và giá được xác nhận tại đó.'
  },
  guide: {
    allGuides: 'Tất cả hướng dẫn đặt chỗ',
    compareTitle: 'So sánh nơi đặt',
    bookingPartner: '{provider} · đối tác đặt chỗ',
    openSameTab: 'Chạm vào đối tác để mở ứng dụng hoặc trang web (cùng thẻ trên iPhone/iPad).',
    openNewTab: 'Chạm vào đối tác để mở trang web trong thẻ mới.',
    heroTrust: ['Liên kết tới Trip.com và Klook', 'Giá thực tế trên trang đối tác', 'GoTravelNha không thu phí'],
    whyEyebrow: 'Vì sao nên xem cả hai',
    whyTitle: 'Hai đối tác, một điểm bắt đầu',
    tipsEyebrow: 'Mẹo nhanh',
    tipsTitle: 'Trước khi thanh toán',
    keepPlanning: 'Tiếp tục lên kế hoạch',
    moreWays: 'Thêm cách lên kế hoạch chuyến đi',
    related: {
      flights: { label: 'Vé máy bay', detail: 'So sánh tìm chuyến bay trên Trip.com và Klook' },
      hotels: { label: 'Khách sạn', detail: 'So sánh tìm khách sạn trước khi đặt' },
      attractions: { label: 'Vé tham quan', detail: 'So sánh vé tham quan trên Trip.com và Klook' },
      planner: { label: 'Trợ lý du lịch AI', detail: 'Nhận kế hoạch từng ngày cho cả gia đình' }
    },
    stripFlight: 'Mở Trip.com hoặc Klook để xem giá vé thực tế, chọn chuyến bay và thanh toán ở đối tác bạn tin tưởng nhất.',
    stripHotel: 'So sánh loại phòng và giá, rồi đặt chỗ ở bạn muốn — thanh toán và xác nhận diễn ra trên trang đối tác.',
    stripOther: 'So sánh các loại vé và tình trạng còn chỗ, rồi đặt — thanh toán trên Trip.com hoặc Klook.',
    hintTrip: 'Giá thực tế, chỗ ngồi và thanh toán nằm trên Trip.com sau khi bạn chạm.',
    hintKlook: 'Giá thực tế, vé và thanh toán nằm trên Klook sau khi bạn chạm.',
    cta: {
      tripFlight: 'Tìm chuyến bay trên Trip.com',
      tripHotel: 'Xem khách sạn trên Trip.com',
      tripOther: 'Xem hoạt động trên Trip.com',
      klookFlight: 'Tìm đưa đón và chuyến bay trên Klook',
      klookHotel: 'Xem khách sạn trên Klook',
      klookOther: 'Xem vé tham quan trên Klook',
      other: 'Mở trang đối tác'
    },
    bookingNote: 'Thanh toán diễn ra trên Trip.com hoặc Klook, nơi xác nhận giá và tình trạng còn chỗ. GoTravelNha không thu phí cho các đơn đặt này.',
    items: {
      flights: {
        title: 'Tìm cách đặt vé máy bay phù hợp nhất',
        description: 'Mở trang tìm chuyến bay của Trip.com và Klook, xem tổng giá vé ở mỗi nơi, rồi đặt ở nơi phù hợp nhất với chuyến đi.',
        badge: 'Vé máy bay',
        destination: 'Toàn cầu',
        trip: { label: 'Vé máy bay Trip.com', priceNote: 'Tìm chuyến bay của nhiều hãng và hành trình ở một nơi.', highlight: 'Phù hợp khi cần linh hoạt hành trình và xem nhanh giá vé.' },
        klook: { label: 'Vé máy bay Klook', priceNote: 'Mở trang đặt vé máy bay và đưa đón của Klook.', highlight: 'Tiện khi bạn cũng định đặt hoạt động trên Klook.' },
        summaryBullets: ['So sánh các lựa chọn đặt chỗ từ những đối tác du lịch uy tín ở một nơi.', 'Xem tổng giá vé, hành lý và chi phí phát sinh trước khi thanh toán.', 'Đổi ngày để nhanh chóng tìm giá vé thấp hơn.'],
        tips: ['Thử bay giữa tuần nếu lịch trình cho phép.', 'Dùng chế độ ẩn danh hoặc xóa cookie nếu thấy giá tăng giữa các lần truy cập.', 'Kiểm tra quy định visa và quá cảnh trước khi đặt vé giảm giá.']
      },
      hotels: {
        title: 'Tìm cách đặt khách sạn phù hợp nhất',
        description: 'So sánh trang đặt khách sạn trên Trip.com và Klook để tìm chỗ ở và mức giá phù hợp.',
        badge: 'Khách sạn',
        destination: 'Toàn cầu',
        trip: { label: 'Khách sạn Trip.com', priceNote: 'Xem khách sạn từ bình dân đến cao cấp với bộ lọc dễ dùng.', highlight: 'Lựa chọn tốt khi bạn muốn nhiều khách sạn để chọn.' },
        klook: { label: 'Khách sạn Klook', priceNote: 'Mở trang khách sạn của Klook và xem giá phòng hiện tại.', highlight: 'Phù hợp nếu bạn muốn kết hợp khách sạn với hoạt động trên Klook.' },
        summaryBullets: ['So sánh lựa chọn phòng từ hai đối tác đặt chỗ uy tín.', 'Xem giá khuyến mãi và ưu đãi thành viên trên mỗi nền tảng.', 'Luôn kiểm tra điều kiện hủy trước khi thanh toán.'],
        tips: ['So sánh tổng tiền lưu trú gồm thuế và phụ phí.', 'Chọn giá linh hoạt khi kế hoạch có thể thay đổi.', 'Xem vị trí trên bản đồ và đánh giá trên trang đối tác trước khi thanh toán.']
      },
      attractions: {
        title: 'Tìm cách đặt vé tham quan phù hợp nhất',
        description: 'So sánh trang vé tham quan trên Trip.com và Klook, rồi đặt ở nơi có giá trị tốt nhất.',
        badge: 'Vé tham quan',
        destination: 'Singapore',
        trip: { label: 'Vé tham quan Trip.com', priceNote: 'Xem nhanh vé tham quan và hoạt động.', highlight: 'Phù hợp để so sánh các trải nghiệm nổi tiếng trong thành phố.' },
        klook: { label: 'Vé tham quan Klook', priceNote: 'Mở danh sách điểm tham quan và các loại vé của Klook.', highlight: 'Rất tiện khi kết hợp vé và trải nghiệm trên Klook.' },
        summaryBullets: ['Mở trang vé tham quan của cả hai đối tác từ một nơi.', 'Xem chênh lệch giá và những gì vé bao gồm trước khi thanh toán.', 'Chọn lựa chọn phù hợp với lịch trình và ngân sách.'],
        tips: ['So sánh các quyền lợi như vào cửa nhanh, gói combo và chính sách hủy.', 'Kiểm tra ngày không áp dụng và quy định sử dụng trong ngày trước khi thanh toán.', 'Nên đi vào ngày thường để tránh đông.']
      }
    }
  },
  legacy: {
    platform: 'Nền tảng',
    category: 'Danh mục',
    deal: 'ưu đãi',
    price: 'Giá',
    seePartner: 'Xem trên trang đối tác',
    priceChecked: 'Giá kiểm tra ngày {date}',
    confirmPrice: 'Hãy xác nhận giá với đối tác',
    discount: 'Giảm giá',
    off: 'Giảm {percent}%',
    checkPrice: 'Xem giá thực tế',
    notFoundTitle: 'Không tìm thấy trang ưu đãi',
    notFoundText: 'Đường dẫn này không khớp với mẫu hoặc ưu đãi nào.',
    back: 'Quay lại trang ưu đãi'
  }
}

export default partners
