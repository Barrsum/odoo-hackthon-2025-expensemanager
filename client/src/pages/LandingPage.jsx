// client/src/pages/LandingPage.jsx

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, User } from "lucide-react";

const LandingPage = () => {
  // --- TEAM INFO ---
  // We've added your new team member! Remember to replace the placeholder links.
  const teamMembers = [
    { name: "Ram Bapat", linkedin: "https://www.linkedin.com/in/ram-bapat-barrsum-diamos", github: "https://github.com/Barrsum" },
    { name: "Vyankatesh Kulkarni", linkedin: "https://www.linkedin.com/in/vyankatesh-kulkarni-7710a828b/", github: "https://github.com/VYANKEE" },
  ];
  const GITHUB_REPO_LINK = "https://github.com/Barrsum/odoo-hackthon-2025-expensemanager"; // <-- REPLACE THIS
  // --- END OF TEAM INFO ---

  return (
    <div className="text-center flex flex-col items-center max-w-3xl animate-fade-in">
      <div className="bg-primary/10 p-3 rounded-full mb-4 text-sm text-primary">
        Odoo x Amalthea IIT-GN Hackathon 2025
      </div>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-primary from-50% to-foreground/70 bg-clip-text text-transparent">
        Expense Management Reimagined
      </h1>
      
      {/* THIS IS THE FIX: Increased margin-top from mt-6 to mt-8 for more breathing room */}
      <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl">
        A "supercool, super epic and super duper sexy" Vite + React app built to streamline expense approvals with a jawdropping UI and an AI-powered receipt scanner.
      </p>

      <div className="mt-8 flex gap-4">
        <Button asChild size="lg">
          <Link to="/login">Login for Demo</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>

      <div className="mt-20 w-full">
        <h2 className="text-xl font-semibold tracking-tight">Built By The Dream Team</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-x-12 gap-y-6">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 font-medium">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{member.name}</span>
              </div>
              <div className="flex gap-4">
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin size={20} /></a>
                <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Github size={20} /></a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12">
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