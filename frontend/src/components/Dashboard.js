import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, DollarSign, Plus, ArrowRight, BarChart3, PieChart, Target } from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
import { toast } from 'sonner';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    total_investors: 0,
    total_investments: 0,
    total_portfolio_value: 0,
    investment_types_count: {},
    recent_investments: [],
    top_investors: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Professional Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Investment Portfolio Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Professional wealth management overview</p>
        </div>
        <Button asChild className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <Link to="/add-investment">
            <Plus className="h-5 w-5 mr-2" />
            Add Investment
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-family-members">
              {stats.total_family_members}
            </div>
            <p className="text-xs text-muted-foreground">
              Active members in your family
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-investments">
              {stats.total_investments}
            </div>
            <p className="text-xs text-muted-foreground">
              Investment records tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-portfolio-value">
              ₹{stats.total_portfolio_value.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total investment value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/family-members">
                <Users className="h-6 w-6 mb-2" />
                <span className="font-medium">Manage Family</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/investments">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="font-medium">View Investments</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/add-investment">
                <Plus className="h-6 w-6 mb-2" />
                <span className="font-medium">Add Investment</span>
              </Link>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={fetchStats}
            >
              <ArrowRight className="h-6 w-6 mb-2" />
              <span className="font-medium">Refresh Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Investment Types Overview */}
      {Object.keys(stats.investment_types_count).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Investment Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.investment_types_count).map(([type, count]) => (
                <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold">{count}</div>
                  <div className="text-sm text-gray-600">{type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Investments */}
      {stats.recent_investments.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Investments</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/investments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent_investments.slice(0, 5).map((investment) => (
                <div key={investment.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{investment.investment_name}</h4>
                    <p className="text-sm text-gray-600">{investment.investment_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{investment.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(investment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};