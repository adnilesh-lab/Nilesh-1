import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Filter, Trash2, TrendingUp } from 'lucide-react';
import { investmentsAPI, familyMembersAPI } from '@/lib/api';
import { toast } from 'sonner';

export const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [investmentsData, membersData] = await Promise.all([
        investmentsAPI.getAll(),
        familyMembersAPI.getAll()
      ]);
      setInvestments(investmentsData);
      setFamilyMembers(membersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CRITICAL FIX: Proper delete handling to prevent caching issues
  const handleDeleteInvestment = async (investmentId, investmentName) => {
    try {
      // WAIT for backend confirmation before updating UI
      await investmentsAPI.delete(investmentId);
      
      // Only remove from UI AFTER successful backend deletion
      setInvestments(prev => prev.filter(investment => investment.id !== investmentId));
      
      toast.success(`${investmentName} deleted successfully`);
    } catch (error) {
      console.error('Error deleting investment:', error);
      
      const errorMessage = error.response?.data?.detail || error.message;
      toast.error(`Failed to delete ${investmentName}: ${errorMessage}`);
      
      // DON'T remove from UI - keep investment visible since deletion failed
    }
  };

  const getMemberName = (memberId) => {
    const member = familyMembers.find(m => m.id === memberId);
    return member ? member.name : 'Unknown Member';
  };

  const investmentTypes = [...new Set(investments.map(inv => inv.investment_type))].sort();

  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = 
      investment.investment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.investment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (investment.issuer && investment.issuer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      getMemberName(investment.family_member_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMember = !selectedMemberFilter || investment.family_member_id === selectedMemberFilter;
    const matchesType = !selectedTypeFilter || investment.investment_type === selectedTypeFilter;
    
    return matchesSearch && matchesMember && matchesType;
  });

  const totalValue = filteredInvestments.reduce((sum, inv) => sum + inv.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investments</h1>
          <p className="text-gray-600 mt-2">Track and manage all family investments</p>
        </div>
        <Button asChild>
          <Link to="/add-investment" data-testid="add-investment-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Investment
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search investments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-investments"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Select value={selectedMemberFilter} onValueChange={setSelectedMemberFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Members</SelectItem>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {investmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(selectedMemberFilter || selectedTypeFilter || searchTerm) && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMemberFilter('');
                  setSelectedTypeFilter('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredInvestments.length}
              </div>
              <div className="text-sm text-gray-600">Investments</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹{totalValue.toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {investmentTypes.length}
              </div>
              <div className="text-sm text-gray-600">Investment Types</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investments List */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvestments.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedMemberFilter || selectedTypeFilter 
                  ? 'No matching investments found' 
                  : 'No Investments Yet'
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedMemberFilter || selectedTypeFilter
                  ? 'Try adjusting your filters or search term'
                  : 'Start by adding your first investment.'
                }
              </p>
              {!(searchTerm || selectedMemberFilter || selectedTypeFilter) && (
                <Button asChild>
                  <Link to="/add-investment">Add Your First Investment</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvestments.map((investment) => (
                <Card key={investment.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow" data-testid={`investment-${investment.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900" data-testid={`investment-name-${investment.id}`}>
                            {investment.investment_name}
                          </h3>
                          <Badge variant="secondary">
                            {investment.investment_type}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Amount:</span>
                            <div className="font-semibold text-green-600">
                              ₹{investment.amount.toLocaleString('en-IN')}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">Owner:</span>
                            <div className="font-medium">
                              {getMemberName(investment.family_member_id)}
                            </div>
                          </div>
                          
                          {investment.issuer && (
                            <div>
                              <span className="text-gray-600">Issuer:</span>
                              <div className="font-medium">{investment.issuer}</div>
                            </div>
                          )}
                          
                          {investment.purchase_date && (
                            <div>
                              <span className="text-gray-600">Purchase Date:</span>
                              <div className="font-medium">
                                {new Date(investment.purchase_date).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {investment.description && (
                          <div className="mt-3">
                            <span className="text-gray-600 text-sm">Description:</span>
                            <p className="text-gray-800 mt-1">{investment.description}</p>
                          </div>
                        )}
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="ml-4"
                            data-testid={`delete-investment-${investment.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Investment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the investment "{investment.investment_name}"? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-testid={`cancel-delete-investment-${investment.id}`}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteInvestment(investment.id, investment.investment_name)}
                              className="bg-red-600 hover:bg-red-700"
                              data-testid={`confirm-delete-investment-${investment.id}`}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};