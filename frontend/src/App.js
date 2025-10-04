import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { Investors } from '@/components/Investors';
import { Investments } from '@/components/Investments';
import { AddInvestment } from '@/components/AddInvestment';
import { Reports } from '@/components/Reports';
import { Settings } from '@/components/Settings';
import '@/App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/add-investment" element={<AddInvestment />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          {/* Legacy routes for compatibility */}
          <Route path="/family-members" element={<Investors />} />
        </Routes>
      </Layout>
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        duration={5000}
        className="professional-toast"
      />
    </BrowserRouter>
  );
}

export default App;