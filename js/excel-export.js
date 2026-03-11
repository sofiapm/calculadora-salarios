// Exportacao para Excel usando SheetJS (XLSX global do CDN)

function exportToExcel(entries, workerType, location, month, year) {
  const header = ['Dia', 'N. Dias', 'Descricao', 'Partida', 'Chegada', 'Dormida', 'Valor (EUR)'];
  const rows = entries.map(e => {
    const val = calcDayValue(e, workerType, location);
    const dayFrom = e.dayFrom || e.day;
    const dayTo = e.dayTo || e.day;
    const numDays = dayTo - dayFrom + 1;
    const fromStr = String(dayFrom).padStart(2, '0') + '/' + String(month).padStart(2, '0') + '/' + year;
    let dateStr;
    if (dayFrom === dayTo) {
      dateStr = fromStr;
    } else {
      const toStr = String(dayTo).padStart(2, '0') + '/' + String(month).padStart(2, '0') + '/' + year;
      dateStr = fromStr + ' - ' + toStr;
    }
    return [
      dateStr,
      numDays,
      e.description,
      e.departure,
      e.arrival,
      e.accommodation ? 'Sim' : 'Nao',
      val
    ];
  });

  const total = calcTotal(entries, workerType, location);
  rows.push(['', '', '', '', '', 'TOTAL', total]);

  const data = [header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Larguras de coluna
  ws['!cols'] = [
    { wch: 22 }, { wch: 8 }, { wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 14 }
  ];

  // Formato moeda na coluna Valor (col G = index 6)
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let r = 1; r <= range.e.r; r++) {
    const addr = XLSX.utils.encode_cell({ r: r, c: 6 });
    if (ws[addr] && typeof ws[addr].v === 'number') {
      ws[addr].z = '#,##0.00 "EUR"';
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mapa Itinerario');

  XLSX.writeFile(wb, 'mapa_itinerario.xlsx');
}
