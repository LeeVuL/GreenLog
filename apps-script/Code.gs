/**
 * GreenLog – phần chạy ngầm (Google Apps Script), bản 0.2
 * Triển khai: Deploy → New deployment → Web app · Execute as: Me · Who has access: Anyone
 * Quyền dùng app do danh sách NguoiDung quyết định (đăng nhập Gmail), không phải do link.
 * Quy tắc ghi giống hệt chế độ chạy thử trong js/api.js.
 */
const TZ = 'Asia/Ho_Chi_Minh';
const PHIEN_NGAY = 60;
const CAP = { 'Không thấy': 0, 'Xem': 1, 'Ghi': 2, 'Duyệt': 3 };
const PHAN_HE = [
  ['homnay', 'Hôm nay / Lịch'], ['diemdanh', 'Điểm danh'], ['congnhan', 'Công nhân'], ['dinhky', 'Định kỳ / Tưới'],
  ['noibo', 'Việc nội bộ'], ['vuonuom', 'Vườn ươm cây bụi'], ['donghonuoc', 'Đồng hồ nước'],
  ['phieu', 'Phiếu / Dịch hại / Sổ trồng cây'], ['phunbon', 'Phun, bón'], ['duan', 'Dự án'], ['sukien', 'Sự kiện'],
  ['kehoach', 'KH tuần / KH tháng'], ['tuantra', 'Tuần tra'], ['ai', 'AI nhận diện'], ['baocao', 'Báo cáo'], ['danhmuc', 'Danh mục / Phân quyền'],
];
const COT_NHOM = { 'Tổ trưởng': 1, 'Quản lý nhà thầu': 2, 'Nhân viên nội bộ': 3, 'Trưởng bộ phận': 4 };

/* Bảng → [phân hệ, cấp tối thiểu để ghi]. GIỐNG js/api.js */
const BANG = {
  DiemDanh: ['diemdanh', 3], DuyetCong: ['diemdanh', 3], PhieuSuaCong: ['diemdanh', 3],
  TickDinhKy: ['dinhky', 3], AnhNgay: ['dinhky', 3], Tuoi: ['dinhky', 2], ViecHangNgay: ['dinhky', 2], KeHoachDinhKy: ['kehoach', 2],
  DongHoNuoc: ['donghonuoc', 2], VuonUom: ['vuonuom', 2],
  VeSinhBien: ['noibo', 2], KiemTraBien: ['noibo', 2], VuonRau: ['noibo', 2], ThuHoach: ['noibo', 2], CayNoiThat: ['noibo', 2],
  RacHuuCo: ['noibo', 2], PhanCompost: ['noibo', 2], MaySangCat: ['noibo', 2],
  Phieu: ['phieu', 3], PhieuLichSu: ['phieu', 3], DichHai: ['phieu', 2], DichHaiCapNhat: ['phieu', 2], SoTrongCay: ['phieu', 2], BatThuong: ['phieu', 2],
  NhatKyPhunBon: ['phunbon', 2], NhatKyPhunBonChiTiet: ['phunbon', 2], DeXuatThuoc: ['phunbon', 2], CongThucPha: ['phunbon', 3],
  DuAn: ['duan', 3], DuAnGiaiDoan: ['duan', 3], DuAnVatTu: ['duan', 3], DuAnTienDo: ['duan', 2],
  SuKien: ['sukien', 3], KeHoachTuan: ['kehoach', 2], TuanTra: ['tuantra', 3],
  ChamDiem: ['homnay', 3], KyCham: ['homnay', 3], CanhBaoBao: ['homnay', 3], ViecLapLai: ['homnay', 3],
  CongNhanDangKy: ['congnhan', 2], PhanQuyen: ['danhmuc', 3], UyQuyen: ['danhmuc', 3], ThoiTiet: ['homnay', 1], NhatKyThayDoi: ['homnay', 3],
};
const COT_NGUOI = ['Người ghi', 'Người tạo', 'Người tick', 'Người phun', 'Người báo', 'Người chấm', 'Người đọc', 'Người đăng ký', 'Người đề xuất', 'Người lập', 'Người phát hiện', 'Người tuần tra', 'Người kích hoạt', 'Người'];
const COT_GIO = ['Giờ ghi', 'Giờ tạo', 'Giờ tick', 'Giờ đăng ký', 'Thời điểm', 'Ngày giờ', 'Kích hoạt lúc', 'Cập nhật gần nhất'];
const MA_SO = { Phieu: ['Mã phiếu', 'P'], DichHai: ['Mã DH', 'DH'], NhatKyPhunBon: ['Mã NK', 'NK'], SuKien: ['Mã SK', 'SK'], DuAn: ['Mã DA', 'DA'],
  TuanTra: ['Mã tuần tra', 'TT'], ViecLapLai: ['Mã LL', 'LL'], CongNhanDangKy: ['Mã ĐK', 'ĐK'], DeXuatThuoc: ['Mã ĐX', 'ĐX'], KeHoachTuan: ['Mã KHT', 'KT'],
  KeHoachDinhKy: ['Mã KH', 'KH'], CongThucPha: ['Mã CT', 'CT'], PhieuSuaCong: ['Mã phiếu', 'SC'], CanhBaoBao: ['Mã đợt', 'BAO'] };
const HAN_GIO = { 'Khẩn cấp': 2, 'Cao': 24, 'Trung bình': 72, 'Thấp': 168 };
const TT_DD = 'Trạng thái (Có mặt/Vắng/Về sớm)';

/* ================= Cổng vào ================= */
function doGet() { return json_({ ok: true, ten: 'GreenLog API', luc: bayGio_() }); }

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, loi: 'Yêu cầu không hợp lệ' }); }
  try {
    if (req.action === 'dangNhap') return json_({ ok: true, data: dangNhap_(req.idToken) });
    const u = nguoiTuPhien_(req.token);
    if (!u) return json_({ ok: false, loi: 'HET_PHIEN' });
    const fn = API[req.action];
    if (!fn) return json_({ ok: false, loi: 'Không có chức năng ' + req.action });
    return json_({ ok: true, data: fn(u, req) });
  } catch (err) {
    console.error(err && err.stack || err);
    return json_({ ok: false, loi: String(err && err.message || err) });
  }
}

