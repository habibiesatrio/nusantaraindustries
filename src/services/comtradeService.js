// src/services/comtradeService.js

export const getSumMarketValue = async (hsCode = '7201', year = '2024', flowCode = 'M') => {
  const API_KEY = process.env.REACT_APP_COMTRADE_PRIMARY_KEY;
  
  // Memanggil path proxy lokal yang sudah kita buat di setupProxy.js
  const url = `/comtrade-api/data/v1/get/C/A/HS` + 
              `?cmdCode=${hsCode}` + 
              `&flowCode=${flowCode}` + 
              `&period=${year}` + 
              `&aggregateBy=cmdCode` + 
              `&partnerCode=0` + 
              `&breakdownMode=classic`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY,
      },
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const result = await response.json();

    // ANALISA & SUM: Menggabungkan 73 data (count: 73) dari query Anda
    if (result.data && result.data.length > 0) {
      // Menjumlahkan primaryValue dari seluruh reporter yang masuk
      const totalGlobalValue = result.data.reduce((acc, curr) => acc + curr.primaryValue, 0);
      if (process.env.NODE_ENV === 'development') {
        console.log("Debug Info: Fetched data:", result.data);
        }
      return {
        totalValueUSD: totalGlobalValue,
        totalCountries: result.data.length,
        year: year
      };
    }
    console.log(process.env.NODE_ENV);
    if(process.env.NODE_ENV === 'development') {
        console.log("Debug Info: No data found in response:", result);
    }
    return null;
  } catch (error) {
    console.error("Fetch Error (Check Proxy/Network):", error);
    return null;
  }
};

export const sanitizeHSCode = (rawId) => {
    if (!rawId) return "";

    const hsPart = String(rawId).split('_')[0];

    let cleanHS = hsPart.replace(/\D/g, "");

    if (cleanHS.length === 5) {
        cleanHS = cleanHS + "0";
    }

    return cleanHS;
};

export const isValidHSCode = (hsCode) => {
    return /^\d{4,8}$/.test(hsCode);
};