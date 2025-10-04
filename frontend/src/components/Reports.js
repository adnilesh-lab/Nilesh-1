import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, PieChart, Users, TrendingUp, Download, Filter } from 'lucide-react';
import { reportsAPI, investorsAPI, investmentsAPI } from '@/lib/api';
import { toast } from 'sonner';

export const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [investors, setInvestors] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('summary');
  const [selectedInvestor, setSelectedInvestor] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchReportData();
    fetchInvestors();
    fetchInvestments();
  }, []);

  const fetchReportData = async () => {
    try {
      const data = await reportsAPI.getSummary();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    }
  };

  const fetchInvestors = async () => {
    try {
      const data = await investorsAPI.getAll();
      setInvestors(data);
    } catch (error) {
      console.error('Error fetching investors:', error);
    }
  };

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const data = await investmentsAPI.getAll(selectedInvestor, selectedType);
      setInvestments(data);
    } catch (error) {
      console.error('Error fetching investments:', error);
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [selectedInvestor, selectedType]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getInvestorName = (investorId) => {
    const investor = investors.find(inv => inv.id === investorId);
    return investor ? investor.name : 'Unknown';
  };

  if (loading && !reportData) {
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
            Investment Reports
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Comprehensive portfolio analysis and insights</p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* View Controls */}
      <Card className="investment-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-indigo-600" />
            Report Filters & View Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">View Type</label>
              <Select value={viewType} onValueChange={setViewType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                  <SelectItem value="card">Card View</SelectItem>
                  <SelectItem value="table">Table View</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Investor</label>
              <Select value={selectedInvestor} onValueChange={setSelectedInvestor}>
                <SelectTrigger>
                  <SelectValue placeholder="All Investors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Investors</SelectItem>
                  {investors.map(investor => (
                    <SelectItem key={investor.id} value={investor.id}>
                      {investor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
                  <SelectItem value="Stocks">Stocks</SelectItem>
                  <SelectItem value="Bonds">Bonds</SelectItem>
                  <SelectItem value="Fixed Deposits">Fixed Deposits</SelectItem>
                  <SelectItem value="PPF">PPF</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setSelectedInvestor('');
                  setSelectedType('');
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary View */}
      {viewType === 'summary' && reportData && (
        <div className="space-y-6">
          {/* Overall Summary */}
          <Card className="investment-card gradient-primary text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center">
                <BarChart3 className="h-6 w-6 mr-2" />
                Portfolio Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{reportData.total_summary.total_investors}</div>
                  <div className="text-sm opacity-90">Total Investors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{reportData.total_summary.total_investments}</div>
                  <div className="text-sm opacity-90">Total Investments</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{formatCurrency(reportData.total_summary.total_portfolio_value)}</div>
                  <div className="text-sm opacity-90">Portfolio Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{formatCurrency(reportData.total_summary.average_investment_per_investor)}</div>
                  <div className="text-sm opacity-90">Avg per Investor</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investor-wise Summary */}
          <Card className="investment-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                Investor-wise Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.investor_wise_summary.map((investor, index) => (
                  <div key={investor.investor_name} className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{investor.investor_name}</h4>
                        <p className="text-sm text-gray-600">{investor.investment_count} investments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">
                        {formatCurrency(investor.total_amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Investment Type Summary */}
          <Card className="investment-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                Investment Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportData.investment_type_summary.map((type) => (
                  <div key={type._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-800">{type._id}</h4>
                      <Badge variant="secondary">{type.count}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(type.total_amount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Avg: {formatCurrency(type.avg_amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* List View */}
      {viewType === 'list' && (
        <Card className="investment-card">
          <CardHeader>
            <CardTitle>Investment List View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investments.map((investment) => (
                <div key={investment.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-semibold">{investment.investment_name}</h4>
                    <p className="text-sm text-gray-600">
                      {getInvestorName(investment.investor_id)} • {investment.investment_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(investment.amount)}
                    </div>
                    {investment.interest_rate && (
                      <div className="text-sm text-gray-600">
                        {investment.interest_rate}% interest
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card View */}
      {viewType === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investments.map((investment) => (
            <Card key={investment.id} className="investment-card">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-lg">{investment.investment_name}</h3>
                  <Badge className="mt-2">{investment.investment_type}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Investor:</span>
                    <span className="font-medium">{getInvestorName(investment.investor_id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-bold text-green-600">{formatCurrency(investment.amount)}</span>
                  </div>
                  {investment.interest_rate && (
                    <div className="flex justify-between">
                      <span>Interest Rate:</span>
                      <span className="font-medium">{investment.interest_rate}%</span>
                    </div>
                  )}
                  {investment.purchase_date && (
                    <div className="flex justify-between">
                      <span>Purchase Date:</span>
                      <span className="font-medium">
                        {new Date(investment.purchase_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewType === 'table' && (
        <Card className="investment-card">
          <CardHeader>
            <CardTitle>Investment Table View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="professional-table">
                <thead>
                  <tr>
                    <th>Investment Name</th>
                    <th>Type</th>
                    <th>Investor</th>
                    <th>Amount</th>
                    <th>Interest Rate</th>
                    <th>Purchase Date</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((investment) => (
                    <tr key={investment.id}>
                      <td className="font-medium">{investment.investment_name}</td>
                      <td>
                        <Badge variant="outline">{investment.investment_type}</Badge>
                      </td>
                      <td>{getInvestorName(investment.investor_id)}</td>
                      <td className="font-bold text-green-600">
                        {formatCurrency(investment.amount)}
                      </td>
                      <td>
                        {investment.interest_rate ? `${investment.interest_rate}%` : '-'}
                      </td>
                      <td>
                        {investment.purchase_date 
                          ? new Date(investment.purchase_date).toLocaleDateString()
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};