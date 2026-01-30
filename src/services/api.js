const BACKEND_URL = import.meta.env.VITE_ARCO_BACKEND_URL;
const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY;

// APIs externas (respaldo)
const DOLARVZLA_API_URL = import.meta.env.VITE_API_URL;
const DOLARVZLA_API_KEY = import.meta.env.VITE_DOLARVZLA_API_KEY;
const YADIO_API_URL = import.meta.env.VITE_API_URL_P2P;

const getBackendHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (BACKEND_API_KEY) {
    headers['Authorization'] = `Bearer ${BACKEND_API_KEY}`;
  }
  return headers;
};

//  ultimas tasas
// Endpoint: GET /api/rates/latest
const fetchRatesFromBackend = async () => {
  const response = await fetch(`${BACKEND_URL}/api/rates/latest`, {
    method: 'GET',
    headers: getBackendHeaders()
  });

  if (!response.ok) {
    throw new Error(`Backend API error: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error('Invalid backend response structure');
  }

  return result;
};

// Endpoint: GET /api/rates/dolarvzla
const fetchRatesFromDolarVzla = async () => {
  const response = await fetch(DOLARVZLA_API_URL, {
    method: 'GET',
    headers: {
      'x-dolarvzla-key': DOLARVZLA_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`DolarVzla API error: ${response.status}`);
  }

  return await response.json();
};

// Endpoint: GET /api/rates/p2p
const fetchP2PRate = async () => {
  const response = await fetch(YADIO_API_URL);
  if (!response.ok) {
    throw new Error(`Yadio API error: ${response.status}`);
  }
  return await response.json();
};

// Obtiene las tasas de cambio actuales
export const fetchRates = async () => {
  const fallbackDate = new Date().toLocaleDateString();
  const defaultRates = {
    bcv_usd: { price: 0, change: 0, last_update: fallbackDate, previous_price: 0 },
    bcv_eur: { price: 0, change: 0, last_update: fallbackDate, previous_price: 0 },
    usdt: { price: 0, change: 0, last_update: fallbackDate, previous_price: 0 },
  };
  // Intentar primero con el backend
  try {
    const backendData = await fetchRatesFromBackend();
    const { USDT, BCV, BCV_EUR } = backendData.data;

    return {
      bcv_usd: BCV ? {
        price: BCV.valor || 0,
        change: 0,
        last_update: BCV.fecha || backendData.timestamp,
        previous_price: 0,
      } : defaultRates.bcv_usd,
      bcv_eur: BCV_EUR ? {
        price: BCV_EUR.valor || 0,
        change: 0,
        last_update: BCV_EUR.fecha || backendData.timestamp,
        previous_price: 0,
      } : defaultRates.bcv_eur,
      usdt: USDT ? {
        price: USDT.valor || 0,
        change: 0,
        last_update: USDT.fecha || backendData.timestamp,
        previous_price: 0,
      } : defaultRates.usdt,
    };
  } catch (backendError) {
    console.warn('Arco App no devolvio datos, usando APIs externas...', backendError.message);
  }

  // Fallback: usar APIs externas
  let dolarvzlaData = null;
  let p2pData = null;

  try {
    dolarvzlaData = await fetchRatesFromDolarVzla();
  } catch (error) {
    console.warn('DolarVzla API failed:', error.message);
  }

  try {
    p2pData = await fetchP2PRate();
  } catch (error) {
    console.warn('Yadio P2P API failed:', error.message);
  }

  // Procesar datos de DolarVzla si están disponibles
  if (dolarvzlaData && dolarvzlaData.current) {
    const { current, previous, changePercentage } = dolarvzlaData;
    const date = current.date || new Date().toISOString();

    return {
      bcv_usd: {
        price: current.usd || 0,
        change: changePercentage?.usd || 0,
        last_update: date,
        previous_price: previous?.usd || 0,
      },
      bcv_eur: {
        price: current.eur || 0,
        change: changePercentage?.eur || 0,
        last_update: date,
        previous_price: previous?.eur || 0,
      },
      usdt: {
        price: p2pData?.rate || 0,
        change: 0,
        last_update: date,
        previous_price: 0,
      },
    };
  }

  // Si solo tenemos datos P2P
  if (p2pData?.rate) {
    return {
      ...defaultRates,
      usdt: {
        price: p2pData.rate,
        change: 0,
        last_update: new Date().toISOString(),
        previous_price: 0,
      },
    };
  }

  return defaultRates;
};


// Obtiene el historial de tasas
export const fetchHistory = async () => {
  try {
    const historyUrl = import.meta.env.VITE_API_URL_HISTORY;
    if (historyUrl) {
      const response = await fetch(historyUrl, {
        method: 'GET',
        headers: {
          'x-dolarvzla-key': DOLARVZLA_API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.rates && Array.isArray(data.rates)) {
          return data.rates;
        }
      }
    }
  } catch (error) {
    console.warn('DolarVzla history API failed:', error.message);
  }

  // Fallback: usar backend propio y transformar datos
  try {
    const url = `${BACKEND_URL}/api/rates?limit=100&order=desc`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getBackendHeaders()
    });

    if (!response.ok) {
      throw new Error(`Backend history API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error('Invalid backend history response');
    }

    // Agrupar registros por fecha para crear el formato { date, usd, eur }
    const groupedByDate = {};
    
    result.data.forEach(item => {
      const dateKey = item.fecha.split('T')[0]; // Solo la fecha YYYY-MM-DD
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { date: dateKey, usd: 0, eur: 0 };
      }
      
      // Asignar valores según el tipo
      if (item.nombre === 'BCV') {
        groupedByDate[dateKey].usd = item.valor;
      } else if (item.nombre === 'BCV_EUR') {
        groupedByDate[dateKey].eur = item.valor;
      } else if (item.nombre === 'USDT' && !groupedByDate[dateKey].usd) {
        // Usar USDT como fallback si no hay BCV
        groupedByDate[dateKey].usd = item.valor;
      }
    });

    // Convertir a array y ordenar por fecha descendente
    const historyArray = Object.values(groupedByDate).sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );

    return historyArray;
  } catch (error) {
    console.error('Error fetching history from backend:', error.message);
    return [];
  }
};

