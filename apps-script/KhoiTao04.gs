/* GreenLog 0.4 – tạo các trang dữ liệu mới (chỉ thêm cái còn thiếu, chạy lại không sao). Cột còn thiếu được ghiLo_ tự thêm khi ghi. */
const TRANG_04 = {
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
  console.log(log.join('\n') || 'Đủ trang 0.4'); return log;
}
