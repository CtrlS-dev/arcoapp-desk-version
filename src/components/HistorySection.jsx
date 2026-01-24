import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, Copy } from 'lucide-react';
import clsx from 'clsx';

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

  const handleRowClick = (item) => {
    const textToCopy = `Dólar: ${formatCurrency(item.usd)} Bs | Euro: ${formatCurrency(item.eur)} Bs (${item.date})`;
    navigator.clipboard.writeText(textToCopy);
    if (onCopy) onCopy("Tasas copiadas");
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-gray-100 overflow-hidden no-drag">
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
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-1.5 pl-8 pr-2 text-[10px] focus:outline-none focus:border-white/20 focus:bg-[#161616] transition-all cursor-pointer no-drag calendar-picker-dark text-gray-300"
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
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-1.5 pl-8 pr-2 text-[10px] focus:outline-none focus:border-white/20 focus:bg-[#161616] transition-all cursor-pointer no-drag calendar-picker-dark text-gray-300"
              title="Fecha fin"
            />
          </div>
        </div>

        {(startDate !== getNDaysAgo(7) || endDate !== getToday()) && (
          <button
            onClick={() => {
              setStartDate(getNDaysAgo(7));
              setEndDate(getToday());
            }}
            className="text-[9px] text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer no-drag w-fit mx-auto uppercase tracking-tighter font-bold"
          >
            Restaurar últimos 7 días
          </button>
        )}
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
                onClick={() => handleRowClick(item)}
                className="bg-[#111111] border border-white/5 hover:border-indigo-500/30 p-3 rounded-xl flex items-center justify-between group transition-all cursor-pointer no-drag hover:bg-[#161616] active:scale-[0.98]"
              >
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">Fecha</span>
                  <span className="text-xs font-medium text-gray-300">{item.date}</span>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] uppercase tracking-widest text-gray-600 font-bold">USD</span>
                    <span className="text-xs font-bold text-white font-mono">{formatCurrency(item.usd)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] uppercase tracking-widest text-gray-600 font-bold">EUR</span>
                    <span className="text-xs font-bold text-white font-mono">{formatCurrency(item.eur)}</span>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400">
                    <Copy size={12} />
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
