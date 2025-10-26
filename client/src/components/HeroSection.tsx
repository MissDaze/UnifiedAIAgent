import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@assets/generated_images/AI_collaboration_hero_image_a6163807.png";

export function HeroSection() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleLearnMore = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen max-h-[800px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-6 sm:mb-8">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
          <span className="text-xs sm:text-sm font-medium text-primary-foreground">Powered by OpenRouter AI</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 text-white tracking-tight leading-tight">
          Multi-Model AI Collaboration
          <br />
          <span className="text-primary-foreground">Built for Teams</span>
        </h1>
        
        <p className="text-base sm:text-xl leading-relaxed text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto">
          Create AI bot teams that work together simultaneously. Build, deploy, and iterate with multiple AI models collaborating on your projects in real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Button
            size="lg"
            className="backdrop-blur-sm w-full sm:w-auto"
            onClick={handleGetStarted}
            data-testid="button-hero-get-started"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="backdrop-blur-sm bg-background/20 border-white/30 text-white hover:bg-background/30 w-full sm:w-auto"
            onClick={handleLearnMore}
            data-testid="button-learn-more"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
