/* GreenLog 0.4.3 – việc theo mùa và việc trong villa
   mục 89: DV41 Lưới chắn cát bãi biển (Đội cơ động): căng 20/04 → 10/05 · tháo 01/10 → 31/10, theo đoạn bãi, mét lưới, số cọc, kiểm kê khi tháo.
   mục 90: đợt "Chuẩn bị mùa mưa bão" 01/03 → 15/07, 4 việc chạy song song theo thời tiết; ghi theo khu: số cây đã làm + số cây không cần làm,
           bấm "Xong khu này"; tiến độ = khu đã xong / tổng khu; ⭐ ưu tiên xong trước 30/06; Trưởng bộ phận khởi chạy và kết thúc.
   mục 91: DV42 Chăm sóc cây bên trong villa (Villa 01, 55–80) – định kỳ tháng, chọn theo căn; phiếu "Chăm sóc cây trong villa" báo xong là tự tick. */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay, bao } = G;
  const hn = () => API.ngay();
  Object.assign(API.BANG, { DotMua: ['homnay', 2], DotMuaGhi: ['homnay', 2] });
  const nam = () => hn().slice(0, 4);
  const md = (d) => d.slice(5);

  /* ---------- danh mục đợt ---------- */
  const KHU_VILLA = () => [...new Set(S.dm.vitri.filter((v) => G.laVilla(v)).map((v) => v.kv))].map((kv) => ({ ma: 'K:' + kv, kv, cum: (S.dm.vitri.find((v) => v.kv === kv) || {}).cum, ten: kv }));
  const KHU_TAT = () => { const kv = [...new Set(S.dm.vitri.filter((v) => v.ap === 'Có').map((v) => v.kv))];
    return kv.map((k) => { const v = S.dm.vitri.find((x) => x.kv === k); return { ma: 'K:' + k, kv: k, cum: v.cum, ten: k }; }); };
  const KHU_BAI = () => (S.dm.diemkhac || []).filter((x) => x.loai === 'Bãi biển').map((x) => ({ ma: 'B:' + x.ten, kv: x.ten, cum: 'Bãi biển', ten: x.ten }));
  const LY_KHONG = ['Cây non, chưa có trái', 'Mới làm gần đây', 'Cây yếu, chết', 'Khác'];
  const DOT = {
    luoi: { ten: 'Lưới chắn cát bãi biển', ma: 'DV41', ic: 'bai_bien', doi: 'Đội cơ động', khu: KHU_BAI,
      gd: [{ k: 'cang', ten: 'Căng lưới', mo: '04-20', han: '05-10', nhac: '04-06' }, { k: 'thao', ten: 'Tháo lưới', mo: '10-01', han: '10-31', nhac: '09-15' }],
      viec: [{ k: 'luoi', ten: 'Lưới chắn cát' }] },
    bao: { ten: 'Chuẩn bị mùa mưa bão', ic: 'bao', doi: 'Đội cơ động', gd: [{ k: 'bao', ten: 'Chuẩn bị mùa mưa bão', mo: '03-01', han: '07-15', nhac: '02-15', uuTien: '06-30' }],
      viec: [{ k: 'dua', ten: 'Vệ sinh dừa', ic: 'tia_bong_mat', troi: '☀', khu: KHU_TAT, cay: 'cây dừa', ghiChu: 'Cắt bẹ khô · cắt toàn bộ trái và hoa. Cần dụng cụ leo chuyên dùng.' },
        { k: 'caylon', ten: 'Tỉa thông thoáng cây lớn', ic: 'tia_bong_mat', troi: '☀', khu: KHU_TAT, cay: 'cây', ghiChu: 'Còng, ván hương, bàng biển, rừa, sanh, bằng lăng…' },
        { k: 'giaco', ten: 'Chống chổi, gia cố cây', ic: 'trong_cay', troi: '🌧', khu: KHU_TAT, cay: 'cây', ghiChu: 'Cây lớn, cây có nguy cơ đổ.' },
        { k: 'hoangnam', ten: 'Cắt tỉa hoàng nam villa', ic: 'tia_hang_rao', troi: '🌧', khu: KHU_VILLA, cay: 'cây', ghiChu: 'Quanh villa.' }] },
  };
  G.DOT_MUA = DOT;
  const gdHienTai = (k) => { const n = md(hn()); return DOT[k].gd.find((g) => n >= g.nhac && n <= g.han) || null; };
  const laTBP = () => G.laAnhVu();
  const nguoiGhi = () => S.u && S.u.nhom !== 'Quản lý nhà thầu';

  const docDot = async (k) => { const [dot, ghi] = await Promise.all([G.doc('DotMua', { 'Loại': k }).catch(() => []), G.doc('DotMuaGhi', { 'Loại': k }).catch(() => [])]); return { dot, ghi }; };
  const dotChay = (dot) => dot.filter((x) => x['Trạng thái'] === 'Đang chạy').slice(-1)[0] || null;
  /* tiến độ một việc trong đợt */
  const tienDo = (k, v, ghi, maDot) => {
    const khu = (v.khu || DOT[k].khu)(); const g = ghi.filter((x) => x['Mã đợt'] === maDot && x['Việc'] === v.k);
    const xong = new Set(g.filter((x) => x['Xong khu'] === 'Có').map((x) => x['Khu']));
    const dang = new Set(g.map((x) => x['Khu']));
    const lam = g.reduce((a, x) => a + (+x['Đã làm'] || 0), 0); const khong = g.reduce((a, x) => a + (+x['Không cần làm'] || 0), 0);
    const p = khu.length ? Math.round(xong.size / khu.length * 100) : 0;
    return { khu, g, xong, dang, lam, khong, p };
  };
  const duKien = (dot, p) => { if (!dot || !p) return ''; const tu = dot['Bắt đầu']; const qua = Math.max(1, Math.round((new Date(hn()) - new Date(tu)) / 864e5) + 1);
    const can = Math.ceil(qua * (100 - p) / p); return G.congNgay(hn(), can); };

  /* ---------- màn một đợt ---------- */
  G.man.dot = { an: true, fn: async (k, vk) => {
    const D = DOT[k]; if (!D) { location.hash = '#/viec'; return; }
    if (G.anNoiBo && false) return;
    const { dot, ghi } = await docDot(k); const chay1 = dotChay(dot); const gd = chay1 ? D.gd.find((x) => x.k === chay1['Giai đoạn']) || D.gd[0] : gdHienTai(k);
    if (vk && chay1) return manViec(k, D.viec.find((x) => x.k === vk), chay1, ghi, gd);
    const m = G.khung(D.ten, chay1 ? `${gd.ten} · đang chạy từ ${G.ngayVN(chay1['Bắt đầu'])} · hạn ${gd.han.split('-').reverse().join('/')}` : D.gd.map((x) => `${x.ten} ${x.mo.split('-').reverse().join('/')} → ${x.han.split('-').reverse().join('/')}`).join(' · '), '#/viec');
    if (!chay1) {
      const cu = dot.filter((x) => x['Trạng thái'] === 'Đã kết thúc').slice(-3).reverse();
      m.innerHTML = `<div class="the"><h2>Chưa chạy</h2><p class="mo">${gd ? `Đến kỳ <b>${esc(gd.ten)}</b>: mở ${gd.mo.split('-').reverse().join('/')}, hạn ${gd.han.split('-').reverse().join('/')}.` : 'Chưa đến kỳ. App sẽ nhắc Trưởng bộ phận trước khi đến kỳ.'} Giao cho ${esc(D.doi)}.</p>
        ${laTBP() ? `<div class="chon boc" id="gdChon">${D.gd.map((x) => `<button data-gd="${x.k}" class="${gd && gd.k === x.k ? 'dang' : ''}">${esc(x.ten)}</button>`).join('')}</div><button class="nut chinh rong" id="khoiChay" style="margin-top:10px">▶ Khởi chạy</button>` : '<p class="mo">Trưởng bộ phận bấm Khởi chạy khi bắt đầu.</p>'}</div>
        ${cu.length ? `<h3 class="tieu-nhom">Các đợt trước</h3><div class="ds">${cu.map((x) => `<div class="muc"><div class="gian"><b>${esc(x['Giai đoạn tên'] || x['Giai đoạn'])} ${esc(x['Năm'])}</b><div class="mo">${G.ngayVN(x['Bắt đầu'])} → ${G.ngayVN(x['Kết thúc'])} · ${esc(x['Tóm tắt'] || '')}</div></div></div>`).join('')}</div>` : ''}`;
      let chonGD = gd ? gd.k : D.gd[0].k;
      m.querySelectorAll('[data-gd]').forEach((b) => { b.onclick = () => { chonGD = b.dataset.gd; m.querySelectorAll('[data-gd]').forEach((x) => x.classList.toggle('dang', x === b)); }; });
      const kc = m.querySelector('#khoiChay'); if (kc) kc.onclick = (e) => chay(async () => { const g = D.gd.find((x) => x.k === chonGD);
        await API.goi('ghi', { bang: 'DotMua', dong: { 'Mã đợt': G.ma('DM'), 'Loại': k, 'Năm': nam(), 'Giai đoạn': g.k, 'Giai đoạn tên': g.ten, 'Bắt đầu': hn(), 'Hạn': (md(hn()) <= g.han ? nam() : String(+nam() + 1)) + '-' + g.han, 'Trạng thái': 'Đang chạy', 'Người khởi chạy': S.u.ten } });
        bao('Đã khởi chạy · việc hiện trong Bắt đầu ngày của ' + D.doi); G.taiLai(); }, e.target);
      return;
    }
    const mua = !!API.LS.get('mua_' + hn(), 0);
    const td = D.viec.map((v) => ({ v, t: tienDo(k, v, ghi, chay1['Mã đợt']) }));
    const pTong = Math.round(td.reduce((a, x) => a + x.t.p, 0) / td.length);
    const dk = duKien(chay1, pTong); const han = chay1['Hạn'];
    const mau = !dk ? '' : dk <= han ? 'xanh' : dk <= G.congNgay(han, 10) ? 'cam' : 'do';
    const xep = td.slice().sort((a, b) => (mua ? (a.v.troi === '🌧' ? -1 : 0) - (b.v.troi === '🌧' ? -1 : 0) : 0));
    m.innerHTML = `<div class="the"><div class="hang"><b class="gian">Tiến độ chung ${pTong}%</b>${dk ? `<span class="chip ${mau}">Dự kiến xong ${G.ngayVN(dk)}</span>` : ''}</div><div class="thanh" style="margin-top:8px"><i style="width:${pTong}%"></i></div>
        <div class="mo" style="margin-top:6px">Hạn ${G.ngayVN(han)}${gd.uuTien ? ` · ⭐ khu ưu tiên xong trước ${gd.uuTien.split('-').reverse().join('/')}` : ''}${mua ? ' · ☔ hôm nay mưa: ưu tiên việc làm được khi mưa' : ''}</div></div>
      ${xep.map(({ v, t }) => `<a class="the-viec" href="#/dot/${k}/${v.k}" style="${mua && v.troi === '☀' ? 'opacity:.55' : ''}"><span class="bt">${G.ic(v.ic || D.ic, 44)}</span><span class="gian"><b>${v.troi ? v.troi + ' ' : ''}${esc(v.ten)}</b>
        <div class="thanh" style="margin:6px 0 2px"><i style="width:${t.p}%"></i></div><span class="mo">${t.xong.size}/${t.khu.length} khu · ${t.p}%${t.lam ? ` · ${t.lam} ${v.cay || 'đã làm'}` : ''}${t.khong ? ` · ${t.khong} không cần làm` : ''}${mua && v.troi === '☀' ? ' · trời mưa, tạm hoãn' : ''}</span></span>›</a>`).join('')}
      ${laTBP() ? '<button class="nut do rong" id="ketThuc" style="margin-top:12px">■ Kết thúc đợt</button>' : ''}`;
    const kt = m.querySelector('#ketThuc'); if (kt) kt.onclick = async (e) => { if (!(await G.xacNhan(`Kết thúc đợt ${D.ten}? Tiến độ hiện tại ${pTong}%.`, 'Kết thúc đợt'))) return;
      chay(async () => { const tom = td.map(({ v, t }) => `${v.ten}: ${t.xong.size}/${t.khu.length} khu${t.lam ? ', ' + t.lam + ' ' + (v.cay || '') : ''}`).join(' · ');
        await API.goi('sua', { bang: 'DotMua', khoa: { 'Mã đợt': chay1['Mã đợt'] }, doi: { 'Trạng thái': 'Đã kết thúc', 'Kết thúc': hn(), 'Tóm tắt': tom } }); bao('Đã kết thúc đợt'); G.taiLai(); }, e.target); };
  } };

  async function manViec(k, v, dot, ghi, gd) {
    const D = DOT[k]; const t = tienDo(k, v, ghi, dot['Mã đợt']);
    const m = G.khung(v.ten, `${D.ten} · ${t.xong.size}/${t.khu.length} khu · ${t.p}%`, '#/dot/' + k);
    const uuTien = new Set(ghi.filter((x) => x['Mã đợt'] === dot['Mã đợt'] && x['Việc'] === v.k && x['Ưu tiên'] === 'Có').map((x) => x['Khu']));
    const cuaKhu = (ma) => t.g.filter((x) => x['Khu'] === ma);
    const tt = (ma) => (t.xong.has(ma) ? { cls: 'xong', sub: '' } : t.dang.has(ma) ? { cls: 'dang', sub: (cuaKhu(ma).reduce((a, x) => a + (+x['Đã làm'] || 0), 0)) + ' ' + (v.cay || '') } : { cls: '' });
    const st = { cum: '', mat: 'Cả 3', chon: new Set() };
    const luoi = k === 'luoi';
    m.innerHTML = `${v.ghiChu ? `<p class="mo" style="margin-top:0">${esc(v.ghiChu)}</p>` : ''}
      ${uuTien.size ? `<div class="the the-mo"><b>⭐ Khu ưu tiên${gd.uuTien ? ' (xong trước ' + gd.uuTien.split('-').reverse().join('/') + ')' : ''}:</b> ${[...uuTien].map((x) => `<span class="chip ${t.xong.has(x) ? 'xanh' : 'cam'}">${esc(x.slice(2))}</span>`).join(' ')}</div>` : ''}
      <div class="mo" style="margin-bottom:6px">Chạm một khu để ghi số đã làm hôm nay. Khu làm xong bấm ✓ Xong khu này.</div><div id="lv"></div>
      <div class="the" style="margin-top:12px"><b>Tổng</b><div class="mo">${t.lam} ${luoi ? 'lượt ghi' : (v.cay || 'đã làm')} đã làm · ${t.khong} không cần làm · ${t.xong.size}/${t.khu.length} khu xong</div></div>`;
    const moKhu = (ma) => { const kh = t.khu.find((x) => x.ma === ma); const cu = cuaKhu(ma);
      const daLam = cu.reduce((a, x) => a + (+x['Đã làm'] || 0), 0); const daKhong = cu.reduce((a, x) => a + (+x['Không cần làm'] || 0), 0);
      G.hop(kh.ten + ' · ' + v.ten, `<div class="mo" style="margin-top:0">${t.xong.has(ma) ? '✓ Khu này đã xong. ' : ''}Trước đây: đã làm ${daLam}${daKhong ? ', không cần làm ' + daKhong : ''}.</div><div id="f"></div>
        ${(laTBP() || S.u.nhom === 'Tổ trưởng') && gd.uuTien ? `<label class="hang" style="margin:6px 0"><input type="checkbox" id="uu" ${uuTien.has(ma) ? 'checked' : ''}> ⭐ Khu ưu tiên, xong trước ${gd.uuTien.split('-').reverse().join('/')}</label>` : ''}
        <div class="nhom-nut"><button class="nut" id="luu">Lưu</button><button class="nut chinh" id="xong">✓ Lưu và xong khu này</button></div>`, (o, dong) => {
        const truong = luoi
          ? [{ k: 'met', nhan: dot['Giai đoạn'] === 'thao' ? 'Số mét lưới đã tháo' : 'Số mét lưới đã căng', loai: 'so', bb: true }, { k: 'coc', nhan: dot['Giai đoạn'] === 'thao' ? 'Số cọc đã nhổ' : 'Số cọc đã đóng', loai: 'so', bb: true }]
            .concat(dot['Giai đoạn'] === 'thao' ? [{ k: 'lDung', nhan: 'Lưới còn dùng lại được (m)', loai: 'so' }, { k: 'lBo', nhan: 'Lưới rách, bỏ (m)', loai: 'so' }, { k: 'cDung', nhan: 'Cọc còn dùng lại', loai: 'so' }, { k: 'cBo', nhan: 'Cọc mục, gãy', loai: 'so' }] : [])
          : [{ k: 'lam', nhan: `Số ${v.cay || 'cây'} đã làm hôm nay`, loai: 'so', bb: true }, { k: 'khong', nhan: `Số ${v.cay || 'cây'} không cần làm`, loai: 'so', gt: 0 },
            { k: 'ly', nhan: 'Vì sao không cần làm', loai: 'chips', ds: LY_KHONG, khi: (x) => +x.khong > 0 }];
        const lay = G.form(o.querySelector('#f'), truong.concat([{ k: 'anh', nhan: 'Ảnh', loai: 'anh', toiDa: 4 }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]));
        const luu = (xong) => (e) => chay(async () => { const x = lay(); const uu = o.querySelector('#uu');
          await API.goi('ghi', { bang: 'DotMuaGhi', dong: { 'Mã': G.ma('DG'), 'Mã đợt': dot['Mã đợt'], 'Loại': k, 'Việc': v.k, 'Ngày': hn(), 'Khu': ma, 'Tên khu': kh.ten,
            'Đã làm': luoi ? 1 : +x.lam || 0, 'Không cần làm': +x.khong || 0, 'Lý do không làm': x.ly || '', 'Mét lưới': x.met || '', 'Số cọc': x.coc || '',
            'Lưới dùng lại (m)': x.lDung || '', 'Lưới bỏ (m)': x.lBo || '', 'Cọc dùng lại': x.cDung || '', 'Cọc hỏng': x.cBo || '',
            'Ảnh': x.anh, 'Ghi chú': x.gc || '', 'Xong khu': xong ? 'Có' : '', 'Ưu tiên': uu && uu.checked ? 'Có' : '', 'Người ghi': '' } });
          dong(); bao(xong ? `✓ Xong ${kh.ten}` : 'Đã lưu'); G.taiLai(); }, e.target);
        o.querySelector('#luu').onclick = luu(false); o.querySelector('#xong').onclick = luu(true);
      }); };
    G.luoiVT(m.querySelector('#lv'), { ds: t.khu.slice().sort((a, b) => (uuTien.has(b.ma) ? 1 : 0) - (uuTien.has(a.ma) ? 1 : 0)), st, coMat: false, trangThai: tt, doi: () => { const ma = [...st.chon][0]; st.chon.clear(); if (ma && nguoiGhi()) moKhu(ma); } });
  }

  /* ---------- ô ở mục C trong màn Việc ---------- */
  const viecFn = G.man.viec.fn;
  G.man.viec.fn = async (...a) => {
    await viecFn(...a); const m = document.getElementById('noiDung'); if (!m || (G.anNoiBo && G.anNoiBo() && false)) return;
    const luoiC = [...m.querySelectorAll('.luoi-viec')].find((l) => l.querySelector('a[href="#/sotrongcay"]'));
    if (!luoiC || luoiC.querySelector('[href^="#/dot/"]')) return;
    const [l, b] = await Promise.all([docDot('luoi'), docDot('bao')]);
    if (luoiC.querySelector('[href^="#/dot/"]') || !luoiC.isConnected) return;
    const nhan = (k, x) => { const c = dotChay(x.dot); const D = DOT[k];
      if (c) { const td = D.viec.map((v) => tienDo(k, v, x.ghi, c['Mã đợt']).p); return `Đang chạy · ${Math.round(td.reduce((s, y) => s + y, 0) / td.length)}%`; }
      const n = md(hn()); const g = D.gd.find((y) => n <= y.han) || D.gd[0]; return `Chưa chạy · mở ${g.mo.split('-').reverse().join('/')}`.replace('Chưa chạy · mở', G.lang && G.lang() === 'en' ? 'Not running · opens' : 'Chưa chạy · mở'); };
    if (G.qv('DV41') || G.laAnhVu() || S.u.nhom === 'Tổ trưởng') luoiC.insertAdjacentHTML('beforeend', `<a class="o-viec" href="#/dot/luoi">${G.ic('bai_bien', 52)}<b>Lưới chắn cát</b><small>${esc(nhan('luoi', l))}</small></a>`);
    if (G.laAnhVu() || S.u.nhom === 'Tổ trưởng' || S.u.nhom === 'Quản lý nhà thầu') luoiC.insertAdjacentHTML('beforeend', `<a class="o-viec" href="#/dot/bao">${G.ic('bao', 52)}<b>Mùa mưa bão</b><small>${esc(nhan('bao', b))}</small></a>`);
  };

  /* ---------- Bắt đầu ngày: đợt đang chạy của đội hiện trong nhóm "Kế hoạch tuần, phiếu, việc khác" ---------- */
  const goiY = G.goiYNgay;
  G.goiYNgay = async (doi, ngay) => { const out = await goiY(doi, ngay); try {
    const mua = !!API.LS.get('mua_' + hn(), 0);
    for (const k of Object.keys(DOT)) { const D = DOT[k]; if (D.doi !== doi) continue; const x = await docDot(k); const c = dotChay(x.dot); if (!c) continue;
      D.viec.slice().sort((a, b) => (mua ? (a.troi === '🌧' ? -1 : 1) : 0)).forEach((v) => { const t = tienDo(k, v, x.ghi, c['Mã đợt']); if (t.p >= 100) return;
        out.push({ nhom: 2, nguon: 'Đợt theo mùa' + (v.troi ? ' ' + v.troi : ''), nd: (D.viec.length > 1 ? v.ten : D.gd.find((g) => g.k === c['Giai đoạn']).ten + ' · ' + D.ten) + (mua && v.troi === '☀' ? ' (trời mưa: hoãn)' : ''), ma: 'DM:' + c['Mã đợt'] + ':' + v.k + ':' + hn(), vt: `${t.xong.size}/${t.khu.length} khu · ${t.p}%` }); }); }
  } catch (e) { /* bỏ qua */ } return out; };

  /* ---------- chuông: đến kỳ thì nhắc Trưởng bộ phận; gần hạn mà còn chậm thì báo ---------- */
  const chuong = G.dsChuong;
  G.dsChuong = async () => { const out = await chuong(); try {
    if (!(laTBP() || S.u.nhom === 'Tổ trưởng')) return out;
    for (const k of Object.keys(DOT)) { const D = DOT[k]; const x = await docDot(k); const c = dotChay(x.dot); const g = gdHienTai(k);
      if (!c && g && laTBP()) out.push({ ten: `📅 ${md(hn()) >= g.mo ? 'Đến kỳ' : 'Sắp đến kỳ'}: ${g.ten}`, phu: `Mở ${g.mo.split('-').reverse().join('/')} · hạn ${g.han.split('-').reverse().join('/')} · bấm để khởi chạy`, link: 'dot/' + k });
      if (c) { const td = D.viec.map((v) => tienDo(k, v, x.ghi, c['Mã đợt']).p); const p = Math.round(td.reduce((a, y) => a + y, 0) / td.length); const con = Math.round((new Date(c['Hạn']) - new Date(hn())) / 864e5);
        if (con <= 5 && p < 100) out.push({ ten: `⏰ ${D.ten}: còn ${con} ngày, mới ${p}%`, phu: 'Hạn ' + G.ngayVN(c['Hạn']), link: 'dot/' + k });
        if (k === 'bao' && md(hn()) > '06-30' && p < 100) out.push({ ten: '🌀 Chưa sẵn sàng mùa bão', phu: `Đợt chuẩn bị mới ${p}%`, link: 'dot/bao' }); } }
  } catch (e) { /* bỏ qua */ } return out; };

  /* ---------- Tổng quan (Trưởng bộ phận): thẻ đợt đang chạy ---------- */
  const tq = G.man[''] && G.man[''].fn;
  if (tq) G.man[''].fn = async (...a) => { await tq(...a); try {
    if (!laTBP()) return; const m = document.getElementById('noiDung'); if (!m || m.querySelector('.the-dot')) return;
    const the = []; for (const k of Object.keys(DOT)) { const D = DOT[k]; const x = await docDot(k); const c = dotChay(x.dot); if (!c) continue;
      const td = D.viec.map((v) => ({ v, p: tienDo(k, v, x.ghi, c['Mã đợt']).p })); const p = Math.round(td.reduce((s, y) => s + y.p, 0) / td.length); const dk = duKien(c, p);
      const mau = !dk ? '' : dk <= c['Hạn'] ? 'xanh' : dk <= G.congNgay(c['Hạn'], 10) ? 'cam' : 'do';
      the.push(`<a class="the the-dot" href="#/dot/${k}" style="display:block;color:inherit;text-decoration:none"><div class="hang"><b class="gian">${k === 'bao' ? '🌀' : '🏖'} ${esc(D.ten)} · còn ${Math.max(0, Math.round((new Date(c['Hạn']) - new Date(hn())) / 864e5))} ngày</b>${dk ? `<span class="chip ${mau}">dự kiến ${G.ngayVN(dk).slice(0, 5)}</span>` : ''}</div>
        ${td.map((y) => `<div class="hang" style="font-size:14px;margin-top:6px"><span style="width:170px">${esc(y.v.ten)}</span><div class="thanh gian"><i style="width:${y.p}%"></i></div><b style="width:44px;text-align:right">${y.p}%</b></div>`).join('')}</a>`); }
    if (the.length) G.oNhanh(m).insertAdjacentHTML('afterend', the.join(''));
  } catch (e) { /* bỏ qua */ } };

  /* =================== mục 91: DV42 Chăm sóc cây bên trong villa =================== */
  const VILLA_TRONG = () => ['01'].concat(Array.from({ length: 26 }, (_, i) => String(55 + i))).map((n) => ({ ma: 'VIL' + n, cum: n === '01' ? 'Villa 01' : 'Villa 55 - 80', kv: 'Villa ' + (+n), ten: 'Cây bên trong villa', ap: 'Có' }));
  G.VILLA_TRONG = VILLA_TRONG;
  const vtGoc = G.vt; G.vt = (ma) => vtGoc(ma) || (/^VIL\d+$/.test(ma || '') ? VILLA_TRONG().find((v) => v.ma === ma) || null : null);
  const dsGoc = G.dsVT; G.dsVT = (ma) => (ma === 'DV42' ? VILLA_TRONG() : dsGoc(ma));
  const bsGoc = G.boSungDM;
  G.boSungDM = async (...a) => { const r = bsGoc ? await bsGoc(...a) : undefined; const d = S.dm; if (d && d.dauviec) {
    if (!d.dauviec.some((v) => v.ma === 'DV41')) d.dauviec.push({ ma: 'DV41', ten: 'Lưới chắn cát bãi biển', nhom: 'Nhà thầu', lich: 'Theo mùa', tanSuat: 'Căng 20/04–10/05 · tháo 01/10–31/10', apDung: 'Các đoạn bãi biển', anh: 'Bắt buộc' });
    if (!d.dauviec.some((v) => v.ma === 'DV42')) d.dauviec.push({ ma: 'DV42', ten: 'Chăm sóc cây bên trong villa', nhom: 'Nhà thầu', lich: 'Có lịch', tanSuat: '1 lần/kỳ tháng (20 → 19), làm khi HK báo', apDung: 'Villa 01, Villa 55–80', anh: 'Bắt buộc' }); }
    return r; };
  if (G.QV) { G.QV.DV41 = G.QV.DV07; G.QV.DV42 = G.QV.DV08; }
  /* ô trong màn Việc (cạnh Hoa Giấy) */
  const viecFn2 = G.man.viec.fn;
  G.man.viec.fn = async (...a) => { await viecFn2(...a); const m = document.getElementById('noiDung'); if (!m || m.querySelector('[href="#/dinhky/DV42"]') || !G.qv('DV42')) return;
    const ref = m.querySelector('a[href="#/dinhky/DV40"]') || m.querySelector('a[href="#/dinhky/DV08"]'); if (!ref) return;
    ref.insertAdjacentHTML('afterend', `<a class="o-viec" href="#/dinhky/DV42">${G.ic('noi_that', 52)}<b>Cây trong villa</b><small>Villa 01, 55–80 · khi HK báo</small></a>`); };
  /* màn định kỳ DV42: Trưởng bộ phận giao phiếu khi HK báo */
  const dkFn = G.man.dinhky && G.man.dinhky.fn;
  if (dkFn) G.man.dinhky.fn = async (ma, ...r) => { await dkFn(ma, ...r); if (ma !== 'DV42' || !(laTBP() || S.u.nhom === 'Tổ trưởng')) return; const m = document.getElementById('noiDung'); if (!m || m.querySelector('#hkBao')) return;
    m.insertAdjacentHTML('afterbegin', `<div class="the the-mo"><b>📣 HK báo đang làm phòng?</b><div class="mo">${laTBP() ? 'Tạo phiếu giao tổ trưởng vào chăm cây. Tổ trưởng báo xong là căn đó tự được tick.' : 'Nhận tin HK dọc đường: chọn căn bên dưới, chụp ảnh, lưu luôn.'}</div>${laTBP() ? '<button class="nut chinh rong" id="hkBao" style="margin-top:8px">📣 Giao phiếu chăm cây trong villa</button>' : ''}</div>`);
    const b = m.querySelector('#hkBao'); if (b) b.onclick = async () => {
      const tk = await G.doc('TickDinhKy', { 'Kỳ': S.dm.ky.ten, 'Mã việc': 'DV42' }).catch(() => []);
      const r = await G.chonViTri({ ds: VILLA_TRONG(), coMat: false, trangThai: (v) => { const n = tk.filter((x) => x['Mã vị trí'] === v && (x['Trạng thái'] || 'Xong') === 'Xong'); return n.length ? { cls: 'xong', sub: '✓ ' + n.length + ' lần' } : { cls: '' }; } });
      const ds = r ? (r.nhieu || [String(r.ma || '').trim()]).filter(Boolean) : []; if (!ds.length) return;
      const lai = ds.filter((v) => tk.some((x) => x['Mã vị trí'] === v && (x['Trạng thái'] || 'Xong') === 'Xong')); let ly = '';
      if (lai.length) { const x = await G.chonDS(`${lai.length} căn đã chăm trong kỳ. Chăm thêm vì:`, ['Khách yêu cầu', 'Khách mới nhận phòng', 'Cây xấu lại', 'Khác']); if (!x) return; ly = x.ten; }
      chay(async () => { for (const v of ds) { const p = await API.goi('phieu.tao', { loaiPhieu: 'Chăm sóc cây trong villa', nguon: 'HK báo', nhom: 'Chăm sóc cây', loai: 'Chăm sóc cây bên trong villa', muc: 'Cao', vt: v, moTa: `Chăm sóc cây bên trong ${G.vt(v).kv} (HK đang làm phòng)${lai.includes(v) ? ' · chăm thêm: ' + ly : ''}`, giao: 'Đội khu vực' });
        await API.goi('sua', { bang: 'Phieu', khoa: { 'Mã phiếu': p.ma }, doi: { 'Hạn': hn() + ' 17:00', 'Lý do làm thêm': lai.includes(v) ? ly : '' } }); }
        bao(`Đã giao ${ds.length} phiếu · tổ trưởng nhận thông báo`); }); }; };
  /* phiếu chăm cây trong villa báo xong → tự tick việc định kỳ; tổ trưởng tick trực tiếp → phiếu mở của căn đó tự đóng */
  const goi = API.goi;
  API.goi = async (act, r, ...x) => {
    const kq = await goi(act, r, ...x);
    try {
      if (act === 'phieu.chuyen' && r && r.hd === 'xong') { const p = (await G.doc('Phieu', { 'Mã phiếu': r.ma }))[0];
        if (p && p['Loại'] === 'Chăm sóc cây trong villa' && p['Mã vị trí']) {
          const tk = await G.doc('TickDinhKy', { 'Kỳ': S.dm.ky.ten, 'Mã việc': 'DV42' }).catch(() => []); const lai = tk.some((y) => y['Mã vị trí'] === p['Mã vị trí'] && (y['Trạng thái'] || 'Xong') === 'Xong');
          await goi('dinhKy.luu', { viec: 'DV42', trangThai: 'Xong', anh: r.anh, ghiChu: 'Theo phiếu ' + r.ma, ds: [{ vt: p['Mã vị trí'], kv: G.vt(p['Mã vị trí']).kv, lyDo: lai ? (p['Lý do làm thêm'] || 'Khách yêu cầu') : '' }] }); } }
      if (act === 'dinhKy.luu' && r && r.viec === 'DV42' && !/^Theo phiếu/.test(r.ghiChu || '')) { const mo = (await G.doc('Phieu', { 'Loại': 'Chăm sóc cây trong villa' })).filter((p) => !/Đã duyệt|Báo xong/.test(p['Trạng thái']) && r.ds.some((d) => d.vt === p['Mã vị trí']));
        for (const p of mo) await goi('phieu.chuyen', { ma: p['Mã phiếu'], hd: 'xong', anh: r.anh, ghiChu: 'Tổ trưởng đã ghi trực tiếp' }); }
    } catch (e) { /* bỏ qua */ }
    return kq;
  };

  /* báo cáo riêng: đợt theo mùa (từng khu, số cây đã làm / không cần làm, lưới, cọc) và cây trong villa */
  const bang = (o, a, b) => `<table class="bang"><tr><th>${esc(a)}</th><th>${esc(b)}</th></tr>${Object.keys(o).map((k) => `<tr><td>${esc(k)}</td><td>${o[k]}</td></tr>`).join('')}</table>`;
  const tenViec = (k) => { for (const D of Object.values(DOT)) { const v = D.viec.find((x) => x.k === k); if (v) return v.k === 'luoi' ? D.ten : v.ten; } return k; };
  if (G.BC_VIEC) {
    G.BC_VIEC.push({ k: 'dotmua', ten: 'Việc theo mùa (mùa bão, lưới chắn cát)', nhom: 'Cây xanh', bang: 'DotMuaGhi', gt: (r) => +r['Đã làm'] || 0, dvt: 'cây',
      cs: (d) => [['Khu đã xong', d.filter((r) => r['Xong khu'] === 'Có').length], ['Cây đã làm', d.reduce((a, r) => a + (r['Loại'] === 'luoi' ? 0 : +r['Đã làm'] || 0), 0)], ['Cây không cần làm', d.reduce((a, r) => a + (+r['Không cần làm'] || 0), 0)], ['Mét lưới', d.reduce((a, r) => a + (+r['Mét lưới'] || 0), 0)], ['Số cọc', d.reduce((a, r) => a + (+r['Số cọc'] || 0), 0)]],
      them: (d) => { const o = {}; d.forEach((r) => { const k = tenViec(r['Việc']); o[k] = (o[k] || 0) + (r['Loại'] === 'luoi' ? 0 : +r['Đã làm'] || 0); }); return bang(o, 'Việc', 'Cây đã làm'); },
      cot: ['Ngày', 'Việc', 'Tên khu', 'Đã làm', 'Không cần làm', 'Lý do không làm', 'Mét lưới', 'Số cọc', 'Lưới dùng lại (m)', 'Lưới bỏ (m)', 'Cọc dùng lại', 'Cọc hỏng', 'Xong khu', 'Ưu tiên', 'Người ghi'] });
    G.BC_VIEC.push({ k: 'caytrongvilla', ten: 'Chăm sóc cây bên trong villa', nhom: 'Cây xanh', bang: 'TickDinhKy', loc: { 'Mã việc': 'DV42' },
      cs: (d) => [['Lần chăm', d.length], ['Số căn đã chăm', new Set(d.map((r) => r['Mã vị trí'])).size + '/27'], ['Lần chăm thêm', d.filter((r) => +r['Lần'] > 1).length]],
      them: (d) => { const o = {}; d.filter((r) => r['Lý do làm thêm']).forEach((r) => { o[r['Lý do làm thêm']] = (o[r['Lý do làm thêm']] || 0) + 1; }); return Object.keys(o).length ? bang(o, 'Lý do chăm thêm', 'Lần') : ''; },
      cot: ['Ngày', 'Mã vị trí', 'Lần', 'Lý do làm thêm', 'Người tick', 'Ghi chú'] });
  }
})();
