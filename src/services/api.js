export const fetchRates = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL);
    if (response.ok) {
      const data = await response.json();
      const date = data.current.date || {};
      const bcv_usd_data = data.current.usd || {};
      const bcv_euro_data = data.current.eur || {};
      const bcv_usd_data_previous = data.previous.usd || {};
      const bcv_euro_data_previous = data.previous.eur || {};
      const usdt_data = data.current.paralelo || {};
      const change_percentage_bcv_usd = data.changePercentage.usd || {};
      const change_percentage_bcv_eur = data.changePercentage.eur || {};



      return {
        bcv_usd: {
          price: bcv_usd_data || 0,
          change: change_percentage_bcv_usd || 0,
          last_update: date,
          previous_price: bcv_usd_data_previous || 0,
        },
        bcv_eur: {
          price: bcv_euro_data || 0,
          change: change_percentage_bcv_eur || 0,
          last_update: date,
          previous_price: bcv_euro_data_previous || 0
        },
        usdt: {
          price: usdt_data.promedio || 0,
          change: 0,
          last_update: usdt_data.fechaActualizacion,
          previous_price: usdt_data.fechaActualizacion
        }
      };
    }
  } catch (e) {
    console.log("API failed, using fallback", e);
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        bcv_usd: { price: 0.00, change: 0.00, last_update: new Date().toLocaleDateString() },
        bcv_eur: { price: 0.00, change: 0.00, last_update: new Date().toLocaleDateString() },
        usdt: { price: 0.00, change: 0.00, last_update: new Date().toLocaleDateString() }
      });
    }, 1000);
  });
};

export const fetchHistory = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL_HISTORY);
    if (response.ok) {
      const data = await response.json();
      return data.rates || [];
    }
  } catch (e) {
    console.error("History API failed", e);
  }
  return [];
};