const API = {
  'khoiDong': khoiDong_, 'docNhieu': docNhieu_, 'ghi': function (u, r) { return ghiAPI_(u, r); }, 'ghiNhieu': ghiNhieu_, 'sua': sua_, 'xoa': xoa_,
  'diemDanh.gui': function (u, r) { if (u.nhom === 'Quản lý nhà thầu') throw new Error('Anh Pháp chỉ tự điểm danh cho mình'); return ghiDD_(u, r); },
  'diemDanh.tuDiem': ddTuDiem_, 'diemDanh.duyet': ddDuyet_,
  'dinhKy.luu': dkLuu_, 'phieu.tao': phieuTao_, 'phieu.chuyen': phieuChuyen_,
  'congNhan.duyet': cnDuyet_, 'thoiTiet': function () { return thoiTiet_(); },
  'ai.cay': aiCay_, 'ai.trieuChung': aiTrieuChung_,
};

/* ================= Đăng nhập, quyền ================= */
function dangNhap_(idToken) {
  const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('Không xác minh được tài khoản Google');
  const t = JSON.parse(res.getContentText());
  if (t.aud !== prop_('CLIENT_ID')) throw new Error('Mã đăng nhập không đúng ứng dụng');
  if (String(t.email_verified) !== 'true') throw new Error('Gmail chưa xác minh');
  const u = timNguoiDung_(String(t.email).toLowerCase());
  if (!u) throw new Error('Gmail ' + t.email + ' chưa có trong danh sách người dùng GreenLog. Nhờ anh Vũ thêm vào.');
  const token = Utilities.getUuid() + Utilities.getUuid().slice(0, 8);
  PropertiesService.getScriptProperties().setProperty('S_' + token, JSON.stringify({ email: u.gmail, het: Date.now() + PHIEN_NGAY * 864e5 }));
  return { token: token, user: u };
}
function nguoiTuPhien_(token) {
  if (!token) return null;
  const raw = PropertiesService.getScriptProperties().getProperty('S_' + token);
  if (!raw) return null;
  const s = JSON.parse(raw);
  if (s.het < Date.now()) { PropertiesService.getScriptProperties().deleteProperty('S_' + token); return null; }
  return timNguoiDung_(s.email);
}
function timNguoiDung_(email) {
  const cache = CacheService.getScriptCache(); const k = 'U_' + email; const c = cache.get(k);
  if (c) return JSON.parse(c);
  const ds = bang_(nen_(), 'NguoiDung');
  const r = ds.filter(function (x) { return String(x['Gmail']).trim().toLowerCase() === email; })[0];
  if (!r) return null;
  const vaiTro = String(r['Vai trò']);
  const u = { ten: r['Họ tên'], gmail: email, nhom: r['Nhóm quyền'] || r['Nhóm'], vaiTro: vaiTro,
    doi: /cơ động/i.test(vaiTro) ? 'Đội cơ động' : (/khu vực/i.test(vaiTro) ? 'Đội khu vực' : '') };
  u.quyen = tinhQuyen_(u, ds);
  cache.put(k, JSON.stringify(u), 300);
  return u;
}
function tinhQuyen_(u, dsNguoi) {
  const tenRieng = dsNguoi.map(function (x) { return String(x['Họ tên']).split(' ').pop(); });
  const mk = bang_(nen_(), 'PhanQuyenMacDinh'); const cot = COT_NHOM[u.nhom] || 0; const q = {};
  PHAN_HE.forEach(function (p) {
    const dong = mk.filter(function (r) { return String(r['Phân hệ']).indexOf(p[1].split(' (')[0]) === 0; })[0];
    q[p[0]] = cot && dong ? docCap_(String(dong[Object.keys(dong)[cot]]), u.ten, tenRieng) : 0;
  });
  const vh = vh_();
  bang_(vh, 'PhanQuyen').forEach(function (r) {
    const ap = String(r['Áp cho (nhóm hoặc Gmail)']).trim();
    if (ap.toLowerCase() !== u.gmail && ap !== u.nhom && ap !== u.ten) return;
    const ph = khoaPH_(r['Phân hệ']); if (ph) q[ph] = CAP[String(r['Cấp (Không thấy/Xem/Ghi/Duyệt)'])] || 0;
  });
  const hn = ngay_();
  bang_(vh, 'UyQuyen').forEach(function (r) {
    const nhan = String(r['Người nhận']); if (nhan !== u.ten && nhan.toLowerCase() !== u.gmail) return;
    if (String(r['Từ ngày']) > hn || String(r['Đến ngày']) < hn) return;
    const ph = khoaPH_(r['Phân hệ']); if (ph) q[ph] = Math.max(q[ph], CAP[String(r['Cấp'])] || 0);
  });
  return q;
}
function khoaPH_(v) { const p = PHAN_HE.filter(function (x) { return x[0] === v || x[1] === v; })[0]; return p ? p[0] : null; }
function docCap_(o, ten, tenRieng) {
  const phan = o.split(',').map(function (s) { return s.trim(); }); let chung = null;
  for (let i = 0; i < phan.length; i++) {
    const mc = phan[i].match(/^(Không thấy|Xem|Ghi|Duyệt)/); const cap = mc ? CAP[mc[1]] : 0; const m = phan[i].match(/\(([^)]+)\)/);
    if (m && tenRieng.indexOf(m[1].trim()) >= 0) { if (String(ten).split(' ').pop() === m[1].trim()) return cap; }
    else if (chung === null) chung = cap;
  }
  return chung === null ? 0 : chung;
}
function can_(u, ph, cap) { if ((u.quyen[ph] || 0) < cap) throw new Error('Anh/chị chưa có quyền này'); }
function quyenBang_(u, bang, cap, hd) {
  const b = BANG[bang]; if (!b) throw new Error('Không có bảng ' + bang);
  if (bang === 'VuonUom' && (u.quyen.noibo || 0) >= cap) return;
  if (bang === 'DuAnTienDo' && cap === 2 && (u.quyen.duan || 0) >= 2) return;
  if (bang === 'SuKien' && hd === 'sua' && cap === 2 && (u.quyen.sukien || 0) >= 2) return;
  if (cap >= 2) cap = Math.max(cap, b[1]);
  can_(u, b[0], cap);
}
function laDuyet_(doi) { return Object.keys(doi).some(function (k) { return ['Khóa', 'Người duyệt', 'Giờ duyệt'].indexOf(k) >= 0 || String(doi[k]) === 'Đã duyệt'; }); }

