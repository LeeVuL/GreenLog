/* GreenLog 0.3 – Việc: bảng chọn theo tần suất × đối tượng, định kỳ (Hoàn thành / Đang triển khai), tưới, vệ sinh và nhổ cỏ theo vị trí con,
   vận chuyển trong ngày, việc phát sinh, máy sàng cát, cây nội thất, vườn ươm, thẻ Hôm nay */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hop = (...a) => G.hop(...a);
  G._ganKhung();
  const hn = () => API.ngay();
  const ttTick = (r) => r['Trạng thái'] || 'Xong';
  const nhomTien = (ticks) => { const o = {}; ticks.forEach((r) => { if (ttTick(r) === 'Xong' && String(r['Lần'] || '1') === '1') o[r['Mã việc']] = (o[r['Mã việc']] || 0) + 1; }); return o; };
  const o_ = (k, ten, link, phu, nho) => `<a class="o-viec${nho ? ' nho' : ''}" href="#/${link}">${G.ic(k, nho ? 46 : 52)}<b>${esc(ten)}</b>${phu ? `<small>${esc(phu)}</small>` : ''}</a>`;

  /* ================= VIỆC ================= */
  const MT = [['Thảm cỏ', [['DV01', 'cat_co', 'Cắt'], ['DV02', 'bon_phan_co', 'Bón phân'], ['DV04', 'phun_co', 'Phun']]],
    ['Cây bụi', [['DV08', 'tia_bui', 'Cắt tỉa'], ['DV03', 'bon_phan_bui', 'Bón phân'], ['DV05', 'phun_bui', 'Phun']]],
    ['Hàng rào', [['DV37', 'tia_hang_rao', 'Cắt tỉa'], null, null]],
    ['Cây bóng mát', [['DV07', 'tia_bong_mat', 'Cắt tỉa'], null, ['DV06', 'phun_bong_mat', 'Phun']]],
    ['Thủy sinh', [null, ['DV38', 'bon_thuy_sinh', 'Bón phân'], null]]];
  G.MT_DK = MT;
  G.man.viec = { an: true, thay: true, fn: async () => {
    const m = G.khung('Việc', `Kỳ ${S.dm.ky.ten} · ${G.ngayVN(S.dm.ky.tu).slice(0, 5)} – ${G.ngayVN(S.dm.ky.den).slice(0, 5)}`);
    let html = `<input type="search" id="timViec" placeholder="Tìm việc, vị trí, cây…" style="margin-bottom:12px">`;
    if (q('dinhky')) {
      const t = (await API.goi('docNhieu', { ds: [{ bang: 'TickDinhKy', loc: { 'Kỳ': S.dm.ky.ten } }] })).TickDinhKy; const td = nhomTien(t);
      const dang = {}; t.forEach((r) => { if (ttTick(r) === 'Đang làm') dang[r['Mã việc']] = (dang[r['Mã việc']] || 0) + 1; });
      html += `<h2 class="tieu-nhom">A. Hằng ngày <span>· ghi 1 lần mỗi ngày</span></h2><div class="luoi-viec">`
        + o_('tuoi', 'Tưới nước', 'tuoi') + o_('ve_sinh', 'Vệ sinh', 'cum/DV10') + o_('nho_co', 'Nhổ cỏ dại', 'cum/DV11') + o_('van_chuyen', 'Vận chuyển', 'vanchuyen') + o_('phat_sinh', 'Việc phát sinh', 'phatsinh')
        + (q('donghonuoc') ? o_('dong_ho', 'Đồng hồ nước', 'donghonuoc') : '') + (q('vuonuom') ? o_('vuon_uom', 'Vườn ươm', 'vuonuom') : '') + '</div>';
      html += `<h2 class="tieu-nhom">B. Định kỳ <span>· chọn đối tượng rồi thao tác · thanh = tiến độ kỳ</span></h2><div class="ma-tran"><div></div><div class="cot">Cắt / Tỉa</div><div class="cot">Bón phân</div><div class="cot">Phun thuốc</div>`
        + MT.map(([n, r]) => `<div class="hang-mt">${esc(n)}</div>` + r.map((x) => {
          if (!x) return '<div class="o-trong"></div>';
          const tong = G.dsVT(x[0]).length || 1; const p = Math.min(1, (td[x[0]] || 0) / tong);
          return `<a class="o-mt" href="#/dinhky/${x[0]}" data-ten="${esc(G.dvTen(x[0]))}">${G.ic(x[1], 44)}<b>${esc(x[2])}</b><span class="thanh-nho"><i style="width:${Math.round(p * 100)}%;background:${p >= 0.5 ? 'var(--xanh)' : '#D9A93E'}"></i></span>${dang[x[0]] ? `<small class="dang">◐ ${dang[x[0]]} đang làm</small>` : ''}</a>`;
        }).join('')).join('') + '</div>';
      html += `<h2 class="tieu-nhom">C. Ghi chép khi có việc</h2><div class="luoi-viec">${o_('trong_cay', 'Trồng cây', 'sotrongcay')}${o_('dich_hai', 'Dịch hại', 'dichhai')}${q('phunbon') ? o_('phun_bon', 'Phun, bón', 'phunbon') : ''}${o_('phieu', 'Phiếu', 'phieu')}</div>`;
    }
    if (q('noibo')) {
      html += `<h2 class="tieu-nhom">${q('dinhky') ? 'D. ' : 'A. '}Việc nội bộ</h2><div class="luoi-viec">`
        + [['bai_bien', 'Vệ sinh bãi biển', 'nb/bien'], ['tuan_tra', 'Kiểm tra bãi biển', 'nb/ktbien'], ['may_sang', 'Máy sàng cát', 'nb/may'], ['vuon_rau', 'Vườn rau', 'nb/vuonrau'], ['thu_hoach', 'Thu hoạch', 'nb/thuhoach'],
          ['noi_that', 'Cây nội thất', 'nb/noithat'], ['vuon_uom', 'Vườn ươm nội thất', 'nb/vuonuomnt'], ['rac_huu_co', 'Rác hữu cơ', 'nb/rac'], ['compost', 'Phân compost', 'nb/compost'], ['phat_sinh', 'Việc phát sinh', 'phatsinh']]
          .filter((x) => q('dinhky') ? x[2] !== 'phatsinh' : true).map((x) => o_(x[0], x[1], x[2])).join('') + '</div>';
      if (!q('dinhky')) html += `<h2 class="tieu-nhom">B. Ghi chép</h2><div class="luoi-viec">${o_('dich_hai', 'Dịch hại', 'dichhai')}${q('phunbon') ? o_('phun_bon', 'Phun, bón', 'phunbon') : ''}${o_('trong_cay', 'Trồng cây', 'sotrongcay')}${o_('phieu', 'Phiếu', 'phieu')}</div>`;
    }
    m.innerHTML = html || G.trong('Không có việc cho vai này.');
    const tim = m.querySelector('#timViec');
    tim.oninput = () => { const t = tim.value.trim().toLowerCase(); m.querySelectorAll('.o-viec, .o-mt').forEach((a) => { const s = (a.textContent + ' ' + (a.dataset.ten || '')).toLowerCase(); a.style.opacity = !t || s.includes(t) ? '' : '.25'; }); };
  } };

  /* ================= ĐỊNH KỲ: trạng thái → cụm → vị trí → ảnh → lưu ================= */
  const MAT_VIEC = ['DV04', 'DV05', 'DV06', 'DV02', 'DV03'];
  G.man.dinhky = { an: true, thay: true, fn: async (maViec) => {
    if (!maViec) { location.hash = '#/viec'; return; }
    const viec = S.dm.dauviec.find((v) => v.ma === maViec); if (!viec) { location.hash = '#/viec'; return; }
    const k = S.dm.ky; const dsVT = G.dsVT(maViec); const ghi = q('dinhky') >= 2;
    const m = G.khung(viec.ten, `${viec.tanSuat || ''} · kỳ ${k.ten}`, '#/viec');
    const st = G.man.dinhky.st && G.man.dinhky.st.viec === maViec ? G.man.dinhky.st : (G.man.dinhky.st = { viec: maViec, tt: 'Xong', cum: '', mat: 'Cả 3', chon: new Set(), lyDo: {} });
    const tai = async () => (await API.goi('docNhieu', { ds: [{ bang: 'TickDinhKy', loc: { 'Mã việc': maViec, 'Kỳ': k.ten } }, { bang: 'TickDinhKy', ten: 'dang', loc: { 'Mã việc': maViec, 'Trạng thái': 'Đang làm' } }] }));
    let d = await tai();
    const trangThai = (ma) => {
      const dg = d.dang.find((r) => r['Mã vị trí'] === ma);
      if (dg) { const n = Math.round((new Date(hn()) - new Date(dg['Bắt đầu'])) / 864e5) + 1; return { cls: 'dang', sub: `từ ${G.ngayVN(dg['Bắt đầu']).slice(0, 5)} · ngày ${n}`, n, bd: dg['Bắt đầu'] }; }
      const x = d.TickDinhKy.filter((r) => r['Mã vị trí'] === ma && ttTick(r) === 'Xong');
      return x.length ? { cls: 'xong', sub: `Xong ${G.ngayVN(x[x.length - 1]['Ngày xong'] || x[x.length - 1]['Ngày']).slice(0, 5)}${x.length > 1 ? ' · ' + x.length + ' lần' : ''}` } : { cls: '', sub: '' };
    };
    const ve = () => {
      const xong = dsVT.filter((v) => trangThai(v.ma).cls === 'xong').length; const dangLam = d.dang.length;
      const tre = d.dang.filter((r) => (new Date(hn()) - new Date(r['Bắt đầu'])) / 864e5 >= 7);
      m.innerHTML = `<div class="bang-viec">${G.ic(MT.flatMap((x) => x[1]).filter(Boolean).find((x) => x[0] === maViec)?.[1] || 'viec', 52)}<div class="gian"><small>Đang cập nhật</small><b>${esc(viec.ten.toUpperCase())}</b><small>${xong}/${dsVT.length} vị trí xong trong kỳ${dangLam ? ` · ${dangLam} đang làm` : ''}</small>
        <div class="thanh" style="margin-top:6px"><i style="width:${Math.round(xong / (dsVT.length || 1) * 100)}%"></i></div></div><a class="nut nho" href="#/viec">Đổi việc</a></div>
        ${tre.length ? `<div class="canh-bao">⏰ ${tre.length} vị trí đang triển khai quá 7 ngày: ${tre.slice(0, 6).map((r) => esc((G.vt(r['Mã vị trí']) || {}).kv || r['Mã vị trí'])).join(', ')}</div>` : ''}
        ${ghi ? `<div class="buoc"><span>1</span>Trạng thái</div><div class="hai-nut"><button type="button" data-tt="Xong" class="${st.tt === 'Xong' ? 'dang xanh' : ''}">✓ Hoàn thành</button><button type="button" data-tt="Đang làm" class="${st.tt === 'Đang làm' ? 'dang vang' : ''}">⏳ Đang triển khai</button></div>
          <p class="mo" style="margin:4px 2px 8px">${st.tt === 'Xong' ? 'Chọn vị trí đã làm xong. Vị trí đang triển khai chọn vào sẽ chuyển sang Hoàn thành, app tính từ ngày bắt đầu đến hôm nay.' : 'Chọn vị trí đang làm dở (nhiều ngày). Giữ trạng thái này đến khi chuyển Hoàn thành.'}</p>` : ''}
        <div class="buoc"><span>2</span>Chọn cụm, <span>3</span>chọn vị trí</div>
        <div class="chu-thich"><span><i class="xong"></i>Hoàn thành</span><span><i class="dang"></i>Đang triển khai</span><span><i></i>Chưa làm</span><span><i class="c"></i>Đang chọn</span></div>
        <div id="luoi"></div><div style="height:90px"></div>
        ${ghi ? `<div class="thanh-duoi"><button class="nut chinh" id="tiep" ${st.chon.size ? '' : 'disabled'}>${st.chon.size ? `Tiếp: chụp ảnh và lưu · ${st.chon.size} vị trí →` : 'Chạm vào vị trí để chọn'}</button></div>` : ''}`;
      m.querySelectorAll('[data-tt]').forEach((b) => { b.onclick = () => { st.tt = b.dataset.tt; ve(); }; });
      G.luoiVT(m.querySelector('#luoi'), { ds: dsVT, st, trangThai, coMat: MAT_VIEC.includes(maViec), hoiLyDo: st.tt === 'Xong', doi: () => { const t = m.querySelector('#tiep'); if (t) { t.disabled = !st.chon.size; t.textContent = st.chon.size ? `Tiếp: chụp ảnh và lưu · ${st.chon.size} vị trí →` : 'Chạm vào vị trí để chọn'; } } });
      const tiep = m.querySelector('#tiep'); if (tiep) tiep.onclick = buocLuu;
    };
    const buocLuu = () => {
      const ds = [...st.chon]; const xongDang = st.tt === 'Xong' ? ds.map((x) => [x, trangThai(x)]).filter((x) => x[1].cls === 'dang') : [];
      const ten = ds.slice(0, 14).map((x) => { const v = G.vt(x) || {}; return esc(G.laVilla(v) ? `${v.kv} ${G.mat(v.ten)}` : v.ten || x); }).join(', ');
      hop(`Ảnh và lưu · ${st.tt === 'Xong' ? 'Hoàn thành' : 'Đang triển khai'}`, `<div class="the" style="background:${st.tt === 'Xong' ? 'var(--xanh-nhat)' : '#FFF8E8'}"><b>${esc(viec.ten)}</b><div class="mo">${ds.length} vị trí: ${ten}${ds.length > 14 ? '…' : ''}</div>
        ${xongDang.length ? `<div class="mo" style="margin-top:6px">Chuyển Hoàn thành ${xongDang.length} vị trí đang triển khai: ${xongDang.slice(0, 4).map((x) => `${G.ngayVN(x[1].bd).slice(0, 5)} → ${G.ngayVN(hn()).slice(0, 5)} · <b>${x[1].n} ngày</b>`).join('; ')}</div>` : ''}</div>
        <div class="o" style="margin-bottom:12px"><span class="nhan-o">Ảnh hiện trường ${st.tt === 'Xong' ? 'sau khi làm' : 'đang làm'} (bắt buộc)</span><div id="anh"></div></div>
        ${G.oMoTa('gc', 'Ghi chú')}<button class="nut chinh rong" id="luu">Lưu ${ds.length} vị trí</button>`, (o, dong) => {
        const anh = G.oAnh(o.querySelector('#anh'), { batBuoc: true, toiDa: 6 }); G.ganMic(o);
        o.querySelector('#luu').onclick = (e) => chay(async () => {
          const a = anh.kiemTra();
          await API.goi('dinhKy.luu', { viec: maViec, trangThai: st.tt, anh: a, bam: anh.bam(), ghiChu: o.querySelector('#gc').value,
            ds: ds.map((vt) => ({ vt, kv: (G.vt(vt) || {}).kv, lyDo: (st.lyDo || {})[vt] || '' })) });
          dong(); bao(`Đã lưu ${ds.length} vị trí · ${st.tt === 'Xong' ? 'hoàn thành' : 'đang triển khai'}`); st.chon = new Set(); st.lyDo = {};
          d = await tai(); ve();
        }, e.target);
      });
    };
    ve();
  } };

  /* ================= TƯỚI: theo dãy villa, mỗi villa 3 mặt; nút ☔ Hôm nay mưa ================= */
  const TT_TUOI = ['Đã tưới', 'Không cần (mưa)', 'Chưa tưới được'];
  const NGAN = { 'Đã tưới': 'Đã tưới', 'Không cần (mưa)': 'Mưa', 'Chưa tưới được': 'Chưa' };
  G.man.tuoi = { an: true, thay: true, fn: async () => {
    const ghi = q('dinhky') >= 2; const ngay = hn();
    const m = G.khung('Tưới nước sân vườn', `${G.thu()} ${G.ngayVN(ngay)} · ${S.u.doi || ''}`, '#/viec');
    const cu = (await API.goi('docNhieu', { ds: [{ bang: 'Tuoi', loc: { 'Ngày': ngay } }] })).Tuoi;
    const st = G.man.tuoi.st && G.man.tuoi.st.ngay === ngay ? G.man.tuoi.st : (G.man.tuoi.st = { ngay, cum: '', doi: {} });
    const goc = {}; cu.forEach((r) => { goc[r['Mã vị trí']] = r['Trạng thái']; });
    const nVT = S.dm.vitri.filter((v) => v.ap === 'Có'); const cums = [...new Set(nVT.map((v) => v.cum))]; if (!st.cum) st.cum = cums[0];
    const gt = (ma) => st.doi[ma] || goc[ma] || '';
    const ve = () => {
      const ds = nVT.filter((v) => v.cum === st.cum); const dem = (t) => nVT.filter((v) => gt(v.ma) === t).length; const soDoi = Object.keys(st.doi).length;
      const nhom = {}; ds.forEach((v) => { (nhom[v.kv] = nhom[v.kv] || []).push(v); });
      const daCum = (c) => nVT.filter((v) => v.cum === c && gt(v.ma)).length + '/' + nVT.filter((v) => v.cum === c).length;
      m.innerHTML = `<div class="the" style="padding:12px"><div class="luoi2" style="grid-template-columns:repeat(4,1fr);text-align:center">
          <div><b class="so-vua" style="color:var(--xanh)">${dem('Đã tưới')}</b><div class="mo">đã tưới</div></div><div><b class="so-vua" style="color:#2E6DA4">${dem('Không cần (mưa)')}</b><div class="mo">mưa</div></div>
          <div><b class="so-vua" style="color:var(--do)">${dem('Chưa tưới được')}</b><div class="mo">chưa tưới</div></div><div><b class="so-vua">${nVT.length - nVT.filter((v) => gt(v.ma)).length}</b><div class="mo">chưa ghi</div></div></div></div>
        ${ghi ? `<div class="nhom-nut" style="margin-bottom:10px"><button class="nut nho mua" id="mua">☔ Hôm nay mưa</button><button class="nut nho" id="caCum">Cả ${esc(st.cum)} chưa ghi: Đã tưới</button></div>` : ''}
        <div class="chon boc">${cums.map((c) => `<button data-c="${esc(c)}" class="${st.cum === c ? 'dang' : ''}">${esc(c)} <small>${daCum(c)}</small></button>`).join('')}</div>
        <div class="chu-thich"><span><i class="xong"></i>Đã tưới</span><span><i class="mua"></i>Mưa</span><span><i class="chua"></i>Chưa tưới được</span><span><i></i>Chưa ghi</span></div>
        <div class="the" style="padding:8px 10px;margin-bottom:90px">${Object.keys(nhom).map((kv) => {
          const vs = nhom[kv];
          if (vs.length > 1 && vs.every((v) => G.mat(v.ten))) return `<div class="hang-tuoi"><b>${esc(kv)}</b>${vs.map((v) => `<button type="button" class="mat-tuoi ${({ 'Đã tưới': 'xong', 'Không cần (mưa)': 'mua', 'Chưa tưới được': 'chua' })[gt(v.ma)] || ''}${st.doi[v.ma] ? ' moi' : ''}" data-vay="${v.ma}" ${ghi ? '' : 'disabled'}>${G.mat(v.ten)}${gt(v.ma) ? `<small>${NGAN[gt(v.ma)]}</small>` : ''}</button>`).join('')}</div>`;
          return vs.map((v) => `<div class="hang-tuoi"><b>${esc(v.ten)}</b><span class="tt3b">${TT_TUOI.map((t) => `<button data-vt="${v.ma}" data-t="${t}" class="${gt(v.ma) === t ? 'dang' : ''}" ${ghi ? '' : 'disabled'}>${NGAN[t]}</button>`).join('')}</span></div>`).join('');
        }).join('')}</div>
        ${ghi ? `<div class="thanh-duoi"><button class="nut chinh" id="luu" ${soDoi ? '' : 'disabled'}>${soDoi ? `Lưu ${soDoi} vị trí` : 'Chạm mặt villa để đổi: Đã tưới → Mưa → Chưa'}</button></div>` : ''}`;
      m.querySelectorAll('[data-c]').forEach((b) => { b.onclick = () => { st.cum = b.dataset.c; ve(); }; });
      m.querySelectorAll('[data-vay]').forEach((b) => { b.onclick = () => { const ma = b.dataset.vay; const i = TT_TUOI.indexOf(gt(ma)); const tiep = i < 0 ? TT_TUOI[0] : TT_TUOI[(i + 1) % 3]; st.doi[ma] = tiep; ve(); }; });
      m.querySelectorAll('[data-t]').forEach((b) => { b.onclick = () => { st.doi[b.dataset.vt] = b.dataset.t; ve(); }; });
      const mua = m.querySelector('#mua'); if (mua) mua.onclick = () => { nVT.filter((v) => v.maiChe !== 'Có').forEach((v) => { if (goc[v.ma] !== 'Không cần (mưa)') st.doi[v.ma] = 'Không cần (mưa)'; }); bao('Đã chuyển tất cả sang Mưa. Xem lại, đổi chỗ có mái che rồi bấm Lưu.'); ve(); };
      const cc = m.querySelector('#caCum'); if (cc) cc.onclick = () => { nVT.filter((v) => v.cum === st.cum && !gt(v.ma)).forEach((v) => { st.doi[v.ma] = 'Đã tưới'; }); ve(); };
      const l = m.querySelector('#luu');
      if (l) l.onclick = () => {
        const chua = Object.keys(st.doi).filter((x) => st.doi[x] === 'Chưa tưới được');
        const luu = async (lyDo) => {
          await API.goi('ghiNhieu', { bang: 'Tuoi', thay: ['Ngày', 'Mã vị trí'], dong: Object.keys(st.doi).map((vt) => ({ 'Ngày': ngay, 'Mã vị trí': vt, 'Trạng thái': st.doi[vt], 'Người ghi': '', 'Giờ': API.bayGio().slice(11, 16), 'Hôm nay mưa': st.doi[vt] === 'Không cần (mưa)' ? 'Có' : '', 'Lý do': st.doi[vt] === 'Chưa tưới được' ? lyDo || '' : '' })) });
          Object.assign(goc, st.doi); st.doi = {}; ve();
        };
        if (!chua.length) return chay(() => luu(), l);
        G.chonDS(`${chua.length} vị trí chưa tưới được. Lý do:`, ['Hư hệ thống tưới', 'Thiếu nước', 'Thiếu người', 'Khu vực có khách', 'Khác']).then((x) => x && chay(() => luu(x.ten), l));
      };
    };
    ve();
  } };

  /* ================= VỆ SINH, NHỔ CỎ: cụm → vị trí con (villa theo dãy, mặt) hoặc cả cụm ================= */
  G.man.cum = { an: true, thay: true, fn: async (maViec) => {
    if (!/^DV1[01]$/.test(maViec || '')) maViec = 'DV10';
    const ghi = q('dinhky') >= 2; const ngay = hn();
    const m = G.khung(G.dvTen(maViec), `${G.ngayVN(ngay)} · theo cụm, vị trí`, '#/viec');
    const nVT = S.dm.vitri.filter((v) => v.ap === 'Có'); const cums = [...new Set(nVT.map((v) => v.cum))];
    let cu = (await API.goi('docNhieu', { ds: [{ bang: 'ViecHangNgay', loc: { 'Ngày': ngay, 'Mã việc': maViec } }] })).ViecHangNgay;
    const daLam = (c) => { const r = cu.filter((x) => x['Cụm'] === c); if (!r.length) return null; if (r.some((x) => x['Trạng thái'] === 'Xong')) return { ca: true, r: r[r.length - 1] }; const vt = new Set(); r.forEach((x) => String(x['Mã vị trí'] || '').split('|').map((s) => s.trim()).filter(Boolean).forEach((s) => vt.add(s))); return { ca: false, vt, r: r[r.length - 1] }; };
    const ve = () => {
      const xong = cums.filter((c) => (daLam(c) || {}).ca).length; const mot = cums.filter((c) => { const x = daLam(c); return x && !x.ca; }).length;
      m.innerHTML = `<div class="bang-viec">${G.ic(maViec === 'DV10' ? 've_sinh' : 'nho_co', 52)}<div class="gian"><small>Đang cập nhật</small><b>${esc(G.dvTen(maViec).toUpperCase())}</b><small>${xong}/${cums.length} cụm xong · ${mot} cụm làm một phần</small></div><a class="nut nho" href="#/cum/${maViec === 'DV10' ? 'DV11' : 'DV10'}">Đổi việc</a></div>
        <p class="mo">Chạm vào cụm để chọn vị trí đã làm, hoặc chọn cả cụm.</p>
        <div class="ds">${cums.map((c) => { const x = daLam(c); const n = nVT.filter((v) => v.cum === c).length; return `<div class="muc ${x && x.ca ? 'da-lam' : x ? 'dang-lam' : ''}" data-c="${esc(c)}" style="cursor:${ghi ? 'pointer' : 'default'}"><span class="chon-vt">${x && x.ca ? '✓' : x ? '◐' : ''}</span>
          <div class="gian"><b>${esc(c)}</b><div class="mo">${x ? (x.ca ? 'Xong cả cụm' : `${x.vt.size}/${n} vị trí`) + ` · ${esc(x.r['Người ghi'])} ${esc(x.r['Giờ'])}` : `${n} vị trí`}</div></div>›</div>`; }).join('')}</div>`;
      if (ghi) m.querySelectorAll('[data-c]').forEach((r) => { r.onclick = () => chonCum(r.dataset.c); });
    };
    const chonCum = (c) => {
      const ds = nVT.filter((v) => v.cum === c); const x = daLam(c);
      const st = { cum: c, chon: new Set(x && !x.ca ? x.vt : []), mat: 'Cả 3' };
      hop(`${G.dvTen(maViec)} · ${c}`, `<div id="lv"></div><div class="o" style="margin:12px 0"><span class="nhan-o">Ảnh (không bắt buộc)</span><div id="anh"></div></div>${G.oMoTa('gc', 'Ghi chú')}<button class="nut chinh rong" id="luu">Lưu</button>`, (o, dong) => {
        G.luoiVT(o.querySelector('#lv'), { ds, st, trangThai: (ma) => (x && (x.ca || (x.vt && x.vt.has(ma))) ? { cls: 'xong' } : { cls: '' }), coMat: true });
        const anh = G.oAnh(o.querySelector('#anh'), { toiDa: 4 }); G.ganMic(o);
        o.querySelector('#luu').onclick = (e) => chay(async () => {
          if (!st.chon.size) throw new Error('Chọn vị trí đã làm hoặc bấm Chọn cả cụm');
          const ca = ds.every((v) => st.chon.has(v.ma));
          await API.goi('ghiNhieu', { bang: 'ViecHangNgay', thay: ['Ngày', 'Mã việc', 'Cụm'], dong: [{ 'Ngày': ngay, 'Mã việc': maViec, 'Cụm': c, 'Mã vị trí': ca ? '' : [...st.chon].join(' | '), 'Trạng thái': ca ? 'Xong' : 'Một phần', 'Ảnh': anh.ds(), 'Ghi chú': o.querySelector('#gc').value, 'Người ghi': '', 'Giờ': API.bayGio().slice(11, 16) }] });
          cu = (await API.goi('docNhieu', { ds: [{ bang: 'ViecHangNgay', loc: { 'Ngày': ngay, 'Mã việc': maViec } }] })).ViecHangNgay; dong(); ve();
        }, e.target);
      }, true);
    };
    ve();
  } };

  /* ================= VẬN CHUYỂN: 1 lần mỗi ngày, chia loại, vài ảnh ngẫu nhiên ================= */
  G.man.vanchuyen = { ten: 'Vận chuyển', ic: 'van_chuyen', bt: '🚚', nhom: 'Việc hằng ngày', ph: 'dinhky', fn: async () => {
    const ngay = hn(); const anh = q('homnay') >= 3; const ghi = q('dinhky') >= 2;
    const st = G.man.vanchuyen.st || (G.man.vanchuyen.st = { doi: S.u.doi || 'Đội khu vực' });
    const m = G.khung('Vận chuyển trong ngày', `${G.thu()} ${G.ngayVN(ngay)} · ghi 1 lần cuối ngày`, '#/viec');
    const d = await API.goi('docNhieu', { ds: [{ bang: 'VanChuyen', loc: { 'Ngày': { tu: S.dm.ky.tu } } }] });
    const hom = d.VanChuyen.filter((x) => x['Ngày'] === ngay && x['Đội'] === st.doi);
    const kyN = (nh) => d.VanChuyen.filter((x) => x['Nhóm'] === nh).reduce((a, x) => a + (+x['Số chuyến'] || 0), 0);
    const daGui = hom.length > 0; const khoa = daGui && !anh;
    const dong = (S.dm.loaiHang || []).map((l) => ({ loai: l, n: +((hom.find((x) => x['Loại hàng'] === l) || {})['Số chuyến'] || 0) }));
    hom.filter((x) => !(S.dm.loaiHang || []).includes(x['Loại hàng'])).forEach((x) => dong.push({ loai: x['Loại hàng'], n: +x['Số chuyến'] }));
    const icL = (l) => (/rác/i.test(l) ? 'tia_bui' : /đất|cát|phân/i.test(l) ? 'compost' : /cây|chậu/i.test(l) ? 'vuon_uom' : /vật tư/i.test(l) ? 'van_chuyen' : 'phat_sinh');
    const ve = () => {
      m.innerHTML = `${anh ? `<div class="chon">${['Đội khu vực', 'Đội cơ động'].map((x) => `<button data-doi="${x}" class="${st.doi === x ? 'dang' : ''}">${x}</button>`).join('')}</div>` : ''}
        <div class="luoi2" style="margin-bottom:12px"><div class="the so-the">${G.ic('tia_bui', 44)}<div><b>${kyN('Rác cắt tỉa')}</b><small>chuyến rác cắt tỉa trong kỳ</small></div></div><div class="the so-the">${G.ic('van_chuyen', 44)}<div><b>${kyN('Khác')}</b><small>chuyến khác trong kỳ</small></div></div></div>
        ${daGui ? `<div class="canh-bao" style="background:var(--xanh-nhat);color:var(--xanh)">Đã gửi lúc ${esc(String(hom[0]['Giờ ghi']).slice(11, 16))} bởi ${esc(hom[0]['Người ghi'])}.${khoa ? ' Cần sửa thì báo anh Vũ.' : ' Anh sửa được.'}</div>` : ''}
        <div class="the"><b>Số chuyến hôm nay · ${esc(st.doi)}</b>${dong.map((x, i) => `<div class="dong-vc">${G.ic(icL(x.loai), 40)}<div class="gian"><b>${esc(x.loai)}</b></div>
          ${khoa || !ghi ? `<b class="so-vua">${x.n}</b>` : `<button type="button" class="tron" data-tru="${i}">−</button><b class="so-vua">${x.n}</b><button type="button" class="tron chinh" data-cong="${i}">＋</button>`}</div>`).join('')}
          ${khoa || !ghi ? '' : '<button type="button" class="nut nho" id="themDong" style="margin-top:8px">＋ Thêm loại hàng</button>'}</div>
        ${khoa || !ghi ? (hom[0] && hom[0]['Ảnh'] ? `<div>${G.xemAnh(hom[0]['Ảnh'])}</div>` : '') : `<div class="the"><b>Ảnh minh chứng</b><p class="mo" style="margin:2px 0 8px">Chụp vài chuyến bất kỳ trong ngày (ít nhất 2 ảnh), không cần mỗi chuyến một ảnh.</p><div id="anh"></div></div>
        ${G.oMoTa('gc', 'Ghi chú (từ đâu đến đâu, nếu cần)')}
        <p class="mo">Người ghi, giờ tự điền. Báo cáo tách riêng rác cắt tỉa và vận chuyển khác.</p><button class="nut chinh rong" id="gui" style="margin-bottom:24px">Gửi số liệu hôm nay</button>`}`;
      m.querySelectorAll('[data-doi]').forEach((b) => { b.onclick = () => { st.doi = b.dataset.doi; G.taiLai(); }; });
      m.querySelectorAll('[data-cong]').forEach((b) => { b.onclick = () => { dong[+b.dataset.cong].n++; ve(); }; });
      m.querySelectorAll('[data-tru]').forEach((b) => { b.onclick = () => { const x = dong[+b.dataset.tru]; x.n = Math.max(0, x.n - 1); ve(); }; });
      const td = m.querySelector('#themDong'); if (td) td.onclick = async () => { const t = await G.hoi('Loại hàng'); if (t) { dong.push({ loai: t, n: 1 }); ve(); } };
      const a = m.querySelector('#anh') ? G.oAnh(m.querySelector('#anh'), { toiDa: 6 }) : null; G.ganMic(m);
      const g = m.querySelector('#gui');
      if (g) g.onclick = () => chay(async () => {
        const tong = dong.reduce((s, x) => s + x.n, 0); if (!tong) throw new Error('Chưa có chuyến nào');
        if (!(await G.xacNhan(`Gửi ${tong} chuyến hôm nay của ${st.doi}? Gửi rồi chỉ anh Vũ sửa được.`, 'Gửi'))) return;
        await API.goi('vanChuyen.gui', { doi: st.doi, ds: dong, anh: a ? a.ds() : [], ghiChu: (m.querySelector('#gc') || {}).value || '' });
        bao('Đã gửi số liệu vận chuyển'); G.taiLai();
      }, g);
    };
    ve();
  } };

  /* ================= VIỆC PHÁT SINH: bắt đầu ngay lúc này → kết thúc ngay lúc này ================= */
  const soGio = (a, b) => Math.max(0, Math.round((new Date(String(b).replace(' ', 'T')) - new Date(String(a).replace(' ', 'T'))) / 36e5 * 10) / 10);
  G.soGio = soGio;
  G.man.phatsinh = { ten: 'Việc phát sinh', ic: 'phat_sinh', bt: '⚡', nhom: 'Việc hằng ngày', ph: 'homnay', fn: async () => {
    const m = G.khung('Việc phát sinh', 'Hỗ trợ bộ phận khác, sự cố, yêu cầu', '#/viec');
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'ViecPhatSinh', loc: { 'Ngày': { tu: G.congNgay(hn(), -30) } } }] })).ViecPhatSinh.reverse();
    const dang = ds.filter((x) => x['Trạng thái'] === 'Đang làm' && (x['Người ghi'] === S.u.ten || q('homnay') >= 3));
    m.innerHTML = (q('homnay') >= 2 ? '<button class="nut chinh rong" id="bd" style="min-height:60px;margin-bottom:12px">▶ Bắt đầu ngay lúc này</button>' : '')
      + (dang.length ? `<h3 class="tieu-nhom">Đang làm</h3>${dang.map((x) => `<div class="the" style="border-left:4px solid #D9A93E"><div class="hang"><div class="gian"><b>${esc(x['Loại việc'])}</b><div class="mo">${esc(G.tenVT(x['Mã vị trí'], x['Vị trí khác']))} · ${esc(x['Số người'])} người${x['Hỗ trợ'] ? ' · hỗ trợ ' + esc(x['Hỗ trợ']) : ''}</div><div class="mo">Bắt đầu ${esc(String(x['Bắt đầu']).slice(11, 16))} · ${esc(x['Mô tả'])}</div></div></div><button class="nut chinh rong" data-kt="${esc(x['Mã PS'])}" style="margin-top:8px">■ Kết thúc ngay lúc này</button></div>`).join('')}` : '')
      + `<h3 class="tieu-nhom">30 ngày gần đây</h3><div class="ds">${ds.filter((x) => x['Trạng thái'] !== 'Đang làm').map((x) => `<div class="muc"><div class="gian"><b>${esc(x['Loại việc'])}</b> · ${G.ngayVN(x['Ngày']).slice(0, 5)}<div class="mo">${esc(G.tenVT(x['Mã vị trí'], x['Vị trí khác']))} · ${esc(x['Số người'])} người × ${esc(x['Số giờ'])} giờ${x['Hỗ trợ'] ? ' · ' + esc(x['Hỗ trợ']) : ''} · ${esc(x['Người ghi'])}</div><div class="mo">${esc(x['Mô tả'])}</div></div></div>`).join('') || '<div class="muc mo">Chưa có</div>'}</div>`;
    const bd = m.querySelector('#bd');
    if (bd) bd.onclick = () => hop('Bắt đầu việc phát sinh', '<div id="f"></div><button class="nut chinh rong" id="l">▶ Bắt đầu lúc này</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'loai', nhan: 'Loại việc', loai: 'chips', ds: S.dm.loaiPhatSinh, bb: true }, { k: 'mt', nhan: 'Mô tả việc', loai: 'mota', bb: true }, { k: 'vt', nhan: 'Vị trí', loai: 'vitri', bb: true },
        { k: 'sn', nhan: 'Số người', loai: 'so', bb: true, gt: 1 }, { k: 'ht', nhan: 'Hỗ trợ bộ phận', loai: 'chips', ds: S.dm.boPhan }, { k: 'anh', nhan: 'Ảnh trước khi làm', loai: 'anh', toiDa: 3 }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'ViecPhatSinh', dong: { 'Mã PS': '', 'Ngày': '', 'Loại việc': v.loai, 'Mô tả': v.mt, 'Mã vị trí': v.vt.ma || '', 'Vị trí khác': v.vt.ma ? '' : v.vt.ten, 'Số người': v.sn, 'Hỗ trợ': v.ht, 'Bắt đầu': API.bayGio(), 'Kết thúc': '', 'Số giờ': '', 'Ảnh trước': v.anh, 'Ảnh sau': '', 'Trạng thái': 'Đang làm', 'Người ghi': '' } }); dong(); bao('Đã bắt đầu, app tính giờ'); G.taiLai(); }, e.target);
    });
    m.querySelectorAll('[data-kt]').forEach((b) => { b.onclick = () => { const x = ds.find((y) => y['Mã PS'] === b.dataset.kt);
      hop('Kết thúc việc phát sinh', `<p class="mo">Bắt đầu ${esc(String(x['Bắt đầu']).slice(11, 16))} → bây giờ ${API.bayGio().slice(11, 16)} · ${soGio(x['Bắt đầu'], API.bayGio())} giờ</p><div id="f"></div><button class="nut chinh rong" id="l">■ Kết thúc lúc này</button>`, (o, dong) => {
        const lay = G.form(o.querySelector('#f'), [{ k: 'anh', nhan: 'Ảnh sau khi làm', loai: 'anh', bb: true, toiDa: 3 }, { k: 'gc', nhan: 'Kết quả', loai: 'mota' }]);
        o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const kt = API.bayGio(); await API.goi('sua', { bang: 'ViecPhatSinh', khoa: { 'Mã PS': x['Mã PS'] }, doi: { 'Kết thúc': kt, 'Số giờ': soGio(x['Bắt đầu'], kt), 'Ảnh sau': v.anh.join(' | '), 'Trạng thái': 'Xong', 'Mô tả': x['Mô tả'] + (v.gc ? ' · ' + v.gc : '') } }); dong(); bao('Đã kết thúc'); G.taiLai(); }, e.target);
      }); }; });
  } };

  /* ================= MÁY SÀNG CÁT, CÂY NỘI THẤT, VƯỜN ƯƠM (thay màn cũ) ================= */
  const nbGoc = G.man.nb.fn; const diem = (l) => S.dm.diemkhac.filter((x) => x.loai === l);
  G.man.nb = { an: true, fn: (loai) => (loai === 'may' ? manMay() : loai === 'noithat' ? manNoiThat() : loai === 'vuonuomnt' ? manVuonUom('Vườn ươm cây nội thất') : nbGoc(loai)) };
  async function manMay() {
    const m = G.khung('Máy sàng cát', 'Bắt đầu, kết thúc ngay lúc này · app tính giờ', '#/viec');
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'MaySangCat', loc: { 'Ngày': { tu: G.congNgay(hn(), -30) } } }] })).MaySangCat.reverse();
    const dang = ds.filter((x) => x['Giờ bắt đầu'] && !x['Giờ kết thúc'] && x['Ngày'] === hn()); const ghi = q('noibo') >= 2;
    m.innerHTML = `<p class="mo">Lịch bảo trì: Kubota ngày 9, 19, 29 · Sand Man ngày 10, 20, 30.</p>`
      + (ghi ? '<div class="nhom-nut" style="margin-bottom:12px"><button class="nut chinh" id="bd" style="min-height:60px">▶ Bắt đầu chạy máy</button><button class="nut" id="bt">🔧 Ghi bảo trì</button></div>' : '')
      + dang.map((x) => `<div class="the" style="border-left:4px solid #D9A93E"><b>${esc(x['Máy'])} đang chạy</b><div class="mo">Từ ${esc(x['Giờ bắt đầu'])} · ${esc(x['Đoạn bãi'])} · ${esc(x['Người ghi'])}</div>${ghi ? `<button class="nut chinh rong" data-kt="${esc(x['Máy'])}|${esc(x['Giờ bắt đầu'])}" style="margin-top:8px">■ Kết thúc ngay lúc này</button>` : ''}</div>`).join('')
      + `<div class="ds">${ds.filter((x) => x['Giờ kết thúc'] || x['Bảo trì'] !== 'Vận hành').slice(0, 60).map((x) => `<div class="muc"><div class="gian"><b>${esc(x['Máy'])} · ${esc(x['Bảo trì'])}</b><div class="mo">${G.ngayVN(x['Ngày'])} ${esc(x['Giờ bắt đầu'])}–${esc(x['Giờ kết thúc'])}${x['Số giờ'] ? ' · ' + esc(x['Số giờ']) + ' giờ' : ''} · ${esc(x['Đoạn bãi'])} · ${esc(x['Người ghi'])}</div></div>${x['Nhiên liệu (lít)'] ? `<b>${G.so(x['Nhiên liệu (lít)'])} L</b>` : ''}</div>`).join('') || '<div class="muc mo">Chưa có</div>'}</div>`;
    const bd = m.querySelector('#bd');
    if (bd) bd.onclick = () => hop('Bắt đầu chạy máy', '<div id="f"></div><button class="nut chinh rong" id="l">▶ Bắt đầu lúc này</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'Máy', nhan: 'Máy', loai: 'chips', ds: diem('Máy sàng cát').map((x) => x.ten), bb: true }, { k: 'Đoạn bãi', nhan: 'Khu vực bãi', loai: 'nhieu', ds: diem('Bãi biển').map((x) => x.ten), bb: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'MaySangCat', dong: { 'Ngày': '', 'Máy': v['Máy'], 'Bảo trì': 'Vận hành', 'Giờ bắt đầu': API.bayGio().slice(11, 16), 'Giờ kết thúc': '', 'Đoạn bãi': v['Đoạn bãi'], 'Người ghi': '' } }); dong(); bao('Đã bắt đầu'); G.taiLai(); }, e.target);
    });
    const bt = m.querySelector('#bt');
    if (bt) bt.onclick = () => hop('Ghi bảo trì', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'Máy', nhan: 'Máy', loai: 'chips', ds: diem('Máy sàng cát').map((x) => x.ten), bb: true }, { k: 'Bảo trì', nhan: 'Loại', loai: 'chips', ds: ['Bảo trì định kỳ', 'Sửa chữa'], bb: true }, { k: 'Ảnh', nhan: 'Ảnh', loai: 'anh', bb: true, toiDa: 3 }, { k: 'Ghi chú', nhan: 'Ghi chú', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'MaySangCat', dong: Object.assign({ 'Ngày': '', 'Người ghi': '' }, v) }); dong(); bao('Đã lưu'); G.taiLai(); }, e.target);
    });
    m.querySelectorAll('[data-kt]').forEach((b) => { b.onclick = () => { const [may, gbd] = b.dataset.kt.split('|');
      hop('Kết thúc chạy máy ' + may, '<div id="f"></div><button class="nut chinh rong" id="l">■ Kết thúc lúc này</button>', (o, dong) => {
        const lay = G.form(o.querySelector('#f'), [{ k: 'nl', nhan: 'Nhiên liệu (lít)', loai: 'so' }, { k: 'anh', nhan: 'Ảnh', loai: 'anh', bb: true, toiDa: 3 }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
        o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const kt = API.bayGio().slice(11, 16); await API.goi('sua', { bang: 'MaySangCat', khoa: { 'Ngày': hn(), 'Máy': may, 'Giờ bắt đầu': gbd }, doi: { 'Giờ kết thúc': kt, 'Số giờ': soGio(hn() + ' ' + gbd, hn() + ' ' + kt), 'Nhiên liệu (lít)': v.nl, 'Ảnh': v.anh.join(' | '), 'Ghi chú': v.gc } }); dong(); bao('Đã kết thúc'); G.taiLai(); }, e.target);
      }); }; });
  }

  /* cây nội thất: tưới / tưới phân / bón phân hạt / phun phân bón lá + báo bất thường, anh Vũ trả lời */
  async function manNoiThat() {
    const m = G.khung('Cây nội thất', '10 điểm · tưới 2 ngày/lần', '#/viec');
    const d = await API.goi('docNhieu', { ds: [{ bang: 'CayNoiThat', loc: { 'Ngày': { tu: G.congNgay(hn(), -30) } } }, { bang: 'BatThuong', gioiHan: 300 }] });
    const ds = d.CayNoiThat; const bt = d.BatThuong.filter((x) => x['Mã điểm']).reverse(); const ghi = q('noibo') >= 2; const anh = q('homnay') >= 3;
    const cuoi = {}; ds.forEach((r) => { if (/Tưới nước/.test(r['Việc'] || 'Tưới nước') && (!cuoi[r['Mã điểm']] || r['Ngày'] >= cuoi[r['Mã điểm']]['Ngày'])) cuoi[r['Mã điểm']] = r; });
    const cho = bt.filter((x) => !x['Trả lời của anh Vũ']);
    m.innerHTML = (cho.length ? `<div class="the" style="border-left:4px solid var(--do)"><h2>🥀 Bất thường ${anh ? 'cần anh trả lời' : 'chờ anh Vũ trả lời'} (${cho.length})</h2>${cho.map((x) => `<div style="margin-top:8px"><b>${esc((diem('Cây nội thất').find((p) => p.ma === x['Mã điểm']) || {}).ten || x['Mã điểm'])}</b> · ${esc(x['Tên cây'])} · <span class="chip cam">${esc(x['Tình trạng'])}</span><div class="mo">${G.ngayVN(x['Ngày'])} · ${esc(x['Người báo'])} · ${esc(x['Ghi chú'])}</div>${G.xemAnh(x['Ảnh'])}${anh ? `<button class="nut nho" data-tl="${esc(x['Ngày'])}|${esc(x['Mã điểm'])}|${esc(x['Tên cây'])}">Trả lời cách xử lý</button>` : ''}</div>`).join('')}</div>` : '')
      + `<div class="ds">${diem('Cây nội thất').map((p) => {
        const c = cuoi[p.ma]; const songay = c ? Math.round((new Date(hn()) - new Date(c['Ngày'])) / 864e5) : 99;
        const gan = ds.filter((x) => x['Mã điểm'] === p.ma).slice(-1)[0];
        return `<div class="muc"><div class="gian"><b>${esc(p.ten)}</b><div class="mo">${c ? `Tưới ${G.ngayVN(c['Ngày']).slice(0, 5)} · ${esc(c['Số chậu tưới'])} chậu` : 'Chưa tưới'}${gan && gan !== c ? ` · ${esc(gan['Việc'])}${gan['Tên phân'] ? ' ' + esc(gan['Tên phân']) : ''} ${G.ngayVN(gan['Ngày']).slice(0, 5)}` : ''}</div></div>
          ${songay >= 2 ? '<span class="chip cam">Đến hạn</span>' : '<span class="chip xanh">Đã tưới</span>'}${ghi ? `<button class="nut nho" data-p="${p.ma}">Ghi</button>` : ''}</div>`;
      }).join('')}</div>`
      + (bt.length ? `<h3 class="tieu-nhom">Bất thường đã xử lý</h3><div class="ds">${bt.filter((x) => x['Trả lời của anh Vũ']).slice(0, 30).map((x) => `<div class="muc"><div class="gian"><b>${esc((diem('Cây nội thất').find((p) => p.ma === x['Mã điểm']) || {}).ten || '')}</b> · ${esc(x['Tên cây'])} · ${esc(x['Tình trạng'])}<div class="mo">Anh Vũ: ${esc(x['Trả lời của anh Vũ'])}</div></div></div>`).join('')}</div>` : '');
    const phanLa = S.dm.thuoc.filter((t) => /phân|kích|vitamin|atonik/i.test(t.nhom + ' ' + t.ten)).map((t) => t.tenNgan || t.ten);
    m.querySelectorAll('[data-p]').forEach((b) => { b.onclick = () => { const p = diem('Cây nội thất').find((x) => x.ma === b.dataset.p);
      hop(p.ten, '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
        const lay = G.form(o.querySelector('#f'), [{ k: 'viec', nhan: 'Việc đã làm', loai: 'chips', ds: S.dm.viecNT, bb: true, gt: 'Tưới nước' }, { k: 'sc', nhan: 'Số chậu', loai: 'so', bb: true },
          { k: 'phan', nhan: 'Tên phân (khi tưới phân, bón, phun)', loai: 'chonds', ds: phanLa }, { k: 'btv', nhan: 'Có cây bất thường?', loai: 'chips', ds: ['Không', 'Có'], gt: 'Không' },
          { nhan: 'Nếu có: chọn cây, tình trạng và chụp ảnh. Anh Vũ nhận thông báo và trả lời cách xử lý.', loai: 'ghichu' }, { k: 'cay', nhan: 'Cây bất thường', loai: 'cay' }, { k: 'tt', nhan: 'Tình trạng', loai: 'chips', ds: S.dm.batthuong }, { k: 'anh', nhan: 'Ảnh cây bất thường', loai: 'anh', toiDa: 3 }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
        o.querySelector('#l').onclick = (e) => chay(async () => {
          const v = lay(); if (v.viec !== 'Tưới nước' && !v.phan) throw new Error('Chọn tên phân');
          if (v.btv === 'Có' && (!v.cay || !v.tt || !v.anh.length)) throw new Error('Cây bất thường cần cây, tình trạng và ảnh');
          await API.goi('ghi', { bang: 'CayNoiThat', dong: { 'Ngày': '', 'Mã điểm': p.ma, 'Việc': v.viec, 'Tên phân': v.phan ? v.phan.ten || v.phan : '', 'Số chậu tưới': v.sc, 'Bất thường': v.btv === 'Có' ? 'Có' : '', 'Người ghi': '' } });
          if (v.btv === 'Có') await API.goi('ghi', { bang: 'BatThuong', dong: { 'Ngày': '', 'Mã điểm': p.ma, 'Mã vị trí': p.ma, 'Tên cây': v.cay.ten, 'Tình trạng': v.tt, 'Ảnh': v.anh, 'Ghi chú': v.gc, 'Người báo': '', 'Trả lời của anh Vũ': '' } });
          dong(); bao(v.btv === 'Có' ? 'Đã lưu · anh Vũ được báo cây bất thường' : 'Đã lưu'); G.taiLai();
        }, e.target);
      }); }; });
    m.querySelectorAll('[data-tl]').forEach((b) => { b.onclick = async () => { const [ng, ma, cay] = b.dataset.tl.split('|'); const t = await G.hoi('Cách xử lý'); if (!t) return;
      chay(async () => { await API.goi('sua', { bang: 'BatThuong', khoa: { 'Ngày': ng, 'Mã điểm': ma, 'Tên cây': cay }, doi: { 'Trả lời của anh Vũ': t, 'Giờ trả lời': API.bayGio() } }); bao('Đã trả lời, nhân viên nội bộ được báo'); G.taiLai(); }); }; });
  }
  G.man.batthuong = Object.assign(G.man.batthuong || {}, { an: true, thay: true, fn: () => { location.hash = '#/nb/noithat'; } });

  /* vườn ươm: Cây ươm vào / Cây xuất vườn (xuất đi đâu), còn lại theo loại cây */
  async function manVuonUom(ten) {
    const noiThat = ten === 'Vườn ươm cây nội thất';
    const m = G.khung(ten, noiThat ? 'Nguyễn Tấn Hiệp phụ trách' : 'Phạm Nhật Trường phụ trách', '#/viec');
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'VuonUom', loc: { 'Vườn ươm': ten } }] })).VuonUom;
    const ghi = noiThat ? q('noibo') >= 2 : q('vuonuom') >= 2;
    const ton = {}; ds.forEach((r) => { const c = r['Tên cây']; if (!c) return; const sl = +r['Số lượng'] || 0; const t = (ton[c] = ton[c] || { vao: 0, ra: 0, dvt: r['ĐVT'] });
      if (r['Loại ghi'] === 'Xuất vườn' || /Xuất cây/.test(r['Việc'])) t.ra += sl; else if (r['Loại ghi'] === 'Ươm vào' || /Ươm mới/.test(r['Việc'])) t.vao += sl; });
    const tong = Object.values(ton).reduce((a, x) => [a[0] + x.vao, a[1] + x.ra], [0, 0]);
    m.innerHTML = `<div class="luoi2" style="margin-bottom:12px"><div class="the so-the">${G.ic('vuon_uom', 44)}<div><b>${G.so(tong[0])}</b><small>cây ươm vào</small></div></div><div class="the so-the">${G.ic('van_chuyen', 44)}<div><b>${G.so(tong[1])}</b><small>cây xuất vườn</small></div></div></div>`
      + (ghi ? `<div class="nhom-nut" style="margin-bottom:12px"><button class="nut chinh" data-l="Chăm sóc">Tưới, vệ sinh</button><button class="nut" data-l="Ươm vào">🌱 Ươm vào</button><button class="nut" data-l="Xuất vườn">🚚 Xuất vườn</button></div>` : '')
      + (Object.keys(ton).length ? `<div class="the"><h2>Còn lại theo loại cây</h2><table class="bang"><tr><th>Cây</th><th>Ươm</th><th>Xuất</th><th>Còn</th></tr>${Object.keys(ton).sort((a, b) => a.localeCompare(b, 'vi')).map((c) => `<tr><td>${esc(c)}</td><td>${G.so(ton[c].vao)}</td><td>${G.so(ton[c].ra)}</td><td><b>${G.so(ton[c].vao - ton[c].ra)}</b> ${esc(ton[c].dvt || '')}</td></tr>`).join('')}</table></div>` : '')
      + `<div class="ds">${ds.slice().reverse().slice(0, 60).map((r) => `<div class="muc"><div class="gian"><b>${G.ngayVN(r['Ngày'])} · ${esc(r['Loại ghi'] || r['Việc'])}</b><div class="mo">${r['Tên cây'] ? esc(r['Tên cây']) + ' · ' + esc(r['Số lượng']) + ' ' + esc(r['ĐVT']) : esc(r['Việc'])}${r['Xuất đi'] ? ' → ' + esc(r['Xuất đi']) : ''}${r['Chất cải tạo đất hữu cơ (bao)'] ? ' · ' + esc(r['Chất cải tạo đất hữu cơ (bao)']) + ' bao' : ''} · ${esc(r['Người ghi'])}</div></div></div>`).join('') || '<div class="muc mo">Chưa có</div>'}</div>`;
    m.querySelectorAll('[data-l]').forEach((b) => { b.onclick = () => { const l = b.dataset.l;
      const tr = l === 'Chăm sóc' ? [{ k: 'Việc', nhan: 'Việc đã làm', loai: 'nhieu', ds: ['Tưới', 'Vệ sinh'], bb: true }, { k: 'Mô tả', nhan: 'Mô tả', loai: 'mota' }, { k: 'Ảnh', nhan: 'Ảnh', loai: 'anh', toiDa: 3 }]
        : [{ k: 'Tên cây', nhan: 'Cây', loai: 'cay', bb: true }, { k: 'Số lượng', nhan: 'Số lượng', loai: 'so', bb: true }, { k: 'ĐVT', nhan: 'ĐVT', loai: 'chips', ds: ['Bầu', 'Chậu', 'Cây', 'Bụi'], bb: true, gt: 'Bầu' }]
          .concat(l === 'Xuất vườn' ? [{ k: 'Xuất đi', nhan: 'Xuất đi đâu', loai: 'vitri', bb: true }] : [{ k: 'Chất cải tạo đất hữu cơ (bao)', nhan: 'Chất cải tạo đất hữu cơ (bao, 1 bao = 25 kg)', loai: 'so' }])
          .concat([{ k: 'Ảnh', nhan: 'Ảnh', loai: 'anh', bb: true, toiDa: 3 }, { k: 'Mô tả', nhan: 'Ghi chú', loai: 'mota' }]);
      hop(l + ' · ' + ten, '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
        const lay = G.form(o.querySelector('#f'), tr);
        o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'VuonUom', dong: Object.assign({ 'Ngày': '', 'Vườn ươm': ten, 'Loại ghi': l, 'Việc': l === 'Chăm sóc' ? v['Việc'] : l, 'Người ghi': '' }, v, { 'Tên cây': v['Tên cây'] ? v['Tên cây'].ten || v['Tên cây'] : '', 'Xuất đi': v['Xuất đi'] ? G.tenVT(v['Xuất đi'].ma, v['Xuất đi'].ten) : '' }) }); dong(); bao('Đã lưu'); G.taiLai(); }, e.target);
      }); }; });
  }
  G.man.vuonuom = Object.assign(G.man.vuonuom, { ic: 'vuon_uom', fn: () => manVuonUom('Vườn ươm sân vườn') });

  /* ================= THẺ HÔM NAY ================= */
  G.theAnh = (d) => {
    const nCN = (S.dm.congnhan || []).filter((x) => x.tt !== 'Đã nghỉ' && x.doi !== 'Quản lý nhà thầu').length;
    const sang = (d.ddr || []).filter((x) => x['Buổi'] === 'Sáng'); const coSang = sang.filter((x) => /Có mặt/.test(x['Trạng thái (Có mặt/Vắng/Về sớm)'])).length;
    const nVT = S.dm.vitri.filter((v) => v.ap === 'Có').length; const t = d.tuoi || [];
    const mo = (d.phieu || []).filter((x) => x['Trạng thái'] !== 'Đã duyệt'); const khan = mo.filter((x) => x['Mức độ'] === 'Khẩn cấp');
    const vc = (d.vc || []).filter((x) => x['Nhóm'] === 'Rác cắt tỉa').reduce((a, x) => a + (+x['Số chuyến'] || 0), 0);
    const ps = (d.ps || []).length;
    const o = (k, ten, so, phu, link, mau) => `<a class="the so-the" href="#/${link}">${G.ic(k, 44)}<div><small>${esc(ten)}</small><b style="${mau ? 'color:' + mau : ''}">${so}</b><small>${esc(phu)}</small></div></a>`;
    return `<div class="luoi-kpi">${o('diem_danh', 'Điểm danh sáng', `${coSang}/${nCN}`, `${(d.dd || []).filter((x) => x['Khóa'] !== 'Có').length} buổi chờ duyệt`, 'diemdanh')}${o('tuoi', 'Tưới hôm nay', `${t.length}/${nVT}`, `${t.filter((x) => x['Trạng thái'] === 'Không cần (mưa)').length} vị trí mưa`, 'tuoi', '#2E6DA4')}
      ${o('phieu', 'Phiếu đang mở', mo.length, `${khan.length} khẩn cấp`, 'phieu', khan.length ? 'var(--do)' : '')}${o('van_chuyen', 'Chuyến rác cắt tỉa', vc, `${ps} việc phát sinh hôm nay`, 'vanchuyen')}</div>`;
  };
  G.theToTruong = () => '';
})();
