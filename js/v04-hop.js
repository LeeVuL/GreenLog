/* GreenLog 0.4 – họp thứ Hai theo mẫu biên bản PQC I–VI: phiên họp tạo trước, đội cập nhật báo cáo tuần + đăng ký kế hoạch,
   ghi chú/nhắc nhở tự gom, xử lý từng dòng, biểu đồ định kỳ tổng, hoãn + lý do, mưa rửa trôi, duyệt kết thúc, biên bản PDF */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hop = (...a) => G.hop(...a);
  const hn = () => API.ngay();
  const thu2 = (d) => { const x = new Date(d || hn()); const k = (x.getDay() + 6) % 7; return G.congNgay(API.ngay(x), -k); };
  G.thu2 = thu2;
  const tuanNay = () => { const a = thu2(); return { tu: a, den: G.congNgay(a, 6) }; };
  const tuanTruoc = () => { const a = G.congNgay(thu2(), -7); return { tu: a, den: G.congNgay(a, 6) }; };
  const soTuan = (d) => { const x = new Date(d); const j = new Date(x.getFullYear(), 0, 1); return Math.ceil(((x - j) / 864e5 + j.getDay() + 1) / 7); };
  const DOI = ['Đội khu vực', 'Đội cơ động', 'Quản lý nhà thầu'];
  const doiCua = () => (S.u.nhom === 'Quản lý nhà thầu' ? 'Quản lý nhà thầu' : S.u.doi || '');
  const LY_DO = ['☔ Mưa', 'Thiếu vật tư', 'Máy hỏng', 'Thiếu người', 'Ưu tiên việc khác', 'Khác'];
  const DV_DK = () => S.dm.dauviec.filter((v) => /^DV0[1-8]$/.test(v.ma) || ['DV37', 'DV38', 'DV39', 'DV40'].includes(v.ma));
  const muaNgay = async (d) => (await G.doc('Tuoi', { 'Ngày': d })).some((r) => r['Hôm nay mưa'] === 'Có' || /mưa/i.test(r['Trạng thái']));

  /* ---------- số liệu tuần ---------- */
  async function soLieuTuan(t) {
    const k = S.dm.ky;
    const d = await G.docNhieu([{ bang: 'TickDinhKy', loc: { 'Kỳ': k.ten } }, { bang: 'DiemDanh', loc: { 'Ngày': { tu: t.tu, den: t.den } } }, { bang: 'VanChuyen', loc: { 'Ngày': { tu: t.tu, den: t.den } } },
      { bang: 'KeHoachTuan', gioiHan: 3000 }, { bang: 'HoanViec', gioiHan: 3000 }, { bang: 'KhoKhan', loc: { 'Ngày': { tu: t.tu, den: G.congNgay(t.den, 1) } } }, { bang: 'VuonUom', loc: { 'Ngày': { tu: t.tu, den: t.den } } },
      { bang: 'SoTrongCay', gioiHan: 3000 }, { bang: 'NhatKyPhunBon', gioiHan: 2000 }, { bang: 'DichHai', gioiHan: 500 }, { bang: 'ViecPhatSinh', loc: { 'Ngày': { tu: t.tu, den: t.den } } }, { bang: 'BaoCaoTuan', loc: { 'Tuần': t.tu } }]);
    Object.keys(d).forEach((x) => { d[x] = d[x] || []; });
    // định kỳ: đến tuần trước + tăng trong tuần
    const dk = DV_DK().filter((v) => !['DV39', 'DV40'].includes(v.ma)).map((v) => { const n = G.dsVT(v.ma).length || 1; const xong = d.TickDinhKy.filter((r) => r['Mã việc'] === v.ma && (r['Trạng thái'] || 'Xong') === 'Xong' && String(r['Lần'] || '1') === '1');
      const truoc = xong.filter((r) => r['Ngày'] < t.tu).length; const nay = xong.filter((r) => r['Ngày'] <= t.den).length; return { ma: v.ma, ten: v.ten, n, truoc, nay }; });
    // công theo ngày
    const ngay = []; for (let x = t.tu; x <= t.den; x = G.congNgay(x, 1)) ngay.push(x);
    const cong = ngay.map((x) => { const tt = d.DiemDanh.filter((r) => r['Ngày'] === x).reduce((a, r) => a + (+r['Công'] || 0), 0); return { ngay: x, tt, hd: G.congHD(x) }; });
    return Object.assign(d, { dk, cong, t });
  }
  const bieuDoDK = (dk) => { const W = 430; return `<svg width="100%" viewBox="0 0 700 ${dk.length * 22 + 8}" style="max-width:760px">${dk.map((x, i) => { const y = i * 22 + 4; const p0 = Math.min(1, x.truoc / x.n), p1 = Math.min(1, x.nay / x.n); const dd = Math.round((p1 - p0) * 100);
    const tag = dd > 0 ? `<tspan fill="#1F6B35" font-weight="700">▲ +${dd}%</tspan>` : p1 >= 1 ? '<tspan fill="#1F6B35" font-weight="700">✓ xong</tspan>' : '<tspan fill="#C26A1B" font-weight="700">■ đứng yên</tspan>';
    return `<text x="0" y="${y + 12}" font-size="11">${esc(x.ten.length > 24 ? x.ten.slice(0, 23) + '…' : x.ten)}</text><rect x="150" y="${y + 2}" width="${W - 150}" height="13" rx="6.5" fill="#E7ECE6"/><rect x="150" y="${y + 2}" width="${((W - 150) * p0).toFixed(1)}" height="13" rx="6.5" fill="#1F6B35"/><rect x="${(150 + (W - 150) * p0).toFixed(1)}" y="${y + 2}" width="${((W - 150) * (p1 - p0)).toFixed(1)}" height="13" fill="#C9E265"/>
      <text x="${W + 8}" y="${y + 12}" font-size="11" font-weight="700">${x.nay}/${x.n} · ${Math.round(p1 * 100)}%</text><text x="${W + 110}" y="${y + 12}" font-size="11">${tag}</text>`; }).join('')}</svg>`; };
  G.bieuDoDK = bieuDoDK;

  /* ---------- lưu ý tự gom cho họp (mục 31) ---------- */
  async function gomLuuY(t) {
    const d = await G.docNhieu([{ bang: 'DuaVaoHop', loc: { 'Trạng thái': 'Chờ họp' } }, { bang: 'NhacNho', gioiHan: 500 }, { bang: 'DichHai', gioiHan: 500 }, { bang: 'BatThuong', gioiHan: 300 }, { bang: 'Phieu', gioiHan: 800 },
      { bang: 'TickDinhKy', loc: { 'Kỳ': S.dm.ky.ten } }, { bang: 'Hop', gioiHan: 50 }, { bang: 'DiemDanh', loc: { 'Ngày': { tu: G.congNgay(hn(), -3) } } }]);
    Object.keys(d).forEach((x) => { d[x] = d[x] || []; });
    const out = [];
    d.DuaVaoHop.forEach((x) => out.push({ nguon: x['Loại'] === 'Pha kỵ' ? '⚠ Pha kỵ' : '📌 Ghi chú', nd: x['Nội dung'], ma: x['Mã'], bang: 'DuaVaoHop', anh: x['Ảnh'], doi: x['Đội'] }));
    d.NhacNho.filter((x) => !/Đã xong|Bỏ/.test(x['Trạng thái'])).forEach((x) => out.push({ nguon: '📣 Nhắc nhở ' + x['Nguồn'], nd: x['Nội dung'] + ' → ' + x['Giao đội'] + ' (' + x['Trạng thái'] + ')', ma: x['Mã'], bang: 'NhacNho', doi: x['Giao đội'] }));
    d.DichHai.filter((x) => !/Đã duyệt/.test(x['Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)'])).forEach((x) => out.push({ nguon: '🐛 Dịch hại mở', nd: `${x['Loại dịch hại']} · ${x['Tên cây'] || ''} · ${G.tenVT(x['Mã vị trí'], x['Vị trí chi tiết'])} (${x['Mức độ']})`, ma: x['Mã DH'], bang: 'DichHai' }));
    d.BatThuong.filter((x) => x['Trạng thái'] !== 'Đã đóng' && x['Mã điểm']).forEach((x) => out.push({ nguon: '🥀 Cây nội thất', nd: `${x['Tên cây']} · ${x['Tình trạng']}`, ma: G.maBT(x), bang: 'BatThuong' }));
    d.Phieu.filter((x) => x['Trạng thái'] !== 'Đã duyệt' && x['Hạn'] && x['Hạn'] < API.bayGio() && x['Trạng thái'] !== 'Báo xong').forEach((x) => out.push({ nguon: '⏰ Phiếu quá hạn', nd: `${x['Mã phiếu']} · ${x['Mô tả'] || x['Loại lỗi']} → ${x['Giao cho']}`, ma: x['Mã phiếu'], bang: 'Phieu' }));
    DV_DK().filter((v) => /^DV0[1-8]$/.test(v.ma)).forEach((v) => { const tuan = d.TickDinhKy.filter((r) => r['Mã việc'] === v.ma && r['Ngày'] >= t.tu).length; const xong = d.TickDinhKy.filter((r) => r['Mã việc'] === v.ma).length; if (!tuan && xong < G.dsVT(v.ma).length) out.push({ nguon: '■ Định kỳ đứng yên', nd: `${v.ten}: không tăng trong tuần qua (${xong}/${G.dsVT(v.ma).length})`, ma: v.ma, bang: '' }); });
    const ngay2 = [G.congNgay(hn(), -1), G.congNgay(hn(), -2)]; const khu = S.dm.khu || [];
    Object.keys(G.DINH_BIEN_KHU).filter((c) => G.DINH_BIEN_KHU[c] > 0).forEach((c) => { const ng = khu.filter((r) => r['Cụm'] === c).map((r) => r['Mã CN']); const trong = ngay2.every((n) => { const dd = d.DiemDanh.filter((r) => r['Ngày'] === n); return dd.length && !dd.some((r) => ng.includes(r['Mã CN']) && /Có mặt/.test(r['Trạng thái (Có mặt/Vắng/Về sớm)'])); }); if (trong) out.push({ nguon: '🔴 Khu trống ≥2 ngày', nd: c, ma: c, bang: '' }); });
    const truoc = d.Hop.filter((h) => h['Trạng thái'] === 'Đã duyệt kết thúc').slice(-1)[0];
    if (truoc) { try { JSON.parse(truoc['Lưu ý'] || '[]').filter((x) => x.xl === 'Theo dõi' || x.xl === 'Giao phiếu').forEach((x) => out.push({ nguon: '↺ Từ họp ' + G.ngayVN(String(truoc['Bắt đầu']).slice(0, 10)), nd: x.nd, ma: 'cu-' + x.nd.slice(0, 20), bang: '', cu: true })); } catch (e) { /* bỏ qua */ } }
    return out;
  }

  /* ---------- HỌP ---------- */
  G.man.hop = { ten: 'Họp thứ Hai', ic: 'hop', bt: '👥', nhom: 'Kế hoạch', ph: () => G.qv('DV28') >= 1, fn: async (ma) => {
    if (ma === 'baocao') return manBaoCaoTuan();
    if (ma === 'kehoach') return manDangKy();
    const t = tuanTruoc(); const tn = tuanNay(); const maHop = 'HT' + tn.tu.replace(/-/g, '').slice(2);
    let ds = await G.doc('Hop', null, 200); let h = ds.find((x) => x['Mã họp'] === maHop);
    if (!h && G.laAnhVu()) { await API.goi('ghi', { imLang: true, bang: 'Hop', dong: { 'Mã họp': maHop, 'Loại': 'Họp nhà thầu tuần', 'Tiêu đề': `Họp nhà thầu tuần ${soTuan(tn.tu)}`, 'Bắt đầu': tn.tu + ' 09:00', 'Địa điểm': 'Văn phòng cảnh quan', 'Người dự': 'Lê Vũ, Mai Hòa Pháp, Phan Văn Thìn, Phạm Nhật Trường', 'Trạng thái': 'Chuẩn bị', 'Người lập': '' } }); ds = await G.doc('Hop', null, 200); h = ds.find((x) => x['Mã họp'] === maHop); }
    const m = G.khung('Họp nhà thầu thứ Hai', `Tuần ${soTuan(tn.tu)} · báo cáo ${G.ngayVN(t.tu).slice(0, 5)}–${G.ngayVN(t.den).slice(0, 5)} · kế hoạch ${G.ngayVN(tn.tu).slice(0, 5)}–${G.ngayVN(tn.den).slice(0, 5)}`);
    const sl = await soLieuTuan(t); const bc = sl.BaoCaoTuan;
    const xong = h && h['Trạng thái'] === 'Đã duyệt kết thúc';
    let html = `<div class="the ${xong ? 'the-xanh' : 'the-mo'}"><div class="hang"><div class="gian"><b>${esc(h ? h['Tiêu đề'] : 'Phiên họp tuần này')}</b><div class="mo">${h ? esc(G.gioVN(h['Bắt đầu'])) + ' · ' + esc(h['Địa điểm']) : 'Anh Vũ mở app để tạo phiên họp'}</div></div><span class="chip ${xong ? 'xanh' : 'cam'}">${esc(h ? h['Trạng thái'] : 'Chưa tạo')}</span></div></div>`;
    html += `<div class="the"><h2>Trước họp: báo cáo tuần và đăng ký kế hoạch</h2><table class="bang"><tr><th>Đội</th><th>Báo cáo tuần</th><th>Kế hoạch tuần tới</th></tr>${DOI.map((dd) => { const b = bc.find((x) => x['Đội'] === dd); const kh = sl.KeHoachTuan.filter((x) => x['Tuần'] === tn.tu && (x['Đội/Người'] === dd || x['Đội'] === dd)); return `<tr><td>${esc(dd)}</td><td>${b && b['Trạng thái'] === 'Đã gửi' ? '<span class="chip xanh">Đã gửi ' + esc(String(b['Giờ gửi']).slice(11, 16)) + '</span>' : '<span class="chip cam">Chưa gửi</span>'}</td><td>${kh.length ? kh.length + ' việc' : '<span class="mo">chưa đăng ký</span>'}</td></tr>`; }).join('')}</table>
      ${!G.laAnhVu() ? `<div class="nhom-nut" style="margin-top:10px"><a class="nut chinh" href="#/hop/baocao">Cập nhật báo cáo tuần</a><a class="nut" href="#/hop/kehoach">Đăng ký kế hoạch tuần tới</a></div>` : ''}</div>`;
    html += `<div class="the"><h2>Việc định kỳ kỳ ${esc(S.dm.ky.ten)} <span class="mo" style="font-weight:400;font-size:12px">· xanh đậm: đến tuần trước · xanh chanh: tăng trong tuần</span></h2>${bieuDoDK(sl.dk)}</div>`;
    // hoãn
    const hoan = sl.HoanViec.filter((x) => x['Tuần'] === t.tu); const theoLy = {}; hoan.forEach((x) => { theoLy[x['Lý do']] = (theoLy[x['Lý do']] || 0) + 1; });
    html += `<div class="the"><h2>Việc đã đăng ký nhưng hoãn (${hoan.length})</h2>${hoan.length ? `<p class="mo" style="margin-top:0">${Object.keys(theoLy).map((k) => `${esc(k)}: ${theoLy[k]}`).join(' · ')}</p>${hoan.map((x) => `<div class="hang" style="padding:6px 0;border-bottom:1px solid var(--vien2)"><div class="gian">${esc(x['Nội dung'])}<div class="mo">${esc(x['Đội'])} · ${esc(x['Lý do'])}${x['Ghi chú'] ? ' · ' + esc(x['Ghi chú']) : ''} · bù: ${esc(x['Làm bù'])}</div></div>${G.laAnhVu() && !x['Yêu cầu làm bù'] ? `<button class="nut nho" data-bu="${esc(x['Mã'])}">Yêu cầu làm bù</button>` : x['Yêu cầu làm bù'] ? '<span class="chip cam">Đã yêu cầu bù</span>' : ''}</div>`).join('')}` : '<p class="mo">Không có.</p>'}</div>`;
    if (G.laAnhVu()) {
      const ly = await gomLuuY(t); const daXL = (() => { try { return JSON.parse((h || {})['Lưu ý'] || '[]'); } catch (e) { return []; } })();
      html += `<div class="the"><div class="hang"><h2 class="gian" style="margin:0">Lưu ý trong họp (${ly.length + daXL.filter((x) => x.moi).length})</h2>${xong ? '' : '<button class="nut nho" id="themLY">＋ Thêm dòng</button>'}</div><p class="mo">App tự gom: ghi chú 📌, nhắc nhở, pha kỵ, dịch hại mở, cây nội thất, phiếu quá hạn, định kỳ đứng yên, khu trống ≥2 ngày, việc họp trước chưa xong.</p>
        ${ly.concat(daXL.filter((x) => x.moi)).map((x, i) => { const da = daXL.find((y) => y.ma === x.ma && y.nd === x.nd); return `<div class="dong-cham"><div class="gian" style="min-width:200px"><span class="chip">${esc(x.nguon)}</span> ${esc(x.nd)}</div>${xong ? `<span class="chip ${da ? 'xanh' : ''}">${esc(da ? da.xl : '—')}</span>` : `<div class="chon" style="margin:0">${['Giao phiếu', 'Theo dõi', 'Đã xong', 'Bỏ'].map((k) => `<button data-xl="${i}" data-k="${k}" class="${da && da.xl === k ? 'dang' : ''}">${k}</button>`).join('')}</div>`}</div>`; }).join('')}</div>`;
      G._luuY = { ly: ly.concat(daXL.filter((x) => x.moi)), daXL };
      const kk = sl.KhoKhan; html += `<div class="the"><h2>V. Khó khăn (${kk.length})</h2>${kk.map((x) => `<div>⚠ <b>${esc(x['Loại'])}</b>: ${esc(x['Mô tả'])} <span class="mo">· ${esc(x['Người báo'])} · ${G.ngayVN(x['Ngày'])}</span></div>`).join('') || '<p class="mo">Không gặp phải.</p>'}</div>`;
      const khMoi = sl.KeHoachTuan.filter((x) => x['Tuần'] === tn.tu);
      html += `<div class="the"><h2>Kế hoạch tuần tới đã đăng ký (${khMoi.length})</h2>${khMoi.map((x) => `<div class="mo">• ${esc(x['Đội/Người'] || x['Đội'])}: ${esc(x['Nội dung'])}${x['Cụm'] ? ' · ' + esc(x['Cụm']) : ''} <span class="chip">${esc(x['Trạng thái'])}</span></div>`).join('') || '<p class="mo">Chưa có.</p>'}</div>`;
      html += xong ? '<button class="nut chinh rong" id="pdf">⬇ Biên bản họp (PDF)</button>' : '<div class="nhom-nut" style="margin-bottom:30px"><button class="nut" id="pdf">Xem trước biên bản</button><button class="nut chinh" id="ketThuc">Duyệt kết thúc họp</button></div>';
    } else html += `<div class="the"><h2>Biên bản các tuần</h2>${ds.filter((x) => x['Trạng thái'] === 'Đã duyệt kết thúc').reverse().slice(0, 12).map((x) => `<div class="hang" style="padding:6px 0"><span class="gian">${esc(x['Tiêu đề'])}</span><button class="nut nho" data-pdf="${esc(x['Mã họp'])}">PDF</button></div>`).join('') || '<p class="mo">Chưa có.</p>'}</div>`;
    m.innerHTML = html;
    m.querySelectorAll('[data-bu]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('sua', { bang: 'HoanViec', khoa: { 'Mã': b.dataset.bu }, doi: { 'Yêu cầu làm bù': 'Có' } }); bao('Đã yêu cầu làm bù'); G.taiLai(); }); });
    const luuXL = async (moiDS) => API.goi('sua', { bang: 'Hop', khoa: { 'Mã họp': maHop }, doi: { 'Lưu ý': JSON.stringify(moiDS) } });
    m.querySelectorAll('[data-xl]').forEach((b) => { b.onclick = () => chay(async () => { const x = G._luuY.ly[+b.dataset.xl]; const k = b.dataset.k; const daXL = G._luuY.daXL.filter((y) => !(y.ma === x.ma && y.nd === x.nd));
      if (k === 'Giao phiếu') { const p = await API.goi('phieu.tao', { loaiPhieu: 'Họp', nguon: 'Họp thứ Hai', nhom: 'Họp', loai: x.nguon.replace(/^[^ ]+ /, ''), muc: 'Trung bình', vtKhac: '', moTa: x.nd, giao: x.doi && DOI.includes(x.doi) ? x.doi : 'Đội khu vực' }); x.phieu = p.ma; }
      if (x.bang === 'DuaVaoHop') await API.goi('sua', { bang: 'DuaVaoHop', khoa: { 'Mã': x.ma }, doi: { 'Trạng thái': k === 'Theo dõi' ? 'Chờ họp' : 'Đã họp', 'Xử lý': k } });
      if (x.bang === 'NhacNho' && (k === 'Đã xong' || k === 'Bỏ')) await API.goi('sua', { bang: 'NhacNho', khoa: { 'Mã': x.ma }, doi: { 'Trạng thái': k } });
      daXL.push({ ma: x.ma, nd: x.nd, nguon: x.nguon, xl: k, phieu: x.phieu || '', moi: x.moi }); await luuXL(daXL); bao(k + (x.phieu ? ' · ' + x.phieu : '')); G.taiLai(); }); });
    const tl = m.querySelector('#themLY'); if (tl) tl.onclick = async () => { const t2 = await G.hoi('Nội dung lưu ý mới'); if (t2) chay(async () => { G._luuY.daXL.push({ ma: G.ma('LY'), nd: t2, nguon: '✍ Thêm trong họp', xl: 'Theo dõi', moi: true }); await luuXL(G._luuY.daXL); G.taiLai(); }); };
    const kt = m.querySelector('#ketThuc'); if (kt) kt.onclick = async (e) => { if (!(await G.xacNhan('Duyệt kết thúc họp? Kế hoạch tuần tới chuyển "Đang triển khai", biên bản được khóa.', 'Duyệt kết thúc'))) return;
      chay(async () => { const kh = sl.KeHoachTuan.filter((x) => x['Tuần'] === tn.tu && /Đăng ký|Đã giao/.test(x['Trạng thái']));
        for (const x of kh) await API.goi('sua', { bang: 'KeHoachTuan', khoa: { 'Mã KHT': x['Mã KHT'] }, doi: { 'Trạng thái': 'Đang triển khai' } });
        const bb = await bienBan(h, sl, G._luuY); await API.goi('sua', { bang: 'Hop', khoa: { 'Mã họp': maHop }, doi: { 'Trạng thái': 'Đã duyệt kết thúc', 'Kết thúc': API.bayGio(), 'Số liệu': JSON.stringify({ dk: sl.dk }), 'Biên bản HTML': bb.length < 200000 ? bb : '' } });
        bao('Đã duyệt kết thúc họp · ' + kh.length + ' việc đang triển khai'); G.taiLai(); }, e.target); };
    const pdf = m.querySelector('#pdf'); if (pdf) pdf.onclick = () => chay(async () => G.inA4('Biên bản họp', await bienBan(h, sl, G._luuY || { ly: [], daXL: [] })));
    m.querySelectorAll('[data-pdf]').forEach((b) => { b.onclick = () => chay(async () => { const x = ds.find((y) => y['Mã họp'] === b.dataset.pdf); if (x['Biên bản HTML']) return G.inA4(x['Tiêu đề'], x['Biên bản HTML']); G.inA4(x['Tiêu đề'], await bienBan(x, await soLieuTuan({ tu: G.congNgay(String(x['Bắt đầu']).slice(0, 10), -7), den: G.congNgay(String(x['Bắt đầu']).slice(0, 10), -1) }), { ly: [], daXL: JSON.parse(x['Lưu ý'] || '[]') })); }); });
  } };

  /* ---------- đội cập nhật báo cáo tuần (số liệu tự điền) + giải trình hoãn (mục 35) ---------- */
  async function manBaoCaoTuan() {
    const t = tuanTruoc(); const doi = doiCua() || 'Đội khu vực'; const m = G.khung('Báo cáo tuần · ' + doi, `${G.ngayVN(t.tu)} – ${G.ngayVN(t.den)} · số liệu app tự điền`, '#/hop');
    const sl = await soLieuTuan(t); const b = sl.BaoCaoTuan.find((x) => x['Đội'] === doi) || {};
    const kh = sl.KeHoachTuan.filter((x) => x['Tuần'] === t.tu && (x['Đội/Người'] === doi || x['Đội'] === doi || doi === 'Quản lý nhà thầu'));
    const hoan = sl.HoanViec.filter((x) => x['Tuần'] === t.tu);
    const chuaXong = kh.filter((x) => !/Hoàn thành/.test(x['Trạng thái']) && !hoan.some((h) => h['Mã KHT'] === x['Mã KHT']));
    const vc = sl.VanChuyen.filter((x) => doi === 'Quản lý nhà thầu' || x['Đội'] === doi); const tc = vc.reduce((a, x) => a + (+x['Số chuyến'] || 0), 0);
    const ps = sl.ViecPhatSinh.filter((x) => doi === 'Quản lý nhà thầu' || x['Đội'] === doi);
    m.innerHTML = `<div class="the"><h2>II. Kết quả tuần trước (kế hoạch đã đăng ký)</h2>${kh.length ? `<table class="bang"><tr><th>Việc</th><th>Kết quả tuần trước</th><th></th></tr>${kh.map((x) => { const ho = hoan.find((h) => h['Mã KHT'] === x['Mã KHT']); return `<tr><td>${esc(x['Nội dung'])}${x['Cụm'] ? '<div class="mo">' + esc(x['Cụm']) + '</div>' : ''}</td><td>${/Hoàn thành/.test(x['Trạng thái']) ? '<span class="chip xanh">Hoàn thành</span>' : ho ? `<span class="chip cam">Hoãn · ${esc(ho['Lý do'])}</span>` : `<span class="chip do">${esc(x['Trạng thái'])}</span>`}</td>
        <td>${!/Hoàn thành/.test(x['Trạng thái']) && !ho ? `<button class="nut nho chinh" data-ht="${esc(x['Mã KHT'])}">Hoàn thành</button> <button class="nut nho" data-hoan="${esc(x['Mã KHT'])}">Hoãn</button>` : ''}</td></tr>`; }).join('')}</table>` : '<p class="mo">Tuần trước không đăng ký việc.</p>'}</div>
      <div class="the"><h2>Số liệu app tự điền</h2><div class="luoi2"><div><div class="mo">Vận chuyển</div><b>${tc} chuyến</b></div><div><div class="mo">Việc phát sinh</div><b>${ps.length} việc</b></div><div><div class="mo">Công thực tế / hợp đồng</div><b>${G.so(sl.cong.reduce((a, x) => a + x.tt, 0))} / ${sl.cong.reduce((a, x) => a + x.hd, 0)}</b></div><div><div class="mo">Khó khăn đã báo</div><b>${sl.KhoKhan.filter((x) => x['Đội'] === doi || doi === 'Quản lý nhà thầu').length}</b></div></div></div>
      <div class="the"><div id="f"></div></div>
      ${chuaXong.length ? `<div class="canh-bao do">Còn ${chuaXong.length} việc chưa xong mà chưa giải trình. Bấm Hoàn thành hoặc Hoãn cho từng việc thì mới gửi được.</div>` : ''}
      <button class="nut chinh rong" id="gui" ${chuaXong.length ? 'disabled' : ''} style="margin-bottom:30px">${b['Trạng thái'] === 'Đã gửi' ? 'Cập nhật lại báo cáo' : 'Gửi báo cáo tuần'}</button>`;
    const lay = G.form(m.querySelector('#f'), [{ k: 'kq', nhan: 'Kết quả nổi bật, hạng mục ngoài định kỳ', loai: 'mota', gt: b['Kết quả'] || '' }, { k: 'cdb', nhan: 'Chăm sóc cây đặc biệt (khi có phát sinh trong tuần)', loai: 'mota', gt: b['Cây đặc biệt'] || '' }, { k: 'dx', nhan: 'Đề xuất, ý kiến', loai: 'mota', gt: b['Đề xuất'] || '' }]);
    m.querySelectorAll('[data-ht]').forEach((x) => { x.onclick = () => chay(async () => { await API.goi('sua', { bang: 'KeHoachTuan', khoa: { 'Mã KHT': x.dataset.ht }, doi: { 'Trạng thái': 'Hoàn thành', 'Ngày xong': hn() } }); G.taiLai(); }); });
    m.querySelectorAll('[data-hoan]').forEach((x) => { x.onclick = () => G.hoanViec(kh.find((k) => k['Mã KHT'] === x.dataset.hoan), t.tu, doi); });
    m.querySelector('#gui').onclick = (e) => chay(async () => { const v = lay();
      await API.goi('ghiNhieu', { bang: 'BaoCaoTuan', thay: ['Tuần', 'Đội'], dong: [{ 'Tuần': t.tu, 'Đội': doi, 'Kết quả': v.kq, 'Cây đặc biệt': v.cdb, 'Đề xuất': v.dx, 'Số liệu': JSON.stringify({ tc, ps: ps.length }), 'Trạng thái': 'Đã gửi', 'Người gửi': S.u.ten, 'Giờ gửi': API.bayGio() }] });
      bao('Đã gửi báo cáo tuần'); location.hash = '#/hop'; }, e.target);
  }
  G.hoanViec = (x, tuan, doi) => hop('Hoãn: ' + x['Nội dung'], '<div id="f"></div><button class="nut chinh rong" id="l">Lưu giải trình</button>', async (o, dong) => {
    const mua = await muaNgay(x['Hạn'] || hn()).catch(() => false);
    const lay = G.form(o.querySelector('#f'), [{ k: 'ly', nhan: 'Lý do', loai: 'chips', ds: LY_DO, bb: true, gt: mua ? '☔ Mưa' : '' }, mua ? { nhan: 'Ngày này đã bấm ☔ ở Tưới nên app gợi ý lý do Mưa.', loai: 'ghichu' } : { nhan: '', loai: 'ghichu' },
      { k: 'bu', nhan: 'Làm bù', loai: 'chips', ds: ['Chuyển tuần sau', 'Chọn ngày'], bb: true, gt: 'Chuyển tuần sau' }, { k: 'ngay', nhan: 'Ngày làm bù (nếu chọn ngày)', loai: 'ngay', gt: G.congNgay(hn(), 1) }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
    o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const bu = v.bu === 'Chọn ngày' ? v.ngay : 'Tuần sau';
      await API.goi('ghi', { bang: 'HoanViec', dong: { 'Mã': G.ma('HV'), 'Ngày': '', 'Tuần': tuan, 'Mã KHT': x['Mã KHT'], 'Nội dung': x['Nội dung'], 'Đội': doi || x['Đội/Người'] || '', 'Lý do': v.ly, 'Làm bù': bu, 'Ghi chú': v.gc, 'Người ghi': '' } });
      await API.goi('sua', { bang: 'KeHoachTuan', khoa: { 'Mã KHT': x['Mã KHT'] }, doi: { 'Trạng thái': 'Hoãn' } });
      const tuanSau = G.congNgay(tuan, 7); // tự chuyển sang kế hoạch tuần mới
      await API.goi('ghi', { bang: 'KeHoachTuan', dong: { 'Mã KHT': '', 'Tuần': tuanSau, 'Nội dung': x['Nội dung'], 'Mã việc': x['Mã việc'] || '', 'Cụm': x['Cụm'] || '', 'Mã vị trí': x['Mã vị trí'] || '', 'Đội/Người': x['Đội/Người'] || doi, 'Từ ngày': v.bu === 'Chọn ngày' ? v.ngay : tuanSau, 'Hạn': G.congNgay(tuanSau, 6), 'Mức độ': x['Mức độ'] || 'Trung bình', 'Nguồn': 'Hoãn từ tuần ' + G.ngayVN(tuan).slice(0, 5), 'Trạng thái': 'Đăng ký' } }).catch(() => {});
      dong(); bao('Đã giải trình hoãn · tự chuyển sang kế hoạch tuần mới'); G.taiLai(); }, e.target);
  });

  /* ---------- đăng ký kế hoạch tuần tới: việc định kỳ chỉ tick ---------- */
  async function manDangKy() {
    const tn = tuanNay(); const doi = doiCua() || 'Đội khu vực'; const m = G.khung('Kế hoạch tuần ' + G.ngayVN(tn.tu).slice(0, 5) + '–' + G.ngayVN(tn.den).slice(0, 5), doi + ' · việc định kỳ chỉ tick', '#/hop');
    const kh = (await G.doc('KeHoachTuan', { 'Tuần': tn.tu })).filter((x) => x['Đội/Người'] === doi);
    const cums = [...new Set(S.dm.vitri.filter((v) => v.ap === 'Có').map((v) => v.cum))];
    const co = (ma, c) => kh.some((x) => x['Mã việc'] === ma && x['Cụm'] === c);
    const dvs = DV_DK().filter((v) => G.qv(v.ma) >= 2 || doi === 'Quản lý nhà thầu');
    m.innerHTML = `<div class="the cuon-ngang"><table class="bang"><tr><th>Việc định kỳ</th>${cums.map((c) => `<th style="font-size:11px">${esc(c)}</th>`).join('')}</tr>${dvs.map((v) => `<tr><td>${esc(v.ten)}</td>${cums.map((c) => `<td><input type="checkbox" data-dv="${v.ma}" data-c="${esc(c)}" ${co(v.ma, c) ? 'checked' : ''}></td>`).join('')}</tr>`).join('')}</table></div>
      <p class="mo">Tick ô = đăng ký làm việc đó ở cụm đó trong tuần. Sau khi anh Vũ duyệt kết thúc họp → "Đang triển khai"; cuối tuần phải chuyển "Hoàn thành" hoặc bấm Hoãn.</p>
      <div class="the"><h2>Hạng mục ngoài định kỳ</h2>${kh.filter((x) => !x['Mã việc']).map((x) => `<div class="mo">• ${esc(x['Nội dung'])} <span class="chip">${esc(x['Trạng thái'])}</span></div>`).join('') || '<p class="mo">Chưa có</p>'}<a class="nut nho" href="#/kehoach" style="margin-top:8px">＋ Thêm hạng mục ở Kế hoạch tuần</a></div>
      <button class="nut chinh rong" id="luu" style="margin-bottom:30px">Lưu đăng ký</button>`;
    m.querySelector('#luu').onclick = (e) => chay(async () => { const chon = [...m.querySelectorAll('[data-dv]:checked')].map((i) => [i.dataset.dv, i.dataset.c]);
      const moi = chon.filter(([d, c]) => !co(d, c));
      if (moi.length) await API.goi('ghiNhieu', { bang: 'KeHoachTuan', dong: moi.map(([d, c]) => ({ 'Mã KHT': '', 'Tuần': tn.tu, 'Mã việc': d, 'Cụm': c, 'Nội dung': G.dvTen(d) + ' · ' + c, 'Đội/Người': doi, 'Từ ngày': tn.tu, 'Hạn': tn.den, 'Mức độ': 'Trung bình', 'Nguồn': 'Đăng ký họp', 'Trạng thái': 'Đăng ký' })) });
      bao(`Đã đăng ký ${moi.length} việc`); location.hash = '#/hop'; }, e.target);
  }

  /* ---------- biên bản (mẫu mới đã duyệt) ---------- */
  async function bienBan(h, sl, ly) {
    const t = sl.t; const tn = { tu: G.congNgay(t.tu, 7), den: G.congNgay(t.den, 7) };
    const css = `@page{size:A4;margin:10mm}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{font-family:'Be Vietnam Pro',Inter,Arial,sans-serif;color:#14261B;font-size:11px}h1{font-size:19px;color:#123524;margin:6px 0 2px}.top{border-bottom:3px solid #123524;padding-bottom:8px;margin-bottom:10px;display:flex;justify-content:space-between}.logo{font-weight:800;color:#123524}.logo i{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:6px;background:#C9E265;font-style:normal;margin-right:6px}
      h2{font-size:12.5px;color:#fff;background:#123524;padding:4px 9px;border-radius:6px;margin:10px 0 4px}h3{font-size:11.5px;color:#1F4D2B;margin:8px 0 4px;border-left:4px solid #C9E265;padding-left:6px}table{width:100%;border-collapse:collapse}th{background:#E7EFE3;color:#123524;text-align:left;padding:4px 6px;font-size:10px}td{padding:3px 6px;border-bottom:1px solid #E6ECE4;vertical-align:top}.mo{color:#5F6F64}.chip{display:inline-block;padding:1px 7px;border-radius:99px;font-size:9.5px;font-weight:700;background:#EEF1EC}.g{background:#E5F4E4;color:#1F6B35}.o{background:#FCEBDD;color:#B4621E}.ky{display:flex;justify-content:space-between;margin-top:26px;text-align:center}`;
    const tbl = (hd, rs) => `<table><tr>${hd.map((x) => `<th>${x}</th>`).join('')}</tr>${rs.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${hd.length}" class="mo">Không có</td></tr>`}</table>`;
    const bc = sl.BaoCaoTuan; const khT = sl.KeHoachTuan.filter((x) => x['Tuần'] === t.tu); const hoan = sl.HoanViec.filter((x) => x['Tuần'] === t.tu);
    const vu = sl.VuonUom.filter((r) => r['Vườn ươm'] === 'Vườn ươm sân vườn'); const sum = (ds, c) => ds.reduce((a, r) => a + (+r[c] || 0), 0);
    let s = `<div class="top"><div><div class="logo"><i>✓</i>GreenLog · Bộ phận Cảnh Quan</div><h1>BIÊN BẢN HỌP NHÀ THẦU TUẦN ${soTuan(tn.tu)}</h1><div class="mo">${esc(G.gioVN((h || {})['Bắt đầu'] || ''))} · ${esc((h || {})['Địa điểm'] || '')}<br>Chủ trì: Lê Vũ · Nhà thầu PQC: Mai Hòa Pháp · Tổ trưởng: Phan Văn Thìn, Phạm Nhật Trường</div></div><div style="text-align:right"><span class="chip g">${esc((h || {})['Trạng thái'] || 'Xem trước')}</span><div class="mo">${esc((h || {})['Mã họp'] || '')}</div></div></div>`;
    s += `<h2>I. BÁO CÁO CÔNG VIỆC TUẦN VỪA QUA · ${G.ngayVN(t.tu)} – ${G.ngayVN(t.den)}</h2>`;
    DOI.forEach((dd, i) => { const b = bc.find((x) => x['Đội'] === dd) || {}; const kh = khT.filter((x) => x['Đội/Người'] === dd);
      s += `<h3>${i + 1}. ${esc(dd)}</h3>${tbl(['Stt', 'Nội dung', 'Kết quả tuần trước', 'Ghi chú'], kh.map((x, j) => { const ho = hoan.find((y) => y['Mã KHT'] === x['Mã KHT']); return [j + 1, esc(x['Nội dung']), /Hoàn thành/.test(x['Trạng thái']) ? '<span class="chip g">Hoàn thành</span>' : ho ? `<span class="chip o">Hoãn · ${esc(ho['Lý do'])}</span>` : esc(x['Trạng thái']), ho ? 'Bù: ' + esc(ho['Làm bù']) : '']; }))}
        ${b['Kết quả'] ? `<p>${esc(b['Kết quả'])}</p>` : ''}${b['Cây đặc biệt'] ? `<h3>Chăm sóc cây đặc biệt</h3><p>${esc(b['Cây đặc biệt'])}</p>` : ''}`; });
    s += `<h3>Vườn ươm sân vườn</h3>${tbl(['Nội dung', 'Khối lượng'], [['Đã ươm', G.so(sum(vu.filter((r) => r['Loại ghi'] === 'Ươm vào'), 'Số lượng'))], ['Đã xuất', G.so(sum(vu.filter((r) => r['Loại ghi'] === 'Xuất vườn'), 'Số lượng'))], ['Chất cải tạo đất hữu cơ', G.so(sum(vu, 'Chất cải tạo đất hữu cơ (bao)')) + ' bao']])}`;
    const dh = sl.DichHai.filter((x) => !/Đã duyệt/.test(x['Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)']));
    s += `<h3>Tình hình dịch hại</h3>${tbl(['Hồ sơ', 'Cây · Khu vực', 'Mức độ', 'Trạng thái'], dh.map((x) => [esc(x['Mã DH']), esc((x['Tên cây'] || '') + ' · ' + G.tenVT(x['Mã vị trí'], x['Vị trí chi tiết'])), esc(x['Mức độ']), esc(x['Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)'])]))}`;
    const khN = sl.KeHoachTuan.filter((x) => x['Tuần'] === tn.tu);
    s += `<h2>II. KẾ HOẠCH TUẦN TIẾP THEO · ${G.ngayVN(tn.tu)} – ${G.ngayVN(tn.den)}</h2>${tbl(['Đội', 'Việc', 'Cụm / vị trí', 'Trạng thái'], khN.map((x) => [esc(x['Đội/Người']), esc(x['Mã việc'] ? G.dvTen(x['Mã việc']) : x['Nội dung']), esc(x['Cụm'] || G.tenVT(x['Mã vị trí'])), esc(x['Trạng thái']) + (/Hoãn/.test(x['Nguồn'] || '') ? ' <span class="chip o">bù</span>' : '')]))}`;
    const tt = sl.cong.reduce((a, x) => a + x.tt, 0), hd = sl.cong.reduce((a, x) => a + x.hd, 0);
    s += `<h2>III. NHÂN SỰ · Định biên 31 · CN, lễ 20</h2>${tbl([''].concat(sl.cong.map((x) => G.thuNgan(x.ngay))).concat(['Tổng']), [['Thực tế'].concat(sl.cong.map((x) => G.so(x.tt))).concat([G.so(tt)]), ['Hợp đồng'].concat(sl.cong.map((x) => x.hd)).concat([hd]), ['Chênh lệch'].concat(sl.cong.map((x) => G.so(x.tt - x.hd))).concat([G.so(tt - hd)])])}`;
    const tong = {}; hoan.forEach((x) => { tong[x['Lý do']] = (tong[x['Lý do']] || 0) + 1; });
    s += `<h2>IV. NỘI DUNG CẦN LƯU Ý VÀ ĐIỀU CHỈNH</h2>${tbl(['#', 'Nội dung', 'Xử lý'], (ly.daXL || []).map((x, i) => [i + 1, esc((x.nguon ? x.nguon + ': ' : '') + x.nd), esc(x.xl) + (x.phieu ? ' · ' + esc(x.phieu) : '')]))}${hoan.length ? `<p><b>Tổng hợp hoãn theo lý do:</b> ${Object.keys(tong).map((k) => `${esc(k)} ${tong[k]}`).join(' · ')}</p>` : ''}`;
    s += `<h2>V. KHÓ KHĂN</h2>${sl.KhoKhan.length ? tbl(['Loại', 'Mô tả', 'Người báo'], sl.KhoKhan.map((x) => [esc(x['Loại']), esc(x['Mô tả']), esc(x['Người báo'])])) : '<p>Không gặp phải.</p>'}`;
    s += `<h2>VI. TIẾN ĐỘ VIỆC ĐỊNH KỲ KỲ ${esc(S.dm.ky.ten)}</h2>${bieuDoDK(sl.dk)}`;
    s += `<div class="ky"><div style="width:45%">Đại diện nhà thầu<br><br><br><br><b>Mai Hòa Pháp</b><br>Trưởng Phòng Quản Lý Cảnh Quan</div><div style="width:45%">Đại diện khách sạn Mövenpick Resort Waverly Phu Quoc<br><br><br><br><b>Lê Vũ</b><br>Trưởng bộ phận Cảnh Quan</div></div>`;
    return `<style>${css}</style>${s}`;
  }

  /* ---------- phun xong gặp mưa: phun lại cùng vị trí/công thức, thống kê hao do mưa (mục 35) ---------- */
  const pbFn = G.man.phunbon.fn;
  G.man.phunbon = Object.assign(G.man.phunbon, { fn: async (a, b) => {
    await pbFn(a, b); if (a) return; const m = document.getElementById('noiDung'); if (!m) return;
    const d = await G.docNhieu([{ bang: 'NhatKyPhunBon', loc: { 'Ngày giờ': { tu: G.congNgay(hn(), -2) } } }, { bang: 'PhunLai', gioiHan: 500 }]);
    const ds = (d.NhatKyPhunBon || []).filter((x) => /Phun/.test(x['Loại (Phun thuốc/Phun phân bón lá/Bón gốc)']) && !(d.PhunLai || []).some((p) => p['Mã NK gốc'] === x['Mã NK']));
    if (!ds.length || q('phunbon') < 2) return;
    m.insertAdjacentHTML('afterbegin', `<div class="the"><h2>Phun trong 48 giờ qua</h2><p class="mo" style="margin-top:0">Phun xong gặp mưa: bấm để tạo phiếu phun lại cùng vị trí và công thức. Lượng thuốc lần đầu vẫn cộng dồn, thống kê riêng phần hao do mưa.</p>
      ${ds.map((x) => `<div class="hang" style="padding:6px 0;border-bottom:1px solid var(--vien2)"><div class="gian"><b>${esc(x['Mã NK'])}</b> · ${esc(x['Loại (Phun thuốc/Phun phân bón lá/Bón gốc)'])}<div class="mo">${esc(String(x['Ngày giờ']).slice(5))} · ${esc(x['Vị trí chi tiết'] || x['Cụm'])}</div></div><button class="nut nho" data-mua="${esc(x['Mã NK'])}">☔ Bị mưa rửa trôi</button></div>`).join('')}</div>`);
    m.querySelectorAll('[data-mua]').forEach((bt) => { bt.onclick = () => chay(async () => { const x = ds.find((y) => y['Mã NK'] === bt.dataset.mua); const ct = await G.doc('NhatKyPhunBonChiTiet', { 'Mã NK': x['Mã NK'] });
      const cong = ct.map((c) => `${c['Sản phẩm']} ${c['Liều / bình']} ${c['ĐVT']}/bình`).join(' + ');
      const p = await API.goi('phieu.tao', { loaiPhieu: 'Phun lại', nguon: 'Mưa rửa trôi', nhom: 'Phun thuốc', loai: 'Phun lại do mưa', muc: 'Cao', vt: String(x['Mã vị trí'] || '').split('|')[0].trim(), vtKhac: x['Vị trí chi tiết'] || '', moTa: `Phun lại ${x['Mã NK']}: ${cong} · ${x['Số bình'] || ''} bình · ${x['Vị trí chi tiết'] || ''}`, giao: 'Đội cơ động' });
      await API.goi('ghi', { bang: 'PhunLai', dong: { 'Ngày': '', 'Mã NK gốc': x['Mã NK'], 'Mã phiếu': p.ma, 'Lượng hao': JSON.stringify(ct.map((c) => [c['Sản phẩm'], c['Tổng lượng'], c['ĐVT']])), 'Người ghi': '' } });
      bao('Đã tạo phiếu phun lại ' + p.ma); G.taiLai(); }); });
  } });
})();
