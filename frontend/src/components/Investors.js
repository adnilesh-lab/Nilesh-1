import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import { investorsAPI } from '@/lib/api';
import { toast } from 'sonner';

export const Investors = () => {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Self',
    email: '',
    phone: '',
    mobile_number: '',
    address: '',
    pan_number: '',
    date_of_birth: '',
    occupation: '',
    photo_url: '',
    custom_fields: {}
  });

  const relationshipOptions = [
    'Self',
    'Spouse',
    'Child', 
    'Parent',
    'Sibling',
    'Grandparent',
    'Grandchild',
    'Business Partner',
    'Trust',
    'Other'
  ];

  const fetchInvestors = async () => {
    try {
      setLoading(true);
      const data = await investorsAPI.getAll();
      setInvestors(data);
    } catch (error) {
      console.error('Error fetching investors:', error);
      toast.error('Failed to load investors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: 'Self',
      email: '',
      phone: '',
      mobile_number: '',
      address: '',
      pan_number: '',
      date_of_birth: '',
      occupation: '',
      photo_url: '',
      custom_fields: {}
    });
    setEditingInvestor(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      let newInvestor;
      
      if (editingInvestor) {
        newInvestor = await investorsAPI.update(editingInvestor.id, formData);
        setInvestors(prev => prev.map(investor => 
          investor.id === editingInvestor.id ? newInvestor : investor
        ));
        toast.success(`${newInvestor.name} updated successfully`);
      } else {
        newInvestor = await investorsAPI.create(formData);
        setInvestors(prev => [...prev, newInvestor]);
        toast.success(`${newInvestor.name} added successfully`);
      }

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error saving investor:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to save investor';
      toast.error(errorMessage);
    }
  };

  // CRITICAL FIX: Proper delete handling to prevent caching issues
  const handleDeleteInvestor = async (investorId, investorName) => {
    try {
      // WAIT for backend confirmation before updating UI
      await investorsAPI.delete(investorId);
      
      // Only remove from UI AFTER successful backend deletion
      setInvestors(prev => prev.filter(investor => investor.id !== investorId));
      
      toast.success(`${investorName} deleted successfully`);
    } catch (error) {
      console.error('Error deleting investor:', error);
      
      // Handle specific error cases
      const errorMessage = error.response?.data?.detail || error.message;
      
      if (errorMessage.includes('investments')) {
        toast.error(`Cannot delete ${investorName}: Has existing investments. Please delete investments first.`);
      } else {
        toast.error(`Failed to delete ${investorName}: ${errorMessage}`);
      }
      
      // DON'T remove from UI - keep investor visible since deletion failed
    }
  };

  const handleEdit = (investor) => {
    setFormData({
      name: investor.name || '',
      relationship: investor.relationship || 'Self',
      email: investor.email || '',
      phone: investor.phone || '',
      mobile_number: investor.mobile_number || '',
      address: investor.address || '',
      pan_number: investor.pan_number || '',
      date_of_birth: investor.date_of_birth || '',
      occupation: investor.occupation || '',
      photo_url: investor.photo_url || '',
      custom_fields: investor.custom_fields || {}
    });
    setEditingInvestor(investor);
    setIsAddDialogOpen(true);
  };

  const filteredInvestors = investors.filter(investor => 
    investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.relationship.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (investor.email && investor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (investor.occupation && investor.occupation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Professional Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Investor Management
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Manage your portfolio investors and their information</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white shadow-lg" data-testid="add-investor">
              <Plus className="h-4 w-4 mr-2" />
              Add Investor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto professional-form">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingInvestor ? 'Edit Investor' : 'Add New Investor'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                    data-testid="investor-name-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select 
                    value={formData.relationship} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="pan_number">PAN Number</Label>
                  <Input
                    id="pan_number"
                    value={formData.pan_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, pan_number: e.target.value }))}
                    placeholder="PAN Number (ABCDE1234F)"
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full address"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                    placeholder="Occupation/Business"
                  />
                </div>
                <div>
                  <Label htmlFor="photo_url">Photo URL</Label>
                  <Input
                    id="photo_url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
                    placeholder="Photo URL (optional)"
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full gradient-primary text-white" data-testid="submit-investor">
                {editingInvestor ? 'Update Investor' : 'Add Investor'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <Card className="investment-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold flex items-center">
              <User className="h-5 w-5 mr-2 text-indigo-600" />
              Investors ({filteredInvestors.length})
            </CardTitle>
            <div className="relative w-80">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search investors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-investors"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvestors.length === 0 ? (
            <div className="text-center py-16">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                {searchTerm ? 'No matching investors found' : 'No Investors Yet'}
              </h3>
              <p className="text-gray-500 mb-6 text-lg">
                {searchTerm 
                  ? 'Try adjusting your search term' 
                  : 'Start by adding your first investor to begin building your portfolio.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-primary text-white" data-testid="add-first-investor">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Investor
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvestors.map((investor) => (
                <Card key={investor.id} className="investment-card hover:shadow-lg transition-all duration-300" data-testid={`investor-${investor.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {investor.photo_url ? (
                          <img 
                            src={investor.photo_url} 
                            alt={investor.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-indigo-200">
                            <User className="h-8 w-8 text-indigo-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg" data-testid={`investor-name-${investor.id}`}>
                            {investor.name}
                          </h3>
                          <p className="text-indigo-600 font-semibold">
                            {investor.relationship}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(investor)}
                          className="hover:bg-indigo-50"
                          data-testid={`edit-investor-${investor.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              data-testid={`delete-investor-${investor.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Investor</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {investor.name}? This action cannot be undone.
                                {' '}Note: Investors with existing investments cannot be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-testid={`cancel-delete-${investor.id}`}>
                                Cancel
                              </AlertDialogCancel>
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
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {investor.email && (
                        <p className="flex items-center text-gray-600" data-testid={`investor-email-${investor.id}`}>
                          <span className="font-medium mr-2">📧</span> {investor.email}
                        </p>
                      )}
                      {investor.phone && (
                        <p className="flex items-center text-gray-600" data-testid={`investor-phone-${investor.id}`}>
                          <span className="font-medium mr-2">📱</span> {investor.phone}
                        </p>
                      )}
                      {investor.pan_number && (
                        <p className="flex items-center text-gray-600">
                          <span className="font-medium mr-2">🆔</span> {investor.pan_number}
                        </p>
                      )}
                      {investor.occupation && (
                        <p className="flex items-center text-gray-600">
                          <span className="font-medium mr-2">💼</span> {investor.occupation}
                        </p>
                      )}
                      {investor.address && (
                        <p className="flex items-center text-gray-600">
                          <span className="font-medium mr-2">📍</span> {investor.address}
                        </p>
                      )}
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