/**
 * Endpoint: GET /api/rates
 * 
 * @param {Object} options
 * @param {string} options.nombre
 * @param {number} options.limit
 * @param {number} options.offset
 * @param {string} options.order
 * @param {string} options.from
 * @param {string} options.to
 * @returns {Promise<{rates: Array, pagination: Object, filters: Object}>}
 */
export const fetchHistoryAdvanced = async (options = {}) => {
  const { nombre, limit = 100, offset = 0, order = 'desc', from, to } = options;

  // URL con parametros
  const params = new URLSearchParams();
  if (nombre) params.append('nombre', nombre);
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());
  if (order) params.append('order', order);
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const queryString = params.toString();
  const url = `${BACKEND_URL}/api/rates${queryString ? '?' + queryString : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getBackendHeaders()
    });

    if (!response.ok) {
      throw new Error(`Backend history API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error fetching history');
    }

    // Transformar datos al formato estructurado
    const rates = result.data.map(item => ({
      id: item.id,
      type: item.nombre,
      value: item.valor,
      date: item.fecha,
      timestamp: new Date(item.fecha).getTime()
    }));

    return {
      rates,
      pagination: result.pagination,
      filters: result.filters
    };
  } catch (error) {
    console.error('Error fetching advanced history:', error.message);
    return { rates: [], pagination: null, filters: null };
  }
};

// Obtiene el historial de USDT únicamente
export const fetchUSDTHistory = async (limit = 50) => {
  return fetchHistoryAdvanced({ nombre: 'USDT', limit, order: 'desc' });
};


//Obtiene el historial de BCV únicamente
export const fetchBCVHistory = async (limit = 50) => {
  return fetchHistoryAdvanced({ nombre: 'BCV', limit, order: 'desc' });
};

// Verifica el estado del backend
export const checkBackendStatus = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api`, {
      method: 'GET'
    });

    if (!response.ok) {
      return { online: false, error: `Status: ${response.status}` };
    }

    const data = await response.json();
    return {
      online: data.status === 'online',
      name: data.name,
      version: data.version,
      timestamp: data.timestamp
    };
  } catch (error) {
    return { online: false, error: error.message };
  }
};
