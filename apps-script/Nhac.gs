/**
 * GreenLog – nhắc việc và báo tin qua Zalo Bot (và Telegram nếu bật).
 * Cài một lần: chạy caiTrigger(). Mỗi người nhắn Gmail của mình cho Bot GreenLog, rồi anh Vũ chạy layChatId().
 * Giờ yên lặng 21h–6h: chỉ gửi phiếu Khẩn cấp.
 */

/* ---------- gửi tin ---------- */
function guiTin_(chat, text, khan) {
  const gio = +Utilities.formatDate(new Date(), TZ, 'H');
  if (!khan && (gio >= 21 || gio < 6)) return;
  const z = prop_('ZALO_BOT_TOKEN', true); const t = prop_('TELEGRAM_BOT_TOKEN', true);
  if (z && chat.zalo) fetchIm_('https://bot-api.zaloplatforms.com/bot' + z + '/sendMessage', { chat_id: chat.zalo, text: text });
  if (t && chat.tele) fetchIm_('https://api.telegram.org/bot' + t + '/sendMessage', { chat_id: chat.tele, text: text, disable_web_page_preview: true });
  try { ghi_(vh_(), 'ThongBaoLog', { 'Thời điểm': bayGio_(), 'Kênh': [chat.zalo ? 'Zalo' : '', chat.tele ? 'Telegram' : ''].filter(String).join('+') || 'chưa có chat_id', 'Người nhận': chat.ten, 'Loại tin': khan ? 'Khẩn' : '', 'Nội dung': text.slice(0, 200), 'Kết quả': 'Đã gửi' }); } catch (e) {}
}
function fetchIm_(url, body) {
  try { UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true }); } catch (e) { console.error(e); }
}
function danhBa_() {
  return bang_(nen_(), 'NguoiDung').map(function (r) {
    const v = String(r['Vai trò']);
    return { ten: r['Họ tên'], nhom: r['Nhóm quyền'] || r['Nhóm'], doi: /cơ động/i.test(v) ? 'Đội cơ động' : /khu vực/i.test(v) ? 'Đội khu vực' : '', zalo: r['Zalo chat_id'], tele: r['Telegram chat_id'] };
  });
}
function guiNhom_(nhom, text, khan) { danhBa_().filter(function (x) { return x.nhom === nhom; }).forEach(function (x) { guiTin_(x, text, khan); }); }
function guiTen_(ten, text, khan) { danhBa_().filter(function (x) { return x.ten === ten; }).forEach(function (x) { guiTin_(x, text, khan); }); }
/* giao cho: đội → tổ trưởng đội đó; "Nhân viên nội bộ" → cả nhóm; tên người → người đó; trống → hai tổ trưởng */
function guiGiao_(giao, text, khan) {
  const db = danhBa_();
  const nhan = !giao ? db.filter(function (x) { return x.nhom === 'Tổ trưởng'; })
    : db.filter(function (x) { return x.doi === giao || x.ten === giao || (giao === 'Nhân viên nội bộ' && x.nhom === 'Nhân viên nội bộ'); });
  nhan.forEach(function (x) { guiTin_(x, text, khan); });
}