/* ================= Khởi động: danh mục ================= */
function khoiDong_(u) {
  const nen = nen_(); const vh = vh_();
  const ds1 = function (ten) { return bang_(nen, ten).map(function (r) { return r[Object.keys(r)[0]]; }).filter(String); };
  const thuoc = bang_(nen, 'ThuocPhan', 3).filter(function (r) { return r['Tên vật tư']; }).map(function (r, i) {
    const m = String(r['Thời gian cách ly'] || '0').match(/\d+/g);
    return { ma: 'TP' + ('0' + (i + 1)).slice(-2), ten: r['Tên vật tư'], nhom: r['Nhóm'], dvt: r['ĐVT'], cachLy: m ? Math.max.apply(null, m.map(Number)) : 0,
      tt: r['Trạng thái (Đang dùng/Chờ duyệt/Ngưng dùng)'] || 'Đang dùng', khongPha: r['Không pha chung với'] || '' };
  }).concat(bang_(vh, 'DeXuatThuoc').filter(function (x) { return x['Trạng thái (Chờ duyệt/Đã duyệt/Từ chối)'] !== 'Từ chối'; }).map(function (x) {
    return { ma: x['Mã ĐX'], ten: x['Tên thuốc/phân'], nhom: x['Loại'], dvt: '', cachLy: +x['Cách ly đề xuất (ngày)'] || 14,
      tt: x['Trạng thái (Chờ duyệt/Đã duyệt/Từ chối)'] === 'Đã duyệt' ? 'Đang dùng' : 'Chờ duyệt', khongPha: x['Không pha chung với'] || '' };
  }));
  const thayCN = u.quyen.diemdanh || u.quyen.congnhan || u.quyen.baocao || u.quyen.homnay >= 3;
  return {
    user: u, ky: ky_(ngay_()), coThoiTiet: true, coAI: !!(prop_('PLANTNET_KEY', true) || prop_('GEMINI_KEY', true)),
    vitri: bang_(nen, 'ViTri').map(function (r) { return { ma: r['Mã'], cum: r['Cụm'], kv: r['Khu vực'], ten: r['Vị trí'], ap: r['Áp dụng 8 việc chính'] }; }),
    dauviec: bang_(nen, 'DauViec').map(function (r) { return { ma: r['Mã'], ten: r['Tên việc'], nhom: r['Nhóm thực hiện'], tanSuat: r['Tần suất'], anh: r['Ảnh'] }; }),
    loi: bang_(nen, 'LoiCanhQuan').map(function (r) { return { nhom: r['Nhóm'], ten: r['Loại lỗi'], muc: r['Mức độ gợi ý'] }; }),
    diemkhac: bang_(nen, 'DiemKhac').map(function (r) { return { loai: r['Loại'], ma: r['Mã'], ten: r['Tên'] }; }),
    cay: bang_(nen, 'DanhMucCay').filter(function (r) { return r['Mã']; }).map(function (r) { return { ma: r['Mã'], ten: r['Tên tiếng Việt'], en: r['Tên tiếng Anh'], kh: r['Tên khoa học'], nhom: r['Nhóm cây'], trong: r['Dùng để trồng'] }; }),
    thuoc: thuoc, congThuc: bang_(vh, 'CongThucPha').filter(function (r) { return r['Đang dùng'] !== 'Không'; }),
    caytrong: ds1('CayTrong'), batthuong: ds1('BatThuong'),
    ngayle: bang_(nen, 'NgayLe', 3).filter(function (r) { return r['Ngày']; }).map(function (r) { return { ngay: r['Ngày'], ten: r['Tên ngày lễ'] }; }),
    congnhan: thayCN ? bang_(nen, 'CongNhan').filter(function (r) { return r['Mã']; }).map(function (r) {
      return { ma: r['Mã'], ten: r['Họ và tên'], doi: r['Đội'], cd: r['Chức danh'], kv: r['Khu vực phụ trách'], sdt: r['Số điện thoại'], tt: r['Trạng thái'] }; }) : [],
    nguoi: bang_(nen, 'NguoiDung').map(function (r) { const v = String(r['Vai trò']); return { ten: r['Họ tên'], nhom: r['Nhóm quyền'] || r['Nhóm'], gmail: String(r['Gmail']).toLowerCase(), doi: /cơ động/i.test(v) ? 'Đội cơ động' : /khu vực/i.test(v) ? 'Đội khu vực' : '' }; }),
    hinhThuc: ds1('HinhThucTrong'), nguonCay: ds1('NguonCay'), dvt: ds1('DVT'), loaiSuKien: ds1('LoaiSuKien'), nguonPhieu: ds1('NguonPhieu'),
    tieuChi: bang_(nen, 'TieuChiChatLuong').map(function (r) { return { ten: r['Tiêu chí'], ap: r['Áp dụng'] }; }), kiemTraBao: ds1('KiemTraTruocBao'),
    mucDoDH: bang_(nen, 'MucDoDichHai').map(function (r) { return { ten: r['Mức độ'], tyLe: r['Tỷ lệ bị hại'] }; }), phamVi: ds1('PhamViDichHai'),
    nhomCayDK: bang_(nen, 'NhomCayDinhKy').map(function (r) { return { ten: r['Nhóm cây'], viec: String(r['Việc định kỳ được tính luôn']).split(',').map(function (s) { return s.trim(); }) }; }),
    loaiPB: ds1('LoaiPhunBon'), dichHai: ds1('DanhMucDichHai'), baoHo: ds1('BaoHo'),
  };
}

