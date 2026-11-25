/* GreenLog 0.4 – đào tạo theo một luồng (Có kế hoạch / Đột xuất), mọi bước qua Trưởng bộ phận duyệt, điểm danh tick từng người, ảnh camera trong app,
   câu hỏi nhanh không chấm, đề thi nhanh 10 câu tùy chọn, ma trận người × SOP; thư viện SOP 4 dạng có phiên bản, nghe đọc, bản tiếng Anh */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hop = (...a) => G.hop(...a);
  const hn = () => API.ngay(); const gio = () => API.bayGio().slice(11, 16);
  const THU = (d) => G.thu(d);
  const phut = (a, b) => { const p = (s) => { const x = String(s || '').match(/(\d+):(\d+)/); return x ? +x[1] * 60 + +x[2] : null; }; const x = p(a), y = p(b); return x != null && y != null ? Math.max(0, y - x) : 0; };
  const hhmm = (n) => `${Math.floor(n / 60)}h${String(n % 60).padStart(2, '0')}`;
  const TT = { cho: 'Chờ duyệt kế hoạch', duyet: 'Đã duyệt kế hoạch', dang: 'Đang diễn ra', ket: 'Đã kết thúc', choHT: 'Chờ duyệt hoàn thành', ht: 'Hoàn thành', hoan: 'Hoãn', huy: 'Hủy' };
  const anh = () => G.laAnhVu();
  const nhomNguoi = () => { const cn = (S.dm.congnhan || []).filter((x) => x.tt !== 'Đã nghỉ'); return cn.map((x) => ({ ten: x.ten, ma: x.ma, nhom: x.doi === 'Đội cơ động' ? 'Cơ động' : x.doi === 'Đội khu vực' ? 'Khu vực' : 'Khu vực' }))
    .concat((S.dm.nguoi || []).filter((n) => n.nhom === 'Nhân viên nội bộ').map((n) => ({ ten: n.ten, ma: n.ten, nhom: 'Nội bộ' }))); };
  const sopDs = async () => (await G.doc('ThuVienSOP', null, 500));
  const tenSOP = (ds, ma) => (ds.find((x) => x['Mã SOP'] === ma) || {})['Tên tài liệu'] || ma;
  const json = (s, md) => { try { return JSON.parse(s || ''); } catch (e) { return md; } };

  /* ================= DANH SÁCH LỚP ================= */
  G.man.daotao = Object.assign(G.man.daotao || {}, { ten: 'Đào tạo', ic: 'dao_tao', ph: () => true, fn: async (ma) => {
    if (ma === 'moi') return dangKy();
    if (ma === 'matran') return maTran();
    if (ma) return chiTiet(ma);
    const st = G.man.daotao.st || (G.man.daotao.st = { tab: 'sap' });
    const m = G.khung('Đào tạo', 'Đăng ký → Trưởng bộ phận duyệt → Bắt đầu → Kết thúc → Điểm danh → Ảnh → anh duyệt Hoàn thành');
    const [ds, sop] = await Promise.all([G.doc('DaoTao', null, 800), sopDs()]);
    const TAB = { sap: [TT.cho, TT.duyet], dang: [TT.dang, TT.ket], cho: [TT.choHT], xong: [TT.ht, TT.hoan, TT.huy, ''] };
    const loc = ds.filter((x) => TAB[st.tab].includes(x['Trạng thái'] || '')).reverse();
    const kh = ds.filter((x) => x['Loại'] === 'Có kế hoạch' && x['Trạng thái'] === TT.ht).length; const dx = ds.filter((x) => x['Loại'] === 'Đột xuất' && x['Trạng thái'] === TT.ht).length;
    m.innerHTML = `<div class="nhom-nut" style="margin-bottom:10px"><a class="nut chinh" href="#/daotao/moi">＋ Đăng ký lớp</a><button class="nut" id="dotxuat">⚡ Lớp đột xuất</button></div>
      <div class="nhom-nut" style="margin-bottom:10px"><a class="nut nho" href="#/sop">📚 Thư viện SOP</a><a class="nut nho" href="#/daotao/matran">▦ Ma trận người × SOP</a><button class="nut nho" id="tai">⬇ Excel</button></div>
      <div class="the"><div class="luoi2"><div><b class="so-vua">${kh}</b><div class="mo">lớp theo kế hoạch đã xong</div></div><div><b class="so-vua">${dx}</b><div class="mo">lớp đột xuất đã xong</div></div></div></div>
      <div class="chon">${[['sap', 'Sắp tới'], ['dang', 'Đang diễn ra'], ['cho', 'Chờ duyệt'], ['xong', 'Đã xong']].map(([k, t]) => `<button data-t="${k}" class="${st.tab === k ? 'dang' : ''}">${t} (${ds.filter((x) => TAB[k].includes(x['Trạng thái'] || '')).length})</button>`).join('')}</div>
      <div class="ds">${loc.map((x) => `<a class="muc" href="#/daotao/${encodeURIComponent(x['Mã ĐT'])}" style="color:inherit"><div class="gian"><b>${esc(x['Nội dung'])}</b><div class="mo">${x['Loại'] === 'Đột xuất' ? '<span class="chip cam">Đột xuất</span> ' : ''}${G.ngayVN(x['Ngày KH'] || x['Ngày'])} ${esc(x['Giờ KH'] || x['Bắt đầu'] || '')} · ${esc(x['Giảng viên'])} · ${esc(x['Địa điểm'] || '')}</div></div><span class="chip ${x['Trạng thái'] === TT.ht ? 'xanh' : /Chờ/.test(x['Trạng thái']) ? 'cam' : ''}">${esc(x['Trạng thái'] || 'Cũ')}</span></a>`).join('') || '<div class="muc mo">Không có</div>'}</div>`;
    m.querySelectorAll('[data-t]').forEach((b) => { b.onclick = () => { st.tab = b.dataset.t; G.taiLai(); }; });
    m.querySelector('#dotxuat').onclick = () => dangKy(true);
    m.querySelector('#tai').onclick = () => G.taiCSV('DaoTao_' + hn(), [['STT', 'Thứ', 'Ngày', 'Thời gian bắt đầu', 'Thời gian kết thúc', 'Tổng thời lượng', 'Nội dung đào tạo', 'Địa điểm', 'Giảng viên', 'Số học viên', 'Loại', 'Trạng thái']]
      .concat(ds.filter((x) => x['Trạng thái'] === TT.ht || !x['Trạng thái']).map((x, i) => [i + 1, THU(x['Ngày']), G.ngayVN(x['Ngày']), x['Bắt đầu'], x['Kết thúc'], x['Tổng thời lượng'], x['Nội dung'], x['Địa điểm'], x['Giảng viên'], x['Số học viên'], x['Loại'] || '', x['Trạng thái'] || ''])));
  } });

  /* ---------- ① đăng ký (có kế hoạch) / đột xuất ---------- */
  async function dangKy(dotXuat) {
    const sop = await sopDs(); const goiY = G._daoTaoLai || {}; G._daoTaoLai = null;
    const tieuDe = dotXuat ? '⚡ Lớp đột xuất (bắt đầu ngay)' : 'Đăng ký lớp đào tạo';
    const show = (m) => {
      const lay = G.form(m.querySelector('#f'), [{ k: 'nd', nhan: 'Nội dung', loai: 'chu', bb: true, gt: goiY.nd || '' }].concat(dotXuat ? [{ k: 'ly', nhan: 'Lý do đột xuất', loai: 'chu', bb: true, gt: goiY.lyDo || '' }] : [{ k: 'ngay', nhan: 'Ngày dự kiến', loai: 'ngay', bb: true, gt: G.congNgay(hn(), 1) }, { k: 'gio', nhan: 'Giờ dự kiến', loai: 'gio', bb: true, gt: '14:00' }])
        .concat([{ k: 'dd', nhan: 'Địa điểm', loai: 'chu', gt: 'Văn phòng cảnh quan', bb: true }, { k: 'gv', nhan: 'Giảng viên (mặc định là người đăng ký)', loai: 'chu', gt: S.u.ten, bb: true },
          { k: 'sop', nhan: 'Tài liệu SOP', loai: 'nhieu', ds: sop.filter((x) => x['Trạng thái'] !== 'Nháp').map((x) => x['Mã SOP'] + ' · ' + x['Tên tài liệu']) }, { k: 'hv', nhan: 'Học viên dự kiến (không bắt buộc, không tick sẵn khi điểm danh)', loai: 'chu' }]));
      m.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const ma = G.ma('DT');
        await API.goi('ghi', { bang: 'DaoTao', dong: { 'Mã ĐT': ma, 'Loại': dotXuat ? 'Đột xuất' : 'Có kế hoạch', 'Lý do đột xuất': v.ly || '', 'Nội dung': v.nd, 'Ngày KH': dotXuat ? hn() : v.ngay, 'Giờ KH': dotXuat ? gio() : v.gio, 'Địa điểm': v.dd, 'Giảng viên': v.gv,
          'Tài liệu': (v.sop || []).map((x) => x.split(' · ')[0]).join(' | '), 'Học viên dự kiến': v.hv || '', 'Trạng thái': dotXuat ? TT.dang : (anh() ? TT.duyet : TT.cho), 'Ngày': dotXuat ? hn() : v.ngay, 'Thứ': THU(dotXuat ? hn() : v.ngay), 'Bắt đầu': dotXuat ? gio() : '', 'Người lập': '' } });
        bao(dotXuat ? 'Lớp đã bắt đầu · nhớ Kết thúc rồi điểm danh' : anh() ? 'Đã đăng ký và duyệt' : 'Đã đăng ký · chờ Trưởng bộ phận duyệt kế hoạch'); location.hash = '#/daotao/' + encodeURIComponent(ma); }, e.target);
    };
    if (dotXuat) return hop(tieuDe, '<div id="f"></div><button class="nut chinh rong" id="l">▶ Bắt đầu ngay</button>', (o) => show(o));
    const m = G.khung(tieuDe, 'Trưởng bộ phận duyệt kế hoạch · nhắc trước 1 ngày và đúng ngày', '#/daotao'); m.innerHTML = '<div class="the"><div id="f"></div><button class="nut chinh rong" id="l">Đăng ký</button></div>'; show(m);
  }

  /* ---------- chi tiết lớp: ② Bắt đầu ③ Kết thúc ④ Điểm danh ⑤ Ảnh + ghi chú ⑥ anh duyệt ---------- */
  async function chiTiet(ma) {
    const [ds, dd, kq, dx, sop] = await Promise.all([G.doc('DaoTao', { 'Mã ĐT': ma }), G.doc('DaoTaoDiemDanh', { 'Mã ĐT': ma }), G.doc('KetQuaThi', { 'Mã ĐT': ma }), G.doc('DaoTaoDeXuat', { 'Mã ĐT': ma }), sopDs()]);
    const x = ds[0]; if (!x) { location.hash = '#/daotao'; return; }
    const m = G.khung(x['Nội dung'], `${x['Loại'] || ''} · ${x['Giảng viên']}`, '#/daotao');
    const t = x['Trạng thái']; const laGV = x['Giảng viên'] === S.u.ten || x['Người lập'] === S.u.ten || anh(); const khoa = t === TT.ht;
    const kt15 = x['Kết thúc'] && x['Ngày'] === hn() ? phut(x['Kết thúc'], gio()) <= 15 : false; const moDD = t === TT.dang || (t === TT.ket && kt15) || (anh() && t !== TT.ht);
    const hai = G.caiDat('Điểm danh đào tạo 2 lần', 'Tắt') === 'Bật';
    const sopMa = String(x['Tài liệu'] || '').split('|').map((s) => s.trim()).filter(Boolean);
    const buoc = (n, ten, xong, html) => `<div class="the ${xong ? 'the-xanh' : ''}"><div class="buoc"><span>${n}</span>${ten}${xong ? ' ✓' : ''}</div>${html || ''}</div>`;
    let html = `<div class="the"><div class="hang"><div class="gian"><b>${esc(x['Nội dung'])}</b><div class="mo">KH: ${G.ngayVN(x['Ngày KH'] || x['Ngày'])} ${esc(x['Giờ KH'] || '')} · ${esc(x['Địa điểm'] || '')}${x['Lý do đột xuất'] ? ' · Đột xuất: ' + esc(x['Lý do đột xuất']) : ''}</div>
      ${sopMa.length ? `<div class="mo">Tài liệu: ${sopMa.map((s) => `<a href="#/sop/${encodeURIComponent(s)}">${esc(tenSOP(sop, s))}</a>`).join(', ')}</div>` : ''}</div><span class="chip ${t === TT.ht ? 'xanh' : 'cam'}">${esc(t)}</span></div></div>`;
    if (t === TT.cho) html += anh() ? '<div class="nhom-nut" style="margin-bottom:12px"><button class="nut" id="tuChoi">Không duyệt</button><button class="nut chinh" id="duyetKH">Duyệt kế hoạch</button></div>' : '<div class="canh-bao">Chờ Trưởng bộ phận duyệt kế hoạch.</div>';
    dx.filter((d) => d['Trạng thái'] === 'Chờ duyệt').forEach((d) => { html += `<div class="the the-mo"><b>Đề xuất thay đổi</b><div>${esc(d['Nội dung'])}</div><div class="mo">${esc(d['Người đề xuất'])} · ${esc(d['Lý do'])}</div>${anh() ? `<div class="nhom-nut" style="margin-top:6px"><button class="nut nho" data-kdx="${esc(d['Mã'])}">Không duyệt</button><button class="nut nho chinh" data-dx="${esc(d['Mã'])}">Duyệt thay đổi</button></div>` : ''}</div>`; });
    if ([TT.duyet, TT.dang, TT.ket, TT.choHT, TT.ht].includes(t)) {
      html += buoc(2, 'Bắt đầu', !!x['Bắt đầu'], x['Bắt đầu'] ? `<div class="mo">Thực tế ${esc(x['Bắt đầu'])}${x['Giờ KH'] ? ' · kế hoạch ' + esc(x['Giờ KH']) : ''}${x['Lý do trễ'] ? ' · trễ: ' + esc(x['Lý do trễ']) : ''}</div>` : laGV && t === TT.duyet ? '<button class="nut chinh rong" id="bd">▶ Bắt đầu lúc này</button>' : '');
      html += buoc(3, 'Kết thúc', !!x['Kết thúc'], x['Kết thúc'] ? `<div class="mo">${esc(x['Kết thúc'])} · thời lượng ${esc(x['Tổng thời lượng'])}${x['Sửa giờ'] ? ' · sửa giờ: ' + esc(x['Sửa giờ']) : ''}</div>` : laGV && t === TT.dang ? '<button class="nut chinh rong" id="kt">■ Kết thúc lúc này</button>' : '');
      if (laGV && x['Bắt đầu'] && !khoa) html += '<button class="nut nho" id="suaGio" style="margin:-6px 0 12px">Quên bấm? Sửa giờ (kèm lý do)</button>';
      const lan = (l) => dd.filter((r) => String(r['Lần'] || '1') === String(l));
      html += buoc(4, `Điểm danh${hai ? ' (2 lần)' : ''}`, lan(1).length > 0, `<div class="mo">${lan(1).length} người${hai ? ` · lần 2: ${lan(2).length}` : ''} · mở trong lúc học đến 15 phút sau Kết thúc · không ký tên</div>${lan(1).map((r) => `<span class="chip" style="margin:2px">${esc(r['Họ tên'])}</span>`).join('')}
        ${moDD && laGV && !khoa ? `<div class="nhom-nut" style="margin-top:8px"><button class="nut chinh" data-dd="1">Điểm danh${hai ? ' lần 1' : ''}</button>${hai ? '<button class="nut" data-dd="2">Lần 2</button>' : ''}</div>` : ''}`);
      // mục 70: kiểm tra là 1 bước rõ ràng ngay sau điểm danh, luôn hiện
      const daBD = [TT.dang, TT.ket, TT.choHT, TT.ht].includes(t);
      const soCau = sopMa.reduce((a, s2) => a + json((sop.find((y) => y['Mã SOP'] === s2) || {})['Câu hỏi'], []).length, 0);
      let kt = '';
      if (!sopMa.length) kt = `<div class="canh-bao">Lớp này chưa gắn tài liệu SOP nên chưa có câu hỏi.</div>${laGV && !khoa ? '<button class="nut chinh rong" id="ganSOP">📎 Gắn tài liệu SOP cho lớp</button>' : ''}`;
      else if (!soCau) kt = `<div class="canh-bao">Tài liệu chưa có ngân hàng câu hỏi.${anh() ? ` <a href="#/sop/${encodeURIComponent(sopMa[0])}/sua">Thêm câu hỏi</a>` : ' Trưởng bộ phận thêm ở Thư viện SOP.'}</div>`;
      else if (!daBD) kt = `<div class="mo">${soCau} câu hỏi sẵn sàng. Mở sau khi bấm ▶ Bắt đầu.</div>`;
      else kt = `<div class="mo" style="margin-bottom:8px">${soCau} câu trong ngân hàng · xáo trộn mỗi lần</div>
        ${laGV ? `<button class="nut rong" id="hoiNhanh" style="margin-bottom:8px">🎲 Câu hỏi ngẫu nhiên: bốc người + câu (hỏi miệng, không chấm)</button>
        ${sopMa.map((s2) => `<a class="nut chinh rong" href="#/thi/${encodeURIComponent(ma)}/${encodeURIComponent(s2)}" style="margin-bottom:6px">📝 Bài kiểm tra 10 câu · ${esc(tenSOP(sop, s2))}</a>`).join('')}` : ''}
        ${kq.length ? `<table class="bang" style="margin-top:8px"><tr><th>Ai làm</th><th>Bài</th><th>Kết quả</th></tr>${kq.map((r) => `<tr><td>${esc(r['Họ tên'])}</td><td>${esc(tenSOP(sop, r['Mã SOP']))}</td><td><b>${esc(r['Điểm'])}</b> · ${esc(r['Mức hiểu'])}</td></tr>`).join('')}</table>` : ''}`;
      html += buoc(5, 'Kiểm tra: câu hỏi ngẫu nhiên, bài kiểm tra', kq.length > 0, kt);
      html += buoc(6, 'Ghi chú + ảnh lớp (camera trong app)', !!x['Ảnh lớp'], `${x['Ảnh lớp'] ? G.xemAnh(x['Ảnh lớp']) + `<div class="mo">Chụp ${esc(x['Giờ chụp'] || '')}${x['GPS'] ? ' · ' + esc(x['GPS']) : ''}</div>` : ''}${x['Ghi chú'] ? `<p>${esc(x['Ghi chú'])}</p>` : ''}
        ${laGV && [TT.dang, TT.ket].includes(t) ? '<button class="nut rong" id="anhLop">📷 Chụp ảnh lớp, ghi chú, gửi duyệt</button>' : ''}`);
      if (t === TT.choHT && anh()) html += `<div class="the the-mo"><b>Anh đối chiếu số người trong ảnh với điểm danh (${lan(1).length} người)</b><div class="nhom-nut" style="margin-top:8px"><button class="nut" id="traLai">Trả lại</button><button class="nut chinh" id="duyetHT">Duyệt Hoàn thành</button></div></div>`;
    }
    if (laGV && [TT.cho, TT.duyet].includes(t)) html += '<div class="nhom-nut" style="margin:6px 0 30px"><button class="nut" id="deXuat">Đề xuất thay đổi / Hoãn / Hủy</button></div>';
    if (t === TT.duyet && x['Ngày KH'] < hn() && !x['Bắt đầu']) html = '<div class="canh-bao do">Đã quá ngày kế hoạch: bấm Bắt đầu cần nhập lý do trễ, hoặc Đề xuất Hoãn/Hủy kèm lý do.</div>' + html;
    m.innerHTML = html;
    const sua = (doi) => API.goi('sua', { bang: 'DaoTao', khoa: { 'Mã ĐT': ma }, doi });
    const on = (id, fn) => { const b = m.querySelector('#' + id); if (b) b.onclick = fn; };
    on('duyetKH', () => chay(async () => { await sua({ 'Trạng thái': TT.duyet, 'Người duyệt KH': S.u.ten }); G.taiLai(); }));
    on('tuChoi', async () => { const l = await G.hoi('Lý do không duyệt'); if (l != null) chay(async () => { await sua({ 'Trạng thái': TT.huy, 'Ghi chú': 'Không duyệt: ' + l }); G.taiLai(); }); });
    on('bd', async () => { let tre = ''; if ((x['Ngày KH'] || hn()) < hn()) { tre = await G.hoi('Lý do bắt đầu trễ so với kế hoạch'); if (!tre) return; } chay(async () => { await sua({ 'Bắt đầu': gio(), 'Ngày': hn(), 'Thứ': THU(hn()), 'Trạng thái': TT.dang, 'Lý do trễ': tre }); G.taiLai(); }); });
    on('ganSOP', () => hop('Gắn tài liệu SOP', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'sop', nhan: 'Tài liệu SOP', loai: 'nhieu', bb: true, ds: sop.filter((y) => y['Trạng thái'] !== 'Nháp').map((y) => y['Mã SOP'] + ' · ' + y['Tên tài liệu']) }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await sua({ 'Tài liệu': (v.sop || []).map((y) => y.split(' · ')[0]).join(' | ') }); dong(); G.taiLai(); }, e.target); }));
    on('kt', () => chay(async () => { const k = gio(); await sua({ 'Kết thúc': k, 'Tổng thời lượng': hhmm(phut(x['Bắt đầu'], k)), 'Trạng thái': TT.ket }); bao('Đã kết thúc · điểm danh trong 15 phút'); G.taiLai(); }));
    on('suaGio', () => hop('Sửa giờ học', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => { const lay = G.form(o.querySelector('#f'), [{ k: 'bd', nhan: 'Bắt đầu', loai: 'gio', gt: x['Bắt đầu'], bb: true }, { k: 'kt', nhan: 'Kết thúc', loai: 'gio', gt: x['Kết thúc'] }, { k: 'ly', nhan: 'Lý do sửa (Trưởng bộ phận thấy khi duyệt)', loai: 'chu', bb: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await sua({ 'Bắt đầu': v.bd, 'Kết thúc': v.kt || x['Kết thúc'], 'Tổng thời lượng': v.kt ? hhmm(phut(v.bd, v.kt)) : x['Tổng thời lượng'], 'Sửa giờ': `${x['Bắt đầu']}–${x['Kết thúc'] || ''} → ${v.bd}–${v.kt || ''}: ${v.ly}` }); dong(); G.taiLai(); }, e.target); }));
    m.querySelectorAll('[data-dd]').forEach((b) => { b.onclick = () => diemDanh(x, b.dataset.dd, dd); });
    on('anhLop', () => hop('Ảnh lớp + ghi chú', '<p class="mo">Chụp bằng camera trong app (ghi ngày giờ, vị trí).</p><div id="anh"></div><div id="f"></div><button class="nut chinh rong" id="l">Lưu, gửi Trưởng bộ phận duyệt</button>', (o, dong) => {
      const a = G.oAnh(o.querySelector('#anh'), { toiDa: 3 }); o.querySelectorAll('[data-a=thu], [data-a=dan]').forEach((b) => b.remove());
      const lay = G.form(o.querySelector('#f'), [{ k: 'gc', nhan: 'Ghi chú lớp', loai: 'mota' }]);
      let gps = ''; try { navigator.geolocation && navigator.geolocation.getCurrentPosition((p) => { gps = p.coords.latitude.toFixed(5) + ',' + p.coords.longitude.toFixed(5); }, () => {}, { timeout: 5000 }); } catch (e) { /* bỏ qua */ }
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); if (!a.ds().length) throw new Error('Cần ảnh lớp'); if (!dd.length) throw new Error('Chưa điểm danh');
        await sua({ 'Ảnh lớp': a.ds().join(' | '), 'Giờ chụp': API.bayGio(), 'GPS': gps, 'Ghi chú': v.gc, 'Trạng thái': TT.choHT, 'Học viên': [...new Set(dd.map((r) => r['Họ tên']))].join(', '), 'Số học viên': new Set(dd.map((r) => r['Họ tên'])).size }); dong(); bao('Đã gửi Trưởng bộ phận duyệt hoàn thành'); G.taiLai(); }, e.target); }));
    on('duyetHT', () => chay(async () => { await sua({ 'Trạng thái': TT.ht, 'Người duyệt': S.u.ten, 'Giờ duyệt': API.bayGio(), 'Nhắc chấm điểm': G.congNgay(hn(), 7) }); bao('Đã duyệt hoàn thành · khóa lớp'); G.taiLai(); }));
    on('traLai', async () => { const l = await G.hoi('Lý do trả lại'); if (l) chay(async () => { await sua({ 'Trạng thái': TT.ket, 'Ghi chú': (x['Ghi chú'] || '') + ' · Trả lại: ' + l }); G.taiLai(); }); });
    on('deXuat', () => hop('Đề xuất thay đổi', '<div id="f"></div><button class="nut chinh rong" id="l">Gửi Trưởng bộ phận duyệt</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'loai', nhan: 'Thay đổi', loai: 'chips', ds: ['Ngày, giờ', 'Nội dung', 'Giảng viên', 'Hoãn', 'Hủy'], bb: true }, { k: 'moi', nhan: 'Giá trị mới (ngày, giờ, nội dung, giảng viên)', loai: 'chu' }, { k: 'ngay', nhan: 'Ngày mới (nếu đổi ngày)', loai: 'ngay', gt: x['Ngày KH'] }, { k: 'gio', nhan: 'Giờ mới', loai: 'gio', gt: x['Giờ KH'] }, { k: 'ly', nhan: 'Lý do', loai: 'chu', bb: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'DaoTaoDeXuat', dong: { 'Mã': G.ma('DX'), 'Mã ĐT': ma, 'Loại': v.loai, 'Nội dung': v.loai === 'Ngày, giờ' ? `${G.ngayVN(v.ngay)} ${v.gio}` : v.loai === 'Hoãn' || v.loai === 'Hủy' ? v.loai : v.moi, 'Ngày': v.ngay, 'Giờ': v.gio, 'Giá trị': v.moi, 'Lý do': v.ly, 'Trạng thái': anh() ? 'Đã duyệt' : 'Chờ duyệt', 'Người đề xuất': S.u.ten } });
        if (anh()) await apDung(ma, { 'Loại': v.loai, 'Ngày': v.ngay, 'Giờ': v.gio, 'Giá trị': v.moi, 'Lý do': v.ly }); dong(); bao(anh() ? 'Đã đổi' : 'Đã gửi đề xuất · chờ Trưởng bộ phận duyệt'); G.taiLai(); }, e.target); }));
    m.querySelectorAll('[data-dx]').forEach((b) => { b.onclick = () => chay(async () => { const d = dx.find((y) => y['Mã'] === b.dataset.dx); await apDung(ma, d); await API.goi('sua', { bang: 'DaoTaoDeXuat', khoa: { 'Mã': d['Mã'] }, doi: { 'Trạng thái': 'Đã duyệt' } }); G.taiLai(); }); });
    m.querySelectorAll('[data-kdx]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('sua', { bang: 'DaoTaoDeXuat', khoa: { 'Mã': b.dataset.kdx }, doi: { 'Trạng thái': 'Không duyệt' } }); G.taiLai(); }); });
    on('hoiNhanh', () => hoiNhanh(x, dd, sop, sopMa));
  }
  const apDung = (ma, d) => { const doi = d['Loại'] === 'Ngày, giờ' ? { 'Ngày KH': d['Ngày'], 'Giờ KH': d['Giờ'], 'Ngày': d['Ngày'], 'Thứ': THU(d['Ngày']) } : d['Loại'] === 'Nội dung' ? { 'Nội dung': d['Giá trị'] } : d['Loại'] === 'Giảng viên' ? { 'Giảng viên': d['Giá trị'] } : d['Loại'] === 'Hoãn' ? { 'Trạng thái': TT.hoan, 'Ghi chú': 'Hoãn: ' + d['Lý do'] } : { 'Trạng thái': TT.huy, 'Ghi chú': 'Hủy: ' + d['Lý do'] };
    return API.goi('sua', { bang: 'DaoTao', khoa: { 'Mã ĐT': ma }, doi }); };

  /* ---------- ④ điểm danh: tick từng người, không tick sẵn, không chọn cả đội; tab Khác nhập tay ---------- */
  function diemDanh(x, lan, cu) {
    const ng = nhomNguoi(); const da = new Set(cu.filter((r) => String(r['Lần'] || '1') === String(lan)).map((r) => r['Họ tên'])); const chon = new Set(); const khac = [];
    let tab = 'Cơ động';
    hop('Điểm danh lần ' + lan, '<div class="chon" id="tab"></div><div id="ds"></div><button class="nut chinh rong" id="l" style="margin-top:10px">Lưu điểm danh</button>', (o, dong) => {
      const ve = () => {
        o.querySelector('#tab').innerHTML = ['Cơ động', 'Khu vực', 'Nội bộ', 'Khác'].map((t) => `<button data-tab="${t}" class="${tab === t ? 'dang' : ''}">${t}</button>`).join('');
        o.querySelectorAll('[data-tab]').forEach((b) => { b.onclick = () => { tab = b.dataset.tab; ve(); }; });
        o.querySelector('#ds').innerHTML = tab === 'Khác' ? `<div class="luoi2"><input id="kTen" placeholder="Họ tên"><input id="kBp" placeholder="Bộ phận"></div><button class="nut nho" id="kThem" style="margin-top:6px">＋ Thêm</button>${khac.map((k) => `<div class="mo">✓ ${esc(k.ten)} · ${esc(k.bp)}</div>`).join('')}`
          : `<div class="ds">${ng.filter((n) => n.nhom === tab).map((n) => `<label class="muc"><input type="checkbox" data-n="${esc(n.ten)}" ${chon.has(n.ten) ? 'checked' : ''} ${da.has(n.ten) ? 'disabled' : ''}><span class="gian">${esc(n.ten)}${da.has(n.ten) ? ' <span class="chip xanh">đã điểm danh</span>' : ''}</span></label>`).join('')}</div>`;
        o.querySelectorAll('[data-n]').forEach((c) => { c.onchange = () => { if (c.checked) chon.add(c.dataset.n); else chon.delete(c.dataset.n); }; });
        const kt = o.querySelector('#kThem'); if (kt) kt.onclick = () => { const t = o.querySelector('#kTen').value.trim(); if (!t) return; khac.push({ ten: t, bp: o.querySelector('#kBp').value.trim() }); ve(); };
      };
      ve();
      o.querySelector('#l').onclick = (e) => chay(async () => { const rows = [...chon].map((t) => { const n = ng.find((y) => y.ten === t); return { 'Mã ĐT': x['Mã ĐT'], 'Lần': lan, 'Họ tên': t, 'Mã CN': n.ma, 'Nhóm': n.nhom, 'Bộ phận': n.nhom === 'Nội bộ' ? 'Cảnh quan' : 'Nhà thầu PQC', 'Giờ': API.bayGio() }; })
        .concat(khac.map((k) => ({ 'Mã ĐT': x['Mã ĐT'], 'Lần': lan, 'Họ tên': k.ten, 'Mã CN': '', 'Nhóm': 'Khác', 'Bộ phận': k.bp, 'Giờ': API.bayGio() })));
        if (!rows.length) throw new Error('Chưa tick ai'); await API.goi('ghiNhieu', { bang: 'DaoTaoDiemDanh', dong: rows }); dong(); bao(`Đã điểm danh ${rows.length} người`); G.taiLai(); }, e.target);
    });
  }

  /* ---------- câu hỏi nhanh: bốc người + câu, không chấm ---------- */
  function hoiNhanh(x, dd, sop, sopMa) {
    const ng = [...new Set(dd.map((r) => r['Họ tên']))]; const cau = sopMa.flatMap((s) => json((sop.find((y) => y['Mã SOP'] === s) || {})['Câu hỏi'], []));
    const boc = () => ({ ai: ng[Math.floor(Math.random() * ng.length)] || '(chưa điểm danh)', c: cau[Math.floor(Math.random() * cau.length)] });
    let b = boc();
    hop('Câu hỏi nhanh', '<div id="v"></div><div class="nhom-nut" style="margin-top:10px"><button class="nut" id="lai">🎲 Bốc lại</button><button class="nut chinh" id="ok">Xong</button></div>', (o, dong) => {
      const ve = () => { o.querySelector('#v').innerHTML = `<div class="the" style="text-align:center"><div class="mo">Mời</div><div style="font-size:26px;font-weight:700">${esc(b.ai)}</div></div><div class="the"><b>${esc(b.c ? b.c.c : 'Thư viện SOP chưa có ngân hàng câu hỏi cho bài này')}</b>${b.c && b.c.goiY ? `<div class="mo">Gợi ý đáp án: ${esc(b.c.goiY)}</div>` : b.c ? `<div class="mo">Đáp án: ${esc((b.c.d || [])[b.c.dung] || '')}</div>` : ''}</div><p class="mo">Không chấm, không đánh giá học viên. Ai chưa hiểu thì giảng viên kèm riêng.</p>`; };
      ve(); o.querySelector('#lai').onclick = () => { b = boc(); ve(); }; o.querySelector('#ok').onclick = dong;
    });
  }

  /* ================= ĐỀ THI NHANH 10 CÂU ================= */
  const xao = (a) => a.map((x) => [Math.random(), x]).sort((p, r) => p[0] - r[0]).map((p) => p[1]);
  G.man.thi = { an: true, fn: async (maDT, maSOP) => {
    const sop = (await sopDs()).find((x) => x['Mã SOP'] === maSOP); const en = G.lang() === 'en';
    const bank = json(sop && (en && sop['Câu hỏi EN'] ? sop['Câu hỏi EN'] : sop['Câu hỏi']), []);
    const m = G.khung('Bài kiểm tra', sop ? sop['Tên tài liệu'] : '', maDT === '-' ? '#/sop/' + encodeURIComponent(maSOP) : '#/daotao/' + encodeURIComponent(maDT));
    if (bank.length < 1) { m.innerHTML = G.trong('Bài này chưa có ngân hàng câu hỏi. Trưởng bộ phận thêm ở Thư viện SOP.'); return; }
    const de = xao(bank).slice(0, 10).map((c) => { const thu = xao(c.d.map((t, i) => ({ t, dung: i === c.dung }))); return { c: c.c, d: thu }; });
    const dd = maDT === '-' ? [] : await G.doc('DaoTaoDiemDanh', { 'Mã ĐT': maDT }); const ng = dd.length ? [...new Set(dd.map((r) => r['Họ tên']))] : [S.u.ten].concat((S.dm.congnhan || []).map((c) => c.ten || c['Họ tên']).filter(Boolean)).filter((v, i, a) => v && a.indexOf(v) === i);
    m.innerHTML = `<div class="the"><label class="o"><span>Người làm bài</span><select id="ai"><option value="">— Chọn tên —</option>${ng.map((t) => `<option>${esc(t)}</option>`).join('')}<option value="khac">Người khác…</option></select></label></div>
      ${de.map((x, i) => `<div class="cau-thi"><b>${i + 1}. ${esc(x.c)}</b>${x.d.map((d, j) => `<label data-q="${i}" data-j="${j}"><input type="radio" name="q${i}" value="${j}">${esc(d.t)}</label>`).join('')}</div>`).join('')}
      <button class="nut chinh rong" id="gui" style="margin-bottom:30px">Gửi bài</button><div id="kq"></div>`;
    m.querySelector('#gui').onclick = (e) => chay(async () => {
      let ai = m.querySelector('#ai').value; if (ai === 'khac') ai = await G.hoi('Họ tên người làm bài'); if (!ai) throw new Error('Chọn tên người làm bài');
      let dung = 0; de.forEach((x, i) => { const c = m.querySelector(`input[name=q${i}]:checked`); m.querySelectorAll(`[data-q="${i}"]`).forEach((l) => { const d = x.d[+l.dataset.j]; if (d.dung) l.classList.add('dung'); else if (c && +c.value === +l.dataset.j) l.classList.add('sai'); }); if (c && x.d[+c.value].dung) dung++; });
      const muc = dung >= 9 ? 'Hiểu rất tốt' : dung >= 7 ? 'Hiểu tốt' : dung >= 5 ? 'Hiểu cơ bản' : 'Cần kèm thêm';
      await API.goi('ghi', { bang: 'KetQuaThi', dong: { 'Mã ĐT': maDT, 'Mã SOP': maSOP, 'Họ tên': ai, 'Điểm': `${dung}/${de.length}`, 'Mức hiểu': muc, 'Giờ': API.bayGio() } });
      m.querySelector('#kq').innerHTML = `<div class="chao" style="text-align:center"><div style="font-size:40px;font-weight:700">${dung}/${de.length}</div><h1 style="margin:4px 0"><em>${muc}</em></h1><div>🎁 Cảm ơn anh/chị đã mạnh dạn làm bài!</div></div>`;
      e.target.remove(); m.querySelector('#kq').scrollIntoView({ behavior: 'smooth' });
    }, e.target);
  } };

  /* ================= MA TRẬN NGƯỜI × SOP ================= */
  async function maTran() {
    const m = G.khung('Ma trận người × SOP', 'Xanh: đã học trong chu kỳ · vàng: sắp đến hạn học lại · đỏ: quá hạn / chưa học', '#/daotao');
    const [sop, dt, dd] = await Promise.all([sopDs(), G.doc('DaoTao', { 'Trạng thái': TT.ht }), G.doc('DaoTaoDiemDanh', null, 20000)]);
    const ck = +G.caiDat('Chu kỳ học lại (tháng)', 12); const ss = sop.filter((x) => x['Trạng thái'] !== 'Nháp');
    const lan = {}; dd.forEach((r) => { const l = dt.find((x) => x['Mã ĐT'] === r['Mã ĐT']); if (!l) return; String(l['Tài liệu'] || '').split('|').map((s) => s.trim()).filter(Boolean).forEach((s) => { const k = r['Họ tên'] + '|' + s; if (!lan[k] || lan[k] < l['Ngày']) lan[k] = l['Ngày']; }); });
    const mau = (d) => { if (!d) return ['#FBE3E2', '—']; const th = (new Date(hn()) - new Date(d)) / (30.4 * 864e5); return [th > ck ? '#FBE3E2' : th > ck - 2 ? '#F9EEDA' : '#E5F4E4', G.ngayVN(d).slice(0, 5) + '/' + d.slice(2, 4)]; };
    m.innerHTML = ss.length ? `<div class="the cuon-ngang"><table class="bang"><tr><th>Người</th>${ss.map((s) => `<th style="font-size:11px">${esc(s['Mã SOP'])}<div class="mo">${esc(String(s['Tên tài liệu']).slice(0, 18))}</div></th>`).join('')}</tr>
      ${nhomNguoi().map((n) => `<tr><td>${esc(n.ten)}<div class="mo">${n.nhom}</div></td>${ss.map((s) => { const [c, t] = mau(lan[n.ten + '|' + s['Mã SOP']]); return `<td style="background:${c};font-size:11px;text-align:center">${t}</td>`; }).join('')}</tr>`).join('')}</table></div><p class="mo">Chu kỳ học lại: ${ck} tháng (anh đổi trong Cài đặt đào tạo).</p>` : G.trong('Thư viện SOP chưa có bài đang hiệu lực.');
  }

  /* ================= THƯ VIỆN SOP: 4 dạng, phiên bản, 🔊 nghe, bản tiếng Anh ================= */
  G.man.sop = Object.assign(G.man.sop || {}, { ten: 'Thư viện SOP', ic: 'dao_tao', ph: () => true, fn: async (ma, sub) => {
    if (ma && sub === 'sua') return suaSOP(ma);
    if (ma === 'moi') return suaSOP('');
    if (ma) return docSOP(ma);
    const m = G.khung('Thư viện SOP', 'Văn bản · slide · 2 video · ngân hàng câu hỏi', '#/daotao');
    const ds = await sopDs(); const theo = {}; ds.forEach((x) => { (theo[x['Chủ đề'] || 'Khác'] = theo[x['Chủ đề'] || 'Khác'] || []).push(x); });
    m.innerHTML = (anh() ? '<a class="nut chinh rong" href="#/sop/moi" style="margin-bottom:12px">＋ Thêm SOP</a>' : '') + (Object.keys(theo).map((c) => `<h3 class="tieu-nhom">${esc(c)}</h3><div class="ds">${theo[c].map((x) => `<a class="muc" href="#/sop/${encodeURIComponent(x['Mã SOP'])}" style="color:inherit"><div class="gian"><b>${esc(x['Tên tài liệu'])}</b><div class="mo">${esc(x['Mã SOP'])}${x['Phiên bản'] ? ' · bản ' + esc(x['Phiên bản']) : ''}${x['Ngày hiệu lực'] ? ' · hiệu lực ' + G.ngayVN(x['Ngày hiệu lực']) : ''} · ${json(x['Buổi'], []).length || 1} buổi · ${json(x['Câu hỏi'], []).length} câu hỏi</div></div>${x['Trạng thái'] === 'Nháp' ? '<span class="chip cam">Nháp</span>' : ''}›</a>`).join('')}</div>`).join('') || G.trong('Chưa có SOP. Trưởng bộ phận bấm Thêm SOP.'));
  } });
  async function docSOP(ma) {
    const x = (await sopDs()).find((y) => y['Mã SOP'] === ma); if (!x) { location.hash = '#/sop'; return; }
    const en = G.lang() === 'en' && x['Nội dung EN'];
    const buoi = json(en ? x['Buổi EN'] || x['Buổi'] : x['Buổi'], []); const nd = en ? x['Nội dung EN'] : x['Nội dung'] || '';
    const m = G.khung(x['Tên tài liệu'], `${x['Mã SOP']} · bản ${x['Phiên bản'] || '1'} · hiệu lực ${G.ngayVN(x['Ngày hiệu lực'] || '')}`, '#/sop');
    const doc = await G.doc('SOPDoc', { 'Mã SOP': ma }); const daDoc = doc.some((r) => r['Người'] === S.u.ten && r['Phiên bản'] === String(x['Phiên bản'] || '1'));
    const vb = (t) => esc(t).replace(/^## (.*)$/gm, '<h2>$1</h2>').replace(/^- (.*)$/gm, '<li>$1</li>').replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:12px">').replace(/\n{2,}/g, '<br><br>');
    m.innerHTML = `${!daDoc ? `<div class="canh-bao">📢 SOP có phiên bản ${esc(x['Phiên bản'] || '1')}. Đọc xong bấm "Đã đọc".</div>` : ''}
      <div class="nhom-nut" style="margin-bottom:10px;flex-wrap:wrap"><button class="nut" id="nghe">🔊 Nghe</button>${x['Slide'] ? `<a class="nut" href="${esc(x['Slide'])}" target="_blank">🖥 Slide</a>` : ''}${x['Video giải thích'] ? `<a class="nut" href="${esc(x['Video giải thích'])}" target="_blank">▶ Video giải thích</a>` : ''}${x['Video tóm tắt'] ? `<a class="nut" href="${esc(x['Video tóm tắt'])}" target="_blank">▶ Video tóm tắt</a>` : ''}${x['Link'] ? `<a class="nut" href="${esc(x['Link'])}" target="_blank">📄 Tài liệu gốc</a>` : ''}</div>
      ${buoi.length ? `<div class="the"><b>Chia ${buoi.length} buổi 45–60 phút</b>${buoi.map((b, i) => `<div class="mo">Buổi ${i + 1}: ${esc(b.ten || b)}${b.phut ? ' · ' + esc(b.phut) + ' phút' : ''}</div>`).join('')}</div>` : ''}
      <div class="the sop-doc" id="vb">${vb(nd) || '<p class="mo">Chưa có văn bản.</p>'}</div>
      ${json(x['Câu hỏi'], []).length ? `<div class="the"><b>Kiểm tra hiểu bài</b><div class="mo" style="margin:4px 0 8px">${json(x['Câu hỏi'], []).length} câu trong ngân hàng · xáo trộn mỗi lần</div><div class="nhom-nut" style="flex-wrap:wrap"><button class="nut" id="cauNN">🎲 Câu hỏi ngẫu nhiên</button><a class="nut chinh" href="#/thi/-/${encodeURIComponent(ma)}">📝 Làm bài kiểm tra 10 câu</a></div></div>` : ''}
      <div class="nhom-nut" style="margin-bottom:30px">${!daDoc ? '<button class="nut chinh" id="daDoc">✓ Đã đọc</button>' : ''}${anh() ? `<a class="nut" href="#/sop/${encodeURIComponent(ma)}/sua">Sửa / phiên bản mới</a>` : ''}</div>`;
    const cauNN = m.querySelector('#cauNN'); if (cauNN) cauNN.onclick = () => { const ds = json(en && x['Câu hỏi EN'] ? x['Câu hỏi EN'] : x['Câu hỏi'], []); let c = ds[Math.floor(Math.random() * ds.length)];
      hop('Câu hỏi ngẫu nhiên', '<div id="v"></div><div class="nhom-nut" style="margin-top:10px"><button class="nut" id="lai">🎲 Câu khác</button><button class="nut" id="da">Xem đáp án</button><button class="nut chinh" id="ok">Xong</button></div>', (o, dong) => {
        const ve = (moDA) => { o.querySelector('#v').innerHTML = `<div class="the"><b style="font-size:18px">${esc(c.c)}</b>${moDA ? `<div class="mo" style="margin-top:8px">Đáp án: <b>${esc((c.d || [])[c.dung] || '')}</b></div>` : ''}</div>`; };
        ve(false); o.querySelector('#lai').onclick = () => { c = ds[Math.floor(Math.random() * ds.length)]; ve(false); }; o.querySelector('#da').onclick = () => ve(true); o.querySelector('#ok').onclick = dong; }); };
    m.querySelector('#nghe').onclick = (e) => { if (!window.speechSynthesis) return bao('Máy này không hỗ trợ đọc', true); if (speechSynthesis.speaking) { speechSynthesis.cancel(); e.target.textContent = '🔊 Nghe'; return; } const u = new SpeechSynthesisUtterance(m.querySelector('#vb').innerText); u.lang = en ? 'en-US' : 'vi-VN'; u.rate = 0.9; speechSynthesis.speak(u); e.target.textContent = '⏸ Dừng'; };
    const dd = m.querySelector('#daDoc'); if (dd) dd.onclick = () => chay(async () => { await API.goi('ghi', { bang: 'SOPDoc', dong: { 'Mã SOP': ma, 'Phiên bản': String(x['Phiên bản'] || '1'), 'Người': S.u.ten, 'Giờ': API.bayGio() } }); G.taiLai(); });
  }
  async function suaSOP(ma) {
    const ds = await sopDs(); const x = ds.find((y) => y['Mã SOP'] === ma) || {};
    const m = G.khung(ma ? 'Sửa SOP ' + ma : 'Thêm SOP', 'Chỉ Trưởng bộ phận sửa và duyệt · bản mới báo mọi người đọc lại', ma ? '#/sop/' + encodeURIComponent(ma) : '#/sop');
    m.innerHTML = '<div class="the"><div id="f"></div></div><button class="nut chinh rong" id="l" style="margin-bottom:30px">Lưu</button>';
    const lay = G.form(m.querySelector('#f'), [{ k: 'ma', nhan: 'Mã SOP', loai: 'chu', bb: true, gt: x['Mã SOP'] || 'SOP-' + String(ds.length + 1).padStart(2, '0') }, { k: 'ten', nhan: 'Tên SOP', loai: 'chu', bb: true, gt: x['Tên tài liệu'] }, { k: 'cd', nhan: 'Chủ đề', loai: 'chips', ds: S.dm.chuDeSOP || [], gt: x['Chủ đề'] },
      { k: 'pb', nhan: 'Phiên bản', loai: 'chu', gt: x['Phiên bản'] ? String(+x['Phiên bản'] + 1) : '1' }, { k: 'hl', nhan: 'Ngày hiệu lực', loai: 'ngay', gt: hn() }, { k: 'tt', nhan: 'Trạng thái', loai: 'chips', ds: ['Nháp', 'Hiệu lực'], gt: x['Trạng thái'] || 'Nháp' },
      { k: 'buoi', nhan: 'Các buổi (mỗi dòng: tên buổi | số phút)', loai: 'mota', gt: json(x['Buổi'], []).map((b) => (b.ten || b) + (b.phut ? ' | ' + b.phut : '')).join('\n') },
      { k: 'nd', nhan: 'Văn bản (## Tiêu đề mục, - gạch đầu dòng, ![chú thích](link ảnh))', loai: 'mota', gt: x['Nội dung'] || '' }, { k: 'ndEn', nhan: 'English text', loai: 'mota', gt: x['Nội dung EN'] || '' },
      { k: 'slide', nhan: 'Link slide đào tạo', loai: 'chu', gt: x['Slide'] }, { k: 'v1', nhan: 'Video giải thích (YouTube không công khai)', loai: 'chu', gt: x['Video giải thích'] }, { k: 'v2', nhan: 'Video tóm tắt', loai: 'chu', gt: x['Video tóm tắt'] },
      { k: 'ch', nhan: 'Ngân hàng câu hỏi (mỗi câu 1 dòng: Câu hỏi | Đáp án đúng | Sai 1 | Sai 2 | Sai 3)', loai: 'mota', gt: json(x['Câu hỏi'], []).map((c) => [c.c, c.d[c.dung]].concat(c.d.filter((_, i) => i !== c.dung)).join(' | ')).join('\n') },
      { k: 'chEn', nhan: 'Question bank (EN, same format)', loai: 'mota', gt: json(x['Câu hỏi EN'], []).map((c) => [c.c, c.d[c.dung]].concat(c.d.filter((_, i) => i !== c.dung)).join(' | ')).join('\n') }]);
    const docCH = (s) => String(s || '').split('\n').map((l) => l.split('|').map((t) => t.trim())).filter((p) => p.length >= 3 && p[0]).map((p) => ({ c: p[0], d: p.slice(1), dung: 0 }));
    m.querySelector('#l').onclick = (e) => chay(async () => { const v = lay();
      await API.goi('ghiNhieu', { bang: 'ThuVienSOP', thay: ['Mã SOP'], dong: [{ 'Mã SOP': v.ma, 'Tên tài liệu': v.ten, 'Chủ đề': v.cd || '', 'Phiên bản': v.pb, 'Ngày hiệu lực': v.hl, 'Trạng thái': v.tt, 'Buổi': JSON.stringify(String(v.buoi || '').split('\n').filter(Boolean).map((l) => { const [ten, phut] = l.split('|').map((t) => t.trim()); return { ten, phut }; })),
        'Nội dung': v.nd, 'Nội dung EN': v.ndEn, 'Slide': v.slide, 'Video giải thích': v.v1, 'Video tóm tắt': v.v2, 'Câu hỏi': JSON.stringify(docCH(v.ch)), 'Câu hỏi EN': JSON.stringify(docCH(v.chEn)), 'Link': x['Link'] || '', 'Người thêm': S.u.ten, 'Giờ thêm': API.bayGio() }] });
      bao('Đã lưu SOP' + (x['Phiên bản'] && v.pb !== x['Phiên bản'] ? ' · mọi người được báo đọc lại bản mới' : '')); location.hash = '#/sop/' + encodeURIComponent(v.ma); }, e.target);
  }

  /* ---------- chuông: nhắc lớp (trước 1 ngày, đúng ngày), nhắc chấm điểm sau 7 ngày, SOP bản mới ---------- */
  const chuongGoc = G.dsChuong;
  G.dsChuong = async () => {
    const out = await chuongGoc(); try {
      const [dt, sop, doc] = await Promise.all([G.doc('DaoTao', null, 300), sopDs(), G.doc('SOPDoc', null, 5000)]); const mai = G.congNgay(hn(), 1);
      dt.filter((x) => x['Trạng thái'] === TT.duyet && [hn(), mai].includes(x['Ngày KH']) && (x['Giảng viên'] === S.u.ten || anh())).forEach((x) => out.push({ ten: `🎓 Lớp ${x['Ngày KH'] === hn() ? 'hôm nay' : 'ngày mai'}: ${x['Nội dung']}`, phu: `${x['Giờ KH']} · ${x['Địa điểm']}`, link: 'daotao/' + encodeURIComponent(x['Mã ĐT']) }));
      if (anh()) dt.filter((x) => x['Trạng thái'] === TT.ht && x['Nhắc chấm điểm'] && x['Nhắc chấm điểm'] <= hn() && !x['Đã chấm sau học']).forEach((x) => out.push({ ten: '⭐ Chấm điểm hiện trường theo SOP vừa học', phu: x['Nội dung'], link: 'chamdiem' }));
      sop.filter((x) => x['Trạng thái'] === 'Hiệu lực' && !doc.some((r) => r['Mã SOP'] === x['Mã SOP'] && r['Người'] === S.u.ten && r['Phiên bản'] === String(x['Phiên bản'] || '1'))).slice(0, 3).forEach((x) => out.push({ ten: '📚 SOP mới / bản mới: ' + x['Tên tài liệu'], phu: 'Bấm để đọc', link: 'sop/' + encodeURIComponent(x['Mã SOP']) }));
    } catch (e) { /* bỏ qua */ } return out;
  };
})();
