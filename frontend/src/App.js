import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { FamilyMembers } from '@/components/FamilyMembers';
import { Investments } from '@/components/Investments';
import { AddInvestment } from '@/components/AddInvestment';
import '@/App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/family-members" element={<FamilyMembers />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/add-investment" element={<AddInvestment />} />
        </Routes>
      </Layout>
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        duration={4000}
      />
    </BrowserRouter>
  );
}

export default App;