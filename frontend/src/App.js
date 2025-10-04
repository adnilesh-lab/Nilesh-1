import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';

// Lazy load components to avoid black screen issues
const Layout = React.lazy(() => import('@/components/Layout').then(module => ({ default: module.Layout })));
const Dashboard = React.lazy(() => import('@/components/Dashboard').then(module => ({ default: module.Dashboard })));
const Investors = React.lazy(() => import('@/components/Investors').then(module => ({ default: module.Investors })));
const Investments = React.lazy(() => import('@/components/Investments').then(module => ({ default: module.Investments })));
const AddInvestment = React.lazy(() => import('@/components/AddInvestment').then(module => ({ default: module.AddInvestment })));
const Reports = React.lazy(() => import('@/components/Reports').then(module => ({ default: module.Reports })));
const Settings = React.lazy(() => import('@/components/Settings').then(module => ({ default: module.Settings })));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
    <div className="text-center">
      <div className="loading-spinner rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Investment Portfolio...</h2>
      <p className="text-gray-500">Adv Nilesh Vishwanath Agarwal</p>
    </div>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're working to fix this issue.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Layout>
            <Routes>
              <Route path="/" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="/investors" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Investors />
                </Suspense>
              } />
              <Route path="/investments" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Investments />
                </Suspense>
              } />
              <Route path="/add-investment" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AddInvestment />
                </Suspense>
              } />
              <Route path="/reports" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Reports />
                </Suspense>
              } />
              <Route path="/settings" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Settings />
                </Suspense>
              } />
              {/* Legacy routes for compatibility */}
              <Route path="/family-members" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Investors />
                </Suspense>
              } />
            </Routes>
          </Layout>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;