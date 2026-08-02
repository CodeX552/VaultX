export function escapeCsvValue(value: string | null | undefined) {
  // CSV me commas ya quotes ho to value ko safely wrap karte hain.
  const normalized = value ?? '';
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export function parseCsv(text: string) {
  // Basic CSV parser jo header row se object map banata hai.
  const rows = text.trim().split(/\r?\n/);
  if (!rows.length) {
    return [];
  }

  const headers = rows.shift()!.split(',').map((header) => header.trim());

  return rows
    .filter(Boolean)
    .map((row) => {
      const values = row.match(/("[^"]*(?:""[^"]*)*"|[^,]+)/g) ?? [];
      const parsed = headers.reduce<Record<string, string>>((accumulator, header, index) => {
        const rawValue = values[index] ?? '';
        accumulator[header] = rawValue.startsWith('"') && rawValue.endsWith('"')
          ? rawValue.slice(1, -1).replace(/""/g, '"')
          : rawValue;
        return accumulator;
      }, {});

      return parsed;
    });
}
