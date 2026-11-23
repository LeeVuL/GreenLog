/**
 * GreenLog – Khởi tạo dữ liệu (Google Apps Script)
 * Chạy hàm khoiTao() MỘT lần sau khi dán mã. Chạy lại cũng an toàn:
 * trang/cột đã có thì giữ nguyên, chỉ thêm phần còn thiếu, không xóa dữ liệu anh đã điền.
 */

const CFG = {
  FOLDER_GOC: '19Gfcs1jvz3yD7Zhryt0iBb6dZzUKI2Dk',   // GreenLog
  FOLDER_DULIEU: '1mDc6a0xzb8oAXCqD5ssovNibD4mqhsOw', // 01_DuLieu
  FOLDER_ANH: '1N-etaoXxqMP2d_ITvfhNtaKpTQ_A-QSJ',    // 02_AnhHienTruong
  FOLDER_BAOCAO: '1mPhVw44vY_d76je3NjEdbUM-FzcPh0jH', // 03_BaoCaoXuat
  FOLDER_SAOLUU: '19KG6XOAqhHU8Xgr5CG6eskN1JYPjXv0W', // 04_SaoLuu
  DULIEU_NEN: '1UmbxbkbHpGbZ1Sb-nsJCMe9OpXsQeEGzsxD3R562ti4',
  DANHMUC_CAY: '1cZjRNSxJWe6kDApKkoetfTeSw3OrIphtpvoAeKKfkNM',
  CONG_NHAN: '1lEaylygSyeayS_czHacBPxWXRWxV96KgOqCcYVTrklg',
  TEN_FILE_VANHANH: 'GreenLog_DuLieuVanHanh',
};

