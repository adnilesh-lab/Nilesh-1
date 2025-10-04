import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import { familyMembersAPI } from '@/lib/api';
import { toast } from 'sonner';

export const FamilyMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Self',
    email: '',
    phone: '',
    date_of_birth: '',
    pan_number: '',
    address: '',
    occupation: '',
    photo_url: ''
  });

  const relationshipOptions = [
    'Self',
    'Spouse',
    'Child', 
    'Parent',
    'Sibling',
    'Grandparent',
    'Grandchild',
    'Other'
  ];

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await familyMembersAPI.getAll();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching family members:', error);
      toast.error('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: 'Self',
      email: '',
      phone: '',
      date_of_birth: '',
      pan_number: '',
      address: '',
      occupation: '',
      photo_url: ''
    });
    setEditingMember(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      let newMember;
      
      if (editingMember) {
        // Update existing member
        newMember = await familyMembersAPI.update(editingMember.id, formData);
        setMembers(prev => prev.map(member => 
          member.id === editingMember.id ? newMember : member
        ));
        toast.success(`${newMember.name} updated successfully`);
      } else {
        // Create new member
        newMember = await familyMembersAPI.create(formData);
        setMembers(prev => [...prev, newMember]);
        toast.success(`${newMember.name} added successfully`);
      }

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error saving family member:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to save family member';
      toast.error(errorMessage);
    }
  };

  // CRITICAL FIX: Proper delete handling to prevent caching issues
  const handleDeleteMember = async (memberId, memberName) => {
    try {
      // WAIT for backend confirmation before updating UI
      await familyMembersAPI.delete(memberId);
      
      // Only remove from UI AFTER successful backend deletion
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast.success(`${memberName} deleted successfully`);
    } catch (error) {
      console.error('Error deleting family member:', error);
      
      // Handle specific error cases
      const errorMessage = error.response?.data?.detail || error.message;
      
      if (errorMessage.includes('investments')) {
        toast.error(`Cannot delete ${memberName}: Has existing investments. Please delete investments first.`);
      } else {
        toast.error(`Failed to delete ${memberName}: ${errorMessage}`);
      }
      
      // DON'T remove from UI - keep member visible since deletion failed
      // This prevents the "reappearing after refresh" issue
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name || '',
      relationship: member.relationship || 'Self',
      email: member.email || '',
      phone: member.phone || '',
      date_of_birth: member.date_of_birth || '',
      pan_number: member.pan_number || '',
      address: member.address || '',
      occupation: member.occupation || '',
      photo_url: member.photo_url || ''
    });
    setEditingMember(member);
    setIsAddDialogOpen(true);
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.relationship.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.occupation && member.occupation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Family Members</h1>
          <p className="text-gray-600 mt-2">Manage your family members and their information</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button data-testid="add-family-member">
              <Plus className="h-4 w-4 mr-2" />
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'Edit Family Member' : 'Add New Family Member'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                  data-testid="member-name-input"
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                </div>
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
              
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                  placeholder="Occupation"
                />
              </div>
              
              <div>
                <Label htmlFor="pan_number">PAN Number</Label>
                <Input
                  id="pan_number"
                  value={formData.pan_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, pan_number: e.target.value }))}
                  placeholder="PAN Number"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Address"
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
              
              <Button type="submit" className="w-full" data-testid="submit-member">
                {editingMember ? 'Update Family Member' : 'Add Family Member'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Family Members ({filteredMembers.length})</CardTitle>
            <div className="relative w-64">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-members"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching members found' : 'No Family Members Yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search term' 
                  : 'Start by adding your first family member.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)} data-testid="add-first-member">
                  Add Your First Family Member
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow" data-testid={`member-${member.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {member.photo_url ? (
                          <img 
                            src={member.photo_url} 
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900" data-testid={`member-name-${member.id}`}>
                            {member.name}
                          </h3>
                          <p className="text-sm text-blue-600 font-medium">
                            {member.relationship}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(member)}
                          data-testid={`edit-member-${member.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              data-testid={`delete-member-${member.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Family Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {member.name}? This action cannot be undone.
                                {' '}Note: Members with existing investments cannot be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-testid={`cancel-delete-${member.id}`}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteMember(member.id, member.name)}
                                className="bg-red-600 hover:bg-red-700"
                                data-testid={`confirm-delete-${member.id}`}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {member.email && (
                        <p data-testid={`member-email-${member.id}`}>
                          📧 {member.email}
                        </p>
                      )}
                      {member.phone && (
                        <p data-testid={`member-phone-${member.id}`}>
                          📱 {member.phone}
                        </p>
                      )}
                      {member.occupation && (
                        <p>💼 {member.occupation}</p>
                      )}
                      {member.date_of_birth && (
                        <p>🎂 {new Date(member.date_of_birth).toLocaleDateString()}</p>
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