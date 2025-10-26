import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Users } from "lucide-react";

interface TeamMember {
  name: string;
  model: string;
}

interface BriefSubmissionProps {
  teamName: string;
  members: TeamMember[];
  onSubmit?: (brief: string) => void;
}

export function BriefSubmission({ teamName, members, onSubmit }: BriefSubmissionProps) {
  const [brief, setBrief] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!brief.trim()) return;
    
    console.log("Submitting brief:", brief);
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit?.(brief);
    setIsSubmitting(false);
  };

  return (
    <Card className="sticky top-0 z-10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{teamName}</CardTitle>
          </div>
          <Badge variant="secondary" data-testid="badge-member-count">
            {members.length} AI Bots Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {members.map((member, index) => (
            <Badge key={index} variant="outline" data-testid={`badge-member-${index}`}>
              {member.name} <span className="ml-1 text-xs font-mono opacity-70">({member.model})</span>
            </Badge>
          ))}
        </div>
        
        <div className="space-y-2">
          <Textarea
            placeholder="Enter your brief for the team... All bots will work on this simultaneously."
            className="min-h-32"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            data-testid="textarea-brief"
          />
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!brief.trim() || isSubmitting}
          className="w-full"
          data-testid="button-submit-brief"
        >
          {isSubmitting ? (
            "Processing..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit to Team
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
