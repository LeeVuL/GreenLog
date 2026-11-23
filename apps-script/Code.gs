/**
 * GreenLog – phần chạy ngầm (Google Apps Script)
 * Triển khai: Deploy → New deployment → Web app
 *   Execute as: Me (levule15101994@gmail.com) · Who has access: Anyone
 * App trên GitHub gọi vào đường link /exec của bản triển khai này.
 * Ai dùng được app là do danh sách NguoiDung quyết định (đăng nhập bằng Gmail), không phải do link.
 */

const TZ = 'Asia/Ho_Chi_Minh';
const PHIEN_NGAY = 60;               // đăng nhập giữ 60 ngày
const CAP = { 'Không thấy': 0, 'Xem': 1, 'Ghi': 2, 'Duyệt': 3 };

/* Phân hệ: khóa dùng trong app ↔ dòng trong bảng PhanQuyenMacDinh */
const PHAN_HE = [
  ['homnay', 'Hôm nay / Lịch'], ['diemdanh', 'Điểm danh'], ['congnhan', 'Công nhân'], ['dinhky', 'Định kỳ / Tưới'],
  ['noibo', 'Việc nội bộ'], ['vuonuom', 'Vườn ươm cây bụi'], ['donghonuoc', 'Đồng hồ nước'],
  ['phieu', 'Phiếu / Dịch hại / Sổ trồng cây'], ['phunbon', 'Phun, bón'], ['duan', 'Dự án'], ['sukien', 'Sự kiện'],
  ['kehoach', 'KH tuần / KH tháng'], ['tuantra', 'Tuần tra'], ['ai', 'AI nhận diện'], ['baocao', 'Báo cáo'], ['danhmuc', 'Danh mục / Phân quyền'],
];
const COT_NHOM = { 'Tổ trưởng': 1, 'Quản lý nhà thầu': 2, 'Nhân viên nội bộ': 3, 'Trưởng bộ phận': 4 };

/* ================= Cổng vào ================= */
function doGet() {
  return json_({ ok: true, ten: 'GreenLog API', luc: bayGio_() });
}

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
  'toi': function (u) { return u; },
  'khoiDong': khoiDong_,
  'homNay': homNay_,
  'diemDanh.lay': ddLay_,
  'diemDanh.gui': ddGui_,
  'diemDanh.tuDiem': ddTuDiem_,
  'diemDanh.duyet': ddDuyet_,
  'dinhKy.lay': dkLay_,
  'dinhKy.tick': dkTick_,
  'dinhKy.boTick': dkBoTick_,
  'phieu.ds': phieuDs_,
  'phieu.tao': phieuTao_,
  'phieu.nhan': function (u, r) { return phieuChuyen_(u, r, 'nhan'); },
  'phieu.xong': function (u, r) { return phieuChuyen_(u, r, 'xong'); },
  'phieu.duyet': function (u, r) { return phieuChuyen_(u, r, 'duyet'); },
  'phieu.traLai': function (u, r) { return phieuChuyen_(u, r, 'traLai'); },
};

/* ================= Đăng nhập ================= */
function dangNhap_(idToken) {
  const clientId = prop_('CLIENT_ID');
  const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('Không xác minh được tài khoản Google');
  const t = JSON.parse(res.getContentText());
  if (t.aud !== clientId) throw new Error('Mã đăng nhập không đúng ứng dụng');
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
  const cache = CacheService.getScriptCache();
  const k = 'U_' + email;
  const c = cache.get(k);
  if (c) return JSON.parse(c);
  const ds = bang_(nen_(), 'NguoiDung');
  const r = ds.filter(function (x) { return String(x['Gmail']).trim().toLowerCase() === email; })[0];
  if (!r) return null;
  const vaiTro = String(r['Vai trò']);
  const u = {
    ten: r['Họ tên'], gmail: email, nhom: r['Nhóm quyền'] || r['Nhóm'], vaiTro: vaiTro,
    doi: /cơ động/i.test(vaiTro) ? 'Đội cơ động' : (/khu vực/i.test(vaiTro) ? 'Đội khu vực' : ''),
  };
  u.quyen = tinhQuyen_(u, ds);
  cache.put(k, JSON.stringify(u), 300);
  return u;
}

