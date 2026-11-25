/* GreenLog 0.4 – việc hằng ngày: ảnh bắt buộc, một kiểu chọn khu vực, tưới, trạng thái tức thì, việc phát sinh, phun/bón 3 thẻ,
   dập dịch khép kín, túi thuốc họ dừa (DV39), bảo trì máy theo giờ chạy, Vị Garden, công nhân chọn hàng loạt + khu phụ trách */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hop = (...a) => G.hop(...a);
  const hn = () => API.ngay();

  /* ================= ẢNH BẮT BUỘC (mục 18): mọi đầu việc, nút Lưu khóa đến khi có ảnh ================= */
  const formGoc = G.form;
  G.form = function (goc, truong) {
    truong = truong.map((t) => (t.loai !== 'anh' ? t : t.tuyChon ? Object.assign({}, t, { bb: false }) : Object.assign({}, t, { bb: true, nhan: String(t.nhan).replace(/\s*\((không bắt buộc|tùy chọn)[^)]*\)/i, '') })));
    const lay = formGoc(goc, truong);
    if (truong.some((t) => t.loai === 'anh' && t.bb)) khoaLuu(goc);
    return lay;
  };
  const oAnhGoc = G.oAnh;
  G.oAnh = function (goc, opt) { opt = Object.assign({}, opt || {}); if (!opt.tuyChon && opt.batBuoc === undefined) opt.batBuoc = true; const a = oAnhGoc(goc, opt); if (opt.batBuoc && !opt.tuKhoa) khoaLuu(goc.parentElement || goc); return a; };
  function khoaLuu(vung) {
    setTimeout(() => {
      const ct = vung.closest('.hop-than') || vung.closest('main') || vung; if (!ct) return;
      const nut = ct.querySelector('#l, #luu, #gui, #ok, #xong'); if (!nut) return;
      const ktra = () => { const thieu = [...ct.querySelectorAll('.luoi-anh')].filter((l) => !l.closest('[hidden]')).some((l) => { const o = l.closest('.o, [data-batbuoc]'); const bb = /\*|Bắt buộc/.test(((o || l.parentElement).textContent || '')); return bb && !l.children.length; }); nut.disabled = thieu; nut.title = thieu ? 'Cần ít nhất 1 ảnh' : ''; if (thieu && !nut.dataset.goc) { nut.dataset.goc = nut.textContent; } if (thieu) nut.textContent = '📷 Cần ảnh để lưu'; else if (nut.dataset.goc) { nut.textContent = nut.dataset.goc; delete nut.dataset.goc; } };
      ct.querySelectorAll('.luoi-anh').forEach((l) => new MutationObserver(ktra).observe(l, { childList: true })); ct.addEventListener('gl-doi', ktra);
      ktra();
    }, 30);
  }

  /* ================= MỘT KIỂU CHỌN KHU VỰC (mục 6): cụm → mặt nhanh → Chọn/Bỏ cả cụm → ô villa ================= */
  G.chonViTri = (opt) => new Promise((ok) => {
    opt = opt || {}; let xong = false;
    const goc = (opt.ds || S.dm.vitri).filter((v) => !opt.chiApDung || v.ap === 'Có');
    const st = { cum: '', mat: 'Cả 3', chon: new Set(opt.chon || []) };
    G.hop('Chọn vị trí', `<input type="search" class="tim" placeholder="Tìm nhanh, ví dụ: Villa 32" style="margin-bottom:8px"><div id="lv"></div>
      <div class="thanh-duoi" style="position:sticky;bottom:0;left:0;padding:10px 0 0"><div class="nhom-nut"><button type="button" class="nut" id="khac">Vị trí khác…</button><button type="button" class="nut chinh" id="xong" disabled>Chọn</button></div></div>`, (o, dong) => {
      const tim = o.querySelector('.tim'); const nut = o.querySelector('#xong');
      const doi = () => { nut.disabled = !st.chon.size && !opt.choRong; nut.textContent = st.chon.size ? `Chọn ${st.chon.size === 1 ? '' : st.chon.size + ' vị trí'}`.trim() : 'Chọn'; };
      const ve = () => { const t = tim.value.trim().toLowerCase(); const ds = t ? goc.filter((v) => (v.ten + ' ' + v.kv + ' ' + v.cum).toLowerCase().includes(t)) : goc; G.luoiVT(o.querySelector('#lv'), { ds: ds.length ? ds : goc, st, trangThai: opt.trangThai || (() => ({ cls: '' })), coMat: opt.coMat !== false, doi }); doi(); };
      tim.oninput = ve; ve();
      nut.onclick = () => {
        const ma = [...st.chon]; const v0 = G.vt(ma[0]) || {}; xong = true; dong();
        const caCum = opt.caNhom && goc.filter((v) => v.cum === v0.cum).every((v) => st.chon.has(v.ma)) && ma.length > 1;
        if (caCum) return ok({ caNhom: true, ten: v0.cum, cum: v0.cum });
        ok({ ma: ma.join(' | '), ten: ma.length === 1 ? v0.ten : G.tenVT(ma.join('|')), phu: ma.length === 1 ? v0.kv : '', cum: v0.cum, kv: v0.kv, nhieu: ma });
      };
      o.querySelector('#khac').onclick = async () => { const t = await G.hoi('Gõ tên vị trí', tim.value); if (t) { xong = true; dong(); ok({ ten: t, khac: true }); } };
    }, true);
    const kt = setInterval(() => { if (!document.querySelector('.lop-phu #lv')) { clearInterval(kt); if (!xong) ok(null); } }, 300);
  });

  /* ================= TƯỚI (mục 6): cùng kiểu chọn, giữ ☔ Hôm nay mưa, có ảnh ================= */
  const TT = ['Đã tưới', 'Không cần (mưa)', 'Chưa tưới được'];
  const CLS = { 'Đã tưới': 'xong', 'Không cần (mưa)': 'dang', 'Chưa tưới được': 'chua' };
  G.man.tuoi = { an: true, thay: true, fn: async () => {
    const ghi = q('dinhky') >= 2 && G.qv('DV09') >= 2; const ngay = hn();
    const m = G.khung('Tưới nước sân vườn', `${G.thu()} ${G.ngayVN(ngay)} · ${S.u.doi || ''}`, '#/viec');
    const cu = await G.doc('Tuoi', { 'Ngày': ngay });
    const st = G.man.tuoi.st && G.man.tuoi.st.ngay === ngay ? G.man.tuoi.st : (G.man.tuoi.st = { ngay, cum: '', mat: 'Cả 3', chon: new Set(), tt: 'Đã tưới' });
    const goc = {}; cu.forEach((r) => { goc[r['Mã vị trí']] = r['Trạng thái']; });
    const nVT = S.dm.vitri.filter((v) => v.ap === 'Có');
    const dem = (t) => nVT.filter((v) => goc[v.ma] === t).length;
    m.innerHTML = `<div class="the" style="padding:12px"><div class="luoi2" style="grid-template-columns:repeat(4,1fr);text-align:center">
        <div><b class="so-vua" style="color:var(--xanh)">${dem('Đã tưới')}</b><div class="mo">đã tưới</div></div><div><b class="so-vua" style="color:#8A6A12">${dem('Không cần (mưa)')}</b><div class="mo">mưa</div></div>
        <div><b class="so-vua" style="color:var(--do)">${dem('Chưa tưới được')}</b><div class="mo">chưa tưới</div></div><div><b class="so-vua">${nVT.length - nVT.filter((v) => goc[v.ma]).length}</b><div class="mo">chưa ghi</div></div></div></div>
      ${ghi ? `<div class="buoc"><span>1</span>Đánh dấu là</div><div class="chon boc" id="tt">${TT.map((t) => `<button data-t="${t}" class="${st.tt === t ? 'dang' : ''}">${t}</button>`).join('')}</div>
        <div class="nhom-nut" style="margin-bottom:10px"><button class="nut nho" id="mua">☔ Hôm nay mưa</button></div><div class="buoc"><span>2</span>Chọn vị trí</div>` : ''}
      <div id="lv"></div>${ghi ? '<div class="buoc" style="margin-top:12px"><span>3</span>Ảnh</div><div id="anh"></div><div style="height:90px"></div><div class="thanh-duoi"><button class="nut chinh" id="luu" disabled>Chọn vị trí rồi lưu</button></div>' : ''}`;
    const nutLuu = m.querySelector('#luu'); let a = null;
    const doi = () => { if (nutLuu) { const n = st.chon.size; nutLuu.disabled = !n || !(a && a.ds().length); nutLuu.textContent = !n ? 'Chọn vị trí rồi lưu' : !(a && a.ds().length) ? `📷 Cần ảnh · ${n} vị trí` : `Lưu ${n} vị trí: ${st.tt}`; } };
    G.luoiVT(m.querySelector('#lv'), { ds: nVT, st, coMat: true, doi, trangThai: (ma) => (goc[ma] ? { cls: CLS[goc[ma]], sub: goc[ma] === 'Không cần (mưa)' ? 'mưa' : goc[ma] === 'Chưa tưới được' ? 'chưa tưới' : '' } : { cls: '' }) });
    if (!ghi) return;
    a = G.oAnh(m.querySelector('#anh'), { toiDa: 4, tuKhoa: true }); new MutationObserver(doi).observe(m.querySelector('#anh .luoi-anh'), { childList: true }); doi();
    m.querySelectorAll('#tt [data-t]').forEach((b) => { b.onclick = () => { st.tt = b.dataset.t; m.querySelectorAll('#tt [data-t]').forEach((x) => x.classList.toggle('dang', x === b)); doi(); }; });
    m.querySelector('#mua').onclick = () => { st.tt = 'Không cần (mưa)'; nVT.filter((v) => !goc[v.ma] && v.maiChe !== 'Có').forEach((v) => st.chon.add(v.ma)); bao('Đã chọn mọi vị trí chưa ghi là Mưa. Bỏ chọn chỗ có mái che, chụp 1 ảnh trời mưa rồi lưu.'); G.taiLai(); };
    nutLuu.onclick = () => {
      const luu = (lyDo) => chay(async () => {
        await API.goi('ghiNhieu', { bang: 'Tuoi', thay: ['Ngày', 'Mã vị trí'], dong: [...st.chon].map((vt, i) => ({ 'Ngày': ngay, 'Mã vị trí': vt, 'Trạng thái': st.tt, 'Người ghi': '', 'Giờ': API.bayGio().slice(11, 16), 'Hôm nay mưa': st.tt === 'Không cần (mưa)' ? 'Có' : '', 'Lý do': lyDo || '', 'Ảnh': i === 0 ? a.ds() : '' })) });
        if (st.tt === 'Không cần (mưa)') API.LS.set('mua_' + ngay, 1);
        st.chon.clear(); bao('Đã lưu tưới'); G.taiLai();
      }, nutLuu);
      if (st.tt !== 'Chưa tưới được') return luu();
      G.chonDS(`${st.chon.size} vị trí chưa tưới được. Lý do:`, ['Hư hệ thống tưới', 'Thiếu nước', 'Thiếu người', 'Khu vực có khách', 'Khác']).then((x) => x && luu(x.ten));
    };
  } };

  /* ================= VIỆC: ô có ✓ giờ, người (mục 14) · bỏ rác hữu cơ · Vị Garden · túi thuốc dừa · Hoa Giấy N2/N4 ================= */
  const NGUON = { // link → [bảng, lọc thêm]
    tuoi: ['Tuoi'], 'cum/DV10': ['ViecHangNgay', { 'Mã việc': 'DV10' }], 'cum/DV11': ['ViecHangNgay', { 'Mã việc': 'DV11' }], vanchuyen: ['VanChuyen'], phatsinh: ['ViecPhatSinh'], donghonuoc: ['DongHoNuoc'],
    vuonuom: ['VuonUom', { 'Vườn ươm': 'Vườn ươm cây bụi' }], 'nb/bien': ['VeSinhBien'], 'nb/ktbien': ['KiemTraBien'], 'nb/may': ['MaySangCat'], 'nb/vuonrau': ['VuonRau'], 'nb/thuhoach': ['ThuHoach'],
    'nb/noithat': ['CayNoiThat'], 'nb/vuonuomnt': ['VuonUomNoiThat'], 'nb/compost': ['PhanCompost'], 'nb/rac': ['RacHuuCo'], tuithuoc: ['TuiThuocDua'],
  };
  const TILE_QV = { 'nb/rac': 'DV23', tuoi: 'DV09', 'cum/DV10': 'DV10', 'cum/DV11': 'DV11', vanchuyen: 'CN04', phatsinh: 'CN06', donghonuoc: 'DV12', vuonuom: 'DV17', 'nb/bien': 'DV18', 'nb/ktbien': 'DV19', 'nb/may': 'DV30', 'nb/vuonrau': 'DV20', 'nb/thuhoach': 'DV31', 'nb/noithat': 'DV22', 'nb/vuonuomnt': 'DV21', sotrongcay: 'CN09', dichhai: 'CN08', phunbon: 'CN07', tuithuoc: 'DV39' };
  const viecGoc = G.man.viec.fn;
  G.NGUON_VIEC = NGUON;
  G.trangThaiHomNay = async (ngayXem) => {
    const ngay = ngayXem || hn();
    const bangs = [...new Set(Object.values(NGUON).map((x) => x[0]))].map((b) => ({ bang: b, loc: { 'Ngày': ngay } }));
    const d = await G.docNhieu(bangs); const out = {};
    Object.keys(NGUON).forEach((k) => { const [b, loc] = NGUON[k]; const ds = (d[b] || []).filter((r) => !loc || Object.keys(loc).every((c) => r[c] === loc[c])); if (ds.length) { const r = ds[ds.length - 1]; out[k] = { ds, n: ds.length, gio: String(r['Giờ ghi'] || r['Giờ tick'] || r['Giờ'] || r['Bắt đầu'] || r['Giờ bắt đầu'] || '').replace(/^\d{4}-\d{2}-\d{2} /, '').slice(0, 5), ai: (r['Người ghi'] || r['Người đọc'] || r['Người tick'] || '').split(' ').pop() }; } });
    return out;
  };
  G.man.viec = Object.assign(G.man.viec, { fn: async () => {
    await viecGoc(); const m = document.getElementById('noiDung'); if (!m) return;
    m.querySelectorAll('a.o-viec, a.o-mt').forEach((a) => { const k = a.getAttribute('href').replace('#/', ''); const ma = TILE_QV[k] || (k.startsWith('dinhky/') ? k.split('/')[1] : ''); if (ma && G.qv(ma) === 0) a.remove(); });
    // ô ghi chép thêm: túi thuốc họ dừa, Hoa Giấy N2/N4, danh mục cây
    const luoiC = [...m.querySelectorAll('.luoi-viec')].find((l) => l.querySelector('a[href="#/sotrongcay"]'));
    if (luoiC) {
      if (G.qv('DV39')) luoiC.insertAdjacentHTML('beforeend', `<a class="o-viec" href="#/tuithuoc">${G.ic('phun_bong_mat', 52)}<b>Túi thuốc họ dừa</b><small>DV39 · 4 đợt/năm</small></a>`);
      if (G.qv('DV37')) luoiC.insertAdjacentHTML('beforeend', `<a class="o-viec" href="#/dinhky/DV40">${G.ic('tia_hang_rao', 52)}<b>Hoa Giấy N2, N4</b><small>2 lần/năm</small></a>`);
    }
    const tt = await G.trangThaiHomNay().catch(() => ({}));
    m.querySelectorAll('a.o-viec').forEach((a) => { const k = a.getAttribute('href').replace('#/', ''); const x = tt[k]; if (!x) return; a.style.borderColor = '#3E8E4E'; a.insertAdjacentHTML('beforeend', `<small style="color:#1F6B35;font-weight:700">✓ ${esc(x.gio)} ${esc(x.ai)}</small>`); });
  } });
  G.dsVT = ((goc) => (maViec) => (maViec === 'DV40' ? S.dm.vitri.filter((v) => /Đường N2|Đường N4/i.test(v.ten)).concat(S.dm.vitri.filter((v) => /Đường N2|Đường N4/i.test(v.ten)).length ? [] : [{ ma: 'N2', cum: 'Public', kv: 'Public', ten: 'Đường N2' }, { ma: 'N4', cum: 'Public', kv: 'Public', ten: 'Đường N4' }]) : goc(maViec)))(G.dsVT);
  // bảo trì máy không còn theo ngày cố định: chỉ còn thu gom rác bên kia hàng rào thứ Sáu
  G.lichNoiBo = (d) => (d.getDay() === 5 ? [['DV24', 'Thu gom rác bên kia hàng rào']] : []);

  /* ================= VIỆC PHÁT SINH (mục 15): mô tả tự do; Số người + Bộ phận chỉ khi "Hỗ trợ bộ phận khác"; lọc của mình / đội khác ================= */
  const psGoc = G.man.phatsinh.fn;
  G.man.phatsinh = Object.assign(G.man.phatsinh, { fn: async () => {
    await psGoc(); const m = document.getElementById('noiDung'); if (!m) return;
    const st = G.man.phatsinh.loc || 'toi';
    m.insertAdjacentHTML('afterbegin', `<div class="chon">${[['toi', 'Của tôi / đội tôi'], ['khac', 'Đội khác'], ['tat', 'Tất cả']].map(([k, t]) => `<button data-loc="${k}" class="${st === k ? 'dang' : ''}">${t}</button>`).join('')}</div>`);
    m.querySelectorAll('[data-loc]').forEach((b) => { b.onclick = () => { G.man.phatsinh.loc = b.dataset.loc; G.taiLai(); }; });
    if (st !== 'tat') {
      const ds = await G.doc('ViecPhatSinh', { 'Ngày': { tu: G.congNgay(hn(), -30) } });
      const cuaToi = (r) => r['Người ghi'] === S.u.ten || (S.u.doi && r['Đội'] === S.u.doi);
      m.querySelectorAll('.ds .muc, .the').forEach((el) => { const btn = el.querySelector('[data-kt]'); const ma = btn ? btn.dataset.kt : null; const r = ma ? ds.find((x) => x['Mã PS'] === ma) : ds.find((x) => el.textContent.includes(x['Mô tả'] || '¤') && el.textContent.includes(x['Loại việc'])); if (!r || G.laAnhVu()) return; if ((st === 'toi') !== cuaToi(r)) el.style.display = 'none'; });
    }
    const bd = m.querySelector('#bd'); if (!bd || G.qv('CN06') < 2) { if (bd) bd.remove(); return; }
    bd.onclick = () => hop('Bắt đầu việc phát sinh', '<div id="f"></div><div id="f2"></div><button class="nut chinh rong" id="l">▶ Bắt đầu lúc này</button>', (o, dong) => {
      let lay2 = () => ({});
      const veHT = (loai) => { const ht = loai === 'Hỗ trợ bộ phận khác'; lay2 = G.form(o.querySelector('#f2'), ht ? [{ k: 'sn', nhan: 'Số người', loai: 'so', bb: true, gt: 1 }, { k: 'bp', nhan: 'Bộ phận', loai: 'chips', ds: S.dm.boPhan, bb: true }] : []); };
      const lay = G.form(o.querySelector('#f'), [{ k: 'loai', nhan: 'Loại việc', loai: 'chips', ds: S.dm.loaiPhatSinh, bb: true, doi: (x) => veHT(x) }, { k: 'mt', nhan: 'Mô tả việc (ghi tự do)', loai: 'mota', bb: true },
        { k: 'vt', nhan: 'Vị trí', loai: 'vitri', bb: true }, { k: 'da', nhan: 'Thuộc dự án (nếu có)', loai: 'chonds', ds: (S.dm._duAn || []).map((a) => a['Mã DA'] + ' · ' + a['Tên']) }, { k: 'anh', nhan: 'Ảnh trước khi làm', loai: 'anh', toiDa: 3 }]);
      veHT('');
      o.querySelector('#l').onclick = (e) => chay(async () => {
        const v = lay(); const v2 = lay2(); const ht = v.loai === 'Hỗ trợ bộ phận khác';
        if (ht && (!(+v2.sn > 0) || !v2.bp)) throw new Error('Hỗ trợ bộ phận khác: nhập số người và bộ phận');
        await API.goi('ghi', { bang: 'ViecPhatSinh', dong: { 'Mã PS': '', 'Ngày': '', 'Loại việc': v.loai, 'Mô tả': v.mt, 'Mã vị trí': v.vt.ma || '', 'Vị trí khác': v.vt.ma ? '' : v.vt.ten, 'Số người': ht ? v2.sn : '', 'Hỗ trợ': ht ? v2.bp : '', 'Bắt đầu': API.bayGio(), 'Kết thúc': '', 'Số giờ': '', 'Ảnh trước': v.anh, 'Ảnh sau': '', 'Trạng thái': 'Đang làm', 'Đội': S.u.doi || S.u.nhom, 'Mã DA': v.da ? String(v.da.ten || v.da).split(' · ')[0] : '', 'Người ghi': '' } });
        dong(); bao('Đã bắt đầu · nhớ bấm Kết thúc khi xong'); G.taiLai();
      }, e.target);
    });
  } });
  // dự án đang chạy cho ô "Thuộc dự án"
  G.taiDuAn = async () => { try { S.dm._duAn = (await G.doc('DuAn', null, 200)).filter((a) => a['Trạng thái'] !== 'Hoàn thành'); } catch (e) { S.dm._duAn = []; } };

  /* ================= PHUN THUỐC · PHUN PHÂN BÓN LÁ · BÓN PHÂN GỐC (mục 17) ================= */
  const LOAI_CAY = ['Cỏ', 'Cây bụi', 'Hàng rào', 'Cây bóng mát'];
  const DV_PHUN = { 'Cỏ': 'DV04', 'Cây bụi': 'DV05', 'Hàng rào': 'DV05', 'Cây bóng mát': 'DV06' };
  const DV_BON = { 'Cỏ': 'DV02', 'Cây bụi': 'DV03', 'Hàng rào': 'DV03', 'Thủy sinh': 'DV38' };
  const docLieu = (s) => { const x = String(s || '').match(/([\d.,]+)\s*(ml|g|kg|gói)/i); return x ? { n: +x[1].replace(',', '.'), dvt: x[2].toLowerCase() } : null; };
  const kyNhau = (sp) => { const ky = []; sp.forEach((a) => sp.forEach((b) => { if (a !== b && a.t.khongPha && new RegExp((b.t.tenNgan || b.t.ten).split(' ')[0], 'i').test(a.t.khongPha)) ky.push(`${a.t.tenNgan || a.t.ten} không pha chung với ${b.t.tenNgan || b.t.ten}`); })); return [...new Set(ky)]; };
  const pbGoc = G.man.phunbon.fn;
  G.man.phunbon = Object.assign(G.man.phunbon, { fn: (a, b) => {
    if (a === 'moi' && !b) return chonLoaiPB();
    if (a === 'moi' && b) return manPhun('thuoc', b);
    if (a === 'thuoc' || a === 'la' || a === 'goc') return manPhun(a, b);
    if (/^ds-/.test(a || '')) return nhatKyPB(a.slice(3));
    return nhatKyPB(a);
  } });
  /* nhật ký phun, bón: 3 nút riêng + 3 thẻ (mục 63) */
  G.man.phunbon.an = true;
  [['pbthuoc', 'Phun thuốc', 'phun_bui', 'thuoc'], ['pbla', 'Phun phân bón lá', 'phun_bon', 'la'], ['pbgoc', 'Bón gốc', 'bon_phan_bui', 'goc']].forEach(([k, ten, ic, t]) => {
    G.man[k] = { ten, ic, nhom: 'Cây xanh', ph: 'phunbon', fn: () => nhatKyPB(t) }; });
  const LOAI3 = [['thuoc', 'Phun thuốc', '🧪', 'phun_bui'], ['la', 'Phun phân bón lá', '🍃', 'phun_bon'], ['goc', 'Bón gốc', '🌱', 'bon_phan_bui']];
  async function nhatKyPB(tab) {
    const t = LOAI3.find((x) => x[0] === tab) || LOAI3[0];
    const m = G.khung('Nhật ký phun, bón', t[1], '#/');
    const d = await G.docNhieu([{ bang: 'NhatKyPhunBon', gioiHan: 400 }, { bang: 'NhatKyPhunBonChiTiet', gioiHan: 2000 }]);
    const LP = 'Loại (Phun thuốc/Phun phân bón lá/Bón gốc)'; const hn = API.ngay();
    const laLoai = (r, k) => { const l = r[LP] || ''; return k === 'thuoc' ? l === 'Phun thuốc' : k === 'la' ? l === 'Phun phân bón lá' : /Bón/.test(l); };
    const ds = (d.NhatKyPhunBon || []).filter((r) => laLoai(r, t[0])).sort((a, b) => String(b['Ngày giờ']).localeCompare(String(a['Ngày giờ'])));
    const ct = (ma) => (d.NhatKyPhunBonChiTiet || []).filter((x) => x['Mã NK'] === ma);
    const tu = G.dauThang ? G.dauThang() : hn.slice(0, 8) + '01'; const thang = ds.filter((r) => String(r['Ngày giờ']).slice(0, 10) >= tu);
    const tong = {}; thang.forEach((r) => ct(r['Mã NK']).forEach((x) => { const k = (x['Sản phẩm'] || '') + '|' + (x['ĐVT'] || ''); tong[k] = (tong[k] || 0) + (+x['Tổng lượng'] || 0); }));
    const dangCL = ds.filter((r) => r['Hết cách ly'] >= hn && +r['Cách ly dài nhất (ngày)'] > 0);
    const ghi = q('phunbon') >= 2;
    m.innerHTML = (ghi ? `<div class="luoi-tq" style="grid-template-columns:repeat(3,1fr);margin-bottom:10px">${LOAI3.map((x) => `<a class="nut ${x[0] === t[0] ? 'chinh' : ''}" href="#/phunbon/${x[0]}">${x[2]} ${x[1]}</a>`).join('')}</div>` : '')
      + `<div class="chon">${LOAI3.map((x) => `<a class="${x[0] === t[0] ? 'dang' : ''}" href="#/phunbon/ds-${x[0]}" style="text-decoration:none">${x[1]} (${(d.NhatKyPhunBon || []).filter((r) => laLoai(r, x[0])).length})</a>`).join('')}<a href="#/thuoc" style="text-decoration:none">Danh mục thuốc, phân</a></div>`
      + `<div class="the"><b>Từ đầu tháng</b><div class="mo">${thang.length} lần · ${G.so(thang.reduce((a, r) => a + (+r['Số bình'] || 0), 0))} bình</div>
        <div class="mo">${Object.keys(tong).map((k) => { const [sp, dv] = k.split('|'); return `${esc(sp)}: ${G.so(tong[k], 2)} ${esc(dv)}`; }).join(' · ') || 'Chưa có'}</div>
        ${t[0] === 'thuoc' && dangCL.length ? `<div class="mo" style="color:var(--cam)">Đang cách ly: ${dangCL.map((r) => esc(G.tenVT(r['Mã vị trí'], r['Vị trí chi tiết'] || r['Cụm'])) + ' đến ' + G.ngayVN(r['Hết cách ly']).slice(0, 5)).join(' · ')}</div>` : ''}</div>`
      + `<div class="ds">${ds.length ? ds.map((r) => { const cl = r['Hết cách ly'] >= hn && +r['Cách ly dài nhất (ngày)'] > 0;
        return `<div class="muc"><div class="gian"><b>${esc(G.gioVN(r['Ngày giờ']))}</b> · ${esc(r['Số bình'] || '')} ${t[0] === 'goc' ? '' : 'bình'}
          <div class="mo">📍 ${esc(G.tenVT(r['Mã vị trí'], r['Vị trí chi tiết'] || r['Cụm']))} · ${esc(r['Người ghi'] || '')}</div>
          <div class="mo">${ct(r['Mã NK']).map((x) => `${esc(x['Sản phẩm'])} ${esc(x['Liều / bình'] || '')} ${esc(x['ĐVT'] || '')}${t[0] === 'goc' ? '' : '/bình'} (tổng ${G.so(x['Tổng lượng'], 2)})`).join(' + ')}</div></div>
          ${cl ? `<span class="chip cam">Cách ly đến ${G.ngayVN(r['Hết cách ly']).slice(0, 5)}</span>` : ''}</div>`; }).join('') : G.trong('Chưa có nhật ký ' + t[1].toLowerCase())}</div>`;
  }
  function chonLoaiPB() {
    const m = G.khung('Ghi phun, bón', 'Chọn 1 trong 3 thẻ', '#/phunbon');
    const the = (k, ic, t, p) => `<a class="the" href="#/phunbon/${k}" style="display:flex;gap:14px;align-items:center;color:inherit">${G.ic(ic, 56)}<div class="gian"><b style="font-size:18px">${t}</b><div class="mo">${p}</div></div>›</a>`;
    m.innerHTML = the('thuoc', 'phun_bui', 'Phun thuốc', 'Vị trí → loại cây → dịch hại → app đề xuất công thức an toàn, liều bình 16L → số bình. Tự đánh dấu DV04/05/06.')
      + the('la', 'phun_bon', 'Phun phân bón lá', 'Vị trí, nhóm cây, phân + liều bình 16L, số bình. Không gắn định kỳ.')
      + the('goc', 'bon_phan_bui', 'Bón phân gốc', 'Khu vực, dùng cho, loại phân, khối lượng kg/bao. Tự đánh dấu DV02/03/38.');
  }
  async function manPhun(loai, maDH) {
    if (!S.dm._duAn) await G.taiDuAn();
    const ten = { thuoc: 'Phun thuốc', la: 'Phun phân bón lá', goc: 'Bón phân gốc' }[loai];
    const m = G.khung(ten, maDH ? 'Cho hồ sơ dịch hại ' + maDH : 'Bình điện 16 lít', '#/phunbon/moi');
    const dh = maDH ? (await G.doc('DichHai', { 'Mã DH': maDH }))[0] : null;
    const key = loai + (maDH || '');
    const st = manPhun.st && manPhun.st.key === key ? manPhun.st : (manPhun.st = { key, vt: { cum: '', mat: 'Cả 3', chon: new Set() }, cay: dh ? (/cỏ/i.test(dh['Nhóm cây']) ? 'Cỏ' : /bóng mát/i.test(dh['Nhóm cây']) ? 'Cây bóng mát' : 'Cây bụi') : '', dt: dh ? dh['Loại dịch hại'] : '', md: dh ? 'Điều trị' : 'Phòng', sp: [], binh: 1, dvKL: 'kg' });
    const ve = () => {
      const g = loai === 'thuoc' && st.dt ? G.goiYThuoc(st.dt) : null;
      if (g && !st.sp.length && g.spChinh) { st.sp = [Object.assign({}, g.spChinh)]; if (/Thần Hổ/i.test(g.ghi || '')) { const th = S.dm.thuoc.find((t) => /thần hổ/i.test(t.ten)); if (th) st.sp.push({ t: th, lieu: 5, dvt: 'ml' }); } st.tuGoiY = true; }
      st.ky = kyNhau(st.sp); const cl = st.sp.reduce((x, y) => Math.max(x, +y.t.cachLy || 0), 0);
      const dsCayLoai = loai === 'goc' ? LOAI_CAY.concat(['Thủy sinh']) : LOAI_CAY;
      let i = 0; const buoc = (t) => `<div class="buoc"><span>${++i}</span>${t}</div>`;
      m.innerHTML = `<div class="the">${buoc(loai === 'goc' ? 'Khu vực bón' : 'Vị trí phun')}<div id="lv"></div></div>
        <div class="the">${buoc(loai === 'goc' ? 'Dùng cho' : 'Loại cây')}<div class="chon boc" id="cCay">${dsCayLoai.map((x) => `<button data-v="${x}" class="${st.cay === x ? 'dang' : ''}">${x}</button>`).join('')}</div></div>
        ${loai === 'thuoc' ? `<div class="the">${buoc('Dịch hại')}<div class="hai-nut" style="margin-bottom:8px"><button data-md="Phòng" class="${st.md === 'Phòng' ? 'dang xanh' : ''}">Phòng</button><button data-md="Điều trị" class="${st.md === 'Điều trị' ? 'dang vang' : ''}">Điều trị</button></div>
          <div class="chon boc" id="cDT">${(S.dm.dhThuoc || []).map((x) => `<button data-v="${esc(x.dh)}" class="${st.dt === x.dh ? 'dang' : ''}">${esc(x.dh)}</button>`).join('')}</div></div>` : ''}
        <div class="the">${buoc(loai === 'thuoc' ? 'Công thức an toàn app đề xuất' : loai === 'la' ? 'Phân bón lá và liều / bình 16L' : 'Loại phân và khối lượng')}
          ${g ? `<p class="mo" style="margin-top:0">${esc(g.nhan || '')}${g.spLuan ? ` · Luân phiên lần sau: <b>${esc(g.spLuan.t.tenNgan || g.spLuan.t.ten)} ${esc(g.spLuan.lieu)} ${esc(g.spLuan.dvt)}</b>` : ''}${g.ghi ? ' · ' + esc(g.ghi) : ''}</p>` : loai === 'thuoc' ? '<p class="mo">Chọn dịch hại để app đề xuất thuốc và liều.</p>' : ''}
          ${st.sp.map((x, j) => `<div class="dong-sp"><div><b style="font-size:13px">${esc(x.t.tenNgan || x.t.ten)}</b><div class="mo">${x.t.lieu16 ? 'Nhãn: ' + esc(x.t.lieu16) + ' · ' : ''}cách ly ${x.t.cachLy} ngày</div></div>
            <input type="number" step="any" inputmode="decimal" value="${esc(x.lieu)}" data-l="${j}" placeholder="${loai === 'goc' ? 'khối lượng' : 'liều'}"><button class="xx" data-x="${j}">✕</button></div>
            ${loai === 'goc' ? '' : `<div class="chon boc" style="margin:-2px 0 8px">${['ml', 'g', 'gói'].map((u) => `<button data-u="${j}" data-v="${u}" class="${x.dvt === u ? 'dang' : ''}">${u}/bình</button>`).join('')}</div>`}`).join('')}
          ${loai === 'goc' ? `<div class="chon boc">${['kg', 'bao'].map((u) => `<button data-kl="${u}" class="${st.dvKL === u ? 'dang' : ''}">tính theo ${u}${u === 'bao' ? ' (25 kg)' : ''}</button>`).join('')}</div>` : ''}
          <button type="button" class="nut rong" id="themSP">${loai === 'thuoc' ? '↻ Đổi / thêm thuốc (tổ trưởng)' : '＋ Thêm phân'}</button>
          ${st.ky.length ? `<div class="canh-bao do" style="margin-top:8px">⚠️ Pha kỵ: ${st.ky.map(esc).join('; ')}. Vẫn lưu được nhưng Trưởng bộ phận được báo và tự đưa vào mục nhắc trong họp.</div>` : ''}</div>
        ${loai === 'goc' ? '' : `<div class="the">${buoc('Số bình 16L')}<div class="hang"><div class="gian mo">${st.sp.map((x) => `${esc(x.t.tenNgan || x.t.ten)}: ${G.so((+x.lieu || 0) * st.binh, 2)} ${esc(x.dvt)}`).join(' · ') || 'Chưa chọn'}</div>
          <button class="tron" id="tru">−</button><b class="so-vua" style="min-width:34px;text-align:center">${st.binh}</b><button class="tron chinh" id="cong">＋</button></div></div>`}
        <div class="the"><div id="f2"></div></div>
        <div class="the" style="background:var(--xanh-nhat)">Cách ly: <b>${cl} ngày</b>${cl ? ` · hết cách ly ${G.ngayVN(G.congNgay(hn(), cl))}` : ''}${loai === 'thuoc' && DV_PHUN[st.cay] ? `<br>Lưu xong tự đánh dấu "${esc(G.dvTen(DV_PHUN[st.cay]))}"` : loai === 'goc' && DV_BON[st.cay] ? `<br>Lưu xong tự đánh dấu "${esc(G.dvTen(DV_BON[st.cay]))}"` : loai === 'la' ? '<br>Phun phân bón lá không gắn việc định kỳ.' : ''}</div>
        <button class="nut chinh rong" id="luu" style="margin-bottom:30px">Lưu nhật ký</button>`;
      const dsVT = st.cay === 'Hàng rào' ? G.dsVT('DV37') : st.cay === 'Thủy sinh' ? G.dsVT('DV38') : S.dm.vitri.filter((v) => v.ap === 'Có');
      G.luoiVT(m.querySelector('#lv'), { ds: dsVT, st: st.vt, trangThai: () => ({ cls: '' }), coMat: true });
      m.querySelectorAll('#cCay [data-v]').forEach((b) => { b.onclick = () => { st.cay = b.dataset.v; ve(); }; });
      m.querySelectorAll('#cDT [data-v]').forEach((b) => { b.onclick = () => { st.dt = b.dataset.v; if (st.tuGoiY) st.sp = []; ve(); }; });
      m.querySelectorAll('[data-md]').forEach((b) => { b.onclick = () => { st.md = b.dataset.md; ve(); }; });
      m.querySelectorAll('[data-l]').forEach((x) => { x.onchange = () => { st.sp[+x.dataset.l].lieu = x.value; ve(); }; });
      m.querySelectorAll('[data-x]').forEach((b) => { b.onclick = () => { st.sp.splice(+b.dataset.x, 1); st.tuGoiY = false; ve(); }; });
      m.querySelectorAll('[data-u]').forEach((b) => { b.onclick = () => { st.sp[+b.dataset.u].dvt = b.dataset.v; ve(); }; });
      m.querySelectorAll('[data-kl]').forEach((b) => { b.onclick = () => { st.dvKL = b.dataset.kl; ve(); }; });
      m.querySelector('#themSP').onclick = async () => { const t = await G.chonThuoc(); if (t) { const l = docLieu(t.t.lieu16); st.sp.push({ t: t.t, lieu: loai === 'goc' ? '' : l ? l.n : '', dvt: l ? l.dvt : 'ml' }); st.tuGoiY = false; ve(); } };
      const tr = m.querySelector('#tru'); if (tr) tr.onclick = () => { st.binh = Math.max(1, st.binh - 1); ve(); };
      const cg = m.querySelector('#cong'); if (cg) cg.onclick = () => { st.binh++; ve(); };
      const lay2 = G.form(m.querySelector('#f2'), [{ k: 'bh', nhan: 'Bảo hộ đã dùng', loai: 'nhieu', ds: S.dm.baoHo, gt: ['Khẩu trang', 'Găng tay'] }, { k: 'da', nhan: 'Thuộc dự án (tự gợi ý theo vị trí)', loai: 'chonds', ds: (S.dm._duAn || []).map((a) => a['Mã DA'] + ' · ' + a['Tên']) },
        { k: 'anh', nhan: 'Ảnh', loai: 'anh', toiDa: 4 }, { k: 'gc', nhan: loai === 'goc' ? 'Mô tả (khi có trường hợp đặc biệt)' : 'Ghi chú', loai: 'mota' }]);
      m.querySelector('#luu').onclick = (e) => chay(async () => {
        const b = lay2(); const vts = [...st.vt.chon];
        if (!vts.length) throw new Error('Chọn vị trí'); if (!st.cay) throw new Error('Chọn loại cây / dùng cho');
        if (loai === 'thuoc' && !st.dt) throw new Error('Chọn dịch hại');
        if (!st.sp.length) throw new Error('Thêm ít nhất 1 thuốc / phân'); if (st.sp.some((x) => !(+x.lieu > 0))) throw new Error(loai === 'goc' ? 'Nhập khối lượng từng loại phân' : 'Nhập liều / bình');
        const cl2 = st.sp.reduce((x, y) => Math.max(x, +y.t.cachLy || 0), 0); const ngay = hn();
        const da = b.da ? String(b.da.ten || b.da).split(' · ')[0] : (G.duAnGoiY((S.dm._duAn || []), vts[0])[0] || { diem: 0 }).diem === 2 ? G.duAnGoiY(S.dm._duAn, vts[0])[0].a['Mã DA'] : '';
        const nk = await API.goi('ghi', { bang: 'NhatKyPhunBon', dong: { 'Mã NK': '', 'Ngày giờ': API.bayGio().slice(0, 16), 'Loại (Phun thuốc/Phun phân bón lá/Bón gốc)': ten === 'Bón phân gốc' ? 'Bón gốc' : ten, 'Mục đích': loai === 'thuoc' ? st.md : '', 'Nhóm cây': st.cay, 'Đối tượng': st.dt || '',
          'Cụm': [...new Set(vts.map((x) => (G.vt(x) || {}).cum))].join(', '), 'Mã vị trí': vts.join(' | '), 'Vị trí chi tiết': G.tenVT(vts.join('|')), 'Số bình': loai === 'goc' ? '' : st.binh, 'Bảo hộ': b.bh, 'Cách ly dài nhất (ngày)': cl2, 'Hết cách ly': cl2 ? G.congNgay(ngay, cl2) : '',
          'Ảnh': b.anh, 'Mã dịch hại': maDH || '', 'Cảnh báo pha': st.ky.join('; '), 'Đổi thuốc': st.tuGoiY ? '' : 'Có', 'Mã DA': da, 'Ghi chú': b.gc, 'Người ghi': '' } });
        await API.goi('ghiNhieu', { bang: 'NhatKyPhunBonChiTiet', dong: st.sp.map((x, j) => ({ 'Mã NK': nk['Mã NK'], 'STT': j + 1, 'Sản phẩm': x.t.ten, 'Liều / bình': loai === 'goc' ? '' : x.lieu, 'ĐVT': loai === 'goc' ? st.dvKL : x.dvt, 'Tổng lượng': loai === 'goc' ? +x.lieu : (+x.lieu) * st.binh, 'Cách ly (ngày)': x.t.cachLy })) });
        if (st.ky.length) await API.goi('ghi', { bang: 'DuaVaoHop', dong: { 'Mã': G.ma('GH'), 'Ngày': '', 'Loại': 'Pha kỵ', 'Liên kết': '#/phunbon', 'Tiêu đề': 'Nhật ký ' + nk['Mã NK'], 'Nội dung': 'Pha kỵ: ' + st.ky.join('; ') + ' · ' + G.tenVT(vts.join('|')), 'Đội': S.u.doi || '', 'Trạng thái': 'Chờ họp', 'Người ghi': '' } }).catch(() => {});
        if (maDH) { await API.goi('ghi', { bang: 'DichHaiCapNhat', dong: { 'Mã DH': maDH, 'Thời điểm': '', 'Việc đã làm': ten + ': ' + st.sp.map((x) => x.t.tenNgan || x.t.ten).join(' + '), 'Mã NK phun bón': nk['Mã NK'], 'Ảnh': b.anh, 'Người ghi': '' } }).catch(() => {}); await G.taoLichPhacDo(maDH, st.dt).catch(() => {}); }
        const dv = loai === 'thuoc' ? DV_PHUN[st.cay] : loai === 'goc' ? DV_BON[st.cay] : null; let tu = '';
        if (dv) { const hop_ = G.dsVT(dv).map((v) => v.ma); const ds = vts.filter((x) => hop_.includes(x));
          if (ds.length) { try { const t = await G.doc('TickDinhKy', { 'Kỳ': S.dm.ky.ten, 'Mã việc': dv }); const daL = new Set(t.filter((r) => (r['Trạng thái'] || 'Xong') === 'Xong').map((r) => r['Mã vị trí']));
            await API.goi('dinhKy.luu', { viec: dv, trangThai: 'Xong', anh: b.anh.slice(0, 2), maNK: nk['Mã NK'], ghiChu: 'Từ nhật ký ' + nk['Mã NK'], ds: ds.map((vt) => ({ vt, kv: (G.vt(vt) || {}).kv, lyDo: daL.has(vt) ? 'Theo yêu cầu' : '' })) }); tu = ` · đã đánh dấu ${ds.length} vị trí ${G.dvTen(dv)}`; } catch (er) { tu = ' · chưa đánh dấu định kỳ: ' + er.message; } } }
        manPhun.st = null; bao('Đã lưu ' + nk['Mã NK'] + (cl2 ? ` · cách ly đến ${G.ngayVN(G.congNgay(ngay, cl2))}` : '') + tu + (st.ky.length ? ' · đã báo Trưởng bộ phận pha kỵ' : '')); location.hash = maDH ? '#/dichhai' : '#/phunbon';
      }, e.target);
    };
    ve();
  }

  /* ================= DẬP DỊCH KHÉP KÍN (mục 19) ================= */
  G.taoLichPhacDo = async (maDH, dt) => { // sau mỗi lần phun: phiếu tái kiểm 7 ngày + phiếu phun lại 12 ngày (nếu chưa có)
    const ph = await G.doc('Phieu', null, 800); const co = (loai) => ph.some((p) => p['Mã DH'] === maDH && p['Loại lỗi'] === loai && p['Trạng thái'] !== 'Đã duyệt');
    const r = (await G.doc('DichHai', { 'Mã DH': maDH }))[0] || {};
    const tao = (loai, ngay, mt) => API.goi('phieu.tao', { loaiPhieu: 'Dịch hại', nguon: 'Phác đồ tự tạo', nhom: 'Dịch hại', loai, muc: 'Trung bình', vt: r['Mã vị trí'] || '', vtKhac: r['Vị trí chi tiết'] || '', moTa: mt + ' · hạn ' + G.ngayVN(ngay), giao: r['Cụm'] && /Villa|Hotel|Residences|Aura/.test(r['Cụm']) ? 'Đội cơ động' : 'Đội cơ động' }).then((x) => API.goi('sua', { bang: 'Phieu', khoa: { 'Mã phiếu': x.ma }, doi: { 'Mã DH': maDH, 'Hạn': ngay + ' 16:00' } }));
    if (!co('Tái kiểm tra dịch hại')) await tao('Tái kiểm tra dịch hại', G.congNgay(hn(), 7), `Tái kiểm ${dt || r['Loại dịch hại']} (${maDH}), chụp ảnh so sánh`);
    if (!co('Phun lại theo phác đồ')) await tao('Phun lại theo phác đồ', G.congNgay(hn(), 12), `Phun lại lần 2 (${maDH}) bằng thuốc luân phiên`);
  };
  G.phacDo = (r, cn, nk, ct, phieu) => {
    const g = G.goiYThuoc(r['Loại dịch hại']); const phun = (nk || []).filter((x) => x['Mã dịch hại'] === r['Mã DH']);
    const daDung = new Set((ct || []).filter((x) => phun.some((p) => p['Mã NK'] === x['Mã NK'])).map((x) => x['Sản phẩm']));
    const tong = {}; (ct || []).filter((x) => phun.some((p) => p['Mã NK'] === x['Mã NK'])).forEach((x) => { const k = x['Sản phẩm'] + ' (' + x['ĐVT'] + ')'; tong[k] = (tong[k] || 0) + (+x['Tổng lượng'] || 0); });
    const lanSau = g && g.spChinh && daDung.has(g.spChinh.t.ten) && g.spLuan ? g.spLuan : g ? g.spChinh : null;
    const anhDau = API.dsAnh(r['Ảnh'])[0]; const anhCuoi = API.dsAnh(r['Ảnh xong'] || ((cn || []).filter((x) => x['Ảnh']).slice(-1)[0] || {})['Ảnh'])[0];
    const lanCan = S.dm.vitri.filter((v) => v.cum === r['Cụm'] && v.ma !== r['Mã vị trí']).slice(0, 6);
    const lich = (phieu || []).filter((p) => p['Mã DH'] === r['Mã DH']);
    const taiKiem = r['Tái kiểm sau 14 ngày'];
    return `<div class="the the-xanh" style="margin-top:10px"><h3 style="font-size:15px;margin:0 0 6px">🔁 Phác đồ khép kín</h3>
      ${g ? `<div>Thuốc chính: <b>${esc(g.chinh || '—')}</b>${g.luan ? ` · luân phiên: <b>${esc(g.luan)}</b>` : ''}</div>${g.ghi ? `<div class="mo">${esc(g.ghi)}</div>` : ''}` : '<p class="mo">Chưa có phác đồ mẫu cho loại dịch hại này.</p>'}
      ${lanSau ? `<div style="margin-top:6px">Lần phun tới dùng: <b>${esc(lanSau.t.tenNgan || lanSau.t.ten)} ${esc(lanSau.lieu)} ${esc(lanSau.dvt)}/bình</b> <span class="mo">(luân phiên hoạt chất)</span></div>` : ''}
      <div style="margin-top:6px">Đã phun ${phun.length} lần${Object.keys(tong).length ? ': ' + Object.keys(tong).map((k) => `${esc(k)} ${G.so(tong[k], 2)}`).join(' · ') : ''} <span class="mo">· mọi lần phun cộng dồn vào thống kê thuốc</span></div>
      ${lich.length ? `<div style="margin-top:6px">${lich.map((p) => `<span class="chip ${p['Trạng thái'] === 'Đã duyệt' ? 'xanh' : 'cam'}" style="margin:2px">${esc(p['Loại lỗi'])} · ${G.ngayVN(String(p['Hạn']).slice(0, 10))}</span>`).join('')}</div>` : '<p class="mo" style="margin:6px 0 0">Lịch phun lại, tái kiểm tự tạo sau lần phun đầu.</p>'}
      ${anhDau || anhCuoi ? `<div class="luoi2" style="margin-top:8px"><div><div class="mo">Lúc phát hiện</div>${anhDau ? G.xemAnh(anhDau) : '—'}</div><div><div class="mo">Gần nhất</div>${anhCuoi ? G.xemAnh(anhCuoi) : '—'}</div></div>` : ''}
      ${lanCan.length ? `<div style="margin-top:6px" class="mo">Phun phòng vùng lân cận: ${lanCan.map((v) => esc(v.ten)).join(', ')}</div><a class="nut nho" href="#/phunbon/thuoc" style="margin-top:6px">Ghi phun phòng lân cận</a>` : ''}
      ${taiKiem ? `<div class="chip vang" style="margin-top:8px">Kiểm tra lại sau 14 ngày: ${G.ngayVN(taiKiem)}</div>` : ''}</div>`;
  };
  G.sauDuyetDH = async (r) => { const ngay = G.congNgay(hn(), 14); await API.goi('sua', { bang: 'DichHai', khoa: { 'Mã DH': r['Mã DH'] }, doi: { 'Tái kiểm sau 14 ngày': ngay } });
    const p = await API.goi('phieu.tao', { loaiPhieu: 'Dịch hại', nguon: 'Phác đồ tự tạo', nhom: 'Dịch hại', loai: 'Kiểm tra lại sau đóng hồ sơ', muc: 'Thấp', vt: r['Mã vị trí'] || '', vtKhac: r['Vị trí chi tiết'] || '', moTa: `Kiểm tra lại ${r['Loại dịch hại']} (${r['Mã DH']}) sau 14 ngày đóng hồ sơ`, giao: 'Đội cơ động' });
    await API.goi('sua', { bang: 'Phieu', khoa: { 'Mã phiếu': p.ma }, doi: { 'Mã DH': r['Mã DH'], 'Hạn': ngay + ' 16:00' } }); };

  /* ================= TÚI THUỐC HỌ DỪA (DV39, mục 20) ================= */
  G.man.tuithuoc = { ten: 'Túi thuốc họ dừa', ic: 'phun_bong_mat', bt: '🥥', nhom: 'Cây xanh', ph: 'phunbon', an: true, fn: async () => {
    const m = G.khung('Túi thuốc họ dừa', 'DV39 · 4 đợt/năm · 1 kg thuốc hạt = 100 túi (~10 g/túi)', '#/viec');
    const ds = await G.doc('TuiThuocDua', null, 3000); const nam = hn().slice(0, 4);
    const cay = ds.filter((r) => r['Loại dòng'] === 'Cây'); const dot = ds.filter((r) => r['Loại dòng'] === 'Đợt' && String(r['Ngày']).startsWith(nam));
    const tui = (l) => (/kè bạc/i.test(l) ? 4 : 1); const tongTui = cay.reduce((a, r) => a + tui(r['Loại cây']), 0);
    const ghi = G.qv('DV39') >= 2 && q('phunbon') >= 2;
    m.innerHTML = `<div class="luoi2" style="margin-bottom:12px"><div class="the so-the">${G.ic('phun_bong_mat', 44)}<div><b>${dot.length}/4</b><small>đợt năm ${nam}</small></div></div><div class="the so-the">${G.ic('thuoc', 44)}<div><b>${tongTui}</b><small>túi / đợt · ${G.so(tongTui / 100, 2)} kg thuốc</small></div></div></div>
      <div class="the"><h2>Danh sách cây (${cay.length})</h2><p class="mo" style="margin-top:0">Lập ở đợt đầu. Dừa, cọ: 1 túi/cây · Kè bạc: 4 túi/cây.</p>${cay.length ? `<table class="bang"><tr><th>Cây</th><th>Loại</th><th>Vị trí</th><th>Túi</th></tr>${cay.map((r) => `<tr><td>${esc(r['Tên / số cây'])}</td><td>${esc(r['Loại cây'])}</td><td>${esc(G.tenVT(r['Mã vị trí'], r['Vị trí khác']))}</td><td>${tui(r['Loại cây'])}</td></tr>`).join('')}</table>` : G.trong('Chưa lập danh sách. Bấm "Thêm cây" ở đợt đầu.')}
        ${ghi ? '<button class="nut rong" id="themCay" style="margin-top:8px">＋ Thêm cây vào danh sách</button>' : ''}</div>
      ${ghi ? '<button class="nut chinh rong" id="dot" style="margin-bottom:12px">Ghi đợt treo túi</button>' : ''}
      <div class="ds">${dot.reverse().map((r) => `<div class="muc"><div class="gian"><b>Đợt ${esc(r['Đợt'])} · ${G.ngayVN(r['Ngày'])}</b><div class="mo">${esc(r['Thuốc'])} · ${esc(r['Số túi'])} túi · ${esc(r['Kg thuốc'])} kg · ${esc(r['Người ghi'])}</div></div></div>`).join('') || '<div class="muc mo">Chưa có đợt nào năm nay</div>'}</div>`;
    const tc = m.querySelector('#themCay'); if (tc) tc.onclick = () => hop('Thêm cây họ dừa', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'loai', nhan: 'Loại cây', loai: 'chips', ds: ['Dừa', 'Cọ', 'Kè bạc'], bb: true }, { k: 'ten', nhan: 'Tên / số cây', loai: 'chu', goiY: 'Ví dụ: Dừa D12' }, { k: 'vt', nhan: 'Vị trí', loai: 'vitri', bb: true }, { k: 'sl', nhan: 'Số cây (nếu ghi gộp)', loai: 'so', gt: 1 }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const n = Math.max(1, +v.sl || 1); await API.goi('ghiNhieu', { bang: 'TuiThuocDua', dong: Array.from({ length: n }, (_, j) => ({ 'Loại dòng': 'Cây', 'Loại cây': v.loai, 'Tên / số cây': (v.ten || v.loai) + (n > 1 ? ' #' + (j + 1) : ''), 'Mã vị trí': v.vt.ma || '', 'Vị trí khác': v.vt.ma ? '' : v.vt.ten, 'Người ghi': '' })) }); dong(); bao('Đã thêm ' + n + ' cây'); G.taiLai(); }, e.target);
    });
    const dt = m.querySelector('#dot'); if (dt) dt.onclick = () => hop('Ghi đợt treo túi', `<p class="mo">Mẻ trộn: 1 kg thuốc hạt = 100 túi (~10 g/túi). Cần ${tongTui} túi ≈ ${G.so(tongTui / 100, 2)} kg.</p><div id="f"></div><button class="nut chinh rong" id="l">Lưu đợt</button>`, (o, dong) => {
      const thuoc = S.dm.thuoc.filter((t) => /hạt|GR|Vifu|Actara|Gòng/i.test(t.ten + ' ' + (t.nhom || ''))).map((t) => t.tenNgan || t.ten).concat(['Vifu-super 5GR', 'Actara 25WG', 'Siêu Gòng']);
      const lay = G.form(o.querySelector('#f'), [{ k: 'dot', nhan: 'Đợt', loai: 'chips', ds: ['1', '2', '3', '4'], bb: true, gt: String(dot.length + 1) }, { k: 'thuoc', nhan: 'Thuốc (trong danh mục)', loai: 'chips', ds: [...new Set(thuoc)], bb: true },
        { k: 'tui', nhan: 'Số túi đã treo', loai: 'so', bb: true, gt: tongTui }, { k: 'anh', nhan: 'Ảnh', loai: 'anh', toiDa: 4 }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const kg = Math.round(+v.tui / 100 * 100) / 100;
        await API.goi('ghi', { bang: 'TuiThuocDua', dong: { 'Loại dòng': 'Đợt', 'Ngày': hn(), 'Đợt': v.dot, 'Thuốc': v.thuoc, 'Số túi': v.tui, 'Kg thuốc': kg, 'Ảnh': v.anh, 'Ghi chú': v.gc, 'Người ghi': '' } });
        await API.goi('ghi', { bang: 'NhatKyPhunBon', dong: { 'Mã NK': '', 'Ngày giờ': API.bayGio().slice(0, 16), 'Loại (Phun thuốc/Phun phân bón lá/Bón gốc)': 'Phun thuốc', 'Mục đích': 'Phòng', 'Nhóm cây': 'Cây bóng mát', 'Đối tượng': 'Bọ cánh cứng, đuông dừa', 'Cụm': 'Họ dừa', 'Vị trí chi tiết': 'Túi thuốc đợt ' + v.dot, 'Ảnh': v.anh, 'Người ghi': '' } })
          .then((nk) => API.goi('ghiNhieu', { bang: 'NhatKyPhunBonChiTiet', dong: [{ 'Mã NK': nk['Mã NK'], 'STT': 1, 'Sản phẩm': v.thuoc, 'ĐVT': 'kg', 'Tổng lượng': kg }] }));
        dong(); bao(`Đã lưu đợt ${v.dot} · ${kg} kg thuốc cộng vào Thuốc BVTV`); G.taiLai(); }, e.target);
    });
  } };

  /* ================= BẢO TRÌ MÁY THEO GIỜ CHẠY (mục 21) ================= */
  const MOC = [
    { h: 25, ten: 'Mốc 25 giờ', ds: ['Vệ sinh lọc gió', 'Rửa cát muối', 'Kiểm tra lưới, curoa', 'Bơm mỡ', 'Kiểm tra trục PTO', 'Kiểm tra chốt khung 3 điểm'] },
    { h: 50, ten: 'Mốc 50 giờ', ds: ['Vệ sinh lọc gió', 'Rửa cát muối', 'Kiểm tra lưới, curoa', 'Bơm mỡ', 'Kiểm tra trục PTO', 'Kiểm tra chốt khung 3 điểm', 'Thay nhớt Sand Man', 'Dầu hộp số', 'Siết bulong', 'Công tắc an toàn', 'Nắp PTO', 'Lốp'] },
  ];
  const phut = (a, b) => { const p = (s) => { const x = String(s || '').match(/(\d+):(\d+)/); return x ? +x[1] * 60 + +x[2] : null; }; const x = p(a), y = p(b); return x != null && y != null ? Math.max(0, y - x) : 0; };
  G.gioMay = async () => {
    const d = await G.docNhieu([{ bang: 'MaySangCat', gioiHan: 5000 }, { bang: 'BaoTriMay', gioiHan: 2000 }]); const bt = d.BaoTriMay || [];
    const may = {};
    ['Sand Man', 'Kubota'].forEach((ten) => {
      const lanCuoi = bt.filter((r) => r['Máy'] === ten).slice(-1)[0];
      let gio;
      if (ten === 'Sand Man') gio = (d.MaySangCat || []).filter((r) => r['Máy'] === ten && r['Giờ kết thúc'] && (!lanCuoi || r['Ngày'] + r['Giờ kết thúc'] > String(lanCuoi['Giờ ghi'] || lanCuoi['Ngày']).replace(' ', ''))).reduce((a, r) => a + phut(r['Giờ bắt đầu'], r['Giờ kết thúc']), 0) / 60;
      else { const dh = bt.filter((r) => r['Máy'] === ten && r['Đồng hồ giờ']).concat((d.MaySangCat || []).filter((r) => r['Máy'] === ten && r['Đồng hồ giờ'])).sort((a, b) => (String(a['Ngày']) < String(b['Ngày']) ? -1 : 1)); const nay = dh.length ? +dh[dh.length - 1]['Đồng hồ giờ'] : 0; gio = Math.max(0, nay - (lanCuoi ? +lanCuoi['Đồng hồ giờ'] || 0 : 0)); may.KubotaDongHo = nay; }
      const tong = bt.filter((r) => r['Máy'] === ten).reduce((a, r) => a + (+r['Giờ từ lần trước'] || 0), 0) + gio;
      may[ten] = { gio: Math.round(gio * 10) / 10, lanCuoi, tong: Math.round(tong * 10) / 10, can: gio >= 50 ? MOC[1] : gio >= 25 ? MOC[0] : null, tho: tong >= 100 };
    });
    return may;
  };
  const nbFn = G.man.nb.fn;
  G.man.nb = Object.assign(G.man.nb, { fn: async (loai) => {
    await nbFn(loai); const m = document.getElementById('noiDung'); if (!m) return;
    if (loai === 'may') {
      const g = await G.gioMay(); const ghi = q('noibo') >= 2;
      m.querySelectorAll('p.mo').forEach((p) => { if (/Lịch bảo trì/.test(p.textContent)) p.remove(); }); const btCu = m.querySelector('#bt'); if (btCu) btCu.remove();
      m.insertAdjacentHTML('afterbegin', `<div class="luoi2" style="margin-bottom:12px">${['Sand Man', 'Kubota'].map((t) => `<div class="the ${g[t].can ? 'the-do' : ''}"><b>${t}</b><div class="so-lon">${G.so(g[t].gio)} giờ</div><div class="mo">từ lần bảo trì trước${t === 'Sand Man' ? ' · cộng từ nhật ký chạy máy (Honda)' : ' · theo đồng hồ giờ đầu kéo'}</div>
        <div class="thanh ${g[t].gio >= 25 ? 'do' : g[t].gio >= 20 ? 'cam' : ''}" style="margin:6px 0"><i style="width:${Math.min(100, g[t].gio / 50 * 100)}%"></i></div><div class="mo">${g[t].can ? '⚠️ Đến ' + g[t].can.ten : 'Mốc 25 giờ: còn ' + G.so(Math.max(0, 25 - g[t].gio)) + ' giờ'}${g[t].tho ? ' · 100–200 giờ/năm: gọi thợ' : ''}</div>
        ${ghi ? `<button class="nut nho ${g[t].can ? 'chinh' : ''}" data-bt="${t}" style="margin-top:6px">🔧 Ghi bảo trì</button>${t === 'Kubota' ? '<button class="nut nho" id="dhKubota" style="margin:6px 0 0 6px">Nhập đồng hồ giờ</button>' : ''}` : ''}</div>`).join('')}</div>
        <p class="mo">Không có checklist trước mỗi lần dùng. 25 giờ: ${MOC[0].ds.join(', ').toLowerCase()}. 50 giờ: thêm thay nhớt Sand Man, dầu hộp số, siết bulong, công tắc an toàn, nắp PTO, lốp. 100–200 giờ/năm: gọi thợ.</p>`);
      m.querySelectorAll('[data-bt]').forEach((b) => { b.onclick = () => { const t = b.dataset.bt; const moc = g[t].can || MOC[0];
        hop('Bảo trì ' + t + ' · ' + moc.ten, '<div id="f"></div><button class="nut chinh rong" id="l">Lưu bảo trì</button>', (o, dong) => {
          const lay = G.form(o.querySelector('#f'), [{ k: 'moc', nhan: 'Mốc', loai: 'chips', ds: ['Mốc 25 giờ', 'Mốc 50 giờ', 'Sửa chữa / gọi thợ'], bb: true, gt: moc.ten }, { k: 'ck', nhan: 'Đã làm', loai: 'nhieu', ds: MOC[1].ds, gt: moc.ds },
            t === 'Kubota' ? { k: 'dh', nhan: 'Đồng hồ giờ hiện tại', loai: 'so', bb: true, gt: g.KubotaDongHo || '' } : { nhan: `Giờ chạy từ lần trước: ${G.so(g[t].gio)} giờ`, loai: 'ghichu' }, { k: 'anh', nhan: 'Ảnh', loai: 'anh', toiDa: 4 }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
          o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'BaoTriMay', dong: { 'Ngày': hn(), 'Máy': t, 'Mốc': v.moc, 'Đã làm': v.ck, 'Giờ từ lần trước': g[t].gio, 'Đồng hồ giờ': v.dh || '', 'Ảnh': v.anh, 'Ghi chú': v.gc, 'Người ghi': '', 'Giờ ghi': '' } });
            await API.goi('ghi', { bang: 'MaySangCat', dong: { 'Ngày': '', 'Máy': t, 'Bảo trì': 'Bảo trì định kỳ', 'Ghi chú': v.moc + ': ' + v.ck.join(', '), 'Ảnh': v.anh, 'Người ghi': '' } }); dong(); bao('Đã lưu, đặt lại giờ chạy về 0'); G.taiLai(); }, e.target);
        }); }; });
      const dk = m.querySelector('#dhKubota'); if (dk) dk.onclick = async () => { const t = await G.hoi('Đồng hồ giờ Kubota (giờ)'); if (t) chay(async () => { await API.goi('ghi', { bang: 'MaySangCat', dong: { 'Ngày': '', 'Máy': 'Kubota', 'Bảo trì': 'Đọc đồng hồ giờ', 'Đồng hồ giờ': t, 'Người ghi': '' } }); G.taiLai(); }); };
    }
  } });

  /* ================= CÔNG NHÂN: chọn hàng loạt, một người nhiều khu, không vượt số người tối đa (mục 4, 5) ================= */
  const cnFn = G.man.congnhan.fn;
  G.man.congnhan = Object.assign(G.man.congnhan, { fn: async () => {
    await cnFn(); const m = document.getElementById('noiDung'); if (!m || q('congnhan') < 3) return;
    const khu = await G.doc('KhuPhuTrach'); S.dm.khu = khu; const cn = (S.dm.congnhan || []).filter((x) => x.tt !== 'Đã nghỉ');
    const db = G.thieuDinhBien(null, khu);
    m.insertAdjacentHTML('afterbegin', `<div class="the"><h2>Định biên ${G.TONG_DINH_BIEN} người · hiện có ${db.co}</h2>
      <table class="bang"><tr><th>Đội</th><th>Chức danh</th><th>Định biên</th><th>Hiện có</th></tr>${G.DINH_BIEN.map(([d, c, n]) => { const co = cn.filter((x) => (d === 'Quản lý nhà thầu' || x.doi === d) && (c === 'Quản lý nhà thầu' ? /Quản lý/.test(x.cd) : /vườn ươm/i.test(c) ? /vườn ươm/i.test(x.cd) : String(x.cd).toLowerCase() === c.toLowerCase())).length; return `<tr><td>${esc(d)}</td><td>${esc(c)}</td><td>${n}</td><td style="color:${co < n ? 'var(--do)' : 'inherit'}"><b>${co}</b>${co < n ? ' (thiếu ' + (n - co) + ')' : ''}</td></tr>`; }).join('')}</table></div>
      <div class="the"><div class="hang"><h2 class="gian" style="margin:0">Khu phụ trách</h2><button class="nut nho" id="hangLoat">☑ Chọn hàng loạt</button></div><p class="mo">Một người nhận được nhiều khu. Mỗi cụm không chọn vượt số người tối đa (tab KhuPhuTrach).</p>
      ${Object.keys(G.DINH_BIEN_KHU).map((c) => { const ng = khu.filter((r) => r['Cụm'] === c); const max = G.DINH_BIEN_KHU[c]; return `<div class="muc" data-khu="${esc(c)}" style="cursor:pointer;padding:8px 0;border-bottom:1px solid var(--vien2);display:flex;gap:8px"><div class="gian"><b>${esc(c)}</b> <span class="mo">${max ? ng.length + '/' + max + ' người' : 'không giới hạn'}</span><div class="mo">${ng.map((r) => esc((cn.find((x) => x.ma === r['Mã CN']) || {}).ten || r['Mã CN'])).join(', ') || '<span style="color:var(--do)">Chưa có người</span>'}</div></div>›</div>`; }).join('')}</div>`);
    m.querySelectorAll('[data-khu]').forEach((d) => { d.onclick = () => { const c = d.dataset.khu; const max = G.DINH_BIEN_KHU[c]; const chon = new Set(khu.filter((r) => r['Cụm'] === c).map((r) => r['Mã CN']));
      const ds = cn.filter((x) => x.doi === 'Đội khu vực');
      hop('Khu ' + c + (max ? ` · tối đa ${max} người` : ''), `<div class="ds">${ds.map((x) => `<label class="muc" style="cursor:pointer"><input type="checkbox" data-cn="${x.ma}" ${chon.has(x.ma) ? 'checked' : ''}><div class="gian">${esc(x.ten)}<div class="mo">${esc(x.cd)} · ${khu.filter((r) => r['Mã CN'] === x.ma && r['Cụm'] !== c).map((r) => esc(r['Cụm'])).join(', ') || 'chưa có khu khác'}</div></div></label>`).join('')}</div><button class="nut chinh rong" id="l" style="margin-top:10px">Lưu</button>`, (o, dong) => {
        o.querySelectorAll('[data-cn]').forEach((i) => { i.onchange = () => { if (i.checked) { if (max && chon.size >= max) { i.checked = false; return bao(`Cụm ${c} tối đa ${max} người`, true); } chon.add(i.dataset.cn); } else chon.delete(i.dataset.cn); }; });
        o.querySelector('#l').onclick = (e) => chay(async () => { await API.goi('thayNhom', { bang: 'KhuPhuTrach', khoa: { 'Cụm': c }, dong: [...chon].map((ma) => ({ 'Cụm': c, 'Mã CN': ma, 'Người ghi': '' })) }); S.dm.khu = await G.doc('KhuPhuTrach'); dong(); bao('Đã lưu khu ' + c); G.taiLai(); }, e.target);
      }); }; });
    m.querySelector('#hangLoat').onclick = () => { const chon = new Set();
      hop('Chọn hàng loạt công nhân', `<div class="nhom-nut" style="margin-bottom:8px"><button class="nut nho" id="tatCa">Chọn tất cả</button><button class="nut nho" id="boHet">Bỏ chọn</button></div><div class="ds">${cn.map((x) => `<label class="muc"><input type="checkbox" data-cn="${x.ma}"><div class="gian">${esc(x.ten)}<div class="mo">${esc(x.doi)} · ${esc(x.cd)}</div></div></label>`).join('')}</div>
        <div id="f" style="margin-top:10px"></div><button class="nut chinh rong" id="l">Áp dụng cho người đã chọn</button>`, (o, dong) => {
        const lay = G.form(o.querySelector('#f'), [{ k: 'doi', nhan: 'Chuyển đội (không bắt buộc)', loai: 'chips', ds: ['Đội khu vực', 'Đội cơ động'] }, { k: 'cd', nhan: 'Đổi chức danh (không bắt buộc)', loai: 'chips', ds: ['Nhân viên khu vực', 'Nhân viên vườn ươm', 'Nhân viên cải tạo', 'Cắt cỏ', 'Vận chuyển', 'Bón phân + phun thuốc', 'Cắt tỉa cây bóng mát'] }, { k: 'khu', nhan: 'Thêm khu phụ trách (không bắt buộc)', loai: 'chips', ds: Object.keys(G.DINH_BIEN_KHU) }]);
        o.querySelectorAll('[data-cn]').forEach((i) => { i.onchange = () => { if (i.checked) chon.add(i.dataset.cn); else chon.delete(i.dataset.cn); }; });
        o.querySelector('#tatCa').onclick = () => o.querySelectorAll('[data-cn]').forEach((i) => { i.checked = true; chon.add(i.dataset.cn); });
        o.querySelector('#boHet').onclick = () => o.querySelectorAll('[data-cn]').forEach((i) => { i.checked = false; chon.delete(i.dataset.cn); });
        o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); if (!chon.size) throw new Error('Chưa chọn ai');
          if (v.khu) { const max = G.DINH_BIEN_KHU[v.khu]; const co = khu.filter((r) => r['Cụm'] === v.khu).map((r) => r['Mã CN']); const moi = [...chon].filter((x) => !co.includes(x)); if (max && co.length + moi.length > max) throw new Error(`Cụm ${v.khu} tối đa ${max} người, đang có ${co.length}`); if (moi.length) await API.goi('ghiNhieu', { bang: 'KhuPhuTrach', dong: moi.map((ma) => ({ 'Cụm': v.khu, 'Mã CN': ma, 'Người ghi': '' })) }); }
          for (const ma of chon) { const doi = {}; if (v.doi) doi.doi = v.doi; if (v.cd) doi.cd = v.cd; if (Object.keys(doi).length) await API.goi('congNhan.sua', { ma, doi, lyDo: 'Chọn hàng loạt' }); }
          await G.taiDanhMuc(); dong(); bao(`Đã áp dụng cho ${chon.size} người`); G.taiLai(); }, e.target);
      }); };
  } });
})();
