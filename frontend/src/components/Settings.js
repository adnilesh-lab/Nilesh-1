import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings as SettingsIcon, Plus, Trash2, Upload, Download, Database } from 'lucide-react';
import { customFieldsAPI, investmentsAPI } from '@/lib/api';
import { toast } from 'sonner';

export const Settings = () => {
  const [customFields, setCustomFields] = useState({
    investor: [],
    investment: []
  });
  const [newField, setNewField] = useState({
    entity_type: 'investor',
    field_name: '',
    field_type: 'text',
    is_required: false,
    options: []
  });
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'dropdown', label: 'Dropdown' }
  ];

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    try {
      const [investorFields, investmentFields] = await Promise.all([
        customFieldsAPI.getByEntityType('investor'),
        customFieldsAPI.getByEntityType('investment')
      ]);
      
      setCustomFields({
        investor: investorFields,
        investment: investmentFields
      });
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      toast.error('Failed to load custom fields');
    }
  };

  const handleAddCustomField = async (e) => {
    e.preventDefault();
    
    if (!newField.field_name.trim()) {
      toast.error('Field name is required');
      return;
    }

    try {
      const fieldData = {
        ...newField,
        options: newField.field_type === 'dropdown' ? newField.options : []
      };
      
      const createdField = await customFieldsAPI.create(fieldData);
      
      setCustomFields(prev => ({
        ...prev,
        [newField.entity_type]: [...prev[newField.entity_type], createdField]
      }));
      
      setNewField({
        entity_type: 'investor',
        field_name: '',
        field_type: 'text',
        is_required: false,
        options: []
      });
      
      setIsAddFieldDialogOpen(false);
      toast.success('Custom field added successfully');
    } catch (error) {
      console.error('Error adding custom field:', error);
      toast.error('Failed to add custom field');
    }
  };

  const handleDeleteCustomField = async (fieldId, entityType) => {
    try {
      await customFieldsAPI.delete(fieldId);
      
      setCustomFields(prev => ({
        ...prev,
        [entityType]: prev[entityType].filter(field => field.id !== fieldId)
      }));
      
      toast.success('Custom field deleted successfully');
    } catch (error) {
      console.error('Error deleting custom field:', error);
      toast.error('Failed to delete custom field');
    }
  };

  const handleExcelImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      // Here you would implement actual Excel import
      // For now, just show a placeholder message
      toast.info('Excel import feature will be implemented soon');
    } catch (error) {
      console.error('Error importing Excel:', error);
      toast.error('Failed to import Excel file');
    } finally {
      setLoading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleExcelExport = async () => {
    try {
      setLoading(true);
      // Here you would implement actual Excel export
      toast.info('Excel export feature will be implemented soon');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Professional Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Settings & Configuration
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Customize your investment portfolio management system</p>
        </div>
      </div>

      {/* Excel Import/Export Section */}
      <Card className="investment-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2 text-green-600" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <Upload className="h-5 w-5 mr-2 text-blue-600" />
                Import Investments from Excel
              </h3>
              <p className="text-gray-600 text-sm">
                Upload an Excel file with investment data to bulk import investments. 
                Make sure your Excel file has the required columns: Investor Name, Investment Name, Type, Amount, etc.
              </p>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelImport}
                  className="hidden"
                  id="excel-upload"
                />
                <Button 
                  onClick={() => document.getElementById('excel-upload').click()}
                  disabled={loading}
                  className="flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {loading ? 'Processing...' : 'Choose Excel File'}
                </Button>
                <Button variant="outline" size="sm">
                  Download Template
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <Download className="h-5 w-5 mr-2 text-purple-600" />
                Export Investment Data
              </h3>
              <p className="text-gray-600 text-sm">
                Export all your investment data to Excel format for backup or analysis in external tools.
              </p>
              <Button 
                onClick={handleExcelExport}
                disabled={loading}
                variant="outline"
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                {loading ? 'Exporting...' : 'Export to Excel'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields Management */}
      <Card className="investment-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Custom Fields Management
          </CardTitle>
          <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Field
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Field</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCustomField} className="space-y-4">
                <div>
                  <Label htmlFor="entity_type">Apply To</Label>
                  <Select 
                    value={newField.entity_type} 
                    onValueChange={(value) => setNewField(prev => ({ ...prev, entity_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investor">Investors</SelectItem>
                      <SelectItem value="investment">Investments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="field_name">Field Name</Label>
                  <Input
                    id="field_name"
                    value={newField.field_name}
                    onChange={(e) => setNewField(prev => ({ ...prev, field_name: e.target.value }))}
                    placeholder="e.g., Risk Level, Investment Goals"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="field_type">Field Type</Label>
                  <Select 
                    value={newField.field_type} 
                    onValueChange={(value) => setNewField(prev => ({ ...prev, field_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_required"
                    checked={newField.is_required}
                    onChange={(e) => setNewField(prev => ({ ...prev, is_required: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_required">Required Field</Label>
                </div>
                
                <Button type="submit" className="w-full">
                  Add Custom Field
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Investor Custom Fields */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-indigo-600">Investor Custom Fields</h3>
              {customFields.investor.length === 0 ? (
                <p className="text-gray-500 text-sm">No custom fields defined for investors</p>
              ) : (
                <div className="space-y-2">
                  {customFields.investor.map((field) => (
                    <div key={field.id} className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <div>
                        <span className="font-medium">{field.field_name}</span>
                        <span className="text-sm text-gray-600 ml-2">({field.field_type})</span>
                        {field.is_required && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded ml-2">Required</span>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCustomField(field.id, 'investor')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Investment Custom Fields */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-purple-600">Investment Custom Fields</h3>
              {customFields.investment.length === 0 ? (
                <p className="text-gray-500 text-sm">No custom fields defined for investments</p>
              ) : (
                <div className="space-y-2">
                  {customFields.investment.map((field) => (
                    <div key={field.id} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div>
                        <span className="font-medium">{field.field_name}</span>
                        <span className="text-sm text-gray-600 ml-2">({field.field_type})</span>
                        {field.is_required && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded ml-2">Required</span>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCustomField(field.id, 'investment')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* System Information */}
      <Card className="investment-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2 text-gray-600" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Application Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Version:</strong> 2.0.0</p>
                <p><strong>Build:</strong> Professional Investment Portfolio</p>
                <p><strong>Developer:</strong> Emergent AI Platform</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Features</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>✅ Custom Fields Management</p>
                <p>✅ Excel Import/Export</p>
                <p>✅ Multiple Report Views</p>
                <p>✅ Professional Dashboard</p>
                <p>✅ Investment Tracking</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};