/* Quyền = bảng mặc định theo nhóm → chỉnh riêng (PhanQuyen) → ủy quyền còn hạn (UyQuyen) */
function tinhQuyen_(u, dsNguoi) {
  const tenRieng = dsNguoi.map(function (x) { return String(x['Họ tên']).split(' ').pop(); });
  const mk = bang_(nen_(), 'PhanQuyenMacDinh');
  const cot = COT_NHOM[u.nhom] || 0;
  const q = {};
  PHAN_HE.forEach(function (p) {
    const dong = mk.filter(function (r) { return String(r['Phân hệ']).indexOf(p[1]) === 0; })[0];
    q[p[0]] = cot && dong ? docCap_(String(dong[Object.keys(dong)[cot]]), u.ten, tenRieng) : 0;
  });
  const vh = vh_();
  bang_(vh, 'PhanQuyen').forEach(function (r) {
    const ap = String(r['Áp cho (nhóm hoặc Gmail)']).trim();
    if (ap.toLowerCase() !== u.gmail && ap !== u.nhom) return;
    const ph = PHAN_HE.filter(function (p) { return p[1] === r['Phân hệ'] || p[0] === r['Phân hệ']; })[0];
    if (ph) q[ph[0]] = CAP[String(r['Cấp (Không thấy/Xem/Ghi/Duyệt)'])] || 0;
  });
  const homNay = ngay_();
  bang_(vh, 'UyQuyen').forEach(function (r) {
    if (String(r['Người nhận']).toLowerCase() !== u.gmail) return;
    if (String(r['Từ ngày']) > homNay || String(r['Đến ngày']) < homNay) return;
    const ph = PHAN_HE.filter(function (p) { return p[1] === r['Phân hệ'] || p[0] === r['Phân hệ']; })[0];
    if (ph) q[ph[0]] = Math.max(q[ph[0]], CAP[String(r['Cấp'])] || 0);
  });
  return q;
}

/* "Ghi (Trường), Xem (Thìn)" → theo tên; "Ghi (đội mình)" → Ghi */
function docCap_(o, ten, tenRieng) {
  const phan = o.split(',').map(function (s) { return s.trim(); });
  let chung = null;
  for (let i = 0; i < phan.length; i++) {
    const cap = CAP[phan[i].replace(/\s*\(.*$/, '').trim()];
    const m = phan[i].match(/\(([^)]+)\)/);
    if (m && tenRieng.indexOf(m[1].trim()) >= 0) { if (String(ten).split(' ').pop() === m[1].trim()) return cap; }
    else if (chung === null) chung = cap;
  }
  return chung === null ? 0 : chung;
}

function can_(u, ph, cap) {
  if ((u.quyen[ph] || 0) < cap) throw new Error('Anh/chị chưa có quyền này');
}

/* ================= Khởi động: danh mục cho app ================= */
function khoiDong_(u) {
  const nen = nen_();
  const out = {
    user: u, ky: ky_(ngay_()),
    vitri: bang_(nen, 'ViTri').map(function (r) { return { ma: r['Mã'], cum: r['Cụm'], kv: r['Khu vực'], ten: r['Vị trí'], ap: r['Áp dụng 8 việc chính'] }; }),
    dauviec: bang_(nen, 'DauViec').filter(function (r) { return /^DV0[1-8]$/.test(r['Mã']); }).map(function (r) { return { ma: r['Mã'], ten: r['Tên việc'] }; }),
    loi: bang_(nen, 'LoiCanhQuan').map(function (r) { return { nhom: r['Nhóm'], ten: r['Loại lỗi'], muc: r['Mức độ gợi ý'] }; }),
  };
  if (u.quyen.diemdanh || u.quyen.congnhan) {
    out.congnhan = bang_(nen, 'CongNhan').filter(function (r) { return r['Mã']; }).map(function (r) {
      return { ma: r['Mã'], ten: r['Họ và tên'], doi: r['Đội'], cd: r['Chức danh'], tt: r['Trạng thái'] };
    });
  }
  return out;
}

