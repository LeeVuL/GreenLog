/* GreenLog 0.3 – phun bón theo bình 16L và dịch hại theo cây, trồng cây 3 ảnh + dự án, phiếu trồng dặm, kế hoạch tuần, dự án nhiều vị trí,
   lịch Ngày/Tuần/Tháng/Năm, chấm điểm → phiếu, công nhân (anh Vũ toàn quyền), họp, đào tạo, thư viện SOP */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hop = (...a) => G.hop(...a);
  const hn = () => API.ngay();

  /* ================= PHUN, BÓN: gợi ý thuốc + liều bình 16L ================= */
  const NHOM_PB = ['Thảm cỏ', 'Cây bụi', 'Hàng rào', 'Cây bóng mát', 'Thủy sinh', 'Cây nội thất', 'Vườn rau'];
  const DV_PHUN = { 'Thảm cỏ': 'DV04', 'Cây bụi': 'DV05', 'Hàng rào': 'DV05', 'Cây bóng mát': 'DV06' };
  const DV_BON = { 'Thảm cỏ': 'DV02', 'Cây bụi': 'DV03', 'Hàng rào': 'DV03', 'Thủy sinh': 'DV38' };
  const NHOM_CAY = { 'Thảm cỏ': /cỏ thảm/i, 'Cây bụi': /bụi|hoa/i, 'Hàng rào': /bụi|leo/i, 'Cây bóng mát': /bóng mát|ăn trái/i, 'Thủy sinh': /thủy sinh/i, 'Cây nội thất': /nội thất/i, 'Vườn rau': /rau/i };
  const docLieu = (s) => { const m = String(s || '').match(/([\d.,]+)\s*(ml|g|kg|gói)/i); return m ? { n: +m[1].replace(',', '.'), dvt: m[2].toLowerCase() } : null; };
  const tim = (ten) => S.dm.thuoc.find((t) => (t.tenNgan && ten.toLowerCase().startsWith(t.tenNgan.toLowerCase().split(' ')[0])) || ten.toLowerCase().startsWith(String(t.ten).toLowerCase().split(' ')[0]));
  G.goiYThuoc = (dh) => {
    const r = (S.dm.dhThuoc || []).find((x) => x.dh === dh); if (!r) return null;
    const sp = (s) => { if (!s || s.startsWith('—')) return null; const t = tim(s); const l = docLieu(s) || docLieu(t && t.lieu16); return t ? { t, lieu: l ? l.n : '', dvt: l ? l.dvt : 'ml' } : null; };
    return Object.assign({}, r, { spChinh: sp(r.chinh), spLuan: sp(r.luan) });
  };
  const phunGoc = G.man.phunbon.fn;
  G.man.phunbon = Object.assign(G.man.phunbon, { ic: 'phun_bon', fn: (a, b) => (a === 'moi' ? moiPhunBon(b) : phunGoc(a, b)) });
  async function moiPhunBon(maDH) {
    const m = G.khung('Ghi lần phun, bón', maDH ? 'Cho hồ sơ dịch hại ' + maDH : 'App gợi ý thuốc và liều cho bình điện 16 lít', '#/phunbon');
    const dh = maDH ? ((await API.goi('docNhieu', { ds: [{ bang: 'DichHai', loc: { 'Mã DH': maDH } }] })).DichHai[0] || null) : null;
    const st = { loai: 'Phun thuốc', md: dh ? 'Điều trị' : 'Phòng', nhom: dh ? (/cỏ/i.test(dh['Nhóm cây']) ? 'Thảm cỏ' : /bóng mát/i.test(dh['Nhóm cây']) ? 'Cây bóng mát' : 'Cây bụi') : 'Cây bụi', dt: dh ? dh['Loại dịch hại'] : '', cay: dh ? dh['Tên cây'] : '', binh: 1, sp: [], vt: { cum: '', mat: 'Cả 3', chon: new Set(dh && dh['Mã vị trí'] ? [dh['Mã vị trí']] : []) } };
    const ve = () => {
      const bon = st.loai === 'Bón gốc';
      const dsCay = S.dm.cay.filter((c) => NHOM_CAY[st.nhom] && NHOM_CAY[st.nhom].test(c.nhom));
      const dhCay = st.cay ? ((S.dm.cay.find((c) => c.ten === st.cay) || {}).dh || '') : '';
      const dsDH = (S.dm.dhThuoc || []).map((x) => x.dh);
      const g = !bon && st.loai === 'Phun thuốc' && st.dt ? G.goiYThuoc(st.dt) : null;
      const ky = [];
      st.sp.forEach((a) => st.sp.forEach((b) => { if (a !== b && a.t.khongPha && b.t !== a.t && new RegExp((b.t.tenNgan || b.t.ten).split(' ')[0], 'i').test(a.t.khongPha)) ky.push(`${a.t.tenNgan || a.t.ten} không pha chung với ${b.t.tenNgan || b.t.ten}`); }));
      st.sp.forEach((a) => { if (/phân bón lá/i.test(a.t.khongPha || '') && st.sp.some((b) => b !== a && /lá|kích|vitamin|atonik|N3M/i.test(b.t.nhom + b.t.ten))) ky.push(`${a.t.tenNgan || a.t.ten} không pha chung với phân bón lá`); });
      st.ky = [...new Set(ky)];
      const cl = st.sp.reduce((x, y) => Math.max(x, +y.t.cachLy || 0), 0);
      m.innerHTML = `<div class="the"><div class="buoc"><span>1</span>Loại và mục đích</div><div class="chon boc" id="cLoai">${S.dm.loaiPB.map((x) => `<button type="button" data-v="${x}" class="${st.loai === x ? 'dang' : ''}">${x}</button>`).join('')}</div>
        ${st.loai === 'Phun thuốc' ? `<div class="hai-nut" style="margin-top:6px"><button type="button" data-md="Phòng" class="${st.md === 'Phòng' ? 'dang xanh' : ''}">Phòng</button><button type="button" data-md="Điều trị" class="${st.md === 'Điều trị' ? 'dang vang' : ''}">Điều trị</button></div>` : ''}
        <div class="buoc" style="margin-top:10px"><span>2</span>Nhóm cây${st.loai === 'Phun thuốc' ? ', cây, đối tượng' : ''}</div><div class="chon boc" id="cNhom">${NHOM_PB.map((x) => `<button type="button" data-v="${x}" class="${st.nhom === x ? 'dang' : ''}">${x}</button>`).join('')}</div>
        ${st.loai === 'Phun thuốc' ? `<div id="oCay" style="margin-top:6px"></div>${dhCay ? `<p class="mo" style="margin:6px 0 0">Hay gặp trên ${esc(st.cay)}: ${esc(dhCay)}</p>` : ''}
          <div class="chon boc" id="cDT" style="margin-top:6px">${dsDH.map((x) => `<button type="button" data-v="${esc(x)}" class="${st.dt === x ? 'dang' : ''} ${dhCay.includes(x) ? 'goi-y' : ''}">${esc(x)}</button>`).join('')}</div>` : ''}</div>
        ${g ? `<div class="the goi-y-thuoc"><div class="hang"><div class="gian"><b>Gợi ý cho ${esc(st.dt)}</b><div class="mo">${esc(g.nhan)}</div></div></div>
          ${g.spChinh ? `<div class="dong-goiy"><span class="gian"><b>${esc(g.spChinh.t.tenNgan || g.spChinh.t.ten)}</b><small>thuốc chính · cách ly ${g.spChinh.t.cachLy} ngày</small></span><b class="lieu">${esc(g.spChinh.lieu)} ${esc(g.spChinh.dvt)}</b><small>/bình 16L</small></div>` : `<div class="canh-bao do" style="margin:8px 0 0">${esc(g.chinh)} · ${esc(g.ghi)}</div>`}
          ${g.spLuan ? `<div class="dong-goiy"><span class="gian"><b>${esc(g.spLuan.t.tenNgan || g.spLuan.t.ten)}</b><small>luân phiên lần sau</small></span><b class="lieu">${esc(g.spLuan.lieu)} ${esc(g.spLuan.dvt)}</b><small>/bình</small></div>` : ''}
          ${g.ghi && g.spChinh ? `<p class="mo" style="margin:6px 0 0">${esc(g.ghi)}</p>` : ''}${g.spChinh ? '<button type="button" class="nut nho" id="dungGY" style="margin-top:8px">Dùng gợi ý</button>' : ''}</div>` : ''}
        <div class="the"><div class="buoc"><span>3</span>${bon ? 'Phân và khối lượng' : 'Thuốc, phân pha trong bình 16L'}</div>
          ${st.sp.map((x, i) => `<div class="dong-sp"><div><b style="font-size:13px">${esc(x.t.tenNgan || x.t.ten)}</b><div class="mo">${x.t.lieu16 ? 'Nhãn: ' + esc(x.t.lieu16) + ' · ' : ''}cách ly ${x.t.cachLy} ngày</div></div>
            <input type="number" step="any" inputmode="decimal" placeholder="${bon ? 'kg' : 'Liều'}" value="${esc(x.lieu)}" data-l="${i}"><button class="xx" data-x="${i}">✕</button></div>
            ${bon ? '' : `<div class="chon boc" style="margin:-2px 0 8px">${['ml', 'g', 'gói'].map((u) => `<button type="button" data-u="${i}" data-v="${u}" class="${x.dvt === u ? 'dang' : ''}">${u}/bình</button>`).join('')}</div>`}`).join('')}
          <button type="button" class="nut rong" id="themSP">＋ Thêm thuốc / phân</button>
          ${st.ky.length ? `<div class="canh-bao do" style="margin-top:8px">⚠️ Cảnh báo tương kỵ: ${st.ky.map(esc).join('; ')}. Lưu vẫn được nhưng anh Vũ sẽ được báo.</div>` : ''}</div>
        ${bon ? '' : `<div class="the"><div class="hang"><div class="gian"><b>Số bình 16L</b><div class="mo">${st.sp.map((x) => `${esc(x.t.tenNgan || x.t.ten)}: ${G.so((+x.lieu || 0) * st.binh, 2)} ${esc(x.dvt)}`).join(' · ') || 'Chưa chọn thuốc'}</div></div>
          <button type="button" class="tron" id="tru">−</button><b class="so-vua" style="min-width:34px;text-align:center">${st.binh}</b><button type="button" class="tron chinh" id="cong">＋</button></div></div>`}
        <div class="the"><div class="buoc"><span>4</span>Vị trí <small class="mo">· villa chọn riêng từng mặt</small></div><div id="lv"></div></div>
        <div class="the"><div id="f2"></div></div>
        <div class="the" style="background:var(--xanh-nhat)">Cách ly: <b>${cl} ngày</b>${cl ? ` · hết cách ly ${G.ngayVN(G.congNgay(hn(), cl))}` : ''}${DV_PHUN[st.nhom] && st.loai === 'Phun thuốc' ? `<br>Lưu xong tự đánh dấu định kỳ "${esc(G.dvTen(DV_PHUN[st.nhom]))}" cho các vị trí đã chọn.` : DV_BON[st.nhom] && bon ? `<br>Lưu xong tự đánh dấu định kỳ "${esc(G.dvTen(DV_BON[st.nhom]))}".` : ''}</div>
        <button class="nut chinh rong" id="luu" style="margin-bottom:30px">Lưu nhật ký</button>`;
      m.querySelectorAll('#cLoai [data-v]').forEach((b) => { b.onclick = () => { st.loai = b.dataset.v; ve(); }; });
      m.querySelectorAll('[data-md]').forEach((b) => { b.onclick = () => { st.md = b.dataset.md; ve(); }; });
      m.querySelectorAll('#cNhom [data-v]').forEach((b) => { b.onclick = () => { st.nhom = b.dataset.v; st.cay = ''; ve(); }; });
      m.querySelectorAll('#cDT [data-v]').forEach((b) => { b.onclick = () => { st.dt = b.dataset.v; ve(); }; });
      const oc = m.querySelector('#oCay');
      if (oc) { const c = G.oChon(oc, 'Cây bị hại / cây phun (không bắt buộc)', () => G.chonHaiBuoc('Chọn cây', [{ ten: st.nhom, ds: dsCay.map((x) => ({ ten: x.ten, phu: x.dh })) }], { choKhac: true }), st.cay || null); c.doi = (x) => { st.cay = x.ten; ve(); }; }
      const dg = m.querySelector('#dungGY'); if (dg) dg.onclick = () => { st.sp = [g.spChinh]; if (/Thần Hổ/i.test(g.ghi)) { const th = S.dm.thuoc.find((t) => /thần hổ/i.test(t.ten)); if (th) st.sp.push({ t: th, lieu: 5, dvt: 'ml' }); } ve(); };
      m.querySelectorAll('[data-l]').forEach((i) => { i.onchange = () => { st.sp[+i.dataset.l].lieu = i.value; ve(); }; });
      m.querySelectorAll('[data-x]').forEach((b) => { b.onclick = () => { st.sp.splice(+b.dataset.x, 1); ve(); }; });
      m.querySelectorAll('[data-u]').forEach((b) => { b.onclick = () => { st.sp[+b.dataset.u].dvt = b.dataset.v; ve(); }; });
      m.querySelector('#themSP').onclick = async () => { const t = await G.chonThuoc(); if (t) { const l = docLieu(t.t.lieu16); st.sp.push({ t: t.t, lieu: bon ? '' : l ? l.n : '', dvt: l ? l.dvt : /chai|ml|l$/i.test(t.t.dvt) ? 'ml' : 'g' }); ve(); } };
      const tr = m.querySelector('#tru'); if (tr) tr.onclick = () => { st.binh = Math.max(1, st.binh - 1); ve(); };
      const cg = m.querySelector('#cong'); if (cg) cg.onclick = () => { st.binh++; ve(); };
      const dsVT = S.dm.vitri.filter((v) => v.ap === 'Có').concat(st.nhom === 'Hàng rào' ? G.dsVT('DV37') : []).concat(st.nhom === 'Thủy sinh' ? G.dsVT('DV38') : []);
      G.luoiVT(m.querySelector('#lv'), { ds: st.nhom === 'Thủy sinh' ? G.dsVT('DV38') : st.nhom === 'Hàng rào' ? G.dsVT('DV37') : dsVT, st: st.vt, trangThai: () => ({ cls: '' }), coMat: true });
      st.lay2 = G.form(m.querySelector('#f2'), [{ k: 'bh', nhan: 'Bảo hộ đã dùng', loai: 'nhieu', ds: S.dm.baoHo, gt: st.bh || ['Khẩu trang', 'Găng tay'] }, { k: 'anh', nhan: 'Ảnh (có ảnh thì tự đánh dấu định kỳ)', loai: 'anh', toiDa: 4 }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
      m.querySelector('#luu').onclick = (e) => chay(async () => {
        const b = st.lay2(); const vts = [...st.vt.chon]; const bonG = st.loai === 'Bón gốc';
        if (!st.sp.length) throw new Error('Thêm ít nhất 1 thuốc / phân'); if (st.sp.some((x) => !(+x.lieu > 0))) throw new Error(bonG ? 'Nhập khối lượng (kg) từng loại phân' : 'Nhập liều / bình cho từng loại');
        if (!vts.length) throw new Error('Chọn vị trí');
        const cl2 = st.sp.reduce((x, y) => Math.max(x, +y.t.cachLy || 0), 0); const ngay = hn(); const v0 = G.vt(vts[0]) || {};
        const nk = await API.goi('ghi', { bang: 'NhatKyPhunBon', dong: { 'Mã NK': '', 'Ngày giờ': API.bayGio().slice(0, 16), 'Loại (Phun thuốc/Phun phân bón lá/Bón gốc)': st.loai, 'Mục đích': st.loai === 'Phun thuốc' ? st.md : '', 'Nhóm cây': st.nhom, 'Tên cây': st.cay, 'Đối tượng': st.dt,
          'Công thức pha': '', 'Cụm': [...new Set(vts.map((x) => (G.vt(x) || {}).cum))].join(', '), 'Mã vị trí': vts.join(' | '), 'Vị trí chi tiết': vts.length > 1 ? G.tenVT(vts.join('|')) : (v0.ten || ''), 'Số bình': bonG ? '' : st.binh, 'Bảo hộ': b.bh,
          'Cách ly dài nhất (ngày)': cl2, 'Hết cách ly': cl2 ? G.congNgay(ngay, cl2) : '', 'Ảnh': b.anh, 'Mã dịch hại': maDH || '', 'Cảnh báo pha': st.ky.join('; '), 'Ghi chú': b.gc, 'Người ghi': '' } });
        await API.goi('ghiNhieu', { bang: 'NhatKyPhunBonChiTiet', dong: st.sp.map((x, i) => ({ 'Mã NK': nk['Mã NK'], 'STT': i + 1, 'Sản phẩm': x.t.ten, 'Liều / bình': bonG ? '' : x.lieu, 'ĐVT': bonG ? 'kg' : x.dvt, 'Tổng lượng': bonG ? +x.lieu : (+x.lieu) * st.binh, 'Cách ly (ngày)': x.t.cachLy })) });
        if (maDH) await API.goi('ghi', { bang: 'DichHaiCapNhat', dong: { 'Mã DH': maDH, 'Thời điểm': '', 'Việc đã làm': st.loai + ': ' + st.sp.map((x) => x.t.tenNgan || x.t.ten).join(' + '), 'Mã NK phun bón': nk['Mã NK'], 'Ảnh': b.anh, 'Người ghi': '' } }).catch(() => {});
        const dv = st.loai === 'Phun thuốc' ? DV_PHUN[st.nhom] : bonG ? DV_BON[st.nhom] : null; let tu = '';
        if (dv && b.anh.length) {
          const hop_ = G.dsVT(dv).map((v) => v.ma); const ds = vts.filter((x) => hop_.includes(x));
          if (ds.length) { try { const t = (await API.goi('docNhieu', { ds: [{ bang: 'TickDinhKy', loc: { 'Kỳ': S.dm.ky.ten, 'Mã việc': dv } }] })).TickDinhKy; const da = new Set(t.filter((r) => (r['Trạng thái'] || 'Xong') === 'Xong').map((r) => r['Mã vị trí']));
            await API.goi('dinhKy.luu', { viec: dv, trangThai: 'Xong', anh: b.anh.slice(0, 2), maNK: nk['Mã NK'], ghiChu: 'Từ nhật ký ' + nk['Mã NK'], ds: ds.map((vt) => ({ vt, kv: (G.vt(vt) || {}).kv, lyDo: da.has(vt) ? 'Theo yêu cầu' : '' })) }); tu = ` · đã đánh dấu ${ds.length} vị trí ${G.dvTen(dv)}`; } catch (er) { tu = ' · chưa đánh dấu định kỳ: ' + er.message; } }
        } else if (dv) tu = ' · không có ảnh nên chưa đánh dấu định kỳ';
        bao('Đã lưu nhật ký ' + nk['Mã NK'] + (cl2 ? ` · cách ly đến ${G.ngayVN(G.congNgay(ngay, cl2))}` : '') + tu); location.hash = maDH ? '#/dichhai' : '#/phunbon';
      }, e.target);
    };
    ve();
  }
  G.man.thuoc = Object.assign(G.man.thuoc, { ic: 'thuoc' });

  /* ================= TRỒNG CÂY: 3 ảnh trước / trong / sau, gợi ý dự án theo vị trí ================= */
  G.duAnGoiY = (dsDA, maVT) => { const v = G.vt(maVT) || {}; return dsDA.filter((a) => a['Trạng thái'] !== 'Hoàn thành').map((a) => { const vs = String(a['Mã vị trí']).split('|').map((s) => s.trim()); return { a, diem: vs.includes(maVT) ? 2 : vs.some((x) => (G.vt(x) || {}).cum === v.cum) ? 1 : 0 }; }).sort((x, y) => y.diem - x.diem); };
  const trongGoc = G.man.sotrongcay.fn;
  G.man.sotrongcay = Object.assign(G.man.sotrongcay, { ic: 'trong_cay', fn: async () => {
    await trongGoc(); const moi = document.querySelector('#moi'); if (!moi) return;
    const dsDA = q('duan') ? (await API.goi('docNhieu', { ds: [{ bang: 'DuAn' }] })).DuAn : [];
    moi.onclick = () => formTrong({ tieuDe: 'Ghi trồng cây', dsDA, luu: async (v, cay, anh) => {
      const so = (await API.goi('docNhieu', { ds: [{ bang: 'SoTrongCay', gioiHan: 5000 }] })).SoTrongCay.length;
      await API.goi('ghiNhieu', { bang: 'SoTrongCay', dong: cay.map((x, i) => ({ 'STT': so + i + 1, 'Thời gian': v.tg, 'Khu vực': v.vt.kv || '', 'Mã vị trí': v.vt.ma || '', 'Vị trí khác': v.vt.ma ? '' : v.vt.ten, 'Hình thức': v.ht, 'Nguồn cây': v.nc, 'Mã cây': x.c.ma || '', 'Tên cây': x.c.ten, 'ĐVT': x.dvt, 'Số lượng': x.sl,
        'Chất cải tạo đất hữu cơ (bao)': i === 0 ? v.bao : '', 'Cây trước khi cải tạo': v.truoc, 'Ghi chú': v.gc, 'Ảnh trước': i === 0 ? anh.tr : [], 'Ảnh trong': i === 0 ? anh.tg : [], 'Ảnh sau': i === 0 ? anh.sa : [], 'Ảnh': i === 0 ? anh.tr.concat(anh.tg, anh.sa) : [], 'Mã DA': v.da, 'Mã phiếu': '', 'Người ghi': '' })) });
      bao('Đã ghi ' + cay.length + ' loại cây' + (v.da ? ' · đã cộng vào dự án ' + v.da : '')); G.taiLai();
    } });
  } });
  function formTrong(c) {
    const cay = [];
    hop(c.tieuDe, `<div id="f"></div><h3 class="tieu-nhom">Cây trồng</h3><div id="dc"></div><button class="nut rong" id="them">＋ Thêm loại cây</button><div id="f2" style="margin-top:12px"></div>
      <div id="da"></div><h3 class="tieu-nhom">Ảnh (bắt buộc đủ 3 loại)</h3>${c.phieu ? '<div class="o"><span class="nhan-o">Ảnh trước khi trồng</span><div id="a1"></div></div><p class="mo">Ảnh trong và sau khi trồng: người làm chụp khi báo xong.</p>' : '<div class="o"><span class="nhan-o">Ảnh trước</span><div id="a1"></div></div><div class="o"><span class="nhan-o">Ảnh trong khi trồng</span><div id="a2"></div></div><div class="o"><span class="nhan-o">Ảnh sau</span><div id="a3"></div></div>'}
      <button class="nut chinh rong" id="l">${esc(c.nut || 'Lưu')}</button>`, (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'tg', nhan: 'Ngày trồng', loai: 'ngay', bb: true }, { k: 'vt', nhan: 'Vị trí (cụm → vị trí)', loai: 'vitri', bb: true }, { k: 'ht', nhan: 'Hình thức', loai: 'chips', ds: c.hinhThuc || S.dm.hinhThuc, bb: true }, { k: 'nc', nhan: 'Nguồn cây', loai: 'chips', ds: S.dm.nguonCay, bb: true }].concat(c.truongThem || []));
      const lay2 = G.form(o.querySelector('#f2'), [{ k: 'bao', nhan: 'Chất cải tạo đất hữu cơ (bao, 1 bao = 25 kg)', loai: 'so' }, { k: 'truoc', nhan: 'Cây trước khi cải tạo', loai: 'chu' }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
      let da = ''; const veDA = (maVT) => { const g = G.duAnGoiY(c.dsDA || [], maVT); const de = g.find((x) => x.diem > 0); if (de && !da) da = de.a['Mã DA'];
        o.querySelector('#da').innerHTML = g.length ? `<div class="o"><span class="nhan-o">Thuộc dự án ${de ? '(app gợi ý theo vị trí)' : ''}</span><div class="chon boc">${['', ...g.map((x) => x.a['Mã DA'])].map((m_) => { const a = g.find((x) => x.a['Mã DA'] === m_); return `<button type="button" data-da="${esc(m_)}" class="${da === m_ ? 'dang' : ''}">${m_ ? esc(m_ + ' · ' + a.a['Tên']) + (a.diem ? ' ★' : '') : 'Không thuộc dự án'}</button>`; }).join('')}</div></div>` : '';
        o.querySelectorAll('[data-da]').forEach((b) => { b.onclick = () => { da = b.dataset.da; veDA(maVT); }; }); };
      veDA('');
      const vtEl = o.querySelector('#f [data-f="1"]'); new MutationObserver(() => { const v = lay.__vt; void v; }).observe(vtEl, { childList: true, subtree: true });
      vtEl.addEventListener('click', () => setTimeout(function chk() { if (document.querySelector('.lop-phu .ds2')) return setTimeout(chk, 300); try { const v = lay(); if (v.vt) veDA(v.vt.ma || ''); } catch (e) { const t = vtEl.textContent; const vv = S.dm.vitri.find((x) => t.includes(x.ten) && t.includes(x.kv)); if (vv) veDA(vv.ma); } }, 300));
      const a1 = G.oAnh(o.querySelector('#a1'), { batBuoc: true, toiDa: 3 }); const a2 = o.querySelector('#a2') ? G.oAnh(o.querySelector('#a2'), { batBuoc: true, toiDa: 3 }) : null; const a3 = o.querySelector('#a3') ? G.oAnh(o.querySelector('#a3'), { batBuoc: true, toiDa: 3 }) : null;
      const ve = () => { o.querySelector('#dc').innerHTML = cay.map((x, i) => `<div class="the" style="padding:10px;margin-bottom:6px"><div class="hang"><b class="gian">${esc(x.c.ten)}</b><button class="nut nho" data-x="${i}">✕</button></div><div class="dong-sp" style="grid-template-columns:1fr 1fr"><input type="number" placeholder="Số lượng" data-sl="${i}" value="${esc(x.sl)}"><select data-dvt="${i}">${S.dm.dvt.map((u) => `<option ${u === x.dvt ? 'selected' : ''}>${u}</option>`).join('')}</select></div></div>`).join('');
        o.querySelectorAll('[data-sl]').forEach((i) => { i.oninput = () => { cay[+i.dataset.sl].sl = i.value; }; }); o.querySelectorAll('[data-dvt]').forEach((s) => { s.onchange = () => { cay[+s.dataset.dvt].dvt = s.value; }; }); o.querySelectorAll('[data-x]').forEach((b) => { b.onclick = () => { cay.splice(+b.dataset.x, 1); ve(); }; }); };
      o.querySelector('#them').onclick = async () => { const x = await G.chonCay(true); if (x) { cay.push({ c: x, sl: '', dvt: /bóng mát/i.test(x.nhom || '') ? 'Cây' : /cỏ/i.test(x.nhom || '') ? 'm²' : 'Bụi' }); ve(); } };
      o.querySelector('#l').onclick = (e) => chay(async () => {
        const v = Object.assign(lay(), lay2(), { da }); if (!cay.length) throw new Error('Thêm ít nhất 1 loại cây'); if (cay.some((x) => !(+x.sl > 0))) throw new Error('Nhập số lượng từng loại cây');
        const anh = { tr: a1.kiemTra(), tg: a2 ? a2.kiemTra() : [], sa: a3 ? a3.kiemTra() : [] };
        await c.luu(v, cay, anh); dong();
      }, e.target);
    }, true);
  }
  /* phiếu trồng dặm / trồng cải tạo: duyệt xong tự ghi Sổ trồng cây và tiến độ dự án */
  G.taoPhieuTrong = async (opt) => {
    const dsDA = q('duan') ? (await API.goi('docNhieu', { ds: [{ bang: 'DuAn' }] })).DuAn : [];
    formTrong({ tieuDe: 'Phiếu trồng dặm, trồng cải tạo', phieu: true, nut: 'Tạo phiếu', dsDA, hinhThuc: ['Trồng dặm', 'Trồng cải tạo'],
      truongThem: [{ k: 'giao', nhan: 'Giao cho', loai: 'chips', ds: G.GIAO_CHO(), bb: true }, { k: 'muc', nhan: 'Mức độ', loai: 'chips', ds: G.MUC, gt: 'Trung bình', bb: true }],
      luu: async (v, cay, anh) => {
        const r = await API.goi('phieu.tao', { loaiPhieu: 'Trồng cây', loai: v.ht + ': ' + cay.map((x) => `${x.c.ten} ${x.sl} ${x.dvt}`).join(', '), nhom: 'Trồng cây', muc: v.muc, vt: v.vt.ma || '', vtKhac: v.vt.ma ? '' : v.vt.ten, giao: v.giao, nguon: 'Nhân viên tự phát hiện', moTa: v.gc, anh: anh.tr, maDA: v.da,
          trong: { ht: v.ht, nc: v.nc, kv: v.vt.kv || '', bao: v.bao, truoc: v.truoc, da: v.da, cay: cay.map((x) => ({ ma: x.c.ma || '', ten: x.c.ten, sl: x.sl, dvt: x.dvt })) } });
        bao('Đã tạo phiếu ' + r.ma + '. Anh Vũ duyệt thì tự ghi Sổ trồng cây.'); if (opt && opt.sau) opt.sau(r);
      } });
  };
  G.moTaTrong = (p) => { try { const c = JSON.parse(p['Chi tiết trồng']); return `<div class="the" style="padding:10px;background:var(--xanh-nhat)"><b>${esc(c.ht)}</b> · ${esc(c.nc)}<div class="mo">${c.cay.map((x) => `${esc(x.ten)} ${esc(x.sl)} ${esc(x.dvt)}`).join(' · ')}${c.bao ? ` · ${esc(c.bao)} bao cải tạo đất` : ''}${c.da ? ` · dự án ${esc(c.da)}` : ''}</div><div class="mo">Anh Vũ duyệt → tự ghi Sổ trồng cây${c.da ? ' và tiến độ dự án' : ''}.</div></div>`; } catch (e) { return ''; } };

  /* ================= KẾ HOẠCH TUẦN: A định kỳ, B việc khác (động từ → đối tượng → vị trí → người → hạn) ================= */
  const DONG_TU = ['Cắt tỉa', 'Trồng', 'Dọn, vệ sinh', 'Phun', 'Bón', 'Sửa', 'Kiểm tra', 'Chuẩn bị', 'Khác'];
  const ngayCua = (s) => String(s || '').slice(0, 10);
  G.man.kehoach = Object.assign(G.man.kehoach, { ic: 'ke_hoach', fn: async () => {
    const st = G.man.kehoach.st || (G.man.kehoach.st = { tu: G.dauTuan(), ngay: '', doi: '' });
    const tuan = G.tuan(st.tu); const den = G.congNgay(st.tu, 6);
    const m = G.khung('Kế hoạch tuần', `${tuan} · ${G.ngayVN(st.tu).slice(0, 5)}–${G.ngayVN(den).slice(0, 5)}`);
    const can = (b) => q(API.BANG[b][0]) >= 1;
    const d = await API.goi('docNhieu', { ds: [{ bang: 'KeHoachTuan', loc: { 'Tuần': tuan } }, { bang: 'KeHoachDinhKy', gioiHan: 2000 }].concat(can('Phieu') ? [{ bang: 'Phieu', gioiHan: 300 }] : []).concat(can('SuKien') ? [{ bang: 'SuKien', gioiHan: 100 }] : []) });
    const A = d.KeHoachDinhKy.filter((x) => x['Từ ngày'] <= den && x['Đến ngày'] >= st.tu && (!st.doi || x['Đội'] === st.doi) && (!st.ngay || (x['Từ ngày'] <= st.ngay && x['Đến ngày'] >= st.ngay)));
    const B = d.KeHoachTuan.filter((x) => (!st.doi || x['Đội/Người'] === st.doi) && (!st.ngay || (x['Từ ngày'] || st.tu) <= st.ngay && x['Hạn'] >= st.ngay));
    const duyet = q('kehoach') >= 3; const MAU = { 'Đăng ký': 'cam', 'Đã giao': '', 'Xong': 'xanh', 'Trễ': 'do' };
    const goiY = [];
    (d.Phieu || []).filter((p) => p['Trạng thái'] !== 'Đã duyệt').forEach((p) => goiY.push({ dt: 'Sửa', nd: p['Loại lỗi'], vt: p['Mã vị trí'], han: ngayCua(p['Hạn']), muc: p['Mức độ'], nguon: 'Phiếu ' + p['Mã phiếu'] }));
    (d.SuKien || []).filter((s) => ngayCua(s['Bắt đầu']) >= st.tu && ngayCua(s['Bắt đầu']) <= den).forEach((s) => goiY.push({ dt: 'Chuẩn bị', nd: 'sự kiện ' + s['Tên'], vt: s['Mã vị trí'], han: ngayCua(s['Bắt đầu']), muc: 'Cao', nguon: 'Sự kiện' }));
    const ngays = []; for (let i = 0; i < 7; i++) ngays.push(G.congNgay(st.tu, i));
    const dongB = (x) => `${esc(x['Động từ'] || '')} ${esc(x['Đối tượng'] || x['Nội dung'])}`.trim();
    m.innerHTML = `<div class="nhom-nut" style="margin-bottom:10px"><button class="nut nho" id="truoc">‹ Tuần trước</button><button class="nut nho" id="zalo">📤 Gửi Zalo</button><button class="nut nho" id="sau">Tuần sau ›</button></div>
      <div class="chon boc"><button data-ng="" class="${!st.ngay ? 'dang' : ''}">Cả tuần</button>${ngays.map((n) => `<button data-ng="${n}" class="${st.ngay === n ? 'dang' : ''}">${G.thu(n).replace('Thứ ', 'T').replace('Chủ nhật', 'CN')} ${G.ngayVN(n).slice(0, 5)}</button>`).join('')}</div>
      <div class="chon"><button data-doi="" class="${!st.doi ? 'dang' : ''}">Mọi đội</button>${['Đội khu vực', 'Đội cơ động', 'Nhân viên nội bộ'].map((x) => `<button data-doi="${x}" class="${st.doi === x ? 'dang' : ''}">${x}</button>`).join('')}</div>
      <h3 class="tieu-nhom">A. Việc định kỳ (${A.length})</h3><div class="ds">${A.map((x) => `<div class="muc"><div class="gian"><b>${esc(G.dvTen(x['Mã việc']))}</b><div class="mo">${esc(x['Cụm'])}${x['Khu vực'] ? ' · ' + esc(x['Khu vực']) : ''} · ${esc(x['Đội'])} · ${G.ngayVN(x['Từ ngày']).slice(0, 5)}–${G.ngayVN(x['Đến ngày']).slice(0, 5)}</div></div><span class="chip">${x['Trạng thái duyệt'] === 'Đã duyệt' ? 'Đã duyệt' : 'Chờ'}</span></div>`).join('') || '<div class="muc mo">Không có kế hoạch định kỳ trong tuần (lập ở Kế hoạch định kỳ tháng)</div>'}</div>
      <h3 class="tieu-nhom">B. Việc khác (${B.length})</h3>${q('kehoach') >= 2 ? '<button class="nut chinh rong" id="moi" style="margin-bottom:8px">＋ Thêm việc: động từ → đối tượng → vị trí → người → hạn</button>' : ''}
      ${duyet && B.some((x) => x['Trạng thái'] === 'Đăng ký') ? '<button class="nut rong" id="giaoHet" style="margin-bottom:8px">Giao việc: chốt tất cả mục đã đăng ký</button>' : ''}
      <div class="ds">${B.map((x) => `<div class="muc" data-i="${esc(x['Mã KHT'])}" style="cursor:pointer"><div class="gian"><b>${dongB(x)}</b><div class="mo">📍 ${esc(G.tenVT(x['Mã vị trí']))} · 👤 ${esc(x['Đội/Người'])} · ⏰ hạn ${G.ngayVN(x['Hạn']).slice(0, 5)}${x['Lý do trễ'] ? ' · trễ: ' + esc(x['Lý do trễ']) : ''}</div></div><span class="chip ${MAU[x['Trạng thái']] || ''}">${esc(x['Trạng thái'])}</span></div>`).join('') || '<div class="muc mo">Chưa có việc</div>'}</div>
      ${goiY.length && q('kehoach') >= 2 ? `<h3 class="tieu-nhom">Gợi ý từ phiếu, sự kiện (${goiY.length})</h3><div class="ds">${goiY.slice(0, 30).map((g, i) => `<div class="muc"><div class="gian">${esc(g.dt + ' ' + g.nd)}<div class="mo">${esc(g.nguon)} · hạn ${G.ngayVN(g.han).slice(0, 5)}</div></div><button class="nut nho" data-g="${i}">Thêm</button></div>`).join('')}</div>` : ''}`;
    m.querySelector('#truoc').onclick = () => { st.tu = G.congNgay(st.tu, -7); st.ngay = ''; G.taiLai(); };
    m.querySelector('#sau').onclick = () => { st.tu = G.congNgay(st.tu, 7); st.ngay = ''; G.taiLai(); };
    m.querySelectorAll('[data-ng]').forEach((b) => { b.onclick = () => { st.ngay = b.dataset.ng; G.taiLai(); }; });
    m.querySelectorAll('[data-doi]').forEach((b) => { b.onclick = () => { st.doi = b.dataset.doi; G.taiLai(); }; });
    m.querySelector('#zalo').onclick = () => G.guiZalo(`🗒️ KẾ HOẠCH TUẦN ${tuan} (${G.ngayVN(st.tu).slice(0, 5)}–${G.ngayVN(den).slice(0, 5)})${st.doi ? ' · ' + st.doi : ''}\nA. ĐỊNH KỲ\n${A.map((x) => `• ${G.dvTen(x['Mã việc'])} – ${x['Cụm']} – ${x['Đội']} – ${G.ngayVN(x['Từ ngày']).slice(0, 5)}→${G.ngayVN(x['Đến ngày']).slice(0, 5)}`).join('\n') || '—'}\nB. VIỆC KHÁC\n${B.map((x) => `• ${((x['Động từ'] || '') + ' ' + (x['Đối tượng'] || x['Nội dung'])).trim()} – ${G.tenVT(x['Mã vị trí'])} – ${x['Đội/Người']} – hạn ${G.ngayVN(x['Hạn']).slice(0, 5)}`).join('\n') || '—'}`, 'kehoach');
    const them = (gt) => hop('Thêm việc trong tuần', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'dt', nhan: '1. Động từ', loai: 'chips', ds: DONG_TU, bb: true, gt: gt && gt.dt }, { k: 'nd', nhan: '2. Đối tượng (cây, hạng mục)', loai: 'chu', bb: true, gt: gt && gt.nd, goiY: 'Ví dụ: hàng rào hoa giấy, cỏ lá gừng' },
        { k: 'vt', nhan: '3. Vị trí', loai: 'vitri', gt: gt && gt.vt ? { ma: gt.vt, ten: G.tenVT(gt.vt) } : null }, { k: 'ng', nhan: '4. Người / đội làm', loai: 'chips', ds: G.GIAO_CHO(), bb: true, gt: S.u.doi || '' },
        { k: 'tu', nhan: 'Bắt đầu', loai: 'ngay', bb: true, gt: st.ngay || st.tu }, { k: 'han', nhan: '5. Hạn', loai: 'ngay', bb: true, gt: gt && gt.han && gt.han <= den ? gt.han : den }, { k: 'muc', nhan: 'Mức độ', loai: 'chips', ds: G.MUC, gt: gt ? gt.muc : 'Trung bình' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); if (v.han < v.tu) throw new Error('Hạn trước ngày bắt đầu'); await API.goi('ghi', { bang: 'KeHoachTuan', dong: { 'Mã KHT': '', 'Tuần': tuan, 'Động từ': v.dt, 'Đối tượng': v.nd, 'Nội dung': v.dt + ' ' + v.nd, 'Mã vị trí': v.vt ? v.vt.ma || v.vt.ten : '', 'Đội/Người': v.ng, 'Từ ngày': v.tu, 'Hạn': v.han, 'Mức độ': v.muc, 'Nguồn': gt ? gt.nguon : 'Đăng ký', 'Trạng thái': duyet ? 'Đã giao' : 'Đăng ký' } }); dong(); G.taiLai(); }, e.target);
    });
    const moi = m.querySelector('#moi'); if (moi) moi.onclick = () => them();
    m.querySelectorAll('[data-g]').forEach((b) => { b.onclick = () => them(goiY[+b.dataset.g]); });
    const gh = m.querySelector('#giaoHet'); if (gh) gh.onclick = () => chay(async () => { await API.goi('sua', { bang: 'KeHoachTuan', khoa: { 'Tuần': tuan, 'Trạng thái': 'Đăng ký' }, doi: { 'Trạng thái': 'Đã giao' } }); bao('Đã giao việc'); G.taiLai(); }, gh);
    m.querySelectorAll('[data-i]').forEach((r) => { r.onclick = async () => { const x = d.KeHoachTuan.find((y) => y['Mã KHT'] === r.dataset.i); if (q('kehoach') < 2) return;
      const c = await G.chonDS('Cập nhật: ' + (x['Đối tượng'] || x['Nội dung']), ['Xong', 'Trễ'].concat(duyet ? ['Đã giao', 'Xóa khỏi kế hoạch'] : [])); if (!c) return;
      chay(async () => { if (c.ten === 'Xóa khỏi kế hoạch') await API.goi('xoa', { bang: 'KeHoachTuan', khoa: { 'Mã KHT': x['Mã KHT'] } }); else { const ly = c.ten === 'Trễ' ? await G.hoi('Lý do trễ') : ''; await API.goi('sua', { bang: 'KeHoachTuan', khoa: { 'Mã KHT': x['Mã KHT'] }, doi: { 'Trạng thái': c.ten, 'Lý do trễ': ly || '' } }); } G.taiLai(); }); }; });
  } });

  /* ================= LỊCH: Ngày / Tuần / Tháng / Năm ================= */
  G.man.lich = Object.assign(G.man.lich, { ic: 'lich', fn: async () => {
    const st = G.man.lich.st2 || (G.man.lich.st2 = { xem: 'Tháng', chon: hn() });
    const [y, mo] = st.chon.split('-').map(Number);
    let tu, den;
    if (st.xem === 'Ngày') { tu = den = st.chon; } else if (st.xem === 'Tuần') { tu = G.dauTuan(st.chon); den = G.congNgay(tu, 6); }
    else if (st.xem === 'Tháng') { tu = st.chon.slice(0, 7) + '-01'; den = API.ngay(new Date(y, mo, 0)); } else { tu = y + '-01-01'; den = y + '-12-31'; }
    const m = G.khung('Lịch', st.xem === 'Năm' ? 'Năm ' + y : st.xem === 'Tháng' ? `Tháng ${mo}/${y}` : st.xem === 'Tuần' ? `Tuần ${G.ngayVN(tu).slice(0, 5)}–${G.ngayVN(den).slice(0, 5)}` : `${G.thu(st.chon)} ${G.ngayVN(st.chon)}`);
    const can = (b) => q(API.BANG[b][0]) >= 1; const ds = [];
    [['SuKien'], ['DuAnGiaiDoan'], ['Phieu', 500], ['KeHoachDinhKy', 3000], ['ViecLapLai'], ['NhatKyPhunBon', 500], ['Hop', 300], ['DaoTao', 300], ['KeHoachTuan', 1000]].forEach(([b, n]) => { if (API.BANG[b] && can(b)) ds.push({ bang: b, gioiHan: n }); });
    const d = await API.goi('docNhieu', { ds });
    const su = {}; const themSK = (ngay, loai, ten, link) => { if (ngay >= tu && ngay <= den) (su[ngay] = su[ngay] || []).push({ loai, ten, link }); };
    const moiNgay = (a, b, fn) => { let n = a < tu ? tu : a; const e = b > den ? den : b; let i = 0; while (n && n <= e && i++ < 400) { fn(n); n = G.congNgay(n, 1); } };
    (d.SuKien || []).forEach((s) => themSK(ngayCua(s['Bắt đầu']), 'sukien', '🎉 ' + s['Tên'], 'sukien'));
    (d.DuAnGiaiDoan || []).forEach((g) => moiNgay(g['Bắt đầu'], g['Hoàn thành'], (n) => themSK(n, 'duan', '🏗️ ' + g['Mã DA'] + ' · ' + g['Nội dung'], 'duan/' + g['Mã DA'])));
    (d.Phieu || []).filter((p) => p['Trạng thái'] !== 'Đã duyệt' && /Khẩn cấp|Cao/.test(p['Mức độ'])).forEach((p) => themSK(ngayCua(p['Hạn']), p['Mức độ'] === 'Khẩn cấp' ? 'khan' : 'cao', '🎫 ' + p['Loại lỗi'], 'phieu'));
    (d.KeHoachDinhKy || []).forEach((k) => moiNgay(k['Từ ngày'], k['Đến ngày'], (n) => themSK(n, 'dinhky', '✅ ' + G.dvTen(k['Mã việc']) + ' · ' + k['Cụm'], 'dinhky/' + k['Mã việc'])));
    (d.KeHoachTuan || []).forEach((k) => themSK(k['Hạn'], 'dinhky', '🗒️ ' + ((k['Động từ'] || '') + ' ' + (k['Đối tượng'] || k['Nội dung'])).trim(), 'kehoach'));
    (d.NhatKyPhunBon || []).filter((p) => +p['Cách ly dài nhất (ngày)'] > 0).forEach((p) => moiNgay(ngayCua(p['Ngày giờ']), p['Hết cách ly'], (n) => themSK(n, 'cachly', '⚠️ Cách ly ' + G.tenVT(p['Mã vị trí'], p['Vị trí chi tiết'] || p['Cụm']), 'phunbon')));
    (d.Hop || []).forEach((h) => themSK(ngayCua(h['Bắt đầu']), 'sukien', '👥 Họp: ' + h['Tiêu đề'], 'hop'));
    (d.DaoTao || []).forEach((h) => themSK(h['Ngày'], 'duan', '🎓 Đào tạo: ' + h['Nội dung'], 'daotao'));
    moiNgay(tu, den, (n) => { const dd = new Date(n + 'T00:00:00'); (d.ViecLapLai || []).forEach((r) => { if (G.denHanLapLai && G.denHanLapLai(r, dd)) themSK(n, 'xam', '🔁 ' + r['Nội dung'], 'laplai'); }); G.lichNoiBo(dd).forEach((x) => themSK(n, 'xam', '🔧 ' + x[1], 'nb/may')); });
    (S.dm.ngayle || []).forEach((l) => { const p = String(l.ngay).split('/'); if (p.length === 3) themSK(`${p[2]}-${p[1]}-${p[0]}`, 'xam', '🎌 ' + l.ten, 'lich'); });
    const dsNgay = (n) => `<div class="ds">${(su[n] || []).map((e) => `<a class="muc" href="#/${e.link}" style="color:inherit;text-decoration:none"><span class="cham c-${e.loai}"></span><span class="gian">${esc(e.ten)}</span>›</a>`).join('') || '<div class="muc mo">Không có việc</div>'}</div>`;
    let than = '';
    if (st.xem === 'Ngày') than = dsNgay(st.chon);
    else if (st.xem === 'Tuần') { for (let i = 0; i < 7; i++) { const n = G.congNgay(tu, i); than += `<h3 class="tieu-nhom ${n === hn() ? 'hn' : ''}">${G.thu(n)} ${G.ngayVN(n).slice(0, 5)} <span>· ${(su[n] || []).length} việc</span></h3>${(su[n] || []).length ? dsNgay(n) : ''}`; } }
    else if (st.xem === 'Tháng') {
      const bd = (new Date(y, mo - 1, 1).getDay() + 6) % 7; const soN = new Date(y, mo, 0).getDate();
      let o = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((t) => `<div class="th">${t}</div>`).join(''); for (let i = 0; i < bd; i++) o += '<div class="ng ngoai"></div>';
      for (let i = 1; i <= soN; i++) { const n = `${st.chon.slice(0, 7)}-${String(i).padStart(2, '0')}`; const x = su[n] || []; o += `<div class="ng ${n === hn() ? 'hn' : ''}" data-n="${n}" style="${n === st.chon ? 'background:var(--xanh-nhat)' : ''}"><div class="s">${i}</div>${[...new Set(x.map((e) => e.loai))].map((l) => `<span class="cham c-${l}"></span>`).join('')}${x.length > 3 ? `<div class="mo">${x.length}</div>` : ''}</div>`; }
      than = `<div class="lich">${o}</div><h3 class="tieu-nhom">${G.thu(st.chon)}, ${G.ngayVN(st.chon)}</h3>${dsNgay(st.chon)}`;
    } else {
      than = `<div class="luoi-nam">${Array.from({ length: 12 }, (_, i) => { const th = `${y}-${String(i + 1).padStart(2, '0')}`; const n = Object.keys(su).filter((k) => k.startsWith(th)).reduce((a, k) => a + su[k].length, 0); const loai = {}; Object.keys(su).filter((k) => k.startsWith(th)).forEach((k) => su[k].forEach((e) => { loai[e.loai] = (loai[e.loai] || 0) + 1; }));
        return `<button class="o-thang" data-th="${th}"><b>Tháng ${i + 1}</b><span>${n} việc</span><div>${Object.keys(loai).map((l) => `<span class="cham c-${l}"></span>${loai[l]}`).join(' ')}</div></button>`; }).join('')}</div>`;
    }
    const buoc = { 'Ngày': 1, 'Tuần': 7 };
    m.innerHTML = `<div class="chon">${['Ngày', 'Tuần', 'Tháng', 'Năm'].map((x) => `<button data-xem="${x}" class="${st.xem === x ? 'dang' : ''}">${x}</button>`).join('')}</div>
      <div class="hang" style="margin-bottom:8px"><button class="nut nho" id="tr">‹</button><button class="nut nho gian" id="hnay">Hôm nay</button><button class="nut nho" id="sa">›</button></div>${than}
      <p class="mo" style="margin:8px 0"><span class="cham c-dinhky"></span>Định kỳ, kế hoạch <span class="cham c-khan"></span>Khẩn cấp <span class="cham c-cao"></span>Cao <span class="cham c-duan"></span>Dự án, đào tạo <span class="cham c-sukien"></span>Sự kiện, họp <span class="cham c-xam"></span>Bảo trì, lặp lại, lễ <span class="cham c-cachly"></span>Cách ly</p>`;
    const dich = (n) => { if (buoc[st.xem]) st.chon = G.congNgay(st.chon, n * buoc[st.xem]); else if (st.xem === 'Tháng') st.chon = API.ngay(new Date(y, mo - 1 + n, 1)); else st.chon = `${y + n}-01-01`; G.taiLai(); };
    m.querySelector('#tr').onclick = () => dich(-1); m.querySelector('#sa').onclick = () => dich(1); m.querySelector('#hnay').onclick = () => { st.chon = hn(); G.taiLai(); };
    m.querySelectorAll('[data-xem]').forEach((b) => { b.onclick = () => { st.xem = b.dataset.xem; G.taiLai(); }; });
    m.querySelectorAll('[data-n]').forEach((x) => { x.onclick = () => { st.chon = x.dataset.n; G.taiLai(); }; });
    m.querySelectorAll('[data-th]').forEach((x) => { x.onclick = () => { st.chon = x.dataset.th + '-01'; st.xem = 'Tháng'; G.taiLai(); }; });
  } });

  /* ================= CHẤM ĐIỂM: tiêu chí ≤ 2 điểm → tạo phiếu một lần ================= */
  G.phieuTuDiem = (rows) => {
    const kem = rows.filter((r) => +r['Điểm (1–5)'] <= 2);
    if (!kem.length) { bao('Đã lưu ' + rows.length + ' điểm'); G.taiLai(); return; }
    hop(`${kem.length} tiêu chí ≤ 2 điểm`, `<p class="mo" style="margin-top:0">Tạo phiếu sửa lỗi cho các mục dưới, giao theo đội phụ trách.</p><div class="ds">${kem.map((r) => `<div class="muc"><div class="gian"><b>${esc(r['Tiêu chí'])}</b><div class="mo">${esc(G.tenVT(r['Mã vị trí']))} · ${esc(r['Điểm (1–5)'])} điểm${r['Ghi chú'] ? ' · ' + esc(r['Ghi chú']) : ''}</div></div></div>`).join('')}</div>
      <div id="g"></div><button class="nut chinh rong" id="tao">Tạo ${kem.length} phiếu</button><button class="nut rong" id="bo" style="margin-top:8px">Không tạo</button>`, (o, dong) => {
      const giao = G.chips(o.querySelector('#g'), ['Đội khu vực', 'Đội cơ động'], 'Đội khu vực');
      o.querySelector('#bo').onclick = () => { dong(); G.taiLai(); };
      o.querySelector('#tao').onclick = (e) => chay(async () => { for (const r of kem) await API.goi('phieu.tao', { loai: 'Chưa đạt: ' + r['Tiêu chí'], nhom: 'Chấm điểm chất lượng', muc: +r['Điểm (1–5)'] <= 1 ? 'Cao' : 'Trung bình', vt: r['Mã vị trí'], giao: giao.gt, nguon: 'Tuần tra', moTa: `Chấm ${r['Điểm (1–5)']}/5${r['Ghi chú'] ? ': ' + r['Ghi chú'] : ''}` }); dong(); bao(`Đã tạo ${kem.length} phiếu`); G.taiLai(); }, e.target);
    });
  };

  /* ================= CÔNG NHÂN: anh Vũ thêm, sửa, chuyển đội, đổi trạng thái (không xóa), có nhật ký ================= */
  const cnGoc = G.man.congnhan.fn;
  G.man.congnhan = Object.assign(G.man.congnhan, { ic: 'cong_nhan', fn: async () => {
    if (q('congnhan') < 3) return cnGoc();
    await cnGoc(); const m = document.getElementById('noiDung');
    const cn = S.dm.congnhan || [];
    m.insertAdjacentHTML('afterbegin', `<button class="nut chinh rong" id="themCN" style="margin-bottom:10px">＋ Thêm công nhân</button><p class="mo">Bấm vào tên để sửa, chuyển đội, đổi trạng thái. Không xóa, chỉ chuyển "Đã nghỉ". Mọi lần sửa ghi nhật ký.</p>`);
    const da = cn.filter((x) => x.tt === 'Đã nghỉ');
    if (da.length) m.insertAdjacentHTML('beforeend', `<details class="the"><summary>Đã nghỉ (${da.length})</summary>${da.map((x) => `<div class="muc" data-sua="${x.ma}" style="cursor:pointer"><div class="gian">${esc(x.ten)}<div class="mo">${esc(x.ma)} · ${esc(x.cd)}</div></div></div>`).join('')}</details>`);
    m.querySelectorAll('.ds .muc').forEach((r) => { const ten = (r.querySelector('b') || {}).textContent; const x = cn.find((c) => c.ten === ten && r.textContent.includes(c.ma)); if (x) { r.dataset.sua = x.ma; r.style.cursor = 'pointer'; } });
    const sua = (x) => hop(x ? 'Sửa ' + x.ten : 'Thêm công nhân', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ten', nhan: 'Họ và tên', loai: 'chu', bb: true, gt: x && x.ten }, { k: 'doi', nhan: 'Đội', loai: 'chips', ds: ['Đội khu vực', 'Đội cơ động', 'Quản lý nhà thầu'], bb: true, gt: x && x.doi },
        { k: 'cd', nhan: 'Chức danh', loai: 'chips', ds: ['Tổ trưởng', 'Cắt cỏ', 'Vận chuyển', 'Bón phân + phun thuốc', 'Cắt tỉa cây bóng mát', 'Nhân viên khu vực', 'Nhân viên vườn ươm'], gt: x && x.cd }, { k: 'kv', nhan: 'Khu vực phụ trách', loai: 'chu', gt: x && x.kv },
        { k: 'sdt', nhan: 'Số điện thoại', loai: 'chu', gt: x && x.sdt }, { k: 'tt', nhan: 'Trạng thái', loai: 'chips', ds: ['Đang làm', 'Đã nghỉ'], bb: true, gt: (x && x.tt) || 'Đang làm' }, { k: 'ly', nhan: 'Lý do thay đổi', loai: 'chu' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('congNhan.sua', { ma: x ? x.ma : '', doi: { ten: v.ten, doi: v.doi, cd: v.cd, kv: v.kv, sdt: v.sdt, tt: v.tt }, lyDo: v.ly }); await G.taiDanhMuc(); dong(); bao('Đã lưu, có ghi nhật ký'); G.taiLai(); }, e.target);
    });
    m.querySelector('#themCN').onclick = () => sua(null);
    m.querySelectorAll('[data-sua]').forEach((r) => { r.onclick = () => sua(cn.find((c) => c.ma === r.dataset.sua)); });
  } });

  /* ================= HỌP: Định kỳ / Đột xuất → chương trình có số liệu → biên bản → giao việc → gửi ================= */
  async function soLieuHop() {
    const k = S.dm.ky; const can = (b) => q(API.BANG[b][0]) >= 1;
    const d = await API.goi('docNhieu', { ds: [{ bang: 'TickDinhKy', loc: { 'Kỳ': k.ten } }, can('Phieu') && { bang: 'Phieu', gioiHan: 500 }, can('DiemDanh') && { bang: 'DiemDanh', loc: { 'Ngày': { tu: G.congNgay(hn(), -7) } } }, can('RacHuuCo') && { bang: 'RacHuuCo', loc: { 'Ngày': { tu: k.tu } } }, can('ChamDiem') && { bang: 'ChamDiem', loc: { 'Ngày': { tu: k.tu } } }, can('VanChuyen') && { bang: 'VanChuyen', loc: { 'Ngày': { tu: k.tu } } }].filter(Boolean) });
    const nVT = S.dm.vitri.filter((v) => v.ap === 'Có').length; const td = {}; d.TickDinhKy.forEach((r) => { if ((r['Trạng thái'] || 'Xong') === 'Xong' && String(r['Lần'] || '1') === '1') td[r['Mã việc']] = (td[r['Mã việc']] || 0) + 1; });
    const dk = S.dm.dauviec.filter((v) => /^DV0[1-8]$|DV37|DV38/.test(v.ma)).map((v) => ({ ten: v.ten, p: Math.round((td[v.ma] || 0) / (G.dsVT(v.ma).length || nVT) * 100) }));
    const mo = (d.Phieu || []).filter((p) => p['Trạng thái'] !== 'Đã duyệt'); const qh = mo.filter((p) => p['Hạn'] && p['Hạn'] < API.bayGio());
    const cong = (d.DiemDanh || []).reduce((a, x) => a + (+x['Công'] || 0), 0); const rac = (d.RacHuuCo || []).reduce((a, x) => a + (+x['kg rác thu gom'] || 0), 0);
    const cd = (d.ChamDiem || []); const diem = cd.length ? cd.reduce((a, x) => a + +x['Điểm (1–5)'], 0) / cd.length : 0;
    const vc = (d.VanChuyen || []).reduce((a, x) => a + (+x['Số chuyến'] || 0), 0);
    return { dk, mo: mo.length, qh: qh.length, khan: mo.filter((p) => p['Mức độ'] === 'Khẩn cấp').length, cong, rac, diem, vc, k: k.ten };
  }
  const bieuDo = (dk) => `<svg viewBox="0 0 520 ${dk.length * 26 + 10}" width="100%" style="max-width:560px">${dk.map((x, i) => `<text x="0" y="${i * 26 + 18}" font-size="12">${esc(x.ten)}</text><rect x="210" y="${i * 26 + 6}" width="260" height="14" rx="7" fill="#E1E8E2"/><rect x="210" y="${i * 26 + 6}" width="${x.p * 2.6}" height="14" rx="7" fill="${x.p >= 50 ? '#1E6B3B' : '#D9A93E'}"/><text x="478" y="${i * 26 + 18}" font-size="12" font-weight="700">${x.p}%</text>`).join('')}</svg>`;
  G.man.hop = { ten: 'Họp', ic: 'hop', bt: '👥', nhom: 'Kế hoạch', ph: 'homnay', fn: async (ma) => {
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'Hop', gioiHan: 200 }] })).Hop.reverse();
    if (ma) { const h = ds.find((x) => x['Mã họp'] === ma); return h ? xemHop(h) : (location.hash = '#/hop'); }
    const m = G.khung('Họp', 'Định kỳ · đột xuất · biên bản');
    m.innerHTML = (q('homnay') >= 3 ? '<div class="nhom-nut" style="margin-bottom:12px"><button class="nut chinh" data-loai="Định kỳ">＋ Họp định kỳ</button><button class="nut" data-loai="Đột xuất">＋ Họp đột xuất</button></div>' : '')
      + `<div class="ds">${ds.map((h) => `<a class="muc" href="#/hop/${encodeURIComponent(h['Mã họp'])}" style="color:inherit;text-decoration:none"><div class="gian"><b>${esc(h['Tiêu đề'])}</b><div class="mo">${esc(h['Loại'])} · ${esc(G.gioVN(h['Bắt đầu']))} · ${String(h['Người dự'] || '').split('|').filter(Boolean).length} người dự · ${esc(h['Trạng thái'])}</div></div>›</a>`).join('') || '<div class="muc mo">Chưa có cuộc họp</div>'}</div>`;
    m.querySelectorAll('[data-loai]').forEach((b) => { b.onclick = () => chay(async () => { const s = await soLieuHop(); moHop(b.dataset.loai, s); }, b); });
  } };
  function moHop(loai, s) {
    const ct = loai === 'Định kỳ' ? `1. Tiến độ định kỳ kỳ ${s.k}:\n${s.dk.map((x) => `   - ${x.ten}: ${x.p}%`).join('\n')}\n2. Phiếu đang mở: ${s.mo} (khẩn cấp ${s.khan}, quá hạn ${s.qh})\n3. Công 7 ngày: ${G.so(s.cong)} công\n4. Rác hữu cơ kỳ này: ${G.so(s.rac)} kg · vận chuyển ${s.vc} chuyến\n5. Điểm chất lượng TB: ${s.diem ? G.so(s.diem, 2) + '/5' : 'chưa chấm'}\n6. Việc tuần tới` : '1. Nội dung đột xuất\n2. Hướng xử lý';
    const nguoi = (S.dm.nguoi || []).map((n) => n.ten).concat((S.dm.congnhan || []).filter((x) => /tổ trưởng/i.test(x.cd || '') && !(S.dm.nguoi || []).some((n) => n.ten === x.ten)).map((x) => x.ten));
    const giao = [];
    hop('Họp ' + loai.toLowerCase(), `<div id="f"></div><h3 class="tieu-nhom">Giao việc tại chỗ</h3><div id="gv"></div><button type="button" class="nut rong" id="themGV">＋ Giao việc (tạo phiếu khi lưu)</button>
      <div class="o" style="margin-top:10px"><span class="nhan-o">Báo cáo kèm biên bản</span><div class="chon boc" id="bc">${['Tiến độ định kỳ', 'Phiếu', 'Công', 'Rác, vận chuyển', 'Điểm chất lượng'].map((x) => `<button type="button" data-v="${x}" class="dang">${x}</button>`).join('')}</div></div>
      <button class="nut chinh rong" id="l">Lưu biên bản</button>`, (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'td', nhan: 'Tiêu đề', loai: 'chu', bb: true, gt: (loai === 'Định kỳ' ? 'Họp nhà thầu tuần ' : 'Họp đột xuất ') + G.tuan() }, { k: 'dd', nhan: 'Địa điểm', loai: 'chu', gt: 'Văn phòng cảnh quan' },
        { k: 'ng', nhan: 'Người dự (tick)', loai: 'nhieu', ds: nguoi, gt: nguoi.filter((x) => x === S.u.ten) }, { k: 'ct', nhan: 'Chương trình (số liệu tự điền, sửa được)', loai: 'mota', gt: ct }, { k: 'tdoi', nhan: 'Trao đổi', loai: 'mota' }, { k: 'qd', nhan: 'Quyết định', loai: 'mota' }]);
      o.querySelectorAll('#bc [data-v]').forEach((b) => { b.onclick = () => b.classList.toggle('dang'); });
      const veGV = () => { o.querySelector('#gv').innerHTML = giao.map((g, i) => `<div class="muc"><div class="gian"><b>${esc(g.nd)}</b><div class="mo">${esc(g.giao)} · ${esc(g.muc)} · ${esc(G.tenVT(g.vt.ma, g.vt.ten))}</div></div><button class="xx" data-x="${i}">✕</button></div>`).join(''); o.querySelectorAll('#gv [data-x]').forEach((b) => { b.onclick = () => { giao.splice(+b.dataset.x, 1); veGV(); }; }); };
      o.querySelector('#themGV').onclick = () => hop('Giao việc', '<div id="f2"></div><button class="nut chinh rong" id="ok">Thêm</button>', (o2, d2) => {
        const l2 = G.form(o2.querySelector('#f2'), [{ k: 'nd', nhan: 'Việc', loai: 'chu', bb: true }, { k: 'vt', nhan: 'Vị trí', loai: 'vitri', bb: true }, { k: 'giao', nhan: 'Giao cho', loai: 'chips', ds: G.GIAO_CHO(), bb: true }, { k: 'muc', nhan: 'Mức độ', loai: 'chips', ds: G.MUC, gt: 'Trung bình', bb: true }]);
        o2.querySelector('#ok').onclick = () => chay(async () => { giao.push(l2()); d2(); veGV(); });
      });
      o.querySelector('#l').onclick = (e) => chay(async () => {
        const v = lay(); const bc = [...o.querySelectorAll('#bc .dang')].map((b) => b.dataset.v);
        const h = await API.goi('ghi', { bang: 'Hop', dong: { 'Mã họp': '', 'Loại': loai, 'Tiêu đề': v.td, 'Bắt đầu': API.bayGio().slice(0, 16), 'Địa điểm': v.dd, 'Người dự': v.ng, 'Chương trình': v.ct, 'Trao đổi': v.tdoi, 'Quyết định': v.qd, 'Việc giao': '', 'Báo cáo kèm': bc, 'Số liệu': JSON.stringify(s), 'Trạng thái': 'Đã họp', 'Người lập': '' } });
        const ma = []; for (const g of giao) { const r = await API.goi('phieu.tao', { loai: g.nd, nhom: 'Giao việc trong họp', muc: g.muc, vt: g.vt.ma || '', vtKhac: g.vt.ma ? '' : g.vt.ten, giao: g.giao, nguon: 'Bộ phận khác', moTa: 'Giao trong ' + v.td }); ma.push(r.ma + ': ' + g.nd + ' (' + g.giao + ')'); }
        if (ma.length) await API.goi('sua', { bang: 'Hop', khoa: { 'Mã họp': h['Mã họp'] }, doi: { 'Việc giao': ma.join(' | ') } });
        dong(); bao('Đã lưu biên bản' + (ma.length ? ' · tạo ' + ma.length + ' phiếu' : '')); location.hash = '#/hop/' + h['Mã họp'];
      }, e.target);
    }, true);
  }
  function bienBan(h) {
    let s = {}; try { s = JSON.parse(h['Số liệu'] || '{}'); } catch (e) { /* */ }
    const bc = String(h['Báo cáo kèm'] || '').split('|').map((x) => x.trim());
    return `<h1>BIÊN BẢN ${esc(String(h['Loại']).toUpperCase())}: ${esc(h['Tiêu đề'])}</h1><p>Thời gian: ${esc(G.gioVN(h['Bắt đầu']))} · Địa điểm: ${esc(h['Địa điểm'])} · Lập: ${esc(h['Người lập'])}</p>
      <p><b>Người dự:</b> ${esc(String(h['Người dự']).split('|').map((x) => x.trim()).filter(Boolean).join(', '))}</p>
      <h2>Chương trình</h2><pre>${esc(h['Chương trình'])}</pre><h2>Trao đổi</h2><pre>${esc(h['Trao đổi'])}</pre><h2>Quyết định</h2><pre>${esc(h['Quyết định'])}</pre>
      <h2>Việc giao</h2><pre>${esc(String(h['Việc giao'] || '—').split('|').map((x) => '• ' + x.trim()).join('\n'))}</pre>
      ${s.dk && bc.includes('Tiến độ định kỳ') ? `<h2>Tiến độ định kỳ kỳ ${esc(s.k)}</h2>${bieuDo(s.dk)}` : ''}
      ${bc.includes('Phiếu') && s.mo != null ? `<p>Phiếu đang mở: <b>${s.mo}</b> · khẩn cấp ${s.khan} · quá hạn ${s.qh}</p>` : ''}${bc.includes('Công') && s.cong != null ? `<p>Công 7 ngày: <b>${G.so(s.cong)}</b></p>` : ''}
      ${bc.includes('Rác, vận chuyển') && s.rac != null ? `<p>Rác hữu cơ kỳ: <b>${G.so(s.rac)} kg</b> · vận chuyển ${s.vc} chuyến</p>` : ''}${bc.includes('Điểm chất lượng') && s.diem != null ? `<p>Điểm chất lượng TB: <b>${s.diem ? G.so(s.diem, 2) + '/5' : 'chưa chấm'}</b></p>` : ''}`;
  }
  G.inTrang = (tieuDe, html) => { const w = window.open('', '_blank'); if (!w) throw new Error('Trình duyệt chặn cửa sổ in. Cho phép cửa sổ bật lên rồi thử lại.'); w.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(tieuDe)}</title><style>body{font:14px/1.5 'Be Vietnam Pro',Arial,sans-serif;max-width:760px;margin:24px auto;padding:0 16px;color:#14231A}h1{font-size:20px;color:#1E6B3B}h2{font-size:15px;margin-top:18px;border-bottom:1px solid #ddd}pre{white-space:pre-wrap;font:inherit}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:4px 6px;font-size:12px}</style></head><body>${html}<p style="color:#888;font-size:11px;margin-top:30px">GreenLog · ${esc(API.bayGio())}</p><script>setTimeout(()=>print(),400)<\/script></body></html>`); w.document.close(); };
  function xemHop(h) {
    const m = G.khung(h['Tiêu đề'], h['Loại'] + ' · ' + G.gioVN(h['Bắt đầu']), '#/hop');
    m.innerHTML = `<div class="nhom-nut" style="margin-bottom:12px"><button class="nut chinh" id="pdf">🖨️ Biên bản PDF</button>${G.nutZalo()}</div><div class="the bien-ban">${bienBan(h)}</div>`;
    m.querySelector('#pdf').onclick = () => chay(async () => G.inTrang('Biên bản ' + h['Tiêu đề'], bienBan(h)));
    m.querySelector('#zalo').onclick = () => G.guiZalo(`👥 ${h['Tiêu đề']} (${G.gioVN(h['Bắt đầu'])})\nQuyết định: ${h['Quyết định'] || '—'}\nViệc giao:\n${String(h['Việc giao'] || '—').split('|').map((x) => '• ' + x.trim()).join('\n')}`, 'hop/' + h['Mã họp']);
  }

  /* ================= ĐÀO TẠO (theo mẫu Excel của anh) + THƯ VIỆN SOP ================= */
  const THU_VN = (n) => G.thu(n);
  G.man.daotao = { ten: 'Đào tạo', ic: 'dao_tao', bt: '🎓', nhom: 'Nhân sự', ph: 'homnay', fn: async () => {
    const m = G.khung('Đào tạo', 'Buổi đào tạo · học viên · thời lượng');
    const d = await API.goi('docNhieu', { ds: [{ bang: 'DaoTao', gioiHan: 500 }, { bang: 'ThuVienSOP', gioiHan: 500 }] }); const ds = d.DaoTao; const ghi = q('homnay') >= 3;
    const dang = ds.find((x) => x['Bắt đầu'] && !x['Kết thúc']);
    m.innerHTML = (ghi ? `<div class="nhom-nut" style="margin-bottom:12px">${dang ? '' : '<button class="nut chinh" id="bd">▶ Bắt đầu buổi đào tạo ngay</button>'}<button class="nut" id="moi">＋ Ghi buổi đã học</button></div>` : '')
      + (dang ? `<div class="the" style="border-left:4px solid #D9A93E"><b>Đang đào tạo: ${esc(dang['Nội dung'])}</b><div class="mo">Từ ${esc(dang['Bắt đầu'])} · ${esc(dang['Giảng viên'])}</div>${ghi ? `<button class="nut chinh rong" id="kt" style="margin-top:8px">■ Kết thúc ngay lúc này · tick học viên</button>` : ''}</div>` : '')
      + `<div class="nhom-nut" style="margin-bottom:10px"><button class="nut nho" id="tai">⬇ Tải Excel (đúng mẫu)</button><a class="nut nho" href="#/sop">📚 Thư viện SOP</a></div>
      <div class="cuon"><table class="bang"><tr><th>STT</th><th>Thứ</th><th>Ngày</th><th>Bắt đầu</th><th>Kết thúc</th><th>Tổng</th><th>Nội dung</th><th>Địa điểm</th><th>Giảng viên</th><th>Số HV</th></tr>${ds.filter((x) => x['Kết thúc']).map((x) => `<tr><td>${esc(x['STT'])}</td><td>${esc(x['Thứ'])}</td><td>${G.ngayVN(x['Ngày'])}</td><td>${esc(x['Bắt đầu'])}</td><td>${esc(x['Kết thúc'])}</td><td>${esc(x['Tổng thời lượng'])}</td><td>${esc(x['Nội dung'])}</td><td>${esc(x['Địa điểm'])}</td><td>${esc(x['Giảng viên'])}</td><td>${esc(x['Số học viên'])}</td></tr>`).join('') || '<tr><td colspan="10" class="mo">Chưa có buổi đào tạo</td></tr>'}</table></div>`;
    const hv = (S.dm.congnhan || []).filter((x) => x.tt !== 'Đã nghỉ').map((x) => x.ten).concat((S.dm.nguoi || []).filter((n) => n.nhom === 'Nhân viên nội bộ').map((n) => n.ten));
    const truong = (mo) => [{ k: 'nd', nhan: 'Nội dung', loai: 'chu', bb: true }, { k: 'dd', nhan: 'Địa điểm', loai: 'chu', gt: 'Văn phòng cảnh quan' }, { k: 'gv', nhan: 'Giảng viên', loai: 'chu', gt: S.u.ten, bb: true },
      { k: 'sop', nhan: 'Tài liệu SOP', loai: 'chonds', ds: d.ThuVienSOP.map((x) => ({ ten: x['Tên tài liệu'], phu: x['Chủ đề'] })) }].concat(mo ? [] : [{ k: 'ngay', nhan: 'Ngày', loai: 'ngay', bb: true }, { k: 'bd', nhan: 'Bắt đầu', loai: 'gio', bb: true }, { k: 'kt', nhan: 'Kết thúc', loai: 'gio', bb: true }, { k: 'hv', nhan: 'Học viên (tick)', loai: 'nhieu', ds: hv }, { k: 'gc', nhan: 'Ghi chú', loai: 'chu' }]);
    const tong = (a, b) => { const p = (s) => { const [h, mi] = String(s).split(':').map(Number); return h * 60 + mi; }; const n = Math.max(0, p(b) - p(a)); return `${Math.floor(n / 60)}h${String(n % 60).padStart(2, '0')}`; };
    const stt = ds.length + 1;
    const bd = m.querySelector('#bd'); if (bd) bd.onclick = () => hop('Bắt đầu đào tạo', '<div id="f"></div><button class="nut chinh rong" id="l">▶ Bắt đầu lúc này</button>', (o, dong) => { const lay = G.form(o.querySelector('#f'), truong(true));
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'DaoTao', dong: { 'Mã ĐT': '', 'STT': stt, 'Thứ': THU_VN(hn()), 'Ngày': hn(), 'Bắt đầu': API.bayGio().slice(11, 16), 'Kết thúc': '', 'Tổng thời lượng': '', 'Nội dung': v.nd, 'Địa điểm': v.dd, 'Giảng viên': v.gv, 'Học viên': '', 'Số học viên': '', 'Ghi chú': '', 'Tài liệu': v.sop ? v.sop.ten : '', 'Người lập': '' } }); dong(); G.taiLai(); }, e.target); });
    const kt = m.querySelector('#kt'); if (kt) kt.onclick = () => hop('Kết thúc đào tạo', '<div id="f"></div><button class="nut chinh rong" id="l">■ Kết thúc lúc này</button>', (o, dong) => { const lay = G.form(o.querySelector('#f'), [{ k: 'hv', nhan: 'Học viên có mặt (tick)', loai: 'nhieu', ds: hv, bb: true }, { k: 'gc', nhan: 'Ghi chú', loai: 'chu' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const k2 = API.bayGio().slice(11, 16); await API.goi('sua', { bang: 'DaoTao', khoa: { 'Mã ĐT': dang['Mã ĐT'] }, doi: { 'Kết thúc': k2, 'Tổng thời lượng': tong(dang['Bắt đầu'], k2), 'Học viên': v.hv.join(' | '), 'Số học viên': v.hv.length, 'Ghi chú': v.gc } }); dong(); G.taiLai(); }, e.target); });
    const moi = m.querySelector('#moi'); if (moi) moi.onclick = () => hop('Ghi buổi đào tạo', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => { const lay = G.form(o.querySelector('#f'), truong(false));
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); if (v.kt <= v.bd) throw new Error('Giờ kết thúc phải sau giờ bắt đầu'); await API.goi('ghi', { bang: 'DaoTao', dong: { 'Mã ĐT': '', 'STT': stt, 'Thứ': THU_VN(v.ngay), 'Ngày': v.ngay, 'Bắt đầu': v.bd, 'Kết thúc': v.kt, 'Tổng thời lượng': tong(v.bd, v.kt), 'Nội dung': v.nd, 'Địa điểm': v.dd, 'Giảng viên': v.gv, 'Học viên': v.hv, 'Số học viên': v.hv.length, 'Ghi chú': v.gc, 'Tài liệu': v.sop ? v.sop.ten : '', 'Người lập': '' } }); dong(); G.taiLai(); }, e.target); });
    m.querySelector('#tai').onclick = () => G.taiCSV('DaoTao_' + hn(), [['STT', 'Thứ', 'Ngày', 'Thời gian bắt đầu', 'Thời gian kết thúc', 'Tổng thời lượng', 'Nội dung đào tạo', 'Địa điểm', 'Giảng viên', 'Số học viên', 'Ghi chú', 'Danh sách học viên', 'Người lập', 'Giờ lập']].concat(ds.map((x) => [x['STT'], x['Thứ'], G.ngayVN(x['Ngày']), x['Bắt đầu'], x['Kết thúc'], x['Tổng thời lượng'], x['Nội dung'], x['Địa điểm'], x['Giảng viên'], x['Số học viên'], x['Ghi chú'], x['Học viên'], x['Người lập'], x['Giờ ghi'] || ''])));
  } };
  G.man.sop = { ten: 'Thư viện SOP', ic: 'dao_tao', bt: '📚', nhom: 'Nhân sự', ph: 'homnay', fn: async () => {
    const m = G.khung('Thư viện SOP', 'Tài liệu theo chủ đề', '#/daotao');
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'ThuVienSOP', gioiHan: 1000 }] })).ThuVienSOP;
    const nhom = {}; ds.forEach((x) => { (nhom[x['Chủ đề']] = nhom[x['Chủ đề']] || []).push(x); });
    m.innerHTML = (q('homnay') >= 3 ? '<button class="nut chinh rong" id="moi" style="margin-bottom:12px">＋ Thêm tài liệu</button>' : '') + '<input type="search" id="t" placeholder="Tìm tài liệu" style="margin-bottom:10px">'
      + (Object.keys(nhom).map((k) => `<h3 class="tieu-nhom">${esc(k)}</h3><div class="ds">${nhom[k].map((x) => `<a class="muc" href="${esc(x['Link'])}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none"><div class="gian"><b>${esc(x['Tên tài liệu'])}</b><div class="mo">${esc(x['Ghi chú'])}</div></div>↗</a>`).join('')}</div>`).join('') || G.trong('Chưa có tài liệu. Anh Vũ thêm link Google Drive / Canva theo chủ đề.'));
    const t = m.querySelector('#t'); t.oninput = () => m.querySelectorAll('a.muc').forEach((a) => { a.style.display = a.textContent.toLowerCase().includes(t.value.toLowerCase()) ? '' : 'none'; });
    const moi = m.querySelector('#moi'); if (moi) moi.onclick = () => hop('Thêm tài liệu SOP', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'cd', nhan: 'Chủ đề', loai: 'chips', ds: S.dm.chuDeSOP || ['Khác'], bb: true }, { k: 'ten', nhan: 'Tên tài liệu', loai: 'chu', bb: true }, { k: 'link', nhan: 'Link (Google Drive, Canva…)', loai: 'chu', bb: true }, { k: 'gc', nhan: 'Ghi chú', loai: 'chu' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); if (!/^https?:\/\//.test(v.link)) throw new Error('Link phải bắt đầu bằng https://'); await API.goi('ghi', { bang: 'ThuVienSOP', dong: { 'Mã SOP': '', 'Chủ đề': v.cd, 'Tên tài liệu': v.ten, 'Link': v.link, 'Ghi chú': v.gc, 'Người thêm': '', 'Giờ thêm': '' } }); dong(); G.taiLai(); }, e.target);
    });
  } };

  /* ================= BIỂU TƯỢNG CHO MỤC "THÊM" ================= */
  const IC = { dichhai: 'dich_hai', phunbon: 'phun_bon', thuoc: 'thuoc', sotrongcay: 'trong_cay', ai: 'ai', laplai: 'lap_lai', sukien: 'su_kien', duan: 'du_an', kehoach: 'ke_hoach', khthang: 'ke_hoach', lich: 'lich', tuantra: 'tuan_tra', chamdiem: 'cham_diem', bao: 'bao', congnhan: 'cong_nhan', baocao: 'bao_cao', phanquyen: 'phan_quyen', vuonuom: 'vuon_uom', donghonuoc: 'dong_ho', noibo: 'rac_huu_co', _viec: 'viec', _tuoi: 'tuoi', _vesinh: 've_sinh', _nhoco: 'nho_co', _dinhky: 'cat_co', _diemdanh: 'diem_danh', _phieu: 'phieu' };
  G._ICMAP = IC; Object.keys(IC).forEach((k) => { if (G.man[k]) G.man[k].ic = G.man[k].ic || IC[k]; });
})();
