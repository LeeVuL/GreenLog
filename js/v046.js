/* GreenLog 0.4.6 · mục 102–109: việc riêng Hiệp/Nghị, Kho & tài sản (vật tư, dụng cụ, máy móc + bảo trì theo giờ máy),
   tìm kiếm thông minh, Trợ lý GreenLog (khung chat riêng, Gemini khi có mã, chế độ cơ bản khi hết lượt) */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hn = () => API.ngay(); const gio = () => API.bayGio().slice(11, 16);
  const num = (v) => +String(v == null ? '' : v).replace(',', '.') || 0;
  const so = (n, k) => G.so(Math.round((+n || 0) * 10) / 10, k == null ? 1 : k);
  const laNB = () => S.u && S.u.nhom === 'Nhân viên nội bộ';
  const laAnh = () => G.laAnhVu && G.laAnhVu();
  const ngan = (t) => String(t || '').split(' ').pop();
  const nb2 = () => ((S.dm && S.dm.nguoi) || []).filter((n) => n.nhom === 'Nhân viên nội bộ').map((n) => n.ten);
  const tenDu = (x) => nb2().find((t) => ngan(t) === x) || x;
  const imLang = async (fn) => { G._imLang = (G._imLang || 0) + 1; try { return await fn(); } finally { G._imLang--; } };
  const bam = (s) => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0) / 4294967296; };

  Object.assign(API.BANG, { KhoVatTu: ['noibo', 2], KhoGiaoDich: ['noibo', 2], DungCu: ['noibo', 2], DungCuMuon: ['noibo', 2], KiemTraDC: ['noibo', 2], BaoTriPH: ['noibo', 2], MayHong: ['noibo', 2] });

  /* =========================== 102: VIỆC RIÊNG CỦA HIỆP / NGHỊ =========================== */
  G.CHU_NB = { 'nb/bien': 'Hiệp', 'nb/ktbien': 'Hiệp', 'nb/may': 'Hiệp', 'nb/noithat': 'Hiệp', 'nb/vuonuomnt': 'Hiệp', 'nb/hangrao': 'Hiệp', batthuong: 'Hiệp',
    'nb/vuonrau': 'Nghị', 'nb/thuhoach': 'Nghị', 'nb/rac': 'Nghị' };
  /* màn Việc của nội bộ: chỉ thấy ô việc của mình (và của bạn đang nghỉ), bỏ ô Phân compost */
  const viecGoc = G.man.viec && G.man.viec.fn;
  if (viecGoc) G.man.viec.fn = async (...a) => { await viecGoc(...a); const m = document.getElementById('noiDung'); if (!m) return;
    m.querySelectorAll('a[href="#/nb/compost"]').forEach((x) => x.remove());
    if (!laNB()) return; const nghi = await G.nghiNB().catch(() => []); const toi = ngan(S.u.ten);
    m.querySelectorAll('a[href^="#/nb/"]').forEach((a) => { const c = G.CHU_NB[a.getAttribute('href').slice(2)]; if (!c || c === toi) return;
      if (nghi.includes(tenDu(c))) { const b = a.querySelector('b'); if (b && !/làm thay/.test(b.textContent)) b.insertAdjacentHTML('afterend', `<small class="mo">làm thay ${esc(c)}</small>`); } else a.remove(); }); };
  /* Hôm nay của nội bộ: bỏ việc compost, thêm việc bảo trì máy đã phát hành và kiểm tra dụng cụ */
  const vnb = G.viecNoiBo;
  G.viecNoiBo = async (ngay, tt) => { let ds = (await vnb(ngay, tt)).filter((x) => x.link !== 'nb/compost');
    if (laNB() && (!ngay || ngay === hn())) { try { ds = ds.concat(await viecKhoCuaToi()); } catch (e) { /* bỏ qua */ } }
    return ds; };

  /* =========================== 108: KHO & TÀI SẢN =========================== */
  const NHOM_VT = ['Phân bón', 'Thuốc, chế phẩm', 'Giá thể, đất', 'Chậu, vật tư trồng', 'Hạt giống', 'Vật tư bãi biển', 'Xăng, nhớt', 'Bảo hộ', 'Khác'];
  const VIEC_VT = [['nb/noithat', 'Cây nội thất'], ['nb/vuonuomnt', 'Vườn ươm nội thất'], ['nb/vuonrau', 'Vị Garden'], ['nb/rac', 'Thu gom rác hữu cơ'], ['nb/bien', 'Vệ sinh bãi biển'], ['nb/may', 'Máy sàng cát']];
  const BANG_VIEC = { CayNoiThat: 'nb/noithat', VuonUomNoiThat: 'nb/vuonuomnt', VuonRau: 'nb/vuonrau', RacHuuCo: 'nb/rac', VeSinhBien: 'nb/bien' };
  const ton = (gd, ma) => gd.filter((x) => x['Mã VT'] === ma).reduce((a, x) => a + (x['Loại'] === 'Xuất' ? -1 : 1) * num(x['Số lượng']), 0);
  const buoc = (dvt) => (/kg|lít|lit/i.test(dvt || '') ? 0.5 : 1);
  const taiKho = async () => { const d = await G.docNhieu([{ bang: 'KhoVatTu', gioiHan: 2000 }, { bang: 'KhoGiaoDich', gioiHan: 20000 }]); return { vt: (d.KhoVatTu || []).filter((x) => x['Trạng thái'] !== 'Ngừng dùng'), gd: d.KhoGiaoDich || [] }; };
  const ttVT = (v, t) => (t <= 0 ? ['do', '🔴 Hết'] : t < num(v['Tồn tối thiểu']) ? ['cam', '🟠 Sắp hết'] : ['xanh', '🟢 Đủ']);
  const duNgay = (gd, ma, t) => { if (t <= 0) return null; const tu = G.congNgay(hn(), -30); const dung = gd.filter((x) => x['Mã VT'] === ma && x['Loại'] === 'Xuất' && x['Ngày'] >= tu).reduce((a, x) => a + num(x['Số lượng']), 0);
    return dung > 0 ? Math.floor(t / (dung / 30)) : null; };
  G.khoTon = async () => { const k = await taiKho(); return k.vt.map((v) => { const t = ton(k.gd, v['Mã VT']); return { v, t, tt: ttVT(v, t), nd: duNgay(k.gd, v['Mã VT'], t) }; }); };

  /* ---------- máy móc: danh mục mốc bảo trì theo GIỜ hoạt động (chỉ theo giờ, không theo lần dùng) ---------- */
  const MAY = [
    { ma: 'SM', ten: 'Sand Man', cach: 'Cộng giờ từ lúc Bắt đầu đến Kết thúc sàng', moc: [
      { k: 'SM20', h: 20, dau: true, ten: '20 giờ đầu', ds: ['Thay nhớt lần đầu'] },
      { k: 'SM25', h: 25, ten: 'Mỗi 25 giờ', ds: ['Kiểm tra lưới sàng, rách thì thay', 'Kiểm tra dây curoa', 'Kiểm tra mức dầu hộp số'] },
      { k: 'SM50', h: 50, ten: 'Mỗi 50 giờ', ds: ['Vệ sinh lọc gió'] },
      { k: 'SM100', h: 100, ten: 'Mỗi 100 giờ', ds: ['Thay nhớt động cơ', 'Kiểm tra, chỉnh bugi', 'Vệ sinh cốc lắng xăng'] },
      { k: 'SM300', h: 300, ten: 'Mỗi 300 giờ', ds: ['Thay lọc gió', 'Thay bugi', 'Báo ENG chỉnh xupap, cầm chừng'] }] },
    { ma: 'HB', ten: 'H.Barber', cach: 'Cộng giờ từ lúc Bắt đầu đến Kết thúc sàng', moc: [
      { k: 'HB20', h: 20, ten: 'Mỗi 20 giờ', ds: ['Bơm mỡ ổ bi băng tải và con lăn hai bên'] },
      { k: 'HB50', h: 50, ten: 'Mỗi 50 giờ', ds: ['Bơm mỡ các khớp xoay', 'Kiểm tra xích băng tải (rơ tối đa khoảng 4 cm)', 'Kiểm tra xích đổ thùng căng đều hai bên', 'Kiểm tra răng cào, gãy thì thay'] },
      { k: 'HB200', h: 200, ten: 'Mỗi 200 giờ', ds: ['Kiểm tra, chỉnh độ căng xích truyền động'] }] },
    { ma: 'KB', ten: 'Kubota', cach: 'Theo đồng hồ giờ máy lúc Nhận, Trả máy', moc: [
      { k: 'KB50D', h: 50, dau: true, ten: '50 giờ đầu', ds: ['Thay nhớt và lọc nhớt', 'Thay lọc dầu truyền động', 'Siết bulong bánh xe'] },
      { k: 'KB50', h: 50, ten: 'Mỗi 50 giờ', ds: ['Bơm mỡ các vú mỡ và trục PTO', 'Kiểm tra công tắc an toàn', 'Kiểm tra ắc quy, dây điện', 'Siết bulong bánh xe'] },
      { k: 'KB100', h: 100, ten: 'Mỗi 100 giờ', ds: ['Vệ sinh lọc gió', 'Kiểm tra dây curoa quạt', 'Thay nhớt máy'] },
      { k: 'KB200', h: 200, ten: 'Mỗi 200 giờ', ds: ['Thay lọc nhớt', 'Thay lọc dầu thủy lực', 'Kiểm tra ống két nước'] },
      { k: 'KB400', h: 400, ten: 'Mỗi 400 giờ', ds: ['Thay dầu truyền động', 'Thay lọc nhiên liệu', 'Báo ENG làm'] }] },
  ];
  G.MAY_MOC = MAY;
  const phut = (a, b) => { const p = (s) => { const x = String(s || '').match(/(\d{1,2}):(\d{2})/); return x ? +x[1] * 60 + +x[2] : null; }; const x = p(a), y = p(b); return x != null && y != null ? Math.max(0, y - x) : 0; };
  G.gioMayTong = async () => {
    const [sc, k] = await Promise.all([G.doc('MaySangCat', undefined, 20000).catch(() => []), G.kubota ? G.kubota().catch(() => ({ dongHo: 0 })) : { dongHo: 0 }]);
    const sang = (ten) => sc.filter((x) => x['Máy'] === ten && x['Bảo trì'] === 'Vận hành' && x['Giờ kết thúc']).reduce((a, x) => a + (num(x['Số giờ']) || phut(x['Giờ bắt đầu'], x['Giờ kết thúc']) / 60), 0);
    return { SM: Math.round(sang('Sand Man') * 10) / 10, HB: Math.round(sang('H.Barber') * 10) / 10, KB: Math.round((k.dongHo || 0) * 10) / 10 };
  };
  /* tìm mốc đến hạn → tạo 1 dòng "Chờ phát hành" cho mỗi máy (gộp các mốc trùng lúc); chỉ Trưởng bộ phận thấy dòng chờ */
  let ktDang = null;
  G.ktBaoTri = () => (ktDang = ktDang || (async () => {
    const [gioM, ph] = await Promise.all([G.gioMayTong(), G.doc('BaoTriPH', undefined, 3000)]);
    for (const m of MAY) {
      const r = ph.filter((x) => x['Máy'] === m.ten); const tong = gioM[m.ma] || 0;
      if (!r.some((x) => x['Trạng thái'] === 'Khởi điểm')) { await imLang(() => API.goi('ghi', { bang: 'BaoTriPH', dong: { 'Mã BT': G.ma('BT'), 'Ngày tạo': hn(), 'Máy': m.ten, 'Mã mốc': '', 'Mốc': 'Mốc khởi điểm', 'Giờ máy': tong, 'Trạng thái': 'Khởi điểm', 'Người ghi': '' } })); continue; }
      const goc = num(r.find((x) => x['Trạng thái'] === 'Khởi điểm')['Giờ máy']);
      const xong = (k) => r.filter((x) => x['Trạng thái'] === 'Đã xong' && String(x['Mã mốc']).split(',').includes(k)).map((x) => num(x['Giờ máy']));
      const mo = r.find((x) => /Chờ phát hành|Đã phát hành/.test(x['Trạng thái']));
      const den = m.moc.filter((c) => { const xx = xong(c.k); if (mo && String(mo['Mã mốc']).split(',').includes(c.k)) return false;
        if (c.dau) return !xx.length && tong >= c.h && goc < c.h; const base = xx.length ? Math.max(...xx) : goc; return tong - base >= c.h; });
      if (!den.length) continue;
      if (mo && mo['Trạng thái'] === 'Chờ phát hành') {
        const ks = String(mo['Mã mốc']).split(',').concat(den.map((c) => c.k)); await imLang(() => API.goi('sua', { bang: 'BaoTriPH', khoa: { 'Mã BT': mo['Mã BT'] }, doi: { 'Mã mốc': ks.join(','), 'Mốc': ks.map((k) => m.moc.find((c) => c.k === k).ten).join(' + '), 'Giờ máy': tong } }));
      } else if (!mo) await imLang(() => API.goi('ghi', { bang: 'BaoTriPH', dong: { 'Mã BT': G.ma('BT'), 'Ngày tạo': hn(), 'Máy': m.ten, 'Mã mốc': den.map((c) => c.k).join(','), 'Mốc': den.map((c) => c.ten).join(' + '), 'Giờ máy': tong, 'Trạng thái': 'Chờ phát hành', 'Người ghi': '' } }));
    }
  })().catch((e) => console.warn(e)).finally(() => { setTimeout(() => { ktDang = null; }, 3000); }));
  const mucCua = (row) => { const m = MAY.find((x) => x.ten === row['Máy']) || { moc: [] }; const ks = String(row['Mã mốc'] || '').split(',');
    return [...new Set(ks.flatMap((k) => (m.moc.find((c) => c.k === k) || { ds: [] }).ds))]; };
  const tiepTheo = (m, tong, ph) => { const r = ph.filter((x) => x['Máy'] === m.ten); const g0 = r.find((x) => x['Trạng thái'] === 'Khởi điểm'); const goc = g0 ? num(g0['Giờ máy']) : tong;
    return m.moc.filter((c) => !c.dau).map((c) => { const xx = r.filter((x) => x['Trạng thái'] === 'Đã xong' && String(x['Mã mốc']).split(',').includes(c.k)).map((x) => num(x['Giờ máy'])); const base = xx.length ? Math.max(...xx) : goc; return { c, con: Math.max(0, c.h - (tong - base)) }; })
      .sort((a, b) => a.con - b.con)[0]; };

  /* ---------- kiểm tra dụng cụ ngẫu nhiên: đủ 4 lần/tháng, 4 chặng 1–7, 8–14, 15–21, 22–cuối tháng ---------- */
  const chang = (d) => { const n = +d.slice(8, 10); return n <= 7 ? 1 : n <= 14 ? 2 : n <= 21 ? 3 : 4; };
  const cuoiChang = (d) => { const c = chang(d); if (c < 4) return d.slice(0, 8) + String(c * 7).padStart(2, '0'); const x = new Date(+d.slice(0, 4), +d.slice(5, 7), 0); return d.slice(0, 8) + String(x.getDate()).padStart(2, '0'); };
  const dangKT = {}; G.ktDungCu = (nguoi) => (dangKT[nguoi] = dangKT[nguoi] || ktDungCu1(nguoi).finally(() => { setTimeout(() => { delete dangKT[nguoi]; }, 1500); }));
  const ktDungCu1 = async (nguoi) => {
    const thang = hn().slice(0, 7); const rows = (await G.doc('KiemTraDC', { 'Tháng': thang }).catch(() => [])).filter((x) => x['Người'] === nguoi);
    const homNay = rows.find((x) => x['Ngày giao'] === hn()); if (homNay) return homNay;
    if (gio() < '09:00') return null; const nghi = await G.nghiNB().catch(() => []); if (nghi.includes(nguoi)) return null;
    const giu = (await G.doc('DungCu').catch(() => [])).filter((x) => x['Người giữ'] === nguoi && !/Mất|Thanh lý/.test(x['Trạng thái'] || '')); if (!giu.length) return null;
    const can = chang(hn()) - rows.length; if (can <= 0) return null;
    const conNgay = +cuoiChang(hn()).slice(8) - +hn().slice(8) + 1;
    if (bam(nguoi + hn()) >= Math.min(1, can / conNgay)) return null;
    const dong = { 'Mã KT': G.ma('KT'), 'Tháng': thang, 'Lần': rows.length + 1, 'Chặng': chang(hn()), 'Ngày giao': hn(), 'Người': nguoi, 'Trạng thái': 'Chờ nộp', 'Kết quả': '', 'Ảnh': '', 'Ghi chú': '', 'Giờ nộp': '' };
    await imLang(() => API.goi('ghi', { bang: 'KiemTraDC', dong })); return dong;
  };
  async function viecKhoCuaToi() {
    const out = []; await G.ktBaoTri();
    const ph = (await G.doc('BaoTriPH', { 'Trạng thái': 'Đã phát hành' })).filter((x) => x['Giao cho'] === S.u.ten);
    ph.forEach((x) => out.push({ ten: `🔧 Bảo trì ${x['Máy']} · ${x['Mốc']}`, link: 'kho/may', tt: 'chua', phu: 'Trưởng bộ phận đã phát hành ' + G.ngayVN(x['Ngày phát hành'] || '').slice(0, 5) }));
    const kt = await G.ktDungCu(S.u.ten);
    if (kt) out.push({ ten: `🧰 Kiểm tra dụng cụ (lần ${kt['Lần']}/4)`, link: 'kho/dungcu', tt: kt['Trạng thái'] === 'Đã nộp' ? 'xong' : 'chua', phu: kt['Trạng thái'] === 'Đã nộp' ? '✓ ' + (kt['Kết quả'] || '') : 'Chụp ảnh dụng cụ đang giữ, báo số lượng' });
    return out;
  }

  /* ---------- chuông: Trưởng bộ phận (bảo trì chờ phát hành, máy hỏng, vật tư sắp hết, báo mất/hỏng dụng cụ); nội bộ (trả dụng cụ chung 17:30) ---------- */
  const chuongGoc = G.dsChuong;
  G.dsChuong = async () => { const out = await chuongGoc(); try {
    if (laAnh() && q('noibo') >= 1) {
      await G.ktBaoTri(); const [ph, hong, dc, kt] = await Promise.all([G.doc('BaoTriPH', { 'Trạng thái': 'Chờ phát hành' }), G.doc('MayHong'), G.doc('DungCu'), G.doc('KiemTraDC', { 'Trạng thái': 'Chờ nộp' })]);
      ph.forEach((x) => { const n = Math.round((new Date(hn()) - new Date(x['Ngày tạo'])) / 864e5); out.push({ ten: `🔧 Đến hạn bảo trì ${x['Máy']}`, phu: x['Mốc'] + (n >= 3 ? ` · đã ${n} ngày chưa phát hành` : ' · xem và phát hành'), link: 'kho/may' }); });
      hong.filter((x) => x['Trạng thái'] !== 'Đã sửa xong').forEach((x) => out.push({ ten: `🔴 ${x['Máy']} đang hỏng`, phu: `${x['Lỗi']} · ${x['Trạng thái']} từ ${G.ngayVN(x['Ngày báo']).slice(0, 5)}`, link: 'kho/may' }));
      (await G.khoTon()).filter((x) => x.tt[0] !== 'xanh').forEach((x) => out.push({ ten: `📦 ${x.v['Tên']} ${x.tt[1].slice(3).toLowerCase()}`, phu: `Còn ${so(x.t)} ${x.v['ĐVT']}`, link: 'kho/vattu' }));
      dc.filter((x) => /^Báo /.test(x['Trạng thái'] || '')).forEach((x) => out.push({ ten: `🧰 ${x['Tên']} · ${x['Trạng thái'].toLowerCase()}`, phu: x['Người giữ'], link: 'kho/dungcu' }));
      kt.filter((x) => (new Date(hn()) - new Date(x['Ngày giao'])) / 864e5 >= 2).forEach((x) => out.push({ ten: `🧰 ${ngan(x['Người'])} chưa gửi kiểm tra dụng cụ`, phu: 'Giao ngày ' + G.ngayVN(x['Ngày giao']).slice(0, 5), link: 'kho/dungcu' }));
    }
    if (laNB()) {
      const mu = (await G.doc('DungCuMuon')).filter((x) => x['Người'] === S.u.ten && !x['Giờ trả']);
      if (gio() >= '17:30') mu.forEach((x) => out.push({ ten: `🧰 Chưa trả ${x['Tên']}`, phu: 'Mượn lúc ' + String(x['Giờ mượn']).slice(11, 16) + ' · bấm Trả khi cất lại', link: 'kho/dungcu' }));
      const kt = await G.ktDungCu(S.u.ten); if (kt && kt['Trạng thái'] !== 'Đã nộp' && gio() >= '17:30') out.push({ ten: '🧰 Hôm nay chưa gửi kiểm tra dụng cụ', phu: 'Chụp ảnh dụng cụ đang giữ', link: 'kho/dungcu' });
    }
  } catch (e) { /* bỏ qua */ } return out; };

  /* ---------- màn Kho & tài sản ---------- */
  const TAB = [['vattu', '📦 Vật tư'], ['dungcu', '🧰 Dụng cụ'], ['may', '🚜 Máy móc']];
  G.man.kho = { ten: 'Kho & tài sản', bt: '📦', ic: 'kho', nhom: 'Nhân viên nội bộ', ph: 'noibo', fn: async (tab) => {
    tab = TAB.some((x) => x[0] === tab) ? tab : 'vattu';
    const m = G.khung('Kho & tài sản', 'Vật tư · dụng cụ · máy móc của nội bộ', '#/viec');
    m.innerHTML = `<div class="chon kho-tab">${TAB.map(([k, t]) => `<a href="#/kho/${k}" class="${k === tab ? 'dang' : ''}">${t}</a>`).join('')}</div><div id="khoNoi"><div class="dang-tai">Đang tải…</div></div>`;
    const o = m.querySelector('#khoNoi');
    await (tab === 'vattu' ? manVatTu(o) : tab === 'dungcu' ? manDungCu(o) : manMay(o));
  } };

  /* ===== 📦 VẬT TƯ ===== */
  async function manVatTu(o) {
    const k = await taiKho(); const ds = k.vt.map((v) => { const t = ton(k.gd, v['Mã VT']); return { v, t, tt: ttVT(v, t), nd: duNgay(k.gd, v['Mã VT'], t) }; });
    const thu = { do: 0, cam: 1, xanh: 2 }; const nhom = {}; ds.sort((a, b) => thu[a.tt[0]] - thu[b.tt[0]]).forEach((x) => { (nhom[x.v['Nhóm'] || 'Khác'] = nhom[x.v['Nhóm'] || 'Khác'] || []).push(x); });
    const sap = ds.filter((x) => x.tt[0] !== 'xanh');
    o.innerHTML = `<div class="nhom-nut" style="margin-bottom:10px">${laAnh() ? '<button class="nut chinh" id="nhap">＋ Nhập kho</button><button class="nut" id="moiVT">＋ Vật tư mới</button>' : ''}${laNB() ? '<button class="nut chinh" id="lay">📤 Xuất kho</button>' : ''}</div>
      ${sap.length ? `<div class="the the-do"><b>${sap.length} món sắp hết hoặc đã hết</b><div class="mo">${sap.map((x) => esc(x.v['Tên'])).join(', ')}</div></div>` : ''}
      ${ds.length ? Object.keys(nhom).map((n) => `<h3 class="tieu-nhom">${esc(n)}</h3><div class="luoi-vt">${nhom[n].map((x) => `<button type="button" class="the vt-o vt-${x.tt[0]}" data-vt="${esc(x.v['Mã VT'])}">
        <span class="gian"><b>${esc(x.v['Tên'])}</b><small class="mo">${esc(x.v['Vị trí kho'] || '')}${x.v['Người dùng'] ? ' · ' + esc(x.v['Người dùng']) : ''}</small></span>
        <span class="vt-so"><b>${so(x.t)}</b> <small>${esc(x.v['ĐVT'])}</small></span><span class="chip ${x.tt[0]}">${x.tt[1]}</span>${x.nd != null ? `<small class="mo">đủ khoảng ${x.nd} ngày</small>` : ''}</button>`).join('')}</div>`).join('')
      : G.trong(laAnh() ? 'Chưa có vật tư. Bấm ＋ Vật tư mới để lập danh mục kho.' : 'Kho chưa có vật tư.')}
      <details class="the" style="margin-top:12px"><summary><b>Nhập, xuất gần đây</b></summary><div class="ds">${k.gd.slice(-30).reverse().map((x) => `<div class="muc"><div class="gian"><b>${esc(x['Loại'])} · ${esc(x['Tên VT'])}</b><div class="mo">${G.ngayVN(x['Ngày'])} · ${esc(ngan(x['Người']))}${x['Việc'] ? ' · ' + esc(x['Việc']) : ''}</div></div><b>${x['Loại'] === 'Xuất' ? '−' : '+'}${so(x['Số lượng'])}</b></div>`).join('') || G.trong('Chưa có')}</div></details>`;
    const b = (id) => o.querySelector('#' + id);
    if (b('nhap')) b('nhap').onclick = () => formNhap(k);
    if (b('moiVT')) b('moiVT').onclick = () => formVT();
    if (b('lay')) b('lay').onclick = () => formLay(k, null);
    o.querySelectorAll('[data-vt]').forEach((x) => { x.onclick = () => theVT(k, x.dataset.vt); });
  }
  const chonVTHtml = (ds, k) => `<div class="luoi-vt vt-chon">${ds.map((v) => `<button type="button" class="the vt-o" data-c="${esc(v['Mã VT'])}"><b>${esc(v['Tên'])}</b><small class="mo">Còn ${so(ton(k.gd, v['Mã VT']))} ${esc(v['ĐVT'])}</small></button>`).join('')}</div>`;
  const oSo = (v, gt) => `<div class="hang so-nut" style="gap:10px;justify-content:center;margin:12px 0"><button type="button" class="nut" data-d="-1" style="min-width:56px;font-size:22px">−</button><input type="number" inputmode="decimal" id="sl" value="${gt || buoc(v['ĐVT'])}" step="${buoc(v['ĐVT'])}" min="0" style="max-width:110px;text-align:center;font-size:22px"><b>${esc(v['ĐVT'])}</b><button type="button" class="nut" data-d="1" style="min-width:56px;font-size:22px">＋</button></div>`;
  const ganSo = (o, v) => o.querySelectorAll('[data-d]').forEach((n) => { n.onclick = () => { const i = o.querySelector('#sl'); i.value = Math.max(0, Math.round((num(i.value) + +n.dataset.d * buoc(v['ĐVT'])) * 10) / 10); }; });
  function formLay(k, ma) {
    const toi = ngan(S.u.ten); const ds = k.vt.filter((v) => !v['Người dùng'] || v['Người dùng'] === 'Chung' || v['Người dùng'] === toi);
    G.hop('📤 Xuất kho', `<div id="b1">${ma ? '' : '<p class="mo" style="margin-top:0">Bấm vào món cần xuất:</p>' + chonVTHtml(ds, k)}</div><div id="b2"></div>`, (o, dong) => {
      const chon = (m) => { const v = k.vt.find((x) => x['Mã VT'] === m); o.querySelector('#b1').innerHTML = `<div class="the"><b>${esc(v['Tên'])}</b><div class="mo">Còn ${so(ton(k.gd, m))} ${esc(v['ĐVT'])}</div></div>`;
        o.querySelector('#b2').innerHTML = oSo(v) + `<label class="o"><span>Dùng cho việc gì (không bắt buộc)</span><input id="vi" placeholder="Ví dụ: thay chậu sảnh"></label><button class="nut chinh rong" id="l">Lưu</button>`; ganSo(o, v);
        o.querySelector('#l').onclick = (e) => chay(async () => { const sl = num(o.querySelector('#sl').value); if (!(sl > 0)) throw new Error('Nhập số lượng');
          await xuatKho(v, sl, o.querySelector('#vi').value.trim(), ''); dong(); bao('Đã xuất kho ' + so(sl) + ' ' + v['ĐVT'] + ' ' + v['Tên']); G.taiLai(); }, e.target); };
      o.querySelectorAll('[data-c]').forEach((x) => { x.onclick = () => chon(x.dataset.c); }); if (ma) chon(ma);
    });
  }
  const xuatKho = (v, sl, viec, goc) => API.goi('ghi', { bang: 'KhoGiaoDich', dong: { 'Mã GD': G.ma('GD'), 'Ngày': '', 'Giờ': API.bayGio(), 'Mã VT': v['Mã VT'], 'Tên VT': v['Tên'], 'Loại': 'Xuất', 'Số lượng': sl, 'Việc': viec || '', 'Mã ghi gốc': goc || '', 'Người': '', 'Ảnh': '', 'Ghi chú': '' } });
  function formNhap(k, ma) {
    G.hop('＋ Nhập kho', `<div id="b1">${ma ? '' : '<p class="mo" style="margin-top:0">Chọn món nhập về:</p>' + chonVTHtml(k.vt, k)}</div><div id="b2"></div>`, (o, dong) => {
      const chon = (m) => { const v = k.vt.find((x) => x['Mã VT'] === m); o.querySelector('#b1').innerHTML = `<div class="the"><b>${esc(v['Tên'])}</b><div class="mo">Đang còn ${so(ton(k.gd, m))} ${esc(v['ĐVT'])}</div></div>`;
        o.querySelector('#b2').innerHTML = oSo(v) + '<div id="f"></div><button class="nut chinh rong" id="l">Lưu nhập kho</button>'; ganSo(o, v);
        const lay = G.form(o.querySelector('#f'), [{ k: 'nguon', nhan: 'Nguồn hàng', loai: 'chips', ds: ['Công ty mua', 'Trưởng bộ phận tự mua'], bb: true, gt: 'Công ty mua' }, { k: 'gia', nhan: 'Đơn giá mỗi ' + v['ĐVT'] + ' (VNĐ)', loai: 'so', bb: true }, { k: 'anh', nhan: 'Ảnh hàng hoặc hóa đơn', loai: 'anh', toiDa: 3 }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
        o.querySelector('#l').onclick = (e) => chay(async () => { const sl = num(o.querySelector('#sl').value); if (!(sl > 0)) throw new Error('Nhập số lượng'); const x = lay();
          await API.goi('ghi', { bang: 'KhoGiaoDich', dong: { 'Mã GD': G.ma('GD'), 'Ngày': '', 'Giờ': API.bayGio(), 'Mã VT': m, 'Tên VT': v['Tên'], 'Loại': 'Nhập', 'Số lượng': sl, 'Đơn giá': x.gia || '', 'Nguồn': x.nguon, 'Thành tiền': Math.round(sl * num(x.gia)), 'Việc': '', 'Mã ghi gốc': '', 'Người': '', 'Ảnh': x.anh, 'Ghi chú': x.gc } });
          dong(); bao('Đã nhập ' + so(sl) + ' ' + v['ĐVT']); G.taiLai(); }, e.target); };
      o.querySelectorAll('[data-c]').forEach((x) => { x.onclick = () => chon(x.dataset.c); }); if (ma) chon(ma);
    });
  }
  function formVT(cu) {
    G.hop(cu ? 'Sửa vật tư' : '＋ Vật tư mới', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ten', nhan: 'Tên vật tư', loai: 'chu', bb: true, gt: cu && cu['Tên'] }, { k: 'nhom', nhan: 'Nhóm', loai: 'chips', ds: NHOM_VT, bb: true, gt: cu ? cu['Nhóm'] : 'Phân bón' },
        { k: 'dvt', nhan: 'Đơn vị', loai: 'chips', ds: ['kg', 'lít', 'bao', 'chai', 'gói', 'cái', 'đôi', 'cuộn'], bb: true, gt: cu ? cu['ĐVT'] : 'kg' }, { k: 'min', nhan: 'Mức tối thiểu (dưới mức này app báo)', loai: 'so', gt: cu ? cu['Tồn tối thiểu'] : '' },
        { k: 'ai', nhan: 'Ai dùng', loai: 'chips', ds: ['Hiệp', 'Nghị', 'Chung'], gt: cu ? cu['Người dùng'] || 'Chung' : 'Chung' }, { k: 'cho', nhan: 'Tự trừ khi ghi việc nào', loai: 'nhieu', ds: VIEC_VT.map((x) => x[1]), gt: cu ? String(cu['Dùng cho'] || '').split(',').map((l) => (VIEC_VT.find((x) => x[0] === l) || [])[1]).filter(Boolean) : [] },
        { k: 'cho2', nhan: 'Để ở đâu trong kho (ví dụ: Kệ xanh, ngăn 2)', loai: 'chu', gt: cu && cu['Vị trí kho'] }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const dong_ = { 'Tên': v.ten, 'Nhóm': v.nhom, 'ĐVT': v.dvt, 'Tồn tối thiểu': v.min || 0, 'Người dùng': v.ai, 'Dùng cho': (v.cho || []).map((t) => VIEC_VT.find((x) => x[1] === t)[0]).join(','), 'Vị trí kho': v.cho2 || '' };
        if (cu) await API.goi('sua', { bang: 'KhoVatTu', khoa: { 'Mã VT': cu['Mã VT'] }, doi: dong_ }); else await API.goi('ghi', { bang: 'KhoVatTu', dong: Object.assign({ 'Mã VT': G.ma('VT'), 'Trạng thái': 'Đang dùng', 'Ảnh': '' }, dong_) });
        dong(); bao('Đã lưu'); G.taiLai(); }, e.target);
    });
  }
  function theVT(k, ma) {
    const v = k.vt.find((x) => x['Mã VT'] === ma); const t = ton(k.gd, ma); const ls = k.gd.filter((x) => x['Mã VT'] === ma).slice(-40).reverse(); const nd = duNgay(k.gd, ma, t);
    const thang = hn().slice(0, 7); const dungT = ls.filter((x) => x['Loại'] === 'Xuất' && String(x['Ngày']).startsWith(thang)).reduce((a, x) => a + num(x['Số lượng']), 0);
    G.hop(v['Tên'], `<div class="luoi2"><div class="the"><small class="mo">Còn trong kho</small><div class="so-lon">${so(t)} ${esc(v['ĐVT'])}</div></div><div class="the"><small class="mo">Đã dùng tháng này</small><div class="so-lon">${so(dungT)} ${esc(v['ĐVT'])}</div></div></div>
      <p class="mo">${esc(v['Nhóm'] || '')} · tối thiểu ${so(v['Tồn tối thiểu'])} ${esc(v['ĐVT'])}${v['Vị trí kho'] ? ' · để ở ' + esc(v['Vị trí kho']) : ''}${nd != null ? ' · đủ dùng khoảng ' + nd + ' ngày' : ''}</p>${v['Ảnh'] ? `<div>${G.xemAnh(v['Ảnh'])}</div>` : ''}
      <div class="nhom-nut">${laNB() ? '<button class="nut chinh" id="lay">📤 Xuất kho</button>' : ''}${laAnh() ? '<button class="nut chinh" id="nhap">＋ Nhập kho</button><button class="nut" id="sua">Sửa</button><button class="nut" id="kk">Kiểm kê</button>' : ''}</div>
      <h3 class="tieu-nhom">Lịch sử</h3><div class="ds">${ls.map((x) => `<div class="muc"><div class="gian"><b>${esc(x['Loại'])}${x['Việc'] ? ' · ' + esc(x['Việc']) : ''}</b><div class="mo">${G.ngayVN(x['Ngày'])} ${esc(String(x['Giờ'] || '').slice(11, 16))} · ${esc(x['Người'])}${x['Nguồn'] ? ' · ' + esc(x['Nguồn']) : ''}${x['Ghi chú'] ? ' · ' + esc(x['Ghi chú']) : ''}</div>${x['Ảnh'] ? G.xemAnh(x['Ảnh']) : ''}</div><b>${x['Loại'] === 'Xuất' ? '−' : x['Loại'] === 'Kiểm kê' && num(x['Số lượng']) < 0 ? '' : '+'}${so(x['Số lượng'])}</b></div>`).join('') || G.trong('Chưa có')}</div>`, (o, dong) => {
      const b = (id) => o.querySelector('#' + id);
      if (b('lay')) b('lay').onclick = () => { dong(); formLay(k, ma); };
      if (b('nhap')) b('nhap').onclick = () => { dong(); formNhap(k, ma); };
      if (b('sua')) b('sua').onclick = () => { dong(); formVT(v); };
      if (b('kk')) b('kk').onclick = async () => { const tt = await G.hoi(`Đếm thực tế ${v['Tên']} (${v['ĐVT']}), trên app đang là ${so(t)}`, String(t)); if (tt == null) return; const lech = Math.round((num(tt) - t) * 10) / 10;
        if (!lech) { bao('Khớp, không cần điều chỉnh'); return; } const ly = await G.hoi('Lý do chênh lệch ' + (lech > 0 ? '+' : '') + so(lech) + ' ' + v['ĐVT']); if (ly == null) return;
        chay(async () => { await API.goi('ghi', { bang: 'KhoGiaoDich', dong: { 'Mã GD': G.ma('GD'), 'Ngày': '', 'Giờ': API.bayGio(), 'Mã VT': ma, 'Tên VT': v['Tên'], 'Loại': 'Kiểm kê', 'Số lượng': lech, 'Việc': '', 'Mã ghi gốc': '', 'Người': '', 'Ảnh': '', 'Ghi chú': ly } }); dong(); bao('Đã điều chỉnh theo số đếm thực tế'); G.taiLai(); }); };
    });
  }
  G._kho = { taiKho, ton, ttVT, duNgay, xuatKho, formLay, formNhap, formVT, theVT, manVatTu, manMay, formKiemTra, formHongDC, nb2, tenDu, ngan, NHOM_VT, VIEC_VT, MAY };
  /* tự trừ kho khi nội bộ ghi việc: hỏi một lần "đã dùng vật tư gì" (bỏ qua được); đổ xăng máy sàng thì trừ thẳng */
  const goiGoc = API.goi;
  API.goi = async function (hd, r) {
    const kq = await goiGoc.apply(this, arguments);
    try {
      if ((hd === 'ghi' || hd === 'ghiNhieu') && r && S.u && laNB()) {
        const dong1 = Array.isArray(r.dong) ? r.dong[0] : r.dong;
        if (r.bang === 'MaySangCat' && dong1 && dong1['Bảo trì'] === 'Đổ xăng' && num(dong1['Nhiên liệu (lít)']) > 0) {
          const k = await taiKho(); const v = k.vt.find((x) => /xăng/i.test(x['Tên'])); if (v) await imLang(() => xuatKho(v, num(dong1['Nhiên liệu (lít)']), 'Đổ xăng ' + (dong1['Máy'] || 'máy sàng'), ''));
        } else if (BANG_VIEC[r.bang]) setTimeout(() => hoiVatTu(BANG_VIEC[r.bang], dong1 || {}), 450);
      }
    } catch (e) { console.warn(e); }
    return kq;
  };
  async function hoiVatTu(link, dong1) {
    const k = await taiKho(); const toi = ngan(S.u.ten);
    const ds = k.vt.filter((v) => String(v['Dùng cho'] || '').split(',').includes(link) && (!v['Người dùng'] || v['Người dùng'] === 'Chung' || v['Người dùng'] === toi)); if (!ds.length) return;
    const tenViec = (VIEC_VT.find((x) => x[0] === link) || [, ''])[1]; const goiY = String(dong1['Tên phân'] || '').toLowerCase();
    const sl = {}; ds.forEach((v) => { sl[v['Mã VT']] = 0; });
    G.hop('Có dùng vật tư trong kho không?', `<p class="mo" style="margin-top:0">${esc(tenViec)} · bấm ＋ cho món đã dùng, không dùng thì bấm Không dùng.</p><div class="ds">${ds.map((v) => `<div class="muc" style="gap:8px"><div class="gian"><b>${esc(v['Tên'])}</b>${goiY && v['Tên'].toLowerCase().includes(goiY.split(' ')[0]) ? ' <span class="chip xanh">vừa chọn</span>' : ''}<div class="mo">còn ${so(ton(k.gd, v['Mã VT']))} ${esc(v['ĐVT'])}</div></div>
      <button type="button" class="nut nho" data-tru="${esc(v['Mã VT'])}">−</button><b data-sl="${esc(v['Mã VT'])}" style="min-width:44px;text-align:center">0</b><button type="button" class="nut nho" data-cong="${esc(v['Mã VT'])}">＋</button><small>${esc(v['ĐVT'])}</small></div>`).join('')}</div>
      <div class="nhom-nut" style="margin-top:12px"><button class="nut" id="ko">Không dùng</button><button class="nut chinh" id="l">Lưu</button></div>`, (o, dong) => {
      const ve = (m) => { o.querySelector(`[data-sl="${m}"]`).textContent = so(sl[m]); };
      o.querySelectorAll('[data-cong]').forEach((b) => { b.onclick = () => { const m = b.dataset.cong; const v = ds.find((x) => x['Mã VT'] === m); sl[m] = Math.round((sl[m] + buoc(v['ĐVT'])) * 10) / 10; ve(m); }; });
      o.querySelectorAll('[data-tru]').forEach((b) => { b.onclick = () => { const m = b.dataset.tru; const v = ds.find((x) => x['Mã VT'] === m); sl[m] = Math.max(0, Math.round((sl[m] - buoc(v['ĐVT'])) * 10) / 10); ve(m); }; });
      o.querySelector('#ko').onclick = dong;
      o.querySelector('#l').onclick = (e) => chay(async () => { const co = ds.filter((v) => sl[v['Mã VT']] > 0); for (const v of co) await xuatKho(v, sl[v['Mã VT']], tenViec, ''); dong(); if (co.length) bao('Đã trừ kho ' + co.length + ' món'); }, e.target);
    });
  }

  /* ===== 🧰 DỤNG CỤ ===== */
  async function manDungCu(o) {
    const thang = hn().slice(0, 7);
    if (laNB()) await G.ktDungCu(S.u.ten).catch(() => null); else if (laAnh()) { for (const t of nb2()) await G.ktDungCu(t).catch(() => null); }
    const d = await G.docNhieu([{ bang: 'DungCu', gioiHan: 2000 }, { bang: 'DungCuMuon', gioiHan: 3000 }, { bang: 'KiemTraDC', loc: { 'Tháng': thang } }]);
    const dc = (d.DungCu || []).filter((x) => !/Thanh lý/.test(x['Trạng thái'] || '')); const mu = (d.DungCuMuon || []).filter((x) => !x['Giờ trả']); const kt = d.KiemTraDC || [];
    const dangMuon = (ma) => mu.find((x) => x['Mã DC'] === ma);
    const nguoi = laNB() ? [S.u.ten].concat(nb2().filter((t) => t !== S.u.ten)) : nb2();
    const kt4 = (t) => { const r = kt.filter((x) => x['Người'] === t).sort((a, b) => (a['Lần'] > b['Lần'] ? 1 : -1)); return [1, 2, 3, 4].map((i) => { const x = r.find((y) => +y['Lần'] === i);
      return x ? `<button type="button" class="o-kt ${x['Trạng thái'] === 'Đã nộp' ? (x['Kết quả'] === 'Đủ' ? 'xanh' : 'cam') : 'cho'}" data-kt="${esc(x['Mã KT'])}" title="${esc(G.ngayVN(x['Ngày giao']))}">${x['Trạng thái'] === 'Đã nộp' ? (x['Kết quả'] === 'Đủ' ? '✓' : '⚠') : '…'}<small>${esc(G.ngayVN(x['Ngày giao']).slice(0, 5))}</small></button>` : `<span class="o-kt trong">${i}</span>`; }).join(''); };
    const cuaToi = laNB() ? kt.find((x) => x['Người'] === S.u.ten && x['Ngày giao'] === hn() && x['Trạng thái'] !== 'Đã nộp') : null;
    const hangDC = (x) => { const mm = dangMuon(x['Mã DC']); return `<div class="muc dc-muc" style="gap:8px"><div class="gian"><b>${esc(x['Mã DC'])} · ${esc(x['Tên'])}</b><div class="mo">${x['Trạng thái'] && x['Trạng thái'] !== 'Tốt' ? `<span class="chip cam">${esc(x['Trạng thái'])}</span> ` : ''}${mm ? '🔴 ' + esc(ngan(mm['Người'])) + ' đang mượn từ ' + esc(String(mm['Giờ mượn']).slice(11, 16)) : x['Loại'] === 'Chung' ? '🟢 Ở kho' : 'Giao ' + esc(G.ngayVN(x['Ngày giao'] || '').slice(0, 5))}</div></div>
      ${x['Loại'] === 'Chung' && laNB() ? (mm ? (mm['Người'] === S.u.ten ? `<button class="nut nho chinh" data-tra="${esc(mm['Mã'])}">Trả</button>` : '') : `<button class="nut nho" data-muon="${esc(x['Mã DC'])}">Mượn</button>`) : ''}
      ${laNB() && (x['Người giữ'] === S.u.ten || (x['Loại'] === 'Chung' && mm && mm['Người'] === S.u.ten)) && !/^Báo /.test(x['Trạng thái'] || '') ? `<button class="nut nho" data-hong="${esc(x['Mã DC'])}">Báo hỏng, mất</button>` : ''}
      ${laAnh() ? `<button class="nut nho" data-sdc="${esc(x['Mã DC'])}">${/^Báo /.test(x['Trạng thái'] || '') ? 'Xử lý' : 'Sửa'}</button>` : ''}</div>`; };
    o.innerHTML = `${cuaToi ? `<div class="the the-mo"><b>🧰 Hôm nay kiểm tra dụng cụ (lần ${esc(cuaToi['Lần'])}/4)</b><p class="mo" style="margin:4px 0 8px">Bày hết dụng cụ đang giữ ra, chụp 1 ảnh, bấm Đủ hoặc chọn món thiếu, hỏng.</p><button class="nut chinh rong" id="ktNop" style="min-height:56px">Kiểm tra ngay</button></div>` : ''}
      ${laAnh() ? '<div class="nhom-nut" style="margin-bottom:10px"><button class="nut chinh" id="moiDC">＋ Thêm dụng cụ</button></div>' : ''}
      <div class="the"><b>Kiểm tra ngẫu nhiên tháng ${esc(thang.slice(5))}/${esc(thang.slice(0, 4))}</b><div class="mo" style="margin-bottom:6px">Đủ 4 lần mỗi tháng · ngày do app chọn ngẫu nhiên, đúng ngày đi làm</div>
        ${nb2().map((t) => `<div class="hang" style="gap:8px;margin:6px 0"><b style="min-width:58px">${esc(ngan(t))}</b>${kt4(t)}</div>`).join('')}</div>
      ${nguoi.map((t) => { const r = dc.filter((x) => x['Loại'] !== 'Chung' && x['Người giữ'] === t); return `<h3 class="tieu-nhom">${esc(ngan(t))} đang giữ (${r.length})</h3><div class="ds">${r.map(hangDC).join('') || G.trong('Chưa giao dụng cụ')}</div>`; }).join('')}
      <h3 class="tieu-nhom">Dùng chung</h3><div class="ds">${dc.filter((x) => x['Loại'] === 'Chung').map(hangDC).join('') || G.trong('Chưa có')}</div>`;
    const b = (id) => o.querySelector('#' + id);
    if (b('ktNop')) b('ktNop').onclick = () => formKiemTra(cuaToi, dc.filter((x) => x['Người giữ'] === S.u.ten && x['Loại'] !== 'Chung'));
    if (b('moiDC')) b('moiDC').onclick = () => formDC();
    o.querySelectorAll('[data-muon]').forEach((x) => { x.onclick = () => chay(async () => { const c = dc.find((y) => y['Mã DC'] === x.dataset.muon); await API.goi('ghi', { bang: 'DungCuMuon', dong: { 'Mã': G.ma('MU'), 'Mã DC': c['Mã DC'], 'Tên': c['Tên'], 'Người': S.u.ten, 'Giờ mượn': API.bayGio(), 'Giờ trả': '', 'Ngày': '' } }); bao('Đã mượn ' + c['Tên']); G.taiLai(); }, x); });
    o.querySelectorAll('[data-tra]').forEach((x) => { x.onclick = () => chay(async () => { await API.goi('sua', { bang: 'DungCuMuon', khoa: { 'Mã': x.dataset.tra }, doi: { 'Giờ trả': API.bayGio() } }); bao('Đã trả'); G.taiLai(); }, x); });
    o.querySelectorAll('[data-hong]').forEach((x) => { x.onclick = () => formHongDC(dc.find((y) => y['Mã DC'] === x.dataset.hong)); });
    o.querySelectorAll('[data-sdc]').forEach((x) => { x.onclick = () => formDC(dc.find((y) => y['Mã DC'] === x.dataset.sdc)); });
    o.querySelectorAll('[data-kt]').forEach((x) => { x.onclick = () => { const r = kt.find((y) => y['Mã KT'] === x.dataset.kt);
      G.hop(`Kiểm tra dụng cụ · ${ngan(r['Người'])} · lần ${r['Lần']}`, `<p>${r['Trạng thái'] === 'Đã nộp' ? `<b>${esc(r['Kết quả'])}</b> · gửi lúc ${esc(String(r['Giờ nộp']).slice(11, 16))} ${G.ngayVN(r['Ngày giao'])}` : 'Giao ngày ' + G.ngayVN(r['Ngày giao']) + ', chưa gửi'}</p>${r['Ghi chú'] ? `<p class="mo">${esc(r['Ghi chú'])}</p>` : ''}${G.xemAnh(r['Ảnh'])}`); }; });
  }
  function formKiemTra(r, giu) {
    G.hop(`Kiểm tra dụng cụ · lần ${r['Lần']}/4`, `<p class="mo" style="margin-top:0">Bạn đang giữ ${giu.length} món. Bỏ chọn món nào không còn đủ hoặc bị hỏng.</p><div class="ds">${giu.map((x) => `<label class="muc"><input type="checkbox" data-c="${esc(x['Mã DC'])}" checked> <span class="gian">${esc(x['Mã DC'])} · ${esc(x['Tên'])}</span></label>`).join('')}</div><div id="f"></div><button class="nut chinh rong" id="l">Gửi</button>`, (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'anh', nhan: 'Ảnh dụng cụ đang giữ', loai: 'anh', bb: true, toiDa: 3 }, { k: 'gc', nhan: 'Ghi chú (món thiếu, hỏng thế nào)', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const thieu = giu.filter((x) => !o.querySelector(`[data-c="${x['Mã DC']}"]`).checked);
        if (thieu.length && !v.gc) throw new Error('Ghi rõ món thiếu, hỏng thế nào');
        await API.goi('sua', { bang: 'KiemTraDC', khoa: { 'Mã KT': r['Mã KT'] }, doi: { 'Trạng thái': 'Đã nộp', 'Kết quả': thieu.length ? 'Thiếu, hỏng: ' + thieu.map((x) => x['Tên']).join(', ') : 'Đủ', 'Ảnh': (v.anh || []).join(' | '), 'Ghi chú': v.gc || '', 'Giờ nộp': API.bayGio() } });
        for (const x of thieu) await API.goi('sua', { bang: 'DungCu', khoa: { 'Mã DC': x['Mã DC'] }, doi: { 'Trạng thái': 'Báo thiếu, hỏng' } });
        dong(); bao(thieu.length ? 'Đã gửi, Trưởng bộ phận sẽ xem món thiếu' : 'Đã gửi · đủ ' + giu.length + ' món'); G.taiLai(); }, e.target);
    });
  }
  function formHongDC(x) {
    G.hop('Báo hỏng, mất · ' + x['Tên'], '<div id="f"></div><button class="nut chinh rong" id="l">Gửi</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'loai', nhan: 'Tình trạng', loai: 'chips', ds: ['Hỏng', 'Mất'], bb: true }, { k: 'anh', nhan: 'Ảnh', loai: 'anh', toiDa: 2 }, { k: 'ly', nhan: 'Lý do', loai: 'mota', bb: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); if (v.loai === 'Hỏng' && !(v.anh || []).length) throw new Error('Báo hỏng cần ảnh');
        await API.goi('sua', { bang: 'DungCu', khoa: { 'Mã DC': x['Mã DC'] }, doi: { 'Trạng thái': 'Báo ' + v.loai.toLowerCase(), 'Ghi chú': v.ly, 'Ảnh': (v.anh || []).join(' | ') } }); dong(); bao('Đã báo Trưởng bộ phận'); G.taiLai(); }, e.target);
    });
  }
  function formDC(cu) {
    const ds = nb2().concat(['Dùng chung']);
    G.hop(cu ? cu['Mã DC'] + ' · ' + cu['Tên'] : '＋ Thêm dụng cụ', `${cu && /^Báo /.test(cu['Trạng thái'] || '') ? `<div class="the the-mo"><b>${esc(cu['Trạng thái'])}</b><p class="mo">${esc(cu['Ghi chú'] || '')}</p>${G.xemAnh(cu['Ảnh'])}<div class="nhom-nut"><button class="nut" id="daSua">Đã sửa, dùng tiếp</button><button class="nut chinh" id="thanhLy">Thanh lý</button></div></div>` : ''}<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>`, (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ten', nhan: 'Tên dụng cụ', loai: 'chu', bb: true, gt: cu && cu['Tên'] }, { k: 'ai', nhan: 'Giao cho', loai: 'chips', ds, bb: true, gt: cu ? (cu['Loại'] === 'Chung' ? 'Dùng chung' : cu['Người giữ']) : ds[0] }].concat(cu ? [] : [{ k: 'sl', nhan: 'Số lượng (mỗi cái một mã)', loai: 'so', gt: 1 }]));
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const chung = v.ai === 'Dùng chung'; const doi = { 'Tên': v.ten, 'Loại': chung ? 'Chung' : 'Riêng', 'Người giữ': chung ? '' : v.ai };
        if (cu) { if (!chung && cu['Người giữ'] !== v.ai) doi['Ngày giao'] = hn(); await API.goi('sua', { bang: 'DungCu', khoa: { 'Mã DC': cu['Mã DC'] }, doi }); }
        else { const n = Math.max(1, Math.min(20, Math.round(num(v.sl) || 1))); const co = (await G.doc('DungCu')).length;
          for (let i = 0; i < n; i++) await API.goi('ghi', { bang: 'DungCu', dong: Object.assign({ 'Mã DC': 'DC-' + String(co + i + 1).padStart(2, '0'), 'Ngày giao': chung ? '' : hn(), 'Trạng thái': 'Tốt', 'Ghi chú': '', 'Ảnh': '' }, doi) }); }
        dong(); bao('Đã lưu'); G.taiLai(); }, e.target);
      const ds_ = (id, tt) => { const x = o.querySelector('#' + id); if (x) x.onclick = () => chay(async () => { await API.goi('sua', { bang: 'DungCu', khoa: { 'Mã DC': cu['Mã DC'] }, doi: { 'Trạng thái': tt } }); dong(); bao('Đã cập nhật'); G.taiLai(); }, x); };
      ds_('daSua', 'Tốt'); ds_('thanhLy', 'Thanh lý');
    });
  }

  /* ===== 🚜 MÁY MÓC ===== */
  async function manMay(o) {
    await G.ktBaoTri();
    const [gioM, d] = await Promise.all([G.gioMayTong(), G.docNhieu([{ bang: 'BaoTriPH', gioiHan: 3000 }, { bang: 'MayHong', gioiHan: 1000 }])]);
    const ph = d.BaoTriPH || []; const hong = d.MayHong || [];
    o.innerHTML = MAY.map((m) => { const tong = gioM[m.ma] || 0; const h = hong.filter((x) => x['Máy'] === m.ten && x['Trạng thái'] !== 'Đã sửa xong');
      const cho = ph.filter((x) => x['Máy'] === m.ten && x['Trạng thái'] === 'Chờ phát hành'); const daPH = ph.filter((x) => x['Máy'] === m.ten && x['Trạng thái'] === 'Đã phát hành');
      const tt = h.length ? ['do', '🔴 Hỏng'] : (cho.length || daPH.length) ? ['cam', '🟠 Đến hạn bảo trì'] : ['xanh', '🟢 Hoạt động'];
      const tt2 = tiepTheo(m, tong, ph); const xong = ph.filter((x) => x['Máy'] === m.ten && x['Trạng thái'] === 'Đã xong').slice(-3).reverse();
      return `<div class="the may-the2"><div class="hang"><h2 class="gian" style="margin:0">${m.ma === 'KB' ? '🚜' : m.ma === 'SM' ? '🏖' : '🌊'} ${esc(m.ten)}</h2><span class="chip ${tt[0]}">${tt[1]}</span></div>
        <div class="so-lon" style="margin:6px 0 0">${so(tong)} giờ</div><div class="mo">${esc(m.cach)}</div>
        ${tt2 ? `<div class="thanh ${tt2.con <= 0 ? 'do' : tt2.con <= 5 ? 'cam' : ''}" style="margin:8px 0 4px"><i style="width:${Math.round(Math.min(1, (tt2.c.h - tt2.con) / tt2.c.h) * 100)}%"></i></div><div class="mo">Mốc gần nhất: ${esc(tt2.c.ten)} · còn ${so(tt2.con)} giờ</div>` : ''}
        ${h.map((x) => `<div class="the the-do" style="margin-top:8px"><b>${esc(x['Lỗi'])}</b><div class="mo">${esc(x['Trạng thái'])} · báo ${G.ngayVN(x['Ngày báo']).slice(0, 5)} · ${esc(ngan(x['Người báo']))}${x['Thợ ngoài'] ? ' · thợ: ' + esc(x['Thợ ngoài']) : ''}</div>${laAnh() ? `<div class="nhom-nut" style="margin-top:6px">${x['Trạng thái'] === 'Báo ENG' ? `<button class="nut nho" data-eng="${esc(x['Mã'])}">📤 Gửi ENG</button><button class="nut nho" data-tho="${esc(x['Mã'])}">Chuyển thợ ngoài</button>` : ''}<button class="nut nho chinh" data-suaxong="${esc(x['Mã'])}">Đã sửa xong</button></div>` : ''}</div>`).join('')}
        ${laAnh() ? cho.map((x) => `<div class="the the-mo" style="margin-top:8px"><b>🔧 Đến hạn: ${esc(x['Mốc'])}</b><div class="mo">lúc ${so(x['Giờ máy'])} giờ · từ ${G.ngayVN(x['Ngày tạo']).slice(0, 5)} · nhân viên chưa thấy việc này</div><button class="nut chinh rong" data-ph="${esc(x['Mã BT'])}" style="margin-top:6px">Xem và phát hành</button></div>`).join('') : ''}
        ${daPH.map((x) => `<div class="the" style="margin-top:8px"><b>🔧 ${esc(x['Mốc'])}</b><div class="mo">Đã phát hành ${G.ngayVN(x['Ngày phát hành']).slice(0, 5)} · giao ${esc(ngan(x['Giao cho']))}</div>${x['Giao cho'] === S.u.ten ? `<button class="nut chinh rong" data-lam="${esc(x['Mã BT'])}" style="margin-top:6px;min-height:52px">Làm bảo trì</button>` : ''}</div>`).join('')}
        <div class="nhom-nut" style="margin-top:8px"><button class="nut nho" data-baohong="${esc(m.ten)}">⚠ Báo hỏng</button><button class="nut nho" data-ck="${esc(m.ma)}">Xem checklist</button></div>
        ${xong.length ? `<details style="margin-top:6px"><summary class="mo">Lần bảo trì gần đây</summary>${xong.map((x) => `<div class="mo">✓ ${G.ngayVN(x['Ngày xong']).slice(0, 5)} · ${esc(x['Mốc'])} · ${so(x['Giờ máy'])} giờ · ${esc(ngan(x['Giao cho']))}</div>`).join('')}</details>` : ''}</div>`; }).join('')
      + `<p class="mo">Bảo trì chỉ tính theo số giờ hoạt động. Đến mốc thì chỉ Trưởng bộ phận thấy trước; bấm Phát hành thì người làm mới thấy việc. Máy hỏng: báo ENG trước, ENG không sửa được thì gọi thợ ngoài.</p>`;
    o.querySelectorAll('[data-ck]').forEach((b) => { b.onclick = () => { const m = MAY.find((x) => x.ma === b.dataset.ck); G.hop('Checklist bảo trì · ' + m.ten, m.moc.map((c) => `<h3 class="tieu-nhom">${esc(c.ten)}</h3><ul>${c.ds.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`).join('')); }; });
    o.querySelectorAll('[data-ph]').forEach((b) => { b.onclick = () => formPhatHanh(ph.find((x) => x['Mã BT'] === b.dataset.ph)); });
    o.querySelectorAll('[data-lam]').forEach((b) => { b.onclick = () => formLamBT(ph.find((x) => x['Mã BT'] === b.dataset.lam), gioM); });
    o.querySelectorAll('[data-baohong]').forEach((b) => { b.onclick = () => formMayHong(b.dataset.baohong); });
    o.querySelectorAll('[data-eng]').forEach((b) => { b.onclick = () => { const x = hong.find((y) => y['Mã'] === b.dataset.eng); G.guiZalo(`🔧 Nhờ ENG kiểm tra máy ${x['Máy']} (bộ phận Cảnh quan)\nLỗi: ${x['Lỗi']}\nBáo ngày ${G.ngayVN(x['Ngày báo'])}`, 'kho/may'); }; });
    o.querySelectorAll('[data-tho]').forEach((b) => { b.onclick = async () => { const t = await G.hoi('Tên thợ hoặc đơn vị sửa ngoài'); if (t == null) return; chay(async () => { await API.goi('sua', { bang: 'MayHong', khoa: { 'Mã': b.dataset.tho }, doi: { 'Trạng thái': 'Thợ ngoài', 'Thợ ngoài': t } }); bao('Đã chuyển thợ ngoài'); G.taiLai(); }); }; });
    o.querySelectorAll('[data-suaxong]').forEach((b) => { b.onclick = async () => { const cp = await G.hoi('Chi phí sửa (để trống nếu không có)'); if (cp == null) return; chay(async () => { const x = hong.find((y) => y['Mã'] === b.dataset.suaxong); const n = Math.max(0, Math.round((new Date(hn()) - new Date(x['Ngày báo'])) / 864e5));
      await API.goi('sua', { bang: 'MayHong', khoa: { 'Mã': x['Mã'] }, doi: { 'Trạng thái': 'Đã sửa xong', 'Ngày xong': hn(), 'Chi phí': cp, 'Số ngày nằm': n } }); bao(`Đã ghi sửa xong · máy nằm ${n} ngày`); G.taiLai(); }); }; });
  }
  function formPhatHanh(r) {
    const muc = mucCua(r); const ds = nb2().concat(S.u.ten); const mac = /Sand|Barber/.test(r['Máy']) ? tenDu('Hiệp') : '';
    G.hop('Phát hành bảo trì · ' + r['Máy'], `<p class="mo" style="margin-top:0">${esc(r['Mốc'])} · máy đang ${so(r['Giờ máy'])} giờ. Bỏ chọn mục chưa cần làm.</p><div class="ds">${muc.map((x, i) => `<label class="muc"><input type="checkbox" data-i="${i}" checked> <span class="gian">${esc(x)}</span></label>`).join('')}</div><div id="f"></div><button class="nut chinh rong" id="l">Phát hành</button>`, (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ai', nhan: 'Giao cho', loai: 'chips', ds, bb: true, gt: mac }, { k: 'gc', nhan: 'Dặn thêm', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const chon = muc.filter((x, i) => o.querySelector(`[data-i="${i}"]`).checked); if (!chon.length) throw new Error('Chọn ít nhất 1 mục');
        await API.goi('sua', { bang: 'BaoTriPH', khoa: { 'Mã BT': r['Mã BT'] }, doi: { 'Trạng thái': 'Đã phát hành', 'Giao cho': v.ai, 'Ngày phát hành': hn(), 'Việc cần làm': chon.join(' | '), 'Ghi chú': v.gc || '' } });
        dong(); bao('Đã phát hành · ' + ngan(v.ai) + ' sẽ thấy việc này'); G.taiLai(); }, e.target);
    });
  }
  function formLamBT(r, gioM) {
    const muc = String(r['Việc cần làm'] || '').split(' | ').filter(Boolean); const m = MAY.find((x) => x.ten === r['Máy']);
    G.hop('🔧 Bảo trì ' + r['Máy'], `<p class="mo" style="margin-top:0">${esc(r['Mốc'])}${r['Ghi chú'] ? ' · ' + esc(r['Ghi chú']) : ''}. Làm xong mục nào thì chọn mục đó.</p><div class="ds">${muc.map((x, i) => `<label class="muc"><input type="checkbox" data-i="${i}"> <span class="gian">${esc(x)}</span></label>`).join('')}</div><div id="f"></div><button class="nut chinh rong" id="l">Lưu, bảo trì xong</button>`, (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'anh', nhan: 'Ảnh sau bảo trì', loai: 'anh', bb: true, toiDa: 4 }, { k: 'gc', nhan: 'Ghi chú (mục nào chưa làm được, vì sao)', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const lam = muc.filter((x, i) => o.querySelector(`[data-i="${i}"]`).checked); if (lam.length < muc.length && !v.gc) throw new Error('Ghi rõ mục chưa làm được và lý do');
        const g = gioM[m.ma] || num(r['Giờ máy']);
        await API.goi('sua', { bang: 'BaoTriPH', khoa: { 'Mã BT': r['Mã BT'] }, doi: { 'Trạng thái': 'Đã xong', 'Ngày xong': hn(), 'Giờ máy': g, 'Đã làm': lam.join(' | '), 'Ảnh': (v.anh || []).join(' | '), 'Ghi chú': [r['Ghi chú'], v.gc].filter(Boolean).join(' · ') } });
        await API.goi('ghi', { bang: 'BaoTriMay', dong: { 'Ngày': hn(), 'Máy': r['Máy'], 'Mốc': r['Mốc'], 'Đã làm': lam.join(', '), 'Giờ từ lần trước': '', 'Đồng hồ giờ': m.ma === 'KB' ? g : '', 'Ảnh': (v.anh || []).join(' | '), 'Ghi chú': v.gc || '', 'Người ghi': '', 'Giờ ghi': '' } });
        dong(); bao('Đã lưu · mốc này đếm lại từ đầu'); G.taiLai(); }, e.target);
    });
  }
  function formMayHong(may) {
    G.hop('⚠ Báo hỏng · ' + may, '<div id="f"></div><button class="nut chinh rong" id="l">Gửi</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'loi', nhan: 'Hỏng gì', loai: 'chips', ds: ['Không nổ máy', 'Đứt curoa, xích', 'Rò nhớt, xăng', 'Kêu lạ, rung mạnh', 'Lưới, răng cào hỏng', 'Bánh, lốp', 'Khác'], bb: true }, { k: 'anh', nhan: 'Ảnh chỗ hỏng', loai: 'anh', bb: true, toiDa: 3 }, { k: 'gc', nhan: 'Mô tả thêm', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'MayHong', dong: { 'Mã': G.ma('MH'), 'Ngày báo': hn(), 'Máy': may, 'Lỗi': v.loi + (v.gc ? ': ' + v.gc : ''), 'Ảnh': (v.anh || []).join(' | '), 'Người báo': '', 'Trạng thái': 'Báo ENG', 'Thợ ngoài': '', 'Chi phí': '', 'Ngày xong': '', 'Số ngày nằm': '' } });
        dong(); bao('Đã báo · Trưởng bộ phận sẽ báo ENG'); G.taiLai(); }, e.target);
    });
  }
  /* màn Máy bãi biển: bỏ dòng lịch bảo trì theo ngày cũ, thay bằng đường sang Kho & tài sản › Máy móc */
  const nbFn = G.man.nb.fn;
  G.man.nb.fn = async (loai, ...r) => { await nbFn(loai, ...r); if (loai !== 'may') return; const m = document.getElementById('noiDung'); if (!m) return;
    m.querySelectorAll('.mo').forEach((x) => { if (/^Bảo trì:/.test(x.textContent.trim())) x.remove(); }); const bt = m.querySelector('#bt'); if (bt) bt.remove();
    if (!m.querySelector('.link-bt')) m.insertAdjacentHTML('beforeend', '<a class="the hang link-bt" href="#/kho/may" style="color:inherit;margin-top:10px"><span class="gian"><b>🔧 Bảo trì, báo hỏng máy</b><span class="mo"> · Kho & tài sản › Máy móc</span></span>›</a>'); };

  /* dữ liệu chạy thử cho kho (một lần) */
  const seedKho = () => { if (!(API.thu && API.thu()) || !S.dm || localStorage.getItem('gl_va_046_kho')) return;
    try {
      const LS = (k, v) => localStorage.setItem('gl_tb_' + k, JSON.stringify(v));
      const n = (d) => API.ngay(new Date(Date.now() - d * 864e5));
      const VT = [['VT01', 'Phân bón lá Growmore 30-10-10', 'Phân bón', 'kg', 1, 'Hiệp', 'nb/noithat,nb/vuonuomnt', 'Kệ xanh, ngăn 1', 0.5, 0.2], ['VT02', 'Giá thể trồng cây', 'Giá thể, đất', 'bao', 2, 'Hiệp', 'nb/vuonuomnt', 'Góc pallet', 5, 0.5],
        ['VT03', 'Chậu nhựa 20 cm', 'Chậu, vật tư trồng', 'cái', 10, 'Hiệp', 'nb/vuonuomnt,nb/noithat', 'Kệ vàng', 30, 1], ['VT04', 'Bao đựng rác bãi biển', 'Vật tư bãi biển', 'cái', 20, 'Hiệp', 'nb/bien', 'Kệ xám', 25, 3],
        ['VT05', 'Xăng A95', 'Xăng, nhớt', 'lít', 5, 'Hiệp', 'nb/may', 'Tủ xăng có khóa', 12, 2], ['VT06', 'Nhớt máy 4 thì', 'Xăng, nhớt', 'lít', 1, 'Hiệp', 'nb/may', 'Tủ xăng có khóa', 4, 0],
        ['VT07', 'Hạt giống rau ăn lá', 'Hạt giống', 'gói', 5, 'Nghị', 'nb/vuonrau', 'Hộp kín, kệ xanh', 3, 1], ['VT08', 'Phân trùn quế', 'Phân bón', 'bao', 2, 'Nghị', 'nb/vuonrau', 'Góc pallet', 2.5, 0.5],
        ['VT09', 'Chế phẩm vi sinh EM', 'Thuốc, chế phẩm', 'lít', 2, 'Nghị', 'nb/rac', 'Tủ thuốc có khóa', 3, 0.5], ['VT10', 'Găng tay bảo hộ', 'Bảo hộ', 'đôi', 6, 'Chung', '', 'Kệ xám', 16, 1]];
      LS('KhoVatTu', VT.map((x) => ({ 'Mã VT': x[0], 'Tên': x[1], 'Nhóm': x[2], 'ĐVT': x[3], 'Tồn tối thiểu': String(x[4]), 'Người dùng': x[5], 'Dùng cho': x[6], 'Vị trí kho': x[7], 'Trạng thái': 'Đang dùng', 'Ảnh': '' })));
      const gd = []; VT.forEach((x, i) => { gd.push({ 'Mã GD': 'GD-N' + i, 'Ngày': n(25), 'Giờ': n(25) + ' 08:00:00', 'Mã VT': x[0], 'Tên VT': x[1], 'Loại': 'Nhập', 'Số lượng': String(Math.round((x[8] + 10 * x[9]) * 10) / 10), 'Việc': '', 'Mã ghi gốc': '', 'Người': 'Lê Vũ', 'Ảnh': '', 'Ghi chú': 'Tồn đầu' });
        for (let d = 20; d >= 1; d -= 2) if (x[9]) gd.push({ 'Mã GD': 'GD-X' + i + '-' + d, 'Ngày': n(d), 'Giờ': n(d) + ' 09:30:00', 'Mã VT': x[0], 'Tên VT': x[1], 'Loại': 'Xuất', 'Số lượng': String(x[9]), 'Việc': (VIEC_VT.find((v) => v[0] === x[6].split(',')[0]) || [, 'Xuất kho'])[1], 'Mã ghi gốc': '', 'Người': x[5] === 'Nghị' ? 'Lê Hữu Nghị' : 'Nguyễn Tấn Hiệp', 'Ảnh': '', 'Ghi chú': '' }); });
      LS('KhoGiaoDich', gd);
      const DC = [['DC-01', 'Kéo cắt tỉa', 'Riêng', 'Hiệp'], ['DC-02', 'Bình tưới 8 lít', 'Riêng', 'Hiệp'], ['DC-03', 'Cào bãi biển', 'Riêng', 'Hiệp'], ['DC-04', 'Ủng, găng bảo hộ', 'Riêng', 'Hiệp'],
        ['DC-05', 'Cuốc', 'Riêng', 'Nghị'], ['DC-06', 'Xẻng', 'Riêng', 'Nghị'], ['DC-07', 'Bình tưới 8 lít', 'Riêng', 'Nghị'], ['DC-08', 'Kéo cắt tỉa', 'Riêng', 'Nghị'],
        ['DC-09', 'Thang nhôm 3 m', 'Chung', ''], ['DC-10', 'Xe rùa', 'Chung', ''], ['DC-11', 'Cưa tay', 'Chung', '']];
      LS('DungCu', DC.map((x) => ({ 'Mã DC': x[0], 'Tên': x[1], 'Loại': x[2], 'Người giữ': x[3] ? tenDu(x[3]) : '', 'Ngày giao': x[3] ? n(30) : '', 'Trạng thái': 'Tốt', 'Ghi chú': '', 'Ảnh': '' })));
      const tbg = (k) => JSON.parse(localStorage.getItem('gl_tb_' + k) || '[]');
      const sc = tbg('MaySangCat'); for (let d = 30; d >= 2; d -= 2) { sc.push({ 'Ngày': n(d), 'Máy': 'Sand Man', 'Bảo trì': 'Vận hành', 'Giờ bắt đầu': '06:00', 'Giờ kết thúc': '08:00', 'Số giờ': '2', 'Đoạn bãi': 'Bãi trước Hotel', 'Người ghi': 'Nguyễn Tấn Hiệp' }); if (d % 6 === 0) sc.push({ 'Ngày': n(d), 'Máy': 'H.Barber', 'Bảo trì': 'Vận hành', 'Giờ bắt đầu': '08:30', 'Giờ kết thúc': '10:30', 'Số giờ': '2', 'Đoạn bãi': 'Bãi Villa', 'Người ghi': 'Nguyễn Tấn Hiệp' }); }
      LS('MaySangCat', sc);
      const kl = tbg('KubotaLuot'); if (!kl.length) { let dh = 1236.4; for (let d = 20; d >= 1; d -= 1) { const g = d % 3 ? 1.2 : 2.5; kl.push({ 'Mã': 'KB-M' + d, 'Ngày': n(d), 'Người': d % 2 ? 'Nguyễn Tấn Hiệp' : 'Phan Văn Thìn', 'Giờ nhận': '07:30', 'Đồng hồ nhận': String(dh), 'Giờ trả': '09:00', 'Đồng hồ trả': String(Math.round((dh + g) * 10) / 10), 'Số giờ': String(g), 'Trạng thái': 'Đã trả', 'Ảnh nhận': '', 'Ảnh trả': '' }); dh = Math.round((dh + g) * 10) / 10; } LS('KubotaLuot', kl); }
      LS('BaoTriPH', [{ 'Mã BT': 'BT-K3', 'Ngày tạo': n(20), 'Máy': 'Kubota', 'Mã mốc': '', 'Mốc': 'Mốc khởi điểm', 'Giờ máy': '1236.4', 'Trạng thái': 'Khởi điểm', 'Người ghi': '' }, { 'Mã BT': 'BT-K1', 'Ngày tạo': n(40), 'Máy': 'Sand Man', 'Mã mốc': '', 'Mốc': 'Mốc khởi điểm', 'Giờ máy': '0', 'Trạng thái': 'Khởi điểm', 'Người ghi': '' }, { 'Mã BT': 'BT-K2', 'Ngày tạo': n(40), 'Máy': 'H.Barber', 'Mã mốc': '', 'Mốc': 'Mốc khởi điểm', 'Giờ máy': '0', 'Trạng thái': 'Khởi điểm', 'Người ghi': '' }]);
      localStorage.setItem('gl_va_046_kho', '1');
    } catch (e) { console.warn(e); }
  };
  /* tên đầy đủ của Hiệp/Nghị chỉ có sau khi đăng nhập: sửa lại người giữ dụng cụ mẫu */
  G._suaDCMau = () => { try { const k = 'gl_tb_DungCu'; const ds = JSON.parse(localStorage.getItem(k) || '[]'); let doi = false; ds.forEach((x) => { const t = tenDu(x['Người giữ']); if (x['Người giữ'] && t !== x['Người giữ']) { x['Người giữ'] = t; doi = true; } }); if (doi) localStorage.setItem(k, JSON.stringify(ds)); } catch (e) { /* bỏ qua */ } };

  /* =========================== 106: TÌM KIẾM THÔNG MINH =========================== */
  const bo = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  G.boDau = bo;
  /* từ đồng nghĩa theo cách nói ở bộ phận → từ khóa trong app */
  const DONG_NGHIA = [['may cay', 'kubota'], ['xe cay', 'kubota'], ['may keo', 'kubota'], ['rac bep', 'thu gom rac huu co compost'], ['rau cu', 'thu gom rac huu co compost'], ['phan huu co', 'compost thu gom'],
    ['thuoc sau', 'phun thuoc bvtv'], ['thuoc tru sau', 'phun thuoc bvtv'], ['xit thuoc', 'phun thuoc'], ['cau bui', 'cay ben trong villa'], ['cay trong phong', 'cay ben trong villa'], ['bien ban', 'hop'],
    ['luong', 'diem danh cong'], ['cham cong', 'diem danh'], ['cong nhan', 'cong nhan nguoi'], ['sang cat', 'may sang cat sand man barber'], ['cat bien', 'bai bien'], ['rac bien', 've sinh bai bien'],
    ['vuon rau', 'vi garden'], ['rau', 'vi garden'], ['cay chau', 'cay noi that'], ['cay canh trong nha', 'cay noi that'], ['dong ho', 'dong ho nuoc'], ['nuoc', 'dong ho nuoc tuoi'], ['tuoi cay', 'tuoi nuoc'],
    ['bon phan', 'phun bon phan'], ['benh cay', 'dich hai ai'], ['sau benh', 'dich hai'], ['kho', 'kho tai san vat tu'], ['vat tu', 'kho vat tu'], ['do nghe', 'dung cu'], ['dao keo', 'dung cu'], ['bao tri', 'may moc bao tri'],
    ['hong may', 'may moc bao hong'], ['organic waste', 'thu gom rac huu co'], ['compost', 'thu gom rac huu co'], ['beach', 'bai bien'], ['harvest', 'thu hoach'], ['transport', 'van chuyen'], ['trips', 'chuyen van chuyen'], ['watering', 'tuoi nuoc'], ['indoor plants', 'cay noi that'], ['planting', 'trong cay'], ['spraying', 'phun thuoc'], ['tickets', 'phieu'], ['store', 'kho'], ['tools', 'dung cu'], ['ke hoach', 'ke hoach tuan'], ['nghi phep', 'nghi lam thay'], ['phieu', 'phieu giao viec'], ['dao tao', 'dao tao lop hoc sop'], ['bai giang', 'sop dao tao']];
  const moRong = (t) => { let s = ' ' + bo(t) + ' '; s = s.replace(/ v ?(\d{1,2}) /g, ' villa $1 ').replace(/ dh /g, ' dong ho ').replace(/ kbt /g, ' kubota ').replace(/ nt /g, ' noi that ').replace(/ bvtv /g, ' bao ve thuc vat bvtv ');
    DONG_NGHIA.forEach(([a, b]) => { if (s.includes(' ' + a + ' ')) s = a.includes(' ') ? s.replace(' ' + a + ' ', ' ' + b + ' ') : s + ' ' + b + ' '; }); return s.replace(/\s+/g, ' ').trim(); };
  const gan1 = (a, b) => { if (Math.abs(a.length - b.length) > 1) return false; let i = 0, j = 0, sai = 0; while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue; } if (++sai > 1) return false; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } } return sai + (a.length - i) + (b.length - j) <= 1; };
  const diem = (cau, item) => { const t = moRong(cau).split(' ').filter(Boolean); if (!t.length) return 0; const h = item._h || (item._h = bo(item.ten + ' ' + (item.phu || '') + ' ' + (item.kw || ''))); const w = h.split(' '); const tat = w.map((x) => x[0]).join('');
    let d = 0; t.forEach((x) => { if (w.includes(x)) d += 3; else if (x.length >= 2 && w.some((y) => y.startsWith(x))) d += 2.5; else if (x.length >= 4 && h.includes(x)) d += 2; else if (x.length >= 2 && tat.includes(x)) d += 2; else if (x.length >= 4 && w.some((y) => gan1(x, y))) d += 2; });
    const tn = bo(item.ten); if (t.every((x) => tn.split(' ').some((y) => y.startsWith(x)))) d += 2; if (tn.startsWith(bo(cau))) d += 3; if (item.nhom === 'Chức năng') d += 1.5; return d / Math.max(2, t.length); };
  const ROUTE_NB = ['nb/bien', 'nb/ktbien', 'nb/may', 'nb/vuonrau', 'nb/thuhoach', 'nb/noithat', 'nb/vuonuomnt', 'nb/rac'];
  const ROUTE_NT = [['tuoi', 'Tưới nước sân vườn'], ['cum/DV10', 'Vệ sinh theo cụm'], ['cum/DV11', 'Nhổ cỏ dại'], ['donghonuoc', 'Đồng hồ nước'], ['batdaungay', 'Bắt đầu ngày'], ['chotngay', 'Chốt ngày'], ['diemdanh', 'Điểm danh']];
  G.chiMucTim = async () => {
    const out = []; const add = (nhom, ten, phu, link, kw) => out.push({ nhom, ten, phu, link, kw });
    const tenBC = {}; (G.BC_VIEC || []).forEach((b) => { tenBC[b.k] = b.ten; });
    add('Chức năng', 'Hôm nay', 'Việc hôm nay', '#/', 'trang dau'); add('Chức năng', 'Việc', 'Tất cả đầu việc', '#/viec'); add('Chức năng', 'Phiếu giao việc', 'Nhận, báo xong phiếu', '#/phieu');
    Object.keys(G.man).forEach((k) => { const x = G.man[k]; if (x.an || !x.ten) return; if (!(typeof x.ph === 'function' ? x.ph() : q(x.ph) >= (x.cap || 1))) return; add('Chức năng', x.ten, x.nhom || '', '#/' + k); });
    if (q('noibo')) ROUTE_NB.forEach((k) => { if (tenBC[k]) add('Chức năng', tenBC[k], 'Ghi việc', '#/' + k); });
    if (q('noibo')) [['kho/vattu', 'Vật tư trong kho', 'lay do nhap kho'], ['kho/dungcu', 'Dụng cụ, mượn trả', 'thang xe rua cua keo'], ['kho/may', 'Máy móc, bảo trì, báo hỏng', 'kubota sand man barber may sang may cay']].forEach(([k, t, kw]) => add('Chức năng', t, 'Kho & tài sản', '#/' + k, kw));
    if (!laNB()) ROUTE_NT.forEach(([k, t]) => { if (k !== 'diemdanh' || q('diemdanh')) add('Chức năng', t, 'Ghi việc', '#/' + k); });
    if (q('baocao')) (G.BC_VIEC || []).forEach((b) => { if (laNB() && !/^nb\/|batthuong|daotao|ketthucca/.test(b.k)) return; if (!laNB() && !laAnh() && /^nb\/|batthuong|ketthucca|kubota/.test(b.k)) return; add('Báo cáo', 'Báo cáo ' + b.ten.toLowerCase(), b.nhom, '#/bcviec/' + encodeURIComponent(b.k)); });
    if (!laNB()) { const kv = {}; (S.dm.vitri || []).forEach((v) => { const k = v.kv || v.ten; (kv[k] = kv[k] || { cum: v.cum, ma: [] }).ma.push(v.ma); }); Object.keys(kv).forEach((k) => add('Vị trí', k, kv[k].cum || '', 'vt:' + kv[k].ma.join('|'), kv[k].ma.join(' '))); }
    (S.dm.diemkhac || []).forEach((v) => { if (laNB() || laAnh() || /Đồng hồ nước/.test(v.loai)) add('Vị trí', v.ten, v.loai, '', v.ma); });
    (S.dm.thuoc || []).forEach((t) => add('Thuốc, phân', t.tenNgan || t.ten, t.nhom, '#/thuoc', t.ten));
    (S.dm.cay || []).slice(0, 400).forEach((c) => add('Cây', c.ten || c.tenViet || '', c.tenKH || c.nhom || '', '#/danhmuccay', c.tenKH));
    if (q('noibo')) { try { (await G.khoTon()).forEach((x) => add('Kho', x.v['Tên'], `Còn ${so(x.t)} ${x.v['ĐVT']} · ${x.tt[1]}`, '#/kho/vattu', x.v['Nhóm'])); } catch (e) { /* bỏ qua */ } }
    const nguoi = laNB() ? (S.dm.nguoi || []).filter((n) => n.nhom === 'Nhân viên nội bộ' || G.laAnhVuTen && G.laAnhVuTen(n.ten)) : (S.dm.congnhan || []).filter((x) => x.tt !== 'Đã nghỉ');
    nguoi.forEach((x) => add('Người', x.ten, [x.doi || x.nhom, x.sdt].filter(Boolean).join(' · '), x.sdt ? 'tel:' + x.sdt : '', x.cd));
    try { const d = await G.docNhieu([{ bang: 'Phieu', gioiHan: 300 }, { bang: 'ThuVienSOP', gioiHan: 500 }]);
      (d.Phieu || []).filter((p) => !laNB() || p['Giao cho'] === 'Nội bộ' || /nội thất|villa/i.test(p['Loại'] || '')).slice(-200).forEach((p) => add('Phiếu', `${p['Mã phiếu']} · ${p['Loại lỗi'] || p['Loại'] || ''}`, `${p['Trạng thái'] || ''} · ${p['Mô tả'] || ''}`.slice(0, 80), '#/phieu/' + encodeURIComponent(p['Mã phiếu'])));
      (d.ThuVienSOP || []).forEach((x) => add('SOP, đào tạo', x['Tên tài liệu'] || x['Tên'] || '', x['Chủ đề'] || '', x['Link'] || '#/sop')); } catch (e) { /* bỏ qua */ }
    return out.filter((x) => x.ten);
  };
  G.timKiem = (ds, cau, toiDa) => ds.map((x) => ({ x, d: diem(cau, x) })).filter((y) => y.d >= 1.4).sort((a, b) => b.d - a.d).slice(0, toiDa || 40).map((y) => y.x);
  const moKetQua = (x) => {
    if (x.link && x.link.startsWith('vt:')) return lichSuVTHop(x.link.slice(3), x.ten);
    if (!x.link) { G.hop(x.ten, `<p>${esc(x.phu || '')}</p>`); return; }
    if (/^https?:|^tel:/.test(x.link)) { window.open(x.link, '_blank'); return; }
    document.querySelectorAll('.lop-phu').forEach((l) => l.remove()); location.hash = x.link;
  };
  G.moTimKiem = async (cauDau) => {
    let ds = []; const goiYDau = laNB() ? ['vật tư sắp hết', 'mượn thang', 'báo hỏng máy', 'cây nội thất', 'vi garden'] : laAnh() ? ['phiếu quá hạn', 'villa 25', 'kubota', 'báo cáo GM', 'kho'] : ['phiếu', 'tưới nước', 'villa 25', 'điểm danh', 'kế hoạch tuần'];
    G.hop('🔍 Tìm nhanh', `<input type="search" id="tk" placeholder="Gõ gì cũng được: v25, may cay, dh nuoc…" value="${esc(cauDau || '')}" autocomplete="off" style="font-size:18px"><div class="chon tk-goiy" style="margin:8px 0">${goiYDau.map((t) => `<button type="button" data-g="${esc(t)}">${esc(t)}</button>`).join('')}</div><div id="kq"><div class="mo">Đang chuẩn bị…</div></div>`, async (o) => {
      const i = o.querySelector('#tk'); const kq = o.querySelector('#kq'); setTimeout(() => i.focus(), 60);
      const ve = () => { const c = i.value.trim(); if (!c) { kq.innerHTML = '<p class="mo">Gõ tên việc, vị trí, cây, thuốc, phiếu, người… không cần dấu, gõ tắt cũng được.</p>'; return; }
        const r = G.timKiem(ds, c); if (!r.length) { kq.innerHTML = G.trong('Không thấy. Thử từ khác, hoặc hỏi Trợ lý GreenLog.') + '<button class="nut rong" id="hoiTL">🤖 Hỏi Trợ lý GreenLog</button>'; kq.querySelector('#hoiTL').onclick = () => { G._cauTroLy = c; location.hash = '#/troly'; }; return; }
        const nhom = {}; r.forEach((x) => { (nhom[x.nhom] = nhom[x.nhom] || []).push(x); });
        kq.innerHTML = Object.keys(nhom).map((n) => `<h3 class="tieu-nhom">${esc(n)}</h3><div class="ds">${nhom[n].slice(0, 8).map((x) => `<button type="button" class="muc tk-muc" data-i="${r.indexOf(x)}"><span class="gian"><b>${esc(x.ten)}</b><span class="mo"> ${esc(x.phu || '')}</span></span>›</button>`).join('')}</div>`).join('');
        kq.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => moKetQua(r[+b.dataset.i]); }); };
      i.oninput = ve; o.querySelectorAll('[data-g]').forEach((b) => { b.onclick = () => { i.value = b.dataset.g; ve(); }; });
      ds = await G.chiMucTim(); ve();
    });
  };
  /* lịch sử một vị trí: việc định kỳ, tưới, phiếu gần nhất */
  G.lichSuVT = async (ma) => { const set = new Set(String(ma).split('|')); const co = (x) => String(x['Mã vị trí'] || '').split('|').some((y) => set.has(y.trim()));
    const d0 = await G.docNhieu([{ bang: 'TickDinhKy', gioiHan: 20000 }, { bang: 'Phieu', gioiHan: 2000 }, { bang: 'Tuoi', gioiHan: 5000 }]); const d = { TickDinhKy: (d0.TickDinhKy || []).filter(co), Phieu: (d0.Phieu || []).filter(co), Tuoi: (d0.Tuoi || []).filter(co) };
    return [].concat((d.TickDinhKy || []).filter((x) => x['Trạng thái'] !== 'Đang làm').map((x) => ({ ngay: x['Ngày'], viec: G.dvTen ? G.dvTen(x['Mã việc']) : x['Mã việc'], ma: x['Mã việc'], ai: x['Người ghi'] || x['Người'] || '' })),
      (d.Tuoi || []).map((x) => ({ ngay: x['Ngày'], viec: 'Tưới nước', ma: 'DV09', ai: x['Người ghi'] || '' })), (d.Phieu || []).map((x) => ({ ngay: String(x['Giờ tạo'] || x['Ngày'] || '').slice(0, 10), viec: 'Phiếu ' + (x['Loại lỗi'] || x['Loại'] || '') + ' · ' + (x['Trạng thái'] || ''), ma: 'phieu', ai: '' })))
      .filter((x) => x.ngay).sort((a, b) => (a.ngay < b.ngay ? 1 : -1)); };
  async function lichSuVTHop(ma, ten) { const ls = await G.lichSuVT(ma); const lan = {}; ls.forEach((x) => { if (!lan[x.viec]) lan[x.viec] = x; });
    G.hop('📍 ' + ten, `<h3 class="tieu-nhom">Lần gần nhất của từng việc</h3><div class="ds">${Object.values(lan).map((x) => `<div class="muc"><div class="gian"><b>${esc(x.viec)}</b><div class="mo">${esc(ngan(x.ai))}</div></div><b>${G.ngayVN(x.ngay)}</b></div>`).join('') || G.trong('Chưa có ghi chép ở vị trí này')}</div>`); }

  /* =========================== 109: TRỢ LÝ GREENLOG =========================== */
  Object.assign(G.HD_TRO || {}, {
    'kho/vattu': { vi: ['Vật tư', ['Thẻ đỏ, cam là món đã hết, sắp hết.', 'Xuất kho: bấm Xuất kho, chọn món, bấm ＋ − rồi Lưu.', 'Phân, giá thể… dùng khi ghi việc thì app hỏi một lần và tự trừ kho.', 'Trưởng bộ phận bấm ＋ Nhập kho khi có hàng về.'], 'Bấm vào một món để xem lịch sử nhập, xuất.'],
      en: ['Supplies', ['Red and orange cards are out or low.', 'Loose items: tap Take items, pick the picture, set ＋ − and Save.', 'Fertiliser, potting mix… used while logging a job are deducted after one quick question.', 'The Landscape Manager taps ＋ Stock in when goods arrive.'], 'Tap an item to see its in / out history.'] },
    'kho/dungcu': { vi: ['Dụng cụ', ['Dụng cụ riêng nằm dưới tên người giữ.', 'Đồ dùng chung: bấm Mượn khi lấy, bấm Trả khi cất.', 'Hỏng, mất: bấm Báo hỏng, mất, chụp ảnh, ghi lý do.', 'Ngày có thẻ Kiểm tra dụng cụ: bày đồ ra, chụp 1 ảnh, bấm Gửi.'], 'Mỗi tháng kiểm tra đủ 4 lần, ngày do app chọn ngẫu nhiên.'],
      en: ['Tools', ['Personal tools are listed under the holder.', 'Shared tools: tap Borrow when you take one, Return when you put it back.', 'Damaged or lost: tap Report, add a photo and the reason.', 'On a Tool check day: lay out your tools, take 1 photo, tap Send.'], 'Four random checks a month.'] },
    'kho/may': { vi: ['Máy móc', ['Mỗi máy hiện số giờ chạy và mốc bảo trì gần nhất.', 'Đến mốc: Trưởng bộ phận xem và bấm Phát hành.', 'Người được giao bấm Làm bảo trì, chọn mục đã làm, chụp ảnh, Lưu.', 'Máy hỏng: bấm ⚠ Báo hỏng, chụp chỗ hỏng.'], 'Hỏng thì báo ENG trước, ENG không sửa được mới gọi thợ ngoài.'],
      en: ['Machines', ['Each machine shows its hours and next milestone.', 'When due, the Landscape Manager reviews and taps Release.', 'The assignee taps Do maintenance, ticks the items, adds a photo, Save.', 'Breakdown: tap ⚠ Report fault and photograph it.'], 'Report to ENG first; call an outside technician only if ENG cannot fix it.'] },
    kho: { vi: ['Kho & tài sản', ['Ba thẻ: Vật tư, Dụng cụ, Máy móc.'], ''], en: ['Store & Assets', ['Three tabs: Supplies, Tools, Machines.'], ''] },
    troly: { vi: ['Trợ lý GreenLog', ['Gõ hoặc bấm 🎤 Nói để hỏi.', 'Bấm câu gợi ý nếu không biết hỏi gì.', 'Bấm nút trong câu trả lời để mở đúng màn.'], 'Trợ lý chỉ trả lời việc trong GreenLog và không tự lưu, xóa gì.'],
      en: ['GreenLog Assistant', ['Type or tap 🎤 to ask.', 'Tap a suggestion if unsure what to ask.', 'Tap a button in the answer to open that screen.'], 'It only answers GreenLog questions and never saves or deletes anything.'] },
  });
  G.ROBOT = (s) => `<svg viewBox="0 0 96 96" width="${s || 40}" height="${s || 40}" aria-hidden="true" class="robot"><circle cx="48" cy="48" r="48" fill="#163A2B"/><rect x="22" y="36" width="52" height="40" rx="12" fill="#C8E05A"/><g class="mat"><circle cx="37" cy="54" r="5" fill="#163A2B"/><circle cx="59" cy="54" r="5" fill="#163A2B"/></g><path d="M38 66 q10 6 20 0" stroke="#163A2B" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M48 36 v-14" stroke="#C8E05A" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M48 24 c-9 0 -13 -5 -13 -10 c7 0 13 3 13 10z" fill="#7FB23A"/><path d="M48 22 c9 0 13 -5 13 -10 c-7 0 -13 3 -13 10z" fill="#C8E05A"/></svg>`;
  G.IC.kho = '<svg viewBox="0 0 64 64" role="img" aria-label="Kho"><rect x="1" y="1" width="62" height="62" rx="14" fill="#EEF2EE"/><path d="M10 26 l22 -12 l22 12 v26 h-44 z" fill="#FFFFFF" stroke="#2A3A30" stroke-width="1.1" stroke-linejoin="round"/><rect x="18" y="34" width="28" height="18" fill="#C9E265" stroke="#2A3A30" stroke-width="1.1"/><path d="M18 40 h28 M18 46 h28 M32 34 v18" stroke="#2A3A30" stroke-width="1.1"/></svg>';
  G.IC.tro_ly = G.ROBOT(64).replace(' class="robot"', '');
  const PHAM_VI = 'Em chỉ hỗ trợ việc trong GreenLog. Anh chị hỏi về việc, số liệu, kho, máy, phiếu, cách dùng app nhé.';
  const KY_HOI = [['hom nay', () => [hn(), hn(), 'hôm nay']], ['hom qua', () => [G.congNgay(hn(), -1), G.congNgay(hn(), -1), 'hôm qua']], ['tuan truoc', () => { const d = new Date(hn()); const t = (d.getDay() + 6) % 7; const dau = G.congNgay(hn(), -t - 7); return [dau, G.congNgay(dau, 6), 'tuần trước']; }],
    ['tuan nay', () => { const d = new Date(hn()); const t = (d.getDay() + 6) % 7; return [G.congNgay(hn(), -t), hn(), 'tuần này']; }], ['thang truoc', () => { const d = new Date(hn()); const a = new Date(d.getFullYear(), d.getMonth() - 1, 1); const b = new Date(d.getFullYear(), d.getMonth(), 0); return [API.ngay(a), API.ngay(b), 'tháng trước']; }],
    ['nam nay', () => [hn().slice(0, 4) + '-01-01', hn(), 'từ đầu năm']], ['ky nay', () => [S.dm.ky.tu, hn(), 'kỳ ' + S.dm.ky.ten]], ['thang nay', () => [hn().slice(0, 8) + '01', hn(), 'tháng này']]];
  const kyCua = (t) => { const x = KY_HOI.find(([k]) => t.includes(k)); return x ? x[1]() : KY_HOI[KY_HOI.length - 1][1](); };
  const TL = { the: (tieu, dong, nut) => ({ tieu, dong, nut }) };
  /* ý định: { ten, khop(t) → bool, lam(t, cau) → {chu, the?, nut?} } */
  const Y = [
    { ten: 'nghi', khop: (t) => /\b(ai|nguoi nao)\b.*\bnghi\b|\bnghi\b.*\bhom nay\b|\bvang\b|who.*(off|absent)|day off/.test(t), lam: async () => {
      const dong = []; const nghi = await G.nghiNB().catch(() => []); if (q('noibo') || laAnh()) dong.push(nghi.length ? `Nội bộ nghỉ: ${nghi.map(ngan).join(', ')}` : 'Nội bộ: đủ người');
      if (!laNB() && q('diemdanh')) { const dd = await G.doc('DiemDanh', { 'Ngày': hn() }).catch(() => []); const vang = dd.filter((x) => /Vắng/.test(x['Trạng thái (Có mặt/Vắng/Về sớm)'] || '')); dong.push(dd.length ? `Nhà thầu vắng ${vang.length}: ${vang.map((x) => x['Họ tên']).join(', ') || 'không ai'}` : 'Nhà thầu: chưa điểm danh sáng nay'); }
      return { chu: dong.join('\n') || 'Hôm nay chưa có ai báo nghỉ.', nut: [['Mở Hôm nay', '#/']] }; } },
    { ten: 'may', khop: (t) => /bao tri|gio may|may sang|sand ?man|barber|kubota|may cay|maintenance|machine hours|sifter|tractor/.test(t) && !/bao hong|hong roi|hu roi/.test(t), lam: async () => {
      if (!q('noibo') && !laAnh()) { const s = G.kubotaNgan ? await G.kubotaNgan() : ''; return { chu: 'Kubota: ' + s }; }
      const [g, ph] = await Promise.all([G.gioMayTong(), G.doc('BaoTriPH')]);
      return { chu: 'Giờ máy và mốc bảo trì gần nhất:', dong: MAY.map((m) => { const x = tiepTheo(m, g[m.ma] || 0, ph); return `${m.ten}: ${so(g[m.ma])} giờ · ${x ? x.c.ten + ', còn ' + so(x.con) + ' giờ' : ''}`; }), nut: [['Mở Máy móc', '#/kho/may']] }; } },
    { ten: 'kho', khop: (t) => /\bkho\b|sap het|het gi|con bao nhieu|con khong|con ko|ton\b|stock|store|running (low|out)/.test(t) && q('noibo') >= 1, lam: async (t) => {
      const ds = await G.khoTon(); if (!ds.length) return { chu: 'Kho chưa có vật tư nào.', nut: [['Mở Kho & tài sản', '#/kho/vattu']] };
      const khop = ds.filter((x) => { const w = bo(x.v['Tên']).split(' ').filter((y) => y.length > 2); return w.some((y) => t.includes(y)); });
      const r = khop.length ? khop : ds.filter((x) => x.tt[0] !== 'xanh');
      if (!r.length) return { chu: 'Kho đang đủ, chưa món nào sắp hết.', nut: [['Mở Kho', '#/kho/vattu']] };
      return { chu: khop.length ? 'Trong kho còn:' : 'Các món sắp hết, đã hết:', dong: r.slice(0, 8).map((x) => `${x.tt[1].slice(0, 2)} ${x.v['Tên']}: ${so(x.t)} ${x.v['ĐVT']}${x.nd != null ? ' · đủ khoảng ' + x.nd + ' ngày' : ''}`), nut: [['Mở Kho', '#/kho/vattu']] }; } },
    { ten: 'baohong', khop: (t) => /bao hong|hong roi|hu roi|may hong|khong no|broken|report fault|breakdown/.test(t), lam: async () => ({ chu: 'Anh chị mở Máy móc, bấm ⚠ Báo hỏng ở máy bị hỏng, chụp ảnh chỗ hỏng rồi Gửi.', nut: [['⚠ Báo hỏng máy', '#/kho/may']] }) },
    { ten: 'muon', khop: (t) => /\bmuon\b|\btra\b.*(thang|xe rua|cua|dung cu)|dung cu|borrow|tool/.test(t) && q('noibo') >= 1, lam: async () => ({ chu: 'Vào Dụng cụ, bấm Mượn ở món cần dùng. Cất lại thì bấm Trả.', nut: [['🧰 Mở Dụng cụ', '#/kho/dungcu']] }) },
    { ten: 'lay', khop: (t) => /lay do|lay vat tu|lay phan|xuat kho/.test(t) && q('noibo') >= 1, lam: async () => ({ chu: 'Vào Vật tư, bấm 📤 Xuất kho, chọn món cần xuất, bấm ＋ − cho đúng số rồi Lưu.', nut: [['📦 Mở Vật tư', '#/kho/vattu']] }) },
    { ten: 'cay', khop: (t) => /cay (nay|gi)|ten cay|benh gi|bi gi|la vang|sau an|nhan dien|what plant|disease|identify/.test(t), lam: async () => ({ chu: 'Chụp ảnh cây ở màn AI hỗ trợ: Nhận diện cây cho biết tên, Phân tích triệu chứng cho biết bệnh và cách xử lý.', nut: [['📷 Mở AI hỗ trợ', '#/ai']] }) },
    { ten: 'lancuoi', khop: (t) => /lan cuoi|khi nao|bao gio|hom nao|last time|when/.test(t) && /villa|vi tri|khu|residences|hotel|ktx/.test(t) && !laNB(), lam: async (t) => {
      const kv = {}; (S.dm.vitri || []).forEach((v) => { const k = v.kv || v.ten; (kv[k] = kv[k] || []).push(v.ma); });
      const so_ = (t.match(/villa (\d{1,2})\b/) || [])[1]; const kten = so_ && kv['Villa ' + +so_] ? 'Villa ' + +so_ : Object.keys(kv).map((k) => ({ k, d: diem(t, { ten: k }) })).sort((a, b) => b.d - a.d).filter((x) => x.d >= 1.5).map((x) => x.k)[0];
      if (!kten) return { chu: 'Anh chị ghi rõ vị trí giúp em, ví dụ: Villa 25 cắt cỏ lần cuối khi nào?' }; const vt = { v: { ten: kten } };
      const ls = await G.lichSuVT(kv[kten].join('|')); const viecT = ls.filter((x) => { const w = bo(x.viec).split(' ').filter((y) => y.length > 2); return w.some((y) => t.includes(y)); });
      const r = (viecT.length ? viecT : ls); if (!r.length) return { chu: `Chưa có ghi chép nào ở ${vt.v.ten}.` };
      const lan = {}; r.forEach((x) => { if (!lan[x.viec]) lan[x.viec] = x; });
      return { chu: vt.v.ten + ':', dong: Object.values(lan).slice(0, 8).map((x) => `${x.viec}: ${G.ngayVN(x.ngay)}${x.ai ? ' · ' + ngan(x.ai) : ''}`) }; } },
    { ten: 'conviec', khop: (t) => /viec (con|chua|tre|nao)|chua xong|con gi|can lam|qua han|tre han|nhac gi|left today|pending|overdue|to do/.test(t), lam: async () => {
      if (laNB()) { const ds = (await G.viecNoiBo(hn())).filter((x) => x.tt !== 'xong'); return ds.length ? { chu: `Hôm nay còn ${ds.length} việc chưa xong:`, dong: ds.slice(0, 10).map((x) => '◯ ' + x.ten), nut: [['Mở Hôm nay', '#/']] } : { chu: 'Hôm nay xong hết việc rồi 👍' }; }
      const ds = G.dsChuong ? await G.dsChuong() : []; return ds.length ? { chu: `Có ${ds.length} việc cần chú ý:`, dong: ds.slice(0, 10).map((x) => '• ' + x.ten + (x.phu ? ' · ' + x.phu : '')), nut: [['Mở Hôm nay', '#/']] } : { chu: 'Hiện chưa có việc nào cần chú ý.' }; } },
    { ten: 'solieu', khop: (t) => /bao nhieu|tong|may chuyen|may kg|duoc nhieu|nhieu kg|thong ke|so lieu|how many|how much|total/.test(t), lam: async (t) => {
      const bc = (G.BC_VIEC || []).filter((b) => (q('noibo') || !/^nb\//.test(b.k)) && (!laNB() || /^nb\/|batthuong/.test(b.k)));
      const b = bc.map((x) => ({ x, d: diem(t, { ten: x.ten, kw: x.nhom + ' ' + x.k.replace(/\W/g, ' ') }) })).sort((a, c) => c.d - a.d)[0]; if (!b || b.d < 0.8) return null;
      const [tu, den, nhan] = kyCua(t); const c = b.x.ngay || 'Ngày'; const d = await G.docNhieu([{ bang: b.x.bang, gioiHan: 20000 }].concat(b.x.ct ? [{ bang: 'NhatKyPhunBonChiTiet', gioiHan: 40000 }] : []).concat(b.x.extra || []));
      let rows = (d[b.x.bang] || []).filter((r) => { const n = String(r[c] || r['Ngày'] || '').slice(0, 10); return n >= tu && n <= den && (!b.x.loc || Object.keys(b.x.loc).every((k) => r[k] === b.x.loc[k])); });
      const ai = nb2().find((n) => t.includes(bo(ngan(n)))); if (ai) rows = rows.filter((r) => String(r['Người ghi'] || '').includes(ngan(ai)));
      const ma = new Set(rows.map((r) => r['Mã NK'])); const ct = b.x.ct ? (d.NhatKyPhunBonChiTiet || []).filter((r) => ma.has(r['Mã NK'])) : [];
      const cs = b.x.cs(rows, ct, d); return { chu: `${b.x.ten}${ai ? ' · ' + ngan(ai) : ''} · ${nhan}:`, dong: cs.map(([l, v]) => `${l}: ${v}`), nut: [['📊 Xem báo cáo', '#/bcviec/' + encodeURIComponent(b.x.k)]] }; } },
    { ten: 'cachlam', khop: (t) => /lam sao|lam the nao|cach|huong dan|o dau|cho nao|chi em|chi toi|how (do|to|can)|where/.test(t), lam: async (t) => {
      const HD = G.HD_TRO || {}; const en = G.lang && G.lang() === 'en';
      const r = Object.keys(HD).map((k) => { const x = HD[k][en ? 'en' : 'vi'] || HD[k].vi; return { k, x, d: diem(t.replace(/lam sao|lam the nao|cach|huong dan|o dau|cho nao|chi em|chi toi/g, ''), { ten: x[0], kw: x[1].join(' ') }) }; }).sort((a, b) => b.d - a.d)[0];
      if (!r || r.d < 0.8) return null; return { chu: r.x[0] + ':', dong: r.x[1].map((s, i) => `${i + 1}. ${s}`).concat(r.x[2] ? ['💡 ' + r.x[2]] : []), nut: [['Làm ngay', '#/' + (r.k === 'anh' ? '' : r.k)]] }; } },
    { ten: 'chao', khop: (t) => /^(xin )?chao|^hello|^hi\b|cam on|thank/.test(t), lam: async (t) => ({ chu: /cam on|thank/.test(t) ? 'Dạ không có gì, cần gì anh chị cứ hỏi em nhé.' : `Chào ${ngan(S.u.ten)}, em là Trợ lý GreenLog. Anh chị cần xem gì?` }) },
  ];
  G._tim = { bo, moRong, diem, Y, kyCua, PHAM_VI, MAY, tiepTheo }; G.moKetQuaTim = (x) => moKetQua(x);
  const cauGoiY = () => (laNB() ? ['Hôm nay còn việc gì?', 'Kho sắp hết gì?', 'Máy sàng còn bao nhiêu giờ thì bảo trì?', 'Tuần này thu gom bao nhiêu kg?', 'Báo hỏng máy sàng', 'Mượn thang']
    : laAnh() ? ['Hôm nay ai nghỉ?', 'Việc nào còn trễ?', 'Kho sắp hết gì?', 'Villa 25 cắt cỏ lần cuối khi nào?', 'Tháng này thu gom bao nhiêu kg rác hữu cơ?', 'Máy sàng còn bao nhiêu giờ thì bảo trì?']
      : ['Hôm nay còn việc gì?', 'Villa 25 cắt cỏ lần cuối khi nào?', 'Tháng này vận chuyển bao nhiêu chuyến?', 'Kubota đang rảnh không?', 'Cách tạo phiếu giao việc']);
  const LUOT = 30; const khoaLuot = () => 'troly_luot_' + hn() + '_' + S.u.ten;
  G.traLoiTroLy = async (cau) => {
    const t = moRong(cau); let ket = null; let cheDo = 'co_ban';
    /* Gemini chỉ giúp hiểu câu → tên ý định; số liệu do app tự tính. Hết lượt / lỗi / chạy thử → chế độ cơ bản */
    const luot = +(API.LS.get(khoaLuot(), 0)) || 0;
    if (S.dm.coAI && API.coThat && API.coThat() && luot < LUOT && !API.LS.get('troly_het_' + hn(), false)) {
      try { const r = await API.goi('ai.troLy', { cau, yDinh: Y.map((x) => x.ten) }); API.LS.set(khoaLuot(), luot + 1); cheDo = 'thong_minh';
        if (r && r.y === 'ngoai') return { chu: PHAM_VI, cheDo };
        const y = r && Y.find((x) => x.ten === r.y); if (y) { ket = await y.lam(moRong((r.cauLai || cau) + ' ' + cau), cau); }
      } catch (e) { if (/hết|quota|429/i.test(e.message)) API.LS.set('troly_het_' + hn(), true); }
    }
    if (!ket) { for (const y of Y) { if (y.khop(t)) { try { ket = await y.lam(t, cau); } catch (e) { console.warn(e); ket = null; } if (ket) break; } } }
    if (!ket) { const ds = await G.chiMucTim(); const r = ds.map((x) => ({ x, d: diem(cau, x) })).filter((y) => y.d >= 1.8).sort((a, b) => b.d - a.d).slice(0, 3).map((y) => y.x);
      ket = r.length ? { chu: 'Em chưa hiểu hết câu này. Có phải anh chị muốn mở:', nut: r.map((x) => [x.ten, x.link && !x.link.startsWith('vt:') ? x.link : '', x]) } : { chu: PHAM_VI }; }
    ket.cheDo = cheDo; return ket;
  };
  const khoaChat = () => 'troly_chat_' + S.u.ten;
  G.man.troly = { ten: 'Trợ lý GreenLog', bt: '🤖', ic: 'tro_ly', nhom: 'Quản lý', ph: () => true, fn: async () => {
    const m = G.khung('Trợ lý GreenLog', 'Chỉ hỗ trợ việc trong GreenLog', true); m.classList.add('tl-man');
    const ls = API.LS.get(khoaChat(), []);
    m.innerHTML = `<div class="tl-khung"><div class="tl-ds" id="tlDs"></div><div class="chon tl-goiy">${cauGoiY().map((c) => `<button type="button" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="tl-nhap"><textarea id="tlCau" rows="1" placeholder="Hỏi em bất cứ điều gì về GreenLog…"></textarea><button class="nut nho mic" id="tlMic" type="button">🎤 Nói</button><button class="nut chinh" id="tlGui" type="button" aria-label="Gửi">Gửi</button></div>
      <div class="hang" style="justify-content:space-between;margin-top:6px"><small class="mo" id="tlCD"></small><button class="nut nho" id="tlMoi" type="button">Cuộc trò chuyện mới</button></div></div>`;
    const dsEl = m.querySelector('#tlDs'); const i = m.querySelector('#tlCau');
    const bong = (x) => { const toi = x.ai === 'toi'; const el = G.h(`<div class="tl-hang ${toi ? 'toi' : 'tl'}">${toi ? '' : `<span class="tl-av">${G.ROBOT(34)}</span>`}<div class="tl-bong">${esc(x.chu || '').replace(/\n/g, '<br>')}${x.dong && x.dong.length ? `<ul>${x.dong.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}${x.nut && x.nut.length ? `<div class="nhom-nut" style="margin-top:6px">${x.nut.map((n, k) => `<button type="button" class="nut nho" data-k="${k}">${esc(n[0])}</button>`).join('')}</div>` : ''}</div></div>`);
      el.querySelectorAll('[data-k]').forEach((b) => { b.onclick = () => { const n = x.nut[+b.dataset.k]; if (n[2]) moKetQua(n[2]); else if (n[1]) location.hash = n[1]; }; }); dsEl.appendChild(el); };
    const cuon = () => { setTimeout(() => { dsEl.lastElementChild && dsEl.lastElementChild.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, 30); };
    if (!ls.length) bong({ ai: 'tl', chu: `Chào ${ngan(S.u.ten)}, em là Trợ lý GreenLog 🤖. Anh chị hỏi số liệu, cách làm, hay nhờ em mở nhanh màn cần dùng. Bấm câu gợi ý bên dưới cũng được.` }); ls.forEach(bong);
    const cd = (c) => { m.querySelector('#tlCD').textContent = c === 'thong_minh' ? `Chế độ thông minh · còn ${Math.max(0, LUOT - (+(API.LS.get(khoaLuot(), 0)) || 0))} câu hôm nay` : 'Chế độ cơ bản'; };
    cd(S.dm.coAI && API.coThat && API.coThat() && !API.LS.get('troly_het_' + hn(), false) ? 'thong_minh' : 'co_ban'); cuon();
    const gui = async (cau) => { cau = String(cau || '').trim(); if (!cau) return; i.value = ''; const a = { ai: 'toi', chu: cau }; bong(a); ls.push(a);
      const cho = G.h(`<div class="tl-hang tl dang-nghi"><span class="tl-av">${G.ROBOT(34)}</span><div class="tl-bong">…</div></div>`); dsEl.appendChild(cho); cuon();
      let k; try { k = await G.traLoiTroLy(cau); } catch (e) { k = { chu: 'Em gặp lỗi khi tìm: ' + e.message }; } cho.remove();
      const b = { ai: 'tl', chu: k.chu, dong: k.dong, nut: (k.nut || []).filter((n) => n[1] || n[2]).map((n) => [n[0], n[1] || '', n[2] && n[2].link && n[2].link.startsWith('vt:') ? n[2] : null]) };
      if (!b.chu && !b.dong) b.chu = PHAM_VI; bong(b); ls.push({ ai: 'tl', chu: b.chu, dong: b.dong, nut: b.nut.filter((n) => !n[2]) }); API.LS.set(khoaChat(), ls.slice(-60)); cd(k.cheDo); cuon(); };
    m.querySelector('#tlGui').onclick = () => gui(i.value);
    i.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); gui(i.value); } });
    m.querySelectorAll('.tl-goiy [data-c]').forEach((b) => { b.onclick = () => gui(b.dataset.c); });
    m.querySelector('#tlMoi').onclick = () => { API.LS.set(khoaChat(), []); G.taiLai(); };
    if (G.mic) G.mic(m.querySelector('#tlMic'), i);
    if (G._cauTroLy) { const c = G._cauTroLy; G._cauTroLy = null; gui(c); }
  } };

  /* nút 🔍 trên đầu mọi màn + nút robot nổi góc phải */
  const khungFn = G.khung;
  G.khung = function (...a) { try { seedKho(); } catch (e) { /* bỏ qua */ } const m = khungFn.apply(this, a); try { setTimeout(() => {
    const dau = document.querySelector('header.dau'); if (dau && !dau.querySelector('.nut-tim')) { const b = G.h('<button class="nut-tron nut-tim" title="Tìm nhanh" aria-label="Tìm nhanh">🔍</button>'); b.onclick = () => G.moTimKiem(); const hd = dau.querySelector('.nut-hd') || dau.querySelector('#nutTao'); if (hd) hd.insertAdjacentElement('beforebegin', b); else { const tk = dau.querySelector('#nutTk'); if (tk) tk.insertAdjacentElement('beforebegin', b); else dau.appendChild(b); } }
    const tl = /^#\/troly/.test(location.hash); let f = document.querySelector('.fab-tl');
    if (tl) { if (f) f.remove(); } else if (!f) { f = G.h(`<button class="fab-tl" title="Trợ lý GreenLog" aria-label="Trợ lý GreenLog">${G.ROBOT(56)}</button>`); f.onclick = () => { location.hash = '#/troly'; }; document.body.appendChild(f); }
    if (G._suaDCMau) G._suaDCMau();
  }, 0); } catch (e) { /* bỏ qua */ } return m; };
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k' && S.u) { e.preventDefault(); G.moTimKiem(); } });
})();
