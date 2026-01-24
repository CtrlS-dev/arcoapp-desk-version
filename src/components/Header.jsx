import React from 'react';
import { X, RefreshCw, Layers, Maximize, Pin, PinOff, Settings as SettingsIcon, History as HistoryIcon } from 'lucide-react';
import SettingsModal from './SettingsModal';

const Header = ({ onRefresh, loading }) => {
  const [isPinned, setIsPinned] = React.useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeToTray();
    } else {
      console.warn("Electron API not found");
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const togglePin = () => {
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    if (window.electronAPI) {
      window.electronAPI.setAlwaysOnTop(nextPinned);
    }
  };

  return (
    <div className="flex items-center justify-between md:p-4 mb-2 md:mb-4 drag-handle p-4" style={{ WebkitAppRegion: 'drag' }}>
      <div className={`flex items-center gap-2`}>
        <div className="p-1.5 md:p-2 bg-white/5 rounded-xl md:rounded-2xl text-indigo-400">
          <img src="/arco-logo.png" alt="Arco Logo" className="w-5 h-5 md:w-8 md:h-8" />
        </div>
        <h1 className="text-sm md:text-lg font-bold text-white/80 tracking-tight"> <span className="text-[#537E38]">Arco</span> App</h1>
      </div>

      <div className="flex items-center gap-0.5" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={() => onRefresh(true)}
          className={`p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all hover:cursor-pointer hover:scale-110 ${loading ? 'animate-spin' : ''}`}
          title='Recargar'
        >
          <RefreshCw size={18} />
        </button>
        <button
          onClick={togglePin}
          className={`p-2 rounded-xl transition-colors hover:cursor-pointer outline-0 ring-0 ${isPinned ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/5 text-gray-400 hover:text-white'} hover:scale-110`}
          title={isPinned ? 'Desfijar' : 'Fijar'}
        >
          {isPinned ? <Pin size={18} /> : <PinOff size={18} />}
        </button>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors hover:cursor-pointer hover:scale-110"
          title='Configuración'
        >
          <SettingsIcon size={18} />
        </button>
        <button
          onClick={handleMaximize}
          className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors hover:cursor-pointer hover:scale-110"
          title='Maximizar/Restaurar'
        >
          <Maximize size={18} />
        </button>
        <button
          onClick={handleClose}
          className="p-2 rounded-xl hover:scale-110 hover:bg-red-500/20 hover:text-red-400 text-gray-400 hover:animate-pulse transition-colors hover:cursor-pointer"
          title='Cerrar'
        >
          <X size={18} />
        </button>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default Header;
