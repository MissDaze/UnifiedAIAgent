import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-4xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: October 2024</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h2>Agreement to Terms</h2>
            <p>
              By accessing and using AI Nexus, you agree to be bound by these Terms of Service and all
              applicable laws and regulations.
            </p>

            <h2>Use License</h2>
            <p>
              We grant you a limited, non-exclusive, non-transferable license to use AI Nexus for your
              personal or business purposes, subject to these terms.
            </p>

            <h2>User Responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate account information</li>
              <li>Maintain the security of your account</li>
              <li>Use the service in compliance with all applicable laws</li>
              <li>Not misuse or abuse the AI models</li>
              <li>Not attempt to reverse engineer or compromise the platform</li>
            </ul>

            <h2>AI Model Usage</h2>
            <p>
              AI Nexus uses OpenRouter AI to provide AI model capabilities. You acknowledge that:
            </p>
            <ul>
              <li>AI responses may not always be accurate</li>
              <li>You are responsible for verifying AI-generated content</li>
              <li>Usage is subject to OpenRouter's terms and rate limits</li>
            </ul>

            <h2>Content Ownership</h2>
            <p>
              You retain ownership of any content you submit to AI Nexus. By using our service, you grant
              us a license to process your content through AI models for the purpose of providing our services.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              AI Nexus shall not be liable for any indirect, incidental, special, consequential, or punitive
              damages resulting from your use of or inability to use the service.
            </p>

            <h2>Modifications</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service after
              changes constitutes acceptance of the new terms.
            </p>

            <h2>Termination</h2>
            <p>
              We may terminate or suspend your account at any time for violations of these terms or for any
              other reason at our discretion.
            </p>

            <h2>Contact</h2>
            <p>
              For questions about these Terms of Service, contact us at legal@ainexus.example.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
