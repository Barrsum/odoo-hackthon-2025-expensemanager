// client/src/pages/DashboardPage.jsx (Previously HomePage.jsx)

import { Button } from "@/components/ui/button";

const DashboardPage = () => { // <-- Name changed here
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button size="lg">Submit New Expense</Button>
      </div>
      <div className="border-2 border-dashed border-border rounded-lg h-96 flex items-center justify-center">
        <p className="text-muted-foreground">Dashboard content will go here...</p>
      </div>
    </div>
  );
};

export default DashboardPage; // <-- And here