/* GreenLog · Kế hoạch tuần: việc định kỳ luôn có sẵn để chọn, một nguồn với họp thứ Hai (mục 64) */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hn = () => API.ngay();
  const DOI = ['Đội khu vực', 'Đội cơ động'];
  const dvDoi = (v) => (v.doi || (/Cắt cỏ|Bón|Phun|Cắt tỉa cây bóng mát/.test(v.ten) ? 'Đội cơ động' : 'Đội khu vực'));
  const DV_DK = () => (S.dm.dauviec || []).filter((v) => v.lich === 'Có lịch' && v.nhom === 'Nhà thầu' && !['DV39', 'DV40'].includes(v.ma));

  async function phanDinhKy(st) {
    const k = S.dm.ky; const tuKy = k.tu; const conNgay = Math.max(1, Math.round((new Date(k.den) - new Date(hn())) / 864e5) + 1);
    const [tick, kh] = await Promise.all([G.doc('TickDinhKy', { 'Kỳ': k.ten }), G.doc('KeHoachTuan', { 'Tuần': [st.tu, G.tuan(st.tu)] })]);
    const ds = DV_DK().map((v) => {
      const vt = G.dsVT(v.ma); const xong = new Set(tick.filter((t) => t['Mã việc'] === v.ma && (t['Trạng thái'] || 'Xong') === 'Xong').map((t) => t['Mã vị trí']));
      const con = vt.filter((x) => !xong.has(x.ma)); const tuan = Math.ceil(con.length / Math.max(1, conNgay / 7));
      const dk = kh.filter((x) => x['Mã việc'] === v.ma);
      return { v, n: vt.length, xong: vt.length - con.length, con, tuan, dk, doi: dvDoi(v) };
    }).filter((x) => x.n && (!st.doi || x.doi === st.doi));
    return { ds, conNgay };
  }

  const veA = (st, kq) => `<h3 class="tieu-nhom">A. Việc định kỳ · kỳ ${esc(S.dm.ky.ten)} (còn ${kq.conNgay} ngày)</h3><div class="ds">${kq.ds.map((x, i) => `<div class="muc"><div class="gian"><b>${esc(x.v.ten)}</b>
      <div class="mo">${x.xong}/${x.n} vị trí · <b>còn ${x.con.length}</b> · cần khoảng ${x.tuan} vị trí/tuần · ${esc(x.doi)}</div>
      ${x.dk.length ? `<div class="mo">📅 Đã lên kế hoạch: ${x.dk.map((r) => esc(r['Cụm'] || G.tenVT(r['Mã vị trí']) || '') + (r['Ngày'] ? ' (' + G.thuNgan(r['Ngày']) + ')' : '')).join(', ')}</div>` : ''}</div>
      ${q('kehoach') >= 2 && x.con.length ? `<button class="nut nho" data-lkh="${i}">＋ Lên kế hoạch</button>` : x.con.length ? '' : '<span class="chip xanh">Xong kỳ</span>'}</div>`).join('') || '<div class="muc mo">Không có việc định kỳ cho đội này.</div>'}</div>`;

  function moChon(st, x) {
    const stVT = { chon: new Set(), cum: '' }; const xongSet = new Set(G.dsVT(x.v.ma).map((v) => v.ma).filter((ma) => !x.con.some((c) => c.ma === ma)));
    const ngays = []; for (let i = 0; i < 7; i++) ngays.push(G.congNgay(st.tu, i)); let ngay = '';
    G.hop('Lên kế hoạch · ' + x.v.ten, `<p class="mo">Vị trí đã làm xong trong kỳ hiện xanh. Chọn cụm hoặc vị trí định làm trong tuần.</p>
      <div class="chon boc" id="ng"><button type="button" data-n="" class="dang">Cả tuần</button>${ngays.map((n) => `<button type="button" data-n="${n}">${G.thuNgan(n)} ${G.ngayVN(n).slice(0, 5)}</button>`).join('')}</div>
      <button type="button" class="nut rong" id="goiY" style="margin:6px 0">🪄 App gợi ý (~${x.tuan} vị trí)</button><div id="luoiKH"></div><button class="nut chinh rong" id="luuKH" style="margin-top:10px">Lưu kế hoạch</button>`, (o, dong) => {
      const ve = () => G.luoiVT(o.querySelector('#luoiKH'), { ds: G.dsVT(x.v.ma), st: stVT, trangThai: (ma) => (xongSet.has(ma) ? { cls: 'xong', sub: 'Xong' } : { cls: '' }) });
      ve();
      o.querySelectorAll('#ng [data-n]').forEach((b) => { b.onclick = () => { ngay = b.dataset.n; o.querySelectorAll('#ng [data-n]').forEach((y) => y.classList.toggle('dang', y === b)); }; });
      o.querySelector('#goiY').onclick = () => { // cụm còn nhiều vị trí chưa làm trước, đủ số cần trong tuần
        const theoCum = {}; x.con.forEach((v) => { (theoCum[v.cum] = theoCum[v.cum] || []).push(v); });
        const cums = Object.keys(theoCum).sort((a, b) => theoCum[b].length - theoCum[a].length); stVT.chon.clear(); let n = 0;
        for (const c of cums) { if (n >= x.tuan) break; theoCum[c].forEach((v) => { if (n < x.tuan) { stVT.chon.add(v.ma); n++; } }); stVT.cum = stVT.cum || c; }
        ve(); bao('Đã gợi ý ' + n + ' vị trí · sửa lại nếu cần'); };
      o.querySelector('#luuKH').onclick = (e) => chay(async () => {
        const chon = [...stVT.chon].filter((ma) => !xongSet.has(ma)); if (!chon.length) throw new Error('Chưa chọn vị trí');
        const theoCum = {}; chon.forEach((ma) => { const v = G.vt(ma) || {}; (theoCum[v.cum || ''] = theoCum[v.cum || ''] || []).push(ma); });
        const hang = Object.keys(theoCum).map((c) => { const tatCa = G.dsVT(x.v.ma).filter((v) => v.cum === c && !xongSet.has(v.ma)).length === theoCum[c].length;
          return { 'Mã KHT': '', 'Tuần': st.tu, 'Mã việc': x.v.ma, 'Cụm': c, 'Mã vị trí': tatCa ? '' : theoCum[c].join(','), 'Nội dung': x.v.ten + ' · ' + c + (tatCa ? '' : ' (' + theoCum[c].length + ' vị trí)'), 'Đội/Người': x.doi, 'Ngày': ngay, 'Từ ngày': ngay || st.tu, 'Hạn': ngay || G.congNgay(st.tu, 6), 'Mức độ': 'Trung bình', 'Nguồn': 'Kế hoạch tuần', 'Trạng thái': 'Đăng ký' }; });
        await API.goi('ghiNhieu', { bang: 'KeHoachTuan', dong: hang }); dong(); bao('Đã lên kế hoạch ' + chon.length + ' vị trí'); G.taiLai();
      }, e.target);
    }, true);
  }

  const goc = G.man.kehoach.fn;
  G.man.kehoach = Object.assign(G.man.kehoach, { fn: async () => {
    await goc(); const m = document.getElementById('noiDung'); if (!m) return;
    const st = G.man.kehoach.st; const h = [...m.querySelectorAll('h3.tieu-nhom')].find((x) => /^A\./.test(x.textContent.trim()));
    if (!h) return; const ds0 = h.nextElementSibling;
    const kq = await phanDinhKy(st); const box = document.createElement('div'); box.innerHTML = veA(st, kq);
    h.replaceWith(...box.childNodes); if (ds0 && ds0.classList.contains('ds')) ds0.remove();
    m.querySelectorAll('[data-lkh]').forEach((b) => { b.onclick = () => moChon(st, kq.ds[+b.dataset.lkh]); });
  } });
})();
