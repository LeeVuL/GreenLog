/* GreenLog 0.4.7 · mục 110–135
   110 nút 💡 Góp ý app · 118–122 Kho: nhập kho có nguồn/giá, cấp phát có ảnh, chi tiết dụng cụ, đổi/đền/tự mua bổ sung, mượn máy
   123 gửi Zalo bằng ảnh tóm tắt · 125 việc khác báo xong phải có ảnh · 128 việc nhiều ngày hiện tiến độ
   131–132 phân, thuốc nhập một chỗ (định kỳ, Hôm nay, phiếu) → nhật ký phun bón chia đều từng vị trí · 133 báo cáo đủ việc
   134 xem dữ liệu: lọc, bấm xem gốc, xuất Excel · 135 ô tự điểm danh của anh Pháp đổi trạng thái */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hn = () => API.ngay(); const gio = () => API.bayGio().slice(11, 16);
  const num = (v) => +String(v == null ? '' : v).replace(/\./g, (m, i, s) => (/,/.test(s) ? '' : m)).replace(',', '.') || 0;
  const so = (n, k) => G.so(Math.round((+n || 0) * 100) / 100, k == null ? 1 : k);
  const tien = (n) => (G.lang && G.lang() === 'en' ? Math.round(+n || 0).toLocaleString('en-US') + ' VND' : Math.round(+n || 0).toLocaleString('vi-VN') + ' đ');
  const laAnh = () => G.laAnhVu && G.laAnhVu();
  const laNB = () => S.u && S.u.nhom === 'Nhân viên nội bộ';
  const laTT = () => S.u && S.u.nhom === 'Tổ trưởng';
  const ngan0 = (t) => String(t || '').split(' ').pop();
  const ngan = (t) => (((S.dm && S.dm.nguoi) || []).some((n) => n.ten === t && n.nhom === 'Trưởng bộ phận') ? 'Trưởng bộ phận' : ngan0(t));
  const imLang = async (fn) => { G._imLang = (G._imLang || 0) + 1; try { return await fn(); } finally { G._imLang--; } };
  const TT_DD = 'Trạng thái (Có mặt/Vắng/Về sớm)';
  const loaiPB = 'Loại (Phun thuốc/Phun phân bón lá/Bón gốc)';

  Object.assign(API.BANG, { GopY: ['phieu', 2], DungCuLichSu: ['noibo', 2], TienDoViec: ['homnay', 2], CongKyLichSu: ['homnay', 3], ChotNam: ['homnay', 3] });

  /* ======================================================================================
     110 · 💡 GÓP Ý APP: tự chụp màn hình đang xem + một dòng, Trưởng bộ phận xem ở một chỗ
     ====================================================================================== */
  G.chupMan = async (el) => {
    el = el || document.getElementById('noiDung') || document.body;
    try {
      const w = Math.min(Math.max(el.scrollWidth, 360), 1300); const h = Math.min(el.scrollHeight + 20, 2600);
      let css = ''; for (const s of document.styleSheets) { try { for (const r of s.cssRules) css += r.cssText + '\n'; } catch (e) { /* bảng ngoài */ } }
      css = css.replace(/@import[^;]+;/g, '').replace(/:root/g, '.goc-chup').replace(/(^|[\s,}])body(?=[\s,{.:])/g, '$1.goc-chup').replace(/(^|[\s,}])html(?=[\s,{.:])/g, '$1.goc-chup');
      const c = el.cloneNode(true);
      c.querySelectorAll('img').forEach((i) => { if (!/^data:/.test(i.getAttribute('src') || '')) { const d = document.createElement('div'); d.style.cssText = `width:${i.width || 60}px;height:${i.height || 60}px;background:#DDE5DE;border-radius:8px;display:inline-block`; i.replaceWith(d); } });
      c.querySelectorAll('script, iframe, video, canvas').forEach((x) => x.remove());
      c.querySelectorAll('input, textarea').forEach((x) => { x.setAttribute('value', x.value || ''); if (x.tagName === 'TEXTAREA') x.textContent = x.value || ''; });
      const xml = new XMLSerializer().serializeToString(c);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" class="goc-chup" style="width:${w}px;padding:10px;box-sizing:border-box;background:#F3F5F1;font-family:system-ui,sans-serif"><style>${css.replace(/</g, '\\3c ')}</style>${xml}</div></foreignObject></svg>`;
      const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode();
      const k = Math.min(1, 900 / w); const cv = document.createElement('canvas'); cv.width = Math.round(w * k); cv.height = Math.round(h * k);
      const x = cv.getContext('2d'); x.fillStyle = '#F3F5F1'; x.fillRect(0, 0, cv.width, cv.height); x.drawImage(img, 0, 0, cv.width, cv.height);
      return cv.toDataURL('image/jpeg', 0.72);
    } catch (e) { return null; }
  };
  G.moGopY = async () => {
    const tieu = (document.querySelector('header.dau h1') || {}).textContent || document.title;
    const anh = await G.chupMan();
    G.hop('💡 Góp ý app', `<p class="mo" style="margin-top:0">Màn: <b>${esc(tieu.trim())}</b>. Gõ hoặc bấm 🎤 nói một dòng: chỗ nào khó dùng, sai, hay muốn thêm gì.</p>
      ${anh ? `<label class="hang" style="gap:8px;margin-bottom:8px"><input type="checkbox" id="kemAnh" checked> <span>Kèm ảnh màn hình đang xem</span></label><img src="${anh}" alt="" style="width:100%;max-height:260px;object-fit:cover;object-position:top;border-radius:12px;border:1px solid var(--vien)">` : '<p class="mo">Máy này không tự chụp được màn hình, anh chị chụp rồi thêm ảnh bên dưới nếu cần.</p>'}
      <label class="o" style="margin-top:10px"><span>Góp ý</span><textarea id="gy" rows="3" placeholder="Ví dụ: nút Lưu bị che, chữ nhỏ quá…"></textarea></label><button type="button" class="nut nho" id="gyMic">🎤 Nói</button>
      <div class="o" style="margin-top:10px"><span class="nhan-o">Ảnh thêm (không bắt buộc)</span><div id="gyAnh"></div></div>
      <button class="nut chinh rong" id="gyGui" style="margin-top:10px">Gửi góp ý</button>`, (o, dong) => {
      if (G.mic) G.mic(o.querySelector('#gyMic'), o.querySelector('#gy'));
      const them = G.oAnh(o.querySelector('#gyAnh'), { toiDa: 3, batBuoc: false, tuyChon: true });
      o.querySelector('#gyGui').onclick = (e) => chay(async () => {
        const nd = o.querySelector('#gy').value.trim(); if (!nd) throw new Error('Ghi một dòng góp ý');
        const ds = [].concat(anh && o.querySelector('#kemAnh') && o.querySelector('#kemAnh').checked ? [anh] : []).concat(them.ds ? them.ds() : []);
        await API.goi('ghi', { bang: 'GopY', dong: { 'Mã': G.ma('GY'), 'Giờ': API.bayGio(), 'Người': '', 'Vai': S.u.nhom || '', 'Màn': location.hash || '#/', 'Tên màn': tieu.trim(), 'Nội dung': nd, 'Ảnh': ds, 'Thiết bị': `${innerWidth}×${innerHeight} · ${/Android/i.test(navigator.userAgent) ? 'Android' : /iPhone|iPad/i.test(navigator.userAgent) ? 'iPhone' : 'Máy tính'}`, 'Trạng thái': 'Mới', 'Ghi chú xử lý': '' } });
        dong(); bao('Đã gửi góp ý · cảm ơn anh chị');
      }, e.target);
    });
  };
  const TT_GY = ['Mới', 'Đã ghi nhận', 'Đã sửa', 'Không làm'];
  G.man.gopy = { ten: 'Góp ý app', bt: '💡', ic: 'phieu', nhom: 'Quản trị', ph: 'homnay', fn: async () => {
    const m = G.khung('💡 Góp ý app', laAnh() ? 'Góp ý của mọi người · gom sửa mỗi tuần' : 'Góp ý anh chị đã gửi', '#/them');
    const loc = G.man.gopy.loc || 'Mới';
    const tat = (await G.doc('GopY', undefined, 3000).catch(() => [])).reverse(); const ds = laAnh() ? tat : tat.filter((x) => x['Người'] === S.u.ten);
    const hien = laAnh() ? ds.filter((x) => (x['Trạng thái'] || 'Mới') === loc) : ds;
    m.innerHTML = `<button class="nut chinh rong" id="moi" style="margin-bottom:10px">＋ Gửi góp ý mới</button>
      ${laAnh() ? `<div class="chon" style="margin-bottom:10px">${TT_GY.map((t) => `<button data-loc="${t}" class="${t === loc ? 'dang' : ''}">${t} (${ds.filter((x) => (x['Trạng thái'] || 'Mới') === t).length})</button>`).join('')}</div>
        <div class="nhom-nut" style="margin-bottom:10px"><button class="nut nho" id="chep">📋 Chép các góp ý đang xem</button><button class="nut nho" id="tai">⬇ Tải Excel</button></div>` : ''}
      ${hien.map((x) => `<div class="the"><div class="hang"><b class="gian">${esc(x['Nội dung'])}</b><span class="chip ${x['Trạng thái'] === 'Đã sửa' ? 'xanh' : x['Trạng thái'] === 'Không làm' ? '' : 'cam'}">${esc(x['Trạng thái'] || 'Mới')}</span></div>
        <div class="mo">${esc(G.ngayVN(String(x['Giờ']).slice(0, 10)))} ${esc(String(x['Giờ']).slice(11, 16))} · ${esc(ngan(x['Người']))} · ${esc(x['Tên màn'] || x['Màn'])} · ${esc(x['Thiết bị'] || '')}</div>
        ${x['Ghi chú xử lý'] ? `<div class="mo">↳ ${esc(x['Ghi chú xử lý'])}</div>` : ''}${G.xemAnh(x['Ảnh'])}
        ${laAnh() ? `<div class="chon" style="margin-top:8px">${TT_GY.filter((t) => t !== (x['Trạng thái'] || 'Mới')).map((t) => `<button data-ma="${esc(x['Mã'])}" data-tt="${t}">${t}</button>`).join('')}</div>` : ''}</div>`).join('') || G.trong('Chưa có góp ý ở mục này.')}`;
    m.querySelector('#moi').onclick = () => G.moGopY();
    m.querySelectorAll('[data-loc]').forEach((b) => { b.onclick = () => { G.man.gopy.loc = b.dataset.loc; G.taiLai(); }; });
    m.querySelectorAll('[data-tt]').forEach((b) => { b.onclick = async () => { const gc = b.dataset.tt === 'Mới' ? '' : await G.hoi('Ghi chú xử lý (để trống cũng được)', ''); if (gc == null) return;
      chay(async () => { await API.goi('sua', { bang: 'GopY', khoa: { 'Mã': b.dataset.ma }, doi: { 'Trạng thái': b.dataset.tt, 'Ghi chú xử lý': gc } }); bao('Đã chuyển ' + b.dataset.tt); G.taiLai(); }, b); }; });
    const c = m.querySelector('#chep'); if (c) c.onclick = () => { const t = hien.map((x, i) => `${i + 1}. [${x['Tên màn'] || x['Màn']}] ${x['Nội dung']} — ${ngan(x['Người'])}, ${String(x['Giờ']).slice(0, 16)}`).join('\n'); navigator.clipboard.writeText(t).then(() => bao('Đã chép ' + hien.length + ' góp ý')).catch(() => G.hop('Chép góp ý', `<textarea style="min-height:200px">${esc(t)}</textarea>`)); };
    const t = m.querySelector('#tai'); if (t) t.onclick = () => G.taiCSV('GopY_' + hn(), [['Giờ', 'Người', 'Vai', 'Màn', 'Nội dung', 'Trạng thái', 'Ghi chú xử lý', 'Thiết bị']].concat(ds.map((x) => [x['Giờ'], x['Người'], x['Vai'], x['Tên màn'] || x['Màn'], x['Nội dung'], x['Trạng thái'], x['Ghi chú xử lý'], x['Thiết bị']])));
  } };

  /* ======================================================================================
     135 · Ô TỰ ĐIỂM DANH CỦA ANH PHÁP: Chưa → Đã điểm danh · chờ duyệt (Huỷ) → Đã duyệt; chiều mở từ 13:00
     ====================================================================================== */
  async function veTuDiem(w) {
    w.dataset.v47 = '1';
    const [dd, du] = await Promise.all([G.doc('DiemDanh', { 'Ngày': hn() }).catch(() => []), G.doc('DuyetCong', { 'Ngày': hn() }).catch(() => [])]);
    const cn = (S.dm.congnhan || []).find((x) => x.ten === S.u.ten) || {};
    const o = (buoi) => {
      const r = dd.find((x) => x['Buổi'] === buoi && (x['Mã CN'] === cn.ma || x['Họ tên'] === S.u.ten) && /Có mặt/.test(x[TT_DD] || ''));
      const d = du.find((x) => x['Buổi'] === buoi && x['Đội'] === 'Quản lý nhà thầu');
      if (r && d && d['Khóa'] === 'Có') return `<div class="o-dd duyet"><b>✓ Đã duyệt</b><small>${buoi} · điểm danh ${esc(String(d['Giờ gửi'] || '').slice(11, 16))}</small></div>`;
      if (r) return `<div class="o-dd cho"><b>✓ Đã điểm danh ${esc(String((d && d['Giờ gửi']) || r['Giờ ghi'] || '').slice(11, 16))}</b><small>${buoi} · chờ Trưởng bộ phận duyệt</small><button type="button" class="nut nho" data-huy="${buoi}">Huỷ</button></div>`;
      if (buoi === 'Chiều' && gio() < '13:00') return `<div class="o-dd tat"><b>Có mặt chiều</b><small>Mở lúc 13:00</small></div>`;
      return `<button type="button" class="nut chinh o-dd" data-dd47="${buoi}">Có mặt ${buoi.toLowerCase()}</button>`;
    };
    w.innerHTML = o('Sáng') + o('Chiều'); w.classList.add('luoi-dd');
    w.querySelectorAll('[data-dd47]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('diemDanh.tuDiem', { buoi: b.dataset.dd47 }); bao('Đã điểm danh buổi ' + b.dataset.dd47.toLowerCase() + ' · chờ duyệt'); await veTuDiem(w); }, b); });
    w.querySelectorAll('[data-huy]').forEach((b) => { b.onclick = async () => { if (!(await G.xacNhan('Huỷ điểm danh buổi ' + b.dataset.huy.toLowerCase() + ' để bấm lại?', 'Huỷ điểm danh'))) return;
      chay(async () => { await API.goi('diemDanh.huyTuDiem', { buoi: b.dataset.huy }); bao('Đã huỷ, bấm lại khi có mặt'); await veTuDiem(w); }, b); }; });
  }
  const quet = () => { if (!S.u || S.u.nhom !== 'Quản lý nhà thầu') return;
    document.querySelectorAll('#noiDung [data-buoi]').forEach((b) => { const w = b.closest('.nhom-nut'); if (w && !w.dataset.v47) veTuDiem(w).catch((e) => console.warn(e)); }); };
  new MutationObserver(() => { clearTimeout(quet.t); quet.t = setTimeout(quet, 60); }).observe(document.documentElement, { childList: true, subtree: true });

  /* ======================================================================================
     118–122 · KHO: DỤNG CỤ nhập kho (nguồn, giá, hạn dùng, ảnh) → cấp phát (ảnh lúc giao, người nhận xác nhận)
     → chi tiết, lịch sử kiểm tra, hỏng/hết hạn phải mang đồ cũ về đổi, mất thì đền hoặc tự mua bổ sung
     ====================================================================================== */
  const K = () => G._kho || {};
  const nb2 = () => ((S.dm && S.dm.nguoi) || []).filter((n) => n.nhom === 'Nhân viên nội bộ').map((n) => n.ten);
  const HAN = [['3 tháng', 3], ['6 tháng', 6], ['12 tháng', 12], ['24 tháng', 24], ['Không hạn', 0]];
  const hetHan = (x) => { const t = num(x['Hạn dùng (tháng)']); if (!t) return null; const goc = x['Ngày giao'] || x['Ngày nhập']; if (!goc) return null; const d = new Date(goc); d.setMonth(d.getMonth() + t); return API.ngay(d); };
  const conNgay = (x) => { const h = hetHan(x); return h ? Math.round((new Date(h) - new Date(hn())) / 864e5) : null; };
  const lsDC = (dong) => API.goi('ghi', { bang: 'DungCuLichSu', dong: Object.assign({ 'Mã': G.ma('LS'), 'Ngày': '', 'Giờ': API.bayGio(), 'Người': '', 'Ảnh': '', 'Ghi chú': '', 'Giá trị': '' }, dong) });
  const taiDC = async () => { const d = await G.docNhieu([{ bang: 'DungCu', gioiHan: 3000 }, { bang: 'DungCuMuon', gioiHan: 3000 }, { bang: 'DungCuLichSu', gioiHan: 8000 }, { bang: 'KiemTraDC', gioiHan: 3000 }]);
    Object.keys(d).forEach((k) => { d[k] = d[k] || []; }); return d; };
  const trongKho = (dc) => dc.filter((x) => x['Trạng thái'] === 'Trong kho' && !x['Người giữ'] && x['Loại'] !== 'Chung');
  const maMoi = (dc, n) => { const so_ = dc.map((x) => +String(x['Mã DC']).replace(/\D/g, '') || 0); const max = so_.length ? Math.max(...so_) : 0; return Array.from({ length: n }, (_, i) => 'DC-' + String(max + i + 1).padStart(2, '0')); };
  const chipTT = (x) => { const c = conNgay(x); const t = x['Trạng thái'] || 'Tốt';
    if (/^Báo/.test(t)) return `<span class="chip do">${esc(t)}</span>`; if (t === 'Trong kho') return '<span class="chip">Trong kho</span>';
    if (c != null && c < 0) return '<span class="chip do">Hết hạn dùng</span>'; if (c != null && c <= 30) return `<span class="chip cam">Còn ${c} ngày</span>`;
    return t !== 'Tốt' ? `<span class="chip cam">${esc(t)}</span>` : ''; };

  async function manDungCu2(o) {
    const thang = hn().slice(0, 7);
    if (laNB()) await G.ktDungCu(S.u.ten).catch(() => null); else if (laAnh()) { for (const t of nb2()) await G.ktDungCu(t).catch(() => null); }
    const d = await taiDC(); const dc = d.DungCu.filter((x) => !/Thanh lý|^Mất$/.test(x['Trạng thái'] || '')); const mu = d.DungCuMuon.filter((x) => !x['Giờ trả']);
    const kt = d.KiemTraDC.filter((x) => x['Tháng'] === thang); const kho = trongKho(dc); const chung = dc.filter((x) => x['Loại'] === 'Chung');
    const dangMuon = (ma) => mu.find((x) => x['Mã DC'] === ma);
    const nguoi = laNB() ? [S.u.ten].concat(nb2().filter((t) => t !== S.u.ten)) : nb2();
    const cuaToi = laNB() ? kt.find((x) => x['Người'] === S.u.ten && x['Ngày giao'] === hn() && x['Trạng thái'] !== 'Đã nộp') : null;
    const choNhan = laNB() ? dc.filter((x) => x['Người giữ'] === S.u.ten && x['Ảnh giao'] && x['Đã nhận'] !== 'Có') : [];
    const bao_ = dc.filter((x) => /^Báo/.test(x['Trạng thái'] || '')); const het = dc.filter((x) => x['Người giữ'] && (conNgay(x) != null && conNgay(x) < 0));
    const kt4 = (t) => { const r = kt.filter((x) => x['Người'] === t); return [1, 2, 3, 4].map((i) => { const x = r.find((y) => +y['Lần'] === i);
      return x ? `<button type="button" class="o-kt ${x['Trạng thái'] === 'Đã nộp' ? (x['Kết quả'] === 'Đủ' ? 'xanh' : 'cam') : 'cho'}" data-kt="${esc(x['Mã KT'])}">${x['Trạng thái'] === 'Đã nộp' ? (x['Kết quả'] === 'Đủ' ? '✓' : '⚠') : '…'}<small>${esc(G.ngayVN(x['Ngày giao']).slice(0, 5))}</small></button>` : `<span class="o-kt trong">${i}</span>`; }).join(''); };
    const hang = (x) => { const mm = dangMuon(x['Mã DC']);
      return `<div class="muc dc-muc" data-ct="${esc(x['Mã DC'])}" style="gap:8px;cursor:pointer"><div class="gian"><b>${esc(x['Mã DC'])} · ${esc(x['Tên'])}</b>
        <div class="mo">${chipTT(x)} ${mm ? '🔴 ' + esc(ngan(mm['Người'])) + ' đang mượn từ ' + esc(String(mm['Giờ mượn']).slice(11, 16)) : x['Loại'] === 'Chung' ? '🟢 Ở kho' : x['Ngày giao'] ? 'Nhận ' + esc(G.ngayVN(x['Ngày giao']).slice(0, 5)) + (x['Đã nhận'] === 'Có' || !x['Ảnh giao'] ? '' : ' · chưa xác nhận') : ''}${x['Đơn giá'] && laAnh() ? ' · ' + tien(x['Đơn giá']) : ''}</div></div>
        ${x['Loại'] === 'Chung' && laNB() ? (mm ? (mm['Người'] === S.u.ten ? `<button class="nut nho chinh" data-tra="${esc(mm['Mã'])}">Trả</button>` : '') : `<button class="nut nho" data-muon="${esc(x['Mã DC'])}">Mượn</button>`) : ''}<span class="mo">›</span></div>`; };
    const nhom = (ds) => { const g = {}; ds.forEach((x) => { (g[x['Tên']] = g[x['Tên']] || []).push(x); }); return g; };
    o.innerHTML = `${cuaToi ? `<div class="the the-mo"><b>🧰 Hôm nay kiểm tra dụng cụ (lần ${esc(cuaToi['Lần'])}/4)</b><p class="mo" style="margin:4px 0 8px">Bày hết dụng cụ đang giữ ra, chụp 1 ảnh, bấm Đủ hoặc chọn món thiếu, hỏng.</p><button class="nut chinh rong" id="ktNop" style="min-height:56px">Kiểm tra ngay</button></div>` : ''}
      ${choNhan.length ? `<div class="the the-mo"><b>🤝 Trưởng bộ phận vừa giao ${choNhan.length} món</b><div class="mo">${choNhan.map((x) => esc(x['Mã DC'] + ' · ' + x['Tên'])).join(', ')}</div>${G.xemAnh(choNhan[0]['Ảnh giao'])}<button class="nut chinh rong" id="daNhan" style="margin-top:8px">✓ Tôi đã nhận đủ</button></div>` : ''}
      ${laAnh() && bao_.length ? `<div class="the the-do"><b>Cần xử lý (${bao_.length})</b>${bao_.map((x) => `<div class="hang" style="margin-top:6px;gap:8px"><span class="gian">${esc(x['Mã DC'])} · ${esc(x['Tên'])} · <b>${esc(x['Trạng thái'])}</b> · ${esc(ngan(x['Người giữ']))}</span><button class="nut nho chinh" data-xl="${esc(x['Mã DC'])}">Xử lý</button></div>`).join('')}</div>` : ''}
      ${laAnh() && het.length ? `<div class="the the-mo"><b>⏳ Hết hạn dùng, nên đổi (${het.length})</b><div class="mo">${het.map((x) => esc(`${x['Mã DC']} ${x['Tên']} · ${ngan(x['Người giữ'])}`)).join(', ')}</div></div>` : ''}
      ${laAnh() ? `<div class="nhom-nut" style="margin-bottom:10px"><button class="nut chinh" id="nhapDC">＋ Nhập kho dụng cụ</button><button class="nut chinh" id="capDC" ${kho.length ? '' : 'disabled'}>🤝 Cấp phát${kho.length ? ' (' + kho.length + ' món trong kho)' : ''}</button></div>` : ''}
      <div class="the"><b>Kiểm tra ngẫu nhiên tháng ${esc(thang.slice(5))}/${esc(thang.slice(0, 4))}</b><div class="mo" style="margin-bottom:6px">Đủ 4 lần mỗi tháng · ngày do app chọn ngẫu nhiên, đúng ngày đi làm · chạm ô để xem ảnh</div>
        ${nb2().map((t) => `<div class="hang" style="gap:8px;margin:6px 0"><b style="min-width:58px">${esc(ngan(t))}</b>${kt4(t)}</div>`).join('')}</div>
      ${nguoi.map((t) => { const r = dc.filter((x) => x['Loại'] !== 'Chung' && x['Người giữ'] === t); return `<h3 class="tieu-nhom">${esc(ngan(t))} đang giữ (${r.length})</h3><div class="ds">${r.map(hang).join('') || G.trong('Chưa cấp dụng cụ')}</div>`; }).join('')}
      <h3 class="tieu-nhom">Đồ dùng chung · mượn, trả (${chung.length})</h3><div class="ds">${chung.map(hang).join('') || G.trong('Chưa có')}</div>
      ${laAnh() ? `<h3 class="tieu-nhom">Trong kho, chưa cấp (${kho.length})</h3><div class="ds">${Object.entries(nhom(kho)).map(([ten, r]) => `<div class="muc" data-ct="${esc(r[0]['Mã DC'])}" style="cursor:pointer"><div class="gian"><b>${esc(ten)} × ${r.length}</b><div class="mo">${esc(r.map((x) => x['Mã DC']).join(', '))}${r[0]['Đơn giá'] ? ' · ' + tien(r[0]['Đơn giá']) + '/cái' : ''}${r[0]['Nguồn'] ? ' · ' + esc(r[0]['Nguồn']) : ''}</div></div>›</div>`).join('') || G.trong('Kho trống')}</div>` : ''}`;
    const b = (id) => o.querySelector('#' + id);
    if (b('ktNop')) b('ktNop').onclick = () => K().formKiemTra(cuaToi, dc.filter((x) => x['Người giữ'] === S.u.ten && x['Loại'] !== 'Chung'));
    if (b('daNhan')) b('daNhan').onclick = (e) => chay(async () => { for (const x of choNhan) { await API.goi('sua', { bang: 'DungCu', khoa: { 'Mã DC': x['Mã DC'] }, doi: { 'Đã nhận': 'Có', 'Giờ nhận': API.bayGio() } }); await lsDC({ 'Mã DC': x['Mã DC'], 'Tên': x['Tên'], 'Loại': 'Nhận', 'Ghi chú': 'Xác nhận đã nhận' }); } bao('Đã xác nhận nhận ' + choNhan.length + ' món'); G.taiLai(); }, e.target);
    if (b('nhapDC')) b('nhapDC').onclick = () => formNhapDC(d.DungCu);
    if (b('capDC')) b('capDC').onclick = () => formCapPhat(kho);
    o.querySelectorAll('[data-xl]').forEach((x) => { x.onclick = () => formXuLy(dc.find((y) => y['Mã DC'] === x.dataset.xl), kho); });
    o.querySelectorAll('[data-ct]').forEach((x) => { x.onclick = (e) => { if (e.target.closest('button')) return; chiTietDC(dc.find((y) => y['Mã DC'] === x.dataset.ct), d, kho); }; });
    o.querySelectorAll('[data-muon]').forEach((x) => { x.onclick = (e) => { e.stopPropagation(); chay(async () => { const c = dc.find((y) => y['Mã DC'] === x.dataset.muon); await API.goi('ghi', { bang: 'DungCuMuon', dong: { 'Mã': G.ma('MU'), 'Mã DC': c['Mã DC'], 'Tên': c['Tên'], 'Người': S.u.ten, 'Giờ mượn': API.bayGio(), 'Giờ trả': '', 'Ngày': '' } }); await lsDC({ 'Mã DC': c['Mã DC'], 'Tên': c['Tên'], 'Loại': 'Mượn' }); bao('Đã mượn ' + c['Tên']); G.taiLai(); }, x); }; });
    o.querySelectorAll('[data-tra]').forEach((x) => { x.onclick = (e) => { e.stopPropagation(); chay(async () => { const r = mu.find((y) => y['Mã'] === x.dataset.tra); await API.goi('sua', { bang: 'DungCuMuon', khoa: { 'Mã': x.dataset.tra }, doi: { 'Giờ trả': API.bayGio() } }); if (r) await lsDC({ 'Mã DC': r['Mã DC'], 'Tên': r['Tên'], 'Loại': 'Trả' }); bao('Đã trả'); G.taiLai(); }, x); }; });
    o.querySelectorAll('[data-kt]').forEach((x) => { x.onclick = () => { const r = kt.find((y) => y['Mã KT'] === x.dataset.kt);
      G.hop(`Kiểm tra dụng cụ · ${ngan(r['Người'])} · lần ${r['Lần']}`, `<p>${r['Trạng thái'] === 'Đã nộp' ? `<b>${esc(r['Kết quả'])}</b> · gửi lúc ${esc(String(r['Giờ nộp']).slice(11, 16))} ${G.ngayVN(r['Ngày giao'])}` : 'Giao ngày ' + G.ngayVN(r['Ngày giao']) + ', chưa gửi'}</p>${r['Ghi chú'] ? `<p class="mo">${esc(r['Ghi chú'])}</p>` : ''}${G.xemAnh(r['Ảnh'])}`); }; });
  }
  function formNhapDC(tat) {
    const ten = [...new Set(tat.map((x) => x['Tên']))];
    G.hop('＋ Nhập kho dụng cụ', `<p class="mo" style="margin-top:0">Dụng cụ phải nhập kho trước rồi mới cấp phát được. Mỗi cái một mã.</p><div id="f"></div><button class="nut chinh rong" id="l">Lưu nhập kho</button>`, (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ten', nhan: 'Tên dụng cụ', loai: 'chu', bb: true }, { k: 'sl', nhan: 'Số lượng', loai: 'so', bb: true, gt: 1 },
        { k: 'nguon', nhan: 'Nguồn hàng', loai: 'chips', ds: ['Công ty mua', 'Trưởng bộ phận tự mua'], bb: true, gt: 'Công ty mua' }, { k: 'gia', nhan: 'Đơn giá mỗi cái (VNĐ)', loai: 'so', bb: true },
        { k: 'ngay', nhan: 'Ngày mua', loai: 'ngay', gt: hn(), bb: true }, { k: 'han', nhan: 'Hạn sử dụng', loai: 'chips', ds: HAN.map((x) => x[0]), bb: true, gt: '12 tháng' },
        { k: 'loai', nhan: 'Cách dùng', loai: 'chips', ds: ['Cấp riêng cho người', 'Đồ dùng chung (mượn, trả)'], bb: true, gt: 'Cấp riêng cho người' },
        { k: 'anh', nhan: 'Ảnh dụng cụ', loai: 'anh', bb: true, toiDa: 2 }, { k: 'hd', nhan: 'Ảnh hóa đơn (nếu có)', loai: 'anh', toiDa: 2, tuyChon: true }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
      const ip = o.querySelector('#f [data-f="0"]'); if (ip && !ip.getAttribute('list')) { const dl = G.h(`<datalist id="dsTenDC">${ten.map((t) => `<option value="${esc(t)}">`).join('')}</datalist>`); o.appendChild(dl); ip.setAttribute('list', 'dsTenDC'); }
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const n = Math.max(1, Math.min(50, Math.round(num(v.sl) || 1))); const gia = num(v.gia); if (!(gia > 0)) throw new Error('Nhập đơn giá');
        const chung = /chung/.test(v.loai); const ma = maMoi(tat, n); const han = (HAN.find((x) => x[0] === v.han) || [, 12])[1];
        for (const m of ma) { await API.goi('ghi', { bang: 'DungCu', dong: { 'Mã DC': m, 'Tên': v.ten.trim(), 'Loại': chung ? 'Chung' : 'Riêng', 'Người giữ': '', 'Ngày giao': '', 'Trạng thái': chung ? 'Tốt' : 'Trong kho', 'Ghi chú': v.gc || '', 'Ảnh': v.anh,
          'Nguồn': v.nguon, 'Đơn giá': gia, 'Ngày nhập': v.ngay, 'Hạn dùng (tháng)': han, 'Ảnh nhập': v.anh, 'Hóa đơn': v.hd || [], 'Ảnh giao': '', 'Đã nhận': '' } });
          await lsDC({ 'Mã DC': m, 'Tên': v.ten.trim(), 'Loại': 'Nhập kho', 'Ảnh': v.anh, 'Giá trị': gia, 'Ghi chú': v.nguon + (v.gc ? ' · ' + v.gc : '') }); }
        dong(); bao(`Đã nhập kho ${n} ${v.ten} · ${tien(n * gia)}`); G.taiLai(); }, e.target);
    });
  }
  function formCapPhat(kho, nhan, sau) {
    const g = {}; kho.forEach((x) => { (g[x['Tên']] = g[x['Tên']] || []).push(x); }); const chon = {};
    G.hop('🤝 Cấp phát dụng cụ', `<p class="mo" style="margin-top:0">Chỉ chọn được món đã nhập kho. Bấm ＋ ở món cần giao.</p><div class="ds">${Object.entries(g).map(([ten, r]) => `<div class="muc" style="gap:8px">${API.dsAnh(r[0]['Ảnh nhập'] || r[0]['Ảnh'])[0] ? `<img class="dc-nho" src="${esc(API.anhUrl(API.dsAnh(r[0]['Ảnh nhập'] || r[0]['Ảnh'])[0]))}" alt="" data-xemdc="${esc(ten)}">` : ''}<div class="gian" data-xemdc="${esc(ten)}" style="cursor:pointer"><b>${esc(ten)} <span class="mo">ⓘ</span></b><div class="mo">trong kho ${r.length}${r[0]['Đơn giá'] && laAnh() ? ' · ' + tien(r[0]['Đơn giá']) : ''}${r[0]['Nguồn'] ? ' · ' + esc(r[0]['Nguồn']) : ''} · bấm để xem chi tiết</div></div><button type="button" class="nut nho" data-tru="${esc(ten)}">−</button><b data-sl="${esc(ten)}" style="min-width:30px;text-align:center">0</b><button type="button" class="nut nho" data-cong="${esc(ten)}">＋</button></div>`).join('')}</div><div id="f"></div><button class="nut chinh rong" id="l">Giao</button>`, (o, dong) => {
      const ve = (t) => { o.querySelector(`[data-sl="${CSS.escape(t)}"]`).textContent = chon[t] || 0; };
      o.querySelectorAll('[data-xemdc]').forEach((x) => { x.onclick = () => chay(async () => { const r = g[x.dataset.xemdc]; const d = await taiDC(); chiTietDC(d.DungCu.find((y) => y['Mã DC'] === r[0]['Mã DC']) || r[0], d, kho); }); });
      o.querySelectorAll('[data-cong]').forEach((b) => { b.onclick = () => { const t = b.dataset.cong; chon[t] = Math.min(g[t].length, (chon[t] || 0) + 1); ve(t); }; });
      o.querySelectorAll('[data-tru]').forEach((b) => { b.onclick = () => { const t = b.dataset.tru; chon[t] = Math.max(0, (chon[t] || 0) - 1); ve(t); }; });
      const lay = G.form(o.querySelector('#f'), [{ k: 'ai', nhan: 'Giao cho', loai: 'chips', ds: nb2(), bb: true, gt: nhan || '' }, { k: 'anh', nhan: 'Ảnh lúc giao (người nhận cầm đồ)', loai: 'anh', bb: true, toiDa: 3 }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const ds = Object.keys(chon).flatMap((t) => g[t].slice(0, chon[t] || 0)); if (!ds.length) throw new Error('Bấm ＋ ở món cần giao');
        for (const x of ds) { await API.goi('sua', { bang: 'DungCu', khoa: { 'Mã DC': x['Mã DC'] }, doi: { 'Người giữ': v.ai, 'Loại': 'Riêng', 'Ngày giao': hn(), 'Trạng thái': 'Tốt', 'Ảnh giao': (v.anh || []).join(' | '), 'Đã nhận': '', 'Giờ nhận': '' } });
          await lsDC({ 'Mã DC': x['Mã DC'], 'Tên': x['Tên'], 'Loại': 'Cấp phát', 'Ảnh': v.anh, 'Ghi chú': 'Giao ' + v.ai + (v.gc ? ' · ' + v.gc : '') }); }
        dong(); bao(`Đã giao ${ds.length} món cho ${ngan(v.ai)} · chờ ${ngan(v.ai)} xác nhận`); if (sau) sau(); else G.taiLai(); }, e.target);
    });
  }
  function chiTietDC(x, d, kho) {
    if (!x) return; const ls = d.DungCuLichSu.filter((r) => r['Mã DC'] === x['Mã DC']).sort((a, b) => (a['Giờ'] < b['Giờ'] ? 1 : -1));
    const kt = x['Người giữ'] ? d.KiemTraDC.filter((r) => r['Người'] === x['Người giữ'] && r['Trạng thái'] === 'Đã nộp' && (!x['Ngày giao'] || r['Ngày giao'] >= x['Ngày giao'])).sort((a, b) => (a['Ngày giao'] < b['Ngày giao'] ? 1 : -1)) : [];
    const h = hetHan(x); const c = conNgay(x); const giu = x['Người giữ'] === S.u.ten;
    G.hop(`${x['Mã DC']} · ${x['Tên']}`, `<div class="luoi2"><div class="the"><small class="mo">Đang ở</small><div><b>${x['Loại'] === 'Chung' ? 'Đồ dùng chung' : x['Người giữ'] ? esc(x['Người giữ']) : 'Trong kho'}</b></div><small class="mo">${x['Ngày giao'] ? 'nhận ' + G.ngayVN(x['Ngày giao']) + (x['Đã nhận'] === 'Có' ? ' · đã xác nhận' : x['Ảnh giao'] ? ' · chưa xác nhận' : '') : ''}</small></div>
      <div class="the"><small class="mo">Hạn dùng</small><div><b>${h ? G.ngayVN(h) : 'Không hạn'}</b></div><small class="mo">${c != null ? (c < 0 ? 'đã quá ' + -c + ' ngày' : 'còn ' + c + ' ngày') : ''}</small></div></div>
      <p class="mo">${chipTT(x)} ${x['Nguồn'] ? esc(x['Nguồn']) + ' · ' : ''}${x['Đơn giá'] ? tien(x['Đơn giá']) + ' · ' : ''}${x['Ngày nhập'] ? 'nhập ' + G.ngayVN(x['Ngày nhập']) : ''}${x['Ghi chú'] ? ' · ' + esc(x['Ghi chú']) : ''}</p>
      ${x['Ảnh nhập'] || x['Ảnh'] ? `<b>Ảnh lúc nhập</b>${G.xemAnh(x['Ảnh nhập'] || x['Ảnh'])}` : ''}${x['Ảnh giao'] ? `<b>Ảnh lúc giao</b>${G.xemAnh(x['Ảnh giao'])}` : ''}${x['Hóa đơn'] ? `<b>Hóa đơn</b>${G.xemAnh(x['Hóa đơn'])}` : ''}
      <div class="nhom-nut" style="margin:10px 0">${giu && !/^Báo/.test(x['Trạng thái'] || '') ? '<button class="nut" id="bao">⚠ Báo hỏng, hết hạn, mất</button>' : ''}${laAnh() && /^Báo/.test(x['Trạng thái'] || '') ? '<button class="nut chinh" id="xl">Xử lý</button>' : ''}${laAnh() && x['Người giữ'] && !/^Báo/.test(x['Trạng thái'] || '') ? '<button class="nut" id="doi">Đổi món mới</button><button class="nut" id="thu">Thu về kho</button>' : ''}</div>
      <h3 class="tieu-nhom">Lịch sử</h3><div class="ds">${ls.map((r) => `<div class="muc"><div class="gian"><b>${esc(r['Loại'])}</b>${r['Giá trị'] ? ' · ' + tien(r['Giá trị']) : ''}<div class="mo">${G.ngayVN(String(r['Giờ']).slice(0, 10))} ${esc(String(r['Giờ']).slice(11, 16))} · ${esc(ngan(r['Người']))}${r['Ghi chú'] ? ' · ' + esc(r['Ghi chú']) : ''}</div>${G.xemAnh(r['Ảnh'])}</div></div>`).join('') || G.trong('Chưa có')}</div>
      ${x['Người giữ'] ? `<h3 class="tieu-nhom">Các lần kiểm tra của ${esc(ngan(x['Người giữ']))} từ khi nhận</h3><div class="ds">${kt.map((r) => { const thieu = String(r['Kết quả'] || '').includes(x['Tên']); return `<div class="muc"><div class="gian"><b>Lần ${esc(r['Lần'])} · ${G.ngayVN(r['Ngày giao'])}</b> ${thieu ? '<span class="chip do">báo thiếu, hỏng</span>' : '<span class="chip xanh">có món này</span>'}<div class="mo">${esc(r['Kết quả'] || '')}</div>${G.xemAnh(r['Ảnh'])}</div></div>`; }).join('') || G.trong('Chưa có lần kiểm tra nào')}</div>` : ''}`, (o, dong) => {
      const b = (id) => o.querySelector('#' + id);
      if (b('bao')) b('bao').onclick = () => { dong(); formBaoDC(x); };
      if (b('xl')) b('xl').onclick = () => { dong(); formXuLy(x, kho); };
      if (b('doi')) b('doi').onclick = () => { dong(); formXuLy(Object.assign({}, x, { 'Trạng thái': 'Báo cần đổi' }), kho); };
      if (b('thu')) b('thu').onclick = () => chay(async () => { await API.goi('sua', { bang: 'DungCu', khoa: { 'Mã DC': x['Mã DC'] }, doi: { 'Người giữ': '', 'Trạng thái': 'Trong kho', 'Ngày giao': '', 'Ảnh giao': '', 'Đã nhận': '' } }); await lsDC({ 'Mã DC': x['Mã DC'], 'Tên': x['Tên'], 'Loại': 'Thu về kho', 'Ghi chú': 'Từ ' + x['Người giữ'] }); dong(); bao('Đã thu về kho'); G.taiLai(); }, b('thu'));
    });
  }
  function formBaoDC(x) {
    G.hop('⚠ Báo · ' + x['Tên'], '<div id="f"></div><button class="nut chinh rong" id="l">Gửi Trưởng bộ phận</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'loai', nhan: 'Tình trạng', loai: 'chips', ds: ['Hỏng', 'Hết hạn, mòn cần đổi', 'Mất, thất lạc'], bb: true }, { k: 'anh', nhan: 'Ảnh món đồ (bắt buộc khi hỏng, mòn)', loai: 'anh', toiDa: 2, tuyChon: true }, { k: 'ly', nhan: 'Lý do, mô tả', loai: 'mota', bb: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); if (!/Mất/.test(v.loai) && !(v.anh || []).length) throw new Error('Chụp ảnh món đồ');
        const tt = /Mất/.test(v.loai) ? 'Báo mất' : /Hết hạn/.test(v.loai) ? 'Báo cần đổi' : 'Báo hỏng';
        await API.goi('sua', { bang: 'DungCu', khoa: { 'Mã DC': x['Mã DC'] }, doi: { 'Trạng thái': tt, 'Ghi chú': v.ly } }); await lsDC({ 'Mã DC': x['Mã DC'], 'Tên': x['Tên'], 'Loại': tt, 'Ảnh': v.anh || [], 'Ghi chú': v.ly });
        dong(); bao('Đã báo Trưởng bộ phận'); G.taiLai(); }, e.target);
    });
  }
  /* Trưởng bộ phận xử lý: hỏng/hết hạn → thu đồ cũ về (ảnh đối chứng) rồi cấp món mới; mất → đền theo giá trị hoặc tự mua bổ sung */
  function formXuLy(x, kho) {
    if (!x) return; const mat = /mất/i.test(x['Trạng thái']); const cung = kho.filter((y) => y['Tên'] === x['Tên']);
    const ds = mat ? ['Đền theo giá trị', 'Tự mua bổ sung', 'Tìm thấy, dùng tiếp'] : ['Đổi món mới (thu đồ cũ về)', 'Sửa được, dùng tiếp', 'Thu đồ cũ về kho, chưa cấp lại'];
    G.hop(`Xử lý · ${x['Mã DC']} ${x['Tên']}`, `<p class="mo" style="margin-top:0">${esc(x['Trạng thái'])} · ${esc(x['Người giữ'] || '')}${x['Ghi chú'] ? ' · ' + esc(x['Ghi chú']) : ''}${x['Đơn giá'] ? ' · giá ' + tien(x['Đơn giá']) : ''}</p><div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>`, (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'cach', nhan: 'Cách xử lý', loai: 'chips', ds, bb: true },
        { k: 'anhCu', nhan: 'Ảnh đồ cũ đã thu về (đối chứng)', loai: 'anh', toiDa: 2, tuyChon: true, khi: (v) => /thu đồ cũ/i.test(v.cach || '') },
        { k: 'cu', nhan: 'Đồ cũ', loai: 'chips', ds: ['Thanh lý', 'Để sửa'], gt: 'Thanh lý', khi: (v) => /thu đồ cũ/i.test(v.cach || '') },
        { k: 'moi', nhan: `Cấp món mới cùng loại từ kho (còn ${cung.length})`, loai: 'chips', ds: cung.length ? ['Cấp ngay', 'Để sau'] : ['Kho hết, để sau'], gt: cung.length ? 'Cấp ngay' : 'Kho hết, để sau', khi: (v) => /Đổi món mới|Đền|Tự mua/.test(v.cach || '') && !/Tự mua/.test(v.cach || '') },
        { k: 'den', nhan: 'Số tiền đền (VNĐ)', loai: 'so', gt: x['Đơn giá'] || '', khi: (v) => v.cach === 'Đền theo giá trị' },
        { k: 'anhMua', nhan: 'Ảnh món tự mua bổ sung', loai: 'anh', toiDa: 2, tuyChon: true, khi: (v) => v.cach === 'Tự mua bổ sung' },
        { k: 'anhGiao', nhan: 'Ảnh lúc giao món mới', loai: 'anh', toiDa: 2, tuyChon: true, khi: (v) => v.moi === 'Cấp ngay' && /Đổi món mới|Đền/.test(v.cach || '') }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const ghi = (doi) => API.goi('sua', { bang: 'DungCu', khoa: { 'Mã DC': x['Mã DC'] }, doi });
        if (/thu đồ cũ/i.test(v.cach)) { if (!(v.anhCu || []).length) throw new Error('Chụp ảnh đồ cũ đã thu về để đối chứng');
          await ghi({ 'Trạng thái': v.cu === 'Để sửa' ? 'Đang sửa' : 'Thanh lý', 'Người giữ': '', 'Ghi chú': [x['Ghi chú'], v.gc].filter(Boolean).join(' · ') });
          await lsDC({ 'Mã DC': x['Mã DC'], 'Tên': x['Tên'], 'Loại': 'Thu đồ cũ · ' + (v.cu || 'Thanh lý'), 'Ảnh': v.anhCu, 'Ghi chú': 'Từ ' + x['Người giữ'] + (v.gc ? ' · ' + v.gc : '') }); }
        if (v.cach === 'Sửa được, dùng tiếp' || v.cach === 'Tìm thấy, dùng tiếp') { await ghi({ 'Trạng thái': 'Tốt' }); await lsDC({ 'Mã DC': x['Mã DC'], 'Tên': x['Tên'], 'Loại': v.cach, 'Ghi chú': v.gc || '' }); }
        if (v.cach === 'Đền theo giá trị') { const t = num(v.den); if (!(t > 0)) throw new Error('Nhập số tiền đền'); await ghi({ 'Trạng thái': 'Mất', 'Người giữ': '' }); await lsDC({ 'Mã DC': x['Mã DC'], 'Tên': x['Tên'], 'Loại': 'Mất · đền theo giá trị', 'Giá trị': t, 'Ghi chú': x['Người giữ'] + ' đền' + (v.gc ? ' · ' + v.gc : '') }); }
        if (v.cach === 'Tự mua bổ sung') { if (!(v.anhMua || []).length) throw new Error('Chụp ảnh món tự mua bổ sung');
          await ghi({ 'Trạng thái': 'Mất', 'Người giữ': '' }); await lsDC({ 'Mã DC': x['Mã DC'], 'Tên': x['Tên'], 'Loại': 'Mất · tự mua bổ sung', 'Ảnh': v.anhMua, 'Ghi chú': x['Người giữ'] + ' tự mua' });
          const tat = (await G.doc('DungCu')); const m = maMoi(tat, 1)[0];
          await API.goi('ghi', { bang: 'DungCu', dong: { 'Mã DC': m, 'Tên': x['Tên'], 'Loại': 'Riêng', 'Người giữ': x['Người giữ'], 'Ngày giao': hn(), 'Trạng thái': 'Tốt', 'Ghi chú': 'Tự mua bổ sung thay ' + x['Mã DC'], 'Ảnh': v.anhMua, 'Nguồn': 'Nhân viên tự mua bổ sung', 'Đơn giá': x['Đơn giá'] || '', 'Ngày nhập': hn(), 'Hạn dùng (tháng)': x['Hạn dùng (tháng)'] || '', 'Ảnh nhập': v.anhMua, 'Ảnh giao': v.anhMua, 'Đã nhận': 'Có' } });
          await lsDC({ 'Mã DC': m, 'Tên': x['Tên'], 'Loại': 'Tự mua bổ sung', 'Ảnh': v.anhMua, 'Ghi chú': 'Thay ' + x['Mã DC'] }); }
        if (v.moi === 'Cấp ngay' && /Đổi món mới|Đền/.test(v.cach) && cung.length) { if (!(v.anhGiao || []).length) throw new Error('Chụp ảnh lúc giao món mới'); const y = cung[0];
          await API.goi('sua', { bang: 'DungCu', khoa: { 'Mã DC': y['Mã DC'] }, doi: { 'Người giữ': x['Người giữ'], 'Loại': 'Riêng', 'Ngày giao': hn(), 'Trạng thái': 'Tốt', 'Ảnh giao': (v.anhGiao || []).join(' | '), 'Đã nhận': '' } });
          await lsDC({ 'Mã DC': y['Mã DC'], 'Tên': y['Tên'], 'Loại': 'Cấp phát', 'Ảnh': v.anhGiao, 'Ghi chú': 'Đổi cho ' + x['Mã DC'] + ' · giao ' + x['Người giữ'] }); }
        dong(); bao('Đã xử lý'); G.taiLai(); }, e.target);
    });
  }
  /* 💰 tiền tự bỏ ra / công ty mua: vật tư + dụng cụ theo tháng, chép đề nghị hoàn tiền */
  async function manChiPhi(o) {
    const [gd, dc] = await Promise.all([G.doc('KhoGiaoDich', { 'Loại': 'Nhập' }, 20000).catch(() => []), G.doc('DungCu', undefined, 3000).catch(() => [])]);
    const rows = gd.filter((x) => x['Nguồn']).map((x) => ({ ngay: x['Ngày'] || String(x['Giờ']).slice(0, 10), ten: x['Tên VT'], sl: num(x['Số lượng']), gia: num(x['Đơn giá']), tt: num(x['Thành tiền']) || num(x['Số lượng']) * num(x['Đơn giá']), nguon: x['Nguồn'], loai: 'Vật tư', anh: x['Ảnh'] }))
      .concat(dc.filter((x) => x['Nguồn'] && x['Nguồn'] !== 'Nhân viên tự mua bổ sung').map((x) => ({ ngay: x['Ngày nhập'], ten: x['Mã DC'] + ' ' + x['Tên'], sl: 1, gia: num(x['Đơn giá']), tt: num(x['Đơn giá']), nguon: x['Nguồn'], loai: 'Dụng cụ', anh: x['Ảnh nhập'] })))
      .sort((a, b) => (a.ngay < b.ngay ? 1 : -1));
    const thang = G.man.kho.thangCP || hn().slice(0, 7); const r = rows.filter((x) => String(x.ngay).startsWith(thang)); const tu = r.filter((x) => /tự mua/.test(x.nguon)); const ct = r.filter((x) => x.nguon === 'Công ty mua');
    const ths = [...new Set(rows.map((x) => String(x.ngay).slice(0, 7)).concat([hn().slice(0, 7)]))].sort().reverse();
    o.innerHTML = `<div class="chon" style="margin-bottom:10px">${ths.slice(0, 12).map((t) => `<button data-th="${t}" class="${t === thang ? 'dang' : ''}">${t.slice(5)}/${t.slice(0, 4)}</button>`).join('')}</div>
      <div class="luoi2"><div class="the"><small class="mo">Trưởng bộ phận tự mua</small><div class="so-lon">${tien(tu.reduce((a, x) => a + x.tt, 0))}</div><small class="mo">${tu.length} dòng · cần hoàn tiền</small></div><div class="the"><small class="mo">Công ty mua</small><div class="so-lon">${tien(ct.reduce((a, x) => a + x.tt, 0))}</div><small class="mo">${ct.length} dòng</small></div></div>
      <div class="nhom-nut" style="margin:10px 0"><button class="nut chinh" id="dn" ${tu.length ? '' : 'disabled'}>📋 Đề nghị hoàn tiền tháng ${thang.slice(5)}</button><button class="nut" id="tai">⬇ Tải Excel</button></div>
      <div class="the cuon-ngang"><table class="bang"><tr><th>Ngày</th><th>Món</th><th>Loại</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th><th>Nguồn</th></tr>${r.map((x) => `<tr><td>${G.ngayVN(x.ngay).slice(0, 5)}</td><td>${esc(x.ten)}</td><td>${x.loai}</td><td>${so(x.sl)}</td><td>${tien(x.gia)}</td><td><b>${tien(x.tt)}</b></td><td>${esc(x.nguon)}</td></tr>`).join('') || '<tr><td colspan="7" class="mo">Chưa có</td></tr>'}</table></div>`;
    o.querySelectorAll('[data-th]').forEach((b) => { b.onclick = () => { G.man.kho.thangCP = b.dataset.th; G.taiLai(); }; });
    o.querySelector('#tai').onclick = () => G.taiCSV('ChiPhiKho_' + thang, [['Ngày', 'Món', 'Loại', 'Số lượng', 'Đơn giá', 'Thành tiền', 'Nguồn']].concat(r.map((x) => [x.ngay, x.ten, x.loai, x.sl, x.gia, x.tt, x.nguon])));
    const dn = o.querySelector('#dn'); if (dn) dn.onclick = () => { const t = `ĐỀ NGHỊ HOÀN TIỀN MUA VẬT TƯ, DỤNG CỤ – THÁNG ${thang.slice(5)}/${thang.slice(0, 4)}\nBộ phận Cảnh quan · Mövenpick Resort Waverly Phu Quoc\n\n${tu.map((x, i) => `${i + 1}. ${G.ngayVN(x.ngay)} · ${x.ten} · ${so(x.sl)} × ${tien(x.gia)} = ${tien(x.tt)}`).join('\n')}\n\nTổng cộng: ${tien(tu.reduce((a, x) => a + x.tt, 0))}\nNgười đề nghị: Trưởng bộ phận Cảnh quan`;
      G.hop('Đề nghị hoàn tiền', `<textarea style="min-height:260px">${esc(t)}</textarea><button class="nut chinh rong" id="c">📋 Chép</button>`, (x) => { x.querySelector('#c').onclick = () => navigator.clipboard.writeText(t).then(() => bao('Đã chép')); }); };
  }
  /* màn Kho & tài sản 0.4.7: thêm thẻ 💰 Chi phí cho Trưởng bộ phận; Dụng cụ dùng bản mới; Máy móc hiện ai đang dùng máy */
  const TAB2 = () => [['vattu', '📦 Vật tư'], ['dungcu', '🧰 Dụng cụ'], ['may', '🚜 Máy móc']].concat(laAnh() ? [['chiphi', '💰 Chi phí']] : []);
  G.man.kho.fn = async (tab) => {
    tab = TAB2().some((x) => x[0] === tab) ? tab : 'vattu';
    const m = G.khung('Kho & tài sản', 'Vật tư · dụng cụ · máy móc của nội bộ', '#/viec');
    m.innerHTML = `<div class="chon kho-tab">${TAB2().map(([k, t]) => `<a href="#/kho/${k}" class="${k === tab ? 'dang' : ''}">${t}</a>`).join('')}</div><div id="khoNoi"><div class="dang-tai">Đang tải…</div></div>`;
    const o = m.querySelector('#khoNoi');
    if (tab === 'vattu') await K().manVatTu(o); else if (tab === 'dungcu') await manDungCu2(o); else if (tab === 'chiphi') await manChiPhi(o);
    else { await K().manMay(o); await dangDungMay(o); }
  };
  async function dangDungMay(o) {
    const [kl, sc] = await Promise.all([G.doc('KubotaLuot', { 'Ngày': hn() }).catch(() => []), G.doc('MaySangCat', { 'Ngày': hn() }).catch(() => [])]);
    const kb = kl.find((x) => x['Giờ nhận'] && !x['Giờ trả']);
    const sang = (ten) => sc.find((x) => x['Máy'] === ten && x['Giờ bắt đầu'] && !x['Giờ kết thúc']);
    const the = [...o.querySelectorAll('.may-the2')];
    const gan = (i, html) => { const t = the[i]; if (t && !t.querySelector('.may-dung')) t.querySelector('.so-lon').insertAdjacentHTML('beforebegin', html); };
    const dong = (r, ten, link, nut) => `<div class="may-dung mo" style="margin:6px 0">${r ? `🔴 <b>${esc(ngan(r['Người'] || r['Người ghi']))}</b> đang dùng từ ${esc(String(r['Giờ nhận'] || r['Giờ bắt đầu']).slice(0, 5))}` : `🟢 ${esc(ten)} đang rảnh`} · <a href="#/${link}">${nut}</a></div>`;
    (K().MAY || []).forEach((m, i) => { if (m.ma === 'KB') gan(i, dong(kb, m.ten, 'nb/may', kb ? 'Trả máy' : 'Nhận máy')); else gan(i, dong(sang(m.ten), m.ten, 'nb/may', sang(m.ten) ? 'Kết thúc chạy' : 'Bắt đầu chạy')); });
  }
  /* chuông: dụng cụ hết hạn, chưa xác nhận nhận đồ */
  const chuong2 = G.dsChuong;
  G.dsChuong = async () => { const out = await chuong2(); try {
    if (laAnh() && q('noibo') >= 1) { const dc = await G.doc('DungCu'); dc.filter((x) => x['Người giữ'] && conNgay(x) != null && conNgay(x) < 0 && !/^Báo|Thanh lý|Mất/.test(x['Trạng thái'] || '')).forEach((x) => out.push({ ten: `⏳ ${x['Tên']} của ${ngan(x['Người giữ'])} hết hạn dùng`, phu: 'Nên đổi món mới · mang đồ cũ về đối chứng', link: 'kho/dungcu' })); }
    if (laNB()) { const dc = await G.doc('DungCu'); const c = dc.filter((x) => x['Người giữ'] === S.u.ten && x['Ảnh giao'] && x['Đã nhận'] !== 'Có'); if (c.length) out.push({ ten: `🤝 Xác nhận đã nhận ${c.length} dụng cụ`, phu: c.map((x) => x['Tên']).join(', '), link: 'kho/dungcu' }); }
  } catch (e) { /* bỏ qua */ } return out; };

  /* ======================================================================================
     131–132 · PHÂN, THUỐC: nhập ngay trong khung lưu (định kỳ, Hôm nay, phiếu) → nhật ký phun bón, chia đều từng vị trí
     ====================================================================================== */
  const BON = { DV02: 'Cỏ', DV03: 'Cây bụi', DV38: 'Thủy sinh' }; const PHUN = { DV04: 'Cỏ', DV05: 'Cây bụi', DV06: 'Cây bóng mát' };
  G.PB_BON = BON; G.PB_PHUN = PHUN;
  const dsPhan = () => (S.dm.thuoc || []).filter((t) => /phân/i.test((t.nhom || '') + ' ' + t.ten) && !/bón lá/i.test(t.nhom || '')).map((t) => t.tenNgan || t.ten);
  const dsThuoc = () => (S.dm.thuoc || []).filter((t) => !/Phân bón vô cơ|Phân bón gốc|hữu cơ/i.test(t.nhom || '')).map((t) => t.tenNgan || t.ten);
  const lieu16 = (ten) => { const t = (S.dm.thuoc || []).find((x) => (x.tenNgan || x.ten) === ten); const m = String((t && t.lieu16) || '').match(/([\d.,]+)\s*(ml|g)/i); return m ? { so: num(m[1]), dvt: m[2].toLowerCase() } : null; };
  const maViecTen = (ten) => { const t = String(ten || '').trim().toLowerCase(); const v = (S.dm.dauviec || []).find((x) => String(x.ten).toLowerCase() === t); return v ? v.ma : null; };
  /* khối nhập phân / thuốc gắn vào khung lưu */
  const thuocCua = (ten) => (S.dm.thuoc || []).find((x) => (x.tenNgan || x.ten) === ten || x.ten === ten);
  const laPhanLa = (ten) => { const t = thuocCua(ten) || {}; return /lá|kích|atonik|vitamin|vi lượng|N3M/i.test((t.nhom || '') + ' ' + ten); };
  /* công thức mặc định cho việc phun: lần trước của việc này → công thức pha sẵn đúng nhóm cây → trống */
  const ctMacDinh = (viec) => { const cu = API.LS.get('pb47_' + viec, null); if (cu && Array.isArray(cu.ds) && cu.ds.length) return { ten: 'Công thức lần trước', ds: cu.ds };
    const nhom = (PHUN[viec] || '').toLowerCase(); const ct = (S.dm.congThuc || []).filter((r) => r['Đang dùng'] !== 'Không' && /Phun/.test(r['Loại'] || 'Phun thuốc'));
    const ma = [...new Set(ct.map((r) => r['Mã CT']))]; const hop1 = ma.find((m) => String((ct.find((r) => r['Mã CT'] === m) || {})['Tên công thức'] || '').toLowerCase().includes(nhom)) || ma[0];
    if (!hop1) return { ten: '', ds: [{ sp: '', lieu: '', dvt: 'ml' }] }; const r = ct.filter((x) => x['Mã CT'] === hop1);
    return { ten: r[0]['Tên công thức'], ds: r.map((x) => { const t = thuocCua(x['Sản phẩm']); return { sp: t ? (t.tenNgan || t.ten) : x['Sản phẩm'], lieu: x['Liều / bình'], dvt: x['ĐVT'] || 'ml' }; }) }; };
  const dsCT = () => { const ct = (S.dm.congThuc || []).filter((r) => r['Đang dùng'] !== 'Không'); const o = {}; ct.forEach((r) => { (o[r['Mã CT']] = o[r['Mã CT']] || { ten: r['Tên công thức'], ds: [] }).ds.push(r); }); return o; };
  const dongThuoc = (x, i) => `<div class="hang pb-dong" data-i="${i}" style="gap:6px;align-items:flex-end;margin-top:6px"><label class="o gian" style="margin:0"><span>${i ? '' : 'Thuốc / phân bón lá'}</span><input list="pb47ds" data-pb="sp" value="${esc(x.sp || '')}" placeholder="Chạm để chọn"></label>
    <label class="o" style="margin:0;width:92px"><span>${i ? '' : 'Liều / bình'}</span><input type="number" inputmode="decimal" step="any" data-pb="lieu" value="${esc(x.lieu || '')}"></label><label class="o" style="margin:0;width:70px"><span>${i ? '' : 'Đơn vị'}</span><select data-pb="dvt"><option ${x.dvt !== 'g' ? 'selected' : ''}>ml</option><option ${x.dvt === 'g' ? 'selected' : ''}>g</option></select></label><button type="button" class="nut nho" data-xoa="${i}" title="Bỏ" style="margin-bottom:2px">✕</button></div>`;
  const khoiPB = (viec, n) => { const bon = !!BON[viec]; const cu = API.LS.get('pb47_' + viec, {}) || {};
    if (bon) return `<div class="the pb47" data-viec="${viec}" style="background:#F4F8EC;border-color:#CFE0B4;margin:10px 0"><b>🌱 Phân đã bón</b> <span class="mo">· tổng cho ${n} vị trí, app tự chia đều vào nhật ký từng vị trí</span>
      <label class="o" style="margin-top:8px"><span>Loại phân</span><input list="pb47ds" data-pb="sp" value="${esc(cu.sp || '')}" placeholder="Chạm để chọn"><datalist id="pb47ds">${dsPhan().map((t) => `<option value="${esc(t)}">`).join('')}</datalist></label>
      <div class="hang" style="gap:8px"><label class="o gian"><span>Tổng lượng</span><input type="number" inputmode="decimal" data-pb="sl" step="0.5" min="0"></label><label class="o" style="width:150px"><span>Đơn vị</span><select data-pb="dv"><option ${cu.dv === 'kg' ? 'selected' : ''}>kg</option><option ${cu.dv !== 'kg' ? 'selected' : ''}>Bao (25 kg)</option></select></label></div>
      <label class="hang" style="gap:6px;margin-top:4px"><input type="checkbox" data-pb="ko"> <span class="mo">Lượt này không dùng phân</span></label></div>`;
    const md = ctMacDinh(viec); const cts = dsCT();
    return `<div class="the pb47" data-viec="${viec}" style="background:#F4F8EC;border-color:#CFE0B4;margin:10px 0"><b>🧴 Thuốc đã phun</b> <span class="mo">· công thức điền sẵn, chỉ sửa khi cần · app tự tính tổng và chia đều vào nhật ký từng vị trí</span>
      ${Object.keys(cts).length ? `<div class="chon" style="margin:8px 0 2px">${Object.entries(cts).map(([m, c]) => `<button type="button" data-ct="${esc(m)}" class="${c.ten === md.ten ? 'dang' : ''}">${esc(c.ten)}</button>`).join('')}</div>` : ''}
      <div class="mo" data-pb="tenct" style="margin-top:4px">${md.ten ? 'Đang dùng: ' + esc(md.ten) : ''}</div>
      <datalist id="pb47ds">${dsThuoc().map((t) => `<option value="${esc(t)}">`).join('')}</datalist><div data-pb="ds">${md.ds.map(dongThuoc).join('')}</div>
      <button type="button" class="nut nho" data-them="1" style="margin-top:6px">＋ Thêm thuốc</button>
      <label class="o" style="margin-top:8px"><span>Số bình 16 lít đã phun</span><input type="number" inputmode="decimal" data-pb="binh" step="1" min="0"></label>
      <div data-pb="canh" class="mo" style="color:var(--do)"></div><div data-pb="tong" class="mo"></div>
      <label class="hang" style="gap:6px;margin-top:4px"><input type="checkbox" data-pb="ko"> <span class="mo">Lượt này không dùng thuốc</span></label></div>`; };
  /* điền liều khi chọn thuốc, cảnh báo pha kỵ, tính tổng */
  const docDong = (el) => [...el.querySelectorAll('.pb-dong')].map((d) => ({ sp: d.querySelector('[data-pb="sp"]').value.trim(), lieu: d.querySelector('[data-pb="lieu"]').value, dvt: d.querySelector('[data-pb="dvt"]').value }));
  const capNhatPB = (el) => { if (!el || BON[el.dataset.viec]) return; const ds = docDong(el).filter((x) => x.sp); const binh = num((el.querySelector('[data-pb="binh"]') || {}).value);
    const canh = []; ds.forEach((a, i) => ds.forEach((b, k) => { if (k <= i) return; const ta = thuocCua(a.sp) || {}; const tb = thuocCua(b.sp) || {}; const ky = (t, o) => { const kp = String(t.khongPha || '').toLowerCase(); return kp && (kp.includes(String(o.sp).toLowerCase().split(' ')[0]) || (/phân bón lá/.test(kp) && laPhanLa(o.sp))); };
      if (ky(ta, b) || ky(tb, a)) canh.push(`⚠ ${a.sp} và ${b.sp} không nên pha chung: ${ta.khongPha || tb.khongPha}`); }));
    ds.forEach((a) => { const t = thuocCua(a.sp) || {}; if (/hồ|thủy sinh|cá/i.test(t.khongPha || '') && /DV0[456]/.test(el.dataset.viec)) canh.push(`⚠ ${a.sp}: ${t.khongPha}`); });
    el.querySelector('[data-pb="canh"]').innerHTML = canh.map(esc).join('<br>');
    const cl = Math.max(0, ...ds.map((a) => +((thuocCua(a.sp) || {}).cachLy) || 0));
    el.querySelector('[data-pb="tong"]').innerHTML = binh > 0 && ds.length ? 'Tổng: ' + ds.map((a) => `${esc(a.sp)} ${so(num(a.lieu) * binh)} ${esc(a.dvt)}`).join(' · ') + (cl ? ` · cách ly ${cl} ngày` : '') : ''; };
  const ganPB = (el) => { if (!el || el.dataset.gan) return; el.dataset.gan = '1';
    el.addEventListener('input', (e) => { const sp = e.target.closest('[data-pb="sp"]'); if (sp) { const d = sp.closest('.pb-dong'); const l = lieu16(sp.value.trim()); if (d && l) { d.querySelector('[data-pb="lieu"]').value = l.so; d.querySelector('[data-pb="dvt"]').value = l.dvt; } } capNhatPB(el); });
    el.addEventListener('change', () => capNhatPB(el));
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-them],[data-xoa],[data-ct]'); if (!b) return; const ds = docDong(el);
      if (b.dataset.them) ds.push({ sp: '', lieu: '', dvt: 'ml' }); if (b.dataset.xoa != null) ds.splice(+b.dataset.xoa, 1);
      if (b.dataset.ct) { const c = dsCT()[b.dataset.ct]; ds.splice(0, ds.length, ...c.ds.map((x) => { const t = thuocCua(x['Sản phẩm']); return { sp: t ? (t.tenNgan || t.ten) : x['Sản phẩm'], lieu: x['Liều / bình'], dvt: x['ĐVT'] || 'ml' }; }));
        el.querySelectorAll('[data-ct]').forEach((y) => y.classList.toggle('dang', y === b)); el.querySelector('[data-pb="tenct"]').textContent = 'Đang dùng: ' + c.ten; }
      el.querySelector('[data-pb="ds"]').innerHTML = (ds.length ? ds : [{ sp: '', lieu: '', dvt: 'ml' }]).map(dongThuoc).join(''); capNhatPB(el); });
    capNhatPB(el); };
  const docPB = (el) => { if (!el) return null; const v = (k) => { const x = el.querySelector(`[data-pb="${k}"]`); return x ? (x.type === 'checkbox' ? x.checked : x.value) : ''; };
    const viec = el.dataset.viec; if (v('ko')) return { ko: true, viec };
    if (BON[viec]) { const sp = String(v('sp')).trim(); if (!sp) throw new Error('Chọn loại phân đã bón'); const sl = num(v('sl')); if (!(sl > 0)) throw new Error('Nhập tổng lượng phân'); const kg = /Bao/.test(v('dv')) ? sl * 25 : sl; API.LS.set('pb47_' + viec, { sp, dv: v('dv') }); return { viec, bon: true, sp, kg }; }
    const ds = docDong(el).filter((x) => x.sp); if (!ds.length) throw new Error('Chọn thuốc đã phun'); const thieu = ds.find((x) => !(num(x.lieu) > 0)); if (thieu) throw new Error('Nhập liều mỗi bình cho ' + thieu.sp);
    const binh = num(v('binh')); if (!(binh > 0)) throw new Error('Nhập số bình đã phun');
    API.LS.set('pb47_' + viec, { ds }); const ds2 = ds.map((x) => Object.assign({}, x, { lieu: num(x.lieu), tong: num(x.lieu) * binh }));
    return { viec, bon: false, ds: ds2, binh, sp: ds2.map((x) => x.sp).join(' + '), cachLy: Math.max(0, ...ds2.map((a) => +((thuocCua(a.sp) || {}).cachLy) || 0)) }; };
  /* gắn vào khung lưu: "Ảnh và lưu · Hoàn thành", "Vị trí đã xong · …", "Bước 3/3 · Ảnh và lưu" */
  const hopGoc = G.hop;
  G.hop = function (tieu, html, sau, ...r) {
    return hopGoc.call(this, tieu, html, (o, dong, ...x) => {
      try {
        const t = String(tieu || ''); let viec = null; let n = 0;
        if (/^Vị trí đã xong · /.test(t)) { viec = maViecTen(t.replace(/^Vị trí đã xong · /, '')); }
        else if (/^Ảnh và lưu · Hoàn thành|^Bước 3\/3/.test(t)) { const b = o.querySelector('.the b'); viec = b ? maViecTen(b.textContent) : null; const m = (o.querySelector('.the .mo') || {}).textContent || ''; n = +((m.match(/^(\d+) vị trí/) || [])[1]) || 0; }
        if (viec && (BON[viec] || PHUN[viec])) {
          const luu = o.querySelector('#luu'); if (luu) { luu.insertAdjacentHTML('beforebegin', khoiPB(viec, n || 'các')); G._pbHop = o; ganPB(o.querySelector('.pb47')); }
        }
      } catch (e) { console.warn(e); }
      return sau ? sau(o, dong, ...x) : undefined;
    }, ...r);
  };
  /* ghi nhật ký phun bón: một dòng cho MỖI vị trí, lượng chia đều; có món trong kho thì trừ kho (nội bộ) */
  G.ghiPhanThuoc = async (pb, dsVT, anh, nguon) => {
    if (!pb || pb.ko || !dsVT.length) return; const n = dsVT.length; const luot = G.ma('LB');
    const sp = pb.bon ? [{ sp: pb.sp, lieu: '', dvt: 'kg', tong: pb.kg }] : pb.ds;
    const loai = pb.bon ? 'Bón gốc' : sp.every((x) => laPhanLa(x.sp)) ? 'Phun phân bón lá' : 'Phun thuốc';
    const nhom = (BON[pb.viec] || PHUN[pb.viec] || ''); const tom = pb.bon ? so(pb.kg) + ' kg ' + pb.sp : sp.map((x) => `${x.sp} ${so(x.tong)} ${x.dvt}`).join(' + ') + ` (${so(pb.binh)} bình)`;
    for (const vt of dsVT) {
      const v = G.vt(vt) || {}; const nk = await imLang(() => API.goi('ghi', { bang: 'NhatKyPhunBon', dong: { 'Mã NK': '', 'Ngày giờ': API.bayGio().slice(0, 16), [loaiPB]: loai, 'Nhóm cây': nhom, 'Cụm': v.cum || '', 'Mã vị trí': vt, 'Vị trí chi tiết': G.tenVT(vt),
        'Số bình': pb.bon ? '' : Math.round(pb.binh / n * 100) / 100, 'Cách ly dài nhất (ngày)': pb.bon ? '' : (pb.cachLy || ''), 'Hết cách ly': !pb.bon && pb.cachLy ? G.congNgay(hn(), pb.cachLy) : '', 'Ảnh': anh || [], 'Ghi chú': `${nguon || ''} · lượt ${luot}: tổng ${tom} chia ${n} vị trí`, 'Mã lượt': luot, 'Người ghi': '' } }));
      await imLang(() => API.goi('ghiNhieu', { bang: 'NhatKyPhunBonChiTiet', dong: sp.map((x, k) => ({ 'Mã NK': nk['Mã NK'], 'STT': k + 1, 'Sản phẩm': x.sp, 'Liều / bình': pb.bon ? '' : x.lieu, 'ĐVT': x.dvt, 'Tổng lượng': Math.round(x.tong / n * 1000) / 1000 })) }));
    }
    if (q('noibo') >= 2 && K().taiKho) { try { const k = await K().taiKho(); for (const x of sp) { const vt = k.vt.find((y) => String(y['Tên']).toLowerCase().includes(x.sp.toLowerCase().split(' ')[0]));
      if (vt) { const sl = pb.bon ? (/bao/i.test(vt['ĐVT']) ? x.tong / 25 : x.tong) : (/lít/i.test(vt['ĐVT']) ? x.tong / 1000 : x.tong); await imLang(() => K().xuatKho(vt, Math.round(sl * 100) / 100, (pb.bon ? 'Bón phân ' : 'Phun ') + nhom, luot)); } } } catch (e) { /* bỏ qua */ } }
    bao(`Đã ghi nhật ký ${pb.bon ? 'bón phân' : 'phun'}: ${tom} · ${n} vị trí`);
  };
  const hoiPB = (viec, n) => new Promise((ok) => { let xong = false;
    hopGoc(BON[viec] ? 'Phân đã bón · ' + G.dvTen(viec) : 'Thuốc đã phun · ' + G.dvTen(viec), `${khoiPB(viec, n)}<button class="nut chinh rong" id="l">Lưu</button>`, (o, dong) => { ganPB(o.querySelector('.pb47'));
      o.querySelector('#l').onclick = () => { try { const v = docPB(o.querySelector('.pb47')); xong = true; dong(); ok(v); } catch (e) { bao(e.message, true); } };
    });
    const kt = setInterval(() => { if (!document.querySelector('.lop-phu .pb47')) { clearInterval(kt); if (!xong) ok(null); } }, 400);
  });
  const goi47 = API.goi;
  API.goi = async function (act, r, ...x) {
    let pb = null; let dsVT = [];
    if (act === 'dinhKy.luu' && r && (BON[r.viec] || PHUN[r.viec]) && r.trangThai !== 'Đang làm' && !r.maNK && !r.maDH && !r.daPhan && r.anh && r.anh.length) {
      const el = G._pbHop && G._pbHop.isConnected ? G._pbHop.querySelector(`.pb47[data-viec="${r.viec}"]`) : null;
      pb = el ? docPB(el) : await hoiPB(r.viec, r.ds.length); if (!pb) throw new Error(BON[r.viec] ? 'Chưa ghi phân đã bón' : 'Chưa ghi thuốc đã phun');
      r = Object.assign({}, r, { daPhan: true }); dsVT = r.ds.map((d) => d.vt);
    }
    if (act === 'phieu.chuyen' && r && r.hd === 'xong' && !r.daPhan) {
      const p = (await G.doc('Phieu', { 'Mã phiếu': r.ma }).catch(() => []))[0];
      if (p && /phân|bón|phun|thuốc|sâu|rệp|nấm|bệnh|dịch hại/i.test([p['Loại lỗi'], p['Mô tả'], p['Nhóm lỗi']].join(' '))) {
        const c = await G.chonDS('Phiếu này có dùng phân, thuốc không?', ['Có bón phân', 'Có phun thuốc', 'Không dùng']); if (!c) throw new Error('Chọn có dùng phân, thuốc không');
        if (c.ten !== 'Không dùng') { pb = await hoiPB(c.ten === 'Có bón phân' ? 'DV03' : 'DV05', 1); if (!pb) throw new Error('Chưa ghi phân, thuốc đã dùng'); dsVT = [p['Mã vị trí'] || p['Vị trí khác'] || 'Khác']; pb.nguon = 'Phiếu ' + r.ma; }
      }
    }
    const kq = await goi47.call(this, act, r, ...x);
    if (pb) { try { await G.ghiPhanThuoc(pb, dsVT, r.anh, pb.nguon || ('Xong ' + G.dvTen(r.viec))); } catch (e) { console.warn(e); } G._pbHop = null; }
    return kq;
  };

  /* ======================================================================================
     125 · VIỆC KHÁC (tổ trưởng thêm) báo xong phải có ảnh · 128 · việc làm nhiều ngày: Làm tiếp + tiến độ
     ====================================================================================== */
  const PT = ['~25%', '~50%', '~75%'];
  const formXongViec = (g, sau) => G.hop('Báo xong · ' + g['Nội dung'], `<div class="the" style="background:var(--xanh-nhat)"><b>${esc(g['Nội dung'])}</b><div class="mo">${esc(g['Vị trí'] || '')}${g['Bắt đầu'] && g['Bắt đầu'] !== hn() ? ' · làm từ ' + G.ngayVN(g['Bắt đầu']).slice(0, 5) : ''}</div></div>
    <div class="buoc"><span>1</span>Kết quả hôm nay</div><div class="hai-nut"><button type="button" data-kq="xong" class="dang xanh">✓ Xong hết</button><button type="button" data-kq="tiep">⏳ Làm tiếp ngày mai</button></div>
    <div id="pt" hidden><div class="chon" style="margin:8px 0">${PT.map((p) => `<button type="button" data-pt="${p}">${p}</button>`).join('')}</div></div>
    <div class="o" style="margin:10px 0"><span class="nhan-o">Ảnh hiện trường (bắt buộc)</span><div id="anh"></div></div>${G.oMoTa ? G.oMoTa('gc', 'Ghi chú') : '<textarea id="gc"></textarea>'}<button class="nut chinh rong" id="luu">Lưu</button>`, (o, dong) => {
    let kq = 'xong'; let pt = '';
    const anh = G.oAnh(o.querySelector('#anh'), { batBuoc: true, toiDa: 6 }); if (G.ganMic) G.ganMic(o);
    o.querySelectorAll('[data-kq]').forEach((b) => { b.onclick = () => { kq = b.dataset.kq; o.querySelectorAll('[data-kq]').forEach((x) => { x.classList.toggle('dang', x === b); x.classList.toggle('xanh', x === b && kq === 'xong'); x.classList.toggle('vang', x === b && kq === 'tiep'); }); o.querySelector('#pt').hidden = kq !== 'tiep'; }; });
    o.querySelectorAll('[data-pt]').forEach((b) => { b.onclick = () => { pt = b.dataset.pt; o.querySelectorAll('[data-pt]').forEach((x) => x.classList.toggle('dang', x === b)); }; });
    o.querySelector('#luu').onclick = (e) => chay(async () => { const a = anh.kiemTra(); if (kq === 'tiep' && !pt) throw new Error('Chọn ước lượng đã làm được bao nhiêu');
      const gc = (o.querySelector('#gc') || {}).value || ''; const t = kq === 'xong' ? 'Xong' : 'Làm một phần';
      await API.goi('sua', { bang: 'GiaoViecNgay', khoa: { 'Mã': g['Mã'] }, doi: { 'Trạng thái': t, 'Ảnh': a.join ? a.join(' | ') : a, 'Tiến độ': kq === 'xong' ? '100' : pt.replace(/\D/g, ''), 'Ghi chú': gc, 'Giờ cập nhật': API.bayGio(), 'Bắt đầu': g['Bắt đầu'] || hn() } });
      await API.goi('ghi', { bang: 'TienDoViec', dong: { 'Mã': G.ma('TD'), 'Ngày': '', 'Đội': g['Đội'] || S.u.doi || '', 'Mã GV': g['Mã'], 'Chuỗi': g['Chuỗi'] || g['Mã'], 'Nội dung': g['Nội dung'], 'Vị trí': g['Vị trí'] || '', 'Bắt đầu': g['Bắt đầu'] || hn(), 'Tiến độ': kq === 'xong' ? '100' : pt.replace(/\D/g, ''), 'Kết quả': t, 'Ảnh': a, 'Ghi chú': gc, 'Người ghi': '' } });
      dong(); bao(kq === 'xong' ? 'Đã báo xong' : `Đã ghi ${pt} · mai tự hiện lại để làm tiếp`); if (sau) sau(); }, e.target);
  });
  G.formXongViec = formXongViec;
  const ganTT0 = G.ganTT;
  if (ganTT0) G.ganTT = (m, gv, viec) => { ganTT0(m, gv, viec);
    m.querySelectorAll('[data-tt]').forEach((b) => { const x = viec.find((y) => y.ma === b.dataset.tt); if (!x || x.tt !== 'dang') return;
      b.onclick = (e) => { e.stopPropagation(); const g = gv.find((y) => y['Mã'] === x.ma); formXongViec(g, () => G.taiLai()); }; });
    if (laTT() && !m.querySelector('.nut-anhngay')) { const h = m.querySelector('.loc-tt'); const nut = G.h('<button class="nut rong nut-anhngay" style="margin:0 0 10px">📤 Gửi ảnh tóm tắt hôm nay vào nhóm Zalo</button>'); nut.onclick = () => G.guiAnhNgay(gioNay2() >= '15:00' ? 'cuoi' : 'dau', S.u.doi, ''); if (h) h.insertAdjacentElement('beforebegin', nut); }
  };
  const gioNay2 = () => API.bayGio().slice(11, 16);
  /* Hôm nay: việc nhiều ngày hiện "Đang làm · ngày N · ~x%"; xong thì "từ dd/mm → xong dd/mm · N ngày" */
  const vTT0 = G.viecTT;
  if (vTT0) G.viecTT = async (gv) => { const out = await vTT0(gv); let dang = [];
    try { dang = await G.doc('TickDinhKy', { 'Trạng thái': 'Đang làm' }); } catch (e) { /* bỏ qua */ }
    const td = await G.doc('TienDoViec', { 'Đội': S.u.doi || '' }).catch(() => []);
    out.forEach((x) => { const g = gv.find((y) => y['Mã'] === x.ma); if (!g) return;
      let bd = g['Bắt đầu'] && g['Bắt đầu'] !== hn() ? g['Bắt đầu'] : '';
      if (!bd && x.con && x.con.length) { const b = dang.filter((r) => r['Mã việc'] === x.maViec && x.con.includes(r['Mã vị trí'])).map((r) => r['Bắt đầu']).sort()[0]; if (b && b < hn()) bd = b; }
      const pt = (td.filter((r) => r['Chuỗi'] === (g['Chuỗi'] || g['Mã']) || r['Mã GV'] === g['Mã']).pop() || {})['Tiến độ'] || g['Tiến độ'];
      if (!bd && !pt) return; const n = bd ? Math.round((new Date(hn()) - new Date(bd)) / 864e5) + 1 : 1;
      const nhan = x.tt === 'xong' ? `✓ từ ${G.ngayVN(bd || hn()).slice(0, 5)} → xong ${G.ngayVN(hn()).slice(0, 5)} · ${n} ngày` : `⏳ Đang làm · ngày ${n}${pt && pt !== '100' ? ' · ~' + pt + '%' : ''}`;
      x.phu = nhan + (x.phu ? ' · ' + x.phu : ''); if (x.tt === 'chua' && bd) x.tt = 'dang'; });
    return out; };
  /* Bắt đầu ngày: việc hôm qua "Làm tiếp" tự hiện lại để giao tiếp */
  const gy0 = G.goiYNgay; G._ltMap = G._ltMap || {};
  G.goiYNgay = async (doi, ngay) => { const out = await gy0(doi, ngay); try {
    const tu = G.congNgay(ngay || hn(), -10); const ds = (await G.doc('GiaoViecNgay', { 'Ngày': { tu, den: G.congNgay(ngay || hn(), -1) }, 'Đội': doi })).sort((a, b) => (a['Ngày'] < b['Ngày'] ? -1 : 1));
    const chuoi = {}; ds.forEach((g) => { if (/^DK:|^HN:/.test(g['Mã nguồn'] || '')) return; const c = g['Chuỗi'] || g['Mã']; chuoi[c] = g; });
    Object.entries(chuoi).forEach(([c, g]) => { if (g['Trạng thái'] !== 'Làm một phần') return; const ma = 'LT:' + c; if (out.some((x) => x.ma === ma)) return;
      const bd = g['Bắt đầu'] || g['Ngày']; G._ltMap[ma] = { chuoi: c, bd, nguoi: String(g['Người'] || '').split(', ').filter(Boolean) };
      out.push({ nhom: 2, nguon: '⏳ Làm tiếp', nd: g['Nội dung'], ma, vt: `${g['Vị trí'] ? g['Vị trí'] + ' · ' : ''}từ ${G.ngayVN(bd).slice(0, 5)}${g['Tiến độ'] ? ' · đã ~' + g['Tiến độ'] + '%' : ''}` }); });
  } catch (e) { console.warn(e); } return out; };
  const goi47b = API.goi;
  API.goi = async function (act, r, ...x) {
    if (act === 'ghiNhieu' && r && r.bang === 'GiaoViecNgay' && Array.isArray(r.dong)) r = Object.assign({}, r, { dong: r.dong.map((d) => { const lt = G._ltMap[d['Mã nguồn']]; return lt ? Object.assign({}, d, { 'Chuỗi': lt.chuoi, 'Bắt đầu': lt.bd, 'Vị trí': String(d['Vị trí'] || '').replace(/ · từ .*$/, '').replace(/^từ .*$/, '') }) : d; }) });
    return goi47b.call(this, act, r, ...x);
  };
  /* Chốt ngày: việc khác bấm Xong mà chưa có ảnh → bắt chụp; Làm một phần → ước lượng % để mai làm tiếp */
  const chot0 = G.man.chotngay && G.man.chotngay.fn;
  if (chot0) G.man.chotngay.fn = async (...a) => { await chot0(...a); const m = document.getElementById('noiDung'); if (!m) return;
    const gv = await G.doc('GiaoViecNgay', { 'Ngày': hn(), 'Đội': S.u.doi || 'Đội khu vực' }).catch(() => []);
    m.querySelectorAll('[data-kq][data-k="Làm một phần"]').forEach((b) => { b.textContent = '⏳ Làm tiếp mai'; });
    G._gvChot = gv; if (m.dataset.chot47) return; m.dataset.chot47 = '1';
    m.addEventListener('click', (e) => { if (!/^#\/chotngay/.test(location.hash)) return; const gv = G._gvChot || []; const b = e.target.closest('[data-kq]'); if (!b) return; const g = gv.find((y) => y['Mã'] === b.dataset.kq); if (!g) return;
      const thuCong = !/^HN:|^DK:|^P:/.test(g['Mã nguồn'] || '') || /^HN:CD/.test(g['Mã nguồn'] || '');
      if (b.dataset.k === 'Xong' && thuCong && !g['Ảnh'] && !b.dataset.daAnh) { e.stopImmediatePropagation(); formXongViec(g, () => { b.dataset.daAnh = '1'; g['Ảnh'] = 'x'; b.click(); }); }
      if (b.dataset.k === 'Làm một phần' && !b.dataset.daPt) { setTimeout(async () => { const c = await G.chonDS('Hôm nay làm được khoảng bao nhiêu?', PT); if (!c) return; b.dataset.daPt = '1';
        await API.goi('sua', { bang: 'GiaoViecNgay', khoa: { 'Mã': g['Mã'] }, doi: { 'Tiến độ': c.ten.replace(/\D/g, ''), 'Bắt đầu': g['Bắt đầu'] || hn() } }).catch(() => {});
        await API.goi('ghi', { bang: 'TienDoViec', dong: { 'Mã': G.ma('TD'), 'Ngày': '', 'Đội': g['Đội'], 'Mã GV': g['Mã'], 'Chuỗi': g['Chuỗi'] || g['Mã'], 'Nội dung': g['Nội dung'], 'Vị trí': g['Vị trí'] || '', 'Bắt đầu': g['Bắt đầu'] || hn(), 'Tiến độ': c.ten.replace(/\D/g, ''), 'Kết quả': 'Làm một phần', 'Ảnh': '', 'Ghi chú': '', 'Người ghi': '' } }).catch(() => {});
        bao('Đã ghi ' + c.ten + ' · mai tự hiện lại'); }, 600); }
    }, true);
  };

  /* ======================================================================================
     123 · ẢNH TÓM TẮT GỬI NHÓM ZALO (lãnh đạo xem ngay trong nhóm, không cần mở link, không cần đăng nhập)
     ====================================================================================== */
  const taiAnh = (src) => new Promise((ok) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; setTimeout(() => ok(null), 6000); });
  const catDong = (x, t, w) => { const tu = String(t).split(' '); const out = []; let d = ''; tu.forEach((a) => { const th = d ? d + ' ' + a : a; if (x.measureText(th).width > w && d) { out.push(d); d = a; } else d = th; }); if (d) out.push(d); return out; };
  G.anhNgay = async (loai, doi, coAnh) => {
    const ngay = hn(); const cuoi = loai === 'cuoi';
    const [gv, dd, du, ph, ps, tk] = await Promise.all([G.doc('GiaoViecNgay', { 'Ngày': ngay, 'Đội': doi }), G.doc('DiemDanh', { 'Ngày': ngay }), G.doc('DuyetCong', { 'Ngày': ngay }), G.doc('Phieu', {}, 2000).catch(() => []), G.doc('ViecPhatSinh', { 'Ngày': ngay }).catch(() => []), G.doc('TickDinhKy', { 'Ngày': ngay }).catch(() => [])]);
    const sang = dd.filter((r) => r['Đội'] === doi && r['Buổi'] === 'Sáng' && /Có mặt/.test(r[TT_DD] || '')).length; const chieu = dd.filter((r) => r['Đội'] === doi && r['Buổi'] === 'Chiều' && /Có mặt/.test(r[TT_DD] || '')).length;
    const phN = ph.filter((p) => p['Giao cho'] === doi && (String(p['Giờ tạo']).slice(0, 10) === ngay || String(p['Giờ xong'] || '').slice(0, 10) === ngay) && !gv.some((g) => g['Mã nguồn'] === 'P:' + p['Mã phiếu']));
    const viec = gv.map((g) => ({ ten: g['Nội dung'], vt: g['Vị trí'] || '', ng: String(g['Người'] || '').split(', ').filter(Boolean).length, tt: g['Trạng thái'] || 'Chưa làm', ly: g['Lý do'] || '', pt: g['Tiến độ'], bd: g['Bắt đầu'] }))
      .concat(phN.map((p) => ({ ten: '📋 ' + (p['Mô tả'] || p['Loại lỗi'] || 'Phiếu'), vt: G.tenVT(p['Mã vị trí'], p['Vị trí khác']), ng: 0, tt: /Báo xong|Đã duyệt/.test(p['Trạng thái']) ? 'Xong' : /Đang/.test(p['Trạng thái']) ? 'Đang làm' : 'Chưa làm', ly: '' })))
      .concat(ps.filter((r) => r['Đội'] === doi || (S.u.doi === doi && r['Người ghi'] === S.u.ten)).map((r) => ({ ten: '➕ ' + (r['Mô tả'] || r['Loại việc']), vt: G.tenVT(r['Mã vị trí'], r['Vị trí khác']), ng: +r['Số người'] || 0, tt: r['Trạng thái'] === 'Xong' ? 'Xong' : 'Đang làm', ly: '' })));
    const anhTT = du.filter((r) => r['Đội'] === doi && r['Buổi'] === 'Sáng').flatMap((r) => API.dsAnh(r['Ảnh tập thể']));
    const anhHT = gv.flatMap((g) => API.dsAnh(g['Ảnh'])).concat(tk.filter((r) => (r['Người tick'] || '') && gv.some((g) => String(g['Mã vị trí'] || '').includes(r['Mã vị trí']))).flatMap((r) => API.dsAnh(r['Ảnh']))).concat(phN.flatMap((p) => API.dsAnh(p['Ảnh sau'])));
    const W = 1080; const P = 48; const cv = document.createElement('canvas'); const x = cv.getContext('2d'); const F = (s, b) => `${b ? 700 : 500} ${s}px "Be Vietnam Pro", system-ui, sans-serif`;
    /* đo chiều cao */
    x.font = F(30, true); const dongViec = viec.map((v) => { x.font = F(30, true); const l1 = catDong(x, v.ten, W - P * 2 - 200); x.font = F(24); const l2 = v.vt ? catDong(x, v.vt + (v.ng ? ' · ' + v.ng + ' người' : ''), W - P * 2 - 70) : v.ng ? [v.ng + ' người'] : []; return { v, l1, l2, h: 20 + l1.length * 40 + l2.length * 32 + 18 }; });
    const anhDs = coAnh === false ? [] : (cuoi ? anhHT : anhTT).slice(0, cuoi ? 4 : 1);
    const hAnh = anhDs.length ? (cuoi ? (anhDs.length > 2 ? 2 : 1) * 330 + 20 : 420) : 0;
    const H = 230 + 110 + dongViec.reduce((a, d) => a + d.h, 0) + (viec.length ? 0 : 80) + hAnh + 120;
    cv.width = W; cv.height = H; x.fillStyle = '#F3F5F1'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#14351F'; x.fillRect(0, 0, W, 220); x.fillStyle = '#C8E05A'; x.font = F(30, true); x.fillText('🌱 GreenLog · Cảnh quan Mövenpick Resort Waverly Phu Quoc', P, 64);
    x.fillStyle = '#FFFFFF'; x.font = F(52, true); x.fillText((cuoi ? 'KẾT QUẢ ' : 'KẾ HOẠCH ') + String(doi).toUpperCase(), P, 140);
    x.font = F(30); x.fillStyle = '#DDE8D8'; x.fillText(`${G.thu(ngay)}, ${G.ngayVN(ngay)} · gửi lúc ${gio()}`, P, 190);
    let y = 250; const xong = viec.filter((v) => v.tt === 'Xong').length;
    const o4 = [[cuoi ? `${xong}/${viec.length}` : String(viec.length), cuoi ? 'việc xong' : 'việc hôm nay'], [String(sang || '—'), 'có mặt sáng'], [String(chieu || '—'), 'có mặt chiều']];
    o4.forEach(([a, b], i) => { const w = (W - P * 2 - 40) / 3; const x0 = P + i * (w + 20); x.fillStyle = '#FFFFFF'; x.beginPath(); x.roundRect(x0, y, w, 90, 18); x.fill(); x.fillStyle = '#14351F'; x.font = F(40, true); x.fillText(a, x0 + 22, y + 52); x.fillStyle = '#5E6F63'; x.font = F(22); x.fillText(b, x0 + 22, y + 80); });
    y += 120;
    if (!viec.length) { x.fillStyle = '#5E6F63'; x.font = F(28); x.fillText('Chưa có việc nào được giao.', P, y + 40); y += 80; }
    dongViec.forEach((d, i) => { const v = d.v; x.fillStyle = '#FFFFFF'; x.beginPath(); x.roundRect(P, y, W - P * 2, d.h - 10, 16); x.fill();
      const ok = v.tt === 'Xong'; const mot = /một phần|Đang/.test(v.tt); x.fillStyle = ok ? '#2E7D4F' : mot ? '#C98B1E' : cuoi ? '#B3412F' : '#5E6F63';
      x.font = F(30, true); x.fillText(ok ? '✓' : mot ? '◐' : cuoi ? '✕' : String(i + 1), P + 20, y + 46);
      x.fillStyle = '#14261B'; d.l1.forEach((l, k) => { x.font = F(30, true); x.fillText(l, P + 64, y + 46 + k * 40); });
      x.fillStyle = '#5E6F63'; x.font = F(24); d.l2.forEach((l, k) => x.fillText(l, P + 64, y + 46 + d.l1.length * 40 + k * 32 - 6));
      if (cuoi || v.tt !== 'Chưa làm') { const nhan = ok ? 'Xong' : mot ? (v.pt ? `Đang làm ~${v.pt}%` : 'Một phần') : 'Chưa làm'; x.font = F(24, true); const tw = x.measureText(nhan).width; x.fillStyle = ok ? '#E3F1E6' : mot ? '#FBEFD5' : '#F6E0DC'; x.beginPath(); x.roundRect(W - P - tw - 46, y + 18, tw + 28, 40, 20); x.fill(); x.fillStyle = ok ? '#2E7D4F' : mot ? '#9A6A12' : '#B3412F'; x.fillText(nhan, W - P - tw - 32, y + 46);
        if (v.ly && !ok) { x.font = F(22); x.fillStyle = '#9A6A12'; const l = 'Lý do: ' + v.ly; x.fillText(l, W - P - x.measureText(l).width - 18, y + 84); } }
      y += d.h; });
    if (anhDs.length) { const im = (await Promise.all(anhDs.map((a) => taiAnh(API.anhUrl(a))))).filter(Boolean); y += 10;
      const ve = (i, x0, y0, w, h) => { const r = Math.max(w / i.width, h / i.height); const sw = w / r, sh = h / r; x.save(); x.beginPath(); x.roundRect(x0, y0, w, h, 16); x.clip(); x.drawImage(i, (i.width - sw) / 2, (i.height - sh) / 2, sw, sh, x0, y0, w, h); x.restore(); };
      if (!cuoi && im[0]) ve(im[0], P, y, W - P * 2, 400);
      if (cuoi) im.forEach((i, k) => { const c = im.length === 1 ? 1 : 2; const w = (W - P * 2 - (c - 1) * 20) / c; ve(i, P + (k % c) * (w + 20), y + Math.floor(k / c) * 330, w, 310); });
      y += hAnh; }
    x.fillStyle = '#8A9A8E'; x.font = F(22); x.fillText('Gửi từ GreenLog · số liệu cập nhật đến lúc gửi', P, H - 50);
    return cv;
  };
  G.guiAnhNgay = async (loai, doi, chu) => {
    let cv = await G.anhNgay(loai, doi); let blob = null;
    try { blob = await new Promise((ok, no) => { try { cv.toBlob((b) => (b ? ok(b) : no(new Error('rỗng'))), 'image/png'); } catch (e) { no(e); } }); }
    catch (e) { cv = await G.anhNgay(loai, doi, false); blob = await new Promise((ok) => cv.toBlob(ok, 'image/png')); }
    const file = new File([blob], `GreenLog_${loai === 'cuoi' ? 'KetQua' : 'KeHoach'}_${String(doi).replace(/\s+/g, '')}_${hn()}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && /Android|iPhone|iPad/i.test(navigator.userAgent)) { try { await navigator.share({ files: [file], title: 'GreenLog' }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    const url = URL.createObjectURL(blob);
    G.hop('📤 Gửi ảnh vào nhóm Zalo', `<img src="${url}" alt="" style="width:100%;border-radius:12px;border:1px solid var(--vien)"><p class="mo">Bấm Sao chép ảnh rồi dán (Ctrl+V) vào nhóm Zalo. Hoặc tải ảnh về rồi gửi.</p>
      <div class="nhom-nut"><button class="nut chinh" id="cp">📋 Sao chép ảnh</button><a class="nut" id="tai" href="${url}" download="${esc(file.name)}">⬇ Tải ảnh</a>${chu ? '<button class="nut" id="chu">Gửi dạng chữ</button>' : ''}</div>`, (o) => {
      o.querySelector('#cp').onclick = () => chay(async () => { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); bao('Đã chép ảnh · dán vào Zalo'); }, o.querySelector('#cp'));
      const c = o.querySelector('#chu'); if (c) c.onclick = () => G.guiZalo(chu, '');
    });
  };

  /* ======================================================================================
     133 · BÁO CÁO THEO TỪNG VIỆC: bổ sung các đầu việc còn thiếu
     ====================================================================================== */
  const cong = (ds, c) => ds.reduce((a, r) => a + num(r[c]), 0);
  const dem = (ds, f) => { const o = {}; ds.forEach((r) => { const k = f(r) || '—'; o[k] = (o[k] || 0) + 1; }); return o; };
  const bang2 = (o, a, b) => `<table class="bang"><tr><th>${esc(a)}</th><th>${esc(b)}</th></tr>${Object.keys(o).sort((x, y) => o[y] - o[x]).map((k) => `<tr><td>${esc(k)}</td><td>${so(o[k])}</td></tr>`).join('')}</table>`;
  const BC = G.BC_VIEC || [];
  const themBC = (x) => { if (!BC.some((b) => b.k === x.k)) BC.push(x); };
  themBC({ k: 'cd/bien', ten: 'Hỗ trợ vệ sinh bãi biển (đội cơ động)', nhom: 'Bãi biển', bang: 'GiaoViecNgay', loc: { 'Nội dung': 'Hỗ trợ vệ sinh bãi biển đầu ca sáng' }, cs: (d) => [['Buổi đã giao', d.length], ['Buổi xong', d.filter((r) => r['Trạng thái'] === 'Xong').length], ['Lượt người', d.reduce((a, r) => a + String(r['Người'] || '').split(', ').filter(Boolean).length, 0)]] });
  themBC({ k: 'ngay/kehoach', ten: 'Kế hoạch ngày và chốt ngày', nhom: 'Hằng ngày', bang: 'NgayLamViec', cs: (d) => [['Lần gửi kế hoạch', d.filter((r) => r['Loại'] === 'Bắt đầu ngày').length], ['Gửi trễ 07:30', d.filter((r) => r['Loại'] === 'Bắt đầu ngày' && r['Đúng hạn'] === 'Trễ').length], ['Lần chốt ngày', d.filter((r) => r['Loại'] === 'Chốt ngày').length]], them: (d) => bang2(dem(d, (r) => r['Đội'] + ' · ' + r['Loại']), 'Đội', 'Lần') });
  themBC({ k: 'ngay/giaoviec', ten: 'Việc giao trong ngày (theo đội)', nhom: 'Hằng ngày', bang: 'GiaoViecNgay', cs: (d) => [['Việc đã giao', d.length], ['Xong', d.filter((r) => r['Trạng thái'] === 'Xong').length], ['Làm tiếp nhiều ngày', d.filter((r) => r['Trạng thái'] === 'Làm một phần').length], ['Chưa làm', d.filter((r) => r['Trạng thái'] === 'Chưa làm').length]], them: (d) => bang2(dem(d, (r) => r['Lý do']), 'Lý do chưa xong', 'Lần') });
  themBC({ k: 'ngay/nhieungay', ten: 'Việc làm nhiều ngày (tiến độ)', nhom: 'Hằng ngày', bang: 'TienDoViec', cs: (d) => [['Lần cập nhật', d.length], ['Việc đã xong', new Set(d.filter((r) => r['Kết quả'] === 'Xong').map((r) => r['Chuỗi'])).size], ['Việc đang làm dở', new Set(d.map((r) => r['Chuỗi'])).size - new Set(d.filter((r) => r['Kết quả'] === 'Xong').map((r) => r['Chuỗi'])).size]] });
  themBC({ k: 'diemdanh', ten: 'Điểm danh, công nhà thầu', nhom: 'Hằng ngày', bang: 'DiemDanh', cs: (d) => [['Tổng công', so(cong(d, 'Công'))], ['Lượt có mặt', d.filter((r) => /Có mặt/.test(r[TT_DD] || '')).length], ['Lượt vắng', d.filter((r) => /Vắng/.test(r[TT_DD] || '')).length]], them: (d) => bang2(dem(d.filter((r) => /Vắng/.test(r[TT_DD] || '')), (r) => r['Họ tên']), 'Người vắng', 'Buổi') });
  themBC({ k: 'kho/xuatnhap', ten: 'Kho vật tư: nhập, xuất', nhom: 'Kho & tài sản', bang: 'KhoGiaoDich', cs: (d) => [['Lần nhập', d.filter((r) => r['Loại'] === 'Nhập').length], ['Lần xuất', d.filter((r) => r['Loại'] === 'Xuất').length], ['Tiền nhập', tien(d.filter((r) => r['Loại'] === 'Nhập').reduce((a, r) => a + (num(r['Thành tiền']) || num(r['Số lượng']) * num(r['Đơn giá'])), 0))], ['Trưởng bộ phận tự mua', tien(d.filter((r) => /tự mua/.test(r['Nguồn'] || '')).reduce((a, r) => a + (num(r['Thành tiền']) || num(r['Số lượng']) * num(r['Đơn giá'])), 0))]], them: (d) => bang2(d.filter((r) => r['Loại'] === 'Xuất').reduce((o, r) => { o[r['Tên VT']] = (o[r['Tên VT']] || 0) + num(r['Số lượng']); return o; }, {}), 'Đã xuất', 'Số lượng') });
  themBC({ k: 'kho/dungcu', ten: 'Dụng cụ: nhập, cấp phát, đổi, mất', nhom: 'Kho & tài sản', bang: 'DungCuLichSu', ngay: 'Giờ', cs: (d) => [['Nhập kho', d.filter((r) => r['Loại'] === 'Nhập kho').length], ['Cấp phát', d.filter((r) => r['Loại'] === 'Cấp phát').length], ['Hỏng, đổi', d.filter((r) => /hỏng|đổi|Thu đồ cũ/i.test(r['Loại'])).length], ['Mất', d.filter((r) => /^Mất/.test(r['Loại'])).length], ['Tiền đền', tien(cong(d.filter((r) => /đền/.test(r['Loại'])), 'Giá trị'))]], them: (d) => bang2(dem(d, (r) => r['Loại']), 'Loại', 'Lần') });
  themBC({ k: 'kho/kiemtra', ten: 'Kiểm tra dụng cụ ngẫu nhiên', nhom: 'Kho & tài sản', bang: 'KiemTraDC', ngay: 'Ngày giao', cs: (d) => [['Lần giao', d.length], ['Đã gửi', d.filter((r) => r['Trạng thái'] === 'Đã nộp').length], ['Có món thiếu, hỏng', d.filter((r) => /Thiếu/.test(r['Kết quả'] || '')).length]], them: (d) => bang2(dem(d, (r) => r['Người']), 'Người', 'Lần') });
  themBC({ k: 'kho/baotri', ten: 'Bảo trì máy theo giờ', nhom: 'Kho & tài sản', bang: 'BaoTriPH', ngay: 'Ngày tạo', cs: (d) => [['Mốc đến hạn', d.filter((r) => r['Trạng thái'] !== 'Khởi điểm').length], ['Đã làm xong', d.filter((r) => r['Trạng thái'] === 'Đã xong').length], ['Đang chờ', d.filter((r) => /Chờ|Đã phát hành/.test(r['Trạng thái'])).length]], them: (d) => bang2(dem(d.filter((r) => r['Trạng thái'] !== 'Khởi điểm'), (r) => r['Máy']), 'Máy', 'Mốc') });
  themBC({ k: 'kho/mayhong', ten: 'Máy hỏng, sửa chữa', nhom: 'Kho & tài sản', bang: 'MayHong', ngay: 'Ngày báo', cs: (d) => [['Lần hỏng', d.length], ['Đã sửa xong', d.filter((r) => r['Trạng thái'] === 'Đã sửa xong').length], ['Ngày máy nằm', cong(d, 'Số ngày nằm')], ['Chi phí sửa', tien(cong(d, 'Chi phí'))]], them: (d) => bang2(dem(d, (r) => r['Máy']), 'Máy', 'Lần') });
  themBC({ k: 'kubota', ten: 'Máy Kubota (lượt dùng)', nhom: 'Kho & tài sản', bang: 'KubotaLuot', cs: (d) => [['Lượt', d.length], ['Tổng giờ', so(cong(d, 'Số giờ'))], ['Dầu (lít)', so(cong(d, 'Dầu (lít)'))]], them: (d) => bang2(dem(d, (r) => r['Người']), 'Người dùng', 'Lượt') });
  themBC({ k: 'gopy', ten: 'Góp ý app', nhom: 'Quản lý', bang: 'GopY', ngay: 'Giờ', cs: (d) => [['Góp ý', d.length], ['Đã sửa', d.filter((r) => r['Trạng thái'] === 'Đã sửa').length], ['Còn mới', d.filter((r) => (r['Trạng thái'] || 'Mới') === 'Mới').length]], them: (d) => bang2(dem(d, (r) => r['Tên màn']), 'Màn', 'Góp ý') });
  themBC({ k: 'tuantra', ten: 'Tuần tra, kiểm tra', nhom: 'Quản lý', bang: 'TuanTra', cs: (d) => [['Lần', d.length]] });
  themBC({ k: 'chamdiem', ten: 'Chấm điểm chất lượng', nhom: 'Quản lý', bang: 'ChamDiem', cs: (d) => [['Lần chấm', d.length], ['Điểm TB', d.length ? so(cong(d, 'Điểm') / d.length) : '—']] });

  /* ======================================================================================
     134 · XEM DỮ LIỆU: mọi bảng đều lọc được (ngày, đội, người, vị trí, chữ), bấm dòng xem gốc + ảnh, xuất Excel
     ====================================================================================== */
  const BANG_XEM = [['GiaoViecNgay', 'Việc giao trong ngày', 'Ngày'], ['TickDinhKy', 'Việc định kỳ theo vị trí', 'Ngày'], ['NhatKyPhunBon', 'Nhật ký phun, bón', 'Ngày giờ'], ['DiemDanh', 'Điểm danh', 'Ngày'], ['Phieu', 'Phiếu giao việc', 'Giờ tạo'],
    ['ViecPhatSinh', 'Việc phát sinh', 'Ngày'], ['VanChuyen', 'Vận chuyển', 'Ngày'], ['Tuoi', 'Tưới nước', 'Ngày'], ['ViecHangNgay', 'Vệ sinh, nhổ cỏ', 'Ngày'], ['TienDoViec', 'Tiến độ việc nhiều ngày', 'Ngày'],
    ['SoTrongCay', 'Trồng cây', 'Ngày trồng'], ['DichHai', 'Dịch hại', 'Ngày phát hiện'], ['VeSinhBien', 'Vệ sinh bãi biển', 'Ngày'], ['MaySangCat', 'Máy sàng cát', 'Ngày'], ['KubotaLuot', 'Kubota', 'Ngày'],
    ['CayNoiThat', 'Cây nội thất', 'Ngày'], ['VuonRau', 'Vị Garden chăm sóc', 'Ngày'], ['ThuHoach', 'Thu hoạch Vị Garden', 'Ngày'], ['RacHuuCo', 'Rác hữu cơ', 'Ngày'], ['VuonUom', 'Vườn ươm cây bụi', 'Ngày'], ['VuonUomNoiThat', 'Vườn ươm nội thất', 'Ngày'],
    ['KhoGiaoDich', 'Kho: nhập, xuất', 'Ngày'], ['DungCu', 'Dụng cụ', 'Ngày giao'], ['DungCuLichSu', 'Lịch sử dụng cụ', 'Giờ'], ['KiemTraDC', 'Kiểm tra dụng cụ', 'Ngày giao'], ['BaoTriPH', 'Bảo trì máy', 'Ngày tạo'], ['MayHong', 'Máy hỏng', 'Ngày báo'],
    ['NgayLamViec', 'Bắt đầu, chốt ngày, kết thúc ca', 'Ngày'], ['DaoTao', 'Đào tạo', 'Ngày'], ['GopY', 'Góp ý app', 'Giờ']];
  const NB_XEM = /^(KhoGiaoDich|DungCu|DungCuLichSu|KiemTraDC|BaoTriPH|MayHong|CayNoiThat|VuonRau|ThuHoach|RacHuuCo|VeSinhBien|MaySangCat|VuonUomNoiThat|KubotaLuot|Phieu|GopY)$/;
  G._BANG_XEM = BANG_XEM;
  const duocXem = G._duocXem = (b) => { const p = API.BANG[b]; if (!p) return false; if (laNB() && !NB_XEM.test(b)) return false; if (/^(KhoGiaoDich|DungCu|DungCuLichSu|KiemTraDC|BaoTriPH|MayHong|CayNoiThat|VuonRau|ThuHoach|RacHuuCo|VeSinhBien|MaySangCat|VuonUomNoiThat)$/.test(b) && S.u.nhom === 'Quản lý nhà thầu') return false; return (S.u.quyen && (S.u.quyen[p[0]] || 0) >= 1) || laAnh(); };
  G.man.dulieu = { ten: 'Xem, lọc, xuất dữ liệu', bt: '🗂', ic: 'baocao', nhom: 'Quản lý', ph: 'homnay', fn: async (bang) => {
    const ds = BANG_XEM.filter((x) => duocXem(x[0])); const b = ds.find((x) => x[0] === bang) || null;
    const m = G.khung(b ? b[1] : 'Xem, lọc, xuất dữ liệu', b ? 'Lọc theo điều kiện · bấm dòng xem gốc, ảnh · xuất Excel' : 'Chọn loại dữ liệu', b ? '#/dulieu' : '#/baocao');
    if (!b) { m.innerHTML = `<div class="ds">${ds.map((x) => `<a class="muc" href="#/dulieu/${x[0]}" style="color:inherit"><div class="gian"><b>${esc(x[1])}</b></div>›</a>`).join('')}</div>`; return; }
    const st = G.man.dulieu.st && G.man.dulieu.st.b === b[0] ? G.man.dulieu.st : (G.man.dulieu.st = { b: b[0], tu: G.congNgay(hn(), -30), den: hn(), chu: '', cot: {} });
    const rows = (await G.doc(b[0], undefined, 20000).catch(() => [])); const c = b[2];
    const cot = [...new Set(rows.slice(0, 300).flatMap((r) => Object.keys(r)))].filter((k) => k && !/^_/.test(k));
    const loc = ['Đội', 'Người ghi', 'Người', 'Người tick', 'Người giữ', 'Trạng thái', 'Mã việc', 'Cụm', 'Loại', 'Máy', 'Giao cho', 'Nguồn'].filter((k) => cot.includes(k));
    const anhCot = cot.filter((k) => /Ảnh|Hóa đơn/.test(k));
    const hien = rows.filter((r) => { const n = String(r[c] || r['Ngày'] || '').slice(0, 10); if (n && (n < st.tu || n > st.den)) return false;
      if (Object.keys(st.cot).some((k) => st.cot[k] && String(r[k] || '') !== st.cot[k])) return false;
      return !st.chu || Object.values(r).join(' ').toLowerCase().includes(st.chu.toLowerCase()); }).reverse();
    const cotHien = cot.filter((k) => !anhCot.includes(k)).slice(0, 9);
    m.innerHTML = `<div class="the"><div class="hang" style="gap:8px;flex-wrap:wrap"><label class="o"><span>Từ ngày</span><input type="date" id="tu" value="${st.tu}"></label><label class="o"><span>Đến ngày</span><input type="date" id="den" value="${st.den}"></label>
      <label class="o gian"><span>Tìm chữ (vị trí, việc, tên…)</span><input id="chu" value="${esc(st.chu)}" placeholder="vd: Villa 25"></label></div>
      ${loc.map((k) => { const gt = [...new Set(rows.map((r) => r[k]).filter(Boolean))].slice(0, 40); return gt.length > 1 ? `<label class="o"><span>${esc(k)}</span><select data-cot="${esc(k)}"><option value="">Tất cả</option>${gt.map((v) => `<option ${st.cot[k] === v ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>` : ''; }).join('')}
      <div class="nhom-nut"><button class="nut chinh" id="loc">Lọc</button><button class="nut" id="xoa">Bỏ lọc</button><button class="nut" id="tai">⬇ Xuất Excel (${hien.length} dòng)</button></div></div>
      <p class="mo">${hien.length} dòng${hien.length > 300 ? ' · hiện 300 dòng đầu, xuất Excel để có đủ' : ''}</p>
      <div class="the cuon-ngang"><table class="bang"><tr>${cotHien.map((k) => `<th>${esc(k)}</th>`).join('')}${anhCot.length ? '<th>Ảnh</th>' : ''}</tr>${hien.slice(0, 300).map((r, i) => `<tr data-i="${i}" style="cursor:pointer">${cotHien.map((k) => `<td>${esc(String(r[k] == null ? '' : r[k]).slice(0, 60))}</td>`).join('')}${anhCot.length ? `<td>${anhCot.reduce((a, k) => a + API.dsAnh(r[k]).length, 0) || ''}</td>` : ''}</tr>`).join('')}</table></div>`;
    const lay = () => { st.tu = m.querySelector('#tu').value || st.tu; st.den = m.querySelector('#den').value || st.den; st.chu = m.querySelector('#chu').value.trim(); m.querySelectorAll('[data-cot]').forEach((s) => { st.cot[s.dataset.cot] = s.value; }); };
    m.querySelector('#loc').onclick = () => { lay(); G.taiLai(); }; m.querySelector('#chu').onkeydown = (e) => { if (e.key === 'Enter') { lay(); G.taiLai(); } };
    m.querySelector('#xoa').onclick = () => { G.man.dulieu.st = null; G.taiLai(); };
    m.querySelector('#tai').onclick = () => G.xuatChon({ ten: 'GreenLog_' + b[0] + '_' + st.tu + '_' + st.den, tieuDe: b[1] + ' · ' + G.ngayVN(st.tu) + ' → ' + G.ngayVN(st.den), cot: cot.filter((k) => !anhCot.includes(k)), dong: hien.map((r) => cot.filter((k) => !anhCot.includes(k)).map((k) => (r[k] == null ? '' : Array.isArray(r[k]) ? r[k].join(', ') : r[k]))), anh: (G.anhCua ? G.anhCua(hien) : []).map((a, i) => ({ ten: b[0] + '_' + (i + 1), url: a.url })) });
    m.querySelectorAll('[data-i]').forEach((tr) => { tr.onclick = () => { const r = hien[+tr.dataset.i];
      G.hop(b[1], `<table class="bang">${cot.filter((k) => !anhCot.includes(k) && r[k] !== '' && r[k] != null).map((k) => `<tr><th style="text-align:left;width:38%">${esc(k)}</th><td>${esc(String(r[k]))}</td></tr>`).join('')}</table>${anhCot.map((k) => (r[k] ? `<b>${esc(k)}</b>${G.xemAnh(r[k])}` : '')).join('')}<div class="nhom-nut" style="margin-top:10px"><button class="nut" data-ls="1">🕘 Lịch sử</button></div>`, (o) => { o.querySelector('[data-ls]').onclick = () => G.lichSuCua && G.lichSuCua(r, b[0]); }); }; });
  } };
  /* lối vào: Báo cáo → 🗂 Xem, lọc, xuất dữ liệu */
  const bc0 = G.man.baocao && G.man.baocao.fn;
  if (bc0) G.man.baocao.fn = async (loai, ...r) => { await bc0(loai, ...r); if (loai) return; const m = document.getElementById('noiDung'); if (m && !m.querySelector('.vao-dulieu')) m.insertAdjacentHTML('beforeend', `<a class="the-viec vao-dulieu" href="#/dulieu"><span class="gian"><b>🗂 Xem, lọc, xuất mọi dữ liệu</b><span class="mo"> · theo ngày, đội, người, vị trí</span></span>›</a>${laAnh() ? '<a class="the-viec" href="#/gopy"><span class="gian"><b>💡 Góp ý app</b></span>›</a>' : ''}`); };

  if (G.HD_TRO) Object.assign(G.HD_TRO, {
    gopy: { vi: ['Góp ý app', ['Bấm 💡 trên đầu màn đang thấy khó dùng.', 'App tự chụp màn hình đó, anh chị gõ hoặc nói một dòng rồi Gửi.', 'Trưởng bộ phận gom góp ý, sửa mỗi tuần.'], ''], en: ['App feedback', ['Tap 💡 at the top of the screen you find hard to use.', 'The app captures that screen; type or say one line, then Send.', 'The Landscape Manager collects feedback and fixes it weekly.'], ''] },
    dulieu: { vi: ['Xem, lọc, xuất dữ liệu', ['Chọn loại dữ liệu.', 'Chọn từ ngày, đến ngày, đội, người, gõ vị trí rồi bấm Lọc.', 'Bấm một dòng để xem đủ thông tin và ảnh.', 'Bấm Xuất Excel để tải đúng các dòng đang lọc.'], ''], en: ['View, filter, export data', ['Choose a data type.', 'Set dates, team, person or type a location, then Filter.', 'Tap a row to see all details and photos.', 'Tap Export to download the filtered rows.'], ''] },
    chotnam: { vi: ['Chốt năm kỳ công', ['Mỗi kỳ hiện công thực tế, công hợp đồng (gồm giám sát), chênh lệch.', 'Kỳ trước khi dùng app: bấm Nhập số, lấy từ file bảng công đã nghiệm thu.', 'Ngày 31/12 bấm Chốt năm: khóa điểm danh năm đó.'], 'Kỳ 20/12 → 19/01 tách đôi: 20–31/12 cho năm cũ (5 công giám sát), 01–19/01 cho năm mới (7 công giám sát).'], en: ['Year-end close of man-days', ['Each period shows actual, contract (incl. supervision) and variance.', 'For periods before the app, tap Enter figures from the accepted timesheet.', 'On 31/12 tap Close year: attendance for that year is locked.'], 'The 20/12 → 19/01 period is split: 20–31/12 to the old year (5 supervision days), 01–19/01 to the new year (7).'] },
    'kho/chiphi': { vi: ['Chi phí kho', ['Xem tiền Công ty mua và Trưởng bộ phận tự mua theo tháng.', 'Bấm Đề nghị hoàn tiền để chép danh sách món tự mua.'], ''], en: ['Store costs', ['See company purchases and Landscape Manager purchases by month.', 'Tap Reimbursement request to copy the list of self-paid items.'], ''] },
  });
  /* dữ liệu chạy thử 0.4.7: dụng cụ có nguồn, giá, hạn dùng; vài món trong kho chờ cấp; vật tư nhập có nguồn hàng */
  const seed47 = () => { if (!(API.thu && API.thu()) || !S.dm || localStorage.getItem('gl_va_047') || !localStorage.getItem('gl_va_046_kho')) return;
    try { const tb = (k) => JSON.parse(localStorage.getItem('gl_tb_' + k) || '[]'); const luu = (k, v) => localStorage.setItem('gl_tb_' + k, JSON.stringify(v)); const n = (d) => API.ngay(new Date(Date.now() - d * 864e5));
      const GIA = { 'Kéo cắt tỉa': 185000, 'Bình tưới 8 lít': 120000, 'Cào bãi biển': 95000, 'Ủng, găng bảo hộ': 160000, 'Cuốc': 140000, 'Xẻng': 130000, 'Thang nhôm 3 m': 1450000, 'Xe rùa': 980000, 'Cưa tay': 210000 };
      const dc = tb('DungCu'); dc.forEach((x, i) => { Object.assign(x, { 'Nguồn': i % 3 === 1 ? 'Trưởng bộ phận tự mua' : 'Công ty mua', 'Đơn giá': String(GIA[x['Tên']] || 100000), 'Ngày nhập': n(40), 'Hạn dùng (tháng)': /Ủng/.test(x['Tên']) ? '1' : '12', 'Ảnh nhập': '', 'Đã nhận': 'Có' }); });
      [['DC-12', 'Kéo cắt tỉa'], ['DC-13', 'Kéo cắt tỉa'], ['DC-14', 'Ủng, găng bảo hộ']].forEach(([m, t]) => dc.push({ 'Mã DC': m, 'Tên': t, 'Loại': 'Riêng', 'Người giữ': '', 'Ngày giao': '', 'Trạng thái': 'Trong kho', 'Ghi chú': '', 'Ảnh': '', 'Nguồn': 'Trưởng bộ phận tự mua', 'Đơn giá': String(GIA[t]), 'Ngày nhập': n(5), 'Hạn dùng (tháng)': '12', 'Ảnh nhập': '' }));
      luu('DungCu', dc); luu('DungCuLichSu', dc.map((x) => ({ 'Mã': 'LS-' + x['Mã DC'], 'Ngày': x['Ngày nhập'], 'Giờ': x['Ngày nhập'] + ' 08:00:00', 'Mã DC': x['Mã DC'], 'Tên': x['Tên'], 'Loại': 'Nhập kho', 'Người': 'Lê Vũ', 'Ảnh': '', 'Giá trị': x['Đơn giá'], 'Ghi chú': x['Nguồn'] })));
      const gd = tb('KhoGiaoDich'); gd.forEach((x, i) => { if (x['Loại'] === 'Nhập') { const g = [65000, 90000, 12000, 1500, 24000, 110000, 15000, 70000, 85000, 18000][i % 10]; Object.assign(x, { 'Nguồn': i % 2 ? 'Trưởng bộ phận tự mua' : 'Công ty mua', 'Đơn giá': String(g), 'Thành tiền': String(Math.round(num(x['Số lượng']) * g)) }); } }); luu('KhoGiaoDich', gd);
      localStorage.setItem('gl_va_047', '1'); } catch (e) { console.warn(e); } };
  /* nút 💡 trên đầu mọi màn (cạnh 🔍) */
  const khung47 = G.khung;
  G.khung = function (...a) { try { seed47(); } catch (e) { /* bỏ qua */ } const m = khung47.apply(this, a); try { setTimeout(() => { const dau = document.querySelector('header.dau'); if (dau && S.u && !dau.querySelector('.nut-gy')) { const b = G.h('<button class="nut-tron nut-gy" title="Góp ý app" aria-label="Góp ý app">💡</button>'); b.onclick = () => G.moGopY(); const t = dau.querySelector('.nut-tim'); if (t) t.insertAdjacentElement('beforebegin', b); else { const hd = dau.querySelector('.nut-hd') || dau.lastElementChild; if (hd) hd.insertAdjacentElement('beforebegin', b); else dau.appendChild(b); } } }, 20); } catch (e) { /* bỏ qua */ } return m; };
})();
