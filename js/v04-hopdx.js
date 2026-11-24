/* GreenLog · Họp đột xuất với chủ đề tự đặt (mục 61) */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hn = () => API.ngay();
  const json = (s, d) => { try { return JSON.parse(s || ''); } catch (e) { return d; } };
  const taoDuoc = () => G.laAnhVu();
  const NOI_BO = ['Lê Vũ', 'Mai Hòa Pháp', 'Phan Văn Thìn', 'Phạm Nhật Trường', 'Nguyễn Tấn Hiệp', 'Lê Hữu Nghị'];
  const DOI = ['Đội khu vực', 'Đội cơ động', 'Nội bộ'];
  const laDX = (h) => h && h['Loại'] === 'Đột xuất';

  const tab = (dang) => `<div class="chon" style="margin-bottom:10px"><a href="#/hop" class="${dang === 'thu2' ? 'dang' : ''}" style="text-decoration:none">Họp thứ Hai</a><a href="#/hop/dotxuat" class="${dang === 'dx' ? 'dang' : ''}" style="text-decoration:none">Họp đột xuất</a></div>`;
  G.tabHop = tab;

  async function danhSach() {
    const m = G.khung('Họp đột xuất', 'Chủ đề tự đặt · biên bản riêng');
    const ds = (await G.doc('Hop', null, 300)).filter(laDX).sort((a, b) => String(b['Bắt đầu']).localeCompare(String(a['Bắt đầu'])));
    m.innerHTML = tab('dx') + (taoDuoc() ? '<a class="nut chinh rong" href="#/hop/dxmoi" style="margin-bottom:12px">＋ Họp đột xuất</a>' : '')
      + `<div class="ds">${ds.length ? ds.map((h) => `<a class="muc" href="#/hop/dx-${encodeURIComponent(h['Mã họp'])}" style="color:inherit;text-decoration:none"><div class="gian"><b>${esc(h['Tiêu đề'])}</b><div class="mo">${esc(G.gioVN(h['Bắt đầu']))} · ${esc(h['Địa điểm'] || '')} · ${json(h['Người dự'], []).length || String(h['Người dự'] || '').split(',').filter(Boolean).length} người dự</div></div><span class="chip ${h['Trạng thái'] === 'Đã kết thúc' ? 'xanh' : 'cam'}">${esc(h['Trạng thái'])}</span></a>`).join('') : G.trong('Chưa có cuộc họp đột xuất nào.')}</div>`;
  }

  async function taoMoi() {
    if (!taoDuoc()) { location.hash = '#/hop/dotxuat'; return; }
    const m = G.khung('＋ Họp đột xuất', 'Chủ đề, người dự, nội dung cần bàn', '#/hop/dotxuat');
    const ghim = (await G.doc('DuaVaoHop', null, 300)).filter((x) => !/Đã họp|Bỏ/.test(x['Trạng thái'] || ''));
    const kk = (await G.doc('KhoKhan', null, 300)).filter((x) => !/Đã xong|Đóng/.test(x['Trạng thái'] || ''));
    const nn = (await G.doc('NhacNho', null, 300)).filter((x) => !/Đã xong|Bỏ/.test(x['Trạng thái'] || ''));
    const keo = [].concat(ghim.map((x) => '📌 ' + (x['Tiêu đề'] || x['Nội dung'] || '')), kk.map((x) => '⚠ ' + (x['Nội dung'] || '')), nn.map((x) => '📣 ' + (x['Nội dung'] || ''))).filter((x) => x.length > 3).slice(0, 40);
    const cn = (S.dm.congnhan || []).filter((x) => x.tt !== 'Đã nghỉ' && !NOI_BO.includes(x.ten)).map((x) => x.ten);
    m.innerHTML = `<div class="the" id="f"></div><div class="the"><b>Người dự</b><div class="mo">Tick từng người có mặt. Không ai được tick sẵn.</div>
      <div class="chon" id="tabNg" style="margin-top:8px"><button type="button" data-t="nb" class="dang">Quản lý · tổ trưởng · nội bộ</button><button type="button" data-t="cn">Công nhân</button><button type="button" data-t="khac">Khác</button></div><div id="dsNg"></div></div>
      ${keo.length ? `<div class="the"><b>Kéo vào nội dung họp</b><div class="mo">Ghi chú 📌, khó khăn ⚠, nhắc nhở 📣 đang mở</div><div id="keo" class="ds"></div></div>` : ''}
      <button class="nut chinh rong" id="l">Tạo cuộc họp</button>`;
    const lay = G.form(m.querySelector('#f'), [{ k: 'td', nhan: 'Chủ đề', loai: 'chu', bb: true, gt: '' }, { k: 'ngay', nhan: 'Ngày', loai: 'ngay', bb: true, gt: hn() }, { k: 'gio', nhan: 'Giờ', loai: 'gio', bb: true, gt: API.bayGio().slice(11, 16) },
      { k: 'dd', nhan: 'Địa điểm', loai: 'chu', bb: true, gt: 'Văn phòng cảnh quan' }, { k: 'nd', nhan: 'Nội dung cần bàn (mỗi dòng một ý)', loai: 'mota', gt: '' }]);
    const chon = new Set(); const khac = []; let t = 'nb';
    const veNg = () => {
      const box = m.querySelector('#dsNg');
      if (t === 'khac') { box.innerHTML = `<div class="hang" style="margin-top:8px"><input id="tenKhac" placeholder="Tên, bộ phận (vd: Chị Lan · Bếp)"><button type="button" class="nut nho" id="themK">＋ Thêm</button></div><div class="mo">${khac.map((x, i) => `${esc(x)} <a href="#" data-xk="${i}">✕</a>`).join(' · ')}</div>`;
        box.querySelector('#themK').onclick = () => { const v = box.querySelector('#tenKhac').value.trim(); if (v) { khac.push(v); veNg(); } };
        box.querySelectorAll('[data-xk]').forEach((a) => { a.onclick = (e) => { e.preventDefault(); khac.splice(+a.dataset.xk, 1); veNg(); }; }); return; }
      const ds = t === 'nb' ? NOI_BO : cn;
      box.innerHTML = `<div class="chon boc" style="margin-top:8px">${ds.map((x) => `<button type="button" data-ng="${esc(x)}" class="${chon.has(x) ? 'dang' : ''}">${chon.has(x) ? '✓ ' : ''}${esc(x)}</button>`).join('')}</div><div class="mo">${chon.size + khac.length} người</div>`;
      box.querySelectorAll('[data-ng]').forEach((b) => { b.onclick = () => { const x = b.dataset.ng; if (chon.has(x)) chon.delete(x); else chon.add(x); veNg(); }; });
    };
    m.querySelectorAll('#tabNg [data-t]').forEach((b) => { b.onclick = () => { t = b.dataset.t; m.querySelectorAll('#tabNg [data-t]').forEach((x) => x.classList.toggle('dang', x === b)); veNg(); }; }); veNg();
    const keoBox = m.querySelector('#keo'); const daKeo = new Set();
    if (keoBox) { keoBox.innerHTML = keo.map((x, i) => `<label class="muc" style="cursor:pointer"><input type="checkbox" data-keo="${i}" style="width:auto"> <span class="gian">${esc(x)}</span></label>`).join('');
      keoBox.querySelectorAll('[data-keo]').forEach((c) => { c.onchange = () => { if (c.checked) daKeo.add(+c.dataset.keo); else daKeo.delete(+c.dataset.keo); }; }); }
    m.querySelector('#l').onclick = (e) => chay(async () => {
      const v = lay(); const ma = G.ma('HDX');
      const dong = String(v.nd || '').split('\n').map((x) => x.trim()).filter(Boolean).concat([...daKeo].map((i) => keo[i])).map((nd) => ({ nd, xl: '' }));
      await API.goi('ghi', { bang: 'Hop', dong: { 'Mã họp': ma, 'Loại': 'Đột xuất', 'Tiêu đề': v.td, 'Bắt đầu': v.ngay + ' ' + v.gio, 'Địa điểm': v.dd, 'Người dự': JSON.stringify([...chon].concat(khac)), 'Trạng thái': 'Đang họp', 'Lưu ý': JSON.stringify(dong), 'Ảnh': '', 'Người lập': '' } });
      bao('Đã tạo cuộc họp'); location.hash = '#/hop/dx-' + encodeURIComponent(ma);
    }, e.target);
  }

  async function chiTiet(ma) {
    const h = (await G.doc('Hop', { 'Mã họp': ma }))[0];
    if (!h) { const m = G.khung('Họp đột xuất', '', '#/hop/dotxuat'); m.innerHTML = G.trong('Không tìm thấy cuộc họp.'); return; }
    const m = G.khung(h['Tiêu đề'], `${G.gioVN(h['Bắt đầu'])} · ${h['Địa điểm'] || ''}`, '#/hop/dotxuat');
    const xong = h['Trạng thái'] === 'Đã kết thúc'; const sua = G.laAnhVu() && !xong;
    const ng = json(h['Người dự'], String(h['Người dự'] || '').split(',').map((x) => x.trim()).filter(Boolean));
    const ds = json(h['Lưu ý'], []);
    const luu = async (doi) => { await API.goi('sua', { bang: 'Hop', khoa: { 'Mã họp': ma }, doi }); };
    m.innerHTML = tab('dx') + `<div class="the ${xong ? 'the-xanh' : 'the-mo'}"><div class="hang"><div class="gian"><b>${esc(h['Tiêu đề'])}</b><div class="mo">Người dự (${ng.length}): ${esc(ng.join(', ')) || '—'}</div></div><span class="chip ${xong ? 'xanh' : 'cam'}">${esc(h['Trạng thái'])}</span></div></div>
      <div class="the"><h2>Nội dung họp</h2>${ds.length ? ds.map((x, i) => `<div class="dong-cham"><div class="gian" style="min-width:200px">${i + 1}. ${esc(x.nd)}${x.phieu ? ` <span class="chip">🎫 ${esc(x.phieu)}</span>` : ''}</div>
        ${sua ? ['Giao phiếu', 'Theo dõi', 'Đã xong', 'Bỏ'].map((k) => `<button class="nut nho ${x.xl === k ? 'chinh' : ''}" data-i="${i}" data-k="${k}">${k}</button>`).join('') : `<span class="chip ${x.xl === 'Đã xong' ? 'xanh' : 'cam'}">${esc(x.xl || 'Chưa xử lý')}</span>`}</div>`).join('') : '<p class="mo">Chưa có nội dung.</p>'}
        ${sua ? '<div class="hang" style="margin-top:8px"><input id="dongMoi" placeholder="Thêm ý trong họp…"><button class="nut nho" id="them">✍ Thêm</button></div>' : ''}</div>
      <div class="the"><h2>Ảnh buổi họp</h2>${h['Ảnh'] ? G.xemAnh(h['Ảnh']) : '<p class="mo">Chưa có ảnh</p>'}${sua ? '<div id="anh"></div><button class="nut nho" id="luuAnh" style="margin-top:6px">Lưu ảnh</button>' : ''}</div>
      <div class="nhom-nut">${sua ? '<button class="nut chinh" id="kt">Kết thúc họp</button>' : ''}<button class="nut" id="pdf">🖨️ Biên bản PDF</button></div>`;
    m.querySelectorAll('[data-k]').forEach((b) => { b.onclick = () => chay(async () => {
      const x = ds[+b.dataset.i]; const k = b.dataset.k; x.xl = k;
      if (k === 'Giao phiếu' && !x.phieu) { const doi = await new Promise((ok) => G.hop('Giao cho đội', `<div class="chon">${DOI.map((d) => `<button data-d="${d}">${d}</button>`).join('')}</div>`, (o, dong) => { o.querySelectorAll('[data-d]').forEach((bb) => { bb.onclick = () => { dong(); ok(bb.dataset.d); }; }); }));
        const p = await API.goi('phieu.tao', { loaiPhieu: 'Họp', nguon: 'Họp đột xuất', nhom: 'Họp', loai: h['Tiêu đề'], muc: 'Trung bình', vtKhac: '', moTa: x.nd, giao: doi }); x.phieu = p.ma; }
      await luu({ 'Lưu ý': JSON.stringify(ds) }); G.taiLai(); }, b); });
    const th = m.querySelector('#them'); if (th) th.onclick = () => chay(async () => { const v = m.querySelector('#dongMoi').value.trim(); if (!v) return; ds.push({ nd: v, xl: '', moi: true }); await luu({ 'Lưu ý': JSON.stringify(ds) }); G.taiLai(); }, th);
    const anhBox = m.querySelector('#anh'); let layAnh = null; if (anhBox) layAnh = G.oAnh(anhBox, { toiDa: 4, tuyChon: true });
    const la = m.querySelector('#luuAnh'); if (la) la.onclick = () => chay(async () => { const a = layAnh ? layAnh() : []; if (!a.length) throw new Error('Chưa chọn ảnh'); await luu({ 'Ảnh': [h['Ảnh']].concat(a).filter(Boolean).join(' | ') }); G.taiLai(); }, la);
    const kt = m.querySelector('#kt'); if (kt) kt.onclick = () => chay(async () => { if (!(await G.xacNhan('Kết thúc họp? Biên bản sẽ khóa.'))) return; await luu({ 'Trạng thái': 'Đã kết thúc', 'Kết thúc': API.bayGio() }); bao('Đã kết thúc · biên bản đã khóa'); G.taiLai(); }, kt);
    m.querySelector('#pdf').onclick = () => chay(async () => {
      const tr = ds.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.nd)}</td><td>${esc(x.xl || '')}${x.phieu ? ' · ' + esc(x.phieu) : ''}</td></tr>`).join('');
      G.inA4('Biên bản ' + h['Tiêu đề'], `<style>body{font-family:Arial;color:#123524;margin:18mm}h1{font-size:20px;margin:0}table{width:100%;border-collapse:collapse;margin-top:10px}td,th{border:1px solid #C9D3CC;padding:6px;font-size:13px;text-align:left}th{background:#123524;color:#fff}.mo{color:#555;font-size:13px}</style>
        <div style="border-bottom:4px solid #C9E265;padding-bottom:8px;margin-bottom:10px"><div class="mo">GreenLog · Bộ phận Cảnh quan · Mövenpick Resort Waverly Phu Quoc</div><h1>BIÊN BẢN HỌP: ${esc(h['Tiêu đề'])}</h1>
        <div class="mo">${esc(G.gioVN(h['Bắt đầu']))} · ${esc(h['Địa điểm'] || '')} · ${esc(h['Trạng thái'])}</div></div>
        <p><b>Người dự (${ng.length}):</b> ${esc(ng.join(', '))}</p><table><tr><th>#</th><th>Nội dung</th><th>Xử lý</th></tr>${tr}</table>
        ${h['Ảnh'] ? `<div style="margin-top:10px">${API.dsAnh(h['Ảnh']).map((a) => `<img src="${esc(API.anhUrl(a))}" style="width:48%;margin:1%">`).join('')}</div>` : ''}
        <p class="mo" style="margin-top:20px">Chủ trì: Lê Vũ – Trưởng bộ phận Cảnh Quan</p>`);
    });
  }

  const goc = G.man.hop.fn;
  G.man.hop = Object.assign(G.man.hop, { ten: 'Họp', fn: async (ma) => {
    if (ma === 'dotxuat') return danhSach();
    if (ma === 'dxmoi') return taoMoi();
    if (/^dx-/.test(ma || '')) return chiTiet(decodeURIComponent(ma.slice(3)));
    await goc(ma);
    if (!ma) { const m = document.getElementById('noiDung'); if (m && !m.querySelector('.tab-hop')) m.insertAdjacentHTML('afterbegin', tab('thu2').replace('class="chon"', 'class="chon tab-hop"')); }
  } });
})();