/* ================= Hôm nay ================= */
function homNay_(u) {
  const vh = vh_(); const d = ngay_(); const k = ky_(d);
  const tienDo = {};
  bang_(vh, 'TickDinhKy').forEach(function (r) {
    if (r['Kỳ'] === k.ten && String(r['Lần'] || '1') === '1') tienDo[r['Mã việc']] = (tienDo[r['Mã việc']] || 0) + 1;
  });
  const phieu = bang_(vh, 'Phieu').filter(function (r) { return r['Trạng thái'] !== 'Đã duyệt'; });
  const dd = bang_(vh, 'DuyetCong').filter(function (r) { return r['Ngày'] === d; });
  return {
    ngay: d, ky: k, tienDo: tienDo, soViTri: bang_(nen_(), 'ViTri').filter(function (r) { return r['Áp dụng 8 việc chính'] === 'Có'; }).length,
    phieuMo: phieu.length,
    phieuKhan: phieu.filter(function (r) { return r['Mức độ'] === 'Khẩn cấp'; }).length,
    phieuChoDuyet: phieu.filter(function (r) { return r['Trạng thái'] === 'Báo xong'; }).length,
    diemDanh: dd.map(function (r) { return { buoi: r['Buổi'], doi: r['Đội'], duyet: r['Khóa'] === 'Có' }; }),
  };
}

/* ================= Điểm danh ================= */
function ddLay_(u, r) {
  can_(u, 'diemdanh', 1);
  const vh = vh_();
  const rows = bang_(vh, 'DiemDanh').filter(function (x) { return x['Ngày'] === r.ngay && x['Buổi'] === r.buoi; });
  const duyet = bang_(vh, 'DuyetCong').filter(function (x) { return x['Ngày'] === r.ngay && x['Buổi'] === r.buoi; });
  return { rows: rows.map(function (x) { return { ma: x['Mã CN'], tt: x['Trạng thái (Có mặt/Vắng/Về sớm)'], gioVe: x['Giờ về'], lyDo: x['Lý do'], doi: x['Đội'], duyet: x['Trạng thái duyệt'] }; }),
    duyet: duyet.map(function (x) { return { doi: x['Đội'], nguoiGui: x['Người gửi'], khoa: x['Khóa'] === 'Có', nguoiDuyet: x['Người duyệt'] }; }) };
}

function ddGui_(u, r) {
  if (u.nhom === 'Quản lý nhà thầu') throw new Error('Anh Pháp chỉ tự điểm danh cho mình');
  return ddGhi_(u, r);
}

function ddGhi_(u, r) {
  can_(u, 'diemdanh', 2);
  return voiKhoa_(function () {
    const vh = vh_(); const doi = r.doi || u.doi || 'Chưa phân đội';
    const sh = vh.getSheetByName('DuyetCong');
    const daKhoa = bang_(vh, 'DuyetCong').some(function (x) { return x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && x['Đội'] === doi && x['Khóa'] === 'Có'; });
    if (daKhoa) throw new Error('Buổi này anh Vũ đã duyệt và khóa. Muốn sửa thì tạo phiếu sửa công.');
    const cn = {}; bang_(nen_(), 'CongNhan').forEach(function (x) { cn[x['Mã']] = x; });
    xoaDong_(vh.getSheetByName('DiemDanh'), function (x) { return x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && r.ds.some(function (d) { return d.ma === x['Mã CN']; }); });
    const now = bayGio_();
    r.ds.forEach(function (d) {
      ghi_(vh, 'DiemDanh', { 'Ngày': r.ngay, 'Buổi': r.buoi, 'Mã CN': d.ma, 'Họ tên': (cn[d.ma] || {})['Họ và tên'] || '', 'Đội': doi,
        'Trạng thái (Có mặt/Vắng/Về sớm)': d.tt, 'Giờ về': d.gioVe || '', 'Lý do': d.lyDo || '', 'Công': d.tt === 'Có mặt' ? 0.5 : 0,
        'Người ghi': u.ten, 'Giờ ghi': now, 'Trạng thái duyệt': 'Chờ duyệt' });
    });
    xoaDong_(sh, function (x) { return x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && x['Đội'] === doi; });
    ghi_(vh, 'DuyetCong', { 'Ngày': r.ngay, 'Buổi': r.buoi, 'Đội': doi, 'Người gửi': u.ten, 'Giờ gửi': now, 'Khóa': 'Không' });
    return { ok: true };
  });
}

