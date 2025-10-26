import { Bot, Users, Layout, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Bot,
    title: "Create AI Bots",
    description: "Configure individual AI bots with specific roles and purposes. Choose from multiple models and customize their behavior."
  },
  {
    icon: Users,
    title: "Build Teams",
    description: "Combine multiple AI bots into collaborative teams. Each bot contributes its unique perspective to solve complex problems."
  },
  {
    icon: Layout,
    title: "Multi-View Outputs",
    description: "Review responses in unified, individual, or comparison views. See how each bot contributes to the final solution."
  },
  {
    icon: Zap,
    title: "Iterate & Refine",
    description: "Follow up with individual bots or the entire team. Save outputs, iterate on ideas, and refine results in real-time."
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Powerful Features for AI Collaboration</h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to orchestrate multiple AI models working together seamlessly
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover-elevate transition-all duration-200"
              data-testid={`card-feature-${index}`}
            >
              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
