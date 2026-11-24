/* GreenLog 0.4 – nền: bảng mới, quyền theo đầu việc, định biên, khung bảng điều khiển, nút ＋ Tạo, 📌 Đưa vào họp, ⚠ Báo khó khăn, dữ liệu mẫu */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G; const LS = API.LS;
  const hn = () => API.ngay();

  /* ---------- bảng mới (giống BANG trong Code.gs) ---------- */
  Object.assign(API.BANG, {
    NhacNho: ['homnay', 2], DuaVaoHop: ['homnay', 2], KhoKhan: ['homnay', 2], HoanViec: ['homnay', 2], TraoDoi: ['homnay', 2],
    DeXuatCay: ['homnay', 2], CayDanhMuc: ['danhmuc', 3], CaiDat: ['homnay', 3], KyDinhKy: ['homnay', 3], NgayLe: ['homnay', 3],
    NgayLamViec: ['homnay', 2], GiaoViecNgay: ['homnay', 2], NghiemThu: ['homnay', 3], BaoCaoTuan: ['homnay', 2],
    DaoTaoDiemDanh: ['homnay', 2], DaoTaoDeXuat: ['homnay', 2], KetQuaThi: ['homnay', 2], SOPDoc: ['homnay', 2],
    TuiThuocDua: ['phunbon', 2], BaoTriMay: ['noibo', 2], DanhDauSlide: ['homnay', 2], BaoCaoGM: ['homnay', 3], PhanQuyenViec: ['danhmuc', 3],
    KhuPhuTrach: ['congnhan', 3], PhunLai: ['phunbon', 2],
  });
  /* bảng anh Pháp được ghi dù Hôm nay chỉ Xem: báo cáo tuần, kế hoạch tuần */
  API.BANG.DaoTao = ['homnay', 2];
  API.NHA_THAU_GHI = ['BaoCaoTuan', 'KeHoachTuan', 'KhoKhan', 'DaoTaoDeXuat', 'DaoTao', 'DaoTaoDiemDanh', 'KetQuaThi', 'SOPDoc'];
  G.ma = (p) => p + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const docDuoc = (x) => { const b = API.BANG[x.bang]; return b && q(b[0]) >= 1; };
  G.doc = async (bang, loc, gioiHan) => (docDuoc({ bang }) ? (await API.goi('docNhieu', { ds: [{ bang, loc, gioiHan }] }))[bang] || [] : []);
  G.docNhieu = async (ds) => { const r = await API.goi('docNhieu', { ds: ds.filter(docDuoc) }); ds.forEach((x) => { if (!r[x.bang]) r[x.bang] = []; }); return r; };
  G.congNgay = G.congNgay || ((d, n) => API.ngay(new Date(new Date(d).getTime() + n * 864e5)));
  G.laAnhVu = () => q('homnay') >= 3;

  /* ---------- quyền theo đầu việc (GreenLog_PhanQuyen) ---------- */
  // cột: Tổ trưởng cơ động (Thìn), Tổ trưởng khu vực (Trường), Q.lý nhà thầu (Pháp), Nhân viên nội bộ (Hiệp, Nghị)
  const K = 'Không thấy', X = 'Xem', W = 'Ghi';
  const QV = {
    DV01: [W, W, X, K], DV02: [W, W, X, K], DV03: [W, W, X, K], DV04: [W, W, X, K], DV05: [W, W, X, K], DV06: [W, W, X, K], DV07: [W, W, X, K], DV08: [W, W, X, K], DV37: [W, W, X, K], DV38: [W, W, X, K], DV39: [W, W, X, K],
    DV09: [W, W, X, K], DV10: [W, W, X, K], DV11: [W, W, X, K], DV12: [X, W, X, K], DV13: [W, W, W, K], DV14: [W, W, W, K], DV15: [W, W, X, K], DV16: [W, W, X, K], DV17: [X, W, X, K],
    DV18: [K, K, K, W], DV23: [K, K, K, W], DV19: [K, K, K, W], DV20: [K, K, K, W], DV31: [K, K, K, W], DV21: [K, K, K, W], DV22: [K, K, K, W], DV24: [K, K, K, W], DV25: [K, K, K, W], DV26: [K, K, K, W], DV30: [K, K, K, W],
    DV27: [K, K, K, K], DV28: [X, X, X, K], DV29: [K, K, X, K], DV33: [W, W, X, W], DV36: [K, K, K, K], DV32: [W, W, X, K], DV34: [X, X, X, X], DV35: [W, W, X, K],
    CN01: [W, W, W, K], CN02: [X, X, W, K], CN03: [K, K, X, K], CN04: [W, W, X, K], CN05: [W, W, W, W], CN06: [W, W, X, W], CN07: [W, W, X, W], CN08: [W, W, X, W], CN09: [W, W, X, W],
    CN10: [K, K, K, W], CN11: [W, W, X, W], CN12: [W, W, X, W],
  };
  G.QV = QV;
  const CAP = { [K]: 0, [X]: 1, [W]: 2, 'Duyệt': 3 };
  const cotCua = (u) => (u.nhom === 'Tổ trưởng' ? (/cơ động/i.test(u.doi) ? 0 : 1) : u.nhom === 'Quản lý nhà thầu' ? 2 : u.nhom === 'Nhân viên nội bộ' ? 3 : -1);
  G.qv = (ma) => {
    const u = S.u; if (!u) return 0; if (u.nhom === 'Trưởng bộ phận') return 3;
    const c = cotCua(u); if (c < 0) return 0;
    const rieng = (S.dm.quyenViec || []).find((r) => r['Mã'] === ma && r['Cột'] === String(c));
    if (rieng) return CAP[rieng['Cấp']] || 0;
    return QV[ma] ? CAP[QV[ma][c]] : 1;
  };
  G.QV_COT = ['Tổ trưởng Đội cơ động (Thìn)', 'Tổ trưởng Đội khu vực (Trường)', 'Q.lý nhà thầu (Pháp)', 'Nhân viên nội bộ (Hiệp, Nghị)'];

  /* ---------- định biên 31 (GreenLog_DinhBien) ---------- */
  G.DINH_BIEN = [
    ['Quản lý nhà thầu', 'Quản lý nhà thầu', 1], ['Đội cơ động', 'Tổ trưởng', 1], ['Đội cơ động', 'Cắt cỏ', 3], ['Đội cơ động', 'Bón phân + phun thuốc', 2], ['Đội cơ động', 'Vận chuyển', 2], ['Đội cơ động', 'Cắt tỉa cây bóng mát', 2],
    ['Đội khu vực', 'Tổ trưởng', 1], ['Đội khu vực', 'Nhân viên vườn ươm (kiêm Ký túc xá)', 1], ['Đội khu vực', 'Nhân viên cải tạo', 1], ['Đội khu vực', 'Nhân viên khu vực', 17]];
  G.DINH_BIEN_KHU = { 'Hotel': 2, 'Aura': 1, 'Residences': 2, 'Villa 1 - 14': 2, 'Villa 15 - 24': 2, 'Villa 25 - 48': 2, 'Villa 49 - 80': 4, 'Islander': 1, 'Public': 0, 'Ký túc xá': 0 };
  G.TONG_DINH_BIEN = 31;
  const khopCD = (cn, cd) => { const c = String(cn.cd || ''); return cd === 'Quản lý nhà thầu' ? /Quản lý/.test(c) : /vườn ươm/i.test(cd) ? /vườn ươm/i.test(c) : c.toLowerCase() === cd.toLowerCase(); };
  /* thiếu chức danh + khu trống, theo danh sách đang làm hoặc theo người có mặt hôm nay */
  G.thieuDinhBien = (coMat, khu) => {
    const cn = (S.dm.congnhan || []).filter((x) => x.tt !== 'Đã nghỉ' && (!coMat || coMat.has(x.ma)));
    const thieu = G.DINH_BIEN.map(([doi, cd, n]) => { const co = cn.filter((x) => (doi === 'Quản lý nhà thầu' || x.doi === doi) && khopCD(x, cd)).length; return { doi, cd, n, co, thieu: Math.max(0, n - co) }; }).filter((x) => x.thieu);
    const trong = Object.keys(G.DINH_BIEN_KHU).filter((c) => G.DINH_BIEN_KHU[c] > 0).filter((c) => !(khu || []).some((r) => r['Cụm'] === c && (!coMat || coMat.has(r['Mã CN']))));
    return { thieu, trong, co: cn.length };
  };

  /* ---------- ngày lễ (dương + âm lịch đã đổi ra dương) ---------- */
  const LE = [
    ['2026-01-01', 'Tết Dương lịch'], ['2026-02-16', 'Tết Nguyên đán (29 tháng Chạp)'], ['2026-02-17', 'Tết Nguyên đán (Mùng 1)'], ['2026-02-18', 'Tết Nguyên đán (Mùng 2)'], ['2026-02-19', 'Tết Nguyên đán (Mùng 3)'], ['2026-02-20', 'Tết Nguyên đán (Mùng 4)'],
    ['2026-04-26', 'Giỗ Tổ Hùng Vương (10/3 âm lịch)'], ['2026-04-30', 'Ngày Chiến thắng'], ['2026-05-01', 'Quốc tế Lao động'], ['2026-09-01', 'Quốc khánh (nghỉ liền kề)'], ['2026-09-02', 'Quốc khánh'], ['2026-11-24', 'Ngày Văn hóa Việt Nam'],
    ['2027-01-01', 'Tết Dương lịch'], ['2027-02-05', 'Tết Nguyên đán (29 tháng Chạp)'], ['2027-02-06', 'Tết Nguyên đán (Mùng 1)'], ['2027-02-07', 'Tết Nguyên đán (Mùng 2)'], ['2027-02-08', 'Tết Nguyên đán (Mùng 3)'], ['2027-02-09', 'Tết Nguyên đán (Mùng 4)'],
    ['2027-04-16', 'Giỗ Tổ Hùng Vương (10/3 âm lịch)'], ['2027-04-30', 'Ngày Chiến thắng'], ['2027-05-01', 'Quốc tế Lao động'], ['2027-09-02', 'Quốc khánh'], ['2027-09-03', 'Quốc khánh (nghỉ liền kề)'], ['2027-11-24', 'Ngày Văn hóa Việt Nam'],
  ];
  G.ngayLe = () => { const sua = S.dm.ngayLeSua || []; const o = {}; LE.forEach(([d, t]) => { o[d] = t; }); sua.forEach((r) => { if (r['Bỏ'] === 'Có') delete o[r['Ngày']]; else o[r['Ngày']] = r['Tên']; }); return o; };
  G.laLe = (d) => G.ngayLe()[d] || '';
  G.congHD = (d) => (new Date(d).getDay() === 0 || G.laLe(d) ? 20 : 31);

  /* ---------- kỳ 20 → 19 và khung thời gian ---------- */
  G.dauThang = (d) => String(d || hn()).slice(0, 8) + '01';
  G.dauNam = (d) => String(d || hn()).slice(0, 4) + '-01-01';
  G.khoang = (k) => (k === 'ngay' ? [hn(), hn()] : k === 'thang' ? [G.dauThang(), hn()] : k === 'nam' ? [G.dauNam(), hn()] : k === 'ky' ? [S.dm.ky.tu, hn()] : k);
  G.TEN_KHOANG = { ngay: 'Hôm nay', thang: 'Từ đầu tháng', nam: 'Từ đầu năm' };

  /* ---------- tải thêm danh mục khi khởi động ---------- */
  const taiDMGoc = G.taiDanhMuc;
  G.boSungDM = async () => {
    try {
      const d = await G.docNhieu([{ bang: 'PhanQuyenViec' }, { bang: 'NgayLe' }, { bang: 'CaiDat' }, { bang: 'KhuPhuTrach' }, { bang: 'CayDanhMuc' }]);
      S.dm.quyenViec = d.PhanQuyenViec || []; S.dm.ngayLeSua = d.NgayLe || []; S.dm.khu = d.KhuPhuTrach || []; S.dm.caySua = d.CayDanhMuc || [];
      S.dm.caiDat = {}; (d.CaiDat || []).forEach((r) => { S.dm.caiDat[r['Khóa']] = r['Giá trị']; });
      (S.dm.caySua || []).forEach((r) => { const c = S.dm.cay.find((x) => x.ma === r['Mã']); const moi = { ma: r['Mã'], ten: r['Tên Việt'], en: r['Tên Anh'], kh: r['Tên khoa học'], nhom: r['Nhóm'], trong: 'Có', dh: r['Dịch hại thường gặp'], anh: r['Ảnh'] }; if (c) Object.assign(c, moi); else S.dm.cay.push(moi); });
    } catch (e) { console.warn(e); S.dm.quyenViec = []; S.dm.caiDat = {}; }
  };
  G.caiDat = (k, md) => (S.dm.caiDat && S.dm.caiDat[k] != null && S.dm.caiDat[k] !== '' ? S.dm.caiDat[k] : md);
  G.datCaiDat = async (k, v) => { await API.goi('ghiNhieu', { bang: 'CaiDat', thay: ['Khóa'], dong: [{ 'Khóa': k, 'Giá trị': v, 'Người ghi': '', 'Giờ ghi': '' }] }); S.dm.caiDat[k] = v; };
  G.taiDanhMuc = async () => { await taiDMGoc(); await G.boSungDM(); };

  /* ---------- đổi tên Vị Garden, bỏ rác hữu cơ ---------- */
  G.doiTenVi = (s) => String(s == null ? '' : s).replace(/[Vv]ườn rau/g, (m) => (m[0] === 'V' ? 'Vị Garden' : 'Vị Garden'));
  const suaDM = () => {
    const d = S.dm; if (!d || d._v04) return; d._v04 = true;
    d.dauviec.forEach((v) => { v.ten = G.doiTenVi(v.ten); });
    d.dauviec.forEach((v) => { if (v.ma === 'DV23') v.ten = 'Thu gom rau củ làm compost'; });
    if (!d.dauviec.some((v) => v.ma === 'DV39')) d.dauviec.push({ ma: 'DV39', ten: 'Túi thuốc họ dừa', nhom: 'Nhà thầu', lich: 'Có lịch', tanSuat: '4 đợt/năm', apDung: 'Danh sách dừa, cọ, kè bạc', anh: 'Bắt buộc' });
    if (!d.dauviec.some((v) => v.ma === 'DV40')) d.dauviec.push({ ma: 'DV40', ten: 'Cắt tỉa Hoa Giấy đường N2, N4', nhom: 'Nhà thầu', lich: 'Có lịch', tanSuat: '2 lần/năm', apDung: 'Đường N2, N4', anh: 'Bắt buộc' });
    d.diemkhac = d.diemkhac.filter((x) => x.loai !== 'Nguồn rác hữu cơ');
    d.chuDeSOP = (d.chuDeSOP || []).map(G.doiTenVi);
    // hàng rào theo tab HangRao (đã chốt)
    if (!(d.hangrao || []).length) d.hangrao = HANG_RAO();
  };
  function HANG_RAO() {
    const ds = []; let i = 0; const them = (kv, ten, cay) => ds.push({ ma: 'HR' + String(++i).padStart(3, '0'), kv, ten, cay });
    for (let v = 1; v <= 80; v++) if (v !== 13) them('Trước villa (Hồng Lộc)', 'Villa ' + v + ' mặt trước', 'Hồng Lộc');
    for (let v = 15; v <= 80; v++) them('Bờ hồ sau villa (Huỳnh Anh Vàng + Hoa Giấy)', 'Villa ' + v + ' mặt sau', 'Huỳnh Anh Vàng + Hoa Giấy');
    them('Residences', 'Bờ hồ Residences', 'Huỳnh Anh Vàng'); them('Residences', '15 phòng cạnh hồ bơi', 'Hồng Lộc');
    them('Ký túc xá', 'Hàng rào KTX', 'Chuỗi Ngọc + Hồng Lộc');
    return ds;
  }
  G.suaDM = suaDM;
  /* in trang A4 đúng mẫu (không thêm khung, giữ màu nền khi in) */
  G.inA4 = (tieuDe, html) => { const w = window.open('', '_blank'); if (!w) throw new Error('Trình duyệt chặn cửa sổ in. Cho phép cửa sổ bật lên rồi thử lại.');
    w.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(tieuDe)}</title><style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>${html}<script>setTimeout(()=>print(),900)<\/script></body></html>`); w.document.close(); };
  /* tên hiển thị: "vườn rau" → "Vị Garden" ở mọi nơi (dữ liệu cũ giữ nguyên) */
  const RE_VR = /([Vv])ườn rau/g;
  const doiChu = (goc) => { if (!goc) return; if (goc.nodeType === 3) { if (RE_VR.test(goc.nodeValue)) goc.nodeValue = goc.nodeValue.replace(RE_VR, 'Vị Garden'); return; }
    const w = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT); let n; const ds = []; while ((n = w.nextNode())) ds.push(n); ds.forEach((x) => { RE_VR.lastIndex = 0; if (RE_VR.test(x.nodeValue)) { x.nodeValue = x.nodeValue.replace(RE_VR, 'Vị Garden'); } }); };
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((x) => doiChu(x)))).observe(document.documentElement, { childList: true, subtree: true });

  /* ---------- khung: thanh bên (máy tính) + thanh dưới nổi có ＋ (điện thoại) ---------- */
  const MENU = () => [
    { k: '', ten: G.laAnhVu() ? 'Tổng quan' : 'Hôm nay', ic: 'hom_nay' },
    G.laAnhVu() ? { k: 'homnay', ten: 'Hôm nay toàn bộ phận', ic: 'toan_bp' } : null,
    q('diemdanh') && S.u.nhom !== 'Nhân viên nội bộ' ? { k: 'diemdanh', ten: 'Điểm danh', ic: 'diem_danh' } : null,
    (q('dinhky') || q('noibo')) ? { k: 'viec', ten: 'Việc', ic: 'viec' } : null,
    q('phieu') ? { k: 'phieu', ten: 'Phiếu', ic: 'phieu' } : null,
    q('kehoach') ? { k: 'kehoach', ten: 'Kế hoạch', ic: 'ke_hoach' } : null,
    G.qv('DV28') ? { k: 'hop', ten: 'Họp', ic: 'hop' } : null,
    q('duan') ? { k: 'duan', ten: 'Dự án', ic: 'du_an' } : null,
    { k: 'daotao', ten: 'Đào tạo', ic: 'dao_tao' },
    q('congnhan') ? { k: 'congnhan', ten: 'Công nhân', ic: 'cong_nhan' } : null,
    (q('baocao') || G.laAnhVu()) ? { k: 'baocao', ten: 'Báo cáo', ic: 'bao_cao' } : null,
    { k: 'them', ten: 'Thêm', ic: 'lap_lai' },
  ].filter(Boolean);
  const $app = document.getElementById('app');
  G.khung = function (tieuDe, phu, lui) {
    suaDM();
    if (!S.dm._bs) { S.dm._bs = true; G.boSungDM(); if (API.thu() && !LS.get('mau04')) { G.napMau(); G.boSungDM().then(() => G.taiLai()); } }
    const tuyen = location.hash.replace(/^#\/?/, '').split('/')[0];
    const k = S.dm.ky; const tu = new Date(k.tu), den = new Date(k.den); const ngayThu = Math.round((new Date(hn()) - tu) / 864e5) + 1; const tong = Math.round((den - tu) / 864e5) + 1;
    const duoi = [{ k: '', ten: G.laAnhVu() ? 'Tổng quan' : 'Hôm nay', ic: 'hom_nay' }, (q('dinhky') || q('noibo')) ? { k: 'viec', ten: 'Việc', ic: 'viec' } : { k: 'daotao', ten: 'Đào tạo', ic: 'dao_tao' }, { cong: 1 },
      q('phieu') ? { k: 'phieu', ten: 'Phiếu', ic: 'phieu' } : { k: 'baocao', ten: 'Báo cáo', ic: 'bao_cao' }, { k: 'them', ten: 'Thêm', ic: 'lap_lai' }];
    const ten = S.u.ten.split(' ').pop();
    $app.innerHTML = `
      <aside class="ben"><a class="logo" href="#/"><i>${G.LOGO}</i>GreenLog</a>
        ${MENU().map((m) => `<a class="m ${tuyen === m.k ? 'dang' : ''}" href="#/${m.k}">${G.ic(m.ic, 26)}<span>${esc(m.ten)}</span>${m.k === 'phieu' ? '<span class="so-do an" id="soPhieu"></span>' : ''}</a>`).join('')}
        <div class="ky">Kỳ ${esc(k.ten)} · ${G.ngayVN(k.tu).slice(0, 5)} → ${G.ngayVN(k.den).slice(0, 5)}<b>Ngày ${Math.max(1, ngayThu)}/${tong}</b><div class="thanh" style="margin-top:8px;background:rgba(255,255,255,.15)"><i style="width:${Math.min(100, Math.round(ngayThu / tong * 100))}%;background:var(--chanh)"></i></div></div></aside>
      ${API.thu() ? '<div class="bang-thu">Chế độ chạy thử · dữ liệu mẫu, chỉ lưu trên máy này</div>' : ''}
      <header class="dau">${lui ? '<button class="nut-tron" id="nutLui">‹</button>' : '<img src="icons/icon-192.png" alt="">'}
        <div class="tieude"><b>${esc(tieuDe)}</b><small>${esc(phu || '')}</small></div>
        ${G.laAnhVu() ? '<button class="nut-tron tao phu" id="nutGM">⬇ Báo cáo GM</button>' : ''}
        <button class="nut-tron tao" id="nutTao">＋ Tạo</button>
        ${!G.laAnhVu() ? '<button class="nut-tron" id="nutKK" title="Báo khó khăn">⚠</button>' : ''}
        <button class="nut-tron chuong" id="nutChuong" title="Thông báo">🔔<span class="so-tron an" id="soChuong"></span></button>
        <button class="nut-tron av" id="nutTk">${esc(ten[0] || '')}</button></header>
      <div class="bang-hang" style="display:none"></div>
      <main id="noiDung"><div class="dang-tai">Đang tải…</div></main>
      <nav class="duoi">${duoi.map((m) => (m.cong ? '<a href="#" class="cong" id="nutCong" aria-label="Tạo">＋</a>' : `<a href="#/${m.k}" class="${tuyen === m.k ? 'dang' : ''}"><span class="bt">${G.ic(m.ic, 26)}</span>${esc(m.ten)}</a>`)).join('')}</nav>`;
    document.getElementById('nutTk').onclick = () => { location.hash = '#/them'; };
    const l = document.getElementById('nutLui'); if (l) l.onclick = () => { if (typeof lui === 'string') location.hash = lui; else history.back(); };
    document.getElementById('nutCong').onclick = (e) => { e.preventDefault(); G.moTao(); };
    document.getElementById('nutTao').onclick = () => G.moTao();
    document.getElementById('nutChuong').onclick = () => G.moChuong();
    const kk = document.getElementById('nutKK'); if (kk) kk.onclick = () => G.baoKhoKhan({ tieuDe: tieuDe, link: location.hash });
    const gm = document.getElementById('nutGM'); if (gm) gm.onclick = () => { location.hash = '#/baocaogm'; };
    API.baoHang(); G.demChuong();
    if (G.lang() === 'en' && G.dichCay) setTimeout(() => G.dichCay(document.getElementById('app')), 0);
    return document.getElementById('noiDung');
  };

  /* ---------- chuông: việc cần mình xử lý (số đỏ) ---------- */
  G.dsChuong = async () => {
    const d = await G.docNhieu([{ bang: 'BatThuong', gioiHan: 300 }, { bang: 'TraoDoi', gioiHan: 600 }, { bang: 'NhacNho', loc: { 'Trạng thái': ['Mới', 'Đang xử lý'] } }, { bang: 'Phieu', gioiHan: 400 }, { bang: 'DaoTao', gioiHan: 200 }, { bang: 'DaoTaoDeXuat', loc: { 'Trạng thái': 'Chờ duyệt' } }]);
    const out = []; const anh = G.laAnhVu();
    (d.BatThuong || []).filter((x) => x['Trạng thái'] !== 'Đã đóng').forEach((x) => {
      const td = (d.TraoDoi || []).filter((t) => t['Mã'] === G.maBT(x)); const cuoi = td[td.length - 1];
      const luotToi = anh ? (!cuoi || cuoi['Người'] !== S.u.ten) : (cuoi && cuoi['Người'] !== S.u.ten && /Trưởng bộ phận/.test(cuoi['Vai'] || ''));
      if (luotToi) out.push({ ten: '🥀 ' + (x['Tên cây'] || 'Cây nội thất') + ' · ' + G.tenVT(x['Mã vị trí'] || x['Mã điểm']), phu: x['Tình trạng'], link: 'batthuong/' + encodeURIComponent(G.maBT(x)) });
    });
    if (!anh) (d.NhacNho || []).filter((x) => x['Giao đội'] && (x['Giao đội'] === S.u.doi || x['Giao đội'] === S.u.ten || (S.u.nhom === 'Nhân viên nội bộ' && x['Giao đội'] === 'Nội bộ'))).forEach((x) => out.push({ ten: '📣 Nhắc nhở: ' + x['Nội dung'], phu: x['Nguồn'], link: 'nhacnho' }));
    if (anh) {
      (d.Phieu || []).filter((x) => x['Trạng thái'] === 'Báo xong').forEach((x) => out.push({ ten: '🎫 ' + x['Mã phiếu'] + ' báo xong', phu: x['Loại lỗi'], link: 'phieu' }));
      (d.DaoTao || []).filter((x) => /Chờ duyệt/.test(x['Trạng thái'] || '')).forEach((x) => out.push({ ten: '🎓 ' + x['Nội dung'], phu: x['Trạng thái'], link: 'daotao/' + encodeURIComponent(x['Mã ĐT']) }));
      (d.DaoTaoDeXuat || []).forEach((x) => out.push({ ten: '🎓 Đề xuất thay đổi lớp ' + x['Mã ĐT'], phu: x['Nội dung'], link: 'daotao/' + encodeURIComponent(x['Mã ĐT']) }));
    }
    return out;
  };
  G.maBT = (x) => x['Mã BT'] || [x['Ngày'], x['Mã điểm'] || x['Mã vị trí'], x['Tên cây']].join('|');
  G.demChuong = () => { G.dsChuong().then((ds) => { const s = document.getElementById('soChuong'); if (s) { s.textContent = ds.length; s.classList.toggle('an', !ds.length); } }).catch(() => {}); };
  G.moChuong = async () => {
    const ds = await G.dsChuong();
    G.hop('Thông báo', ds.length ? `<div class="ds">${ds.map((x, i) => `<a class="muc" href="#/${x.link}" data-i="${i}" style="color:inherit;text-decoration:none"><div class="gian"><b>${esc(x.ten)}</b><div class="mo">${esc(x.phu || '')}</div></div>›</a>`).join('')}</div>` : G.trong('Không có thông báo mới.'),
      (o, dong) => o.querySelectorAll('a').forEach((a) => { a.addEventListener('click', () => dong()); }));
  };

  /* ---------- ＋ Tạo ---------- */
  G.moTao = () => {
    const ds = [
      q('phieu') >= 2 ? ['phieu', '🎫 Phiếu giao việc', () => (G.taoPhieu ? G.taoPhieu() : (location.hash = '#/phieu'))] : null,
      G.qv('CN06') >= 2 ? ['phat_sinh', '⚡ Việc phát sinh', () => { location.hash = '#/phatsinh'; }] : null,
      ['bao', '⚠ Báo khó khăn', () => G.baoKhoKhan({ nguon: 'Tạo nhanh' })],
      G.laAnhVu() ? ['nhac_nho', '📣 Nhắc nhở (từ Zalo bộ phận khác)', () => G.moNhacNho()] : null,
      G.laAnhVu() ? ['hop', '👥 Họp đột xuất', () => { location.hash = '#/hop/dxmoi'; }] : null,
      G.laAnhVu() ? ['lich', '📌 Ghi chú đưa vào họp', () => G.ghimHop({ loai: 'Ghi chú', tieuDe: '' })] : null,
      q('phunbon') >= 2 && G.qv('CN07') >= 2 ? ['phun_bui', '🧪 Phun thuốc', () => { location.hash = '#/phunbon/thuoc'; }] : null,
      q('phunbon') >= 2 && G.qv('CN07') >= 2 ? ['phun_bon', '🍃 Phun phân bón lá', () => { location.hash = '#/phunbon/la'; }] : null,
      q('phunbon') >= 2 && G.qv('CN07') >= 2 ? ['bon_phan_bui', '🌱 Bón gốc', () => { location.hash = '#/phunbon/goc'; }] : null,
      q('phieu') >= 2 && G.qv('CN08') >= 2 ? ['dich_hai', '🐛 Hồ sơ dịch hại', () => { location.hash = '#/dichhai'; }] : null,
      q('phieu') >= 2 && G.qv('CN09') >= 2 ? ['trong_cay', '🌳 Sổ trồng cây', () => { location.hash = '#/sotrongcay'; }] : null,
      ['dao_tao', '🎓 Đăng ký lớp đào tạo', () => { location.hash = '#/daotao/moi'; }],
      G.laAnhVu() ? ['noi_that', '🪴 Phiếu setup cây nội thất', () => G.taoSetupNT()] : null,
    ].filter(Boolean);
    G.hop('Tạo mới', `<div class="ds">${ds.map((x, i) => `<button class="muc" data-i="${i}" style="width:100%;border:0;background:none;text-align:left;font:inherit;cursor:pointer">${G.ic(x[0], 34)}<b class="gian">${esc(x[1])}</b>›</button>`).join('')}</div>`, (o, dong) => {
      o.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => { dong(); setTimeout(() => ds[+b.dataset.i][2](), 50); }; });
    });
  };

  /* ---------- 📌 Đưa vào họp, ⚠ Báo khó khăn (dùng ở mọi phiếu, ảnh, hồ sơ, vị trí) ---------- */
  G.ghimHop = (ctx) => G.hop('📌 Đưa vào họp', '<div id="f"></div><button class="nut chinh rong" id="l">Đưa vào họp tuần</button>', (o, dong) => {
    const lay = G.form(o.querySelector('#f'), [{ nhan: ctx.tieuDe ? 'Từ: ' + ctx.tieuDe : 'Ghi ngay khi thấy, lúc họp không phải viết lại.', loai: 'ghichu' },
      { k: 'nd', nhan: 'Nội dung cần nói trong họp', loai: 'mota', bb: true, gt: ctx.goiY || '' }, { k: 'doi', nhan: 'Liên quan', loai: 'chips', ds: ['Đội cơ động', 'Đội khu vực', 'Nhà thầu chung', 'Nội bộ'] }, { k: 'anh', nhan: 'Ảnh', loai: 'anh', toiDa: 3, gt: ctx.anh }]);
    o.querySelector('#l').onclick = (e) => chay(async () => {
      const v = lay(); await API.goi('ghi', { bang: 'DuaVaoHop', dong: { 'Mã': G.ma('GH'), 'Ngày': '', 'Loại': ctx.loai || 'Ghi chú', 'Liên kết': ctx.link || location.hash, 'Tiêu đề': ctx.tieuDe || '', 'Nội dung': v.nd, 'Đội': v.doi || '', 'Ảnh': v.anh, 'Trạng thái': 'Chờ họp', 'Xử lý': '', 'Người ghi': '' } });
      dong(); bao('Đã đưa vào họp tuần');
    }, e.target);
  });
  G.baoKhoKhan = (ctx) => G.hop('⚠ Báo khó khăn', '<div id="f"></div><button class="nut chinh rong" id="l">Gửi ngay</button>', (o, dong) => {
    const lay = G.form(o.querySelector('#f'), [{ nhan: (ctx.tieuDe ? 'Việc: ' + ctx.tieuDe + '. ' : '') + 'Báo ngay khi xảy ra. Tự đưa vào mục V. Khó khăn của biên bản họp.', loai: 'ghichu' },
      { k: 'loai', nhan: 'Loại', loai: 'chips', ds: ['Thiếu vật tư', 'Máy hỏng', 'Thiếu người', 'Thời tiết', 'Khách, bộ phận khác', 'Khác'], bb: true }, { k: 'mt', nhan: 'Mô tả', loai: 'mota', bb: true }, { k: 'anh', nhan: 'Ảnh (không bắt buộc)', loai: 'anh', toiDa: 3 }]);
    o.querySelector('#l').onclick = (e) => chay(async () => {
      const v = lay(); await API.goi('ghi', { bang: 'KhoKhan', dong: { 'Mã': G.ma('KK'), 'Ngày': '', 'Loại': v.loai, 'Mô tả': v.mt, 'Liên kết': ctx.link || location.hash, 'Việc': ctx.tieuDe || '', 'Đội': S.u.doi || S.u.nhom, 'Ảnh': v.anh, 'Trạng thái': 'Mới', 'Người báo': '', 'Giờ ghi': '' } });
      dong(); bao('Đã báo khó khăn · anh Vũ thấy ngay');
    }, e.target);
  });
  /* tự gắn hai nút vào cuối mọi cửa sổ chi tiết (phiếu, hồ sơ, ảnh, vị trí) */
  const BO_QUA = /^(Xác nhận|Tạo mới|Thông báo|📌|⚠|Chọn|Cài đặt|Tìm|Bắt đầu|Kết thúc|Lưu|Điểm danh|Đề thi|Ghi |Sửa)/;
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => {
    if (n.nodeType !== 1 || !n.classList || !n.classList.contains('lop-phu') || !S.u) return;
    const tt = (n.querySelector('.hop-dau h2') || {}).textContent || ''; const than = n.querySelector('.hop-than');
    if (!than || BO_QUA.test(tt) || than.querySelector('#f') || than.querySelector('.ds2') || than.querySelector('textarea, input[type=text]')) return;
    setTimeout(() => {
      if (than.querySelector('.chan-hop')) return;
      const c = G.h(`<div class="chan-hop">${G.laAnhVu() ? '<button type="button" class="nut" data-gh>📌 Đưa vào họp</button>' : ''}<button type="button" class="nut" data-kk>⚠ Báo khó khăn</button></div>`);
      than.appendChild(c);
      const anh = [...than.querySelectorAll('img.anh-xem')].slice(0, 3).map((i) => i.src);
      const gh = c.querySelector('[data-gh]'); if (gh) gh.onclick = () => G.ghimHop({ loai: 'Từ hồ sơ', tieuDe: tt, anh: [] , goiY: '' , link: location.hash, anhGoc: anh });
      c.querySelector('[data-kk]').onclick = () => G.baoKhoKhan({ tieuDe: tt, link: location.hash });
    }, 60);
  }))).observe(document.body, { childList: true });
  /* ảnh phóng to: nút 📌 */
  const phongGoc = G.phongAnh;
  if (phongGoc) G.phongAnh = (src) => { phongGoc(src); if (!G.laAnhVu()) return; setTimeout(() => { const l = [...document.querySelectorAll('.xem-anh, .lop-phu')].pop(); if (!l || l.querySelector('.ghim-anh')) return; const b = G.h('<button class="nut chanh ghim-anh" style="position:fixed;bottom:24px;right:24px;z-index:99">📌 Đưa vào họp</button>'); b.onclick = (e) => { e.stopPropagation(); G.ghimHop({ loai: 'Ảnh', tieuDe: 'Ảnh hiện trường', anh: [src] }); }; l.appendChild(b); }, 50); };

  /* ---------- Nhắc nhở (anh nhập từ Zalo bộ phận khác; đội được giao thấy và cập nhật) ---------- */
  G.moNhacNho = (cu) => G.hop(cu ? 'Sửa nhắc nhở' : '📣 Nhắc nhở mới', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu và giao</button>', (o, dong) => {
    const lay = G.form(o.querySelector('#f'), [{ k: 'nguon', nhan: 'Nguồn (bộ phận nhắc)', loai: 'chips', ds: (S.dm.boPhan || []).concat(['GM', 'Khách', 'Khác']), bb: true },
      { k: 'nd', nhan: 'Nội dung nhắc nhở', loai: 'mota', bb: true }, { k: 'anh', nhan: 'Ảnh (không bắt buộc)', loai: 'anh', toiDa: 3 }, { k: 'doi', nhan: 'Giao đội', loai: 'chips', ds: ['Đội cơ động', 'Đội khu vực', 'Nội bộ', 'Mai Hòa Pháp'], bb: true },
      { k: 'han', nhan: 'Hạn xử lý', loai: 'ngay', gt: G.congNgay(hn(), 1) }]);
    o.querySelector('#l').onclick = (e) => chay(async () => {
      const v = lay(); await API.goi('ghi', { bang: 'NhacNho', dong: { 'Mã': G.ma('NN'), 'Ngày': '', 'Nguồn': v.nguon, 'Nội dung': v.nd, 'Ảnh': v.anh, 'Giao đội': v.doi, 'Hạn': v.han, 'Trạng thái': 'Mới', 'Xử lý': '', 'Ảnh xử lý': '', 'Người ghi': '', 'Giờ ghi': '' } });
      dong(); bao('Đã giao · đội ' + v.doi + ' thấy ngay trên app'); if (location.hash.startsWith('#/nhacnho')) G.taiLai();
    }, e.target);
  });
  G.man.nhacnho = { ten: 'Nhắc nhở', ic: 'bao', bt: '📣', nhom: 'Kế hoạch', ph: 'homnay', fn: async () => {
    const m = G.khung('Nhắc nhở', 'Từ bộ phận khác (Zalo) · đội được giao cập nhật', '#/');
    const ds = (await G.doc('NhacNho', null, 500)).reverse(); const anh = G.laAnhVu();
    const cuaToi = (x) => anh || x['Giao đội'] === S.u.doi || x['Giao đội'] === S.u.ten || (S.u.nhom === 'Nhân viên nội bộ' && x['Giao đội'] === 'Nội bộ') || S.u.nhom === 'Quản lý nhà thầu';
    const mo = ds.filter((x) => cuaToi(x) && !/Đã xong|Bỏ/.test(x['Trạng thái'])); const xong = ds.filter((x) => cuaToi(x) && /Đã xong|Bỏ/.test(x['Trạng thái']));
    const the = (x) => `<div class="the ${x['Hạn'] && x['Hạn'] < hn() && !/Đã xong/.test(x['Trạng thái']) ? 'the-do' : 'the-mo'}"><div class="hang"><div class="gian"><b>${esc(x['Nội dung'])}</b><div class="mo">${esc(x['Nguồn'])} · ${G.ngayVN(x['Ngày'])} → ${esc(x['Giao đội'])}${x['Hạn'] ? ' · hạn ' + G.ngayVN(x['Hạn']).slice(0, 5) : ''}</div></div><span class="chip ${/Đã xong/.test(x['Trạng thái']) ? 'xanh' : 'cam'}">${esc(x['Trạng thái'])}</span></div>
      ${x['Ảnh'] ? `<div>${G.xemAnh(x['Ảnh'])}</div>` : ''}${x['Xử lý'] ? `<p class="mo" style="margin:6px 0 0">Xử lý: ${esc(x['Xử lý'])}</p>${G.xemAnh(x['Ảnh xử lý'])}` : ''}
      ${!/Đã xong|Bỏ/.test(x['Trạng thái']) && (anh || q('homnay') >= 2) ? `<div class="nhom-nut" style="margin-top:8px">${!anh ? `<button class="nut nho" data-dang="${esc(x['Mã'])}">Đang xử lý</button><button class="nut nho chinh" data-xong="${esc(x['Mã'])}">Báo đã xong</button>` : `<button class="nut nho" data-bo="${esc(x['Mã'])}">Bỏ</button><button class="nut nho chinh" data-xong="${esc(x['Mã'])}">Đã xong</button>`}</div>` : ''}</div>`;
    m.innerHTML = (anh ? '<button class="nut chinh rong" id="moi" style="margin-bottom:12px">＋ Nhắc nhở mới</button>' : '') + `<h3 class="tieu-nhom">Đang mở (${mo.length})</h3>` + (mo.map(the).join('') || G.trong('Không có nhắc nhở đang mở.'))
      + (xong.length ? `<h3 class="tieu-nhom">Đã xử lý</h3>${xong.slice(0, 30).map(the).join('')}` : '');
    const nm = m.querySelector('#moi'); if (nm) nm.onclick = () => G.moNhacNho();
    const doi = (ma, tt) => G.hop(tt, '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'xl', nhan: 'Đã làm gì', loai: 'mota', bb: tt !== 'Đang xử lý' }, { k: 'anh', nhan: 'Ảnh', loai: 'anh', toiDa: 3 }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('sua', { bang: 'NhacNho', khoa: { 'Mã': ma }, doi: { 'Trạng thái': tt, 'Xử lý': v.xl, 'Ảnh xử lý': (v.anh || []).join(' | '), 'Người xử lý': S.u.ten, 'Giờ xử lý': API.bayGio() } }); dong(); bao('Đã cập nhật'); G.taiLai(); }, e.target);
    });
    m.querySelectorAll('[data-dang]').forEach((b) => { b.onclick = () => doi(b.dataset.dang, 'Đang xử lý'); });
    m.querySelectorAll('[data-xong]').forEach((b) => { b.onclick = () => doi(b.dataset.xong, 'Đã xong'); });
    m.querySelectorAll('[data-bo]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('sua', { bang: 'NhacNho', khoa: { 'Mã': b.dataset.bo }, doi: { 'Trạng thái': 'Bỏ' } }); G.taiLai(); }); });
  } };

  /* ---------- phân quyền theo đầu việc (anh sửa) ---------- */
  G.man.quyenviec = { ten: 'Phân quyền theo đầu việc', ic: 'phan_quyen', bt: '🔐', nhom: 'Quản trị', ph: 'danhmuc', cap: 3, fn: async () => {
    const m = G.khung('Phân quyền theo đầu việc', 'GreenLog_PhanQuyen · anh luôn thấy và duyệt tất cả', '#/them');
    const rieng = await G.doc('PhanQuyenViec');
    const ten = (ma) => (S.dm.dauviec.find((v) => v.ma === ma) || {}).ten || { CN01: 'Điểm danh, duyệt công', CN02: 'Danh sách công nhân', CN03: 'Bảng công tháng', CN04: 'Vận chuyển', CN05: 'Phiếu giao việc / phiếu yêu cầu', CN06: 'Việc phát sinh', CN07: 'Phun thuốc, bón phân', CN08: 'Dịch hại', CN09: 'Sổ trồng cây', CN10: 'Bất thường cây nội thất', CN11: 'Dự án', CN12: 'Sự kiện' }[ma] || ma;
    const gt = (ma, c) => { const r = rieng.find((x) => x['Mã'] === ma && x['Cột'] === String(c)); return r ? r['Cấp'] : QV[ma][c]; };
    m.innerHTML = `<p class="mo">"Không thấy" = ẩn hẳn ở menu, Hôm nay, Lịch, tìm kiếm, tin nhắc, báo cáo; máy chủ cũng chặn. Chạm ô để đổi.</p><div class="the cuon-ngang"><table class="bang matran-quyen"><tr><th>Mã</th><th>Đầu việc</th>${G.QV_COT.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>
      ${Object.keys(QV).map((ma) => `<tr><td>${ma}</td><td>${esc(ten(ma))}</td>${[0, 1, 2, 3].map((c) => `<td><select data-ma="${ma}" data-c="${c}">${[K, X, W].map((v) => `<option ${gt(ma, c) === v ? 'selected' : ''}>${v}</option>`).join('')}</select></td>`).join('')}</tr>`).join('')}</table></div>`;
    m.querySelectorAll('select').forEach((s) => { s.onchange = () => chay(async () => { await API.goi('ghiNhieu', { bang: 'PhanQuyenViec', thay: ['Mã', 'Cột'], dong: [{ 'Mã': s.dataset.ma, 'Cột': s.dataset.c, 'Cấp': s.value, 'Người sửa': S.u.ten, 'Giờ sửa': API.bayGio() }] }); await G.boSungDM(); bao('Đã lưu quyền'); }); });
  } };

  /* ---------- dữ liệu mẫu cho chế độ chạy thử (để xem Tổng quan có số) ---------- */
  G.ANH_MAU = 'img/hoso/cover_aerial.jpg';
  G.LOGO = '<svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true"><g fill="none" stroke="#123524" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M24 40V24"/><path d="M24 29c-7 0-11-4-11-11 7 0 11 4 11 11z"/><path d="M24 24c0-9 5-14 14-14 0 9-5 14-14 14z" fill="#123524"/><path d="M27.5 18.5l2.5 2.5 4.5-5.5" stroke="#C9E265" stroke-width="2.4"/><ellipse cx="24" cy="41.5" rx="9" ry="2.5"/></g></svg>';
  G.napMau = function () {
    const tb = (k) => LS.get('tb_' + k, []); const luu = (k, v) => LS.set('tb_' + k, v);
    if (LS.get('mau04')) return; LS.set('mau04', 1);
    const r = (a, b) => Math.round(a + Math.random() * (b - a)); const z = (n) => String(n).padStart(2, '0');
    const ngayDs = []; for (let i = 75; i >= 1; i--) ngayDs.push(API.ngay(new Date(Date.now() - i * 864e5)));
    const dh = [], co = [], th = [], vs = [], vu = [], vc = [], pb = [], pbct = [], st = [];
    let c1 = 15230, c2 = 48810; const vr = ['Vị Thanh', 'Vị Chua', 'Vị Ngọt', 'Vị Nhà', 'Nhà Nấm', 'Vị Thơm', 'Vị Cay'];
    ngayDs.forEach((d, i) => {
      c1 += r(7, 14); c2 += r(24, 40);
      dh.push({ 'Ngày': d, 'Mã đồng hồ': 'DH01', 'Chỉ số': String(c1), 'Người đọc': 'Phạm Nhật Trường' }, { 'Ngày': d, 'Mã đồng hồ': 'DH02', 'Chỉ số': String(c2), 'Người đọc': 'Phạm Nhật Trường' });
      if (i % 3 === 0) co.push({ 'Ngày': d, 'Phân compost tuần hoàn (kg)': String(r(30, 70)), 'Ghi chú': 'Bón vườn rau, chậu nội thất', 'Người ghi': 'Nguyễn Tấn Hiệp' });
      th.push({ 'Ngày': d, 'Vườn': vr[i % 7], 'Tên cây': ['Rau muống', 'Cải xanh', 'Húng quế', 'Nấm bào ngư', 'Ớt', 'Rau thơm'][i % 6], 'kg': String(r(3, 12)), 'Bộ phận nhận': ['Bếp', 'Bếp', 'Bar', 'Nhà hàng'][i % 4], 'Ghi chú': i % 4 < 2 ? ['Bếp nóng', 'Bếp lạnh'][i % 2] : '', 'Người ghi': 'Lê Hữu Nghị' });
      vs.push({ 'Ngày': d, 'Buổi': 'Sáng', 'kg rác': String(r(15, 60)), 'Người ghi': 'Nguyễn Tấn Hiệp' }, { 'Ngày': d, 'Buổi': 'Chiều', 'kg rác': String(r(10, 40)), 'Người ghi': 'Lê Hữu Nghị' });
      if (i % 7 === 2) vu.push({ 'Ngày': d, 'Vườn ươm': 'Vườn ươm sân vườn', 'Loại ghi': 'Ươm vào', 'Việc': 'Ươm vào', 'Tên cây': ['Dứa vàng', 'Huỳnh Anh', 'Hồng Lộc', 'Chuỗi Ngọc'][i % 4], 'Số lượng': String(r(60, 200)), 'ĐVT': 'Bầu', 'Chất cải tạo đất hữu cơ (bao)': String(r(2, 6)), 'Người ghi': 'Trương Thị Men' });
      if (i % 7 === 5) vu.push({ 'Ngày': d, 'Vườn ươm': 'Vườn ươm sân vườn', 'Loại ghi': 'Xuất vườn', 'Việc': 'Xuất vườn', 'Tên cây': ['Dứa vàng', 'Huỳnh Anh'][i % 2], 'Số lượng': String(r(30, 90)), 'ĐVT': 'Bầu', 'Xuất đi': 'Villa 32 · mặt sau', 'Người ghi': 'Trương Thị Men' });
      ['Đội khu vực', 'Đội cơ động'].forEach((doi) => { vc.push({ 'Ngày': d, 'Đội': doi, 'Loại hàng': 'Rác cắt tỉa (cành, lá, cỏ)', 'Nhóm': 'Rác cắt tỉa', 'Số chuyến': String(r(2, 6)), 'Người ghi': doi === 'Đội khu vực' ? 'Phạm Nhật Trường' : 'Phan Văn Thìn', 'Giờ ghi': d + ' 17:20:00' }, { 'Ngày': d, 'Đội': doi, 'Loại hàng': 'Đất, cát, phân', 'Nhóm': 'Khác', 'Số chuyến': String(r(0, 2)), 'Người ghi': 'Phan Văn Thìn', 'Giờ ghi': d + ' 17:20:00' }); });
      if (i % 6 === 1) { const ma = 'NK' + d.replace(/-/g, '').slice(2) + '-001'; pb.push({ 'Mã NK': ma, 'Ngày giờ': d + ' 06:00', 'Loại (Phun thuốc/Phun phân bón lá/Bón gốc)': 'Phun thuốc', 'Mục đích': 'Trị', 'Nhóm cây': 'Cây bụi / hoa', 'Cụm': 'Villa 49 - 80', 'Số bình 16L': '8', 'Người phun': 'Nguyễn Văn Lâm', 'Hết cách ly': G.congNgay(d, 7), 'Cách ly dài nhất (ngày)': '7' });
        pbct.push({ 'Mã NK': ma, 'STT': '1', 'Sản phẩm': 'Movento 150OD', 'Liều / bình': '16', 'ĐVT': 'ml', 'Tổng lượng': '128' }, { 'Mã NK': ma, 'STT': '2', 'Sản phẩm': 'Closer 500WG', 'Liều / bình': '4', 'ĐVT': 'g', 'Tổng lượng': '32' }); }
      if (i % 10 === 4) { const ma = 'NK' + d.replace(/-/g, '').slice(2) + '-002'; pb.push({ 'Mã NK': ma, 'Ngày giờ': d + ' 07:00', 'Loại (Phun thuốc/Phun phân bón lá/Bón gốc)': 'Bón gốc', 'Nhóm cây': 'Cỏ', 'Cụm': 'Hotel', 'Người phun': 'Trần Công Thuận' });
        pbct.push({ 'Mã NK': ma, 'STT': '1', 'Sản phẩm': 'Phân NPK 16-16-8+TE', 'ĐVT': 'kg', 'Tổng lượng': String(r(50, 120)) }); }
      if (i % 9 === 3) { const ma = 'NK' + d.replace(/-/g, '').slice(2) + '-003'; pb.push({ 'Mã NK': ma, 'Ngày giờ': d + ' 06:30', 'Loại (Phun thuốc/Phun phân bón lá/Bón gốc)': 'Phun phân bón lá', 'Nhóm cây': 'Cây bụi / hoa', 'Cụm': 'Residences', 'Số bình 16L': '6', 'Người phun': 'Trần Công Thuận' });
        pbct.push({ 'Mã NK': ma, 'STT': '1', 'Sản phẩm': 'Atonik 1.8SL', 'Liều / bình': '10', 'ĐVT': 'ml', 'Tổng lượng': '60' }); }
      if (i % 11 === 6) st.push({ 'STT': String(st.length + 1), 'Thời gian': d, 'Khu vực': 'Villa 32', 'Mã vị trí': '', 'Hình thức': 'Trồng dặm', 'Nguồn cây': 'Tự ươm', 'Tên cây': 'Dứa vàng', 'ĐVT': 'Bụi', 'Số lượng': String(r(20, 60)), 'Chất cải tạo đất hữu cơ (bao)': String(r(2, 8)), 'Người ghi': 'Phạm Nhật Trường' });
    });
    luu('DongHoNuoc', tb('DongHoNuoc').concat(dh)); luu('PhanCompost', tb('PhanCompost').concat(co)); luu('ThuHoach', tb('ThuHoach').concat(th)); luu('VeSinhBien', tb('VeSinhBien').concat(vs));
    luu('VuonUom', tb('VuonUom').concat(vu)); luu('VanChuyen', tb('VanChuyen').concat(vc)); luu('NhatKyPhunBon', tb('NhatKyPhunBon').concat(pb)); luu('NhatKyPhunBonChiTiet', tb('NhatKyPhunBonChiTiet').concat(pbct)); luu('SoTrongCay', tb('SoTrongCay').concat(st));
    // tiến độ định kỳ kỳ này
    const k = API.ky(hn()); const vt = (G.S.dm ? G.S.dm.vitri : []).filter((v) => v.ap === 'Có'); const tk = tb('TickDinhKy');
    [['DV01', 0.42], ['DV02', 0.3], ['DV03', 0.22], ['DV04', 0.18], ['DV05', 0.15], ['DV06', 0.08], ['DV07', 0.1], ['DV08', 0.35]].forEach(([ma, p]) => {
      vt.slice(0, Math.round(vt.length * p)).forEach((v, i) => { const d = G.congNgay(k.tu, i % Math.max(1, Math.round((new Date(hn()) - new Date(k.tu)) / 864e5))); tk.push({ 'Ngày': d, 'Kỳ': k.ten, 'Mã việc': ma, 'Mã vị trí': v.ma, 'Lần': '1', 'Trạng thái': 'Xong', 'Bắt đầu': d, 'Ngày xong': d, 'Số ngày': '1', 'Người tick': 'Phan Văn Thìn', 'Giờ tick': d + ' 10:00:00' }); });
    });
    luu('TickDinhKy', tk);
    // điểm danh sáng hôm nay: 29/31
    const cn = (G.S.dm ? G.S.dm.congnhan : []).filter((x) => x.tt !== 'Đã nghỉ'); const dd = tb('DiemDanh'); const vang = ['CN19', 'CN33'];
    cn.forEach((x) => dd.push({ 'Ngày': hn(), 'Buổi': 'Sáng', 'Mã CN': x.ma, 'Họ tên': x.ten, 'Đội': x.doi, 'Trạng thái (Có mặt/Vắng/Về sớm)': vang.includes(x.ma) ? 'Vắng' : 'Có mặt', 'Lý do': vang.includes(x.ma) ? 'Nghỉ phép' : '', 'Công': vang.includes(x.ma) ? '0' : '0.5', 'Người ghi': x.doi === 'Đội cơ động' ? 'Phan Văn Thìn' : x.doi === 'Quản lý nhà thầu' || /Quản lý/.test(x.cd || '') ? x.ten : 'Phạm Nhật Trường', 'Giờ ghi': hn() + ' 06:40:00', 'Trạng thái duyệt': 'Chờ duyệt' }));
    luu('DiemDanh', dd);
    luu('DuyetCong', tb('DuyetCong').concat([{ 'Ngày': hn(), 'Buổi': 'Sáng', 'Đội': 'Đội cơ động', 'Người gửi': 'Phan Văn Thìn', 'Giờ gửi': hn() + ' 06:40:00', 'Khóa': 'Không', 'Ảnh tập thể': G.ANH_MAU }, { 'Ngày': hn(), 'Buổi': 'Sáng', 'Đội': 'Đội khu vực', 'Người gửi': 'Phạm Nhật Trường', 'Giờ gửi': hn() + ' 06:45:00', 'Khóa': 'Không' }, { 'Ngày': hn(), 'Buổi': 'Sáng', 'Đội': 'Quản lý nhà thầu', 'Người gửi': 'Mai Hòa Pháp', 'Giờ gửi': hn() + ' 07:05:00', 'Khóa': 'Không' }]));
    luu('KhuPhuTrach', [['Hotel', 'CN04'], ['Hotel', 'CN07'], ['Aura', 'CN09'], ['Residences', 'CN10'], ['Residences', 'CN11'], ['Villa 1 - 14', 'CN13'], ['Villa 1 - 14', 'CN14'], ['Villa 15 - 24', 'CN15'], ['Villa 15 - 24', 'CN18'], ['Villa 25 - 48', 'CN19'], ['Villa 25 - 48', 'CN20'], ['Villa 49 - 80', 'CN21'], ['Villa 49 - 80', 'CN23'], ['Villa 49 - 80', 'CN25'], ['Villa 49 - 80', 'CN26'], ['Islander', 'CN27'], ['Public', 'CN28']].map(([c, m]) => ({ 'Cụm': c, 'Mã CN': m, 'Người ghi': 'Lê Vũ' })));
    // phiếu, dịch hại, phát sinh, sự kiện, dự án, cây nội thất bất thường, nhắc nhở
    luu('Phieu', tb('Phieu').concat([
      { 'Mã phiếu': 'P261124-001', 'Loại': 'Lỗi', 'Nguồn': 'Anh Vũ kiểm tra', 'Nhóm lỗi': 'Tưới', 'Loại lỗi': 'Vỡ ống tưới', 'Mức độ': 'Cao', 'Mã vị trí': 'VT001', 'Mô tả': 'Vỡ ống tưới V52 mặt sau', 'Giao cho': 'Đội khu vực', 'Người tạo': 'Lê Vũ', 'Giờ tạo': hn() + ' 07:10:00', 'Hạn': hn() + ' 16:00', 'Trạng thái': 'Báo xong', 'Số lần trả lại': '0' },
      { 'Mã phiếu': 'P261124-002', 'Loại': 'Lỗi', 'Nguồn': 'Nhân viên tự phát hiện', 'Nhóm lỗi': 'An toàn', 'Loại lỗi': 'Cây đổ lối đi', 'Mức độ': 'Khẩn cấp', 'Vị trí khác': 'Đường N4', 'Mô tả': 'Cây đổ lối đi N4', 'Giao cho': 'Đội cơ động', 'Người tạo': 'Phan Văn Thìn', 'Giờ tạo': hn() + ' 05:50:00', 'Hạn': hn() + ' 07:50', 'Trạng thái': 'Đang xử lý', 'Số lần trả lại': '0' }]));
    luu('DichHai', tb('DichHai').concat([{ 'Mã DH': 'DH261118-001', 'Ngày phát hiện': G.congNgay(hn(), -6), 'Cụm': 'Villa 49 - 80', 'Mã vị trí': '', 'Vị trí chi tiết': 'Villa 49–56 hàng rào', 'Loại dịch hại': 'Rệp sáp', 'Tên cây': 'Hồng Lộc', 'Nhóm cây': 'Cây bụi', 'Phạm vi (Vài cây/Một mảng/Cả khu vực)': 'Một mảng', 'Mức độ': 'Trung bình', 'Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)': 'Đang xử lý', 'Người báo': 'Phan Văn Thìn' }]));
    luu('ViecPhatSinh', tb('ViecPhatSinh').concat([{ 'Mã PS': 'PS261124-001', 'Ngày': hn(), 'Loại việc': 'Hỗ trợ bộ phận khác', 'Mô tả': 'Khiêng chậu cho F&B', 'Vị trí khác': 'Aura', 'Số người': '3', 'Hỗ trợ': 'F&B', 'Bắt đầu': hn() + ' 08:00:00', 'Kết thúc': hn() + ' 10:00:00', 'Số giờ': '2', 'Trạng thái': 'Xong', 'Người ghi': 'Phạm Nhật Trường' }]));
    luu('SuKien', tb('SuKien').concat([{ 'Mã SK': 'SK1', 'Tên': 'Tiệc cưới Aura', 'Loại': 'Tiệc cưới', 'Bắt đầu': G.congNgay(hn(), 3) + ' 17:00', 'Vị trí khác': 'Bãi cỏ Aura', 'Đội phụ trách': 'Đội khu vực', 'Trạng thái': 'Sắp diễn ra' }]));
    luu('DuAn', tb('DuAn').concat([{ 'Mã DA': 'DA1', 'Tên': 'Cải tạo sau villa (dứa vàng)', 'Loại': 'Cải tạo', 'Mã vị trí': '', 'Bắt đầu': G.congNgay(hn(), -20), 'Kết thúc': G.congNgay(hn(), 10), 'Trạng thái': 'Đang làm', 'Tiến độ (%)': '62' }]));
    luu('BatThuong', tb('BatThuong').concat([{ 'Mã BT': 'BT1', 'Ngày': G.congNgay(hn(), -1), 'Mã điểm': 'NT02', 'Mã vị trí': 'NT02', 'Tên cây': 'Kim Tiền', 'Tình trạng': 'Vàng lá', 'Ghi chú': 'Chậu cạnh quầy lễ tân, 3 lá vàng', 'Người báo': 'Nguyễn Tấn Hiệp', 'Trạng thái': 'Đang mở' }]));
    luu('NhacNho', tb('NhacNho').concat([{ 'Mã': 'NN1', 'Ngày': hn(), 'Nguồn': 'Housekeeping', 'Nội dung': 'Lá rụng nhiều trước Villa 18, khách phàn nàn', 'Giao đội': 'Đội khu vực', 'Hạn': hn(), 'Trạng thái': 'Mới', 'Người ghi': 'Lê Vũ' }]));
  };

})();
