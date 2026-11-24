/* GreenLog v0.4.1 · mục 69: Vệ sinh theo cụm (DV10) và Nhổ cỏ dại (DV11) dùng cùng cách chọn vị trí như Tưới nước:
   chọn dãy → chọn mặt nhanh cho cả cụm → Chọn cả cụm / Bỏ chọn cụm → ô villa. Lưu 1 dòng mỗi cụm như trước (ViecHangNgay). */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hn = () => API.ngay();
  const tach = (s) => String(s || '').split('|').map((x) => x.trim()).filter(Boolean);
  G.man.cum = { an: true, thay: true, fn: async (maViec) => {
    if (!/^DV1[01]$/.test(maViec || '')) maViec = 'DV10';
    const ghi = q('dinhky') >= 2; const ngay = hn();
    const m = G.khung(G.dvTen(maViec), `${G.ngayVN(ngay)} · theo cụm, vị trí`, '#/viec');
    const nVT = S.dm.vitri.filter((v) => v.ap === 'Có'); const cums = [...new Set(nVT.map((v) => v.cum))];
    const docLai = async () => (await API.goi('docNhieu', { ds: [{ bang: 'ViecHangNgay', loc: { 'Ngày': ngay, 'Mã việc': maViec } }] })).ViecHangNgay;
    let cu = await docLai();
    const st = G.man.cum.st && G.man.cum.st.k === maViec + ngay ? G.man.cum.st : (G.man.cum.st = { k: maViec + ngay, cum: '', mat: 'Cả 3', chon: new Set() });
    const daLam = () => { const s = new Set(); cu.forEach((r) => { if (r['Trạng thái'] === 'Xong') nVT.filter((v) => v.cum === r['Cụm']).forEach((v) => s.add(v.ma)); else tach(r['Mã vị trí']).forEach((x) => s.add(x)); }); return s; };
    let xongSet = daLam();
    const ve = () => {
      const cumXong = cums.filter((c) => nVT.filter((v) => v.cum === c).every((v) => xongSet.has(v.ma))).length;
      const cumMot = cums.filter((c) => { const vs = nVT.filter((v) => v.cum === c); const n = vs.filter((v) => xongSet.has(v.ma)).length; return n && n < vs.length; }).length;
      m.innerHTML = `<div class="bang-viec">${G.ic(maViec === 'DV10' ? 've_sinh' : 'nho_co', 52)}<div class="gian"><small>Đang cập nhật</small><b>${esc(G.dvTen(maViec).toUpperCase())}</b><small>${cumXong}/${cums.length} cụm xong · ${cumMot} cụm làm một phần · ${xongSet.size}/${nVT.length} vị trí</small></div><a class="nut nho" href="#/cum/${maViec === 'DV10' ? 'DV11' : 'DV10'}">Đổi việc</a></div>
        <div class="buoc"><span>1</span>Chọn dãy, chọn mặt, chọn vị trí đã làm hôm nay</div>
        <div class="chu-thich"><span><i class="xong"></i>Đã làm hôm nay</span><span><i></i>Chưa làm</span><span><i class="c"></i>Đang chọn</span></div>
        <div id="luoi"></div>
        ${ghi ? `<div class="buoc" style="margin-top:14px"><span>2</span>Ảnh và ghi chú</div><div class="o"><span class="nhan-o">Ảnh hiện trường (bắt buộc, ít nhất 1 ảnh)</span><div id="anh"></div></div>${G.oMoTa('gc', 'Ghi chú')}
        <div class="thanh-duoi"><button class="nut chinh" id="luu" ${st.chon.size ? '' : 'disabled'}>${st.chon.size ? `Lưu · ${st.chon.size} vị trí` : 'Chọn vị trí rồi lưu'}</button></div>` : ''}`;
      const doi = () => { const b = m.querySelector('#luu'); if (b) { b.disabled = !st.chon.size; b.textContent = st.chon.size ? `Lưu · ${st.chon.size} vị trí` : 'Chọn vị trí rồi lưu'; } };
      G.luoiVT(m.querySelector('#luoi'), { ds: nVT, st, coMat: true, doi, trangThai: (ma) => (xongSet.has(ma) ? { cls: 'xong' } : { cls: '' }) });
      if (!ghi) return;
      const anh = G.oAnh(m.querySelector('#anh'), { toiDa: 4 }); G.ganMic(m);
      m.querySelector('#luu').onclick = (e) => chay(async () => {
        if (!st.chon.size) throw new Error('Chọn vị trí đã làm hoặc bấm Chọn cả cụm');
        const theoCum = {}; [...st.chon].forEach((ma) => { const v = G.vt(ma); if (v) (theoCum[v.cum] = theoCum[v.cum] || new Set()).add(ma); });
        const gio = API.bayGio().slice(11, 16); const gc = m.querySelector('#gc').value; const ds = anh.ds();
        const dong = Object.keys(theoCum).map((c) => {
          const vs = nVT.filter((v) => v.cum === c); const gop = new Set([...vs.filter((v) => xongSet.has(v.ma)).map((v) => v.ma), ...theoCum[c]]);
          const ca = vs.every((v) => gop.has(v.ma));
          return { 'Ngày': ngay, 'Mã việc': maViec, 'Cụm': c, 'Mã vị trí': ca ? '' : [...gop].join(' | '), 'Trạng thái': ca ? 'Xong' : 'Một phần', 'Ảnh': ds, 'Ghi chú': gc, 'Người ghi': '', 'Giờ': gio };
        });
        await API.goi('ghiNhieu', { bang: 'ViecHangNgay', thay: ['Ngày', 'Mã việc', 'Cụm'], dong });
        cu = await docLai(); xongSet = daLam(); st.chon = new Set(); bao(`Đã lưu ${dong.length} cụm`); ve();
      }, e.target);
    };
    ve();
  } };
})();
