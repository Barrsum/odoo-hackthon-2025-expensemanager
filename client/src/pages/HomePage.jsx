// client/src/pages/HomePage.jsx
import { Button } from "@/components/ui/button";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-4">Odoo Expense Management</h1>
      <p className="text-muted-foreground text-lg mb-8">
        Welcome to your new dashboard.
      </p>
      <Button size="lg">Submit New Expense</Button>
    </div>
  );
};

export default HomePage;