/* ================= Đọc / ghi chung ================= */
function khop_(r, loc) {
  if (!loc) return true;
  return Object.keys(loc).every(function (k) {
    const v = loc[k];
    if (Array.isArray(v)) return v.indexOf(r[k]) >= 0;
    if (v && typeof v === 'object') return (v.tu == null || r[k] >= v.tu) && (v.den == null || r[k] <= v.den);
    return r[k] === v;
  });
}
function docNhieu_(u, r) {
  const vh = vh_(); const out = {};
  r.ds.forEach(function (x) {
    quyenBang_(u, x.bang, 1);
    let rows = bang_(vh, x.bang).filter(function (y) { return khop_(y, x.loc); });
    if (x.gioiHan) rows = rows.slice(-x.gioiHan);
    out[x.ten || x.bang] = rows;
  });
  return out;
}
function dien_(u, bang, dong, vh) {
  const r = {}; Object.keys(dong).forEach(function (k) { r[k] = dong[k]; });
  COT_NGUOI.forEach(function (c) { if (c in r && !r[c]) r[c] = u.ten; });
  COT_GIO.forEach(function (c) { if (c in r && !r[c]) r[c] = bayGio_(); });
  if ('Ngày' in r && !r['Ngày']) r['Ngày'] = ngay_();
  Object.keys(r).forEach(function (k) {
    const v = r[k];
    if (Array.isArray(v)) r[k] = v.map(function (x) { return /^data:image/.test(x) ? luuAnh_(x, bang) : x; }).join(' | ');
    else if (typeof v === 'string' && /^data:image/.test(v)) r[k] = luuAnh_(v, bang);
    else r[k] = v == null ? '' : String(v);
  });
  const m = MA_SO[bang];
  if (m && !r[m[0]]) {
    const tien = m[1] + Utilities.formatDate(new Date(), TZ, 'yyMMdd') + '-';
    const n = bang_(vh, bang).filter(function (x) { return String(x[m[0]] || '').indexOf(tien) === 0; }).length + 1;
    r[m[0]] = tien + ('00' + n).slice(-3);
  }
  return r;
}
function ghiAPI_(u, r, noiBo) {
  if (!noiBo) quyenBang_(u, r.bang, 2);
  return voiKhoa_(function () { const vh = vh_(); const d = dien_(u, r.bang, r.dong, vh); ghi_(vh, r.bang, d); sauGhi_(u, r.bang, d); return d; });
}
function ghiNhieu_(u, r) {
  quyenBang_(u, r.bang, 2);
  return voiKhoa_(function () {
    const vh = vh_(); const moi = r.dong.map(function (x) { return dien_(u, r.bang, x, vh); });
    if (r.thay) xoaDong_(vh.getSheetByName(r.bang), function (o) { return moi.some(function (n) { return r.thay.every(function (k) { return o[k] === n[k]; }); }); });
    ghiLo_(vh, r.bang, moi); moi.forEach(function (d) { sauGhi_(u, r.bang, d); });
    return moi;
  });
}
function sua_(u, r) {
  quyenBang_(u, r.bang, laDuyet_(r.doi) ? 3 : 2, 'sua');
  return voiKhoa_(function () {
    const vh = vh_(); const doi = {};
    Object.keys(r.doi).forEach(function (k) { const v = r.doi[k]; doi[k] = typeof v === 'string' && /data:image/.test(v) ? v.split(' | ').map(function (x) { return /^data:/.test(x) ? luuAnh_(x, r.bang) : x; }).join(' | ') : (v == null ? '' : v); });
    const n = capNhat_(vh.getSheetByName(r.bang), function (x) { return khop_(x, r.khoa); }, doi);
    if (r.lyDo) ghi_(vh, 'NhatKyThayDoi', { 'Thời điểm': bayGio_(), 'Người': u.ten, 'Trang': r.bang, 'Mã bản ghi': JSON.stringify(r.khoa), 'Trường': Object.keys(doi).join(', '), 'Giá trị mới': Object.keys(doi).map(function (k) { return doi[k]; }).join(', '), 'Lý do': r.lyDo });
    sauSua_(u, r.bang, r.khoa, doi);
    return { n: n };
  });
}
function xoa_(u, r) {
  quyenBang_(u, r.bang, 2);
  return voiKhoa_(function () {
    const hn = ngay_(); const anh = (u.quyen.homnay || 0) >= 3;
    const n = xoaDong_(vh_().getSheetByName(r.bang), function (x) {
      if (!khop_(x, r.khoa)) return false;
      return anh || (COT_NGUOI.some(function (c) { return x[c] === u.ten; }) && Object.keys(x).some(function (k) { return String(x[k]).indexOf(hn) === 0; }));
    });
    if (!n) throw new Error('Chỉ xóa được dòng do mình ghi trong hôm nay.');
    return { n: n };
  });
}

/* ================= Điểm danh ================= */
function ghiDD_(u, r) {
  can_(u, 'diemdanh', 2);
  const anhTT = (r.anh || []).map(function (x) { return /^data:/.test(x) ? luuAnh_(x, 'diemdanh') : x; });
  return voiKhoa_(function () {
    const vh = vh_(); const nen = nen_(); const anh = (u.quyen.diemdanh || 0) >= 3;
    const doi = r.doi || u.doi || 'Chưa phân đội';
    const cnMap = {}; bang_(nen, 'CongNhan').forEach(function (x) { cnMap[x['Mã']] = x; });
    const ten = function (ma) { return (cnMap[ma] || {})['Họ và tên'] || ma; };
    const cu = bang_(vh, 'DiemDanh').filter(function (x) { return x['Ngày'] === r.ngay && x['Buổi'] === r.buoi; });
    const du = bang_(vh, 'DuyetCong').filter(function (x) { return x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && x['Đội'] === doi; });
    const thay = !anh && u.doi && doi !== u.doi && doi !== 'Quản lý nhà thầu';
    if (thay && du.some(function (x) { return x['Người gửi'] !== u.ten; })) throw new Error(doi + ' đã được ' + du[0]['Người gửi'] + ' điểm danh buổi này.');
    if (!anh && r.buoi === 'Sáng' && doi !== 'Quản lý nhà thầu' && !anhTT.length) throw new Error('Buổi sáng cần 1 ảnh tập thể đầu ca.');
    if (!anh) {
      if (du.some(function (x) { return x['Khóa'] === 'Có'; })) throw new Error('Buổi này anh Vũ đã duyệt và khóa. Cần sửa thì báo anh Vũ.');
      const khoa = r.ds.filter(function (x) { return cu.some(function (c) { return c['Mã CN'] === x.ma && c['Trạng thái duyệt'] === 'Đã duyệt'; }); });
      if (khoa.length) throw new Error('Đã khóa, không sửa được: ' + khoa.map(function (x) { return ten(x.ma); }).join(', ') + '. Cần sửa thì báo anh Vũ.');
      const khac = r.ds.filter(function (x) { return cu.some(function (c) { return c['Mã CN'] === x.ma && c['Người ghi'] !== u.ten; }); });
      if (khac.length) throw new Error('Đã được tổ trưởng khác điểm danh: ' + khac.map(function (x) { return ten(x.ma); }).join(', '));
    }
    const ma = r.ds.map(function (x) { return x.ma; }); const gio = bayGio_();
    xoaDong_(vh.getSheetByName('DiemDanh'), function (x) { return x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && ma.indexOf(x['Mã CN']) >= 0; });
    const rows = r.ds.map(function (x) {
      const c = cu.filter(function (y) { return y['Mã CN'] === x.ma; })[0];
      if (anh && c && c[TT_DD] !== x.tt) ghi_(vh, 'NhatKyThayDoi', { 'Thời điểm': gio, 'Người': u.ten, 'Trang': 'DiemDanh', 'Mã bản ghi': r.ngay + '/' + r.buoi + '/' + x.ma, 'Trường': 'Trạng thái', 'Giá trị cũ': c[TT_DD], 'Giá trị mới': x.tt, 'Lý do': r.lyDo || 'Anh Vũ sửa trực tiếp' });
      const o = { 'Ngày': r.ngay, 'Buổi': r.buoi, 'Mã CN': x.ma, 'Họ tên': ten(x.ma), 'Đội': anh ? (c ? c['Đội'] : (cnMap[x.ma] || {})['Đội'] || 'Chưa phân đội') : doi,
        'Giờ về': x.gioVe || '', 'Lý do': x.lyDo || '', 'Công': x.tt === 'Có mặt' ? 0.5 : 0, 'Ảnh tập thể': '',
        'Người ghi': anh && c ? c['Người ghi'] : u.ten, 'Giờ ghi': gio, 'Trạng thái duyệt': anh ? 'Đã duyệt' : 'Chờ duyệt' };
      o[TT_DD] = x.tt; return o;
    });
    ghiLo_(vh, 'DiemDanh', rows);
    if (!anh) {
      xoaDong_(vh.getSheetByName('DuyetCong'), function (x) { return x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && x['Đội'] === doi; });
      ghi_(vh, 'DuyetCong', { 'Ngày': r.ngay, 'Buổi': r.buoi, 'Đội': doi, 'Người gửi': u.ten, 'Giờ gửi': gio, 'Khóa': 'Không', 'Ảnh tập thể': anhTT.join(' | '), 'Ghi chú': thay ? 'Điểm danh thay (tổ trưởng ' + doi + ' nghỉ)' : '' });
      if (doi !== 'Quản lý nhà thầu') {
        const co = r.ds.filter(function (x) { return x.tt === 'Có mặt'; }).length; const som = r.ds.filter(function (x) { return x.tt === 'Về sớm'; });
        guiNhom_('Trưởng bộ phận', '🧑‍🤝‍🧑 ' + u.ten + ' gửi điểm danh ' + r.buoi.toLowerCase() + ' ' + doi + ': ' + co + '/' + r.ds.length + ' có mặt' + (thay ? ' (điểm danh thay)' : '')
          + (som.length ? '\nVề sớm: ' + som.map(function (x) { return ten(x.ma) + ' ' + x.gioVe; }).join(', ') : '') + '\nDuyệt: ' + link_('diemdanh'));
      }
    }
    return { ok: true };
  });
}
function ddTuDiem_(u, r) {
  can_(u, 'diemdanh', 2);
  const cn = bang_(nen_(), 'CongNhan').filter(function (x) { return x['Họ và tên'] === u.ten; })[0];
  if (!cn) throw new Error('Không tìm thấy tên ' + u.ten + ' trong danh sách công nhân');
  return ghiDD_(u, { ngay: ngay_(), buoi: r.buoi, doi: 'Quản lý nhà thầu', ds: [{ ma: cn['Mã'], tt: 'Có mặt' }] });
}
function ddDuyet_(u, r) {
  can_(u, 'diemdanh', 3);
  return voiKhoa_(function () {
    const vh = vh_(); const now = bayGio_();
    const dk = function (x) { return x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && (!r.doi || x['Đội'] === r.doi); };
    capNhat_(vh.getSheetByName('DuyetCong'), dk, { 'Người duyệt': u.ten, 'Giờ duyệt': now, 'Khóa': 'Có' });
    capNhat_(vh.getSheetByName('DiemDanh'), dk, { 'Trạng thái duyệt': 'Đã duyệt' });
    return { ok: true };
  });
}

