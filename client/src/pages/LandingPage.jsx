// client/src/pages/LandingPage.jsx

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, User } from "lucide-react";

const LandingPage = () => {
  // --- REPLACE WITH YOUR TEAM'S INFO ---
  const teamMembers = [
    { name: "Ram Bapat", linkedin: "https://www.linkedin.com/in/your-profile", github: "https://github.com/your-github" },
    // Add more team members here if you have them
    // { name: "Team Member 2", linkedin: "#", github: "#" },
  ];
  const GITHUB_REPO_LINK = "https://github.com/your-github/odoo-expense-app"; // <-- REPLACE THIS
  // --- END OF TEAM INFO ---

  return (
    <div className="text-center flex flex-col items-center max-w-2xl">
      <div className="bg-primary/10 p-3 rounded-full mb-4 text-sm text-primary">
        Odoo x Amalthea IIT-GN Hackathon 2025
      </div>
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-primary from-50% to-foreground/70 bg-clip-text text-transparent">
        Expense Management Reimagined
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        A "supercool, super epic and super duper sexy" Vite + React app built to streamline expense approvals with a jawdropping UI.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild size="lg">
          <Link to="/login">Login for Demo</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>

      <div className="mt-16 w-full">
        <h2 className="text-lg font-semibold">Built By</h2>
        <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-4">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 font-medium">
                <User className="h-4 w-4" />
                <span>{member.name}</span>
              </div>
              <div className="flex gap-3">
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin size={20} /></a>
                <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Github size={20} /></a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Button asChild variant="outline">
          <a href={GITHUB_REPO_LINK} target="_blank" rel="noopener noreferrer">
            <Github className="mr-2 h-4 w-4" />
            View Source Code
          </a>
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;