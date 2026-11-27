/* GreenLog 0.4 – tạo các trang dữ liệu mới (chỉ thêm cái còn thiếu, chạy lại không sao). Cột còn thiếu được ghiLo_ tự thêm khi ghi. */
const TRANG_04 = {
  KhoVatTu: ['Mã VT', 'Tên', 'Nhóm', 'ĐVT', 'Tồn tối thiểu', 'Người dùng', 'Dùng cho', 'Vị trí kho', 'Trạng thái', 'Ảnh'],
  KhoGiaoDich: ['Mã GD', 'Ngày', 'Giờ', 'Mã VT', 'Tên VT', 'Loại', 'Số lượng', 'Đơn giá', 'Nguồn', 'Thành tiền', 'Việc', 'Mã ghi gốc', 'Người', 'Ảnh', 'Ghi chú'],
  DungCu: ['Mã DC', 'Tên', 'Loại', 'Người giữ', 'Ngày giao', 'Trạng thái', 'Ghi chú', 'Ảnh', 'Nguồn', 'Đơn giá', 'Ngày nhập', 'Hạn dùng (tháng)', 'Ảnh nhập', 'Hóa đơn', 'Ảnh giao', 'Đã nhận', 'Giờ nhận'],
  DungCuMuon: ['Mã', 'Ngày', 'Mã DC', 'Tên', 'Người', 'Giờ mượn', 'Giờ trả'],
  KiemTraDC: ['Mã KT', 'Tháng', 'Lần', 'Chặng', 'Ngày giao', 'Người', 'Trạng thái', 'Kết quả', 'Ảnh', 'Ghi chú', 'Giờ nộp'],
  BaoTriPH: ['Mã BT', 'Ngày tạo', 'Máy', 'Mã mốc', 'Mốc', 'Giờ máy', 'Trạng thái', 'Giao cho', 'Ngày phát hành', 'Việc cần làm', 'Ngày xong', 'Đã làm', 'Ảnh', 'Ghi chú', 'Người ghi'],
  MayHong: ['Mã', 'Ngày báo', 'Máy', 'Lỗi', 'Ảnh', 'Người báo', 'Trạng thái', 'Thợ ngoài', 'Chi phí', 'Ngày xong', 'Số ngày nằm'],
  NghiNoiBo: ['Ngày', 'Người', 'Người ghi', 'Giờ ghi'],
  GopY: ['Mã', 'Giờ', 'Người', 'Vai', 'Màn', 'Tên màn', 'Nội dung', 'Ảnh', 'Thiết bị', 'Trạng thái', 'Ghi chú xử lý'],
  DungCuLichSu: ['Mã', 'Ngày', 'Giờ', 'Mã DC', 'Tên', 'Loại', 'Người', 'Ảnh', 'Giá trị', 'Ghi chú'],
  TienDoViec: ['Mã', 'Ngày', 'Đội', 'Mã GV', 'Chuỗi', 'Nội dung', 'Vị trí', 'Bắt đầu', 'Tiến độ', 'Kết quả', 'Ảnh', 'Ghi chú', 'Người ghi'],
  CongKyLichSu: ['Năm', 'Kỳ', 'Phần', 'Từ', 'Đến', 'Công thực tế', 'Công hợp đồng', 'Công giám sát', 'Chênh lệch', 'Nguồn', 'Ghi chú', 'Người ghi', 'Giờ ghi'],
  CayDacBiet: ['Mã cây', 'STT', 'Cụm', 'Khu vực', 'Vị trí', 'Tên cây', 'Số lượng', 'ĐVT', 'Lý do', 'Tình trạng', 'Biện pháp', 'Thuốc / phân', 'Liều lượng', 'Tần suất (ngày)', 'Đội phụ trách', 'Ảnh ban đầu', 'Ngày đưa vào', 'Trạng thái', 'Ghi chú', 'Người ghi', 'Giờ ghi'], // 0.4.9
  CayDacBietCS: ['Mã', 'Mã cây', 'Ngày', 'Cụm', 'Khu vực', 'Vị trí', 'Tên cây', 'Số cây làm', 'Phương pháp', 'Thuốc / phân', 'Liều lượng', 'Đánh giá', 'Ảnh', 'Ghi chú', 'Người ghi', 'Giờ ghi'],
  ChotNam: ['Năm', 'Từ', 'Đến', 'Công thực tế', 'Công hợp đồng', 'Chênh lệch', 'Trạng thái', 'Người chốt', 'Giờ chốt', 'Chi tiết'],
  KubotaLuot: ['Mã', 'Ngày', 'Người', 'Giờ nhận', 'Đồng hồ nhận', 'Ảnh nhận', 'Giờ trả', 'Đồng hồ trả', 'Ảnh trả', 'Số giờ', 'Dầu (lít)', 'Trạng thái', 'Nhận bàn giao từ', 'Bàn giao cho', 'Giờ chạy không ghi'],
  KubotaChuyen: ['Mã', 'Ngày', 'Giờ', 'Mã lượt', 'Loại hàng', 'Bộ phận', 'Người ghi'],
  DotMua: ['Mã đợt', 'Loại', 'Năm', 'Giai đoạn', 'Giai đoạn tên', 'Bắt đầu', 'Hạn', 'Kết thúc', 'Trạng thái', 'Người khởi chạy', 'Tóm tắt'],
  DotMuaGhi: ['Mã', 'Mã đợt', 'Loại', 'Việc', 'Ngày', 'Khu', 'Tên khu', 'Đã làm', 'Không cần làm', 'Lý do không làm', 'Mét lưới', 'Số cọc', 'Lưới dùng lại (m)', 'Lưới bỏ (m)', 'Cọc dùng lại', 'Cọc hỏng', 'Ảnh', 'Ghi chú', 'Xong khu', 'Ưu tiên', 'Người ghi', 'Giờ ghi'],
  AnhDaiDien: ['Tên', 'Ảnh', 'Người sửa', 'Giờ sửa'],
  LinkViec: ['Mã link', 'Ngày', 'Loại', 'Tiêu đề', 'Dặn', 'Mã vị trí', 'Danh sách', 'Khối lượng', 'Mã phiếu', 'Người nhận', 'Đội', 'Người tạo', 'Giờ tạo', 'Giờ mở', 'Trạng thái', 'Link trước'],
  LinkViecKetQua: ['Mã link', 'Mục', 'Loại', 'Ảnh', 'Tình trạng', 'Khối lượng', 'Ghi chú', 'Người', 'Giờ'],
  VuonUomNoiThat: ['Ngày', 'Vườn ươm', 'Việc', 'Tên cây', 'Số lượng', 'ĐVT', 'Chất cải tạo đất hữu cơ (bao)', 'Mô tả', 'Ảnh', 'Người ghi', 'Loại ghi', 'Xuất đi'],
  NhacNho: ['Mã', 'Ngày', 'Nguồn', 'Nội dung', 'Giao đội', 'Trạng thái'], DuaVaoHop: ['Mã', 'Ngày', 'Nội dung', 'Nguồn', 'Trạng thái'],
  KhoKhan: ['Mã', 'Ngày', 'Nội dung', 'Trạng thái'], HoanViec: ['Mã', 'Ngày', 'Việc', 'Lý do', 'Ngày làm bù'], TraoDoi: ['Mã', 'Mã BT', 'Nội dung', 'Người ghi', 'Giờ ghi'],
  DeXuatCay: ['Mã', 'Tên cây', 'Trạng thái'], CayDanhMuc: ['Mã', 'Tên Việt', 'Tên Anh', 'Tên khoa học'], CaiDat: ['Khóa', 'Giá trị'],
  KyDinhKy: ['Kỳ', 'Từ ngày', 'Đến ngày', 'Trạng thái'], NgayLe: ['Ngày', 'Tên'], NgayLamViec: ['Ngày', 'Đội', 'Loại', 'Giờ'],
  GiaoViecNgay: ['Mã', 'Ngày', 'Đội', 'Nội dung', 'Người', 'Trạng thái'], NghiemThu: ['Kỳ', 'Số hiệu', 'Trạng thái'], BaoCaoTuan: ['Mã', 'Tuần', 'Đội', 'Nội dung'],
  DaoTaoDiemDanh: ['Mã ĐT', 'Buổi', 'Người', 'Có mặt'], DaoTaoDeXuat: ['Mã', 'Mã ĐT', 'Nội dung', 'Trạng thái'], KetQuaThi: ['Mã ĐT', 'Mã SOP', 'Người', 'Điểm'],
  SOPDoc: ['Mã SOP', 'Phiên bản', 'Người đọc', 'Giờ đọc'], AnhDanhMuc: ['Loại', 'Tên', 'Ảnh', 'Người sửa', 'Giờ sửa'], TuiThuocDua: ['Đợt', 'Loại dòng', 'Mã cây', 'Số túi', 'Ảnh'], BaoTriMay: ['Ngày', 'Máy', 'Mốc', 'Đã làm', 'Ảnh'],
  DanhDauSlide: ['Mã', 'Bảng', 'Khóa', 'Tuần'], BaoCaoGM: ['Tháng', 'Chỉ số', 'Giá trị'], PhanQuyenViec: ['Áp cho', 'Mã việc', 'Mức'],
  KhuPhuTrach: ['Khu', 'Mã công nhân', 'Tối đa'], PhunLai: ['Mã', 'Mã NK', 'Ngày', 'Lý do'],
};
function khoiTao04() {
  const vh = vh_(); const log = [];
  Object.keys(TRANG_04).forEach(function (t) { if (!vh.getSheetByName(t)) { const sh = vh.insertSheet(t); sh.getRange(1, 1, 1, TRANG_04[t].length).setValues([TRANG_04[t]]).setFontWeight('bold'); sh.setFrozenRows(1); log.push('Thêm trang ' + t); } });
  [['CayNoiThat', 'Ảnh'], ['CayNoiThat', 'Ghi chú'], ['MaySangCat', 'Loại'], ['MaySangCat', 'Lý do'], ['MaySangCat', 'Mã lượt'], ['BatThuong', 'Mã BT'], ['BatThuong', 'Trạng thái'], ['BatThuong', 'Mã phiếu'], ['Phieu', 'Yêu cầu làm lại'], ['Phieu', 'Mã BT'], ['Phieu', 'Lý do làm thêm'], ['GiaoViecNgay', 'Mã vị trí'], ['DongHoNuoc', 'Trạng thái'], ['DongHoNuoc', 'Ghi chú']].forEach(function (x) { themCot_(vh, x[0], x[1], function () { return ''; }, log); });
  chuyen042_(vh, log);
  viTriPhieu048_(log);
  cayDacBiet049_(vh, log);
  console.log(log.join('\n') || 'Đủ trang 0.4'); return log;
}
/* 0.4.2: tách vườn ươm cây nội thất sang trang riêng; đổi tên Vườn ươm sân vườn → Vườn ươm cây bụi */
function chuyen042_(vh, log) {
  const sh = vh.getSheetByName('VuonUom'); const nt = vh.getSheetByName('VuonUomNoiThat'); if (!sh || !nt) return;
  const v = sh.getDataRange().getValues(); if (v.length < 2) return; const h = v[0]; const c = h.indexOf('Vườn ươm'); if (c < 0) return;
  const hn = nt.getRange(1, 1, 1, nt.getLastColumn()).getValues()[0];
  const giu = [h]; const sang = [];
  v.slice(1).forEach(function (r) { if (r[c] === 'Vườn ươm cây nội thất') sang.push(hn.map(function (k) { const i = h.indexOf(k); return i < 0 ? '' : r[i]; })); else { if (r[c] === 'Vườn ươm sân vườn') r[c] = 'Vườn ươm cây bụi'; giu.push(r); } });
  if (sang.length) nt.getRange(nt.getLastRow() + 1, 1, sang.length, hn.length).setValues(sang);
  sh.clearContents(); sh.getRange(1, 1, giu.length, h.length).setValues(giu);
  vh.getSheets().forEach(function (t) { const r = t.getRange(1, 1, 1, Math.max(1, t.getLastColumn())); const h = r.getValues()[0]; let doi = false;
    h.forEach(function (x, i) { if (String(x).indexOf('anh Vũ') >= 0) { h[i] = String(x).replace('anh Vũ', 'Trưởng bộ phận'); doi = true; } }); if (doi) { r.setValues([h]); log.push('Đổi tên cột trang ' + t.getName()); } });
  vh.createTextFinder('Chờ anh duyệt kết thúc').replaceAllWith('Chờ Trưởng bộ phận duyệt kết thúc'); vh.createTextFinder('anh Vũ').replaceAllWith('Trưởng bộ phận');
  log.push('Vườn ươm: chuyển ' + sang.length + ' dòng sang VuonUomNoiThat, đổi tên vườn ươm cây bụi');
}