/* ================= Định kỳ ================= */
function dkLuu_(u, r) {
  can_(u, 'dinhky', 2);
  if (!r.anh || !r.anh.length) throw new Error('Cần ít nhất 1 ảnh hiện trường');
  const anh = r.anh.map(function (x) { return /^data:/.test(x) ? luuAnh_(x, 'dinhky') : x; });
  return voiKhoa_(function () {
    const vh = vh_(); const k = ky_(ngay_()).ten; const gio = bayGio_();
    const t = bang_(vh, 'TickDinhKy').filter(function (y) { return y['Kỳ'] === k && y['Mã việc'] === r.viec; });
    const rows = r.ds.map(function (x) {
      const truoc = t.filter(function (y) { return y['Mã vị trí'] === x.vt; }).length;
      if (truoc && !x.lyDo) throw new Error('Vị trí ' + x.vt + ' đã làm trong kỳ. Chọn lý do làm thêm.');
      return { 'Ngày': ngay_(), 'Kỳ': k, 'Mã việc': r.viec, 'Mã vị trí': x.vt, 'Lần': truoc + 1, 'Lý do làm thêm': x.lyDo || '', 'Mã dịch hại': r.maDH || '', 'Người tick': u.ten, 'Giờ tick': gio, 'Ghi chú': r.ghiChu || '' };
    });
    ghiLo_(vh, 'TickDinhKy', rows);
    const kv = r.ds.map(function (d) { return d.kv; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }).join(', ');
    ghiLo_(vh, 'AnhNgay', anh.map(function (a) { return { 'Ngày': ngay_(), 'Mã việc': r.viec, 'Khu vực': kv, 'Link ảnh': a, 'Nguồn ảnh': 'Chụp', 'Người chụp': u.ten, 'Giờ': gio }; }));
    return { n: rows.length };
  });
}

