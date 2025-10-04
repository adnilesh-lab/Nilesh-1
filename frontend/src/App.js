import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Plus, Users, TrendingUp, DollarSign, Edit, Search } from 'lucide-react';
import { toast } from 'sonner';
import '@/App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// API functions with proper error handling for family members
const api = {
  getFamilyMembers: async () => {
    const response = await axios.get(`${API}/family-members`);
    return response.data;
  },
  
  createFamilyMember: async (memberData) => {
    const response = await axios.post(`${API}/family-members`, memberData);
    return response.data;
  },
  
  deleteFamilyMember: async (memberId) => {
    const response = await axios.delete(`${API}/family-members/${memberId}`);
    return response.data;
  },
  
  updateFamilyMember: async (memberId, memberData) => {
    const response = await axios.put(`${API}/family-members/${memberId}`, memberData);
    return response.data;
  },
  
  getInvestments: async () => {
    const response = await axios.get(`${API}/investments`);
    return response.data;
  },
  
  getDashboardStats: async () => {
    // Calculate stats from family members and investments
    const [members, investments] = await Promise.all([
      api.getFamilyMembers(),
      api.getInvestments()
    ]);
    
    const totalPortfolioValue = investments.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    
    return {
      total_investors: members.length,
      total_investments: investments.length,
      total_portfolio_value: totalPortfolioValue
    };
  }
};

const Dashboard = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [stats, setStats] = useState({ total_investors: 0, total_investments: 0, total_portfolio_value: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMember, setNewMember] = useState({ 
    name: '', 
    relationship: 'Self', 
    email: '', 
    phone_number: '',
    birth_date: '',
    pan_number: '',
    address: '',
    occupation: ''
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersData, investmentsData, statsData] = await Promise.all([
        api.getFamilyMembers(),
        api.getInvestments(), 
        api.getDashboardStats()
      ]);
      
      setFamilyMembers(membersData);
      setInvestments(investmentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddFamilyMember = async () => {
    if (!newMember.name.trim()) {
      toast.error('Family member name is required');
      return;
    }

    try {
      const createdMember = await api.createFamilyMember(newMember);
      
      // Update local state immediately to prevent caching issues
      setFamilyMembers(prev => [...prev, createdMember]);
      setStats(prev => ({ ...prev, total_investors: prev.total_investors + 1 }));
      
      setNewMember({ 
        name: '', 
        relationship: 'Self', 
        email: '', 
        phone_number: '',
        birth_date: '',
        pan_number: '',
        address: '',
        occupation: ''
      });
      setIsAddDialogOpen(false);
      toast.success(`Family member ${createdMember.name} added successfully`);
    } catch (error) {
      console.error('Error adding family member:', error);
      toast.error('Failed to add family member');
    }
  };

  const handleDeleteFamilyMember = async (memberId, memberName) => {
    try {
      await api.deleteFamilyMember(memberId);
      
      // KEY FIX: Immediately update local state to prevent caching issues
      // This ensures the member is removed from the UI immediately and won't reappear on refresh
      setFamilyMembers(prev => prev.filter(member => member.id !== memberId));
      setStats(prev => ({ ...prev, total_investors: prev.total_investors - 1 }));
      
      // Also remove any investments for this family member
      setInvestments(prev => prev.filter(investment => investment.family_member_id !== memberId));
      
      toast.success(`Family member ${memberName} deleted successfully`);
    } catch (error) {
      console.error('Error deleting family member:', error);
      toast.error('Failed to delete family member');
      
      // Re-fetch data if delete failed to ensure UI is in sync
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Investment Dashboard</h1>
          <p className="text-gray-600">Track and manage your investors' portfolio</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-investors">{stats.total_investors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-investments">{stats.total_investments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-portfolio-value">₹{stats.total_portfolio_value.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild className="h-auto p-4">
                <Link to="/add-investment" className="flex flex-col items-center">
                  <Plus className="h-6 w-6 mb-2" />
                  <span className="font-medium">Add Investment</span>
                  <span className="text-sm text-muted-foreground">Record new investments</span>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4">
                <Link to="/investments" className="flex flex-col items-center">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span className="font-medium">View Investments</span>
                  <span className="text-sm text-muted-foreground">Browse all records</span>
                </Link>
              </Button>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-auto p-4">
                    <div className="flex flex-col items-center">
                      <Users className="h-6 w-6 mb-2" />
                      <span className="font-medium">Manage Investors</span>
                      <span className="text-sm text-muted-foreground">Add investors</span>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Investor</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newInvestor.name}
                        onChange={(e) => setNewInvestor(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter investor name"
                        data-testid="investor-name-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newInvestor.email}
                        onChange={(e) => setNewInvestor(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                        data-testid="investor-email-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newInvestor.phone}
                        onChange={(e) => setNewInvestor(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                        data-testid="investor-phone-input"
                      />
                    </div>
                    <Button onClick={handleAddInvestor} className="w-full" data-testid="add-investor-button">
                      Add Investor
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Investors List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Investors ({investors.length})</CardTitle>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
              data-testid="add-investor-header-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Investor
            </Button>
          </CardHeader>
          <CardContent>
            {investors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Investors Yet</h3>
                <p className="text-gray-500 mb-4">Start by adding your first investor.</p>
                <Button onClick={() => setIsAddDialogOpen(true)} data-testid="add-first-investor-button">
                  Add Your First Investor
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {investors.map((investor) => (
                  <div key={investor.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`investor-${investor.id}`}>
                    <div>
                      <h4 className="font-medium text-gray-900" data-testid={`investor-name-${investor.id}`}>{investor.name}</h4>
                      {investor.email && (
                        <p className="text-sm text-gray-600" data-testid={`investor-email-${investor.id}`}>{investor.email}</p>
                      )}
                      {investor.phone && (
                        <p className="text-sm text-gray-600" data-testid={`investor-phone-${investor.id}`}>{investor.phone}</p>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" data-testid={`delete-investor-${investor.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Investor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {investor.name}? This action cannot be undone and will also delete all associated investments.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-testid={`cancel-delete-${investor.id}`}>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteInvestor(investor.id, investor.name)}
                            className="bg-red-600 hover:bg-red-700"
                            data-testid={`confirm-delete-${investor.id}`}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center">
          <a
            href="https://app.emergent.sh/?utm_source=emergent-badge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <img 
              src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" 
              alt="Emergent"
              className="h-6 w-6 mr-2"
            />
            Made with Emergent
          </a>
        </div>
      </div>
    </div>
  );
};

const AddInvestmentPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add Investment</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Investment form coming soon...</p>
        <Button asChild className="mt-4">
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);

const InvestmentsPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>All Investments</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Investments list coming soon...</p>
        <Button asChild className="mt-4">
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-investment" element={<AddInvestmentPage />} />
        <Route path="/investments" element={<InvestmentsPage />} />
        <Route path="/family-members" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