/* ---------- Danh mục bổ sung (đã chốt 22–23/11/2026) ---------- */
const DM_BOSUNG = {
  HinhThucTrong: [['Hình thức'], ['Trồng dặm'], ['Trồng mới'], ['Trồng cải tạo'], ['Khác']],
  NguonCay: [['Nguồn cây'], ['Tự ươm'], ['Mua mới'], ['Bứng chuyển'], ['Cắt cắm'], ['Tách bụi'], ['Gieo hạt'], ['Khác']],
  DVT: [['ĐVT'], ['Bụi'], ['Cây'], ['Chậu'], ['Bầu'], ['m²'], ['m'], ['Bao'], ['kg'], ['Khác']],
  QuyDoi: [['Vật tư', 'Đơn vị nhập', 'Quy đổi', 'Đơn vị quy đổi'], ['Chất cải tạo đất hữu cơ (Organic Soil Conditioner)', 'bao', 25, 'kg']],
  LoaiSuKien: [['Loại sự kiện'], ['Tiệc cưới'], ['Team building'], ['BBQ'], ['Romantic'], ['Khác']],
  NguonPhieu: [['Nguồn phiếu'], ['Tuần tra'], ['Khách phàn nàn'], ['Bộ phận khác'], ['Nhân viên tự phát hiện']],
  TieuChiChatLuong: [['Tiêu chí', 'Áp dụng'], ['Độ cao cỏ đều, đúng chuẩn', 'Cỏ'], ['Viền cỏ, mép bồn gọn', 'Cỏ'],
    ['Sạch rác, lá khô', 'Chung'], ['Cây bụi cắt tỉa đúng dáng', 'Cây bụi'], ['Không cỏ dại trong bồn', 'Chung'], ['Cây khỏe, không sâu bệnh rõ', 'Chung']],
  BangDiemNhaThau: [['Tiêu chí', 'Trọng số (%)'], ['Tỷ lệ hoàn thành việc định kỳ', 30], ['Đúng hạn (định kỳ + phiếu)', 25],
    ['Điểm chất lượng kiểm tra ngẫu nhiên', 25], ['Số lần bị trả lại (càng ít càng tốt)', 10], ['Ảnh sự kiện đúng giờ', 10]],
  KiemTraTruocBao: [['Việc trước bão'], ['Chằng chống cây mới trồng'], ['Cắt tỉa giảm tán cây lớn sát lối đi, villa'],
    ['Hạ trái, tàu dừa khô'], ['Khơi thông rãnh thoát nước'], ['Thu dọn chậu, vật dễ bay'], ['Kiểm tra cọc chống cũ']],
  MucDoDichHai: [['Mức độ', 'Tỷ lệ bị hại'], ['Nhẹ', 'dưới 10%'], ['Trung bình', '10–25%'], ['Nặng', '25–50%'], ['Rất nặng', 'trên 50%']],
  PhamViDichHai: [['Phạm vi'], ['Vài cây'], ['Một mảng'], ['Cả khu vực']],
  NhomCayDinhKy: [['Nhóm cây', 'Việc định kỳ được tính luôn'], ['Cây bụi / hoa', 'DV08, DV05'],
    ['Cây bóng mát (gồm dừa, cọ, chà là, Sứ Đại)', 'DV07, DV06'], ['Cỏ', 'DV04']],
  LoaiPhunBon: [['Loại'], ['Phun thuốc'], ['Phun phân bón lá'], ['Bón gốc']],
  DanhMucDichHai: [['Loại dịch hại'], ['Rệp sáp'], ['Rệp muội'], ['Nhện đỏ'], ['Bọ trĩ'], ['Sâu ăn lá'], ['Sâu đục thân'], ['Bọ cánh cứng hại dừa'], ['Đuông dừa'], ['Kiến'], ['Ốc sên'], ['Mối'], ['Bệnh thối rễ'], ['Bệnh đốm lá'], ['Thán thư'], ['Nấm phấn trắng'], ['Cháy lá'], ['Vàng lá'], ['Chưa rõ']],
  BaoHo: [['Bảo hộ'], ['Khẩu trang'], ['Găng tay'], ['Kính'], ['Áo dài tay'], ['Ủng']],
  LyDoLamThem: [['Lý do làm thêm'], ['Làm lại vì chưa đạt'], ['Theo yêu cầu'], ['Khác']],
  CaLamViec: [['Ca', 'Áp dụng', 'Giờ', 'Ghi chú'], ['Ca thẳng', 'Cắt cỏ', '09:00–17:30', 'Nghỉ 12:00–12:30'],
    ['Ca gãy', 'Các chức danh còn lại', '06:00–10:00 và 13:30–17:30', ''], ['Ca sớm', 'Phun thuốc', 'Bắt đầu 04:00 hoặc 05:00', 'Chỉ để tham khảo']],
  NhomQuyen: [['Nhóm', 'Thành viên'], ['Tổ trưởng', 'Phan Văn Thìn; Phạm Nhật Trường'], ['Quản lý nhà thầu', 'Mai Hòa Pháp'],
    ['Nhân viên nội bộ', 'Nguyễn Tấn Hiệp; Lê Hữu Nghị'], ['Trưởng bộ phận', 'Lê Vũ']],
  PhanQuyenMacDinh: [['Phân hệ', 'Tổ trưởng', 'Quản lý nhà thầu', 'Nhân viên nội bộ', 'Trưởng bộ phận'],
    ['Hôm nay / Lịch', 'Ghi', 'Xem', 'Ghi', 'Duyệt'],
    ['Điểm danh', 'Ghi (đội mình)', 'Ghi (tự điểm danh)', 'Không thấy', 'Duyệt'],
    ['Công nhân', 'Xem', 'Ghi (đăng ký, chờ duyệt)', 'Không thấy', 'Duyệt'],
    ['Định kỳ / Tưới', 'Ghi', 'Xem', 'Không thấy', 'Duyệt'],
    ['Việc nội bộ (vườn rau, biển, máy sàng cát, cây nội thất, rác hữu cơ, compost)', 'Không thấy', 'Không thấy', 'Ghi', 'Duyệt'],
    ['Vườn ươm cây bụi', 'Ghi (Trường), Xem (Thìn)', 'Xem', 'Không thấy', 'Duyệt'],
    ['Đồng hồ nước', 'Ghi (Trường)', 'Xem', 'Không thấy', 'Duyệt'],
    ['Phiếu / Dịch hại / Sổ trồng cây', 'Ghi', 'Xem', 'Ghi', 'Duyệt'],
    ['Phun, bón', 'Ghi', 'Ghi (đề xuất thuốc)', 'Ghi', 'Duyệt'],
    ['Dự án', 'Ghi tiến độ', 'Xem', 'Ghi tiến độ', 'Duyệt'],
    ['Sự kiện', 'Ghi ảnh', 'Xem', 'Ghi ảnh', 'Duyệt'],
    ['KH tuần / KH tháng', 'Ghi (đăng ký)', 'Ghi (lập KH tháng)', 'Ghi (đăng ký)', 'Duyệt'],
    ['Tuần tra', 'Xem (nhận lỗi)', 'Không thấy', 'Không thấy', 'Duyệt'],
    ['AI nhận diện', 'Ghi', 'Không thấy', 'Ghi', 'Duyệt'],
    ['Báo cáo', 'Không thấy', 'Xem (bảng công, bảng điểm, biên bản)', 'Không thấy', 'Duyệt'],
    ['Danh mục / Phân quyền', 'Không thấy', 'Không thấy', 'Không thấy', 'Duyệt']],
};

