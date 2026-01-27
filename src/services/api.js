export const fetchRates = async () => {
  let response = null;
  let response_p2p = null;

  try {
    response_p2p = await fetch(import.meta.env.VITE_API_URL_P2P);
  } catch (error) {
    console.log("API P2P fetch failed", error);
  }

  try {
    response = await fetch(import.meta.env.VITE_API_URL, {
      method: "GET",
      headers: {
        "x-dolarvzla-key": import.meta.env.VITE_API_KEY,
      },
    });
  } catch (e) {
    console.log("API failed, using fallback", e);
  }

  try {
    const data = response && response.ok ? await response.json() : null;

    if (!data || !data.current) {
      throw new Error("Invalid API response structure");
    }
 
    const date = data.current.date || new Date().toISOString();

    const bcv_usd_data = data.current.usd || 0;
    const bcv_euro_data = data.current.eur || 0;
    const bcv_usd_data_previous = data.previous?.usd || 0;
    const bcv_euro_data_previous = data.previous?.eur || 0;
    const change_percentage_bcv_usd = data.changePercentage?.usd || 0;
    const change_percentage_bcv_eur = data.changePercentage?.eur || 0;

    let p2p = 0;
    if (response_p2p && response_p2p.ok) {
      const dataP2p = await response_p2p.json();
      p2p = dataP2p ? dataP2p.rate : 0;
    }

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
        previous_price: bcv_euro_data_previous || 0,
      },
      usdt: {
        price: p2p || 0,
        change: 0,
        last_update: 0,
        previous_price: 0,
      },
    };
  } catch (error) {
    console.log("Error processing API data, using fallback", error);
  }

  const fallbackDate = new Date().toLocaleDateString();
  return {
    bcv_usd: { price: 0, change: 0, last_update: fallbackDate, previous_price: 0 },
    bcv_eur: { price: 0, change: 0, last_update: fallbackDate, previous_price: 0 },
    usdt: { price: 0, change: 0, last_update: fallbackDate, previous_price: 0 },
  };
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
