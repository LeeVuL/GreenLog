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