/* ================= Phiếu ================= */
function phieuTao_(u, r) {
  can_(u, 'phieu', 2);
  const han = new Date(Date.now() + (HAN_GIO[r.muc] || 72) * 36e5);
  const p = ghiAPI_(u, { bang: 'Phieu', dong: { 'Mã phiếu': '', 'Loại': r.loaiPhieu || 'Lỗi', 'Nguồn': r.nguon || 'Nhân viên tự phát hiện', 'Nhóm lỗi': r.nhom || '', 'Loại lỗi': r.loai,
    'Mức độ': r.muc, 'Mã vị trí': r.vt || '', 'Vị trí khác': r.vtKhac || '', 'Mô tả': r.moTa || '', 'Giao cho': r.giao || '', 'Người tạo': '', 'Giờ tạo': '',
    'Hạn': Utilities.formatDate(han, TZ, 'yyyy-MM-dd HH:mm'), 'Ảnh trước': r.anh || [], 'Trạng thái': 'Mới', 'Số lần trả lại': 0,
    'Mã tuần tra': r.maTT || '', 'Mã sự kiện': r.maSK || '', 'Mã dự án': r.maDA || '', 'Mã lặp lại': r.maLL || '' } }, true);
  ghiAPI_(u, { bang: 'PhieuLichSu', dong: { 'Mã phiếu': p['Mã phiếu'], 'Thời điểm': '', 'Hành động': 'Tạo', 'Người': '' } }, true);
  if (r.muc === 'Khẩn cấp' || r.muc === 'Cao') guiGiao_(r.giao, (r.muc === 'Khẩn cấp' ? '🚨 KHẨN CẤP' : '🔶 Cao') + ': ' + r.loai + '\n📍 ' + tenVT_(r.vt, r.vtKhac) + '\nHạn ' + p['Hạn'].slice(11) + ' · ' + link_('phieu'), r.muc === 'Khẩn cấp');
  return { ma: p['Mã phiếu'] };
}
function phieuChuyen_(u, r) {
  can_(u, 'phieu', r.hd === 'duyet' || r.hd === 'traLai' ? 3 : 2);
  const anh = (r.anh || []).map(function (x) { return /^data:/.test(x) ? luuAnh_(x, 'phieu') : x; });
  return voiKhoa_(function () {
    const vh = vh_(); const now = bayGio_();
    const p = bang_(vh, 'Phieu').filter(function (x) { return x['Mã phiếu'] === r.ma; })[0];
    if (!p) throw new Error('Không tìm thấy phiếu ' + r.ma);
    let doi;
    if (r.hd === 'nhan') doi = { 'Người nhận': u.ten, 'Giờ nhận': now, 'Trạng thái': 'Đang xử lý' };
    if (r.hd === 'xong') { if (!anh.length) throw new Error('Cần ảnh sau khi xử lý'); doi = { 'Ảnh sau': anh.join(' | '), 'Giờ xong': now, 'Trạng thái': 'Báo xong' }; }
    if (r.hd === 'duyet') doi = { 'Giờ duyệt': now, 'Trạng thái': 'Đã duyệt' };
    if (r.hd === 'traLai') doi = { 'Trạng thái': 'Bị trả lại', 'Số lần trả lại': Number(p['Số lần trả lại'] || 0) + 1 };
    capNhat_(vh.getSheetByName('Phieu'), function (x) { return x['Mã phiếu'] === r.ma; }, doi);
    ghi_(vh, 'PhieuLichSu', { 'Mã phiếu': r.ma, 'Thời điểm': now, 'Hành động': r.hd, 'Người': u.ten, 'Ghi chú': r.ghiChu || '' });
    if (r.hd === 'traLai') guiTen_(p['Người nhận'], '↩️ Phiếu bị trả lại: ' + p['Loại lỗi'] + (r.ghiChu ? '\nLý do: ' + r.ghiChu : '') + '\n' + link_('phieu'));
    return { ok: true };
  });
}

/* ================= Công nhân: duyệt đăng ký → cập nhật danh sách ================= */
function cnDuyet_(u, r) {
  can_(u, 'congnhan', 3);
  return voiKhoa_(function () {
    const vh = vh_(); const nen = nen_();
    const x = bang_(vh, 'CongNhanDangKy').filter(function (y) { return y['Mã ĐK'] === r.ma; })[0];
    if (!x) throw new Error('Không thấy đăng ký');
    capNhat_(vh.getSheetByName('CongNhanDangKy'), function (y) { return y['Mã ĐK'] === r.ma; }, { 'Trạng thái duyệt': r.dongY ? 'Đã duyệt' : 'Từ chối', 'Người duyệt': u.ten, 'Giờ duyệt': bayGio_() });
    if (!r.dongY) return { ok: true };
    const sh = nen.getSheetByName('CongNhan'); const loai = x['Loại (Mới/Thay đổi/Nghỉ việc)'];
    const doi = {}; ['Đội', 'Chức danh', 'Khu vực phụ trách', 'Số điện thoại'].forEach(function (k) { if (x[k]) doi[k] = x[k]; });
    let ma = x['Mã CN'];
    if (loai === 'Mới') {
      const ds = bang_(nen, 'CongNhan'); ma = 'CN' + ('0' + (Math.max.apply(null, ds.map(function (y) { return +String(y['Mã']).slice(2) || 0; })) + 1)).slice(-2);
      const o = { 'Mã': ma, 'Họ và tên': x['Họ và tên'], 'Trạng thái': 'Đang làm', 'Ghi chú': 'Vào từ ' + x['Từ ngày'] }; Object.keys(doi).forEach(function (k) { o[k] = doi[k]; });
      ghi_(nen, 'CongNhan', o);
    } else {
      if (loai === 'Nghỉ việc') { doi['Trạng thái'] = 'Đã nghỉ'; doi['Ghi chú'] = 'Nghỉ từ ' + x['Từ ngày']; }
      capNhat_(sh, function (y) { return y['Mã'] === ma; }, doi);
    }
    return { ok: true, ma: ma };
  });
}

/* ================= Báo tin sau khi ghi ================= */
function sauGhi_(u, bang, d) {
  try {
    if (bang === 'CongNhanDangKy') guiNhom_('Trưởng bộ phận', '👷 ' + u.ten + ' đăng ký ' + String(d['Loại (Mới/Thay đổi/Nghỉ việc)']).toLowerCase() + ': ' + d['Họ và tên'] + '\nDuyệt: ' + link_('congnhan'));
    if (bang === 'DeXuatThuoc') guiNhom_('Trưởng bộ phận', '🧴 Đề xuất thuốc mới: ' + d['Tên thuốc/phân'] + ' (' + u.ten + ')\n' + link_('thuoc'));
    if (bang === 'DichHai' && /dừa|cọ|chà là/i.test(d['Tên cây'])) guiNhom_('Trưởng bộ phận', '🐛 Dịch hại trên ' + d['Tên cây'] + ': ' + d['Loại dịch hại'] + ' · ' + d['Mức độ'] + '\n📍 ' + tenVT_(d['Mã vị trí'], d['Vị trí chi tiết']) + '\n' + link_('dichhai'));
    if (bang === 'VuonRau' && d['Ngoài ngưỡng'] === 'Có') guiNhom_('Trưởng bộ phận', '⚠️ Vườn rau ' + d['Mã vườn'] + ': ' + d['Trường'] + ' = ' + d['Giá trị'] + ' (ngoài ngưỡng)');
  } catch (e) { console.error(e); }
}
function sauSua_(u, bang, khoa, doi) {
  try {
    if (bang === 'DichHai' && /Báo xong/.test(doi['Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)'] || '')) guiNhom_('Trưởng bộ phận', '🐛 Hồ sơ dịch hại ' + khoa['Mã DH'] + ' báo xong, chờ duyệt\n' + link_('dichhai'));
  } catch (e) { console.error(e); }
}

/* ================= Ảnh ================= */
function luuAnh_(dataUrl, loai) {
  const m = String(dataUrl).match(/^data:(image\/\w+);base64,(.+)$/);
  if (!m) throw new Error('Ảnh không hợp lệ');
  const goc = DriveApp.getFolderById(prop_('FOLDER_ANH'));
  const thang = Utilities.formatDate(new Date(), TZ, 'yyyy-MM');
  const it = goc.getFoldersByName(thang); const f = it.hasNext() ? it.next() : goc.createFolder(thang);
  const file = f.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], loai + '_' + Utilities.formatDate(new Date(), TZ, 'yyyyMMdd_HHmmss') + '_' + Math.floor(Math.random() * 1000) + '.jpg'));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getId();
}

