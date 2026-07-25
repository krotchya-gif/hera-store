import React, { useState, Suspense, lazy } from 'react';

const DashboardOverview = lazy(() => import('./DashboardOverview'));
const ProductManagement = lazy(() => import('./ProductManagement'));
const OrderManagement = lazy(() => import('./OrderManagement'));
const CustomerManagement = lazy(() => import('./CustomerManagement'));
const CategoryManagement = lazy(() => import('./CategoryManagement'));
const FinanceReport = lazy(() => import('./FinanceReport'));
const PromoManagement = lazy(() => import('./PromoManagement'));
const ReviewManagement = lazy(() => import('./ReviewManagement'));
const MarketingManagement = lazy(() => import('./MarketingManagement'));
const StoreSettings = lazy(() => import('./StoreSettings'));

import AdminLayout from './AdminLayout';

const AdminDashboard = ({ setCurrentPage }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'finance':
        return <FinanceReport />;
      case 'promo':
        return <PromoManagement />;
      case 'reviews':
        return <ReviewManagement />;
      case 'marketing':
        return <MarketingManagement />;
      case 'settings':
        return <StoreSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]" />
      </div>
    }>
      <AdminLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu} setCurrentPage={setCurrentPage}>
        {renderContent()}
      </AdminLayout>
    </Suspense>
  );
};

export default AdminDashboard;