/* 0.4.8 · mục 143: 11 vị trí chỉ dùng cho phiếu giao việc (Áp dụng 8 việc chính = Không, không vào việc định kỳ).
   App cũng tự thêm khi khởi động; hàm này ghi vào trang ViTri để báo cáo, Excel có đủ tên. Nhóm lỗi mới (mục 144) do app sắp lại khi đọc. */
function viTriPhieu048_(log) {
  const sh = nen_().getSheetByName('ViTri'); if (!sh) return;
  const v = sh.getDataRange().getValues(); const ma = v.map(function (r) { return r[0]; }); const ten = v.map(function (r) { return r[3]; });
  const DS = [['VT265', 'Vườn ươm', 'Vườn ươm', 'Vườn ươm cây nội thất'], ['VT266', 'Vườn ươm', 'Vườn ươm', 'Vườn ươm cây bụi'], ['VT267', 'Islander', 'Islander', 'Islander'],
    ['VT268', 'Ký túc xá', 'Ký túc xá', 'KTX khu vực bãi bóng chuyền'], ['VT269', 'Ký túc xá', 'Ký túc xá', 'KTX trước cổng'], ['VT270', 'Ký túc xá', 'Ký túc xá', 'KTX dãy Crowne'],
    ['VT271', 'Ký túc xá', 'Ký túc xá', 'KTX dãy Movenpick'], ['VT272', 'Ký túc xá', 'Ký túc xá', 'KTX sân chính'], ['VT273', 'Khu kỹ thuật cây xanh', 'Khu kỹ thuật cây xanh', 'Hầm bơm cây xanh'],
    ['VT274', 'Vị Garden', 'Vị Garden', 'Vị Garden'], ['VT275', 'Khu kỹ thuật cây xanh', 'Khu kỹ thuật cây xanh', 'Bãi rác cây xanh giai đoạn 2'],
    ['VT276', 'Spa', 'Spa', 'Spa Tầng 1'],
    ['VT277', 'Spa', 'Spa', 'Spa Sảnh'],
    ['VT278', 'Spa', 'Spa', 'Spa locker nam'],
    ['VT279', 'Spa', 'Spa', 'Spa locker nữ'],
    ['VT280', 'Spa', 'Spa', 'Spa hành lang'],
    ['VT281', 'Hotel', 'Hotel', 'M Lounge'],
    ['VT282', 'Hotel', 'Hotel', 'Hành lang Islander'],
    ['VT283', 'Tầng 8', 'Tầng 8', 'Tầng 8 (nhà hàng)'],
    ['VT284', 'Tầng 8', 'Tầng 8', 'Tầng 8 (khu bên ngoài)'],
    ['VT285', 'Hotel', 'Hotel', 'Nhà vệ sinh khách Wing B Hotel'],
    ['VT286', 'Hotel', 'Hotel', 'Nhà vệ sinh khách Wing A Hotel'],
    ['VT287', 'Hotel', 'Hotel', 'Máy nước lọc Wing A Hotel'],
    ['VT288', 'Hotel', 'Hotel', 'Kidclub'],
    ['VT289', 'Hotel', 'Hotel', 'Hotel Lobby'],
    ['VT290', 'Hotel', 'Hotel', 'Hotel Waverly'],
    ['VT291', 'Residences', 'Residences', 'Residences - Làng Chài'],
    ['VT292', 'Residences', 'Residences', 'Residences - Bên ngoài Làng Chài'],
    ['VT293', 'Residences', 'Residences', 'Máy nước lọc Residences']];
  const them = DS.filter(function (r) { return ma.indexOf(r[0]) < 0 && ten.indexOf(r[3]) < 0; }).map(function (r) { const x = r.concat(['Không', 'Chỉ dùng cho phiếu giao việc']); while (x.length < v[0].length) x.push(''); return x.slice(0, Math.max(6, v[0].length)); });
  if (them.length) { sh.getRange(sh.getLastRow() + 1, 1, them.length, them[0].length).setValues(them); log.push('Thêm ' + them.length + ' vị trí chỉ dùng cho phiếu'); }
}