/* ================= Thời tiết (OpenWeather, dự phòng MET Norway) ================= */
function thoiTiet_() {
  const c = CacheService.getScriptCache(); const cu = c.get('THOI_TIET'); if (cu) return JSON.parse(cu);
  const lat = prop_('LAT', true) || '10.2642', lon = prop_('LON', true) || '103.9257';
  let t = null; const key = prop_('OPENWEATHER_KEY', true);
  try {
    if (key) {
      const j = JSON.parse(UrlFetchApp.fetch('https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&units=metric&lang=vi&appid=' + key).getContentText());
      const l = j.list.slice(0, 8), l6 = j.list.slice(0, 2);
      const mm = function (a) { return a.reduce(function (s, x) { return s + ((x.rain && x.rain['3h']) || 0); }, 0); };
      t = { nguon: 'OpenWeather', luc: bayGio_(), nhietDo: Math.max.apply(null, l.map(function (x) { return x.main.temp_max; })), moTa: l[0].weather[0].description,
        mua24: Math.max.apply(null, l.map(function (x) { return x.pop || 0; })), mua6: Math.max.apply(null, l6.map(function (x) { return x.pop || 0; })), mm24: mm(l),
        gioGiat: Math.max.apply(null, l.map(function (x) { return (x.wind && (x.wind.gust || x.wind.speed)) || 0; })), bieuTuong: /mưa/i.test(l[0].weather[0].description) ? '🌧️' : '⛅' };
    }
  } catch (e) { console.error(e); }
  if (!t) {
    const j = JSON.parse(UrlFetchApp.fetch('https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=' + lat + '&lon=' + lon, { headers: { 'User-Agent': 'GreenLog/1.0 (+https://leevul.github.io/GreenLog/)' } }).getContentText());
    const l = j.properties.timeseries.slice(0, 24);
    const mm = l.reduce(function (s, x) { return s + (((x.data.next_1_hours || {}).details || {}).precipitation_amount || 0); }, 0);
    t = { nguon: 'MET Norway (không có % mưa)', luc: bayGio_(), nhietDo: Math.max.apply(null, l.map(function (x) { return x.data.instant.details.air_temperature; })), moTa: '', mua24: mm >= 1 ? 0.7 : 0, mua6: 0, mm24: mm,
      gioGiat: Math.max.apply(null, l.map(function (x) { return x.data.instant.details.wind_speed || 0; })), bieuTuong: mm >= 1 ? '🌧️' : '⛅' };
  }
  t.goiY = [];
  if (t.mua24 >= 0.7 && t.mm24 >= 10) t.goiY.push('Mưa nhiều (' + Math.round(t.mua24 * 100) + '%, ' + Math.round(t.mm24) + ' mm): có thể không cần tưới. Người phụ trách quyết định.');
  if (t.mua6 >= 0.4) t.goiY.push('Khả năng mưa trong 6 giờ tới ' + Math.round(t.mua6 * 100) + '%: cân nhắc hoãn phun thuốc.');
  if (t.mua24 >= 0.7 && t.mm24 >= 20) t.goiY.push('Mưa ≥ 20 mm trong 24 giờ: cân nhắc hoãn bón phân.');
  if (t.mua24 >= 0.5) t.goiY.push('Có sự kiện ngoài trời thì chuẩn bị phương án mưa.');
  if (t.gioGiat >= 15) t.goiY.push('Gió giật ' + Math.round(t.gioGiat) + ' m/s: cân nhắc kích hoạt chế độ mùa bão.');
  if (t.nhietDo >= 34) t.goiY.push('Nắng nóng ' + Math.round(t.nhietDo) + '°C: nhắc anh em uống nước, nghỉ trưa trong bóng mát.');
  c.put('THOI_TIET', JSON.stringify(t), 1800);
  return t;
}

/* ================= AI ================= */
function aiCay_(u, r) {
  can_(u, 'ai', 2);
  const key = prop_('PLANTNET_KEY', true); if (!key) throw new Error('Chưa có mã Pl@ntNet. Anh Vũ điền PLANTNET_KEY trong caiDat().');
  const anh = (r.anh || []).slice(0, 1)[0]; const m = String(anh || '').match(/^data:(image\/\w+);base64,(.+)$/); if (!m) throw new Error('Chưa có ảnh');
  const res = UrlFetchApp.fetch('https://my-api.plantnet.org/v2/identify/all?lang=vi&api-key=' + key, { method: 'post', payload: { images: Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], 'cay.jpg') }, muteHttpExceptions: true });
  if (res.getResponseCode() >= 400) throw new Error('Pl@ntNet không nhận ra (' + res.getResponseCode() + ')');
  const j = JSON.parse(res.getContentText()); const dm = bang_(nen_(), 'DanhMucCay');
  return { ketQua: (j.results || []).slice(0, 5).map(function (x) {
    const kh = x.species.scientificNameWithoutAuthor; const t = dm.filter(function (c) { return String(c['Tên khoa học']).toLowerCase() === kh.toLowerCase(); })[0];
    return { tenKH: kh, tenViet: t ? t['Tên tiếng Việt'] : (x.species.commonNames || [])[0] || '', diem: x.score, trongDanhMuc: !!t };
  }) };
}
function aiTrieuChung_(u, r) {
  can_(u, 'ai', 2);
  const key = prop_('GEMINI_KEY', true); if (!key) throw new Error('Chưa có mã Gemini. Anh Vũ điền GEMINI_KEY trong caiDat().');
  const p = PropertiesService.getScriptProperties(); const k = 'AI_' + ngay_() + '_' + u.ten; const dung = +(p.getProperty(k) || 0); const toiDa = +(prop_('AI_TOI_DA', true) || 10);
  if (dung >= toiDa) throw new Error('Đã dùng hết ' + toiDa + ' lượt hôm nay.');
  const thuoc = bang_(nen_(), 'ThuocPhan', 3).map(function (x) { return x['Tên vật tư']; }).filter(String).join('; ');
  const parts = [{ text: 'Bạn là kỹ sư cây xanh ở resort Phú Quốc. Phân tích ảnh cây và mô tả triệu chứng: "' + (r.moTa || '') + '". Trả lời tiếng Việt, ngắn gọn: 1) Khả năng là gì (2–3 khả năng), 2) Cách kiểm tra thêm tại chỗ, 3) Hướng xử lý, ưu tiên các thuốc/phân có sẵn: ' + thuoc + '. Ghi rõ đây chỉ là gợi ý, việc phun thuốc do trưởng bộ phận duyệt.' }];
  (r.anh || []).slice(0, 3).forEach(function (a) { const m = a.match(/^data:(image\/\w+);base64,(.+)$/); if (m) parts.push({ inline_data: { mime_type: m[1], data: m[2] } }); });
  const model = prop_('GEMINI_MODEL', true) || 'gemini-2.5-flash';
  const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key, { method: 'post', contentType: 'application/json', payload: JSON.stringify({ contents: [{ parts: parts }] }), muteHttpExceptions: true });
  if (res.getResponseCode() >= 400) throw new Error('Gemini lỗi ' + res.getResponseCode());
  const j = JSON.parse(res.getContentText());
  p.setProperty(k, String(dung + 1));
  return { traLoi: ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(function (x) { return x.text || ''; }).join('\n'), conLai: toiDa - dung - 1 };
}

