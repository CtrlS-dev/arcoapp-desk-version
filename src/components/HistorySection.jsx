import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, Download, FileSpreadsheet } from 'lucide-react';
import ExcelJS from 'exceljs';

const HistorySection = ({ data, loading, onCopy }) => {
  const getNDaysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getNDaysAgo(7));
  const [endDate, setEndDate] = useState(getToday());

  const formatCurrency = (val) => {
    if (typeof val !== 'number') return val;
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(item => {
      const itemDate = item.date;
      const start = startDate || '0000-00-00';
      const end = endDate || '9999-99-99';
      return itemDate >= start && itemDate <= end;
    });
  }, [data, startDate, endDate]);

  //TODO: cambiar colores y tamaños
  const handleCopyDate = (date) => {
    navigator.clipboard.writeText(date);
    if (onCopy) onCopy("Fecha copiada");
  };

  const handleCopyRate = (label, value) => {
    const formatted = formatCurrency(value);
    navigator.clipboard.writeText(formatted);
    if (onCopy) onCopy(`${label} copiado`);
  };
  //Funcion para exportar a CSV TODO: mejorar nombres y demas ........------
  const exportToCSV = () => {
    if (!filteredData.length) return;

    const headers = ['Fecha', 'Dólar (Bs)', 'Euro (Bs)'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => 
        `${item.date},${item.usd},${item.eur}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `[ARCOAPP]historial_tasas_${startDate}_${endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const exportToExcel = async () => {
    if (!filteredData.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial');

    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Dólar (Bs)', key: 'usd', width: 15 },
      { header: 'Euro (Bs)', key: 'eur', width: 15 }
    ];

    filteredData.forEach(item => {
      worksheet.addRow({ date: item.date, usd: item.usd, eur: item.eur });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `[ARCOAPP]historial_tasas_${startDate}_${endDate}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-gray-100 no-drag">
      {/* Filter Bar - Date Range Picker Style */}
      <div className="flex flex-col gap-2 mb-4 px-2 no-drag">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 no-drag">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
              <Calendar size={12} />
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#111111] border border-yellow-500 rounded-xl py-1.5 pl-8 pr-2 text-[10px] md:text-[14px] focus:outline-none focus:border-white/20 focus:bg-[#161616] transition-all cursor-pointer no-drag calendar-picker-dark text-gray-300"
              title="Fecha inicio"
            />
          </div>
          <span className="text-gray-600 text-[10px] font-bold">AL</span>
          <div className="relative flex-1 no-drag">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
              <Calendar size={12} />
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#111111] border border-yellow-500 rounded-xl py-1.5 pl-8 pr-2 text-[10px] md:text-[14px] focus:outline-none focus:border-white/20 focus:bg-[#161616] transition-all cursor-pointer no-drag calendar-picker-dark text-gray-300"
              title="Fecha fin"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          {(startDate !== getNDaysAgo(7) || endDate !== getToday()) ? (
            <button
              onClick={() => {
                setStartDate(getNDaysAgo(7));
                setEndDate(getToday());
              }}
              className="text-[9px] text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer no-drag uppercase tracking-tighter font-bold"
            >
              Filtrar última semana
            </button>
          ) : <div />}

          {filteredData.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="text-[12px] flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer no-drag uppercase tracking-tighter font-bold"
                title="Exportar a CSV"
              >
                <Download size={22} />
                CSV
              </button>
              <button
                onClick={exportToExcel}
                className="text-[12px] flex items-center gap-1 text-gray-500 hover:text-green-400 transition-colors cursor-pointer no-drag uppercase tracking-tighter font-bold"
                title="Exportar a Excel"
              >
                <FileSpreadsheet size={22} />
                Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-1 no-drag px-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Cargando historial...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="space-y-2 pb-4">
            {filteredData.map((item, idx) => (
              <motion.div
                key={item.date}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.01 }}
                className="bg-[#111111] border border-white/5 p-3 rounded-xl flex items-center justify-between transition-all no-drag hover:bg-[#161616]"
              >
                <div 
                  onClick={(e) => { e.stopPropagation(); handleCopyDate(item.date); }}
                  className="flex flex-col cursor-pointer hover:bg-white/5 px-2 -ml-2 py-1 rounded-lg transition-colors group"
                >
                  <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-0.5 group-hover:text-indigo-400 transition-colors">Fecha</span>
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">{item.date}</span>
                </div>

                <div className="flex gap-2">
                  <div 
                    onClick={(e) => { e.stopPropagation(); handleCopyRate("Dólar", item.usd); }}
                    className="flex flex-col items-end cursor-pointer hover:bg-green-500/10 px-2 py-1 rounded-lg transition-colors group"
                  >
                    <span className="text-[8px] uppercase tracking-widest text-gray-600 font-bold group-hover:text-green-400 transition-colors">USD</span>
                    <span className="text-xs font-bold text-white font-mono group-hover:text-green-300 transition-colors">{formatCurrency(item.usd)}</span>
                  </div>
                  <div 
                    onClick={(e) => { e.stopPropagation(); handleCopyRate("Euro", item.eur); }}
                    className="flex flex-col items-end cursor-pointer hover:bg-blue-500/10 px-2 py-1 rounded-lg transition-colors group"
                  >
                    <span className="text-[8px] uppercase tracking-widest text-gray-600 font-bold group-hover:text-blue-400 transition-colors">EUR</span>
                    <span className="text-xs font-bold text-white font-mono group-hover:text-blue-300 transition-colors">{formatCurrency(item.eur)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500 text-center">
            <Search size={24} className="mb-2 opacity-20" />
            <p className="text-[10px] font-medium uppercase tracking-widest">Sin registros en este rango</p>
            <button
              onClick={() => {
                setStartDate(getNDaysAgo(7));
                setEndDate(getToday());
              }}
              className="text-[9px] mt-2 text-indigo-400 hover:underline cursor-pointer font-bold"
            >
              Volver a la última semana
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .calendar-picker-dark::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        `
      }} />
    </div>
  );
};

export default HistorySection;
