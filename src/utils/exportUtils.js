
/**
 * Trata especialidades brasileiros (acentos) e converte array de objetos para CSV
 */
export const downloadCSV = (data, filename, headers) => {
  if (!data || !data.length) return;

  const csvRows = [];
  
  // Header row
  csvRows.push(headers.join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map((header, index) => {
      const field = Object.keys(row)[index]; // This assumes order matches, better to use explicit keys
      let val = row[field];
      
      // Escape commas and wrap in quotes if necessary
      if (typeof val === 'string') {
        val = `"${val.replace(/"/g, '""')}"`;
      } else if (val === null || val === undefined) {
        val = '';
      }
      return val;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportHistoricoToCSV = (historico) => {
  const headers = [
    'Data',
    'Total (R$)',
    'Pix (R$)',
    'Dinheiro (R$)',
    'Cartao (R$)',
    'Custos (R$)',
    'Qtde Vendas'
  ];

  const data = historico.map(item => ({
    data: item.data,
    total: item.total,
    totalPix: item.totalPix,
    totalDinheiro: item.totalDinheiro,
    totalCartao: item.totalCartao,
    totalCustos: item.totalCustos,
    quantidadeVendas: item.quantidadeVendas
  }));

  // Map data to specific keys in the correct order
  const formattedData = data.map(item => [
    item.data,
    item.total,
    item.totalPix,
    item.totalDinheiro,
    item.totalCartao,
    item.totalCustos,
    item.quantidadeVendas
  ]);

  const csvRows = [headers.join(',')];
  formattedData.forEach(row => {
    csvRows.push(row.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `historico_vendas_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