/* ================= Tiện ích ================= */
function nen_() { return SpreadsheetApp.openById(prop_('DULIEU_NEN')); }
let VH_CACHE = null;
function vh_() { if (!VH_CACHE) VH_CACHE = SpreadsheetApp.openById(prop_('VANHANH_ID')); return VH_CACHE; }
function prop_(k, khongBatBuoc) {
  const v = PropertiesService.getScriptProperties().getProperty(k) || (typeof CFG !== 'undefined' && CFG[k]);
  if (!v && !khongBatBuoc) throw new Error('Thiếu cấu hình ' + k + ' (chạy khoiTao và caiDat trước)');
  return v || '';
}
function ngay_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
function bayGio_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'); }
function ky_(d) {
  const p = d.split('-').map(Number); let y = p[0], m = p[1];
  if (p[2] >= 20) { m++; if (m > 12) { m = 1; y++; } }
  const py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1; const z = function (n) { return ('0' + n).slice(-2); };
  return { ten: 'T' + z(m) + '.' + y, tu: py + '-' + z(pm) + '-20', den: y + '-' + z(m) + '-19' };
}
function tenVT_(ma, khac) { if (!ma) return khac || ''; const v = bang_(nen_(), 'ViTri').filter(function (x) { return x['Mã'] === ma; })[0]; return v ? v['Vị trí'] + ' · ' + v['Khu vực'] : ma; }
function link_(duong) { return (prop_('APP_URL', true) || 'https://leevul.github.io/GreenLog/') + '#/' + duong; }

/* bảng → mảng đối tượng; dongTD = dòng tiêu đề (mặc định 1). Nhớ tạm trong một lần chạy. */
const BANG_NHO = {};
function bang_(ss, ten, dongTD) {
  const k = ss.getId() + '|' + ten; if (BANG_NHO[k]) return BANG_NHO[k].slice();
  const sh = ss.getSheetByName(ten); dongTD = dongTD || 1;
  if (!sh || sh.getLastRow() <= dongTD) return [];
  const v = sh.getDataRange().getDisplayValues(); const h = v[dongTD - 1];
  const out = v.slice(dongTD).filter(function (r) { return r.join('') !== ''; }).map(function (r) { const o = {}; h.forEach(function (kk, i) { if (kk) o[kk] = r[i]; }); return o; });
  BANG_NHO[k] = out; return out.slice();
}
function quenBang_(ss, ten) { delete BANG_NHO[ss.getId() + '|' + ten]; }
function ghi_(ss, ten, obj) { ghiLo_(ss, ten, [obj]); }
function ghiLo_(ss, ten, ds) {
  if (!ds.length) return;
  const sh = ss.getSheetByName(ten); if (!sh) throw new Error('Thiếu trang ' + ten + ' (chạy lại khoiTao)');
  const h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const rows = ds.map(function (o) { return h.map(function (k) { const v = o[k]; return v === undefined || v === null ? '' : String(Array.isArray(v) ? v.join(' | ') : v); }); });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, h.length).setNumberFormat('@').setValues(rows);
  quenBang_(ss, ten);
}
function capNhat_(sh, dk, doi) {
  const v = sh.getDataRange().getDisplayValues(); const h = v[0]; let n = 0;
  for (let i = 1; i < v.length; i++) {
    const o = {}; h.forEach(function (k, j) { o[k] = v[i][j]; });
    if (!dk(o)) continue;
    Object.keys(doi).forEach(function (k) { const j = h.indexOf(k); if (j >= 0) sh.getRange(i + 1, j + 1).setNumberFormat('@').setValue(String(doi[k])); });
    n++;
  }
  quenBang_(sh.getParent(), sh.getName());
  return n;
}
function xoaDong_(sh, dk, toiDa) {
  const v = sh.getDataRange().getDisplayValues(); const h = v[0]; let n = 0;
  for (let i = v.length - 1; i >= 1; i--) {
    const o = {}; h.forEach(function (k, j) { o[k] = v[i][j]; });
    if (dk(o)) { sh.deleteRow(i + 1); n++; if (toiDa && n >= toiDa) break; }
  }
  quenBang_(sh.getParent(), sh.getName());
  return n;
}
function voiKhoa_(fn) { const lock = LockService.getScriptLock(); lock.waitLock(25000); try { return fn(); } finally { lock.releaseLock(); } }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ================= Cài đặt một lần ================= */
/** Điền các mã bên dưới rồi chạy caiDat() một lần (chạy lại khi đổi mã). Mã để trống thì bỏ qua. */
function caiDat() {
  const MA = {
    CLIENT_ID: '',            // ....apps.googleusercontent.com (bắt buộc để đăng nhập Gmail)
    APP_URL: 'https://leevul.github.io/GreenLog/',
    ZALO_BOT_TOKEN: '',       // token Bot GreenLogMVP
    TELEGRAM_BOT_TOKEN: '',   // để trống nếu chưa dùng Telegram
    OPENWEATHER_KEY: '',      // thời tiết, có % mưa (để trống thì dùng MET Norway)
    PLANTNET_KEY: '',         // AI nhận diện cây
    GEMINI_KEY: '',           // AI phân tích triệu chứng
  };
  const p = PropertiesService.getScriptProperties();
  Object.keys(MA).forEach(function (k) { if (MA[k]) p.setProperty(k, MA[k]); });
  p.setProperty('DULIEU_NEN', CFG.DULIEU_NEN); p.setProperty('FOLDER_ANH', CFG.FOLDER_ANH);
  Logger.log('Đã lưu. VANHANH_ID = ' + p.getProperty('VANHANH_ID') + ' · CLIENT_ID ' + (p.getProperty('CLIENT_ID') ? 'có' : 'CHƯA CÓ'));
}
