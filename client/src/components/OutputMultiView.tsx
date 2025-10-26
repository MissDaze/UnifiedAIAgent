import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, MessageSquare, Bot } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface BotResponse {
  botName: string;
  model: string;
  response: string;
}

interface OutputMultiViewProps {
  responses: BotResponse[];
  combinedOutput?: string;
}

export function OutputMultiView({ responses, combinedOutput }: OutputMultiViewProps) {
  const [selectedBots, setSelectedBots] = useState<Set<number>>(new Set());
  const [followUpInputs, setFollowUpInputs] = useState<Record<number, string>>({});
  const [showFollowUp, setShowFollowUp] = useState<Record<number, boolean>>({});

  const toggleBotSelection = (index: number) => {
    const newSelected = new Set(selectedBots);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedBots(newSelected);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    console.log("Copied to clipboard");
  };

  const handleFollowUp = (index: number) => {
    console.log("Follow up with bot:", responses[index].botName, followUpInputs[index]);
    setFollowUpInputs({ ...followUpInputs, [index]: "" });
  };

  return (
    <Tabs defaultValue="combined" className="w-full">
      <TabsList className="grid w-full grid-cols-3" data-testid="tabs-output-view">
        <TabsTrigger value="combined" data-testid="tab-combined">Combined View</TabsTrigger>
        <TabsTrigger value="individual" data-testid="tab-individual">Individual Outputs</TabsTrigger>
        <TabsTrigger value="comparison" data-testid="tab-comparison">Comparison</TabsTrigger>
      </TabsList>

      <TabsContent value="combined" className="mt-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Unified Team Response</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(combinedOutput || "")}
                data-testid="button-copy-combined"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none" data-testid="text-combined-output">
              {combinedOutput || "Combined output will appear here..."}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="individual" className="mt-6">
        <div className="space-y-4">
          {responses.map((response, index) => (
            <Card key={index} data-testid={`card-response-${index}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedBots.has(index)}
                      onCheckedChange={() => toggleBotSelection(index)}
                      data-testid={`checkbox-select-${index}`}
                    />
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="font-semibold" data-testid={`text-bot-name-${index}`}>
                        {response.botName}
                      </span>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {response.model}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFollowUp({ ...showFollowUp, [index]: !showFollowUp[index] })}
                      data-testid={`button-followup-${index}`}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Follow Up
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(response.response)}
                      data-testid={`button-copy-${index}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="prose prose-sm max-w-none" data-testid={`text-response-${index}`}>
                  {response.response}
                </div>
                
                {showFollowUp[index] && (
                  <div className="space-y-2 pt-3 border-t">
                    <Textarea
                      placeholder="Ask a follow-up question to this bot..."
                      className="min-h-20"
                      value={followUpInputs[index] || ""}
                      onChange={(e) => setFollowUpInputs({ ...followUpInputs, [index]: e.target.value })}
                      data-testid={`textarea-followup-${index}`}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleFollowUp(index)}
                      data-testid={`button-submit-followup-${index}`}
                    >
                      Send
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedBots.size > 0 && (
          <Card className="mt-4 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm mb-3">
                <strong>{selectedBots.size}</strong> bot(s) selected for follow-up
              </p>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Send follow-up to selected bots..."
                  className="flex-1"
                  data-testid="textarea-multi-followup"
                />
                <Button data-testid="button-submit-multi-followup">Send to Selected</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="comparison" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-semibold">Bot</th>
                <th className="text-left p-4 font-semibold">Response</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((response, index) => (
                <tr key={index} className="border-b" data-testid={`row-comparison-${index}`}>
                  <td className="p-4 align-top">
                    <div className="space-y-1">
                      <div className="font-semibold">{response.botName}</div>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {response.model}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="prose prose-sm max-w-none">
                      {response.response}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
