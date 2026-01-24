import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Copy, Check } from 'lucide-react';
import clsx from 'clsx';

const RateCard = ({ title, price, code, change, icon: Icon, color, accentColor, last_update, previous_price, calcAmount, onCopy, calcMode }) => {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const [copied, setCopied] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  };

  const formatCurrency = (val) => {
    if (typeof val !== 'number') return val;
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const handleCopy = () => {
    let rawValue;
    if (calcMode === 'BS_TO_USD') {
      rawValue = calcAmount > 0 ? (calcAmount / price) : price;
    } else {
      rawValue = calcAmount > 0 ? (price * calcAmount) : price;
    }

    const valueToCopy = formatCurrency(rawValue);

    navigator.clipboard.writeText(valueToCopy);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const displayPrice = calcAmount > 0
    ? (calcMode === 'BS_TO_USD' ? (price > 0 ? calcAmount / price : 0) : price * calcAmount)
    : price;

  const displayCode = calcAmount > 0
    ? (calcMode === 'BS_TO_USD' ? '$' : code)
    : code;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
          }
        }
      }}
      className={clsx(
        "rounded-xl p-2 md:p-4 overflow-hidden",
        "hover:bg-white/5 border md:border-2 border-white/20 hover:rounded-3xl",
        "transition-all duration-300 ease-in flex flex-col justify-between"
      )}
      onClick={handleCopy}
    >
      <button className='cursor-pointer w-full text-left bg-transparent border-none p-0'>
        <div className="flex items-center justify-between mb-1 md:mb-2">
          <div className="flex items-center gap-1 md:gap-2">
            <div className={`p-1 md:p-1.5 rounded-lg bg-green-500/10 ${color}`}>
              <Icon size={12} className="md:w-4 md:h-4 w-3 h-3" />
            </div>
            <span className="text-[10px] md:text-sm font-medium text-gray-300 truncate max-w-[100px] md:max-w-none">{title}</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className={clsx(
              "flex items-center gap-0.5 md:gap-1 text-[9px] md:text-xs font-medium px-1 md:px-2 py-0.5 rounded-full",
              isPositive ? "bg-green-500/10 text-green-400" : isNegative ? "bg-red-500/10 text-red-400" : "bg-gray-500/10 text-gray-400"
            )}>
              {isPositive ? <TrendingUp size={8} className="md:w-[10px] md:h-[10px]" /> : isNegative ? <TrendingDown size={8} className="md:w-[10px] md:h-[10px]" /> : <Minus size={8} className="md:w-[10px] md:h-[10px]" />}
              {Math.abs(change).toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-1 mt-auto">
          <span className="text-[18px] md:text-3xl font-bold text-white/80 tracking-tight">
            {formatCurrency(displayPrice)}
          </span>
          <span className="text-[8px] md:text-sm font-medium text-yellow-400/80">{displayCode}</span>
        </div>
        <hr className="my-1 md:my-2 text-white/25 rounded-full" />
        <div className="text-[12px] md:text-xs font-medium text-gray-400 flex flex-col md:flex-row md:items-center w-full items-start md:justify-between gap-1">
          <div className="text-[9px] md:text-xs font-medium text-gray-400 md:block">{formatDate(last_update)}</div>
          <div className='hidden md:block w-1 h-1 bg-gray-400 rounded-full'></div>
          <div className="text-[9px] md:text-xs">Antes: {formatCurrency(previous_price)}</div>
          <div className="md:hidden flex items-center gap-2 w-full">
            <div className={clsx(
              "flex items-center gap-0.5 md:gap-1 text-[9px] md:text-xs font-medium px-1 md:px-2 py-0.5 rounded-full w-full",
              isPositive ? "bg-green-500/10 text-green-400" : isNegative ? "bg-red-500/10 text-red-400" : "bg-gray-500/10 text-gray-400"
            )}>
              {isPositive ? <TrendingUp size={8} className="md:w-[10px] md:h-[10px]" /> : isNegative ? <TrendingDown size={8} className="md:w-[10px] md:h-[10px]" /> : <Minus size={8} className="md:w-[10px] md:h-[10px]" />}
              {Math.abs(change).toFixed(2)}%
            </div>
          </div>
        </div>
      </button>
    </motion.div >
  );
};

export default RateCard;
