import React, { useEffect, useState } from 'react';
import Header from './Header';
import RateCard from './RateCard';
import HistorySection from './HistorySection';
import { fetchRates, fetchHistory } from '../services/api';
import { DollarSign, Euro, Wallet, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

function Dashboard() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calcAmount, setCalcAmount] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSleeping, setIsSleeping] = useState(false);

  // Rate limiting states
  const [refreshHistoryList, setRefreshHistoryList] = useState([]);
  const [historyRefreshList, setHistoryRefreshList] = useState([]);

  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const [customRate, setCustomRate] = useState({
    enabled: false,
    name: "Tasa Personalizada",
    value: 0
  });

  const [calcMode, setCalcMode] = useState('USD_TO_BS');

  const loadRates = async (isManual = false) => {
    if (isManual) {
      const now = Date.now();
      const sevenMinutesAgo = now - 7 * 60 * 1000;
      const recentRefreshes = refreshHistoryList.filter(time => time > sevenMinutesAgo);

      if (recentRefreshes.length >= 50) { // Limit increased to 50
        setToastMessage("Límite de consultas alcanzado. Espera unos minutos.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      setRefreshHistoryList([...recentRefreshes, now]);
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        const data = await fetchRates();

        if (data?.bcv_usd?.price && data?.bcv_eur?.price && window.electronAPI?.sendRateNotification) {
          const lastUsd = localStorage.getItem('last-bcv-usd');
          const lastEur = localStorage.getItem('last-bcv-eur');

          const currentUsd = data.bcv_usd.price.toString();
          const currentEur = data.bcv_eur.price.toString();

          let notificationBody = "";

          if (lastUsd && lastUsd !== currentUsd) {
            notificationBody += `Dólar BCV: ${currentUsd} Bs\n`;
          }
          if (lastEur && lastEur !== currentEur) {
            notificationBody += `Euro BCV: ${currentEur} Bs`;
          }

          if (notificationBody) {
            window.electronAPI.sendRateNotification("Nueva Tasa del BCV", notificationBody.trim());
          }

          localStorage.setItem('last-bcv-usd', currentUsd);
          localStorage.setItem('last-bcv-eur', currentEur);
        }

        setRates(data);
      } catch (error) {
        console.error("Failed to load rates", error);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const loadHistoryData = async () => {
    const now = Date.now();
    const sevenMinutesAgo = now - 7 * 60 * 1000;
    const recentRefreshes = historyRefreshList.filter(time => time > sevenMinutesAgo);

    if (recentRefreshes.length >= 50) { // Limit increased to 50
      // No toast here as it's often automatic, just skip
      return;
    }

    setHistoryRefreshList([...recentRefreshes, now]);
    setLoadingHistory(true);

    try {
      const data = await fetchHistory();
      setHistoryData(data);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadCustomRate = () => {
    const enabled = localStorage.getItem('custom-rate-enabled') === 'true';
    const name = localStorage.getItem('custom-rate-name') || "Tasa Personalizada";
    const rawValue = localStorage.getItem('custom-rate-value');
    const value = rawValue ? parseFloat(rawValue) : 0;
    setCustomRate({ enabled, name, value: isNaN(value) ? 0 : value });
  };

  const handleCopyNotify = (msg = "Tasa copiada") => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const toggleCalcMode = () => {
    setCalcMode(prev => prev === 'USD_TO_BS' ? 'BS_TO_USD' : 'USD_TO_BS');
  };

  const formatCurrencyVE = (val) => {
    if (typeof val !== 'number') return val;
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const handleInputChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');

    if (rawValue === '') {
      setCalcAmount(0);
      return;
    }

    const numericValue = parseInt(rawValue, 10) / 100;
    setCalcAmount(numericValue);
  };

  useEffect(() => {
    loadRates();
    loadHistoryData(); // Auto load history
    loadCustomRate();

    const handleSettingsUpdate = () => {
      loadCustomRate();
    };
    window.addEventListener('settings-updated', handleSettingsUpdate);

    if (window.electronAPI?.onSleepMode) {
      window.electronAPI.onSleepMode((sleeping) => {
        setIsSleeping(sleeping);
      });
    }

    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, []);

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="relative z-10 flex flex-col h-full gap-4">
        <Header
          onRefresh={loadRates}
          loading={loading}
        />
        <div className="flex-1 flex flex-col gap-4 px-4 pb-4">
        {/* Calculator Input */}
        <div className="px-2 no-drag flex items-stretch gap-2 h-14">
          <div className="relative flex-1 flex items-center border border-white/40 rounded-2xl p-1 group focus-within:border-yellow-500/50 transition-all shadow-lg active:scale-[0.99] no-drag">
            <input
              type="text"
              inputMode="numeric"
              value={calcAmount === 0 ? '' : (calcMode === 'USD_TO_BS' ? `$ ${formatCurrencyVE(calcAmount)}` : `Bs ${formatCurrencyVE(calcAmount)}`)}
              onChange={handleInputChange}
              placeholder={calcMode === 'USD_TO_BS' ? "$ 0,00" : "Bs 0,00"}
              className="outline-none ring-0 px-3 focus:outline-none border-none focus:ring-0 text-white text-xl font-bold w-full py-1 placeholder:text-gray-700 selection:bg-yellow-500/30"
            />
          </div>

          <button
            onClick={toggleCalcMode}
            className="flex flex-col items-center justify-center px-4 rounded-2xl border-2 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-all cursor-pointer shadow-lg active:scale-95 ease-in duration-300 no-drag"
            title="Cambiar dirección de cálculo"
          >
            <span className="text-sm font-bold">
              {calcMode === 'USD_TO_BS' ? '$ → Bs' : 'Bs → $'}
            </span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-drag pr-1">
          {/* Rate Cards Grid */}
          <div>
            {loading && !isSleeping ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="w-10 h-10 border-2 border-white/10 border-t-green-500 rounded-full animate-spin" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actualizando tasas...</span>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3 md:gap-4 px-2"
              >
                <RateCard
                  title="BCV Dólar" price={rates?.bcv_usd?.price || 0} change={rates?.bcv_usd?.change || 0}
                  last_update={rates?.bcv_usd?.last_update || 0} previous_price={rates?.bcv_usd?.previous_price || 0}
                  code="Bs" icon={DollarSign} color="text-[#5A853B]" accentColor="bg-[#5A853B]"
                  calcAmount={calcAmount} onCopy={handleCopyNotify} calcMode={calcMode}
                />
                <RateCard
                  title="BCV Euro" price={rates?.bcv_eur?.price || 0} change={rates?.bcv_eur?.change || 0}
                  last_update={rates?.bcv_eur?.last_update || 0} previous_price={rates?.bcv_eur?.previous_price || 0}
                  code="Bs" icon={Euro} color="text-[#5A853B]" accentColor="bg-[#5A853B]"
                  calcAmount={calcAmount} onCopy={handleCopyNotify} calcMode={calcMode}
                />
                <RateCard
                  title="P2P (Promedio)" price={rates?.usdt?.price || 0} change={rates?.usdt?.change || 0}
                  last_update={rates?.usdt?.last_update || 0} previous_price={rates?.usdt?.previous_price || 0}
                  code="Bs" icon={Wallet} color="text-[#5A853B]" accentColor="bg-[#5A853B]"
                  calcAmount={calcAmount} onCopy={handleCopyNotify} calcMode={calcMode}
                />
                {customRate.enabled && (
                  <RateCard
                    title={customRate.name} price={customRate.value} change={0} last_update="Personalizada"
                    previous_price={customRate.value} code="Bs" icon={Calculator} color="text-indigo-400"
                    accentColor="bg-indigo-500" calcAmount={calcAmount} onCopy={handleCopyNotify} calcMode={calcMode}
                  />
                )}
              </motion.div>
            )}
          </div>

          {/* History Section - Expandable Accordion */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="px-3 py-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer no-drag rounded-xl mx-1 border border-white/20"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-200 transition-colors">Historial de Tasas</h3>
                {!isHistoryExpanded && (
                  <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">Últimos datos</span>
                )}
              </div>
              <div className="text-gray-500">
                {isHistoryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            <AnimatePresence>
              {isHistoryExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden no-drag"
                >
                  <div className="pt-4 pb-2 h-[350px]">
                    <HistorySection
                      data={historyData}
                      loading={loadingHistory}
                      onCopy={handleCopyNotify}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={clsx(
              "fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3 text-white text-xs font-bold rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md no-drag",
              toastMessage.includes("Límite") ? "bg-red-600/90 shadow-red-500/20 text-[10px] w-[250px]" : "bg-green-600/90 shadow-green-500/20"
            )}
          >
            <div className={clsx("w-2.5 h-2.5 rounded-full animate-pulse shadow-sm", toastMessage.includes("Límite") ? "bg-red-200" : "bg-green-200")} />
            <span className="tracking-widest">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

export default Dashboard;
