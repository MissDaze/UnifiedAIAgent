import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-card border-t border-card-border py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">AI Nexus</h3>
            <p className="text-sm text-muted-foreground">
              Multi-model AI collaboration platform for teams
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features" className="text-muted-foreground hover:text-foreground" data-testid="link-features">Features</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground" data-testid="link-pricing">Pricing</Link></li>
              <li><Link href="/docs" className="text-muted-foreground hover:text-foreground" data-testid="link-docs">Documentation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground" data-testid="link-privacy">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground" data-testid="link-terms">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="text-muted-foreground hover:text-foreground" data-testid="link-blog">Blog</Link></li>
              <li><Link href="/support" className="text-muted-foreground hover:text-foreground" data-testid="link-support">Support</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>Powered by OpenRouter AI • © 2024 AI Nexus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
