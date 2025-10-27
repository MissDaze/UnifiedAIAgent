import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Network } from "lucide-react";

export function NavHeader() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleSignup = () => {
    window.location.href = "/login";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Network className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">AI Nexus</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/#features" className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-nav-features">
            Features
          </a>
          <a href="/#how-it-works" className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-nav-how">
            How It Works
          </a>
        </nav>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            onClick={handleLogin}
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
