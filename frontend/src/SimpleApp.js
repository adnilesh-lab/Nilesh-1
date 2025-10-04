import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Simple working version without complex imports
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [investors, setInvestors] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // API Functions - using relative URLs for proxy
  const api = {
    getInvestors: async () => {
      const response = await axios.get('/api/investors');
      return response.data;
    },
    createInvestor: async (data) => {
      const response = await axios.post('/api/investors', data);
      return response.data;
    },
    deleteInvestor: async (id) => {
      const response = await axios.delete(`/api/investors/${id}`);
      return response.data;
    },
    getInvestments: async () => {
      const response = await axios.get('/api/investments');
      return response.data;
    },
    createInvestment: async (data) => {
      const response = await axios.post('/api/investments', data);
      return response.data;
    },
    deleteInvestment: async (id) => {
      const response = await axios.delete(`/api/investments/${id}`);
      return response.data;
    }
  };

  const showMessage = (msg, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [investorsData, investmentsData] = await Promise.all([
        api.getInvestors(),
        api.getInvestments()
      ]);
      setInvestors(investorsData);
      setInvestments(investmentsData);
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error loading data', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Navigation Component
  const Navigation = () => (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem 0',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
              Adv Nilesh Vishwanath Agarwal
            </h1>
            <p style={{ color: '#E2E8F0', margin: 0, fontSize: '0.9rem' }}>Investment Portfolio</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'investors', label: 'Investors' },
              { id: 'investments', label: 'Investments' },
              { id: 'add-investment', label: 'Add Investment' },
              { id: 'reports', label: 'Reports' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  background: currentPage === item.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );

  // Dashboard Component
  const Dashboard = () => {
    const totalInvestors = investors.length;
    const totalInvestments = investments.length;
    const totalValue = investments.reduce((sum, inv) => sum + inv.amount, 0);

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#2D3748' }}>Investment Portfolio Dashboard</h2>
        
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', opacity: 0.9 }}>Total Investors</h3>
            <p style={{ margin: 0, fontSize: '3rem', fontWeight: 'bold' }}>{totalInvestors}</p>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', opacity: 0.9 }}>Total Investments</h3>
            <p style={{ margin: 0, fontSize: '3rem', fontWeight: 'bold' }}>{totalInvestments}</p>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', opacity: 0.9 }}>Portfolio Value</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{formatCurrency(totalValue)}</p>
          </div>
        </div>

        {/* Recent Investments */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#2D3748' }}>Recent Investments</h3>
          {investments.slice(0, 5).map(investment => {
            const investor = investors.find(inv => inv.id === investment.investor_id);
            return (
              <div key={investment.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                margin: '0.5rem 0',
                border: '1px solid #E2E8F0',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <h4 style={{ margin: 0, color: '#2D3748' }}>{investment.investment_name}</h4>
                  <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>
                    {investor?.name} • {investment.investment_type}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#38A169' }}>
                    {formatCurrency(investment.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Simple Investors Component
  const Investors = () => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      relationship: 'Self',
      email: '',
      phone: '',
      pan_number: '',
      address: '',
      occupation: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setLoading(true);
        const newInvestor = await api.createInvestor(formData);
        setInvestors(prev => [...prev, newInvestor]);
        setFormData({ name: '', relationship: 'Self', email: '', phone: '', pan_number: '', address: '', occupation: '' });
        setShowForm(false);
        showMessage('Investor added successfully!');
      } catch (error) {
        console.error('Error adding investor:', error);
        showMessage('Error adding investor', true);
      } finally {
        setLoading(false);
      }
    };

    const handleDelete = async (id, name) => {
      if (window.confirm(`Delete ${name}? This cannot be undone.`)) {
        try {
          await api.deleteInvestor(id);
          setInvestors(prev => prev.filter(inv => inv.id !== id));
          showMessage(`${name} deleted successfully!`);
        } catch (error) {
          const errorMsg = error.response?.data?.detail || 'Delete failed';
          if (errorMsg.includes('investments')) {
            showMessage('Cannot delete: Investor has existing investments');
          } else {
            showMessage('Error deleting investor', true);
          }
        }
      }
    };

    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#2D3748', margin: 0 }}>Investor Management</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showForm ? 'Cancel' : 'Add Investor'}
          </button>
        </div>

        {showForm && (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#2D3748' }}>Add New Investor</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Relationship</label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="Self">Self</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Adding...' : 'Add Investor'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#2D3748' }}>Investors ({investors.length})</h3>
          {investors.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#718096', fontSize: '1.1rem', padding: '2rem' }}>
              No investors yet. Add your first investor to get started.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {investors.map(investor => (
                <div key={investor.id} style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  background: '#F7FAFC'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2D3748', fontSize: '1.2rem' }}>{investor.name}</h4>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#667eea', fontWeight: 'bold' }}>{investor.relationship}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(investor.id, investor.name)}
                      style={{
                        background: '#E53E3E',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: '#4A5568' }}>
                    {investor.email && <p style={{ margin: '0.25rem 0' }}>📧 {investor.email}</p>}
                    {investor.phone && <p style={{ margin: '0.25rem 0' }}>📱 {investor.phone}</p>}
                    {investor.pan_number && <p style={{ margin: '0.25rem 0' }}>🆔 {investor.pan_number}</p>}
                    {investor.address && <p style={{ margin: '0.25rem 0' }}>📍 {investor.address}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Message Component
  const MessageComponent = () => {
    if (!message) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: message.includes('Error') ? '#E53E3E' : '#48BB78',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        zIndex: 1000,
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        {message}
      </div>
    );
  };

  // Main Render
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F7FAFC' }}>
      <Navigation />
      <MessageComponent />
      
      {loading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 1001
        }}>
          Loading...
        </div>
      )}
      
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'investors' && <Investors />}
    </div>
  );
}

export default App;