function ddTuDiem_(u, r) {
  can_(u, 'diemdanh', 2);
  const cn = bang_(nen_(), 'CongNhan').filter(function (x) { return x['Họ và tên'] === u.ten; })[0];
  if (!cn) throw new Error('Không tìm thấy tên ' + u.ten + ' trong danh sách công nhân');
  return ddGhi_(u, { ngay: ngay_(), buoi: r.buoi, doi: 'Quản lý nhà thầu', ds: [{ ma: cn['Mã'], tt: 'Có mặt' }] });
}

function ddDuyet_(u, r) {
  can_(u, 'diemdanh', 3);
  return voiKhoa_(function () {
    const vh = vh_(); const now = bayGio_();
    capNhat_(vh.getSheetByName('DuyetCong'), function (x) { return x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && (!r.doi || x['Đội'] === r.doi); },
      { 'Người duyệt': u.ten, 'Giờ duyệt': now, 'Khóa': 'Có' });
    capNhat_(vh.getSheetByName('DiemDanh'), function (x) { return x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && (!r.doi || x['Đội'] === r.doi); },
      { 'Trạng thái duyệt': 'Đã duyệt' });
    return { ok: true };
  });
}

/* ================= Việc định kỳ ================= */
function dkLay_(u, r) {
  can_(u, 'dinhky', 1);
  const k = r.ky || ky_(ngay_()).ten;
  return bang_(vh_(), 'TickDinhKy').filter(function (x) { return x['Kỳ'] === k; }).map(function (x) {
    return { ngay: x['Ngày'], viec: x['Mã việc'], vt: x['Mã vị trí'], lan: x['Lần'], lyDo: x['Lý do làm thêm'], nguoi: x['Người tick'] };
  });
}

function dkTick_(u, r) {
  can_(u, 'dinhky', 2);
  return voiKhoa_(function () {
    const vh = vh_(); const k = ky_(ngay_()).ten;
    const truoc = bang_(vh, 'TickDinhKy').filter(function (x) { return x['Kỳ'] === k && x['Mã việc'] === r.viec && x['Mã vị trí'] === r.vt; }).length;
    if (truoc && !r.lyDo) throw new Error('Vị trí này đã làm trong kỳ. Chọn lý do làm thêm.');
    ghi_(vh, 'TickDinhKy', { 'Ngày': ngay_(), 'Kỳ': k, 'Mã việc': r.viec, 'Mã vị trí': r.vt, 'Lần': truoc + 1,
      'Lý do làm thêm': r.lyDo || '', 'Người tick': u.ten, 'Giờ tick': bayGio_() });
    return { lan: truoc + 1 };
  });
}

function dkBoTick_(u, r) {
  can_(u, 'dinhky', 2);
  return voiKhoa_(function () {
    const vh = vh_(); const d = ngay_();
    // chỉ bỏ được dấu của chính mình, trong ngày hôm nay, lần gần nhất
    const sh = vh.getSheetByName('TickDinhKy');
    const n = xoaDong_(sh, function (x) { return x['Ngày'] === d && x['Mã việc'] === r.viec && x['Mã vị trí'] === r.vt && x['Người tick'] === u.ten; }, 1);
    if (!n) throw new Error('Chỉ bỏ được dấu do mình đánh trong hôm nay. Trường hợp khác báo anh Vũ.');
    ghi_(vh, 'NhatKyThayDoi', { 'Thời điểm': bayGio_(), 'Người': u.ten, 'Trang': 'TickDinhKy', 'Mã bản ghi': r.viec + '/' + r.vt, 'Trường': 'Bỏ đánh dấu', 'Lý do': r.lyDo || '' });
    return { ok: true };
  });
}

/* ================= Phiếu ================= */
const HAN_GIO = { 'Khẩn cấp': 2, 'Cao': 24, 'Trung bình': 72, 'Thấp': 168 };

