/* GreenLog 0.4.2 · mục 73 Máy sàng cát: "Hôm nay không sàng được" + lý do, nhắc khi lâu chưa sàng, lịch bảo trì gọn */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay, bao } = G;
  const hn = () => API.ngay();
  const LY_DO = ['Trời mưa, cát ướt', 'Triều cao', 'Máy hỏng / đang bảo trì', 'Thiếu người', 'Khách đông trên bãi', 'Hết nhiên liệu', 'Lý do khác'];
  const NGAY_NHAC = 3;
  /* số ngày liền gần nhất không sàng mà cũng không ghi lý do */
  G.ngayChuaSang = async () => {
    const tu = G.congNgay(hn(), -14); const d = await G.doc('MaySangCat', { 'Ngày': { tu } });
    for (let i = 0; i <= 14; i++) { const n = G.congNgay(hn(), -i); const r = d.filter((x) => x['Ngày'] === n);
      if (r.some((x) => x['Giờ bắt đầu'] || x['Loại'] === 'Không sàng' || +x['Số giờ'])) return i; }
    return 15;
  };
  const nbFn = G.man.nb.fn;
  G.man.nb.fn = async (loai, ...r) => {
    await nbFn(loai, ...r); if (loai !== 'may') return; const m = document.getElementById('noiDung'); if (!m) return;
    // lịch bảo trì gọn thay cho đoạn chữ dài
    m.querySelectorAll('p.mo').forEach((p) => { if (/checklist trước mỗi lần dùng/.test(p.textContent)) p.outerHTML = `<details class="the"><summary><b>Lịch bảo trì theo giờ chạy</b> <span class="mo">(không cần kiểm tra trước mỗi lần chạy)</span></summary>
      <table class="bang" style="margin-top:8px"><tr><th>Mốc</th><th>Việc cần làm</th></tr><tr><td><b>25 giờ</b></td><td>Vệ sinh lọc gió · rửa cát muối · kiểm tra lưới, curoa · bơm mỡ · kiểm tra trục PTO · kiểm tra chốt khung 3 điểm</td></tr>
      <tr><td><b>50 giờ</b></td><td>Việc của mốc 25 giờ + thay nhớt Sand Man · dầu hộp số · siết bulong · công tắc an toàn · nắp PTO · lốp</td></tr><tr><td><b>100–200 giờ/năm</b></td><td>Gọi thợ bảo dưỡng</td></tr></table></details>`; });
    const ghi = (G.qv('DV30') || 0) >= 2 || G.laAnhVu();
    const nay = await G.doc('MaySangCat', { 'Ngày': hn() }); const khong = nay.find((x) => x['Loại'] === 'Không sàng'); const chay1 = nay.some((x) => x['Giờ bắt đầu']);
    const nChua = await G.ngayChuaSang();
    const bd = [...m.querySelectorAll('button')].find((b) => /Bắt đầu chạy máy/.test(b.textContent));
    const html = `<div class="may-trangthai">${khong ? `<div class="the the-mo"><b>⛔ Hôm nay không sàng: ${esc(khong['Lý do'] || '')}</b>${khong['Ghi chú'] ? `<div class="mo">${esc(khong['Ghi chú'])}</div>` : ''}<div class="mo">${esc(khong['Người ghi'] || '')}</div>${ghi ? '<button class="nut nho" id="boKS" style="margin-top:6px">Ghi nhầm · bỏ</button>' : ''}</div>`
      : !chay1 && nChua >= NGAY_NHAC ? `<div class="the the-mo"><b>⚠ Đã ${nChua > 14 ? 'hơn 14' : nChua} ngày chưa sàng cát</b><div class="mo">Đang mùa đông khách. Chạy máy hôm nay hoặc ghi lý do không sàng được.</div></div>` : ''}
      ${ghi && !khong && !chay1 ? '<button class="nut rong" id="khongSang" style="margin:8px 0">⛔ Hôm nay không sàng được</button>' : ''}</div>`;
    m.querySelectorAll('.may-trangthai').forEach((x) => x.remove());
    if (bd) bd.insertAdjacentHTML('afterend', html); else m.insertAdjacentHTML('afterbegin', html);
    const ks = m.querySelector('#khongSang'); if (ks) ks.onclick = () => G.hop('⛔ Hôm nay không sàng được', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ly', nhan: 'Lý do', loai: 'chips', ds: LY_DO, bb: true, gt: 'Trời mưa, cát ướt' }, { k: 'khac', nhan: 'Ghi lý do', loai: 'mota', bb: true, khi: (v) => v.ly === 'Lý do khác' },
        { k: 'gc', nhan: 'Ghi chú', loai: 'mota', khi: (v) => v.ly !== 'Lý do khác' }, { k: 'anh', nhan: 'Ảnh (không bắt buộc)', loai: 'anh', toiDa: 2, tuyChon: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay();
        await API.goi('ghi', { bang: 'MaySangCat', dong: { 'Ngày': '', 'Máy': 'Sand Man', 'Loại': 'Không sàng', 'Lý do': v.ly === 'Lý do khác' ? v.khac : v.ly, 'Ghi chú': v.gc || '', 'Ảnh': v.anh, 'Người ghi': '' } });
        dong(); bao('Đã ghi: hôm nay không sàng'); G.taiLai(); }, e.target); });
    const bo = m.querySelector('#boKS'); if (bo) bo.onclick = () => chay(async () => { await API.goi('xoa', { bang: 'MaySangCat', khoa: { 'Ngày': hn(), 'Loại': 'Không sàng' } }); bao('Đã bỏ'); G.taiLai(); }, bo);
  };
  /* chuông: quá 3 ngày chưa sàng, không lý do → báo nội bộ và Trưởng bộ phận */
  const chuong = G.dsChuong;
  G.dsChuong = async () => { const out = await chuong(); try { if (!(S.u.nhom === 'Nhân viên nội bộ' || G.laAnhVu())) return out; const n = await G.ngayChuaSang();
    if (n >= NGAY_NHAC) out.push({ ten: `🏖 Đã ${n > 14 ? 'hơn 14' : n} ngày chưa sàng cát`, phu: 'Chạy máy hoặc ghi lý do không sàng được', link: 'nb/may' }); } catch (e) { /* bỏ qua */ } return out; };

  /* 0.4.3: thẻ Sand Man dùng lại phần "Hôm nay không sàng được" */
  G.ganKhongSang = async (el, ghi) => {
    if (!el) return; const nay = await G.doc('MaySangCat', { 'Ngày': hn() }); const khong = nay.find((x) => x['Loại'] === 'Không sàng'); const nChua = await G.ngayChuaSang();
    el.innerHTML = khong ? `<div class="the the-mo" style="margin:0 0 8px"><b>⛔ Hôm nay không sàng: ${esc(khong['Lý do'] || '')}</b>${khong['Ghi chú'] ? `<div class="mo">${esc(khong['Ghi chú'])}</div>` : ''}${ghi || G.laAnhVu() ? '<button class="nut nho" id="boKS" style="margin-top:6px">Ghi nhầm · bỏ</button>' : ''}</div>`
      : (nChua >= NGAY_NHAC && ghi ? `<div class="the the-mo" style="margin:0 0 8px"><b>⚠ Đã ${nChua > 14 ? 'hơn 14' : nChua} ngày chưa sàng cát</b><div class="mo">Chạy máy hôm nay hoặc ghi lý do không sàng được.</div></div>` : '') + (ghi ? '<button class="nut rong" id="khongSang" style="margin:0 0 8px">⛔ Hôm nay không sàng được</button>' : '');
    const ks = el.querySelector('#khongSang'); if (ks) ks.onclick = () => G.hop('⛔ Hôm nay không sàng được', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ly', nhan: 'Lý do', loai: 'chips', ds: LY_DO, bb: true, gt: 'Trời mưa, cát ướt' }, { k: 'khac', nhan: 'Ghi lý do', loai: 'mota', bb: true, khi: (v) => v.ly === 'Lý do khác' },
        { k: 'gc', nhan: 'Ghi chú', loai: 'mota', khi: (v) => v.ly !== 'Lý do khác' }, { k: 'anh', nhan: 'Ảnh (không bắt buộc)', loai: 'anh', toiDa: 2, tuyChon: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay();
        await API.goi('ghi', { bang: 'MaySangCat', dong: { 'Ngày': '', 'Máy': 'Sand Man', 'Loại': 'Không sàng', 'Lý do': v.ly === 'Lý do khác' ? v.khac : v.ly, 'Ghi chú': v.gc || '', 'Ảnh': v.anh, 'Người ghi': '' } });
        dong(); bao('Đã ghi: hôm nay không sàng'); G.taiLai(); }, e.target); });
    const bo = el.querySelector('#boKS'); if (bo) bo.onclick = () => chay(async () => { await API.goi('xoa', { bang: 'MaySangCat', khoa: { 'Ngày': hn(), 'Loại': 'Không sàng', 'Lý do': khong['Lý do'] } }); bao('Đã bỏ'); G.taiLai(); }, bo);
  };
})();