/* ---------- lấy chat_id: mỗi người nhắn Gmail của mình cho bot ---------- */
function layChatId() {
  const nen = nen_(); const sh = nen.getSheetByName('NguoiDung'); const h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  ['Zalo chat_id', 'Telegram chat_id'].forEach(function (c) { if (h.indexOf(c) < 0) { sh.getRange(1, sh.getLastColumn() + 1).setValue(c); h.push(c); } });
  const ds = bang_(nen, 'NguoiDung'); const ghiNhan = [];
  const xuLy = function (kenh, cot, url) {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true }); if (res.getResponseCode() >= 400) return;
    const j = JSON.parse(res.getContentText()); const ds_ = Array.isArray(j.result) ? j.result : (j.result ? [j.result] : []);
    ds_.forEach(function (u) {
      const m = u.message || {}; const txt = String(m.text || '').trim().toLowerCase(); const id = (m.chat || {}).id || (m.from || {}).id;
      const ng = ds.filter(function (x) { return String(x['Gmail']).trim().toLowerCase() === txt; })[0];
      if (ng && id) { capNhat_(sh, function (x) { return x['Họ tên'] === ng['Họ tên']; }, (function () { const o = {}; o[cot] = id; return o; })()); ghiNhan.push(kenh + ': ' + ng['Họ tên']); }
      else Logger.log(kenh + ' chưa khớp: "' + txt + '" từ chat ' + id);
    });
  };
  const z = prop_('ZALO_BOT_TOKEN', true); const t = prop_('TELEGRAM_BOT_TOKEN', true);
  if (z) xuLy('Zalo', 'Zalo chat_id', 'https://bot-api.zaloplatforms.com/bot' + z + '/getUpdates');
  if (t) xuLy('Telegram', 'Telegram chat_id', 'https://api.telegram.org/bot' + t + '/getUpdates');
  Logger.log('Đã ghi chat_id: ' + (ghiNhan.join(', ') || 'chưa ai'));
}
function thuGuiTin() { guiNhom_('Trưởng bộ phận', '✅ GreenLog gửi thử lúc ' + bayGio_(), true); }

/* ---------- lịch chạy mỗi phút ---------- */
function caiTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('moiPhut').timeBased().everyMinutes(1).create();
  Logger.log('Đã cài lịch chạy mỗi phút.');
}
function motLan_(khoa) { // trả true nếu hôm nay chưa chạy việc này
  const p = PropertiesService.getScriptProperties(); const k = 'CHAY_' + khoa + '_' + ngay_();
  if (p.getProperty(k)) return false; p.setProperty(k, '1'); return true;
}
function moiPhut() {
  const now = new Date(); const H = +Utilities.formatDate(now, TZ, 'H'); const M = +Utilities.formatDate(now, TZ, 'm');
  const phut = H * 60 + M; const thu = +Utilities.formatDate(now, TZ, 'u'); const ngay = +Utilities.formatDate(now, TZ, 'd');
  try { nhacKhan_(); } catch (e) { console.error(e); }
  const luc = function (h, m) { return phut >= h * 60 + m && phut < h * 60 + m + 10; };
  try {
    if (luc(6, 0) && motLan_('lapLai')) taoViecLapLai_();
    if (luc(7, 0) && motLan_('ddSang')) nhacDiemDanh_('Sáng');
    if (luc(14, 0) && motLan_('ddChieu')) nhacDiemDanh_('Chiều');
    if (luc(7, 30) && motLan_('ddGiupSang')) nhacDiemDanhGiup_('Sáng');
    if (luc(14, 30) && motLan_('ddGiupChieu')) nhacDiemDanhGiup_('Chiều');
    if (luc(7, 15) && motLan_('dangLam')) nhacDangTrienKhai_();
    if (luc(23, 30) && motLan_('saoLuu')) saoLuuDem_();
    if (luc(1, 0) && Utilities.formatDate(now, TZ, 'MM-dd') === '01-02' && motLan_('tachNam')) tachNam_();
    if (luc(7, 45) && thu === 1 && motLan_('tomTatTuan')) tomTatTuan_();
    if (luc(8, 0) && motLan_('phapSang')) nhacPhap_('Sáng');
    if (luc(14, 30) && motLan_('phapChieu')) nhacPhap_('Chiều');
    if (luc(8, 0) && motLan_('baoCao8h')) baoCaoSang_();
    if (luc(16, 0) && motLan_('tongHop16h')) tongHopPhieu_(thu === 5);
    if (luc(17, 0) && motLan_('cuoiNgay')) guiNhom_('Tổ trưởng', '🕔 Cập nhật kết quả cuối ngày trước 17h30: tưới, vệ sinh, nhổ cỏ, việc định kỳ.\n' + link_('viec'));
    if (luc(8, 30) && ngay === 18 && motLan_('dongKy')) guiNhom_('Trưởng bộ phận', '📅 Mai (19) chốt kỳ. Xem báo cáo, bảng công, bảng điểm nhà thầu.\n' + link_('baocao'));
    if (luc(7, 30) && motLan_('suKien')) nhacSuKien_();
    if (luc(9, 0) && motLan_('dichHai')) nhacDichHai_();
    moiPhut04_(luc, thu);
  } catch (e) { console.error(e); }
}

