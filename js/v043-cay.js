/* GreenLog 0.4.3 – mục 88: cây nội thất bất thường
   - Nhân viên báo nhiều cây trong một lần ghi (mỗi cây: tên, tình trạng – chọn nhiều, ảnh). Lưu xong việc tưới điểm đó XONG luôn.
   - Trưởng bộ phận xem từng cây: "Chỉ theo dõi" (đóng) hoặc "Giao xử lý" → app tự tạo phiếu giao nội bộ.
   - Nhân viên làm theo phiếu, báo xong có ảnh → phiếu rời danh sách của nhân viên, sang "Chờ nghiệm thu" của Trưởng bộ phận.
   - Trưởng bộ phận duyệt nghiệm thu (được duyệt nhiều phiếu một lần) hoặc yêu cầu làm lại → phiếu hiện lại cho nhân viên. */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay, bao, q } = G;
  const hn = () => API.ngay();
  const diem = (l) => (S.dm.diemkhac || []).filter((x) => x.loai === l);
  const tenDiem = (ma) => (diem('Cây nội thất').find((p) => p.ma === ma) || {}).ten || G.tenVT(ma);
  const LOAI_PHIEU = 'Xử lý cây nội thất';
  const khoaBT = (x) => (x['Mã BT'] ? { 'Mã BT': x['Mã BT'] } : { 'Ngày': x['Ngày'], 'Mã điểm': x['Mã điểm'], 'Tên cây': x['Tên cây'] });
  const CAU_MAU = ['Cắt bỏ lá vàng, lá héo', 'Tưới ít lại, để khô mặt đất 2–3 cm rồi tưới', 'Chuyển chậu ra chỗ có ánh sáng', 'Lau lá, kiểm tra rệp mặt dưới lá', 'Phun thuốc theo hướng dẫn', 'Đổi chậu, thay đất', 'Thay cây khác, đưa cây về vườn ươm'];

  /* ---------- 1. Form ghi cây nội thất: nhiều cây bất thường ---------- */
  function moForm(p) {
    G.hop(p.ten, '<div id="f"></div><div id="btDS" hidden></div><button type="button" class="nut rong" id="themCay" hidden style="margin:6px 0 10px">＋ Thêm cây khác</button><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const phanLa = S.dm.thuoc.filter((t) => /phân|kích|vitamin|atonik/i.test(t.nhom + ' ' + t.ten)).map((t) => t.tenNgan || t.ten);
      const LOC_PHAN = { 'Bón phân hạt': /hạt|npk|tan chậm|osmocote|hữu cơ/i, 'Tưới phân': /hòa tan|tan nhanh|npk|dạng lỏng|đạm|ure/i, 'Phun phân bón lá': /lá|kích|atonik|vitamin|vi lượng/i };
      let viec = 'Tưới nước';
      const dsPhan = () => { const re = LOC_PHAN[viec]; const l = re ? S.dm.thuoc.filter((t) => /phân|kích|vitamin|atonik/i.test(t.nhom + ' ' + t.ten) && re.test(t.nhom + ' ' + t.ten + ' ' + (t.dang || ''))).map((t) => t.tenNgan || t.ten) : []; return l.length ? l : phanLa; };
      const lay = G.form(o.querySelector('#f'), [{ k: 'viec', nhan: 'Việc đã làm', loai: 'chips', ds: S.dm.viecNT, bb: true, gt: 'Tưới nước', doi: (v) => { viec = v; } }, { k: 'sc', nhan: 'Số chậu', loai: 'so', bb: true },
        { k: 'phan', nhan: 'Tên phân', loai: 'chonds', get ds() { return dsPhan(); }, bb: true, khi: (v) => v.viec && v.viec !== 'Tưới nước' },
        { k: 'anhHT', nhan: 'Ảnh hiện trường', loai: 'anh', toiDa: 3, khi: (v) => v.btv !== 'Có' },
        { k: 'btv', nhan: 'Có cây bất thường?', loai: 'chips', ds: ['Không', 'Có'], gt: 'Không' }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
      const vung = o.querySelector('#btDS'); const nutThem = o.querySelector('#themCay'); const the = [];
      const themThe = () => { const el = document.createElement('div'); el.className = 'the bt-the'; const n = the.length + 1;
        el.innerHTML = `<div class="hang"><b class="gian">Cây ${n}</b>${n > 1 ? '<button type="button" class="nut nho" data-bo>Bỏ cây này</button>' : ''}</div><div class="f"></div>`; vung.appendChild(el);
        const l2 = G.form(el.querySelector('.f'), [{ k: 'cay', nhan: 'Cây', loai: 'cay', bb: true }, { k: 'tt', nhan: 'Tình trạng (chọn được nhiều)', loai: 'nhieu', ds: S.dm.batthuong, bb: true }, { k: 'anh', nhan: 'Ảnh cây này', loai: 'anh', toiDa: 3 }]);
        const x = { el, lay: l2 }; the.push(x);
        const bo = el.querySelector('[data-bo]'); if (bo) bo.onclick = () => { el.remove(); the.splice(the.indexOf(x), 1); vung.dispatchEvent(new Event('gl-doi', { bubbles: true })); }; };
      const capNhat = () => { const co = (o.querySelector('[data-fo] .dang[data-v="Có"]') || [...o.querySelectorAll('.chon button.dang')].find((b) => b.textContent.trim() === 'Có'));
        vung.hidden = !co; nutThem.hidden = !co; if (co && !the.length) themThe(); };
      o.addEventListener('click', () => setTimeout(capNhat, 0)); capNhat();
      nutThem.onclick = () => themThe();
      o.querySelector('#l').onclick = (e) => chay(async () => {
        const v = lay(); const co = v.btv === 'Có';
        const cay = co ? the.map((t) => t.lay()) : [];
        if (co && !cay.length) throw new Error('Thêm ít nhất 1 cây bất thường');
        if (co && cay.some((c) => !c.anh || !c.anh.length)) throw new Error('Mỗi cây bất thường cần ít nhất 1 ảnh');
        const anhHT = co ? cay.flatMap((c) => c.anh) : v.anhHT;
        await API.goi('ghi', { bang: 'CayNoiThat', dong: { 'Ngày': '', 'Mã điểm': p.ma, 'Việc': v.viec, 'Tên phân': v.phan ? v.phan.ten || v.phan : '', 'Số chậu tưới': v.sc, 'Bất thường': co ? cay.length + ' cây' : '', 'Ảnh': anhHT, 'Ghi chú': v.gc, 'Người ghi': '' } });
        for (const c of cay) await API.goi('ghi', { bang: 'BatThuong', dong: { 'Mã BT': G.ma('BT'), 'Ngày': '', 'Mã điểm': p.ma, 'Mã vị trí': p.ma, 'Tên cây': c.cay.ten || c.cay, 'Tình trạng': [].concat(c.tt).join(', '), 'Ảnh': c.anh, 'Ghi chú': v.gc || '', 'Người báo': '', 'Trạng thái': 'Chờ Trưởng bộ phận' } });
        dong(); bao(co ? `Đã lưu · báo ${cay.length} cây bất thường cho Trưởng bộ phận` : 'Đã lưu'); G.taiLai();
      }, e.target);
    });
  }
  const nbFn = G.man.nb.fn;
  G.man.nb.fn = async (loai, ...r) => {
    await nbFn(loai, ...r); if (loai !== 'noithat') return; const m = document.getElementById('noiDung'); if (!m) return;
    m.querySelectorAll('[data-p]').forEach((b) => { const p = diem('Cây nội thất').find((x) => x.ma === b.dataset.p); if (p) b.onclick = (e) => { e.stopImmediatePropagation(); moForm(p); }; });
    const cu = m.querySelector('a.the-do[href="#/batthuong"]'); if (cu && !G.laAnhVu()) cu.remove(); // nhân viên không còn "việc trao đổi" treo; xử lý qua phiếu
  };

  /* ---------- 2. Trưởng bộ phận: Chờ xử lý · Đã giao phiếu · Chờ nghiệm thu ---------- */
  const btFn = G.man.batthuong.fn;
  G.man.batthuong.fn = async (ma) => {
    if (!G.laAnhVu()) return btFn(ma);
    const d = await G.docNhieu([{ bang: 'BatThuong', gioiHan: 500 }, { bang: 'Phieu', gioiHan: 800 }]);
    const ds = (d.BatThuong || []).filter((x) => x['Mã điểm'] || /^NT/.test(x['Mã vị trí'] || '')).reverse();
    const ph = (d.Phieu || []).filter((p) => p['Loại'] === LOAI_PHIEU);
    const phCua = (x) => ph.find((p) => p['Mã phiếu'] === x['Mã phiếu']);
    if (ma) return chiTiet(ds.find((x) => G.maBT(x) === ma), phCua);
    const m = G.khung('Cây nội thất bất thường', 'Xem ảnh → chỉ theo dõi, hoặc giao xử lý (app tự tạo phiếu)', '#/nb/noithat');
    const cho = ds.filter((x) => !/Đã đóng|Đã giao phiếu|Theo dõi/.test(x['Trạng thái'] || ''));
    const nghiemThu = ph.filter((p) => p['Trạng thái'] === 'Báo xong');
    const dangLam = ph.filter((p) => !/Báo xong|Đã duyệt/.test(p['Trạng thái']));
    const dong1 = (x) => `<a class="muc" href="#/batthuong/${encodeURIComponent(G.maBT(x))}" style="color:inherit">${G.xemAnh ? `<span class="bt-nho">${G.xemAnh(String(x['Ảnh'] || '').split(' | ')[0] || '')}</span>` : ''}<div class="gian"><b>${esc(x['Tên cây'])} · ${esc(x['Tình trạng'])}</b><div class="mo">${esc(tenDiem(x['Mã điểm']))} · ${G.ngayVN(x['Ngày'])} · ${esc(x['Người báo'] || '')}</div></div>›</a>`;
    m.innerHTML = `<h3 class="tieu-nhom">🥀 Chờ anh xử lý (${cho.length})</h3><div class="ds">${cho.map(dong1).join('') || '<div class="muc mo">Không có</div>'}</div>
      <h3 class="tieu-nhom">✅ Chờ nghiệm thu (${nghiemThu.length})</h3>${nghiemThu.length ? `<div class="ds">${nghiemThu.map((p) => `<div class="muc"><label class="hang gian" style="cursor:pointer"><input type="checkbox" data-nt="${esc(p['Mã phiếu'])}" checked><div class="gian"><b>${esc(p['Mô tả'])}</b><div class="mo">${esc(p['Mã phiếu'])} · báo xong ${esc(G.gioVN(p['Giờ xong'] || ''))}</div>${G.xemAnh ? G.xemAnh(p['Ảnh sau'] || p['Ảnh xong'] || '') : ''}</div></label><button class="nut nho" data-lai="${esc(p['Mã phiếu'])}">↺ Làm lại</button></div>`).join('')}</div>
        <button class="nut chinh rong" id="duyetNT" style="margin-top:8px">✓ Duyệt nghiệm thu các phiếu đã chọn</button>` : '<div class="ds"><div class="muc mo">Không có</div></div>'}
      <h3 class="tieu-nhom">🔧 Nhân viên đang xử lý (${dangLam.length})</h3><div class="ds">${dangLam.map((p) => `<div class="muc"><div class="gian"><b>${esc(p['Mô tả'])}</b><div class="mo">${esc(p['Mã phiếu'])} · ${esc(p['Trạng thái'])} · hạn ${esc(G.gioVN(p['Hạn'] || ''))}</div></div></div>`).join('') || '<div class="muc mo">Không có</div>'}</div>`;
    const nt = m.querySelector('#duyetNT'); if (nt) nt.onclick = (e) => chay(async () => { const chon = [...m.querySelectorAll('[data-nt]:checked')].map((x) => x.dataset.nt); if (!chon.length) throw new Error('Chưa chọn phiếu nào');
      for (const ma2 of chon) { await API.goi('phieu.chuyen', { ma: ma2, hd: 'duyet', ghiChu: 'Duyệt nghiệm thu' }); const bt = ds.find((x) => x['Mã phiếu'] === ma2); if (bt) await API.goi('sua', { bang: 'BatThuong', khoa: khoaBT(bt), doi: { 'Trạng thái': 'Đã đóng', 'Ngày đóng': hn() } }); }
      bao(`Đã duyệt nghiệm thu ${chon.length} phiếu`); G.taiLai(); }, e.target);
    m.querySelectorAll('[data-lai]').forEach((b) => { b.onclick = async () => { const ly = await G.hoi('Lý do yêu cầu làm lại'); if (ly == null) return;
      chay(async () => { await API.goi('phieu.chuyen', { ma: b.dataset.lai, hd: 'traLai', ghiChu: 'Trưởng bộ phận yêu cầu làm lại: ' + ly }); await API.goi('sua', { bang: 'Phieu', khoa: { 'Mã phiếu': b.dataset.lai }, doi: { 'Yêu cầu làm lại': ly } }); bao('Đã gửi lại cho nhân viên'); G.taiLai(); }, b); }; });
  };
  function chiTiet(x, phCua) {
    if (!x) { location.hash = '#/batthuong'; return; }
    const m = G.khung(x['Tên cây'] + ' · ' + x['Tình trạng'], tenDiem(x['Mã điểm']), '#/batthuong');
    const p = phCua(x); const xong = /Đã đóng|Theo dõi/.test(x['Trạng thái'] || '');
    m.innerHTML = `<div class="the"><b>Báo lúc ${G.ngayVN(x['Ngày'])} · ${esc(x['Người báo'] || '')}</b>${x['Ghi chú'] ? `<p style="margin:6px 0">${esc(x['Ghi chú'])}</p>` : ''}${G.xemAnh(x['Ảnh'])}</div>
      ${p ? `<div class="the the-xanh"><b>Đã giao phiếu ${esc(p['Mã phiếu'])}</b><div class="mo">${esc(p['Mô tả'])} · ${esc(p['Trạng thái'])}</div></div>` : xong ? `<div class="chip xanh">${esc(x['Trạng thái'])}</div>`
        : `<div class="the"><h2>Anh quyết định</h2><button class="nut rong" id="theoDoi" style="margin-bottom:10px">👁 Chỉ theo dõi, không cần xử lý</button>
          <div id="f"></div><button class="nut chinh rong" id="giao">Giao xử lý · tạo phiếu cho nội bộ</button></div>`}`;
    if (p || xong) return;
    m.querySelector('#theoDoi').onclick = (e) => chay(async () => { await API.goi('sua', { bang: 'BatThuong', khoa: khoaBT(x), doi: { 'Trạng thái': 'Theo dõi', 'Ngày đóng': hn() } }); bao('Đã ghi: chỉ theo dõi'); location.hash = '#/batthuong'; }, e.target);
    const lay = G.form(m.querySelector('#f'), [{ k: 'mau', nhan: 'Hướng dẫn mẫu (chạm để điền)', loai: 'chips', ds: CAU_MAU, doi: (v) => { const t = m.querySelector('textarea'); if (t) t.value = v; } },
      { k: 'nd', nhan: 'Cách xử lý (gõ hoặc bấm 🎤 nói)', loai: 'mota', bb: true }, { k: 'han', nhan: 'Hạn', loai: 'chips', ds: ['Hôm nay', 'Ngày mai', '3 ngày'], gt: 'Ngày mai', bb: true }]);
    m.querySelector('#giao').onclick = (e) => chay(async () => { const v = lay(); const han = G.congNgay(hn(), { 'Hôm nay': 0, 'Ngày mai': 1, '3 ngày': 3 }[v.han] || 1) + ' 17:00';
      const r = await API.goi('phieu.tao', { loaiPhieu: LOAI_PHIEU, nguon: 'Cây nội thất bất thường', nhom: 'Cây nội thất', loai: LOAI_PHIEU, muc: v.han === 'Hôm nay' ? 'Cao' : 'Trung bình', vtKhac: tenDiem(x['Mã điểm']),
        moTa: `${x['Tên cây']} (${x['Tình trạng']}) tại ${tenDiem(x['Mã điểm'])}: ${v.nd}`, giao: 'Nội bộ', anh: String(x['Ảnh'] || '').split(' | ').filter(Boolean) });
      await API.goi('sua', { bang: 'Phieu', khoa: { 'Mã phiếu': r.ma }, doi: { 'Hạn': han, 'Mã BT': x['Mã BT'] || '' } });
      await API.goi('sua', { bang: 'BatThuong', khoa: khoaBT(x), doi: { 'Trạng thái': 'Đã giao phiếu', 'Mã phiếu': r.ma, 'Trả lời của Trưởng bộ phận': v.nd, 'Giờ trả lời': API.bayGio() } });
      bao('Đã tạo phiếu ' + r.ma + ' · Hiệp, Nghị nhận việc'); location.hash = '#/batthuong'; }, e.target);
  }
})();
