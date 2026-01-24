import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Power, Info, ExternalLink, Calculator, Tag, DollarSign, Bell, BellOff } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const [customRateEnabled, setCustomRateEnabled] = useState(false);
  const [customRateName, setCustomRateName] = useState("");
  const [customRateValue, setCustomRateValue] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const fetchStatus = async () => {
        try {
          if (window.electronAPI?.getAutoLaunchStatus) {
            const status = await window.electronAPI.getAutoLaunchStatus();
            setAutoLaunch(status);
          }

          const savedEnabled = localStorage.getItem('custom-rate-enabled') === 'true';
          const savedName = localStorage.getItem('custom-rate-name') || "Mi Tasa";
          const savedValue = parseFloat(localStorage.getItem('custom-rate-value')) || 0;
          const savedNotifications = localStorage.getItem('notifications-enabled') !== 'false'; // Default to true
          setNotificationsEnabled(savedNotifications);
          if (window.electronAPI?.setNotificationsStatus) {
            window.electronAPI.setNotificationsStatus(savedNotifications);
          }

          setCustomRateEnabled(savedEnabled);
          setCustomRateName(savedName);
          setCustomRateValue(savedValue);

        } catch (error) {
          console.error("Error fetching settings:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchStatus();
    }
  }, [isOpen]);

  const toggleAutoLaunch = () => {
    const nextValue = !autoLaunch;
    setAutoLaunch(nextValue);
    if (window.electronAPI?.setAutoLaunchStatus) {
      window.electronAPI.setAutoLaunchStatus(nextValue);
    }
  };

  const toggleNotifications = () => {
    const nextValue = !notificationsEnabled;
    setNotificationsEnabled(nextValue);
    localStorage.setItem('notifications-enabled', nextValue);
    if (window.electronAPI?.setNotificationsStatus) {
      window.electronAPI.setNotificationsStatus(nextValue);
    }
  };

  const handleCustomRateChange = (updates) => {
    if (updates.enabled !== undefined) {
      setCustomRateEnabled(updates.enabled);
      localStorage.setItem('custom-rate-enabled', updates.enabled);
    }
    if (updates.name !== undefined) {
      setCustomRateName(updates.name);
      localStorage.setItem('custom-rate-name', updates.name);
    }
    if (updates.value !== undefined) {
      const val = typeof updates.value === 'string' ? parseFloat(updates.value) : updates.value;
      const finalVal = isNaN(val) ? 0 : val;
      setCustomRateValue(finalVal);
      localStorage.setItem('custom-rate-value', finalVal);
    }

    window.dispatchEvent(new Event('settings-updated'));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xs bg-[#1A1A1A] border border-white/10 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white uppercase tracking-widest">Configuración</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl cursor-pointer hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={toggleAutoLaunch} className={`flex ring-0 outline-none flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-white/5 transition-colors ease-in duration-200 ${autoLaunch ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/5'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform'}`}>
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                      <Power className={`w-5 h-5 ${autoLaunch ? 'text-indigo-400' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] md:text-[12px] font-bold text-white uppercase tracking-tight">Inicio Automático</p>
                      <p className="text-[9px] md:text-[10px] text-gray-500 font-semibold">{autoLaunch ? 'Activado' : 'Desactivado'}</p>
                    </div>
                  </button>

                  <button onClick={toggleNotifications} className={`flex ring-0 outline-none flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-white/5 transition-colors ease-in duration-200 ${notificationsEnabled ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/5'
                    } cursor-pointer hover:scale-105 transition-transform`}>
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                      {notificationsEnabled ? (
                        <Bell className="w-5 h-5 text-indigo-400" />
                      ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] md:text-[12px] font-bold text-white uppercase tracking-tight">Avisos</p>
                      <p className="text-[9px] md:text-[10px] text-gray-500 font-semibold">{notificationsEnabled ? "Activado" : "Desactivado"}</p>
                    </div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-500/10 rounded-xl">
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm md:text-[12px] font-medium text-white">Versión</p>
                      <p className="text-[10px] md:text-[12px] text-gray-500">0.0.3</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Tasa Personalizada</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-xl">
                          <DollarSign className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Activar Tasa Personalizada</p>
                          <p className="text-[10px] text-gray-500">Mostrar en el tablero</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCustomRateChange({ enabled: !customRateEnabled })}
                        className={`relative w-10 h-5 rounded-full transition-colors ${customRateEnabled ? 'bg-green-500' : 'bg-white/10'
                          } cursor-pointer`}
                      >
                        <motion.div
                          animate={{ x: customRateEnabled ? 22 : 2 }}
                          className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-lg"
                        />
                      </button>
                    </div>

                    {customRateEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag size={12} className="text-gray-500" />
                          </div>
                          <input
                            type="text"
                            placeholder="Nombre (ej. Mi Tasa)"
                            value={customRateName}
                            onChange={(e) => handleCustomRateChange({ name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                          />
                        </div>

                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calculator size={12} className="text-gray-500" />
                          </div>
                          <input
                            type="number"
                            placeholder="Valor en Bs"
                            value={customRateValue === 0 ? '' : customRateValue}
                            onChange={(e) => handleCustomRateChange({ value: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <a
                  href="https://github.com/CtrlS-dev/arcoapp-desk-version/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full p-2 text-[10px] text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold"
                >
                  Soporte & Feedback <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
