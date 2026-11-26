/* GreenLog 0.4 – bảng mới, quyền nhà thầu, kiểm ảnh, thayNhom, mẫu HOD, nhắc giờ mới. GIỐNG js/v04-nen.js + js/api.js */
Object.assign(BANG, {
  NhacNho: ['homnay', 2], DuaVaoHop: ['homnay', 2], KhoKhan: ['homnay', 2], HoanViec: ['homnay', 2], TraoDoi: ['homnay', 2],
  DeXuatCay: ['homnay', 2], CayDanhMuc: ['danhmuc', 3], CaiDat: ['homnay', 3], KyDinhKy: ['homnay', 3], NgayLe: ['homnay', 3],
  NgayLamViec: ['homnay', 2], GiaoViecNgay: ['homnay', 2], NghiemThu: ['homnay', 3], BaoCaoTuan: ['homnay', 2],
  DaoTaoDiemDanh: ['homnay', 2], DaoTaoDeXuat: ['homnay', 2], KetQuaThi: ['homnay', 2], SOPDoc: ['homnay', 2],
  TuiThuocDua: ['phunbon', 2], BaoTriMay: ['noibo', 2], DanhDauSlide: ['homnay', 2], BaoCaoGM: ['homnay', 3], PhanQuyenViec: ['danhmuc', 3],
  KhuPhuTrach: ['congnhan', 3], PhunLai: ['phunbon', 2], AnhDanhMuc: ['homnay', 2], AnhDaiDien: ['homnay', 1], LinkViec: ['homnay', 2], LinkViecKetQua: ['homnay', 1],
  NghiNoiBo: ['homnay', 2], KubotaLuot: ['homnay', 2], KubotaChuyen: ['homnay', 2], DotMua: ['homnay', 2], DotMuaGhi: ['homnay', 2], // 0.4.3
  KhoVatTu: ['noibo', 2], KhoGiaoDich: ['noibo', 2], DungCu: ['noibo', 2], DungCuMuon: ['noibo', 2], KiemTraDC: ['noibo', 2], BaoTriPH: ['noibo', 2], MayHong: ['noibo', 2], // 0.4.6 Kho & tài sản
  GopY: ['phieu', 2], DungCuLichSu: ['noibo', 2], TienDoViec: ['homnay', 2], CongKyLichSu: ['homnay', 3], ChotNam: ['homnay', 3], // 0.4.7
});
BANG.DaoTao = ['homnay', 2];
/* anh Pháp được ghi các bảng này dù Hôm nay chỉ Xem */
const NHA_THAU_GHI = ['BaoCaoTuan', 'KeHoachTuan', 'KhoKhan', 'DaoTaoDeXuat', 'DaoTao', 'DaoTaoDiemDanh', 'KetQuaThi', 'SOPDoc'];
function laNhaThauGhi_(u, bang, cap) { return cap >= 2 && u.nhom === 'Quản lý nhà thầu' && NHA_THAU_GHI.indexOf(bang) >= 0; }

