import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, TrendingUp, Plus, BarChart3, Settings } from 'lucide-react';

export const Layout = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Investors', href: '/investors', icon: Users },
    { name: 'Investments', href: '/investments', icon: TrendingUp },
    { name: 'Add Investment', href: '/add-investment', icon: Plus },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Professional Header */}
      <nav className="bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  Adv Nilesh Vishwanath Agarwal
                </h1>
                <p className="text-indigo-200 text-sm font-medium">Investment Portfolio</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Button
                    key={item.name}
                    asChild
                    variant={active ? 'secondary' : 'ghost'}
                    className={`flex items-center space-x-2 text-white hover:bg-white/10 transition-all duration-200 ${
                      active ? 'bg-white/20 shadow-md' : ''
                    }`}
                  >
                    <Link to={item.href} data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}>
                      <Icon className="h-4 w-4" />
                      <span className="hidden md:block">{item.name}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Professional Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-indigo-900 border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-white font-semibold">Adv Nilesh Vishwanath Agarwal</h3>
              <p className="text-gray-300 text-sm">Professional Investment Portfolio Management</p>
            </div>
            <a
              href="https://app.emergent.sh/?utm_source=emergent-badge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors"
            >
              <img 
                src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" 
                alt="Emergent"
                className="h-6 w-6 mr-2 rounded"
              />
              Powered by Emergent
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};