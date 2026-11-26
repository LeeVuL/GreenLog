/* GreenLog 0.4.3 – Báo cáo đầu ca (mục 83–86)
   83: đủ danh sách việc (hằng ngày · định kỳ còn lại · kế hoạch/phiếu/khác), tự điền người theo chức danh.
   84: tick không tải lại trang (không nhảy lên đầu); người thu gọn "👥 N người · Sửa".
   85: kế hoạch đã gửi chỉ hiện tên việc · khu vực · số người, chạm để xem chi tiết.
   86: việc định kỳ chọn nhanh khu vực → gửi xong các vị trí chuyển "Đang làm" → Chốt ngày đánh dấu vị trí đã xong. */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay, bao } = G;
  const hn = () => API.ngay();
  const gioNay = () => API.bayGio().slice(11, 16);
  const TT_DD = 'Trạng thái (Có mặt/Vắng/Về sớm)';

  /* việc hằng ngày theo đội: [mã, tên hiển thị (rỗng = theo danh mục), chức danh làm] */
  const HANG_NGAY = {
    'Đội cơ động': [['CD01', 'Hỗ trợ vệ sinh bãi biển đầu ca sáng', ['Vận chuyển'], 2], ['CN04', 'Vận chuyển rác cắt tỉa, vật tư', ['Vận chuyển']]], // 0.4.7 mục 124
    'Đội khu vực': [['DV10', '', ['Nhân viên khu vực']], ['DV11', '', ['Nhân viên khu vực']], ['DV09', '', ['Nhân viên khu vực']],
      ['DV17', 'Vườn ươm cây bụi: tưới, vệ sinh', ['vườn ươm']], ['DV12', '', ['Tổ trưởng']]],
  };
  /* việc định kỳ theo đội: mã → chức danh làm */
  const DINH_KY = {
    'Đội cơ động': { DV01: ['Cắt cỏ'], DV02: ['Bón phân + phun thuốc'], DV04: ['Bón phân + phun thuốc'], DV05: ['Bón phân + phun thuốc'],
      DV06: ['Bón phân + phun thuốc'], DV38: ['Bón phân + phun thuốc'], DV07: ['Cắt tỉa cây bóng mát'] },
    'Đội khu vực': { DV03: ['Nhân viên khu vực'], DV08: ['Nhân viên khu vực'], DV37: ['Nhân viên khu vực'], DV42: ['Nhân viên khu vực'] },
  };
  G.DN_DINH_KY = DINH_KY;
  const NHOM = ['Việc hằng ngày của đội', 'Việc định kỳ còn lại trong kỳ', 'Kế hoạch tuần, phiếu, việc khác'];
  const nhomCua = (x) => (x.nhom != null ? x.nhom : 2);

  /* tóm tắt một tập vị trí theo cụm: "Villa 25 - 48 (cả cụm)" · "Villa 26, Villa 27" · "Hotel: 6 khu" */
  G.tomVT = (ma, ds) => {
    const goc = ds || S.dm.vitri; const chon = new Set(ma);
    const cums = [...new Set(goc.filter((v) => chon.has(v.ma)).map((v) => v.cum))];
    const khac = [...chon].filter((x) => !goc.some((v) => v.ma === x));
    const t = cums.map((c) => { const tat = goc.filter((v) => v.cum === c); const n = tat.filter((v) => chon.has(v.ma)).length;
      if (n === tat.length) return c + ' (cả cụm)';
      const kv = [...new Set(tat.filter((v) => chon.has(v.ma)).map((v) => v.kv))];
      return kv.length <= 3 ? kv.join(', ') : `${c}: ${kv.length} khu`; });
    return t.concat(khac.map((x) => G.tenVT(x))).join(' · ');
  };

  const goiYGoc = G.goiYNgay;
  G.goiYNgay = async (doi, ngay) => {
    const khac = (await goiYGoc(doi, ngay)).map((x) => Object.assign(x, { nhom: 2 }));
    const out = [];
    (HANG_NGAY[doi] || []).forEach(([ma, ten, cd, toiDa]) => { if (G.qv(ma) >= 2 || /^CD/.test(ma)) out.push({ nhom: 0, nguon: 'Hằng ngày', nd: ten || G.dvTen(ma), ma: 'HN:' + ma + ':' + (ngay || hn()), cd, toiDa }); });
    const dk = DINH_KY[doi] || {}; const maDK = Object.keys(dk).filter((ma) => G.qv(ma) >= 2 && S.dm.dauviec.some((v) => v.ma === ma));
    if (maDK.length) {
      const k = (S.dm.ky || {}).ten; let ticks = []; let dangTat = [];
      try { [ticks, dangTat] = await Promise.all([k ? G.doc('TickDinhKy', { 'Kỳ': k }) : [], G.doc('TickDinhKy', { 'Trạng thái': 'Đang làm' })]); } catch (e) { ticks = []; }
      maDK.forEach((ma) => {
        const ds = G.dsVT(ma); const tong = ds.length || S.dm.vitri.filter((v) => v.ap === 'Có').length;
        const xong = new Set(ticks.filter((r) => r['Mã việc'] === ma && (r['Trạng thái'] || 'Xong') === 'Xong').map((r) => r['Mã vị trí']));
        const dang = [...new Set(dangTat.filter((r) => r['Mã việc'] === ma).map((r) => r['Mã vị trí']))];
        if (xong.size >= tong) return;
        out.push({ nhom: 1, nguon: 'Định kỳ', nd: G.dvTen(ma), ma: 'DK:' + ma, maViec: ma, ds, xong, dang,
          vt: `còn ${tong - xong.size}/${tong} vị trí${dang.length ? ' · ' + dang.length + ' đang làm' : ''}`, cd: dk[ma] });
      });
    }
    const coDK = new Set(out.filter((x) => x.nhom === 1).map((x) => x.ma));
    return out.concat(khac.filter((x) => !coDK.has(x.ma)));
  };

  const khopCD = (cn, cd) => { const c = String((cn && cn.cd) || '').toLowerCase(); return cd.some((x) => (/vườn ươm/i.test(x) ? /vườn ươm/.test(c) : c === x.toLowerCase())); };
  const goiYNguoi = (x, cm) => {
    if (!x.cd) return [];
    const cn = S.dm.congnhan || [];
    const ds = cm.filter((r) => { const c = cn.find((n) => n.ma === r['Mã CN']) || cn.find((n) => n.ten === r['Họ tên']); return khopCD(c, x.cd); }).map((r) => r['Họ tên']); return x.toiDa ? ds.slice(0, x.toiDa) : ds;
  };
  const ngan = (t) => String(t).split(' ').slice(-2).join(' ');

  /* chọn khu vực cho việc định kỳ: mở sẵn vị trí "đang làm" để làm tiếp */
  const chonKhu = (x, cu) => G.chonViTri({ ds: x.ds, chon: cu && cu.length ? cu : x.dang, coMat: true,
    trangThai: (ma) => (x.xong.has(ma) ? { cls: 'xong' } : x.dang.includes(ma) ? { cls: 'dang', sub: 'đang làm' } : { cls: '' }) });
  const layVT = (r) => (r && r.nhieu ? r.nhieu : r && r.ma ? String(r.ma).split(' | ') : null);

  G.man.batdaungay = { an: true, fn: async () => {
    const doi = S.u.doi || 'Đội khu vực'; const m = G.khung('Bắt đầu ngày · ' + doi, `${G.thu()} ${G.ngayVN(hn())} · hạn gửi 07:30`, '#/');
    const [cm, dc, gv, goiY] = await Promise.all([
      G.doc('DiemDanh', { 'Ngày': hn(), 'Buổi': 'Sáng' }).then((r) => r.filter((x) => x['Đội'] === doi && /Có mặt/.test(x[TT_DD]))),
      G.doc('DuyetCong', { 'Ngày': hn(), 'Buổi': 'Sáng' }), G.doc('GiaoViecNgay', { 'Ngày': hn(), 'Đội': doi }), G.goiYNgay(doi)]);
    const daDD = dc.some((x) => x['Đội'] === doi);
    const st = G.man.batdaungay.st && G.man.batdaungay.st.ngay === hn() && G.man.batdaungay.st.doi === doi ? G.man.batdaungay.st : (G.man.batdaungay.st = { ngay: hn(), doi, chon: {}, them: [], vt: {}, mo: {} });
    const daGui = new Set(gv.map((g) => g['Mã nguồn']));
    const ds = goiY.concat(st.them).filter((x) => !daGui.has(x.ma));

    const dongHTML = (x, i) => { const c = st.chon[x.ma];
      let h = `<label class="hang" style="cursor:pointer"><input type="checkbox" data-tick="${i}" ${c ? 'checked' : ''}><div class="gian"><b>${esc(x.nd)}</b><div class="mo">${esc(x.nguon)}${x.vt ? ' · ' + esc(x.vt) : ''}</div></div></label>`;
      if (!c) return h;
      if (x.maViec) { const v = st.vt[x.ma] || []; h += `<div class="dn-phu"><span class="gian">📍 ${v.length ? esc(G.tomVT(v, x.ds)) + ` <span class="mo">(${v.length} vị trí)</span>` : '<span style="color:var(--do)">Chưa chọn khu vực</span>'}</span><button type="button" class="nut nho" data-khu="${i}">${v.length ? 'Đổi' : 'Chọn khu vực'}</button></div>`; }
      const ten = [...c]; const mo = st.mo[x.ma];
      h += `<div class="dn-phu"><span class="gian">👥 ${ten.length ? `${ten.length} người <span class="mo">· ${esc(ten.slice(0, 3).map(ngan).join(', '))}${ten.length > 3 ? '…' : ''}</span>` : '<span style="color:var(--do)">Chưa chọn người</span>'}</span><button type="button" class="nut nho" data-mo="${i}">${mo ? 'Xong ▴' : 'Sửa ▾'}</button></div>`;
      if (mo) h += `<div class="chon boc" style="margin:6px 0 0 26px">${cm.map((r) => `<button type="button" data-ng="${i}" data-ten="${esc(r['Họ tên'])}" class="${c.has(r['Họ tên']) ? 'dang' : ''}">${esc(ngan(r['Họ tên']))}</button>`).join('') || '<span class="mo">Chưa có người điểm danh</span>'}</div>`;
      return h; };
    const nhomHTML = (n) => { const ds2 = ds.filter((x) => nhomCua(x) === n); if (!ds2.length) return '';
      const het = ds2.every((x) => st.chon[x.ma]);
      return `<div data-nhom="${n}"><div style="display:flex;align-items:center;gap:8px;margin:14px 0 4px"><b style="flex:1">${NHOM[n]} (${ds2.length})</b>${n === 0 ? `<button type="button" class="nut nho" data-tatca="${n}">${het ? 'Bỏ chọn hết' : 'Chọn hết'}</button>` : ''}</div>
        ${ds2.map((x) => `<div class="dong-cham dn-dong" style="display:block" data-row="${ds.indexOf(x)}">${dongHTML(x, ds.indexOf(x))}</div>`).join('')}</div>`; };
    const nutGui = () => { const n = ds.filter((x) => st.chon[x.ma]).length; return `${n ? `Gửi kế hoạch · ${n} việc` : 'Gửi kế hoạch'}${gioNay() > '07:30' && !gv.length ? ' (đã quá 07:30)' : ''}`; };
    const daGuiHTML = () => (gv.length ? `<div class="the the-xanh"><b>Đã gửi kế hoạch ${esc(String(gv[0]['Giờ giao']).slice(11, 16))} · ${gv.length} việc</b><div class="mo">Chạm việc để xem người và vị trí</div>
      ${gv.map((g) => `<div class="the-viec" data-xem="${esc(g['Mã'])}" style="margin:6px 0 0;cursor:pointer"><span class="gian"><b>${esc(g['Nội dung'])}</b><span class="mo">${esc([g['Vị trí'], String(g['Người'] || '').split(', ').filter(Boolean).length + ' người'].filter(Boolean).join(' · '))}</span></span>›</div>`).join('')}</div>` : '');

    m.innerHTML = `<div class="the ${daDD ? 'the-xanh' : 'the-do'}"><div class="buoc"><span>1</span>Điểm danh sáng + ảnh tập thể</div>${daDD ? `<p style="margin:0">✓ Đã gửi · ${cm.length} người có mặt</p>` : '<a class="nut chinh rong" href="#/diemdanh">Điểm danh ngay</a>'}</div>
      <div class="the"><div class="buoc"><span>2</span>Việc hôm nay của đội</div><p class="mo" style="margin-top:0">Tick việc làm hôm nay. App tự điền người theo chức danh, chạm Sửa để đổi người.</p>
        <div id="dnDS">${[0, 1, 2].map(nhomHTML).join('') || '<p class="mo">Đã giao hết việc hôm nay.</p>'}</div>
        <button type="button" class="nut nho" id="themViec" style="margin-top:10px">＋ Thêm việc khác</button></div>
      ${daGuiHTML()}
      <div style="height:80px"></div>
      <div class="thanh-duoi"><button class="nut chinh" id="gui">${nutGui()}</button></div>`;
    const nut = m.querySelector('#gui');
    const veDong = (i) => { const el = m.querySelector(`[data-row="${i}"]`); if (el) el.innerHTML = dongHTML(ds[i], i); nut.textContent = nutGui(); };
    const veNhom = (n) => { const el = m.querySelector(`[data-nhom="${n}"]`); if (el) el.outerHTML = nhomHTML(n); nut.textContent = nutGui(); };
    const capNhatNutNhom = (n) => { const b = m.querySelector(`[data-tatca="${n}"]`); if (b) b.textContent = ds.filter((y) => nhomCua(y) === n).every((y) => st.chon[y.ma]) ? 'Bỏ chọn hết' : 'Chọn hết'; };
    const bat = async (x, i) => { st.chon[x.ma] = new Set(goiYNguoi(x, cm)); veDong(i);
      if (x.maViec && !(st.vt[x.ma] || []).length) { const v = layVT(await chonKhu(x)); if (v) st.vt[x.ma] = v; veDong(i); } };
    /* một bộ bắt sự kiện cho cả màn: thay đổi chỉ vẽ lại dòng đó, trang đứng yên */
    m.addEventListener('change', (e) => { const t = e.target.closest('[data-tick]'); if (!t) return; const i = +t.dataset.tick; const x = ds[i];
      if (t.checked) bat(x, i); else { delete st.chon[x.ma]; delete st.mo[x.ma]; veDong(i); }
      capNhatNutNhom(nhomCua(x)); });
    m.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-tatca],[data-mo],[data-ng],[data-khu],[data-xem]'); if (!b) return;
      if (b.dataset.tatca != null) { const n = +b.dataset.tatca; const ds2 = ds.filter((x) => nhomCua(x) === n); const het = ds2.every((x) => st.chon[x.ma]);
        ds2.forEach((x) => { if (het) delete st.chon[x.ma]; else if (!st.chon[x.ma]) st.chon[x.ma] = new Set(goiYNguoi(x, cm)); }); veNhom(n); return; }
      if (b.dataset.mo != null) { const x = ds[+b.dataset.mo]; st.mo[x.ma] = !st.mo[x.ma]; return veDong(+b.dataset.mo); }
      if (b.dataset.ng != null) { const i = +b.dataset.ng; const s = st.chon[ds[i].ma]; if (s.has(b.dataset.ten)) s.delete(b.dataset.ten); else s.add(b.dataset.ten); return veDong(i); }
      if (b.dataset.khu != null) { const i = +b.dataset.khu; const x = ds[i]; const v = layVT(await chonKhu(x, st.vt[x.ma])); if (v) st.vt[x.ma] = v; return veDong(i); }
      if (b.dataset.xem != null) { const g = gv.find((y) => y['Mã'] === b.dataset.xem); if (!g) return;
        const ng = String(g['Người'] || '').split(', ').filter(Boolean);
        G.hop(g['Nội dung'], `<div class="mo">${esc(g['Nguồn'] || '')} · giao ${esc(String(g['Giờ giao']).slice(11, 16))} · ${esc(g['Trạng thái'] || '')}</div>
          ${g['Vị trí'] ? `<p><b>📍 Vị trí:</b> ${esc(g['Vị trí'])}</p>` : ''}<p><b>👥 Người (${ng.length}):</b></p>
          <div class="chon boc">${ng.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>`); }
    });
    m.querySelector('#themViec').onclick = async () => { const t = await G.hoi('Việc thêm hôm nay'); if (t) { const x = { nhom: 2, nguon: 'Tổ trưởng thêm', nd: t, ma: G.ma('GV') }; st.them.push(x); st.chon[x.ma] = new Set(); G.taiLai(); } };
    nut.onclick = (e) => chay(async () => {
      const chon = ds.filter((x) => st.chon[x.ma]); if (!chon.length) throw new Error('Chưa tick việc nào');
      const thieu = chon.filter((x) => !st.chon[x.ma].size); if (thieu.length) throw new Error('Chọn người cho: ' + thieu.map((x) => x.nd).join(', '));
      const thieuVT = chon.filter((x) => x.maViec && !(st.vt[x.ma] || []).length); if (thieuVT.length) throw new Error('Chọn khu vực cho: ' + thieuVT.map((x) => x.nd).join(', '));
      const gio = API.bayGio();
      /* mục 86: vị trí định kỳ chuyển "Đang làm" ngay khi gửi */
      for (const x of chon.filter((y) => y.maViec)) {
        const moi = st.vt[x.ma].filter((v) => !x.dang.includes(v)); if (!moi.length) continue;
        await API.goi('dinhKy.luu', { viec: x.maViec, trangThai: 'Đang làm', tuKeHoach: true, anh: [], ghiChu: 'Giao trong kế hoạch ngày',
          ds: moi.map((v) => ({ vt: v, kv: (G.vt(v) || {}).kv || '', lyDo: x.xong.has(v) ? 'Theo kế hoạch ngày' : '' })) });
      }
      await API.goi('ghiNhieu', { bang: 'GiaoViecNgay', dong: chon.map((x) => ({ 'Mã': G.ma('GV'), 'Ngày': hn(), 'Đội': doi, 'Nguồn': x.nguon, 'Mã nguồn': x.ma, 'Nội dung': x.nd,
        'Vị trí': x.maViec ? G.tomVT(st.vt[x.ma], x.ds) : (x.vt || ''), 'Mã vị trí': x.maViec ? st.vt[x.ma].join('|') : '', 'Người': [...st.chon[x.ma]].join(', '), 'Trạng thái': 'Chưa làm', 'Giờ giao': gio, 'Người giao': S.u.ten })) });
      if (!gv.length) await API.goi('ghiNhieu', { bang: 'NgayLamViec', thay: ['Ngày', 'Đội', 'Loại'], dong: [{ 'Ngày': hn(), 'Đội': doi, 'Loại': 'Bắt đầu ngày', 'Giờ': gio, 'Đúng hạn': gioNay() <= '07:30' ? 'Có' : 'Trễ', 'Số người': cm.length, 'Trạng thái': 'Đã gửi', 'Người ghi': S.u.ten }] });
      const zalo = `🌅 KẾ HOẠCH ${doi.toUpperCase()} ${G.ngayVN(hn())}\nCó mặt: ${cm.length}\n${chon.map((x, i) => `${i + 1}. ${x.nd}${x.maViec ? ' (' + G.tomVT(st.vt[x.ma], x.ds) + ')' : x.vt ? ' (' + x.vt + ')' : ''} · ${st.chon[x.ma].size} người`).join('\n')}`;
      chon.forEach((x) => { delete st.chon[x.ma]; delete st.vt[x.ma]; delete st.mo[x.ma]; }); st.them = st.them.filter((x) => !chon.includes(x));
      bao(`Đã gửi kế hoạch · ${chon.length} việc`); await (G.guiAnhNgay ? G.guiAnhNgay('dau', doi, zalo) : G.guiZalo(zalo, '')).catch(() => {});
      G.taiLai();
    }, e.target);
  } };

  /* đánh dấu vị trí định kỳ đã xong (dùng ở Hôm nay và Chốt ngày): con = các vị trí đang làm, sau(n) khi lưu xong */
  G.xongViTriDK = (ma, con, sau) => G.hop('Vị trí đã xong · ' + G.dvTen(ma), `<p class="mo" style="margin-top:0">Các vị trí đang làm đã được chọn sẵn. Bỏ chọn chỗ chưa xong, chụp ảnh rồi lưu. Chỗ chưa xong mai tự hiện lại để làm tiếp.</p><div id="lv"></div><div class="buoc" style="margin-top:10px"><span>📷</span>Ảnh sau khi làm</div><div id="anh"></div><button class="nut chinh rong" id="luu" style="margin-top:10px">Lưu vị trí đã xong</button>`, (o, dong2) => {
    const ds = con.map((v) => G.vt(v) || { ma: v, cum: 'Khác', kv: v, ten: v }); const s = { cum: '', mat: 'Cả 3', chon: new Set(con) };
    G.luoiVT(o.querySelector('#lv'), { ds, st: s, coMat: true, trangThai: () => ({ cls: 'dang', sub: 'đang làm' }), doi: () => {} });
    const anh = G.oAnh(o.querySelector('#anh'), { toiDa: 6 });
    o.querySelector('#luu').onclick = (e) => chay(async () => {
      if (!s.chon.size) throw new Error('Chưa chọn vị trí nào');
      const a = anh.ds(); if (!a.length) throw new Error('Cần ít nhất 1 ảnh');
      await API.goi('dinhKy.luu', { viec: ma, trangThai: 'Xong', anh: a, ds: [...s.chon].map((v) => ({ vt: v, kv: (G.vt(v) || {}).kv || '' })), ghiChu: 'Hoàn thành ' + G.ngayVN(hn()) });
      dong2(); bao(`Đã xong ${s.chon.size} vị trí`); if (sau) sau(s.chon.size);
    }, e.target);
  });

  /* ---------- CHỐT NGÀY: việc định kỳ → đánh dấu vị trí đã xong (mục 86) ---------- */
  const chotGoc = G.man.chotngay.fn;
  G.man.chotngay.fn = async (...a) => {
    await chotGoc(...a);
    const m = document.getElementById('noiDung'); if (!m) return;
    const doi = S.u.doi || 'Đội khu vực';
    const gv = (await G.doc('GiaoViecNgay', { 'Ngày': hn(), 'Đội': doi })).filter((g) => /^DK:/.test(g['Mã nguồn'] || '') && g['Mã vị trí']);
    if (!gv.length) return;
    const dang = await G.doc('TickDinhKy', { 'Trạng thái': 'Đang làm' });
    gv.forEach((g) => {
      const ma = String(g['Mã nguồn']).slice(3); const vt = String(g['Mã vị trí']).split('|').filter(Boolean);
      const con = vt.filter((v) => dang.some((r) => r['Mã việc'] === ma && r['Mã vị trí'] === v));
      const nutX = m.querySelector(`[data-kq="${g['Mã']}"][data-k="Xong"]`); if (!nutX) return;
      const dong = nutX.closest('.dong-cham'); if (!dong || dong.querySelector('.dn-xongvt')) return;
      dong.insertAdjacentHTML('beforeend', `<div class="dn-phu dn-xongvt"><span class="gian">📍 ${con.length ? `Còn <b>${con.length}</b>/${vt.length} vị trí đang làm` : `✓ Đã xong cả ${vt.length} vị trí`}</span>${con.length ? `<button type="button" class="nut nho chinh" data-xvt="${esc(g['Mã'])}">Đánh dấu vị trí xong</button>` : ''}</div>`);
      if (!con.length && !nutX.classList.contains('dang')) nutX.click();
      const b = dong.querySelector('[data-xvt]'); if (!b) return;
      b.onclick = () => G.xongViTriDK(ma, con, (n) => {
        const conLai = con.length - n; const k = conLai ? 'Làm một phần' : 'Xong';
        const nk = m.querySelector(`[data-kq="${g['Mã']}"][data-k="${k}"]`); if (nk) nk.click();
        b.closest('.dn-xongvt').querySelector('.gian').innerHTML = conLai ? `📍 Còn <b>${conLai}</b>/${vt.length} vị trí đang làm · mai làm tiếp` : `✓ Đã xong cả ${vt.length} vị trí`;
        if (!conLai) b.remove(); });
    });
  };
})();
