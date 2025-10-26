import { BriefSubmission } from '../BriefSubmission';

export default function BriefSubmissionExample() {
  //todo: remove mock functionality
  const mockMembers = [
    { name: "Writer", model: "GPT-4" },
    { name: "Editor", model: "Claude" },
    { name: "SEO Expert", model: "Gemini" }
  ];

  return (
    <BriefSubmission
      teamName="Content Team"
      members={mockMembers}
    />
  );
}
