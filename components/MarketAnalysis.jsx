// src/pages/MarketAnalysis.jsx
import React, { useEffect, useState } from 'react';
import { getSumMarketValue } from '../services/comtradeService';

const MarketAnalysis = () => {
  const [marketValue, setMarketValue] = useState(0);
  const [countryCount, setCountryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        // Panggil service. Service ini sudah mengembalikan objek:
        // { totalValueUSD, totalCountries, year }
        const result = await getSumMarketValue('7201', '2023'); 
        
        if (result) {
          // JANGAN di-reduce lagi di sini karena sudah dilakukan di service
          setMarketValue(result.totalValueUSD);
          setCountryCount(result.totalCountries);
          
          console.log(`Berhasil memuat total dari ${result.totalCountries} negara.`);
        }
      } catch (err) {
        console.error("Gagal menampilkan data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="animate-pulse">Menghitung Global Market Value...</p>
    </div>
  );

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Analisis Pasar Global (Final Summed Data)</h1>
      
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-600 font-semibold uppercase">Total Market Value (HS 7201)</p>
        <h2 className="text-4xl font-black text-blue-900">
          {/* Gunakan primaryValue yang sudah dijumlahkan dari API */}
          ${marketValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
        </h2>
        <p className="text-xs text-gray-500 mt-2 italic">
          *Dihitung dari akumulasi {countryCount} negara pelapor di dunia
        </p>
      </div>

      <div className="mt-6 text-sm text-gray-400">
        <p>Status API: Berhasil ditarik tanpa CORS melalui Proxy</p>
      </div>
    </div>
  );
};

export default MarketAnalysis;