// client/src/pages/DashboardPage.jsx

import { useAuth } from '@/context/AuthContext';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { ManagerDashboard } from '@/components/dashboards/ManagerDashboard';
import { EmployeeDashboard } from '@/components/dashboards/EmployeeDashboard';
import { Button } from '@/components/ui/button';
import { SubmitExpenseDialog } from '@/components/SubmitExpenseDialog';
import { useState } from 'react';

const DashboardPage = () => {
  const { user, isLoading } = useAuth();
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const renderDashboard = () => {
    switch (user?.role) {
      case 'ADMIN': return <AdminDashboard />;
      case 'MANAGER': return <ManagerDashboard />;
      case 'EMPLOYEE': return <EmployeeDashboard />;
      default: return <p>Loading your dashboard...</p>; // Or a skeleton loader
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Prevent rendering before user is known
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>
        {user?.role !== 'ADMIN' && (
          <Button size="lg" onClick={() => setIsExpenseDialogOpen(true)}>
            Submit New Expense
          </Button>
        )}
      </div>
      
      {renderDashboard()}

      <SubmitExpenseDialog 
        open={isExpenseDialogOpen} 
        onOpenChange={setIsExpenseDialogOpen}
      />
    </>
  );
};

export default DashboardPage;