const MUC_DO_4 = [
  ['Mức độ', 'Hạn xử lý (giờ)', 'Tổng hợp gửi anh Vũ', 'Nhắc lại khi chưa nhận việc'],
  ['Khẩn cấp', 2, '16h mỗi ngày', 'Báo ngay; sau 15 phút cứ 2 phút gửi lại; sau 30 phút báo anh Vũ'],
  ['Cao', 24, '16h mỗi ngày', ''],
  ['Trung bình', 72, '16h thứ Sáu', ''],
  ['Thấp', 168, '16h thứ Sáu', ''],
];

const LOI_TUOI = [
  ['Hệ thống tưới', 'Vỡ ống nước', 'Khẩn cấp'], ['Hệ thống tưới', 'Rò rỉ ống, khớp nối', 'Cao'],
  ['Hệ thống tưới', 'Rò rỉ tại đồng hồ nước', 'Cao'], ['Hệ thống tưới', 'Ngập úng do tưới', 'Cao'],
  ['Hệ thống tưới', 'Béc tưới gãy hoặc hỏng', 'Trung bình'], ['Hệ thống tưới', 'Béc phun lệch hướng, phun ra lối đi', 'Trung bình'],
  ['Hệ thống tưới', 'Béc bị nghẹt', 'Trung bình'], ['Hệ thống tưới', 'Van hỏng hoặc kẹt', 'Cao'],
  ['Hệ thống tưới', 'Áp lực nước yếu', 'Trung bình'], ['Hệ thống tưới', 'Tủ điều khiển tưới lỗi', 'Cao'],
  ['Hệ thống tưới', 'Máy bơm lỗi', 'Khẩn cấp'],
];

