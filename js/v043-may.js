/* GreenLog 0.4.3 – mục 87: Kubota ghi theo lượt (nhận máy → chạm chuyến → trả máy, nhận bàn giao có báo), Sand Man tính giờ theo sàng
   Bảng KubotaLuot: một lượt mượn máy · KubotaChuyen: mỗi chạm = 1 chuyến · MaySangCat: dòng "Vận hành" của Sand Man (giờ bắt đầu/kết thúc) */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay, bao } = G;
  const hn = () => API.ngay();
  const gio = () => API.bayGio().slice(11, 16);
  Object.assign(API.BANG, { KubotaLuot: ['homnay', 2], KubotaChuyen: ['homnay', 2] });
  const HANG = ['Rác cắt tỉa', 'Rác bãi biển', 'Rác hữu cơ về khu ủ', 'Cây, chậu', 'Vật tư, đất, cát', 'Đồ sự kiện', 'Hỗ trợ bộ phận khác', 'Khác'];
  G.KUBOTA_HANG = HANG;
  const MOC_BT = 50; // giờ máy giữa 2 lần bảo trì
  const soGio = (a, b) => { const p = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m; }; return Math.max(0, Math.round((p(b) - p(a)) / 6) / 10); };
  const duocDung = () => S.u && S.u.nhom !== 'Quản lý nhà thầu' && (G.laAnhVu() || S.u.nhom === 'Nhân viên nội bộ' || S.u.nhom === 'Tổ trưởng');

  /* trạng thái máy: lượt đang mở (nếu có), các lượt hôm nay, số đồng hồ cuối */
  G.kubota = async () => {
    const [luot, chuyen] = await Promise.all([G.doc('KubotaLuot', { 'Ngày': { tu: G.congNgay(hn(), -60) } }).catch(() => []), G.doc('KubotaChuyen', { 'Ngày': hn() }).catch(() => [])]);
    const mo = luot.filter((x) => x['Trạng thái'] === 'Đang dùng').slice(-1)[0] || null;
    const homNay = luot.filter((x) => x['Ngày'] === hn());
    const dongHo = luot.map((x) => +x['Đồng hồ trả'] || +x['Đồng hồ nhận'] || 0).reduce((a, b) => Math.max(a, b), 0);
    return { mo, homNay, luot, chuyen, dongHo };
  };
  /* dòng ngắn cho nơi khác (Hôm nay của anh Pháp, Tổng quan) */
  G.kubotaNgan = async () => { const k = await G.kubota(); return k.mo ? `🔴 Đang dùng · ${String(k.mo['Người']).split(' ').slice(-1)[0]} · từ ${k.mo['Giờ nhận']}` : '🟢 Máy rảnh'; };

  const formDongHo = (tieuDe, goiY, them) => new Promise((ok) => {
    G.hop(tieuDe, `<p class="mo" style="margin-top:0">Chụp đồng hồ giờ máy Kubota, ghi số giờ đang hiện.</p><div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>`, (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'dh', nhan: 'Số giờ trên đồng hồ', loai: 'so', bb: true, gt: goiY || '' }, { k: 'anh', nhan: 'Ảnh đồng hồ giờ máy', loai: 'anh', toiDa: 1 }].concat(them || []));
      o.querySelector('#l').onclick = () => { try { const v = lay(); if (!v.anh || !v.anh.length) throw new Error('Cần ảnh đồng hồ'); dong(); ok(v); } catch (e) { bao(e.message, true); } };
    });
    const kt = setInterval(() => { if (!document.querySelector('.lop-phu #f')) { clearInterval(kt); ok(null); } }, 400);
  });

  async function nhanMay(k) {
    const v = await formDongHo(k.mo ? 'Nhận bàn giao Kubota từ ' + k.mo['Người'] : 'Nhận máy Kubota', k.dongHo || ''); if (!v) return;
    const g = gio(); const dh = +v.dh;
    if (k.mo) { // bàn giao: lượt trước tự đóng bằng số đồng hồ của người nhận
      const sg = Math.max(0, Math.round((dh - (+k.mo['Đồng hồ nhận'] || dh)) * 10) / 10);
      await API.goi('sua', { bang: 'KubotaLuot', khoa: { 'Mã': k.mo['Mã'] }, doi: { 'Trạng thái': 'Đã trả', 'Giờ trả': g, 'Đồng hồ trả': dh, 'Ảnh trả': v.anh.join(' | '), 'Số giờ': sg, 'Bàn giao cho': S.u.ten } });
      await dungSang(k.mo['Mã'], g);
    }
    const lech = !k.mo && k.dongHo && dh - k.dongHo >= 0.2 ? Math.round((dh - k.dongHo) * 10) / 10 : 0;
    await API.goi('ghi', { bang: 'KubotaLuot', dong: { 'Mã': G.ma('KB'), 'Ngày': hn(), 'Người': S.u.ten, 'Giờ nhận': g, 'Đồng hồ nhận': dh, 'Ảnh nhận': v.anh.join(' | '), 'Trạng thái': 'Đang dùng',
      'Nhận bàn giao từ': k.mo ? k.mo['Người'] : '', 'Giờ chạy không ghi': lech || '' } });
    bao(k.mo ? `Đã nhận bàn giao · đã báo ${k.mo['Người']} và tổ trưởng` : 'Đã nhận máy'); G.taiLai();
  }
  async function traMay(k) {
    const sang = await sangDang(k.mo['Mã']);
    const v = await formDongHo('Trả máy Kubota', k.mo['Đồng hồ nhận'] || '', [{ k: 'dau', nhan: 'Đổ dầu diesel (lít, nếu có)', loai: 'so' }]
      .concat(sang ? [{ k: 'kts', nhan: 'Sàng cát xong lúc', loai: 'chu', gt: gio() }] : [])); if (!v) return;
    const dh = +v.dh; const g = gio();
    if (dh < +k.mo['Đồng hồ nhận']) return bao('Số đồng hồ nhỏ hơn lúc nhận máy (' + k.mo['Đồng hồ nhận'] + ')', true);
    await API.goi('sua', { bang: 'KubotaLuot', khoa: { 'Mã': k.mo['Mã'] }, doi: { 'Trạng thái': 'Đã trả', 'Giờ trả': g, 'Đồng hồ trả': dh, 'Ảnh trả': v.anh.join(' | '), 'Số giờ': Math.round((dh - (+k.mo['Đồng hồ nhận'])) * 10) / 10, 'Dầu (lít)': v.dau || '' } });
    if (sang) await dungSang(k.mo['Mã'], /^\d{1,2}:\d{2}$/.test(v.kts || '') ? v.kts : g, !/^\d{1,2}:\d{2}$/.test(v.kts || ''));
    bao('Đã trả máy'); G.taiLai();
  }
  const sangDang = async (maLuot) => (await G.doc('MaySangCat', { 'Ngày': hn() })).find((x) => x['Máy'] === 'Sand Man' && x['Bảo trì'] === 'Vận hành' && x['Giờ bắt đầu'] && !x['Giờ kết thúc'] && (!maLuot || !x['Mã lượt'] || x['Mã lượt'] === maLuot));
  async function dungSang(maLuot, kt, uoc) {
    const s = await sangDang(maLuot); if (!s) return;
    await API.goi('sua', { bang: 'MaySangCat', khoa: { 'Ngày': hn(), 'Máy': 'Sand Man', 'Giờ bắt đầu': s['Giờ bắt đầu'] }, doi: { 'Giờ kết thúc': kt, 'Số giờ': soGio(s['Giờ bắt đầu'], kt), 'Ghi chú': [s['Ghi chú'], uoc ? 'giờ kết thúc ước tính' : ''].filter(Boolean).join(' · ') } });
  }

  async function manMay() {
    const m = G.khung('Máy bãi biển', 'Kubota · Sand Man', '#/viec');
    const [k, sc] = await Promise.all([G.kubota(), G.doc('MaySangCat', { 'Ngày': { tu: G.congNgay(hn(), -90) } })]);
    const dung = duocDung(); const toi = k.mo && k.mo['Người'] === S.u.ten;
    const sang = sc.find((x) => x['Ngày'] === hn() && x['Máy'] === 'Sand Man' && x['Bảo trì'] === 'Vận hành' && x['Giờ bắt đầu'] && !x['Giờ kết thúc']);
    const ch = k.mo ? k.chuyen.filter((x) => x['Mã lượt'] === k.mo['Mã']) : [];
    const dem = (h) => ch.filter((x) => x['Loại hàng'] === h).length;
    /* bảo trì: Kubota theo đồng hồ, Sand Man theo tổng giờ sàng */
    const btCuoi = (may) => sc.filter((x) => x['Máy'] === may && /Bảo trì|Sửa/.test(x['Bảo trì'] || '')).slice(-1)[0];
    const btK = btCuoi('Kubota'); const dauTien = k.luot.map((x) => +x['Đồng hồ nhận']).filter((x) => x > 0).reduce((a, b) => Math.min(a, b), Infinity);
    const dhBT = btK ? (k.luot.filter((x) => x['Ngày'] <= btK['Ngày']).map((x) => +x['Đồng hồ trả'] || 0).reduce((a, b) => Math.max(a, b), 0) || dauTien) : dauTien; // chưa có lần bảo trì nào: tính từ lần ghi đầu tiên
    const gioK = isFinite(dhBT) ? Math.round((k.dongHo - dhBT) * 10) / 10 : 0;
    const btS = btCuoi('Sand Man'); const gioS = Math.round(sc.filter((x) => x['Máy'] === 'Sand Man' && x['Bảo trì'] === 'Vận hành' && (!btS || x['Ngày'] > btS['Ngày'])).reduce((a, x) => a + (+x['Số giờ'] || 0), 0) * 10) / 10;
    const sangNay = sc.filter((x) => x['Ngày'] === hn() && x['Máy'] === 'Sand Man' && x['Bảo trì'] === 'Vận hành');
    const khong = sc.find((x) => x['Ngày'] === hn() && x['Loại'] === 'Không sàng');
    const luotHTML = k.homNay.map((x) => { const c = k.chuyen.filter((y) => y['Mã lượt'] === x['Mã']); const tom = HANG.map((h) => [h, c.filter((y) => y['Loại hàng'] === h).length]).filter((y) => y[1]).map((y) => y[0] + ' ' + y[1]).join(', ');
      return `<div class="muc"><div class="gian"><b>${esc(x['Giờ nhận'])}–${esc(x['Giờ trả'] || 'đang dùng')} · ${esc(x['Người'])}</b><div class="mo">${x['Số giờ'] ? esc(x['Số giờ']) + ' giờ máy · ' : ''}${esc(tom || 'chưa ghi chuyến')}${x['Bàn giao cho'] ? ' · giao cho ' + esc(x['Bàn giao cho']) : ''}${x['Giờ chạy không ghi'] ? ` · <b style="color:var(--do)">⚠ ${esc(x['Giờ chạy không ghi'])} giờ máy chạy không ghi trước lượt này</b>` : ''}</div></div></div>`; }).join('');
    m.innerHTML = `<div class="luoi2 may2">
      <div class="the may-the" id="theKubota"><div class="hang"><h2 class="gian" style="margin:0">🚜 Kubota</h2><span class="chip ${k.mo ? 'do' : 'xanh'}">${k.mo ? '🔴 Đang dùng' : '🟢 Máy rảnh'}</span></div>
        ${k.mo ? `<div class="mo" style="margin:4px 0 8px">${esc(k.mo['Người'])} · từ ${esc(k.mo['Giờ nhận'])} · ${ch.length} chuyến${k.mo['Nhận bàn giao từ'] ? ' · nhận bàn giao từ ' + esc(k.mo['Nhận bàn giao từ']) : ''}</div>` : `<div class="mo" style="margin:4px 0 8px">Đồng hồ: ${k.dongHo || '—'} giờ</div>`}
        ${dung && !k.mo ? '<button class="nut chinh rong" id="nhan" style="min-height:56px">Nhận máy</button>' : ''}
        ${dung && k.mo && !toi ? `<button class="nut rong" id="nhan" style="min-height:56px">Nhận bàn giao từ ${esc(String(k.mo['Người']).split(' ').slice(-1)[0])}</button>` : ''}
        ${toi ? `<div class="mo" style="margin:6px 0">Chạm 1 lần = 1 chuyến:</div><div class="luoi-chuyen">${HANG.map((h) => `<button type="button" class="o-chuyen" data-h="${esc(h)}"><b>${dem(h)}</b><span>${esc(h)}</span></button>`).join('')}</div>
          ${ch.length ? '<button type="button" class="nut nho" id="boCh" style="margin-top:6px">↶ Bỏ chuyến vừa ghi</button>' : ''}
          <div class="nhom-nut" style="margin-top:10px">${sang ? `<button class="nut rong" id="ktSang">■ Kết thúc sàng cát (từ ${esc(sang['Giờ bắt đầu'])})</button>` : khong ? '' : '<button class="nut rong" id="bdSang">🏖 Sàng cát ▶</button>'}<button class="nut chinh rong" id="tra">Trả máy</button></div>` : ''}
        <div class="mo" style="margin-top:10px">Bảo trì: ${gioK} / ${MOC_BT} giờ máy từ lần trước${gioK >= MOC_BT ? ' · <b style="color:var(--do)">đến hạn</b>' : ''} · lịch ngày 9, 19, 29</div></div>
      <div class="the may-the"><div class="hang"><h2 class="gian" style="margin:0">🏖 Sand Man</h2><span class="chip ${sang ? 'cam' : sangNay.length ? 'xanh' : ''}">${sang ? 'Đang sàng' : sangNay.length ? 'Đã sàng' : khong ? 'Không sàng' : 'Chưa sàng'}</span></div>
        <div class="mo" style="margin:4px 0 8px">${sangNay.length ? sangNay.map((x) => `${esc(x['Giờ bắt đầu'])}–${esc(x['Giờ kết thúc'] || '…')} · ${esc(x['Đoạn bãi'] || '')}`).join('<br>') : 'Sàng cát bấm trên thẻ Kubota (Kubota kéo Sand Man).'}</div>
        <div class="may-trangthai"></div>
        <div class="mo">Bảo trì: ${gioS} giờ sàng từ lần trước · lịch ngày 10, 20, 30</div>
        ${dung ? '<button class="nut nho" id="xangS" style="margin-top:8px">⛽ Ghi đổ xăng Sand Man</button>' : ''}</div></div>
      ${k.homNay.length ? `<h3 class="tieu-nhom">Kubota hôm nay (${k.homNay.length} lượt)</h3><div class="ds">${luotHTML}</div>` : ''}
      ${dung ? '<button class="nut" id="bt" style="margin-top:10px">🔧 Ghi bảo trì</button>' : ''}`;
    const q1 = (s) => m.querySelector(s);
    if (q1('#nhan')) q1('#nhan').onclick = () => nhanMay(k);
    if (q1('#tra')) q1('#tra').onclick = () => traMay(k);
    m.querySelectorAll('[data-h]').forEach((b) => { b.onclick = () => chay(async () => {
      let bp = ''; if (b.dataset.h === 'Hỗ trợ bộ phận khác') { const x = await G.chonDS('Bộ phận nào? (bỏ qua cũng được)', S.dm.boPhan || []); bp = x ? x.ten : ''; }
      await API.goi('ghi', { bang: 'KubotaChuyen', dong: { 'Mã': G.ma('CH'), 'Ngày': hn(), 'Giờ': gio(), 'Mã lượt': k.mo['Mã'], 'Loại hàng': b.dataset.h, 'Bộ phận': bp, 'Người ghi': S.u.ten } });
      b.querySelector('b').textContent = +b.querySelector('b').textContent + 1; bao('+1 chuyến · ' + b.dataset.h); }, b); });
    if (q1('#boCh')) q1('#boCh').onclick = (e) => chay(async () => { const c = ch.slice(-1)[0]; if (!c) return; await API.goi('xoa', { bang: 'KubotaChuyen', khoa: { 'Mã': c['Mã'] } }); bao('Đã bỏ 1 chuyến ' + c['Loại hàng']); G.taiLai(); }, e.target);
    if (q1('#bdSang')) q1('#bdSang').onclick = () => G.hop('🏖 Bắt đầu sàng cát', '<div id="f"></div><button class="nut chinh rong" id="l">▶ Bắt đầu lúc này</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'bai', nhan: 'Khu vực bãi', loai: 'nhieu', ds: (S.dm.diemkhac || []).filter((x) => x.loai === 'Bãi biển').map((x) => x.ten), bb: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'MaySangCat', dong: { 'Ngày': '', 'Máy': 'Sand Man', 'Bảo trì': 'Vận hành', 'Giờ bắt đầu': gio(), 'Giờ kết thúc': '', 'Đoạn bãi': v.bai, 'Mã lượt': k.mo['Mã'], 'Người ghi': '' } }); dong(); bao('Đã bắt đầu sàng'); G.taiLai(); }, e.target); });
    if (q1('#ktSang')) q1('#ktSang').onclick = () => G.hop('■ Kết thúc sàng cát', '<div id="f"></div><button class="nut chinh rong" id="l">■ Kết thúc lúc này</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'anh', nhan: 'Ảnh bãi sau khi sàng', loai: 'anh', toiDa: 3 }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const kt = gio(); await API.goi('sua', { bang: 'MaySangCat', khoa: { 'Ngày': hn(), 'Máy': 'Sand Man', 'Giờ bắt đầu': sang['Giờ bắt đầu'] }, doi: { 'Giờ kết thúc': kt, 'Số giờ': soGio(sang['Giờ bắt đầu'], kt), 'Ảnh': v.anh.join(' | ') } }); dong(); bao('Đã kết thúc sàng'); G.taiLai(); }, e.target); });
    if (q1('#xangS')) q1('#xangS').onclick = () => G.hop('⛽ Đổ xăng Sand Man', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'l', nhan: 'Số lít xăng', loai: 'so', bb: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'MaySangCat', dong: { 'Ngày': '', 'Máy': 'Sand Man', 'Bảo trì': 'Đổ xăng', 'Nhiên liệu (lít)': v.l, 'Người ghi': '' } }); dong(); bao('Đã ghi đổ xăng'); }, e.target); });
    if (q1('#bt')) q1('#bt').onclick = () => G.hop('🔧 Ghi bảo trì', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'Máy', nhan: 'Máy', loai: 'chips', ds: ['Kubota', 'Sand Man'], bb: true }, { k: 'Bảo trì', nhan: 'Loại', loai: 'chips', ds: ['Bảo trì định kỳ', 'Sửa chữa'], bb: true }, { k: 'Ảnh', nhan: 'Ảnh', loai: 'anh', toiDa: 3 }, { k: 'Ghi chú', nhan: 'Ghi chú', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'MaySangCat', dong: Object.assign({ 'Ngày': '', 'Người ghi': '' }, v) }); dong(); bao('Đã lưu'); G.taiLai(); }, e.target); });
    /* giữ phần "Hôm nay không sàng được" (mục 73) trên thẻ Sand Man */
    if (G.ganKhongSang) G.ganKhongSang(m.querySelector('.may-trangthai'), dung && !sang && !sangNay.length);
  }

  /* thay màn máy cũ; anh Pháp không vào được việc nội bộ (mục 92) */
  const nbCu = G.man.nb.fn;
  G.man.nb.fn = (loai, ...r) => (loai === 'may' ? manMay() : nbCu(loai, ...r));

  /* chuông: 17:30 nhắc người giữ máy, 18:00 báo tổ trưởng / Trưởng bộ phận; bàn giao → báo người trước */
  const chuong = G.dsChuong;
  G.dsChuong = async () => { const out = await chuong(); try {
    if (!duocDung()) return out; const k = await G.kubota(); const g = gio();
    if (k.mo && k.mo['Người'] === S.u.ten && g >= '17:30') out.push({ ten: '🚜 Nhớ trả máy Kubota', phu: 'Chụp đồng hồ giờ máy khi trả', link: 'nb/may' });
    if (k.mo && k.mo['Người'] !== S.u.ten && g >= '18:00' && (G.laAnhVu() || S.u.nhom === 'Tổ trưởng')) out.push({ ten: '🚜 Kubota chưa trả: ' + k.mo['Người'], phu: 'Từ ' + k.mo['Giờ nhận'], link: 'nb/may' });
    k.homNay.filter((x) => x['Bàn giao cho'] && (x['Người'] === S.u.ten || S.u.nhom === 'Tổ trưởng' || G.laAnhVu())).forEach((x) => out.push({ ten: `🚜 ${x['Bàn giao cho']} đã nhận Kubota lúc ${x['Giờ trả']}`, phu: 'Bàn giao từ ' + x['Người'], link: 'nb/may' }));
    if (G.laAnhVu()) k.homNay.filter((x) => x['Giờ chạy không ghi']).forEach((x) => out.push({ ten: `⚠ Kubota chạy ${x['Giờ chạy không ghi']} giờ không ghi`, phu: 'Trước lượt của ' + x['Người'] + ' lúc ' + x['Giờ nhận'], link: 'nb/may' }));
  } catch (e) { /* bỏ qua */ } return out; };

  /* báo cáo riêng (mục 72/3): Kubota theo lượt, chuyến theo loại hàng */
  const bang = (o, a, b) => `<table class="bang"><tr><th>${esc(a)}</th><th>${esc(b)}</th></tr>${Object.keys(o).sort((x, y) => o[y] - o[x]).map((k) => `<tr><td>${esc(k)}</td><td>${o[k]}</td></tr>`).join('')}</table>`;
  if (G.BC_VIEC) G.BC_VIEC.push({ k: 'kubota', ten: 'Kubota: giờ máy, chuyến', nhom: 'Bãi biển', bang: 'KubotaLuot', extra: [{ bang: 'KubotaChuyen' }], gt: (r) => +r['Số giờ'] || 0, dvt: 'giờ máy',
    cs: (d, ct, x) => { const ch = (x.KubotaChuyen || []).filter((c) => d.some((r) => r['Mã'] === c['Mã lượt']));
      return [['Số lượt', d.length], ['Giờ máy', Math.round(d.reduce((a, r) => a + (+r['Số giờ'] || 0), 0) * 10) / 10], ['Số chuyến', ch.length], ['Chuyến rác cắt tỉa', ch.filter((c) => c['Loại hàng'] === 'Rác cắt tỉa').length], ['Hỗ trợ bộ phận khác', ch.filter((c) => c['Loại hàng'] === 'Hỗ trợ bộ phận khác').length], ['Dầu (lít)', d.reduce((a, r) => a + (+r['Dầu (lít)'] || 0), 0)]]; },
    them: (d, ct, x) => { const ch = (x.KubotaChuyen || []).filter((c) => d.some((r) => r['Mã'] === c['Mã lượt'])); const o = {}; ch.forEach((c) => { o[c['Loại hàng']] = (o[c['Loại hàng']] || 0) + 1; }); const n = {}; d.forEach((r) => { n[r['Người']] = Math.round(((n[r['Người']] || 0) + (+r['Số giờ'] || 0)) * 10) / 10; });
      return bang(o, 'Loại hàng', 'Số chuyến') + bang(n, 'Người', 'Giờ máy'); },
    cot: ['Ngày', 'Người', 'Giờ nhận', 'Giờ trả', 'Đồng hồ nhận', 'Đồng hồ trả', 'Số giờ', 'Dầu (lít)', 'Nhận bàn giao từ', 'Bàn giao cho', 'Giờ chạy không ghi'] });
})();
