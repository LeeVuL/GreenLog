/* GreenLog 0.4 – bảng mới, quyền nhà thầu, kiểm ảnh, thayNhom, mẫu HOD, nhắc giờ mới. GIỐNG js/v04-nen.js + js/api.js */
Object.assign(BANG, {
  NhacNho: ['homnay', 2], DuaVaoHop: ['homnay', 2], KhoKhan: ['homnay', 2], HoanViec: ['homnay', 2], TraoDoi: ['homnay', 2],
  DeXuatCay: ['homnay', 2], CayDanhMuc: ['danhmuc', 3], CaiDat: ['homnay', 3], KyDinhKy: ['homnay', 3], NgayLe: ['homnay', 3],
  NgayLamViec: ['homnay', 2], GiaoViecNgay: ['homnay', 2], NghiemThu: ['homnay', 3], BaoCaoTuan: ['homnay', 2],
  DaoTaoDiemDanh: ['homnay', 2], DaoTaoDeXuat: ['homnay', 2], KetQuaThi: ['homnay', 2], SOPDoc: ['homnay', 2],
  TuiThuocDua: ['phunbon', 2], BaoTriMay: ['noibo', 2], DanhDauSlide: ['homnay', 2], BaoCaoGM: ['homnay', 3], PhanQuyenViec: ['danhmuc', 3],
  KhuPhuTrach: ['congnhan', 3], PhunLai: ['phunbon', 2], AnhDanhMuc: ['homnay', 2],
});
BANG.DaoTao = ['homnay', 2];
/* anh Pháp được ghi các bảng này dù Hôm nay chỉ Xem */
const NHA_THAU_GHI = ['BaoCaoTuan', 'KeHoachTuan', 'KhoKhan', 'DaoTaoDeXuat', 'DaoTao', 'DaoTaoDiemDanh', 'KetQuaThi', 'SOPDoc'];
function laNhaThauGhi_(u, bang, cap) { return cap >= 2 && u.nhom === 'Quản lý nhà thầu' && NHA_THAU_GHI.indexOf(bang) >= 0; }

/* bắt buộc ảnh: máy chủ chặn giống app */
const COT_ANH = { Tuoi: 'Ảnh', ViecHangNgay: 'Ảnh', VeSinhBien: 'Ảnh', KiemTraBien: 'Ảnh', CayNoiThat: 'Ảnh', PhanCompost: 'Ảnh', VuonUom: 'Ảnh', DongHoNuoc: 'Ảnh', ThuHoach: 'Ảnh cân', NhatKyPhunBon: 'Ảnh', SoTrongCay: 'Ảnh', TuiThuocDua: 'Ảnh', BaoTriMay: 'Ảnh', DichHai: 'Ảnh', BatThuong: 'Ảnh' };
function canAnh_(bang, dong) {
  const c = COT_ANH[bang]; if (!c || !dong.length) return;
  if (bang === 'TuiThuocDua' && dong.every(function (x) { return x['Loại dòng'] === 'Cây'; })) return;
  const co = function (x) { const v = x[c] != null ? x[c] : x['Ảnh']; return Array.isArray(v) ? v.length > 0 : !!String(v || '').trim(); };
  if (!dong.some(co)) throw new Error('Cần ít nhất 1 ảnh hiện trường cho việc này');
}

/* thay toàn bộ nhóm dòng khớp khóa (vd: người của một khu phụ trách) */
API.thayNhom = function (u, r) {
  quyenBang_(u, r.bang, 3);
  return voiKhoa_(function () {
    const vh = vh_(); const moi = r.dong.map(function (x) { return dien_(u, r.bang, x, vh); });
    xoaDong_(vh.getSheetByName(r.bang), function (x) { return khop_(x, r.khoa); });
    ghiLo_(vh, r.bang, moi); return { n: moi.length };
  });
};
/* file mẫu slide HOD trên Drive của anh Vũ (tên cố định, không đổi màu/font/bố cục) */
API.mauHOD = function (u) {
  can_(u, 'homnay', 3);
  const ten = prop_('MAU_HOD', true) || 'Movenpick_Phu_Quoc_Weekly_HOD_Briefing_Template';
  const it = DriveApp.getFilesByName(ten); if (!it.hasNext()) throw new Error('Không thấy file mẫu ' + ten + ' trên Drive');
  return { b64: Utilities.base64Encode(it.next().getBlob().getBytes()) };
};

/* nhắc giờ mới của 0.4, gọi từ moiPhut() */
function moiPhut04_(luc, thu) {
  const hn = ngay_(); const nlv = function () { return bang_(vh_(), 'NgayLamViec').filter(function (x) { return x['Ngày'] === hn; }); };
  const doiChua = function (loai) { const co = nlv().filter(function (x) { return x['Loại'] === loai; }).map(function (x) { return x['Đội']; }); return danhBa_().filter(function (x) { return x.nhom === 'Tổ trưởng' && co.indexOf(x.doi) < 0; }); };
  if (luc(7, 20) && motLan_('nhacBatDau')) doiChua('Bắt đầu ngày').forEach(function (x) { guiTin_(x, '🌅 Hạn 07:30: gửi kế hoạch ngày, giao việc từng người.\n' + link_('batdaungay')); });
  if (luc(17, 30) && motLan_('nhacChot')) doiChua('Chốt ngày').forEach(function (x) { guiTin_(x, '🌇 Đã 17:30: chốt ngày, nhập kết quả từng việc.\n' + link_('chotngay')); });
  if (luc(19, 0) && motLan_('anhChot')) guiNhom_('Trưởng bộ phận', '🌇 Duyệt chốt ngày, ghi ý kiến giám sát vào nhật ký thi công.\n' + link_('homnay'));
  if (thu === 1 && luc(8, 0) && motLan_('nhacBCTuan')) { guiNhom_('Quản lý nhà thầu', '🗒️ Hôm nay nộp báo cáo tuần và đăng ký kế hoạch tuần tới trước 17:30.\n' + link_('hop/baocao')); guiNhom_('Tổ trưởng', '🗒️ Hôm nay nộp báo cáo tuần và đăng ký kế hoạch tuần tới trước 17:30.\n' + link_('hop/baocao')); }
  if (thu === 1 && luc(15, 0) && motLan_('nhacBCTuan15')) { const t = bang_(vh_(), 'BaoCaoTuan').some(function (x) { return String(x['Giờ ghi'] || '').indexOf(hn) === 0; }); if (!t) guiNhom_('Quản lý nhà thầu', '⏰ Còn 2 giờ rưỡi: báo cáo tuần chưa gửi.\n' + link_('hop/baocao')); }
}
