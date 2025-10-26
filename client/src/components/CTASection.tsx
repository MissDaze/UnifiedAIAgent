import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const handleGetStarted = () => {
    console.log("CTA Get Started clicked");
    window.location.href = "/login";
  };

  return (
    <section className="py-16 bg-primary/5">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Ready to Transform Your AI Workflow?
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join teams already using AI Nexus to orchestrate multiple AI models for better results
        </p>
        <Button
          size="lg"
          onClick={handleGetStarted}
          data-testid="button-cta-get-started"
        >
          Get Started Free
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}
