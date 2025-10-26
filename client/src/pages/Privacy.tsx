import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
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
            <CardTitle className="text-4xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: October 2024</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h2>Introduction</h2>
            <p>
              AI Nexus ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, and safeguard your information when you use our AI collaboration platform.
            </p>

            <h2>Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Account information (email, name, password)</li>
              <li>AI bot configurations and team settings</li>
              <li>Content you submit to AI models</li>
              <li>Usage data and analytics</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Process your AI model requests through OpenRouter</li>
              <li>Improve and personalize your experience</li>
              <li>Send you technical notices and updates</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information.
              However, no method of transmission over the Internet is 100% secure.
            </p>

            <h2>Third-Party Services</h2>
            <p>
              We use OpenRouter AI to process your AI requests. Their privacy policy governs how they handle
              the data transmitted through their API.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
            </ul>

            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at privacy@ainexus.example.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