/* 0.4.9 · mục 165: nạp 24 dòng cây chăm sóc đặc biệt (file 16/11/2026) nếu trang còn trống; ảnh ban đầu nằm trong app (img/cdb) */
function cayDacBiet049_(vh, log) {
  const sh = vh.getSheetByName('CayDacBiet'); if (!sh || sh.getLastRow() > 1) return;
  const ds = [["CDB-01", "1", "KTX", "Khuôn viên KTX", "", "Dừa", "10", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-01.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-02", "2", "KTX", "Trước KTX", "", "Cau", "7", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-02.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-03", "3", "KTX", "STP", "", "Bàng", "1", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-03.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-04", "4", "KTX", "Khuôn viên KTX", "", "Xoài", "1", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-04.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-05", "5", "Đường N2", "Lối đi chính vào khách sạn", "", "Dừa", "9", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-05.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-06", "6", "Đường N2", "Lối đi chính vào khách sạn", "", "Kè Bạc", "1", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-06.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-07", "7", "Đường N2", "Lối đi chính vào khách sạn", "", "Chà Là", "44", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-07.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-08", "8", "Căn tin", "Xung quanh khu vực căn tin", "", "Dừa", "2", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-08.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-09", "9", "Căn tin", "Trước căn tin", "", "Phát Tài Núi", "2", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-09.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-10", "10", "Nhà xe", "Nhà xe", "", "Dừa", "2", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-10.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-11", "11", "Cánh A", "Cánh A, B", "", "Dừa", "5", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-11.jpg|img/cdb/CDB-11-2.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-12", "12", "Cánh B", "Cánh A, B", "", "Dừa", "4", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-12.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-13", "13", "Nhà hàng Aura", "Aura", "", "Dừa", "4", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-13.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-14", "14", "Lõi Hotel", "Khu vực lõi Hotel", "", "Cọ", "7", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-14.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-15", "15", "Ballroom", "Khu vực Ballroom", "", "Phát Tài Núi", "6", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-15.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-16", "16", "Ballroom", "Khu vực Ballroom", "", "Hoa Giấy", "5", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-16.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-17", "17", "Ballroom", "Khu vực Ballroom", "", "Cọ", "7", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-17.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-18", "18", "5 Lá Cờ", "Khu vực 5 lá cờ", "", "Cọ", "5", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-18.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-19", "19", "Lõi 49-74", "Khu vực lõi 49-74", "", "Dừa", "2", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-19.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-20", "20", "Condotel", "Khu vực Condotel", "", "Cọ", "2", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-20.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-21", "21", "Villa 25-48", "Trước Villa", "", "Dừa", "5", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-21.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-22", "22", "Villa 01-24", "Trước Villa", "", "Dừa", "1", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-22.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-23", "23", "Islander", "Trước Islander", "", "Dừa", "11", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-23.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"], ["CDB-24", "24", "Bãi biển", "Khu vực bãi biển", "", "Dừa", "10", "Cây", "", "Cây phát triển yếu", "Tưới Vitamin B1 + humic vào gốc cây hỗ trợ kích thích sinh trưởng của cây", "", "", "30", "", "img/cdb/CDB-24.jpg", "2026-11-16", "Đang theo dõi", "", "Trưởng bộ phận", "2026-11-16 08:00:00"]];
  sh.getRange(2, 1, ds.length, ds[0].length).setValues(ds); log.push('Nạp ' + ds.length + ' dòng cây chăm sóc đặc biệt');
}
