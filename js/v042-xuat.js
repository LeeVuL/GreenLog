/* GreenLog 0.4.2 · xuất dữ liệu: Excel (.xlsx thật), PDF (in A4), ảnh (.zip) — luôn hỏi người dùng muốn xuất dạng nào */
(function () {
  const G = window.GL; const { esc } = G;
  const xml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  const cotChu = (i) => { let s = ''; i++; while (i) { const r = (i - 1) % 26; s = String.fromCharCode(65 + r) + s; i = Math.floor((i - 1) / 26); } return s; };
  const ten = (s) => String(s).replace(/[\\/:*?"<>|]+/g, '_').slice(0, 80);
  const tai = (blob, file) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); };
  /* sheets: [{ ten, hang: [[...], ...] }] — hàng đầu in đậm, số giữ là số */
  G.xlsx = async (file, sheets) => {
    if (!window.JSZip) throw new Error('Thiếu thư viện nén');
    const z = new window.JSZip();
    const sh = sheets.map((s, i) => ({ ten: ten(s.ten || 'Sheet' + (i + 1)).slice(0, 31), hang: s.hang || [] }));
    z.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sh.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`);
    z.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
    z.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sh.map((s, i) => `<sheet name="${xml(s.ten)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`);
    z.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sh.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sh.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
    z.file('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF123524"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0" fillId="0"/><xf fontId="1" fillId="2" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>');
    sh.forEach((s, i) => {
      const w = (s.hang[0] || []).map((_, c) => Math.min(60, Math.max(8, ...s.hang.slice(0, 200).map((r) => String(r[c] == null ? '' : r[c]).length + 2))));
      const rows = s.hang.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => { const ref = cotChu(ci) + (ri + 1); const st = ri === 0 ? ' s="1"' : '';
        if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}"${st}><v>${v}</v></c>`;
        return `<c r="${ref}" t="inlineStr"${st}><is><t xml:space="preserve">${xml(v)}</t></is></c>`; }).join('')}</row>`).join('');
      z.file(`xl/worksheets/sheet${i + 1}.xml`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>${w.length ? `<cols>${w.map((x, c) => `<col min="${c + 1}" max="${c + 1}" width="${x}" customWidth="1"/>`).join('')}</cols>` : ''}<sheetData>${rows}</sheetData></worksheet>`);
    });
    tai(await z.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), ten(file) + '.xlsx');
  };
  /* ảnh (.zip): ds = [{ ten, url }] */
  G.zipAnh = async (file, ds) => {
    const z = new window.JSZip(); let n = 0; const loi = [];
    for (const [i, a] of ds.entries()) { try { const r = await fetch(a.url); if (!r.ok) throw new Error(r.status); const b = await r.blob(); const duoi = (b.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg'); z.file(`${String(i + 1).padStart(3, '0')}_${ten(a.ten)}.${duoi}`, b); n++; } catch (e) { loi.push(a.ten + ' — ' + a.url); } }
    if (loi.length) z.file('_anh_lay_tu_link.txt', 'Các ảnh sau nằm trên web, mở bằng link:\r\n' + loi.join('\r\n'));
    tai(await z.generateAsync({ type: 'blob' }), ten(file) + '.zip'); return n;
  };
  /* hỏi dạng xuất — o: { ten, tieuDe, cot, dong (mảng mảng), tom (html tóm tắt cho PDF), sheets (thêm), anh: [{ten,url}], pdfHtml } */
  G.xuatChon = (o) => G.hop('⬇ Xuất dữ liệu', `<p class="mo" style="margin-top:0">${esc(o.tieuDe || o.ten)}${o.dong ? ` · ${o.dong.length} dòng` : ''}</p>
    <div class="xuat-chon"><button class="nut rong" data-x="xlsx">📊 Excel (.xlsx)<small>Bảng đầy đủ, lọc và tính được</small></button>
    <button class="nut rong" data-x="pdf">📄 PDF (in A4)<small>Trình bày gọn để gửi, in, trình sếp</small></button>
    ${o.anh && o.anh.length ? `<button class="nut rong" data-x="zip">🖼 Ảnh (.zip)<small>${o.anh.length} ảnh, đặt tên theo nội dung</small></button>` : ''}</div>`, (h, dong) => {
    h.querySelectorAll('[data-x]').forEach((b) => { b.onclick = () => G.chay(async () => {
      if (b.dataset.x === 'xlsx') await G.xlsx(o.ten, [{ ten: o.tieuDe || o.ten, hang: [o.cot].concat(o.dong) }].concat(o.sheets || []));
      else if (b.dataset.x === 'pdf') G.inA4(o.tieuDe || o.ten, o.pdfHtml || `${o.tom || ''}<table class="bang"><tr>${o.cot.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>${o.dong.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`);
      else { const n = await G.zipAnh(o.ten + '_anh', o.anh); G.bao(`Đã tải ${n}/${o.anh.length} ảnh`); }
      dong(); }, b); });
  });
})();
