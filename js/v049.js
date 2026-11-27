/* GreenLog 0.4.9 · đợt sửa 27/11 chiều
   150 hiện giờ lưu trong mọi danh sách ghi chép
   152 Kết thúc ca của nội bộ tạo ảnh tóm tắt gửi Zalo (điện thoại: chia sẻ; máy tính: sao chép ảnh / tải ảnh)
   157 Kế hoạch định kỳ tháng: tải file Excel mẫu → điền → tải lên, app kiểm tra và cho xem trước
   159 dọn các dòng bón gốc bị ghi trùng (chế độ chạy thử)
   162 Chốt ngày: danh sách người của từng việc rút gọn "20 người ›" */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay } = G;
  const hn = () => API.ngay(); const bao = (t, l) => G.bao(t, l);

  /* ---------------- 150 · giờ lưu hiện trong danh sách ---------------- */
  const gioCua = (r) => { const v = String(r['Giờ ghi'] || r['Giờ tạo'] || r['Thời điểm'] || r['Giờ'] || r['Ngày giờ'] || ''); const m = v.match(/(\d{2}:\d{2})/); return m ? m[1] : ''; };
  const ms0 = G.manSo;
  G.manSo = function (c) {
    if (c && typeof c.dong === 'function') { const d0 = c.dong; c = Object.assign({}, c, { dong: (r) => { const h = d0(r); const g = gioCua(r); if (!g || h.includes(g)) return h; return /<\/b>/.test(h) ? h.replace(/<\/b>/, ` · ${g}</b>`) : h + `<span class="mo"> · ${g}</span>`; } }); }
    return ms0.call(this, c);
  };

  /* ---------------- 159 · dọn dòng bón gốc trùng (chạy thử) ---------------- */
  try {
    if (API.thu && API.thu() && !API.LS.get('don_bongoc_049', false)) {
      const nk = API.LS.get('tb_NhatKyPhunBon', []); const ct = API.LS.get('tb_NhatKyPhunBonChiTiet', []);
      const bo = new Set(nk.filter((r) => /^Tự ghi khi xong/.test(r['Ghi chú'] || '') && nk.some((x) => x !== r && !/^Tự ghi khi xong/.test(x['Ghi chú'] || '') && x['Mã vị trí'] === r['Mã vị trí'] && String(x['Ngày giờ']).slice(0, 13) === String(r['Ngày giờ']).slice(0, 13))).map((r) => r['Mã NK']));
      if (bo.size) { API.LS.set('tb_NhatKyPhunBon', nk.filter((r) => !bo.has(r['Mã NK']))); API.LS.set('tb_NhatKyPhunBonChiTiet', ct.filter((r) => !bo.has(r['Mã NK']))); }
      API.LS.set('don_bongoc_049', true);
    }
  } catch (e) { console.warn(e); }

  /* ---------------- 162 · Chốt ngày: rút gọn danh sách người ---------------- */
  const rutGon = () => {
    if (!/^#\/chotngay/.test(location.hash)) return; const m = document.getElementById('noiDung'); if (!m) return;
    m.querySelectorAll('.dong-cham > .mo, .dong-cham .mo:first-of-type').forEach((el) => {
      if (el.dataset.rg) return; const t = el.textContent; const phan = t.split(' · '); const ng = phan[0].split(',').map((x) => x.trim()).filter(Boolean);
      if (ng.length < 4) return; el.dataset.rg = 1; const du = el.innerHTML;
      el.innerHTML = `<button type="button" class="nut nho" style="padding:2px 10px">👥 ${ng.length} người ›</button>${phan.length > 1 ? ' · ' + esc(phan.slice(1).join(' · ')) : ''}`;
      el.querySelector('button').onclick = () => { el.innerHTML = du; };
    });
  };
  new MutationObserver(() => { clearTimeout(rutGon._t); rutGon._t = setTimeout(rutGon, 80); }).observe(document.body, { childList: true, subtree: true });

  /* ---------------- 152 · ảnh tóm tắt Kết thúc ca (nội bộ) ---------------- */
  const taiAnh = (src) => new Promise((ok) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; setTimeout(() => ok(null), 6000); });
  const catDong = (x, t, w) => { const tu = String(t).split(' '); const out = []; let d = ''; tu.forEach((a) => { const th = d ? d + ' ' + a : a; if (x.measureText(th).width > w && d) { out.push(d); d = a; } else d = th; }); if (d) out.push(d); return out.slice(0, 3); };
  const F = (s, b) => `${b ? 700 : 500} ${s}px "Be Vietnam Pro", system-ui, sans-serif`;
  async function veAnhCa(o) {
    const W = 1080; const P = 48; const cv = document.createElement('canvas'); const x = cv.getContext('2d');
    const dong = o.dong.map((v) => { x.font = F(30, true); const l1 = catDong(x, v.ten, W - P * 2 - 240); x.font = F(24); const l2 = v.phu ? catDong(x, v.phu, W - P * 2 - 80) : []; return { v, l1, l2, h: 30 + l1.length * 40 + l2.length * 32 + 26 }; });
    const anh = (await Promise.all((o.anh || []).slice(0, 4).map((a) => taiAnh(API.anhUrl(a))))).filter(Boolean);
    const hAnh = anh.length ? (anh.length > 2 ? 2 : 1) * 330 + 20 : 0;
    const H = 230 + 120 + dong.reduce((a, d) => a + d.h, 0) + (dong.length ? 0 : 80) + (o.gc ? 90 : 0) + hAnh + 110;
    cv.width = W; cv.height = H; x.fillStyle = '#F3F5F1'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#14351F'; x.fillRect(0, 0, W, 220); x.fillStyle = '#C8E05A'; x.font = F(30, true); x.fillText('🌱 GreenLog · Cảnh quan Mövenpick Resort Waverly Phu Quoc', P, 64);
    x.fillStyle = '#FFFFFF'; x.font = F(52, true); x.fillText(o.tieuDe, P, 140);
    x.font = F(30); x.fillStyle = '#DDE8D8'; x.fillText(o.phu, P, 190);
    let y = 250;
    o.o3.forEach(([a, b], i) => { const w = (W - P * 2 - 40) / 3; const x0 = P + i * (w + 20); x.fillStyle = '#FFFFFF'; x.beginPath(); x.roundRect(x0, y, w, 90, 18); x.fill(); x.fillStyle = '#14351F'; x.font = F(40, true); x.fillText(a, x0 + 22, y + 52); x.fillStyle = '#5E6F63'; x.font = F(22); x.fillText(b, x0 + 22, y + 80); });
    y += 120;
    if (!dong.length) { x.fillStyle = '#5E6F63'; x.font = F(28); x.fillText('Chưa có việc nào.', P, y + 40); y += 80; }
    dong.forEach((d) => { const v = d.v; x.fillStyle = '#FFFFFF'; x.beginPath(); x.roundRect(P, y, W - P * 2, d.h - 10, 16); x.fill();
      const mau = v.tt === 'Xong' ? '#2E7D4F' : v.tt === 'Thêm' ? '#1F5E8C' : '#B3412F'; x.fillStyle = mau; x.font = F(30, true); x.fillText(v.tt === 'Xong' ? '✓' : v.tt === 'Thêm' ? '＋' : '✕', P + 20, y + 46);
      x.fillStyle = '#14261B'; d.l1.forEach((l, k) => { x.font = F(30, true); x.fillText(l, P + 64, y + 46 + k * 40); });
      x.fillStyle = '#5E6F63'; x.font = F(24); d.l2.forEach((l, k) => x.fillText(l, P + 64, y + 46 + d.l1.length * 40 + k * 32 - 6));
      const nhan = v.tt === 'Xong' ? 'Xong' : v.tt === 'Thêm' ? 'Làm thêm' : 'Còn sót'; x.font = F(24, true); const tw = x.measureText(nhan).width;
      x.fillStyle = v.tt === 'Xong' ? '#E3F1E6' : v.tt === 'Thêm' ? '#E2EEF7' : '#F6E0DC'; x.beginPath(); x.roundRect(W - P - tw - 46, y + 18, tw + 28, 40, 20); x.fill(); x.fillStyle = mau; x.fillText(nhan, W - P - tw - 32, y + 46);
      y += d.h; });
    if (o.gc) { x.fillStyle = '#5E6F63'; x.font = F(24); catDong(x, 'Ghi chú: ' + o.gc, W - P * 2).slice(0, 2).forEach((l, k) => x.fillText(l, P, y + 40 + k * 32)); y += 90; }
    if (anh.length) { y += 10; const c = anh.length === 1 ? 1 : 2; anh.forEach((i, k) => { const w = (W - P * 2 - (c - 1) * 20) / c; const x0 = P + (k % c) * (w + 20); const y0 = y + Math.floor(k / c) * 330; const r = Math.max(w / i.width, 310 / i.height); const sw = w / r, sh = 310 / r;
      x.save(); x.beginPath(); x.roundRect(x0, y0, w, 310, 16); x.clip(); try { x.drawImage(i, (i.width - sw) / 2, (i.height - sh) / 2, sw, sh, x0, y0, w, 310); } catch (e) { /* ảnh chặn đọc */ } x.restore(); }); }
    x.fillStyle = '#8A9A8E'; x.font = F(22); x.fillText('Gửi từ GreenLog · số liệu cập nhật đến lúc gửi', P, H - 46);
    return cv;
  }
  /* chia sẻ ảnh: điện thoại mở bảng chia sẻ (chọn Zalo); máy tính: sao chép ảnh rồi Ctrl+V vào Zalo, hoặc tải ảnh */
  G.chiaSeAnh = async (cv, tenFile, chu) => {
    let blob = await new Promise((ok) => { try { cv.toBlob((b) => ok(b), 'image/png'); } catch (e) { ok(null); } });
    if (!blob) throw new Error('Không tạo được ảnh');
    const file = new File([blob], tenFile, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && /Android|iPhone|iPad/i.test(navigator.userAgent)) { try { await navigator.share({ files: [file], title: 'GreenLog' }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    const url = URL.createObjectURL(blob);
    G.hop('📤 Gửi ảnh vào nhóm Zalo', `<img src="${url}" alt="" style="width:100%;border-radius:12px;border:1px solid var(--vien)">
      <p class="mo"><b>Trên máy tính:</b> bấm 📋 Sao chép ảnh, mở nhóm Zalo trên máy tính rồi bấm <b>Ctrl+V</b> (Mac: ⌘+V) để dán, bấm Gửi. Hoặc bấm ⬇ Tải ảnh rồi kéo ảnh vào Zalo.</p>
      <div class="nhom-nut">${navigator.canShare && navigator.canShare({ files: [file] }) ? '<button class="nut chinh" id="sh">📤 Chia sẻ (Zalo)</button>' : ''}<button class="nut ${navigator.canShare && navigator.canShare({ files: [file] }) ? '' : 'chinh'}" id="cp">📋 Sao chép ảnh</button><a class="nut" href="${url}" download="${esc(tenFile)}">⬇ Tải ảnh</a>${chu ? '<button class="nut" id="chu">Gửi dạng chữ</button>' : ''}</div>`, (o) => {
      o.querySelector('#cp').onclick = () => chay(async () => { if (!window.ClipboardItem || !navigator.clipboard) throw new Error('Trình duyệt này không chép ảnh được · bấm Tải ảnh'); await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); bao('Đã chép ảnh · mở Zalo bấm Ctrl+V'); }, o.querySelector('#cp'));
      const c = o.querySelector('#chu'); if (c) c.onclick = () => G.guiZalo(chu, '');
      const sh = o.querySelector('#sh'); if (sh) sh.onclick = () => navigator.share({ files: [file], title: 'GreenLog' }).catch(() => {});
    });
  };
  G.guiAnhCa = async (o) => {
    const ten = String(S.u.ten).split(' ').pop(); const gio = API.bayGio().slice(11, 16);
    let tt = {}; try { tt = await G.trangThaiHomNay(); } catch (e) { /* */ }
    const anh = [].concat(...o.daLam.map((x) => (tt[x.link] && G.anhCua ? G.anhCua(tt[x.link].ds) : []).map((a) => a.url || a))).filter(Boolean);
    const dong = o.daLam.map((x) => ({ ten: x.ten, phu: [x.kl, x.gio ? '✓ ' + x.gio : '', x.ai ? String(x.ai).split(' ').pop() : '', x.na ? '📷 ' + x.na : ''].filter(Boolean).join(' · '), tt: 'Xong' }))
      .concat(o.conSot.map((x) => ({ ten: x.viec, phu: ['Lý do: ' + (x.ly || '—'), x.xl || ''].filter(Boolean).join(' · '), tt: 'Sót' })))
      .concat((o.them || []).filter(Boolean).map((t) => ({ ten: t, phu: '', tt: 'Thêm' })));
    const cv = await veAnhCa({ tieuDe: 'KẾT THÚC CA · NỘI BỘ', phu: `${G.thu()}, ${G.ngayVN(hn())} · ${ten} · gửi lúc ${gio}`, o3: [[`${o.daLam.length}`, 'việc đã làm'], [`${o.conSot.length}`, 'việc còn sót'], [`${(o.them || []).length}`, 'việc làm thêm']], dong, gc: o.gc, anh });
    const chu = `🌇 KẾT THÚC CA ${G.ngayVN(hn())} · ${ten}\n✅ Đã làm: ${o.daLam.map((x) => x.ten + (x.kl ? ' (' + x.kl + ')' : '')).join(', ') || '—'}\n⏳ Còn sót: ${o.conSot.map((x) => x.viec + ' – ' + x.ly).join(', ') || 'không'}`;
    await G.chiaSeAnh(cv, `GreenLog_KetThucCa_${ten}_${hn()}.png`, chu);
  };

  /* ---------------- 157 · Kế hoạch định kỳ tháng bằng file Excel ---------------- */
  const VIEC_KH = () => (S.dm.dauviec || []).filter((v) => /^DV0[1-8]$/.test(v.ma));
  const CUM_KH = () => [...new Set((S.dm.vitri || []).filter((v) => v.ap === 'Có').map((v) => v.cum))];
  const DOI_KH = ['Đội cơ động', 'Đội khu vực'];
  const dvDoi = (v) => (/Cắt cỏ|Bón|Phun|Cắt tỉa cây bóng mát/.test(v.ten) ? 'Đội cơ động' : 'Đội khu vực');
  const ngayVN = (n) => (n ? G.ngayVN(n) : '');
  const docNgay = (v) => { if (v == null || v === '') return ''; if (typeof v === 'number' || /^\d{5}(\.\d+)?$/.test(String(v))) { const d = new Date(Math.round((+v - 25569) * 864e5)); return d.toISOString().slice(0, 10); }
    const s = String(v).trim(); let m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/); if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`; m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return m[0]; return 'SAI:' + s; };
  const bo = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/\s+/g, ' ').trim();
  /* đọc .xlsx (sheet đầu tiên) bằng JSZip có sẵn trong app */
  async function docXlsx(file) {
    if (!window.JSZip) throw new Error('Thiếu thư viện đọc file');
    const z = await window.JSZip.loadAsync(file); const xml = async (p) => { const f = z.file(p); return f ? new DOMParser().parseFromString(await f.async('string'), 'application/xml') : null; };
    const ss = await xml('xl/sharedStrings.xml'); const chuoi = ss ? [...ss.getElementsByTagName('si')].map((si) => [...si.getElementsByTagName('t')].map((t) => t.textContent).join('')) : [];
    const wb = await xml('xl/workbook.xml'); const rels = await xml('xl/_rels/workbook.xml.rels');
    const sh0 = wb.getElementsByTagName('sheet')[0]; const rid = sh0.getAttribute('r:id') || sh0.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
    const rel = [...rels.getElementsByTagName('Relationship')].find((r) => r.getAttribute('Id') === rid); let duong = rel ? rel.getAttribute('Target') : 'worksheets/sheet1.xml'; duong = duong.replace(/^\/?xl\//, ''); if (!duong.startsWith('xl/')) duong = 'xl/' + duong;
    const sh = await xml(duong); const cotSo = (ref) => { const c = ref.replace(/\d+/g, ''); let n = 0; for (const ch of c) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
    return [...sh.getElementsByTagName('row')].map((row) => { const r = []; [...row.getElementsByTagName('c')].forEach((c) => { const t = c.getAttribute('t'); const v = c.getElementsByTagName('v')[0]; const is = c.getElementsByTagName('is')[0];
      let val = t === 's' ? chuoi[+(v && v.textContent)] : t === 'inlineStr' ? (is ? [...is.getElementsByTagName('t')].map((x) => x.textContent).join('') : '') : v ? v.textContent : '';
      if (t !== 's' && t !== 'inlineStr' && t !== 'str' && val !== '' && !isNaN(+val)) val = +val; r[cotSo(c.getAttribute('r'))] = val; }); return r; });
  }
  async function taiMau(k, ds) {
    const hang = [['Việc', 'Cụm', 'Khu vực cụ thể (không bắt buộc)', 'Từ ngày (dd/mm/yyyy)', 'Đến ngày (dd/mm/yyyy)', 'Đội']];
    if (ds.length) ds.forEach((x) => hang.push([G.dvTen(x['Mã việc']), x['Cụm'], x['Khu vực'] || '', ngayVN(x['Từ ngày']), ngayVN(x['Đến ngày']), x['Đội'] || '']));
    else VIEC_KH().forEach((v) => CUM_KH().forEach((c) => hang.push([v.ten, c, '', '', '', dvDoi(v)])));
    const hd = [['HƯỚNG DẪN ĐIỀN KẾ HOẠCH ĐỊNH KỲ KỲ ' + k.ten], ['Kỳ từ ' + ngayVN(k.tu) + ' đến ' + ngayVN(k.den) + '. Ngày phải nằm trong kỳ.'], ['Mỗi dòng = 1 việc ở 1 cụm. Dòng nào không làm trong kỳ thì để trống ngày hoặc xóa dòng.'], ['Ngày ghi dạng 25/11/2026. Nếu chỉ làm 1 ngày thì Từ ngày = Đến ngày.'], ['Ghi tên Việc, Cụm, Đội đúng như danh sách dưới đây (viết hoa thường không sao).'], [''], ['VIỆC'], ...VIEC_KH().map((v) => [v.ten]), [''], ['CỤM'], ...CUM_KH().map((c) => [c]), [''], ['ĐỘI'], ...DOI_KH.map((d) => [d])];
    await G.xlsx(`GreenLog_KeHoachDinhKy_${k.ten}`, [{ ten: 'KeHoach', hang }, { ten: 'HuongDan', hang: hd }]);
  }
  function taiLen(k, ds) {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    inp.onchange = () => chay(async () => {
      const f = inp.files[0]; if (!f) return; const rows = await docXlsx(f); if (!rows.length) throw new Error('File trống');
      const vs = VIEC_KH(); const cs = CUM_KH(); const kq = [];
      rows.slice(1).forEach((r, i) => { if (!r || !r.some((x) => x !== '' && x != null)) return; const [viec, cum, kv, tu0, den0, doi0] = r; const loi = [];
        const v = vs.find((x) => bo(x.ten) === bo(viec) || x.ma === String(viec || '').trim().toUpperCase()); if (!v) loi.push('việc "' + (viec || '') + '" không có');
        const c = cs.find((x) => bo(x) === bo(cum)); if (!c) loi.push('cụm "' + (cum || '') + '" không có');
        const tu = docNgay(tu0); let den = docNgay(den0); if (!tu && !den) return; if (!den) den = tu;
        if (/^SAI:/.test(tu) || /^SAI:/.test(den)) loi.push('ngày ghi sai'); else { if (tu < k.tu || den > k.den) loi.push('ngày ngoài kỳ ' + k.ten); if (den < tu) loi.push('đến ngày trước từ ngày'); }
        const doi = DOI_KH.find((x) => bo(x) === bo(doi0)) || (v ? dvDoi(v) : '');
        const trung = v && c && ds.some((x) => x['Mã việc'] === v.ma && x['Cụm'] === c && x['Từ ngày'] === tu);
        kq.push({ dong: i + 2, v, c, kv: kv || '', tu, den, doi, loi, trung }); });
      if (!kq.length) throw new Error('File chưa có dòng nào điền ngày');
      const ok = kq.filter((x) => !x.loi.length && !x.trung);
      G.hop('Kiểm tra file kế hoạch', `<p class="mo" style="margin-top:0">${kq.length} dòng có ngày · <b>${ok.length} dòng sẽ lưu</b>${kq.some((x) => x.loi.length) ? ` · <b style="color:#B3261E">${kq.filter((x) => x.loi.length).length} dòng lỗi</b> (sửa trong file rồi tải lại)` : ''}${kq.some((x) => x.trung) ? ` · ${kq.filter((x) => x.trung).length} dòng đã có, bỏ qua` : ''}</p>
        <div class="cuon"><table class="bang"><tr><th>Dòng</th><th>Việc</th><th>Cụm</th><th>Ngày</th><th>Đội</th><th></th></tr>${kq.map((x) => `<tr style="${x.loi.length ? 'background:#FBE3E2' : x.trung ? 'opacity:.55' : ''}"><td>${x.dong}</td><td>${esc(x.v ? x.v.ten : '?')}</td><td>${esc(x.c || '?')}${x.kv ? ' · ' + esc(x.kv) : ''}</td><td>${/^SAI/.test(x.tu) ? esc(x.tu.slice(4)) : ngayVN(x.tu).slice(0, 5)}${x.den !== x.tu && !/^SAI/.test(x.den) ? '–' + ngayVN(x.den).slice(0, 5) : ''}</td><td>${esc(x.doi)}</td><td>${x.loi.length ? '⚠ ' + esc(x.loi.join('; ')) : x.trung ? 'đã có' : '✓'}</td></tr>`).join('')}</table></div>
        ${ok.length ? `<button class="nut chinh rong" id="luuF" style="margin-top:10px">Lưu ${ok.length} dòng vào kế hoạch kỳ ${esc(k.ten)}</button>` : ''}`, (o, dong) => {
        const l = o.querySelector('#luuF'); if (l) l.onclick = (e) => chay(async () => {
          await API.goi('ghiNhieu', { bang: 'KeHoachDinhKy', dong: ok.map((x) => ({ 'Mã KH': '', 'Kỳ': k.ten, 'Mã việc': x.v.ma, 'Cụm': x.c, 'Khu vực': x.kv, 'Từ ngày': x.tu, 'Đến ngày': x.den, 'Đội': x.doi, 'Trạng thái duyệt': 'Chờ duyệt', 'Người lập': '' })) });
          dong(); bao('Đã lưu ' + ok.length + ' dòng kế hoạch'); G.taiLai(); }, e.target);
      });
    }, null);
    inp.click();
  }
  const kh0 = G.man.khthang && G.man.khthang.fn;
  if (kh0) G.man.khthang.fn = async (...a) => {
    await kh0(...a); const m = document.getElementById('noiDung'); if (!m || G.q('kehoach') < 2) return;
    const k = S.dm.ky; const ds = (await G.doc('KeHoachDinhKy', undefined, 2000).catch(() => [])).filter((x) => x['Kỳ'] === k.ten);
    const nn = m.querySelector('.nhom-nut'); if (!nn || m.querySelector('#xlsMau')) return;
    nn.insertAdjacentHTML('afterend', `<div class="the" style="margin-bottom:10px"><b>📄 Lập kế hoạch cả tháng bằng Excel</b><div class="mo" style="margin:4px 0 8px">Tải file mẫu (đã có sẵn việc và cụm), điền ngày, rồi tải lên. App kiểm tra lỗi và cho xem trước khi lưu.</div>
      <div class="nhom-nut"><button class="nut" id="xlsMau">⬇ Tải file mẫu</button><button class="nut chinh" id="xlsLen">⬆ Tải file đã điền lên</button></div></div>`);
    m.querySelector('#xlsMau').onclick = (e) => chay(() => taiMau(k, ds), e.target);
    m.querySelector('#xlsLen').onclick = () => taiLen(k, ds);
  };
  G._v49 = { docXlsx, docNgay, veAnhCa };
})();