/* phiếu Khẩn cấp chưa ai nhận: sau 15 phút cứ 2 phút gửi lại; tới 30 phút báo anh Vũ */
function nhacKhan_() {
  const ds = bang_(vh_(), 'Phieu').filter(function (p) { return p['Mức độ'] === 'Khẩn cấp' && p['Trạng thái'] === 'Mới'; });
  if (!ds.length) return;
  const c = CacheService.getScriptCache();
  ds.forEach(function (p) {
    const tao = new Date(String(p['Giờ tạo']).replace(' ', 'T') + '+07:00'); const phut = (Date.now() - tao) / 6e4;
    const text = '🚨 CHƯA AI NHẬN (' + Math.round(phut) + ' phút): ' + p['Loại lỗi'] + '\n📍 ' + tenVT_(p['Mã vị trí'], p['Vị trí khác']) + '\n' + link_('phieu');
    if (phut >= 15 && !c.get('K2_' + p['Mã phiếu'])) { guiGiao_(p['Giao cho'], text, true); c.put('K2_' + p['Mã phiếu'], '1', 110); }
    if (phut >= 30 && !c.get('K30_' + p['Mã phiếu'])) { guiNhom_('Trưởng bộ phận', text, true); c.put('K30_' + p['Mã phiếu'], '1', 21600); }
  });
}
function nhacDiemDanh_(buoi) {
  const du = bang_(vh_(), 'DuyetCong').filter(function (x) { return x['Ngày'] === ngay_() && x['Buổi'] === buoi; });
  danhBa_().filter(function (x) { return x.nhom === 'Tổ trưởng'; }).forEach(function (x) {
    if (!du.some(function (d) { return d['Đội'] === x.doi; })) guiTin_(x, '🧑‍🤝‍🧑 Nhắc điểm danh buổi ' + buoi.toLowerCase() + ' ' + x.doi + ' (kèm 1 ảnh tập thể)\n' + link_('diemdanh'));
  });
}
function nhacPhap_(buoi) {
  const co = bang_(vh_(), 'DuyetCong').some(function (x) { return x['Ngày'] === ngay_() && x['Buổi'] === buoi && x['Đội'] === 'Quản lý nhà thầu'; });
  if (!co) guiNhom_('Quản lý nhà thầu', '👋 Nhắc tự điểm danh buổi ' + buoi.toLowerCase() + '\n' + link_(''));
}
function baoCaoSang_() {
  const vh = vh_(); const hq = Utilities.formatDate(new Date(Date.now() - 864e5), TZ, 'yyyy-MM-dd');
  const ph = bang_(vh, 'Phieu').filter(function (p) { return p['Trạng thái'] !== 'Đã duyệt'; });
  const dd = bang_(vh, 'DiemDanh').filter(function (x) { return x['Ngày'] === hq; });
  const cong = dd.reduce(function (s, x) { return s + (+x['Công'] || 0); }, 0);
  const tuoi = bang_(vh, 'Tuoi').filter(function (x) { return x['Ngày'] === hq; });
  const rac = bang_(vh, 'RacHuuCo').filter(function (x) { return x['Ngày'] === hq; }).reduce(function (s, x) { return s + (+x['kg rác thu gom'] || 0); }, 0);
  const choDD = bang_(vh, 'DuyetCong').filter(function (x) { return x['Khóa'] !== 'Có'; }).length;
  guiNhom_('Trưởng bộ phận', '☀️ Báo cáo sáng ' + Utilities.formatDate(new Date(), TZ, 'dd/MM') + '\nHôm qua: ' + cong + ' công · tưới ' + tuoi.length + ' vị trí · rác hữu cơ ' + rac + ' kg'
    + '\nPhiếu mở: ' + ph.length + ' (' + ph.filter(function (p) { return p['Mức độ'] === 'Khẩn cấp'; }).length + ' khẩn) · chờ duyệt ' + ph.filter(function (p) { return p['Trạng thái'] === 'Báo xong'; }).length
    + '\nĐiểm danh chờ duyệt: ' + choDD + ' buổi\n' + link_(''));
}
function tongHopPhieu_(thuSau) {
  const muc = thuSau ? ['Khẩn cấp', 'Cao', 'Trung bình', 'Thấp'] : ['Khẩn cấp', 'Cao'];
  const ph = bang_(vh_(), 'Phieu').filter(function (p) { return p['Trạng thái'] !== 'Đã duyệt' && muc.indexOf(p['Mức độ']) >= 0; });
  if (!ph.length) return;
  guiNhom_('Trưởng bộ phận', '📋 Phiếu chưa xong (' + muc.join(', ') + '): ' + ph.length + '\n' + ph.slice(0, 15).map(function (p) { return '• ' + p['Mức độ'] + ' · ' + p['Loại lỗi'] + ' · ' + p['Trạng thái'] + (p['Hạn'] < bayGio_() ? ' · QUÁ HẠN' : ''); }).join('\n') + '\n' + link_('phieu'));
}
function nhacSuKien_() {
  const hn = ngay_(); const ds = bang_(vh_(), 'SuKien');
  ds.forEach(function (s) {
    const d = String(s['Bắt đầu']).slice(0, 10); const kc = Math.round((new Date(d) - new Date(hn)) / 864e5);
    if (kc === 3) guiGiao_(s['Đội phụ trách'], '🎉 Còn 3 ngày: ' + s['Tên'] + ' (' + s['Loại'] + ') · chỉnh trang khu vực ' + tenVT_(s['Mã vị trí'], s['Vị trí khác']));
    if (kc === 1) guiGiao_(s['Đội phụ trách'], '🎉 Ngày mai: ' + s['Tên'] + ' lúc ' + String(s['Bắt đầu']).slice(11, 16) + '. Trước tiệc 2 giờ gửi ảnh đã vệ sinh.\n' + link_('sukien'));
    if (kc === 0) guiGiao_(s['Đội phụ trách'], '🎉 Hôm nay: ' + s['Tên'] + ' lúc ' + String(s['Bắt đầu']).slice(11, 16) + '. Nhớ ảnh trước tiệc, sáng mai trước 9h ảnh sau tiệc.\n' + link_('sukien'));
  });
}
function nhacDichHai_() {
  const vh = vh_(); const cn = bang_(vh, 'DichHaiCapNhat'); const hn = new Date(ngay_());
  bang_(vh, 'DichHai').filter(function (r) { return /Phát hiện|Đang xử lý/.test(r['Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)']); }).forEach(function (r) {
    const x = cn.filter(function (y) { return y['Mã DH'] === r['Mã DH']; }); const cuoi = x.length ? x[x.length - 1]['Thời điểm'] : r['Ngày phát hiện'];
    const im = Math.round((hn - new Date(String(cuoi).slice(0, 10))) / 864e5); const tuoi = Math.round((hn - new Date(r['Ngày phát hiện'])) / 864e5);
    if (im === 7) guiNhom_('Tổ trưởng', '🐛 7 ngày chưa cập nhật: ' + r['Loại dịch hại'] + ' · ' + r['Tên cây'] + ' · ' + tenVT_(r['Mã vị trí'], r['Vị trí chi tiết']) + '\n' + link_('dichhai'));
    if (tuoi === 21) guiNhom_('Trưởng bộ phận', '🐛 Hồ sơ mở 21 ngày: ' + r['Mã DH'] + ' · ' + r['Loại dịch hại'] + '\n' + link_('dichhai'));
  });
  // bùng phát: ≥ 3 vị trí cùng loại trong 7 ngày
  const tu = Utilities.formatDate(new Date(Date.now() - 7 * 864e5), TZ, 'yyyy-MM-dd'); const dem = {};
  bang_(vh, 'DichHai').filter(function (r) { return r['Ngày phát hiện'] >= tu && r['Loại dịch hại'] !== 'Chưa rõ'; }).forEach(function (r) { (dem[r['Loại dịch hại']] = dem[r['Loại dịch hại']] || {})[r['Mã vị trí'] || r['Vị trí chi tiết']] = 1; });
  Object.keys(dem).forEach(function (k) { if (Object.keys(dem[k]).length >= 3) guiNhom_('Trưởng bộ phận', '⚠️ Có thể bùng phát ' + k + ': ' + Object.keys(dem[k]).length + ' vị trí trong 7 ngày\n' + link_('dichhai')); });
}
/* việc lặp lại: 6h sáng tạo phiếu cho việc đến hạn */
function taoViecLapLai_() {
  const hn = new Date(); const ngayS = ngay_(); const dsL = bang_(vh_(), 'ViecLapLai'); const da = bang_(vh_(), 'Phieu').filter(function (p) { return String(p['Giờ tạo']).indexOf(ngayS) === 0; });
  const he = { ten: 'GreenLog (tự động)', gmail: '', nhom: 'Trưởng bộ phận', quyen: { phieu: 3 } };
  dsL.forEach(function (r) {
    if (!denHanLL_(r, hn)) return;
    if (da.some(function (p) { return p['Mã lặp lại'] === r['Mã LL']; })) return;
    phieuTao_(he, { loai: r['Nội dung'], nhom: 'Việc lặp lại', muc: r['Mức độ'] || 'Trung bình', vt: /^VT\d+$/.test(r['Mã vị trí']) ? r['Mã vị trí'] : '', vtKhac: /^VT\d+$/.test(r['Mã vị trí']) ? '' : r['Mã vị trí'], giao: r['Người phụ trách'], nguon: 'Bộ phận khác', maLL: r['Mã LL'] });
    guiGiao_(r['Người phụ trách'], '🔁 Việc hôm nay: ' + r['Nội dung'] + '\n' + link_('phieu'));
  });
}
function denHanLL_(r, d) {
  const n = Utilities.formatDate(d, TZ, 'yyyy-MM-dd');
  if (r['Đang chạy'] !== 'Có' || (r['Từ ngày'] && n < r['Từ ngày']) || (r['Đến ngày'] && n > r['Đến ngày'])) return false;
  const ts = String(r['Tham số'] || ''); const ck = r['Chu kỳ'];
  if (ck === 'Hằng ngày') return true;
  if (ck === 'Mỗi N ngày') return Math.round((new Date(n) - new Date(r['Từ ngày'] || n)) / 864e5) % (+ts || 1) === 0;
  if (ck === 'Thứ trong tuần') return ts.split(',').map(function (x) { return x.trim(); }).indexOf(['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][+Utilities.formatDate(d, TZ, 'u') % 7]) >= 0;
  if (ck === 'Ngày trong tháng') return ts.split(',').map(Number).indexOf(+Utilities.formatDate(d, TZ, 'd')) >= 0;
  if (ck === 'Theo kỳ 20→19') return +Utilities.formatDate(d, TZ, 'd') === 20;
  return false;
}


/* ================= 0.3: nhắc điểm danh giúp, việc đang triển khai, sao lưu đêm, tách file theo năm, tóm tắt tuần ================= */
/* 7h30 / 14h30: đội nào chưa điểm danh thì nhắc tổ trưởng đội còn lại (điểm danh giúp) */
function nhacDiemDanhGiup_(buoi) {
  const du = bang_(vh_(), 'DuyetCong').filter(function (x) { return x['Ngày'] === ngay_() && x['Buổi'] === buoi; });
  const tt = danhBa_().filter(function (x) { return x.nhom === 'Tổ trưởng'; });
  tt.forEach(function (x) {
    if (du.some(function (d) { return String(d['Đội']).toLowerCase() === String(x.doi).toLowerCase(); })) return;
    tt.filter(function (y) { return y.doi !== x.doi; }).forEach(function (y) { guiTin_(y, '🧑‍🤝‍🧑 ' + x.doi + ' chưa điểm danh buổi ' + buoi.toLowerCase() + '. Nếu tổ trưởng ' + x.ten + ' nghỉ, anh điểm danh giúp: ' + link_('diemdanh')); });
  });
}
/* việc định kỳ đang triển khai quá 7 ngày */
function nhacDangTrienKhai_() {
  const ds = bang_(vh_(), 'TickDinhKy').filter(function (x) { return x['Trạng thái'] === 'Đang làm' && (new Date(ngay_()) - new Date(x['Bắt đầu'])) / 864e5 >= 7; });
  if (!ds.length) return;
  const nhom = {}; ds.forEach(function (x) { (nhom[x['Mã việc']] = nhom[x['Mã việc']] || []).push(x['Mã vị trí']); });
  const text = '⏰ Việc đang triển khai quá 7 ngày:\n' + Object.keys(nhom).map(function (k) { return '• ' + tenViec_(k) + ': ' + nhom[k].length + ' vị trí'; }).join('\n') + '\n' + link_('viec');
  guiNhom_('Tổ trưởng', text); guiNhom_('Trưởng bộ phận', text);
}
/* 23h30: sao chép file vận hành vào thư mục 04_SaoLuu, giữ 30 bản gần nhất */
function saoLuuDem_() {
  const id = prop_('VANHANH_ID'); const f = DriveApp.getFileById(id);
  const cha = f.getParents().hasNext() ? f.getParents().next() : DriveApp.getRootFolder();
  const goc = cha.getParents().hasNext() ? cha.getParents().next() : cha;
  const it = goc.getFoldersByName('04_SaoLuu'); const thuMuc = it.hasNext() ? it.next() : goc.createFolder('04_SaoLuu');
  f.makeCopy('SaoLuu_' + f.getName() + '_' + Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'), thuMuc);
  const ban = []; const fs = thuMuc.getFiles(); while (fs.hasNext()) ban.push(fs.next());
  ban.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); }).slice(30).forEach(function (x) { x.setTrashed(true); });
}
/* 02/01: chuyển dữ liệu năm trước của các trang lớn sang file riêng GreenLog_VanHanh_<năm>, file chính nhẹ lại */
const TRANG_TACH = ['TickDinhKy', 'AnhNgay', 'Tuoi', 'ViecHangNgay', 'DiemDanh', 'DuyetCong', 'VanChuyen', 'VeSinhBien', 'KiemTraBien', 'VuonRau', 'CayNoiThat', 'RacHuuCo', 'DongHoNuoc', 'PhieuLichSu', 'NhatKyThayDoi'];
function tachNam_() {
  const nam = String(new Date().getFullYear() - 1); const vh = vh_();
  const f = DriveApp.getFileById(prop_('VANHANH_ID')); const cha = f.getParents().hasNext() ? f.getParents().next() : DriveApp.getRootFolder();
  const ten = 'GreenLog_VanHanh_' + nam; const it = cha.getFilesByName(ten); const daCo = it.hasNext();
  const dich = daCo ? SpreadsheetApp.open(it.next()) : SpreadsheetApp.create(ten);
  if (!daCo) DriveApp.getFileById(dich.getId()).moveTo(cha);
  TRANG_TACH.forEach(function (t) {
    const sh = vh.getSheetByName(t); if (!sh || sh.getLastRow() < 2) return;
    const v = sh.getDataRange().getValues(); const h = v[0]; const cotNgay = h.indexOf('Ngày') >= 0 ? h.indexOf('Ngày') : h.indexOf('Thời điểm');
    if (cotNgay < 0) return;
    const cu = v.slice(1).filter(function (r) { return String(r[cotNgay]).slice(0, 4) <= nam; }); if (!cu.length) return;
    let d = dich.getSheetByName(t); if (!d) { d = dich.insertSheet(t); d.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight('bold'); }
    d.getRange(d.getLastRow() + 1, 1, cu.length, h.length).setNumberFormat('@').setValues(cu);
    // giữ lại dòng năm nay: ghi đè một lần (nhanh hơn xóa từng dòng)
    const con = v.slice(1).filter(function (r) { return String(r[cotNgay]).slice(0, 4) > nam; });
    sh.getRange(2, 1, sh.getLastRow() - 1, h.length).clearContent();
    if (con.length) sh.getRange(2, 1, con.length, h.length).setNumberFormat('@').setValues(con);
    quenBang_(vh, t);
  });
  const s1 = dich.getSheetByName('Sheet1') || dich.getSheetByName('Trang tính1'); if (s1 && dich.getSheets().length > 1) dich.deleteSheet(s1);
  guiNhom_('Trưởng bộ phận', '🗄️ Đã chuyển dữ liệu năm ' + nam + ' sang file ' + ten + '. File chính nhẹ hơn, báo cáo năm cũ mở file này.');
}
/* thứ Hai 7h45: tóm tắt tuần trước (AI viết lại nếu có GEMINI_KEY) */
function tomTatTuan_() {
  const vh = vh_(); const tu = Utilities.formatDate(new Date(Date.now() - 7 * 864e5), TZ, 'yyyy-MM-dd'); const den = Utilities.formatDate(new Date(Date.now() - 864e5), TZ, 'yyyy-MM-dd');
  const trong = function (x, k) { return x[k] >= tu && x[k] <= den + ' 99'; };
  const tick = bang_(vh, 'TickDinhKy').filter(function (x) { return (x['Trạng thái'] || 'Xong') === 'Xong' && trong(x, 'Ngày xong') || (!x['Trạng thái'] && trong(x, 'Ngày')); });
  const ph = bang_(vh, 'Phieu'); const moi = ph.filter(function (p) { return trong(p, 'Giờ tạo'); }); const xong = ph.filter(function (p) { return trong(p, 'Giờ duyệt'); });
  const mo = ph.filter(function (p) { return p['Trạng thái'] !== 'Đã duyệt'; }); const qh = mo.filter(function (p) { return p['Hạn'] && p['Hạn'] < bayGio_(); });
  const cong = bang_(vh, 'DiemDanh').filter(function (x) { return trong(x, 'Ngày'); }).reduce(function (s, x) { return s + (+x['Công'] || 0); }, 0);
  const rac = bang_(vh, 'RacHuuCo').filter(function (x) { return trong(x, 'Ngày'); }).reduce(function (s, x) { return s + (+x['kg rác thu gom'] || 0); }, 0);
  const vc = bang_(vh, 'VanChuyen').filter(function (x) { return trong(x, 'Ngày'); }).reduce(function (s, x) { return s + (+x['Số chuyến'] || 0); }, 0);
  const dh = bang_(vh, 'DichHai').filter(function (x) { return trong(x, 'Ngày phát hiện'); });
  const dang = bang_(vh, 'TickDinhKy').filter(function (x) { return x['Trạng thái'] === 'Đang làm'; }).length;
  const so = 'Tuần ' + tu + ' → ' + den + ': định kỳ xong ' + tick.length + ' lượt vị trí; đang triển khai ' + dang + '; phiếu mới ' + moi.length + ', duyệt ' + xong.length + ', còn mở ' + mo.length + ' (quá hạn ' + qh.length + '); công ' + cong + '; rác hữu cơ ' + Math.round(rac) + ' kg; vận chuyển ' + vc + ' chuyến; dịch hại mới ' + dh.length + (dh.length ? ' (' + dh.map(function (x) { return x['Loại dịch hại'] + ' trên ' + x['Tên cây']; }).slice(0, 5).join(', ') + ')' : '') + '.';
  let text = '📊 Tóm tắt tuần\n' + so;
  const key = prop_('GEMINI_KEY', true);
  if (key) {
    try {
      const model = prop_('GEMINI_MODEL', true) || 'gemini-2.5-flash';
      const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key, { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
        payload: JSON.stringify({ contents: [{ parts: [{ text: 'Bạn là trợ lý của trưởng bộ phận cảnh quan resort. Viết tóm tắt tuần bằng tiếng Việt, tối đa 6 dòng gạch đầu dòng, nêu 2 điểm tốt, 2 điểm cần chú ý và 1 việc nên làm tuần này. Chỉ dùng số liệu sau, không bịa thêm:\n' + so }] }] }) });
      const j = JSON.parse(res.getContentText()); const t = j.candidates && j.candidates[0].content.parts.map(function (x) { return x.text; }).join('');
      if (t) text = '📊 Tóm tắt tuần (AI viết từ số liệu, kiểm tra lại khi cần)\n' + t + '\n\nSố liệu: ' + so;
    } catch (e) { console.error(e); }
  }
  guiNhom_('Trưởng bộ phận', text + '\n' + link_('baocao'));
}
