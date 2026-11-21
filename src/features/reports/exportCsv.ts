export interface CsvSection {
    title: string;
    headers: string[];
    rows: (string | number)[][];
}

function escapeCell(value: string | number): string {
    const text = String(value);

    if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
}

export function buildCsv(sections: CsvSection[]): string {
    const lines: string[] = [];

    for (const section of sections) {
        lines.push(escapeCell(section.title));
        lines.push(section.headers.map(escapeCell).join(","));

        for (const row of section.rows) {
            lines.push(row.map(escapeCell).join(","));
        }

        lines.push("");
    }

    return lines.join("\r\n");
}

export function downloadCsv(
    filename: string,
    sections: CsvSection[]
): void {
    // BOM so Excel opens it as UTF-8
    const bom = String.fromCharCode(0xfeff);

    const blob = new Blob(
        [bom + buildCsv(sections)],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}
