import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Users, Bot, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertTeamSchema, type Bot as BotType } from "@shared/schema";
import { z } from "zod";

const formSchema = insertTeamSchema.omit({ userId: true }).extend({
  description: z.string().optional(),
  botIds: z.array(z.string()).min(1, "Select at least one bot"),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateTeam() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedBots, setSelectedBots] = useState<string[]>([]);

  const { data: bots = [], isLoading } = useQuery<BotType[]>({
    queryKey: ["/api/bots"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: undefined,
      botIds: [],
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/teams", data);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create team: ${errorText}`);
      }
      return await response.json();
    },
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Success",
        description: "Team created successfully!",
      });
      navigate(`/teams/${team.id}`);
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
    createTeamMutation.mutate({ ...data, botIds: selectedBots });
  };

  const toggleBot = (botId: string) => {
    setSelectedBots(prev =>
      prev.includes(botId) ? prev.filter(id => id !== botId) : [...prev, botId]
    );
    form.setValue("botIds", selectedBots.includes(botId) ? selectedBots.filter(id => id !== botId) : [...selectedBots, botId]);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create AI Team</h1>
              <p className="text-muted-foreground">Select bots to collaborate on projects</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Details</CardTitle>
                <CardDescription>Give your team a name and purpose</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Content Creation Team, Development Squad" {...field} data-testid="input-team-name" />
                      </FormControl>
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
                        <Textarea placeholder="Describe what this team will work on..." {...field} data-testid="input-team-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Team Members</CardTitle>
                <CardDescription>
                  {bots.length === 0 ? "Create some bots first to add them to your team" : "Choose which bots will be part of this team"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bots.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
                      <Bot className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">No bots available</p>
                    <Button type="button" onClick={() => navigate("/bots/create")}>
                      Create a Bot
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bots.map((bot) => {
                      const isSelected = selectedBots.includes(bot.id);
                      return (
                        <div
                          key={bot.id}
                          onClick={() => toggleBot(bot.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover-elevate ${
                            isSelected ? "border-primary bg-primary/5" : "border-border"
                          }`}
                          data-testid={`bot-select-${bot.id}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}>
                              {isSelected ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <Bot className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold mb-1">{bot.name}</h4>
                              {bot.role && (
                                <p className="text-xs text-muted-foreground mb-1">{bot.role}</p>
                              )}
                              {bot.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{bot.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <FormMessage>{form.formState.errors.botIds?.message}</FormMessage>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/teams")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTeamMutation.isPending || selectedBots.length === 0}
                data-testid="button-create-team"
                className="gap-2"
              >
                {createTeamMutation.isPending ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Create Team
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
