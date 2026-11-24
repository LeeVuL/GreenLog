/* GreenLog – dịch hại, nhật ký phun bón, danh mục thuốc, sổ trồng cây, cây bất thường, AI */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, hop, bao } = G;
  const TT_DH = 'Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)';
  const MAU_DH = { 'Phát hiện': 'cam', 'Đang xử lý': '', 'Báo xong': 'xanh', 'Đã duyệt': 'xanh', 'Bị trả lại': 'do' };

  /* ================= HỒ SƠ DỊCH HẠI ================= */
  G.man.dichhai = { ten: 'Hồ sơ dịch hại', bt: '🐛', nhom: 'Cây xanh', ph: 'phieu', fn: manDichHai };
  async function manDichHai() {
    const st = manDichHai.st || (manDichHai.st = { tab: 'mo' });
    const m = G.khung('Hồ sơ dịch hại', 'Phát hiện → xử lý → báo xong → duyệt');
    const d = await API.goi('docNhieu', { ds: [{ bang: 'DichHai', gioiHan: 300 }, { bang: 'DichHaiCapNhat', gioiHan: 1000 }] });
    const ds = d.DichHai.reverse();
    const TAB = { mo: ['Phát hiện', 'Đang xử lý', 'Bị trả lại'], cho: ['Báo xong'], xong: ['Đã duyệt'] };
    const loc = ds.filter((r) => TAB[st.tab].includes(r[TT_DH]));
    // cảnh báo bùng phát: ≥3 vị trí cùng loại trong 7 ngày
    const tu7 = G.congNgay(API.ngay(), -7); const dem = {};
    ds.filter((r) => r['Ngày phát hiện'] >= tu7).forEach((r) => { (dem[r['Loại dịch hại']] = dem[r['Loại dịch hại']] || new Set()).add(r['Mã vị trí'] || r['Vị trí chi tiết']); });
    const bung = Object.keys(dem).filter((k) => dem[k].size >= 3 && k !== 'Chưa rõ');
    m.innerHTML = (bung.length ? `<div class="canh-bao do">⚠️ Có thể bùng phát: ${bung.map((k) => `${esc(k)} ở ${dem[k].size} vị trí trong 7 ngày`).join('; ')}</div>` : '')
      + (q('phieu') >= 2 ? '<button class="nut chinh rong" id="moi" style="margin-bottom:12px">＋ Báo phát hiện dịch hại</button>' : '')
      + `<div class="chon">${[['mo', 'Đang theo dõi'], ['cho', 'Chờ duyệt'], ['xong', 'Đã xong']].map((t) => `<button data-t="${t[0]}" class="${st.tab === t[0] ? 'dang' : ''}">${t[1]} (${ds.filter((r) => TAB[t[0]].includes(r[TT_DH])).length})</button>`).join('')}</div>
      <div class="ds">${loc.length ? loc.map((r) => {
        const cn = d.DichHaiCapNhat.filter((x) => x['Mã DH'] === r['Mã DH']);
        const cuoi = cn.length ? cn[cn.length - 1]['Thời điểm'] : r['Ngày phát hiện'];
        const im = Math.round((Date.now() - new Date(String(cuoi).slice(0, 10))) / 864e5);
        return `<div class="muc" data-ma="${esc(r['Mã DH'])}" style="cursor:pointer"><div class="gian"><b>${esc(r['Loại dịch hại'])} · ${esc(r['Tên cây'])}</b>
          <div class="mo">📍 ${esc(G.tenVT(r['Mã vị trí'], r['Vị trí chi tiết']))} · ${esc(r['Phạm vi (Vài cây/Một mảng/Cả khu vực)'])}</div>
          <div class="mo">Phát hiện ${G.ngayVN(r['Ngày phát hiện'])} · ${cn.length} lần cập nhật${st.tab === 'mo' && im >= 7 ? ` · <b style="color:var(--do)">${im} ngày chưa cập nhật</b>` : ''}</div></div>
          <div style="text-align:right"><span class="chip ${r['Mức độ'] === 'Nặng' || r['Mức độ'] === 'Rất nặng' ? 'do' : 'cam'}">${esc(r['Mức độ'])}</span><br><span class="chip ${MAU_DH[r[TT_DH]]}" style="margin-top:4px">${esc(r[TT_DH])}</span></div></div>`;
      }).join('') : '<div class="muc mo">Không có hồ sơ</div>'}</div>`;
    m.querySelectorAll('[data-t]').forEach((b) => { b.onclick = () => { st.tab = b.dataset.t; manDichHai(); }; });
    m.querySelectorAll('[data-ma]').forEach((r) => { r.onclick = () => chiTiet(ds.find((x) => x['Mã DH'] === r.dataset.ma), d.DichHaiCapNhat.filter((x) => x['Mã DH'] === r.dataset.ma)); });
    const moi = m.querySelector('#moi'); if (moi) moi.onclick = () => taoDH();
  }
  const nhomCayDK = (nhom) => (/bóng mát/i.test(nhom) ? S.dm.nhomCayDK[1] : /cỏ/i.test(nhom) ? S.dm.nhomCayDK[2] : S.dm.nhomCayDK[0]);
  function taoDH() {
    hop('Báo phát hiện dịch hại', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu hồ sơ</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [
        { k: 'vt', nhan: 'Vị trí (cụm → vị trí)', loai: 'vitri', bb: true, opt: { caNhom: true } }, { k: 'ct', nhan: 'Vị trí chi tiết', loai: 'chu', goiY: 'Ví dụ: bồn trước cửa villa, hàng dừa sát biển' },
        { k: 'pv', nhan: 'Phạm vi', loai: 'chips', ds: S.dm.phamVi, bb: true }, { k: 'cay', nhan: 'Cây / cỏ bị hại', loai: 'cay', bb: true },
        { k: 'loai', nhan: 'Loại dịch hại', loai: 'chonds', ds: S.dm.dichHai, bb: true, goiY: 'Bấm để chọn ("Chưa rõ" nếu không biết)' },
        { k: 'muc', nhan: 'Mức độ', loai: 'chips', ds: S.dm.mucDoDH.map((x) => x.ten), bb: true }, { nhan: S.dm.mucDoDH.map((x) => `${x.ten}: ${x.tyLe}`).join(' · '), loai: 'ghichu' },
        { k: 'anh', nhan: 'Ảnh (cận cảnh + toàn cảnh)', loai: 'anh', bb: true, toiDa: 4 }, { k: 'mt', nhan: 'Mô tả thêm', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => {
        const v = lay(); const vt = v.vt; const cay = v.cay;
        const r = await API.goi('ghi', { bang: 'DichHai', dong: { 'Mã DH': '', 'Ngày phát hiện': API.ngay(), 'Cụm': vt.cum || (vt.caNhom ? vt.ten : G.cumCua(vt.ma)), 'Mã vị trí': vt.ma || '', 'Vị trí chi tiết': v.ct || (vt.ma ? '' : vt.ten),
          'Phạm vi (Vài cây/Một mảng/Cả khu vực)': v.pv, 'Nhóm cây': cay.nhom || '', 'Tên cây': cay.ten, 'Loại dịch hại': v.loai.ten, 'Mức độ': v.muc, 'Mô tả': v.mt, 'Ảnh': v.anh,
          'Người phát hiện': '', [TT_DH]: 'Phát hiện', 'Số lần trả lại': '0', 'Cập nhật gần nhất': '' } });
        dong(); bao('Đã tạo hồ sơ ' + r['Mã DH'] + (/dừa|cọ|chà là/i.test(cay.ten) ? ' · sâu hại dừa: anh Vũ được báo ngay' : '')); manDichHai();
      }, e.target);
    });
  }
  function chiTiet(r, cn) {
    const tt = r[TT_DH]; const ghi = q('phieu') >= 2; const duyet = q('phieu') >= 3;
    hop(`${r['Loại dịch hại']} · ${r['Tên cây']}`, `<div class="hang" style="flex-wrap:wrap;margin-bottom:6px"><span class="chip">${esc(r['Mức độ'])}</span><span class="chip ${MAU_DH[tt]}">${esc(tt)}</span><span class="mo">${esc(r['Mã DH'])}</span></div>
      <p class="mo" style="margin-top:0">📍 ${esc(G.tenVT(r['Mã vị trí'], r['Vị trí chi tiết'] || r['Cụm']))}${r['Vị trí chi tiết'] && r['Mã vị trí'] ? ' · ' + esc(r['Vị trí chi tiết']) : ''}<br>${esc(r['Phạm vi (Vài cây/Một mảng/Cả khu vực)'])} · ${esc(r['Nhóm cây'])}<br>Phát hiện ${G.ngayVN(r['Ngày phát hiện'])} bởi ${esc(r['Người phát hiện'])}</p>
      ${r['Mô tả'] ? `<p>${esc(r['Mô tả'])}</p>` : ''}<div>${G.xemAnh(r['Ảnh'])}</div>
      <h3 style="margin:12px 0 6px;font-size:14px">Diễn biến (${cn.length})</h3>
      ${cn.map((x) => `<div class="the" style="padding:10px"><b>${esc(G.gioVN(x['Thời điểm']))}</b> · ${esc(x['Người ghi'])}${x['Mức độ hiện tại'] ? ` · <span class="chip">${esc(x['Mức độ hiện tại'])}</span>` : ''}<div>${esc(x['Việc đã làm'])}${x['Ghi chú'] ? ' · ' + esc(x['Ghi chú']) : ''}</div>${x['Tính luôn định kỳ'] ? `<div class="mo">✓ Tính luôn ${esc(x['Tính luôn định kỳ'])}</div>` : ''}<div>${G.xemAnh(x['Ảnh'])}</div></div>`).join('') || '<p class="mo">Chưa cập nhật.</p>'}
      ${r['Ảnh xong'] ? `<div class="mo">Ảnh báo xong</div><div>${G.xemAnh(r['Ảnh xong'])}</div>` : ''}
      <div id="phacDo"></div><div id="hd" style="margin-top:12px"></div>`, (o, dong) => {
      const hd = o.querySelector('#hd');
      if (G.phacDo) G.docNhieu([{ bang: 'NhatKyPhunBon', gioiHan: 1000 }, { bang: 'NhatKyPhunBonChiTiet', gioiHan: 3000 }, { bang: 'Phieu', gioiHan: 800 }]).then((x) => { const el = o.querySelector('#phacDo'); if (el) el.innerHTML = G.phacDo(r, cn, x.NhatKyPhunBon, x.NhatKyPhunBonChiTiet, x.Phieu); }).catch(() => {});
      const guiZ = () => G.guiZalo(`🐛 Dịch hại ${r['Mã DH']} · ${r['Mức độ']}\n${r['Loại dịch hại']} trên ${r['Tên cây']}\n📍 ${G.tenVT(r['Mã vị trí'], r['Vị trí chi tiết'] || r['Cụm'])} · ${r['Phạm vi (Vài cây/Một mảng/Cả khu vực)']}\nTrạng thái: ${tt}`, 'dichhai');
      setTimeout(() => { const z = G.h(G.nutZalo('zaloDH')); z.onclick = guiZ; hd.appendChild(z); });
      if (ghi && tt !== 'Báo xong' && tt !== 'Đã duyệt') {
        hd.innerHTML = '<div class="nhom-nut"><button class="nut" id="cn">＋ Cập nhật xử lý</button><button class="nut chinh" id="xong">Báo xong</button></div><a class="nut rong" style="margin-top:8px" href="#/phunbon/moi/' + encodeURIComponent(r['Mã DH']) + '">🧪 Ghi nhật ký phun cho hồ sơ này</a>';
        hd.querySelector('#cn').onclick = () => { dong(); capNhat(r); };
        hd.querySelector('#xong').onclick = () => { dong(); baoXong(r); };
      }
      if (duyet && tt === 'Báo xong') {
        hd.innerHTML = '<div class="nhom-nut"><button class="nut" id="tra">Trả lại</button><button class="nut chinh" id="ok">Duyệt</button></div>';
        hd.querySelector('#ok').onclick = (e) => chay(async () => { await API.goi('sua', { bang: 'DichHai', khoa: { 'Mã DH': r['Mã DH'] }, doi: { [TT_DH]: 'Đã duyệt', 'Người duyệt': S.u.ten } }); if (G.sauDuyetDH) await G.sauDuyetDH(r); dong(); bao('Đã duyệt'); manDichHai(); }, e.target);
        hd.querySelector('#tra').onclick = async (e) => { const g = await G.hoi('Lý do trả lại'); if (g === null) return; chay(async () => { await API.goi('sua', { bang: 'DichHai', khoa: { 'Mã DH': r['Mã DH'] }, doi: { [TT_DH]: 'Đang xử lý', 'Số lần trả lại': +r['Số lần trả lại'] + 1 }, lyDo: g }); await API.goi('ghi', { bang: 'DichHaiCapNhat', dong: { 'Mã DH': r['Mã DH'], 'Thời điểm': '', 'Việc đã làm': 'Anh Vũ trả lại: ' + g, 'Người ghi': '' } }); dong(); bao('Đã trả lại'); manDichHai(); }, e.target); };
      }
    }, true);
  }
  function capNhat(r) {
    const nk = nhomCayDK(r['Nhóm cây']);
    hop('Cập nhật xử lý', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu cập nhật</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [
        { k: 'viec', nhan: 'Việc đã làm', loai: 'nhieu', ds: ['Phun thuốc', 'Cắt bỏ phần bị hại', 'Bón phân, kích rễ', 'Bắt, diệt thủ công', 'Theo dõi thêm', 'Khác'], bb: true },
        { k: 'muc', nhan: 'Mức độ hiện tại', loai: 'chips', ds: S.dm.mucDoDH.map((x) => x.ten), gt: r['Mức độ'] },
        { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }, { k: 'anh', nhan: 'Ảnh', loai: 'anh', toiDa: 4 },
        { k: 'dk', nhan: `Tính luôn việc định kỳ (${nk.viec.map(G.dvTen).join(', ')})`, loai: 'nhieu', ds: r['Phạm vi (Vài cây/Một mảng/Cả khu vực)'] === 'Cả khu vực' && r['Mã vị trí'] ? ['Đã làm cả khu vực → tính luôn'] : [] },
        { nhan: r['Phạm vi (Vài cây/Một mảng/Cả khu vực)'] === 'Cả khu vực' && r['Mã vị trí'] ? 'Chỉ chọn khi đã làm hết cả khu vực, không chỉ vài cây.' : 'Chỉ tính luôn việc định kỳ khi hồ sơ là "Cả khu vực" của một vị trí cụ thể.', loai: 'ghichu' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => {
        const v = lay(); const tinh = v.dk.length > 0;
        if (tinh && !v.anh.length) throw new Error('Tính luôn việc định kỳ cần ảnh');
        if (tinh) await API.goi('dinhKy.luu', { viec: nk.viec[0], anh: v.anh, maDH: r['Mã DH'], ghiChu: 'Từ hồ sơ dịch hại ' + r['Mã DH'], ds: [{ vt: r['Mã vị trí'], kv: (G.vt(r['Mã vị trí']) || {}).kv, lyDo: '' }] }).catch((err) => { throw new Error('Định kỳ: ' + err.message); });
        if (tinh && nk.viec[1]) await API.goi('dinhKy.luu', { viec: nk.viec[1], anh: v.anh, maDH: r['Mã DH'], ghiChu: 'Từ hồ sơ dịch hại ' + r['Mã DH'], ds: [{ vt: r['Mã vị trí'], kv: (G.vt(r['Mã vị trí']) || {}).kv, lyDo: '' }] }).catch(() => {});
        await API.goi('ghi', { bang: 'DichHaiCapNhat', dong: { 'Mã DH': r['Mã DH'], 'Thời điểm': '', 'Việc đã làm': v.viec, 'Tính luôn định kỳ': tinh ? nk.viec.join(', ') : '', 'Mức độ hiện tại': v.muc, 'Ảnh': v.anh, 'Ghi chú': v.gc, 'Người ghi': '' } });
        await API.goi('sua', { bang: 'DichHai', khoa: { 'Mã DH': r['Mã DH'] }, doi: { [TT_DH]: 'Đang xử lý', 'Mức độ': v.muc || r['Mức độ'], 'Cập nhật gần nhất': API.bayGio() } });
        dong(); bao('Đã cập nhật' + (tinh ? ' · đã tính luôn việc định kỳ' : '')); manDichHai();
      }, e.target);
    });
  }
  function baoXong(r) {
    hop('Báo xong hồ sơ dịch hại', '<p class="mo">Ảnh sau xử lý, cây đã hết dịch hại (bắt buộc).</p><div id="f"></div><button class="nut chinh rong" id="l">Báo xong</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'anh', nhan: 'Ảnh sau xử lý', loai: 'anh', bb: true, toiDa: 4 }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => {
        const v = lay();
        await API.goi('sua', { bang: 'DichHai', khoa: { 'Mã DH': r['Mã DH'] }, doi: { [TT_DH]: 'Báo xong', 'Ngày báo xong': API.ngay(), 'Ảnh xong': v.anh.join(' | '), 'Cập nhật gần nhất': API.bayGio() } });
        await API.goi('ghi', { bang: 'DichHaiCapNhat', dong: { 'Mã DH': r['Mã DH'], 'Thời điểm': '', 'Việc đã làm': 'Báo xong', 'Ảnh': v.anh, 'Ghi chú': v.gc, 'Người ghi': '' } });
        dong(); bao('Đã báo xong, chờ anh Vũ duyệt'); manDichHai();
      }, e.target);
    });
  }

  /* ================= NHẬT KÝ PHUN, BÓN ================= */
  G.man.phunbon = { ten: 'Nhật ký phun, bón', bt: '🧪', nhom: 'Cây xanh', ph: 'phunbon', fn: manPhunBon };
  async function manPhunBon(a, maDH) {
    if (a === 'moi') return moiPhunBon(maDH);
    const m = G.khung('Nhật ký phun, bón', 'Nhiều loại thuốc, phân trong một lần');
    const d = await API.goi('docNhieu', { ds: [{ bang: 'NhatKyPhunBon', gioiHan: 200 }, { bang: 'NhatKyPhunBonChiTiet', gioiHan: 1000 }] });
    const ds = d.NhatKyPhunBon.reverse(); const hn = API.ngay();
    m.innerHTML = (q('phunbon') >= 2 ? '<div class="nhom-nut" style="margin-bottom:12px"><button class="nut chinh" id="moi">＋ Ghi lần phun / bón</button><a class="nut" href="#/thuoc">Danh mục thuốc</a></div>' : '')
      + `<div class="ds">${ds.length ? ds.map((r) => {
        const ct = d.NhatKyPhunBonChiTiet.filter((x) => x['Mã NK'] === r['Mã NK']);
        const dangCL = r['Hết cách ly'] >= hn && +r['Cách ly dài nhất (ngày)'] > 0;
        return `<div class="muc"><div class="gian"><b>${esc(r['Loại (Phun thuốc/Phun phân bón lá/Bón gốc)'])}</b> · ${esc(G.gioVN(r['Ngày giờ']))}
          <div class="mo">📍 ${esc(G.tenVT(r['Mã vị trí'], r['Vị trí chi tiết'] || r['Cụm']))} · ${esc(r['Số bình'])} bình · ${esc(r['Người ghi'])}</div>
          <div class="mo">${ct.map((x) => `${esc(x['Sản phẩm'])} ${esc(x['Liều / bình'])} ${esc(x['ĐVT'])}/bình (tổng ${G.so(x['Tổng lượng'], 2)})`).join(' + ')}</div></div>
          ${dangCL ? `<span class="chip cam">Cách ly đến ${G.ngayVN(r['Hết cách ly']).slice(0, 5)}</span>` : ''}</div>`;
      }).join('') : '<div class="muc mo">Chưa có nhật ký</div>'}</div>`;
    const b = m.querySelector('#moi'); if (b) b.onclick = () => moiPhunBon();
  }
  async function moiPhunBon(maDH) {
    const m = G.khung('Ghi lần phun / bón', maDH ? 'Cho hồ sơ dịch hại ' + maDH : '', '#/phunbon');
    const sp = []; // {t, lieu, dvt}
    m.innerHTML = `<div id="f1"></div>
      <div class="o"><span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Thuốc / phân dùng trong lần này *</span>
      ${S.dm.congThuc && S.dm.congThuc.length ? '<button type="button" class="nut nho" id="ct" style="margin-bottom:8px">Dùng công thức pha sẵn</button>' : ''}
      <div id="sp"></div><button type="button" class="nut rong" id="themSP">＋ Thêm thuốc / phân</button><div id="canh"></div></div>
      <div id="f2"></div><div id="tong" class="the" style="background:var(--xanh-nhat)"></div>
      <button class="nut chinh rong" id="luu" style="margin-bottom:30px">Lưu nhật ký</button>`;
    const lay1 = G.form(m.querySelector('#f1'), [
      { k: 'loai', nhan: 'Loại', loai: 'chips', ds: S.dm.loaiPB, bb: true, gt: 'Phun thuốc' }, { k: 'gio', nhan: 'Thời gian', loai: 'ngaygio', gt: API.bayGio().slice(0, 16).replace(' ', 'T'), bb: true },
      { k: 'vt', nhan: 'Vị trí (cụm → vị trí, hoặc cả cụm)', loai: 'vitri', bb: true, opt: { caNhom: true } }, { k: 'ct', nhan: 'Vị trí chi tiết', loai: 'chu' }]);
    const lay2 = G.form(m.querySelector('#f2'), [
      { k: 'binh', nhan: 'Số bình', loai: 'so', bb: true, phu: 'Bình 16–25 lít' }, { k: 'bh', nhan: 'Bảo hộ đã dùng', loai: 'nhieu', ds: S.dm.baoHo, gt: ['Khẩu trang', 'Găng tay'] },
      { k: 'anh', nhan: 'Ảnh', loai: 'anh', toiDa: 4 }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
    const veSP = () => {
      m.querySelector('#sp').innerHTML = sp.map((x, i) => `<div class="dong-sp"><div><b style="font-size:13px">${esc(x.t.ten)}</b><div class="mo">${esc(x.t.dvt || '')} · cách ly ${x.t.cachLy} ngày${x.t.tt === 'Chờ duyệt' ? ' · thuốc chờ duyệt' : ''}</div></div>
        <input type="number" step="any" inputmode="decimal" placeholder="Liều/bình" value="${esc(x.lieu)}" data-l="${i}"><button class="xx" data-x="${i}">✕</button></div>
        <div class="chon boc" style="margin:-2px 0 8px">${['ml', 'g', 'gói', 'kg'].map((u) => `<button type="button" data-u="${i}" data-v="${u}" class="${x.dvt === u ? 'dang' : ''}">${u}/bình</button>`).join('')}</div>`).join('');
      m.querySelectorAll('[data-l]').forEach((i) => { i.oninput = () => { sp[+i.dataset.l].lieu = i.value; veTong(); }; });
      m.querySelectorAll('[data-x]').forEach((b) => { b.onclick = () => { sp.splice(+b.dataset.x, 1); veSP(); }; });
      m.querySelectorAll('[data-u]').forEach((b) => { b.onclick = () => { sp[+b.dataset.u].dvt = b.dataset.v; veSP(); }; });
      // tương kỵ
      const ky = [];
      sp.forEach((a) => sp.forEach((b) => { if (a !== b && a.t.khongPha && a.t.khongPha.toLowerCase().includes(b.t.ten.toLowerCase().split(' ')[0])) ky.push(`${a.t.ten} không pha chung với ${b.t.ten}`); }));
      m.querySelector('#canh').innerHTML = ky.length ? `<div class="canh-bao do" style="margin-top:8px">⚠️ ${ky.map(esc).join('; ')}</div>` : '';
      veTong();
    };
    const veTong = () => {
      const binh = +(m.querySelector('#f2 input[type=number]') || {}).value || 0;
      const cl = sp.reduce((a, x) => Math.max(a, +x.t.cachLy || 0), 0);
      const ngay = (lay1Safe().gio || API.bayGio()).slice(0, 10);
      m.querySelector('#tong').innerHTML = `<b>Tổng</b><div class="mo">${sp.map((x) => `${esc(x.t.ten)}: ${G.so((+x.lieu || 0) * binh, 2)} ${esc(x.dvt)}`).join('<br>') || 'Chưa chọn thuốc / phân'}</div><div style="margin-top:6px">Cách ly: <b>${cl} ngày</b>${cl ? ` · hết cách ly <b>${G.ngayVN(G.congNgay(ngay, cl))}</b>` : ''}</div>`;
    };
    const lay1Safe = () => { try { return lay1(); } catch (e) { return {}; } };
    m.querySelector('#f2').addEventListener('input', veTong);
    m.querySelector('#themSP').onclick = async () => { const t = await G.chonThuoc(); if (t) { sp.push({ t: t.t, lieu: '', dvt: /chai|ml|l$/i.test(t.t.dvt) ? 'ml' : 'g' }); veSP(); } };
    const ctb = m.querySelector('#ct');
    if (ctb) ctb.onclick = async () => {
      const nhom = {}; S.dm.congThuc.forEach((r) => { (nhom[r['Mã CT']] = nhom[r['Mã CT']] || []).push(r); });
      const c = await G.chonDS('Công thức pha', Object.keys(nhom).map((k) => ({ ten: nhom[k][0]['Tên công thức'], phu: nhom[k].map((x) => x['Sản phẩm']).join(' + '), k })));
      if (!c) return;
      nhom[c.k].forEach((r) => { const t = S.dm.thuoc.find((x) => x.ten === r['Sản phẩm']); if (t) sp.push({ t, lieu: r['Liều / bình'], dvt: r['ĐVT'] }); }); veSP();
    };
    veSP();
    m.querySelector('#luu').onclick = (e) => chay(async () => {
      const a = lay1(); const b = lay2();
      if (!sp.length) throw new Error('Thêm ít nhất 1 thuốc / phân'); if (sp.some((x) => !(+x.lieu > 0))) throw new Error('Nhập liều / bình cho từng loại');
      const cl = sp.reduce((x, y) => Math.max(x, +y.t.cachLy || 0), 0); const ngay = a.gio.slice(0, 10);
      const vt = a.vt;
      const nk = await API.goi('ghi', { bang: 'NhatKyPhunBon', dong: { 'Mã NK': '', 'Ngày giờ': a.gio, 'Loại (Phun thuốc/Phun phân bón lá/Bón gốc)': a.loai, 'Công thức pha': '', 'Cụm': vt.cum || (vt.caNhom ? vt.ten : ''), 'Mã vị trí': vt.ma || '',
        'Vị trí chi tiết': a.ct || (vt.ma || vt.caNhom ? '' : vt.ten), 'Số bình': b.binh, 'Bảo hộ': b.bh, 'Cách ly dài nhất (ngày)': cl, 'Hết cách ly': cl ? G.congNgay(ngay, cl) : '', 'Ảnh': b.anh, 'Mã dịch hại': maDH || '', 'Người ghi': '' } });
      await API.goi('ghiNhieu', { bang: 'NhatKyPhunBonChiTiet', dong: sp.map((x, i) => ({ 'Mã NK': nk['Mã NK'], 'STT': i + 1, 'Sản phẩm': x.t.ten, 'Liều / bình': x.lieu, 'ĐVT': x.dvt, 'Tổng lượng': (+x.lieu) * (+b.binh), 'Cách ly (ngày)': x.t.cachLy })) });
      if (maDH) await API.goi('ghi', { bang: 'DichHaiCapNhat', dong: { 'Mã DH': maDH, 'Thời điểm': '', 'Việc đã làm': a.loai + ': ' + sp.map((x) => x.t.ten).join(' + '), 'Mã NK phun bón': nk['Mã NK'], 'Ảnh': b.anh, 'Người ghi': '' } }).catch(() => {});
      bao('Đã lưu nhật ký ' + nk['Mã NK'] + (cl ? ` · cách ly đến ${G.ngayVN(G.congNgay(ngay, cl))}` : '')); location.hash = maDH ? '#/dichhai' : '#/phunbon';
    }, e.target);
  }

  /* ================= DANH MỤC THUỐC, ĐỀ XUẤT, CÔNG THỨC ================= */
  G.man.thuoc = { ten: 'Danh mục thuốc, phân', bt: '🧴', nhom: 'Cây xanh', ph: 'phunbon', fn: async () => {
    const m = G.khung('Danh mục thuốc, phân', 'Đề xuất thuốc mới · công thức pha', '#/phunbon');
    const d = await API.goi('docNhieu', { ds: [{ bang: 'DeXuatThuoc', gioiHan: 200 }] });
    const cho = d.DeXuatThuoc.filter((x) => x['Trạng thái (Chờ duyệt/Đã duyệt/Từ chối)'] === 'Chờ duyệt');
    const nhom = {}; S.dm.thuoc.forEach((t) => { (nhom[G.nhomThuoc(t)] = nhom[G.nhomThuoc(t)] || []).push(t); });
    m.innerHTML = `<div class="nhom-nut" style="margin-bottom:12px"><button class="nut chinh" id="dx">＋ Đề xuất thuốc mới</button>${q('phunbon') >= 3 ? '<button class="nut" id="ct">＋ Công thức pha</button>' : ''}</div>
      ${cho.length ? `<h3 style="font-size:14px">Đề xuất chờ duyệt</h3><div class="ds">${cho.map((x, i) => `<div class="muc"><div class="gian"><b>${esc(x['Tên thuốc/phân'])}</b><div class="mo">${esc(x['Loại'])} · ${esc(x['Hoạt chất'])} · cách ly ${esc(x['Cách ly đề xuất (ngày)'])} ngày · ${esc(x['Người đề xuất'])}</div>${G.xemAnh(x['Ảnh nhãn'])}</div>${q('phunbon') >= 3 ? `<button class="nut nho" data-d="${i}">Duyệt</button>` : '<span class="chip cam">Chờ duyệt</span>'}</div>`).join('')}</div>` : ''}
      ${(S.dm.congThuc || []).length ? `<h3 style="font-size:14px">Công thức pha sẵn</h3><div class="ds">${[...new Set(S.dm.congThuc.map((r) => r['Mã CT']))].map((k) => { const rs = S.dm.congThuc.filter((r) => r['Mã CT'] === k); return `<div class="muc"><div class="gian"><b>${esc(rs[0]['Tên công thức'])}</b><div class="mo">${rs.map((r) => `${esc(r['Sản phẩm'])} ${esc(r['Liều / bình'])} ${esc(r['ĐVT'])}/bình`).join(' + ')}</div></div></div>`; }).join('')}</div>` : ''}
      ${Object.keys(nhom).map((n) => `<h3 style="font-size:14px">${esc(n)}</h3><div class="ds">${nhom[n].map((t) => `<div class="muc"><div class="gian"><b>${esc(t.ten)}</b><div class="mo">${esc(t.dvt || '')}${t.khongPha ? ' · không pha với: ' + esc(t.khongPha) : ''}</div></div><span class="chip ${t.tt === 'Chờ duyệt' ? 'cam' : ''}">${t.tt === 'Chờ duyệt' ? 'Chờ duyệt · ' : ''}cách ly ${t.cachLy} ngày</span></div>`).join('')}</div>`).join('')}
      <p class="mo">Ngưng dùng một thuốc: anh Vũ sửa cột Trạng thái thành "Ngưng dùng" trong trang ThuocPhan (không xóa).</p>`;
    m.querySelector('#dx').onclick = () => hop('Đề xuất thuốc mới', '<div id="f"></div><button class="nut chinh rong" id="l">Gửi đề xuất</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ten', nhan: 'Tên thuốc / phân', loai: 'chu', bb: true }, { k: 'loai', nhan: 'Loại', loai: 'chips', ds: ['Thuốc bảo vệ thực vật', 'Phân bón lá', 'Phân bón gốc', 'Phụ gia'], bb: true },
        { k: 'hc', nhan: 'Hoạt chất (ghi trên nhãn)', loai: 'chu' }, { k: 'anh', nhan: 'Ảnh nhãn chai / bao', loai: 'anh', bb: true, toiDa: 3 }, { k: 'cl', nhan: 'Cách ly (ngày)', loai: 'so', gt: 14, phu: 'Chưa rõ thì để 14 ngày' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'DeXuatThuoc', dong: { 'Mã ĐX': '', 'Tên thuốc/phân': v.ten, 'Loại': v.loai, 'Hoạt chất': v.hc, 'Ảnh nhãn': v.anh, 'Cách ly đề xuất (ngày)': v.cl || 14, 'Người đề xuất': '', 'Giờ': API.bayGio(), 'Trạng thái (Chờ duyệt/Đã duyệt/Từ chối)': 'Chờ duyệt' } }); dong(); bao('Đã gửi. Dùng được ngay, cách ly tạm ' + (v.cl || 14) + ' ngày.'); await G.taiDanhMuc(); G.taiLai(); }, e.target);
    });
    m.querySelectorAll('[data-d]').forEach((b) => {
      b.onclick = () => { const x = cho[+b.dataset.d]; hop('Duyệt ' + x['Tên thuốc/phân'], '<div id="f"></div><div class="nhom-nut"><button class="nut" id="tc">Từ chối</button><button class="nut chinh" id="ok">Duyệt</button></div>', (o, dong) => {
        const lay = G.form(o.querySelector('#f'), [{ k: 'cl', nhan: 'Cách ly (ngày)', loai: 'so', gt: x['Cách ly đề xuất (ngày)'] }, { k: 'kt', nhan: 'Kiểm tra', loai: 'nhieu', ds: ['Có trong danh mục thuốc BVTV được phép sử dụng'] }, { k: 'kp', nhan: 'Không pha chung với', loai: 'chu' }]);
        const lam = (tt) => (e) => chay(async () => { const v = lay(); if (tt === 'Đã duyệt' && /Thuốc/.test(x['Loại']) && !v.kt.length) throw new Error('Tích kiểm tra danh mục thuốc BVTV được phép trước khi duyệt'); await API.goi('sua', { bang: 'DeXuatThuoc', khoa: { 'Mã ĐX': x['Mã ĐX'] }, doi: { 'Trạng thái (Chờ duyệt/Đã duyệt/Từ chối)': tt, 'Cách ly đề xuất (ngày)': v.cl, 'Đã kiểm tra danh mục được phép': v.kt.length ? 'Có' : '', 'Không pha chung với': v.kp, 'Người duyệt': S.u.ten, 'Giờ duyệt': API.bayGio() } }); dong(); bao(tt); await G.taiDanhMuc(); G.taiLai(); }, e.target);
        o.querySelector('#ok').onclick = lam('Đã duyệt'); o.querySelector('#tc').onclick = lam('Từ chối');
      }); };
    });
    const ct = m.querySelector('#ct');
    if (ct) ct.onclick = () => {
      const sp = [];
      hop('Công thức pha sẵn', '<div id="f"></div><div id="sp"></div><button class="nut rong" id="them">＋ Thêm thuốc / phân</button><button class="nut chinh rong" id="l" style="margin-top:10px">Lưu công thức</button>', (o, dong) => {
        const lay = G.form(o.querySelector('#f'), [{ k: 'ten', nhan: 'Tên công thức', loai: 'chu', bb: true, goiY: 'Ví dụ: Trị rệp sáp cây bụi' }, { k: 'loai', nhan: 'Loại', loai: 'chips', ds: S.dm.loaiPB, bb: true }]);
        const ve = () => { o.querySelector('#sp').innerHTML = sp.map((x, i) => `<div class="dong-sp"><b style="font-size:13px">${esc(x.t.ten)}</b><input type="number" step="any" placeholder="Liều/bình" data-l="${i}" value="${esc(x.lieu)}"><button class="xx" data-x="${i}">✕</button></div>`).join(''); o.querySelectorAll('[data-l]').forEach((i) => { i.oninput = () => { sp[+i.dataset.l].lieu = i.value; }; }); o.querySelectorAll('[data-x]').forEach((b) => { b.onclick = () => { sp.splice(+b.dataset.x, 1); ve(); }; }); };
        o.querySelector('#them').onclick = async () => { const t = await G.chonThuoc(); if (t) { sp.push({ t: t.t, lieu: '' }); ve(); } };
        o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); if (!sp.length) throw new Error('Thêm thuốc / phân'); const ma = 'CT' + Date.now().toString(36).toUpperCase(); await API.goi('ghiNhieu', { bang: 'CongThucPha', dong: sp.map((x) => ({ 'Mã CT': ma, 'Tên công thức': v.ten, 'Loại': v.loai, 'Sản phẩm': x.t.ten, 'Liều / bình': x.lieu, 'ĐVT': /chai|ml|l$/i.test(x.t.dvt) ? 'ml' : 'g', 'Đang dùng': 'Có' })) }); dong(); bao('Đã lưu công thức'); await G.taiDanhMuc(); G.taiLai(); }, e.target);
      });
    };
  } };

  /* ================= SỔ TRỒNG CÂY ================= */
  G.man.sotrongcay = { ten: 'Sổ trồng cây', bt: '🌳', nhom: 'Cây xanh', ph: 'phieu', fn: async () => {
    const m = G.khung('Sổ trồng cây', 'Trồng dặm · trồng mới · trồng cải tạo');
    const d = await API.goi('docNhieu', { ds: [{ bang: 'SoTrongCay', gioiHan: 1000 }].concat(q('duan') ? [{ bang: 'DuAn' }] : []) });
    const ds = d.SoTrongCay.slice().reverse();
    const tong = (k) => { const o = {}; ds.forEach((r) => { o[r[k]] = (o[r[k]] || 0) + (+r['Số lượng'] || 0); }); return o; };
    const th = tong('Hình thức'); const nc = tong('Nguồn cây');
    const bao_ = ds.reduce((a, r) => a + (+r['Chất cải tạo đất hữu cơ (bao)'] || 0), 0);
    m.innerHTML = (q('phieu') >= 2 ? '<button class="nut chinh rong" id="moi" style="margin-bottom:12px">＋ Ghi trồng cây (nhiều loại một lần)</button>' : '')
      + `<div class="the"><h2>Tổng cộng</h2><p class="mo" style="margin:0">${Object.keys(th).map((k) => `${esc(k)}: <b>${G.so(th[k])}</b>`).join(' · ') || '—'}<br>${Object.keys(nc).map((k) => `${esc(k)}: ${G.so(nc[k])}`).join(' · ')}<br>Chất cải tạo đất hữu cơ: <b>${G.so(bao_)} bao</b> = ${G.so(bao_ * 25)} kg</p>
        <button class="nut nho" id="tai" style="margin-top:8px">⬇ Tải Excel</button></div>
      <div class="ds">${ds.slice(0, 150).map((r) => `<div class="muc"><div class="gian"><b>${esc(r['Tên cây'])}</b> · ${G.so(r['Số lượng'])} ${esc(r['ĐVT'])}<div class="mo">${G.ngayVN(r['Thời gian'])} · ${esc(G.tenVT(r['Mã vị trí'], r['Vị trí khác']))} · ${esc(r['Hình thức'])} · ${esc(r['Nguồn cây'])}${r['Chất cải tạo đất hữu cơ (bao)'] ? ' · ' + esc(r['Chất cải tạo đất hữu cơ (bao)']) + ' bao' : ''}${r['Mã DA'] ? ' · ' + esc(r['Mã DA']) : ''}</div></div></div>`).join('') || '<div class="muc mo">Chưa có</div>'}</div>`;
    m.querySelector('#tai').onclick = () => {
      const c = ['STT', 'Thời gian', 'Khu vực', 'Vị trí', 'Hình thức', 'Nguồn cây', 'Tên cây', 'ĐVT', 'Số lượng', 'Chất cải tạo đất hữu cơ (bao)', 'Cây trước khi cải tạo', 'Ghi chú', 'Mã DA'];
      const h = [c].concat(d.SoTrongCay.map((r, i) => [i + 1, r['Thời gian'], r['Khu vực'], G.tenVT(r['Mã vị trí'], r['Vị trí khác']), r['Hình thức'], r['Nguồn cây'], r['Tên cây'], r['ĐVT'], r['Số lượng'], r['Chất cải tạo đất hữu cơ (bao)'], r['Cây trước khi cải tạo'], r['Ghi chú'], r['Mã DA']]));
      h.push([]); Object.keys(th).forEach((k) => h.push(['', '', '', '', 'Tổng ' + k, '', '', '', th[k]])); Object.keys(nc).forEach((k) => h.push(['', '', '', '', '', 'Tổng ' + k, '', '', nc[k]]));
      G.taiCSV('SoTrongCay_' + API.ngay(), h);
    };
    const moi = m.querySelector('#moi');
    if (moi) moi.onclick = () => {
      const cay = [];
      hop('Ghi trồng cây', '<div id="f"></div><h3 style="font-size:14px;margin:10px 0 6px">Cây trồng</h3><div id="dc"></div><button class="nut rong" id="them">＋ Thêm loại cây</button><div id="f2" style="margin-top:12px"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
        const lay = G.form(o.querySelector('#f'), [{ k: 'tg', nhan: 'Ngày trồng', loai: 'ngay', bb: true }, { k: 'vt', nhan: 'Vị trí (cụm → vị trí)', loai: 'vitri', bb: true }, { k: 'ht', nhan: 'Hình thức', loai: 'chips', ds: S.dm.hinhThuc, bb: true }, { k: 'nc', nhan: 'Nguồn cây', loai: 'chips', ds: S.dm.nguonCay, bb: true }]);
        const lay2 = G.form(o.querySelector('#f2'), [{ k: 'bao', nhan: 'Chất cải tạo đất hữu cơ (bao, 1 bao = 25 kg)', loai: 'so' }, { k: 'truoc', nhan: 'Cây trước khi cải tạo', loai: 'chu' },
          { k: 'da', nhan: 'Thuộc dự án', loai: 'chips', ds: (d.DuAn || []).filter((x) => x['Trạng thái'] !== 'Hoàn thành').map((x) => x['Mã DA'] + ' · ' + x['Tên']) }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }, { k: 'anh', nhan: 'Ảnh', loai: 'anh', toiDa: 4 }]);
        const ve = () => { o.querySelector('#dc').innerHTML = cay.map((x, i) => `<div class="the" style="padding:10px;margin-bottom:6px"><div class="hang"><b class="gian">${esc(x.c.ten)}</b><button class="nut nho" data-x="${i}">✕</button></div><div class="dong-sp" style="grid-template-columns:1fr 1fr"><input type="number" placeholder="Số lượng" data-sl="${i}" value="${esc(x.sl)}"><select data-dvt="${i}">${S.dm.dvt.map((u) => `<option ${u === x.dvt ? 'selected' : ''}>${u}</option>`).join('')}</select></div></div>`).join(''); o.querySelectorAll('[data-sl]').forEach((i) => { i.oninput = () => { cay[+i.dataset.sl].sl = i.value; }; }); o.querySelectorAll('[data-dvt]').forEach((s) => { s.onchange = () => { cay[+s.dataset.dvt].dvt = s.value; }; }); o.querySelectorAll('[data-x]').forEach((b) => { b.onclick = () => { cay.splice(+b.dataset.x, 1); ve(); }; }); };
        o.querySelector('#them').onclick = async () => { const c = await G.chonCay(true); if (c) { cay.push({ c, sl: '', dvt: /bóng mát/i.test(c.nhom || '') ? 'Cây' : /cỏ/i.test(c.nhom || '') ? 'm²' : 'Bụi' }); ve(); } };
        o.querySelector('#l').onclick = (e) => chay(async () => {
          const a = lay(); const b = lay2(); if (!cay.length) throw new Error('Thêm ít nhất 1 loại cây'); if (cay.some((x) => !(+x.sl > 0))) throw new Error('Nhập số lượng từng loại cây');
          const n = d.SoTrongCay.length;
          await API.goi('ghiNhieu', { bang: 'SoTrongCay', dong: cay.map((x, i) => ({ 'STT': n + i + 1, 'Thời gian': a.tg, 'Khu vực': a.vt.kv || '', 'Mã vị trí': a.vt.ma || '', 'Vị trí khác': a.vt.ma ? '' : a.vt.ten, 'Hình thức': a.ht, 'Nguồn cây': a.nc, 'Mã cây': x.c.ma || '', 'Tên cây': x.c.ten, 'ĐVT': x.dvt, 'Số lượng': x.sl,
            'Chất cải tạo đất hữu cơ (bao)': i === 0 ? b.bao : '', 'Cây trước khi cải tạo': b.truoc, 'Ghi chú': b.gc, 'Ảnh': i === 0 ? b.anh : [], 'Mã DA': (b.da || '').split(' · ')[0], 'Mã phiếu': '', 'Người ghi': '' })) });
          dong(); bao('Đã ghi ' + cay.length + ' loại cây'); G.taiLai();
        }, e.target);
      });
    };
  } };

  /* ================= CÂY BẤT THƯỜNG ================= */
  G.man.batthuong = { ten: 'Cây bất thường', bt: '🥀', nhom: 'Cây xanh', ph: 'phieu', fn: async () => {
    const m = G.khung('Cây bất thường', 'Gom theo vị trí, A → Z');
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'BatThuong', gioiHan: 1000 }] })).BatThuong;
    const nhom = {}; ds.forEach((r) => { const k = G.tenVT(r['Mã vị trí']); (nhom[k] = nhom[k] || []).push(r); });
    m.innerHTML = (q('phieu') >= 2 ? '<button class="nut chinh rong" id="moi" style="margin-bottom:12px">＋ Báo cây bất thường</button>' : '')
      + (Object.keys(nhom).sort((a, b) => a.localeCompare(b, 'vi')).map((k) => `<div class="the"><h3>📍 ${esc(k)} <span class="chip">${nhom[k].length} lần</span></h3>${nhom[k].slice().reverse().map((r) => `<div style="margin-top:8px"><b>${G.ngayVN(r['Ngày'])}</b> · ${esc(r['Tên cây'])} · <span class="chip cam">${esc(r['Tình trạng'])}</span> <span class="mo">${esc(r['Người báo'])}</span><div class="mo">${esc(r['Ghi chú'])}</div>${G.xemAnh(r['Ảnh'])}</div>`).join('')}</div>`).join('') || G.trong('Chưa có báo cáo'));
    const b = m.querySelector('#moi');
    if (b) b.onclick = () => hop('Báo cây bất thường', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'vt', nhan: 'Vị trí', loai: 'vitri', bb: true }, { k: 'cay', nhan: 'Cây', loai: 'cay', bb: true }, { k: 'tt', nhan: 'Tình trạng', loai: 'chips', ds: S.dm.batthuong, bb: true }, { k: 'anh', nhan: 'Ảnh', loai: 'anh', bb: true, toiDa: 3 }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'BatThuong', dong: { 'Ngày': '', 'Mã vị trí': v.vt.ma || v.vt.ten, 'Tên cây': v.cay.ten, 'Tình trạng': v.tt, 'Ảnh': v.anh, 'Ghi chú': v.gc, 'Người báo': '' } }); dong(); bao('Đã lưu'); G.taiLai(); }, e.target);
    });
  } };

  /* ================= AI ================= */
  G.man.ai = { ten: 'AI nhận diện', bt: '🔍', nhom: 'Cây xanh', ph: 'ai', fn: async () => {
    const m = G.khung('AI hỗ trợ', 'Kết quả chỉ là gợi ý');
    m.innerHTML = `<div class="the"><h2>🌿 Nhận diện cây (Pl@ntNet)</h2><p class="mo">Chụp lá, hoa hoặc thân cây. Không chụp khách hay giấy tờ.</p><div id="a1"></div><button class="nut chinh rong" id="b1" style="margin-top:8px">Nhận diện</button><div id="k1"></div></div>
      <div class="the"><h2>🩺 Phân tích triệu chứng (Gemini)</h2><p class="mo">Tối đa 10 lượt/người/ngày. Ưu tiên thuốc, phân có trong danh mục. Phun thuốc vẫn do anh Vũ duyệt.</p><div id="a2"></div>${G.oMoTa('mt2', 'Mô tả triệu chứng')}<button class="nut chinh rong" id="b2">Phân tích</button><div id="k2"></div></div>
      <p class="mo" style="text-align:center">Nhận diện cây: dữ liệu Pl@ntNet (plantnet.org)</p>`;
    const a1 = G.oAnh(m.querySelector('#a1'), { toiDa: 3 }); const a2 = G.oAnh(m.querySelector('#a2'), { toiDa: 3 }); G.ganMic(m);
    m.querySelector('#b1').onclick = (e) => chay(async () => {
      if (!a1.ds().length) throw new Error('Chụp ảnh cây');
      const r = await API.goi('ai.cay', { anh: a1.ds() });
      m.querySelector('#k1').innerHTML = (r.ketQua || []).map((x) => `<div class="the" style="padding:10px;margin-top:8px"><b>${esc(x.tenViet || x.tenKH)}</b> <span class="chip">${Math.round(x.diem * 100)}%</span><div class="mo"><i>${esc(x.tenKH)}</i>${x.trongDanhMuc ? ' · có trong danh mục cây' : ''}</div></div>`).join('') || '<p class="mo">Không nhận ra.</p>';
    }, e.target);
    m.querySelector('#b2').onclick = (e) => chay(async () => {
      if (!a2.ds().length) throw new Error('Chụp ảnh triệu chứng');
      const r = await API.goi('ai.trieuChung', { anh: a2.ds(), moTa: m.querySelector('#mt2').value });
      m.querySelector('#k2').innerHTML = `<div class="the" style="padding:10px;margin-top:8px;white-space:pre-wrap">${esc(r.traLoi)}</div><p class="mo">Còn ${r.conLai} lượt hôm nay.</p>`;
    }, e.target);
  } };
})();
