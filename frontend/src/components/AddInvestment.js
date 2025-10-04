import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, DollarSign, Save } from 'lucide-react';
import { investmentsAPI, investorsAPI, customFieldsAPI } from '@/lib/api';
import { toast } from 'sonner';

export const AddInvestment = () => {
  const navigate = useNavigate();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    investor_id: '',
    investment_name: '',
    investment_type: '',
    amount: '',
    purchase_date: '',
    interest_rate: '',
    maturity_date: '',
    description: '',
    issuer: '',
    photo_url: '',
    custom_fields: {}
  });

  const investmentTypes = [
    'Mutual Funds',
    'Stocks',
    'Bonds',
    'Fixed Deposits',
    'PPF',
    'NSC',
    'ELSS',
    'Real Estate',
    'Gold',
    'Insurance Policies',
    'Government Securities',
    'Corporate Bonds',
    'ULIPs',
    'NPS',
    'Other'
  ];

  useEffect(() => {
    fetchFamilyMembers();
    fetchCustomFields();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true);
      const data = await investorsAPI.getAll();
      setFamilyMembers(data);
    } catch (error) {
      console.error('Error fetching family members:', error);
      toast.error('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomFields = async () => {
    try {
      const data = await customFieldsAPI.getByEntityType('investment');
      setCustomFields(data);
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      // Don't show error as custom fields are optional
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.investor_id) {
      toast.error('Please select an investor');
      return;
    }
    
    if (!formData.investment_name.trim()) {
      toast.error('Please enter investment name');
      return;
    }
    
    if (!formData.investment_type) {
      toast.error('Please select investment type');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);
      
      const investmentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
      };

      await investmentsAPI.create(investmentData);
      
      toast.success(`Investment "${formData.investment_name}" added successfully`);
      navigate('/investments');
    } catch (error) {
      console.error('Error creating investment:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to create investment';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate('/investments')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Investments
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Investment</h1>
          <p className="text-gray-600 mt-2">Record a new investment for your family</p>
        </div>
      </div>

      {familyMembers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Family Members Found
            </h3>
            <p className="text-gray-500 mb-4">
              You need to add family members before creating investments.
            </p>
            <Button onClick={() => navigate('/family-members')}>
              Add Family Members First
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Investment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="investor_id">Investor *</Label>
                  <Select 
                    value={formData.investor_id} 
                    onValueChange={(value) => handleInputChange('investor_id', value)}
                  >
                    <SelectTrigger data-testid="investor-select">
                      <SelectValue placeholder="Select investor" />
                    </SelectTrigger>
                    <SelectContent>
                      {familyMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.relationship})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="investment_type">Investment Type *</Label>
                  <Select 
                    value={formData.investment_type} 
                    onValueChange={(value) => handleInputChange('investment_type', value)}
                  >
                    <SelectTrigger data-testid="type-select">
                      <SelectValue placeholder="Select investment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="investment_name">Investment Name *</Label>
                  <Input
                    id="investment_name"
                    value={formData.investment_name}
                    onChange={(e) => handleInputChange('investment_name', e.target.value)}
                    placeholder="e.g., HDFC Top 100 Fund"
                    required
                    data-testid="investment-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="issuer">Issuer/Company</Label>
                  <Input
                    id="issuer"
                    value={formData.issuer}
                    onChange={(e) => handleInputChange('issuer', e.target.value)}
                    placeholder="e.g., HDFC Mutual Fund"
                    data-testid="issuer-input"
                  />
                </div>
              </div>

              {/* Financial Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="amount">Investment Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="50000"
                    min="0"
                    step="0.01"
                    required
                    data-testid="amount-input"
                  />
                </div>

                <div>
                  <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    value={formData.interest_rate}
                    onChange={(e) => handleInputChange('interest_rate', e.target.value)}
                    placeholder="7.5"
                    min="0"
                    step="0.01"
                    data-testid="interest-rate-input"
                  />
                </div>

                <div>
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                    data-testid="purchase-date-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maturity_date">Maturity Date (if applicable)</Label>
                <Input
                  id="maturity_date"
                  type="date"
                  value={formData.maturity_date}
                  onChange={(e) => handleInputChange('maturity_date', e.target.value)}
                  data-testid="maturity-date-input"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional details about this investment..."
                  rows={3}
                  data-testid="description-input"
                />
              </div>

              {/* Photo Upload Section */}
              <div>
                <Label htmlFor="photo_url">Investment Photo (Square format recommended)</Label>
                <Input
                  id="photo_url"
                  value={formData.photo_url}
                  onChange={(e) => handleInputChange('photo_url', e.target.value)}
                  placeholder="Enter photo URL or upload image"
                  data-testid="photo-url-input"
                />
                <p className="text-xs text-gray-600 mt-1">
                  You can paste an image URL or upload to an image hosting service
                </p>
              </div>

              {/* Interest Date (DDMM Format) */}
              <div>
                <Label htmlFor="interest_date">Interest Date (DDMM format)</Label>
                <Input
                  id="interest_date"
                  value={formData.interest_date}
                  onChange={(e) => handleInputChange('interest_date', e.target.value)}
                  placeholder="e.g., 1503 for 15th March"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  data-testid="interest-date-input"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Enter date in DDMM format (e.g., 1503 for 15th March)
                </p>
              </div>

              {/* Custom Fields Section */}
              {customFields.length > 0 && (
                <div className="space-y-4">
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Additional Investment Details
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customFields.map((field) => (
                        <div key={field.id}>
                          <Label htmlFor={field.field_name}>
                            {field.field_name}
                            {field.is_required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {field.field_type === 'text' && (
                            <Input
                              id={field.field_name}
                              value={formData.custom_fields[field.field_name] || ''}
                              onChange={(e) => handleInputChange('custom_fields', {
                                ...formData.custom_fields,
                                [field.field_name]: e.target.value
                              })}
                              placeholder={`Enter ${field.field_name.toLowerCase()}`}
                              required={field.is_required}
                            />
                          )}
                          {field.field_type === 'number' && (
                            <Input
                              id={field.field_name}
                              type="number"
                              value={formData.custom_fields[field.field_name] || ''}
                              onChange={(e) => handleInputChange('custom_fields', {
                                ...formData.custom_fields,
                                [field.field_name]: e.target.value
                              })}
                              placeholder={`Enter ${field.field_name.toLowerCase()}`}
                              required={field.is_required}
                            />
                          )}
                          {field.field_type === 'date' && (
                            <Input
                              id={field.field_name}
                              type="date"
                              value={formData.custom_fields[field.field_name] || ''}
                              onChange={(e) => handleInputChange('custom_fields', {
                                ...formData.custom_fields,
                                [field.field_name]: e.target.value
                              })}
                              required={field.is_required}
                            />
                          )}
                          {field.field_type === 'email' && (
                            <Input
                              id={field.field_name}
                              type="email"
                              value={formData.custom_fields[field.field_name] || ''}
                              onChange={(e) => handleInputChange('custom_fields', {
                                ...formData.custom_fields,
                                [field.field_name]: e.target.value
                              })}
                              placeholder={`Enter ${field.field_name.toLowerCase()}`}
                              required={field.is_required}
                            />
                          )}
                          {field.field_type === 'dropdown' && field.options && field.options.length > 0 && (
                            <Select
                              value={formData.custom_fields[field.field_name] || ''}
                              onValueChange={(value) => handleInputChange('custom_fields', {
                                ...formData.custom_fields,
                                [field.field_name]: value
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${field.field_name.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1"
                  data-testid="submit-investment"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Investment...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Investment
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/investments')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};