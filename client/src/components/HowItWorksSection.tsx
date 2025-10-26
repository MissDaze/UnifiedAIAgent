import { Card } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Create Bots",
    description: "Configure AI bots with specific roles, models, and purposes tailored to your needs."
  },
  {
    number: "02",
    title: "Build Teams",
    description: "Assemble bots into collaborative teams. Mix and match capabilities for optimal results."
  },
  {
    number: "03",
    title: "Submit Brief",
    description: "Provide a single brief to your team. All bots work simultaneously on the task."
  },
  {
    number: "04",
    title: "Review Outputs",
    description: "Examine combined and individual responses in a multi-view interface."
  },
  {
    number: "05",
    title: "Iterate",
    description: "Follow up with the whole team or specific bots. Refine and perfect your results."
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground">
            Five simple steps to orchestrate AI collaboration
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-border hidden lg:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
            {steps.map((step, index) => (
              <Card
                key={index}
                className="p-6 text-center hover-elevate"
                data-testid={`card-step-${index}`}
              >
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
