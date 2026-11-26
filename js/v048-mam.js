/* GreenLog 0.4.8 · mục 140, 146: dạy thêm cho Mầm
   140 trả lời thẳng theo người, món hàng, máy, villa · "ai nghỉ" nêu tên · "ở đâu / thế nào" chỉ đúng màn + các bước
       "mượn / báo hỏng / điểm danh chiều / báo khó khăn / tạo phiếu" mở luôn biểu mẫu · thêm chủ đề: báo cáo GM, nhật ký thi công,
       thu hoạch, cây bất thường, tiền tự mua, nước tái sử dụng
   146 Mầm gọi đúng tên người đang đăng nhập (anh Thìn, anh Hiệp…), không gọi chung "anh chị"; đổi cách gọi trong Cài đặt */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q } = G; const LS = API.LS;
  const hn = () => API.ngay(); const thang = () => hn().slice(0, 7);
  const num = (v) => +String(v == null ? '' : v).replace(',', '.') || 0;
  const so = (n) => G.so(Math.round((+n || 0) * 10) / 10, 1);
  const tien = (n) => G.so(Math.round(+n || 0), 0) + ' đ';
  const laAnh = () => G.laAnhVu && G.laAnhVu(); const laNB = () => S.u && S.u.nhom === 'Nhân viên nội bộ';
  const bo = (s) => (G._tim && G._tim.bo ? G._tim.bo(s) : String(s || '').toLowerCase());
  const ngan0 = (t) => String(t || '').trim().split(' ').pop();
  const ngan = (t) => (((S.dm && S.dm.nguoi) || []).some((n) => n.ten === t && n.nhom === 'Trưởng bộ phận') ? 'Trưởng bộ phận' : ngan0(t));
  const TT_DD = 'Trạng thái (Có mặt/Vắng/Về sớm)';

  /* ------------------------------------------------ 146 · cách gọi người dùng ------------------------------------------------ */
  const DAI = ['anh', 'chị', 'em', 'cô', 'chú'];
  const en = () => G.lang && G.lang() === 'en';
  G.mamGoi = () => { if (!S.u) return 'anh chị'; if (en()) return 'you'; const d = LS.get('mam_xung', ''); const ten = ngan0(S.u.ten);
    const dai = DAI.includes(d) ? d : /\bThị\b/.test(S.u.ten) ? 'chị' : 'anh'; return dai + ' ' + ten; };
  const doiGoi = (s) => (typeof s === 'string' ? s.replace(/Anh chị/g, () => { const g = G.mamGoi(); return g.charAt(0).toUpperCase() + g.slice(1); }).replace(/anh chị/g, () => G.mamGoi()) : s);
  const doiKQ = (k) => { if (!k) return k; k.chu = doiGoi(k.chu); if (k.dong) k.dong = k.dong.map(doiGoi); if (k.hoi) k.hoi = k.hoi.map((h) => [doiGoi(h[0]), h[1]]); if (k.nut) k.nut = k.nut.map((n) => [doiGoi(n[0])].concat(n.slice(1))); return k; };
  const noi0 = G.mamNoi; if (noi0) G.mamNoi = (t) => noi0(doiGoi(String(t || '')));
  /* chữ đã hiện trong khung chat (lời chào, câu cũ) cũng đổi theo tên */
  const doiDOM = (goc) => { if (!goc) return;
    if (en()) { goc.querySelectorAll('.tl-hang.tl .tl-bong').forEach((b) => { if (/em là Mầm|Mầm 🌱/.test(b.textContent) && !b.dataset.en) { b.dataset.en = 1; const n = b.firstChild; if (n && n.nodeType === 3) n.nodeValue = `Hello ${laAnh() ? 'Landscape Manager' : ngan0(S.u.ten)}, I'm Mầm 🌱, the GreenLog assistant. Ask me anything in the app: what is not done yet, when it was last done, how much, where and how. Tap 🎤 to speak.`; } }); return; }
    const w = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (/anh chị/i.test(n.nodeValue)) n.nodeValue = doiGoi(n.nodeValue); if (S.u && /^Chào (Trưởng bộ phận|[^\s,]+),/.test(n.nodeValue) && n.parentElement && n.parentElement.closest('.tl-bong') && !n.nodeValue.startsWith('Chào ' + G.mamGoi())) n.nodeValue = n.nodeValue.replace(/^Chào (Trưởng bộ phận|[^\s,]+),/, 'Chào ' + G.mamGoi() + ','); }
    goc.querySelectorAll('textarea[placeholder]').forEach((x) => { x.placeholder = doiGoi(x.placeholder); }); };
  new MutationObserver(() => { if (/^#\/troly/.test(location.hash)) doiDOM(document.getElementById('noiDung')); }).observe(document.body, { childList: true, subtree: true, characterData: false });
  const cd0 = G.theCaiDat; const gan0 = G.ganCaiDat;
  if (cd0) G.theCaiDat = () => cd0().replace('Mầm</h2>', () => `Mầm</h2><div class="mo" style="margin-bottom:4px">Mầm gọi tôi là</div><div class="chon" id="mamXung" style="margin-bottom:10px">${[['', 'Tự động'], ...DAI.map((d) => [d, d])].map(([k, t]) => `<button type="button" data-x="${k}" class="${LS.get('mam_xung', '') === k ? 'dang' : ''}">${esc(en() ? (k ? t + ' ' + ngan0(S.u && S.u.ten) : 'Automatic') : k ? t + ' ' + ngan0(S.u && S.u.ten) : 'Tự động · ' + G.mamGoi())}</button>`).join('')}</div>`);
  if (gan0) G.ganCaiDat = (m) => { gan0(m); m.querySelectorAll('#mamXung [data-x]').forEach((b) => { b.onclick = () => { LS.set('mam_xung', b.dataset.x); m.querySelectorAll('#mamXung [data-x]').forEach((x) => x.classList.toggle('dang', x === b)); G.bao('Mầm sẽ gọi là “' + G.mamGoi() + '”'); }; }); };

  /* ------------------------------------------------ hành động mở biểu mẫu từ nút của Mầm ------------------------------------------------ */
  const choVaBam = (sel, lan = 0) => { const el = document.querySelector(sel); if (el) { el.click(); return; } if (lan < 25) setTimeout(() => choVaBam(sel, lan + 1), 200); };
  G.man.mamlam = { an: true, fn: async (loai, ...r) => {
    const x = r.map((s) => decodeURIComponent(s)).join('/');
    if (loai === 'dd') { G._ddBuoi = x || 'Sáng'; G._ddVe = '#/troly'; location.replace('#/diemdanh'); return; }
    if (loai === 'baohong') { location.replace('#/kho/may'); setTimeout(() => choVaBam(`[data-baohong="${CSS.escape(x)}"]`), 300); return; }
    location.replace('#/troly');
    setTimeout(() => { if (loai === 'khokhan' && G.baoKhoKhan) G.baoKhoKhan({ nguon: 'Mầm' }); else if (loai === 'taophieu' && G.taoPhieu) G.taoPhieu({}); else if (loai === 'gopy' && G.moGopY) G.moGopY(); }, 400);
  } };

  /* ------------------------------------------------ chỉ đường: "ở đâu / thế nào / cách" ------------------------------------------------ */
  const HOI_CACH = /\bo dau\b|the nao|\bcach\b|lam sao|huong dan|chi (toi|em|anh|chi|minh)|o cho nao|where|how/;
  const DUONG = [
    [/bao cao (gm|gui gm|thang gui|giam doc)|\bgm\b/, 'Báo cáo tháng gửi GM', '#/baocaogm', ['Thêm › Báo cáo › Báo cáo tháng gửi GM.', 'Chọn tháng (mặc định tháng trước), tick các phần cần đưa vào.', 'Gõ đề xuất hỗ trợ nếu có, bấm Xem trước rồi Tải PDF / gửi.'], () => laAnh() || q('baocao') >= 1],
    [/ket thuc ca|het ca|cuoi ca/, 'Kết thúc ca', '#/ketthucca', ['Màn Hôm nay › 🌇 Kết thúc ca.', 'App hiện việc đã làm và việc còn sót.', 'Chụp ảnh việc còn sót hoặc ghi lý do, bấm Gửi.']],
    [/chot ngay/, 'Chốt ngày', '#/chotngay', ['Màn Hôm nay › 🌇 Chốt ngày (hạn 17:30).', 'Xem lại việc của từng người, việc thêm tay phải có ảnh.', 'Việc làm dở chọn % đã làm, bấm Chốt ngày.']],
    [/bat dau ngay|dau ca|giao viec dau/, 'Bắt đầu ngày', '#/batdaungay', ['Màn Hôm nay › 🌅 Bắt đầu ngày (hạn 07:30).', 'Bước 1 điểm danh, bước 2 tick việc hôm nay và chạm chọn người.', 'Bấm Gửi kế hoạch.']],
    [/bao kho khan|kho khan/, 'Báo khó khăn', 'mamlam/khokhan', ['Bấm ⚠ trên đầu màn (hoặc nút bên dưới).', 'Ghi việc gặp khó, chụp ảnh nếu có, bấm Gửi ngay.', 'Trưởng bộ phận nhận ngay và đưa vào họp tuần.']],
    [/(tao|lam|mo) phieu|phieu giao viec/, 'Tạo phiếu giao việc', 'mamlam/taophieu', ['Bấm ＋ ở giữa thanh dưới › Phiếu giao việc (hoặc nút bên dưới).', 'Chọn nhóm cây → lỗi cụ thể, chọn vị trí, mức độ.', 'Chụp ảnh hiện trạng, chọn người làm, bấm Tạo phiếu.']],
    [/diem danh/, 'Điểm danh', '#/diemdanh', ['Màn Hôm nay › Bắt đầu ngày › Bước 1 Điểm danh.', 'Chỉ bấm người Vắng hoặc Về sớm, chụp ảnh tập thể.', 'Bấm Gửi Trưởng bộ phận duyệt.']],
    [/xuat (bao cao|du lieu|excel|file)|tai (bao cao|excel)|loc du lieu/, 'Xuất báo cáo, dữ liệu', '#/bcviec', ['Thêm › Báo cáo › Báo cáo theo từng việc, chọn việc.', 'Chọn kỳ, mở 🔎 Lọc chọn lọc để lọc theo người, đội, vị trí.', 'Bấm ⬇ Xuất báo cáo, chọn cột, chọn Excel / PDF / ảnh.']],
    [/nhat ky thi cong|so nhat ky/, 'Nhật ký thi công', '#/nhatky', ['Thêm › Báo cáo › Hồ sơ cuối kỳ › Nhật ký thi công.', 'Mỗi ngày đã chốt là một trang, có ảnh và chữ ký.', 'Bấm In / Tải PDF.'], () => laAnh() || q('baocao') >= 1],
    [/gop y|bao loi app/, 'Góp ý app', 'mamlam/gopy', ['Bấm 💡 trên đầu màn đang thấy khó dùng.', 'App tự chụp màn hình, gõ hoặc nói một dòng.', 'Bấm Gửi.']],
    [/hoan tac|bam nham|bam sai/, 'Hoàn tác khi bấm nhầm', '', ['Ngay sau khi lưu, dải nhỏ “Đã lưu ↶ Hoàn tác” hiện trên cùng màn hình 6 giây.', 'Bấm ↶ Hoàn tác để bỏ lần lưu vừa rồi.', 'Quá 6 giây thì báo tổ trưởng hoặc Trưởng bộ phận sửa.']],
    [/co chu|chu to|anh dai dien|doi ngon ngu|tieng anh/, 'Cài đặt', '#/them', ['Thêm › kéo xuống Cài đặt.', 'Chọn cỡ chữ Thường / To / Rất to, ngôn ngữ, giọng Mầm.', 'Ảnh đại diện: bấm Đổi ảnh đại diện ở thẻ trên cùng.']],
  ];
  const chiDuong = (t) => { if (!HOI_CACH.test(t)) return null; const d = DUONG.find((x) => x[0].test(t) && (!x[4] || x[4]())); if (!d) return null;
    return { chu: `${d[1]}: làm như sau`, dong: d[3].map((s, i) => `${i + 1}. ${s}`), nut: d[2] ? [[d[2].startsWith('mamlam') ? 'Làm ngay' : 'Mở ' + d[1], d[2].startsWith('#') ? d[2] : '#/' + d[2]]] : [] }; };

  /* ------------------------------------------------ trả lời thẳng theo người, món, máy, villa ------------------------------------------------ */
  const nguoiTrong = (t) => { if (/\b(toi|minh|em|tao)\b.*(dang giu|giu|cua)|(dang giu|giu).*\b(toi|minh)\b/.test(t)) return S.u.ten;
    const ds = ((S.dm && S.dm.nguoi) || []).concat((S.dm && S.dm.congnhan) || []).map((n) => n.ten).filter(Boolean);
    return ds.find((x) => new RegExp('\\b' + bo(ngan0(x)) + '\\b').test(t)) || null; };
  const soVilla = (t) => (t.match(/\bvilla (\d{1,2})\b/) || [])[1];
  const hetHanDC = (x) => { const g = x['Ngày giao'] || x['Ngày nhập']; const th = num(x['Hạn dùng (tháng)']); if (!g || !th) return null; const d = new Date(String(g).slice(0, 10)); d.setMonth(d.getMonth() + th); return API.ngay(d); };
  const MAYS = () => ((G._kho && G._kho.MAY) || ['Sand Man', 'H.Barber', 'Kubota']).map((m) => (typeof m === 'string' ? m : m.ten || m[0]));
  const mayTrong = (t) => mayRieng(t) || (/may sang|sang cat/.test(t) ? '?sang' : null);
  const SANG = () => MAYS().filter((m) => !/kubota/i.test(m));
  const mayRieng = (t) => MAYS().find((m) => t.includes(bo(m)) || (bo(m).includes('sand') && /sand ?man|sandman/.test(t)) || (bo(m).includes('barber') && /barber/.test(t)) || (bo(m).includes('kubota') && /kubota|may cay|xe cay/.test(t)));

  const Y48 = [
    /* ai nghỉ hôm nay → nêu tên */
    { k: (t) => /\b(ai|nguoi nao|nhung ai)\b.*\b(nghi|vang)\b|\b(nghi|vang)\b.*\bnhung ai\b|ai (khong|ko) di lam/.test(t), f: async () => {
      const [dd, nb] = await Promise.all([G.doc('DiemDanh', { 'Ngày': hn() }).catch(() => []), G.doc('NghiNoiBo', { 'Ngày': hn() }).catch(() => [])]);
      const vang = dd.filter((r) => /Vắng/.test(r[TT_DD] || '')); const som = dd.filter((r) => /Về sớm/.test(r[TT_DD] || ''));
      const dong = []; ['Sáng', 'Chiều'].forEach((b) => { const v = vang.filter((r) => (r['Buổi'] || 'Sáng') === b); if (v.length) dong.push(`${b} vắng ${v.length}: ${v.map((r) => ngan(r['Họ tên']) + (r['Lý do'] ? ' (' + r['Lý do'] + ')' : '')).join(', ')}`); });
      if (som.length) dong.push('Về sớm: ' + som.map((r) => ngan(r['Họ tên'])).join(', ')); if (nb.length) dong.push('Nội bộ nghỉ: ' + nb.map((r) => ngan(r['Người'])).join(', '));
      if (!dd.length && !nb.length) return { chu: 'Hôm nay chưa có điểm danh nào được gửi, nên Mầm chưa biết ai nghỉ.', nut: [['Mở điểm danh', '#/diemdanh']] };
      return dong.length ? { chu: 'Hôm nay có người nghỉ:', dong, nut: [['Mở điểm danh', '#/diemdanh']] } : { chu: `Hôm nay không ai nghỉ: ${new Set(dd.map((r) => r['Họ tên'])).size} người đã điểm danh có mặt. 👍` }; } },
    /* điểm danh sáng / chiều → mở luôn */
    { k: (t) => /^\s*(diem danh|cham cong)( buoi)? (sang|chieu)\s*$/.test(t) || /^\s*(toi |em )?(muon |can )?diem danh( buoi)? (sang|chieu)( ngay| luon)?\s*$/.test(t), f: async (t) => { const b = /chieu/.test(t) ? 'Chiều' : 'Sáng';
      return { chu: `Mở điểm danh buổi ${b.toLowerCase()}.${b === 'Chiều' && API.bayGio().slice(11, 16) < '13:00' ? ' Lưu ý: buổi chiều mở từ 13:00.' : ''}`, nut: [['Điểm danh ' + b.toLowerCase(), '#/mamlam/dd/' + b]] }; } },
    /* villa N tưới chưa */
    { k: (t) => soVilla(t) && /\btuoi\b/.test(t), f: async (t) => { const n = +soVilla(t); const vt = (S.dm.vitri || []).filter((v) => v.kv === 'Villa ' + n);
      if (!vt.length) return { chu: `Mầm không thấy Villa ${n} trong danh mục vị trí.` };
      const d = await G.doc('Tuoi', { 'Ngày': hn() }).catch(() => []); const mua = d.some((r) => /mưa/i.test(r['Trạng thái'] || ''));
      if (mua) return { chu: `☔ Hôm nay đã bấm trời mưa, Villa ${n} không cần tưới.` };
      const tt = vt.map((v) => { const r = d.find((x) => x['Mã vị trí'] === v.ma); return [v, r ? r['Trạng thái'] : '']; }); const chua = tt.filter(([, s]) => !s || /Chưa/.test(s));
      return { chu: chua.length ? `Villa ${n} hôm nay còn ${chua.length}/${vt.length} mặt chưa ghi tưới.` : `Villa ${n} hôm nay đã tưới đủ ${vt.length} mặt. 👍`, dong: tt.map(([v, s]) => `${G.mat ? G.mat(v.ten) : v.ten}: ${s || 'chưa ghi'}`), nut: [['Mở Tưới nước', '#/tuoi']] }; } },
    /* kho còn bao nhiêu <món> */
    { k: (t) => (/\bkho\b|\bton\b|con (lai )?bao nhieu|con (khong|ko)|het chua/.test(t)) && !/kho khan|vi tri|cho nao|chua (phun|cat|bon|tuoi|lam|tia|nho|ve sinh)|tien do|gio\b|\bngay\b.*con/.test(t) && q('noibo') >= 1, f: async (t) => {
      if (!G._kho || !G._kho.taiKho) return null; const k = await G._kho.taiKho(); const tt = ' ' + t + ' ';
      const kq = k.vt.map((v) => { const tu = bo(v['Tên']).split(' ').filter((w) => w.length > 1); const d = tu.filter((w) => tt.includes(' ' + w + ' ')).length; return { v, d: d / Math.max(1, tu.length), n: d }; }).filter((x) => x.n >= 1).sort((a, b) => b.d - a.d);
      const STOP = new Set('tai san vat tu kho con lai bao nhieu ton het may khong ko chua trong thang nay hom nay cai la va gi mon loai the nao a oi nhe'.split(' '));
      const nd = t.trim().split(' ').filter((w) => w.length > 1 && !STOP.has(w)); const tatCa = new Set(k.vt.flatMap((v) => bo(v['Tên']).split(' ')));
      const la = nd.filter((w) => !tatCa.has(w));
      if (!kq.length && !nd.length) return null;
      if (la.length && (!kq.length || kq[0].d < 1)) { const gan = kq.slice(0, 5).map((x) => x.v);
        return { chu: `Kho chưa có “${la.join(' ')}”${gan.length ? '. Các món gần giống đang có:' : '.'}`, dong: gan.map((v) => `${v['Tên']}: còn ${so(G._kho.ton(k.gd, v['Mã VT']))} ${v['ĐVT']}`), nut: [['Mở kho vật tư', '#/kho/vattu']] }; }
      if (!kq.length) return null; const best = kq.filter((x) => x.d === kq[0].d).slice(0, 4);
      return { chu: best.length === 1 ? '' : 'Trong kho:', dong: best.map(({ v }) => { const c = G._kho.ton(k.gd, v['Mã VT']); return `${v['Tên']}: còn ${so(c)} ${v['ĐVT']}${c <= num(v['Tồn tối thiểu']) ? ' ⚠ dưới mức tối thiểu ' + so(v['Tồn tối thiểu']) : ''}`; }), nut: [['Mở kho vật tư', '#/kho/vattu']] }; } },
    /* dụng cụ hết hạn */
    { k: (t) => /dung cu.*(het han|sap het han|can doi|mon)|(het han|can doi).*dung cu/.test(t) && (q('noibo') >= 1 || laAnh()), f: async () => {
      const d = (await G.doc('DungCu', undefined, 3000).catch(() => [])).filter((x) => x['Người giữ'] && !/Thanh lý|^Mất$/.test(x['Trạng thái'] || '') && (!laNB() || x['Người giữ'] === S.u.ten));
      const h = d.map((x) => [x, hetHanDC(x)]).filter(([, n]) => n && n <= G.congNgay(hn(), 30)).sort((a, b) => (a[1] < b[1] ? -1 : 1));
      return h.length ? { chu: `Có ${h.length} dụng cụ hết hạn hoặc sắp hết hạn (30 ngày tới):`, dong: h.map(([x, n]) => `${x['Mã DC']} ${x['Tên']} · ${ngan(x['Người giữ'])} · ${n < hn() ? 'đã hết ' + G.ngayVN(n) : 'hết ' + G.ngayVN(n)}`), nut: [['Mở dụng cụ', '#/kho/dungcu']] } : { chu: 'Không có dụng cụ nào hết hạn trong 30 ngày tới. 👍' }; } },
    /* ai đang giữ dụng cụ gì */
    { k: (t) => /(dang giu|giu nhung|giu gi|giu dung cu)|dung cu (cua|ma) .* (giu|co)/.test(t) && (q('noibo') >= 1 || laAnh()), f: async (t) => {
      const ai = nguoiTrong(t) || (laNB() ? S.u.ten : null); const d = await G.doc('DungCu', undefined, 3000).catch(() => []);
      if (!ai) { const g = {}; d.filter((x) => x['Người giữ'] && x['Loại'] !== 'Chung').forEach((x) => { (g[x['Người giữ']] = g[x['Người giữ']] || []).push(x['Tên']); });
        return { chu: 'Dụng cụ đang cấp cho từng người:', dong: Object.entries(g).map(([n, ds]) => `${ngan(n)}: ${ds.join(', ')}`), nut: [['Mở dụng cụ', '#/kho/dungcu']] }; }
      const r = d.filter((x) => x['Người giữ'] === ai && x['Loại'] !== 'Chung' && !/Thanh lý|^Mất$/.test(x['Trạng thái'] || ''));
      const ten = ai === S.u.ten ? (doiGoi('anh chị').charAt(0).toUpperCase() + doiGoi('anh chị').slice(1)) : ngan(ai);
      return r.length ? { chu: `${ten} đang giữ ${r.length} món:`, dong: r.map((x) => `${x['Mã DC']} · ${x['Tên']}${hetHanDC(x) && hetHanDC(x) < hn() ? ' · ⚠ hết hạn dùng' : ''}${/^Báo/.test(x['Trạng thái'] || '') ? ' · ' + x['Trạng thái'] : ''}`), nut: [['Mở dụng cụ', '#/kho/dungcu']] } : { chu: `${ten} chưa được cấp dụng cụ nào.` }; } },
    /* mượn <món> */
    { k: (t) => /\bmuon\b/.test(t) && !/\bmuon (biet|hoi|xem|tao|lam|bao)\b/.test(t) && q('noibo') >= 1, f: async (t) => {
      const [dc, mu] = await Promise.all([G.doc('DungCu', undefined, 3000).catch(() => []), G.doc('DungCuMuon', undefined, 3000).catch(() => [])]); const chung = dc.filter((x) => x['Loại'] === 'Chung');
      const tt = ' ' + t + ' '; const m = chung.filter((x) => bo(x['Tên']).split(' ').some((w) => w.length > 2 && tt.includes(' ' + w + ' ')));
      if (!m.length) return { chu: 'Đồ dùng chung để mượn:', dong: chung.map((x) => x['Tên']), nut: [['Mở để mượn', '#/kho/dungcu']] };
      return { chu: 'Đồ dùng chung:', dong: m.map((x) => { const r = mu.find((y) => y['Mã DC'] === x['Mã DC'] && !y['Giờ trả']); return `${x['Tên']}: ${r ? '🔴 ' + ngan(r['Người']) + ' đang mượn' : '🟢 đang ở kho, mượn được'}`; }), nut: [['Mở để bấm Mượn', '#/kho/dungcu']] }; } },
    /* báo hỏng máy */
    { k: (t) => /bao hong|hong roi|bi hong|may hong|hu roi/.test(t) && mayTrong(t), f: async (t) => { const m = mayTrong(t); if (m === '?sang') return { chu: 'Máy sàng nào bị hỏng? Bấm đúng máy để mở biểu mẫu báo hỏng:', nut: SANG().map((x) => ['⚠ ' + x, '#/mamlam/baohong/' + encodeURIComponent(x)]) }; return { chu: `Mở biểu mẫu báo hỏng ${m}: chụp ảnh chỗ hỏng, ghi tình trạng, bấm Gửi.`, nut: [['⚠ Báo hỏng ' + m, '#/mamlam/baohong/' + encodeURIComponent(m)]] }; } },
    /* máy chạy bao nhiêu giờ */
    { k: (t) => mayTrong(t) && /bao nhieu gio|may gio|chay bao|tong gio|so gio/.test(t), f: async (t) => { const m0 = mayTrong(t); const th = thang();
      if (m0 === '?sang') { const d = (await G.doc('MaySangCat', undefined, 5000).catch(() => [])).filter((r) => String(r['Ngày']).startsWith(th) && r['Giờ kết thúc']);
        return { chu: 'Máy sàng cát tháng này:', dong: SANG().map((x) => { const r = d.filter((y) => bo(y['Máy']).includes(bo(x).split(' ')[0])); return `${x}: ${r.length} lần, ${so(r.reduce((a, y) => a + num(y['Số giờ']), 0))} giờ`; }), nut: [['Mở máy sàng cát', '#/nb/may']] }; }
      const m = m0;
      if (/kubota/i.test(m)) { const d = (await G.doc('KubotaLuot', undefined, 3000).catch(() => [])).filter((r) => String(r['Ngày']).startsWith(th)); return { chu: `Kubota tháng này: ${d.length} lượt, tổng ${so(d.reduce((a, r) => a + num(r['Số giờ']), 0))} giờ.`, nut: [['Mở máy', '#/kho/may']] }; }
      const d = (await G.doc('MaySangCat', undefined, 5000).catch(() => [])).filter((r) => String(r['Ngày']).startsWith(th) && bo(r['Máy']).includes(bo(m).split(' ')[0]) && r['Giờ kết thúc']);
      return { chu: `${m} tháng này chạy ${d.length} lần, tổng ${so(d.reduce((a, r) => a + num(r['Số giờ']), 0))} giờ.`, nut: [['Mở máy sàng cát', '#/nb/may']] }; } },
    /* nước tái sử dụng */
    { k: (t) => /tai su dung|nuoc thai|nuoc tuoi.*(thang|bao nhieu)|dong ho nuoc.*bao nhieu/.test(t), f: async () => { const b = (G.BC_VIEC || []).find((x) => x.k === 'donghonuoc'); if (!b) return null;
      const d = (await G.doc('DongHoNuoc', undefined, 5000).catch(() => [])).filter((r) => String(r['Ngày']) >= G.congNgay(hn().slice(0, 8) + '01', -1));
      return { chu: `Nước tháng ${thang().slice(5)}:`, dong: b.cs(d).map(([l, v]) => `${l}: ${v}`), nut: [['Mở báo cáo đồng hồ nước', '#/bcviec/donghonuoc']] }; } },
    /* tiền Trưởng bộ phận tự mua */
    { k: (t) => /tu mua|tu bo tien|ung tien|hoan tien|tien (mua|chi)/.test(t) && laAnh(), f: async () => { const th = thang();
      const [gd, dc] = await Promise.all([G.doc('KhoGiaoDich', undefined, 20000).catch(() => []), G.doc('DungCu', undefined, 3000).catch(() => [])]);
      const a = gd.filter((r) => r['Loại'] === 'Nhập' && /tự mua/.test(r['Nguồn'] || '') && String(r['Ngày']).startsWith(th)); const b = dc.filter((r) => /tự mua/.test(r['Nguồn'] || '') && String(r['Ngày nhập']).startsWith(th));
      const ta = a.reduce((s, r) => s + num(r['Thành tiền']), 0); const tb = b.reduce((s, r) => s + num(r['Đơn giá']), 0);
      return { chu: `Tháng ${th.slice(5)} tự mua: ${tien(ta + tb)}`, dong: [`Vật tư: ${tien(ta)} (${a.length} lần nhập)`, `Dụng cụ: ${tien(tb)} (${b.length} cái)`], nut: [['Mở chi phí kho', '#/kho/chiphi']] }; } },
    /* cây bất thường, dịch hại đang mở */
    { k: (t) => /bat thuong|cay (benh|heo|yeu|vang la|chet)|dich hai (dang|con)|sau benh (dang|con)/.test(t), f: async () => {
      const [bt, dh] = await Promise.all([G.doc('BatThuong', undefined, 3000).catch(() => []), G.doc('DichHai', undefined, 3000).catch(() => [])]);
      const btMo = bt.filter((r) => !/Đã xử lý|Đóng|Xong/.test(r['Trạng thái'] || '')); const kTT = Object.keys(dh[0] || {}).find((k) => /^Trạng thái/.test(k)); const dhMo = dh.filter((r) => !/Đã duyệt/.test(r[kTT] || ''));
      if (!btMo.length && !dhMo.length) return { chu: 'Hiện không có cây bất thường hay dịch hại nào đang mở. 👍' };
      return { chu: `Đang mở: ${btMo.length} cây nội thất bất thường, ${dhMo.length} hồ sơ dịch hại.`, dong: btMo.slice(0, 6).map((r) => `🥀 ${r['Tên cây'] || ''} · ${r['Tình trạng'] || ''} · ${G.ngayVN(r['Ngày'])}`).concat(dhMo.slice(0, 6).map((r) => `🐛 ${r['Loại dịch hại']} · ${r['Tên cây'] || r['Nhóm cây'] || ''} · ${r['Vị trí chi tiết'] || (G.tenVT ? G.tenVT(r['Mã vị trí']) : '')} · ${r['Mức độ'] || ''}`)),
        nut: [btMo.length ? ['Mở cây bất thường', '#/batthuong'] : null, dhMo.length ? ['Mở dịch hại', '#/dichhai'] : null].filter(Boolean) }; } },
    /* thu hoạch Vị Garden */
    { k: (t) => /thu hoach|hai rau|giao bep/.test(t) && (q('noibo') >= 1 || laAnh()), f: async (t) => { const th = /thang truoc/.test(t) ? G.congNgay(hn().slice(0, 8) + '01', -1).slice(0, 7) : thang();
      const d = (await G.doc('ThuHoach', undefined, 5000).catch(() => [])).filter((r) => String(r['Ngày']).startsWith(th)); if (!d.length) return { chu: `Tháng ${th.slice(5)} chưa ghi lần thu hoạch nào.`, nut: [['Mở thu hoạch', '#/nb/thuhoach']] };
      const g = {}; d.forEach((r) => { g[r['Tên cây']] = (g[r['Tên cây']] || 0) + num(r['kg']); }); const cuoi = d.map((r) => r['Ngày']).sort().pop();
      return { chu: `Thu hoạch Vị Garden tháng ${th.slice(5)}: ${so(d.reduce((a, r) => a + num(r['kg']), 0))} kg, ${d.length} lần, lần gần nhất ${G.ngayVN(cuoi)}.`, dong: Object.entries(g).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k}: ${so(v)} kg`), nut: [['Mở thu hoạch', '#/nb/thuhoach']] }; } },
    /* nhật ký thi công ngày nào */
    { k: (t) => /nhat ky thi cong|so nhat ky/.test(t) && !HOI_CACH.test(t) && (laAnh() || q('baocao') >= 1), f: async (t) => { const n = /hom qua/.test(t) ? G.congNgay(hn(), -1) : hn();
      return { chu: `Nhật ký thi công ngày ${G.ngayVN(n)}: mở để xem việc, ảnh và chữ ký của ngày đó.`, nut: [['Mở nhật ký ' + G.ngayVN(n).slice(0, 5), '#/nhatky/' + n]] }; } },
    /* báo cáo GM (không hỏi cách) */
    { k: (t) => /bao cao (gm|gui gm|thang gui)/.test(t) && (laAnh() || q('baocao') >= 1), f: async () => ({ chu: 'Báo cáo tháng gửi GM nằm ở Thêm › Báo cáo › Báo cáo tháng gửi GM. Mặc định là tháng trước, chọn phần cần đưa vào rồi Tải PDF.', nut: [['Mở báo cáo GM', '#/baocaogm']] }) },
    /* báo khó khăn, tạo phiếu: làm luôn */
    /* đào tạo tuần này */
    { k: (t) => /dao tao|lop hoc|buoi hoc|\blop\b/.test(t) && /tuan nay|hom nay|sap toi|lich|khi nao|tuan sau/.test(t), f: async (t) => {
      const tu = /hom nay/.test(t) ? hn() : hn(); const den = /hom nay/.test(t) ? hn() : G.congNgay(hn(), /tuan sau/.test(t) ? 14 : 7);
      const d = (await G.doc('DaoTao', undefined, 2000).catch(() => [])).filter((r) => { const n = String(r['Ngày KH'] || r['Ngày'] || ''); return n >= tu && n <= den; }).sort((a, b) => (String(a['Ngày KH']) < String(b['Ngày KH']) ? -1 : 1));
      return d.length ? { chu: `Lớp đào tạo từ ${G.ngayVN(tu).slice(0, 5)} đến ${G.ngayVN(den).slice(0, 5)}:`, dong: d.map((r) => `${G.ngayVN(r['Ngày KH'] || r['Ngày'])} ${r['Giờ KH'] || ''} · ${r['Nội dung'] || r['Loại']} · ${r['Địa điểm'] || ''} · ${r['Trạng thái'] || ''}`), nut: [['Mở Đào tạo', '#/daotao']] } : { chu: 'Không có lớp đào tạo nào trong khoảng này.', nut: [['Mở Đào tạo', '#/daotao']] }; } },
    /* chênh lệch công kỳ này */
    { k: (t) => /chenh lech cong|cong (thang|ky) nay|bang cong (thang|ky) nay|tong cong/.test(t) && (laAnh() || q('baocao') >= 1), f: async () => { const b = (G.BC_VIEC || []).find((x) => x.k === 'diemdanh'); if (!b) return null; const ky = S.dm.ky;
      const d = (await G.doc('DiemDanh', undefined, 20000).catch(() => [])).filter((r) => String(r['Ngày']) >= ky.tu && String(r['Ngày']) <= ky.den);
      return { chu: `Công kỳ ${ky.ten} (${G.ngayVN(ky.tu).slice(0, 5)} → ${G.ngayVN(ky.den).slice(0, 5)}), tính đến hôm nay:`, dong: b.cs(d).map(([l, v]) => `${l}: ${v}`), nut: [['Mở báo cáo công', '#/bcviec/diemdanh'], ['Chốt năm', '#/chotnam']] }; } },
    /* phiếu của đội tôi / của tôi */
    { k: (t) => /phieu (cua )?(doi toi|toi|minh|doi minh)|phieu (giao cho|cua) (toi|doi)/.test(t), f: async () => {
      const d = (await G.doc('Phieu', undefined, 3000).catch(() => [])).filter((r) => !/Đã xong|Đã duyệt|Hủy/.test(r['Trạng thái'] || ''));
      const cua = d.filter((r) => [S.u.ten, S.u.doi, S.u.nhom].filter(Boolean).some((x) => String(r['Giao cho'] || '').includes(x)));
      return cua.length ? { chu: `Có ${cua.length} phiếu đang mở giao cho ${S.u.doi || 'bạn'}:`, dong: cua.map((r) => `${r['Mã phiếu']} · ${r['Loại lỗi']} · ${G.tenVT ? G.tenVT(r['Mã vị trí']) : ''} · ${r['Trạng thái']}${r['Hạn'] ? ' · hạn ' + G.ngayVN(String(r['Hạn']).slice(0, 10)).slice(0, 5) : ''}`), nut: [['Mở Phiếu', '#/phieu']] } : { chu: 'Không có phiếu nào đang mở giao cho ' + (S.u.doi || 'bạn') + '. 👍', nut: [['Mở Phiếu', '#/phieu']] }; } },
    { k: (t) => /^\s*(toi |em )?(muon |can )?bao kho khan/.test(t), f: async () => ({ chu: 'Mở ô báo khó khăn ngay.', nut: [['⚠ Báo khó khăn', '#/mamlam/khokhan']] }) },
    { k: (t) => /^\s*(toi |em )?(muon |can )?(tao|lam|mo) phieu( giao viec)?\s*$/.test(t) && q('phieu') >= 2, f: async () => ({ chu: 'Mở biểu mẫu tạo phiếu giao việc ngay.', nut: [['＋ Tạo phiếu', '#/mamlam/taophieu']] }) },
  ];

  const tl0 = G.traLoiMam;
  G.traLoiMam = async (cau, nguon) => {
    const t = (' ' + bo(cau) + ' ').replace(/ v ?(\d{1,2}) /g, ' villa $1 ').replace(/ kbt /g, ' kubota ').replace(/ dh /g, ' dong ho ');
    try { const d = chiDuong(t); if (d) return doiKQ(d); } catch (e) { console.warn(e); }
    for (const y of Y48) { try { if (y.k(t)) { const r = await y.f(t, cau); if (r) return doiKQ(r); } } catch (e) { console.warn(e); } }
    if (/tien do|xong chua|lam toi dau|duoc bao nhieu phan tram/.test(t) && !/bao cao|nhieu ngay/.test(t)) { const r = await tl0(String(cau).replace(/(tiến độ|xong chưa|làm tới đâu|được bao nhiêu phần trăm).*$/i, '') + ' còn chỗ nào chưa làm', nguon); if (r && !/chưa hiểu|chưa chắc/.test(r.chu || '')) return doiKQ(r); }
    return doiKQ(await tl0(cau, nguon));
  };
  G._mam48 = { Y48, DUONG, chiDuong };
})();
