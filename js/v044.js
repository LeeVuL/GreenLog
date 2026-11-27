/* GreenLog 0.4.5 – mục 93–100
   93/95 Hôm nay của tổ trưởng: trạng thái mỗi việc chạy theo dữ liệu thật; chạm việc mở đúng màn ghi; bỏ "+ Phát sinh" từng dòng;
         nút rõ chữ (Ghi · ✓ Xong · ▶ Bắt đầu); vị trí dài được rút gọn.
   94   Đồng hồ nước: điền sẵn số lần trước · Hôm nay không bơm · Đồng hồ hỏng (tạo phiếu) · Lắp lại / thay mới; không ước tính ngày hỏng.
   98   Phiếu giao việc có mục "Chăm sóc cây bên trong villa": vị trí chỉ Villa 01, 55–80; báo xong tự tick việc định kỳ.
   99   Hai nhân viên nội bộ: việc riêng (bãi biển → Hiệp, phân hữu cơ → Nghị), việc chung đếm một lần; người nghỉ thì việc chuyển người còn lại.
   100  Bón phân cỏ (Thìn) / cây bụi (Trường): đánh dấu xong thì hỏi một lần loại phân + số kg, tự ghi nhật ký bón phân. */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay, bao } = G;
  const hn = () => API.ngay();
  const gio = () => API.bayGio().slice(11, 16);
  Object.assign(API.BANG, { NghiNoiBo: ['homnay', 2] });

  /* =========================== 94: ĐỒNG HỒ NƯỚC =========================== */
  /* lượng dùng theo ngày: bỏ ngày hỏng (không có số liệu), "thay mới" bắt đầu lại từ chỉ số mới, "không bơm" = 0 */
  G.dungNuoc = (rows) => {
    const r = rows.slice().sort((a, b) => (a['Ngày'] < b['Ngày'] ? -1 : 1)); const o = {}; let truoc = null;
    r.forEach((x) => { const tt = x['Trạng thái'] || ''; const v = +x['Chỉ số'];
      if (tt === 'Hỏng' || x['Chỉ số'] === '' || x['Chỉ số'] == null || isNaN(v)) return;
      if (tt === 'Thay mới') { truoc = v; return; }
      if (truoc != null) o[x['Ngày']] = tt === 'Không bơm' ? 0 : Math.max(0, Math.round((v - truoc) * 100) / 100);
      truoc = v; });
    return o;
  };
  G.ngayHongNuoc = (rows) => rows.filter((x) => x['Trạng thái'] === 'Hỏng').map((x) => x['Ngày']);
  const diem = (l) => (S.dm.diemkhac || []).filter((x) => x.loai === l);
  G.man.donghonuoc.fn = async () => {
    const m = G.khung('Đồng hồ nước', 'Đọc hằng ngày, có ảnh', '#/viec');
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'DongHoNuoc', loc: { 'Ngày': { tu: G.congNgay(hn(), -40) } } }] })).DongHoNuoc;
    const ghi = G.q('donghonuoc') >= 2;
    const cuoi = (ma) => ds.filter((x) => x['Mã đồng hồ'] === ma && x['Chỉ số'] !== '' && x['Trạng thái'] !== 'Hỏng').sort((a, b) => (a['Ngày'] < b['Ngày'] ? 1 : -1))[0];
    m.innerHTML = diem('Đồng hồ nước').map((d) => {
      const r = ds.filter((x) => x['Mã đồng hồ'] === d.ma).sort((a, b) => (a['Ngày'] < b['Ngày'] ? 1 : -1)); const dung = G.dungNuoc(r);
      const hom = r.find((x) => x['Ngày'] === hn()); const hong = r.find((x) => x['Trạng thái'] === 'Hỏng') && !r.some((x) => x['Trạng thái'] === 'Thay mới' && x['Ngày'] >= r.find((y) => y['Trạng thái'] === 'Hỏng')['Ngày']);
      const chip = !hom ? '<span class="chip cam">Chưa đọc</span>' : hom['Trạng thái'] === 'Không bơm' ? '<span class="chip">Hôm nay không bơm</span>' : hom['Trạng thái'] === 'Hỏng' ? '<span class="chip do">Đồng hồ hỏng</span>' : '<span class="chip xanh">Đã đọc hôm nay</span>';
      const o = (x) => (x['Trạng thái'] === 'Hỏng' ? '<span style="color:var(--do)">hỏng · không có số liệu</span>' : x['Trạng thái'] === 'Thay mới' ? 'lắp mới, bắt đầu' : x['Trạng thái'] === 'Không bơm' ? '0 (không bơm)' : dung[x['Ngày']] != null ? G.so(dung[x['Ngày']], 2) : '');
      return `<div class="the"><div class="hang"><h3 class="gian">${esc(d.ten)}</h3>${chip}</div>
        <table class="bang" style="margin:8px 0"><tr><th>Ngày</th><th>Chỉ số</th><th>Dùng (m³)</th></tr>${r.slice(0, 7).map((x) => `<tr><td>${G.ngayVN(x['Ngày'])}</td><td>${x['Chỉ số'] !== '' && x['Chỉ số'] != null ? G.so(x['Chỉ số'], 2) : '—'}</td><td>${o(x)}</td></tr>`).join('')}</table>
        ${ghi ? `<div class="nhom-nut"><button class="nut chinh" data-d="${d.ma}">Ghi chỉ số hôm nay</button><button class="nut" data-kb="${d.ma}">⛔ Hôm nay không bơm</button></div>
          <div class="nhom-nut" style="margin-top:6px"><button class="nut nho" data-hong="${d.ma}">⚠ Đồng hồ hỏng</button><button class="nut nho" data-moi="${d.ma}">🔧 Lắp lại / thay mới</button></div>${hong ? '<div class="mo" style="margin-top:6px;color:var(--do)">Đồng hồ đang báo hỏng. Sửa xong bấm Lắp lại / thay mới.</div>' : ''}` : ''}</div>`;
    }).join('');
    const ten = (ma) => diem('Đồng hồ nước').find((x) => x.ma === ma).ten;
    const luu = (ma, dong) => API.goi('ghiNhieu', { bang: 'DongHoNuoc', thay: ['Ngày', 'Mã đồng hồ'], dong: [Object.assign({ 'Ngày': hn(), 'Mã đồng hồ': ma, 'Người đọc': '', 'Trạng thái': '' }, dong)] });
    m.querySelectorAll('[data-d]').forEach((b) => { b.onclick = () => { const c = cuoi(b.dataset.d);
      G.hop('Chỉ số ' + ten(b.dataset.d), `${c ? `<p class="mo" style="margin-top:0">Lần trước ${G.ngayVN(c['Ngày'])}: <b>${G.so(c['Chỉ số'], 2)}</b>. Ô đã điền sẵn số này, chỉ sửa mấy số cuối.</p>` : ''}<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>`, (o, dong) => {
        const lay = G.form(o.querySelector('#f'), [{ k: 'Chỉ số', nhan: 'Chỉ số (m³)', loai: 'so', bb: true, gt: c ? c['Chỉ số'] : '' }, { k: 'Ảnh', nhan: 'Ảnh mặt đồng hồ', loai: 'anh', bb: true, toiDa: 2 }]);
        o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay();
          if (c && +v['Chỉ số'] < +c['Chỉ số'] && !(await G.xacNhan(`Chỉ số nhỏ hơn lần trước (${c['Chỉ số']}). Nếu vừa thay đồng hồ, bấm Lắp lại / thay mới. Vẫn lưu?`, 'Vẫn lưu'))) return;
          await luu(b.dataset.d, v); dong(); bao('Đã lưu'); G.taiLai(); }, e.target); }); }; });
    m.querySelectorAll('[data-kb]').forEach((b) => { b.onclick = () => chay(async () => { const c = cuoi(b.dataset.kb);
      await luu(b.dataset.kb, { 'Chỉ số': c ? c['Chỉ số'] : '', 'Trạng thái': 'Không bơm', 'Ảnh': '' }); bao('Đã ghi: hôm nay không bơm · dùng 0 m³'); G.taiLai(); }, b); });
    m.querySelectorAll('[data-hong]').forEach((b) => { b.onclick = () => G.hop('⚠ ' + ten(b.dataset.hong) + ' hỏng', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu, báo Trưởng bộ phận</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'anh', nhan: 'Ảnh mặt đồng hồ', loai: 'anh', bb: true, toiDa: 2 }, { k: 'gc', nhan: 'Mô tả (kim không chạy, vỡ mặt, rò nước…)', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay();
        await luu(b.dataset.hong, { 'Chỉ số': '', 'Trạng thái': 'Hỏng', 'Ảnh': v.anh, 'Ghi chú': v.gc || '' });
        await API.goi('phieu.tao', { loaiPhieu: 'Lỗi', nguon: 'Đồng hồ nước', nhom: 'Hệ thống tưới', loai: 'Sửa / thay đồng hồ nước', muc: 'Cao', vtKhac: ten(b.dataset.hong), moTa: 'Đồng hồ ' + ten(b.dataset.hong) + ' hỏng. ' + (v.gc || '') + ' Chuyển Engineering.', giao: '', anh: v.anh }).catch(() => {});
        dong(); bao('Đã ghi hỏng · tạo phiếu sửa đồng hồ'); G.taiLai(); }, e.target); }); });
    m.querySelectorAll('[data-moi]').forEach((b) => { b.onclick = () => G.hop('🔧 Lắp lại / thay mới · ' + ten(b.dataset.moi), '<p class="mo" style="margin-top:0">Nhập chỉ số đồng hồ lúc lắp xong. Lần đọc sau tính từ số này.</p><div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'Chỉ số', nhan: 'Chỉ số bắt đầu (m³)', loai: 'so', bb: true }, { k: 'Ảnh', nhan: 'Ảnh mặt đồng hồ', loai: 'anh', bb: true, toiDa: 2 }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await luu(b.dataset.moi, Object.assign(v, { 'Trạng thái': 'Thay mới' })); dong(); bao('Đã ghi chỉ số bắt đầu'); G.taiLai(); }, e.target); }); });
  };

  /* =========================== 93/95: HÔM NAY CỦA TỔ TRƯỞNG =========================== */
  const LINK_HN = { DV10: 'cum/DV10', DV11: 'cum/DV11', DV09: 'tuoi', DV17: 'vuonuom', DV12: 'donghonuoc', CN04: 'vanchuyen' };
  const rutGon = (t) => { const p = String(t || '').split(' · '); return p.length > 3 ? p.slice(0, 3).join(' · ') + ` +${p.length - 3} khu` : t; };
  G.viecTT = async (gv) => {
    const [tt, dang, ph] = await Promise.all([G.trangThaiHomNay().catch(() => ({})), G.doc('TickDinhKy', { 'Trạng thái': 'Đang làm' }).catch(() => []), G.doc('Phieu', {}).catch(() => [])]);
    const cumAll = new Set(S.dm.vitri.filter((v) => v.ap === 'Có').map((v) => v.cum)); const vtAll = S.dm.vitri.filter((v) => v.ap === 'Có').length;
    const out = [];
    for (const g of gv) {
      const nguon = String(g['Mã nguồn'] || ''); const nguoi = String(g['Người'] || '').split(', ').filter(Boolean).length;
      let link = ''; let tien = ''; let suy = ''; let thuCong = false; let ma = '';
      if (/^HN:/.test(nguon) && LINK_HN[nguon.split(':')[1]]) { ma = nguon.split(':')[1]; link = LINK_HN[ma] || ''; const x = tt[link];
        if (x) { const ds = x.ds || [];
          if (ma === 'DV10' || ma === 'DV11') { const n = new Set(ds.map((r) => r['Cụm'])).size; tien = `${n}/${cumAll.size} cụm`; suy = n >= cumAll.size ? 'xong' : 'dang'; }
          else if (ma === 'DV09') { const n = new Set(ds.map((r) => r['Mã vị trí'])).size; tien = `${n}/${vtAll} vị trí`; suy = n >= vtAll ? 'xong' : 'dang'; }
          else if (ma === 'DV12') { const n = new Set(ds.map((r) => r['Mã đồng hồ'])).size; tien = `${n}/2 đồng hồ`; suy = n >= 2 ? 'xong' : 'dang'; }
          else if (ma === 'DV17') { tien = (G.klViec ? G.klViec(link, ds) : '') || 'đã ghi'; suy = 'xong'; }
          else { tien = (G.klViec ? G.klViec(link, ds) : '') || ds.length + ' lần ghi'; suy = 'dang'; }
          const na = G.anhCua ? G.anhCua(ds).length : 0; if (na) tien += ' · 📷 ' + na; } }
      else if (/^DK:/.test(nguon) && g['Mã vị trí']) { ma = nguon.slice(3); link = 'dinhky/' + ma; const vt = String(g['Mã vị trí']).split('|').filter(Boolean);
        const con = vt.filter((v) => dang.some((r) => r['Mã việc'] === ma && r['Mã vị trí'] === v)); tien = `${vt.length - con.length}/${vt.length} vị trí xong`; suy = con.length ? 'dang' : 'xong'; g._con = con; }
      else if (/^P:/.test(nguon)) { const p = ph.find((y) => y['Mã phiếu'] === nguon.slice(2)); link = 'phieu/' + nguon.slice(2);
        if (p) { suy = /Báo xong|Đã duyệt/.test(p['Trạng thái']) ? 'xong' : /Đang/.test(p['Trạng thái']) ? 'dang' : ''; tien = p['Trạng thái']; } }
      else if (/^DM:/.test(nguon)) { const [, , k, vk] = nguon.split(':'); link = 'dot/' + (G.DOT_MUA && G.DOT_MUA.bao && G.DOT_MUA.bao.viec.some((v) => v.k === vk) ? 'bao/' + vk : 'luoi/luoi'); thuCong = true; }
      else thuCong = true;
      const luu = g['Trạng thái'] === 'Xong' ? 'xong' : g['Trạng thái'] === 'Đang làm' ? 'dang' : 'chua';
      const t = luu === 'xong' ? 'xong' : suy || luu;
      if (!thuCong && suy && suy !== luu) API.goi('sua', { bang: 'GiaoViecNgay', khoa: { 'Mã': g['Mã'] }, doi: { 'Trạng thái': suy === 'xong' ? 'Xong' : 'Đang làm', 'Giờ cập nhật': API.bayGio() } }).catch(() => {});
      out.push({ tt2: true, ten: g['Nội dung'], ma: g['Mã'], tt: t, link, thuCong, maViec: ma, con: g._con || [], tien, phu: [rutGon(g['Vị trí']), tien, nguoi ? nguoi + ' người' : ''].filter(Boolean).join(' · ') });
    }
    return out;
  };
  G.dongTT = (x) => { const ic = x.tt === 'xong' ? '✅' : x.tt === 'dang' ? '◐' : '⬜';
    const nut = x.tt === 'xong' ? '' : x.thuCong ? `<button class="nut nho ${x.tt === 'dang' ? 'chinh' : ''}" data-tt="${esc(x.ma)}">${x.tt === 'dang' ? '✓ Xong' : '▶ Bắt đầu'}</button>`
      : x.tt === 'dang' && (x.maViec && /^DV0|DV3|DV4/.test(x.maViec) && x.con.length) ? `<button class="nut nho chinh" data-xvt2="${esc(x.ma)}">✓ Xong vị trí</button>`
        : x.tt === 'dang' && x.maViec === 'CN04' ? `<button class="nut nho" data-ghi="${esc(x.link)}">＋ Ghi</button><button class="nut nho chinh" data-tt="${esc(x.ma)}">✓ Xong</button>`
          : x.link ? `<button class="nut nho ${x.tt === 'chua' ? 'chinh' : ''}" data-ghi="${esc(x.link)}">Ghi ›</button>` : '';
    return `<div class="the-viec dong-tt" data-mo="${esc(x.ma)}" style="cursor:pointer"><span class="bt">${ic}</span><span class="gian"><b>${esc(x.ten)}</b><span class="mo">${esc(x.phu)}</span></span><span class="nhom-nut" style="flex:none;gap:6px">${nut}</span></div>`; };
  G.ganTT = (m, gv, viec) => {
    m.querySelectorAll('[data-ps]').forEach((b) => b.remove());
    m.querySelectorAll('.dong-tt').forEach((el) => { const x = viec.find((y) => y.ma === el.dataset.mo); if (!x) return;
      el.onclick = (e) => { if (e.target.closest('button')) return; if (x.link) { location.hash = '#/' + x.link; return; }
        const g = gv.find((y) => y['Mã'] === x.ma); const ng = String(g['Người'] || '').split(', ').filter(Boolean);
        G.hop(g['Nội dung'], `${g['Vị trí'] ? `<p><b>📍 Vị trí:</b> ${esc(g['Vị trí'])}</p>` : ''}<p><b>👥 Người (${ng.length}):</b></p><div class="chon boc">${ng.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>`); }; });
    m.querySelectorAll('[data-ghi]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); location.hash = '#/' + b.dataset.ghi; }; });
    m.querySelectorAll('[data-tt]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); const x = viec.find((y) => y.ma === b.dataset.tt);
      chay(async () => { await API.goi('sua', { bang: 'GiaoViecNgay', khoa: { 'Mã': x.ma }, doi: { 'Trạng thái': x.tt === 'dang' ? 'Xong' : 'Đang làm', 'Giờ cập nhật': API.bayGio() } }); G.taiLai(); }, b); }; });
    m.querySelectorAll('[data-xvt2]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); const x = viec.find((y) => y.ma === b.dataset.xvt2); G.xongViTriDK(x.maViec, x.con, () => G.taiLai()); }; });
  };

  /* =========================== 98: PHIẾU "CHĂM SÓC CÂY BÊN TRONG VILLA" =========================== */
  const LOI_VILLA = 'Chăm sóc cây bên trong villa';
  const bsGoc = G.boSungDM;
  G.boSungDM = async (...a) => { const r = bsGoc ? await bsGoc(...a) : undefined; const d = S.dm;
    if (d && d.loi && !d.loi.some((l) => l.ten === LOI_VILLA)) d.loi.unshift({ nhom: 'Chăm sóc cây', ten: LOI_VILLA, muc: 'Cao' }); return r; };
  let laVilla = false; let lyDoThem = '';
  const tpGoc = G.taoPhieu; G.taoPhieu = function (...a) { laVilla = false; lyDoThem = ''; return tpGoc.apply(this, a); };
  const clGoc = G.chonLoi; G.chonLoi = async (...a) => { const r = await clGoc(...a); if (r) { laVilla = r.ten === LOI_VILLA;
    if (laVilla) setTimeout(() => { const b = document.querySelector('.lop-phu #giao [data-v="Đội khu vực"]') || [...document.querySelectorAll('.lop-phu #giao button')].find((x) => x.textContent.trim() === 'Đội khu vực'); if (b && !b.classList.contains('dang')) b.click();
      const anh = document.querySelector('.lop-phu #anh'); const o = anh && anh.closest('.o'); if (o) { o.hidden = true; o.dispatchEvent(new Event('gl-doi', { bubbles: true })); } // phiếu ghi nhận: Trưởng bộ phận ở văn phòng, ảnh do tổ trưởng chụp lúc báo xong
    }, 50); else { const anh = document.querySelector('.lop-phu #anh'); const o = anh && anh.closest('.o'); if (o && o.hidden) { o.hidden = false; o.dispatchEvent(new Event('gl-doi', { bubbles: true })); } } } return r; };
  const cvGoc = G.chonViTri;
  G.chonViTri = async (opt) => {
    if (!laVilla || (opt && opt.ds)) return cvGoc(opt);
    const tk = await G.doc('TickDinhKy', { 'Kỳ': S.dm.ky.ten, 'Mã việc': 'DV42' }).catch(() => []);
    const lan = (v) => tk.filter((x) => x['Mã vị trí'] === v && (x['Trạng thái'] || 'Xong') === 'Xong');
    const r = await cvGoc({ ds: G.VILLA_TRONG(), coMat: false, trangThai: (v) => { const n = lan(v); return n.length ? { cls: 'xong', sub: '✓ ' + n.length + ' lần · ' + G.ngayVN(n[n.length - 1]['Ngày']).slice(0, 5) } : { cls: '' }; } });
    if (r && r.ma && !r.nhieu && lan(r.ma).length) { const x = await G.chonDS('Căn này đã chăm trong kỳ. Chăm thêm vì:', ['Khách yêu cầu', 'Khách mới nhận phòng', 'Cây xấu lại', 'Khác']); if (!x) return null; lyDoThem = x.ten; }
    if (r && r.nhieu && r.nhieu.length > 1) { bao('Mỗi phiếu một căn: đã chọn ' + G.vt(r.nhieu[0]).kv); return Object.assign({}, G.vt(r.nhieu[0]), { ma: r.nhieu[0], ten: G.vt(r.nhieu[0]).kv, phu: '' }); }
    return r && r.ma ? Object.assign(r, { ten: (G.vt(r.ma) || {}).kv || r.ten, phu: '' }) : r;
  };
  const goi = API.goi;
  API.goi = async (act, r, ...x) => {
    /* 100: bón phân cỏ / cây bụi → hỏi loại phân + số kg một lần cho cả lượt, tự ghi nhật ký bón phân */
    let phan = null;
    if (act === 'dinhKy.luu' && r && (r.viec === 'DV02' || r.viec === 'DV03') && r.trangThai !== 'Đang làm' && !r.daPhan && !r.maNK && !r.maDH && r.anh && r.anh.length) { phan = await hoiPhan(r.viec, r.ds.length); if (!phan) throw new Error('Chưa ghi lượng phân'); }
    const kq = await goi(act, r, ...x);
    try {
      if (phan) { const nk = await goi('ghi', { bang: 'NhatKyPhunBon', dong: { 'Mã NK': '', 'Ngày giờ': API.bayGio().slice(0, 16), 'Loại (Phun thuốc/Phun phân bón lá/Bón gốc)': 'Bón gốc', 'Nhóm cây': r.viec === 'DV02' ? 'Cỏ' : 'Cây bụi',
        'Cụm': [...new Set(r.ds.map((d) => (G.vt(d.vt) || {}).cum))].join(', '), 'Mã vị trí': r.ds.map((d) => d.vt).join(' | '), 'Vị trí chi tiết': G.tenVT(r.ds.map((d) => d.vt).join('|')), 'Ảnh': r.anh, 'Ghi chú': 'Tự ghi khi xong ' + G.dvTen(r.viec), 'Người ghi': '' } });
        await goi('ghiNhieu', { bang: 'NhatKyPhunBonChiTiet', dong: [{ 'Mã NK': nk['Mã NK'], 'STT': 1, 'Sản phẩm': phan.sp, 'ĐVT': 'kg', 'Tổng lượng': phan.kg }] }); bao(`Đã ghi ${phan.kg} kg ${phan.sp}`); }
      if (act === 'phieu.tao' && r && r.loai === LOI_VILLA) { const g = gio() < '15:00' ? hn() + ' 17:00' : API.bayGio().slice(0, 11) + String(+gio().slice(0, 2) + 2).padStart(2, '0') + ':' + gio().slice(3);
        await goi('sua', { bang: 'Phieu', khoa: { 'Mã phiếu': kq.ma }, doi: { 'Hạn': g, 'Lý do làm thêm': lyDoThem } }); }
    } catch (e) { /* bỏ qua */ }
    return kq;
  };
  const hoiPhan = (viec, n) => new Promise((ok) => {
    const ds = (S.dm.thuoc || []).filter((t) => /phân/i.test((t.nhom || '') + ' ' + t.ten) && !/lá|hữu cơ/i.test(t.nhom || '')).map((t) => t.tenNgan || t.ten);
    const cu = API.LS.get('phan_' + viec, ''); let xong = false;
    G.hop('Lượng phân đã dùng · ' + G.dvTen(viec), `<p class="mo" style="margin-top:0">${n} vị trí. Ghi một lần cho cả lượt này.</p><div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>`, (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'sp', nhan: 'Loại phân', loai: 'chonds', ds, bb: true, gt: cu || '' }, { k: 'dv', nhan: 'Đơn vị', loai: 'chips', ds: ['Bao (25 kg)', 'kg'], gt: 'Bao (25 kg)', bb: true }, { k: 'sl', nhan: 'Số lượng', loai: 'so', bb: true }]);
      o.querySelector('#l').onclick = () => { try { const v = lay(); const sp = v.sp.ten || v.sp; const kg = /Bao/.test(v.dv) ? +v.sl * 25 : +v.sl; if (!(kg > 0)) throw new Error('Nhập số lượng'); API.LS.set('phan_' + viec, sp); xong = true; dong(); ok({ sp, kg }); } catch (e) { bao(e.message, true); } };
    });
    const kt = setInterval(() => { if (!document.querySelector('.lop-phu #f')) { clearInterval(kt); if (!xong) ok(null); } }, 400);
  });

  /* =========================== 99: HAI NHÂN VIÊN NỘI BỘ =========================== */
  const CHU = { 'nb/bien': 'Hiệp', 'nb/compost': 'Nghị', 'nb/rac': 'Nghị' };
  const nb2 = () => (S.dm.nguoi || []).filter((n) => n.nhom === 'Nhân viên nội bộ').map((n) => n.ten);
  const tenDu = (ngan) => nb2().find((t) => t.split(' ').pop() === ngan) || ngan;
  G.nghiNB = async (ngay) => (await G.doc('NghiNoiBo', { 'Ngày': ngay || hn() }).catch(() => [])).map((x) => x['Người']);
  const vnbGoc = G.viecNoiBo;
  G.viecNoiBo = async (ngay, tt) => {
    const ds = await vnbGoc(ngay, tt); if (S.u.nhom !== 'Nhân viên nội bộ') return ds;
    const nghi = await G.nghiNB(ngay); const toi = S.u.ten.split(' ').pop();
    return ds.filter((x) => { const c = (G.CHU_NB || CHU)[x.link]; if (!c || c === toi) return true; return nghi.includes(tenDu(c)); })
      .map((x) => { const c = (G.CHU_NB || CHU)[x.link]; if (c && c !== toi) x.phu = ('làm thay ' + c + (x.phu ? ' · ' + x.phu : '')); return x; });
  };
  /* thẻ "ai nghỉ hôm nay" trên Hôm nay của nội bộ và chuông 09:00 */
  const hnGoc = G.manHomNayMoi;
  G.manHomNayMoi = async (...a) => { await hnGoc(...a); if (S.u.nhom !== 'Nhân viên nội bộ') return; const m = document.getElementById('noiDung'); if (!m || m.querySelector('.the-nghi')) return;
    const nghi = await G.nghiNB(); const ban = nb2().filter((t) => t !== S.u.ten); if (m.querySelector('.the-nghi')) return;
    m.querySelector('.chao') && m.querySelector('.chao').insertAdjacentHTML('afterend', `<div class="the the-nghi hang" style="flex-wrap:wrap;gap:8px"><b class="gian">Hôm nay: ${ban.map((t) => `${esc(t.split(' ').pop())} ${nghi.includes(t) ? '<span class="chip cam">nghỉ</span>' : '<span class="chip xanh">đi làm</span>'}`).join(' ')}</b>
      ${ban.map((t) => `<button class="nut nho" data-nghi="${esc(t)}">${nghi.includes(t) ? esc(t.split(' ').pop()) + ' đi làm lại' : esc(t.split(' ').pop()) + ' nghỉ, tôi làm thay'}</button>`).join('')}</div>`);
    m.querySelectorAll('[data-nghi]').forEach((b) => { b.onclick = () => chay(async () => { const t = b.dataset.nghi;
      if (nghi.includes(t)) await API.goi('xoa', { bang: 'NghiNoiBo', khoa: { 'Ngày': hn(), 'Người': t } }); else await API.goi('ghi', { bang: 'NghiNoiBo', dong: { 'Ngày': hn(), 'Người': t, 'Người ghi': '' } });
      bao(nghi.includes(t) ? 'Đã bỏ nghỉ' : 'Đã nhận làm thay · việc của ' + t.split(' ').pop() + ' đã chuyển sang bạn'); G.taiLai(); }, b); }); };
  const chuong = G.dsChuong;
  G.dsChuong = async () => { const out = await chuong(); try {
    if (S.u.nhom !== 'Nhân viên nội bộ' || gio() < '09:00') return out; const nghi = await G.nghiNB(); const ban = nb2().filter((t) => t !== S.u.ten && !nghi.includes(t));
    if (!ban.length) return out; const tt = await G.trangThaiHomNay().catch(() => ({}));
    ban.forEach((t) => { const co = Object.values(tt).some((x) => String(x.ai || '').includes(t.split(' ').pop())); if (!co) out.push({ ten: `Hôm nay ${t.split(' ').pop()} nghỉ?`, phu: 'Chưa thấy ghi việc nào · bấm để nhận làm thay', link: '' }); });
  } catch (e) { /* bỏ qua */ } return out; };
})();
