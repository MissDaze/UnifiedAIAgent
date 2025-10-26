import { OutputMultiView } from '../OutputMultiView';

export default function OutputMultiViewExample() {
  //todo: remove mock functionality
  const mockResponses = [
    {
      botName: "Content Writer",
      model: "GPT-4",
      response: "Here's a comprehensive blog post about AI in healthcare. Artificial Intelligence is transforming the medical field through advanced diagnostic tools, personalized treatment plans, and predictive analytics. Modern healthcare facilities are integrating AI to improve patient outcomes and streamline operations..."
    },
    {
      botName: "SEO Specialist",
      model: "Claude",
      response: "From an SEO perspective, this content should target keywords like 'AI healthcare solutions', 'medical AI technology', and 'healthcare automation'. The structure should include clear H2 and H3 headings, with the primary keyword appearing in the first 100 words. Meta description should be 150-160 characters highlighting the main benefits..."
    },
    {
      botName: "Editor",
      model: "Gemini",
      response: "The content flows well but could benefit from tighter prose in the introduction. Consider breaking up the longer paragraphs and adding more concrete examples. The technical terminology is appropriate for the target audience, but we should add a brief glossary section for clarity..."
    }
  ];

  const mockCombined = "Artificial Intelligence is revolutionizing healthcare through advanced diagnostic tools, personalized treatment plans, and predictive analytics. This comprehensive guide explores how AI is transforming medical practices and improving patient outcomes.\n\n[Combined insights from Writer, SEO, and Editor perspectives...]";

  return (
    <OutputMultiView
      responses={mockResponses}
      combinedOutput={mockCombined}
    />
  );
}
