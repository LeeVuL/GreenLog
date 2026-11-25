/* GreenLog 0.4.2 · mục 82: tổ trưởng / Trưởng bộ phận gửi LINK VIỆC cho nhân viên (1 việc hoặc danh sách), hết hạn 18:00 */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay, bao } = G;
  const hn = () => API.ngay(); const HET = '18:00';
  const duocTao = () => G.laAnhVu() || S.u.nhom === 'Tổ trưởng';
  const maMoi = () => Array.from(crypto.getRandomValues(new Uint8Array(12))).map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 20);
  G.linkUrl = (ma) => location.origin + location.pathname.replace(/[^/]*$/, '') + 'l.html#' + ma;
  const nguoiNhan = () => { const doi = S.u.doi; const cn = (S.dm.congnhan || []).filter((x) => x.tt !== 'Đã nghỉ' && (G.laAnhVu() || S.u.nhom === 'Quản lý nhà thầu' || !doi || x.doi === doi)).map((x) => x.ten);
    return [...new Set(cn.concat(G.laAnhVu() ? ['Nguyễn Tấn Hiệp', 'Lê Hữu Nghị'] : []))].filter(Boolean); };
  const TT_MAU = { 'Đã gửi': 'cam', 'Đã mở': '', 'Đang làm': '', 'Báo xong': 'xanh', 'Không làm được': 'do', 'Thu hồi': '', 'Hết hạn': '' };
  const trangThai = (r) => (r['Ngày'] !== hn() || API.bayGio().slice(11, 16) >= HET) && !['Báo xong', 'Thu hồi'].includes(r['Trạng thái']) ? 'Hết hạn' : r['Trạng thái'];
  const gui = async (r) => { const txt = `🔗 ${r['Người nhận']}: ${r['Tiêu đề']}\n${r['Dặn'] ? r['Dặn'] + '\n' : ''}Mở link, đi tới đâu chụp ảnh tới đó. Link dùng đến ${HET} hôm nay.\n👉 ${G.linkUrl(r['Mã link'])}`;
    if (navigator.share) { try { await navigator.share({ title: 'GreenLog', text: txt }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(txt); bao('Đã chép link. Mở Zalo, dán gửi cho người nhận.'); } catch (e) { G.hop('Link việc', `<textarea style="width:100%;height:140px">${esc(txt)}</textarea>`, () => {}); } };
  /* tạo link: o = { loai: 'Việc' | 'Danh sách', tieuDe, dan, vt, ds: [{ma, ten, vt}], phieu, kl } */
  G.taoLinkViec = (o) => { o = o || {}; const ds0 = o.ds || [];
    G.hop(o.loai === 'Danh sách' ? '🔗 Link việc theo danh sách' : '🔗 Gửi link cho nhân viên', '<div id="f"></div><div id="lv"></div><button class="nut chinh rong" id="l">Tạo link và gửi Zalo</button>', (h, dong) => {
      const dsMau = o.loai === 'Danh sách' && !ds0.length;
      const lay = G.form(h.querySelector('#f'), [{ k: 'td', nhan: 'Tên việc', loai: 'chu', bb: true, gt: o.tieuDe || '' }, { k: 'dan', nhan: 'Dặn nhân viên', loai: 'mota', gt: o.dan || '' },
        { k: 'ng', nhan: 'Gửi cho', loai: 'chonds', ds: nguoiNhan(), bb: true }, { k: 'kl', nhan: 'Cần ghi khối lượng? (vd: kg rác, số chậu — để trống nếu không cần)', loai: 'chu', gt: o.kl || '' },
        ...(dsMau ? [{ k: 'cach', nhan: 'Danh sách lấy từ', loai: 'chips', ds: ['Chọn vị trí', 'Gõ danh sách'], gt: 'Chọn vị trí' }, { k: 'go', nhan: 'Mỗi dòng 1 mục (vd: tên cây · vị trí)', loai: 'mota', khi: (v) => v.cach === 'Gõ danh sách' }] : [])]);
      const st = { cum: '', mat: 'Cả 3', chon: new Set() };
      if (dsMau) { const lv = h.querySelector('#lv'); const veLV = () => { const go = [...h.querySelectorAll('[data-f] .dang')].some((b) => /Gõ danh sách/.test(b.textContent)); lv.hidden = go; };
        G.luoiVT(lv, { ds: S.dm.vitri.filter((v) => v.ap === 'Có'), st, coMat: true, trangThai: () => ({ cls: '' }) }); h.addEventListener('click', () => setTimeout(veLV, 0)); veLV(); }
      h.querySelector('#l').onclick = (e) => chay(async () => { const v = lay();
        let ds = ds0;
        if (dsMau) ds = v.cach === 'Gõ danh sách' ? String(v.go || '').split('\n').map((x) => x.trim()).filter(Boolean).map((x, i) => { const [ten, vt] = x.split('·').map((y) => y.trim()); return { ma: 'M' + (i + 1), ten, vt: vt || '' }; })
          : [...st.chon].map((ma) => { const t = G.vt(ma) || {}; return { ma, ten: (G.tenVT ? G.tenVT(ma) : '') || t.ten || ma, vt: t.cum || '' }; });
        if (o.loai === 'Danh sách' && !ds.length) throw new Error('Danh sách đang trống');
        const r = { 'Mã link': maMoi(), 'Ngày': hn(), 'Loại': o.loai || 'Việc', 'Tiêu đề': v.td, 'Dặn': v.dan, 'Mã vị trí': o.vt ? G.tenVT(o.vt) : '', 'Danh sách': ds.length ? JSON.stringify(ds) : '', 'Khối lượng': v.kl || '', 'Mã phiếu': o.phieu || '',
          'Người nhận': v.ng ? v.ng.ten || v.ng : '', 'Đội': S.u.doi || '', 'Người tạo': S.u.ten, 'Giờ tạo': API.bayGio(), 'Trạng thái': 'Đã gửi', 'Link trước': o.truoc || '' };
        await API.goi('ghi', { bang: 'LinkViec', dong: r, imLang: true }); dong(); await gui(r); if (/^#\/linkviec/.test(location.hash)) G.taiLai(); else location.hash = '#/linkviec';
      }, e.target);
    }); };
  /* màn quản lý link trong ngày */
  G.man.linkviec = { ten: 'Link việc cho nhân viên', ic: 'phan_quyen_viec', nhom: 'Theo dõi', ph: 'homnay', cap: 2, fn: async (ngay) => {
    ngay = ngay || hn(); const m = G.khung('🔗 Link việc cho nhân viên', `${G.ngayVN(ngay)} · link dùng đến ${HET} trong ngày`, '#/');
    const [ls, kq] = await Promise.all([G.doc('LinkViec', { 'Ngày': ngay }), G.doc('LinkViecKetQua')]);
    const cua = ls.filter((r) => G.laAnhVu() || r['Người tạo'] === S.u.ten || (S.u.doi && r['Đội'] === S.u.doi));
    m.innerHTML = `${duocTao() && ngay === hn() ? `<div class="nhom-nut" style="margin-bottom:10px;flex-wrap:wrap"><button class="nut chinh" id="t1">＋ Link 1 việc</button><button class="nut" id="t2">＋ Link danh sách (đi tới đâu chụp tới đó)</button></div>` : ''}
      <div class="hang" style="margin-bottom:10px"><input type="date" id="ng" value="${ngay}" style="max-width:180px"></div>
      ${cua.map((r) => { const k = kq.filter((x) => x['Mã link'] === r['Mã link']); let ds = []; try { ds = JSON.parse(r['Danh sách'] || '[]'); } catch (e) { ds = []; }
        const xong = new Set(k.filter((x) => x['Mục']).map((x) => x['Mục'])).size; const tt = trangThai(r); const anh = k.flatMap((x) => String(x['Ảnh'] || '').split(' | ').filter(Boolean));
        return `<div class="the"><div class="hang" style="justify-content:space-between;gap:8px"><b>${esc(r['Tiêu đề'])}</b><span class="chip ${TT_MAU[tt] || ''}">${esc(tt)}</span></div>
          <div class="mo">${esc(r['Người nhận'])} · ${esc(r['Loại'])}${ds.length ? ` · <b>${xong}/${ds.length}</b> mục` : ''}${r['Mã phiếu'] ? ' · phiếu ' + esc(r['Mã phiếu']) : ''} · tạo ${esc(String(r['Giờ tạo']).slice(11, 16))} bởi ${esc(String(r['Người tạo']).split(' ').pop())}</div>
          ${ds.length ? `<div class="thanh" style="margin:6px 0"><i style="width:${Math.round(xong / ds.length * 100)}%"></i></div>` : ''}
          ${k.filter((x) => x['Loại'] === 'khokhan').map((x) => `<div class="mo" style="color:var(--do)">⚠ ${esc(x['Tình trạng'])} ${esc(x['Ghi chú'])}</div>`).join('')}
          ${anh.length ? `<div class="xv-anh">${anh.slice(0, 8).map((u) => `<figure><img src="${esc(API.anhUrl(u))}" loading="lazy" onclick="GL.phongAnh(this.src)"></figure>`).join('')}</div>` : ''}
          <div class="nhom-nut" style="margin-top:8px;flex-wrap:wrap">${tt === 'Hết hạn' && ds.length && xong < ds.length && duocTao() ? `<button class="nut nho chinh" data-lai="${esc(r['Mã link'])}">🔗 Gửi lại phần còn lại (${ds.length - xong})</button>` : ''}
            ${!['Hết hạn', 'Thu hồi', 'Báo xong'].includes(tt) ? `<button class="nut nho" data-gui="${esc(r['Mã link'])}">📤 Gửi Zalo</button><button class="nut nho" data-thu="${esc(r['Mã link'])}">Thu hồi</button>` : ''}</div></div>`; }).join('') || G.trong('Chưa có link nào trong ngày.')}`;
    const t1 = m.querySelector('#t1'); if (t1) t1.onclick = () => G.taoLinkViec({ loai: 'Việc' });
    const t2 = m.querySelector('#t2'); if (t2) t2.onclick = () => G.taoLinkViec({ loai: 'Danh sách' });
    m.querySelector('#ng').onchange = (e) => { location.hash = '#/linkviec/' + e.target.value; };
    m.querySelectorAll('[data-gui]').forEach((b) => { b.onclick = () => gui(cua.find((r) => r['Mã link'] === b.dataset.gui)); });
    m.querySelectorAll('[data-thu]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('sua', { bang: 'LinkViec', khoa: { 'Mã link': b.dataset.thu }, doi: { 'Trạng thái': 'Thu hồi' }, imLang: true }); bao('Đã thu hồi link'); G.taiLai(); }, b); });
    m.querySelectorAll('[data-lai]').forEach((b) => { b.onclick = () => { const r = cua.find((x) => x['Mã link'] === b.dataset.lai); const k = kq.filter((x) => x['Mã link'] === r['Mã link']); const da = new Set(k.filter((x) => x['Mục']).map((x) => x['Mục']));
      let ds = []; try { ds = JSON.parse(r['Danh sách'] || '[]'); } catch (e) { ds = []; }
      G.taoLinkViec({ loai: 'Danh sách', tieuDe: r['Tiêu đề'], dan: r['Dặn'], kl: r['Khối lượng'], ds: ds.filter((x) => !da.has(x.ma)), truoc: r['Mã link'] }); }; });
  } };
  /* lối vào: Hôm nay toàn bộ phận / Tổng quan / Hôm nay tổ trưởng + nút trên phiếu */
  /* nút gửi link trong khung chi tiết phiếu */
  let maPhieu = '';
  document.addEventListener('click', (e) => { const r = e.target.closest && e.target.closest('[data-ma]'); if (r && /^#\/phieu/.test(location.hash)) maPhieu = r.dataset.ma; }, true);
  new MutationObserver(() => { if (!maPhieu || !/^#\/phieu/.test(location.hash) || !S.u || !duocTao()) return; const hd = [...document.querySelectorAll('.lop-phu #hanhDong')].pop(); if (!hd || hd.parentElement.querySelector('.nut-linkphieu')) return;
    const ma = maPhieu; const b = G.h('<button class="nut rong nut-linkphieu" style="margin-top:8px">🔗 Gửi link phiếu này cho nhân viên</button>');
    b.onclick = async () => { const p = (await G.doc('Phieu')).find((x) => x['Mã phiếu'] === ma) || {}; document.querySelectorAll('.lop-phu').forEach((x) => x.remove()); G.taoLinkViec({ loai: 'Việc', tieuDe: [p['Loại lỗi'], p['Mô tả']].filter(Boolean).join(': ') || ma, vt: p['Mã vị trí'], phieu: ma }); };
    hd.insertAdjacentElement('afterend', b); }).observe(document.body, { childList: true, subtree: true });
  const hnFn = G.manHomNayMoi;
  if (hnFn) G.manHomNayMoi = async (...a) => { await hnFn(...a); if (!duocTao()) return; const m = document.getElementById('noiDung'); if (!m || m.querySelector('.vao-link')) return;
    m.insertAdjacentHTML('beforeend', '<a class="the vao-link hang" href="#/linkviec" style="justify-content:space-between;text-decoration:none;color:inherit"><span><b>🔗 Link việc cho nhân viên</b><span class="mo" style="display:block">Gửi 1 việc hoặc danh sách qua Zalo · nhân viên không cần đăng nhập</span></span><span>›</span></a>'); };
  const tqFn = G.man[''] && G.man[''].fn;
  if (tqFn) G.man[''].fn = async (...a) => { await tqFn(...a); if (!G.laAnhVu()) return; const m = document.getElementById('noiDung'); if (!m) return;
    const ls = await G.doc('LinkViec', { 'Ngày': hn() }); const xong = ls.filter((r) => r['Trạng thái'] === 'Báo xong').length;
    m.querySelectorAll('.vao-link').forEach((x) => x.remove());
    (G.oNhanh ? G.oNhanh(m) : m).insertAdjacentHTML('beforeend', `<a class="the vao-link" href="#/linkviec"><b>🔗 Link việc hôm nay</b><span class="mo">${ls.length} link · ${xong} đã báo xong</span></a>`); };
})();