/* ---------- Dữ liệu vận hành: trang và cột ---------- */
const VH = {
  DiemDanh: ['Ngày', 'Buổi', 'Mã CN', 'Họ tên', 'Đội', 'Trạng thái (Có mặt/Vắng/Về sớm)', 'Giờ về', 'Lý do', 'Công',
    'Ảnh tập thể', 'Người ghi', 'Giờ ghi', 'Trạng thái duyệt'],
  DuyetCong: ['Ngày', 'Buổi', 'Đội', 'Người gửi', 'Giờ gửi', 'Người duyệt', 'Giờ duyệt', 'Khóa', 'Ảnh tập thể', 'Ghi chú'],
  PhieuSuaCong: ['Mã phiếu', 'Ngày', 'Buổi', 'Mã CN', 'Giá trị cũ', 'Giá trị mới', 'Lý do', 'Người đề nghị', 'Giờ', 'Người duyệt', 'Kết quả'],
  CongNhanDangKy: ['Mã ĐK', 'Loại (Mới/Thay đổi/Nghỉ việc)', 'Mã CN', 'Họ và tên', 'Đội', 'Chức danh', 'Khu vực phụ trách',
    'Số điện thoại', 'Từ ngày', 'Ghi chú', 'Người đăng ký', 'Giờ đăng ký', 'Trạng thái duyệt', 'Người duyệt', 'Giờ duyệt'],
  KeHoachDinhKy: ['Mã KH', 'Kỳ', 'Mã việc', 'Cụm', 'Khu vực', 'Từ ngày', 'Đến ngày', 'Đội', 'Trạng thái duyệt', 'Người lập'],
  TickDinhKy: ['Ngày', 'Kỳ', 'Mã việc', 'Mã vị trí', 'Mã KH', 'Lần', 'Lý do làm thêm', 'Mã dịch hại', 'Người tick', 'Giờ tick', 'Ghi chú', 'Trạng thái', 'Bắt đầu', 'Ngày xong', 'Số ngày', 'Mã NK'],
  AnhNgay: ['Ngày', 'Mã việc', 'Khu vực', 'Link ảnh', 'Nguồn ảnh', 'Mã băm', 'Người chụp', 'Giờ', 'GPS'],
  Tuoi: ['Ngày', 'Mã vị trí', 'Trạng thái', 'Lý do', 'Người ghi', 'Giờ', 'Hôm nay mưa'],
  ViecHangNgay: ['Ngày', 'Mã việc', 'Cụm', 'Trạng thái', 'Ảnh', 'Ghi chú', 'Người ghi', 'Giờ', 'Mã vị trí'],
  KiemTraBien: ['Ngày', 'Buổi', 'Đoạn bãi', 'Tình trạng', 'Ảnh', 'Ghi chú', 'Người ghi'],
  Phieu: ['Mã phiếu', 'Loại', 'Nguồn', 'Nhóm lỗi', 'Loại lỗi', 'Mức độ', 'Mã vị trí', 'Vị trí khác', 'Mô tả', 'Giao cho',
    'Người tạo', 'Giờ tạo', 'Hạn', 'Người nhận', 'Giờ nhận', 'Ảnh trước', 'Ảnh sau', 'Trạng thái', 'Số lần trả lại',
    'Giờ xong', 'Giờ duyệt', 'Đã khóa van', 'Mã tuần tra', 'Mã sự kiện', 'Mã dự án', 'Mã lặp lại', 'Chi tiết trồng', 'Ảnh trong'],
  PhieuLichSu: ['Mã phiếu', 'Thời điểm', 'Hành động', 'Người', 'Ghi chú'],
  TuanTra: ['Mã tuần tra', 'Bắt đầu', 'Kết thúc', 'Người tuần tra', 'Tổ trưởng đi cùng', 'Số lỗi', 'Đã nhận hết'],
  SuKien: ['Mã SK', 'Tên', 'Loại', 'Bắt đầu', 'Kết thúc', 'Mã vị trí', 'Vị trí khác', 'Số khách', 'Yêu cầu', 'Nguồn tin',
    'File đính kèm', 'Đội phụ trách', 'Ảnh trước tiệc', 'Ảnh sau tiệc', 'Trạng thái'],
  ViecLapLai: ['Mã LL', 'Nội dung', 'Mã vị trí', 'Chu kỳ', 'Tham số', 'Từ ngày', 'Đến ngày', 'Người phụ trách', 'Mức độ', 'Đang chạy', 'Lần tạo gần nhất'],
  DuAn: ['Mã DA', 'Tên', 'Loại', 'Mã vị trí', 'Bắt đầu', 'Kết thúc', 'Trạng thái', 'Ghi chú'],
  DuAnGiaiDoan: ['Mã DA', 'STT', 'Nội dung', 'Khối lượng', 'ĐVT', 'Bắt đầu', 'Hoàn thành', 'Ghi chú', 'Mã vị trí'],
  DuAnVatTu: ['Mã DA', 'STT giai đoạn', 'Vật tư', 'ĐVT', 'Kế hoạch', 'Thực tế'],
  DuAnTienDo: ['Mã DA', 'STT giai đoạn', 'Ngày', 'Khối lượng hôm nay', 'Vật tư dùng', 'Ảnh', 'Người ghi'],
  SoTrongCay: ['STT', 'Thời gian', 'Khu vực', 'Mã vị trí', 'Vị trí khác', 'Hình thức', 'Nguồn cây', 'Mã cây', 'Tên cây', 'ĐVT',
    'Số lượng', 'Chất cải tạo đất hữu cơ (bao)', 'Cây trước khi cải tạo', 'Ghi chú', 'Ảnh', 'Mã DA', 'Mã phiếu', 'Người ghi', 'Ảnh trước', 'Ảnh trong', 'Ảnh sau'],
  NhatKyPhunBon: ['Mã NK', 'Ngày giờ', 'Loại (Phun thuốc/Phun phân bón lá/Bón gốc)', 'Công thức pha', 'Cụm', 'Mã vị trí', 'Vị trí chi tiết',
    'Số bình', 'Bảo hộ', 'Cách ly dài nhất (ngày)', 'Hết cách ly', 'Ảnh', 'Mã dịch hại', 'Người ghi', 'Mục đích', 'Nhóm cây', 'Tên cây', 'Đối tượng', 'Cảnh báo pha', 'Ghi chú'],
  NhatKyPhunBonChiTiet: ['Mã NK', 'STT', 'Sản phẩm', 'Liều / bình', 'ĐVT', 'Tổng lượng', 'Cách ly (ngày)'],
  CongThucPha: ['Mã CT', 'Tên công thức', 'Loại', 'Sản phẩm', 'Liều / bình', 'ĐVT', 'Ghi chú', 'Đang dùng'],
  DeXuatThuoc: ['Mã ĐX', 'Tên thuốc/phân', 'Loại', 'Hoạt chất', 'Ảnh nhãn', 'Cách ly đề xuất (ngày)', 'Người đề xuất', 'Giờ',
    'Trạng thái (Chờ duyệt/Đã duyệt/Từ chối)', 'Đã kiểm tra danh mục được phép', 'Không pha chung với', 'Người duyệt', 'Giờ duyệt'],
  DichHai: ['Mã DH', 'Ngày phát hiện', 'Cụm', 'Mã vị trí', 'Vị trí chi tiết', 'Phạm vi (Vài cây/Một mảng/Cả khu vực)', 'Nhóm cây',
    'Tên cây', 'Loại dịch hại', 'Mức độ', 'Mô tả', 'Ảnh', 'Người phát hiện', 'Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)',
    'Ngày báo xong', 'Ảnh xong', 'Người duyệt', 'Số lần trả lại', 'Cập nhật gần nhất'],
  DichHaiCapNhat: ['Mã DH', 'Thời điểm', 'Việc đã làm', 'Mã NK phun bón', 'Tính luôn định kỳ', 'Mức độ hiện tại', 'Ảnh', 'Ghi chú', 'Người ghi'],
  ThoiTiet: ['Thời điểm lấy', 'Nguồn', 'Mốc dự báo', '% mưa', 'Lượng mưa (mm)', 'Nhiệt độ (°C)', 'Gió giật (m/s)', 'Gợi ý'],
  ChamDiem: ['Ngày', 'Mã vị trí', 'Tiêu chí', 'Điểm (1–5)', 'Ảnh', 'Ghi chú', 'Người chấm'],
  BatThuong: ['Ngày', 'Mã vị trí', 'Tên cây', 'Tình trạng', 'Ảnh', 'Ghi chú', 'Người báo', 'Xử lý', 'Mã điểm', 'Trả lời của anh Vũ', 'Giờ trả lời'],
  VuonRau: ['Ngày', 'Mã vườn', 'Trường', 'Giá trị', 'Ngoài ngưỡng', 'Người ghi'],
  ThuHoach: ['Ngày', 'Mã vườn', 'Vườn', 'Mã cây', 'Tên cây', 'kg', 'Ảnh cân', 'Bếp nhận', 'Người ghi'],
  DongHoNuoc: ['Ngày', 'Mã đồng hồ', 'Chỉ số', 'Ảnh', 'Người đọc'],
  RacHuuCo: ['Ngày', 'kg rác thu gom', 'Ảnh', 'Người ghi'],
  PhanCompost: ['Ngày', 'Phân compost tuần hoàn (kg)', 'Ảnh', 'Ghi chú', 'Người ghi'],
  VuonUom: ['Ngày', 'Vườn ươm', 'Việc', 'Tên cây', 'Số lượng', 'ĐVT', 'Chất cải tạo đất hữu cơ (bao)', 'Mô tả', 'Ảnh', 'Người ghi', 'Loại ghi', 'Xuất đi'],
  VeSinhBien: ['Ngày', 'Buổi', 'kg rác', 'Ảnh', 'Người ghi'],
  MaySangCat: ['Ngày', 'Máy', 'Giờ bắt đầu', 'Giờ kết thúc', 'Đoạn bãi', 'Nhiên liệu (lít)', 'Bảo trì', 'Ảnh', 'Ghi chú', 'Người ghi', 'Số giờ'],
  CayNoiThat: ['Ngày', 'Mã điểm', 'Số chậu tưới', 'Người ghi', 'Việc', 'Tên phân', 'Bất thường'],
  KeHoachTuan: ['Mã KHT', 'Tuần', 'Nội dung', 'Mã vị trí', 'Đội/Người', 'Từ ngày', 'Hạn', 'Mức độ', 'Nguồn', 'Trạng thái', 'Lý do trễ', 'Động từ', 'Đối tượng'],
  CanhBaoBao: ['Mã đợt', 'Kích hoạt lúc', 'Người kích hoạt', 'Ghi chú', 'Kết thúc'],
  KyCham: ['Kỳ', 'Từ ngày', 'Đến ngày', 'Trạng thái', 'Người yêu cầu nghiệm thu', 'Giờ yêu cầu', 'Kết luận', 'Nhận xét', 'Giờ đóng'],
  SoDuCong: ['Kỳ', 'Chênh lệch tháng', 'Lũy kế đến kỳ trước', 'Lũy kế đến nay'],
  VanChuyen: ['Ngày', 'Đội', 'Loại hàng', 'Nhóm', 'Số chuyến', 'Ghi chú', 'Ảnh', 'Người ghi', 'Giờ ghi'],
  ViecPhatSinh: ['Mã PS', 'Ngày', 'Loại việc', 'Mô tả', 'Mã vị trí', 'Vị trí khác', 'Số người', 'Hỗ trợ', 'Bắt đầu', 'Kết thúc', 'Số giờ', 'Ảnh trước', 'Ảnh sau', 'Trạng thái', 'Người ghi'],
  Hop: ['Mã họp', 'Loại', 'Tiêu đề', 'Bắt đầu', 'Địa điểm', 'Người dự', 'Chương trình', 'Trao đổi', 'Quyết định', 'Việc giao', 'Báo cáo kèm', 'Số liệu', 'Trạng thái', 'Người lập'],
  DaoTao: ['Mã ĐT', 'STT', 'Thứ', 'Ngày', 'Bắt đầu', 'Kết thúc', 'Tổng thời lượng', 'Nội dung', 'Địa điểm', 'Giảng viên', 'Học viên', 'Số học viên', 'Ghi chú', 'Tài liệu', 'Người lập'],
  ThuVienSOP: ['Mã SOP', 'Chủ đề', 'Tên tài liệu', 'Link', 'Ghi chú', 'Người thêm', 'Giờ thêm'],
  ThongBaoLog: ['Thời điểm', 'Kênh', 'Người nhận', 'Loại tin', 'Nội dung', 'Kết quả'],
  NhatKyThayDoi: ['Thời điểm', 'Người', 'Trang', 'Mã bản ghi', 'Trường', 'Giá trị cũ', 'Giá trị mới', 'Lý do'],
  PhanQuyen: ['Áp cho (nhóm hoặc Gmail)', 'Phân hệ', 'Cấp (Không thấy/Xem/Ghi/Duyệt)', 'Phạm vi', 'Người đặt', 'Giờ đặt'],
  UyQuyen: ['Người ủy quyền', 'Người nhận', 'Phân hệ', 'Cấp', 'Từ ngày', 'Đến ngày', 'Lý do', 'Đang hiệu lực'],
  ThietBi: ['Gmail', 'Mã thiết bị', 'Tên máy', 'Lần đầu', 'Lần cuối', 'Bị khóa'],
};

