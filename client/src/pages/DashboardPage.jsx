// client/src/pages/DashboardPage.jsx

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { SubmitExpenseDialog } from "@/components/SubmitExpenseDialog";
import { useAuth } from '@/context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">Here's a summary of your expense activity.</p>
          </div>
          <Button size="lg" onClick={() => setIsExpenseDialogOpen(true)}>
            Submit New Expense
          </Button>
        </div>
        
        <div className="border-2 border-dashed border-border rounded-lg h-96 flex items-center justify-center">
          <p className="text-muted-foreground">Analytics and recent expenses will be shown here...</p>
        </div>
      </div>

      <SubmitExpenseDialog 
        open={isExpenseDialogOpen} 
        onOpenChange={setIsExpenseDialogOpen}
      />
    </>
  );
};

export default DashboardPage;