// client/src/App.jsx
import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-4xl font-bold text-foreground mb-4">
        Odoo Expense Management
      </h1>
      <p className="text-muted-foreground mb-8">
        The "Super Duper Sexy" Vite + React App
      </p>
      <div className="flex gap-4">
        <Button>Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
      </div>
    </div>
  )
}

export default App