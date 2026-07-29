// Minimal PDF writer, stdlib only. A text report needs exactly one page, one
// font pair and a content stream — that's ~60 lines of the PDF spec, not a
// dependency. ponytail: single page, plain text; if reports ever need charts
// or pagination, that's the moment for pdfkit, not before.

const esc = (s) => String(s).replace(/[\\()]/g, (c) => "\\" + c);

/** lines: [{text, bold?, size?}] → Buffer of a valid one-page A4 PDF */
function renderPdf(lines) {
  let y = 800;
  const ops = [];
  for (const { text, bold = false, size = 11 } of lines) {
    y -= size * 1.5;
    if (y < 40) { ops.push(`BT /F1 9 Tf 50 30 Td (... truncated: one-page report) Tj ET`); break; }
    ops.push(`BT /F${bold ? 2 : 1} ${size} Tf 50 ${y} Td (${esc(text)}) Tj ET`);
  }
  const content = ops.join("\n");

  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] " +
      "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];

  let out = "%PDF-1.4\n";
  const offsets = [];
  objs.forEach((body, i) => {
    offsets.push(Buffer.byteLength(out));
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` +
    offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("") +
    `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

module.exports = { renderPdf };
