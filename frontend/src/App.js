import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [investors, setInvestors] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // API Functions
  const api = {
    getInvestors: async () => {
      const response = await axios.get(`${API}/investors`);
      return response.data;
    },
    createInvestor: async (data) => {
      const response = await axios.post(`${API}/investors`, data);
      return response.data;
    },
    deleteInvestor: async (id) => {
      const response = await axios.delete(`${API}/investors/${id}`);
      return response.data;
    },
    getInvestments: async () => {
      const response = await axios.get(`${API}/investments`);
      return response.data;
    },
    createInvestment: async (data) => {
      const response = await axios.post(`${API}/investments`, data);
      return response.data;
    },
    deleteInvestment: async (id) => {
      const response = await axios.delete(`${API}/investments/${id}`);
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

  // Investors Component
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
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>PAN Number</label>
                <input
                  type="text"
                  value={formData.pan_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, pan_number: e.target.value }))}
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
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

  // Add Investment Component
  const AddInvestment = () => {
    const [formData, setFormData] = useState({
      investor_id: '',
      investment_name: '',
      investment_type: 'Mutual Funds',
      amount: '',
      purchase_date: '',
      interest_rate: '',
      interest_date: '',
      maturity_date: '',
      description: '',
      issuer: '',
      photo_url: '',
      custom_fields: {
        risk_level: 'Medium',
        investment_goals: '',
        lock_in_period: ''
      }
    });

    const investmentTypes = [
      'Mutual Funds', 'Stocks', 'Bonds', 'Fixed Deposits', 'PPF', 'NSC',
      'ELSS', 'Real Estate', 'Gold', 'Government Securities', 'Other'
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.investor_id || !formData.investment_name || !formData.amount) {
        showMessage('Please fill required fields', true);
        return;
      }

      try {
        setLoading(true);
        const newInvestment = await api.createInvestment({
          ...formData,
          amount: parseFloat(formData.amount),
          interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null
        });
        setInvestments(prev => [...prev, newInvestment]);
        setFormData({
          investor_id: '',
          investment_name: '',
          investment_type: 'Mutual Funds',
          amount: '',
          purchase_date: '',
          interest_rate: '',
          interest_date: '',
          maturity_date: '',
          description: '',
          issuer: '',
          photo_url: '',
          custom_fields: { risk_level: 'Medium', investment_goals: '', lock_in_period: '' }
        });
        showMessage('Investment added successfully!');
      } catch (error) {
        showMessage('Error adding investment', true);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#2D3748' }}>Add New Investment</h2>
        
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Investor *</label>
              <select
                value={formData.investor_id}
                onChange={(e) => setFormData(prev => ({ ...prev, investor_id: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select Investor</option>
                {investors.map(investor => (
                  <option key={investor.id} value={investor.id}>
                    {investor.name} ({investor.relationship})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Investment Name *</label>
              <input
                type="text"
                value={formData.investment_name}
                onChange={(e) => setFormData(prev => ({ ...prev, investment_name: e.target.value }))}
                placeholder="e.g., SBI Bluechip Fund"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Investment Type</label>
              <select
                value={formData.investment_type}
                onChange={(e) => setFormData(prev => ({ ...prev, investment_type: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                {investmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Amount (₹) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="50000"
                min="0"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Interest Rate (%)</label>
              <input
                type="number"
                value={formData.interest_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, interest_rate: e.target.value }))}
                placeholder="7.5"
                min="0"
                step="0.1"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Interest Date (DDMM)</label>
              <input
                type="text"
                value={formData.interest_date}
                onChange={(e) => setFormData(prev => ({ ...prev, interest_date: e.target.value }))}
                placeholder="1503 (15th March)"
                maxLength="4"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Purchase Date</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Maturity Date</label>
              <input
                type="date"
                value={formData.maturity_date}
                onChange={(e) => setFormData(prev => ({ ...prev, maturity_date: e.target.value }))}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Issuer/Company</label>
              <input
                type="text"
                value={formData.issuer}
                onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                placeholder="e.g., SBI Mutual Fund"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Photo URL (Square format)</label>
              <input
                type="url"
                value={formData.photo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            {/* Custom Fields */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Risk Level</label>
              <select
                value={formData.custom_fields.risk_level}
                onChange={(e) => setFormData(prev => ({ ...prev, custom_fields: { ...prev.custom_fields, risk_level: e.target.value } }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Investment Goals</label>
              <input
                type="text"
                value={formData.custom_fields.investment_goals}
                onChange={(e) => setFormData(prev => ({ ...prev, custom_fields: { ...prev.custom_fields, investment_goals: e.target.value } }))}
                placeholder="e.g., Wealth Creation, Retirement"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4A5568' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about this investment..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  resize: 'vertical'
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
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Creating Investment...' : 'Create Investment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Investments Component
  const Investments = () => {
    const [viewType, setViewType] = useState('list');

    const handleDelete = async (id, name) => {
      if (window.confirm(`Delete ${name}? This cannot be undone.`)) {
        try {
          await api.deleteInvestment(id);
          setInvestments(prev => prev.filter(inv => inv.id !== id));
          showMessage(`${name} deleted successfully!`);
        } catch (error) {
          showMessage('Error deleting investment', true);
        }
      }
    };

    const getInvestorName = (investorId) => {
      const investor = investors.find(inv => inv.id === investorId);
      return investor ? investor.name : 'Unknown';
    };

    const renderListView = () => (
      <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Investment</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Investor</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Interest</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((investment, index) => (
                <tr key={investment.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: index % 2 === 0 ? '#F7FAFC' : 'white' }}>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <strong>{investment.investment_name}</strong>
                      {investment.issuer && <div style={{ fontSize: '0.9rem', color: '#718096' }}>{investment.issuer}</div>}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{investment.investment_type}</td>
                  <td style={{ padding: '1rem' }}>{getInvestorName(investment.investor_id)}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#38A169' }}>{formatCurrency(investment.amount)}</td>
                  <td style={{ padding: '1rem' }}>{investment.interest_rate ? `${investment.interest_rate}%` : '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleDelete(investment.id, investment.investment_name)}
                      style={{
                        background: '#E53E3E',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

    const renderCardView = () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {investments.map(investment => (
          <div key={investment.id} style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#2D3748', fontSize: '1.2rem' }}>{investment.investment_name}</h4>
                <p style={{ margin: '0 0 0.5rem 0', color: '#667eea', fontWeight: 'bold' }}>{investment.investment_type}</p>
                <p style={{ margin: '0', color: '#718096' }}>{getInvestorName(investment.investor_id)}</p>
              </div>
              {investment.photo_url && (
                <img 
                  src={investment.photo_url} 
                  alt={investment.investment_name}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem', marginLeft: '1rem' }}
                />
              )}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38A169', marginBottom: '0.5rem' }}>
                {formatCurrency(investment.amount)}
              </div>
              {investment.interest_rate && (
                <div style={{ fontSize: '0.9rem', color: '#4A5568' }}>Interest: {investment.interest_rate}%</div>
              )}
              {investment.interest_date && (
                <div style={{ fontSize: '0.9rem', color: '#4A5568' }}>Interest Date: {investment.interest_date}</div>
              )}
            </div>
            
            {investment.description && (
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#4A5568' }}>{investment.description}</p>
            )}
            
            <button
              onClick={() => handleDelete(investment.id, investment.investment_name)}
              style={{
                background: '#E53E3E',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Delete Investment
            </button>
          </div>
        ))}
      </div>
    );

    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#2D3748', margin: 0 }}>Investments ({investments.length})</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #E2E8F0',
                borderRadius: '0.5rem',
                background: 'white'
              }}
            >
              <option value="list">List View</option>
              <option value="card">Card View</option>
              <option value="table">Table View</option>
            </select>
            <button
              onClick={() => setCurrentPage('add-investment')}
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
              Add Investment
            </button>
          </div>
        </div>

        {investments.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '1rem',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '1.2rem', color: '#718096', marginBottom: '1rem' }}>
              No investments yet. Add your first investment to get started.
            </p>
            <button
              onClick={() => setCurrentPage('add-investment')}
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
              Add Your First Investment
            </button>
          </div>
        ) : (
          viewType === 'card' ? renderCardView() : renderListView()
        )}
      </div>
    );
  };

  // Reports Component
  const Reports = () => {
    const totalValue = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const investmentTypes = investments.reduce((acc, inv) => {
      acc[inv.investment_type] = (acc[inv.investment_type] || 0) + inv.amount;
      return acc;
    }, {});

    const investorSummary = investors.map(investor => {
      const investorInvestments = investments.filter(inv => inv.investor_id === investor.id);
      const totalAmount = investorInvestments.reduce((sum, inv) => sum + inv.amount, 0);
      return {
        ...investor,
        investmentCount: investorInvestments.length,
        totalAmount
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#2D3748' }}>Investment Reports</h2>
        
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>Total Portfolio</h3>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{formatCurrency(totalValue)}</p>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>Investment Types</h3>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{Object.keys(investmentTypes).length}</p>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>Avg per Investor</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
              {formatCurrency(investors.length > 0 ? totalValue / investors.length : 0)}
            </p>
          </div>
        </div>

        {/* Investor-wise Summary */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#2D3748' }}>Investor-wise Summary</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F7FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#4A5568' }}>Rank</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#4A5568' }}>Investor</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#4A5568' }}>Relationship</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#4A5568' }}>Investments</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#4A5568' }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {investorSummary.map((investor, index) => (
                  <tr key={investor.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : '#E2E8F0',
                        color: index < 3 ? 'white' : '#4A5568',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '50%',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#2D3748' }}>{investor.name}</td>
                    <td style={{ padding: '1rem', color: '#667eea' }}>{investor.relationship}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{investor.investmentCount}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#38A169' }}>
                      {formatCurrency(investor.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Investment Type Summary */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#2D3748' }}>Investment Type Distribution</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {Object.entries(investmentTypes).map(([type, amount]) => (
              <div key={type} style={{
                background: '#F7FAFC',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #E2E8F0',
                textAlign: 'center'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#2D3748' }}>{type}</h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#38A169' }}>
                  {formatCurrency(amount)}
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#718096' }}>
                  {((amount / totalValue) * 100).toFixed(1)}% of portfolio
                </p>
              </div>
            ))}
          </div>
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
      {currentPage === 'investments' && <Investments />}
      {currentPage === 'add-investment' && <AddInvestment />}
      {currentPage === 'reports' && <Reports />}
    </div>
  );
}

export default App;