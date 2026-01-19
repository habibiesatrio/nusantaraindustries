import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Dashboard from './Dashboard';
import Daftar from './Daftar';
import Profile from './Profile';
import DataManagement from './DataManagement';
import PohonIndustri from './PohonIndustri';

import PetaPotensi from './PetaPotensi';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/daftar" element={<Daftar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="/pohon-industri" element={<PohonIndustri />} />
            <Route path="/peta-potensi" element={<PetaPotensi />} />
        </Routes>
    );
}

export default App;