/* ---------- Hàm chính ---------- */
function khoiTao() {
  const log = [];
  const nen = SpreadsheetApp.openById(CFG.DULIEU_NEN);

  // 1. Danh mục bổ sung
  Object.keys(DM_BOSUNG).forEach(function (ten) { if (taoTrangNeuThieu_(nen, ten, DM_BOSUNG[ten])) log.push('Thêm trang ' + ten); });

  // 2. Mức độ phiếu 4 cấp (ghi đè trang MucDoPhieu vì đã đổi quy tắc)
  const md = nen.getSheetByName('MucDoPhieu') || nen.insertSheet('MucDoPhieu');
  md.clearContents(); md.getRange(1, 1, MUC_DO_4.length, MUC_DO_4[0].length).setValues(MUC_DO_4); log.push('MucDoPhieu → 4 cấp');

  // 3. Lỗi hệ thống tưới
  const loi = nen.getSheetByName('LoiCanhQuan');
  if (loi) {
    const doiMuc = { 'Khẩn': 'Khẩn cấp', 'Thường': 'Trung bình' };
    const vl = loi.getDataRange().getValues();
    for (let i = 1; i < vl.length; i++) if (doiMuc[vl[i][2]]) loi.getRange(i + 1, 3).setValue(doiMuc[vl[i][2]]);
    log.push('LoiCanhQuan: Khẩn → Khẩn cấp, Thường → Trung bình');
    const daCo = vl.map(function (r) { return String(r[1]); });
    const them = LOI_TUOI.filter(function (r) { return daCo.indexOf(r[1]) < 0; });
    if (them.length) { loi.getRange(loi.getLastRow() + 1, 1, them.length, 3).setValues(them); log.push('Thêm ' + them.length + ' lỗi hệ thống tưới'); }
  }

  // 4. Islander – VT264 (không áp dụng 8 việc chính, không tưới hằng ngày)
  const vt = nen.getSheetByName('ViTri');
  if (vt) {
    const ma = vt.getRange(1, 1, vt.getLastRow(), 1).getValues().map(function (r) { return r[0]; });
    if (ma.indexOf('VT264') < 0) {
      vt.appendRow(['VT264', 'Islander', 'Islander', 'Xung quanh khu vực khách ăn bên ngoài', 'Không', 'Không tưới hằng ngày; chỉ dùng trồng cây, phiếu, dự án, sự kiện']);
      log.push('Thêm VT264 Islander');
    }
  }

  // 5. Chuẩn hóa tên người dùng
  const nd = nen.getSheetByName('NguoiDung');
  if (nd) {
    const v = nd.getDataRange().getValues(); const h = v[0].map(String);
    const cGmail = h.indexOf('Gmail');
    for (let i = 1; i < v.length; i++) {
      if (v[i][0] === 'Phạm Nhựt Trường') nd.getRange(i + 1, 1).setValue('Phạm Nhật Trường');
      if (v[i][0] === 'Anh Pháp') nd.getRange(i + 1, 1).setValue('Mai Hòa Pháp');
      if (cGmail >= 0 && v[i][cGmail]) nd.getRange(i + 1, cGmail + 1).setValue(String(v[i][cGmail]).trim().toLowerCase());
    }
    if (h.indexOf('Nhóm quyền') < 0) {
      const cot = nd.getLastColumn() + 1; nd.getRange(1, cot).setValue('Nhóm quyền');
      for (let i = 1; i < v.length; i++) {
        const vt = String(v[i][2]);
        const nhom = /Chủ sở hữu/.test(vt) ? 'Trưởng bộ phận' : /Quản lý nhà thầu/.test(vt) ? 'Quản lý nhà thầu' : /Tổ trưởng/i.test(vt) ? 'Tổ trưởng' : v[i][1] === 'Nhân viên nội bộ' ? 'Nhân viên nội bộ' : '';
        nd.getRange(i + 1, cot).setValue(nhom);
      }
      log.push('NguoiDung + cột Nhóm quyền');
    }
    ['Zalo chat_id', 'Telegram chat_id'].forEach(function (c) { const hh = nd.getRange(1, 1, 1, nd.getLastColumn()).getValues()[0]; if (hh.indexOf(c) < 0) nd.getRange(1, nd.getLastColumn() + 1).setValue(c); });
    log.push('Chuẩn hóa tên và Gmail');
  }

  // 5b. Danh mục thuốc, phân: thêm cột trạng thái và tương kỵ (không xóa thuốc, chỉ Ngưng dùng)
  const tp = nen.getSheetByName('ThuocPhan');
  if (tp) {
    const DONG_TD = 3; // dòng 1 là tiêu đề trang, dòng 3 là tên cột
    const tieuDe = tp.getRange(DONG_TD, 1, 1, Math.max(tp.getLastColumn(), 1)).getValues()[0].map(String);
    ['Trạng thái (Đang dùng/Chờ duyệt/Ngưng dùng)', 'Không pha chung với', 'Đã kiểm tra danh mục được phép'].forEach(function (c) {
      if (tieuDe.indexOf(c) < 0) {
        const cot = tp.getLastColumn() + 1;
        tp.getRange(DONG_TD, cot).setValue(c);
        if (c.indexOf('Trạng thái') === 0 && tp.getLastRow() > DONG_TD) {
          const n = tp.getLastRow() - DONG_TD;
          tp.getRange(DONG_TD + 1, cot, n, 1).setValues(Array(n).fill(['Đang dùng']));
        }
        log.push('ThuocPhan + cột ' + c);
      }
    });
  }

  // 6. Chép danh mục cây, công nhân, định mức công vào dữ liệu nền
  chepTrang_(CFG.DANHMUC_CAY, 'DanhMucCay', nen, 'DanhMucCay', 4); log.push('Chép DanhMucCay');
  // CongNhan chỉ chép lần đầu: sau đó anh sửa đội, chức danh ngay trong app (Thêm → Công nhân), chép lại sẽ mất
  if (!nen.getSheetByName('CongNhan') || nen.getSheetByName('CongNhan').getLastRow() < 2) { chepTrang_(CFG.CONG_NHAN, 'CongNhan', nen, 'CongNhan', 4); log.push('Chép CongNhan'); }
  chepTrang_(CFG.CONG_NHAN, 'DinhMucCong', nen, 'DinhMucCong', 1); log.push('Chép DinhMucCong');

  // 6b. GreenLog 0.3: thuốc 16L, dịch hại, hàng rào, hồ thủy sinh, DV37/DV38…
  khoiTao03_(nen, log);

  // 7. File dữ liệu vận hành
  const vhFile = timHoacTaoFile_(CFG.TEN_FILE_VANHANH, CFG.FOLDER_DULIEU);
  const vhs = SpreadsheetApp.openById(vhFile.getId());
  Object.keys(VH).forEach(function (ten) {
    if (taoTrangNeuThieu_(vhs, ten, [VH[ten]])) return;
    const sh = vhs.getSheetByName(ten); const h = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0];
    VH[ten].forEach(function (c) { if (h.indexOf(c) < 0) { sh.getRange(1, sh.getLastColumn() + 1).setValue(c).setFontWeight('bold'); log.push(ten + ' + cột ' + c); } });
  });
  const macDinh = vhs.getSheetByName('Sheet1') || vhs.getSheetByName('Trang tính1');
  if (macDinh && vhs.getSheets().length > 1) vhs.deleteSheet(macDinh);
  const sd = vhs.getSheetByName('SoDuCong');
  if (sd.getLastRow() < 2) sd.appendRow(['T11.2026', -93, -182.5, -275.5]);
  log.push('Dữ liệu vận hành: ' + Object.keys(VH).length + ' trang');

  // 8. Lưu cấu hình
  PropertiesService.getScriptProperties().setProperties({ VANHANH_ID: vhFile.getId(), KHOI_TAO_LUC: new Date().toISOString() });
  Logger.log(log.join('\n'));
  return log;
}

