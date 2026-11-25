/* GreenLog · Kết thúc ca cho nhân viên nội bộ (mục 62) · ca kết thúc 17:30 */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay, bao } = G;
  const hn = () => API.ngay(); const gioNay = () => API.bayGio().slice(11, 16);
  const GIO_CA = '17:30';
  const LY_CHUNG = ['Ưu tiên việc khác', 'Thiếu người', 'Khác'];
  const LY_VIEC = { 'nb/bien': ['Mưa', 'Bãi biển nhiều rác', 'Triều cao'], 'nb/ktbien': ['Mưa', 'Triều cao'], 'nb/may': ['Mưa, cát ướt', 'Máy hỏng', 'Hết nhiên liệu', 'Khách đông trên bãi'],
    'nb/vuonrau': ['Mưa', 'Thiếu vật tư'], 'nb/noithat': ['Khu vực có khách / sự kiện', 'Thiếu phân, vật tư'], 'nb/vuonuomnt': ['Mưa', 'Thiếu vật tư'], 'nb/rac': ['Bếp, bar không có rác', 'Xe hỏng'] };
  const LY_DO = (link) => (LY_VIEC[link] || ['Mưa', 'Thiếu vật tư']).concat(LY_CHUNG);
  const json = (s, d) => { try { return JSON.parse(s || ''); } catch (e) { return d; } };
  const CO_DINH = [['nb/bien', 'Vệ sinh bãi biển'], ['nb/ktbien', 'Kiểm tra bãi biển'], ['nb/may', 'Vận hành máy sàng cát'], ['nb/vuonrau', 'Chăm sóc Vị Garden'],
    ['nb/noithat', 'Cây nội thất'], ['nb/vuonuomnt', 'Vườn ươm nội thất'], ['nb/rac', 'Thu gom rau củ làm compost']];

  /* danh sách việc trong ngày của nội bộ: cố định + lịch + làm tiếp từ hôm trước + phiếu, setup, cây bất thường */
  G.viecNoiBo = async (ngay, tt) => {
    ngay = ngay || hn(); tt = tt || (ngay === hn() ? await G.trangThaiHomNay().catch(() => ({})) : {});
    const [gv, hv, d] = await Promise.all([G.doc('GiaoViecNgay', { 'Ngày': ngay, 'Đội': 'Nội bộ' }), G.doc('HoanViec', { 'Ngày làm bù': ngay, 'Đội': 'Nội bộ' }), G.docNhieu([{ bang: 'Phieu', gioiHan: 500 }, { bang: 'BatThuong', gioiHan: 300 }])]);
    const dang = (l) => gv.find((g) => g['Mã nguồn'] === l);
    const ds = CO_DINH.concat(G.lichNoiBo(new Date(ngay)).map((x) => ['nb/hangrao', x[1]])).map(([l, t]) => {
      const x = tt[l]; const g = dang(l);
      const kl = x && G.klViec ? G.klViec(l, x.ds) : ''; const na = x && G.anhCua ? G.anhCua(x.ds).length : 0;
      return { ten: t, link: l, kl, na, tt: x ? 'xong' : g ? 'dang' : 'chua', phu: x ? `✓ ${x.gio} ${x.ai}${kl ? ' · ' + kl : ''}${na ? ' · 📷 ' + na : ''}` : g ? `◐ bắt đầu ${String(g['Giờ'] || '').slice(11, 16)} · ${g['Người'] || ''}` : '', ai: x ? x.ai : g ? g['Người'] : '', gio: x ? x.gio : '' };
    });
    hv.forEach((h) => { if (!ds.some((x) => x.ten === h['Việc'])) ds.push({ ten: h['Việc'], link: h['Liên kết'] || 'viec', tt: 'chua', phu: '↺ Làm tiếp từ ' + G.ngayVN(h['Ngày']).slice(0, 5) + ' · ' + (h['Lý do'] || '') }); });
    (d.Phieu || []).filter((p) => (p['Giao cho'] === 'Nội bộ' || p['Loại'] === 'Setup cây nội thất') && !/Đã duyệt|Báo xong/.test(p['Trạng thái'])).forEach((p) => ds.push({ ten: '🎫 ' + (p['Mô tả'] || p['Loại lỗi'] || p['Loại'] || ''), link: p['Loại'] === 'Setup cây nội thất' ? 'nb/noithat' : 'phieu', tt: /Báo xong/.test(p['Trạng thái']) ? 'xong' : /Đang/.test(p['Trạng thái']) ? 'dang' : 'chua', phu: p['Trạng thái'] === 'Bị trả lại' ? '↺ Trưởng bộ phận yêu cầu làm lại' + (p['Yêu cầu làm lại'] ? ': ' + p['Yêu cầu làm lại'] : '') : p['Mã phiếu'] + ' · ' + p['Trạng thái'] }));
    [].filter(() => false).forEach((x) => ds.push({ ten: '🥀 ' + x['Tên cây'] + ' · ' + x['Tình trạng'], link: 'batthuong/' + encodeURIComponent(G.maBT ? G.maBT(x) : ''), tt: 'dang', phu: 'Đang trao đổi với Trưởng bộ phận' }));
    return ds;
  };
  G.batDauViecNB = async (link, ten) => { await API.goi('ghi', { bang: 'GiaoViecNgay', dong: { 'Mã': G.ma('GV'), 'Ngày': hn(), 'Đội': 'Nội bộ', 'Nguồn': 'Nội bộ', 'Mã nguồn': link, 'Nội dung': ten, 'Người': S.u.ten, 'Giờ': API.bayGio(), 'Trạng thái': 'Đang làm' } }); bao('Đã bắt đầu ' + ten); };

  /* ---------- màn Kết thúc ca (Hiệp, Nghị) ---------- */
  async function manKetThucCa() {
    if (S.u.nhom !== 'Nhân viên nội bộ') return manXem();
    const m = G.khung('🌇 Kết thúc ca', `${G.thu()}, ${G.ngayVN(hn())} · ca kết thúc ${GIO_CA}`, '#/');
    const cu = (await G.doc('NgayLamViec', { 'Ngày': hn(), 'Loại': 'Kết thúc ca' })).find((x) => x['Người'] === S.u.ten);
    if (cu) { m.innerHTML = tomTat(cu) + `<p class="mo">Đã kết thúc ca lúc ${esc(String(cu['Giờ']).slice(11, 16))}. Cần sửa thì báo Trưởng bộ phận.</p>`; return; }
    const viec = await G.viecNoiBo(hn());
    const ps = (await G.doc('ViecPhatSinh', { 'Ngày': hn() })).filter((x) => (x['Người ghi'] || '') === S.u.ten);
    const daLam = viec.filter((x) => x.tt === 'xong'); const sot = viec.filter((x) => x.tt !== 'xong');
    const st = {}; sot.forEach((x, i) => { st[i] = { ly: '', xl: 'Làm tiếp ngày mai' }; });
    const ve = () => {
      const tomNgay = daLam.filter((x) => x.kl).map((x) => x.kl).join(' · ');
      m.innerHTML = `${tomNgay ? `<div class="the"><b>Hôm nay:</b> ${esc(tomNgay)}</div>` : ''}<div class="the the-xanh"><b>✅ Đã làm (${daLam.length})</b>${daLam.map((x) => `<div class="mo">• ${esc(x.ten)} · ${esc(x.phu)}</div>`).join('') || '<div class="mo">Chưa có</div>'}</div>
        <div class="the ${sot.length ? 'the-mo' : ''}"><b>⬜ Còn sót (${sot.length})</b>${sot.length ? '<div class="mo">Chọn lý do cho từng việc (bắt buộc).</div>' : '<div class="mo">Không sót việc nào.</div>'}
        ${sot.map((x, i) => `<div style="border-top:1px solid #E3E8E3;padding:8px 0"><b>${esc(x.ten)}</b>${x.phu ? `<div class="mo">${esc(x.phu)}</div>` : ''}
          <div class="chon boc">${LY_DO(x.link).map((l) => `<button type="button" data-i="${i}" data-ly="${l}" class="${st[i].ly === l ? 'dang' : ''}">${l}</button>`).join('')}</div>
          <div class="chon">${['Làm tiếp ngày mai', 'Bỏ'].map((k) => `<button type="button" data-i="${i}" data-xl="${k}" class="${st[i].xl === k ? 'dang' : ''}">${k}</button>`).join('')}</div></div>`).join('')}</div>
        <div class="the"><b>➕ Làm thêm (${ps.length})</b>${ps.map((x) => `<div class="mo">• ${esc(x['Mô tả'] || x['Nội dung'] || '')}</div>`).join('') || '<div class="mo">Việc phát sinh anh/chị ghi hôm nay sẽ hiện ở đây.</div>'}<button type="button" class="nut nho" id="themPS" style="margin-top:6px">＋ Thêm việc đã làm</button></div>
        <div class="the"><b>Ghi chú</b><div class="hang"><textarea id="gc" rows="3" placeholder="Ghi chú cho Trưởng bộ phận"></textarea></div><button type="button" class="nut nho" id="mic">🎤 Nói</button></div>
        <button class="nut chinh rong" id="gui">Gửi kết thúc ca</button>`;
      m.querySelectorAll('[data-ly]').forEach((b) => { b.onclick = () => { st[+b.dataset.i].ly = b.dataset.ly; ve(); }; });
      m.querySelectorAll('[data-xl]').forEach((b) => { b.onclick = () => { st[+b.dataset.i].xl = b.dataset.xl; ve(); }; });
      G.mic(m.querySelector('#mic'), m.querySelector('#gc')); const tps = m.querySelector('#themPS'); if (tps) tps.onclick = () => G.moViecKhac ? G.moViecKhac() : (location.hash = '#/phatsinh');
      m.querySelector('#gui').onclick = (e) => chay(async () => {
        const thieu = sot.filter((_, i) => !st[i].ly); if (thieu.length) throw new Error('Chọn lý do cho: ' + thieu.map((x) => x.ten).join(', '));
        const mai = G.congNgay(hn(), 1);
        const conSot = sot.map((x, i) => ({ viec: x.ten, link: x.link, ly: st[i].ly, xl: st[i].xl }));
        await API.goi('ghi', { bang: 'NgayLamViec', dong: { 'Ngày': hn(), 'Đội': 'Nội bộ', 'Người': S.u.ten, 'Loại': 'Kết thúc ca', 'Giờ': API.bayGio(), 'Đúng hạn': gioNay() <= GIO_CA ? 'Có' : 'Trễ',
          'Đã làm': JSON.stringify(daLam.map((x) => ({ viec: x.ten, gio: x.gio, ai: x.ai, kl: x.kl || '', anh: x.na || 0, link: x.link }))), 'Còn sót': JSON.stringify(conSot), 'Làm thêm': JSON.stringify(ps.map((x) => x['Mô tả'] || x['Nội dung'] || '')), 'Ghi chú': m.querySelector('#gc').value, 'Trạng thái': 'Chờ anh xem' } });
        const tiep = conSot.filter((x) => x.xl === 'Làm tiếp ngày mai');
        if (tiep.length) await API.goi('ghiNhieu', { bang: 'HoanViec', dong: tiep.map((x) => ({ 'Mã': G.ma('HV'), 'Ngày': hn(), 'Đội': 'Nội bộ', 'Việc': x.viec, 'Liên kết': x.link, 'Lý do': x.ly, 'Ngày làm bù': mai, 'Người': S.u.ten })) });
        bao('Đã gửi · Trưởng bộ phận nhận thông báo'); location.hash = '#/';
      }, e.target);
    };
    ve();
  }
  const tomTat = (r) => {
    const da = json(r['Đã làm'], []); const sot = json(r['Còn sót'], []); const them = json(r['Làm thêm'], []);
    return `<div class="the the-xanh"><b>✅ Đã làm (${da.length})</b>${da.map((x) => `<div class="mo">• ${esc(x.viec)}${x.kl ? ' · <b>' + esc(x.kl) + '</b>' : ''}${x.gio ? ' · ' + esc(x.gio) : ''}${x.ai ? ' · ' + esc(x.ai) : ''}${x.anh && x.link ? ` · <a href="#/xemviec/${encodeURIComponent(x.link)}/${esc(r['Ngày'])}">📷 ${x.anh} ảnh</a>` : ''}</div>`).join('') || '<div class="mo">—</div>'}</div>
      <div class="the ${sot.length ? 'the-mo' : ''}"><b style="${sot.length ? 'color:var(--cam)' : ''}">⬜ Còn sót (${sot.length})</b>${sot.map((x) => `<div class="mo" style="color:var(--cam)">• ${esc(x.viec)} · ${esc(x.ly)} · ${esc(x.xl)}</div>`).join('') || '<div class="mo">Không sót việc nào</div>'}</div>
      ${them.length ? `<div class="the"><b>➕ Làm thêm (${them.length})</b>${them.map((x) => `<div class="mo">• ${esc(x)}</div>`).join('')}</div>` : ''}
      ${r['Ghi chú'] ? `<div class="the"><b>Ghi chú</b><div class="mo">${esc(r['Ghi chú'])}</div></div>` : ''}${r['Anh nhắn'] ? `<div class="the"><b>Trưởng bộ phận nhắn</b><div class="mo">${esc(r['Anh nhắn'])}</div></div>` : ''}`;
  };

  /* ---------- Trưởng bộ phận xem ngày của từng người ---------- */
  G.theNoiBo = async (ngay) => {
    const nb = (S.dm.nguoi || []).filter((x) => x.nhom === 'Nhân viên nội bộ').map((x) => x.ten);
    const ten = nb.length ? nb : ['Nguyễn Tấn Hiệp', 'Lê Hữu Nghị'];
    const kc = await G.doc('NgayLamViec', { 'Ngày': ngay, 'Loại': 'Kết thúc ca' }); const viec = await G.viecNoiBo(ngay);
    const xong = viec.filter((x) => x.tt === 'xong').length;
    return `<div class="the"><div class="hang"><h2 class="gian">Nội bộ · ${xong}/${viec.length} việc</h2><a class="nut nho" href="#/ketthucca/xem/${ngay}">Xem chi tiết ›</a></div>${ten.map((t) => { const r = kc.find((x) => x['Người'] === t);
      const sot = r ? json(r['Còn sót'], []).length : 0;
      return `<a class="muc" href="#/ketthucca/xem/${ngay}" style="color:inherit;text-decoration:none"><div class="gian"><b>${esc(t)}</b><div class="mo">${r ? `Kết thúc ca ${esc(String(r['Giờ']).slice(11, 16))} · ${json(r['Đã làm'], []).length} đã làm${sot ? ` · <span style="color:var(--cam)">${sot} còn sót</span>` : ''}` : ngay === hn() && gioNay() <= GIO_CA ? 'Đang trong ca' : '<span style="color:var(--do)">Chưa kết thúc ca</span>'}</div></div>${r ? `<span class="chip ${r['Trạng thái'] === 'Đã xem' ? 'xanh' : 'cam'}">${esc(r['Trạng thái'])}</span>` : ''}</a>`; }).join('')}</div>`;
  };
  async function manXem(ngay) {
    ngay = ngay || hn();
    const m = G.khung('Một ngày của nội bộ', `${G.thu(ngay)}, ${G.ngayVN(ngay)}`, '#/homnay');
    const kc = await G.doc('NgayLamViec', { 'Ngày': ngay, 'Loại': 'Kết thúc ca' });
    m.innerHTML = `<div class="hang" style="margin-bottom:10px"><input type="date" id="ng" value="${ngay}" max="${hn()}" style="max-width:180px"></div>` + (kc.length ? kc.map((r, i) => `<div class="the"><div class="hang"><h2 class="gian">${esc(r['Người'])}</h2><span class="mo">Kết thúc ca ${esc(String(r['Giờ']).slice(11, 16))}${r['Đúng hạn'] === 'Trễ' ? ' · trễ' : ''}</span><span class="chip ${r['Trạng thái'] === 'Đã xem' ? 'xanh' : 'cam'}" style="margin-left:6px">${esc(r['Trạng thái'] || '')}</span></div>${tomTat(r)}
      ${G.laAnhVu() && r['Trạng thái'] !== 'Đã xem' ? `<div class="hang"><input id="nhan${i}" placeholder="Nhắn lại (không bắt buộc)"><button class="nut chinh nho" data-xem="${i}">✓ Đã xem</button></div>` : ''}</div>`).join('') : G.trong('Chưa ai kết thúc ca ngày này.'));
    m.querySelector('#ng').onchange = (e) => { if (e.target.value) location.hash = '#/ketthucca/xem/' + e.target.value; };
    m.querySelectorAll('[data-xem]').forEach((b) => { b.onclick = () => chay(async () => { const r = kc[+b.dataset.xem];
      await API.goi('sua', { bang: 'NgayLamViec', khoa: { 'Ngày': r['Ngày'], 'Loại': 'Kết thúc ca', 'Người': r['Người'] }, doi: { 'Trạng thái': 'Đã xem', 'Anh nhắn': m.querySelector('#nhan' + b.dataset.xem).value } }); bao('Đã xem'); G.taiLai(); }, b); });
  }
  G.man.ketthucca = { an: true, thay: true, fn: (a, b) => (a === 'xem' ? manXem(b) : manKetThucCa()) };

  /* chèn thẻ Nội bộ vào "Hôm nay toàn bộ phận" */
  const homGoc = G.man.homnay.fn;
  G.man.homnay = Object.assign(G.man.homnay, { fn: async (x) => {
    await homGoc(x); if (x === 'mai' || !G.laAnhVu()) return;
    const m = document.getElementById('noiDung'); if (!m) return;
    try { m.insertAdjacentHTML('beforeend', await G.theNoiBo(hn())); } catch (e) { console.error(e); }
  } });

  /* chuông: nhắc 17:15 cho nội bộ, 17:45 báo Trưởng bộ phận */
  const chuong = G.dsChuong;
  G.dsChuong = async () => {
    const out = await chuong(); try {
      const g = gioNay(); if (g < '17:15') return out;
      const kc = await G.doc('NgayLamViec', { 'Ngày': hn(), 'Loại': 'Kết thúc ca' });
      if (S.u.nhom === 'Nhân viên nội bộ' && !kc.some((x) => x['Người'] === S.u.ten)) out.push({ ten: '🌇 Sắp hết ca ' + GIO_CA + ': bấm Kết thúc ca', phu: 'Xem đã làm gì, còn sót gì', link: 'ketthucca' });
      if (G.laAnhVu()) {
        kc.filter((x) => x['Trạng thái'] !== 'Đã xem').forEach((x) => out.push({ ten: '🌇 ' + x['Người'] + ' đã kết thúc ca', phu: json(x['Còn sót'], []).length + ' việc còn sót', link: 'ketthucca/xem/' + hn() }));
        if (g >= '17:45') ['Nguyễn Tấn Hiệp', 'Lê Hữu Nghị'].filter((t) => !kc.some((x) => x['Người'] === t)).forEach((t) => out.push({ ten: '🔴 ' + t + ' chưa kết thúc ca', phu: 'Quá ' + GIO_CA, link: 'ketthucca/xem/' + hn() }));
      }
    } catch (e) { /* bỏ qua */ } return out;
  };
})();
