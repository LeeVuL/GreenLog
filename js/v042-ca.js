/* GreenLog 0.4.2 · mục 76 khối lượng trong ngày · mục 77 xem ảnh · mục 78 việc ngoài danh sách */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay, bao } = G;
  const hn = () => API.ngay(); const so = (n, k) => G.so(Math.round((+n || 0) * 10) / 10, k == null ? 1 : k);
  const cong = (ds, c) => ds.reduce((a, r) => a + (+String(r[c] || 0).replace(',', '.') || 0), 0);
  const phut = (a, b) => { const p = (s) => { const x = String(s || '').match(/(\d{1,2}):(\d{2})/); return x ? +x[1] * 60 + +x[2] : null; }; const x = p(a), y = p(b); return x != null && y != null ? Math.max(0, y - x) : 0; };

  /* ---------- khối lượng mỗi việc (mục 76) ---------- */
  const KL = {
    'nb/bien': (d) => `${so(cong(d, 'kg rác'))} kg rác`,
    'nb/ktbien': (d) => `${d.length} lần kiểm tra${d.some((r) => r['Tình trạng'] && r['Tình trạng'] !== 'Sạch') ? ' · có chỗ chưa sạch' : ' · sạch'}`,
    'nb/may': (d) => { const h = cong(d, 'Số giờ') || d.reduce((a, r) => a + phut(r['Giờ bắt đầu'], r['Giờ kết thúc']), 0) / 60; const k = d.filter((r) => r['Loại'] === 'Không sàng'); return k.length && !h ? 'Không sàng: ' + (k[0]['Lý do'] || '') : `${so(h)} giờ chạy máy`; },
    'nb/vuonrau': (d) => `${new Set(d.map((r) => r['Mã vườn'])).size} vườn`,
    'nb/thuhoach': (d) => `${so(cong(d, 'kg'))} kg`,
    'nb/noithat': (d) => `${new Set(d.map((r) => r['Mã điểm'])).size} điểm · ${so(cong(d, 'Số chậu tưới'), 0)} chậu`,
    'nb/vuonuomnt': (d) => [...new Set(d.map((r) => r['Loại ghi'] === 'Chăm sóc' || !r['Loại ghi'] ? r['Việc'] : `${r['Loại ghi']} ${r['Số lượng'] || ''} ${r['ĐVT'] || ''}`))].join(' · '),
    vuonuom: (d) => [...new Set(d.map((r) => r['Loại ghi'] === 'Chăm sóc' || !r['Loại ghi'] ? r['Việc'] : `${r['Loại ghi']} ${r['Số lượng'] || ''} ${r['ĐVT'] || ''}`))].join(' · '),
    'nb/rac': (d) => `${so(cong(d, 'kg rác thu gom'))} kg rau củ`,
    'nb/compost': (d) => `${so(cong(d, 'Phân compost tuần hoàn (kg)'))} kg compost`,
    tuoi: (d) => `${new Set(d.map((r) => r['Mã vị trí'])).size} vị trí`,
    'cum/DV10': (d) => `${d.length} cụm`, 'cum/DV11': (d) => `${d.length} cụm`,
    vanchuyen: (d) => `${so(cong(d, 'Số chuyến'), 0)} chuyến`,
    donghonuoc: (d) => `${d.length} đồng hồ`,
    phatsinh: (d) => `${d.length} việc`,
  };
  G.klViec = (link, ds) => { try { return ds && ds.length && KL[link] ? KL[link](ds) : ''; } catch (e) { return ''; } };
  /* mọi ảnh trong các dòng ghi (cột bắt đầu bằng "Ảnh") */
  G.anhCua = (ds) => { const out = []; (ds || []).forEach((r) => Object.keys(r).forEach((k) => { if (!/^Ảnh/.test(k) || !r[k]) return; (Array.isArray(r[k]) ? r[k] : API.dsAnh(r[k])).forEach((a) => out.push({ url: API.anhUrl(a), loai: k, r })); })); return out; };

  /* ---------- ô Việc: ✓ người · khối lượng · 📷 n; Trưởng bộ phận bấm dòng ✓ để xem ảnh (mục 77) ---------- */
  const viecFn = G.man.viec.fn;
  G.man.viec.fn = async (...a) => {
    await viecFn(...a); const m = document.getElementById('noiDung') || document.getElementById('app'); if (!m) return;
    const tt = await G.trangThaiHomNay().catch(() => ({}));
    m.querySelectorAll('a.o-viec').forEach((el) => { const k = el.getAttribute('href').replace('#/', ''); const x = tt[k]; if (!x) return;
      const nho = [...el.querySelectorAll('small')].find((s) => /^✓/.test(s.textContent.trim())); if (!nho) return;
      const kl = G.klViec(k, x.ds); const na = G.anhCua(x.ds).length;
      nho.innerHTML = `✓ ${esc(x.ai)}${kl ? ' · ' + esc(kl) : ''}${na ? ' · 📷 ' + na : ''}`;
      if (G.laAnhVu() && na) { nho.style.textDecoration = 'underline'; nho.title = 'Xem ảnh'; nho.onclick = (e) => { e.preventDefault(); e.stopPropagation(); location.hash = '#/xemviec/' + encodeURIComponent(k); }; }
    });
  };

  /* ---------- màn xem 1 việc trong ngày: từng lần ghi + ảnh lớn (mục 77) ---------- */
  const tenViec = (k) => { const a = document.querySelector(`a.o-viec[href="#/${k}"] b`); return a ? a.textContent : ({ 'nb/bien': 'Vệ sinh bãi biển', 'nb/ktbien': 'Kiểm tra bãi biển', 'nb/may': 'Máy sàng cát', 'nb/vuonrau': 'Vị Garden', 'nb/thuhoach': 'Thu hoạch', 'nb/noithat': 'Cây nội thất', 'nb/vuonuomnt': 'Vườn ươm cây nội thất', vuonuom: 'Vườn ươm cây bụi', 'nb/rac': 'Thu gom rau củ làm compost', 'nb/compost': 'Phân compost', tuoi: 'Tưới nước sân vườn', 'cum/DV10': 'Vệ sinh theo cụm', 'cum/DV11': 'Nhổ cỏ dại', vanchuyen: 'Vận chuyển', donghonuoc: 'Đồng hồ nước', phatsinh: 'Việc phát sinh' }[k] || k); };
  const theLanGhi = (k, r, i) => {
    const anh = G.anhCua([r]); const gio = String(r['Giờ ghi'] || r['Giờ'] || r['Bắt đầu'] || r['Giờ bắt đầu'] || '').replace(/^\d{4}-\d{2}-\d{2} /, '').slice(0, 5);
    const kl = G.klViec(k, [r]); const noi = r['Buổi'] || r['Đoạn bãi'] || r['Vườn'] || (r['Mã vị trí'] ? G.tenVT(r['Mã vị trí']) : '') || (r['Mã điểm'] ? G.tenVT(r['Mã điểm']) : '') || r['Cụm'] || '';
    return `<div class="the xv-the"><div class="hang" style="justify-content:space-between"><b>${esc(noi || 'Lần ' + (i + 1))}${gio ? ' · ' + esc(gio) : ''}</b><span class="mo">${esc(r['Người ghi'] || r['Người đọc'] || '')}</span></div>
      ${kl || r['Mô tả'] || r['Ghi chú'] ? `<div class="mo">${esc([kl, r['Mô tả'] || r['Ghi chú'] || ''].filter(Boolean).join(' · '))}</div>` : ''}
      ${anh.length ? `<div class="xv-anh">${anh.map((a) => `<figure><img src="${esc(a.url)}" alt="" loading="lazy" onclick="GL.phongAnh(this.src)"><figcaption>${esc(a.loai.replace(/^Ảnh\s*/, '') || 'Ảnh')}</figcaption></figure>`).join('')}</div>` : '<div class="mo">Không có ảnh</div>'}
      ${G.laAnhVu() ? `<div class="nhom-nut" style="margin-top:8px"><button class="nut nho" data-hop="${i}">📌 Đưa vào họp</button><button class="nut nho" data-lai="${i}">↺ Yêu cầu làm lại</button></div>` : ''}</div>`;
  };
  G.man.xemviec = { an: true, fn: async (...a) => {
    const p = a.filter((x) => x != null && x !== '').map((x) => decodeURIComponent(String(x))).join('/'); const mm = p.match(/^(.*?)(?:\/(\d{4}-\d{2}-\d{2}))?$/) || []; const k = mm[1] || ''; const ngay = mm[2] || hn();
    const m = G.khung(tenViec(k), G.thu(new Date(ngay)) + ', ' + G.ngayVN(ngay), '#/viec');
    const tt = await G.trangThaiHomNay(ngay).catch(() => ({})); const x = tt[k]; const ds = x ? x.ds : [];
    m.innerHTML = `<div class="the"><b>${esc(G.klViec(k, ds) || 'Chưa ghi')}</b><div class="mo">${ds.length} lần ghi · ${G.anhCua(ds).length} ảnh</div></div>${ds.map((r, i) => theLanGhi(k, r, i)).join('')}`;
    ganNut(m, k, ds);
  } };
  function ganNut(m, k, ds) {
    m.querySelectorAll('[data-hop]').forEach((b) => { b.onclick = () => { const r = ds[+b.dataset.hop]; G.ghimHop({ tieuDe: tenViec(k) + ' · ' + G.ngayVN(r['Ngày'] || hn()), link: '#/xemviec/' + encodeURIComponent(k) + '/' + (r['Ngày'] || hn()), anh: G.anhCua([r]).map((a) => a.url).slice(0, 3) }); }; });
    m.querySelectorAll('[data-lai]').forEach((b) => { b.onclick = () => { const r = ds[+b.dataset.lai];
      G.hop('↺ Yêu cầu làm lại', '<div id="f"></div><button class="nut chinh rong" id="l">Gửi yêu cầu</button>', (o, dong) => {
        const nb = /^nb\//.test(k); const lay = G.form(o.querySelector('#f'), [{ nhan: tenViec(k) + ' · ' + (r['Người ghi'] || ''), loai: 'ghichu' }, { k: 'nd', nhan: 'Lời nhắn (cần làm lại gì)', loai: 'mota', bb: true },
          { k: 'doi', nhan: 'Giao cho', loai: 'chips', ds: ['Nội bộ', 'Đội cơ động', 'Đội khu vực'], bb: true, gt: nb ? 'Nội bộ' : (r['Đội'] || '') }, { k: 'muc', nhan: 'Mức độ', loai: 'chips', ds: ['Cao', 'Trung bình'], gt: 'Cao' }]);
        o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay();
          await API.goi('ghi', { bang: 'Phieu', dong: { 'Mã phiếu': '', 'Loại': 'Làm lại', 'Nguồn': 'Trưởng bộ phận xem ảnh', 'Nhóm lỗi': tenViec(k), 'Loại lỗi': 'Yêu cầu làm lại', 'Mức độ': v.muc || 'Cao', 'Mã vị trí': r['Mã vị trí'] || r['Mã điểm'] || '', 'Mô tả': tenViec(k) + ': ' + v.nd, 'Giao cho': v.doi, 'Người tạo': S.u.ten, 'Giờ tạo': API.bayGio(), 'Hạn': G.congNgay(hn(), 1) + ' 17:00', 'Trạng thái': 'Mới', 'Ảnh': G.anhCua([r]).map((a) => a.url).slice(0, 3), 'Số lần trả lại': '0' } });
          dong(); bao('Đã gửi yêu cầu làm lại · người làm nhận phiếu'); }, e.target); }); }; });
  }

  /* ---------- Ảnh trong ngày cho cả bộ phận (mục 77) ---------- */
  G.man.anhngay = { ten: 'Ảnh trong ngày', ic: 'chup_anh', nhom: 'Theo dõi', ph: 'homnay', cap: 3, fn: async (ngay) => {
    ngay = ngay || hn(); const loc = G.man.anhngay.loc || 'tat';
    const m = G.khung('📷 Ảnh trong ngày', G.thu(new Date(ngay)) + ', ' + G.ngayVN(ngay), '#/');
    const tt = await G.trangThaiHomNay(ngay).catch(() => ({}));
    const nhom = (k) => (/^nb\//.test(k) ? 'Nội bộ' : 'Nhà thầu');
    const ks = Object.keys(tt).filter((k) => G.anhCua(tt[k].ds).length && (loc === 'tat' || nhom(k) === loc));
    const tong = ks.reduce((a, k) => a + G.anhCua(tt[k].ds).length, 0);
    m.innerHTML = `<div class="hang" style="gap:8px;flex-wrap:wrap;margin-bottom:10px"><input type="date" id="ng" value="${ngay}" style="max-width:180px"><div class="chon">${[['tat', 'Tất cả'], ['Nội bộ', 'Nội bộ'], ['Nhà thầu', 'Nhà thầu']].map(([a, b]) => `<button data-l="${a}" class="${loc === a ? 'dang' : ''}">${b}</button>`).join('')}</div></div>
      <p class="mo">${tong} ảnh · ${ks.length} việc</p>
      ${ks.map((k) => `<div class="the"><div class="hang" style="justify-content:space-between"><b>${esc(tenViec(k))}</b><a class="nut nho" href="#/xemviec/${encodeURIComponent(k)}/${ngay}">Xem từng lần ghi ›</a></div><div class="mo">${esc(G.klViec(k, tt[k].ds))} · ${esc(tt[k].ai)}</div>
        <div class="xv-anh">${G.anhCua(tt[k].ds).slice(0, 12).map((a) => `<figure><img src="${esc(a.url)}" alt="" loading="lazy" onclick="GL.phongAnh(this.src)"><figcaption>${esc(String(a.r['Người ghi'] || '').split(' ').pop())}</figcaption></figure>`).join('')}</div></div>`).join('') || '<div class="the mo">Chưa có ảnh nào trong ngày.</div>'}`;
    m.querySelector('#ng').onchange = (e) => { location.hash = '#/anhngay/' + e.target.value; };
    m.querySelectorAll('[data-l]').forEach((b) => { b.onclick = () => { G.man.anhngay.loc = b.dataset.l; G.taiLai(); }; });
  } };

  /* ---------- Hôm nay: nút việc ngoài danh sách + việc làm thêm ở tab Xong (mục 78) ---------- */
  G.moViecKhac = () => { G.man.phatsinh.moNgay = true; location.hash = '#/phatsinh'; };
  const psFn = G.man.phatsinh.fn;
  G.man.phatsinh.fn = async (...a) => { await psFn(...a); if (G.man.phatsinh.moNgay) { G.man.phatsinh.moNgay = false; const b = document.querySelector('#bd'); if (b) b.click(); } };
  const hnFn = G.manHomNayMoi;
  if (hnFn) G.manHomNayMoi = async (...a) => {
    await hnFn(...a); const m = document.getElementById('noiDung') || document.getElementById('app'); if (!m || G.qv('CN06') < 2) return;
    const goc = m.querySelector('.loc-tt');
    const ps = (await G.doc('ViecPhatSinh', { 'Ngày': hn() })).filter((r) => r['Người ghi'] === S.u.ten || (S.u.doi && r['Đội'] === S.u.doi));
    if (m.querySelector('.viec-khac')) return;
    const nut = G.h(`<button class="nut rong viec-khac" style="margin:10px 0">＋ Việc khác ngoài danh sách</button>`); nut.onclick = G.moViecKhac;
    if (goc) goc.insertAdjacentElement('afterend', nut); else (document.getElementById('noiDung') || m).appendChild(nut);
    if (ps.length) nut.insertAdjacentHTML('afterend', `<div class="the"><b>➕ Việc làm thêm hôm nay (${ps.length})</b>${ps.map((r) => `<div class="mo">• ${esc(r['Mô tả'] || r['Loại việc'] || '')}${r['Số người'] ? ' · ' + esc(r['Số người']) + ' người' : ''}${r['Số giờ'] ? ' · ' + esc(r['Số giờ']) + ' giờ' : ''}${G.anhCua([r]).length ? ' · 📷 ' + G.anhCua([r]).length : ''} · ${esc(r['Trạng thái'] || '')}</div>`).join('')}<div class="mo" style="font-size:12px">Không tính vào % việc chính.</div></div>`);
  };
  /* Tổng quan: hàng lối vào nhanh (Ảnh hôm nay, Link việc) đặt trước khối Phát triển bền vững */
  G.oNhanh = (m) => { let o = m.querySelector('.vao-nhanh'); if (o) return o; o = G.h('<div class="vao-nhanh"></div>');
    const o1 = [...m.querySelectorAll('small, span, div')].find((x) => x.children.length === 0 && /^(Quân số hôm nay|Headcount today)/.test(x.textContent.trim()));
    const luoi = o1 ? o1.closest('.so-the, a, .the') : null; const g = luoi ? luoi.parentElement : null;
    if (g && g !== m) g.insertAdjacentElement('afterend', o); else m.insertBefore(o, m.firstChild); return o; };
  const tqFn = G.man[''] && G.man[''].fn;
  if (tqFn) G.man[''].fn = async (...a) => {
    await tqFn(...a); if (!G.laAnhVu()) return; const m = document.getElementById('noiDung'); if (!m) return;
    const tt = await G.trangThaiHomNay().catch(() => ({})); const n = Object.values(tt).reduce((x, y) => x + G.anhCua(y.ds).length, 0);
    m.querySelectorAll('.vao-anh').forEach((x) => x.remove());
    G.oNhanh(m).insertAdjacentHTML('afterbegin', `<a class="the vao-anh" href="#/anhngay"><b>📷 Ảnh hôm nay</b><span class="mo">${n} ảnh · xem nhanh theo việc, theo người</span></a>`);
  };
})();