function phieuDs_(u) {
  can_(u, 'phieu', 1);
  return bang_(vh_(), 'Phieu').slice(-300).reverse().map(phieuRa_);
}

function phieuRa_(x) {
  return { ma: x['Mã phiếu'], loai: x['Loại lỗi'], nhom: x['Nhóm lỗi'], muc: x['Mức độ'], vt: x['Mã vị trí'], vtKhac: x['Vị trí khác'], moTa: x['Mô tả'],
    giao: x['Giao cho'], tao: x['Người tạo'], gioTao: x['Giờ tạo'], han: x['Hạn'], nhan: x['Người nhận'], tt: x['Trạng thái'],
    anhTruoc: x['Ảnh trước'], anhSau: x['Ảnh sau'], traLai: x['Số lần trả lại'], nguon: x['Nguồn'] };
}

function phieuTao_(u, r) {
  can_(u, 'phieu', 2);
  const anh = r.anh ? luuAnh_(r.anh, 'phieu') : '';
  return voiKhoa_(function () {
    const vh = vh_(); const n = Math.max(0, vh.getSheetByName('Phieu').getLastRow() - 1) + 1;
    const ma = 'P' + Utilities.formatDate(new Date(), TZ, 'yyMMdd') + '-' + ('000' + n).slice(-3);
    const han = new Date(Date.now() + (HAN_GIO[r.muc] || 72) * 36e5);
    ghi_(vh, 'Phieu', { 'Mã phiếu': ma, 'Loại': 'Lỗi', 'Nguồn': r.nguon || 'Nhân viên tự phát hiện', 'Nhóm lỗi': r.nhom || '', 'Loại lỗi': r.loai,
      'Mức độ': r.muc, 'Mã vị trí': r.vt || '', 'Vị trí khác': r.vtKhac || '', 'Mô tả': r.moTa || '', 'Giao cho': r.giao || '',
      'Người tạo': u.ten, 'Giờ tạo': bayGio_(), 'Hạn': Utilities.formatDate(han, TZ, 'yyyy-MM-dd HH:mm'), 'Ảnh trước': anh, 'Trạng thái': 'Mới', 'Số lần trả lại': 0 });
    ghi_(vh, 'PhieuLichSu', { 'Mã phiếu': ma, 'Thời điểm': bayGio_(), 'Hành động': 'Tạo', 'Người': u.ten });
    return { ma: ma };
  });
}

function phieuChuyen_(u, r, hd) {
  can_(u, 'phieu', hd === 'duyet' || hd === 'traLai' ? 3 : 2);
  const anh = r.anh ? luuAnh_(r.anh, 'phieu') : '';
  return voiKhoa_(function () {
    const vh = vh_(); const sh = vh.getSheetByName('Phieu'); const now = bayGio_();
    const p = bang_(vh, 'Phieu').filter(function (x) { return x['Mã phiếu'] === r.ma; })[0];
    if (!p) throw new Error('Không tìm thấy phiếu ' + r.ma);
    let doi;
    if (hd === 'nhan') doi = { 'Người nhận': u.ten, 'Giờ nhận': now, 'Trạng thái': 'Đang xử lý' };
    if (hd === 'xong') { if (!anh && !p['Ảnh sau']) throw new Error('Cần ảnh sau khi xử lý'); doi = { 'Ảnh sau': anh || p['Ảnh sau'], 'Giờ xong': now, 'Trạng thái': 'Báo xong' }; }
    if (hd === 'duyet') doi = { 'Giờ duyệt': now, 'Trạng thái': 'Đã duyệt' };
    if (hd === 'traLai') doi = { 'Trạng thái': 'Bị trả lại', 'Số lần trả lại': Number(p['Số lần trả lại'] || 0) + 1 };
    capNhat_(sh, function (x) { return x['Mã phiếu'] === r.ma; }, doi);
    ghi_(vh, 'PhieuLichSu', { 'Mã phiếu': r.ma, 'Thời điểm': now, 'Hành động': hd, 'Người': u.ten, 'Ghi chú': r.ghiChu || '' });
    return { ok: true };
  });
}

