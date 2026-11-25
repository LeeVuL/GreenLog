/* GreenLog 0.4.2 · mục 72: báo cáo riêng cho TỪNG loại việc (chọn kỳ, tóm tắt, bảng, xuất Excel/PDF/ảnh) + báo cáo đào tạo gọn */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc } = G;
  const hn = () => API.ngay(); const so = (n, k) => G.so(Math.round((+n || 0) * 10) / 10, k == null ? 1 : k);
  const num = (v) => +String(v == null ? '' : v).replace(',', '.') || 0;
  const cong = (ds, c) => ds.reduce((a, r) => a + num(r[c]), 0);
  const dem = (ds, f) => { const o = {}; ds.forEach((r) => { const k = f(r) || '—'; o[k] = (o[k] || 0) + 1; }); return o; };
  const tong = (ds, f, g) => { const o = {}; ds.forEach((r) => { const k = f(r) || '—'; o[k] = (o[k] || 0) + g(r); }); return o; };
  const bangNho = (o, a, b, dv) => `<table class="bang"><tr><th>${esc(a)}</th><th>${esc(b)}</th></tr>${Object.keys(o).sort((x, y) => o[y] - o[x]).map((k) => `<tr><td>${esc(k)}</td><td>${so(o[k])}${dv ? ' ' + dv : ''}</td></tr>`).join('')}</table>`;
  const phut = (a, b) => { const p = (s) => { const x = String(s || '').match(/(\d{1,2}):(\d{2})/); return x ? +x[1] * 60 + +x[2] : null; }; const x = p(a), y = p(b); return x != null && y != null ? Math.max(0, y - x) : 0; };
  const loaiPB = 'Loại (Phun thuốc/Phun phân bón lá/Bón gốc)';
  const dvTen = (ma) => (G.dvTen ? G.dvTen(ma) : ma);

  /* k, tên, nhóm, bảng, cột ngày, lọc, chỉ số (ds) → [[nhãn, giá trị]], phần thêm (ds) → html, link màn ghi */
  const BC = [
    { k: 'tuoi', ten: 'Tưới nước sân vườn', nhom: 'Hằng ngày', bang: 'Tuoi', cs: (d) => [['Lượt ghi', d.length], ['Vị trí đã tưới', new Set(d.filter((r) => /Đã tưới|Xong/.test(r['Trạng thái'] || 'Đã tưới')).map((r) => r['Mã vị trí'])).size], ['Ngày mưa (không tưới)', new Set(d.filter((r) => r['Hôm nay mưa']).map((r) => r['Ngày'])).size]], them: (d) => bangNho(dem(d, (r) => r['Trạng thái']), 'Trạng thái', 'Lượt') },
    { k: 'cum/DV10', ten: 'Vệ sinh theo cụm', nhom: 'Hằng ngày', bang: 'ViecHangNgay', loc: { 'Mã việc': 'DV10' }, cs: (d) => [['Lượt ghi', d.length], ['Ngày có làm', new Set(d.map((r) => r['Ngày'])).size]], them: (d) => bangNho(dem(d, (r) => r['Cụm']), 'Cụm', 'Số ngày') },
    { k: 'cum/DV11', ten: 'Nhổ cỏ dại', nhom: 'Hằng ngày', bang: 'ViecHangNgay', loc: { 'Mã việc': 'DV11' }, cs: (d) => [['Lượt ghi', d.length], ['Ngày có làm', new Set(d.map((r) => r['Ngày'])).size]], them: (d) => bangNho(dem(d, (r) => r['Cụm']), 'Cụm', 'Số ngày') },
    { k: 'phunthuoc', ten: 'Phun thuốc BVTV', nhom: 'Phun, bón', bang: 'NhatKyPhunBon', ngay: 'Ngày giờ', loc: { [loaiPB]: 'Phun thuốc' }, ct: true, cs: (d, ct) => [['Lần phun', d.length], ['Số bình', cong(d, 'Số bình')], ['Sản phẩm khác nhau', new Set(ct.map((r) => r['Sản phẩm'])).size]], them: (d, ct) => bangNho(tong(ct, (r) => r['Sản phẩm'] + ' (' + (r['ĐVT'] || '') + ')', (r) => num(r['Tổng lượng'])), 'Sản phẩm', 'Tổng lượng') },
    { k: 'phunla', ten: 'Phun phân bón lá', nhom: 'Phun, bón', bang: 'NhatKyPhunBon', ngay: 'Ngày giờ', loc: { [loaiPB]: 'Phun phân bón lá' }, ct: true, cs: (d, ct) => [['Lần phun', d.length], ['Số bình', cong(d, 'Số bình')]], them: (d, ct) => bangNho(tong(ct, (r) => r['Sản phẩm'] + ' (' + (r['ĐVT'] || '') + ')', (r) => num(r['Tổng lượng'])), 'Sản phẩm', 'Tổng lượng') },
    { k: 'bongoc', ten: 'Bón phân gốc', nhom: 'Phun, bón', bang: 'NhatKyPhunBon', ngay: 'Ngày giờ', loc: { [loaiPB]: 'Bón gốc' }, ct: true, cs: (d) => [['Lần bón', d.length]], them: (d, ct) => bangNho(tong(ct, (r) => r['Sản phẩm'] + ' (' + (r['ĐVT'] || 'kg') + ')', (r) => num(r['Tổng lượng'])), 'Loại phân', 'Khối lượng') },
    { k: 'dinhky', ten: 'Việc định kỳ (theo vị trí)', nhom: 'Định kỳ', bang: 'TickDinhKy', cs: (d) => [['Lượt hoàn thành', d.length], ['Vị trí', new Set(d.map((r) => r['Mã vị trí'])).size]], them: (d) => bangNho(dem(d, (r) => dvTen(r['Mã việc'])), 'Việc', 'Lượt') },
    { k: 'vanchuyen', gt: (r) => num(r['Số chuyến']), dvt: 'chuyến', ten: 'Vận chuyển', nhom: 'Hằng ngày', bang: 'VanChuyen', cs: (d) => [['Tổng chuyến', cong(d, 'Số chuyến')], ['Trong đó rác cắt tỉa', cong(d.filter((r) => r['Nhóm'] === 'Rác cắt tỉa'), 'Số chuyến')]], them: (d) => bangNho(tong(d, (r) => r['Nhóm'] || r['Loại hàng'], (r) => num(r['Số chuyến'])), 'Nhóm hàng', 'Chuyến') },
    { k: 'phatsinh', ten: 'Việc phát sinh, làm thêm', nhom: 'Hằng ngày', bang: 'ViecPhatSinh', cs: (d) => [['Số việc', d.length], ['Tổng giờ', cong(d, 'Số giờ')], ['Hỗ trợ bộ phận khác', d.filter((r) => /Hỗ trợ/.test(r['Loại việc'] || '')).length]], them: (d) => bangNho(dem(d, (r) => r['Loại việc']), 'Loại việc', 'Số việc') + bangNho(dem(d.filter((r) => r['Hỗ trợ']), (r) => r['Hỗ trợ']), 'Bộ phận được hỗ trợ', 'Lần') },
    { k: 'donghonuoc', ten: 'Đồng hồ nước', nhom: 'Hằng ngày', bang: 'DongHoNuoc', cs: (d) => { const m = (ma) => d.filter((r) => r['Mã đồng hồ'] === ma); const c = (a) => Math.round(Object.values(G.dungNuoc(a)).reduce((x, y) => x + y, 0) * 100) / 100; /* mục 94 */ const t1 = c(m('DH01')), t2 = c(m('DH02'));
      return [['Tổng nước tưới (m³)', so(t2, 0)], ['Tái sử dụng (m³)', so(t1, 0)], ['Tỷ lệ tái sử dụng', t2 ? Math.round(t1 / t2 * 100) + '%' : '—']]; } },
    { k: 'vuonuom', ten: 'Vườn ươm cây bụi', nhom: 'Vườn ươm', bang: 'VuonUom', cs: (d) => [['Đã ươm', cong(d.filter((r) => r['Loại ghi'] === 'Ươm vào'), 'Số lượng')], ['Đã xuất', cong(d.filter((r) => r['Loại ghi'] === 'Xuất vườn'), 'Số lượng')], ['Ngày chăm sóc', new Set(d.filter((r) => r['Loại ghi'] === 'Chăm sóc').map((r) => r['Ngày'])).size]], them: (d) => bangNho(tong(d.filter((r) => r['Tên cây']), (r) => r['Tên cây'] + ' · ' + r['Loại ghi'], (r) => num(r['Số lượng'])), 'Cây', 'Số lượng') },
    { k: 'nb/vuonuomnt', ten: 'Vườn ươm cây nội thất', nhom: 'Vườn ươm', bang: 'VuonUomNoiThat', cs: (d) => [['Đã ươm', cong(d.filter((r) => r['Loại ghi'] === 'Ươm vào'), 'Số lượng')], ['Đã xuất', cong(d.filter((r) => r['Loại ghi'] === 'Xuất vườn'), 'Số lượng')], ['Ngày chăm sóc', new Set(d.filter((r) => r['Loại ghi'] === 'Chăm sóc').map((r) => r['Ngày'])).size]] },
    { k: 'nb/bien', gt: (r) => num(r['kg rác']), dvt: 'kg', ten: 'Vệ sinh bãi biển', nhom: 'Bãi biển', bang: 'VeSinhBien', cs: (d) => [['Tổng rác (kg)', so(cong(d, 'kg rác'))], ['Ngày có làm', new Set(d.map((r) => r['Ngày'])).size], ['TB mỗi ngày (kg)', so(cong(d, 'kg rác') / Math.max(1, new Set(d.map((r) => r['Ngày'])).size))]], them: (d) => bangNho(tong(d, (r) => r['Buổi'], (r) => num(r['kg rác'])), 'Buổi', 'kg', '') },
    { k: 'nb/ktbien', ten: 'Kiểm tra bãi biển', nhom: 'Bãi biển', bang: 'KiemTraBien', cs: (d) => [['Lần kiểm tra', d.length], ['Lần có chỗ chưa sạch', d.filter((r) => r['Tình trạng'] && r['Tình trạng'] !== 'Sạch').length]], them: (d) => bangNho(dem(d, (r) => r['Tình trạng']), 'Tình trạng', 'Lần') },
    { k: 'nb/may', ten: 'Máy sàng cát', nhom: 'Bãi biển', bang: 'MaySangCat', cs: (d) => { const ch = d.filter((r) => r['Giờ bắt đầu']); const gio = (cong(ch, 'Số giờ') || ch.reduce((a, r) => a + phut(r['Giờ bắt đầu'], r['Giờ kết thúc']), 0) / 60);
      return [['Ngày có sàng', new Set(ch.map((r) => r['Ngày'])).size], ['Tổng giờ chạy', so(gio)], ['Ngày không sàng (có lý do)', new Set(d.filter((r) => r['Loại'] === 'Không sàng').map((r) => r['Ngày'])).size], ['Lần bảo trì', d.filter((r) => r['Bảo trì'] === 'Bảo trì định kỳ').length]]; },
      them: (d) => bangNho(dem(d.filter((r) => r['Loại'] === 'Không sàng'), (r) => r['Lý do']), 'Lý do không sàng', 'Ngày') },
    { k: 'nb/vuonrau', ten: 'Chăm sóc Vị Garden', nhom: 'Vị Garden', bang: 'VuonRau', cs: (d) => [['Lượt ghi', d.length], ['Ngày có chăm sóc', new Set(d.map((r) => r['Ngày'])).size], ['Chỉ số ngoài ngưỡng', d.filter((r) => r['Ngoài ngưỡng']).length]] },
    { k: 'nb/thuhoach', gt: (r) => num(r['kg']), dvt: 'kg', ten: 'Thu hoạch Vị Garden', nhom: 'Vị Garden', bang: 'ThuHoach', cs: (d) => [['Tổng thu hoạch (kg)', so(cong(d, 'kg'))], ['Lần thu hoạch', d.length]], them: (d) => bangNho(tong(d, (r) => r['Bộ phận nhận'] || r['Bếp nhận'], (r) => num(r['kg'])), 'Bộ phận nhận', 'kg') + bangNho(tong(d, (r) => r['Tên cây'], (r) => num(r['kg'])), 'Loại rau', 'kg') },
    { k: 'nb/noithat', gt: (r) => num(r['Số chậu tưới']), dvt: 'chậu', ten: 'Chăm sóc cây nội thất', nhom: 'Cây nội thất', bang: 'CayNoiThat', cs: (d) => [['Lượt chăm sóc', d.length], ['Tổng chậu', cong(d, 'Số chậu tưới')], ['Lần có cây bất thường', d.filter((r) => r['Bất thường'] === 'Có').length]], them: (d) => bangNho(dem(d, (r) => r['Việc']), 'Việc', 'Lượt') + bangNho(dem(d.filter((r) => r['Tên phân']), (r) => r['Tên phân']), 'Phân đã dùng', 'Lần') },
    { k: 'batthuong', ten: 'Cây nội thất bất thường', nhom: 'Cây nội thất', bang: 'BatThuong', cs: (d) => [['Số báo cáo', d.length], ['Đã đóng', d.filter((r) => r['Trạng thái'] === 'Đã đóng').length]], them: (d) => bangNho(dem(d, (r) => r['Tình trạng']), 'Tình trạng', 'Lần') + bangNho(dem(d, (r) => r['Tên cây']), 'Cây', 'Lần') },
    { k: 'nb/rac', gt: (r) => num(r['kg rác thu gom']), dvt: 'kg', ten: 'Thu gom rau củ làm compost', nhom: 'Compost', bang: 'RacHuuCo', cs: (d) => [['Tổng (kg)', so(cong(d, 'kg rác thu gom'))], ['Ngày có thu gom', new Set(d.filter((r) => num(r['kg rác thu gom'])).map((r) => r['Ngày'])).size]] },
    { k: 'nb/compost', gt: (r) => num(r['Phân compost tuần hoàn (kg)']), dvt: 'kg', ten: 'Phân compost', nhom: 'Compost', bang: 'PhanCompost', cs: (d) => [['Tổng compost (kg)', so(cong(d, 'Phân compost tuần hoàn (kg)'))]] },
    { k: 'sotrongcay', ten: 'Trồng cây', nhom: 'Cây xanh', bang: 'SoTrongCay', ngay: 'Ngày trồng', cs: (d) => [['Lần trồng', d.length], ['Số cây', cong(d, 'Số lượng')]], them: (d) => bangNho(tong(d, (r) => r['Tên cây'], (r) => num(r['Số lượng'])), 'Cây', 'Số lượng') },
    { k: 'dichhai', ten: 'Dịch hại', nhom: 'Cây xanh', bang: 'DichHai', ngay: 'Ngày phát hiện', cs: (d) => [['Hồ sơ', d.length], ['Đã đóng', d.filter((r) => /Đóng|Hết/.test(r['Trạng thái'] || '')).length]], them: (d) => bangNho(dem(d, (r) => r['Dịch hại'] || r['Tên dịch hại']), 'Dịch hại', 'Hồ sơ') },
    { k: 'tuithuoc', ten: 'Túi thuốc họ dừa', nhom: 'Cây xanh', bang: 'TuiThuocDua', cs: (d) => [['Dòng ghi', d.length]] },
    { k: 'phieu', ten: 'Phiếu giao việc', nhom: 'Quản lý', bang: 'Phieu', ngay: 'Giờ tạo', cs: (d) => [['Phiếu', d.length], ['Đã duyệt đóng', d.filter((r) => r['Trạng thái'] === 'Đã duyệt').length], ['Khẩn cấp', d.filter((r) => r['Mức độ'] === 'Khẩn cấp').length]], them: (d) => bangNho(dem(d, (r) => r['Nhóm lỗi'] || r['Loại']), 'Nhóm', 'Phiếu') + bangNho(dem(d, (r) => r['Giao cho']), 'Giao cho', 'Phiếu') },
    { k: 'ketthucca', ten: 'Kết thúc ca nội bộ', nhom: 'Quản lý', bang: 'NgayLamViec', loc: { 'Loại': 'Kết thúc ca' }, cs: (d) => [['Số ca', d.length], ['Trễ giờ', d.filter((r) => r['Đúng hạn'] === 'Trễ').length]], them: (d) => bangNho(dem(d, (r) => r['Người']), 'Người', 'Ca') },
    { k: 'hop', ten: 'Họp', nhom: 'Quản lý', bang: 'Hop', ngay: 'Bắt đầu', cs: (d) => [['Cuộc họp', d.length], ['Họp đột xuất', d.filter((r) => r['Loại'] === 'Đột xuất').length]], them: (d) => bangNho(dem(d, (r) => r['Loại']), 'Loại họp', 'Cuộc') },
  ];
  /* báo cáo đào tạo (mục 4 anh dặn): số buổi, số giờ, số học viên, đúng kế hoạch hay phát sinh */
  const gioLop = (r) => { const t = num(String(r['Tổng thời lượng'] || '').replace(/[^\d.,]/g, '')); return t || phut(r['Bắt đầu'], r['Kết thúc']) / 60; };
  BC.push({ k: 'daotao', ten: 'Đào tạo', nhom: 'Quản lý', bang: 'DaoTao', ngay: 'Ngày', loc: { 'Trạng thái': 'Hoàn thành' }, extra: [{ bang: 'DaoTaoDiemDanh' }],
    cs: (d, ct, x) => { const ma = new Set(d.map((r) => r['Mã ĐT'])); const dd = (x.DaoTaoDiemDanh || []).filter((r) => ma.has(r['Mã ĐT']) && r['Có mặt'] !== 'Không');
      const hv = (r) => { const n = dd.filter((y) => y['Mã ĐT'] === r['Mã ĐT']).length; return n || num(r['Số học viên']); };
      const kh = d.filter((r) => r['Loại'] !== 'Đột xuất'); const dx = d.filter((r) => r['Loại'] === 'Đột xuất');
      const dungNgay = kh.filter((r) => !r['Ngày KH'] || r['Ngày'] === r['Ngày KH'] || !r['Lý do trễ']).length;
      return [['Số buổi', d.length], ['Số giờ', so(d.reduce((a, r) => a + gioLop(r), 0))], ['Lượt học viên', d.reduce((a, r) => a + hv(r), 0)], ['Theo kế hoạch', kh.length + (kh.length ? ` (đúng ngày ${dungNgay})` : '')], ['Phát sinh (đột xuất)', dx.length]]; },
    cot: ['Ngày', 'Loại', 'Nội dung', 'Giảng viên', 'Bắt đầu', 'Kết thúc', 'Tổng thời lượng', 'Số học viên', 'Ngày KH'] });

  G.BC_VIEC = BC;
  const KY = [['thang', 'Tháng này'], ['thangtruoc', 'Tháng trước'], ['ky', 'Kỳ nhà thầu 20→19'], ['nam', 'Từ đầu năm'], ['tuy', 'Tùy chọn']];
  const khoang = (k, tu, den) => { const h = hn(); const y = h.slice(0, 4), mo = h.slice(5, 7);
    if (k === 'thangtruoc') { const d = new Date(+y, +mo - 2, 1); const e = new Date(+y, +mo - 1, 0); const f = (x) => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); return [f(d), f(e)]; }
    if (k === 'ky') return [S.dm.ky.tu, S.dm.ky.den]; if (k === 'nam') return [y + '-01-01', h]; if (k === 'tuy') return [tu || y + '-' + mo + '-01', den || h];
    return [y + '-' + mo + '-01', h]; };
  const ngayCua = (r, c) => String(r[c] || r['Ngày'] || '').slice(0, 10);
  const anhCua = (ds) => (G.anhCua ? G.anhCua(ds) : []);

  G.man.bcviec = { ten: 'Báo cáo theo từng việc', ic: 'bao_cao', nhom: 'Báo cáo', ph: 'baocao', cap: 1, fn: async (...a) => {
    const p = a.filter((x) => x != null && x !== '').map((x) => decodeURIComponent(String(x))).join('/');
    if (!p) return danhSach();
    const b = BC.find((x) => x.k === p); if (!b) return danhSach();
    const st = G.man.bcviec.st = G.man.bcviec.st || { ky: 'thang' }; const [tu, den] = khoang(st.ky, st.tu, st.den);
    const m = G.khung('📊 ' + b.ten, `${G.ngayVN(tu)} → ${G.ngayVN(den)}`, '#/bcviec');
    m.innerHTML = '<div class="the mo">Đang tổng hợp…</div>';
    const c = b.ngay || 'Ngày'; const ds0 = [{ bang: b.bang, gioiHan: 20000 }].concat(b.ct ? [{ bang: 'NhatKyPhunBonChiTiet', gioiHan: 40000 }] : []).concat(b.extra || []);
    const x = await G.docNhieu(ds0);
    const d = (x[b.bang] || []).filter((r) => { const n = ngayCua(r, c); return n >= tu && n <= den && (!b.loc || Object.keys(b.loc).every((k) => r[k] === b.loc[k])); });
    const ma = new Set(d.map((r) => r['Mã NK'])); const ct = b.ct ? (x.NhatKyPhunBonChiTiet || []).filter((r) => ma.has(r['Mã NK'])) : [];
    const cs = b.cs(d, ct, x); const them = b.them ? b.them(d, ct, x) : '';
    const cot = b.cot || [...new Set(d.flatMap((r) => Object.keys(r)))].filter((k) => !/^Ảnh|^_/.test(k));
    const dong = d.map((r) => cot.map((k) => { const v = r[k]; return Array.isArray(v) ? v.join(', ') : typeof v === 'number' ? v : String(v == null ? '' : v); }));
    const anh = anhCua(d).map((a, i) => ({ ten: `${ngayCua(a.r, c)}_${(a.r['Người ghi'] || '').split(' ').pop()}_${i + 1}`, url: a.url }));
    // biểu đồ cột theo ngày: số lần ghi
    const theoNgay = b.gt ? tong(d, (r) => ngayCua(r, c), b.gt) : dem(d, (r) => ngayCua(r, c)); const nks = Object.keys(theoNgay).sort(); const mx = Math.max(1, ...Object.values(theoNgay));
    const tomHtml = `<div class="bc-so">${cs.map(([l, v]) => `<div class="the so-the"><div><small>${esc(l)}</small><b>${esc(String(v))}</b></div></div>`).join('')}</div>`;
    m.innerHTML = `<div class="hang" style="gap:6px;flex-wrap:wrap;margin-bottom:10px"><div class="chon">${KY.map(([k, t]) => `<button data-ky="${k}" class="${st.ky === k ? 'dang' : ''}">${t}</button>`).join('')}</div>
      ${st.ky === 'tuy' ? `<input type="date" id="tu" value="${tu}" style="max-width:160px"> → <input type="date" id="den" value="${den}" style="max-width:160px">` : ''}<button class="nut chinh" id="xuat" style="margin-left:auto">⬇ Xuất báo cáo</button></div>
      ${tomHtml}
      ${nks.length > 1 ? `<div class="the"><b>Theo ngày${b.dvt ? ' (' + b.dvt + ')' : ' (lần ghi)'}</b><div class="bc-cot">${nks.map((n) => `<div title="${n}: ${theoNgay[n]}"><i style="height:${Math.round(theoNgay[n] / mx * 100)}%"></i><small>${n.slice(8)}</small></div>`).join('')}</div></div>` : ''}
      ${them ? `<div class="the bc-them">${them}</div>` : ''}
      <div class="the"><b>Chi tiết (${d.length} dòng)</b>${d.length ? `<div class="cuon-ngang"><table class="bang"><tr>${cot.map((k) => `<th>${esc(k)}</th>`).join('')}</tr>${dong.slice(0, 200).map((r) => `<tr>${r.map((v) => `<td>${esc(String(v).slice(0, 80))}</td>`).join('')}</tr>`).join('')}</table></div>${d.length > 200 ? '<p class="mo">Hiện 200 dòng đầu, xuất Excel để xem đủ.</p>' : ''}` : G.trong('Không có dữ liệu trong khoảng này.')}</div>`;
    m.querySelectorAll('[data-ky]').forEach((bt) => { bt.onclick = () => { st.ky = bt.dataset.ky; G.taiLai(); }; });
    ['tu', 'den'].forEach((id) => { const el = m.querySelector('#' + id); if (el) el.onchange = () => { st.tu = m.querySelector('#tu').value; st.den = m.querySelector('#den').value; G.taiLai(); }; });
    m.querySelector('#xuat').onclick = () => G.xuatChon({ ten: `GreenLog_${b.ten}_${tu}_${den}`, tieuDe: `${b.ten} · ${G.ngayVN(tu)} → ${G.ngayVN(den)}`, cot, dong, anh,
      sheets: [{ ten: 'Tóm tắt', hang: [['Chỉ số', 'Giá trị']].concat(cs.map(([l, v]) => [l, typeof v === 'number' ? v : String(v)])) }],
      tom: `<h2>${esc(b.ten)}</h2><p>${G.ngayVN(tu)} → ${G.ngayVN(den)}</p><table class="bang">${cs.map(([l, v]) => `<tr><td>${esc(l)}</td><td><b>${esc(String(v))}</b></td></tr>`).join('')}</table>${them}<h3>Chi tiết</h3>` });
  } };
  function danhSach() {
    const m = G.khung('📊 Báo cáo theo từng việc', 'Chọn việc → chọn kỳ → xuất Excel / PDF / ảnh', '#/baocao');
    const nhom = [...new Set(BC.map((b) => b.nhom))];
    m.innerHTML = nhom.map((n) => `<h3 class="tieu-nhom">${esc(n)}</h3><div class="ds">${BC.filter((b) => b.nhom === n).map((b) => `<a class="muc" href="#/bcviec/${encodeURIComponent(b.k)}" style="color:inherit"><div class="gian"><b>${esc(b.ten)}</b></div><span>›</span></a>`).join('')}</div>`).join('');
  }
  /* lối vào: menu Báo cáo + nút 📊 trên màn ghi của từng việc (người có quyền xem báo cáo) */
  const bcFn = G.man.baocao && G.man.baocao.fn;
  if (bcFn) G.man.baocao.fn = async (...a) => { await bcFn(...a); if (a[0]) return; const m = document.getElementById('noiDung'); if (!m || m.querySelector('.vao-bcviec')) return;
    m.insertAdjacentHTML('afterbegin', `<a class="the vao-bcviec hang" href="#/bcviec" style="justify-content:space-between;text-decoration:none;color:inherit"><span><b>📊 Báo cáo theo từng việc</b><span class="mo" style="display:block">${BC.length} loại việc: bãi biển, máy sàng cát, phun/bón, Vị Garden, cây nội thất, vườn ươm, đào tạo…</span></span><span>›</span></a>`); };
  const khungFn = G.khung;
  G.khung = function (...a) { const m = khungFn.apply(this, a); try {
    const h = location.hash.replace(/^#\/?/, ''); const b = BC.find((x) => x.k === h || (x.k === 'phunthuoc' && /^phunbon\/(ds-)?thuoc/.test(h)) || (x.k === 'phunla' && /^phunbon\/(ds-)?la/.test(h)) || (x.k === 'bongoc' && /^phunbon\/(ds-)?goc/.test(h)));
    if (b && (G.laAnhVu() || (S.u.quyen && (S.u.quyen.baocao || 0) >= 1))) { const nh = document.querySelector('header.dau #nutTao'); const nut = `<a class="nut nho nut-bc" href="#/bcviec/${encodeURIComponent(b.k)}" title="Báo cáo">📊 Báo cáo</a>`;
      setTimeout(() => { if (document.querySelector('.nut-bc')) return; const tl = document.querySelector('.dau h1, .tieude, header h1'); if (nh) nh.insertAdjacentHTML('beforebegin', nut); else if (tl) tl.insertAdjacentHTML('afterend', nut); }, 0); }
  } catch (e) { /* bỏ qua */ } return m; };
})();
