import { BotConfigForm } from "@/components/BotConfigForm";
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";

export default function CreateBot() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Bot</h1>
        <p className="text-muted-foreground">Configure your AI bot with specific roles and capabilities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BotConfigForm />
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Live Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    Your bot configuration will appear here as you build it
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <h4 className="font-semibold text-sm">Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Be specific about the bot's role</li>
                <li>• Include expertise areas in the system prompt</li>
                <li>• Adjust temperature based on creativity needs</li>
                <li>• Higher tokens allow longer responses</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