/* ---------- Tiện ích ---------- */
function taoTrangNeuThieu_(ss, ten, rows) {
  let sh = ss.getSheetByName(ten);
  if (sh && sh.getLastRow() > 0) return false;
  if (!sh) sh = ss.insertSheet(ten);
  const w = Math.max.apply(null, rows.map(function (r) { return r.length; }));
  const data = rows.map(function (r) { const c = r.slice(); while (c.length < w) c.push(''); return c; });
  sh.getRange(1, 1, data.length, w).setValues(data);
  sh.getRange(1, 1, 1, w).setFontWeight('bold').setBackground('#1E6B3B').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  return true;
}

function chepTrang_(srcId, srcTen, dstSs, dstTen, dongTieuDe) {
  const src = SpreadsheetApp.openById(srcId).getSheetByName(srcTen);
  if (!src) return;
  const v = src.getDataRange().getValues().slice(dongTieuDe - 1).filter(function (r) { return r.join('') !== ''; });
  let dst = dstSs.getSheetByName(dstTen);
  if (dst) dst.clearContents(); else dst = dstSs.insertSheet(dstTen);
  dst.getRange(1, 1, v.length, v[0].length).setValues(v);
  dst.getRange(1, 1, 1, v[0].length).setFontWeight('bold');
  dst.setFrozenRows(1);
}

function timHoacTaoFile_(ten, folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const it = folder.getFilesByName(ten);
  if (it.hasNext()) return it.next();
  const ss = SpreadsheetApp.create(ten);
  const f = DriveApp.getFileById(ss.getId());
  f.moveTo(folder);
  return f;
}
