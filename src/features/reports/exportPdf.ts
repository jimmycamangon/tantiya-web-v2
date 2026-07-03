export interface PdfSection {
    title: string;
    subtitle?: string;
    headers: string[];
    rows: (string | number)[][];
}

function escapeHtml(value: string | number): string {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function buildSectionHtml(section: PdfSection): string {
    const headerCells = section.headers
        .map(header => `<th>${escapeHtml(header)}</th>`)
        .join("");

    const bodyRows = section.rows
        .map(row => {
            const cells = row
                .map(cell => {
                    const isNumber =
                        typeof cell === "number";

                    return `<td class="${isNumber ? "num" : ""}">${escapeHtml(cell)}</td>`;
                })
                .join("");

            return `<tr>${cells}</tr>`;
        })
        .join("");

    const emptyRow = `<tr><td colspan="${section.headers.length}" class="empty">No data for this period.</td></tr>`;

    return `
        <section>
            <h2>${escapeHtml(section.title)}</h2>
            ${section.subtitle ? `<p class="subtitle">${escapeHtml(section.subtitle)}</p>` : ""}
            <table>
                <thead><tr>${headerCells}</tr></thead>
                <tbody>${section.rows.length > 0 ? bodyRows : emptyRow}</tbody>
            </table>
        </section>
    `;
}

/**
 * Opens a print-friendly window with the report.
 * The user can save it as PDF via the browser print dialog.
 */
export function exportPdf(
    title: string,
    subtitle: string,
    sections: PdfSection[]
): void {

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
    * { box-sizing: border-box; }
    body {
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        color: #1c1917;
        margin: 32px;
    }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .meta { color: #78716c; font-size: 13px; margin: 0 0 24px; }
    h2 { font-size: 15px; margin: 24px 0 4px; }
    .subtitle { color: #78716c; font-size: 12px; margin: 0 0 8px; }
    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        margin-bottom: 8px;
    }
    th, td {
        border: 1px solid #e7e5e4;
        padding: 6px 8px;
        text-align: left;
    }
    th { background: #f5f5f4; font-weight: 600; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
    td.empty { color: #a8a29e; text-align: center; }
    section { break-inside: avoid; }
    @media print {
        body { margin: 12mm; }
    }
</style>
</head>
<body>
    <h1>${escapeHtml(title)}</h1>
    <p class="meta">${escapeHtml(subtitle)}</p>
    ${sections.map(buildSectionHtml).join("")}
    <script>
        window.onload = function () {
            window.print();
        };
    </script>
</body>
</html>`;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert(
            "Unable to open the print window. Please allow pop-ups for this site."
        );
        return;
    }

    printWindow.document.write(html);
    printWindow.document.close();
}