/* bắt buộc ảnh: máy chủ chặn giống app */
const COT_ANH = { Tuoi: 'Ảnh', ViecHangNgay: 'Ảnh', VeSinhBien: 'Ảnh', KiemTraBien: 'Ảnh', CayNoiThat: 'Ảnh', PhanCompost: 'Ảnh', VuonUom: 'Ảnh', VuonUomNoiThat: 'Ảnh', DongHoNuoc: 'Ảnh', ThuHoach: 'Ảnh cân', NhatKyPhunBon: 'Ảnh', SoTrongCay: 'Ảnh', TuiThuocDua: 'Ảnh', BaoTriMay: 'Ảnh', DichHai: 'Ảnh', BatThuong: 'Ảnh' };
function canAnh_(bang, dong) {
  const c = COT_ANH[bang]; if (!c || !dong.length) return;
  if (bang === 'TuiThuocDua' && dong.every(function (x) { return x['Loại dòng'] === 'Cây'; })) return;
  if (bang === 'DongHoNuoc' && dong.every(function (x) { return x['Trạng thái'] === 'Không bơm'; })) return; // mục 94
  if (bang === 'MaySangCat' && dong.every(function (x) { return x['Loại'] === 'Không sàng' || x['Bảo trì'] === 'Đọc đồng hồ giờ' || x['Bảo trì'] === 'Đổ xăng'; })) return;
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
/* file mẫu slide HOD trên Drive của Trưởng bộ phận (tên cố định, không đổi màu/font/bố cục) */
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


/* ================= mục 82: LINK VIỆC CHO NHÂN VIÊN =================
   Tổ trưởng / Trưởng bộ phận tạo link (bảng LinkViec). Người nhận mở link, không đăng nhập,
   chỉ đọc và ghi đúng việc đó. Link hết hạn 18:00 ngày tạo, hoặc khi bị thu hồi. */
const GIO_HET_LINK = '18:00';
function linkLay_(ma) {
  const r = bang_(vh_(), 'LinkViec').filter(function (x) { return x['Mã link'] === ma; })[0];
  if (!r) throw new Error('Link không đúng hoặc đã bị xóa.');
  if (r['Trạng thái'] === 'Thu hồi') throw new Error('Link đã được thu hồi. Liên hệ tổ trưởng.');
  const gio = Utilities.formatDate(new Date(), TZ, 'HH:mm');
  if (r['Ngày'] !== ngay_() || gio >= GIO_HET_LINK) throw new Error('Link đã hết hạn (dùng đến 18:00 trong ngày). Liên hệ tổ trưởng để gửi lại.');
  return r;
}
const LINK_API = {
  'link.mo': function (req) {
    const r = linkLay_(req.ma);
    if (r['Trạng thái'] === 'Đã gửi') capNhat_(vh_().getSheetByName('LinkViec'), function (x) { return x['Mã link'] === req.ma; }, { 'Trạng thái': 'Đã mở', 'Giờ mở': bayGio_() });
    const kq = bang_(vh_(), 'LinkViecKetQua').filter(function (x) { return x['Mã link'] === req.ma; });
    return { link: r, kq: kq, het: GIO_HET_LINK };
  },
  'link.ghi': function (req) {
    return voiKhoa_(function () {
      const r = linkLay_(req.ma);
      if (r['Trạng thái'] === 'Báo xong') throw new Error('Việc đã báo xong. Muốn làm lại thì tổ trưởng gửi link mới.');
      const anh = (req.anh || []).slice(0, 4).map(function (x) { return /^data:/.test(x) ? luuAnh_(x, 'Link') : x; }).join(' | ');
      if (!anh && ['xong', 'muc', 'truoc'].indexOf(req.loai) >= 0) throw new Error('Cần ít nhất 1 ảnh');
      ghi_(vh_(), 'LinkViecKetQua', { 'Mã link': req.ma, 'Mục': req.muc || '', 'Loại': req.loai || 'Xong', 'Ảnh': anh, 'Tình trạng': req.tt || '', 'Khối lượng': req.kl || '', 'Ghi chú': String(req.gc || '').slice(0, 1000), 'Người': r['Người nhận'], 'Giờ': bayGio_() });
      const doi = { 'Trạng thái': req.loai === 'xong' ? 'Báo xong' : req.loai === 'khokhan' ? 'Không làm được' : 'Đang làm' };
      capNhat_(vh_().getSheetByName('LinkViec'), function (x) { return x['Mã link'] === req.ma; }, doi);
      if (req.loai === 'xong' && r['Mã phiếu']) capNhat_(vh_().getSheetByName('Phieu'), function (x) { return x['Mã phiếu'] === r['Mã phiếu']; }, { 'Trạng thái': 'Báo xong', 'Ảnh sau': anh, 'Giờ xong': bayGio_(), 'Ghi chú': 'Báo xong qua link · ' + r['Người nhận'] + (req.gc ? ': ' + req.gc : '') });
      try { guiNhom_('Trưởng bộ phận', (req.loai === 'xong' ? '✅ ' : '📷 ') + r['Người nhận'] + ' · ' + r['Tiêu đề'] + (req.muc ? ' · ' + req.muc : '')); } catch (e) { /* bỏ qua */ }
      return { ok: true };
    });
  },
};
