// The pipeline: SQL aggregation over the BE-02 task data → one-page PDF →
// stored as an artifact on disk. The caller (BE-06 worker, job type "report")
// gets back a small JSON with the link — store and link, never ship bytes
// through the queue.
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { renderPdf } = require("./pdf");

function generate({ db_file = path.join(__dirname, "../BE-02/tasks.db"),
                    out_dir = path.join(__dirname, "artifacts"),
                    stamp = new Date().toISOString().slice(0, 10) } = {}) {
  const db = new DatabaseSync(db_file, { readOnly: true });
  // Aggregation happens in SQL, not in a JS loop over rows.
  const stats = db.prepare(
    `SELECT COUNT(*) AS total,
            COUNT(*) FILTER (WHERE done = 1) AS done,
            COUNT(*) FILTER (WHERE done = 0) AS pending,
            ROUND(100.0 * COUNT(*) FILTER (WHERE done = 1) / MAX(COUNT(*), 1), 1) AS pct
     FROM tasks`).get();
  const rows = db.prepare("SELECT id, title, done FROM tasks ORDER BY done, id").all();

  const lines = [
    { text: "Task Report", bold: true, size: 20 },
    { text: `Generated ${new Date().toISOString()} from ${path.basename(db_file)}`, size: 9 },
    { text: "" },
    { text: `Total tasks: ${stats.total}   Done: ${stats.done}   Pending: ${stats.pending}   Completion: ${stats.pct}%`, bold: true },
    { text: "" },
    { text: "Pending", bold: true, size: 13 },
    ...rows.filter((r) => !r.done).map((r) => ({ text: `  [ ] #${r.id}  ${r.title}` })),
    { text: "" },
    { text: "Done", bold: true, size: 13 },
    ...rows.filter((r) => r.done).map((r) => ({ text: `  [x] #${r.id}  ${r.title}` })),
  ];

  fs.mkdirSync(out_dir, { recursive: true });
  const name = `report-${stamp}.pdf`;
  const file = path.join(out_dir, name);
  const pdf = renderPdf(lines);
  fs.writeFileSync(file, pdf);
  return { url: `/reports/${name}`, file, bytes: pdf.length, stats };
}

module.exports = { generate };
if (require.main === module) console.log(generate());   // node report.js = on-demand run
