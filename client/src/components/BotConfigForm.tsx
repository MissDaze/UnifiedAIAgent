import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Bot, Sparkles, Zap, Brain, Code, Image, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertBotSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertBotSchema.omit({ userId: true }).extend({
  model: z.string().min(1, "Please select an AI model"),
  temperature: z.union([z.string(), z.number()]).transform(val => String(val)),
});

type FormData = z.infer<typeof formSchema>;

const categoryIcons: Record<string, any> = {
  Multimodal: Image,
  Reasoning: Brain,
  Coding: Code,
  Speed: Zap,
  General: MessageSquare,
  Instruction: Sparkles,
  Large: Bot,
};

export function BotConfigForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: models = [] } = useQuery<Array<{ id: string; name: string; category: string }>>({
    queryKey: ["/api/openrouter/models"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      model: "",
      systemPrompt: "",
      temperature: "0.7",
      maxTokens: 1000,
      role: "",
    },
  });

  const createBotMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("POST", "/api/bots", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({
        title: "Success",
        description: "Bot created successfully!",
      });
      navigate("/bots");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    createBotMutation.mutate(data);
  };

  const categories = ["all", ...new Set(models.map(m => m.category))];
  const filteredModels = selectedCategory === "all" 
    ? models 
    : models.filter(m => m.category === selectedCategory);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bot Identity</CardTitle>
            <CardDescription>Give your bot a name and purpose</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Code Reviewer, Content Writer" {...field} data-testid="input-bot-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior Developer, Marketing Specialist" {...field} data-testid="input-bot-role" />
                  </FormControl>
                  <FormDescription>What role does this bot play in your team?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what this bot specializes in..." {...field} data-testid="input-bot-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Model Selection
            </CardTitle>
            <CardDescription>Choose from free OpenRouter models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Filter by Category</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((category) => {
                  const Icon = categoryIcons[category] || Bot;
                  return (
                    <Button
                      key={category}
                      type="button"
                      size="sm"
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category)}
                      data-testid={`button-category-${category.toLowerCase()}`}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {category === "all" ? "All Models" : category}
                    </Button>
                  );
                })}
              </div>
            </div>

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-model">
                        <SelectValue placeholder="Select an AI model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredModels.map((model) => {
                        const Icon = categoryIcons[model.category] || Bot;
                        return (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{model.name}</span>
                              <span className="text-xs text-muted-foreground">({model.category})</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>All models are free to use</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="You are a helpful assistant that specializes in..." 
                      className="min-h-32"
                      {...field} 
                      data-testid="input-system-prompt"
                    />
                  </FormControl>
                  <FormDescription>Define the bot's behavior and expertise</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>Fine-tune the bot's output behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Temperature</FormLabel>
                    <span className="text-sm text-muted-foreground">{field.value}</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={0}
                      max={2}
                      step={0.1}
                      value={[parseFloat(field.value)]}
                      onValueChange={(vals) => field.onChange(vals[0].toString())}
                      data-testid="slider-temperature"
                    />
                  </FormControl>
                  <FormDescription>
                    Lower = more focused, Higher = more creative
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxTokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Tokens</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      data-testid="input-max-tokens"
                    />
                  </FormControl>
                  <FormDescription>Maximum length of the bot's response</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {Object.keys(form.formState.errors).length > 0 && (
          <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
            <p className="font-semibold text-destructive mb-2">Form Validation Errors:</p>
            <ul className="text-sm text-destructive space-y-1">
              {Object.entries(form.formState.errors).map(([key, error]) => (
                <li key={key}>{key}: {error?.message?.toString() || "Invalid value"}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/bots")}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createBotMutation.isPending}
            data-testid="button-create-bot"
            className="gap-2"
          >
            {createBotMutation.isPending ? (
              <>Creating...</>
            ) : (
              <>
                <Bot className="h-4 w-4" />
                Create Bot
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
