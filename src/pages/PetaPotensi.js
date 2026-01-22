import React, { useState } from 'react';

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PetaPotensi = () => {
    const [selectedRegion, setSelectedRegion] = useState('...');
    const [potentialType, setPotentialType] = useState(null);

    return (
        <div className="container mx-auto p-4 animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">INDUSTRIAL MAPPING</h1>
                    <p className="text-slate-500">Live Geo : {selectedRegion}</p>
                </div>
                <Link to="/dashboard" className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg transition-colors">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Peta</h2>
                    <div className="h-96 bg-slate-200 rounded-lg flex items-center justify-center">
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322532!2d106.8196113147688!3d-6.194741395514785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2c6bf7b4a4c5a4!2sNational%20Research%20and%20Innovation%20Agency%20(BRIN)!5e0!3m2!1sen!2sid!4v1623909 BRIN!5e0!3m2!1sen!2sid"
                            allowFullScreen=""
                            loading="lazy"
                            title="BRIN Location"
                            className="rounded-lg"
                        ></iframe>
                    </div>
                    <div className="mt-4 flex justify-between">
                        <input
                            type="text"
                            placeholder="Cari wilayah..."
                            className="w-full md:w-1/2 p-2 border rounded"
                            onChange={(e) => setSelectedRegion(e.target.value || '...')}
                        />
                        <div className="text-right">
                            <label htmlFor="gis-upload" className="cursor-pointer bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded">
                                Upload GIS File
                            </label>
                            <input id="gis-upload" type="file" className="hidden" />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Analisis Regional</h3>
                        <p><strong>Nama Wilayah:</strong> {selectedRegion}</p>
                        <p><strong>Koordinat:</strong> -</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Status Investasi</h3>
                        <p className="text-green-500 font-bold">Layak Investasi</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Komoditas Fokus</h2>
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => setPotentialType('hilir')}
                        className={`font-bold py-2 px-4 rounded-lg transition-colors ${potentialType === 'hilir' ? 'bg-sky-500 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                    >
                        Potensi Hilir ({selectedRegion})
                    </button>
                    <button
                        onClick={() => setPotentialType('hulu')}
                        className={`font-bold py-2 px-4 rounded-lg transition-colors ${potentialType === 'hulu' ? 'bg-sky-500 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                    >
                        Potensi Hulu ({selectedRegion})
                    </button>
                </div>

                {potentialType && (
                    <div>
                        <h3 className="text-lg font-semibold mt-4">Tabel Potensi {potentialType === 'hilir' ? 'Hilir' : 'Hulu'}</h3>
                        <div className="overflow-x-auto mt-2">
                            <table className="min-w-full leading-normal">
                                <thead>
                                    <tr>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Komoditas</th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jumlah Paten</th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valuasi Ekspor/Impor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">Contoh Komoditas</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">10</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">$1,000,000</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-lg font-semibold mt-6">Status Maturitas Teknologi</h3>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>TRL Readness: -</li>
                            <li>CRL Readness: -</li>
                            <li>MRL Readness: -</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PetaPotensi;
