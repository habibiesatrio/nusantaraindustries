import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Daftar from './pages/Daftar';
import Profile from './pages/Profile';
import DataManagement from './pages/DataManagement';
import PohonIndustri from './pages/PohonIndustri';
import MarketAnalysis from './pages/MarketAnalysis';
import PetaPotensi from './pages/PetaPotensi';
import InputNodePage from './pages/InputNodePage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/daftar" element={<Daftar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="/pohon-industri" element={<PohonIndustri />} />
            <Route path="/input-node" element={<InputNodePage />} />
            <Route path="/peta-potensi" element={<PetaPotensi />} />
            <Route path="/market-analysis" element={<MarketAnalysis />} />
        </Routes>
    );
}

export default App;