/* ================= Ảnh ================= */
function luuAnh_(dataUrl, loai) {
  const m = String(dataUrl).match(/^data:(image\/\w+);base64,(.+)$/);
  if (!m) throw new Error('Ảnh không hợp lệ');
  const goc = DriveApp.getFolderById(prop_('FOLDER_ANH'));
  const thang = Utilities.formatDate(new Date(), TZ, 'yyyy-MM');
  const it = goc.getFoldersByName(thang);
  const f = it.hasNext() ? it.next() : goc.createFolder(thang);
  const file = f.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], loai + '_' + Utilities.formatDate(new Date(), TZ, 'yyyyMMdd_HHmmss') + '.jpg'));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getId();
}

/* ================= Tiện ích dữ liệu ================= */
function nen_() { return SpreadsheetApp.openById(prop_('DULIEU_NEN')); }
function vh_() { return SpreadsheetApp.openById(prop_('VANHANH_ID')); }
function prop_(k) {
  const v = PropertiesService.getScriptProperties().getProperty(k) || (typeof CFG !== 'undefined' && CFG[k]);
  if (!v) throw new Error('Thiếu cấu hình ' + k + ' (chạy khoiTao và caiDat trước)');
  return v;
}
function ngay_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
function bayGio_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'); }

/* Kỳ tháng 20 → 19, đặt tên theo tháng kết thúc: 20/11–19/12 = T12.2026 */
function ky_(d) {
  const p = d.split('-').map(Number); let y = p[0], m = p[1];
  if (p[2] >= 20) { m++; if (m > 12) { m = 1; y++; } }
  const py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1;
  const z = function (n) { return ('0' + n).slice(-2); };
  return { ten: 'T' + z(m) + '.' + y, tu: py + '-' + z(pm) + '-20', den: y + '-' + z(m) + '-19' };
}

function bang_(ss, ten) {
  const sh = ss.getSheetByName(ten);
  if (!sh || sh.getLastRow() < 2) return [];
  const v = sh.getDataRange().getDisplayValues();
  const h = v[0];
  return v.slice(1).filter(function (r) { return r.join('') !== ''; }).map(function (r) {
    const o = {}; h.forEach(function (k, i) { o[k] = r[i]; }); return o;
  });
}

function ghi_(ss, ten, obj) {
  const sh = ss.getSheetByName(ten);
  const h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const row = h.map(function (k) { return obj[k] === undefined ? '' : obj[k]; });
  const r = sh.getLastRow() + 1;
  sh.getRange(r, 1, 1, row.length).setNumberFormat('@').setValues([row.map(String)]);
}

function capNhat_(sh, dk, doi) {
  const v = sh.getDataRange().getDisplayValues(); const h = v[0]; let n = 0;
  for (let i = 1; i < v.length; i++) {
    const o = {}; h.forEach(function (k, j) { o[k] = v[i][j]; });
    if (!dk(o)) continue;
    Object.keys(doi).forEach(function (k) { const j = h.indexOf(k); if (j >= 0) sh.getRange(i + 1, j + 1).setNumberFormat('@').setValue(String(doi[k])); });
    n++;
  }
  return n;
}

function xoaDong_(sh, dk, toiDa) {
  const v = sh.getDataRange().getDisplayValues(); const h = v[0]; let n = 0;
  for (let i = v.length - 1; i >= 1; i--) {
    const o = {}; h.forEach(function (k, j) { o[k] = v[i][j]; });
    if (dk(o)) { sh.deleteRow(i + 1); n++; if (toiDa && n >= toiDa) break; }
  }
  return n;
}

function voiKhoa_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ================= Cài đặt một lần ================= */
/** Dán Client ID (Google Cloud) vào dòng dưới rồi chạy caiDat() một lần. */
function caiDat() {
  const CLIENT_ID = 'DAN_CLIENT_ID_VAO_DAY.apps.googleusercontent.com';
  PropertiesService.getScriptProperties().setProperties({
    CLIENT_ID: CLIENT_ID, DULIEU_NEN: CFG.DULIEU_NEN, FOLDER_ANH: CFG.FOLDER_ANH,
  });
  Logger.log('Đã lưu cấu hình. VANHANH_ID: ' + PropertiesService.getScriptProperties().getProperty('VANHANH_ID'));
}
