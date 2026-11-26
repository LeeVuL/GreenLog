/* GreenLog 0.4.8 · đợt sửa 27/11
   139 Hoàn tác: dải nhỏ trên cùng (css/v04.css), tự ẩn sau 6 giây
   141 xuất báo cáo có chọn lọc: chọn cột khi xuất (Excel / PDF), bộ lọc ở Báo cáo theo từng việc (v042-baocao.js)
   142 bấm vào bất kỳ dòng nào → thẻ chi tiết (ảnh, mọi thông tin) + 🕘 Lịch sử của đối tượng đó trên mọi bảng
   143 12 vị trí chỉ dùng cho phiếu giao việc (không vào việc định kỳ: ap = 'Không')
   144 nội dung lỗi của phiếu chia theo nhóm thực vật chính: cỏ, cây bụi, cây bóng mát, cây thủy sinh, cau bụi trong villa
   màn Thêm gọn theo vai trò: 6–8 ô hay dùng, phần còn lại gom vào "Tất cả chức năng" */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay } = G;
  const laAnh = () => G.laAnhVu && G.laAnhVu();

  /* ---------------------------------------------------------------- 143 · vị trí chỉ dùng cho phiếu ---------------------------------------------------------------- */
  const VT_PHIEU = [
    ['VT265', 'Vườn ươm', 'Vườn ươm', 'Vườn ươm cây nội thất'], ['VT266', 'Vườn ươm', 'Vườn ươm', 'Vườn ươm cây bụi'],
    ['VT267', 'Islander', 'Islander', 'Islander'],
    ['VT268', 'Ký túc xá', 'Ký túc xá', 'KTX khu vực bãi bóng chuyền'], ['VT269', 'Ký túc xá', 'Ký túc xá', 'KTX trước cổng'], ['VT270', 'Ký túc xá', 'Ký túc xá', 'KTX dãy Crowne'],
    ['VT271', 'Ký túc xá', 'Ký túc xá', 'KTX dãy Movenpick'], ['VT272', 'Ký túc xá', 'Ký túc xá', 'KTX sân chính'],
    ['VT273', 'Khu kỹ thuật cây xanh', 'Khu kỹ thuật cây xanh', 'Hầm bơm cây xanh'], ['VT274', 'Vị Garden', 'Vị Garden', 'Vị Garden'],
    ['VT275', 'Khu kỹ thuật cây xanh', 'Khu kỹ thuật cây xanh', 'Bãi rác cây xanh giai đoạn 2']];
  G.VT_PHIEU = VT_PHIEU;

  /* ---------------------------------------------------------------- 144 · nhóm lỗi theo nhóm thực vật ---------------------------------------------------------------- */
  const K = 'Khẩn cấp', C = 'Cao', TB = 'Trung bình';
  const LOI_48 = [
    ['Cỏ', [['Cỏ cao', TB], ['Mép cỏ chưa cắt viền', TB], ['Cỏ lấn lối đi, bó vỉa', TB], ['Cỏ dại lẫn', TB], ['Cỏ vàng, chết mảng', TB], ['Cỏ bị dẫm mòn, trơ đất', TB], ['Mặt cỏ lồi lõm, thiếu cát', TB], ['Nấm, đốm bệnh trên cỏ', TB], ['Cỏ cắt chưa dọn', TB]]],
    ['Cây bụi', [['Cành chìa ra lối đi', C], ['Cây bụi che đèn', TB], ['Cây bụi che biển hiệu, biển báo', TB], ['Cây bụi che camera', C], ['Cây che tầm nhìn đường xe', C], ['Cây bụi mất phom, cần cắt tỉa', TB], ['Cây khô, héo', TB], ['Cây chết chưa nhổ', TB], ['Hoa tàn, lá úa', TB], ['Bồn hoa trống, thiếu cây', TB], ['Cỏ dại trong bồn', TB], ['Sâu bệnh trên cây bụi', TB]]],
    ['Cây bóng mát', [['Cành chìa ra lối đi, đường xe', C], ['Cành che đèn', TB], ['Cành che biển hiệu, biển báo', TB], ['Cành che camera', C], ['Cành chạm dây điện, mái nhà', K], ['Cành khô, cành gãy treo', K], ['Cây nghiêng, đổ', K], ['Trái dừa hoặc tàu khô nguy cơ rơi', K], ['Rễ nổi gây vấp, nứt lối đi', C], ['Tán quá rậm', TB], ['Chồi gốc', TB], ['Cọc chống lỏng, hỏng', TB], ['Cây phụ sinh bám', TB], ['Sâu bệnh trên cây bóng mát', TB]]],
    ['Cây thủy sinh', [['Chăm sóc cây thủy sinh', TB], ['Hồ thủy sinh có rong, rêu', TB], ['Cây thủy sinh mọc lấn, quá dày', TB], ['Lá vàng, thối nhũn', TB], ['Rác, lá rụng trên mặt hồ', TB]]],
    ['Cau bụi trong villa', [['Chăm sóc cây bên trong villa', C], ['Tàu cau chìa ra lối đi', TB], ['Tàu cau che đèn', TB], ['Tàu cau che cửa sổ, tầm nhìn', TB], ['Tàu khô, lá vàng', TB], ['Bụi cau quá dày, cần tỉa thân', TB], ['Sâu bệnh trên cau', TB]]],
    ['An toàn khác', [['Tổ ong, kiến lửa', K], ['Gốc cây hoặc rễ gây vấp', K]]],
  ];
  /* nhóm cũ được thay bằng các nhóm trên; các nhóm còn lại (tưới, sâu bệnh, vệ sinh, cây nội thất, khác) giữ nguyên từ danh mục */
  const NHOM_THAY = /^(An toàn|Che chắn|Thảm cỏ|Cây bụi, bồn hoa|Cây bóng mát, dừa|Thủy sinh|Chăm sóc cây)$/;
  const lamDM = (dm) => {
    if (!dm || dm._v48) return dm;
    try {
      const vt = dm.vitri || (dm.vitri = []); const co = new Set(vt.map((v) => v.ma)); const coTen = new Set(vt.map((v) => v.ten));
      VT_PHIEU.forEach(([ma, cum, kv, ten]) => { if (!co.has(ma) && !coTen.has(ten)) vt.push({ ma, cum, kv, ten, ap: 'Không', chiPhieu: true }); });
      const cu = dm.loi || []; const moi = LOI_48.flatMap(([nhom, ds]) => ds.map(([ten, muc]) => ({ nhom, ten, muc }))); const ten48 = new Set(moi.map((l) => l.ten));
      const con = cu.filter((l) => !ten48.has(l.ten) && !NHOM_THAY.test(l.nhom || '')).map((l) => (l.nhom === 'Tưới' ? Object.assign({}, l, { nhom: 'Hệ thống tưới' }) : l));
      dm.loi = moi.concat(con.filter((l) => l.nhom !== 'Khác'), con.filter((l) => l.nhom === 'Khác'));
      dm._v48 = true;
    } catch (e) { console.warn(e); }
    return dm;
  };
  const goi0 = API.goi;
  API.goi = async function (act, ...a) { const r = await goi0.call(this, act, ...a); if (act === 'khoiDong') lamDM(r); return r; };
  if (S.dm) lamDM(S.dm);

  /* ---------------------------------------------------------------- 141 · chọn cột khi xuất ---------------------------------------------------------------- */
  const xc0 = G.xuatChon;
  G.xuatChon = (o) => {
    if (!o || !o.cot || !o.dong || o.cot.length < 3) return xc0(o);
    const LS = API.LS; const khoa = 'xuat_cot_' + String(o.ten || '').replace(/_\d{4}-\d{2}-\d{2}.*$/, '');
    const bo = new Set(LS.get(khoa, []));
    G.hop('⬇ Xuất dữ liệu', `<p class="mo" style="margin-top:0">${esc(o.tieuDe || o.ten)} · ${o.dong.length} dòng</p>
      <details class="the" style="margin-bottom:10px"><summary><b>Chọn cột cần xuất</b> <span class="mo" id="xcDem"></span></summary>
        <div class="nhom-nut" style="margin:8px 0"><button type="button" class="nut nho" id="xcHet">Chọn hết</button><button type="button" class="nut nho" id="xcBo">Bỏ hết</button></div>
        <div class="xc-cot">${o.cot.map((c, i) => `<label class="hang" style="gap:8px"><input type="checkbox" data-c="${i}" ${bo.has(c) ? '' : 'checked'}> ${esc(c)}</label>`).join('')}</div></details>
      <div class="xuat-chon"><button class="nut rong" data-x="xlsx">📊 Excel (.xlsx)<small>Bảng đầy đủ, lọc và tính được</small></button>
      <button class="nut rong" data-x="pdf">📄 PDF (in A4)<small>Trình bày gọn để gửi, in, trình sếp</small></button>
      ${o.anh && o.anh.length ? `<button class="nut rong" data-x="zip">🖼 Ảnh (.zip)<small>${o.anh.length} ảnh, đặt tên theo nội dung</small></button>` : ''}</div>`, (h, dong) => {
      const hop = [...h.querySelectorAll('[data-c]')]; const dem = () => { h.querySelector('#xcDem').textContent = `(${hop.filter((x) => x.checked).length}/${hop.length} cột)`; }; dem();
      hop.forEach((x) => { x.onchange = dem; });
      h.querySelector('#xcHet').onclick = () => { hop.forEach((x) => { x.checked = true; }); dem(); };
      h.querySelector('#xcBo').onclick = () => { hop.forEach((x) => { x.checked = false; }); dem(); };
      h.querySelectorAll('[data-x]').forEach((b) => { b.onclick = () => G.chay(async () => {
        const giu = hop.filter((x) => x.checked).map((x) => +x.dataset.c); if (!giu.length && b.dataset.x !== 'zip') throw new Error('Chọn ít nhất 1 cột');
        LS.set(khoa, o.cot.filter((_, i) => !giu.includes(i)));
        const cot = giu.map((i) => o.cot[i]); const dg = o.dong.map((r) => giu.map((i) => r[i]));
        if (b.dataset.x === 'xlsx') await G.xlsx(o.ten, [{ ten: o.tieuDe || o.ten, hang: [cot].concat(dg) }].concat(o.sheets || []));
        else if (b.dataset.x === 'pdf') G.inA4(o.tieuDe || o.ten, `${o.tom || ''}<table class="bang"><tr>${cot.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>${dg.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`);
        else { const n = await G.zipAnh(o.ten + '_anh', o.anh); G.bao(`Đã tải ${n}/${o.anh.length} ảnh`); }
        dong(); }, b); });
    });
  };

  /* ---------------------------------------------------------------- 142 · thẻ chi tiết + lịch sử ở mọi nơi ---------------------------------------------------------------- */
  const COT_NGAY = ['Ngày', 'Ngày giờ', 'Giờ tạo', 'Giờ', 'Ngày phát hiện', 'Ngày trồng', 'Thời gian', 'Ngày báo', 'Ngày tạo', 'Ngày giao', 'Ngày KH'];
  const ngayDong = (r) => String(COT_NGAY.map((k) => r[k]).find((v) => v) || '');
  const KHOA = ['Mã DC', 'Mã VT', 'Mã phiếu', 'Mã DH', 'Mã BT', 'Mã DA', 'Mã SK', 'Mã CN', 'Mã vị trí', 'Mã điểm', 'Máy', 'Tên cây', 'Tên VT', 'Tên', 'Họ tên', 'Người giữ', 'Vườn'];
  const tenGiaTri = (k, v) => (k === 'Mã vị trí' && G.tenVT ? G.tenVT(v) : String(v));
  const tenBang = (b) => ((G._BANG_XEM || []).find((x) => x[0] === b) || [, b])[1];
  /* thẻ chi tiết một dòng bất kỳ: ảnh trước, rồi mọi thông tin, rồi nút lịch sử */
  G.chiTietDong = (tieu, r, bang) => {
    const ks = Object.keys(r).filter((k) => !/^_/.test(k) && r[k] !== '' && r[k] != null);
    const anhK = ks.filter((k) => /Ảnh|Hóa đơn/.test(k)); const anh = anhK.map((k) => (API.dsAnh(r[k]).length ? `<div><small class="mo">${esc(k)}</small>${G.xemAnh(r[k])}</div>` : '')).join('');
    G.hop(tieu || tenBang(bang), `${anh || '<p class="mo" style="margin-top:0">Không có ảnh.</p>'}
      <table class="bang">${ks.filter((k) => !anhK.includes(k)).map((k) => `<tr><td class="mo" style="width:38%">${esc(k)}</td><td>${esc(Array.isArray(r[k]) ? r[k].join(', ') : tenGiaTri(k, r[k]))}</td></tr>`).join('')}</table>
      <div class="nhom-nut" style="margin-top:10px"><button class="nut chinh" data-ls="1">🕘 Lịch sử</button>${r['Mã phiếu'] ? `<a class="nut" href="#/phieu/${encodeURIComponent(r['Mã phiếu'])}">Mở phiếu</a>` : ''}</div>`, (o) => { o.querySelector('[data-ls]').onclick = () => G.lichSuCua(r, bang); });
  };
  /* lịch sử: mọi lần ghi trên mọi bảng có cùng mã / tên / vị trí, mới nhất trước */
  G.lichSuCua = (r, bang) => chay(async () => {
    let khoa = null; let gt = null;
    let chiBang = false;
    if (typeof r === 'string') { gt = r.trim(); } else { khoa = KHOA.find((k) => r[k] !== '' && r[k] != null && String(r[k]).length >= 2);
      if (!khoa && bang) { khoa = ['Loại hàng', 'Loại việc', 'Loại', 'Nhóm', 'Đội', 'Vườn ươm', 'Buổi', 'Người ghi'].find((k) => r[k] !== '' && r[k] != null); chiBang = !!khoa; }
      gt = khoa ? String(r[khoa]) : ''; }
    if (!gt || gt.length < 2) { G.bao('Dòng này chưa có mã hoặc tên để tra lịch sử', true); return; }
    const ds = (G._BANG_XEM || []).filter((x) => (!G._duocXem || G._duocXem(x[0])) && (!chiBang || x[0] === bang));
    const x = await G.docNhieu(ds.map((b) => ({ bang: b[0], gioiHan: 3000 })));
    const thap = gt.toLowerCase(); const vtTen = khoa === 'Mã vị trí' && G.tenVT ? G.tenVT(gt).toLowerCase() : '';
    const kq = []; ds.forEach((b) => (x[b[0]] || []).forEach((y) => {
      const hop_ = chiBang ? String(y[khoa]) === gt : khoa ? Object.values(y).some((v) => String(v) === gt || (khoa === 'Mã vị trí' && String(v).split('|').includes(gt))) : Object.values(y).some((v) => String(v).toLowerCase().includes(thap));
      if (hop_ || (vtTen && Object.values(y).some((v) => String(v).toLowerCase() === vtTen))) kq.push({ b: b[0], y }); }));
    kq.sort((a, c) => (ngayDong(a.y) < ngayDong(c.y) ? 1 : -1));
    const ten = (chiBang ? tenBang(bang) + ' · ' : '') + (khoa ? tenGiaTri(khoa, gt) : gt);
    G.hop('🕘 Lịch sử · ' + ten, kq.length ? `<p class="mo" style="margin-top:0">${kq.length} lần ghi${kq.length > 150 ? ' · hiện 150 lần mới nhất' : ''} · bấm từng dòng để xem đủ, xem ảnh</p><div class="ds">${kq.slice(0, 150).map((z, i) => {
      const tom = Object.keys(z.y).filter((k) => !/^_|^Ảnh|^Mã|Giờ ghi|Người ghi|Hóa đơn/.test(k) && z.y[k] !== '' && z.y[k] != null && !COT_NGAY.includes(k)).slice(0, 3).map((k) => tenGiaTri(k, z.y[k])).join(' · ');
      const nAnh = Object.keys(z.y).filter((k) => /Ảnh|Hóa đơn/.test(k)).reduce((a, k) => a + API.dsAnh(z.y[k]).length, 0);
      return `<button type="button" class="muc" data-i="${i}" style="text-align:left"><span class="gian"><b>${esc(tenBang(z.b))}</b> · ${esc(String(tom).slice(0, 80))}<span class="mo" style="display:block">${esc(G.ngayVN(ngayDong(z.y).slice(0, 10)))} ${esc(ngayDong(z.y).slice(11, 16))}${z.y['Người ghi'] || z.y['Người'] ? ' · ' + esc(String(z.y['Người ghi'] || z.y['Người']).split(' ').pop()) : ''}${nAnh ? ' · 📷 ' + nAnh : ''}</span></span>›</button>`; }).join('')}</div>`
      : G.trong('Chưa có lần ghi nào khác.'), (o) => { o.querySelectorAll('[data-i]').forEach((bt) => { bt.onclick = () => { const z = kq[+bt.dataset.i]; G.chiTietDong(tenBang(z.b), z.y, z.b); }; }); });
  });
  /* dòng danh sách chưa có thao tác riêng (không nút, không link): bấm vào → thẻ chi tiết từ nội dung dòng + lịch sử */
  const MA_RE = /\b((?:DC|VT|PH|DH|BT|GD|DA|SK|CN|KT|PS|NK)-?\d{1,6}|Villa \d{1,2})\b/;
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.target.closest('a,button,input,select,textarea,label,summary,img,.tl-ds,.chon')) return;
    const el = e.target.closest('div.muc'); if (!el || !el.closest('#noiDung, .hop-than')) return;
    if (el.onclick || [...el.attributes].some((a) => a.name.startsWith('data-')) || el.querySelector('input,select,textarea,button,a') || el.closest('[data-ct],[data-r],[data-i],[data-vt]')) return;
    const b = el.querySelector('b'); const tieu = (b ? b.textContent : el.textContent).trim().replace(/\s+/g, ' '); if (!tieu) return;
    const anh = [...el.querySelectorAll('img')].map((i) => i.src);
    const dong = el.innerText.split('\n').map((s) => s.trim()).filter(Boolean);
    const ma = (el.innerText.match(MA_RE) || [])[1]; const h2 = el.closest('.hop') && el.closest('.hop').querySelector('.hop-dau h2'); const tu = ma || (h2 && h2.textContent.trim().length > 2 ? h2.textContent.trim().replace(/^[^\p{L}\d]+/u, '') : tieu.split(' · ')[0].replace(/[›⚠✓●◯🔴🟢]/gu, '').trim());
    G.hop(tieu.slice(0, 60), `${anh.length ? `<div>${anh.map((u) => `<img class="anh-xem" src="${esc(u)}" alt="" onclick="GL.phongAnh(this.src)">`).join('')}</div>` : ''}
      <table class="bang">${dong.map((s) => `<tr><td>${esc(s)}</td></tr>`).join('')}</table>
      <div class="nhom-nut" style="margin-top:10px"><button class="nut chinh" data-ls="1">🕘 Lịch sử “${esc(tu.slice(0, 30))}”</button></div>`, (o) => { o.querySelector('[data-ls]').onclick = () => G.lichSuCua(tu); });
  });
  /* gợi ý trực quan: dòng bấm được có con trỏ tay */
  const danDau = () => { document.querySelectorAll('#noiDung div.muc, .hop-than div.muc').forEach((el) => { if (el._v48) return; el._v48 = 1;
    if (!el.onclick && ![...el.attributes].some((a) => a.name.startsWith('data-')) && !el.querySelector('input,select,textarea,button,a') && !el.closest('.tl-ds')) el.classList.add('muc-xem'); }); };
  new MutationObserver(() => { clearTimeout(danDau._t); danDau._t = setTimeout(danDau, 120); }).observe(document.body, { childList: true, subtree: true });

  /* ---------------------------------------------------------------- màn Thêm gọn theo vai trò ---------------------------------------------------------------- */
  const HAY = {
    'Tổ trưởng': ['#/batdaungay', '#/chotngay', '#/_phieu', '#/pbthuoc', '#/pbgoc', '#/dichhai', '#/linkviec', '#/_diemdanh', '#/troly'],
    'Nhân viên nội bộ': ['#/noibo', '#/kho', '#/batthuong', '#/phatsinh', '#/dichhai', '#/_phieu', '#/sop', '#/troly'],
    'Quản lý nhà thầu': ['#/baocao', '#/bcviec', '#/hoso', '#/_diemdanh', '#/_phieu', '#/kehoach', '#/dulieu', '#/troly'],
  };
  const NHAN = { '#/batdaungay': ['🌅', 'Bắt đầu ngày'], '#/chotngay': ['🌇', 'Chốt ngày'], '#/noibo': ['🧹', 'Việc nội bộ'], '#/kho': ['📦', 'Kho & tài sản'], '#/bcviec': ['📊', 'Báo cáo theo từng việc'], '#/baocao': ['📈', 'Báo cáo'] };
  const lamThem = () => {
    if (!/^#\/them$/.test(location.hash) || !S.u || laAnh()) return; const m = document.getElementById('noiDung'); if (!m || m.querySelector('.them-hay')) return;
    const h2 = [...m.children].filter((x) => x.tagName === 'H2'); if (!h2.length) return;
    const ds = HAY[S.u.nhom] || HAY['Tổ trưởng'];
    const coSan = {}; m.querySelectorAll('.luoi-o a').forEach((a) => { coSan[a.getAttribute('href')] = a; });
    const o = ds.map((hr) => { const a = coSan[hr] || coSan[hr.replace('#/_', '#/')] || coSan[hr.replace('#/', '#/_')]; if (a) return `<a href="${esc(a.getAttribute('href'))}">${a.innerHTML}</a>`;
      const k = hr.replace('#/', '').replace(/^_/, ''); const n = NHAN[hr] || (G.man[k] && [G.man[k].bt || '•', G.man[k].ten]); return n && G.man[k] ? `<a href="${hr}"><span class="bt">${n[0]}</span>${esc(n[1])}</a>` : ''; }).filter(Boolean).slice(0, 8);
    const tat = G.h('<details class="them-tatca"><summary>Tất cả chức năng</summary><div class="tc-than"></div></details>');
    const than = tat.querySelector('.tc-than'); let n = 0;
    h2.forEach((x) => { const luoi = x.nextElementSibling; than.appendChild(x); if (luoi && luoi.classList.contains('luoi-o')) { n += luoi.querySelectorAll('a').length; than.appendChild(luoi); } });
    tat.querySelector('summary').textContent = `Tất cả chức năng (${n}) ▾`;
    const dau = m.querySelector('.the-tk'); const hay = G.h(`<div class="them-hay"><h2>Việc của tôi</h2><div class="luoi-o luoi-to">${o.join('')}</div></div>`);
    if (dau) { dau.after(hay); hay.after(tat); } else { m.prepend(tat); m.prepend(hay); }
  };
  const kh = G.khung; G.khung = function (...a) { const m = kh.apply(this, a); if (/^#\/them$/.test(location.hash)) { setTimeout(lamThem, 60); setTimeout(lamThem, 400); } return m; };
  window.addEventListener('hashchange', () => { if (/^#\/them$/.test(location.hash)) setTimeout(lamThem, 500); });
})();
