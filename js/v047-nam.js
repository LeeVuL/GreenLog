/* GreenLog 0.4.7 · Chốt năm kỳ công (PQC – MVP)
   - Kỳ công bình thường 20 → 19; ngày 31/12 tất toán công của năm; năm mới bắt đầu kỳ từ 01/01, sau đó lại 20 → 19.
   - Kỳ vắt qua năm (20/12 → 19/01) tách 2 phần: A 20–31/12 (năm cũ, 5 công giám sát) · B 01–19/01 (năm mới, 7 công giám sát).
     Báo cáo công việc, nghiệm thu tháng 01 vẫn chung một bộ 20/12 → 19/01; chỉ số công tách riêng.
   - Năm tính chênh lệch = 01/01 → 31/12 theo lịch. Kỳ trước khi dùng app: nhập số từ file bảng công cũ (CongKyLichSu).
   - Bấm "Chốt năm" ngày 31/12: khóa điểm danh năm đó; muốn sửa phải mở lại, ghi lý do, lưu vết. */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay, bao } = G;
  const hn = () => API.ngay(); const num = (v) => +String(v == null ? '' : v).replace(',', '.') || 0;
  const so = (n) => G.so(Math.round((+n || 0) * 10) / 10, 1);
  const laAnh = () => G.laAnhVu && G.laAnhVu();
  const z = (n) => String(n).padStart(2, '0');

  /* các phần kỳ công của một năm: [tên, từ, đến, công giám sát] */
  G.kyCongNam = (y) => { y = +y; const out = [[`Kỳ 01/${y} (phần năm ${y})`, `${y}-01-01`, `${y}-01-19`, 7, `T01.${y}`, 'B']];
    for (let m = 2; m <= 12; m++) out.push([`Kỳ ${z(m)}/${y}`, `${y}-${z(m - 1)}-20`, `${y}-${z(m)}-19`, 12, `T${z(m)}.${y}`, '']);
    out.push([`Kỳ 01/${y + 1} (phần năm ${y})`, `${y}-12-20`, `${y}-12-31`, 5, `T01.${y + 1}`, 'A']);
    return out.map(([ten, tu, den, gs, ky, phan]) => ({ ten, tu, den, gs, ky, phan })); };
  const congHD = (tu, den) => { let t = 0; for (let d = tu; d <= den; d = G.congNgay(d, 1)) t += G.congHD(d); return t; };
  G.tinhNamCong = async (y) => {
    const ds = G.kyCongNam(y); const [ls, dd] = await Promise.all([G.doc('CongKyLichSu', { 'Năm': String(y) }).catch(() => []), G.doc('DiemDanh', { 'Ngày': { tu: `${y}-01-01`, den: `${y}-12-31` } }).catch(() => [])]);
    const den = hn() < `${y}-12-31` ? hn() : `${y}-12-31`;
    return ds.map((k) => { const cu = ls.find((r) => r['Từ'] === k.tu && r['Đến'] === k.den); const dk = k.den < den ? k.den : den; const chua = k.tu > den;
      const ddK = dd.filter((r) => r['Ngày'] >= k.tu && r['Ngày'] <= k.den); const app = ddK.reduce((a, r) => a + num(r['Công']), 0);
      const hd = chua ? 0 : congHD(k.tu, dk) + (k.den <= den ? k.gs : Math.round(k.gs * (congHD(k.tu, dk) / congHD(k.tu, k.den)) * 10) / 10);
      const tt = cu ? num(cu['Công thực tế']) : app; const hd2 = cu && num(cu['Công hợp đồng']) ? num(cu['Công hợp đồng']) : hd;
      return Object.assign({}, k, { nguon: cu ? 'File bảng công' : ddK.length ? 'App' : chua ? 'Chưa tới' : 'Chưa có số', tt, hd: hd2, chenh: chua ? 0 : tt - hd2, coSo: !!cu || !!ddK.length, chua, dangDo: !chua && k.den > den }); });
  };

  G.man.chotnam = { ten: 'Chốt năm kỳ công', bt: '📅', ic: 'lich', nhom: 'Quản trị', ph: 'homnay', an: true, fn: async (nam) => {
    const y = +(nam || (hn().slice(5) < '01-20' ? +hn().slice(0, 4) - 1 : hn().slice(0, 4)));
    const m = G.khung(`Chốt năm ${y} · kỳ công PQC`, 'Chênh lệch cả năm 01/01 → 31/12 · công thực tế so với công hợp đồng', '#/baocao');
    const [r, cn] = await Promise.all([G.tinhNamCong(y), G.doc('ChotNam', { 'Năm': String(y) }).catch(() => [])]); const da = cn.filter((x) => x['Trạng thái'] === 'Đã chốt').pop();
    const tong = r.filter((k) => k.coSo).reduce((a, k) => ({ tt: a.tt + k.tt, hd: a.hd + k.hd }), { tt: 0, hd: 0 }); const thieu = r.filter((k) => !k.chua && !k.coSo);
    m.innerHTML = `${da ? `<div class="the the-xanh"><b>🔒 Đã chốt năm ${y} lúc ${esc(String(da['Giờ chốt']).slice(0, 16))}</b><div class="mo">Chênh lệch ${so(da['Chênh lệch'])} công · điểm danh năm ${y} đã khóa</div></div>` : ''}
      <div class="luoi2"><div class="the"><small class="mo">Công thực tế cả năm</small><div class="so-lon">${so(tong.tt)}</div></div><div class="the"><small class="mo">Công hợp đồng (gồm giám sát)</small><div class="so-lon">${so(tong.hd)}</div></div></div>
      <div class="the"><b>Chênh lệch năm ${y}: <span style="color:${tong.tt - tong.hd < 0 ? 'var(--do)' : 'var(--xanh)'}">${so(tong.tt - tong.hd)} công</span></b><div class="mo">Chỉ cộng các kỳ đã có số. Cộng dồn từng kỳ: ngày dư bù ngày thiếu, như biên bản họp. Kỳ 20/12 → 19/01 tách đôi: 20–31/12 tính cho năm ${y} (5 công giám sát), 01–19/01 tính cho năm ${y + 1} (7 công giám sát).</div>
        ${thieu.length ? `<p style="color:var(--do);margin:6px 0 0">Còn ${thieu.length} kỳ chưa có số: ${thieu.map((k) => esc(k.ten)).join(', ')}. Nhập từ file bảng công cũ để số năm đủ.</p>` : ''}</div>
      <div class="the cuon-ngang"><table class="bang"><tr><th>Kỳ</th><th>Từ – đến</th><th>Thực tế</th><th>Hợp đồng</th><th>Giám sát</th><th>Chênh lệch</th><th>Nguồn</th>${laAnh() && !da ? '<th></th>' : ''}</tr>
        ${r.map((k, i) => `<tr style="${k.chua ? 'opacity:.45' : ''}"><td><b>${esc(k.ten)}</b>${k.dangDo ? ' <span class="chip cam">đang chạy</span>' : ''}</td><td>${G.ngayVN(k.tu).slice(0, 5)} – ${G.ngayVN(k.den).slice(0, 5)}</td><td>${k.coSo ? so(k.tt) : '—'}</td><td>${k.chua || !k.coSo ? '—' : so(k.hd)}</td><td>${k.gs}</td><td style="color:${k.chenh < 0 ? 'var(--do)' : 'var(--xanh)'}">${k.coSo ? so(k.chenh) : '—'}</td><td class="mo">${esc(k.nguon)}</td>${laAnh() && !da ? `<td><button class="nut nho" data-nhap="${i}">${k.nguon === 'File bảng công' ? 'Sửa' : 'Nhập số'}</button></td>` : ''}</tr>`).join('')}
        <tr><td colspan="2"><b>Cả năm ${y}</b></td><td><b>${so(tong.tt)}</b></td><td><b>${so(tong.hd)}</b></td><td>${r.reduce((a, k) => a + k.gs, 0)}</td><td><b>${so(tong.tt - tong.hd)}</b></td><td></td>${laAnh() && !da ? '<td></td>' : ''}</tr></table></div>
      <div class="nhom-nut"><button class="nut" id="tai">⬇ Tải Excel</button>${laAnh() && !da ? `<button class="nut chinh" id="chot" ${hn() >= `${y}-12-31` ? '' : 'disabled'}>🔒 Chốt năm ${y}${hn() >= `${y}-12-31` ? '' : ' (mở ngày 31/12)'}</button>` : ''}${laAnh() && da ? '<button class="nut" id="mo">Mở lại để sửa</button>' : ''}</div>
      <div class="chon" style="margin-top:12px">${[y - 1, y, y + 1].map((n) => `<a class="${n === y ? 'dang' : ''}" href="#/chotnam/${n}">Năm ${n}</a>`).join('')}</div>`;
    m.querySelector('#tai').onclick = () => G.taiCSV('ChotNam_' + y, [['Kỳ', 'Từ', 'Đến', 'Công thực tế', 'Công hợp đồng', 'Công giám sát', 'Chênh lệch', 'Nguồn']].concat(r.map((k) => [k.ten, k.tu, k.den, k.tt, k.hd, k.gs, k.chenh, k.nguon])).concat([['Cả năm ' + y, '', '', tong.tt, tong.hd, '', tong.tt - tong.hd, '']]));
    m.querySelectorAll('[data-nhap]').forEach((b) => { b.onclick = () => { const k = r[+b.dataset.nhap];
      G.hop('Số công · ' + k.ten, `<p class="mo" style="margin-top:0">${G.ngayVN(k.tu)} → ${G.ngayVN(k.den)} · lấy từ file bảng công đã nghiệm thu của kỳ này.</p><div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>`, (o, dong) => {
        const lay = G.form(o.querySelector('#f'), [{ k: 'tt', nhan: 'Công thực tế (cả kỳ)', loai: 'so', bb: true, gt: k.coSo ? k.tt : '' }, { k: 'hd', nhan: 'Công hợp đồng gồm giám sát (để trống: app tự tính)', loai: 'so', gt: '' }, { k: 'gc', nhan: 'Ghi chú, tên file', loai: 'chu' }]);
        o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghiNhieu', { bang: 'CongKyLichSu', thay: ['Năm', 'Từ', 'Đến'], dong: [{ 'Năm': String(y), 'Kỳ': k.ky, 'Phần': k.phan, 'Từ': k.tu, 'Đến': k.den, 'Công thực tế': v.tt, 'Công hợp đồng': v.hd || '', 'Công giám sát': k.gs, 'Chênh lệch': num(v.tt) - (num(v.hd) || k.hd), 'Nguồn': 'File bảng công', 'Ghi chú': v.gc || '', 'Người ghi': '', 'Giờ ghi': '' }] }); dong(); bao('Đã lưu số công ' + k.ten); G.taiLai(); }, e.target);
      }); }; });
    const c = m.querySelector('#chot'); if (c) c.onclick = async () => { if (thieu.length && !(await G.xacNhan(`Còn ${thieu.length} kỳ chưa có số. Vẫn chốt năm ${y}?`, 'Vẫn chốt'))) return; if (!(await G.xacNhan(`Chốt năm ${y}: chênh lệch ${so(tong.tt - tong.hd)} công. Sau khi chốt, điểm danh năm ${y} bị khóa.`, 'Chốt năm'))) return;
      chay(async () => { await API.goi('ghi', { bang: 'ChotNam', dong: { 'Năm': String(y), 'Từ': `${y}-01-01`, 'Đến': `${y}-12-31`, 'Công thực tế': tong.tt, 'Công hợp đồng': tong.hd, 'Chênh lệch': tong.tt - tong.hd, 'Trạng thái': 'Đã chốt', 'Người chốt': S.u.ten, 'Giờ chốt': API.bayGio(), 'Chi tiết': JSON.stringify(r.map((k) => [k.tu, k.den, k.tt, k.hd, k.gs])) } }); bao('Đã chốt năm ' + y); G.taiLai(); }, c); };
    const mo = m.querySelector('#mo'); if (mo) mo.onclick = async () => { const ly = await G.hoi('Lý do mở lại năm ' + y + ' để sửa'); if (!ly) return;
      chay(async () => { await API.goi('sua', { bang: 'ChotNam', khoa: { 'Năm': String(y), 'Trạng thái': 'Đã chốt' }, doi: { 'Trạng thái': 'Mở lại' }, lyDo: ly }); bao('Đã mở lại · nhớ chốt lại sau khi sửa'); G.taiLai(); }, mo); };
  } };
  /* khóa điểm danh của năm đã chốt (trừ khi mở lại) */
  let namChot = null; const layNamChot = async () => { if (namChot) return namChot; const r = await G.doc('ChotNam').catch(() => []); const o = {}; r.forEach((x) => { o[x['Năm']] = x['Trạng thái']; }); namChot = o; setTimeout(() => { namChot = null; }, 60000); return o; };
  const goi = API.goi;
  API.goi = async function (act, r, ...x) {
    if (/^diemDanh\.(gui|tuDiem|huyTuDiem|duyet)$/.test(act) || ((act === 'sua' || act === 'ghi' || act === 'ghiNhieu' || act === 'xoa') && r && /^(DiemDanh|DuyetCong)$/.test(r.bang))) {
      const ngay = (r && (r.ngay || (r.dong && (Array.isArray(r.dong) ? r.dong[0] : r.dong) || {})['Ngày'] || (r.khoa || {})['Ngày'])) || hn();
      if ((await layNamChot())[String(ngay).slice(0, 4)] === 'Đã chốt') throw new Error('Năm ' + String(ngay).slice(0, 4) + ' đã chốt kỳ công. Trưởng bộ phận mở lại ở Chốt năm nếu cần sửa.');
    }
    if (act === 'ghi' && r && r.bang === 'ChotNam') namChot = null;
    return goi.call(this, act, r, ...x);
  };

  /* Bảng công: kỳ vắt qua năm thì tách 2 phần; lũy kế lấy theo năm (không còn số cố định) */
  const bc0 = G.man.baocao && G.man.baocao.fn;
  if (bc0) G.man.baocao.fn = async (loai, ...a) => { await bc0(loai, ...a);
    const m = document.getElementById('noiDung'); if (!m) return;
    if (!loai && laAnh() && !m.querySelector('.vao-chotnam')) m.insertAdjacentHTML('beforeend', '<a class="the-viec vao-chotnam" href="#/chotnam"><span class="gian"><b>📅 Chốt năm kỳ công</b><span class="mo"> · chênh lệch cả năm, tách kỳ 20/12 → 19/01</span></span>›</a>');
    if (loai !== 'cong') return;
    const st = G.man.baocao.st || {}; const k = st.ky && st.ky !== S.dm.ky.ten ? (() => { const [mm, yy] = st.ky.slice(1).split('.').map(Number); return API.ky(`${yy}-${z(mm)}-01`); })() : S.dm.ky;
    const y = +k.tu.slice(0, 4);
    const p = [...m.querySelectorAll('p')].find((x) => /lũy kế/.test(x.textContent)); const nam = await G.tinhNamCong(y).catch(() => null);
    if (p && nam) { const tr = nam.filter((x) => x.den < k.tu || (x.tu >= k.tu && x.den <= k.den)); const lk = tr.reduce((a, x) => a + x.chenh, 0); p.innerHTML = p.innerHTML.replace(/ · lũy kế .*$/, ` · lũy kế năm ${y} đến kỳ này: <b>${so(lk)}</b> <a href="#/chotnam/${y}">xem</a>`); }
    if (k.tu.slice(0, 4) === k.den.slice(0, 4)) return;
    const a1 = await G.tinhCong(k.tu, `${k.tu.slice(0, 4)}-12-31`); const den = k.den < hn() ? k.den : hn(); const b1 = den >= `${k.den.slice(0, 4)}-01-01` ? await G.tinhCong(`${k.den.slice(0, 4)}-01-01`, den) : null;
    const dong = (ten, c, gs) => `<tr><td><b>${ten}</b></td><td>${so(c.tt)}</td><td>${so(c.hd)} + ${gs}</td><td style="color:${c.tt - c.hd - gs < 0 ? 'var(--do)' : 'var(--xanh)'}"><b>${so(c.tt - c.hd - gs)}</b></td></tr>`;
    const the = G.h(`<div class="the" style="border-left:4px solid var(--xanh)"><h2>Kỳ vắt qua năm · tách số công</h2><p class="mo" style="margin-top:0">Báo cáo công việc, nghiệm thu vẫn chung một bộ ${G.ngayVN(k.tu)} → ${G.ngayVN(k.den)}. Riêng số công tách đôi để tất toán năm ${k.tu.slice(0, 4)} ngày 31/12.</p>
      <table class="bang"><tr><th>Phần</th><th>Thực tế</th><th>Hợp đồng + giám sát</th><th>Chênh lệch</th></tr>${dong(`A · 20/12 → 31/12/${k.tu.slice(0, 4)} (năm ${k.tu.slice(0, 4)})`, a1, 5)}${b1 ? dong(`B · 01/01 → ${G.ngayVN(den).slice(0, 5)}/${k.den.slice(0, 4)} (năm ${k.den.slice(0, 4)})`, b1, 7) : `<tr><td><b>B · 01/01 → 19/01/${k.den.slice(0, 4)}</b></td><td colspan="3" class="mo">chưa tới</td></tr>`}
      <tr><td><b>Cả kỳ</b></td><td>${so(a1.tt + (b1 ? b1.tt : 0))}</td><td>${so(a1.hd + (b1 ? b1.hd : 0))} + 12</td><td><b>${so(a1.tt - a1.hd - 5 + (b1 ? b1.tt - b1.hd - 7 : 0))}</b></td></tr></table>
      <a class="nut nho" href="#/chotnam/${k.tu.slice(0, 4)}" style="margin-top:8px">📅 Chốt năm ${k.tu.slice(0, 4)}</a></div>`);
    const dau = m.querySelector('.the'); if (dau) dau.insertAdjacentElement('afterend', the); else m.prepend(the);
  };
})();
