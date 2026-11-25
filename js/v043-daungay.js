/* GreenLog 0.4.3 – mục 83: Báo cáo đầu ca có đủ danh sách việc để tick.
   Nhóm 1 việc hằng ngày của đội · nhóm 2 việc định kỳ còn lại trong kỳ · nhóm 3 kế hoạch tuần, làm bù, phiếu, dự án, nhắc nhở, sự kiện.
   Tick việc → app tự điền người có mặt theo chức danh / khu phụ trách, tổ trưởng chỉ sửa chỗ khác. */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay, bao } = G;
  const hn = () => API.ngay();
  const gioNay = () => API.bayGio().slice(11, 16);
  const TT_DD = 'Trạng thái (Có mặt/Vắng/Về sớm)';

  /* việc hằng ngày theo đội: [mã, tên hiển thị (rỗng = theo danh mục), chức danh làm] */
  const HANG_NGAY = {
    'Đội cơ động': [['CN04', 'Vận chuyển rác cắt tỉa, vật tư', ['Vận chuyển']]],
    'Đội khu vực': [['DV10', '', ['Nhân viên khu vực']], ['DV11', '', ['Nhân viên khu vực']], ['DV09', '', ['Nhân viên khu vực']],
      ['DV17', 'Vườn ươm cây bụi: tưới, vệ sinh', ['vườn ươm']], ['DV12', '', ['Tổ trưởng']]],
  };
  /* việc định kỳ theo đội: mã → chức danh làm */
  const DINH_KY = {
    'Đội cơ động': { DV01: ['Cắt cỏ'], DV02: ['Bón phân + phun thuốc'], DV03: ['Bón phân + phun thuốc'], DV04: ['Bón phân + phun thuốc'], DV05: ['Bón phân + phun thuốc'],
      DV06: ['Bón phân + phun thuốc'], DV38: ['Bón phân + phun thuốc'], DV07: ['Cắt tỉa cây bóng mát'] },
    'Đội khu vực': { DV08: ['Nhân viên khu vực'], DV37: ['Nhân viên khu vực'] },
  };
  const NHOM = ['Việc hằng ngày của đội', 'Việc định kỳ còn lại trong kỳ', 'Kế hoạch tuần, phiếu, việc khác'];
  const nhomCua = (x) => (x.nhom != null ? x.nhom : 2);

  const goiYGoc = G.goiYNgay;
  G.goiYNgay = async (doi, ngay) => {
    const khac = (await goiYGoc(doi, ngay)).map((x) => Object.assign(x, { nhom: 2 }));
    const out = [];
    (HANG_NGAY[doi] || []).forEach(([ma, ten, cd]) => { if (G.qv(ma) >= 2) out.push({ nhom: 0, nguon: 'Hằng ngày', nd: ten || G.dvTen(ma), ma: 'HN:' + ma + ':' + (ngay || hn()), cd }); });
    const dk = DINH_KY[doi] || {}; const maDK = Object.keys(dk).filter((ma) => G.qv(ma) >= 2);
    if (maDK.length) {
      const k = (S.dm.ky || {}).ten; let ticks = [];
      try { ticks = k ? await G.doc('TickDinhKy', { 'Kỳ': k }) : []; } catch (e) { ticks = []; }
      maDK.forEach((ma) => {
        const tong = (G.dsVT ? G.dsVT(ma).length : 0) || S.dm.vitri.filter((v) => v.ap === 'Có').length;
        const xong = new Set(ticks.filter((r) => r['Mã việc'] === ma && String(r['Lần'] || '1') === '1' && /Xong|Hoàn thành/.test(r['Trạng thái'] || 'Xong')).map((r) => r['Mã vị trí'])).size;
        const dang = new Set(ticks.filter((r) => r['Mã việc'] === ma && r['Trạng thái'] === 'Đang làm').map((r) => r['Mã vị trí'])).size;
        if (xong >= tong) return;
        out.push({ nhom: 1, nguon: 'Định kỳ kỳ ' + (k || ''), nd: G.dvTen(ma), ma: 'DK:' + ma, vt: `còn ${tong - xong}/${tong} vị trí${dang ? ' · ' + dang + ' đang làm' : ''}`, cd: dk[ma] });
      });
    }
    /* bỏ dòng "định kỳ đang dở" cũ nếu đã có trong nhóm 2 */
    const coDK = new Set(out.filter((x) => x.nhom === 1).map((x) => x.ma));
    return out.concat(khac.filter((x) => !coDK.has(x.ma)));
  };

  /* người có mặt hợp với việc: theo chức danh, việc theo cụm thì người có khu phụ trách */
  const khopCD = (cn, cd) => { const c = String((cn && cn.cd) || '').toLowerCase(); return cd.some((x) => (/vườn ươm/i.test(x) ? /vườn ươm/.test(c) : c === x.toLowerCase())); };
  const goiYNguoi = (x, cm) => {
    if (!x.cd) return [];
    const cn = S.dm.congnhan || [];
    return cm.filter((r) => { const c = cn.find((n) => n.ma === r['Mã CN']) || cn.find((n) => n.ten === r['Họ tên']); return khopCD(c, x.cd); }).map((r) => r['Họ tên']);
  };

  G.man.batdaungay = { an: true, fn: async () => {
    const doi = S.u.doi || 'Đội khu vực'; const m = G.khung('Bắt đầu ngày · ' + doi, `${G.thu()} ${G.ngayVN(hn())} · hạn gửi 07:30`, '#/');
    const [cm, dc, gv, goiY] = await Promise.all([
      G.doc('DiemDanh', { 'Ngày': hn(), 'Buổi': 'Sáng' }).then((r) => r.filter((x) => x['Đội'] === doi && /Có mặt/.test(x[TT_DD]))),
      G.doc('DuyetCong', { 'Ngày': hn(), 'Buổi': 'Sáng' }), G.doc('GiaoViecNgay', { 'Ngày': hn(), 'Đội': doi }), G.goiYNgay(doi)]);
    const daDD = dc.some((x) => x['Đội'] === doi);
    const st = G.man.batdaungay.st && G.man.batdaungay.st.ngay === hn() && G.man.batdaungay.st.doi === doi ? G.man.batdaungay.st : (G.man.batdaungay.st = { ngay: hn(), doi, chon: {}, them: [] });
    const daGui = new Set(gv.map((g) => g['Mã nguồn']));
    const ds = goiY.concat(st.them);
    const conLai = ds.filter((x) => !daGui.has(x.ma));
    const dong = (x) => { const i = ds.indexOf(x); const c = st.chon[x.ma];
      return `<div class="dong-cham" style="display:block"><label class="hang" style="cursor:pointer"><input type="checkbox" data-tick="${i}" ${c ? 'checked' : ''}><div class="gian"><b>${esc(x.nd)}</b><div class="mo">${esc(x.nguon)}${x.vt ? ' · ' + esc(x.vt) : ''}</div></div></label>
        ${c ? `<div class="chon boc" style="margin:6px 0 0 26px">${cm.map((r) => `<button data-ng="${i}" data-ten="${esc(r['Họ tên'])}" class="${c.has(r['Họ tên']) ? 'dang' : ''}">${esc(r['Họ tên'].split(' ').slice(-2).join(' '))}</button>`).join('') || '<span class="mo">Chưa có người điểm danh</span>'}</div>` : ''}</div>`; };
    const nhomHTML = [0, 1, 2].map((n) => { const ds2 = conLai.filter((x) => nhomCua(x) === n); if (!ds2.length) return '';
      const het = ds2.every((x) => st.chon[x.ma]);
      return `<div class="tieu-nhom-dn" style="display:flex;align-items:center;gap:8px;margin:14px 0 4px"><b style="flex:1">${NHOM[n]} (${ds2.length})</b>${n < 2 ? `<button class="nut nho" data-tatca="${n}">${het ? 'Bỏ chọn hết' : 'Chọn hết'}</button>` : ''}</div>${ds2.map(dong).join('')}`; }).join('');
    const soChon = conLai.filter((x) => st.chon[x.ma]).length;
    m.innerHTML = `<div class="the ${daDD ? 'the-xanh' : 'the-do'}"><div class="buoc"><span>1</span>Điểm danh sáng + ảnh tập thể</div>${daDD ? `<p style="margin:0">✓ Đã gửi · ${cm.length} người có mặt</p>` : '<a class="nut chinh rong" href="#/diemdanh">Điểm danh ngay</a>'}</div>
      <div class="the"><div class="buoc"><span>2</span>Việc hôm nay của đội</div><p class="mo" style="margin-top:0">Tick việc làm hôm nay. App tự điền người theo chức danh, chạm tên để thêm hoặc bỏ.</p>
        ${nhomHTML || '<p class="mo">Đã giao hết việc hôm nay.</p>'}
        <button class="nut nho" id="themViec" style="margin-top:10px">＋ Thêm việc khác</button></div>
      ${gv.length ? `<div class="the the-xanh"><b>Đã gửi kế hoạch ${esc(String(gv[0]['Giờ giao']).slice(11, 16))} · ${gv.length} việc</b>${gv.map((g) => `<div class="mo">• ${esc(g['Nội dung'])} → ${esc(g['Người'])}</div>`).join('')}</div>` : ''}
      <div style="height:80px"></div>
      <div class="thanh-duoi"><button class="nut chinh" id="gui">${soChon ? `Gửi kế hoạch · ${soChon} việc` : 'Gửi kế hoạch'}${gioNay() > '07:30' && !gv.length ? ' (đã quá 07:30)' : ''}</button></div>`;
    const bat = (x) => { st.chon[x.ma] = new Set(goiYNguoi(x, cm)); };
    m.querySelectorAll('[data-tick]').forEach((i) => { i.onchange = () => { const x = ds[+i.dataset.tick]; if (i.checked) bat(x); else delete st.chon[x.ma]; G.taiLai(); }; });
    m.querySelectorAll('[data-tatca]').forEach((b) => { b.onclick = () => { const n = +b.dataset.tatca; const ds2 = conLai.filter((x) => nhomCua(x) === n); const het = ds2.every((x) => st.chon[x.ma]);
      ds2.forEach((x) => { if (het) delete st.chon[x.ma]; else if (!st.chon[x.ma]) bat(x); }); G.taiLai(); }; });
    m.querySelectorAll('[data-ng]').forEach((b) => { b.onclick = () => { const s = st.chon[ds[+b.dataset.ng].ma]; if (s.has(b.dataset.ten)) s.delete(b.dataset.ten); else s.add(b.dataset.ten); b.classList.toggle('dang'); }; });
    m.querySelector('#themViec').onclick = async () => { const t = await G.hoi('Việc thêm hôm nay'); if (t) { const x = { nhom: 2, nguon: 'Tổ trưởng thêm', nd: t, ma: G.ma('GV') }; st.them.push(x); st.chon[x.ma] = new Set(); G.taiLai(); } };
    m.querySelector('#gui').onclick = (e) => chay(async () => {
      const chon = conLai.filter((x) => st.chon[x.ma]); if (!chon.length) throw new Error('Chưa tick việc nào');
      const thieu = chon.filter((x) => !st.chon[x.ma].size); if (thieu.length) throw new Error('Chọn người cho: ' + thieu.map((x) => x.nd).join(', '));
      const gio = API.bayGio();
      await API.goi('ghiNhieu', { bang: 'GiaoViecNgay', dong: chon.map((x) => ({ 'Mã': G.ma('GV'), 'Ngày': hn(), 'Đội': doi, 'Nguồn': x.nguon, 'Mã nguồn': x.ma, 'Nội dung': x.nd, 'Vị trí': x.vt || '', 'Người': [...st.chon[x.ma]].join(', '), 'Trạng thái': 'Chưa làm', 'Giờ giao': gio, 'Người giao': S.u.ten })) });
      if (!gv.length) await API.goi('ghiNhieu', { bang: 'NgayLamViec', thay: ['Ngày', 'Đội', 'Loại'], dong: [{ 'Ngày': hn(), 'Đội': doi, 'Loại': 'Bắt đầu ngày', 'Giờ': gio, 'Đúng hạn': gioNay() <= '07:30' ? 'Có' : 'Trễ', 'Số người': cm.length, 'Trạng thái': 'Đã gửi', 'Người ghi': S.u.ten }] });
      const zalo = `🌅 KẾ HOẠCH ${doi.toUpperCase()} ${G.ngayVN(hn())}\nCó mặt: ${cm.length}\n${chon.map((x, i) => `${i + 1}. ${x.nd}${x.vt ? ' (' + x.vt + ')' : ''} → ${[...st.chon[x.ma]].map((t) => t.split(' ').slice(-2).join(' ')).join(', ')}`).join('\n')}`;
      chon.forEach((x) => delete st.chon[x.ma]); st.them = st.them.filter((x) => !chon.includes(x));
      bao(`Đã gửi kế hoạch · ${chon.length} việc`); await G.guiZalo(zalo, '').catch(() => {});
      G.taiLai();
    }, e.target);
  } };
})();
