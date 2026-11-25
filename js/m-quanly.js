/* GreenLog – công nhân, phiếu sửa công, báo cáo, phân quyền, thời tiết */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, hop, bao } = G;
  const TT = 'Trạng thái (Có mặt/Vắng/Về sớm)';

  /* ================= CÔNG NHÂN ================= */
  G.man.congnhan = { ten: 'Công nhân', bt: '👷', nhom: 'Nhân sự', ph: 'congnhan', fn: async () => {
    const m = G.khung('Công nhân nhà thầu', 'Danh sách · đăng ký mới, thay đổi, nghỉ việc');
    const dk = (await API.goi('docNhieu', { ds: [{ bang: 'CongNhanDangKy', gioiHan: 300 }] })).CongNhanDangKy.reverse();
    const cn = S.dm.congnhan || []; const dang = cn.filter((x) => x.tt !== 'Đã nghỉ');
    const cho = dk.filter((x) => x['Trạng thái duyệt'] === 'Chờ duyệt');
    const nhom = {}; dang.forEach((x) => { const k = x.doi || 'Chưa phân đội'; (nhom[k] = nhom[k] || []).push(x); });
    m.innerHTML = (q('congnhan') >= 2 && q('congnhan') < 3 ? '<button class="nut chinh rong" id="dk" style="margin-bottom:12px">＋ Đăng ký: mới / thay đổi / nghỉ việc</button>' : '')
      + (cho.length ? `<h3 style="font-size:14px">Chờ Trưởng bộ phận duyệt (${cho.length})</h3><div class="ds">${cho.map((x, i) => `<div class="muc"><div class="gian"><b>${esc(x['Loại (Mới/Thay đổi/Nghỉ việc)'])}: ${esc(x['Họ và tên'])}</b><div class="mo">${esc(x['Đội'])} · ${esc(x['Chức danh'])} · ${esc(x['Số điện thoại'])} · từ ${G.ngayVN(x['Từ ngày'])} · ${esc(x['Người đăng ký'])}</div></div>${q('congnhan') >= 3 ? `<button class="nut nho" data-d="${i}">Xét</button>` : '<span class="chip cam">Chờ duyệt</span>'}</div>`).join('')}</div>` : '')
      + `<p class="mo">${dang.length} người đang làm · ${cn.length - dang.length} đã nghỉ</p>`
      + Object.keys(nhom).map((k) => `<div class="ds"><div class="nhom-ten">${esc(k)} (${nhom[k].length})</div>${nhom[k].map((x) => `<div class="muc"><div class="gian"><b>${esc(x.ten)}</b><div class="mo">${esc(x.ma)} · ${esc(x.cd || 'chưa có chức danh')}${x.kv ? ' · ' + esc(x.kv) : ''}${x.sdt ? ' · ' + esc(x.sdt) : ''}</div></div></div>`).join('')}</div>`).join('');
    const b = m.querySelector('#dk');
    if (b) b.onclick = () => hop('Đăng ký công nhân', '<div id="f"></div><button class="nut chinh rong" id="l">Gửi Trưởng bộ phận duyệt</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'loai', nhan: 'Loại', loai: 'chips', ds: ['Mới', 'Thay đổi', 'Nghỉ việc'], bb: true }, { k: 'ten', nhan: 'Họ và tên (đầy đủ)', loai: 'chu', bb: true, goiY: 'Với Thay đổi / Nghỉ việc: gõ đúng tên trong danh sách' },
        { k: 'doi', nhan: 'Đội', loai: 'chips', ds: ['Đội cơ động', 'Đội khu vực'] }, { k: 'cd', nhan: 'Chức danh', loai: 'chips', ds: ['Cắt cỏ', 'Vận chuyển', 'Bón phân + phun thuốc', 'Cắt tỉa cây bóng mát', 'Nhân viên khu vực', 'Nhân viên vườn ươm', 'Tổ trưởng'] },
        { k: 'kv', nhan: 'Khu vực phụ trách', loai: 'chu' }, { k: 'sdt', nhan: 'Số điện thoại', loai: 'chu' }, { k: 'tu', nhan: 'Từ ngày', loai: 'ngay', bb: true }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => {
        const v = lay(); const co = cn.find((x) => x.ten.toLowerCase() === v.ten.toLowerCase());
        if (v.loai === 'Mới' && !/^0\d{9}$/.test(v.sdt.replace(/\s/g, ''))) throw new Error('Người mới bắt buộc số điện thoại 10 số');
        if (v.loai === 'Mới' && (!v.doi || !v.cd)) throw new Error('Người mới cần đội và chức danh');
        if (v.loai !== 'Mới' && !co) throw new Error('Không thấy "' + v.ten + '" trong danh sách');
        await API.goi('ghi', { bang: 'CongNhanDangKy', dong: { 'Mã ĐK': '', 'Loại (Mới/Thay đổi/Nghỉ việc)': v.loai, 'Mã CN': co ? co.ma : '', 'Họ và tên': co ? co.ten : v.ten, 'Đội': v.doi, 'Chức danh': v.cd, 'Khu vực phụ trách': v.kv, 'Số điện thoại': v.sdt, 'Từ ngày': v.tu, 'Ghi chú': v.gc, 'Người đăng ký': '', 'Giờ đăng ký': '', 'Trạng thái duyệt': 'Chờ duyệt' } });
        dong(); bao('Đã gửi, chờ Trưởng bộ phận duyệt'); G.taiLai();
      }, e.target);
    });
    m.querySelectorAll('[data-d]').forEach((x) => { x.onclick = async () => { const r = cho[+x.dataset.d]; const c = await G.chonDS('Xét: ' + r['Họ và tên'], ['Duyệt', 'Từ chối']); if (!c) return;
      chay(async () => { await API.goi('congNhan.duyet', { ma: r['Mã ĐK'], dongY: c.ten === 'Duyệt' }); await G.taiDanhMuc(); bao(c.ten === 'Duyệt' ? 'Đã duyệt, danh sách đã cập nhật' : 'Đã từ chối'); G.taiLai(); }); }; });
  } };

  /* ================= PHIẾU SỬA CÔNG (buổi đã khóa) ================= */
  G.phieuSuaCong = function (st, rows) {
    const cn = (S.dm.congnhan || []).filter((x) => x.tt !== 'Đã nghỉ');
    hop('Phiếu sửa công', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu và sửa</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ngay', nhan: 'Ngày', loai: 'ngay', gt: st.ngay, bb: true }, { k: 'buoi', nhan: 'Buổi', loai: 'chips', ds: ['Sáng', 'Chiều'], gt: st.buoi, bb: true },
        { k: 'cn', nhan: 'Công nhân', loai: 'chonds', ds: cn.map((x) => ({ ten: x.ten, phu: x.ma + ' · ' + (x.doi || ''), ma: x.ma })), bb: true }, { k: 'tt', nhan: 'Sửa thành', loai: 'chips', ds: ['Có mặt', 'Vắng', 'Về sớm'], bb: true }, { k: 'ly', nhan: 'Lý do sửa', loai: 'mota', bb: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => {
        const v = lay(); const d = (await API.goi('docNhieu', { ds: [{ bang: 'DiemDanh', loc: { 'Ngày': v.ngay, 'Buổi': v.buoi, 'Mã CN': v.cn.ma } }] })).DiemDanh[0];
        const cu = d ? d[TT] : '(chưa có)';
        await API.goi('ghi', { bang: 'PhieuSuaCong', dong: { 'Mã phiếu': '', 'Ngày': v.ngay, 'Buổi': v.buoi, 'Mã CN': v.cn.ma, 'Giá trị cũ': cu, 'Giá trị mới': v.tt, 'Lý do': v.ly, 'Người đề nghị': S.u.ten, 'Giờ': API.bayGio(), 'Người duyệt': S.u.ten, 'Kết quả': 'Đã sửa' } });
        if (d) await API.goi('sua', { bang: 'DiemDanh', khoa: { 'Ngày': v.ngay, 'Buổi': v.buoi, 'Mã CN': v.cn.ma }, doi: { [TT]: v.tt, 'Công': v.tt === 'Có mặt' ? 0.5 : 0 }, lyDo: v.ly });
        else await API.goi('ghi', { bang: 'DiemDanh', dong: { 'Ngày': v.ngay, 'Buổi': v.buoi, 'Mã CN': v.cn.ma, 'Họ tên': v.cn.ten, 'Đội': (cn.find((x) => x.ma === v.cn.ma) || {}).doi || '', [TT]: v.tt, 'Công': v.tt === 'Có mặt' ? 0.5 : 0, 'Người ghi': '', 'Giờ ghi': '', 'Trạng thái duyệt': 'Đã duyệt' } });
        dong(); bao('Đã sửa công, có ghi nhật ký'); G.taiLai();
      }, e.target);
    });
  };

  /* ================= BÁO CÁO ================= */
  G.man.baocao = { ten: 'Báo cáo', bt: '📊', nhom: 'Báo cáo', ph: () => q('baocao') >= 1 || q('homnay') >= 3, fn: async (loai) => {
    const k = S.dm.ky; const st = G.man.baocao.st || (G.man.baocao.st = { ky: k.ten });
    const kyChon = st.ky === k.ten ? k : (() => { const [mm, yy] = st.ky.slice(1).split('.').map(Number); return API.ky(`${yy}-${String(mm).padStart(2, '0')}-01`); })();
    const ds = [['cong', '🧾 Bảng công'], ['diem', '🏅 Bảng điểm nhà thầu'], ['dinhky', '✅ Định kỳ theo vị trí'], ['them', '➕ Việc làm thêm ngoài tần suất'], ['phieu', '🎫 Phiếu'], ['tuoi', '💧 Tưới nước'], ['rac', '♻️ Rác hữu cơ, compost'], ['trong', '🌳 Sổ trồng cây']]
      .filter((x) => q('homnay') >= 3 || ['cong', 'diem', 'dinhky'].includes(x[0]));
    if (!loai) {
      const m = G.khung('Báo cáo', 'Kỳ ' + kyChon.ten);
      const kys = []; let n = k.tu; for (let i = 0; i < 6; i++) { kys.push(API.ky(n).ten); n = G.congNgay(API.ky(n).tu, -1); }
      m.innerHTML = `<div class="chon">${kys.map((x) => `<button data-k="${x}" class="${x === st.ky ? 'dang' : ''}">${x}</button>`).join('')}</div>` + ds.map((x) => `<a class="the-viec" href="#/baocao/${x[0]}"><span class="gian"><b>${x[1]}</b></span>›</a>`).join('');
      m.querySelectorAll('[data-k]').forEach((b) => { b.onclick = () => { st.ky = b.dataset.k; G.taiLai(); }; });
      return;
    }
    const m = G.khung((ds.find((x) => x[0] === loai) || ['', 'Báo cáo'])[1].replace(/^\S+ /, ''), `Kỳ ${kyChon.ten} · ${G.ngayVN(kyChon.tu)}–${G.ngayVN(kyChon.den)}`, '#/baocao');
    const tuDen = { tu: kyChon.tu, den: kyChon.den };
    const doc = async (b, loc) => (await API.goi('docNhieu', { ds: [{ bang: b, loc }] }))[b];
    const bang = (h, rows, ten) => `<button class="nut nho" id="tai" style="margin-bottom:8px">⬇ Tải Excel</button><div class="cuon"><table class="bang"><tr>${h.map((x) => `<th>${esc(x)}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;
    const ganTai = (h, rows, ten) => { const t = m.querySelector('#tai'); if (t) t.onclick = () => G.taiCSV(ten + '_' + kyChon.ten, [h].concat(rows)); };
    const ngayKy = []; for (let n = kyChon.tu; n <= kyChon.den; n = G.congNgay(n, 1)) ngayKy.push(n);

    if (loai === 'cong') {
      const dd = await doc('DiemDanh', { 'Ngày': tuDen });
      const cn = (S.dm.congnhan || []).filter((x) => x.doi !== 'Quản lý nhà thầu' && !/Quản lý nhà thầu/.test(x.cd));
      const cong = {}; dd.forEach((r) => { const kk = r['Mã CN'] + '|' + r['Ngày']; cong[kk] = (cong[kk] || 0) + (+r['Công'] || 0); });
      const le = new Set((S.dm.ngayle || []).map((l) => { const p = String(l.ngay).split('/'); return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : ''; }));
      const h = ['Mã', 'Họ tên', 'Đội'].concat(ngayKy.map((n) => n.slice(8))).concat(['Tổng công']);
      const rows = cn.map((x) => { let t = 0; const c = ngayKy.map((n) => { const v = cong[x.ma + '|' + n] || 0; t += v; return v ? G.so(v) : ''; }); return [x.ma, x.ten, x.doi || ''].concat(c).concat([G.so(t)]); }).filter((r) => r[r.length - 1] !== '0');
      const daQua = ngayKy.filter((n) => n <= API.ngay());
      const tongTT = Object.values(cong).reduce((a, b) => a + b, 0); const dinhMuc = daQua.reduce((a, n) => a + (le.has(n) ? 20 : 31), 0);
      const sdCu = -275.5;
      const chuaDuyet = dd.filter((r) => r['Trạng thái duyệt'] !== 'Đã duyệt').length;
      m.innerHTML = `<div class="the"><div class="luoi2"><div><div class="so-lon">${G.so(tongTT)}</div><div class="mo">công thực tế (đến hôm nay)</div></div><div><div class="so-lon">${G.so(dinhMuc)}</div><div class="mo">công định mức (31/ngày, lễ 20)</div></div></div>
        <p style="margin:10px 0 0">Chênh lệch kỳ: <b style="color:${tongTT - dinhMuc < 0 ? 'var(--do)' : 'var(--xanh)'}">${G.so(tongTT - dinhMuc)}</b> · lũy kế đến kỳ trước ${G.so(sdCu)} → <b>${G.so(sdCu + tongTT - dinhMuc)}</b></p>
        <p class="mo" style="margin:6px 0 0">12 công giám sát của anh Pháp ghi riêng, không tính vào định mức. ${chuaDuyet ? `<b style="color:var(--do)">${chuaDuyet} dòng chưa duyệt.</b>` : 'Tất cả đã duyệt.'}</p></div>` + bang(h, rows);
      return ganTai(h, rows, 'BangCong');
    }
    if (loai === 'dinhky' || loai === 'diem' || loai === 'them') {
      const t = await doc('TickDinhKy', { 'Kỳ': kyChon.ten }); const vt = S.dm.vitri.filter((v) => v.ap === 'Có'); const dv = S.dm.dauviec.filter((v) => /^DV0[1-8]$/.test(v.ma));
      if (loai === 'them') {
        const them = t.filter((r) => +r['Lần'] > 1);
        const h = ['Ngày', 'Việc', 'Vị trí', 'Lần', 'Lý do', 'Người']; const rows = them.map((r) => [G.ngayVN(r['Ngày']), G.dvTen(r['Mã việc']), G.tenVT(r['Mã vị trí']), r['Lần'], r['Lý do làm thêm'], r['Người tick']]);
        const tk = {}; them.forEach((r) => { tk[r['Lý do làm thêm']] = (tk[r['Lý do làm thêm']] || 0) + 1; });
        m.innerHTML = `<div class="the">${Object.keys(tk).map((x) => `${esc(x)}: <b>${tk[x]}</b>`).join(' · ') || 'Không có việc làm thêm'}</div><p class="mo">Lần đầu mới tính vào tiến độ. Bảng này để xem việc phải làm lại vì chưa đạt.</p>` + bang(h, rows);
        return ganTai(h, rows, 'ViecLamThem');
      }
      const lan1 = {}; t.forEach((r) => { if (+r['Lần'] === 1 || !r['Lần']) lan1[r['Mã việc'] + '|' + r['Mã vị trí']] = r['Ngày']; });
      if (loai === 'dinhky') {
        const h = ['Khu vực', 'Vị trí'].concat(dv.map((v) => v.ten)); const rows = vt.map((v) => [v.kv, v.ten].concat(dv.map((d) => (lan1[d.ma + '|' + v.ma] ? G.ngayVN(lan1[d.ma + '|' + v.ma]).slice(0, 5) : ''))));
        m.innerHTML = `<div class="the">${dv.map((d) => { const n = vt.filter((v) => lan1[d.ma + '|' + v.ma]).length; return `<div class="hang" style="font-size:13px"><span class="gian">${esc(d.ten)}</span><b>${n}/${vt.length} (${Math.round(n / vt.length * 100)}%)</b></div>`; }).join('')}</div><p class="mo">Ô trống = chưa làm trong kỳ.</p>` + bang(h, rows);
        return ganTai(h, rows, 'DinhKyTheoViTri');
      }
      // bảng điểm nhà thầu
      const [ph, cd] = await Promise.all([doc('Phieu', null), q('homnay') >= 3 || q('baocao') ? doc('ChamDiem', { 'Ngày': tuDen }).catch(() => []) : []]);
      const tlHT = dv.reduce((a, d) => a + vt.filter((v) => lan1[d.ma + '|' + v.ma]).length / vt.length, 0) / dv.length;
      const phKy = ph.filter((p) => String(p['Giờ tạo']).slice(0, 10) >= kyChon.tu && String(p['Giờ tạo']).slice(0, 10) <= kyChon.den && p['Giờ xong']);
      const dungHan = phKy.length ? phKy.filter((p) => p['Giờ xong'] <= p['Hạn']).length / phKy.length : 1;
      const tbCL = cd.length ? cd.reduce((a, r) => a + +r['Điểm (1–5)'], 0) / cd.length / 5 : 0;
      const traLai = phKy.length ? Math.max(0, 1 - phKy.reduce((a, p) => a + (+p['Số lần trả lại'] || 0), 0) / phKy.length) : 1;
      const tc = [['Tỷ lệ hoàn thành việc định kỳ', 30, tlHT], ['Đúng hạn (phiếu)', 25, dungHan], ['Điểm chất lượng kiểm tra ngẫu nhiên', 25, tbCL], ['Số lần bị trả lại (càng ít càng tốt)', 10, traLai], ['Ảnh sự kiện đúng giờ', 10, 1]];
      const tong = tc.reduce((a, x) => a + x[1] * x[2], 0);
      const h = ['Tiêu chí', 'Trọng số', 'Đạt', 'Điểm']; const rows = tc.map((x) => [x[0], x[1] + '%', Math.round(x[2] * 100) + '%', G.so(x[1] * x[2])]).concat([['Tổng', '100%', '', G.so(tong)]]);
      m.innerHTML = `<div class="the"><div class="so-lon">${G.so(tong)}<small style="font-size:14px">/100</small></div><div class="mo">Điểm nhà thầu kỳ ${esc(kyChon.ten)}${!cd.length ? ' · chưa có điểm kiểm tra ngẫu nhiên' : ''}</div></div>` + bang(h, rows);
      return ganTai(h, rows, 'BangDiemNhaThau');
    }
    if (loai === 'phieu') {
      const ph = (await doc('Phieu', null)).filter((p) => String(p['Giờ tạo']).slice(0, 10) >= kyChon.tu && String(p['Giờ tạo']).slice(0, 10) <= kyChon.den);
      const h = ['Mã', 'Lỗi', 'Mức độ', 'Vị trí', 'Giao cho', 'Tạo', 'Hạn', 'Xong', 'Trạng thái', 'Đúng hạn', 'Trả lại'];
      const rows = ph.map((p) => [p['Mã phiếu'], p['Loại lỗi'], p['Mức độ'], G.tenVT(p['Mã vị trí'], p['Vị trí khác']), p['Giao cho'], p['Giờ tạo'], p['Hạn'], p['Giờ xong'], p['Trạng thái'], p['Giờ xong'] ? (p['Giờ xong'] <= p['Hạn'] ? 'Đúng' : 'Trễ') : '', p['Số lần trả lại']]);
      const nhom = {}; ph.forEach((p) => { nhom[p['Nhóm lỗi'] || 'Khác'] = (nhom[p['Nhóm lỗi'] || 'Khác'] || 0) + 1; });
      m.innerHTML = `<div class="the">${ph.length} phiếu · ${ph.filter((p) => p['Trạng thái'] === 'Đã duyệt').length} đã duyệt · ${rows.filter((r) => r[9] === 'Trễ').length} trễ<br><span class="mo">${Object.keys(nhom).map((k) => `${esc(k)}: ${nhom[k]}`).join(' · ')}</span></div>` + bang(h, rows);
      return ganTai(h, rows, 'Phieu');
    }
    if (loai === 'tuoi') {
      const t = await doc('Tuoi', { 'Ngày': tuDen }); const h = ['Ngày', 'Đã tưới', 'Mưa', 'Chưa tưới được', 'Chưa ghi'];
      const nVT = S.dm.vitri.filter((v) => v.ap === 'Có').length;
      const rows = ngayKy.filter((n) => n <= API.ngay()).map((n) => { const x = t.filter((r) => r['Ngày'] === n); const c = (s) => x.filter((r) => r['Trạng thái'] === s).length; return [G.ngayVN(n), c('Đã tưới'), c('Không cần (mưa)'), c('Chưa tưới được'), nVT - x.length]; });
      m.innerHTML = bang(h, rows); return ganTai(h, rows, 'TuoiNuoc');
    }
    if (loai === 'rac') {
      const [r, c] = await Promise.all([doc('RacHuuCo', { 'Ngày': tuDen }), doc('PhanCompost', { 'Ngày': tuDen })]);
      const h = ['Ngày', 'Rác hữu cơ (kg)', 'Phân compost (kg)']; const rows = ngayKy.map((n) => [G.ngayVN(n), G.so(r.filter((x) => x['Ngày'] === n).reduce((a, x) => a + +x['kg rác thu gom'], 0)), G.so(c.filter((x) => x['Ngày'] === n).reduce((a, x) => a + +x['Phân compost tuần hoàn (kg)'], 0))]).filter((x) => x[1] !== '0' || x[2] !== '0');
      m.innerHTML = `<div class="the luoi2"><div><div class="so-lon">${G.so(r.reduce((a, x) => a + +x['kg rác thu gom'], 0))}</div><div class="mo">kg rác hữu cơ</div></div><div><div class="so-lon">${G.so(c.reduce((a, x) => a + +x['Phân compost tuần hoàn (kg)'], 0))}</div><div class="mo">kg compost</div></div></div>` + bang(h, rows);
      return ganTai(h, rows, 'RacHuuCo');
    }
    if (loai === 'trong') { location.hash = '#/sotrongcay'; }
  } };

  /* ================= PHÂN QUYỀN, ỦY QUYỀN ================= */
  const PH = [['homnay', 'Hôm nay / Lịch'], ['diemdanh', 'Điểm danh'], ['congnhan', 'Công nhân'], ['dinhky', 'Định kỳ / Tưới'], ['noibo', 'Việc nội bộ'], ['vuonuom', 'Vườn ươm cây bụi'], ['donghonuoc', 'Đồng hồ nước'],
    ['phieu', 'Phiếu / Dịch hại / Sổ trồng cây'], ['phunbon', 'Phun, bón'], ['duan', 'Dự án'], ['sukien', 'Sự kiện'], ['kehoach', 'KH tuần / KH tháng'], ['tuantra', 'Tuần tra'], ['ai', 'AI nhận diện'], ['baocao', 'Báo cáo'], ['danhmuc', 'Danh mục / Phân quyền']];
  const CAP = ['Không thấy', 'Xem', 'Ghi', 'Duyệt'];
  G.man.phanquyen = { ten: 'Phân quyền', bt: '🔐', nhom: 'Quản trị', ph: 'danhmuc', cap: 3, fn: async () => {
    const m = G.khung('Phân quyền', 'Chỉnh riêng từng người · ủy quyền khi vắng');
    const d = await API.goi('docNhieu', { ds: [{ bang: 'PhanQuyen' }, { bang: 'UyQuyen' }] });
    m.innerHTML = `<p class="mo">Mặc định theo nhóm (bảng PhanQuyenMacDinh). Ở đây anh chỉnh riêng cho từng người hoặc từng nhóm; dòng chỉnh riêng thắng mặc định.</p>
      <button class="nut chinh rong" id="pq" style="margin-bottom:8px">＋ Chỉnh quyền riêng</button><button class="nut rong" id="uq" style="margin-bottom:12px">＋ Ủy quyền có thời hạn</button>
      <h3 style="font-size:14px">Đang chỉnh riêng</h3><div class="ds">${d.PhanQuyen.map((r) => `<div class="muc"><div class="gian"><b>${esc(r['Áp cho (nhóm hoặc Gmail)'])}</b><div class="mo">${esc((PH.find((p) => p[0] === r['Phân hệ']) || [0, r['Phân hệ']])[1])}</div></div><span class="chip">${esc(r['Cấp (Không thấy/Xem/Ghi/Duyệt)'])}</span></div>`).join('') || '<div class="muc mo">Chưa có</div>'}</div>
      <h3 style="font-size:14px">Ủy quyền</h3><div class="ds">${d.UyQuyen.map((r) => `<div class="muc"><div class="gian"><b>${esc(r['Người nhận'])}</b><div class="mo">${esc((PH.find((p) => p[0] === r['Phân hệ']) || [0, r['Phân hệ']])[1])} · ${esc(r['Cấp'])} · ${G.ngayVN(r['Từ ngày'])} → ${G.ngayVN(r['Đến ngày'])} · ${esc(r['Lý do'])}</div></div>${r['Đến ngày'] >= API.ngay() ? '<span class="chip xanh">Còn hạn</span>' : '<span class="chip">Hết hạn</span>'}</div>`).join('') || '<div class="muc mo">Chưa có</div>'}</div>
      <p class="mo">Thay đổi có hiệu lực trong vòng 5 phút (người dùng tải lại app).</p>`;
    const nguoi = S.dm.nguoi.filter((n) => n.nhom !== 'Trưởng bộ phận');
    m.querySelector('#pq').onclick = () => hop('Chỉnh quyền riêng', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ai', nhan: 'Áp cho', loai: 'chips', ds: nguoi.map((n) => n.ten).concat(['Tổ trưởng', 'Quản lý nhà thầu', 'Nhân viên nội bộ']), bb: true }, { k: 'ph', nhan: 'Phân hệ', loai: 'chonds', ds: PH.map((p) => ({ ten: p[1], k: p[0] })), bb: true }, { k: 'cap', nhan: 'Cấp', loai: 'chips', ds: CAP, bb: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const n = nguoi.find((x) => x.ten === v.ai); await API.goi('ghiNhieu', { bang: 'PhanQuyen', thay: ['Áp cho (nhóm hoặc Gmail)', 'Phân hệ'], dong: [{ 'Áp cho (nhóm hoặc Gmail)': n && n.gmail ? n.gmail : v.ai, 'Phân hệ': v.ph.k, 'Cấp (Không thấy/Xem/Ghi/Duyệt)': v.cap, 'Phạm vi': '', 'Người đặt': '', 'Giờ đặt': API.bayGio() }] }); dong(); bao('Đã lưu'); G.taiLai(); }, e.target);
    });
    m.querySelector('#uq').onclick = () => hop('Ủy quyền', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ai', nhan: 'Người nhận', loai: 'chips', ds: nguoi.map((n) => n.ten), bb: true }, { k: 'ph', nhan: 'Phân hệ', loai: 'chonds', ds: PH.map((p) => ({ ten: p[1], k: p[0] })), bb: true }, { k: 'cap', nhan: 'Cấp', loai: 'chips', ds: ['Ghi', 'Duyệt'], gt: 'Duyệt', bb: true },
        { k: 'tu', nhan: 'Từ ngày', loai: 'ngay', bb: true }, { k: 'den', nhan: 'Đến ngày', loai: 'ngay', bb: true }, { k: 'ly', nhan: 'Lý do', loai: 'chu', goiY: 'Ví dụ: Trưởng bộ phận nghỉ phép' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); if (v.den < v.tu) throw new Error('Ngày kết thúc trước ngày bắt đầu'); await API.goi('ghi', { bang: 'UyQuyen', dong: { 'Người ủy quyền': S.u.ten, 'Người nhận': v.ai, 'Phân hệ': v.ph.k, 'Cấp': v.cap, 'Từ ngày': v.tu, 'Đến ngày': v.den, 'Lý do': v.ly, 'Đang hiệu lực': 'Có' } }); dong(); bao('Đã ủy quyền'); G.taiLai(); }, e.target);
    });
  } };

  /* ================= THỜI TIẾT ================= */
  G.veThoiTiet = async function (goc) {
    if (!goc) return;
    try {
      const t = await API.goi('thoiTiet'); if (!t) { goc.innerHTML = ''; return; }
      const goiY = t.goiY || [];
      goc.innerHTML = `<div class="the"><div class="hang"><span style="font-size:32px">${t.bieuTuong || '⛅'}</span><div class="gian"><b>${G.so(t.nhietDo, 0)}°C · ${esc(t.moTa || '')}</b><div class="mo">Mưa hôm nay ${Math.round((t.mua24 || 0) * 100)}% · ${G.so(t.mm24 || 0)} mm · gió giật ${G.so(t.gioGiat || 0)} m/s</div></div></div>
        ${goiY.map((g) => `<div class="canh-bao" style="margin:8px 0 0">${esc(g)}</div>`).join('')}<p class="mo" style="margin:6px 0 0">Nguồn: ${esc(t.nguon || 'OpenWeather')} · ${esc(G.gioVN(t.luc))}</p></div>`;
    } catch (e) { goc.innerHTML = ''; }
  };
})();
